const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus,
  getDepartmentStats,
  bulkImportDepartments,
  syncDepartmentsToConfig
} = require("../controllers/departmentController");

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.constructor.modelName === 'Admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

// Public routes (accessible to all authenticated users)
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getAllDepartments
);

router.get(
  "/stats",
  passport.authenticate("jwt", { session: false }),
  getDepartmentStats
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  getDepartmentById
);

// Admin-only routes
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  createDepartment
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  updateDepartment
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  deleteDepartment
);

router.patch(
  "/:id/toggle-status",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  toggleDepartmentStatus
);

router.post(
  "/bulk-import",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  bulkImportDepartments
);

router.post(
  "/sync-config",
  passport.authenticate("jwt", { session: false }),
  requireAdmin,
  syncDepartmentsToConfig
);

module.exports = router;