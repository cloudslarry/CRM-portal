const Department = require('../models/Department');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { validateDepartmentInput } = require('../validation/department');
const { addDepartmentToConfig, removeDepartmentFromConfig, syncDepartmentsToConfig } = require('../utils/departmentConfigUpdater');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const { category, role, active, search } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by role access
    if (role) {
      query.allowedRoles = role;
    }
    
    // Filter by active status
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { shortForm: { $regex: search, $options: 'i' } },
        { fullForm: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const departments = await Department.find(query)
      .populate('headOfDepartment', 'name email registrationNumber')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ fullForm: 1 });
    
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

// Get single department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('headOfDepartment', 'name email registrationNumber')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Get department statistics
    const stats = await department.getStats();
    
    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message
    });
  }
};

// Create new department
exports.createDepartment = async (req, res) => {
  try {
    const { errors, isValid } = validateDepartmentInput(req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Check if department with same short form already exists
    const existingDept = await Department.findOne({ 
      shortForm: req.body.shortForm.toUpperCase() 
    });
    
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this short form already exists'
      });
    }
    
    // Create department
    const departmentData = {
      ...req.body,
      shortForm: req.body.shortForm.toUpperCase(),
      createdBy: req.user._id, // Fixed: use _id instead of id
      lastModifiedBy: req.user._id
    };
    
    const department = new Department(departmentData);
    await department.save();
    
    // Update the departments config file
    const configUpdated = addDepartmentToConfig(department.shortForm, department.fullForm);
    if (!configUpdated) {
      console.warn('Warning: Could not update departments config file');
    }
    
    // Populate the created department
    await department.populate([
      { path: 'headOfDepartment', select: 'name email registrationNumber' },
      { path: 'createdBy', select: 'name email' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
      configUpdated
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { errors, isValid } = validateDepartmentInput(req.body, true);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Check if short form is being changed and if it conflicts
    if (req.body.shortForm && req.body.shortForm.toUpperCase() !== department.shortForm) {
      const existingDept = await Department.findOne({ 
        shortForm: req.body.shortForm.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Department with this short form already exists'
        });
      }
    }
    
    // Update department
    const updateData = {
      ...req.body,
      lastModifiedBy: req.user.id
    };
    
    if (req.body.shortForm) {
      updateData.shortForm = req.body.shortForm.toUpperCase();
    }
    
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'headOfDepartment', select: 'name email registrationNumber' },
      { path: 'createdBy', select: 'name email' },
      { path: 'lastModifiedBy', select: 'name email' }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

// Delete department (soft delete)
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Check if department has students or faculty
    const [studentCount, facultyCount] = await Promise.all([
      Student.countDocuments({ department: department.fullForm }),
      Faculty.countDocuments({ department: department.fullForm })
    ]);
    
    if (studentCount > 0 || facultyCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. It has ${studentCount} students and ${facultyCount} faculty members. Consider deactivating instead.`
      });
    }
    
    await Department.findByIdAndDelete(req.params.id);
    
    // Remove from departments config file
    const configUpdated = removeDepartmentFromConfig(department.shortForm, department.fullForm);
    if (!configUpdated) {
      console.warn('Warning: Could not update departments config file');
    }
    
    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
      configUpdated
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
};

// Toggle department status (activate/deactivate)
exports.toggleDepartmentStatus = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    department.isActive = !department.isActive;
    department.lastModifiedBy = req.user.id;
    await department.save();
    
    res.status(200).json({
      success: true,
      message: `Department ${department.isActive ? 'activated' : 'deactivated'} successfully`,
      data: department
    });
  } catch (error) {
    console.error('Error toggling department status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling department status',
      error: error.message
    });
  }
};

// Get department statistics
exports.getDepartmentStats = async (req, res) => {
  try {
    const stats = await Department.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    const totalDepartments = await Department.countDocuments();
    const activeDepartments = await Department.countDocuments({ isActive: true });
    
    res.status(200).json({
      success: true,
      data: {
        total: totalDepartments,
        active: activeDepartments,
        inactive: totalDepartments - activeDepartments,
        byCategory: stats
      }
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching department statistics',
      error: error.message
    });
  }
};

// Bulk import departments
exports.bulkImportDepartments = async (req, res) => {
  try {
    const { departments } = req.body;
    
    if (!Array.isArray(departments) || departments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Departments array is required'
      });
    }
    
    const results = {
      success: [],
      errors: []
    };
    
    for (let i = 0; i < departments.length; i++) {
      try {
        const { errors, isValid } = validateDepartmentInput(departments[i]);
        
        if (!isValid) {
          results.errors.push({
            index: i,
            data: departments[i],
            errors
          });
          continue;
        }
        
        // Check if department already exists
        const existingDept = await Department.findOne({ 
          shortForm: departments[i].shortForm.toUpperCase() 
        });
        
        if (existingDept) {
          results.errors.push({
            index: i,
            data: departments[i],
            error: 'Department with this short form already exists'
          });
          continue;
        }
        
        const departmentData = {
          ...departments[i],
          shortForm: departments[i].shortForm.toUpperCase(),
          createdBy: req.user._id,
          lastModifiedBy: req.user._id
        };
        
        const department = new Department(departmentData);
        await department.save();
        
        results.success.push(department);
      } catch (error) {
        results.errors.push({
          index: i,
          data: departments[i],
          error: error.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk import completed. ${results.success.length} successful, ${results.errors.length} errors`,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk import',
      error: error.message
    });
  }
};

// Sync all departments from database to config file
exports.syncDepartmentsToConfig = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select('shortForm fullForm')
      .sort({ fullForm: 1 });
    
    const configUpdated = await syncDepartmentsToConfig(departments);
    
    res.status(200).json({
      success: true,
      message: 'Departments synced to config file successfully',
      configUpdated,
      syncedCount: departments.length
    });
  } catch (error) {
    console.error('Error syncing departments to config:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing departments to config',
      error: error.message
    });
  }
};