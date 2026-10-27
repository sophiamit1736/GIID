require('dotenv').config();
const connectDB = require('./config/db');
const Student = require('./models/Student');

const ALLOWED = new Set(['Not Assessed', 'Beginner', 'Intermediate', 'Advanced']);

async function run() {
  const [, , studentCode, learningLevel] = process.argv;
  if (!studentCode || !learningLevel || !ALLOWED.has(learningLevel)) {
    console.log('Usage: node setStudentLearningLevel.js <STUDENT_CODE> <LEVEL>');
    console.log('LEVEL: Not Assessed | Beginner | Intermediate | Advanced');
    process.exit(1);
  }
  await connectDB();
  const student = await Student.findOneAndUpdate(
    { studentCode: String(studentCode).trim() },
    { learningLevel },
    { new: true, runValidators: true }
  );
  if (!student) throw new Error(`Student ${studentCode} not found.`);
  console.log(`Updated ${student.studentCode} - ${student.name}: learningLevel = ${student.learningLevel}`);
  process.exit(0);
}
run().catch(err => { console.error(err.message); process.exit(1); });
