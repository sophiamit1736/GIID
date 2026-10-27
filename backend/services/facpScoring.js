/**
 * FACP scoring for the LearnAble implementation.
 *
 * Source-aligned semantics:
 * +  = Yes / independent
 * C  = Occasional cueing
 * GP = Gestural prompting
 * VP = Verbal prompting
 * M  = Modelling
 * PP = Physical prompting
 * -  = No
 * NA = Not applicable; excluded from denominator
 * NE = No exposure; recorded, not a pass
 *
 * Quantitative project interpretation:
 *   score = (+ or C) / (all recorded non-NA items) * 100
 * Recreation is graded A/B/C/D/E/NE separately and is not included in
 * the Personal/Social/Academic/Occupational percentage.
 */

const PASS_CODES = new Set(["+", "C"]);
const PROMPT_CODES = new Set(["GP", "VP", "M", "PP"]);
const ALL_CODES = new Set(["+", "C", "GP", "VP", "M", "PP", "-", "NE", "NA"]);
const RECREATION_GRADES = new Set(["A", "B", "C", "D", "E", "NE"]);

function calculateFACP(items = []) {
  const normalized = Array.isArray(items)
    ? items.filter(item => item && item.domain !== "Recreational")
    : [];

  const applicable = normalized.filter(item => item.status !== "NA");
  const passed = applicable.filter(item => PASS_CODES.has(item.status));
  const independent = applicable.filter(item => item.status === "+");
  const cueing = applicable.filter(item => item.status === "C");
  const prompted = applicable.filter(item => PROMPT_CODES.has(item.status));
  const noExposure = applicable.filter(item => item.status === "NE");
  const notAchieved = applicable.filter(item => item.status === "-");

  const score = applicable.length
    ? Math.round((passed.length / applicable.length) * 100)
    : 0;

  return {
    applicableItems: applicable.length,
    achievedItems: passed.length,
    independentItems: independent.length,
    cueingItems: cueing.length,
    promptedItems: prompted.length,
    noExposureItems: noExposure.length,
    notAchievedItems: notAchieved.length,
    notApplicableItems: normalized.filter(item => item.status === "NA").length,
    score,
    promotionEligible: applicable.length > 0 && score >= 80,
  };
}

function validateFACPStatus(status) {
  return ALL_CODES.has(status);
}

function calculateRecreationGrade(grades = []) {
  const valid = grades.filter(g => RECREATION_GRADES.has(g));
  if (!valid.length) return null;

  const counts = Object.fromEntries([...RECREATION_GRADES].map(g => [g, 0]));
  valid.forEach(g => { counts[g] += 1; });
  const max = Math.max(...Object.values(counts));
  const leaders = Object.keys(counts).filter(g => counts[g] === max);
  // The source says the teacher may use judgement when more than one grade
  // has the same maximum frequency. We retain a deterministic display grade,
  // while the API also reports the tie so the teacher can review it.
  // The source says the teacher may use judgement when multiple grades tie.
  // Do not silently select a winner; expose the tie to the UI instead.
  return leaders.length === 1 ? leaders[0] : null;
}

function recreationGradeSummary(grades = []) {
  const valid = grades.filter(g => RECREATION_GRADES.has(g));
  if (!valid.length) return { grade: null, tied: false, leaders: [] };
  const counts = Object.fromEntries([...RECREATION_GRADES].map(g => [g, 0]));
  valid.forEach(g => { counts[g] += 1; });
  const max = Math.max(...Object.values(counts));
  const leaders = Object.keys(counts).filter(g => counts[g] === max);
  return { grade: leaders[0] || null, tied: leaders.length > 1, leaders };
}

module.exports = {
  PASS_CODES,
  PROMPT_CODES,
  ALL_CODES,
  RECREATION_GRADES,
  calculateFACP,
  validateFACPStatus,
  calculateRecreationGrade,
  recreationGradeSummary,
};
