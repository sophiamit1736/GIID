const assert = require('assert');
const { calculateFACP, calculateRecreationGrade, recreationGradeSummary } = require('./services/facpScoring');

const stats = calculateFACP([
  { domain: 'Personal', status: '+' },
  { domain: 'Personal', status: 'C' },
  { domain: 'Personal', status: 'GP' },
  { domain: 'Personal', status: 'VP' },
  { domain: 'Personal', status: 'NA' },
]);
assert.strictEqual(stats.applicableItems, 4);
assert.strictEqual(stats.achievedItems, 2);
assert.strictEqual(stats.score, 50);
assert.strictEqual(stats.notApplicableItems, 1);
assert.strictEqual(stats.promotionEligible, false);

const recreation = recreationGradeSummary(['A', 'B', 'A', 'C']);
assert.strictEqual(recreation.grade, 'A');
assert.strictEqual(recreation.tied, false);
assert.strictEqual(calculateRecreationGrade(['B', 'B', 'A']), 'B');

console.log('FACP scoring tests passed:', { score: stats.score, applicable: stats.applicableItems, recreation: recreation.grade });
