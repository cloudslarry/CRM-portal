const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Utils
const sendEmail = require("../utils/nodemailer");
const bufferConversion = require("../utils/bufferConversion");
const cloudinary = require("../utils/cloudinary");

const keys = require("../config/key");

//Validation
const validateFacultyLoginInput = require("../validation/facultyLogin");
const validateFetchStudentsInput = require("../validation/facultyFetchStudent");
const validateFacultyUpdatePassword = require("../validation/facultyUpdatePassword");
const validateForgotPassword = require("../validation/forgotPassword");
const validateOTP = require("../validation/otpValidation");
const validateFacultyUploadMarks = require("../validation/facultyUploadMarks");

//Models
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Faculty = require("../models/Faculty");
const Attendance = require("../models/Attendance");
const Mark = require("../models/Marks");
const Notification = require("../models/Notification");

exports.facultyLogin = async (req, res, next) => {
  try {
    const { errors, isValid } = validateFacultyLoginInput(req.body);
    //console.log(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { registrationNumber, password } = req.body;
    const faculty = await Faculty.findOne({ registrationNumber });
    if (!faculty) {
      errors.registrationNumber = "Registration number not found";
      return res.status(404).json(errors);
    }

    const validPassword = await bcrypt.compare(password, faculty.password);
    if (!validPassword) {
      errors.password = "Invalid Password";
      return res.status(404).json(errors);
    }

    const payload = {
      id: faculty.id,
      faculty,
    };

    jwt.sign(payload, keys.secretOrKey, { expiresIn: "2d" }, (err, token) => {
      res.json({
        success: true,
        token: "Bearer " + token,
      });
    });
  } catch (err) {
    console.log("Error in faculty login", err.message);
  }
};

