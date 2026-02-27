const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { verifyKyc } = require('../controllers/kyc.controller');
const { kycValidationRules, validateKyc } = require('../middlewares/validateKyc');

const router = express.Router();

router.post('/verify', protect, kycValidationRules, validateKyc, verifyKyc);

module.exports = router;
