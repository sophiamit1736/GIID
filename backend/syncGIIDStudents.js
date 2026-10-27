require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const { loadStudents, buildStudent } = require('./seedGIIDStudents');
const { normalizeGroupToFACPLevel } = require('./config/facpLevelMapper');

async function findExisting(s) {
  return Student.findOne({
    $or: [
      ...(s.sourceRecordId ? [{ sourceRecordId: s.sourceRecordId }] : []),
      ...(s.studentCode ? [{ studentCode: s.studentCode }] : []),
      ...(s.admissionNumber && s.name ? [{ admissionNumber: s.admissionNumber, name: s.name }] : []),
    ],
  });
}

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MongoDB connection string not found in backend/.env');
  const raw = loadStudents();
  if (!Array.isArray(raw)) throw new Error('GIID seed data must be an array.');
  await mongoose.connect(uri);
  let created = 0, updated = 0, unmapped = 0;

  for (let i = 0; i < raw.length; i += 1) {
    const student = buildStudent(raw[i], i);
    const level = normalizeGroupToFACPLevel(student.group, student.age);
    if (!level) unmapped += 1;
    const existing = await findExisting(student);
    if (existing) {
      // Source-register fields are authoritative for this synchronization.
      const sourceFields = ['studentCode','sourceRecordId','name','age','dateOfBirth','gender','disabilityLevel','learningLevel','admissionNumber','group','careType','idCardNumber','percentage','disabilityType','udidEnrollmentNumber','caseAssessmentStatus','caseAssessmentDate','facpStatus','facpCompletionDate','sourceSheet'];
      for (const key of sourceFields) if (student[key] !== undefined && student[key] !== null) existing[key] = student[key];
      existing.facpFunctionalLevel = level;
      await existing.save();
      updated += 1;
      console.log(`Synced: ${student.name} | GIID group: ${student.group || 'MISSING'} | FACP: ${level || 'UNMAPPED'}`);
    } else {
      const createdStudent = await Student.create({ ...student, facpFunctionalLevel: level });
      created += 1;
      console.log(`Created: ${createdStudent.name} | GIID group: ${student.group || 'MISSING'} | FACP: ${level || 'UNMAPPED'}`);
    }
  }

  const total = await Student.countDocuments({});
  console.log(`GIID synchronization complete. Source rows: ${raw.length}; created: ${created}; updated: ${updated}; unmapped FACP levels: ${unmapped}; DB students: ${total}.`);
  await mongoose.disconnect();
}

run().catch(async e => { console.error(e); try { await mongoose.disconnect(); } catch {} process.exit(1); });
