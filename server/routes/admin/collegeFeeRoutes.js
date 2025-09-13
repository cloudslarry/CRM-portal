const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../../middleware/authMiddleware");
const {
	createCollegeFee,
	getAllCollegeFees,
	updateCollegeFee,
	markCollegeFeePaid,
} = require("../../controllers/collegeFeeController");

router.use(verifyToken, requireRole(["admin"]));

router.get("/fees", getAllCollegeFees);
router.post("/fees", createCollegeFee);
router.put("/fees/:id", updateCollegeFee);
router.patch("/fees/:id/pay", markCollegeFeePaid);

module.exports = router;


