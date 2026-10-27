/**
 * FACP functional-level eligibility for LearnAble learning modules.
 *
 * This is a curriculum mapping, NOT the student's Beginner/Intermediate/
 * Advanced learning level.  The student's FACP functional level is a hard
 * eligibility filter; difficulty is decided separately from performance.
 */
const ALL_DEVELOPMENTAL = ["Preprimary", "Primary-I", "Primary-II", "Secondary"];
const PRIMARY_PLUS = ["Primary-I", "Primary-II", "Secondary"];
const ALL_PREVOCATIONAL = ["Prevocational-I", "Prevocational-II", "Vocational"];

const MODULE_FACP_LEVELS = {
  // Personal / ADL
  "adl-brushing": ["Preprimary", "Primary-I"],
  "adl-combing": ["Preprimary", "Primary-I", "Primary-II"],
  "adl-dressing": ["Primary-I", "Primary-II", "Secondary"],
  "adl-buttoning": ["Primary-I", "Primary-II", "Secondary"],
  "adl-toilet": ["Preprimary", "Primary-I"],
  "adl-drinking": ["Preprimary", "Primary-I"],
  "adl-eating": ["Preprimary", "Primary-I", "Primary-II"],
  "adl-grooming": ["Preprimary", "Primary-I", "Primary-II"],

  // Academic
  "academic-colours": ["Preprimary", "Primary-I"],
  "academic-numbers": ["Preprimary", "Primary-I", "Primary-II"],
  "academic-shapes": ["Preprimary", "Primary-I"],
  "academic-time": ["Primary-I", "Primary-II", "Secondary"],
  "academic-money": ["Primary-II", "Secondary"],
  "academic-reading": ["Primary-I", "Primary-II", "Secondary"],
  "academic-alphabet": ["Preprimary", "Primary-I"],
  "academic-prewriting": ["Preprimary", "Primary-I"],

  // Motor
  "motor-fine": ["Preprimary", "Primary-I", "Primary-II"],
  "motor-coordination": ALL_DEVELOPMENTAL,
  "motor-gross": ["Preprimary", "Primary-I", "Primary-II"],
  "motor-physical": PRIMARY_PLUS,
  "motor-outdoor": ALL_DEVELOPMENTAL,

  // Language / communication
  "language-vocabulary": ALL_DEVELOPMENTAL,
  "language-receptive": ["Preprimary", "Primary-I", "Primary-II"],
  "language-expressive": ALL_DEVELOPMENTAL,
  "language-story": PRIMARY_PLUS,
  "language-rhymes": ["Preprimary", "Primary-I"],
  "language-lip-tongue": ["Preprimary", "Primary-I"],
  "language-sign": ["Preprimary", "Primary-I", "Primary-II"],

  // Prevocational / vocational training. These MUST NOT leak into Secondary.
  "vocational-tools": ALL_PREVOCATIONAL,
  "vocational-machines": ["Prevocational-II", "Vocational"],
  "vocational-leather-tracing": ALL_PREVOCATIONAL,
  "vocational-stitching": ALL_PREVOCATIONAL,
  "vocational-leather-cutting": ALL_PREVOCATIONAL,
  "vocational-leather-pasting": ALL_PREVOCATIONAL,
  "vocational-leather-punching": ALL_PREVOCATIONAL,

  // Support/therapeutic activities can accompany all developmental levels.
  "therapeutic-yoga": ALL_DEVELOPMENTAL,
  "therapeutic-music": ALL_DEVELOPMENTAL,
  "therapeutic-play": ALL_DEVELOPMENTAL,
  "therapeutic-gardening": ["Primary-I", "Primary-II", "Secondary", "Prevocational-I", "Prevocational-II", "Vocational"],
  "therapeutic-computer": ["Primary-II", "Secondary", "Prevocational-I", "Prevocational-II", "Vocational"],
  "therapeutic-social": ALL_DEVELOPMENTAL,

  // Individualized support. Care Group is explicitly included here.
  "specialized-adl": ["Preprimary", "Primary-I", "Primary-II", "Secondary", "Prevocational-I", "Prevocational-II", "Care Group"],
  "specialized-intensive": ["Preprimary", "Primary-I", "Primary-II", "Secondary", "Prevocational-I", "Prevocational-II", "Care Group"],
  "specialized-assessment": ["Preprimary", "Primary-I", "Primary-II", "Secondary", "Prevocational-I", "Prevocational-II", "Care Group"],
};

function getModuleFACPLevels(moduleId) {
  return MODULE_FACP_LEVELS[String(moduleId || "")] || [];
}

module.exports = { MODULE_FACP_LEVELS, getModuleFACPLevels };
