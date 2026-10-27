import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar, TopBar } from "./DashboardPage";
import API from "../api/studentApi";

const P = "Poppins, sans-serif";
const levelColor: Record<string, { bg: string; color: string }> = {
  Mild: { bg: "#E8F5E9", color: "#27ae60" },
  Moderate: { bg: "#FFF9C4", color: "#F9A825" },
  Severe: { bg: "#FFEBEE", color: "#EF5350" },
};

const getLevelStyle = (level?: string) =>
  levelColor[level || ""] || { bg: "#F3F6F9", color: "#607D8B" };

function AlpiBar({ value }: { value: number }) {
  const color = value >= 80 ? "#27ae60" : value >= 65 ? "#FFA726" : "#EF5350";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "rgba(21,101,192,0.1)" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontFamily: P, fontWeight: 600, fontSize: 12, color, minWidth: 28 }}>{value}</span>
    </div>
  );
}

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [levelSaving, setLevelSaving] = useState<string | null>(null);
  const [list,setList]=useState<any[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const filtered = list.filter((s) => {
  const matchSearch = (s.name ?? "")
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchFilter =
    filter === "All" || s.disabilityLevel === filter;

  return matchSearch && matchFilter;
});

  useEffect(() => {

    loadStudents();

}, []);

const loadStudents = async () => {

    try{

        const res = await API.get("/");

        setList(res.data);

    }

    catch(err){

        console.log(err);

    }

}

async function updateLearningLevel(id: string, learningLevel: string) {
  try {
    setLevelSaving(id);
    const res = await API.patch(`/${id}/learning-level`, { learningLevel });
    setList(prev => prev.map(s => s._id === id ? { ...s, learningLevel: res.data.learningLevel } : s));
  } catch (err: any) {
    alert(err?.response?.data?.message || "Unable to update learning level");
  } finally {
    setLevelSaving(null);
  }
}

async function confirmDelete(id:string){

    try{

        await API.delete(`/${id}`);

        loadStudents();

    }

    catch(err){

        console.log(err);

    }

    setDeleteId(null);

}

  return (
    <div className="flex" style={{ minHeight: "100vh", background: "#F0F6FF" }}>
      <Sidebar active="Students" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="Student Management" subtitle="Manage and track all your students" />

        <main className="flex-1 p-8">
          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-6">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1"
              style={{ background: "#fff", border: "1.5px solid rgba(21,101,192,0.14)", maxWidth: 380 }}
            >
              <span className="material-icons-round" style={{ fontSize: 18, color: "#90a4b8" }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search students by name..."
                className="flex-1 bg-transparent outline-none"
                style={{ fontFamily: P, fontSize: 13, color: "#0D2137" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <span className="material-icons-round" style={{ fontSize: 16, color: "#90a4b8" }}>close</span>
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              {["All", "Mild", "Moderate", "Severe"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    fontFamily: P, fontSize: 13,
                    background: filter === f ? "#1565C0" : "#fff",
                    color: filter === f ? "#fff" : "#4A6580",
                    border: `1.5px solid ${filter === f ? "#1565C0" : "rgba(21,101,192,0.14)"}`,
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="ml-auto flex gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{
                  background: "#fff",
                  border: "1.5px solid rgba(21,101,192,0.14)",
                  fontFamily: P,
                  fontSize: 13,
                  color: "#4A6580",
                  cursor: "pointer"
                }}
              >
                <span
                  className="material-icons-round"
                  style={{ fontSize: 18 }}
                >
                  download
                </span>

                Export
              </button>

              {isAdmin && (
                <Link to="/students/add" style={{ textDecoration: "none" }}>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg,#1565C0,#27ae60)",
                      border: "none",
                      fontFamily: P,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                      cursor: "pointer",
                      boxShadow:
                        "0 4px 16px rgba(21,101,192,0.28)"
                    }}
                  >
                    <span
                      className="material-icons-round"
                      style={{ fontSize: 18 }}
                    >
                      person_add
                    </span>

                    Add Student
                  </button>
                </Link>
              )}

            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Students", value: list.length, icon: "people", color: "#1565C0", bg: "#E3F2FD" },
              { label: "Mild", value: list.filter(s => s.disabilityLevel === "Mild").length, icon: "sentiment_satisfied", color: "#27ae60", bg: "#E8F5E9" },
              { label: "Moderate", value: list.filter(s => s.disabilityLevel === "Moderate").length, icon: "sentiment_neutral", color: "#FFA726", bg: "#FFF3E0" },
              { label: "Severe", value: list.filter(s => s.disabilityLevel === "Severe").length, icon: "sentiment_dissatisfied", color: "#EF5350", bg: "#FFEBEE" },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-4 rounded-2xl" style={{ background: "#fff", border: "1.5px solid rgba(21,101,192,0.08)" }}>
                <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: bg }}>
                  <span className="material-icons-round" style={{ fontSize: 20, color }}>{icon}</span>
                </div>
                <div>
                  <div style={{ fontFamily: P, fontWeight: 700, fontSize: 22, color: "#0D2137" }}>{value}</div>
                  <div style={{ fontFamily: P, fontWeight: 400, fontSize: 11, color: "#4A6580" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table card */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(21,101,192,0.09)", border: "1.5px solid rgba(21,101,192,0.08)" }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(21,101,192,0.08)" }}>
              <span style={{ fontFamily: P, fontWeight: 600, fontSize: 14, color: "#0D2137" }}>
                {filtered.length} student{filtered.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <div style={{ overflowX: "auto" }}><table className="w-full" style={{ borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#F8FAFF" }}>
                  {["Student", "Age", "Learning Level", "Current ALPI", "FACP Baseline", "Actions"].map(h => (
                    <th key={h} style={{ fontFamily: P, fontWeight: 600, fontSize: 11, color: "#4A6580", textAlign: "left", padding: "12px 20px", letterSpacing: "0.05em" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: "1px solid rgba(21,101,192,0.06)" }}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: s.bg, border: `2px solid ${s.color}33`, flexShrink: 0 }}>
                          <span
                            style={{
                              fontFamily: P,
                              fontWeight: 700,
                              fontSize: 13,
                              color: s.color,
                            }}
                          >
                            {i + 1}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontFamily: P, fontWeight: 600, fontSize: 14, color: "#0D2137" }}>{s.name}</div>
                          <div style={{ fontFamily: P, fontWeight: 400, fontSize: 11, color: "#4A6580" }}>ID: {s.studentCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4" style={{ fontFamily: P, fontSize: 13, color: "#4A6580" }}>{Number.isFinite(Number(s.age)) && Number(s.age) > 0 ? `${Number(s.age)} yrs` : "—"}</td>
                    <td className="px-5 py-4">
                      <select
                        value={s.learningLevel || "Not Assessed"}
                        disabled={levelSaving === s._id}
                        onChange={e => updateLearningLevel(s._id, e.target.value)}
                        style={{ fontFamily: P, fontSize: 12, fontWeight: 600, padding: "7px 10px", borderRadius: 10, border: "1px solid #D7E1EA", background: "#fff", color: "#1565C0", minWidth: 130 }}
                      >
                        <option value="Not Assessed">Not Assessed</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </td>
                    <td className="px-5 py-4" style={{ minWidth: 140 }}>
                      <AlpiBar value={Math.max(0, Math.min(100, Number(s.alpiScore) || 0))} />
                    </td>
                    <td className="px-5 py-4" style={{ fontFamily: P, fontWeight: 600, fontSize: 13, color: "#0D2137" }}>{s.facpScore}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/students/${s._id}`}>
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                            style={{
                              background: "#E3F2FD",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: P,
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#1565C0"
                            }}
                          >
                            <span className="material-icons-round">
                              visibility
                            </span>

                            View
                          </button>
                        </Link>

                        <Link to={`/students/edit/${s._id}`}>
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                            style={{
                              background: "#E8F5E9",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: P,
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#27ae60"
                            }}
                          >
                            <span className="material-icons-round">
                              edit
                            </span>

                            Edit
                          </button>
                        </Link>

                        {isAdmin && (
                          <button
                            onClick={() => setDeleteId(s._id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                            style={{
                              background: "#FFEBEE",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: P,
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#EF5350"
                            }}
                          >
                            <span className="material-icons-round">
                              delete
                            </span>

                            Delete
                          </button>
                        )}

                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table></div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <span className="material-icons-round" style={{ fontSize: 48, color: "#90a4b8" }}>search_off</span>
                <p style={{ fontFamily: P, fontWeight: 500, fontSize: 15, color: "#4A6580" }}>No students found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(13,33,55,0.45)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="rounded-3xl p-8 flex flex-col items-center gap-4"
              style={{ background: "#fff", maxWidth: 360, width: "90%", boxShadow: "0 24px 64px rgba(13,33,55,0.2)" }}
            >
              <div className="flex items-center justify-center rounded-full" style={{ width: 60, height: 60, background: "#FFEBEE" }}>
                <span className="material-icons-round" style={{ fontSize: 32, color: "#EF5350" }}>delete_outline</span>
              </div>
              <div style={{ fontFamily: P, fontWeight: 700, fontSize: 18, color: "#0D2137", textAlign: "center" }}>Remove Student?</div>
              <p style={{ fontFamily: P, fontWeight: 400, fontSize: 14, color: "#4A6580", textAlign: "center" }}>This action cannot be undone. All data for this student will be permanently removed.</p>
              <div className="flex gap-3 w-full mt-2">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl" style={{ background: "#F0F6FF", border: "1.5px solid rgba(21,101,192,0.14)", fontFamily: P, fontWeight: 600, fontSize: 14, color: "#4A6580", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => confirmDelete(deleteId)} className="flex-1 py-3 rounded-xl" style={{ background: "#EF5350", border: "none", fontFamily: P, fontWeight: 600, fontSize: 14, color: "#fff", cursor: "pointer" }}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
