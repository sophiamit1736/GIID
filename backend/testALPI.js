const assert = require('assert');
const { calculatePerformanceMetrics, calculateALPI } = require('./services/alpiCalculator');

const perfect = calculatePerformanceMetrics({
  totalQuestions: 10, correctAnswers: 10, completedItems: 10,
  timeTaken: 0, timeLimit: 100, attempts: 1, helpRequests: 0,
});
assert.strictEqual(perfect.accuracy, 100);
assert.strictEqual(perfect.completionRate, 100);
assert.strictEqual(perfect.independenceScore, 100);
assert.strictEqual(perfect.efficiencyScore, 100);
assert.strictEqual(perfect.performanceIndex, 100);

const weak = calculatePerformanceMetrics({
  totalQuestions: 10, correctAnswers: 2, completedItems: 10,
  timeTaken: 100, timeLimit: 100, attempts: 3, helpRequests: 2,
});
assert(weak.performanceIndex < 40);

const alpi = calculateALPI([
  { performanceIndex: 40, completedAt: '2026-09-01T10:00:00Z' },
  { performanceIndex: 80, completedAt: '2026-09-02T10:00:00Z' },
]);
assert.strictEqual(alpi, 67);

console.log('ALPI tests passed:', { perfect: perfect.performanceIndex, weak: weak.performanceIndex, weightedALPI: alpi });
