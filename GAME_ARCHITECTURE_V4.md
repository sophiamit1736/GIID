# LearnAble Game Architecture v4

All dedicated games now follow one common session architecture.

## Standard session
1. Teacher selects learner.
2. 120-second timer starts.
3. Game records every interaction as an attempt.
4. Help button records help requests and reveals a simple hint.
5. Each completed question/step can produce a `stepResults` entry.
6. Timeout automatically submits the partial result.
7. Result metrics are calculated consistently:
   - accuracy
   - completion rate
   - time efficiency
   - efficiency score
   - performance index
   - attempts
   - help requests
   - time taken
8. Result is saved to `ActivityResult` with the current FACP score snapshot.
9. ALPI is updated by the backend.
10. Adaptive summary is requested immediately after saving.
11. The next activity is displayed on the result screen.

## Games covered
- Shape Matching / LearningScreen games
- Picture Identification
- Drag & Drop Sorting
- Memory Matching
- Daily Routine Sequencing
- Handwashing Steps
- Emotion Matching
- Money Identification

## Recommendation strategy
- Bayesian Knowledge Tracing (BKT) is used when the transition history is large enough (20+ transitions and 2+ target classes).
- Before that, the system uses a deterministic content-aware fallback. It considers the current activity, recent activities, recommended difficulty, and weakest observed domain instead of simply taking the first module in MongoDB.

This is an adaptive recommendation system, not a guarantee of perfect prediction. The quality of the trained model improves as real learner transitions accumulate.
