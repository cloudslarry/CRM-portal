const mongoose = require("mongoose");
const { Schema } = mongoose;

const hostelNoticeSchema = new Schema({
  hostel: {
    type: Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  attachments: [{
    url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

module.exports =
  mongoose.models.HostelNotice || mongoose.model("HostelNotice", hostelNoticeSchema);
