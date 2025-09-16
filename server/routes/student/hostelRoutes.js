const express = require("express");
const router = express.Router();

// Import middleware
const { verifyToken, requireRole } = require("../../middleware/authMiddleware");

// Import controllers
const hostelController = require("../../controllers/hostelController");
const roomController = require("../../controllers/roomController");
const feeController = require("../../controllers/feeController");
const noticeController = require("../../controllers/noticeController");

// Apply authentication and student role middleware to all routes
router.use(verifyToken);
router.use(requireRole(['student']));

// Student can view all hostels
router.get("/hostels", hostelController.getHostels);
router.get("/hostels/:id", hostelController.getHostelById);

// Student can view rooms in hostels
router.get("/hostels/:hostelId/rooms", roomController.getRoomsByHostel);

// Student can view their own fees
router.get("/fees/my-fees", (req, res, next) => {
  req.params.studentId = req.user._id;
  feeController.getFeesByStudent(req, res, next);
});

// Student can view notices for their hostel
router.get("/notices/my-hostel", async (req, res, next) => {
  try {
    // Get student's hostel info
    const student = req.user;
    
    // DEBUG: Log student data
    console.log('Student hostel notices request:', {
      studentId: student._id,
      studentName: student.name,
      registrationNumber: student.registrationNumber,
      hasHostelInfo: !!student.hostelInfo,
      hostelInfo: student.hostelInfo
    });
    
    if (!student.hostelInfo || !student.hostelInfo.hostel) {
      console.log('Student has no hostel assignment, returning all notices');
      // Return all notices if student is not assigned to a hostel
      req.query = { limit: 50, page: 1 };
      noticeController.getAllNotices(req, res, next);
      return;
    }
    
    console.log('Student has hostel assignment, fetching notices for hostel:', student.hostelInfo.hostel);
    req.params.hostelId = student.hostelInfo.hostel;
    noticeController.getNoticesByHostel(req, res, next);
  } catch (err) {
    console.log('Error in hostel notices:', err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching hostel notices",
      error: err.message
    });
  }
});

// Student can view all notices (read-only)
router.get("/notices", noticeController.getAllNotices);
router.get("/notices/recent", noticeController.getRecentNotices);
router.get("/notices/:id", noticeController.getNoticeById);

// Student can view their room details
router.get("/my-room", async (req, res, next) => {
  try {
    const student = req.user;
    
    if (!student.hostelInfo || !student.hostelInfo.room) {
      return res.status(404).json({
        success: false,
        message: "Student is not assigned to any room"
      });
    }

    const Room = require("../../models/Room");
    const room = await Room.findById(student.hostelInfo.room)
      .populate('hostel', 'name location warden')
      .populate('students', 'name email registrationNumber department year');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Room details retrieved successfully",
      result: {
        room: room,
        studentInfo: {
          name: student.name,
          registrationNumber: student.registrationNumber,
          bedNumber: student.hostelInfo.bedNumber
        }
      }
    });
  } catch (err) {
    console.log("Error in getting student room details:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching room details",
      error: err.message
    });
  }
});

// Student can view their hostel details
router.get("/my-hostel", async (req, res, next) => {
  try {
    const student = req.user;
    
    // DEBUG: Log student data
    console.log('Student my-hostel request:', {
      studentId: student._id,
      studentName: student.name,
      registrationNumber: student.registrationNumber,
      hasHostelInfo: !!student.hostelInfo,
      hostelInfo: student.hostelInfo
    });
    
    if (!student.hostelInfo || !student.hostelInfo.hostel) {
      console.log('Student has no hostel assignment for my-hostel');
      return res.status(404).json({
        success: false,
        message: "Student is not assigned to any hostel"
      });
    }

    const Hostel = require("../../models/Hostel");
    const hostel = await Hostel.findById(student.hostelInfo.hostel)
      .populate('rooms');

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Hostel details retrieved successfully",
      result: {
        hostel: hostel,
        studentInfo: {
          name: student.name,
          registrationNumber: student.registrationNumber,
          bedNumber: student.hostelInfo.bedNumber
        }
      }
    });
  } catch (err) {
    console.log("Error in getting student hostel details:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching hostel details",
      error: err.message
    });
  }
});

module.exports = router;
