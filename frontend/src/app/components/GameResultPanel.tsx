import { useNavigate } from "react-router";

export default function GameResultPanel({ score, accuracy, timeTaken, recommendation, onRetry, saving, error, studentId }: any) {
  const navigate = useNavigate();
  return <div style={{background:"#fff",borderRadius:22,padding:32,textAlign:"center",boxShadow:"0 4px 20px rgba(21,101,192,.08)"}}>
    <div style={{fontSize:58}}>🎉</div>
    <h2 style={{color:"#0D2137",margin:"8px 0"}}>Activity Completed!</h2>
    {saving ? <p style={{color:"#607D8B"}}>Saving learner performance...</p> : <>
      <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap",margin:"18px 0"}}>
        <Metric label="Score" value={`${score}%`} /><Metric label="Accuracy" value={`${accuracy}%`} />{Number(timeTaken) > 0 && <Metric label="Time" value={`${timeTaken}s`} />}
      </div>
      {error && <p style={{color:"#C62828",fontSize:12}}>{error}</p>}
      {recommendation?.title && <div style={{margin:"20px auto",maxWidth:620,padding:18,borderRadius:18,background:"#F0F6FF",border:"1px solid #D5E6F7",textAlign:"left"}}>
        <div style={{fontSize:11,fontWeight:800,color:"#1565C0"}}>{recommendation?.activityMode === "game" || recommendation?.type === "game" ? "⭐ NEXT RECOMMENDED GAME" : "⭐ NEXT RECOMMENDED ACTIVITY"}</div>
        <div style={{fontSize:17,fontWeight:800,color:"#0D2137",marginTop:5}}>{recommendation.title}</div>
        <div style={{fontSize:12,color:"#607D8B",marginTop:5}}>{recommendation.reason || "Based on the learner's recent performance."}</div>
        {recommendation.confidence != null && <div style={{fontSize:10,color:"#7A6A20",marginTop:7}}>Confidence: {Math.round(Number(recommendation.confidence)*100)}%</div>}
        <button onClick={()=>recommendation.moduleId ? navigate(recommendation.activityMode === 'game' || recommendation.type === 'game' ? `/generated-game/${recommendation.moduleId}?studentId=${studentId||''}` : `/learning-modules/${recommendation.moduleId}`) : navigate(`/ai-generator?studentId=${studentId||''}`)} style={primary}>{recommendation.type === 'game-generation' ? '🤖 Generate Next Recommended Game →' : recommendation.activityMode === 'game' || recommendation.type === 'game' ? '🎮 Play Recommended Game →' : 'Start Recommended Activity →'}</button>
      </div>}
      <div style={{display:"flex",justifyContent:"center",gap:10}}><button onClick={onRetry} style={secondary}>🔄 Try Again</button><button onClick={()=>navigate("/activities")} style={primary}>Activity Library</button></div>
    </>}
  </div>;
}
function Metric({label,value}:{label:string,value:string}) { return <div style={{minWidth:95,padding:"10px 14px",borderRadius:14,background:"#F7FAFF"}}><div style={{fontSize:10,color:"#607D8B"}}>{label}</div><b style={{fontSize:18,color:"#1565C0"}}>{value}</b></div>; }
const primary:any={padding:"11px 18px",border:0,borderRadius:12,background:"#1565C0",color:"#fff",fontFamily:"Poppins",fontWeight:700,cursor:"pointer",marginTop:12};
const secondary:any={padding:"11px 18px",border:"1.5px solid #B8CCE0",borderRadius:12,background:"#fff",color:"#1565C0",fontFamily:"Poppins",fontWeight:700,cursor:"pointer"};
