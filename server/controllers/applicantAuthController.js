const jwt = require("jsonwebtoken");
const keys = require("../config/key");
const Applicant = require("../models/Applicant");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.registerOrSendOtp = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    let applicant = await Applicant.findOne({ email });
    if (!applicant) {
      applicant = new Applicant({ name: name || "", email, phone });
    } else {
      if (name) applicant.name = name;
      if (phone) applicant.phone = phone;
    }

    const otp = generateOTP();
    applicant.otp = otp;
    applicant.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await applicant.save();

    // TODO: integrate email/SMS sender (currently return OTP for testing)
    return res.status(200).json({ success: true, otp: otp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyOtpAndLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required" });
    const applicant = await Applicant.findOne({ email });
    if (!applicant) return res.status(404).json({ success: false, message: "Applicant not found" });
    if (!applicant.otp || applicant.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (applicant.otpExpiresAt && applicant.otpExpiresAt < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

    applicant.isEmailVerified = true;
    applicant.otp = undefined;
    applicant.otpExpiresAt = undefined;
    await applicant.save();

    const payload = { id: applicant.id, name: applicant.name, email: applicant.email, type: "applicant" };
    jwt.sign(payload, keys.secretOrKey, { expiresIn: "2d" }, (err, token) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      return res.status(200).json({ success: true, token: "Bearer " + token });
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


