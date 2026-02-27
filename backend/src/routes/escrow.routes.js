const express = require('express');
const {
    createEscrowAccount,
    addContribution,
    webhookPaymentConfirmed,
    webhookPaymentFailed,
    getEscrowBalance,
    releasePayout,
    freezeEscrow
} = require('../controllers/escrow.controller');

const router = express.Router();

router.post('/create', createEscrowAccount);
router.post('/contribute', addContribution);
router.post('/webhook', webhookPaymentConfirmed);
router.post('/webhook/failed', webhookPaymentFailed);
router.get('/balance/:chit_group_id', getEscrowBalance);
router.post('/release', releasePayout);
router.post('/freeze', freezeEscrow);

module.exports = router;
