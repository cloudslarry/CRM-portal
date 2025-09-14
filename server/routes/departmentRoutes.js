const express = require("express");
const router = express.Router();

// Import middleware
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// Import controller
const departmentController = require("../controllers/departmentController");

// Apply authentication and admin role middleware to all routes
router.use(verifyToken);
router.use(requireRole(['admin']));

// Department routes
router.post("/add", departmentController.addDepartment);
router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;
