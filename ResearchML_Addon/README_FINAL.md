# GIID LearnAble — Review 3 Research / ML add-on

This add-on provides a reproducible multi-model experiment and local Streamlit dashboard using activity records exported from the user's own MongoDB. It does **not** include or fabricate a trained model result: the data must be exported and the experiment run locally.

## What is included
- `ResearchML/export_giid_activity_data.js`: pseudonymized non-demo activity export from backend MongoDB.
- `ResearchML/compare_models.py`: compares Dummy baseline, Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, Extra Trees.
- `ResearchML/ml_dashboard.py`: local dashboard for metrics, score chart, confusion matrices, target class support, feature importance and held-out predictions.
- `FrontendPatches/AIActivityGeneratorPage.tsx`: corrected manual generation handler snippet/file for replacing the existing page only after reviewing imports/route compatibility.

## Run (Windows PowerShell)
1. Copy `ResearchML` into `GIID/backend/ResearchML` (or place it in backend root) and copy `export_giid_activity_data.js` into backend root if you prefer the simple command.
2. From backend root run: `node .\ResearchML\GIID_RealData_ML_Kit\export_giid_activity_data.js` (or adjust the path to where you put the exporter). It uses the backend's existing `.env`; do not share `.env`.
3. Install dependencies: `python -m pip install -r .\ResearchML\requirements-ml-experiment.txt`
4. Train CLI: `python .\ResearchML\compare_models.py --csv .\giid_activity_export.csv --out .\ml_results`
5. Dashboard: `python -m streamlit run .\ResearchML\ml_dashboard.py`
6. Upload `giid_activity_export.csv` in the dashboard and click Run model comparison.

## Interpretation / safeguards
- Demo rows (`isDemoData=true`) are excluded. If source filter is needed, use `--data-source institute` on the CLI. Exporter excludes demo rows but can include prototype rows; prototype is not automatically equivalent to validated institute data.
- Transitions are created from consecutive dated activity records for each pseudonymous student. Minimum 20 transitions and at least 2 target classes are required; more data is strongly preferred.
- When >=5 students are available, a student-group holdout is used. With fewer students, the script uses a row split and explicitly flags leakage/optimism risk.
- Bands (<50, 50–79, 80–100) are experimental bins of next activity `performanceIndex`, not official FACP thresholds.
- Do not claim model accuracy until the script has run on the actual exported dataset. Do not claim causal learning gains from prediction metrics.
- BKT in the platform estimates skill mastery and is not part of this next-activity band classification comparison because it serves a different purpose.

## Charts
The experiment writes model score comparison, per-model confusion matrices, target class support, and feature importance when supported. The dashboard is a local research/demo tool. It can be kept separate during GIID deployment and omitted from production deployment if desired.

## AI generator manual topic bug — critical note
The existing `AIActivityGeneratorPage.tsx` routes to `/ai/generate-for-student` whenever `studentId` is set, even in Manual mode. That can override the teacher's topic. In Manual mode, always call `/ai/generate` and pass `topic`, `requestedType`, `activityTypes`, `age`, `level`, `difficulty`, and `focus`. Backend endpoint must validate that the returned `skill`/`topic` matches the requested topic, and must not silently substitute another skill. This add-on includes a patch snippet; confirm the backend `/ai/generate` schema before merging.
