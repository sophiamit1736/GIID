require('dotenv').config();
const connectDB = require('./config/db');
const Student = require('./models/Student');

// Project-specific convenience rule: only derive a LearnAble level from a
// completed FACP assessment. Students without a completed FACP remain
// "Not Assessed" and should be assigned by the teacher after observation.
function levelFromFacp(score) {
  const s = Number(score || 0);
  return s >= 80 ? 'Advanced' : s >= 60 ? 'Intermediate' : 'Beginner';
}

async function run() {
  await connectDB();
  const students = await Student.find({});
  let updated = 0;
  let skipped = 0;

  for (const student of students) {
    if (!student.facpAssessmentComplete) {
      if (student.learningLevel !== 'Not Assessed') {
        student.learningLevel = 'Not Assessed';
        await student.save();
        updated++;
      } else skipped++;
      continue;
    }

    const next = levelFromFacp(student.facpScore);
    if (student.learningLevel !== next) {
      student.learningLevel = next;
      await student.save();
      updated++;
    } else skipped++;
  }

  console.log(`Updated ${updated} student learning levels; skipped ${skipped}.`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