exports.fetchStudents = async (req, res, next) => {
  try {
    const { errors, isValid } = validateFetchStudentsInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { department, year, section } = req.body;
    
    // Convert department short form to full form for database lookup
    const departmentMapping = {
      'I.T': 'Information Technology',
      'C.S.E': 'Computer Science',
      'CSE': 'Computer Science',
      'CS': 'Computer Science',
      'E.C.E': 'Electronics & Communication',
      'ECE': 'Electronics & Communication',
      'CIVIL': 'Civil Engineering',
      'MECHANICAL': 'Mechanical Engineering',
      'ELECTRICAL': 'Electrical Engineering'
    };
    
    const fullDepartmentName = departmentMapping[department] || department;
    
    // Find subjects with the short department name and year
    // Map department short forms to database formats
    const departmentVariations = [
      department, // Try exact department
      department.replace(/\./g, ''), // Remove dots (C.S.E -> CSE)
      department.replace(/\./g, '_'), // Replace dots with underscores
      department.replace(/\./g, ' '), // Replace dots with spaces
    ];
    
    // Add reverse mapping (CSE -> C.S.E)
    if (department === 'CSE') {
      departmentVariations.push('C.S.E');
    } else if (department === 'ECE') {
      departmentVariations.push('E.C.E');
    } else if (department === 'IT') {
      departmentVariations.push('I.T');
    }
    
    const subjectList = await Subject.find({ 
      department: { $in: departmentVariations },
      year: year
    });

    console.log('Found subjects for department:', department, 'year:', year, 'count:', subjectList.length);
    console.log('Subject codes:', subjectList.map(s => s.subjectCode));

    // Find students with the full department name and numeric year
    const students = await Student.find({
      department: fullDepartmentName, // Use full form for students
      year: parseInt(year),
      section: section.toUpperCase(),
    });

    if (students.length === 0) {
      errors.department = "No students found for the selected criteria";
      return res.status(404).json(errors);
    }

    res.status(200).json({
      result: students.map((student) => {
        return {
          _id: student._id,
          registrationNumber: student.registrationNumber,
          name: student.name,
          email: student.email,
        };
      }),
      subjectCode: subjectList.map((sub) => {
        return sub.subjectCode;
      }),
    });
  } catch (err) {
    console.log("Error in fetchStudents", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: err.message
    });
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { selectedStudents, subjectCode, department, year, section, date } = req.body;
    
    console.log('Attendance request received:', {
      selectedStudents: selectedStudents?.length,
      subjectCode,
      department,
      year,
      section,
      date
    });

    // Validate required fields
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    if (!subjectCode) {
      return res.status(400).json({ message: "Subject code is required" });
    }
    if (!department || !year || !section) {
      return res.status(400).json({ message: "Department, year, and section are required" });
    }
    if (!selectedStudents || !Array.isArray(selectedStudents) || selectedStudents.length === 0) {
      return res.status(400).json({ message: "At least one student must be selected" });
    }

    const sub = await Subject.findOne({ subjectCode });
    if (!sub) {
      console.log('Subject not found:', subjectCode);
      return res.status(404).json({ message: "Subject not found" });
    }
    console.log('Found subject:', sub.subjectCode, sub._id);

    const allStudents = await Student.find({ department, year, section });
    if (allStudents.length === 0) {
      console.log('No students found for:', { department, year, section });
      return res.status(404).json({ message: "No students found for the selected criteria" });
    }
    console.log('Found students:', allStudents.length);

    // Check for existing attendance for this subject and date
    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.find({
      subject: sub._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      'student': { $in: allStudents.map(s => s._id) }
    }).select('student');

    if (existingAttendance.length > 0) {
      const existingStudentIds = existingAttendance.map(a => a.student.toString());
      const duplicateStudents = allStudents
        .filter(s => existingStudentIds.includes(s._id.toString()))
        .map(s => s.registrationNumber);
      
      return res.status(400).json({ 
        message: "Attendance already marked for some students on this date",
        duplicateStudents
      });
    }

    // Convert student IDs to ObjectId for comparison
    const selectedStudentIds = selectedStudents.map(id => new mongoose.Types.ObjectId(id));
    
    // Mark attendance for present students
    const attendanceRecords = selectedStudents.map(studentId => ({
      student: new mongoose.Types.ObjectId(studentId),
      subject: sub._id,
      date: attendanceDate,
      status: 'present',
      markedAt: new Date()
    }));
    console.log('Created attendance records for present students:', attendanceRecords.length);

    // Mark absent students
    const absentStudents = allStudents
      .filter(student => !selectedStudentIds.some(id => id.equals(student._id)))
      .map(student => ({
        student: student._id,
        subject: sub._id,
        date: attendanceDate,
        status: 'absent',
        markedAt: new Date()
      }));
    console.log('Created attendance records for absent students:', absentStudents.length);

    // Save all attendance records
    console.log('Saving attendance records:', attendanceRecords.length + absentStudents.length);
    const savedRecords = await Attendance.insertMany([...attendanceRecords, ...absentStudents]);
    console.log('Successfully saved:', savedRecords.length, 'attendance records');

    const response = { 
      message: `Attendance marked successfully for ${selectedStudents.length} students`,
      totalStudents: allStudents.length,
      presentCount: selectedStudents.length,
      absentCount: allStudents.length - selectedStudents.length
    };
    console.log('Sending success response:', response);
    res.status(200).json(response);
  } catch (err) {
    console.error("Error in marking attendance:", err);
    return res.status(500).json({ 
      message: "Internal server error while marking attendance",
      error: err.message 
    });
  }
};

// Test endpoint to verify attendance functionality
exports.testAttendance = async (req, res, next) => {
  try {
    console.log('Testing attendance functionality...');
    
    // Check if we can find students and subjects
    const students = await Student.find().limit(1);
    const subjects = await Subject.find().limit(1);
    const attendanceCount = await Attendance.countDocuments();
    
    res.status(200).json({
      message: 'Attendance system test',
      studentsFound: students.length,
      subjectsFound: subjects.length,
      totalAttendanceRecords: attendanceCount,
      testStudent: students[0] ? {
        id: students[0]._id,
        name: students[0].name,
        department: students[0].department
      } : null,
      testSubject: subjects[0] ? {
        id: subjects[0]._id,
        code: subjects[0].subjectCode,
        name: subjects[0].subjectName
      } : null
    });
  } catch (err) {
    console.error('Error in testAttendance:', err);
    res.status(500).json({ 
      message: 'Test failed',
      error: err.message 
    });
  }
};

