require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('./models/Game');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('MongoDB connection string not found in backend/.env');
    await mongoose.connect(uri);
    const result = await Game.updateMany({ status: 'Active' }, { $set: { status: 'Inactive' } });
    console.log(`Archived ${result.modifiedCount ?? result.nModified ?? 0} generated games.`);
    console.log('Learning modules and student results were not changed. Generate fresh games with the new topic-aligned engine.');
    await mongoose.disconnect();
  } catch (e) {
    console.error('Reset generated games failed:', e);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
