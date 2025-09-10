const mongoose = require("mongoose");
const { Schema } = mongoose;

const admissionApplicationSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "student",
      required: false,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "applicant",
      required: false,
    },
    admid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
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
    studentMobileNumber: {
      type: String,
    },
    fatherName: {
      type: String,
    },
    fatherMobileNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminReviewer: {
      type: Schema.Types.ObjectId,
      ref: "admin",
    },
    reviewNote: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.admissionApplication ||
  mongoose.model("admissionApplication", admissionApplicationSchema);


