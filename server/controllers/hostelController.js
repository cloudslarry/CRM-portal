const Hostel = require("../models/Hostel");
const Room = require("../models/Room");

// Create a new hostel
exports.createHostel = async (req, res, next) => {
  try {
    const { name, warden, location, capacity, description, facilities } = req.body;

    // Check if hostel with same name already exists
    const existingHostel = await Hostel.findOne({ name });
    if (existingHostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel with this name already exists"
      });
    }

    const newHostel = new Hostel({
      name,
      warden,
      location,
      capacity,
      description,
      facilities: facilities || []
    });

    await newHostel.save();

    res.status(201).json({
      success: true,
      message: "Hostel created successfully",
      result: newHostel
    });
  } catch (err) {
    console.log("Error in creating hostel:", err.message);
    res.status(500).json({
      success: false,
      message: "Error creating hostel",
      error: err.message
    });
  }
};

// Get all hostels
exports.getHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find().populate('rooms');
    
    res.status(200).json({
      success: true,
      message: "Hostels retrieved successfully",
      result: hostels,
      count: hostels.length
    });
  } catch (err) {
    console.log("Error in getting hostels:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching hostels",
      error: err.message
    });
  }
};

// Get hostel by ID
exports.getHostelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const hostel = await Hostel.findById(id).populate('rooms');
    
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Hostel retrieved successfully",
      result: hostel
    });
  } catch (err) {
    console.log("Error in getting hostel by ID:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching hostel",
      error: err.message
    });
  }
};

// Update hostel
exports.updateHostel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if hostel exists
    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    // Check if name is being updated and if it conflicts
    if (updates.name && updates.name !== hostel.name) {
      const existingHostel = await Hostel.findOne({ name: updates.name });
      if (existingHostel) {
        return res.status(400).json({
          success: false,
          message: "Hostel with this name already exists"
        });
      }
    }

    const updatedHostel = await Hostel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Hostel updated successfully",
      result: updatedHostel
    });
  } catch (err) {
    console.log("Error in updating hostel:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating hostel",
      error: err.message
    });
  }
};

// Delete hostel
exports.deleteHostel = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if hostel exists
    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found"
      });
    }

    // Check if hostel has rooms
    const rooms = await Room.find({ hostel: id });
    if (rooms.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete hostel with existing rooms. Please remove all rooms first."
      });
    }

    await Hostel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Hostel deleted successfully"
    });
  } catch (err) {
    console.log("Error in deleting hostel:", err.message);
    res.status(500).json({
      success: false,
      message: "Error deleting hostel",
      error: err.message
    });
  }
};
