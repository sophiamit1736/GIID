# Complete FACP Source Package

This build carries the source-aligned FACP catalogue extracted from the supplied 120-page FACP PDF.

- 709 numbered checklist activities are represented in `backend/data/FACP_OFFICIAL_CATALOGUE.json`.
- Blank individualisation slots are not invented as activities.
- Every item keeps its source page.
- Checklist levels: Preprimary, Primary-I, Primary-II, Secondary, Prevocational-I, Prevocational-II, Care Group.
- Vocational remains a GIID training-group extension only; the supplied FACP PDF explicitly says its curriculum checklist does not cover the vocational area.
- Performance codes: +, C, GP, VP, M, PP, -, NA, NE.
- Recreation uses A/B/C/D/E/NE separately from quantitative scoring.
- 80% is retained as the source promotion criterion.

Run `npm run verify:facp` from `backend` to verify the catalogue.
