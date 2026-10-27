# LearnAble ML model: Bayesian Knowledge Tracing

## Why Bayesian Knowledge Tracing (BKT) was removed

The earlier recommendation service used Bayesian Knowledge Tracing (BKT) when enough labelled next-module transitions existed. GIID LearnAble currently has sparse learner-specific observations, so requiring a large labelled transition table is a poor fit.

The recommendation layer now uses **Bayesian Knowledge Tracing (BKT)**. BKT estimates learner mastery from sequential observations and can start from a prior derived from the learner's FACP evidence and ALPI/readiness context. It does not require a large cross-student labelled transition dataset.

BKT is used for **mastery estimation and next-activity recommendation**. It is not presented as a guaranteed-perfect predictor; confidence is reduced when evidence is sparse.

## ALPI

ALPI remains a LearnAble project-specific performance index, separate from FACP.

For each completed activity:

- Accuracy = correct / total × 100
- Completion = completed / total × 100
- Time efficiency = remaining time / time limit × 100 (when a time limit exists)
- Independence = 100 − 5 × extra attempts − 15 × help requests, clamped to 0–100
- Efficiency = 60% time efficiency + 40% independence
- Performance Index = 55% accuracy + 30% efficiency + 15% completion
- ALPI = recency-weighted average of the latest 10 Performance Index values; newest result receives the largest weight

The backend is authoritative for these calculations. The React client no longer uses a competing ALPI formula.

## FACP relationship

FACP is the teacher-observed functional assessment. Its official qualitative codes are retained: +, C, GP, VP, M, PP, -, NA and NE. For the LearnAble quantitative interpretation, + and C count as achieved observations; NA is removed from the denominator; other recorded codes are retained but do not add points. Recreation A/B/C/D/E/NE is scored separately.

FACP baseline is immutable after Entry finalization. Quarterly FACP evaluations update current FACP status but do not overwrite the Entry baseline.

## Recommendation flow

FACP item/domain evidence + ALPI + activity observations
→ BKT mastery estimation
→ weakest/least-mastered domain and target difficulty
→ candidate activity ranking
→ RAG retrieval
→ Groq generation of a playable game
→ teacher approval
→ learner

The same BKT recommendation is used by student-aware AI game generation, so the AI generator does not randomly select a topic after prediction.
