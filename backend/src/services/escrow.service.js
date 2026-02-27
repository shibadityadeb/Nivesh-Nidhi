const Razorpay = require('razorpay');
const crypto = require('crypto');

class EscrowService {
    constructor() {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy'
        });
    }

    async createOrder(amount, receiptId) {
        const options = {
            amount: Math.round(Number(amount) * 100), // Razorpay works in paise (must be integer)
            currency: 'INR',
            receipt: receiptId
        };
        return await this.razorpay.orders.create(options);
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
