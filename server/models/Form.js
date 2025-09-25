const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'email', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date', 'time', 'file', 'rating', 'signature']
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    label: String,
    value: String
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    message: String
  },
  properties: {
    multiple: Boolean,
    rows: Number,
    cols: Number,
    accept: String, // for file inputs
    min: Number,
    max: Number,
    step: Number
  },
  styling: {
    width: {
      type: String,
      default: '100%'
    },
    height: String,
    fontSize: String,
    color: String,
    backgroundColor: String
  },
  conditionalLogic: {
    showIf: [{
      fieldId: String,
      operator: String, // equals, not_equals, contains, etc.
      value: mongoose.Schema.Types.Mixed
    }]
  }
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  fields: [formFieldSchema],
  settings: {
    allowMultipleSubmissions: {
      type: Boolean,
      default: true
    },
    requireAuthentication: {
      type: Boolean,
      default: false
    },
    collectEmail: {
      type: Boolean,
      default: false
    },
    showProgressBar: {
      type: Boolean,
      default: true
    },
    submitButtonText: {
      type: String,
      default: 'Submit'
    },
    successMessage: {
      type: String,
      default: 'Thank you for your submission!'
    },
    redirectUrl: String,
    emailNotifications: {
      enabled: Boolean,
      recipients: [String]
    },
    spamProtection: {
      enabled: {
        type: Boolean,
        default: true
      },
      captcha: {
        type: Boolean,
        default: false
      }
    },
    responseLimit: {
      enabled: Boolean,
      maxResponses: Number
    },
    timeLimit: {
      enabled: Boolean,
      startDate: Date,
      endDate: Date
    }
  },
  styling: {
    theme: {
      type: String,
      default: 'default',
      enum: ['default', 'modern', 'minimal', 'colorful', 'dark']
    },
    primaryColor: {
      type: String,
      default: '#1976d2'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    fontFamily: {
      type: String,
      default: 'Inter, sans-serif'
    },
    borderRadius: {
      type: String,
      default: '8px'
    },
    customCSS: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'private'
  },
  accessControl: {
    allowedRoles: [{
      type: String,
      enum: ['admin', 'faculty', 'student', 'applicant']
    }],
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    password: String
  },
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'createdByModel'
  },
  createdByModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Faculty']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  tags: [String],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateCategory: String
}, {
  timestamps: true
});

// Indexes for better performance
formSchema.index({ createdBy: 1, status: 1 });
formSchema.index({ department: 1, status: 1 });
formSchema.index({ tags: 1 });
formSchema.index({ isTemplate: 1, templateCategory: 1 });

// Virtual for form URL
formSchema.virtual('formUrl').get(function() {
  return `/forms/${this._id}`;
});

// Method to check if user can access form
formSchema.methods.canAccess = function(user, userRole) {
  try {
    if (this.visibility === 'public') return true;
    if (!user) return false;
    if (this.visibility === 'private' && this.createdBy && this.createdBy.toString() === user.toString()) return true;
    if (this.visibility === 'restricted') {
      const roles = (this.accessControl && Array.isArray(this.accessControl.allowedRoles)) ? this.accessControl.allowedRoles : [];
      const users = (this.accessControl && Array.isArray(this.accessControl.allowedUsers)) ? this.accessControl.allowedUsers : [];
      if (userRole && roles.includes(userRole)) return true;
      if (users.some(id => id && id.toString() === user.toString())) return true;
    }
  } catch (e) {
    return false;
  }
  return false;
};

// Method to increment view count
formSchema.methods.incrementView = function() {
  this.analytics.totalViews += 1;
  return this.save();
};

// Method to increment submission count
formSchema.methods.incrementSubmission = function() {
  this.analytics.totalSubmissions += 1;
  if (this.analytics.totalViews && this.analytics.totalViews > 0) {
    this.analytics.conversionRate = (this.analytics.totalSubmissions / this.analytics.totalViews) * 100;
  } else {
    this.analytics.conversionRate = 0;
  }
  return this.save();
};

module.exports = mongoose.model('Form', formSchema);


