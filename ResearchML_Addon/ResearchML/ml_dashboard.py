"""Local research dashboard. Upload/export CSV; no data is sent to a third party."""
import streamlit as st, pandas as pd, json, subprocess, sys
from pathlib import Path
st.set_page_config(page_title='LearnAble ML Research Lab',page_icon='🧠',layout='wide')
st.title('🧠 GIID LearnAble — ML Research Lab')
st.caption('Local experimental dashboard • Non-demo activity data • Predictive model comparison')
st.info('Research demo only. Scores depend on the uploaded data and split strategy. Do not present synthetic/demo records as real GIID observations.')
with st.sidebar:
 st.header('1 · Activity data')
 uploaded=st.file_uploader('Upload giid_activity_export.csv',type='csv')
 st.caption('Export from your own backend/MongoDB first. Never upload .env or credentials.')
 if uploaded:
  df=pd.read_csv(uploaded); st.success(f'{len(df):,} rows loaded')
  if st.button('Run model comparison',type='primary'):
   work=Path('ml_dashboard_run'); work.mkdir(exist_ok=True); csv=work/'giid_activity_export.csv'; uploaded.seek(0); csv.write_bytes(uploaded.getvalue())
   with st.spinner('Training comparison models and creating visualizations...'):
    res=subprocess.run([sys.executable,str(Path(__file__).with_name('compare_models.py')),'--csv',str(csv),'--out',str(work/'ml_results')],capture_output=True,text=True)
   (work/'last_run.log').write_text(res.stdout+'\n'+res.stderr,encoding='utf-8')
   st.session_state['ml_run_dir']=str(work/'ml_results'); st.session_state['ml_log']=res.stdout+'\n'+res.stderr
   if res.returncode: st.error('Training stopped. Review the data requirement / error below.')
   else: st.success('Comparison completed. Metrics are shown below.')
run=Path(st.session_state.get('ml_run_dir','ml_dashboard_run/ml_results'))
if 'ml_log' in st.session_state:
 with st.expander('Training log',expanded=False): st.code(st.session_state['ml_log'])
metrics_path=run/'metrics.json'
if metrics_path.exists():
 m=json.loads(metrics_path.read_text(encoding='utf-8')); scores=pd.DataFrame(m['metrics'])
 c1,c2,c3,c4=st.columns(4); c1.metric('Transitions',m['n_transitions']); c2.metric('Students',m['n_students']); c3.metric('Best model (macro-F1)',m['best_by_macro_f1']); c4.metric('Split', 'Student holdout' if 'student' in m['split_strategy'].lower() else 'Row split')
 st.subheader('Model score comparison')
 st.dataframe(scores.sort_values('macro_f1',ascending=False).style.format({c:'{:.3f}' for c in ['accuracy','balanced_accuracy','macro_precision','macro_recall','macro_f1']}),use_container_width=True,hide_index=True)
 if (run/'model_score_comparison.png').exists(): st.image(str(run/'model_score_comparison.png'),use_container_width=True)
 st.subheader('Confusion matrices')
 imgs=sorted(run.glob('confusion_*.png'))
 cols=st.columns(2)
 for i,p in enumerate(imgs):
  with cols[i%2]: st.image(str(p),caption=p.stem.replace('confusion_','').replace('_',' ').title(),use_container_width=True)
 c1,c2=st.columns(2)
 with c1:
  p=run/'target_class_support.png'
  if p.exists(): st.image(str(p),use_container_width=True)
 with c2:
  p=run/'feature_importance.png'
  if p.exists(): st.image(str(p),use_container_width=True)
 st.subheader('Prediction examples')
 pred=run/'holdout_predictions.csv'
 if pred.exists(): st.dataframe(pd.read_csv(pred).head(100),use_container_width=True,hide_index=True)
 st.caption('Target = next recorded activity performanceIndex band (experimental: <50, 50–79, 80–100). These are not official FACP cutoffs. Prediction performance is not proof of learning improvement.')
 for p in [metrics_path,run/'model_comparison.csv',pred,run/'best_model.joblib']:
  if p.exists(): st.download_button(f'Download {p.name}',p.read_bytes(),file_name=p.name)
else:
 st.markdown('### Demo workflow')
 st.write('1. Export activity data from the backend. 2. Upload the CSV in the sidebar. 3. Click **Run model comparison**. 4. Review metrics, confusion matrices, class balance, and predictions.')
 st.write('Models: Dummy baseline, Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, Extra Trees. BKT remains a separate skill-mastery component in the main platform.')
