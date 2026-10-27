"""Train/evaluate an exploratory model to predict the NEXT recorded activity's performance band.
Uses only the user's exported GIID activity records. It does not fabricate results.
"""
import argparse, json, os, sys
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, balanced_accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
import joblib

NUMERIC = ['accuracy','performanceIndex','completionRate','efficiencyScore','timeTaken','timeLimit','attempts','helpRequests','facpScore','totalQuestions','correctAnswers','wrongAnswers']
CATEGORICAL = ['domain','gameType','evidenceType','level','activityName']
FEATURES = NUMERIC + CATEGORICAL

def performance_band(value):
    # Experimental bins for this mini-study, NOT official GIID/FACP cut-offs.
    if value < 50: return 'Low (<50)'
    if value < 80: return 'Developing (50-79)'
    return 'High (80-100)'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', default='giid_activity_export.csv')
    parser.add_argument('--outdir', default='ml_results')
    parser.add_argument('--data-source', choices=['all-non-demo','institute'], default='all-non-demo', help='Use institute only for strictly institutional observations; default includes non-demo records and reports sources.')
    args = parser.parse_args()
    if not os.path.exists(args.csv):
        sys.exit(f'CSV not found: {args.csv}. First run the Node export script from backend/.')
    df = pd.read_csv(args.csv)
    required = {'student_hash','completedAt','accuracy','isDemoData'}
    missing = required - set(df.columns)
    if missing: sys.exit('Missing required columns: ' + ', '.join(sorted(missing)))
    df = df[df['isDemoData'].astype(str).str.lower().isin(['false','0','no'])].copy()
    if args.data_source == 'institute':
        if 'dataSource' not in df: sys.exit('dataSource column missing; cannot safely isolate institute observations.')
        df = df[df['dataSource'].astype(str).str.lower() == 'institute'].copy()
    print('Rows after demo exclusion:', len(df))
    print('Data source counts:', df.get('dataSource', pd.Series(dtype=str)).value_counts(dropna=False).to_dict())
    if df.empty: sys.exit('No eligible real/non-demo records. Do not report ML accuracy until real activity records exist.')
    df['completedAt'] = pd.to_datetime(df['completedAt'], errors='coerce', utc=True)
    df['accuracy'] = pd.to_numeric(df['accuracy'], errors='coerce')
    df = df.dropna(subset=['student_hash','completedAt','accuracy']).sort_values(['student_hash','completedAt'])
    for col in NUMERIC:
        if col not in df: df[col] = np.nan
        df[col] = pd.to_numeric(df[col], errors='coerce')
    for col in CATEGORICAL:
        if col not in df: df[col] = 'Unknown'
        df[col] = df[col].fillna('Unknown').astype(str)
    # Pair each prior activity's features with the next activity's observed accuracy.
    records = []
    for sid, group in df.groupby('student_hash', sort=False):
        group = group.sort_values('completedAt')
        if len(group) < 2: continue
        prev = group.iloc[:-1].copy()
        nxt = group.iloc[1:]
        prev['target'] = nxt['accuracy'].to_numpy()
        prev['target_band'] = prev['target'].map(performance_band)
        prev['student_group'] = sid
        records.append(prev)
    if not records: sys.exit('Need at least two chronologically ordered activity records for one learner to form a next-activity example.')
    data = pd.concat(records, ignore_index=True)
    data = data[data['target'].between(0, 100)].copy()
    if len(data) < 20:
        sys.exit(f'Only {len(data)} next-activity examples are available. Need at least 20 for a preliminary holdout evaluation; collect more real activity sessions first.')
    if data['target_band'].nunique() < 2:
        sys.exit('Only one target performance band exists. Cannot train/evaluate a meaningful classifier yet.')
    X = data[FEATURES].copy()
    y = data['target_band']
    groups = data['student_group']
    # Prefer student-group holdout to reduce same-student leakage.
    unique_students = groups.nunique()
    if unique_students >= 5:
        splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
        train_idx, test_idx = next(splitter.split(X, y, groups))
        split_note = '75/25 student-group holdout; test students are not in training set.'
    else:
        counts = y.value_counts()
        if len(counts) < 2 or counts.min() < 2:
            sys.exit('Too few examples per performance class for a stratified holdout. Collect more sessions across learners/classes.')
        train_idx, test_idx = train_test_split(np.arange(len(data)), test_size=0.25, random_state=42, stratify=y)
        split_note = 'Random stratified transition holdout because fewer than 5 learners have repeated records; metrics may be optimistic due to same-learner overlap.'
    if len(set(y.iloc[train_idx])) < 2 or len(set(y.iloc[test_idx])) < 2:
        sys.exit('Train or test split contains fewer than two classes. Collect more balanced real observations before reporting accuracy.')
    numeric_pipe = Pipeline([('imputer', SimpleImputer(strategy='median'))])
    categorical_pipe = Pipeline([('imputer', SimpleImputer(strategy='most_frequent')), ('onehot', OneHotEncoder(handle_unknown='ignore'))])
    prep = ColumnTransformer([('num', numeric_pipe, NUMERIC), ('cat', categorical_pipe, CATEGORICAL)])
    model = Pipeline([('prep', prep), ('classifier', RandomForestClassifier(n_estimators=300, class_weight='balanced', random_state=42, min_samples_leaf=2))])
    model.fit(X.iloc[train_idx], y.iloc[train_idx])
    pred = model.predict(X.iloc[test_idx])
    majority = y.iloc[train_idx].value_counts(normalize=True).max()
    labels = sorted(set(y.iloc[train_idx]) | set(y.iloc[test_idx]))
    report = {
        'study': 'Exploratory next-activity performance-band prediction from GIID ActivityResult history',
        'target': 'next activity accuracy band: Low <50, Developing 50-79, High 80-100 (experimental bins; not official FACP thresholds)',
        'eligible_non_demo_records': int(len(df)), 'next_activity_examples': int(len(data)), 'unique_learners_with_transitions': int(unique_students),
        'train_examples': int(len(train_idx)), 'test_examples': int(len(test_idx)), 'split_method': split_note,
        'classes_in_dataset': y.value_counts().to_dict(),
        'accuracy': float(accuracy_score(y.iloc[test_idx], pred)),
        'balanced_accuracy': float(balanced_accuracy_score(y.iloc[test_idx], pred)),
        'macro_f1': float(f1_score(y.iloc[test_idx], pred, average='macro', zero_division=0)),
        'majority_class_baseline_accuracy': float(majority),
        'classification_report': classification_report(y.iloc[test_idx], pred, labels=labels, output_dict=True, zero_division=0),
        'confusion_matrix_labels': labels,
        'confusion_matrix': confusion_matrix(y.iloc[test_idx], pred, labels=labels).tolist(),
        'caveats': ['Evaluation uses only exported records and is not evidence of clinical/educational effectiveness.', 'Prototype records may not represent institutionally validated observations; inspect dataSource counts.', 'Performance bands are experimental bins, not official FACP cut-offs.', 'Metrics are unreliable with small or imbalanced data; report test-set size and baseline alongside accuracy.']
    }
    os.makedirs(args.outdir, exist_ok=True)
    joblib.dump(model, os.path.join(args.outdir, 'giid_next_performance_model.joblib'))
    with open(os.path.join(args.outdir, 'metrics.json'), 'w', encoding='utf-8') as f: json.dump(report, f, indent=2)
    pd.DataFrame({'actual': y.iloc[test_idx].to_numpy(), 'predicted': pred}).to_csv(os.path.join(args.outdir, 'holdout_predictions.csv'), index=False)
    print('\n=== GIID REAL-DATA ML HOLDOUT RESULTS ===')
    print(f"Next-activity examples: {len(data)} | train: {len(train_idx)} | test: {len(test_idx)}")
    print('Split:', split_note)
    print(f"Accuracy:          {report['accuracy']:.3f} ({report['accuracy']*100:.1f}%)")
    print(f"Balanced accuracy: {report['balanced_accuracy']:.3f} ({report['balanced_accuracy']*100:.1f}%)")
    print(f"Macro F1:          {report['macro_f1']:.3f}")
    print(f"Majority baseline: {report['majority_class_baseline_accuracy']:.3f} ({report['majority_class_baseline_accuracy']*100:.1f}%)")
    print('\nClassification report:')
    print(classification_report(y.iloc[test_idx], pred, labels=labels, zero_division=0))
    print('Saved model and results under:', os.path.abspath(args.outdir))

if __name__ == '__main__': main()
