const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");

//Validation
const validateAdminRegisterInput = require("../validation/adminRegister");
const validateFacultyRegisterInput = require("../validation/facultyRegister");
const validateStudentRegisterInput = require("../validation/studentRegister");
const validateAdminLoginInput = require("../validation/adminLogin");
const validateSubjectRegisterInput = require("../validation/subjectRegister");
const validateDepartmentRegisterInput = require("../validation/departmentRegister");

//Models
const Subject = require("../models/Subject");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");
const Applicant = require("../models/Applicant");
const Department = require("../models/Department");

//Config
const keys = require("../config/key");

exports.addAdmin = async (req, res, next) => {
  try {
    const { errors, isValid } = validateAdminRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { name, email, department, contactNumber } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const avatarUrl = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

    let departmentHelper;
    if (department === "C.S.E") {
      departmentHelper = "01";
    } else if (department === "E.C.E") {
      departmentHelper = "02";
    } else if (department === "I.T") {
      departmentHelper = "03";
    } else if (department === "Mechanical") {
      departmentHelper = "04";
    } else if (department === "Civil") {
      departmentHelper = "05";
    } else if (department === "E.E.E") {
      departmentHelper = "06";
    } else {
      departmentHelper = "00";
    }

    const admins = await Admin.find({ department });
    let helper;

    if (admins.length < 10) {
      helper = "00" + admins.length.toString();
    } else if (admins.length < 100 && admins.length > 9) {
      helper = "0" + admins.length.toString();
    } else {
      helper = admins.length.toString();
    }

    let hashedPassword;
    console.log("admin password",process.env.ADMIN_PASSWORD);
    hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    var date = new Date();
    const joiningYear = date.getFullYear();
    var components = ["ADM", joiningYear, departmentHelper, helper];

    var registrationNumber = components.join("");

    console.log("hashedPassword", hashedPassword)

    const newAdmin = await new Admin({
      name,
      email,
      password: hashedPassword,
      joiningYear,
      registrationNumber,
      department,
      avatar: {
        public_id: "123",
        url: avatarUrl,
      },
      contactNumber,
    });

    await newAdmin.save();
    return res.status(200).json({
      success: true,
      message: "Admin registerd successfully",
      response: newAdmin,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { errors, isValid } = validateAdminLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { registrationNumber, password } = req.body;
    console.log("registrationNumber", registrationNumber);
    console.log("password", password);

    const admin = await Admin.findOne({ registrationNumber });
    console.log("admin", admin);
    if (!admin) {
      errors.registrationNumber = "Registration number not found";
      return res.status(404).json(errors);
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      errors.password = "Wrong Admin Password";
      return res.status(404).json(errors);
    }

    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      contactNumber: admin.contactNumber,
      avatar: admin.avatar,
      registrationNumber: admin.registrationNumber,
      joiningYear: admin.joiningYear,
      department: admin.department,
    };

    jwt.sign(payload, keys.secretOrKey, { expiresIn: "2d" }, (err, token) => {
      res.json({
        success: true,
        token: "Bearer " + token,
      });
    });
  } catch (err) {
    console.log("Error in admin login", err.message);
  }
};

exports.addStudent = async (req, res, next) => {
  try {
    const { errors, isValid } = validateStudentRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    const {
      name,
      email,
      year,
      fatherName,
      department,
      section,
      studentMobileNumber,
      fatherMobileNumber,
      gender,
    } = req.body;

    // Convert year string to number if needed
    let yearNumber = year;
    if (typeof year === 'string') {
      if (year.includes('1st')) yearNumber = 1;
      else if (year.includes('2nd')) yearNumber = 2;
      else if (year.includes('3rd')) yearNumber = 3;
      else if (year.includes('4th')) yearNumber = 4;
      else if (year.includes('5th')) yearNumber = 5;
    }

    const student = await Student.findOne({ email });
    if (student) {
      errors.email = "Email already exist";
      return res.status(400).json(errors);
    }

    const avatarUrl = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
    let departmentHelper;
    if (department === "C.S.E" || department === "Computer Science") {
      departmentHelper = "01";
    } else if (department === "E.C.E" || department === "Electronics & Communication") {
      departmentHelper = "02";
    } else if (department === "I.T" || department === "Information Technology") {
      departmentHelper = "03";
    } else if (department === "Mechanical" || department === "Mechanical Engineering") {
      departmentHelper = "04";
    } else if (department === "Civil" || department === "Civil Engineering") {
      departmentHelper = "05";
    } else if (department === "E.E.E" || department === "Electrical Engineering") {
      departmentHelper = "06";
    } else {
      departmentHelper = "00";
    }

    const students = await Student.find({ department });
    let helper;
    if (students.length < 10) {
      helper = "00" + students.length.toString();
    } else if (students.length < 100 && students.length > 9) {
      helper = "0" + students.length.toString();
    } else {
      helper = students.length.toString();
    }

    // Use env default or safe fallback for initial password
    const plainStudentPassword = process.env.STUDENT_PASSWORD || "student123";
    let hashedPassword;
    hashedPassword = await bcrypt.hash(plainStudentPassword, 10);
    var date = new Date();
    const batch = date.getFullYear();

    var components = ["STU", batch, departmentHelper, helper];

    var registrationNumber = components.join("");
    const newStudent = await new Student({
      name,
      email,
      password: hashedPassword,
      year: yearNumber,
      fatherName,
      registrationNumber,
      department,
      section,
      batch,
      gender,
      avatar: {
        public_id: "123",
        url: avatarUrl,
      },
      studentMobileNumber,
      fatherMobileNumber,
    });

    await newStudent.save();

    const subjects = await Subject.find({ year: yearNumber });
    if (subjects.length !== 0) {
      for (var i = 0; i < subjects.length; i++) {
        newStudent.subjects.push(subjects[i]._id);
      }
    }
    await newStudent.save();

    // Automatically assign student to hostel and room
    try {
      await assignStudentToHostel(newStudent._id);
    } catch (hostelError) {
      console.log("Warning: Could not assign student to hostel:", hostelError.message);
      // Continue with student creation even if hostel assignment fails
    }

    res.status(200).json({ 
      success: true,
      message: "Student added successfully",
      result: {
        _id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
        registrationNumber: newStudent.registrationNumber,
        department: newStudent.department,
        year: newStudent.year,
        section: newStudent.section
      },
      defaultPassword: process.env.STUDENT_PASSWORD ? undefined : plainStudentPassword
    });
  } catch (err) {
    console.log("Error in student registration:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error in student registration", 
      error: err.message 
    });
  }
};

