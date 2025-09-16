const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  adminLogin,
  addFaculty,
  addStudent,
  addStudentDirect,
  addSubject,
  addAdmin,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  bulkDeleteFaculty,
  getAllStudents,
  deleteStudent,
  getAllSubjects,
  getFaculty,
  getStudents,
  getSubjects,
  getStatistics,
  testStatistics,
  adminUpdatePassword,
  getNotifications,
  markNotificationAsRead,
  createNotification,
  getDashboardData,
  getAnalytics,
  assignAllStudentsToHostels,
  assignSubjectToFaculty,
  addApplicant,
  getAllApplicants,
  updateApplicantStatus,
  deleteApplicant,
} = require("../controllers/adminController");

router.post("/login", adminLogin);
router.post("/addAdmin", addAdmin);
router.post("/addStudentDirect", addStudentDirect);
router.post(
  "/addFaculty",
  passport.authenticate("jwt", { session: false }),
  addFaculty
);
router.post(
  "/addStudent",
  passport.authenticate("jwt", { session: false }),
  addStudent
);
router.post(
  "/addSubject",
  passport.authenticate("jwt", { session: false }),
  addSubject
);
router.post(
  "/getAllFaculty",
  passport.authenticate("jwt", { session: false }),
  getAllFaculty
);

// Faculty CRUD
router.get(
  "/faculty/:id",
  passport.authenticate("jwt", { session: false }),
  getFacultyById
);
router.put(
  "/faculty/:id",
  passport.authenticate("jwt", { session: false }),
  updateFaculty
);
router.delete(
  "/faculty/:id",
  passport.authenticate("jwt", { session: false }),
  deleteFaculty
);

// Delete single student
router.delete(
  "/student/:id",
  passport.authenticate("jwt", { session: false }),
  deleteStudent
);
router.post(
  "/faculty/bulk-delete",
  passport.authenticate("jwt", { session: false }),
  bulkDeleteFaculty
);
router.post(
  "/getAllStudent",
  passport.authenticate("jwt", { session: false }),
  getAllStudents
);
router.post(
  "/getAllSubject",
  passport.authenticate("jwt", { session: false }),
  getAllSubjects
);
router.post(
  "/getFaculties",
  passport.authenticate("jwt", { session: false }),
  getFaculty
);
router.post(
  "/getStudents",
  passport.authenticate("jwt", { session: false }),
  getStudents
);
router.post(
  "/getSubjects",
  passport.authenticate("jwt", { session: false }),
  getSubjects
);
router.get(
  "/statistics",
  passport.authenticate("jwt", { session: false }),
  getStatistics
);
router.get("/test-statistics", testStatistics);
router.post(
  "/updatePassword",
  passport.authenticate("jwt", { session: false }),
  adminUpdatePassword
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
router.post(
  "/notifications",
  passport.authenticate("jwt", { session: false }),
  createNotification
);

// Analytics
router.get(
  "/analytics",
  passport.authenticate("jwt", { session: false }),
  getAnalytics
);

router.post(
  "/assign-all-students-to-hostels",
  passport.authenticate("jwt", { session: false }),
  assignAllStudentsToHostels
);

// Applicant Management Routes
router.post(
  "/addApplicant",
  passport.authenticate("jwt", { session: false }),
  addApplicant
);
router.post(
  "/getAllApplicants",
  passport.authenticate("jwt", { session: false }),
  getAllApplicants
);
router.put(
  "/applicant/:id/status",
  passport.authenticate("jwt", { session: false }),
  updateApplicantStatus
);
router.delete(
  "/applicant/:id",
  passport.authenticate("jwt", { session: false }),
  deleteApplicant
);
// Assign subject to faculty
router.post(
  "/assign-subject",
  passport.authenticate("jwt", { session: false }),
  assignSubjectToFaculty
);
module.exports = router;
