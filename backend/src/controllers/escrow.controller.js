const { prisma } = require('../config/db');
const escrowService = require('../services/escrow.service');
const blockchainService = require('../services/blockchain.service');

const createEscrowAccount = async (req, res, next) => {
    try {
        const { chit_group_id } = req.body;
        let account = await prisma.escrowAccount.findUnique({ where: { chit_group_id } });

        if (!account) {
            account = await prisma.escrowAccount.create({
                data: { chit_group_id }
            });
        }

        res.status(201).json({
            success: true,
            escrow_account_id: account.id,
            status: account.status
        });
    } catch (error) {
        console.error("Error creating escrow account:", error);
        next(error);
    }
};

const addContribution = async (req, res, next) => {
    try {
        const { chit_group_id, user_id, amount } = req.body;
        if (!chit_group_id || !user_id) {
            return res.status(400).json({
                success: false,
                message: 'chit_group_id and user_id are required'
            });
        }
        if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'amount must be a positive number'
            });
        }

        let account = await prisma.escrowAccount.findUnique({ where: { chit_group_id } });
        if (!account) {
            // Auto-create if not existent to ensure seamless flow
            account = await prisma.escrowAccount.create({
                data: { chit_group_id }
            });
        }

        // Razorpay expects minimum 1 INR. Also converting to strict integer for paise calculation.
        // We ensure amount is rounded to nearest whole number explicitly before sending to service
        const finalAmount = Math.max(1, Math.round(Number(amount)));

        // Create pending transaction
        const transaction = await prisma.escrowTransaction.create({
            data: {
                escrow_account_id: account.id,
                user_id,
                type: 'CONTRIBUTION',
                amount: finalAmount,
                status: 'PENDING'
            }
        });

        // Create razorpay order
        const order = await escrowService.createOrder(finalAmount, transaction.id);

        res.status(200).json({
            success: true,
            transaction_id: transaction.id,
            razorpay_order_id: order.id,
            amount: order.amount / 100 // converting back to INR for frontend display
        });
    } catch (error) {
        console.error("Error in addContribution:", error);
        next(error);
    }
};

