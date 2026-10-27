# LearnAble Game Architecture V4 — Unified Adaptive Game Flow

## Goal
All learning games use one session architecture so the data used by FACP, ALPI and next-activity recommendation is consistent.

## Unified flow
1. Teacher selects learner.
2. A 120-second session starts.
3. Game-specific interaction runs inside the same session.
4. Every meaningful interaction records an attempt.
5. Help requests are recorded separately.
6. Each completed/attempted item can create a `stepResult` with status, attempts and response time.
7. Score and accuracy are calculated from the same total-item definition.
8. Completion rate reflects how much of the activity was actually completed.
9. The common session calculates time efficiency, efficiency score and performance index.
10. The backend stores an `ActivityResult` and snapshots the learner's current FACP score.
11. ALPI is updated from saved activity accuracy using the project's current formula.
12. Adaptive prediction receives the latest performance features, FACP score, domain mastery and recent modules.
13. Bayesian Knowledge Tracing (BKT) is used when sufficient historical transitions exist; otherwise the content-aware adaptive fallback ranks suitable candidates.
14. The result screen displays the recommended next activity.

## Games using the architecture
- Shape Matching
- Colour Matching
- Animal Matching
- Alphabet Matching
- Fruit Matching
- Sound Matching
- Picture Identification
- Sorting
- Number Matching
- Size Sorting
- Memory Matching
- Daily Routine Sequencing
- Emotion Matching
- Handwashing Steps
- Money Identification

## Standard performance fields
`accuracy`, `score`, `completionRate`, `timeTaken`, `efficiencyScore`, `performanceIndex`, `attempts`, `helpRequests`, `stepResults`, `facpScore`, `domain`, `level`, `gameType`.

## FACP mapping
Each activity has a project-aligned FACP domain and skill mapping in the activity registry. This is an application mapping, not a claim that the displayed wording is a verbatim transcription of the official FACP checklist.

## Important recommendation behavior
A recommendation is not based on accuracy alone. The adaptive service considers current performance, FACP, support/help signals, recent modules, domain mastery and activity difficulty. With enough real transition data, Bayesian Knowledge Tracing (BKT) predicts the next module; before that, the deterministic fallback avoids repeating the current activity and ranks candidates by difficulty, recency and weakest domain.

## Timeout behavior
At 0 seconds the current session is submitted once. The session has a finish lock so timeout and normal completion cannot create duplicate results.
