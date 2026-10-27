import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion } from "motion/react";

const P = "Poppins, sans-serif";

/* ─── Shared sidebar nav ─── */
export function Sidebar({ active }: { active: string }) {

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const nav = [
    {
      label: "Dashboard",
      icon: "dashboard",
      to: "/dashboard",
    },
    {
      label: "Students",
      icon: "people",
      to: "/students",
    },
    {
      label: "Activities",
      icon: "extension",
      to: "/activities",
    },
    {
      label: "FACP Assessment",
      icon: "fact_check",
      to: "/facp",
    },
    {
      label: "Analytics",
      icon: "bar_chart",
      to: "/analytics",
    },
    {
      label: "Reports",
      icon: "description",
      to: "/reports",
    },
    {
      label: "Data Collection",
      icon: "storage",
      to: "/data-collection",
    },
    {
      label: "AI Generator",
      icon: "auto_awesome",
      to: "/ai-generator",
    },
    ...(user.role === "admin"
      ? [
          {
            label: "Admin",
            icon: "admin_panel_settings",
            to: "/admin",
          },
        ]
      : []),
    {
      label: "Settings",
      icon: "settings",
      to: "/settings",
    },
  ];

  return (
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{
        width: 240,
        background: "#0D2137",
        minHeight: "100vh",
        flexShrink: 0,
      }}
    >
      <Link to="/" style={{ textDecoration: "none" }}>
        <div
          className="flex items-center gap-3 px-6 py-5 border-b"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 40,
              height: 40,
              background:
                "linear-gradient(135deg,#1565C0,#27ae60)",
            }}
          >
            <span
              style={{
                fontFamily: P,
                fontWeight: 800,
                fontSize: 16,
                color: "#fff",
              }}
            >
              G
            </span>
          </div>

          <div>
            <div
              style={{
                fontFamily: P,
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
              }}
            >
              GIID
            </div>

            <div
              style={{
                fontFamily: P,
                fontWeight: 400,
                fontSize: 10,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              TAMBARAM
            </div>
          </div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">

        <div
          style={{
            fontFamily: P,
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.35)",
            paddingLeft: 12,
            marginBottom: 6,
          }}
        >
          MAIN MENU
        </div>

        {nav.map(({ label, icon, to }) => {

          const isActive = active === label;

          return (
            <Link
              key={label}
              to={to}
              style={{ textDecoration: "none" }}
            >
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg,rgba(21,101,192,0.6),rgba(13,158,110,0.4))"
                    : "transparent",
                }}
              >
                <span
                  className="material-icons-round"
                  style={{
                    color: isActive
                      ? "#fff"
                      : "rgba(255,255,255,0.5)",
                  }}
                >
                  {icon}
                </span>

                <span
                  style={{
                    color: isActive
                      ? "#fff"
                      : "rgba(255,255,255,0.6)",
                    fontFamily: P,
                  }}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div
        className="px-3 pb-6 border-t pt-4"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl w-full"
          style={{
            background: "transparent",
            color: "#ff7b7b",
            border: "none",
            cursor: "pointer",
            fontFamily: P,
          }}
        >
          <span className="material-icons-round">
            logout
          </span>

          Logout
        </button>
      </div>
    </aside>
  );
}

