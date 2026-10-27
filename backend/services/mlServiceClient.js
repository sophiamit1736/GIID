const axios = require('axios');
const ActivityResult = require('../models/ActivityResult');
const Student = require('../models/Student');
const LearningModule = require('../models/LearningModule');
const FACPAssessment = require('../models/FACPAssessment');
const { calculateFACP } = require('./facpScoring');
const { calculateALPI } = require('./alpiService');

function normalizeFunctionalLevel(value) {
  const aliases = {
    'pre-primary': 'Preprimary',
    'preprimary': 'Preprimary',
    'primary': 'Primary-I',
    'primary-i': 'Primary-I',
    'primary ii': 'Primary-II',
    'primary-ii': 'Primary-II',
    'secondary': 'Secondary',
    'pre-vocational-1': 'Prevocational-I',
    'pre-vocational-i': 'Prevocational-I',
    'prevocational-1': 'Prevocational-I',
    'prevocational-i': 'Prevocational-I',
    'pre-vocational-2': 'Prevocational-II',
    'pre-vocational-ii': 'Prevocational-II',
    'prevocational-2': 'Prevocational-II',
    'prevocational-ii': 'Prevocational-II',
    'vocational': 'Vocational',
    'care group': 'Care Group',
    'caregroup': 'Care Group',
  };
  const raw = String(value || '').trim();
  return aliases[raw.toLowerCase()] || raw;
}

function eligibleCandidates(features, candidates) {
  const functionalLevel = normalizeFunctionalLevel(features.facpFunctionalLevel);
  const modules = candidates.filter(c => c && c.status !== 'Inactive' && c.gameConfig == null);
  if (!functionalLevel) return modules;
  return modules.filter(c => Array.isArray(c.facpLevels) && c.facpLevels.includes(functionalLevel));
}

function fallback(features, candidates) {
  const alpi = Number(features.alpi || 0);
  const readiness = Number(features.readiness ?? alpi);
  const help = Number(features.helpRequests || 0);
  const level = readiness >= 80 && alpi >= 80 && help <= 1
    ? 'Advanced'
    : readiness >= 60
      ? 'Intermediate'
      : 'Beginner';
  const weakestDomain = String(features.weakestFacpDomain || features.weakestActivityDomain || '').toLowerCase();
  const currentModule = String(features.moduleId || '');
  const recent = new Set((features.recentModuleIds || []).map(String));
  const pool = eligibleCandidates(features, candidates);

  function scoreCandidate(candidate) {
    let score = 0;
    const id = String(candidate.moduleId || '');
    const domain = String(candidate.facpDomain || candidate.category || '').toLowerCase();
    if (id !== currentModule) score += 25;
    if (!recent.has(id)) score += 20;
    if (String(candidate.level || '') === level) score += 25;
    if (weakestDomain && domain === weakestDomain) score += 35;
    if (Array.isArray(candidate.facpItemCodes) && candidate.facpItemCodes.length) score += 10;
    return score;
  }

  const ranked = [...pool].sort((a, b) => scoreCandidate(b) - scoreCandidate(a));
  const next = ranked.find(candidate => String(candidate.moduleId) !== currentModule) || ranked[0] || null;
  const alternatives = ranked
    .filter(candidate => next && String(candidate.moduleId) !== String(next.moduleId))
    .slice(0, 3);
  const recommendedDifficulty = level === 'Advanced' ? 'Hard' : level === 'Intermediate' ? 'Medium' : 'Easy';
  const functionalLevel = normalizeFunctionalLevel(features.facpFunctionalLevel);

  return {
    prediction: next ? 1 : 0,
    label: 'Adaptive Recommendation',
    confidence: 0,
    model: 'Deterministic adaptive fallback',
    trainingSamples: 0,
    recommendedDifficulty,
    recommendedLevel: level,
    nextAction: level === 'Advanced' ? 'increase_difficulty' : level === 'Intermediate' ? 'practice' : 'guided_repeat',
    targetDomain: features.weakestFacpDomain || features.weakestActivityDomain || 'General',
    estimatedMastery: Number(features.readiness ?? features.alpi ?? 0),
    reason: functionalLevel
      ? `BKT service unavailable. Selected only modules mapped to FACP functional level ${functionalLevel}, then ranked by FACP need, learner level and recency.`
      : 'BKT service unavailable. Ranked available modules using FACP need, learner level and recency.',
    nextActivity: next,
    alternatives,
  };
}

