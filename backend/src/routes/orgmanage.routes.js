const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    getMyOrganizations,
    getGroupMembers,
    addMember,
    removeMember,
    getGroupRules,
    saveGroupRules,
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement,
    sendNotification,
    getNotifications
} = require('../controllers/orgmanage.controller');

const router = express.Router();

// All routes require authentication and ORGANIZER role
router.use(protect);
router.use(authorize('ORGANIZER', 'ADMIN'));

// Organization overview
router.get('/my-organizations', getMyOrganizations);

// Members management
router.get('/groups/:groupId/members', getGroupMembers);
router.post('/groups/:groupId/members', addMember);
router.delete('/groups/:groupId/members/:memberId', removeMember);

// Rules management
router.get('/groups/:groupId/rules', getGroupRules);
router.put('/groups/:groupId/rules', saveGroupRules);

// Announcements
router.get('/groups/:groupId/announcements', getAnnouncements);
router.post('/groups/:groupId/announcements', createAnnouncement);
router.delete('/groups/:groupId/announcements/:announcementId', deleteAnnouncement);

// Notifications
router.get('/groups/:groupId/notifications', getNotifications);
router.post('/groups/:groupId/notifications', sendNotification);

module.exports = router;
