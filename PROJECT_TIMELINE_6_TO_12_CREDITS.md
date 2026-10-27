# MTech Project Timeline: 6-Credit Semester -> 12-Credit Semester

## Semester with 6 credits: finish the research foundation + technical proof

### Weeks 1-2
- Freeze the FACP catalogue and traceability.
- Verify the 709 source-aligned activities and scoring codes.
- Freeze data schema: FACPAssessment, ActivityResult, BKT state, ALPI.
- Remove duplicate/legacy adaptive logic.

### Weeks 3-4
- Implement explicit FACP-item -> Learning Module mapping.
- Ensure every adaptive game references a target learning module/FACP skill.
- Build a richer module assessment instead of relying on a 3-question brushing quiz.

### Weeks 5-6
- Implement and test BKT on skill-level evidence.
- Define priors, transition/learning probability, slip and guess using a documented calibration procedure.
- Store BKT mastery after every relevant assessment/game event.

### Weeks 7-8
- Implement ALPI as a transparent recent-performance indicator.
- Separate FACP (teacher functional baseline), BKT (digital mastery estimate), and ALPI (recent digital performance).
- Build adaptive next-skill selection using FACP + BKT + ALPI + recent evidence.

### Weeks 9-10
- AI generation: RAG-grounded content, constrained game schema, limited repair/retry, no invented curriculum.
- Generate multiple game types: choice, matching, memory, visual sequence, drag-sort.
- Log the exact evidence/context used for every generated game.

### Weeks 11-12
- Run end-to-end tests with seeded GIID students.
- Measure recommendation consistency, game validity, API reliability and database integrity.
- Prepare methodology, architecture, ML model explanation and preliminary results for review.

## 12-credit final project semester: research validation + deployment-grade completion

### Phase 1
- Finalize dataset and data dictionary.
- Collect/curate sufficient interaction records.
- Define train/validation/test protocol without leakage.

### Phase 2
- Establish baselines: simple rule-based/adaptive baseline and BKT.
- Compare with at least one stronger knowledge-tracing model if the data volume supports it.
- Report metrics such as log loss/Brier score/AUC where appropriate, plus calibration and error analysis.

### Phase 3
- Ablation studies: FACP only vs FACP+BKT; BKT only vs BKT+ALPI; fixed games vs adaptive games.
- Evaluate whether adaptive recommendations actually change difficulty/skill selection as intended.

### Phase 4
- Complete AI/RAG evaluation: grounding, schema validity, duplicate-game rate, unsafe/off-topic content rate, latency and failure rate.
- Add teacher approval/audit trail.

### Phase 5
- Pilot with GIID-approved users/data.
- Gather teacher feedback and usability observations.
- Do not claim clinical/functional improvement from digital scores unless supported by an approved study design.

### Phase 6
- Final deployment hardening, security, backups, monitoring and documentation.
- Thesis, IEEE-style paper/manuscript, demo, results and viva preparation.

## Technical ML/AI confidence target

By the end of the 6-credit semester you should be able to explain and demonstrate:
1. Why FACP is a teacher-observed functional baseline.
2. Why BKT is used for digital skill mastery.
3. How BKT updates mastery after evidence.
4. Why ALPI is not a mastery model.
5. How the adaptive engine chooses the next skill/difficulty.
6. How RAG constrains AI game generation.
7. How the system is evaluated rather than merely showing generated games.

By the end of the 12-credit semester, the ML contribution should include experimental comparison, ablation/error analysis and reproducible evaluation—not only an API call to an ML model.
