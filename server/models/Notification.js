const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'attendance', 'marks', 'announcement'],
    default: 'info',
  },
  recipient: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  recipientType: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedEntity: {
    type: Schema.Types.ObjectId,
    refPath: 'relatedEntityType'
  },
  relatedEntityType: {
    type: String,
    enum: ['subject', 'attendance', 'marks', 'message']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
  },
});

module.exports = mongoose.models.notification || mongoose.model("notification", notificationSchema);
