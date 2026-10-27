import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import studentAPI from "../api/studentApi";

const P = "Poppins, sans-serif";
export type GameStudent = { _id: string; name: string; studentCode?: string };

export default function GameShell({ title, icon, studentId, onStudentChange, score, time, progress, children }: { title:string; icon:string; studentId:string; onStudentChange:(id:string)=>void; score?:number; time?:number; progress?:number; children:ReactNode }) {
  const navigate=useNavigate();
  const [students,setStudents]=useState<GameStudent[]>([]);
  const user=JSON.parse(localStorage.getItem("user")||"{}");
  useEffect(()=>{ studentAPI.get("/").then(r=>setStudents(r.data||[])).catch(()=>{}); },[]);
  const selected=students.find(s=>s._id===studentId);
  return <div style={{minHeight:"100vh",background:"#F0F6FF",fontFamily:P}}>
    <header className="la-game-shell-header" style={{position:"sticky",top:0,zIndex:20,background:"#fff",borderBottom:"1px solid rgba(21,101,192,.1)",padding:"14px 28px",display:"flex",alignItems:"center",gap:18}}>
      <button onClick={()=>navigate("/activities")} style={{border:0,background:"#EEF5FF",borderRadius:12,padding:"10px 14px",cursor:"pointer",fontFamily:P,color:"#1565C0",fontWeight:700}}>← Exit</button>
      <div style={{flex:1}}><div style={{fontSize:17,fontWeight:800,color:"#0D2137"}}>{icon} {title}</div><div style={{fontSize:11,color:"#4A6580"}}>Interactive learning activity</div></div>
      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,fontWeight:700,color:"#4A6580"}}>LEARNER</span><select value={studentId} onChange={e=>onStudentChange(e.target.value)} style={{border:"1.5px solid #cfe0f5",borderRadius:10,padding:"8px 10px",fontFamily:P,fontSize:12,minWidth:150}}><option value="">Select student</option>{students.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:12,background:"#F0F6FF"}}><div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#1565C0,#27ae60)",color:"#fff",display:"grid",placeItems:"center",fontWeight:800,fontSize:11}}>{(user.name||"U").split(" ").map((x:string)=>x[0]).join("").slice(0,2).toUpperCase()}</div><div><div style={{fontSize:11,fontWeight:700,color:"#0D2137"}}>{user.name||"User"}</div><div style={{fontSize:9,color:"#4A6580",textTransform:"capitalize"}}>{user.role||"teacher"}</div></div></div>
    </header>
    <div className="la-game-shell-main" style={{maxWidth:1080,margin:"0 auto",padding:"22px 24px 40px"}}>
      {selected && <div style={{background:"#E8F5E9",border:"1px solid #b8dfc4",borderRadius:12,padding:"9px 14px",fontSize:12,color:"#1b7a45",fontWeight:700,marginBottom:14}}>Learner: {selected.name}</div>}
      {(score!==undefined || time!==undefined || progress!==undefined) && <div style={{background:"#fff",border:"1px solid rgba(21,101,192,.08)",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",gap:18,marginBottom:16}}>{score!==undefined&&<span style={{fontSize:12,fontWeight:700,color:"#1565C0"}}>⭐ Score: {score}</span>}{time!==undefined&&<span style={{fontSize:12,fontWeight:700,color:"#4A6580"}}>⏱ {time}s</span>}{progress!==undefined&&<div style={{flex:1,height:7,borderRadius:99,background:"#EAF1F8",overflow:"hidden"}}><div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#1565C0,#27ae60)",borderRadius:99}}/></div>}</div>}
      {children}
    </div>
  </div>;
}