exports.addFaculty = async (req, res, next) => {
  try {
    const { errors, isValid } = validateFacultyRegisterInput(req.body);
    //Validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const { name, email, designation, department, facultyMobileNumber } =
      req.body;

    const faculty = await Faculty.findOne({ email });
    if (faculty) {
      errors.email = "Email already exist";
      return res.status(400).json(errors);
    }

    const avatarUrl = gravatar.url(req.body.email, {
      s: "200", // Size
      r: "pg", // Rating
      d: "mm", // Default
    });

    let departmentHelper;
    if (department === "C.S.E" || department === "Computer Science") {
      departmentHelper = "01";
    } else if (department === "E.C.E" || department === "Electronics & Communication") {
      departmentHelper = "02";
    } else if (department === "I.T" || department === "Information Technology") {
      departmentHelper = "03";
    } else if (department === "Mechanical" || department === "Mechanical Engineering") {
      departmentHelper = "04";
    } else if (department === "Civil" || department === "Civil Engineering") {
      departmentHelper = "05";
    } else if (department === "E.E.E" || department === "Electrical Engineering") {
      departmentHelper = "06";
    } else {
      departmentHelper = "00";
    }

    const faculties = await Faculty.find({ department });
    let helper;
    if (faculties.length < 10) {
      helper = "00" + faculties.length.toString();
    } else if (faculties.length < 100 && faculties.length > 9) {
      helper = "0" + faculties.length.toString();
    } else {
      helper = faculties.length.toString();
    }

    let hashedPassword;
    hashedPassword = await bcrypt.hash(process.env.FACULTY_PASSWORD, 10);
    var date = new Date();
    const joiningYear = date.getFullYear();
    var components = ["FAC", joiningYear, departmentHelper, helper];

    var registrationNumber = components.join("");
    const newFaculty = await new Faculty({
      name,
      email,
      designation,
      password: hashedPassword,
      department,
      facultyMobileNumber,
      avatar: {
        public_id: "123",
        url: avatarUrl,
      },
      registrationNumber,
      joiningYear,
    });
    await newFaculty.save();
    res.status(200).json({ result: newFaculty });
  } catch (err) {
    console.log("Error in adding new faculty:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error in adding new faculty", 
      error: err.message 
    });
  }
};

