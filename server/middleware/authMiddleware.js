const jwt = require("jsonwebtoken");
const keys = require("../config/key");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, keys.secretOrKey);
    
    // Find user in any of the three models
    let user = await Admin.findById(decoded.id);
    if (!user) {
      user = await Student.findById(decoded.id);
    }
    if (!user) {
      user = await Faculty.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token."
    });
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    // Determine user role based on model
    let userRole;
    if (req.user.constructor.modelName === 'admin') {
      userRole = 'admin';
    } else if (req.user.constructor.modelName === 'student') {
      userRole = 'student';
    } else if (req.user.constructor.modelName === 'faculty') {
      userRole = 'faculty';
    }

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions."
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
