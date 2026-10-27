# LearnAble - 60% Implementation Demo

## Included
- Existing React + Express + MongoDB application.
- AI activity generator with Groq when credits are available.
- Offline/AI generation fails visibly when Groq is unavailable.
- Guided micro-step activities with bilingual English/Tamil fields.
- Flexible `interactiveSteps.action` schema using MongoDB Mixed, preventing the previous CastError.
- Activity duplicate protection on create, AI approve, and update.
- Admin-only activity deletion endpoint.
- ActivityResult storage and ALPI calculation from completed activity accuracy.
- Bayesian Knowledge Tracing (BKT) ML service for learner support prediction once enough history exists, with transparent fallback before that point.
- ML recommendation fields: recommended difficulty and next action.

## 1. Backend
```powershell
cd backend
npm install
copy .env.example .env
# Edit .env and set MONGO_URI/JWT_SECRET. GROQ_API_KEY is optional for the demo.
node server.js
```

## 2. ML service
Open another PowerShell:
```powershell
cd backend
pip install -r requirements-ml.txt
python -m uvicorn ml_service:app --host 127.0.0.1 --port 8001
```
Health check: `http://127.0.0.1:8001/health`

## 3. Frontend
Open another PowerShell:
```powershell
cd frontend
npm install
npm run dev
```

## 4. AI generation
Open **AI Activity Generator**. It works in two modes:
- Groq mode when a valid key with credits is configured.
- Local generator when the key is missing or out of credits.

AI generation is real Groq generation; if Groq fails, the request fails visibly rather than presenting hardcoded content as AI.

## 5. ML demo
Complete several activities for the same student and save the results. The backend stores accuracy, score, attempts, time taken and help requests. Once enough history is available, the FastAPI service trains a Bayesian Knowledge Tracing (BKT) classifier on the learner's prior results and returns a prediction plus recommended difficulty/next action.

## 6. Videos
No video files are included in this package. Existing video paths can still be stored in `interactiveSteps.video`. Put your own MP4 files under `frontend/public/learning/videos/...` and use the matching path in the module.

## Security
The real API key from the uploaded project was intentionally removed from this package. Do not commit an Groq secret to Git or share it with a client. Use a server-side environment variable in deployment.
