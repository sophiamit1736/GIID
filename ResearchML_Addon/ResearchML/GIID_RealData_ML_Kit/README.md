# GIID LearnAble — Real Activity Data ML Experiment

This kit exports non-demo ActivityResult records from the configured MongoDB, anonymizes student identifiers, then trains/evaluates a preliminary model to predict the next recorded activity's performance band from the previous activity's features.

## 1. Export from MongoDB

Open PowerShell in `GIID/backend` (where `.env`, `node_modules`, `models/ActivityResult.js` are present). Copy `export_giid_activity_data.js` into that `backend` folder, then run:

```powershell
node .\export_giid_activity_data.js
```

It reads `MONGO_URI` from `backend/.env`, excludes records with `isDemoData=true`, does not export student names/codes, and writes `backend/giid_activity_export.csv`. It prints counts by `dataSource`. Review these counts: `prototype` means the schema's default source label and should not automatically be described as institution-validated data. The export is all non-demo rows, not proof every row is an observed real student session.

## 2. Install ML packages

Use the Python 3.11 virtual environment. From `GIID/backend`:

```powershell
python -m pip install -r .\requirements-ml-experiment.txt
```

Copy `train_next_performance.py` and `requirements-ml-experiment.txt` into `GIID/backend`, beside `giid_activity_export.csv`, then run:

```powershell
python .\train_next_performance.py --csv .\giid_activity_export.csv
```

Strict institute-only mode, if the source counts show real records explicitly labelled `institute`:

```powershell
python .\train_next_performance.py --csv .\giid_activity_export.csv --data-source institute
```

## 3. Outputs

- `ml_results/metrics.json`: test-set accuracy, balanced accuracy, macro F1, majority-class baseline, class distribution and confusion matrix.
- `ml_results/holdout_predictions.csv`: actual vs predicted test labels.
- `ml_results/giid_next_performance_model.joblib`: fitted model.

The model predicts the next activity's observed accuracy band using the previous activity's data. Bands are experimental: Low <50, Developing 50–79, High 80–100; these are NOT official FACP thresholds. This is a preliminary supervised-learning experiment, not the existing BKT model. The model cannot provide honest accuracy until there are enough repeated, non-demo records. The script exits rather than inventing results if data is insufficient.

## Privacy and evaluation

Student names and student codes are not exported. Student IDs are hashed to stable pseudonyms to link a learner's history. Keep the CSV and model securely; do not commit them to Git or share raw institutional data without authorization. Report the actual test-set size, class balance, split method, baseline, and metrics together. If fewer than five learners have repeated records, the script warns that the fallback random transition split may be optimistic.
