const express = require("express");

const router = express.Router();

const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
} = require("../controllers/learningModuleController");


// Get all modules
router.get(
  "/",
  verifyToken,
  getModules
);


// Get one module
router.get(
  "/:moduleId",
  verifyToken,
  getModule
);


// Create module
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  createModule
);


// Update module
router.put(
  "/:moduleId",
  verifyToken,
  authorizeRoles("admin"),
  updateModule
);

router.delete(
  "/:moduleId",
  verifyToken,
  authorizeRoles("admin"),
  deleteModule
);


module.exports = router;