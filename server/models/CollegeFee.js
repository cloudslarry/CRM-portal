const mongoose = require("mongoose");
const { Schema } = mongoose;

const collegeFeeSchema = new Schema({
	student: {
		type: Schema.Types.ObjectId,
		ref: "student",
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
	paymentHistory: [
		{
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
		},
	],
});

module.exports =
	mongoose.models.collegeFee || mongoose.model("collegeFee", collegeFeeSchema);


