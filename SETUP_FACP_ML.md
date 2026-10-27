# LearnAble – FACP + ALPI + AI/ML additions

This build keeps the supplied frontend as the UI/layout source of truth. Existing pages, game components, colours, navigation and learning screens were not replaced with a redesigned UI.

## Backend

```bash
cd backend
npm install
npm run seed:modules
npm run dev
```

Create `backend/.env` from `.env.example` and set your own MongoDB/JWT/Groq values. The distributed ZIP intentionally does not contain the private `.env` from the supplied project.

## ML service

```bash
cd backend
python -m pip install -r requirements-ml.txt
python -m uvicorn ml_service:app --host 127.0.0.1 --port 8001
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Implemented functionality

- FACP assessment endpoint and teacher/admin assessment UI at `/observation/:studentId`.
- FACP performance codes: Yes, C, VP, GP, PP, NE, NA and `-`; the original observation code is preserved.
- FACP calculation: Yes/C are treated as achievement for the project percentage; VP/GP/PP/NE are recorded observations but are not counted as achievement; only NA is excluded from the denominator; `-` is recorded as No and is not a pass.
- 80% FACP achievement is exposed as the progression criterion.
- Latest observation for each FACP item is used when recalculating the student's overall FACP score, so repeated assessments do not inflate the score.
- FACP score, applicable count, achieved count and assessment date are stored on the student.
- Activity results store the FACP snapshot and observable step-level result data.
- ALPI remains the transparent recency-weighted average of the latest 10 activity Performance Index values.
- Bayesian Knowledge Tracing (BKT) recommendation receives FACP score as an ML feature.
- FACP remains the baseline. The 80% criterion is used for the project progression flag; ALPI/ML may still recommend guided practice before that threshold.
- AI generator approval route is connected to the existing generator UI; both admin and teacher can use it.
- AI/local generated modules are normalised to valid LearningModule activity types.
- All 44 seeded learning modules receive observable interactive micro-steps; Brushing Teeth contains exactly 9 distinct video clips from the supplied project assets.
- Student DOB is stored and age calculation is date-aware.

## Admin login and live data

After creating `backend/.env`:

```bash
cd backend
npm run seed:admin
```

This creates/refreshes the admin account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env` (defaults are provided only for local development). The home screen now has separate Teacher Login and Admin Login entry points, and the backend enforces the selected role at login.

Dashboard, Admin, Analytics, Reports and Settings read from MongoDB/API endpoints. Reports can be printed to PDF through the browser print dialog and downloaded as CSV from the live report endpoint.

## ML next-activity prediction

The ML service uses **Bayesian Knowledge Tracing (BKT)**. Each completed activity is a learner-specific sequential observation. When an activity is mapped to FACP item codes, BKT tracks mastery at item/skill level; otherwise it tracks the activity domain. FACP item/domain evidence provides the prior when available. The resulting mastery estimates are used to rank active candidate activities by weakest domain, suitable difficulty, recent history and learner level. This design does not require a large labelled next-activity transition dataset and is appropriate for sparse learner data.

ALPI remains separate: it is the recency-weighted average of the latest 10 activity Performance Index values (0–100). FACP remains separate and follows the supplied checklist scoring rules.


## FACP assessment workflow

Teacher/Admin opens `/observation/:studentId`, selects the learner's functional level and assessment period, selects a FACP domain, and records the observed code for each available skill. The backend stores the assessment and recalculates the learner's overall score from the latest observation for each FACP item. The Student Profile displays the overall FACP score and domain-level progress.

The project keeps **FACP score and ALPI separate**:
- FACP score = functional-assessment result derived from the recorded FACP observations.
- ALPI = current prototype learning-performance index, calculated as the recency-weighted average of the latest 10 activity Performance Index values.
- The FACP score is also snapshotted into each new ActivityResult so the ML service can use the learner's functional-assessment state as a feature.

## Final adaptive scoring contract

### FACP
FACP is the functional baseline and is never modified by game performance.
For the quantitative checklist used by LearnAble:

`FACP % = (+ or C observations) / (all recorded observations except NA) × 100`

`+` and `C` are the quantifying/pass-level observations. `GP`, `VP`, `M`, `PP`, `-` and `NE` are recorded outcomes but are not points. `NA` is removed from the denominator. The 80% threshold is used for the project progression flag. Recreational A/B/C/D/E/NE grading is separate and is not included in this percentage.

Repeated assessments do not inflate the score: the latest observation for each checklist code is used for the learner's current baseline.

### ALPI
ALPI is a LearnAble project metric, not an official FACP score.

For each completed learning activity:

`accuracy = correct / total × 100`

`completion = completed items / total × 100`

`time efficiency = remaining time / time limit × 100` (when a time limit is recorded)

`independence = 100 - 5 × extra attempts - 15 × help requests`, clamped to 0–100

`efficiency = 60% time efficiency + 40% independence`

`performance index = 55% accuracy + 30% efficiency + 15% completion`

`ALPI = recency-weighted mean of the latest 10 performance indices`, with weights 1..10 so the newest activity has the highest influence.

The backend is authoritative for these calculations; client-supplied performance-index values are not trusted.

### Adaptive recommendation
FACP and ALPI are kept separate. A recommendation may use both through a project-specific readiness signal:

`readiness = 60% ALPI + 40% FACP` when an FACP baseline exists; otherwise readiness follows ALPI.

BKT then estimates learner mastery from sequential observations and ranks the next activity. Confidence is deliberately conservative when observations are sparse. This is a LearnAble adaptive-engine design, not an official FACP formula.
