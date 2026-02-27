const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { getMe, getUserChits } = require('../controllers/user.controller');

const router = express.Router();

router.get('/me', protect, getMe);
router.get('/chits', protect, getUserChits);

module.exports = router;
