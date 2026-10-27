const FACPAssessment = require("../models/FACPAssessment");
const Student = require("../models/Student");
const {
  FACP_LEVELS,
  FACP_DOMAINS,
  PERFORMANCE_CODES,
  RECREATION_GRADES,
  ALL_ITEMS,
  getItemsForLevelDomain,
} = require("../config/facpConfig");
const {
  calculateFACP,
  calculateRecreationGrade,
  recreationGradeSummary,
  validateFACPStatus,
  RECREATION_GRADES: VALID_RECREATION_GRADES,
} = require("../services/facpScoring");

const VALID_LEVELS = new Set(FACP_LEVELS);
const VALID_DOMAINS = new Set(FACP_DOMAINS.map(x => x.id));

const VALID_ASSESSMENT_PERIODS = new Set(["Entry", "I Term", "II Term", "III Term"]);

function getPromotionOutcome(level, score, academicContext = {}) {
  const passed = Number(score) >= 80;
  if (level === "Vocational") {
    return { status: "Vocational training", passed: null, nextLevel: null, action: "The supplied FACP curriculum states that its checklist does not cover the vocational area. Retain the GIID Vocational group and use the separate vocational-training programme/checklist approved by GIID." };
  }
  if (level === "Care Group") {
    return { status: "Care Group", passed, nextLevel: null, action: "Separate Care Group pathway; prepare/coach the caretaker for maintaining skills." };
  }
  if (passed) {
    const next = {
      "Preprimary": "Primary-I",
      "Primary-I": "Secondary",
      "Primary-II": "Secondary",
      "Secondary": "Prevocational-I",
      "Prevocational-I": "Vocational training",
      "Prevocational-II": "Vocational training",
    }[level] || null;
    return { status: "Promotion eligible", passed: true, nextLevel: next, action: next ? `80% or above: eligible for ${next} according to the FACP promotion pathway.` : "80% or above: promotion pathway complete." };
  }
  const lessThan80 = {
    "Preprimary": "Primary-II",
    "Primary-I": "Continue Primary-I and reassess periodically; the source also describes movement to Secondary after >80%.",
    "Primary-II": "Prevocational-II",
    "Secondary": "Prevocational-II",
    "Prevocational-I": "Continue/reassess at the current level; vocational training is reached after the 80% criterion and age/pathway requirements.",
    "Prevocational-II": "Continue/reassess at the current level and review the specific problem areas after the available 3-year period.",
  }[level] || "Continue at the current pathway and reassess.";
  return { status: "Below 80% — reassessment required", passed: false, nextLevel: null, action: lessThan80 };
}

function deriveLearningLevel(score) {
  if (score >= 80) return "Advanced";
  if (score >= 60) return "Intermediate";
  return "Beginner";
}

function officialItemsForLevel(level) {
  return ALL_ITEMS.filter(item => item.level === level && item.domain !== "Recreational");
}

async function computeStudentOverall(studentId, requestedLevel = null) {
  const student = await Student.findById(studentId).lean();
  const assessments = await FACPAssessment.find({ student: studentId })
    .sort({ assessedAt: -1, createdAt: -1 })
    .lean();

  const level = requestedLevel || student?.facpFunctionalLevel ||
    assessments.find(a => VALID_LEVELS.has(a.functionalLevel))?.functionalLevel || null;

  if (!level) {
    return {
      level: null,
      score: 0,
      applicableItems: 0,
      achievedItems: 0,
      independentItems: 0,
      cueingItems: 0,
      promptedItems: 0,
      noExposureItems: 0,
      notAchievedItems: 0,
      notApplicableItems: 0,
      latestItems: [],
      assessments,
      assessmentComplete: false,
      promotionEligible: false,
    };
  }

  // Only the student's CURRENT FACP functional level contributes to the
  // current score. Previous levels remain historical records.
  const relevant = assessments.filter(a => a.functionalLevel === level);
  const latestByCode = new Map();

  for (const assessment of relevant) {
    for (const item of assessment.items || []) {
      if (!latestByCode.has(item.code)) {
        latestByCode.set(item.code, {
          ...item,
          domain: assessment.domain,
          functionalLevel: assessment.functionalLevel,
          assessmentPeriod: assessment.assessmentPeriod,
          assessedAt: assessment.assessedAt,
        });
      }
    }
  }

  const latestItems = Array.from(latestByCode.values());
  const quantitativeItems = latestItems.filter(item => item.domain !== "Recreational");
  const stats = calculateFACP(quantitativeItems);

  const expected = officialItemsForLevel(level);
  const expectedCodes = new Set(expected.map(x => x.id));
  const observedOfficialCodes = new Set(
    quantitativeItems
      .filter(x => expectedCodes.has(x.code))
      .map(x => x.code)
  );

  // Every official non-recreation checklist item must have an observation.
  // NA is still an observation and is excluded from the denominator by scoring.
  const assessmentComplete = expected.length > 0 &&
    expected.every(item => observedOfficialCodes.has(item.id));

  return {
    level,
    ...stats,
    latestItems,
    assessments,
    assessmentComplete,
    promotionEligible: assessmentComplete && stats.score >= 80,
  };
}

