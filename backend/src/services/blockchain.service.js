const { ethers } = require('ethers');
const crypto = require('crypto');
const { prisma } = require('../config/db');

class BlockchainService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
        // Use a placeholder private key if not provided (will fail on actual send but code will run)
        const privateKey = process.env.POLYGON_PRIVATE_KEY && process.env.POLYGON_PRIVATE_KEY !== 'your_private_key_here' ? process.env.POLYGON_PRIVATE_KEY : '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
        this.wallet = new ethers.Wallet(privateKey, this.provider);
    }

    generateHash(data) {
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }

    async storeHashOnChain(eventType, entityId, payload) {
        try {
            const hash = this.generateHash(payload);
            const txData = ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({ eventType, entityId, hash })));

            const tx = await this.wallet.sendTransaction({
                to: this.wallet.address, // Send to self to just log data on-chain
                value: 0,
                data: txData
            });

            const receipt = await tx.wait();

            await prisma.blockchainAuditLog.create({
                data: {
                    event_type: eventType,
                    entity_id: entityId,
                    hash: hash,
                    block_number: receipt.blockNumber
                }
            });

            return { success: true, txnHash: tx.hash, blockNumber: receipt.blockNumber };
        } catch (error) {
            console.error('Blockchain error. Adding to retry queue mechanics if needed:', error);
            // In a real prod environment, add to a pending_hash_queue table for cron retry
            return { success: false, error: error.message };
        }
    }
}

module.exports = new BlockchainService();