exports.addSubject = async (req, res, next) => {
  try {
    const { errors, isValid } = validateSubjectRegisterInput(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    const { totalLectures, department, subjectCode, subjectName, year } = req.body;
    
    // Convert year to string format for consistency with Subject model
    let yearString = year;
    if (typeof year === 'number') {
      yearString = `${year}${year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year`;
    } else if (typeof year === 'string' && !year.includes('Year')) {
      const yearNum = parseInt(year);
      yearString = `${yearNum}${yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th'} Year`;
    }
    
    console.log('Adding subject with year:', yearString);
    
    // Check if subject already exists
    const existingSubject = await Subject.findOne({ 
      $or: [
        { subjectCode: subjectCode },
        { subjectName: subjectName, department: department, year: yearString }
      ]
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject already exists",
        errors: {
          subjectCode: existingSubject.subjectCode === subjectCode ? "Subject code already exists" : "Subject with this name already exists in this department and year"
        }
      });
    }

    // Create new subject
    const newSubject = await new Subject({
      totalLectures: parseInt(totalLectures),
      department,
      subjectCode,
      subjectName,
      year: yearString,
    });
    await newSubject.save();

    console.log('Subject created successfully:', newSubject);

    // Find students in the same department and year
    const students = await Student.find({ 
      department, 
      year: typeof year === 'number' ? year : parseInt(year)
    });
    
    console.log(`Found ${students.length} students for department: ${department}, year: ${year}`);

    // Add subject to students' subject list
    if (students.length > 0) {
      for (let i = 0; i < students.length; i++) {
        if (!students[i].subjects.includes(newSubject._id)) {
          students[i].subjects.push(newSubject._id);
          await students[i].save();
        }
      }
      console.log(`Added subject to ${students.length} students`);
    }

    res.status(200).json({ 
      success: true,
      message: "Subject added successfully",
      result: newSubject,
      studentsAffected: students.length
    });
  } catch (err) {
    console.log("Error in adding new subject:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error in adding new subject", 
      error: err.message 
    });
  }
};

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find();
    // Always return 200 with an array, even when empty, to simplify client handling
    res.status(200).json({ result: students });
  } catch (err) {
    console.log("Error in getting all students:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching all students", 
      error: err.message 
    });
  }
};

// Delete single student
exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    return res.status(200).json({ success: true, message: "Student deleted" });
  } catch (err) {
    console.log("Error in deleting student:", err.message);
    return res.status(500).json({ success: false, message: "Error deleting student", error: err.message });
  }
};

exports.getAllFaculty = async (req, res, next) => {
  try {
    const faculties = await Faculty.find({});
    // Always return 200 with an array, even when empty, to simplify client handling
    res.status(200).json({ result: faculties });
  } catch (err) {
    console.log("Error in getting all faculties:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching all faculties", 
      error: err.message 
    });
  }
};

// Get single faculty by id
exports.getFacultyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    return res.status(200).json({ success: true, result: faculty });
  } catch (err) {
    console.log("Error in getting faculty by id:", err.message);
    return res.status(500).json({ success: false, message: "Error fetching faculty", error: err.message });
  }
};

