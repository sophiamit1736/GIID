const { calculateALPI, calculatePerformanceMetrics } = require('./services/alpiCalculator');
const { calculateFACP } = require('./services/facpScoring');
const { PERFORMANCE_CODES } = require('./config/facpConfig');

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

const codes = Object.fromEntries(PERFORMANCE_CODES.map(x => [x.code, x]));
assert(codes['+'].pass === true, '+ must be a pass');
assert(codes.C.pass === true, 'C must be a pass-level result');
assert(codes.NA.excludeFromDenominator === true, 'NA must be excluded');
assert(codes.NE.excludeFromDenominator === false, 'NE must remain recorded and non-passing');
assert(codes['-'].label.includes('No'), '- must represent No');

const facp = calculateFACP([
  { status: '+' },
  { status: 'C' },
  { status: 'GP' },
  { status: '-' },
  { status: 'NE' },
  { status: 'NA' },
]);
assert(facp.applicableItems === 5, 'only NA is excluded from the denominator');
assert(facp.achievedItems === 2, '+ and C are quantifying/pass-level results');
assert(facp.independentItems === 1, '+ count must be tracked separately');
assert(facp.cueingItems === 1, 'C count must be tracked separately');
assert(facp.score === 40, 'FACP score must be 2/5 = 40%');
assert(facp.promotionEligible === false, '40% cannot satisfy the 80% criterion');
assert(calculateFACP([{ status: '+' }, { status: 'C' }, { status: '+' }, { status: 'C' }, { status: '+' }]).score === 100, 'all +/C should score 100');
assert(calculateFACP([{ status: 'NA' }]).score === 0, 'all NA has no quantifiable score');

const metrics = calculatePerformanceMetrics({
  totalQuestions: 10,
  correctAnswers: 8,
  completedItems: 10,
  timeTaken: 30,
  timeLimit: 60,
  attempts: 2,
  helpRequests: 1,
});
assert(metrics.accuracy === 80, 'accuracy must be 80%');
assert(metrics.completionRate === 100, 'completion must be 100%');
assert(metrics.timeEfficiency === 50, 'time efficiency must be 50%');
assert(metrics.independenceScore === 80, 'independence must account for attempts/help');
assert(metrics.efficiencyScore === 62, 'efficiency must be 60% time + 40% independence');
assert(metrics.performanceIndex === 78, 'performance index must be deterministic');

const alpi = calculateALPI([
  { performanceIndex: 40, completedAt: '2026-01-01' },
  { performanceIndex: 60, completedAt: '2026-01-02' },
  { performanceIndex: 100, completedAt: '2026-01-03' },
]);
assert(alpi === 77, `recency weighted ALPI expected 77, got ${alpi}`);

console.log('LearnAble FACP + ALPI logic checks passed.');
