const mongoose = require("mongoose");
const { Schema } = mongoose;

const attendanceSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student", // CONVENTION: Capitalized model name for reference
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject", // CONVENTION: Capitalized model name for reference
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
    // REMOVED: markedAt, totalLectures, and lecturesAttended
    // These fields were either redundant or should be calculated on-demand.
  },
  {
    // This option automatically adds `createdAt` and `updatedAt` fields.
    timestamps: true,
  }
);

// This index prevents creating duplicate attendance records for the same student,
// in the same subject, on the same day. This is a great practice.
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

// This pattern prevents recompiling the model during hot-reloading.
module.exports =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);