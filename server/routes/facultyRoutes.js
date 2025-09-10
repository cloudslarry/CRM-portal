const express = require("express");
const router = express.Router();
const passport = require("passport");
const upload = require("../utils/multer");

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
