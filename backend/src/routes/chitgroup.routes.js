const express = require('express');
const { protect, authorize, optionalProtect } = require('../middlewares/auth.middleware');
const {
    getAllChitGroups,
    getMyChitGroups,
    createChitGroup,
    updateChitGroup,
    deleteChitGroup,
    getChitGroupDetails,
    applyToJoinChitGroup,
    getMyActiveGroups
} = require('../controllers/chitgroup.controller');

const router = express.Router();

// Public route - no auth required
router.get('/', getAllChitGroups);
router.get('/my-groups', protect, authorize('ORGANIZER', 'ADMIN'), getMyChitGroups);
router.get('/active-groups', protect, getMyActiveGroups);
router.get('/:id', optionalProtect, getChitGroupDetails);
router.post('/:id/apply', protect, applyToJoinChitGroup);

// Organizer routes - require auth + ORGANIZER role
router.post('/', protect, authorize('ORGANIZER', 'ADMIN'), createChitGroup);
router.put('/:id', protect, authorize('ORGANIZER', 'ADMIN'), updateChitGroup);
router.delete('/:id', protect, authorize('ORGANIZER', 'ADMIN'), deleteChitGroup);

module.exports = router;
