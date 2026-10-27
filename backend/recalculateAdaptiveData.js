require('dotenv').config();
const connectDB = require('./config/db');
const Student = require('./models/Student');
const FACPAssessment = require('./models/FACPAssessment');
const ActivityResult = require('./models/ActivityResult');
const { ALL_ITEMS } = require('./config/facpConfig');
const { calculateFACP } = require('./services/facpScoring');
const { calculateALPI } = require('./services/alpiCalculator');

function deriveLearningLevel(score) {
  if (score >= 80) return 'Advanced';
  if (score >= 60) return 'Intermediate';
  return 'Beginner';
}

async function run() {
  await connectDB();
  const students = await Student.find({}).lean();
  let facpUpdated = 0;
  let alpiUpdated = 0;

  for (const student of students) {
    const assessments = await FACPAssessment.find({ student: student._id })
      .sort({ assessedAt: -1, createdAt: -1 }).lean();

    const level = student.facpFunctionalLevel || assessments[0]?.functionalLevel || null;
    const latestByCode = new Map();

    for (const assessment of assessments) {
      const stats = assessment.domain === 'Recreational'
        ? { score: 0, applicableItems: 0, achievedItems: 0, independentItems: 0, promptedItems: 0, noExposureItems: 0, notAchievedItems: 0 }
        : calculateFACP(assessment.items || []);
      await FACPAssessment.updateOne({ _id: assessment._id }, { $set: stats });

      if (level && assessment.functionalLevel === level) {
        for (const item of assessment.items || []) {
          if (!latestByCode.has(item.code)) latestByCode.set(item.code, { ...item, domain: assessment.domain });
        }
      }
    }

    const quantitative = [...latestByCode.values()].filter(x => x.domain !== 'Recreational');
    const facp = calculateFACP(quantitative);
    const expected = ALL_ITEMS.filter(x => x.level === level && x.domain !== 'Recreational');
    const complete = Boolean(level && expected.length && expected.every(x => latestByCode.has(x.id)));

    await Student.updateOne({ _id: student._id }, { $set: {
      ...(level ? { facpFunctionalLevel: level } : {}),
      facpScore: facp.score,
      facpApplicableItems: facp.applicableItems,
      facpAchievedItems: facp.achievedItems,
      facpIndependentItems: facp.independentItems,
      facpAssessed: facp.applicableItems > 0,
      facpAssessmentComplete: complete,
      ...(complete ? { learningLevel: deriveLearningLevel(facp.score) } : {}),
      facpLastAssessedAt: assessments[0]?.assessedAt || student.facpLastAssessedAt || null,
    }});
    facpUpdated += 1;

    const results = await ActivityResult.find({ student: student._id }).sort({ completedAt: 1, createdAt: 1 }).lean();
    const alpi = calculateALPI(results);
    await Student.updateOne({ _id: student._id }, { $set: { alpiScore: alpi } });
    alpiUpdated += 1;
  }

  console.log(`Adaptive data recalculated for ${students.length} students. FACP: ${facpUpdated}, ALPI: ${alpiUpdated}.`);
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
