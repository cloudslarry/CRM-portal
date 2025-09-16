const PDFDocument = require("pdfkit");
const HostelFee = require("../models/HostelFee");
const CollegeFee = require("../models/CollegeFee");
const Student = require("../models/Student");
const Hostel = require("../models/Hostel");
const Room = require("../models/Room");

// Generate Hostel Fee Receipt PDF
// GET /api/student/receipts/fees/:id/receipt
exports.generateHostelFeeReceipt = async (req, res) => {
  try {
    const feeId = req.params.id;
    const authUser = req.user;

    if (!feeId) {
      return res.status(400).json({ success: false, message: "Missing fee id" });
    }

    // Fetch fee and ensure it belongs to the logged-in student
    const fee = await HostelFee.findById(feeId)
      .populate("hostel")
      .populate("student");

    if (!fee) {
      return res.status(404).json({ success: false, message: "Fee record not found" });
    }

    // Ensure only the owner student can download
    if (!authUser || String(fee.student._id) !== String(authUser._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Optional: Only allow receipt for paid fees
    // If you want to allow unpaid receipts, remove this block
    if (fee.status !== "Paid") {
      return res.status(400).json({ success: false, message: "Receipt available only after payment" });
    }

    const student = fee.student || (await Student.findById(fee.student));
    const hostel = fee.hostel || (await Hostel.findById(fee.hostel));

    // Find student's room in the hostel
    const room = await Room.findOne({ hostel: hostel._id, students: student._id });

    // Prepare PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `hostel-receipt-${fee._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

    // Pipe the PDF to response
    doc.pipe(res);

    // Header / Branding
    doc
      .fontSize(20)
      .text("Smart ERP", { align: "left" })
      .moveDown(0.2)
      .fontSize(12)
      .fillColor("#555555")
      .text("Student Hostel Fee Receipt", { align: "left" })
      .moveDown(1)
      .fillColor("#000000");

    // Receipt meta
    const issuedOn = new Date();
    doc
      .fontSize(10)
      .text(`Receipt ID: ${fee._id}`)
      .text(`Date of Issue: ${issuedOn.toLocaleString()}`)
      .moveDown(1);

    // Student info
    doc
      .fontSize(12)
      .text("Student Details", { underline: true })
      .moveDown(0.4)
      .fontSize(10)
      .text(`Name: ${student.name}`)
      .text(`Registration No.: ${student.registrationNumber}`)
      .text(`Department / Year / Section: ${student.department} / ${student.year} / ${student.section}`)
      .moveDown(1);

    // Hostel/Room info
    doc
      .fontSize(12)
      .text("Accommodation Details", { underline: true })
      .moveDown(0.4)
      .fontSize(10)
      .text(`Hostel: ${hostel.name}`)
      .text(`Room Number: ${room ? room.roomNumber : "N/A"}`)
      .text(`Room Type: ${room ? room.type : "N/A"}`)
      .moveDown(0.4);

    if (hostel.facilities && hostel.facilities.length > 0) {
      doc.text(`Facilities: ${hostel.facilities.join(", ")}`);
    }

    doc.moveDown(1);

    // Fee info
    doc
      .fontSize(12)
      .text("Fee Details", { underline: true })
      .moveDown(0.4)
      .fontSize(10)
      .text(`Amount: ₹${fee.amount}`)
      .text(`Due Date: ${new Date(fee.dueDate).toLocaleDateString()}`)
      .text(`Status: ${fee.status}`)
      .moveDown(0.6);

    // Payment history
    doc.fontSize(12).text("Payment History", { underline: true }).moveDown(0.4);
    doc.fontSize(10);
    if (fee.paymentHistory && fee.paymentHistory.length > 0) {
      fee.paymentHistory.forEach((p, idx) => {
        doc.text(
          `${idx + 1}. ₹${p.amount} | ${new Date(p.date).toLocaleString()} | ${p.method}`
        );
      });
    } else {
      doc.text("No payment records found.");
    }

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(
        "This is a system-generated receipt and does not require a physical signature.",
        { align: "center" }
      );

    doc.end();
  } catch (err) {
    console.log("Error generating receipt:", err.message);
    return res.status(500).json({ success: false, message: "Failed to generate receipt" });
  }
};

// Generate College Fee Receipt PDF
// GET /api/student/receipts/college-fees/:id/receipt
exports.generateCollegeFeeReceipt = async (req, res) => {
  try {
    const feeId = req.params.id;
    const authUser = req.user;

    if (!feeId) {
      return res.status(400).json({ success: false, message: "Missing fee id" });
    }

    const fee = await CollegeFee.findById(feeId).populate("student");
    if (!fee) {
      return res.status(404).json({ success: false, message: "Fee record not found" });
    }

    if (!authUser || String(fee.student._id) !== String(authUser._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (fee.status !== "Paid") {
      return res.status(400).json({ success: false, message: "Receipt available only after payment" });
    }

    const student = fee.student || (await Student.findById(fee.student));

    const doc = new PDFDocument({ margin: 50 });
    const filename = `college-receipt-${fee._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);

    doc.pipe(res);

    doc
      .fontSize(20)
      .text("Smart ERP", { align: "left" })
      .moveDown(0.2)
      .fontSize(12)
      .fillColor("#555555")
      .text("Student College Fee Receipt", { align: "left" })
      .moveDown(1)
      .fillColor("#000000");

    const issuedOn = new Date();
    doc
      .fontSize(10)
      .text(`Receipt ID: ${fee._id}`)
      .text(`Date of Issue: ${issuedOn.toLocaleString()}`)
      .moveDown(1);

    doc
      .fontSize(12)
      .text("Student Details", { underline: true })
      .moveDown(0.4)
      .fontSize(10)
      .text(`Name: ${student.name}`)
      .text(`Registration No.: ${student.registrationNumber}`)
      .text(`Email: ${student.email}`)
      .moveDown(1);

    doc
      .fontSize(12)
      .text("Fee Details", { underline: true })
      .moveDown(0.4)
      .fontSize(10)
      .text(`Amount: ₹${fee.amount}`)
      .text(`Due Date: ${new Date(fee.dueDate).toLocaleDateString()}`)
      .text(`Status: ${fee.status}`)
      .moveDown(0.6);

    doc.fontSize(12).text("Payment History", { underline: true }).moveDown(0.4);
    doc.fontSize(10);
    if (fee.paymentHistory && fee.paymentHistory.length > 0) {
      fee.paymentHistory.forEach((p, idx) => {
        doc.text(`${idx + 1}. ₹${p.amount} | ${new Date(p.date).toLocaleString()} | ${p.method}`);
      });
    } else {
      doc.text("No payment records found.");
    }

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(
        "This is a system-generated receipt and does not require a physical signature.",
        { align: "center" }
      );

    doc.end();
  } catch (err) {
    console.log("Error generating receipt:", err.message);
    return res.status(500).json({ success: false, message: "Failed to generate receipt" });
  }
};

