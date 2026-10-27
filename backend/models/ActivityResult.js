const mongoose = require("mongoose");

const activityResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Data-collection metadata. These fields make the prototype ready for
    // institute deployment and keep demo/test records distinguishable from
    // future real student observations.
    sessionId: {
      type: String,
      default: "",
      index: true,
      trim: true,
    },

    dataSource: {
      type: String,
      enum: ["prototype", "institute", "demo"],
      default: "prototype",
      index: true,
    },

    isDemoData: {
      type: Boolean,
      default: false,
      index: true,
    },

    gameId: { type: String, default: "", index: true, trim: true },

    activityName: {
      type: String,
      required: true,
    },

    moduleId: {
      type: String,
      default: "",
      index: true,
    },

    domain: {
      type: String,
      default: "General",
      index: true,
    },

    level: {
      type: String,
      default: "Level 1",
    },

    totalQuestions: {
      type: Number,
      default: 5,
    },

    correctAnswers: {
      type: Number,
      default: 0,
    },

    wrongAnswers: {
      type: Number,
      default: 0,
    },

    score: {
      type: Number,
      default: 0,
    },

    accuracy: {
      type: Number,
      default: 0,
    },

    timeTaken: {
      type: Number,
      default: 0,
      min: 0,
    },

    timeLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    attempts: {
      type: Number,
      default: 1,
    },

    helpRequests: {
      type: Number,
      default: 0,
    },

    // ML performance features collected from every game.
    gameType: {
      type: String,
      default: "module",
      index: true,
    },

    // Evidence source used for adaptive learning. This distinguishes lesson
    // completion, structured module assessment, and adaptive games.
    evidenceType: {
      type: String,
      enum: ["lesson", "module-assessment", "game", "practice"],
      default: "lesson",
      index: true,
    },

    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    efficiencyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    performanceIndex: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Snapshot of the learner's FACP level at the time of this activity.
    facpScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // FACP checklist items targeted by this activity. This lets BKT track
    // mastery at skill/item level when the mapping is available.
    facpItemCodes: {
      type: [String],
      default: [],
      index: true,
    },

    // Observable micro-step performance recorded during the activity.
    stepResults: {
      type: [{
        step: { type: Number, required: true },
        title: { type: String, default: "" },
        status: {
          type: String,
          enum: ["correct", "incorrect", "prompted", "skipped", "completed"],
          default: "completed",
        },
        attempts: { type: Number, default: 1, min: 1 },
        helpUsed: { type: Boolean, default: false },
        responseTime: { type: Number, default: 0, min: 0 },
      }],
      default: [],
    },

    recommendation: {
      difficulty: { type: String, default: "" },
      action: { type: String, default: "" },
      reason: { type: String, default: "" },
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ActivityResult",
  activityResultSchema
);