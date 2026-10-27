function clamp(n, min = 0, max = 100) {
  const value = Number(n);
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

/**
 * LearnAble ALPI is a project-specific learning-performance index; it is not
 * an official FACP score. FACP remains a separate functional baseline.
 *
 * Performance Index:
 *   55% accuracy
 *   30% efficiency
 *   15% completion
 *
 * Efficiency is calculated from time and learner independence. If the client
 * supplies an efficiency value, the backend should normally recompute it from
 * the raw signals using calculatePerformanceMetrics().
 */
function calculatePerformanceMetrics({
  totalQuestions = 0,
  correctAnswers = 0,
  completedItems = totalQuestions,
  timeTaken = 0,
  timeLimit = 0,
  attempts = 1,
  helpRequests = 0,
} = {}) {
  const total = Math.max(0, Math.floor(Number(totalQuestions) || 0));
  const correct = total > 0
    ? Math.max(0, Math.min(total, Math.floor(Number(correctAnswers) || 0)))
    : 0;
  const completed = total > 0
    ? Math.max(0, Math.min(total, Math.floor(Number(completedItems) || 0)))
    : 0;

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const elapsed = Math.max(0, Number(timeTaken) || 0);
  const limit = Math.max(0, Number(timeLimit) || 0);
  const timeEfficiency = limit > 0
    ? clamp(Math.round(((limit - Math.min(elapsed, limit)) / limit) * 100))
    : 100;

  const safeAttempts = Math.max(1, Math.floor(Number(attempts) || 1));
  const safeHelp = Math.max(0, Math.floor(Number(helpRequests) || 0));
  const independenceScore = clamp(
    100 - Math.max(0, safeAttempts - 1) * 5 - safeHelp * 15
  );

  const efficiencyScore = Math.round(
    timeEfficiency * 0.60 + independenceScore * 0.40
  );

  const performanceIndex = Math.round(
    accuracy * 0.55 + efficiencyScore * 0.30 + completionRate * 0.15
  );

  return {
    accuracy,
    completionRate,
    timeEfficiency,
    independenceScore,
    efficiencyScore,
    performanceIndex,
    correctAnswers: correct,
    completedItems: completed,
    attempts: safeAttempts,
    helpRequests: safeHelp,
    timeTaken: Math.round(elapsed),
    timeLimit: Math.round(limit),
  };
}

function calculateALPI(results = []) {
  const ordered = [...results]
    .filter(Boolean)
    .sort((a, b) => new Date(a.completedAt || a.createdAt || 0) - new Date(b.completedAt || b.createdAt || 0));

  if (!ordered.length) return 0;

  const recent = ordered.slice(-10);
  let weightedSum = 0;
  let weightSum = 0;

  recent.forEach((result, index) => {
    const performance = clamp(
      result.performanceIndex == null
        ? calculatePerformanceMetrics(result).performanceIndex
        : result.performanceIndex
    );
    const weight = index + 1; // newest result has the largest weight
    weightedSum += performance * weight;
    weightSum += weight;
  });

  return Math.round(weightedSum / weightSum);
}

module.exports = { calculateALPI, calculatePerformanceMetrics, clamp };
