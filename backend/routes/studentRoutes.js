const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  updateLearningLevel,
  deleteStudent,
} = require("../controllers/studentController");

const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/* ==========================================
   ADMIN ONLY - Add Student
========================================== */
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  upload.single("photo"),
  createStudent
);

/* ==========================================
   ADMIN + TEACHER - View All Students
========================================== */
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  getStudents
);

/* ==========================================
   ADMIN + TEACHER - View Single Student
========================================== */
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  getStudent
);

/* ==========================================
   ADMIN + TEACHER - Update Student
========================================== */
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  upload.single("photo"),
  updateStudent
);

/* ==========================================
   ADMIN + TEACHER - Update LearnAble Learning Level
========================================== */
router.patch(
  "/:id/learning-level",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  updateLearningLevel
);

/* ==========================================
   ADMIN ONLY - Delete Student
========================================== */
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteStudent
);

module.exports = router;