import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Sidebar, TopBar } from "./DashboardPage";
import { getGames } from "../api/gameApi";

const P = "Poppins, sans-serif";

const activities = [
  {
    id: "shape-matching",
    title: "Shape Matching",
    desc: "Match shapes by recognising circles, squares, triangles and more.",
    difficulty: "Level 1",
    time: "10–15 min",
    category: "Visual",
    color: "#1565C0",
    bg: "linear-gradient(135deg,#E3F2FD,#BBDEFB)",
    iconBg: "#1565C0",
    icon: "category",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <circle cx="30" cy="45" r="22" fill="#90CAF9" />
        <rect x="65" y="24" width="40" height="40" rx="6" fill="#42A5F5" />
        <polygon points="105,72 120,72 112.5,56" fill="#1565C0" />
        <circle cx="30" cy="45" r="22" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="6 3" />
      </svg>
    ),
  },
  {
    id: "colour-matching",
    title: "Colour Matching",
    desc: "Identify and match colours using vibrant interactive tiles.",
    difficulty: "Level 1",
    time: "8–12 min",
    category: "Visual",
    color: "#FF7043",
    bg: "linear-gradient(135deg,#FBE9E7,#FFCCBC)",
    iconBg: "#FF7043",
    icon: "palette",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <circle cx="30" cy="45" r="20" fill="#EF5350" />
        <circle cx="62" cy="45" r="20" fill="#FFA726" />
        <circle cx="94" cy="45" r="20" fill="#26A69A" />
        <circle cx="30" cy="45" r="20" fill="none" stroke="#fff" strokeWidth="2" />
        <circle cx="62" cy="45" r="20" fill="none" stroke="#fff" strokeWidth="2" />
        <circle cx="94" cy="45" r="20" fill="none" stroke="#fff" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "animal-matching",
    title: "Animal Matching",
    desc: "Match animals with their names, sounds and habitats.",
    difficulty: "Level 2",
    time: "12–18 min",
    category: "Cognitive",
    color: "#27ae60",
    bg: "linear-gradient(135deg,#E8F5E9,#C8E6C9)",
    iconBg: "#27ae60",
    icon: "pets",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <ellipse cx="60" cy="52" rx="28" ry="22" fill="#A5D6A7" />
        <ellipse cx="60" cy="42" rx="18" ry="18" fill="#81C784" />
        <ellipse cx="48" cy="30" rx="8" ry="10" fill="#66BB6A" />
        <ellipse cx="72" cy="30" rx="8" ry="10" fill="#66BB6A" />
        <circle cx="55" cy="42" r="3" fill="#0D2137" />
        <circle cx="65" cy="42" r="3" fill="#0D2137" />
        <path d="M53 50 Q60 56 67 50" stroke="#0D2137" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "alphabet-matching",
    title: "Alphabet Matching",
    desc: "Connect uppercase and lowercase letters to build literacy skills.",
    difficulty: "Level 2",
    time: "10–15 min",
    category: "Literacy",
    color: "#AB47BC",
    bg: "linear-gradient(135deg,#F3E5F5,#E1BEE7)",
    iconBg: "#AB47BC",
    icon: "abc",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <rect x="10" y="20" width="46" height="50" rx="10" fill="#CE93D8" />
        <rect x="64" y="20" width="46" height="50" rx="10" fill="#AB47BC" />
        <text x="33" y="53" textAnchor="middle" fontFamily={P} fontWeight="800" fontSize="28" fill="#fff">A</text>
        <text x="87" y="53" textAnchor="middle" fontFamily={P} fontWeight="800" fontSize="24" fill="#fff">a</text>
        <line x1="56" y1="45" x2="64" y2="45" stroke="#7B1FA2" strokeWidth="2.5" strokeDasharray="3 2" />
      </svg>
    ),
  },
  {
    id: "fruit-matching",
    title: "Fruit Matching",
    desc: "Identify, name and match fruits — building vocabulary and memory.",
    difficulty: "Level 1",
    time: "8–12 min",
    category: "Vocabulary",
    color: "#FFA726",
    bg: "linear-gradient(135deg,#FFF3E0,#FFE0B2)",
    iconBg: "#FFA726",
    icon: "local_florist",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <ellipse cx="35" cy="52" rx="22" ry="26" fill="#FF7043" />
        <ellipse cx="35" cy="26" rx="6" ry="8" fill="#4CAF50" transform="rotate(-10 35 26)" />
        <ellipse cx="80" cy="52" rx="20" ry="22" fill="#FDD835" />
        <ellipse cx="80" cy="30" rx="5" ry="7" fill="#4CAF50" transform="rotate(8 80 30)" />
        <circle cx="107" cy="54" r="14" fill="#EF5350" />
        <ellipse cx="107" cy="40" rx="4" ry="6" fill="#4CAF50" />
      </svg>
    ),
  },
  {
    id: "picture-identification",
    title: "Picture Identification",
    desc: "Identify everyday objects from pictures to strengthen visual memory.",
    difficulty: "Level 2",
    time: "12–18 min",
    category: "Memory",
    color: "#26A69A",
    bg: "linear-gradient(135deg,#E0F2F1,#B2DFDB)",
    iconBg: "#26A69A",
    icon: "image_search",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <rect x="10" y="15" width="100" height="65" rx="12" fill="#B2DFDB" />
        <rect x="18" y="23" width="84" height="49" rx="8" fill="#E0F2F1" />
        <circle cx="38" cy="42" r="10" fill="#4DB6AC" />
        <rect x="54" y="34" width="42" height="8" rx="4" fill="#80CBC4" />
        <rect x="54" y="46" width="32" height="8" rx="4" fill="#80CBC4" />
        <rect x="54" y="58" width="38" height="8" rx="4" fill="#80CBC4" />
        <circle cx="48" cy="5" r="5" fill="#26A69A" />
        <line x1="48" y1="10" x2="48" y2="18" stroke="#26A69A" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "drag-drop",
    title: "Drag & Drop Sorting",
    desc: "Sort and categorise objects using intuitive drag and drop interactions.",
    difficulty: "Level 3",
    time: "15–20 min",
    category: "Motor Skills",
    color: "#5C6BC0",
    bg: "linear-gradient(135deg,#E8EAF6,#C5CAE9)",
    iconBg: "#5C6BC0",
    icon: "drag_indicator",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <rect x="8" y="30" width="36" height="36" rx="10" fill="#9FA8DA" stroke="#5C6BC0" strokeWidth="2" strokeDasharray="5 3" />
        <rect x="54" y="30" width="36" height="36" rx="10" fill="#9FA8DA" stroke="#5C6BC0" strokeWidth="2" strokeDasharray="5 3" />
        <rect x="18" y="12" width="30" height="30" rx="8" fill="#5C6BC0" />
        <text x="33" y="32" textAnchor="middle" fontFamily={P} fontWeight="700" fontSize="16" fill="#fff">A</text>
        <path d="M48 27 L54 30" stroke="#3949AB" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arr)" />
      </svg>
    ),
  },
  {
    id: "number-matching",
    title: "Number Matching",
    desc: "Match numbers 1–4 with their dot patterns to build early numeracy.",
    difficulty: "Level 1",
    time: "8–12 min",
    category: "Numeracy",
    color: "#26A69A",
    bg: "linear-gradient(135deg,#E0F2F1,#B2DFDB)",
    iconBg: "#26A69A",
    icon: "123",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <rect x="8" y="22" width="46" height="46" rx="10" fill="#80CBC4" />
        <text x="31" y="52" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="800" fontSize="30" fill="#fff">3</text>
        <rect x="66" y="22" width="46" height="46" rx="10" fill="#4DB6AC" />
        <circle cx="82" cy="37" r="5" fill="#fff" /><circle cx="97" cy="37" r="5" fill="#fff" />
        <circle cx="82" cy="53" r="5" fill="#fff" /><circle cx="97" cy="53" r="5" fill="#fff" />
        <circle cx="89" cy="45" r="5" fill="#fff" />
      </svg>
    ),
  },
  {
    id: "sound-matching",
    title: "Sound Matching",
    desc: "Match animals with their sounds — building listening and association skills.",
    difficulty: "Level 2",
    time: "10–14 min",
    category: "Cognitive",
    color: "#FF7043",
    bg: "linear-gradient(135deg,#FBE9E7,#FFCCBC)",
    iconBg: "#FF7043",
    icon: "volume_up",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <text x="18" y="58" fontSize="34">🦁</text>
        <rect x="64" y="28" width="48" height="30" rx="10" fill="#FF7043" />
        <text x="88" y="49" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="700" fontSize="15" fill="#fff">Roar!</text>
      </svg>
    ),
  },
  {
  id: "memory",
  title: "Memory Matching",
  desc: "Find matching pairs to strengthen memory, attention and concentration.",
  difficulty: "Level 2",
  time: "10–15 min",
  category: "Memory",
  color: "#7E57C2",
  bg: "linear-gradient(135deg,#EDE7F6,#D1C4E9)",
  iconBg: "#7E57C2",
  icon: "psychology",
  illustration: (
    <svg
      viewBox="0 0 120 90"
      fill="none"
      style={{ width: "100%", height: "100%" }}
    >
      <rect
        x="12"
        y="15"
        width="42"
        height="55"
        rx="9"
        fill="#9575CD"
      />

      <rect
        x="66"
        y="15"
        width="42"
        height="55"
        rx="9"
        fill="#7E57C2"
      />

      <text
        x="33"
        y="52"
        textAnchor="middle"
        fontSize="28"
        fill="#fff"
      >
        ?
      </text>

      <text
        x="87"
        y="52"
        textAnchor="middle"
        fontSize="28"
        fill="#fff"
      >
        ?
      </text>
    </svg>
  ),
},
  {
    id: "size-sorting",
    title: "Size Sorting",
    desc: "Arrange objects from smallest to largest — developing visual discrimination.",
    difficulty: "Level 2",
    time: "10–14 min",
    category: "Visual",
    color: "#EC407A",
    bg: "linear-gradient(135deg,#FCE4EC,#F8BBD9)",
    iconBg: "#EC407A",
    icon: "swap_vert",
    illustration: (
      <svg viewBox="0 0 120 90" fill="none" style={{ width: "100%", height: "100%" }}>
        <circle cx="20" cy="68" r="10" fill="#F48FB1" />
        <circle cx="55" cy="62" r="18" fill="#EC407A" />
        <circle cx="96" cy="52" r="26" fill="#AD1457" />
        <text x="20" y="73" textAnchor="middle" fontSize="9" fill="#fff" fontFamily="Poppins,sans-serif" fontWeight="700">S</text>
        <text x="55" y="67" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="Poppins,sans-serif" fontWeight="700">M</text>
        <text x="96" y="57" textAnchor="middle" fontSize="15" fill="#fff" fontFamily="Poppins,sans-serif" fontWeight="700">L</text>
      </svg>
    ),
  },
  {
    id: "facp-sequence", title: "Daily Routine Sequencing", desc: "Arrange brushing, handwashing and dressing steps in the correct order.", difficulty: "Level 1", time: "8–12 min", category: "FACP Learning", color: "#1565C0", bg: "#E3F2FD", iconBg: "#1565C0", icon: "format_list_numbered", illustration: <div style={{fontSize:42}}>🪥 🧼 👕</div>
  },
  {
    id: "facp-emotions", title: "Emotion Matching", desc: "Match everyday situations with happy, sad, angry and scared emotions.", difficulty: "Level 1", time: "8–12 min", category: "FACP Learning", color: "#7E57C2", bg: "#EDE7F6", iconBg: "#7E57C2", icon: "mood", illustration: <div style={{fontSize:42}}>😊 😢 😡</div>
  },
  {
    id: "facp-handwashing", title: "Handwashing Steps", desc: "Practice the correct sequence for a daily handwashing routine.", difficulty: "Level 1", time: "8–12 min", category: "FACP Learning", color: "#26A69A", bg: "#E0F2F1", iconBg: "#26A69A", icon: "wash", illustration: <div style={{fontSize:42}}>🚰 🧼 👐</div>
  },
  {
    id: "facp-money", title: "Money Identification", desc: "Recognise common coins and notes and connect them with their values.", difficulty: "Level 1", time: "8–12 min", category: "FACP Learning", color: "#2E7D32", bg: "#E8F5E9", iconBg: "#2E7D32", icon: "payments", illustration: <div style={{fontSize:42}}>🪙 💵</div>
  },
];