function getTemplate(req, res) {
  const domainAvailability = FACP_LEVELS.reduce((acc, level) => {
    acc[level] = FACP_DOMAINS.reduce((domains, domain) => {
      domains[domain.id] = ALL_ITEMS.some(item => item.level === level && item.domain === domain.id);
      return domains;
    }, {});
    return acc;
  }, {});

  res.json({
    levels: FACP_LEVELS,
    domains: FACP_DOMAINS,
    domainAvailability,
    performanceCodes: PERFORMANCE_CODES,
    recreationGrades: RECREATION_GRADES,
    catalogue: ALL_ITEMS,
    source: {
      name: "Functional Assessment Checklist for Programming",
      note: "Catalogue is based on the supplied FACP source PDF. Blank checklist slots are not invented as activities.",
    },
  });
}

async function getStudentAssessments(req, res) {
  try {
    const assessments = await FACPAssessment.find({ student: req.params.studentId })
      .sort({ assessedAt: -1 })
      .populate("teacher", "name email")
      .lean();
    res.json(assessments);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

async function getStudentSummary(req, res) {
  try {
    const student = await Student.findById(req.params.studentId).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    const overall = await computeStudentOverall(student._id);
    const domainBuckets = {};
    const recreationGrades = [];

    for (const item of overall.latestItems) {
      if (item.domain === "Recreational") {
        if (VALID_RECREATION_GRADES.has(item.recreationGrade)) recreationGrades.push(item.recreationGrade);
        continue;
      }
      const domain = item.domain || "Personal";
      if (!domainBuckets[domain]) domainBuckets[domain] = [];
      domainBuckets[domain].push(item);
    }

    const domainScores = Object.entries(domainBuckets).map(([domain, items]) => {
      const stats = calculateFACP(items);
      return {
        domain,
        score: stats.score,
        applicableItems: stats.applicableItems,
        achievedItems: stats.achievedItems,
        independentItems: stats.independentItems,
        cueingItems: stats.cueingItems,
        promptedItems: stats.promptedItems,
        noExposureItems: stats.noExposureItems,
        notAchievedItems: stats.notAchievedItems,
        notApplicableItems: stats.notApplicableItems,
      };
    });

    res.json({
      functionalLevel: overall.level,
      score: overall.score,
      promotionEligible: overall.promotionEligible,
      assessmentComplete: overall.assessmentComplete,
      applicableItems: overall.applicableItems,
      achievedItems: overall.achievedItems,
      independentItems: overall.independentItems,
      cueingItems: overall.cueingItems,
      promptedItems: overall.promptedItems,
      noExposureItems: overall.noExposureItems,
      notAchievedItems: overall.notAchievedItems,
      notApplicableItems: overall.notApplicableItems,
      domainScores,
      recreationGrade: calculateRecreationGrade(recreationGrades),
      recreationGradeSummary: recreationGradeSummary(recreationGrades),
      latestItems: overall.latestItems,
      history: overall.assessments,
      progression: getPromotionOutcome(overall.level, overall.score),
      assessmentSchedule: {
        entry: "Admission / Entry assessment",
        periodic: "Term evaluation: I Term, II Term and III Term",
        sourceNote: "The supplied FACP document provides recording space for First, Second and Third Year, with Entry, I Term, II Term and III Term columns. LearnAble does not calculate or infer the academic year until GIID confirms the local recording rule.",
      },
      baseline: {
        score: student.facpBaselineScore,
        applicableItems: student.facpBaselineApplicableItems || 0,
        achievedItems: student.facpBaselineAchievedItems || 0,
        functionalLevel: student.facpBaselineFunctionalLevel || null,
        finalizedAt: student.facpBaselineCompletedAt,
        finalized: student.facpBaselineScore !== null && student.facpBaselineScore !== undefined,
      },
      scoring: {
        formula: "(+ or C pass observations) / (all recorded non-NA Personal/Social/Academic/Occupational observations) × 100",
        passCodes: ["+", "C"],
        excludedFromDenominator: ["NA"],
        recordedButNotPassed: ["GP", "VP", "M", "PP", "-", "NE"],
        recreation: "A/B/C/D/E/NE graded separately and not included in the quantitative percentage",
        promotionCriterion: "80%",
      },
    });
  } catch (e) {
    console.error("FACP summary error:", e);
    res.status(500).json({ message: e.message });
  }
}

async function saveAssessment(req, res) {
  try {
    const {
      student,
      domain,
      items = [],
      notes = "",
      functionalLevel,
      assessmentPeriod = "Entry",
    } = req.body || {};

    if (!student || !domain || !functionalLevel) {
      return res.status(400).json({ message: "student, functionalLevel and domain are required." });
    }
    if (!VALID_LEVELS.has(functionalLevel)) return res.status(400).json({ message: "Invalid FACP functional level." });
    if (functionalLevel === "Vocational") return res.status(400).json({ message: "Vocational is a GIID training group, but the supplied FACP document explicitly states that its curriculum checklist does not cover the vocational area. Use the GIID-approved vocational training assessment separately." });
    if (!VALID_DOMAINS.has(domain)) return res.status(400).json({ message: "Invalid FACP domain." });
    if (!VALID_ASSESSMENT_PERIODS.has(assessmentPeriod)) return res.status(400).json({ message: "Use Entry, I Term, II Term or III Term for FACP evaluation." });
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: "Record at least one FACP item." });

    const learner = await Student.findById(student).select("facpBaselineScore facpFunctionalLevel").lean();
    if (!learner) return res.status(404).json({ message: "Student not found." });
    if (assessmentPeriod !== "Entry" && (learner.facpBaselineScore === null || learner.facpBaselineScore === undefined)) {
      return res.status(400).json({ message: "Complete and finalize the Entry FACP baseline before recording quarterly evaluation." });
    }
    if (assessmentPeriod === "Entry" && learner.facpBaselineScore !== null && learner.facpBaselineScore !== undefined) {
      return res.status(409).json({ message: "Entry FACP baseline is already finalized. Use I Term, II Term or III Term for later evaluations." });
    }

    const official = new Map(getItemsForLevelDomain(functionalLevel, domain).map(item => [item.id, item]));
    const cleanItems = [];

    for (const raw of items) {
      const code = String(raw.code || "").trim();
      const source = official.get(code);
      const custom = raw.custom === true || code.startsWith("CUSTOM-");

      if (!source && !custom) {
        throw new Error(`Invalid FACP item for ${functionalLevel}/${domain}: ${code}`);
      }

      if (domain === "Recreational") {
        const grade = String(raw.recreationGrade || "").trim();
        if (!VALID_RECREATION_GRADES.has(grade)) {
          throw new Error(`Invalid recreation grade for item ${code}.`);
        }
        cleanItems.push({
          code,
          skill: domain,
          activity: source?.text || String(raw.activity || "").trim(),
          instruction: source?.text || String(raw.activity || "").trim(),
          sourcePage: source?.page || null,
          sourceType: source?.sourceType || "custom",
          custom,
          status: null,
          recreationGrade: grade,
          notes: String(raw.notes || "").trim(),
          domain,
        });
      } else {
        const status = String(raw.status || "").trim();
        if (!validateFACPStatus(status)) throw new Error(`Invalid FACP status for item ${code}: ${status}`);
        cleanItems.push({
          code,
          skill: domain,
          activity: source?.text || String(raw.activity || "").trim(),
          instruction: source?.text || String(raw.activity || "").trim(),
          sourcePage: source?.page || null,
          sourceType: source?.sourceType || "custom",
          custom,
          status,
          recreationGrade: null,
          notes: String(raw.notes || "").trim(),
          domain,
        });
      }
    }

    const stats = domain === "Recreational"
      ? { applicableItems: 0, achievedItems: 0, independentItems: 0, promptedItems: 0, noExposureItems: 0, notAchievedItems: 0, notApplicableItems: 0, score: 0, promotionEligible: false }
      : calculateFACP(cleanItems);

    const assessment = await FACPAssessment.create({
      student,
      teacher: req.user.id,
      domain,
      functionalLevel,
      assessmentPeriod,
      items: cleanItems,
      ...stats,
      recreationGrade: domain === "Recreational"
        ? calculateRecreationGrade(cleanItems.map(x => x.recreationGrade))
        : null,
      assessmentComplete: false,
      notes,
    });

    const overall = await computeStudentOverall(student, functionalLevel);
    await FACPAssessment.findByIdAndUpdate(assessment._id, { assessmentComplete: overall.assessmentComplete });

    const studentUpdate = {
      facpFunctionalLevel: functionalLevel,
      facpScore: overall.score,
      facpApplicableItems: overall.applicableItems,
      facpAchievedItems: overall.achievedItems,
      facpIndependentItems: overall.independentItems,
      facpAssessed: overall.applicableItems > 0,
      facpAssessmentComplete: overall.assessmentComplete,
      facpLastAssessedAt: new Date(),
    };

    if (overall.assessmentComplete) studentUpdate.learningLevel = deriveLearningLevel(overall.score);
    await Student.findByIdAndUpdate(student, studentUpdate);
    const progression = getPromotionOutcome(functionalLevel, overall.score);

    res.status(201).json({
      assessment,
      summary: {
        score: overall.score,
        functionalLevel,
        applicableItems: overall.applicableItems,
        achievedItems: overall.achievedItems,
        independentItems: overall.independentItems,
        cueingItems: overall.cueingItems,
        promptedItems: overall.promptedItems,
        noExposureItems: overall.noExposureItems,
        notAchievedItems: overall.notAchievedItems,
        notApplicableItems: overall.notApplicableItems,
        promotionEligible: overall.promotionEligible,
        assessmentComplete: overall.assessmentComplete,
        assessmentPeriod,
        progression,
      },
      calculation: "FACP quantitative score = (+ or C) pass observations ÷ all recorded non-NA quantitative observations × 100. Recreational grades are stored separately and are not mixed into the quantitative percentage.",
    });
  } catch (e) {
    console.error("FACP save error:", e);
    res.status(400).json({ message: e.message });
  }
}

