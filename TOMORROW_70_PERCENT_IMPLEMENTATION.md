# LearnAbleAI — Tomorrow's 70% Implementation Plan

## What this version represents

The current semester deliverable is a working prototype that can be handed to the institute for student usage and data collection.

The target is **70% implementation of the full MTech research system**, not completion of every FACP activity or final ML validation.

### Current semester
1. Student management
2. FACP assessment framework and baseline storage
3. Representative FACP/learning activities
4. Learning-module interaction and assessments
5. Games with score/accuracy/attempt/time tracking
6. ALPI calculation from activity performance
7. Preliminary adaptive recommendation
8. Teacher/admin analytics and reports
9. Data-collection layer for institute deployment

### Next semester
1. Collect and clean real student interaction data
2. Feature engineering
3. Train/validate ML models using real longitudinal observations
4. Investigate/implement BKT or another knowledge-tracing approach
5. Compare models and tune adaptive recommendations
6. Evaluate personalization with real students
7. Expand the activity library and FACP coverage

## Run tomorrow

### Backend

```powershell
cd C:\path\to\LearnAbleAI\backend
npm install
npm run seed:giid
npm run seed:modules
npm run seed:demo-results
npm start
```

`seed:demo-results` is optional for a demonstration. It creates clearly marked demo records (`isDemoData=true`) and does not represent real student data.

### Frontend

```powershell
cd C:\path\to\LearnAbleAI\frontend
npm install
npm run build
npm run dev
```

## Demo flow for the panel

1. Login as teacher/admin.
2. Open Students.
3. Select a student.
4. Show FACP status:
   - baseline is **Pending** until the Entry assessment is actually completed/finalized;
   - do not manually invent a baseline just to remove the Pending label.
5. Open FACP Assessment.
6. Record representative FACP observations.
7. Open a learning module.
8. Complete an assessment/activity.
9. Show that score, accuracy, attempts, time and performance index are stored.
10. Open Analytics/ALPI and show the updated ALPI.
11. Open the recommended next activity.
12. Open **Data Collection** and show the fields that are being collected for future real-world data.
13. Explain that institute deployment generates the real longitudinal dataset for next semester.

## Important ML wording

Do not say that LearnAble already has a large trained GIID ML dataset.

Use:

> "The current semester implements the initial adaptive prediction pipeline and data-collection mechanism. The prototype is being deployed to collect real student interaction data. In the next semester, those longitudinal observations will be used for model training, validation and knowledge tracing."

If the ML service is unavailable, the backend uses a deterministic adaptive baseline. It is **not** a trained BKT model.

## FACP and ALPI boundary

- FACP score = functional assessment evidence.
- FACP baseline = Entry assessment snapshot and is not overwritten by later activity results.
- Learning-module/game results = interaction evidence.
- ALPI = recent activity-performance index.
- Recommendation = uses available FACP/ALPI/performance context.
- Real-world validation = next-semester work.

## What "70%" means

It means the **core end-to-end platform is working**:

Student -> FACP -> Learning -> Activity/Game -> Result storage -> ALPI -> Recommendation -> Reports -> Data collection.

It does **not** mean 100% of the 709 catalogue activities have been manually converted into multimedia learning modules.

## Before institute handover

- [ ] Verify MongoDB connection
- [ ] Verify teacher/admin login
- [ ] Verify at least one active student
- [ ] Verify representative learning modules
- [ ] Verify result records are saved
- [ ] Verify ALPI changes after activity completion
- [ ] Verify Data Collection page loads
- [ ] Remove demo records before real deployment:

```javascript
db.activityresults.deleteMany({ isDemoData: true })
```

or run an equivalent MongoDB delete operation.

- [ ] Keep a backup of the real deployment database
- [ ] Preserve the raw activity-result records for next-semester research
