const Room = require("../models/Room");
const Hostel = require("../models/Hostel");
const Student = require("../models/Student");

// Create a new room
exports.createRoom = async (req, res, next) => {
  try {
    const { hostel, roomNumber, type, capacity, description, facilities } = req.body;

    // Check if hostel exists
    const hostelExists = await Hostel.findById(hostel);
    if (!hostelExists) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    // Check if room number already exists in the same hostel
    const existingRoom = await Room.findOne({ hostel, roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room number already exists in this hostel"
      });
    }

    const newRoom = new Room({
      hostel,
      roomNumber,
      type,
      capacity,
      description,
      facilities: facilities || [],
      occupied: 0,
      students: [],
      status: "Active"
    });

    await newRoom.save();

    // Add room to hostel's rooms array
    await Hostel.findByIdAndUpdate(
      hostel,
      { $push: { rooms: newRoom._id } }
    );

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      result: newRoom
    });
  } catch (err) {
    console.log("Error in creating room:", err.message);
    res.status(500).json({
      success: false,
      message: "Error creating room",
      error: err.message
    });
  }
};

// Get rooms by hostel
exports.getRoomsByHostel = async (req, res, next) => {
  try {
    const { hostelId } = req.params;
    
    // Check if hostel exists
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    const rooms = await Room.find({ hostel: hostelId })
      .populate('students', 'name email registrationNumber')
      .populate('hostel', 'name');

    res.status(200).json({
      success: true,
      message: "Rooms retrieved successfully",
      result: rooms,
      count: rooms.length
    });
  } catch (err) {
    console.log("Error in getting rooms by hostel:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching rooms",
      error: err.message
    });
  }
};

// Update room
exports.updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if room exists
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // If capacity is being reduced, check if it's less than occupied
    if (updates.capacity && updates.capacity < room.occupied) {
      return res.status(400).json({
        success: false,
        message: "Cannot reduce capacity below current occupancy"
      });
    }

    // If room number is being changed, check for conflicts
    if (updates.roomNumber && updates.roomNumber !== room.roomNumber) {
      const existingRoom = await Room.findOne({ 
        hostel: room.hostel, 
        roomNumber: updates.roomNumber 
      });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: "Room number already exists in this hostel"
        });
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('students', 'name email registrationNumber');

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      result: updatedRoom
    });
  } catch (err) {
    console.log("Error in updating room:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating room",
      error: err.message
    });
  }
};

// Delete room
exports.deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if room exists
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Check if room has students
    if (room.students.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete room with assigned students. Please unassign all students first."
      });
    }

    // Remove room from hostel's rooms array
    await Hostel.findByIdAndUpdate(
      room.hostel,
      { $pull: { rooms: id } }
    );

    await Room.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully"
    });
  } catch (err) {
    console.log("Error in deleting room:", err.message);
    res.status(500).json({
      success: false,
      message: "Error deleting room",
      error: err.message
    });
  }
};

// Assign student to room
exports.assignStudentToRoom = async (req, res, next) => {
  try {
    const { roomId, studentId } = req.body;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check if student is already assigned to a room
    if (student.hostelInfo && student.hostelInfo.room) {
      return res.status(400).json({
        success: false,
        message: "Student is already assigned to a room"
      });
    }

    // Check if room has capacity
    if (room.occupied >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: "Room is at full capacity"
      });
    }

    // Check if room is active
    if (room.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Room is not available for assignment"
      });
    }

    // Assign student to room
    room.students.push(studentId);
    room.occupied += 1;
    await room.save();

    // Update student's hostel info
    student.hostelInfo = {
      hostel: room.hostel,
      room: roomId,
      bedNumber: `${room.roomNumber}-${room.occupied}`
    };
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student assigned to room successfully",
      result: {
        room: room,
        student: {
          name: student.name,
          registrationNumber: student.registrationNumber,
          bedNumber: student.hostelInfo.bedNumber
        }
      }
    });
  } catch (err) {
    console.log("Error in assigning student to room:", err.message);
    res.status(500).json({
      success: false,
      message: "Error assigning student to room",
      error: err.message
    });
  }
};

// Unassign student from room
exports.unassignStudentFromRoom = async (req, res, next) => {
  try {
    const { roomId, studentId } = req.body;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check if student is assigned to this room
    if (!room.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student is not assigned to this room"
      });
    }

    // Remove student from room
    room.students = room.students.filter(id => id.toString() !== studentId);
    room.occupied = Math.max(0, room.occupied - 1);
    await room.save();

    // Clear student's hostel info
    student.hostelInfo = undefined;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student unassigned from room successfully",
      result: {
        room: room,
        student: {
          name: student.name,
          registrationNumber: student.registrationNumber
        }
      }
    });
  } catch (err) {
    console.log("Error in unassigning student from room:", err.message);
    res.status(500).json({
      success: false,
      message: "Error unassigning student from room",
      error: err.message
    });
  }
};
