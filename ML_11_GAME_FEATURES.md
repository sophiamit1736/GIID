# LearnAble — 11 Game ML/ALPI Integration

## Data flow
Teacher selects a student → student plays any of the 11 games → result is saved against that student → ALPI is recalculated from all completed activities → ML service receives the latest performance features → adaptive recommendation is returned.

## Stored features for every game
- accuracy: correct answers / total questions × 100
- completionRate: percentage of game items completed
- efficiencyScore: weighted combination of accuracy and remaining-time efficiency
- performanceIndex: combined mastery/efficiency signal used by the ML layer
- attempts, timeTaken, helpRequests, score
- gameType: identifies which of the 11 games produced the result

## ALPI
The current transparent prototype ALPI remains the recency-weighted average of the latest 10 activity Performance Index values. This means Shape Matching, Memory, Picture ID, Sorting, etc. all contribute to the same student's ALPI.

## ML
The Python service uses Bayesian Knowledge Tracing (BKT) when enough historical activity records exist (at least 8 training transitions and both outcome classes). Until then it uses a clearly labelled fallback. The ML output is used to choose Beginner/Intermediate/Advanced difficulty and the next action.

This is intentionally a demo-ready implementation: it does not claim that a tiny project dataset is a production-trained clinical model.
