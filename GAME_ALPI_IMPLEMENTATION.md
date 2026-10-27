# LearnAble – 11 Games + Student Selection + ALPI

## Implemented

The Activity Library contains 11 games:
1. Shape Matching
2. Colour Matching
3. Animal Matching
4. Alphabet Matching
5. Fruit Matching
6. Picture Identification
7. Drag & Drop Sorting
8. Number Matching
9. Sound Matching
10. Memory Matching
11. Size Sorting

## Teacher → Student → Game → Result → ALPI

1. Teacher opens **Learning & Activities**.
2. Teacher selects a game.
3. The game screen requires a **student selection** before play starts.
4. The selected learner is shown in the game header.
5. When the game is submitted, the frontend sends the learner ID, game name, score, accuracy, attempts, time and help requests to `POST /api/results`.
6. The backend stores an `ActivityResult` document.
7. The backend recalculates ALPI for that student as the recency-weighted average of the latest 10 activity Performance Index values.
8. The updated ALPI is shown in the completion dialog.
9. The adaptive summary is refreshed so the existing ML/recommendation pipeline receives the latest performance history.

## ALPI calculation used by the current prototype

`ALPI = recency-weighted average of the latest 10 activity Performance Index values`

Example: 80%, 60%, 100% → ALPI = 80.

## ML connection

The existing ML service reads the student's stored activity history. The new game results therefore become additional training/prediction signals. The game screen does not invent an ML score; it stores actual gameplay performance first, then requests the adaptive summary.

## Videos

No videos are included in this package. Existing video paths in the project remain available under `frontend/public/learning/videos/` for the user's own media files.

## Run

Backend:
`cd backend` → `node server.js`

ML:
`cd backend` → `python -m pip install -r requirements-ml.txt` → `python -m uvicorn ml_service:app --host 127.0.0.1 --port 8001`

Frontend:
`cd frontend` → `npm install` → `npm run dev`
