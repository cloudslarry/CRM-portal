const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema({
  hostel: {
    type: Schema.Types.ObjectId,
    ref: "hostel",
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Single", "Double", "Triple", "Quad", "Dormitory"],
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  occupied: {
    type: Number,
    default: 0,
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: "student",
  }],
  status: {
    type: String,
    enum: ["Active", "Maintenance"],
    default: "Active",
  },
  description: {
    type: String,
  },
  facilities: [{
    type: String,
  }],
});

module.exports =
  mongoose.models.room || mongoose.model("room", roomSchema);
