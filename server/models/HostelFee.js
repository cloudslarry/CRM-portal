const mongoose = require("mongoose");
const { Schema } = mongoose;

const hostelFeeSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  hostel: {
    type: Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid",
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
  }],
});

module.exports =
  mongoose.models.HostelFee || mongoose.model("HostelFee", hostelFeeSchema);
