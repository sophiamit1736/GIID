const express = require("express");

const router = express.Router();

const {
  verifyToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const Game = require('../models/Game');

// Learner learning level and game difficulty are different concepts.
// Normalize legacy BKT labels before they reach the Game schema.
const normalizeGameDifficulty = (value) => {
  const map = { Beginner: 'Easy', Intermediate: 'Medium', Advanced: 'Hard' };
  return map[String(value || '').trim()] || value || 'Easy';
};

const {
  generateActivity,
  generateAdaptiveActivityForStudent,
  validatePlayableGameConfig,
} = require("../services/aiActivityService");


// ==================================================================
// Generate a learning activity with AI (preview only, not saved)
// ==================================================================
router.post(
  "/generate",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  async (req, res) => {
    try {
      const {
        topic,
        age,
        level,
        difficulty,
        activityTypes,
        focus,
      } = req.body || {};

      if (!topic || !String(topic).trim()) {
        return res.status(400).json({
          message: "topic is required",
        });
      }

      const activity = await generateActivity({
        topic,
        age,
        level,
        difficulty,
        activityTypes,
        focus,
      });

      res.json(activity);
    } catch (error) {
      console.error(error);

      res.status(error.statusCode || 500).json({
        message: error.message || "Failed to generate activity",
      });
    }
  }
);


// Automatic student-aware generation. The system derives the topic/focus
// from the student's recent performance + FACP history instead of requiring
// the teacher to type "Brushing Teeth" manually.
router.post(
  "/generate-for-student",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  async (req, res) => {
    try {
      if (!req.body?.studentId) return res.status(400).json({ message: "studentId is required" });
      const activity = await generateAdaptiveActivityForStudent({
        studentId: req.body.studentId,
        requestedType: req.body.requestedType,
      });
      res.json(activity);
    } catch (error) {
      console.error("Adaptive AI generation error:", error);
      res.status(error.statusCode || 500).json({ message: error.message || "Failed to generate student-aware activity" });
    }
  }
);


// Generate and save a GAME directly into the Activities/Game collection.
router.post(
  "/generate-and-save",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  async (req, res) => {
    try {
      const { topic, age, level, difficulty, activityTypes, focus, studentId, requestedType } = req.body || {};
      if (!studentId && (!topic || !String(topic).trim())) {
        return res.status(400).json({ message: "topic is required when studentId is not supplied" });
      }
      // When a student is supplied, ALWAYS use the student-aware adaptive path.
      // This prevents a manually supplied generic topic from bypassing FACP,
      // BKT, learning-level and recent-game constraints.
      const activity = studentId
        ? await generateAdaptiveActivityForStudent({ studentId, requestedType: requestedType || activityTypes?.[0] })
        : await generateActivity({ topic, age, level, difficulty, activityTypes, focus });
      validatePlayableGameConfig(activity.gameConfig, activity.activityType);
      const game = await Game.create({
        gameId: `game-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: activity.title,
        description: activity.description,
        category: activity.category || 'Adaptive Game',
        skill: activity.skill,
        facpDomain: activity.facpDomain || '',
        facpItemCodes: activity.facpItemCodes || [],
        targetLearningModuleId: activity.targetLearningModuleId || '',
        targetLearningModuleTitle: activity.targetLearningModuleTitle || '',
        targetLearningModuleFacpItemCodes: activity.targetLearningModuleFacpItemCodes || [],
        targetLearningModuleFacpLevels: activity.targetLearningModuleFacpLevels || [],
        facpFunctionalLevel: activity.facpFunctionalLevel || '',
        generatedForStudent: studentId || null,
        learnerLearningLevel: activity.learnerLearningLevel || level || 'Not Assessed',
        difficulty: normalizeGameDifficulty(activity.difficulty || difficulty),
        estimatedMastery: activity.estimatedMastery ?? null,
        generationReason: activity.generationReason || '',
        activityType: activity.activityType,
        duration: activity.duration,
        ageGroups: activity.ageGroups || [],
        objectives: activity.objectives || [],
        gameConfig: activity.gameConfig,
        adaptations: activity.adaptations || [],
        ragSources: activity.ragSources || [],
        generationSource: activity.generationSource || 'groq-rag',
        generatedBy: activity.generatedBy || 'Groq',
        generationVersion: 'facp-module-level-v4',
        generationNonce: activity.generationNonce || '',
        coverEmoji: activity.coverEmoji || '🎮',
      });
      res.status(201).json(game);
    } catch (error) {
      console.error('AI generate-and-save game error:', error);
      res.status(error.statusCode || 500).json({ message: error.message || 'Failed to generate and save game' });
    }
  }
);


// Approve/save a generated GAME. Games are deliberately stored separately from
// LearningModule records. A game can target a learning module without becoming
// the learning module itself.
router.post(
  "/approve",
  verifyToken,
  authorizeRoles("admin", "teacher"),
  async (req, res) => {
    try {
      const body = req.body || {};
      if (!body.title || !body.skill || !body.gameConfig) {
        return res.status(400).json({ message: "title, skill and gameConfig are required." });
      }

      const allowed = ["visual-sequence", "matching", "choice", "drag-sort", "memory"];
      const activityType = allowed.includes(body.activityType) ? body.activityType : String(body.gameConfig?.type || "");
      if (!allowed.includes(activityType)) return res.status(400).json({ message: "Unsupported game type." });
      validatePlayableGameConfig(body.gameConfig, activityType);

      const gameId = `game-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const game = await Game.create({
        gameId,
        title: String(body.title).trim(),
        description: body.description || "",
        category: body.category || "Adaptive Game",
        skill: body.skill,
        facpDomain: body.facpDomain || "",
        facpItemCodes: Array.isArray(body.facpItemCodes) ? body.facpItemCodes.map(String).filter(Boolean) : [],
        targetLearningModuleId: body.targetLearningModuleId || "",
        targetLearningModuleTitle: body.targetLearningModuleTitle || "",
        generatedForStudent: body.generatedForStudent || null,
        targetLearningModuleFacpItemCodes: body.targetLearningModuleFacpItemCodes || [],
        targetLearningModuleFacpLevels: body.targetLearningModuleFacpLevels || [],
        facpFunctionalLevel: body.facpFunctionalLevel || '',
        learnerLearningLevel: body.learnerLearningLevel || body.level || "Not Assessed",
        difficulty: normalizeGameDifficulty(body.difficulty),
        estimatedMastery: body.estimatedMastery == null ? null : Number(body.estimatedMastery),
        generationReason: body.generationReason || body.recommendationContext?.reason || "",
        activityType,
        duration: Number(body.duration || 10),
        ageGroups: Array.isArray(body.ageGroups) ? body.ageGroups.map(String) : [],
        objectives: Array.isArray(body.objectives) ? body.objectives.map(String) : [],
        gameConfig: { ...body.gameConfig, type: activityType },
        adaptations: Array.isArray(body.adaptations) ? body.adaptations.map(String) : [],
        ragSources: Array.isArray(body.ragSources) ? body.ragSources : [],
        generationSource: body.generationSource || "groq-rag",
        generatedBy: body.generatedBy || "Groq",
        generationVersion: "facp-module-level-v4",
        generationNonce: body.generationNonce || "",
        coverEmoji: body.coverEmoji || "🎮",
        status: "Active",
      });
      res.status(201).json(game);
    } catch (error) {
      console.error("AI game approval error:", error);
      res.status(400).json({ message: error.message || "Unable to save generated game." });
    }
  }
);

module.exports = router;
