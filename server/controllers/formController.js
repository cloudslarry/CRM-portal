const { Form, FormSubmission, Admin, Faculty, Student, Applicant } = require('../models');
const mongoose = require('mongoose');

// Helper function to get user role
const getUserRole = (user) => {
  if (!user) return null;
  if (user.constructor && user.constructor.modelName === 'Admin') {
    return 'admin';
  } else if (user.constructor && user.constructor.modelName === 'Student') {
    return 'student';
  } else if (user.constructor && user.constructor.modelName === 'Faculty') {
    return 'faculty';
  }
  return null;
};

// Create a new form
const createForm = async (req, res) => {
  try {
    const { title, description, fields, settings, styling, visibility, accessControl, department, tags } = req.body;
    
    // Get user info from token
    const user = req.user;
    const userRole = getUserRole(user);
    
    // Check if user has permission to create forms (only admin and faculty)
    if (!['admin', 'faculty'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only administrators and faculty can create forms'
      });
    }

    const formData = {
      title,
      description: description || '',
      fields: fields || [],
      settings: {
        allowMultipleSubmissions: true,
        requireAuthentication: false,
        collectEmail: false,
        showProgressBar: true,
        submitButtonText: 'Submit',
        successMessage: 'Thank you for your submission!',
        emailNotifications: { enabled: false, recipients: [] },
        spamProtection: { enabled: true, captcha: false },
        responseLimit: { enabled: false },
        timeLimit: { enabled: false },
        ...settings
      },
      styling: {
        theme: 'default',
        primaryColor: '#1976d2',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px',
        ...styling
      },
      status: 'draft',
      visibility: visibility || 'private',
      accessControl: accessControl || { allowedRoles: [], allowedUsers: [] },
      createdBy: user.id,
      createdByModel: userRole === 'admin' ? 'Admin' : 'Faculty',
      department: department || null,
      tags: tags || [],
      isTemplate: false
    };

    const form = new Form(formData);
    await form.save();

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: form
    });
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating form',
      error: error.message
    });
  }
};

// Get all forms for a user
const getForms = async (req, res) => {
  try {
    const user = req.user;
    const userRole = getUserRole(user);
    const { page = 1, limit = 10, status, search, department } = req.query;
    
    const query = {};
    
    // If not admin, only show forms they created or have access to
    if (userRole !== 'admin') {
      query.$or = [
        { createdBy: user.id },
        { 'accessControl.allowedRoles': userRole },
        { 'accessControl.allowedUsers': user.id }
      ];
    }
    
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const forms = await Form.find(query)
      .populate('createdBy', 'name email')
      .populate('department', 'name')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Form.countDocuments(query);

    res.json({
      success: true,
      data: {
        forms,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching forms',
      error: error.message
    });
  }
};

// Get a single form by ID
const getFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const userRole = req.userRole;

    const form = await Form.findById(id)
      .populate('createdBy', 'name email')
      .populate('department', 'name');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user can access this form
    if (!form.canAccess(user.id, userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this form'
      });
    }

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching form',
      error: error.message
    });
  }
};

// Update a form
const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;
    const userRole = req.userRole;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user can edit this form
    if (form.createdBy.toString() !== user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit forms you created'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.createdByModel;
    delete updateData.analytics;

    const updatedForm = await Form.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('department', 'name');

    res.json({
      success: true,
      message: 'Form updated successfully',
      data: updatedForm
    });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating form',
      error: error.message
    });
  }
};

// Delete a form
const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const userRole = req.userRole;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user can delete this form
    if (form.createdBy.toString() !== user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete forms you created'
      });
    }

    // Also delete all submissions for this form
    await FormSubmission.deleteMany({ form: id });
    await Form.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting form',
      error: error.message
    });
  }
};

// Publish a form
const publishForm = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const userRole = req.userRole;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user can publish this form
    if (form.createdBy.toString() !== user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only publish forms you created'
      });
    }

    form.status = 'published';
    await form.save();

    res.json({
      success: true,
      message: 'Form published successfully',
      data: form
    });
  } catch (error) {
    console.error('Error publishing form:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing form',
      error: error.message
    });
  }
};

