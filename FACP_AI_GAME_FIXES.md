# GIID LearnAble — Correct FACP + AI Game Fix

## FACP changes

- Removed the old project-only `ADL-01` ... `ADL-12` FACP structure.
- FACP is now driven by the functional levels represented in the supplied checklist:
  - Preprimary
  - Primary-I
  - Primary-II
  - Secondary
  - Prevocational-I
  - Prevocational-II
  - Care Group
- FACP areas are:
  - Personal
  - Social
  - Academic
  - Occupational
  - Recreational
- The catalogue is stored in `backend/data/FACP_OFFICIAL_CATALOGUE.json` and retains the source page for each activity.
- Blank checklist slots in the source are not invented as activities.
- Teacher can add child-specific/custom items.
- `NA` is recorded but excluded from the quantitative denominator.
- `+` and `C` are treated as pass-level observations for the LearnAble quantitative percentage.
- Recreation uses A/B/C/D/E/NE separately and is not mixed into the quantitative percentage.
- Current FACP score uses only the learner's current functional level. Previous functional levels remain history.
- Entry baseline stores both the baseline score and baseline functional level and is finalized only after the quantitative checklist is complete.
- LearnAble `learningLevel` (Beginner/Intermediate/Advanced) remains separate from FACP functional level.

## AI game fix

The matching game previously displayed `[object Object]` when Groq returned structured values such as `{text: "..."}` instead of a plain string.

Fixed in two places:

1. Backend normalizes structured AI values to readable text before validation/saving.
2. Frontend uses a safe `displayValue()` renderer for matching, memory, choice, sequence and drag-sort games.

Therefore an AI matching pair will display readable content instead of `[object Object]`.

## Verification

- Backend JavaScript syntax checks passed.
- `npm run test:adaptive` passed.
- FACP catalogue sanity check passed: 709 source-aligned activity records, with no old `ADL-*` FACP codes.
- Full frontend Vite build was not run in this isolated workspace because dependencies were not installed there.