async function finalizeBaseline(req, res) {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found." });

    if (student.facpBaselineScore !== null && student.facpBaselineScore !== undefined) {
      return res.status(409).json({
        message: "FACP baseline is already finalized. Later term assessments do not overwrite it.",
        baselineScore: student.facpBaselineScore,
      });
    }

    const level = student.facpFunctionalLevel;
    if (!level) return res.status(400).json({ message: "Select and complete the student's FACP functional level first." });

    const entryAssessments = await FACPAssessment.find({
      student: studentId,
      functionalLevel: level,
      assessmentPeriod: "Entry",
    }).lean();

    if (!entryAssessments.length) return res.status(400).json({ message: "Save the Entry FACP observations before finalizing the baseline." });

    // The admission baseline must be calculated from Entry observations only;
    // later quarterly evaluations must never alter the immutable baseline.
    const entryItems = entryAssessments.flatMap(a => (a.items || []).map(item => ({ ...item, domain: a.domain })));
    const latestEntryByCode = new Map();
    for (const item of entryItems) if (!latestEntryByCode.has(item.code)) latestEntryByCode.set(item.code, item);
    const quantitativeEntryItems = Array.from(latestEntryByCode.values()).filter(item => item.domain !== "Recreational");
    const entryStats = calculateFACP(quantitativeEntryItems);
    const expectedEntry = officialItemsForLevel(level);
    const expectedEntryCodes = new Set(expectedEntry.map(x => x.id));
    const observedEntryCodes = new Set(quantitativeEntryItems.filter(x => expectedEntryCodes.has(x.code)).map(x => x.code));
    const entryComplete = expectedEntry.length > 0 && expectedEntry.every(x => observedEntryCodes.has(x.id));
    const overall = { ...entryStats, level, assessmentComplete: entryComplete, promotionEligible: entryComplete && entryStats.score >= 80 };
    if (!overall.assessmentComplete) {
      return res.status(400).json({
        message: "The Entry FACP checklist is not complete. Record every official applicable item for this functional level (use NA where appropriate) before finalizing the baseline.",
        functionalLevel: level,
      });
    }

    const latestEntry = entryAssessments.sort((a, b) => new Date(b.assessedAt) - new Date(a.assessedAt))[0];
    const updated = await Student.findByIdAndUpdate(studentId, {
      facpBaselineScore: overall.score,
      facpBaselineApplicableItems: overall.applicableItems,
      facpBaselineAchievedItems: overall.achievedItems,
      facpBaselineAssessmentId: latestEntry?._id || null,
      facpBaselineAssessmentIds: entryAssessments.map(a => a._id),
      facpBaselineCompletedAt: new Date(),
      facpBaselineFunctionalLevel: level,
      facpFunctionalLevel: level,
      facpScore: overall.score,
      facpApplicableItems: overall.applicableItems,
      facpAchievedItems: overall.achievedItems,
      facpIndependentItems: overall.independentItems,
      facpAssessed: true,
      facpAssessmentComplete: true,
      learningLevel: deriveLearningLevel(overall.score),
      facpLastAssessedAt: new Date(),
    }, { new: true });

    res.json({
      message: "Entry FACP baseline finalized successfully.",
      student: updated,
      baseline: {
        score: overall.score,
        applicableItems: overall.applicableItems,
        achievedItems: overall.achievedItems,
        functionalLevel: level,
        finalizedAt: updated.facpBaselineCompletedAt,
        progression: getPromotionOutcome(level, overall.score),
      },
    });
  } catch (e) {
    console.error("FACP baseline finalize error:", e);
    res.status(400).json({ message: e.message });
  }
}

module.exports = {
  getTemplate,
  getStudentAssessments,
  getStudentSummary,
  saveAssessment,
  finalizeBaseline,
  deriveLearningLevel,
  getPromotionOutcome,
};