/* ─── Top bar ─── */
export function TopBar({
  title,
  subtitle,
  user,
}: {
  title: string;
  subtitle?: string;
  user?: { name: string; role: string };
}) {
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })();
  const currentUser = user || storedUser || { name: "User", role: "teacher" };

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "GI";

  return (
    <header
      className="flex items-center gap-4 px-8 py-4 border-b"
      style={{
        background: "#fff",
        borderColor: "rgba(21,101,192,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Title */}
      <div className="flex-1">
        <h1
          style={{
            fontFamily: P,
            fontWeight: 700,
            fontSize: 20,
            color: "#0D2137",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontFamily: P,
            fontWeight: 400,
            fontSize: 13,
            color: "#4A6580",
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: "#F0F6FF",
          border: "1.5px solid rgba(21,101,192,0.14)",
          width: 240,
        }}
      >
        <span
          className="material-icons-round"
          style={{ fontSize: 18, color: "#90a4b8" }}
        >
          search
        </span>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-transparent outline-none flex-1"
          style={{
            fontFamily: P,
            fontSize: 13,
            color: "#0D2137",
          }}
        />
      </div>

      {/* Notification */}
      <button
        className="relative flex items-center justify-center rounded-xl"
        style={{
          width: 40,
          height: 40,
          background: "#F0F6FF",
          border: "1.5px solid rgba(21,101,192,0.14)",
          cursor: "pointer",
        }}
      >
        <span
          className="material-icons-round"
          style={{
            fontSize: 20,
            color: "#1565C0",
          }}
        >
          notifications
        </span>

        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: "#EF5350" }}
        />
      </button>

      {/* Logged-in Teacher/Admin Profile */}
      <div style={{ position: "relative" }}>
      <button
        onClick={() => setProfileOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: "#F0F6FF", border: "1.5px solid rgba(21,101,192,0.14)", cursor: "pointer" }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            background:
              "linear-gradient(135deg,#1565C0,#27ae60)",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {initials}
        </div>

        <div>
          <div
            style={{
              fontFamily: P,
              fontWeight: 600,
              fontSize: 13,
              color: "#0D2137",
            }}
          >
            {currentUser?.name || "User"}
          </div>

          <div
            style={{
              fontFamily: P,
              fontSize: 11,
              color: "#4A6580",
            }}
          >
            {currentUser?.role || "teacher"}
          </div>
        </div>

        <span
          className="material-icons-round"
          style={{
            fontSize: 18,
            color: "#4A6580",
          }}
        >
          expand_more
        </span>
      </button>
      {profileOpen && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 210, background: "#fff", border: "1px solid rgba(21,101,192,0.12)", borderRadius: 14, boxShadow: "0 12px 30px rgba(13,33,55,.15)", padding: 8, zIndex: 100 }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #eef3f8" }}>
            <div style={{ fontFamily: P, fontWeight: 700, fontSize: 13, color: "#0D2137" }}>{currentUser?.name}</div>
            <div style={{ fontFamily: P, fontSize: 11, color: "#4A6580", textTransform: "capitalize" }}>{currentUser?.role}</div>
          </div>
          <button onClick={() => window.location.href = "/settings"} style={{ width: "100%", textAlign: "left", border: 0, background: "transparent", padding: "10px 12px", cursor: "pointer", fontFamily: P, fontSize: 12, color: "#0D2137" }}>⚙️ Profile & Settings</button>
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; }} style={{ width: "100%", textAlign: "left", border: 0, background: "transparent", padding: "10px 12px", cursor: "pointer", fontFamily: P, fontSize: 12, color: "#d32f2f" }}>↪ Logout</button>
        </div>
      )}
      </div>
    </header>
  );
}

/* ─── Stat card ─── */
function StatCard({ icon, label, value, sub, color, bg }: { icon: string; label: string; value: string; sub: string; color: string; bg: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-6 flex flex-col gap-3"
      style={{ background: "#fff", boxShadow: "0 2px 16px rgba(21,101,192,0.09)", border: "1.5px solid rgba(21,101,192,0.08)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: bg }}>
          <span className="material-icons-round" style={{ fontSize: 22, color }}>{icon}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: bg, color, fontFamily: P, fontWeight: 600 }}>+12%</span>
      </div>
      <div>
        <div style={{ fontFamily: P, fontWeight: 700, fontSize: 28, color: "#0D2137", lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: P, fontWeight: 500, fontSize: 13, color: "#0D2137", marginTop: 4 }}>{label}</div>
        <div style={{ fontFamily: P, fontWeight: 400, fontSize: 11, color: "#4A6580", marginTop: 2 }}>{sub}</div>
      </div>
    </motion.div>
  );
}

/* ─── Live dashboard ─── */
import { getAnalytics, getAllResults } from "../api/resultApi";
import { getLearningModules } from "../api/learningModuleApi";

const statusColor: Record<string, { bg: string; color: string }> = {
  Completed: { bg: "#E8F5E9", color: "#27ae60" },
};

