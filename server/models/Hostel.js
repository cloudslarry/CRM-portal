const mongoose = require("mongoose");
const { Schema } = mongoose;

const hostelSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  warden: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  facilities: [{
    type: String,
  }],
  rooms: [{
    type: Schema.Types.ObjectId,
    ref: "Room",
  }],
}, {
  timestamps: true,
});

module.exports =
  mongoose.models.Hostel || mongoose.model("Hostel", hostelSchema);
