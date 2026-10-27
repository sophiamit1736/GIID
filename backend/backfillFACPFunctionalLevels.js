require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const { loadStudents, buildStudent } = require('./seedGIIDStudents');
const { normalizeGroupToFACPLevel } = require('./config/facpLevelMapper');

async function findExisting(source) {
  return Student.findOne({ $or: [
    { sourceRecordId: source.sourceRecordId },
    { studentCode: source.studentCode },
    ...(source.admissionNumber && source.name ? [{ admissionNumber: source.admissionNumber, name: source.name }] : []),
  ] });
}

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('MongoDB connection string not found in backend/.env');
    const rows = loadStudents();
    await mongoose.connect(uri);
    let sourceRows = 0, groupSynced = 0, levelSynced = 0, missingRecords = 0, vocationalRows = 0, noDirectFACP = 0;
    for (let i = 0; i < rows.length; i += 1) {
      const source = buildStudent(rows[i], i);
      const level = normalizeGroupToFACPLevel(source.group, source.age);
      if (!level) noDirectFACP += 1;
      if (level === 'Vocational') vocationalRows += 1;
      const existing = await findExisting(source);
      if (!existing) { missingRecords += 1; console.log(`Missing in DB: ${source.name} | ${source.group}`); continue; }
      let changed = false;
      if (existing.group !== source.group) { existing.group = source.group; changed = true; groupSynced += 1; }
      if (existing.admissionNumber !== source.admissionNumber) { existing.admissionNumber = source.admissionNumber; changed = true; }
      if (existing.sourceRecordId !== source.sourceRecordId) { existing.sourceRecordId = source.sourceRecordId; changed = true; }
      if (existing.facpFunctionalLevel !== level) { existing.facpFunctionalLevel = level; changed = true; levelSynced += 1; }
      if (changed) await existing.save();
      sourceRows += 1;
      console.log(`Synced: ${source.name} | GIID group: ${source.group || 'MISSING'} | FACP/GIID placement: ${level || 'UNMAPPED'}`);
    }
    const total = await Student.countDocuments({});
    console.log(`FACP source mapping complete. Source rows: ${rows.length}; matched: ${sourceRows}; group updates: ${groupSynced}; FACP-level updates: ${levelSynced}; missing DB records: ${missingRecords}; Vocational GIID training rows: ${vocationalRows}; groups with no mapping: ${noDirectFACP}; total DB students: ${total}.`);
    await mongoose.disconnect();
  } catch (e) { console.error(e); try { await mongoose.disconnect(); } catch {} process.exit(1); }
})();
