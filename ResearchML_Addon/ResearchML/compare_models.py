"""Compare baseline and tabular models on chronological next-activity transitions.
Uses student-group holdout when enough distinct students exist. Metrics are experimental, not clinical/FACP validation."""
from pathlib import Path
import argparse, json, warnings
import numpy as np, pandas as pd
import matplotlib.pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, GradientBoostingClassifier, ExtraTreesClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.dummy import DummyClassifier
from sklearn.model_selection import GroupShuffleSplit, train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import accuracy_score, balanced_accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix, ConfusionMatrixDisplay

FEATURES_NUM = [
    'prev_accuracy',
    'prev_performanceIndex',
    'prev_completionRate',
    'prev_efficiencyScore',
    'prev_timeTaken',
    'prev_attempts',
    'prev_helpRequests',
    'prev_wrongAnswers',
    'prev_correctAnswers',
    'prev_totalQuestions',
    'prev_facpScore'
]
FEATURES_CAT=['prev_activityName','prev_domain','prev_gameType','prev_evidenceType','prev_moduleId','prev_learningLevel','prev_dataSource']
TARGET='target_band'
def band(v):
    if pd.isna(v): return np.nan
    v=float(v)
    return 'Low (<50)' if v<50 else ('Developing (50–79)' if v<80 else 'High (80–100)')
def build_transitions(path, source='all'):
    df=pd.read_csv(path)
    if 'isDemoData' in df: df=df[~df.isDemoData.astype(str).str.lower().isin(['true','1','yes'])]
    if source!='all' and 'dataSource' in df: df=df[df.dataSource.astype(str).str.lower()==source.lower()]
    if df.empty: raise ValueError('No non-demo records found after filters.')
    if 'completedAt' not in df or 'student_hash' not in df: raise ValueError('CSV must contain completedAt and student_hash columns.')
    df['completedAt'] = pd.to_datetime(
    df['completedAt'].astype(str).str.replace(
        r'\s+\(India Standard Time\)$', '', regex=True
    ),
    format='%a %b %d %Y %H:%M:%S GMT%z',
    errors='coerce',
    utc=True
); df=df.dropna(subset=['completedAt','student_hash'])
    for c in ['performanceIndex','accuracy','completionRate','efficiencyScore','timeTaken','attempts','helpRequests','wrongAnswers','correctAnswers','totalQuestions','facpScore','level']:
        if c in df: df[c]=pd.to_numeric(df[c],errors='coerce')
    if 'performanceIndex' not in df: df['performanceIndex']=df.get('accuracy',pd.Series(index=df.index,dtype=float))
    df=df.sort_values(['student_hash','completedAt'])
    rows=[]
    for sid,g in df.groupby('student_hash',sort=False):
        recs=g.to_dict('records')
        for prev,nxt in zip(recs,recs[1:]):
            if pd.isna(nxt.get('performanceIndex')): continue
            row={'student_hash':sid,'target_band':band(nxt.get('performanceIndex')),'age':np.nan}
            for k in ['accuracy','performanceIndex','completionRate','efficiencyScore','timeTaken','attempts','helpRequests','wrongAnswers','correctAnswers','totalQuestions','facpScore']:
                row['prev_'+k]=prev.get(k,np.nan)
            row['prev_level_num']=prev.get('level',np.nan)
            for k in ['activityName','domain','gameType','evidenceType','moduleId','dataSource']:
                row['prev_'+k]=prev.get(k,'Unknown')
            row['prev_learningLevel']=prev.get('learningLevel','Unknown')
            rows.append(row)
    out=pd.DataFrame(rows)
    if out.empty: raise ValueError('No next-activity transitions found. Need at least two dated activities per student with performanceIndex.')
    for c in FEATURES_NUM:
        if c not in out: out[c]=np.nan
    for c in FEATURES_CAT:
        if c not in out: out[c]='Unknown'
    return out.dropna(subset=[TARGET])
