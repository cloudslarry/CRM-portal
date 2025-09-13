const express = require("express");
const router = express.Router();

// Import middleware
const { verifyToken, requireRole } = require("../../middleware/authMiddleware");

// Import controllers
const hostelController = require("../../controllers/hostelController");
const roomController = require("../../controllers/roomController");
const feeController = require("../../controllers/feeController");
const noticeController = require("../../controllers/noticeController");
const reportController = require("../../controllers/reportController");

// Apply authentication and admin role middleware to all routes
router.use(verifyToken);
router.use(requireRole(['admin']));

// Hostel Management Routes
router.post("/hostels", hostelController.createHostel);
router.get("/hostels", hostelController.getHostels);
router.get("/hostels/:id", hostelController.getHostelById);
router.put("/hostels/:id", hostelController.updateHostel);
router.delete("/hostels/:id", hostelController.deleteHostel);

// Room Management Routes
router.post("/rooms", roomController.createRoom);
router.get("/hostels/:hostelId/rooms", roomController.getRoomsByHostel);
router.put("/rooms/:id", roomController.updateRoom);
router.delete("/rooms/:id", roomController.deleteRoom);
router.post("/rooms/assign", roomController.assignStudentToRoom);
router.post("/rooms/unassign", roomController.unassignStudentFromRoom);

// Fee Management Routes
router.post("/fees", feeController.createFeeRecord);
router.get("/fees", feeController.getAllFees);
router.get("/fees/student/:studentId", feeController.getFeesByStudent);
router.put("/fees/:feeId", feeController.updateFeeRecord);
router.patch("/fees/:feeId/pay", feeController.markFeePaid);
router.get("/fees/summary", feeController.feeSummary);

// Notice Management Routes
router.post("/notices", noticeController.createNotice);
router.get("/notices", noticeController.getAllNotices);
router.get("/notices/recent", noticeController.getRecentNotices);
router.get("/notices/:id", noticeController.getNoticeById);
router.get("/hostels/:hostelId/notices", noticeController.getNoticesByHostel);
router.put("/notices/:id", noticeController.updateNotice);
router.delete("/notices/:id", noticeController.deleteNotice);

// Report Routes
router.get("/reports/occupancy", reportController.occupancyReport);
router.get("/reports/fees", reportController.feeReport);
router.get("/reports/comprehensive", reportController.comprehensiveReport);

module.exports = router;
