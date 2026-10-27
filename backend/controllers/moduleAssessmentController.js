const { ensureModuleAssessment } = require("../services/moduleAssessmentService");
const ActivityResult = require("../models/ActivityResult");
const Student = require("../models/Student");
const { recalculateALPI } = require("../services/alpiService");

async function getAssessment(req, res) {
  try {
    const assessment = await ensureModuleAssessment(req.params.moduleId);
    res.json(assessment);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function submitAssessment(req, res) {
  try {
    const { student, moduleId, answers, timeTaken = 0, attempts = 1, helpRequests = 0 } = req.body || {};
    if (!student || !moduleId || !Array.isArray(answers)) return res.status(400).json({ message: "student, moduleId and answers are required." });
    const assessment = await ensureModuleAssessment(moduleId);
    const LearningModule = require("../models/LearningModule");
    const module = await LearningModule.findOne({ moduleId, status: "Active" }).select("title facpDomain level facpItemCodes").lean();
    const learner = await Student.findById(student).select("facpScore").lean();
    if (!learner) return res.status(404).json({ message: "Student not found." });

    let correct = 0;
    const stepResults = assessment.items.map((item, index) => {
      const selected = Number(answers[index]);
      const ok = Number.isInteger(selected) && selected === item.correctIndex;
      if (ok) correct += 1;
      return { step: index + 1, title: item.question, status: ok ? "correct" : "incorrect", attempts: 1, helpUsed: false, responseTime: 0 };
    });

    const total = assessment.items.length;
    const completed = answers.filter(x => x !== null && x !== undefined && x !== "").length;
    const result = await ActivityResult.create({
      student,
      teacher: req.user.id,
      activityName: assessment.title,
      moduleId,
      domain: module?.facpDomain || "Learning Module",
      level: module?.level || "Beginner",
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: total - correct,
      timeTaken: Number(timeTaken) || 0,
      timeLimit: 0,
      attempts: Math.max(1, Number(attempts) || 1),
      helpRequests: Math.max(0, Number(helpRequests) || 0),
      gameType: "module",
      evidenceType: "module-assessment",
      completionRate: Math.round((completed / total) * 100),
      facpScore: Number(learner.facpScore || 0),
      facpItemCodes: [...new Set((module?.facpItemCodes || []).concat(assessment.items.flatMap(i => i.facpItemCodes || [])))],
      stepResults,
    });
    const alpi = await recalculateALPI(student);
    res.status(201).json({ result, alpi: alpi.alpi, assessmentId: assessment.assessmentId });
  } catch (e) {
    console.error("submitAssessment error", e);
    res.status(500).json({ message: e.message });
  }
}

module.exports = { getAssessment, submitAssessment };
