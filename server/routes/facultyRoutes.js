const express = require("express");
const router = express.Router();
const passport = require("passport");
const upload = require("../utils/multer");
const Faculty = require("../models/Faculty"); 

const {
  facultyLogin,
  getAllSubjects,
  updateProfile,
  updatePassword,
  fetchStudents,
  markAttendance,
  testAttendance,
  forgotPassword,
  postOTP,
  uploadMarks,
  getNotifications,
  markNotificationAsRead,
  getDashboardData,
  getStudentsByCriteria,
  getAttendanceSummary,
} = require("../controllers/facultyController");

// --- 2. ADD NEW ROUTES FOR FORGOT PASSWORD ---

// ROUTE 1: Get email from Faculty Registration Number
// ENDPOINT: POST /api/faculty/get-email-by-id
router.post("/get-email-by-id", async (req, res) => {
  const { registrationNumber } = req.body;
  try {
    const faculty = await Faculty.findOne({ registrationNumber });
    if (!faculty) {
      return res.status(404).json({ error: "Faculty ID not found" });
    }
    res.json({ email: faculty.email });
  } catch (error) {
    console.error("Error fetching faculty email:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ROUTE 2: Reset the faculty password
// ENDPOINT: POST /api/faculty/reset-password
router.post("/reset-password", async (req, res) => {
  const { registrationNumber, newPassword } = req.body;
  try {
    const faculty = await Faculty.findOne({ registrationNumber });
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    // The pre-save hook in your Faculty.js model will handle the hashing
    faculty.password = newPassword;
    await faculty.save();
    res.json({ success: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting faculty password:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// --- YOUR EXISTING ROUTES (UNCHANGED) ---

//Auth and Profile
router.post("/login", facultyLogin);
router.post("/forgotPassword", forgotPassword);
router.post("/postOTP", postOTP);
router.put(
  "/updateProfile",
  passport.authenticate("jwt", { session: false }),
  updateProfile
);
router.post(
  "/updatePassword",
  passport.authenticate("jwt", { session: false }),
  updatePassword
);

//Utility
router.post(
  "/fetchStudents",
  passport.authenticate("jwt", { session: false }),
  fetchStudents
);
router.post(
  "/fetchAllSubjects",
  passport.authenticate("jwt", { session: false }),
  getAllSubjects
);
router.get(
  "/getAllSubjects",
  passport.authenticate("jwt", { session: false }),
  getAllSubjects
);
router.post(
  "/markAttendance",
  passport.authenticate("jwt", { session: false }),
  markAttendance
);

router.get(
  "/testAttendance",
  passport.authenticate("jwt", { session: false }),
  testAttendance
);
router.post(
  "/uploadMarks",
  passport.authenticate("jwt", { session: false }),
  uploadMarks
);

// Dashboard and Notifications
router.get(
  "/dashboard",
  passport.authenticate("jwt", { session: false }),
  getDashboardData
);
router.get(
  "/notifications",
  passport.authenticate("jwt", { session: false }),
  getNotifications
);
router.put(
  "/notifications/:notificationId/read",
  passport.authenticate("jwt", { session: false }),
  markNotificationAsRead
);

// Enhanced student management
router.post(
  "/getStudentsByCriteria",
  passport.authenticate("jwt", { session: false }),
  getStudentsByCriteria
);
router.post(
  "/getAttendanceSummary",
  passport.authenticate("jwt", { session: false }),
  getAttendanceSummary
);

module.exports = router;