// Update faculty details
exports.updateFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = (({ name, email, designation, department, facultyMobileNumber }) => ({ name, email, designation, department, facultyMobileNumber }))(req.body);

    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    if (updates.email && updates.email !== faculty.email) {
      const existing = await Faculty.findOne({ email: updates.email });
      if (existing) {
        return res.status(400).json({ success: false, message: "Email already in use" });
      }
    }

    Object.keys(updates).forEach((key) => {
      if (typeof updates[key] !== 'undefined') {
        faculty[key] = updates[key];
      }
    });

    await faculty.save();
    return res.status(200).json({ success: true, message: "Faculty updated", result: faculty });
  } catch (err) {
    console.log("Error in updating faculty:", err.message);
    return res.status(500).json({ success: false, message: "Error updating faculty", error: err.message });
  }
};

// Delete single faculty
exports.deleteFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Faculty.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    return res.status(200).json({ success: true, message: "Faculty deleted" });
  } catch (err) {
    console.log("Error in deleting faculty:", err.message);
    return res.status(500).json({ success: false, message: "Error deleting faculty", error: err.message });
  }
};

// Bulk delete faculties
exports.bulkDeleteFaculty = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No faculty ids provided" });
    }
    const result = await Faculty.deleteMany({ _id: { $in: ids } });
    return res.status(200).json({ success: true, message: "Faculties deleted", deletedCount: result.deletedCount });
  } catch (err) {
    console.log("Error in bulk deleting faculty:", err.message);
    return res.status(500).json({ success: false, message: "Error bulk deleting faculty", error: err.message });
  }
};

exports.getAllSubjects = async (req, res, next) => {
  try {
    console.log('Fetching all subjects...');
    const allSubjects = await Subject.find({}).sort({ department: 1, year: 1, subjectName: 1 });
    
    console.log(`Found ${allSubjects.length} subjects`);
    
    if (allSubjects.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No subjects found",
        result: []
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Subjects fetched successfully",
      result: allSubjects,
      count: allSubjects.length
    });
  } catch (err) {
    console.log("Error in getting all subjects:", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching all subjects", 
      error: err.message 
    });
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    const { department, year } = req.body;
    const allStudents = await Student.find({ department, year });
    res.status(200).json({ result: allStudents });
  } catch (err) {
    console.log("Error in getting all students", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching students", 
      error: err.message 
    });
  }
};

exports.getFaculty = async (req, res, next) => {
  try {
    const { department } = req.body;
    const allFaculties = await Faculty.find({ department });
    res.status(200).json({ result: allFaculties });
  } catch (err) {
    console.log("Error in getting all faculties", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching faculties", 
      error: err.message 
    });
  }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const { department, year } = req.body;
    const allSubjects = await Subject.find({ department, year });
    res.status(200).json({ result: allSubjects });
  } catch (err) {
    console.log("Error in getting all subjects", err.message);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching subjects", 
      error: err.message 
    });
  }
};

// Test statistics endpoint (no authentication required)
exports.testStatistics = async (req, res, next) => {
  try {
    // Get counts from database
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    
    // Get unique departments count
    const departments = await Student.distinct('department');
    const totalDepartments = departments.length;

    console.log("Test - Database Statistics:", {
      totalStudents,
      totalFaculty,
      totalSubjects,
      totalDepartments,
      departments
    });

    res.status(200).json({
      success: true,
      message: "Test statistics endpoint working",
      statistics: {
        totalStudents,
        facultyMembers: totalFaculty,
        subjects: totalSubjects,
        departments: totalDepartments
      }
    });
  } catch (err) {
    console.log("Error in test statistics", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching test statistics",
      error: err.message
    });
  }
};

