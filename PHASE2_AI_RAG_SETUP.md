# LearnAble Phase-II: FACP-grounded AI Game Generation

## What is implemented
- Real Groq-based AI generation (no OpenAI dependency).
- RAG knowledge collection built from FACP assessments and active LearningModules.
- Student-aware generation uses FACP + ALPI + recent ActivityResult context.
- Generated game JSON is saved as a LearningModule after teacher approval.
- Generated games can be played from `/generated-game/:moduleId`.
- Gameplay writes ActivityResult through the existing ALPI pipeline.
- Learning level backfill from project-level FACP mapping.

## AI provider
This build uses Groq's OpenAI-compatible Chat Completions endpoint. The default model is `openai/gpt-oss-20b` because Groq's current documentation lists it as a production model and recommends it as the replacement for the deprecated `llama-3.1-8b-instant`. Do not put the API key in frontend code.

## Setup
1. Open `backend/.env`.
2. Fill your existing MongoDB URI and JWT secret.
3. Create a Groq API key and set `GROQ_API_KEY`.
4. Keep `GROQ_MODEL=openai/gpt-oss-20b` unless you intentionally choose another currently supported model.
5. From `backend` run:

```bash
npm install
npm run seed:rag
npm run backfill:levels
npm start
```

6. Start the frontend normally with `npm install` then `npm run dev`.

## Demo flow
Teacher -> AI Generator -> Student-Aware -> Generate -> view RAG Sources -> Approve & Save -> generated game opens -> select learner -> play -> result saved -> ALPI/adaptive recommendation updated.

## Important
There is no silent fallback to hardcoded activity content when real AI generation fails. The API returns an error so the demo cannot accidentally claim a hardcoded game is AI-generated. The old `fallbackActivity` function remains in the service only as a legacy helper and is not used by the real generation path.
