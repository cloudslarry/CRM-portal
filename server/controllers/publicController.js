const AdmissionApplication = require("../models/AdmissionApplication");

exports.getAdmissionStatus = async (req, res) => {
  try {
    const { applicationId, email, admid } = req.query;
    let query = {};
    if (applicationId) {
      query._id = applicationId;
    } else if (admid) {
      query = { admid };
    } else if (email) {
      query = { email };
    } else {
      return res.status(400).json({ success: false, message: "Provide applicationId or admid or email" });
    }

    const app = await AdmissionApplication.findOne(query).sort({ createdAt: -1 });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    return res.status(200).json({ success: true, result: {
      _id: app._id,
      name: app.name,
      email: app.email,
      admid: app.admid,
      department: app.department,
      year: app.year,
      section: app.section,
      status: app.status,
      reviewNote: app.reviewNote,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }});
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCourses = async (_req, res) => {
  try {
    const courses = [
      { code: "CSE101", name: "Computer Science Fundamentals", durationYears: 4, semesterFee: 50000, totalSemesters: 8, department: "CSE" },
      { code: "ECE101", name: "Electronics & Communication", durationYears: 4, semesterFee: 48000, totalSemesters: 8, department: "ECE" },
      { code: "ME101", name: "Mechanical Engineering", durationYears: 4, semesterFee: 45000, totalSemesters: 8, department: "ME" },
      { code: "MBA101", name: "Master of Business Administration", durationYears: 2, semesterFee: 60000, totalSemesters: 4, department: "MBA" },
    ];
    return res.status(200).json({ success: true, result: courses });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCollegeInfo = async (_req, res) => {
  try {
    const info = {
      name: "Sample College of Technology",
      address: "123 Academic Ave, Knowledge City",
      contactEmail: "admissions@samplecollege.edu",
      contactPhone: "+1 (555) 123-4567",
      about: "A premier institute offering undergraduate and postgraduate programs in engineering and management.",
      facilities: ["Library", "Hostel", "Sports Complex", "Research Labs", "Cafeteria"],
      admissionHelpline: "+1 (555) 987-6543",
      website: "https://samplecollege.edu",
    };
    return res.status(200).json({ success: true, result: info });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


