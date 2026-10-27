require('dotenv').config();
const connectDB = require('./config/db');
const KnowledgeChunk = require('./models/KnowledgeChunk');
const FACPAssessment = require('./models/FACPAssessment');
const LearningModule = require('./models/LearningModule');
const { ALL_ITEMS, DOMAINS } = require('./config/facpConfig');

async function run() {
  await connectDB();
  await KnowledgeChunk.deleteMany({});
  const chunks = [];

  chunks.push({ sourceType: 'FACP', sourceId: 'facp-guidelines', title: 'FACP Guidelines and Scoring Rules', domain: 'FACP', skill: 'Functional Assessment Checklist', text: require('fs').readFileSync(require('path').join(__dirname, 'data', 'FACP_GUIDELINES.md'), 'utf8'), metadata: { source: 'NIMH FACP guidelines', officialFACP: true } });

  // In addition to our project summary, ingest page-level knowledge from the
  // uploaded FACP source itself. This gives retrieval access to the actual
  // checklist activities (not invented summaries), while keeping page numbers
  // in metadata for teacher/admin traceability.
  const officialPath = require('path').join(__dirname, 'data', 'facp_official_pages.json');
  if (require('fs').existsSync(officialPath)) {
    const officialPages = JSON.parse(require('fs').readFileSync(officialPath, 'utf8'));
    for (const page of officialPages) chunks.push({ sourceType: 'FACP', ...page });
  }

  // Always seed the FACP catalogue itself. This means RAG works even before a
  // particular learner has completed an assessment.
  for (const domain of DOMAINS) {
    const items = domain.items || [];
    chunks.push({
      sourceType: 'FACP', sourceId: `catalogue-${domain.id}`, title: `FACP ${domain.name}`,
      domain: domain.id,
      skill: items.map(x => x.text).filter(Boolean).slice(0, 8).join(', '),
      text: `LearnAble FACP source-aligned catalogue context for ${domain.name}. Items: ${items.map(x => `${x.id} | ${x.text} | source page ${x.page || ''}`).join('; ')}`,
      metadata: { catalogue: true, itemCount: items.length },
    });
  }

  const [facpRows, modules] = await Promise.all([
    FACPAssessment.find({}).lean(),
    LearningModule.find({ status: 'Active' }).lean(),
  ]);

  for (const row of facpRows) {
    const items = Array.isArray(row.items) ? row.items : [];
    chunks.push({
      sourceType: 'FACP', sourceId: String(row._id), title: `Learner FACP ${row.domain || 'Assessment'}`,
      domain: row.domain || '',
      skill: items.map(x => x.skill).filter(Boolean).slice(0, 5).join(', ') || row.domain || '',
      text: `Observed FACP assessment. Domain: ${row.domain || ''}. Items: ${items.map(x => `${x.code || ''} | ${x.skill || ''} | ${x.activity || ''} | ${x.instruction || ''} | observed=${x.status || ''}`).join('; ')}. Notes: ${row.notes || ''}`,
      metadata: { assessmentId: String(row._id), studentId: String(row.student), assessedAt: row.assessedAt || row.createdAt },
    });
  }

  for (const m of modules) {
    chunks.push({
      sourceType: 'LearningModule', sourceId: String(m._id), title: m.title,
      domain: m.facpDomain || m.category || '', skill: m.skill || m.title,
      text: [`Approved learning module: ${m.title}`, `Description: ${m.description || ''}`, `Level: ${m.level || ''}`, `Objectives: ${(m.objectives || []).join('; ')}`, `Steps: ${(m.steps || []).join('; ')}`, `Adaptations: ${(m.adaptations || []).join('; ')}`].join('\n'),
      metadata: { moduleId: m.moduleId, activityType: m.activityType },
    });
  }

  if (chunks.length) await KnowledgeChunk.insertMany(chunks);
  console.log(`RAG knowledge seeded: ${chunks.length} chunks (${ALL_ITEMS.length} catalogue items represented).`);
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
