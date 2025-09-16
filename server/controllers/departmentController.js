const Department = require("../models/Department");
const validateDepartmentInput = require("../validation/department");

// Create a new department
exports.addDepartment = async (req, res) => {
  try {
    const { errors, isValid } = validateDepartmentInput(req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    const { name, code, description } = req.body;

    // Check if department with same name or code already exists
    const existingDepartment = await Department.findOne({
      $or: [{ name: name }, { code: code.toUpperCase() }]
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department with this name or code already exists"
      });
    }

    const newDepartment = new Department({
      name,
      code: code.toUpperCase(),
      description: description || ""
    });

    await newDepartment.save();

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      result: newDepartment
    });
  } catch (err) {
    console.log("Error in creating department:", err.message);
    res.status(500).json({
      success: false,
      message: "Error creating department",
      error: err.message
    });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const departments = await Department.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Departments retrieved successfully",
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

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Department retrieved successfully",
      result: department
    });
  } catch (err) {
    console.log("Error in getting department:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching department",
      error: err.message
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { errors, isValid } = validateDepartmentInput(req.body);
    
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

    // Check if another department with same name or code exists
    const existingDepartment = await Department.findOne({
      _id: { $ne: id },
      $or: [{ name: name }, { code: code.toUpperCase() }]
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department with this name or code already exists"
      });
    }

    // Update department
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      {
        name,
        code: code.toUpperCase(),
        description: description || "",
        isActive: isActive !== undefined ? isActive : department.isActive,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

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
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
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
