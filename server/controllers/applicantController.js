const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/nodemailer');
const keys = require('../config/key');

// In-memory OTP store: { [email]: { otp: string, expiresAt: number } }
// This is sufficient for development. For production, persist to DB or cache.
const emailToOtpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

exports.sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOtp();
    const ttlMs = 10 * 60 * 1000; // 10 minutes
    emailToOtpStore.set(email, { otp, expiresAt: Date.now() + ttlMs });

    try {
      await sendEmail(email, otp, 'OTP');
    } catch (err) {
      // Log email errors but still allow manual OTP delivery in dev
      console.error('Failed to send OTP email:', err.message);
    }

    return res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('Error in sendLoginOtp:', err.message);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = emailToOtpStore.get(email);
    if (!record) {
      return res.status(400).json({ message: 'OTP not requested or expired' });
    }
    if (Date.now() > record.expiresAt) {
      emailToOtpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired' });
    }
    if (String(otp) !== String(record.otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP after successful verification
    emailToOtpStore.delete(email);

    const payload = {
      role: 'applicant',
      email,
    };

    const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: '2d' });
    return res.status(200).json({ success: true, token: 'Bearer ' + token });
  } catch (err) {
    console.error('Error in verifyLoginOtp:', err.message);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};


