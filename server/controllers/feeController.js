const HostelFee = require("../models/HostelFee");
const Student = require("../models/Student");
const Hostel = require("../models/Hostel");

// Create fee record
exports.createFeeRecord = async (req, res, next) => {
  try {
    const { student, hostel, amount, dueDate } = req.body;

    // Check if student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check if hostel exists
    const hostelExists = await Hostel.findById(hostel);
    if (!hostelExists) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    // Check if student already has a fee record for this hostel
    const existingFee = await HostelFee.findOne({ student, hostel });
    if (existingFee) {
      return res.status(400).json({
        success: false,
        message: "Fee record already exists for this student and hostel"
      });
    }

    const newFeeRecord = new HostelFee({
      student,
      hostel,
      amount,
      dueDate: new Date(dueDate),
      status: "Unpaid",
      paymentHistory: []
    });

    await newFeeRecord.save();

    // Populate the result
    const populatedFee = await HostelFee.findById(newFeeRecord._id)
      .populate('student', 'name email registrationNumber')
      .populate('hostel', 'name location');

    res.status(201).json({
      success: true,
      message: "Fee record created successfully",
      result: populatedFee
    });
  } catch (err) {
    console.log("Error in creating fee record:", err.message);
    res.status(500).json({
      success: false,
      message: "Error creating fee record",
      error: err.message
    });
  }
};

// Get fees by student
exports.getFeesByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const fees = await HostelFee.find({ student: studentId })
      .populate('hostel', 'name location warden')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Fees retrieved successfully",
      result: fees,
      count: fees.length
    });
  } catch (err) {
    console.log("Error in getting fees by student:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching fees",
      error: err.message
    });
  }
};

// Mark fee as paid
exports.markFeePaid = async (req, res, next) => {
  try {
    const { feeId } = req.params;
    const { amount, method } = req.body;

    // Check if fee record exists
    const feeRecord = await HostelFee.findById(feeId);
    if (!feeRecord) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found"
      });
    }

    // Check if fee is already paid
    if (feeRecord.status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Fee is already marked as paid"
      });
    }

    // Add payment to history
    const paymentRecord = {
      amount: amount || feeRecord.amount,
      date: new Date(),
      method: method || "Cash"
    };

    feeRecord.paymentHistory.push(paymentRecord);
    feeRecord.status = "Paid";
    await feeRecord.save();

    // Populate the result
    const populatedFee = await HostelFee.findById(feeId)
      .populate('student', 'name email registrationNumber')
      .populate('hostel', 'name location');

    res.status(200).json({
      success: true,
      message: "Fee marked as paid successfully",
      result: populatedFee
    });
  } catch (err) {
    console.log("Error in marking fee as paid:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating fee status",
      error: err.message
    });
  }
};

// Get fee summary
exports.feeSummary = async (req, res, next) => {
  try {
    const { hostelId, studentId } = req.query;

    let matchQuery = {};
    if (hostelId) matchQuery.hostel = hostelId;
    if (studentId) matchQuery.student = studentId;

    // Get fee statistics
    const feeStats = await HostelFee.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    // Get total fees
    const totalFees = await HostelFee.countDocuments(matchQuery);
    const totalAmount = await HostelFee.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Get overdue fees
    const overdueFees = await HostelFee.find({
      ...matchQuery,
      status: "Unpaid",
      dueDate: { $lt: new Date() }
    })
      .populate('student', 'name email registrationNumber')
      .populate('hostel', 'name location');

    // Get recent payments
    const recentPayments = await HostelFee.find({
      ...matchQuery,
      status: "Paid"
    })
      .populate('student', 'name email registrationNumber')
      .populate('hostel', 'name location')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      message: "Fee summary retrieved successfully",
      result: {
        statistics: feeStats,
        totalFees,
        totalAmount: totalAmount[0]?.total || 0,
        overdueFees,
        recentPayments,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.log("Error in getting fee summary:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching fee summary",
      error: err.message
    });
  }
};

// Get all fees (for admin)
exports.getAllFees = async (req, res, next) => {
  try {
    const { status, hostel } = req.query;
    
    let matchQuery = {};
    if (status) matchQuery.status = status;
    if (hostel) matchQuery.hostel = hostel;

    const fees = await HostelFee.find(matchQuery)
      .populate('student', 'name email registrationNumber department year')
      .populate('hostel', 'name location warden')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All fees retrieved successfully",
      result: fees,
      count: fees.length
    });
  } catch (err) {
    console.log("Error in getting all fees:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching fees",
      error: err.message
    });
  }
};

// Update fee record
exports.updateFeeRecord = async (req, res, next) => {
  try {
    const { feeId } = req.params;
    const updates = req.body;

    // Check if fee record exists
    const feeRecord = await HostelFee.findById(feeId);
    if (!feeRecord) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found"
      });
    }

    // Don't allow updating status directly - use markFeePaid instead
    if (updates.status) {
      delete updates.status;
    }

    const updatedFee = await HostelFee.findByIdAndUpdate(
      feeId,
      updates,
      { new: true, runValidators: true }
    ).populate('student', 'name email registrationNumber')
     .populate('hostel', 'name location');

    res.status(200).json({
      success: true,
      message: "Fee record updated successfully",
      result: updatedFee
    });
  } catch (err) {
    console.log("Error in updating fee record:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating fee record",
      error: err.message
    });
  }
};