def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--csv',default='giid_activity_export.csv'); ap.add_argument('--data-source',default='all',help='all or exact source such as institute'); ap.add_argument('--out',default='ml_results'); args=ap.parse_args()
    outdir=Path(args.out); outdir.mkdir(parents=True,exist_ok=True)
    data=build_transitions(args.csv,args.data_source)
    data.to_csv(outdir/'transition_dataset.csv',index=False)
    print(f'Transitions: {len(data)} | students: {data.student_hash.nunique()} | classes: {data[TARGET].value_counts().to_dict()}')
    if len(data)<20 or data[TARGET].nunique()<2: raise SystemExit('Insufficient transitions/classes for a meaningful model comparison. Need >=20 transitions and >=2 target bands. No scores generated.')
    X=data[FEATURES_NUM+FEATURES_CAT]; y=data[TARGET]; groups=data.student_hash
    if groups.nunique()>=5:
        split=GroupShuffleSplit(n_splits=1,test_size=.25,random_state=42); tr,te=next(split.split(X,y,groups))
        split_note='GroupShuffleSplit by student (held-out students)'
    else:
        try: tr,te=train_test_split(np.arange(len(y)),test_size=.25,random_state=42,stratify=y); split_note='Stratified row split (few students; optimistic leakage risk)'
        except ValueError: tr,te=train_test_split(np.arange(len(y)),test_size=.25,random_state=42); split_note='Random row split (small dataset; interpret cautiously)'
    # Preprocess separately per pipeline. HistGradientBoosting is omitted because categorical one-hot sparse support varies by sklearn version.
    num=Pipeline([('impute',SimpleImputer(strategy='median',add_indicator=True)),('scale',StandardScaler())])
    cat=Pipeline([('impute',SimpleImputer(strategy='most_frequent')),('onehot',OneHotEncoder(handle_unknown='ignore'))])
    prep=ColumnTransformer([('num',num,FEATURES_NUM),('cat',cat,FEATURES_CAT)])
    models = {
    'Dummy baseline': DummyClassifier(strategy='most_frequent'),

    'Logistic Regression': LogisticRegression(
        max_iter=1000,
        class_weight='balanced'
    ),

    'Decision Tree': DecisionTreeClassifier(
        max_depth=4,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42
    ),

    'Random Forest': RandomForestClassifier(
        n_estimators=100,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    ),

    'Gradient Boosting': GradientBoostingClassifier(
        n_estimators=50,
        max_depth=2,
        random_state=42
    ),

    'Extra Trees': ExtraTreesClassifier(
        n_estimators=100,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
}
    records=[]; predrows=[]; fitted={}
    for name,model in models.items():
      pipe=Pipeline([('prep',prep),('model',model)])
      try:
       pipe.fit(X.iloc[tr],y.iloc[tr]); pred=pipe.predict(X.iloc[te]);
       p,r,f,_=precision_recall_fscore_support(y.iloc[te],pred,average='macro',zero_division=0)
       records.append({'model':name,'accuracy':accuracy_score(y.iloc[te],pred),'balanced_accuracy':balanced_accuracy_score(y.iloc[te],pred),'macro_precision':p,'macro_recall':r,'macro_f1':f})
       fitted[name]=pipe
       for ix,actual,pr in zip(te,y.iloc[te],pred): predrows.append({'model':name,'student_hash':groups.iloc[ix],'actual_band':actual,'predicted_band':pr,'correct':actual==pr})
       print(f"{name}: accuracy={accuracy_score(y.iloc[te],pred):.3f}, macro-F1={f:.3f}")
      except Exception as e: warnings.warn(f'{name} failed: {e}')
    if not records: raise SystemExit('All models failed; inspect dataset and dependency versions.')
    metrics=pd.DataFrame(records).sort_values('macro_f1',ascending=False); metrics.to_csv(outdir/'model_comparison.csv',index=False); pd.DataFrame(predrows).to_csv(outdir/'holdout_predictions.csv',index=False)
    labels=sorted(y.iloc[te].unique())
    # chart 1: horizontal lollipop-ish metric comparison
    ax=metrics.sort_values('macro_f1').plot(x='model',y=['accuracy','balanced_accuracy','macro_f1'],kind='barh',figsize=(11,6),width=.78)
    ax.set_xlim(0,1); ax.set_xlabel('Score (0–1)'); ax.set_ylabel(''); ax.set_title('Held-out model comparison'); ax.grid(axis='x',alpha=.25); plt.tight_layout(); plt.savefig(outdir/'model_score_comparison.png',dpi=160); plt.close()
    # per-model confusion matrices
    for name,pipe in fitted.items():
      cm=confusion_matrix(y.iloc[te],pipe.predict(X.iloc[te]),labels=labels)
      fig,ax=plt.subplots(figsize=(6,5)); disp=ConfusionMatrixDisplay(cm,display_labels=labels); disp.plot(ax=ax,cmap='Blues',colorbar=False,xticks_rotation=25); ax.set_title(f'Confusion Matrix — {name}'); plt.tight_layout(); plt.savefig(outdir/('confusion_'+''.join(c.lower() if c.isalnum() else '_' for c in name).strip('_')+'.png'),dpi=160); plt.close()
    # target class distribution dot chart
    counts=y.value_counts().reindex(['Low (<50)','Developing (50–79)','High (80–100)']).dropna()
    fig,ax=plt.subplots(figsize=(8,4)); ax.barh(counts.index,counts.values); ax.set_xlabel('Transition count'); ax.set_title('Target performance-band support'); ax.grid(axis='x',alpha=.25); plt.tight_layout(); plt.savefig(outdir/'target_class_support.png',dpi=160); plt.close()
    best_name=metrics.iloc[0]['model']; best=fitted[best_name]; best_pred=best.predict(X.iloc[te]); report=classification_report(y.iloc[te],best_pred,output_dict=True,zero_division=0)
    import joblib; joblib.dump({'pipeline':best,'features_num':FEATURES_NUM,'features_cat':FEATURES_CAT,'target_classes':list(best.classes_),'target_definition':'Next recorded activity performanceIndex band; experimental thresholds <50, 50-79, 80-100','split_note':split_note},outdir/'best_model.joblib')
    summary={'n_activity_records':int(pd.read_csv(args.csv).shape[0]),'n_transitions':int(len(data)),'n_students':int(groups.nunique()),'target_distribution':y.value_counts().to_dict(),'split_strategy':split_note,'best_by_macro_f1':best_name,'best_model_report':report,'metrics':metrics.to_dict(orient='records'),'important_caveat':'Experimental observational prediction, not evidence of causal learning gain or official FACP classification.'}
    (outdir/'metrics.json').write_text(json.dumps(summary,indent=2,default=float),encoding='utf-8')
    # feature importance if supported
    estimator=best.named_steps['model']
    if hasattr(estimator,'feature_importances_'):
      try:
       names=best.named_steps['prep'].get_feature_names_out(); imp=pd.DataFrame({'feature':names,'importance':estimator.feature_importances_}).sort_values('importance').tail(18)
       fig,ax=plt.subplots(figsize=(9,6)); ax.barh(imp.feature,imp.importance); ax.set_title(f'Feature importance — {best_name}'); ax.set_xlabel('Importance'); plt.tight_layout(); plt.savefig(outdir/'feature_importance.png',dpi=160); plt.close()
       imp.to_csv(outdir/'feature_importance.csv',index=False)
      except Exception as e: print('Feature importance chart skipped:',e)
    print(f'\nSaved metrics and charts to {outdir.resolve()}')
    print('Split:',split_note,'| Best by macro-F1:',best_name)
if __name__=='__main__': main()
