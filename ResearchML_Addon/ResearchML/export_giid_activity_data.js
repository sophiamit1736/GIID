/** Export non-demo GIID ActivityResult rows from the configured MongoDB.
 * Student identifiers are replaced with stable SHA-256 pseudonyms; names are never exported.
 * Run from backend/: node ../GIID_RealData_ML_Kit/export_giid_activity_data.js
 */
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const mongoose = require(path.resolve(process.cwd(), 'node_modules/mongoose'));
const ActivityResult = require(path.resolve(process.cwd(), 'models/ActivityResult'));

const OUT = path.resolve(process.cwd(), 'giid_activity_export.csv');
const fields = [
  'student_hash','completedAt','activityName','moduleId','domain','level','gameType','evidenceType',
  'totalQuestions','correctAnswers','wrongAnswers','score','accuracy','timeTaken','timeLimit','attempts',
  'helpRequests','completionRate','efficiencyScore','performanceIndex','facpScore','facpItemCodes',
  'dataSource','isDemoData','sessionId'
];
const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
const hashStudent = id => crypto.createHash('sha256').update(String(id)).digest('hex').slice(0, 20);

(async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in backend/.env');
  await mongoose.connect(process.env.MONGO_URI);
  const records = await ActivityResult.find({ isDemoData: { $ne: true } })
    .sort({ student: 1, completedAt: 1, createdAt: 1 }).lean();
  const sourceCounts = {};
  for (const r of records) sourceCounts[r.dataSource || 'unspecified'] = (sourceCounts[r.dataSource || 'unspecified'] || 0) + 1;
  const lines = [fields.map(csvCell).join(',')];
  for (const r of records) {
    const row = {
      student_hash: hashStudent(r.student),
      completedAt: r.completedAt || r.createdAt || '', activityName: r.activityName, moduleId: r.moduleId,
      domain: r.domain, level: r.level, gameType: r.gameType, evidenceType: r.evidenceType,
      totalQuestions: r.totalQuestions, correctAnswers: r.correctAnswers, wrongAnswers: r.wrongAnswers,
      score: r.score, accuracy: r.accuracy, timeTaken: r.timeTaken, timeLimit: r.timeLimit,
      attempts: r.attempts, helpRequests: r.helpRequests, completionRate: r.completionRate,
      efficiencyScore: r.efficiencyScore, performanceIndex: r.performanceIndex, facpScore: r.facpScore,
      facpItemCodes: Array.isArray(r.facpItemCodes) ? r.facpItemCodes.join('|') : '',
      dataSource: r.dataSource || 'unspecified', isDemoData: Boolean(r.isDemoData), sessionId: r.sessionId || ''
    };
    lines.push(fields.map(k => csvCell(row[k])).join(','));
  }
  fs.writeFileSync(OUT, '\ufeff' + lines.join('\r\n'), 'utf8');
  console.log(`Exported ${records.length} non-demo activity records to ${OUT}`);
  console.log('Source counts (inspect these before reporting results):', JSON.stringify(sourceCounts, null, 2));
  if (!records.length) console.log('No non-demo ActivityResult rows found. Play activities while signed in and confirm successful results are saved.');
  console.log('Privacy: names/student codes were not exported; student IDs were pseudonymized.');
})().catch(err => { console.error('Export failed:', err.message); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect().catch(() => {}); });
