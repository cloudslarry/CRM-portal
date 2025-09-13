const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// Test route (you can remove this later)
router.get("/test-route", (req, res) => {
  res.send("The auth.js file is working!");
});

// ROUTE 1: Get email from Student Registration Number
// ENDPOINT: POST /api/auth/get-email-by-id
router.post("/get-email-by-id", async (req, res) => {
  const { registrationNumber } = req.body;
  try {
    const student = await Student.findOne({ registrationNumber });

    if (!student) {
      return res.status(404).json({ error: "Registration Number not found" });
    }
    res.json({ email: student.email });
  } catch (error) {
    console.error("Error fetching student email:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ROUTE 2: Reset the password
// ENDPOINT: POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  const { registrationNumber, newPassword } = req.body;
  try {
    const student = await Student.findOne({ registrationNumber });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.password = newPassword;
    await student.save();

    res.json({ success: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;