// Get comprehensive dashboard statistics
exports.getStatistics = async (req, res, next) => {
  try {
    console.log("Fetching database statistics...");
    
    // Get basic counts from database
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    
    // Get unique departments count from students
    const studentDepartments = await Student.distinct('department');
    const facultyDepartments = await Faculty.distinct('department');
    const allDepartments = [...new Set([...studentDepartments, ...facultyDepartments])];
    const totalDepartments = allDepartments.length;

    // Get additional statistics
    const studentsByYear = await Student.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const studentsByDepartment = await Student.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const facultyByDepartment = await Faculty.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const subjectsByYear = await Subject.aggregate([
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const statistics = {
      // Main counts
      totalStudents,
      totalFaculty,
      totalSubjects,
      totalAdmins,
      totalDepartments,
      
      // Detailed breakdowns
      studentsByYear,
      studentsByDepartment,
      facultyByDepartment,
      subjectsByYear,
      
      // Department list
      departments: allDepartments,
      
      // Timestamp
      lastUpdated: new Date().toISOString()
    };

    console.log("Database Statistics Retrieved:", {
      totalStudents,
      totalFaculty,
      totalSubjects,
      totalAdmins,
      totalDepartments,
      departments: allDepartments
    });

    res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      statistics: statistics
    });
  } catch (err) {
    console.error("Error in getting statistics:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: err.message
    });
  }
};

// Update admin password
exports.adminUpdatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    // Find admin by ID
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    admin.password = hashedNewPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (err) {
    console.log("Error in updating admin password:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating password",
      error: err.message
    });
  }
};

