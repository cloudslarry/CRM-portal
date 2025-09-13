const HostelNotice = require("../models/HostelNotice");
const Hostel = require("../models/Hostel");
const Admin = require("../models/Admin");

// Create notice
exports.createNotice = async (req, res, next) => {
  try {
    const { hostel, title, message, attachments } = req.body;
    const authorId = req.user.id; // From authenticated user

    // Check if hostel exists
    const hostelExists = await Hostel.findById(hostel);
    if (!hostelExists) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    // Check if author exists (should be admin)
    const author = await Admin.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found"
      });
    }

    const newNotice = new HostelNotice({
      hostel,
      title,
      message,
      author: authorId,
      attachments: attachments || []
    });

    await newNotice.save();

    // Populate the result
    const populatedNotice = await HostelNotice.findById(newNotice._id)
      .populate('hostel', 'name location')
      .populate('author', 'name email registrationNumber');

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      result: populatedNotice
    });
  } catch (err) {
    console.log("Error in creating notice:", err.message);
    res.status(500).json({
      success: false,
      message: "Error creating notice",
      error: err.message
    });
  }
};

// Get notices by hostel
exports.getNoticesByHostel = async (req, res, next) => {
  try {
    const { hostelId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    // Check if hostel exists
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    const skip = (page - 1) * limit;

    const notices = await HostelNotice.find({ hostel: hostelId })
      .populate('hostel', 'name location')
      .populate('author', 'name email registrationNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalNotices = await HostelNotice.countDocuments({ hostel: hostelId });

    res.status(200).json({
      success: true,
      message: "Notices retrieved successfully",
      result: notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalNotices / limit),
        totalNotices,
        hasNext: page * limit < totalNotices,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.log("Error in getting notices by hostel:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching notices",
      error: err.message
    });
  }
};

// Get all notices (for admin)
exports.getAllNotices = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, hostel } = req.query;
    const skip = (page - 1) * limit;

    let matchQuery = {};
    if (hostel) matchQuery.hostel = hostel;

    const notices = await HostelNotice.find(matchQuery)
      .populate('hostel', 'name location')
      .populate('author', 'name email registrationNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalNotices = await HostelNotice.countDocuments(matchQuery);

    res.status(200).json({
      success: true,
      message: "All notices retrieved successfully",
      result: notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalNotices / limit),
        totalNotices,
        hasNext: page * limit < totalNotices,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.log("Error in getting all notices:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching notices",
      error: err.message
    });
  }
};

// Get notice by ID
exports.getNoticeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notice = await HostelNotice.findById(id)
      .populate('hostel', 'name location')
      .populate('author', 'name email registrationNumber');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Notice retrieved successfully",
      result: notice
    });
  } catch (err) {
    console.log("Error in getting notice by ID:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching notice",
      error: err.message
    });
  }
};

// Update notice
exports.updateNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const authorId = req.user.id;

    // Check if notice exists
    const notice = await HostelNotice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found"
      });
    }

    // Check if user is the author or admin
    if (notice.author.toString() !== authorId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own notices"
      });
    }

    const updatedNotice = await HostelNotice.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('hostel', 'name location')
     .populate('author', 'name email registrationNumber');

    res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      result: updatedNotice
    });
  } catch (err) {
    console.log("Error in updating notice:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating notice",
      error: err.message
    });
  }
};

// Delete notice
exports.deleteNotice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id;

    // Check if notice exists
    const notice = await HostelNotice.findById(id);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found"
      });
    }

    // Check if user is the author or admin
    if (notice.author.toString() !== authorId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own notices"
      });
    }

    await HostelNotice.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Notice deleted successfully"
    });
  } catch (err) {
    console.log("Error in deleting notice:", err.message);
    res.status(500).json({
      success: false,
      message: "Error deleting notice",
      error: err.message
    });
  }
};

// Get recent notices (for dashboard)
exports.getRecentNotices = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const notices = await HostelNotice.find()
      .populate('hostel', 'name location')
      .populate('author', 'name email registrationNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Recent notices retrieved successfully",
      result: notices
    });
  } catch (err) {
    console.log("Error in getting recent notices:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching recent notices",
      error: err.message
    });
  }
};
