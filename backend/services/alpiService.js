const ActivityResult = require('../models/ActivityResult');
const Student = require('../models/Student');
const { calculateALPI, calculatePerformanceMetrics, clamp } = require('./alpiCalculator');

async function recalculateALPI(studentId) {
  const results = await ActivityResult.find({ student: studentId })
    .select('accuracy performanceIndex completionRate efficiencyScore domain moduleId level completedAt createdAt')
    .sort({ completedAt: 1, createdAt: 1 })
    .lean();

  const alpi = calculateALPI(results);
  await Student.findByIdAndUpdate(studentId, { alpiScore: alpi });
  return {
    alpi,
    activitiesIncluded: results.length,
    recentWindow: Math.min(results.length, 10),
  };
}

module.exports = {
  calculateALPI,
  calculatePerformanceMetrics,
  recalculateALPI,
  clamp,
};