// Add student directly without authentication (for initial setup)
exports.addStudentDirect = async (req, res, next) => {
  try {
    const { errors, isValid } = validateStudentRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    const {
      name,
      email,
      year,
      fatherName,
      department,
      section,
      studentMobileNumber,
      fatherMobileNumber,
      gender,
    } = req.body;

    // Convert year string to number if needed
    let yearNumber = year;
    if (typeof year === 'string') {
      if (year.includes('1st')) yearNumber = 1;
      else if (year.includes('2nd')) yearNumber = 2;
      else if (year.includes('3rd')) yearNumber = 3;
      else if (year.includes('4th')) yearNumber = 4;
      else if (year.includes('5th')) yearNumber = 5;
    }

    const student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const avatarUrl = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
    let departmentHelper;
    if (department === "C.S.E" || department === "Computer Science") {
      departmentHelper = "01";
    } else if (department === "E.C.E" || department === "Electronics & Communication") {
      departmentHelper = "02";
    } else if (department === "I.T" || department === "Information Technology") {
      departmentHelper = "03";
    } else if (department === "Mechanical" || department === "Mechanical Engineering") {
      departmentHelper = "04";
    } else if (department === "Civil" || department === "Civil Engineering") {
      departmentHelper = "05";
    } else if (department === "E.E.E" || department === "Electrical Engineering") {
      departmentHelper = "06";
    } else {
      departmentHelper = "00";
    }

    const students = await Student.find({ department });
    let helper;
    if (students.length < 10) {
      helper = "00" + students.length.toString();
    } else if (students.length < 100 && students.length > 9) {
      helper = "0" + students.length.toString();
    } else {
      helper = students.length.toString();
    }

    // Use env default or safe fallback for initial password
    const plainStudentPassword = process.env.STUDENT_PASSWORD || "student123";
    let hashedPassword;
    hashedPassword = await bcrypt.hash(plainStudentPassword, 10);
    var date = new Date();
    const batch = date.getFullYear();

    var components = ["STU", batch, departmentHelper, helper];

    var registrationNumber = components.join("");
    const newStudent = await new Student({
      name,
      email,
      password: hashedPassword,
      year: yearNumber,
      fatherName,
      registrationNumber,
      department,
      section,
      batch,
      gender,
      avatar: {
        public_id: "123",
        url: avatarUrl,
      },
      studentMobileNumber,
      fatherMobileNumber,
    });

    await newStudent.save();

    const subjects = await Subject.find({ year: yearNumber });
    if (subjects.length !== 0) {
      for (var i = 0; i < subjects.length; i++) {
        newStudent.subjects.push(subjects[i]._id);
      }
    }
    await newStudent.save();

    // Automatically assign student to hostel and room
    try {
      await assignStudentToHostel(newStudent._id);
    } catch (hostelError) {
      console.log("Warning: Could not assign student to hostel:", hostelError.message);
      // Continue with student creation even if hostel assignment fails
    }
    
    res.status(200).json({ 
      success: true,
      message: "Student added successfully",
      result: {
        name: newStudent.name,
        email: newStudent.email,
        registrationNumber: newStudent.registrationNumber,
        department: newStudent.department,
        year: newStudent.year,
        section: newStudent.section
      },
      defaultPassword: process.env.STUDENT_PASSWORD ? undefined : plainStudentPassword
    });
  } catch (err) {
    console.log("Error in student registration", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

// Get notifications for admin
exports.getNotifications = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const notifications = await Notification.find({
      recipient: adminId,
      recipientType: 'admin'
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

// Create notification
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, recipientType, recipient, relatedEntity, relatedEntityType } = req.body;

    const notification = new Notification({
      title,
      message,
      type: type || 'info',
      recipientType,
      recipient,
      relatedEntity,
      relatedEntityType
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      result: notification
    });
  } catch (err) {
    console.log("Error in creating notification", err.message);
    res.status(500).json({
      success: false,
      message: "Error creating notification"
    });
  }
};

// Get comprehensive dashboard data
exports.getDashboardData = async (req, res, next) => {
  try {
    // Get basic counts
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalAdmins = await Admin.countDocuments();

    // Get department-wise statistics
    const studentsByDepartment = await Student.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const facultyByDepartment = await Faculty.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent activities
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email registrationNumber department year createdAt');

    const recentFaculty = await Faculty.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email registrationNumber department designation createdAt');

    // Get attendance statistics
    const attendanceStats = await Attendance.aggregate([
      { $group: { _id: null, totalLectures: { $sum: "$totalLectures" }, totalAttended: { $sum: "$lecturesAttended" } } }
    ]);

    // Get marks statistics
    const marksStats = await Mark.aggregate([
      { $group: { _id: "$exam", count: { $sum: 1 }, avgMarks: { $avg: "$marks" } } }
    ]);

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      recipientType: 'admin',
      isRead: false
    });

    res.status(200).json({
      success: true,
      result: {
        overview: {
          totalStudents,
          totalFaculty,
          totalSubjects,
          totalAdmins,
          unreadNotifications
        },
        departmentStats: {
          students: studentsByDepartment,
          faculty: facultyByDepartment
        },
        recentActivities: {
          students: recentStudents,
          faculty: recentFaculty
        },
        academicStats: {
          attendance: attendanceStats[0] || { totalLectures: 0, totalAttended: 0 },
          marks: marksStats
        },
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

// Get detailed analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

    // Student registration trends
    const studentTrends = await Student.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Faculty registration trends
    const facultyTrends = await Faculty.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Attendance trends
    const attendanceTrends = await Attendance.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalLectures: { $sum: "$totalLectures" }, totalAttended: { $sum: "$lecturesAttended" } } },
      { $sort: { _id: 1 } }
    ]);

    // Performance by department
    const departmentPerformance = await Student.aggregate([
      { $lookup: { from: "marks", localField: "_id", foreignField: "student", as: "marks" } },
      { $unwind: { path: "$marks", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$department", avgMarks: { $avg: "$marks.marks" }, studentCount: { $sum: 1 } } },
      { $sort: { avgMarks: -1 } }
    ]);

    res.status(200).json({
      success: true,
      result: {
        period: `${period} days`,
        studentTrends,
        facultyTrends,
        attendanceTrends,
        departmentPerformance,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.log("Error in getting analytics", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics"
    });
  }
};

// Helper function to automatically assign student to hostel and room
const assignStudentToHostel = async (studentId) => {
  try {
    const Student = require("../models/Student");
    const Hostel = require("../models/Hostel");
    const Room = require("../models/Room");

    // Get the student
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Check if student is already assigned to a hostel
    if (student.hostelInfo && student.hostelInfo.hostel) {
      console.log("Student is already assigned to a hostel");
      return;
    }

    // Find available hostels
    const hostels = await Hostel.find({ status: "Active" });
    if (hostels.length === 0) {
      throw new Error("No active hostels available");
    }

    // Find the first hostel with available rooms
    for (const hostel of hostels) {
      const availableRooms = await Room.find({
        hostel: hostel._id,
        status: "Active",
        $expr: { $lt: ["$occupied", "$capacity"] }
      }).sort({ roomNumber: 1 });

      if (availableRooms.length > 0) {
        const room = availableRooms[0];
        
        // Assign student to room
        room.students.push(studentId);
        room.occupied += 1;
        await room.save();

        // Update student's hostel info
        student.hostelInfo = {
          hostel: hostel._id,
          room: room._id,
          bedNumber: `${room.roomNumber}-${room.occupied}`
        };
        await student.save();

        console.log(`Student ${student.name} assigned to hostel ${hostel.name}, room ${room.roomNumber}`);
        return;
      }
    }

    throw new Error("No available rooms in any hostel");
  } catch (err) {
    console.log("Error in automatic hostel assignment:", err.message);
    throw err;
  }
};

// Assign all unassigned students to hostels
exports.assignAllStudentsToHostels = async (req, res, next) => {
  try {
    const Student = require("../models/Student");
    
    // Find all students who are not assigned to any hostel
    const unassignedStudents = await Student.find({
      $or: [
        { hostelInfo: { $exists: false } },
        { "hostelInfo.hostel": { $exists: false } },
        { "hostelInfo.hostel": null }
      ]
    });

    if (unassignedStudents.length === 0) {
      return res.status(200).json({
        success: true,
        message: "All students are already assigned to hostels",
        result: { assignedCount: 0, totalStudents: 0 }
      });
    }

    let assignedCount = 0;
    const errors = [];

    for (const student of unassignedStudents) {
      try {
        await assignStudentToHostel(student._id);
        assignedCount++;
      } catch (error) {
        errors.push({
          studentId: student._id,
          studentName: student.name,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully assigned ${assignedCount} out of ${unassignedStudents.length} students to hostels`,
      result: {
        assignedCount,
        totalStudents: unassignedStudents.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (err) {
    console.log("Error in assigning all students to hostels:", err.message);
    res.status(500).json({
      success: false,
      message: "Error assigning students to hostels",
      error: err.message
    });
  }
};

// Add new applicant
exports.addApplicant = async (req, res, next) => {
  try {
    const {
      name,
      email,
      contactNumber,
      fatherName,
      motherName,
      address,
      dateOfBirth,
      gender,
      category,
      department,
      year,
      section,
      previousQualification,
      previousMarks,
      previousSchool
    } = req.body;

    // Check if applicant already exists
    const existingApplicant = await Applicant.findOne({ email });
    if (existingApplicant) {
      return res.status(400).json({
        success: false,
        message: "Applicant with this email already exists"
      });
    }

    // Create new applicant
    const newApplicant = new Applicant({
      name,
      email,
      contactNumber,
      fatherName,
      motherName,
      address,
      dateOfBirth,
      gender,
      category,
      department,
      year,
      section,
      previousQualification,
      previousMarks,
      previousSchool,
      status: "Pending"
    });

    await newApplicant.save();

    res.status(200).json({
      success: true,
      message: "Applicant added successfully",
      result: {
        _id: newApplicant._id,
        name: newApplicant.name,
        email: newApplicant.email,
        applicationId: newApplicant.applicationId,
        department: newApplicant.department,
        year: newApplicant.year,
        section: newApplicant.section,
        status: newApplicant.status
      }
    });
  } catch (err) {
    console.log("Error in adding applicant:", err.message);
    res.status(500).json({
      success: false,
      message: "Error adding applicant",
      error: err.message
    });
  }
};

// Get all applicants
exports.getAllApplicants = async (req, res, next) => {
  try {
    const { q } = req.body;
    let query = {};
    
    if (q) {
      query = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { applicationId: { $regex: q, $options: 'i' } }
        ]
      };
    }

    const applicants = await Applicant.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      result: applicants
    });
  } catch (err) {
    console.log("Error in getting applicants:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching applicants",
      error: err.message
    });
  }
};

// Update applicant status
exports.updateApplicantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const applicant = await Applicant.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Applicant status updated successfully",
      result: applicant
    });
  } catch (err) {
    console.log("Error in updating applicant status:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating applicant status",
      error: err.message
    });
  }
};

// Delete applicant
exports.deleteApplicant = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const applicant = await Applicant.findByIdAndDelete(id);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: "Applicant not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Applicant deleted successfully"
    });
  } catch (err) {
    console.log("Error in deleting applicant:", err.message);
    res.status(500).json({
      success: false,
      message: "Error deleting applicant",
      error: err.message
    });
  }
};

// ==================== DEPARTMENT MANAGEMENT ====================

// Add new department
exports.addDepartment = async (req, res, next) => {
  try {
    const { errors, isValid } = validateDepartmentRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    const { name, code, description } = req.body;
    const createdBy = req.user.id; // Get admin ID from JWT token

    // Check if department already exists
    const existingDepartment = await Department.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { code: code.toUpperCase() }
      ]
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department already exists",
        errors: {
          name: existingDepartment.name.toLowerCase() === name.toLowerCase() ? "Department name already exists" : "Department code already exists"
        }
      });
    }

    // Create new department
    const newDepartment = new Department({
      name,
      code: code.toUpperCase(),
      description,
      createdBy
    });

    await newDepartment.save();

    res.status(201).json({
      success: true,
      message: "Department added successfully",
      result: newDepartment
    });
  } catch (err) {
    console.log("Error in adding department:", err.message);
    res.status(500).json({
      success: false,
      message: "Error adding department",
      error: err.message
    });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res, next) => {
  try {
    const { isActive, search } = req.query;
    let query = {};

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const departments = await Department.find(query)
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      result: departments,
      count: departments.length
    });
  } catch (err) {
    console.log("Error in getting departments:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
      error: err.message
    });
  }
};

// Get single department by ID
exports.getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id).populate('createdBy', 'name email');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    res.status(200).json({
      success: true,
      result: department
    });
  } catch (err) {
    console.log("Error in getting department by ID:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching department",
      error: err.message
    });
  }
};

// Update department
exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { errors, isValid } = validateDepartmentRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    const { name, code, description, isActive } = req.body;

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    // Check for duplicate name/code (excluding current department)
    const existingDepartment = await Department.findOne({
      _id: { $ne: id },
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { code: code.toUpperCase() }
      ]
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department name or code already exists",
        errors: {
          name: existingDepartment.name.toLowerCase() === name.toLowerCase() ? "Department name already exists" : "Department code already exists"
        }
      });
    }

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      {
        name,
        code: code.toUpperCase(),
        description,
        isActive: isActive !== undefined ? isActive : department.isActive
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      result: updatedDepartment
    });
  } catch (err) {
    console.log("Error in updating department:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating department",
      error: err.message
    });
  }
};

// Delete department
exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    // Check if department is being used by students or faculty
    const studentsUsingDept = await Student.countDocuments({ department: department.name });
    const facultyUsingDept = await Faculty.countDocuments({ department: department.name });

    if (studentsUsingDept > 0 || facultyUsingDept > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete department. It is being used by students or faculty members",
        details: {
          studentsCount: studentsUsingDept,
          facultyCount: facultyUsingDept
        }
      });
    }

    await Department.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Department deleted successfully"
    });
  } catch (err) {
    console.log("Error in deleting department:", err.message);
    res.status(500).json({
      success: false,
      message: "Error deleting department",
      error: err.message
    });
  }
};

// Toggle department status (activate/deactivate)
exports.toggleDepartmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Department ${isActive ? 'activated' : 'deactivated'} successfully`,
      result: department
    });
  } catch (err) {
    console.log("Error in toggling department status:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating department status",
      error: err.message
    });
  }
};
