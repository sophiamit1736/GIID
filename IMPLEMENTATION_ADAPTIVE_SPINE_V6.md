# LearnAble Adaptive Spine V6

This patch changes the learning flow from:

`FACP -> random module -> 3-question brushing quiz -> ALPI`

to:

`FACP -> FACP-linked Learning Module -> structured module assessment -> ActivityResult -> ALPI/BKT -> next module -> FACP-linked AI game`

## What changed

1. **Learning-module assessment**
   - Each active learning module can receive a server-created assessment from its approved `interactiveSteps`.
   - The assessment has up to 8 meaningful items and requires at least 6 usable micro-steps.
   - Brushing Teeth therefore uses its existing 9 approved micro-steps instead of the old hard-coded 3-question quiz.
   - The assessment result is stored as `evidenceType: "module-assessment"`.

2. **No duplicate ALPI result**
   - The assessment is persisted once by `/api/module-assessments/submit`.
   - The page then refreshes the adaptive summary instead of creating a second ActivityResult.

3. **FACP linkage**
   - Assessment results inherit the learning module's `facpDomain` and `facpItemCodes`.
   - Existing explicit module mappings are preserved.
   - `npm run backfill:module-facp` can add mappings only to modules that have no explicit mapping.

4. **Games remain separate**
   - AI games are still stored in `Game`, not `LearningModule`.
   - Adaptive game generation requires a target learning module with explicit FACP item codes.
   - A game ActivityResult must reference its target `moduleId`.

5. **ALPI/BKT evidence**
   - Module assessments and games both become ActivityResult observations.
   - ALPI remains the recent digital-performance index.
   - BKT remains the learner-specific mastery estimator.
   - FACP remains the teacher-observed baseline and is not overwritten by ALPI.

## Run after replacing the project

Backend:

```bash
npm install
npm run backfill:module-facp
npm run seed:giid
npm run seed:modules
npm run seed:adl
npm start
```

If your existing package uses a different seed script name, keep the existing project command; the important new command is:

```bash
npm run backfill:module-facp
```

Frontend:

```bash
npm install
npm run dev
```

## API

- `GET /api/module-assessments/:moduleId` — creates/returns the active assessment from approved module content.
- `POST /api/module-assessments/submit` — scores and stores one module-assessment ActivityResult and recalculates ALPI.

## Important product distinction

The module assessment measures **digital learning evidence**: recall/recognition of the taught content. It does **not** replace teacher-observed FACP functional assessment. FACP statuses remain the source for functional independence.
