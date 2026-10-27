/**
 * LearnAble FACP configuration.
 *
 * IMPORTANT:
 * - FACP is functional-level based, not an ADL-1..ADL-12 sequence.
 * - The official checklist levels are Preprimary, Primary-I, Primary-II,
 *   Secondary, Prevocational-I, Prevocational-II and Care Group. Vocational is retained as a GIID training-group extension because the supplied PDF says the curriculum checklist does not cover vocational area.
 * - The checklist areas are Personal, Social, Academic, Occupational and
 *   Recreational. Care Group in the supplied source contains Personal and
 *   Recreational sections.
 * - FACP activities are loaded from the source-aligned catalogue generated
 *   from the supplied FACP PDF. Each item keeps its source page.
 */

const catalogue = require("../data/FACP_OFFICIAL_CATALOGUE.json");

const FACP_LEVELS = [
  "Preprimary",
  "Primary-I",
  "Primary-II",
  "Secondary",
  "Prevocational-I",
  "Prevocational-II",
  "Vocational",
  "Care Group",
];

const FACP_DOMAINS = [
  { id: "Personal", name: "Personal" },
  { id: "Social", name: "Social" },
  { id: "Academic", name: "Academic" },
  { id: "Occupational", name: "Occupational" },
  { id: "Recreational", name: "Recreational" },
];

const PERFORMANCE_CODES = [
  { code: "+", label: "Yes — Independent", score: 1, pass: true, excludeFromDenominator: false },
  { code: "C", label: "Occasional Cueing — pass/strengthen", score: 1, pass: true, excludeFromDenominator: false },
  { code: "GP", excludeFromDenominator: false, label: "Gestural Prompting", score: 0, pass: false },
  { code: "VP", excludeFromDenominator: false, label: "Verbal Prompting", score: 0, pass: false },
  { code: "M", excludeFromDenominator: false, label: "Modelling", score: 0, pass: false },
  { code: "PP", excludeFromDenominator: false, label: "Physical Prompting", score: 0, pass: false },
  { code: "-", excludeFromDenominator: false, label: "No — task not performed", score: 0, pass: false },
  { code: "NA", label: "Not Applicable — excluded from denominator", excludeFromDenominator: true, pass: false },
  { code: "NE", label: "No Exposure — recorded, not a pass", score: 0, pass: false, excludeFromDenominator: false },
];

const RECREATION_GRADES = [
  { code: "A", label: "Takes initiative and participates effectively" },
  { code: "B", label: "Participates effectively when initiated" },
  { code: "C", label: "Involves self but not aware of rules/does not cooperate" },
  { code: "D", label: "Observes with interest" },
  { code: "E", label: "Not interested / indifferent" },
  { code: "NE", label: "No exposure" },
];

const VALID_FACP_CODES = new Set(PERFORMANCE_CODES.map(x => x.code));

const ALL_ITEMS = catalogue.flatMap(group =>
  group.items.map(item => ({
    ...item,
    level: group.level,
    domain: group.domain,
    skill: group.domain,
    activity: item.text,
    instruction: item.text,
    sourcePage: item.page,
  }))
);

// Keep both the new functional-level structure and a flattened `items` array
// for compatibility with existing seed/RAG code.
const DOMAINS = FACP_DOMAINS.map(domain => ({
  ...domain,
  items: ALL_ITEMS.filter(item => item.domain === domain.id),
  levels: FACP_LEVELS.map(level => ({
    level,
    items: ALL_ITEMS.filter(item => item.level === level && item.domain === domain.id),
  })).filter(x => x.items.length),
}));

const ITEM_BY_ID = new Map(ALL_ITEMS.map(item => [item.id, item]));

function getItemsForLevelDomain(level, domain) {
  return ALL_ITEMS.filter(item => item.level === level && item.domain === domain);
}

function getLevelCatalogue(level) {
  return ALL_ITEMS.filter(item => item.level === level);
}

module.exports = {
  FACP_LEVELS,
  FACP_DOMAINS,
  PERFORMANCE_CODES,
  RECREATION_GRADES,
  VALID_FACP_CODES,
  DOMAINS,
  ALL_ITEMS,
  ITEM_BY_ID,
  getItemsForLevelDomain,
  getLevelCatalogue,
};
