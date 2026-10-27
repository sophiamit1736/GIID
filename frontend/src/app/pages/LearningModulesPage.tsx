import { useEffect, useMemo, useState } from "react";
import { Sidebar, TopBar } from "./DashboardPage";
import LearningModuleCard from "../components/LearningModuleCard";
import { getLearningModules, deleteLearningModule } from "../api/learningModuleApi";
import type { LearningModule } from "../types/learningModule";

const categories = ["All", "ADL", "Academic", "Motor", "Language", "Vocational", "Therapeutic", "Specialized Care"];
const P = "Poppins, sans-serif";

export default function LearningModulesPage() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getLearningModules({ category })
      .then((response) => mounted && setModules(response.data))
      .catch((err) => {
        console.error("Failed to load learning modules", err);
        if (mounted) setError("Unable to load learning modules. Check that the backend is running.");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [category]);

  const filteredModules = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return modules;
    return modules.filter((module) =>
      [module.title, module.description, module.skill, module.category]
        .some((value) => value.toLowerCase().includes(text))
    );
  }, [modules, search]);

  return (
    <div className="flex" style={{ minHeight: "100vh", background: "#F0F6FF" }}>
      <Sidebar active="Activities" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Learning Modules" subtitle="Structured learning activities for every child" />
        <main className="p-8">
          <div className="rounded-3xl p-7 mb-7" style={{ background: "linear-gradient(135deg,#1565C0,#27ae60)", color: "#fff" }}>
            <h1 style={{ fontFamily: P, fontSize: 25, fontWeight: 800 }}>Learn, Practice & Grow 🌱</h1>
            <p className="mt-2" style={{ fontFamily: P, fontSize: 14, opacity: .92, maxWidth: 700 }}>
              Choose structured activities for daily living, academics, communication, motor development, vocational skills and therapeutic support.
            </p>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(21,101,192,.12)", maxWidth: 500 }}>
              <span className="material-icons-round" style={{ color: "#90A4AE" }}>search</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search learning modules..." className="flex-1 outline-none bg-transparent" style={{ fontFamily: P, fontSize: 14 }} />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-7">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className="px-4 py-2 rounded-full" style={{ fontFamily: P, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", background: category === item ? "#1565C0" : "#fff", color: category === item ? "#fff" : "#546E7A", boxShadow: category === item ? "0 4px 12px rgba(21,101,192,.2)" : "none" }}>{item}</button>
            ))}
          </div>

          {error && <div className="mb-5 rounded-2xl px-4 py-3" style={{ background: "#FFF3E0", color: "#E65100", fontFamily: P, fontSize: 13 }}>{error}</div>}
          {loading ? (
            <div className="flex justify-center py-20" style={{ fontFamily: P, color: "#607D8B" }}>Loading learning modules...</div>
          ) : (
            <>
              <p className="mb-4" style={{ fontFamily: P, fontSize: 13, color: "#607D8B" }}>Showing <b style={{ color: "#0D2137" }}>{filteredModules.length}</b> modules from the backend</p>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
                {filteredModules.map((module) => (
                  <div key={module.moduleId} style={{position:"relative"}}>
                    <LearningModuleCard module={module} />
                    {JSON.parse(localStorage.getItem("user") || "{}")?.role === "admin" && (
                      <button onClick={async()=>{ if(!confirm(`Delete ${module.title}?`)) return; try { await deleteLearningModule(module.moduleId); setModules(prev=>prev.filter(m=>m.moduleId!==module.moduleId)); } catch(e){ alert("Delete failed"); } }} style={{position:"absolute",right:12,top:12,zIndex:5,border:0,borderRadius:10,padding:"7px 9px",background:"#FFEBEE",color:"#C62828",cursor:"pointer"}}>🗑️</button>
                    )}
                  </div>
                ))}
              </div>
              {filteredModules.length === 0 && <div className="text-center py-20" style={{ fontFamily: P, color: "#607D8B" }}>No learning modules found.</div>}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
