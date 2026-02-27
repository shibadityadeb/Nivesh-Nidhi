const express = require('express');
const { verifyAadhaar, getKycStatus } = require('../controllers/kyc.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.post('/aadhaar', protect, upload.single('aadhaar'), verifyAadhaar);
router.get('/status', protect, getKycStatus);

module.exports = router;
