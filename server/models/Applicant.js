const mongoose = require("mongoose");
const { Schema } = mongoose;

const applicantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  motherName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  category: {
    type: String,
    enum: ["General", "OBC", "SC", "ST", "EWS"],
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  previousQualification: {
    type: String,
    required: true,
  },
  previousMarks: {
    type: Number,
    required: true,
  },
  previousSchool: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Under Review"],
    default: "Pending",
  },
  applicationId: {
    type: String,
    unique: true,
  },
  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
}, {
  timestamps: true
});

// Generate application ID before saving
applicantSchema.pre('save', async function(next) {
  if (!this.applicationId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('applicant').countDocuments();
    this.applicationId = `APP${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.models.applicant || mongoose.model("applicant", applicantSchema);
