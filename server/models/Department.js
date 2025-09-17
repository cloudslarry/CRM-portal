const mongoose = require("mongoose");
const { Schema } = mongoose;

const departmentSchema = new Schema({
  // Basic Information
  shortForm: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  fullForm: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Department Classification
  category: {
    type: String,
    required: true,
    enum: ['Engineering', 'Management', 'Arts', 'Science', 'Medical', 'Law', 'Other'],
    default: 'Engineering'
  },
  
  // Academic Information
  degreeTypes: [{
    type: String,
    enum: ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate']
  }],
  
  // Status and Access Control
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Access Control
  allowedRoles: [{
    type: String,
    enum: ['admin', 'faculty', 'student', 'applicant']
  }],
  
  // Academic Structure
  years: [{
    type: Number,
    min: 1,
    max: 8
  }],
  sections: [{
    type: String,
    trim: true
  }],
  
  // Additional Information
  headOfDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  
  // Statistics
  totalStudents: {
    type: Number,
    default: 0
  },
  totalFaculty: {
    type: Number,
    default: 0
  },
  
  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Timestamps
  establishedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
departmentSchema.index({ shortForm: 1 });
departmentSchema.index({ fullForm: 1 });
departmentSchema.index({ category: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ allowedRoles: 1 });

// Virtual for display name
departmentSchema.virtual('displayName').get(function() {
  return `${this.shortForm} - ${this.fullForm}`;
});

// Virtual for URL-friendly slug
departmentSchema.virtual('slug').get(function() {
  return this.shortForm.toLowerCase().replace(/[^a-z0-9]/g, '-');
});

// Pre-save middleware to update lastModifiedBy
departmentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.createdBy; // In real app, get from req.user
  }
  next();
});

// Static method to find active departments
departmentSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ fullForm: 1 });
};

// Static method to find departments by category
departmentSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ fullForm: 1 });
};

// Static method to find departments by role
departmentSchema.statics.findByRole = function(role) {
  return this.find({ 
    allowedRoles: role, 
    isActive: true 
  }).sort({ fullForm: 1 });
};

// Instance method to check if user can access
departmentSchema.methods.canAccess = function(userRole) {
  return this.allowedRoles.includes(userRole) && this.isActive;
};

// Instance method to get department statistics
departmentSchema.methods.getStats = async function() {
  const Student = mongoose.model('Student');
  const Faculty = mongoose.model('Faculty');
  
  const [studentCount, facultyCount] = await Promise.all([
    Student.countDocuments({ department: this.fullForm }),
    Faculty.countDocuments({ department: this.fullForm })
  ]);
  
  this.totalStudents = studentCount;
  this.totalFaculty = facultyCount;
  
  return {
    totalStudents: studentCount,
    totalFaculty: facultyCount
  };
};

module.exports = mongoose.models.Department || mongoose.model("Department", departmentSchema);