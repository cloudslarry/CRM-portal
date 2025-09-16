const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  message: {
    type: String,
  },
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    default: null,
  },
  fileType: {
    type: String,
    default: null,
  },
  fileSize: {
    type: Number,
    default: null,
  },
  senderName: {
    type: String,
  },
  receiverName: {
    type: String,
  },
  senderRegistrationNumber: {
    type: String,
  },
  receiverRegistrationNumber: {
    type: String,
  },
  roomId: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
    default: null,
  },
  replyTo: {
    type: String, // Message ID being replied to
    default: null,
  },
  replyMessage: {
    type: String, // The actual message being replied to
    default: null,
  },
  replySender: {
    type: String, // Name of the person who sent the original message
    default: null,
  },
  replySenderId: {
    type: String, // ID of the person who sent the original message
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.message || mongoose.model("message", messageSchema);
