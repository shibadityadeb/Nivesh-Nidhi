const Razorpay = require('razorpay');
const crypto = require('crypto');

class EscrowService {
    constructor() {
        this.keyId = process.env.RAZORPAY_KEY_ID || '';
        this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
        this.razorpay = new Razorpay({
            key_id: this.keyId || 'dummy',
            key_secret: this.keySecret || 'dummy'
        });
    }

    async createOrder(amount, receiptId) {
        if (!this.keyId || !this.keySecret || this.keyId === 'dummy' || this.keySecret === 'dummy') {
            const configError = new Error('Payment gateway is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env');
            configError.statusCode = 503;
            throw configError;
        }

        const options = {
            amount: Math.round(Number(amount) * 100), // Razorpay works in paise (must be integer)
            currency: 'INR',
            receipt: receiptId
        };
        try {
            return await this.razorpay.orders.create(options);
        } catch (error) {
            const isRazorpayAuthError = error?.statusCode === 401 || error?.status === 401;
            const wrapped = new Error(
                isRazorpayAuthError
                    ? 'Payment gateway authentication failed. Verify Razorpay backend keys.'
                    : (error?.error?.description || error?.message || 'Failed to create payment order')
            );
            wrapped.statusCode = isRazorpayAuthError ? 502 : (error?.statusCode || 500);
            throw wrapped;
        }
    }

    verifyWebhookSignature(body, signature, secret) {
        const expectedSignature = crypto.createHmac('sha256', secret)
            .update(body)
            .digest('hex');
        return expectedSignature === signature;
    }

    async initiatePayout(accountNumber, ifsc, amount, narration) {
        // RazorpayX Payout Sandbox implementation
        // For hackathon, we can mock this or use fund accounts API.
        // Assuming standard fund account & payout creation for Contact.
        console.log(`Initiating payout of ${amount} to ${accountNumber} (${ifsc}) with narration: ${narration}`);

        // In actual implementation for RazorpayX:
        // 1. Create Contact
        // 2. Create Fund Account
        // 3. Create Payout

        // Returning dummy success response for the flow completion
        return {
            id: `pout_${crypto.randomBytes(6).toString('hex')}`,
            status: 'processed'
        };
    }
}

module.exports = new EscrowService();
