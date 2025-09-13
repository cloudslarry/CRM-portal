const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../../middleware/authMiddleware");
const { generateHostelFeeReceipt, generateCollegeFeeReceipt } = require("../../controllers/receiptController");

// GET /api/student/receipts/fees/:id/receipt
router.get(
  "/fees/:id/receipt",
  verifyToken,
  requireRole(["student"]),
  generateHostelFeeReceipt
);

module.exports = router;
// College fee receipts
router.get(
	"/college-fees/:id/receipt",
	verifyToken,
	requireRole(["student"]),
	generateCollegeFeeReceipt
);