// Get form analytics
const getFormAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const user = req.user;
    const userRole = req.userRole;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user can view analytics
    if (form.createdBy.toString() !== user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view analytics for forms you created'
      });
    }

    const analytics = await FormSubmission.getFormAnalytics(id, startDate, endDate);
    
    // Get recent submissions
    const recentSubmissions = await FormSubmission.find({ form: id })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get response breakdown by field
    const fieldAnalytics = await FormSubmission.aggregate([
      { $match: { form: mongoose.Types.ObjectId(id) } },
      { $unwind: '$responses' },
      {
        $group: {
          _id: '$responses.fieldId',
          fieldType: { $first: '$responses.fieldType' },
          totalResponses: { $sum: 1 },
          uniqueValues: { $addToSet: '$responses.value' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        form: {
          id: form._id,
          title: form.title,
          totalViews: form.analytics?.totalViews || 0,
          totalSubmissions: form.analytics?.totalSubmissions || 0,
          conversionRate: form.analytics?.conversionRate || 0
        },
        analytics,
        recentSubmissions,
        fieldAnalytics
      }
    });
  } catch (error) {
    console.error('Error fetching form analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching form analytics',
      error: error.message
    });
  }
};

// Submit a form response
const submitForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { responses, metadata } = req.body;
    const user = req.user || null;
    const isAuthenticated = !!user;
    const userRole = isAuthenticated ? getUserRole(user) : null;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if form is published
    if (form.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Form is not published'
      });
    }

    // Access control for submissions
    if (!isAuthenticated) {
      // Public submission only allowed for public forms
      if (form.visibility !== 'public') {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to submit this form'
        });
      }
    } else {
      // Authenticated users must have access
      if (!form.canAccess(user._id, userRole)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to submit this form'
        });
      }
    }

    // Check if multiple submissions are allowed (only enforce for authenticated users)
    if (isAuthenticated && !form.settings.allowMultipleSubmissions) {
      const existingSubmission = await FormSubmission.findOne({
        form: id,
        submittedBy: user._id
      });

      if (existingSubmission) {
        return res.status(400).json({
          success: false,
          message: 'Multiple submissions are not allowed for this form'
        });
      }
    }

    // Check response limit
    if (form.settings.responseLimit.enabled) {
      const submissionCount = await FormSubmission.countDocuments({ form: id });
      if (submissionCount >= form.settings.responseLimit.maxResponses) {
        return res.status(400).json({
          success: false,
          message: 'Form has reached maximum response limit'
        });
      }
    }

    // Check time limit (guard optional props)
    if (form.settings && form.settings.timeLimit && form.settings.timeLimit.enabled) {
      const now = new Date();
      if (form.settings.timeLimit.startDate && now < new Date(form.settings.timeLimit.startDate)) {
        return res.status(400).json({
          success: false,
          message: 'Form is not yet available'
        });
      }
      if (form.settings.timeLimit.endDate && now > new Date(form.settings.timeLimit.endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Form submission period has ended'
        });
      }
    }

    const submissionData = {
      form: id,
      submittedBy: isAuthenticated ? user._id : undefined,
      submittedByModel: isAuthenticated && userRole ? (userRole.charAt(0).toUpperCase() + userRole.slice(1)) : undefined,
      responses: responses || [],
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
        deviceType: 'desktop', // You can enhance this with device detection
        ...metadata
      },
      completionTime: req.body.completionTime || 0
    };

    // Normalize responses array to ensure required fields exist
    submissionData.responses = (submissionData.responses || []).map((r) => ({
      fieldId: String(r.fieldId || ''),
      fieldType: String(r.fieldType || ''),
      value: r.value !== undefined ? r.value : ''
    }));

    const submission = new FormSubmission(submissionData);
    try {
      submission.calculateSpamScore();
    } catch (e) {
      // ignore spam score calculation errors; proceed to save
    }
    await submission.save();

    // Update form analytics
    try {
      await form.incrementSubmission();
    } catch (e) {
      // do not block response on analytics update
    }

    res.json({
      success: true,
      message: form.settings.successMessage,
      data: {
        submissionId: submission._id,
        redirectUrl: form.settings.redirectUrl
      }
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting form',
      error: error.message
    });
  }
};

// Get form submissions
const getFormSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const user = req.user;
    const userRole = req.userRole;

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if user can view submissions
    if (form.createdBy.toString() !== user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view submissions for forms you created'
      });
    }

    const query = { form: id };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const submissions = await FormSubmission.find(query)
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FormSubmission.countDocuments(query);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching form submissions',
      error: error.message
    });
  }
};

// Get public form (for form filling)
const getPublicForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await Form.findById(id)
      .populate('createdBy', 'name')
      .populate('department', 'name');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }

    // Check if form is published and public
    if (form.status !== 'published' || form.visibility !== 'public') {
      return res.status(404).json({
        success: false,
        message: 'Form not available'
      });
    }

    // Increment view count
    await form.incrementView();

    res.json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error fetching public form:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching form',
      error: error.message
    });
  }
};

module.exports = {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm,
  publishForm,
  getFormAnalytics,
  submitForm,
  getFormSubmissions,
  getPublicForm
};
