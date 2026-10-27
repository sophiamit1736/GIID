# LearnAble AI Activity Generation — Student-Aware Automation

## What changed
The AI generator is no longer tied to the Brushing Teeth preset. The UI has two modes:

1. **Student-Aware mode** — select a real GIID student. The backend reads recent ActivityResult records, FACP observations, ALPI and active learning modules, identifies a weak domain, avoids recently repeated activities where possible, chooses a suitable difficulty, and generates a structured activity.
2. **Manual mode** — a teacher can still request any topic and game format.

## Generation pipeline

Student → recent game performance + FACP + ALPI → weak domain → candidate skill → difficulty → Groq AI → structured micro-steps + gameConfig → teacher review → Approve & Save → LearningModule.

## AI provider behavior

- With `GROQ_API_KEY`: Groq generates the structured activity JSON.
- Without a key or when the API is unavailable: LearnAble uses the local adaptive fallback. This is deterministic and demo-safe; it is not presented as an AI model.

## GIID student data

The supplied GIID register was normalized from the `Altogether` sheet into 100 unique admission-number records. The seed keeps operational fields such as admission number, name, group, DOB, age, gender, care type, ID-card number, disability type, percentage, UDID/enrollment number, case-assessment/FACP status and dates. Aadhaar was deliberately not copied into the application seed because it is not required for learning personalization.

Run:

```bash
cd backend
npm run seed:giid
```

The seed is idempotent by `studentCode` / admission number: existing records are updated rather than duplicated.
