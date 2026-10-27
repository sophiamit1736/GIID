const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: { type: String, required: true, unique: true, trim: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Adaptive Game' },
  skill: { type: String, required: true, trim: true },
  facpDomain: { type: String, default: '', index: true },
  facpItemCodes: { type: [String], default: [] },
  targetLearningModuleId: { type: String, default: '', index: true },
  targetLearningModuleTitle: { type: String, default: '' },
  targetLearningModuleFacpItemCodes: { type: [String], default: [] },
  targetLearningModuleFacpLevels: { type: [String], default: [] },
  facpFunctionalLevel: { type: String, default: '' },
  generatedForStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null, index: true },
  learnerLearningLevel: { type: String, enum: ['Not Assessed', 'Beginner', 'Intermediate', 'Advanced'], default: 'Not Assessed' },
  // Game difficulty is distinct from learner learningLevel. Accept legacy/model
  // labels at the boundary, but persist only the game enum values.
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
    set: (value) => {
      const map = { Beginner: 'Easy', Intermediate: 'Medium', Advanced: 'Hard' };
      return map[String(value || '').trim()] || value;
    },
  },
  estimatedMastery: { type: Number, min: 0, max: 100, default: null },
  generationReason: { type: String, default: '' },
  activityType: { type: String, enum: ['visual-sequence', 'matching', 'choice', 'drag-sort', 'memory'], required: true },
  duration: { type: Number, default: 10 },
  ageGroups: { type: [String], default: [] },
  objectives: { type: [String], default: [] },
  gameConfig: { type: mongoose.Schema.Types.Mixed, required: true },
  adaptations: { type: [String], default: [] },
  ragSources: { type: [mongoose.Schema.Types.Mixed], default: [] },
  generationSource: { type: String, default: 'groq-rag' },
  generatedBy: { type: String, default: 'Groq' },
  generationVersion: { type: String, default: 'facp-module-level-v4' },
  generationNonce: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
  coverEmoji: { type: String, default: '🎮' },
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
