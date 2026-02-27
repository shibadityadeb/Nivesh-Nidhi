const express = require('express');
const { protect, authorize, optionalProtect } = require('../middlewares/auth.middleware');
const {
    getAllChitGroups,
    getMyChitGroups,
    createChitGroup,
    updateChitGroup,
    deleteChitGroup,
    getChitGroupDetails,
    getGroupCalculatorConfig,
    calculateGroupReturn,
    applyToJoinChitGroup,
    getMyActiveGroups
} = require('../controllers/chitgroup.controller');
const {
    listAuctions,
    createAuction,
    placeBid,
    closeAuction,
    declareWinner,
    reopenAuction,
    proceedWinnerPayment,
    confirmWinnerPayment
} = require('../controllers/auction.controller');

const router = express.Router();

// Public route - no auth required
router.get('/', optionalProtect, getAllChitGroups);
router.get('/my-groups', protect, authorize('ORGANIZER', 'ADMIN'), getMyChitGroups);
router.get('/active-groups', protect, getMyActiveGroups);
router.get('/:id', optionalProtect, getChitGroupDetails);
router.get('/:groupId/calculator-config', optionalProtect, getGroupCalculatorConfig);
router.post('/:groupId/calculate', optionalProtect, calculateGroupReturn);
router.post('/:id/apply', protect, applyToJoinChitGroup);
router.get('/:groupId/auctions', protect, listAuctions);
router.post('/:groupId/auctions', protect, createAuction);
router.post('/:groupId/auctions/:auctionId/bids', protect, placeBid);
router.post('/:groupId/auctions/:auctionId/close', protect, closeAuction);
router.post('/:groupId/auctions/:auctionId/winner', protect, declareWinner);
router.post('/:groupId/auctions/:auctionId/reopen', protect, reopenAuction);
router.post('/:groupId/auctions/:auctionId/proceed-payment', protect, proceedWinnerPayment);
router.post('/:groupId/auctions/:auctionId/confirm-payment', protect, confirmWinnerPayment);

// Organizer routes - require auth + ORGANIZER role
router.post('/', protect, authorize('ORGANIZER', 'ADMIN'), createChitGroup);
router.put('/:id', protect, authorize('ORGANIZER', 'ADMIN'), updateChitGroup);
router.delete('/:id', protect, authorize('ORGANIZER', 'ADMIN'), deleteChitGroup);

module.exports = router;
