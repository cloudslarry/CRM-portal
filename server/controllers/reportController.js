const mongoose = require("mongoose");
const Hostel = require("../models/Hostel");
const Room = require("../models/Room");
const Student = require("../models/Student");
const HostelFee = require("../models/HostelFee");
const HostelNotice = require("../models/HostelNotice");

// Occupancy report
exports.occupancyReport = async (req, res, next) => {
  try {
    const { hostelId } = req.query;

    let matchQuery = {};
    if (hostelId) matchQuery.hostel = hostelId;

    // Get hostel-wise occupancy
    const hostelOccupancy = await Hostel.aggregate([
      { $match: hostelId ? { _id: mongoose.Types.ObjectId(hostelId) } : {} },
      {
        $lookup: {
          from: "rooms",
          localField: "_id",
          foreignField: "hostel",
          as: "rooms"
        }
      },
      {
        $project: {
          name: 1,
          location: 1,
          warden: 1,
          capacity: 1,
          totalRooms: { $size: "$rooms" },
          totalOccupied: {
            $sum: "$rooms.occupied"
          },
          totalCapacity: {
            $sum: "$rooms.capacity"
          },
          occupancyRate: {
            $cond: [
              { $gt: [{ $sum: "$rooms.capacity" }, 0] },
              {
                $multiply: [
                  { $divide: [{ $sum: "$rooms.occupied" }, { $sum: "$rooms.capacity" }] },
                  100
                ]
              },
              0
            ]
          }
        }
      }
    ]);

    // Get room-wise occupancy
    const roomOccupancy = await Room.find(matchQuery)
      .populate('hostel', 'name location')
      .populate('students', 'name registrationNumber department year')
      .sort({ hostel: 1, roomNumber: 1 });

    // Get room type statistics
    const roomTypeStats = await Room.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$type",
          totalRooms: { $sum: 1 },
          totalCapacity: { $sum: "$capacity" },
          totalOccupied: { $sum: "$occupied" },
          avgOccupancy: { $avg: { $divide: ["$occupied", "$capacity"] } }
        }
      }
    ]);

    // Get department-wise occupancy
    const departmentOccupancy = await Student.aggregate([
      { $match: { "hostelInfo.hostel": { $exists: true } } },
      {
        $lookup: {
          from: "rooms",
          localField: "hostelInfo.room",
          foreignField: "_id",
          as: "room"
        }
      },
      { $unwind: "$room" },
      {
        $lookup: {
          from: "hostels",
          localField: "room.hostel",
          foreignField: "_id",
          as: "hostel"
        }
      },
      { $unwind: "$hostel" },
      {
        $match: hostelId ? { "hostel._id": mongoose.Types.ObjectId(hostelId) } : {}
      },
      {
        $group: {
          _id: "$department",
          studentCount: { $sum: 1 },
          hostels: { $addToSet: "$hostel.name" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Occupancy report generated successfully",
      result: {
        hostelOccupancy,
        roomOccupancy,
        roomTypeStats,
        departmentOccupancy,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.log("Error in generating occupancy report:", err.message);
    res.status(500).json({
      success: false,
      message: "Error generating occupancy report",
      error: err.message
    });
  }
};

// Fee report
exports.feeReport = async (req, res, next) => {
  try {
    const { hostelId, startDate, endDate } = req.query;

    let matchQuery = {};
    if (hostelId) matchQuery.hostel = hostelId;
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    // Get fee statistics
    const feeStats = await HostelFee.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" }
        }
      }
    ]);

    // Get hostel-wise fee collection
    const hostelFeeCollection = await HostelFee.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "hostels",
          localField: "hostel",
          foreignField: "_id",
          as: "hostel"
        }
      },
      { $unwind: "$hostel" },
      {
        $group: {
          _id: "$hostel._id",
          hostelName: { $first: "$hostel.name" },
          totalFees: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          paidFees: {
            $sum: { $cond: [{ $eq: ["$status", "Paid"] }, 1, 0] }
          },
          unpaidFees: {
            $sum: { $cond: [{ $eq: ["$status", "Unpaid"] }, 1, 0] }
          },
          paidAmount: {
            $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] }
          },
          unpaidAmount: {
            $sum: { $cond: [{ $eq: ["$status", "Unpaid"] }, "$amount", 0] }
          }
        }
      }
    ]);

    // Get monthly fee collection trend
    const monthlyTrend = await HostelFee.aggregate([
      { $match: { status: "Paid", ...matchQuery } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get overdue fees
    const overdueFees = await HostelFee.find({
      ...matchQuery,
      status: "Unpaid",
      dueDate: { $lt: new Date() }
    })
      .populate('student', 'name email registrationNumber department')
      .populate('hostel', 'name location')
      .sort({ dueDate: 1 });

    // Get payment method statistics
    const paymentMethodStats = await HostelFee.aggregate([
      { $match: { status: "Paid", ...matchQuery } },
      { $unwind: "$paymentHistory" },
      {
        $group: {
          _id: "$paymentHistory.method",
          count: { $sum: 1 },
          totalAmount: { $sum: "$paymentHistory.amount" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Fee report generated successfully",
      result: {
        feeStats,
        hostelFeeCollection,
        monthlyTrend,
        overdueFees,
        paymentMethodStats,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.log("Error in generating fee report:", err.message);
    res.status(500).json({
      success: false,
      message: "Error generating fee report",
      error: err.message
    });
  }
};

// Comprehensive hostel management report
exports.comprehensiveReport = async (req, res, next) => {
  try {
    const { hostelId } = req.query;

    // Get basic hostel information
    const hostels = await Hostel.find(hostelId ? { _id: hostelId } : {})
      .populate('rooms');

    // Get total statistics
    const totalStats = await Promise.all([
      Hostel.countDocuments(hostelId ? { _id: hostelId } : {}),
      Room.countDocuments(hostelId ? { hostel: hostelId } : {}),
      Student.countDocuments({ "hostelInfo.hostel": { $exists: true } }),
      HostelFee.countDocuments(hostelId ? { hostel: hostelId } : {}),
      HostelNotice.countDocuments(hostelId ? { hostel: hostelId } : {})
    ]);

    // Get occupancy summary
    const occupancySummary = await Room.aggregate([
      { $match: hostelId ? { hostel: mongoose.Types.ObjectId(hostelId) } : {} },
      {
        $group: {
          _id: null,
          totalRooms: { $sum: 1 },
          totalCapacity: { $sum: "$capacity" },
          totalOccupied: { $sum: "$occupied" },
          avgOccupancyRate: { $avg: { $divide: ["$occupied", "$capacity"] } }
        }
      }
    ]);

    // Get fee summary
    const feeSummary = await HostelFee.aggregate([
      { $match: hostelId ? { hostel: mongoose.Types.ObjectId(hostelId) } : {} },
      {
        $group: {
          _id: null,
          totalFees: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          paidFees: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, 1, 0] } },
          unpaidFees: { $sum: { $cond: [{ $eq: ["$status", "Unpaid"] }, 1, 0] } },
          paidAmount: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] } },
          unpaidAmount: { $sum: { $cond: [{ $eq: ["$status", "Unpaid"] }, "$amount", 0] } }
        }
      }
    ]);

    // Get recent activities
    const recentActivities = await Promise.all([
      HostelNotice.find(hostelId ? { hostel: hostelId } : {})
        .populate('hostel', 'name')
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      HostelFee.find(hostelId ? { hostel: hostelId } : {})
        .populate('student', 'name registrationNumber')
        .populate('hostel', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      success: true,
      message: "Comprehensive report generated successfully",
      result: {
        hostels,
        statistics: {
          totalHostels: totalStats[0],
          totalRooms: totalStats[1],
          totalStudents: totalStats[2],
          totalFees: totalStats[3],
          totalNotices: totalStats[4]
        },
        occupancySummary: occupancySummary[0] || {},
        feeSummary: feeSummary[0] || {},
        recentActivities: {
          notices: recentActivities[0],
          fees: recentActivities[1]
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.log("Error in generating comprehensive report:", err.message);
    res.status(500).json({
      success: false,
      message: "Error generating comprehensive report",
      error: err.message
    });
  }
};
