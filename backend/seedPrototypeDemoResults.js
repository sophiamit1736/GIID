const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./config/db");
const Student = require("./models/Student");
const LearningModule = require("./models/LearningModule");
const ActivityResult = require("./models/ActivityResult");
const User = require("./models/User");

function metric(total, correct, attempts, help, timeTaken, timeLimit) {
  const accuracy = Math.round((correct / total) * 100);
  const completionRate = 100;
  const timeEfficiency = timeLimit > 0
    ? Math.max(0, Math.min(100, Math.round(((timeLimit - Math.min(timeTaken, timeLimit)) / timeLimit) * 100)))
    : 100;
  const independence = Math.max(0, 100 - Math.max(0, attempts - 1) * 5 - help * 15);
  const efficiencyScore = Math.round(timeEfficiency * 0.6 + independence * 0.4);
  const performanceIndex = Math.round(accuracy * 0.55 + efficiencyScore * 0.30 + completionRate * 0.15);
  return { accuracy, completionRate, efficiencyScore, performanceIndex };
}

async function run() {
  await connectDB();

  const teacher = await User.findOne({ role: { $in: ["teacher", "admin"] }, status: { $ne: "Inactive" } }).lean();
  if (!teacher) throw new Error("Create a teacher/admin account first.");

  const students = await Student.find({ status: "Active" }).limit(5).lean();
  const modules = await LearningModule.find({ status: "Active" }).limit(4).lean();
  if (!students.length || !modules.length) throw new Error("Seed at least one active student and learning module first.");

  await ActivityResult.deleteMany({ isDemoData: true });

  let created = 0;
  for (let si = 0; si < students.length; si++) {
    for (let mi = 0; mi < Math.min(3, modules.length); mi++) {
      const total = 5;
      const correct = Math.min(total, 2 + ((si + mi) % 4));
      const attempts = 1 + ((si + mi) % 2);
      const help = (si + mi) % 2;
      const timeTaken = 35 + ((si * 13 + mi * 11) % 35);
      const timeLimit = 90;
      const m = metric(total, correct, attempts, help, timeTaken, timeLimit);

      await ActivityResult.create({
        student: students[si]._id,
        teacher: teacher._id,
        activityName: modules[mi].title,
        moduleId: modules[mi].moduleId,
        domain: modules[mi].facpDomain || modules[mi].category || "General",
        level: modules[mi].level || "Beginner",
        totalQuestions: total,
        correctAnswers: correct,
        wrongAnswers: total - correct,
        score: m.accuracy,
        accuracy: m.accuracy,
        timeTaken,
        timeLimit,
        attempts,
        helpRequests: help,
        gameType: "module",
        evidenceType: "practice",
        completionRate: m.completionRate,
        efficiencyScore: m.efficiencyScore,
        performanceIndex: m.performanceIndex,
        facpScore: Number(students[si].facpScore || 0),
        facpItemCodes: Array.isArray(modules[mi].facpItemCodes) ? modules[mi].facpItemCodes.slice(0, 3) : [],
        sessionId: `DEMO-${students[si].studentCode}-${mi + 1}`,
        dataSource: "demo",
        isDemoData: true,
        completedAt: new Date(Date.now() - ((students.length - si) * 86400000) + mi * 3600000),
      });
      created++;
    }
  }

  console.log(`Created ${created} demo activity observations.`);
  console.log("These records are marked isDemoData=true and are excluded from the Data Collection real-observation count.");
  await mongoose.connection.close();
}

run().catch(async err => {
  console.error(err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
