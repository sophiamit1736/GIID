const mongoose = require('mongoose');

const knowledgeChunkSchema = new mongoose.Schema({
  sourceType: { type: String, enum: ['FACP', 'LearningModule'], required: true, index: true },
  sourceId: { type: String, required: true, index: true },
  title: { type: String, default: '' },
  domain: { type: String, default: '', index: true },
  skill: { type: String, default: '', index: true },
  text: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

knowledgeChunkSchema.index({ domain: 1, skill: 1 });
module.exports = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
