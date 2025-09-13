const CollegeFee = require("../models/CollegeFee");
const Student = require("../models/Student");

// Admin: Create college fee record
exports.createCollegeFee = async (req, res) => {
	try {
		const { student, amount, dueDate } = req.body;
		const studentExists = await Student.findById(student);
		if (!studentExists) {
			return res.status(404).json({ success: false, message: "Student not found" });
		}

		const parsedAmount = Number(amount);
		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
			return res.status(400).json({ success: false, message: "Amount must be a positive number" });
		}

		const parsedDue = new Date(dueDate);
		if (Number.isNaN(parsedDue.getTime())) {
			return res.status(400).json({ success: false, message: "Invalid due date" });
		}

		const newFee = new CollegeFee({ student, amount: parsedAmount, dueDate: parsedDue, status: "Unpaid", paymentHistory: [] });
		await newFee.save();
		const populated = await CollegeFee.findById(newFee._id).populate("student", "name email registrationNumber");
		return res.status(201).json({ success: true, message: "College fee created", result: populated });
	} catch (err) {
		console.log("Create college fee error:", err.message);
		return res.status(500).json({ success: false, message: "Error creating college fee", error: err.message });
	}
};

// Admin: List all college fees
exports.getAllCollegeFees = async (req, res) => {
	try {
		const fees = await CollegeFee.find({}).populate("student", "name email registrationNumber");
		return res.json({ success: true, result: fees });
	} catch (err) {
		return res.status(500).json({ success: false, message: "Failed to fetch college fees" });
	}
};

// Admin: Update college fee
exports.updateCollegeFee = async (req, res) => {
	try {
		const { id } = req.params;
		const update = req.body;
		const updated = await CollegeFee.findByIdAndUpdate(id, update, { new: true }).populate("student", "name email registrationNumber");
		if (!updated) return res.status(404).json({ success: false, message: "Fee not found" });
		return res.json({ success: true, result: updated });
	} catch (err) {
		return res.status(500).json({ success: false, message: "Failed to update fee" });
	}
};

// Admin: Mark college fee paid
exports.markCollegeFeePaid = async (req, res) => {
	try {
		const { id } = req.params;
		const { amount, method } = req.body;
		const fee = await CollegeFee.findById(id);
		if (!fee) return res.status(404).json({ success: false, message: "Fee not found" });
		fee.paymentHistory.push({ amount, method, date: new Date() });
		fee.status = "Paid";
		await fee.save();
		const populated = await CollegeFee.findById(id).populate("student", "name email registrationNumber");
		return res.json({ success: true, message: "Marked as paid", result: populated });
	} catch (err) {
		return res.status(500).json({ success: false, message: "Failed to mark paid" });
	}
};

// Student: My college fees
exports.getMyCollegeFees = async (req, res) => {
	try {
		const studentId = req.user?._id;
		const fees = await CollegeFee.find({ student: studentId });
		return res.json({ success: true, result: fees });
	} catch (err) {
		return res.status(500).json({ success: false, message: "Failed to fetch my college fees" });
	}
};


