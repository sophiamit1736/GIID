const express = require("express");

const router = express.Router();

const { predictForStudent } = require('../services/mlServiceClient');

const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  saveResult,
  getStudentResults,
  getAdaptiveSummary,
  getAnalytics,
  getAllResults,
  getReport,
  getCollectionSummary,
  exportCollectionCSV,
} = require("../controllers/activityResultController");

router.post(
  "/",
  verifyToken,
  saveResult
);

router.get(
  "/student/:studentId",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  getStudentResults
);

router.get(
  "/ml/:studentId",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  async (req, res) => {
    try { res.json(await predictForStudent(req.params.studentId)); }
    catch (e) { res.status(500).json({ message: e.message }); }
  }
);

router.get(
  "/adaptive/:studentId",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  getAdaptiveSummary
);

router.get(
  "/report",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  getReport
);

router.get(
  "/all",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  getAllResults
);

router.get(
  "/analytics",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  getAnalytics
);

router.get(
  "/collection-export",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  exportCollectionCSV
);

router.get(
  "/collection-summary",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  getCollectionSummary
);

module.exports = router;