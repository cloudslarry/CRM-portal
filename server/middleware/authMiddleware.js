const jwt = require("jsonwebtoken");
const keys = require("../config/key");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization") || req.header("authorization") || req.header("x-auth-token") || req.header("x-access-token");
    let token = authHeader || null;
    if (token && token.startsWith('Bearer ')) token = token.substring(7);
    
    // DEBUG: Log token verification for troubleshooting
    console.log('Token verification:', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 10),
      hasToken: !!token,
      tokenPrefix: token?.substring(0, 10)
    });
    
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

    // FIXED: For students, fetch complete data including hostelInfo
    if (user.constructor.modelName === 'Student') {
      try {
        user = await Student.findById(decoded.id).populate('hostelInfo.hostel', 'name location warden').populate('hostelInfo.room', 'roomNumber type capacity');
        console.log('Student data populated:', {
          hasHostelInfo: !!user.hostelInfo,
          hostelId: user.hostelInfo?.hostel,
          roomId: user.hostelInfo?.room
        });
      } catch (populateError) {
        console.log('Error populating student data:', populateError.message);
        // Continue with unpopulated data if population fails
      }
    }

    // DEBUG: Log user found
    console.log('User found:', {
      userId: user._id,
      modelName: user.constructor.modelName,
      name: user.name || user.userName
    });

    req.user = user;
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
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
    if (req.user.constructor.modelName === 'Admin') {
      userRole = 'admin';
    } else if (req.user.constructor.modelName === 'Student') {
      userRole = 'student';
    } else if (req.user.constructor.modelName === 'Faculty') {
      userRole = 'faculty';
    }

    // DEBUG: Log role validation for troubleshooting
    console.log('Role validation:', {
      userId: req.user._id,
      modelName: req.user.constructor.modelName,
      userRole: userRole,
      requiredRoles: roles,
      hasAccess: userRole && roles.includes(userRole)
    });

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
