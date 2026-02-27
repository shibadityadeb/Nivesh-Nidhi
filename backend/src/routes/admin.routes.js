const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    getPendingApplications,
    getMigratingApplications,
    approveApplication,
    rejectApplication,
    suspendOrganization
} = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes are protected and require ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/applications/pending', getPendingApplications);
router.get('/applications/migrating', getMigratingApplications);

router.post('/applications/:id/approve', approveApplication);
router.post('/applications/:id/reject', rejectApplication);

router.post('/organizations/:id/suspend', suspendOrganization);

module.exports = router;
