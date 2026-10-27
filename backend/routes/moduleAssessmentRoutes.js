const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getAssessment, submitAssessment } = require("../controllers/moduleAssessmentController");
router.get("/:moduleId", verifyToken, getAssessment);
router.post("/submit", verifyToken, submitAssessment);
module.exports = router;
