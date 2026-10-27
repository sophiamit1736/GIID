# LearnAble - Demo implementation update

## What changed
- Brushing Teeth now uses the videos already placed in `frontend/public/learning/videos/brushing/`.
- Brushing Teeth is reduced to 8 clear learner-friendly steps:
  1. Find toothbrush
  2. Pick up toothbrush
  3. Open toothpaste
  4. Put toothpaste on brush
  5. Wet toothbrush
  6. Brush teeth
  7. Rinse mouth
  8. Put toothbrush back
- LearningScreen games now require/select a learner and save their completed score to MongoDB.
- Saved scores use the existing `ActivityResult` collection and therefore feed the existing ALPI calculation (recency-weighted average of the latest 10 activity Performance Index values).
- Shape Matching, Colour Matching, Animal Matching, Alphabet Matching, Fruit Matching, Picture ID, Sorting, Number Matching, Size Sorting and Sound Matching all use the same result-saving path.
- Existing admin activity delete endpoint remains protected by the admin role.
- `LearningModule.action` remains `Mixed`, so guided-step action objects are accepted.

## Run
### Backend
```powershell
cd backend
npm install
node server.js
```

### ML service (optional but already part of the project)
```powershell
cd backend
pip install -r requirements-ml.txt
python ml_service.py
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

Before running the brushing update, make sure MongoDB is configured in `backend/.env`, then:
```powershell
cd backend
node updateBrushingModule.js
```

The videos are served from Vite's `public` folder, so the browser paths are `/learning/videos/brushing/...`.
