const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { getTemplate, getStudentAssessments, getStudentSummary, saveAssessment, finalizeBaseline } = require("../controllers/facpController");

router.get("/template", verifyToken, authorizeRoles("admin", "teacher"), getTemplate);
router.get("/student/:studentId", verifyToken, authorizeRoles("admin", "teacher"), getStudentAssessments);
router.get("/summary/:studentId", verifyToken, authorizeRoles("admin", "teacher"), getStudentSummary);
router.post("/assessments", verifyToken, authorizeRoles("admin", "teacher"), saveAssessment);
router.post("/baseline/:studentId/finalize", verifyToken, authorizeRoles("admin", "teacher"), finalizeBaseline);

module.exports = router;
