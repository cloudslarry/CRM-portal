const express = require('express');
const router = express.Router();

const { sendLoginOtp, verifyLoginOtp } = require('../controllers/applicantController');

// Public endpoints for applicant OTP auth
router.post('/login', sendLoginOtp);
router.post('/verify', verifyLoginOtp);

module.exports = router;


