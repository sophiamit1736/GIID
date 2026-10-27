require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('./models/LearningModule');
const Game = require('./models/Game');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('MongoDB connection string not found in backend/.env');
    await mongoose.connect(uri);
    const oldGames = await LearningModule.find({
      $or: [
        { gameConfig: { $ne: null } },
        { generationSource: 'groq-rag' },
        { generatedBy: { $in: ['Groq', 'AI'] } },
      ],
      status: 'Active',
    }).lean();
    let migrated = 0;
    for (const old of oldGames) {
      const type = String(old.activityType || old.gameConfig?.type || '');
      if (!['visual-sequence','matching','choice','drag-sort','memory'].includes(type) || !old.gameConfig) continue;
      const gameId = `migrated-${old.moduleId || Date.now()}-${String(old._id).slice(-6)}`;
      await Game.updateOne({ gameId }, { $setOnInsert: {
        gameId,
        title: old.title,
        description: old.description || '',
        category: old.category || 'Adaptive Game',
        skill: old.skill,
        facpDomain: old.facpDomain || '',
        facpItemCodes: old.facpItemCodes || [],
        targetLearningModuleId: old.targetLearningModuleId || '',
        targetLearningModuleTitle: old.targetLearningModuleTitle || '',
        generatedForStudent: old.generatedForStudent || null,
        learnerLearningLevel: old.learnerLearningLevel || old.level || 'Not Assessed',
        difficulty: old.difficulty || 'Easy',
        estimatedMastery: old.estimatedMastery ?? null,
        generationReason: old.generationReason || '',
        activityType: type,
        duration: old.duration || 10,
        ageGroups: old.ageGroups || [],
        objectives: old.objectives || [],
        gameConfig: old.gameConfig,
        adaptations: old.adaptations || [],
        ragSources: old.ragSources || [],
        generationSource: old.generationSource || 'groq-rag',
        generatedBy: old.generatedBy || 'Groq',
        generationVersion: 'migrated-to-game-v1',
        generationNonce: old.generationNonce || '',
        coverEmoji: old.coverEmoji || '🎮',
        status: 'Active',
      } }, { upsert: true });
      await LearningModule.updateOne({ _id: old._id }, { $set: { status: 'Inactive' } });
      migrated += 1;
      console.log(`Migrated game: ${old.title} -> ${gameId}`);
    }
    console.log(`Generated-game migration complete. Migrated: ${migrated}.`);
    await mongoose.disconnect();
  } catch (e) { console.error(e); try { await mongoose.disconnect(); } catch {} process.exit(1); }
})();
