const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { discoverOrganizations } = require('../controllers/organization.controller');

const router = express.Router();

// Public or Protected depending on requirements. Master prompt: "When user logs in..."
router.use(protect);

router.get('/discover', discoverOrganizations);

module.exports = router;
