const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const {
    getMe,
    getUserChits,
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
} = require('../controllers/user.controller');

const router = express.Router();

router.get('/me', protect, getMe);
router.get('/chits', protect, getUserChits);
router.get('/notifications', protect, getMyNotifications);
router.patch('/notifications/:id/read', protect, markNotificationRead);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);

module.exports = router;