exports.uploadMarks = async (req, res, next) => {
  try {
    const { errors, isValid } = validateFacultyUploadMarks(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { subjectCode, exam, totalMarks, marks, department, year, section } =
      req.body;

    const subject = await Subject.findOne({ subjectCode });
    if (!subject) {
      errors.subjectCode = "Subject not found";
      return res.status(404).json(errors);
    }
    
    const alreadyMarked = await Mark.find({
      exam,
      department,
      section,
      year,
      subject: subject._id,
    });

    if (alreadyMarked.length !== 0) {
      errors.exam = "Marks have already been uploaded for this record";
      return res.status(400).json(errors);
    }

    // Save marks for each student
    let savedCount = 0;
    for (let i = 0; i < marks.length; i++) {
      const newMarks = new Mark({
        student: marks[i]._id,
        subject: subject._id,
        exam,
        department,
        section,
        marks: marks[i].value,
        totalMarks,
        year,
      });

      await newMarks.save();
      savedCount++;
    }

    res.status(200).json({ 
      message: `Marks uploaded successfully for ${savedCount} students`,
      savedCount,
      totalStudents: marks.length 
    });
  } catch (err) {
    console.error("Error in uploading marks:", err);
    return res.status(500).json({ 
      message: "Internal server error while uploading marks",
      error: err.message 
    });
  }
};

exports.getAllSubjects = async (req, res, next) => {
  try {
    const allSubjects = await Subject.find({});
    console.log('getAllSubjects - Found subjects:', allSubjects.length);
    if (!allSubjects || allSubjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found in database." });
    }
    res.status(200).json({ allSubjects });
  } catch (err) {
    console.error('Error in getAllSubjects:', err);
    res
      .status(400)
      .json({ message: `Error in getting all Subjects: ${err.message}` });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { errors, isValid } = validateFacultyUpdatePassword(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const { registrationNumber, oldPassword, newPassword, confirmNewPassword } =
      req.body;
    if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = "Password Mismatch";
      return res.status(404).json(errors);
    }
    const faculty = await Faculty.findOne({ registrationNumber });
    const isCorrect = await bcrypt.compare(oldPassword, faculty.password);
    if (!isCorrect) {
      errors.oldPassword = "Invalid old Password";
      return res.status(404).json(errors);
    }
    let hashedPassword;
    hashedPassword = await bcrypt.hash(newPassword, 10);
    faculty.password = hashedPassword;
    await faculty.save();
    res.status(200).json({ message: "Password Updated" });
  } catch (err) {
    console.log("Error in updating password", err.message);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { errors, isValid } = validateForgotPassword(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const { email } = req.body;
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      errors.email = "Email Not found, Provide registered email";
      return res.status(400).json(errors);
    }
    function generateOTP() {
      var digits = "0123456789";
      let OTP = "";
      for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      return OTP;
    }
    const OTP = generateOTP();
    faculty.otp = OTP;
    await faculty.save();
    await sendEmail(faculty.email, OTP, "OTP");
    res.status(200).json({ message: "Check your registered Email for OTP" });
    const helper = async () => {
      faculty.otp = "";
      await faculty.save();
    };
    setTimeout(function () {
      helper();
    }, 300000);
  } catch (err) {
    console.log("Error in sending OTP email", err.message);
  }
};

exports.postOTP = async (req, res, next) => {
  try {
    const { errors, isValid } = validateOTP(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { email, otp, newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword) {
      errors.confirmNewPassword = "Password Mismatch";
      return res.status(400).json(errors);
    }

    const faculty = await Faculty.findOne({ email });
    if (faculty.otp !== otp) {
      errors.otp = "Invalid OTP..Please try again";
      return res.status(400).json(errors);
    }

    let hashedPassword;
    hashedPassword = await bcrypt.hash(newPassword, 10);
    faculty.password = hashedPassword;
    await faculty.save();

    return res.status(200).json({ message: "Password Changed" });
  } catch (err) {
    console.log("Error in submitting OTP", err.message);
    return res.status(400).json(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { email, facultyMobileNumber, registrationNumber } = req.body;

    const faculty = await Faculty.findOne({ registrationNumber });
    //console.log(faculty);

    const { _id } = faculty;

    const updatedData = {
      email: email || faculty.email,
      facultyMobileNumber: facultyMobileNumber || faculty.facultyMobileNumber,
    };

    if (req.body.avatar !== "") {
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "erp",
        width: 150,
        crop: "scale",
      });

      updatedData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(_id, updatedData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log("Error in updating Profile", err.message);
  }
};

// Get notifications for faculty
exports.getNotifications = async (req, res, next) => {
  try {
    const facultyId = req.user.id;
    const notifications = await Notification.find({
      recipient: facultyId,
      recipientType: 'faculty'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      result: notifications
    });
  } catch (err) {
    console.log("Error in getting notifications", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications"
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (err) {
    console.log("Error in marking notification as read", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating notification"
    });
  }
};

// Get faculty dashboard data
exports.getDashboardData = async (req, res, next) => {
  try {
    const facultyId = req.user.id;
    const { department } = req.user;

    // Get total students in department
    const totalStudents = await Student.countDocuments({ department });

    // Get subjects taught by faculty
    const subjects = await Subject.find({ department });

    // Get recent attendance records
    const recentAttendance = await Attendance.find()
      .populate('subject')
      .populate('student', 'name registrationNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent marks uploaded
    const recentMarks = await Mark.find({ department })
      .populate('subject')
      .populate('student', 'name registrationNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      recipient: facultyId,
      recipientType: 'faculty',
      isRead: false
    });

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
      { $group: { _id: null, totalLectures: { $sum: "$totalLectures" }, totalAttended: { $sum: "$lecturesAttended" } } }
    ]);

    res.status(200).json({
      success: true,
      result: {
        totalStudents,
        subjects: subjects.length,
        recentAttendance,
        recentMarks,
        unreadNotifications,
        attendanceStats: attendanceStats[0] || { totalLectures: 0, totalAttended: 0 },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    console.log("Error in getting dashboard data", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data"
    });
  }
};

// Get students by multiple criteria
exports.getStudentsByCriteria = async (req, res, next) => {
  try {
    const { department, year, section, subjectCode } = req.body;
    
    let query = { department };
    if (year) query.year = year;
    if (section) query.section = section;

    const students = await Student.find(query);
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found for the given criteria"
      });
    }

    res.status(200).json({
      success: true,
      result: students,
      count: students.length
    });
  } catch (err) {
    console.log("Error in getting students by criteria", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching students"
    });
  }
};

// Get attendance summary for a subject
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const { subjectCode, department, year, section } = req.body;
    
    const subject = await Subject.findOne({ subjectCode });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    const attendanceRecords = await Attendance.find({ subject: subject._id })
      .populate('student', 'name registrationNumber')
      .populate('subject', 'subjectCode subjectName');

    const summary = attendanceRecords.map(record => ({
      student: {
        name: record.student.name,
        registrationNumber: record.student.registrationNumber
      },
      subject: {
        code: record.subject.subjectCode,
        name: record.subject.subjectName
      },
      attendancePercentage: ((record.lecturesAttended / record.totalLectures) * 100).toFixed(2),
      totalLectures: record.totalLectures,
      lecturesAttended: record.lecturesAttended,
      absentLectures: record.totalLectures - record.lecturesAttended
    }));

    res.status(200).json({
      success: true,
      result: summary,
      count: summary.length
    });
  } catch (err) {
    console.log("Error in getting attendance summary", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance summary"
    });
  }
};
