const express = require("express");
const router = express.Router();
const passport = require("passport");

const { registerOrSendOtp, verifyOtpAndLogin } = require("../controllers/applicantAuthController");
const { studentSubmitApplication, studentListApplications } = require("../controllers/admissionController");

// Auth
router.post("/register", registerOrSendOtp);
router.post("/verify", verifyOtpAndLogin);

// Admissions for logged-in applicants (reuse student handlers, but user is applicant)
router.post("/admissions", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  // Attach a fake student-like context by mapping req.user to applicant; controller reads req.user.id
  return studentSubmitApplication(req, res, next);
});
router.get("/admissions", passport.authenticate("jwt", { session: false }), studentListApplications);

module.exports = router;


