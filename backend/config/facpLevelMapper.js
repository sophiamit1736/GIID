const FACP_LEVELS = [
  "Preprimary", "Primary-I", "Primary-II", "Secondary",
  "Prevocational-I", "Prevocational-II", "Vocational", "Care Group",
];

const GIID_GROUPS = [
  "Pre-Primary", "Primary", "Secondary", "Pre-Vocational-1",
  "Pre-Vocational-2", "Vocational", "Care Group",
];

/**
 * Map the GIID register group to the LearnAble placement/FACP selector.
 *
 * Source-backed levels in the supplied FACP document are: Preprimary,
 * Primary-I, Primary-II, Secondary, Prevocational-I, Prevocational-II and
 * Care Group. The GIID register additionally has a Vocational group. The
 * supplied FACP document explicitly says its curriculum checklist does not
 * cover the vocational area; therefore Vocational is retained as its own
 * GIID/training level and is NEVER silently relabelled as Prevocational-II.
 *
 * The GIID register uses the broad label "Primary". LearnAble separates it
 * using the requested age bands: 7-10 -> Primary-I, 11-14 -> Primary-II.
 * This is an application crosswalk, not a claim that the FACP source itself
 * uses exactly those two age cut-offs.
 */
function normalizeGroupToFACPLevel(group, age) {
  const raw = String(group || "")
    .trim().toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
  if (!raw) return null;

  if (/care\s*-?\s*group|caregroup/.test(raw)) return "Care Group";
  if (/^vocational\b/.test(raw)) return "Vocational";

  if (/pre\s*-?\s*vocational\s*[- ]?(?:ii|2)\b/.test(raw) || /^prevocational\s*[- ]?(?:ii|2)\b/.test(raw)) return "Prevocational-II";
  if (/pre\s*-?\s*vocational\s*[- ]?(?:i|1)\b/.test(raw) || /^prevocational\s*[- ]?(?:i|1)\b/.test(raw)) return "Prevocational-I";

  if (/^secondary\b|secondary/.test(raw)) return "Secondary";

  if (/^primary\s*[- ]?(?:ii|2)\b/.test(raw)) return "Primary-II";
  if (/^primary\s*[- ]?(?:i|1)\b/.test(raw)) return "Primary-I";
  if (/^primary\b/.test(raw)) {
    const a = Number(age);
    return Number.isFinite(a) && a >= 11 ? "Primary-II" : "Primary-I";
  }

  if (/pre\s*-?\s*primary|preprimary/.test(raw)) return "Preprimary";
  return null;
}

module.exports = { FACP_LEVELS, GIID_GROUPS, normalizeGroupToFACPLevel };
