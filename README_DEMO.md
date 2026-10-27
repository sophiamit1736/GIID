# LearnAble - Demo Build

This build adds:
1. Real backend AI activity generation through Groq when GROQ_API_KEY is configured.
2. Strict AI-generation failure handling: if Groq is unavailable, the system returns an error instead of presenting hardcoded content as AI-generated.
3. Micro-step ADL activities with English + Tamil fields and video slots.
4. Correct MongoDB interactiveSteps.action schema using Mixed, so action objects no longer cause Mongoose CastError.
5. Duplicate activity prevention during creation/AI approval.
6. Admin-only learning-module deletion.
7. ML service using Bayesian Knowledge Tracing (BKT) when enough sequential student-result history exists, with a transparent fallback for small datasets.
8. Adaptive recommendation returns ML prediction alongside ALPI and recommendation.

## Backend
cd backend
npm install
copy .env.example .env
# edit .env with MongoDB, JWT secret and GROQ_API_KEY
npm run dev

## ML service (second terminal)
cd backend
start-ml.bat

## Frontend (third terminal)
cd frontend
npm install
npm run dev

## Videos
Place step videos under frontend/public/learning/videos/<skill-slug>/
Example:
frontend/public/learning/videos/brushing-teeth/step-1.mp4
frontend/public/learning/videos/brushing-teeth/step-2.mp4

The generated activity intentionally does NOT invent external video URLs. Add only videos you have rights to use.

## Demo flow
Admin/Teacher -> AI Activity Generator -> choose Brushing Teeth -> Generate Automatically -> review micro steps -> Approve Activity -> Learning Modules.
Student -> select student -> complete activity -> result stored -> ALPI updated -> adaptive summary/ML prediction available.
Admin -> Learning Modules -> delete button.