const webhookPaymentConfirmed = async (req, res, next) => {
    try {
        const payload = req.body.payload;
        if (!payload || !payload.payment || !payload.payment.entity) return res.status(400).json({ success: false });

        const paymentEntity = payload.payment.entity;

        // In robust system, you'd lookup order_id. Here we assume we appended it to notes or fetch by ID logic.
        const transactionId = paymentEntity.notes.transaction_id || req.body.transaction_id;

        if (!transactionId) {
            // Mock lookup if notes not provided simply returning for demo if not found
            return res.status(400).json({ success: false, message: 'Txn id required in test' });
        }

        const transactionRecord = await prisma.escrowTransaction.findUnique({
            where: { id: transactionId },
            include: { user: true, escrow_account: true }
        });

        if (!transactionRecord) return res.status(404).json({ success: false, message: 'Transaction not found' });

        await prisma.$transaction(async (tx) => {
            const transaction = await tx.escrowTransaction.update({
                where: { id: transactionId },
                data: {
                    status: 'CONFIRMED',
                    payment_gateway_txn_id: paymentEntity.id
                }
            });

            await tx.escrowAccount.update({
                where: { id: transaction.escrow_account_id },
                data: {
                    total_collected: { increment: transaction.amount },
                    locked_amount: { increment: transaction.amount }
                }
            });

            // Add user to the Chit Group explicitly upon successful escrow payment
            const chitGroupId = transactionRecord.escrow_account.chit_group_id;
            const existingMember = await tx.chitGroupMember.findFirst({
                where: { chit_group_id: chitGroupId, user_id: transactionRecord.user_id }
            });

            if (!existingMember) {
                await tx.chitGroupMember.create({
                    data: {
                        chit_group_id: chitGroupId,
                        user_id: transactionRecord.user_id,
                        name: transactionRecord.user.name,
                        email: transactionRecord.user.email,
                        phone: transactionRecord.user.phone
                    }
                });

                await tx.chitGroup.update({
                    where: { id: chitGroupId },
                    data: { current_members: { increment: 1 } }
                });
            }
        });

        // Blockchain logic (Moved OUTSIDE transaction block because network calls can exceed 5000ms timeout)
        const updatedTx = await prisma.escrowTransaction.findUnique({ where: { id: transactionId } });
        const bcResult = await blockchainService.storeHashOnChain('CONTRIBUTION', updatedTx.id, updatedTx);
        if (bcResult.success) {
            await prisma.escrowTransaction.update({
                where: { id: updatedTx.id },
                data: { blockchain_hash: bcResult.txnHash }
            });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

const webhookPaymentFailed = async (req, res, next) => {
    try {
        const { transaction_id, error_description } = req.body;

        if (!transaction_id) {
            return res.status(400).json({ success: false, message: 'Txn id required' });
        }

        await prisma.escrowTransaction.update({
            where: { id: transaction_id },
            data: {
                status: 'FAILED',
                // Can optionally store error_description in a notes/metadata field if schema allows
            }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Payment failed webhook error:", error);
        next(error);
    }
};

const getEscrowBalance = async (req, res, next) => {
    try {
        const { chit_group_id } = req.params;
        const account = await prisma.escrowAccount.findUnique({ where: { chit_group_id } });

        if (!account) return res.status(404).json({ success: false, message: 'Escrow account not found' });

        res.status(200).json({
            success: true,
            total_collected: account.total_collected,
            locked_amount: account.locked_amount,
            available_for_payout: account.locked_amount
        });
    } catch (error) {
        next(error);
    }
};

const releasePayout = async (req, res, next) => {
    try {
        const { chit_group_id, winner_user_id } = req.body;

        const account = await prisma.escrowAccount.findUnique({ where: { chit_group_id } });
        if (!account) return res.status(404).json({ success: false, message: 'Escrow account not found' });

        // Step 1: AI Risk Engine Evaluate
        // For hackathon, mimicking a risk score check connecting to the concept in presentation.
        const riskScore = req.body.dummy_risk_score || 20; // 0-100 where > 80 is threshold

        const payoutAmount = Number(account.locked_amount) * 0.95; // 5% commission deduction

        const payoutRequest = await prisma.payoutQueue.create({
            data: {
                escrow_account_id: account.id,
                chit_group_id,
                winner_user_id,
                amount: payoutAmount,
                status: riskScore > 80 ? 'BLOCKED' : 'PENDING_RELEASE',
                risk_flag: riskScore > 80
            }
        });

        if (riskScore > 80) {
            return res.status(403).json({
                success: false,
                message: 'Payout blocked due to high AI risk score. Flagged for admin review.',
                payout_id: payoutRequest.id
            });
        }

        // Process Payout via Escrow Service
        const payoutResult = await escrowService.initiatePayout('dummy_acc', 'dummy_ifsc', payoutAmount, `Chit Payout ${chit_group_id}`);

        // Update state
        await prisma.$transaction(async (tx) => {
            await tx.payoutQueue.update({
                where: { id: payoutRequest.id },
                data: { status: 'RELEASED' }
            });

            await tx.escrowAccount.update({
                where: { id: account.id },
                data: {
                    total_released: { increment: payoutAmount },
                    locked_amount: { decrement: payoutAmount }
                }
            });

            const bcResult = await blockchainService.storeHashOnChain('PAYOUT', payoutRequest.id, { payoutAmount, winner_user_id, chit_group_id });
            // Depending on need, log blockchain hash of payout in DB
        });

        res.status(200).json({
            success: true,
            message: 'Payout successful',
            payout_id: payoutRequest.id,
            payout_gateway_txn: payoutResult.id
        });
    } catch (error) {
        next(error);
    }
};

const freezeEscrow = async (req, res, next) => {
    try {
        const { escrow_account_id } = req.body;
        await prisma.escrowAccount.update({
            where: { id: escrow_account_id },
            data: { status: 'FROZEN' }
        });

        res.status(200).json({ success: true, message: 'Escrow frozen' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createEscrowAccount,
    addContribution,
    webhookPaymentConfirmed,
    webhookPaymentFailed,
    getEscrowBalance,
    releasePayout,
    freezeEscrow
};
