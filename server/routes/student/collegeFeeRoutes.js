const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../../middleware/authMiddleware");
const { getMyCollegeFees } = require("../../controllers/collegeFeeController");

router.use(verifyToken, requireRole(["student"]));

router.get("/fees/my-fees", getMyCollegeFees);

module.exports = router;