async function predictForStudent(studentId, options = {}) {
  const activityMode = options.mode === 'game' ? 'game' : 'module';
  const [results, student, candidates, facpAssessments] = await Promise.all([
    ActivityResult.find({ student: studentId }).sort({ createdAt: 1 }).lean(),
    Student.findById(studentId).select('facpScore alpiScore facpApplicableItems learningLevel facpFunctionalLevel').lean(),
    LearningModule.find({ status: 'Active' }).select('moduleId title category skill facpDomain facpItemCodes facpLevels level activityType gameConfig generationSource').sort({ createdAt: 1 }).lean(),
    FACPAssessment.find({ student: studentId }).sort({ assessedAt: -1, createdAt: -1 }).lean(),
  ]);

  const latest = results[results.length - 1];
  const isCurrentGame = Boolean(latest && (String(latest.gameType || '').trim() !== '' && String(latest.gameType || '').toLowerCase() !== 'module'));
  const effectiveMode = activityMode === 'game' || isCurrentGame ? 'game' : 'module';
  // Prediction is about the learner's next LEARNING MODULE, not the output
  // format. A game is a practice layer attached to that module, so game-mode
  // prediction must still rank ordinary learning modules.
  // Curriculum boundary: FACP functional level is a hard filter. BKT may rank only within this eligible set.
  const modeCandidates = eligibleCandidates({ facpFunctionalLevel: student?.facpFunctionalLevel || '' }, candidates);
  const facp = Number(student?.facpScore || latest?.facpScore || 0);
  const alpi = calculateALPI(results);
  const readiness = Number(student?.facpApplicableItems || 0) > 0 ? Math.round(alpi * 0.60 + facp * 0.40) : alpi;

  const domainTotals = {};
  const recentModuleIds = [];
  for (const r of results) {
    const d = r.domain || 'General';
    domainTotals[d] ||= { sum: 0, count: 0 };
    domainTotals[d].sum += Number(r.performanceIndex ?? r.accuracy ?? 0);
    domainTotals[d].count += 1;
    if (r.moduleId) recentModuleIds.push(r.moduleId);
  }
  const domainMastery = Object.fromEntries(Object.entries(domainTotals).map(([d, v]) => [d, Math.round(v.sum / v.count)]));
  const latestFacpByCode = new Map();
  for (const assessment of facpAssessments) {
    for (const item of assessment.items || []) {
      if (!latestFacpByCode.has(item.code)) latestFacpByCode.set(item.code, { ...item, domain: assessment.domain });
    }
  }
  const facpDomainStats = {};
  for (const item of latestFacpByCode.values()) {
    const d = item.domain || 'General';
    facpDomainStats[d] ||= [];
    facpDomainStats[d].push(item);
  }
  const facpDomainScores = Object.fromEntries(
    Object.entries(facpDomainStats).map(([d, items]) => [d, calculateFACP(items).score])
  );
  const facpItemPriors = {};
  const facpItemDomains = {};
  const facpPriorMap = { "+": 0.95, "C": 0.85, "GP": 0.60, "VP": 0.50, "M": 0.40, "PP": 0.30, "-": 0.10, "NE": 0.20 };
  for (const item of latestFacpByCode.values()) {
    if (item.status === "NA" || !item.code) continue;
    facpItemPriors[String(item.code)] = facpPriorMap[item.status] ?? 0.20;
    facpItemDomains[String(item.code)] = item.domain || "General";
  }
  const weakestFacpDomain = Object.entries(facpDomainScores)
    .sort((a, b) => Number(a[1]) - Number(b[1]))[0]?.[0] || '';
  const weakestActivityDomain = Object.entries(domainMastery).sort((a, b) => Number(a[1]) - Number(b[1]))[0]?.[0] || '';
  const features = {
    alpi, readiness, accuracy: Number(latest?.accuracy || 0), previousAccuracy: Number(latest?.accuracy || 0),
    score: Number(latest?.score || 0), completionRate: Number(latest?.completionRate || 0),
    efficiencyScore: Number(latest?.efficiencyScore || 0), performanceIndex: Number(latest?.performanceIndex || 0),
    helpRequests: Number(latest?.helpRequests || 0), attempts: Number(latest?.attempts || 1), timeTaken: Number(latest?.timeTaken || 0),
    facpScore: facp, facpFunctionalLevel: student?.facpFunctionalLevel || '', learningLevel: student?.learningLevel || 'Beginner', moduleId: latest?.moduleId || '',
    domain: latest?.domain || '', level: latest?.level || 'Beginner', domainMastery, facpDomainScores, facpItemPriors, facpItemDomains,
    weakestActivityDomain, weakestFacpDomain, recentModuleIds: recentModuleIds.slice(-6), activityMode: effectiveMode,
  };

  // BKT is learner-specific.  It does not need a large cross-student labelled
  // transition table; every completed activity becomes an observation.
  const observations = results.map(r => ({
    moduleId: r.moduleId || '', domain: r.domain || 'General', level: r.level || 'Beginner',
    accuracy: Number(r.accuracy || 0), performanceIndex: Number(r.performanceIndex || 0),
    completedAt: r.completedAt || r.createdAt, gameType: r.gameType || 'module',
    facpItemCodes: Array.isArray(r.facpItemCodes) ? r.facpItemCodes : [],
  }));

  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001'}/predict`, {
      studentId, features, observations, candidates: modeCandidates,
    });
    return response.data;
  } catch (e) {
    return fallback(features, modeCandidates);
  }
}

module.exports = { predictForStudent };
