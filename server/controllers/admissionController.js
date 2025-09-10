const AdmissionApplication = require("../models/AdmissionApplication");
const Student = require("../models/Student");
const Applicant = require("../models/Applicant");

function generateAdmid() {
  const prefix = "ADM";
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  const ts = Date.now().toString().slice(-5);
  return `${prefix}-${rand}-${ts}`;
}

// Student: submit an admission application
exports.studentSubmitApplication = async (req, res) => {
  try {
    const authUser = req.user;
    if (!authUser || !authUser.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const student = await Student.findById(authUser.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const existingPending = await AdmissionApplication.findOne({ student: student._id, status: "pending" });
    if (existingPending) {
      return res.status(400).json({ success: false, message: "You already have a pending application" });
    }

    const payload = {
      student: student._id,
      admid: generateAdmid(),
      name: req.body.name || student.name,
      email: req.body.email || student.email,
      department: req.body.department || student.department,
      year: req.body.year || String(student.year),
      section: req.body.section || student.section,
      studentMobileNumber: req.body.studentMobileNumber || String(student.studentMobileNumber || ""),
      fatherName: req.body.fatherName || student.fatherName,
      fatherMobileNumber: req.body.fatherMobileNumber || String(student.fatherMobileNumber || ""),
      address: req.body.address,
      dateOfBirth: req.body.dateOfBirth,
    };

    const app = new AdmissionApplication(payload);
    await app.save();
    return res.status(201).json({ success: true, result: app });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Public: submit application without login
exports.publicSubmitApplication = async (req, res) => {
  try {
    const required = ["name","email","department","year","section"];
    for (const key of required) {
      if (!req.body[key]) {
        return res.status(400).json({ success: false, message: `${key} is required` });
      }
    }
    const payload = {
      admid: generateAdmid(),
      name: req.body.name,
      email: req.body.email,
      department: req.body.department,
      year: req.body.year,
      section: req.body.section,
      studentMobileNumber: req.body.studentMobileNumber,
      fatherName: req.body.fatherName,
      fatherMobileNumber: req.body.fatherMobileNumber,
      address: req.body.address,
      dateOfBirth: req.body.dateOfBirth,
    };
    const app = new AdmissionApplication(payload);
    await app.save();
    return res.status(201).json({ success: true, result: app });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Student: list my applications
exports.studentListApplications = async (req, res) => {
  try {
    const authUser = req.user;
    const apps = await AdmissionApplication.find({ student: authUser.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, result: apps });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: list applications (optionally filter by status)
exports.adminListApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const apps = await AdmissionApplication.find(filter)
      .populate("student", "name email registrationNumber department section year")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, result: apps });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: approve application
exports.adminApproveApplication = async (req, res) => {
  try {
    const adminUser = req.user;
    const { applicationId } = req.params;
    const app = await AdmissionApplication.findById(applicationId);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    if (app.status !== "pending") {
      return res.status(400).json({ success: false, message: "Application already processed" });
    }
    app.status = "approved";
    app.adminReviewer = adminUser.id;
    app.reviewNote = req.body?.note || "";
    await app.save();
    return res.status(200).json({ success: true, result: app });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: reject application
exports.adminRejectApplication = async (req, res) => {
  try {
    const adminUser = req.user;
    const { applicationId } = req.params;
    const app = await AdmissionApplication.findById(applicationId);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    if (app.status !== "pending") {
      return res.status(400).json({ success: false, message: "Application already processed" });
    }
    app.status = "rejected";
    app.adminReviewer = adminUser.id;
    app.reviewNote = req.body?.note || "";
    await app.save();
    return res.status(200).json({ success: true, result: app });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