const categories = ["All", "Visual", "Cognitive", "Literacy", "Vocabulary", "Memory", "Motor Skills", "Numeracy", "FACP Learning"];
const diffFilter = ["All Levels", "Level 1", "Level 2", "Level 3"];

export default function ActivityLibraryPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [diff, setDiff] = useState("All Levels");
  const [generatedGames, setGeneratedGames] = useState<any[]>([]);
  useEffect(() => { getGames().then(r => setGeneratedGames(Array.isArray(r.data) ? r.data : [])).catch(() => setGeneratedGames([])); }, []);

  const filtered = activities.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || a.category === cat;
    const matchDiff = diff === "All Levels" || a.difficulty === diff;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="flex" style={{ minHeight: "100vh", background: "#F0F6FF" }}>
      <Sidebar active="Activities" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
            title="Activity Library"
            subtitle="Browse, assign and launch learning activities"
          />

          <div
            className="flex items-center justify-between px-8 pt-5"
          >
            <div>
              <h2
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0D2137",
                  margin: 0,
                }}
              >
                Learning & Activities
              </h2>

              <p
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: 12,
                  color: "#4A6580",
                  marginTop: 4,
                }}
              >
                Explore interactive games and structured learning modules
              </p>
            </div>

            <Link
              to="/learning-modules"
              style={{
                background: "#27ae60",
                color: "#fff",
                padding: "11px 18px",
                borderRadius: 12,
                textDecoration: "none",
                fontFamily: "Poppins, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 14px rgba(39,174,96,0.25)",
              }}
            >
              <span
                className="material-icons-round"
                style={{ fontSize: 17 }}
              >
                school
              </span>

              Learning Modules
            </Link>
          </div>        

        <main className="flex-1 p-8">
          {/* Search + filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-2xl flex-1"
                style={{ background: "#fff", border: "1.5px solid rgba(21,101,192,0.14)", maxWidth: 440 }}
              >
                <span className="material-icons-round" style={{ fontSize: 20, color: "#90a4b8" }}>search</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search activities..."
                  className="flex-1 bg-transparent outline-none"
                  style={{ fontFamily: P, fontSize: 14, color: "#0D2137" }}
                />
              </div>
              <div className="flex items-center gap-2">
                {diffFilter.map(d => (
                  <button
                    key={d}
                    onClick={() => setDiff(d)}
                    className="px-4 py-2 rounded-xl text-sm"
                    style={{
                      fontFamily: P, fontWeight: 500, fontSize: 13,
                      background: diff === d ? "#1565C0" : "#fff",
                      color: diff === d ? "#fff" : "#4A6580",
                      border: `1.5px solid ${diff === d ? "#1565C0" : "rgba(21,101,192,0.14)"}`,
                      cursor: "pointer",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontFamily: P, fontSize: 12, color: "#4A6580", fontWeight: 500 }}>Category:</span>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className="px-3 py-1.5 rounded-full text-xs"
                  style={{
                    fontFamily: P, fontWeight: 500,
                    background: cat === c ? "linear-gradient(135deg,#1565C0,#27ae60)" : "rgba(21,101,192,0.07)",
                    color: cat === c ? "#fff" : "#4A6580",
                    border: "none", cursor: "pointer",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mb-5" style={{ fontFamily: P, fontSize: 13, color: "#4A6580" }}>
            Showing <span style={{ fontWeight: 600, color: "#0D2137" }}>{filtered.length}</span> activities
          </div>

          {generatedGames.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontFamily: P, fontSize: 18, fontWeight: 700, color: "#0D2137", margin: 0 }}>🤖 Adaptive AI Games</h2>
                  <p style={{ fontFamily: P, fontSize: 12, color: "#4A6580", marginTop: 4 }}>Games generated for learner needs and linked to learning-module skills.</p>
                </div>
              </div>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {generatedGames.map((game, i) => (
                  <motion.div key={game.gameId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-3xl overflow-hidden flex flex-col" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(21,101,192,0.09)", border: "1.5px solid rgba(21,101,192,0.08)" }}>
                    <div className="flex items-center justify-center" style={{ height: 120, background: "linear-gradient(135deg,#E8F5E9,#E3F2FD)", fontSize: 48 }}>{game.coverEmoji || "🎮"}</div>
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div><h3 style={{ fontFamily: P, fontWeight: 700, fontSize: 16, color: "#0D2137", margin: 0 }}>{game.title}</h3><p style={{ fontFamily: P, fontSize: 12, color: "#4A6580", lineHeight: 1.5, marginTop: 5 }}>{game.description}</p></div>
                      <div style={{ fontFamily: P, fontSize: 11, color: "#607D8B", lineHeight: 1.6 }}>Target: <b>{game.targetLearningModuleTitle || game.skill}</b><br/>FACP level: <b>{game.facpFunctionalLevel || game.targetLearningModuleFacpLevels?.join(', ') || 'Not set'}</b><br/>Learning level: <b>{game.learnerLearningLevel}</b> · Difficulty: <b>{game.difficulty}</b>{game.generatedForStudent ? " · Student-specific" : ""}</div>
                      <Link to={`/generated-game/${game.gameId}${game.generatedForStudent ? `?studentId=${game.generatedForStudent}` : ""}`} style={{ textDecoration: "none", marginTop: "auto" }}><div style={{ textAlign: "center", padding: 10, borderRadius: 12, background: "#1565C0", color: "#fff", fontFamily: P, fontWeight: 700, fontSize: 13 }}>▶ Play Game</div></Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Cards grid */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {filtered.map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ y: -5, boxShadow: "0 12px 36px rgba(21,101,192,0.15)" }}
                className="rounded-3xl overflow-hidden flex flex-col"
                style={{ background: "#fff", boxShadow: "0 2px 16px rgba(21,101,192,0.09)", border: "1.5px solid rgba(21,101,192,0.08)", cursor: "pointer" }}
              >
                {/* Illustration area */}
                <div className="flex items-center justify-center relative" style={{ background: act.bg, height: 130, padding: "16px 24px" }}>
                  <div style={{ width: 160, height: 90 }}>
                    {act.illustration}
                  </div>
                  {/* Category badge */}
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(255,255,255,0.85)", color: act.color, fontFamily: P }}
                  >
                    {act.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3 p-5 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 style={{ fontFamily: P, fontWeight: 700, fontSize: 16, color: "#0D2137", lineHeight: 1.2 }}>{act.title}</h3>
                      <p style={{ fontFamily: P, fontWeight: 400, fontSize: 12, color: "#4A6580", marginTop: 4, lineHeight: 1.55 }}>{act.desc}</p>
                    </div>
                    <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: act.iconBg }}>
                      <span className="material-icons-round text-white" style={{ fontSize: 20 }}>{act.icon}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: act.bg.includes("#E3F2FD") ? "#E3F2FD" : "rgba(21,101,192,0.07)", color: act.color, fontFamily: P }}>
                      <span className="material-icons-round" style={{ fontSize: 13 }}>signal_cellular_alt</span>
                      {act.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ fontFamily: P, color: "#4A6580" }}>
                      <span className="material-icons-round" style={{ fontSize: 14, color: "#90a4b8" }}>schedule</span>
                      {act.time}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-auto pt-2">
                    {/* <button
                      className="flex-1 py-2 rounded-xl text-sm font-medium"
                      style={{ background: "rgba(21,101,192,0.08)", border: "none", fontFamily: P, color: "#1565C0", cursor: "pointer" }}
                    >
                      Preview
                    </button> */}
                    <Link
                    to={
                      act.id === "picture-identification" ? "/learn/picture-id" : act.id === "drag-drop" ? "/learn/drag-drop-sorting" : act.id === "memory" ? "/learn/memory" : act.id === "facp-sequence" ? "/learn/sequence" : act.id === "facp-emotions" ? "/learn/emotions" : act.id === "facp-handwashing" ? "/learn/handwashing" : act.id === "facp-money" ? "/learn/money" : `/learn/${act.id}`
                    }
                    style={{ textDecoration: "none", flex: 1 }}
                  >
                    <div
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold"
                      style={{
                        background: act.iconBg,
                        fontFamily: P,
                        color: "#fff",
                        cursor: "pointer",
                        boxShadow: `0 4px 14px ${act.color}44`,
                      }}
                    >
                      <span
                        className="material-icons-round"
                        style={{ fontSize: 16 }}
                      >
                        play_arrow
                      </span>

                      Play
                    </div>
                  </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-20 gap-3">
              <span className="material-icons-round" style={{ fontSize: 56, color: "#90a4b8" }}>search_off</span>
              <p style={{ fontFamily: P, fontWeight: 500, fontSize: 16, color: "#4A6580" }}>No activities found</p>
              <button onClick={() => { setSearch(""); setCat("All"); setDiff("All Levels"); }} style={{ fontFamily: P, fontSize: 13, color: "#1565C0", background: "none", border: "none", cursor: "pointer" }}>Clear filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
