# LearnAble – FACP Integration Build

This build extends the existing LearnAble codebase instead of replacing the application.

## Included in this build

1. FACP assessment catalogue already present in the project is retained.
2. FACP performance codes include Yes, C, VP, GP, PP, NE, NA and `-`.
3. FACP Assessment UI now captures:
   - Student
   - Functional level
   - Assessment period (Entry / Quarter 1 / Quarter 2 / Quarter 3 / Quarter 4) and academic year/year-in-level
   - FACP domain
   - Observation code for each available skill
   - Teacher notes
4. The backend stores the original FACP observation code and assessment metadata.
5. Overall FACP score is recalculated from the latest observation for each FACP item, so repeated observations do not inflate the denominator.
6. Student Profile displays the live FACP score and domain-level FACP progress.
7. Activity results continue to snapshot the learner's FACP score for adaptive/ML features.
8. ALPI remains separate from FACP. It is a recency-weighted ongoing performance index; FACP remains the learner baseline.
9. The existing ML service can use FACP score as one of its prediction features.

## FACP score used by the project

For the current project implementation:

`FACP project percentage = (Yes + C observations / applicable observations) × 100`

`NA` and unobserved `-` are excluded. `VP`, `GP`, `PP` and `NE` are recorded but are not treated as achieved.

This is a project-level computational mapping. The original observation code is always preserved in the database.

## Run

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

ML service:
```bash
cd backend
python -m pip install -r requirements-ml.txt
python -m uvicorn ml_service:app --host 127.0.0.1 --port 8001
```

Create your own `backend/.env` from `backend/.env.example`.

## Important

The ZIP intentionally omits `node_modules`, Python cache files and the private `.env`. Run `npm install` in backend and frontend before starting the application.