export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [data,setData]=useState<any>(null); const [modules,setModules]=useState<any[]>([]); const [results,setResults]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const load=async()=>{setLoading(true);setError("");try{const [a,m,r]=await Promise.all([getAnalytics(),getLearningModules(),getAllResults()]);setData(a.data);setModules(m.data||[]);setResults(r.data||[]);}catch(e:any){setError(e?.response?.data?.message||"Unable to load live dashboard data.");}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const recent=results.slice(0,6); const activeStudents=(data?.studentProgress||[]).filter((x:any)=>x.activities>0).length; const avg=Number(data?.avgAccuracy||0); const alpis=(data?.studentProgress||[]).map((x:any)=>Number(x.alpi||0)); const avgAlpi=alpis.length?Math.round(alpis.reduce((a,b)=>a+b,0)/alpis.length):0;
  return <div className="flex" style={{minHeight:"100vh",background:"#F0F6FF"}}><Sidebar active="Dashboard"/><div className="flex-1 flex flex-col min-w-0"><TopBar title={user.role==='admin'?"Admin Dashboard":"Teacher Dashboard"} subtitle={`Welcome back, ${user.name || (user.role==='admin'?'Admin':'Teacher')}`}/><main className="flex-1 p-8 flex flex-col gap-6">
    {error&&<div className="rounded-2xl p-4" style={{background:"#FFF3E0",color:"#E65100",fontFamily:P}}>{error}</div>}
    {loading?<div className="rounded-2xl p-8 text-center" style={{background:"#fff",fontFamily:P,color:"#607D8B"}}>Loading live dashboard data…</div>:<>
    <div className="grid grid-cols-4 gap-5"><StatCard icon="people" label="Total Students" value={String(data?.totalStudents||0)} sub={`Active with activity: ${activeStudents}`} color="#1565C0" bg="#E3F2FD"/><StatCard icon="check_circle" label="Activities Completed" value={String(data?.totalActivities||0)} sub="Recorded in database" color="#27ae60" bg="#E8F5E9"/><StatCard icon="auto_awesome" label="Average ALPI" value={`${avgAlpi}%`} sub="From student records" color="#AB47BC" bg="#F3E5F5"/><StatCard icon="insights" label="Average Accuracy" value={`${avg}%`} sub="Across completed activities" color="#FF7043" bg="#FBE9E7"/></div>
    <div className="grid grid-cols-2 gap-5"><div className="rounded-2xl p-6" style={{background:"#fff",boxShadow:"0 2px 16px rgba(21,101,192,0.09)",border:"1.5px solid rgba(21,101,192,0.08)"}}><div style={{fontFamily:P,fontWeight:600,fontSize:15,color:"#0D2137",marginBottom:16}}>Recent Learning Activity</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Student","Activity","Level","Accuracy","Time","Status"].map(h=><th key={h} style={{fontFamily:P,fontSize:11,color:"#4A6580",textAlign:"left",padding:"8px 6px",borderBottom:"1px solid #edf2f7"}}>{h}</th>)}</tr></thead><tbody>{recent.map((r:any,i:number)=><tr key={r._id||i}><td style={{padding:"10px 6px",fontFamily:P,fontSize:12,fontWeight:600,color:"#0D2137"}}>{r.student?.name||"—"}</td><td style={{padding:"10px 6px",fontFamily:P,fontSize:12,color:"#4A6580"}}>{r.activityName}</td><td style={{padding:"10px 6px",fontFamily:P,fontSize:12,color:"#4A6580"}}>{r.level}</td><td style={{padding:"10px 6px",fontFamily:P,fontSize:12,fontWeight:700}}>{Number(r.accuracy||0)}%</td><td style={{padding:"10px 6px",fontFamily:P,fontSize:12,color:"#4A6580"}}>{Math.round(Number(r.timeTaken||0)/60)} min</td><td style={{padding:"10px 6px"}}><span style={{fontFamily:P,fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,...statusColor.Completed}}>{"Completed"}</span></td></tr>)}</tbody></table>{!recent.length&&<div style={{padding:30,textAlign:"center",fontFamily:P,color:"#607D8B"}}>No activity results recorded yet.</div>}</div></div>
    <div className="flex flex-col gap-5"><div className="rounded-2xl p-6" style={{background:"#fff",boxShadow:"0 2px 16px rgba(21,101,192,0.09)"}}><div style={{fontFamily:P,fontWeight:600,fontSize:15,color:"#0D2137",marginBottom:16}}>Available Learning Modules</div>{modules.slice(0,5).map((m:any)=><Link key={m.moduleId} to={`/learning-modules/${m.moduleId}`} style={{textDecoration:"none"}}><div className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{background:"#F7FAFD"}}><div className="flex items-center justify-center rounded-lg" style={{width:36,height:36,background:m.color||"#1565C0"}}><span className="material-icons-round text-white" style={{fontSize:18}}>{m.icon||"extension"}</span></div><div className="flex-1"><div style={{fontFamily:P,fontWeight:600,fontSize:13,color:"#0D2137"}}>{m.title}</div><div style={{fontFamily:P,fontSize:11,color:"#4A6580"}}>{m.category} · {m.level}</div></div><span className="material-icons-round" style={{fontSize:18,color:"#1565C0"}}>chevron_right</span></div></Link>)}{!modules.length&&<div style={{fontFamily:P,color:"#607D8B"}}>No active modules in the database.</div>}</div><div className="rounded-2xl p-6" style={{background:"#fff",boxShadow:"0 2px 16px rgba(21,101,192,0.09)"}}><div style={{fontFamily:P,fontWeight:600,fontSize:15,color:"#0D2137",marginBottom:16}}>Quick Actions</div><div className="grid grid-cols-2 gap-3">{[{icon:"people",label:"Students",to:"/students"},{icon:"extension",label:"Activities",to:"/learning-modules"},{icon:"insights",label:"Analytics",to:"/analytics"},{icon:"description",label:"Reports",to:"/reports"}].map(x=><Link key={x.label} to={x.to} style={{textDecoration:"none"}}><div className="flex flex-col items-center gap-2 p-4 rounded-xl" style={{background:"#F0F6FF",border:"1px solid #DCEAF7"}}><span className="material-icons-round" style={{fontSize:24,color:"#1565C0"}}>{x.icon}</span><span style={{fontFamily:P,fontWeight:600,fontSize:12,color:"#0D2137"}}>{x.label}</span></div></Link>)}</div></div></div></div>
    </>}
  </main></div></div>;
}
