const mongoose = require("mongoose");
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "student",
    required: true
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: "subject",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  totalLectures: {
    type: Number,
    default: 0,
  },
  lecturesAttended: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true
});

// Ensure one attendance record per student/subject/date
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

module.exports =
  mongoose.models.attendance || mongoose.model("attendance", attendanceSchema);
