# LearnAble — Tomorrow's Complete Adaptive Demo

## Student admission
1. Add Student stores basic information and Disability Level.
2. Learning Level starts as `Not Assessed` (or can be a provisional level if the teacher already has evidence).
3. FACP Baseline is **not manually entered** in Add Student.
4. Teacher opens FACP Assessment and records Entry observations using the FACP codes.
5. LearnAble calculates the Entry FACP percentage and the teacher clicks `Finalize Entry Baseline`.
6. Finalization stores the immutable baseline snapshot and derives the initial Learning Level from the project's current rule.

## Complete adaptive loop
`Student -> Entry FACP -> Baseline -> Learning Module/Game -> ActivityResult -> ALPI -> ML Prediction -> Next Activity/Game -> AI + RAG -> New Result`

## Recommendation modes
- Learning module completion uses **module mode** and recommends the next learning module.
- Game completion uses **game mode** and recommends the next approved playable AI game.
- Game mode filters recommendation candidates to playable game modules (`visual-sequence`, `matching`, `choice`, `drag-sort`, `memory`) with `gameConfig`.
- If no approved playable game exists, the UI says `Generate the next recommended game` and opens the student-aware AI generator.

## New student values
- `Disability Level`: admission/source record or appropriate GIID assessment.
- `Learning Level`: `Not Assessed` until the Entry assessment if there is no prior evidence.
- `FACP Baseline`: calculated only from recorded FACP observations; never typed as an arbitrary percentage.
- `ALPI`: automatically calculated after completed learning/game activity results.

## ML service
Run from `backend`:
```powershell
python -m uvicorn ml_service:app --host 127.0.0.1 --port 8001
```

Node backend calls the ML service with FACP, ALPI, readiness, activity performance, domain mastery and recent transitions. The Bayesian Knowledge Tracing (BKT) path is used when enough historical transitions exist; otherwise the content-aware adaptive fallback ranks candidates using current learner evidence. The fallback is not presented as a trained ML prediction.

## AI games
AI game generation is separate from video-based learning modules. AI games use validated `gameConfig` and can be played without video. RAG grounds generation with FACP and approved project knowledge.
