import { API_BASE } from "../api/config";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import axios from "axios";

/* ─── Loading dots ─── */
function LoadingDots() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="block rounded-full"
          style={{ width: 10, height: 10, background: "rgba(255,255,255,0.85)" }}
          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Progress bar ─── */
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: "rgba(255,255,255,0.9)" }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

/* ─── Floating orbs in background ─── */
function BgOrbs() {
  return (
    <>
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 520, height: 520, background: "radial-gradient(circle, rgba(46,204,113,0.18) 0%, transparent 70%)", top: -120, right: -80 }}
        animate={{ scale: [1, 1.07, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 380, height: 380, background: "radial-gradient(circle, rgba(21,101,192,0.22) 0%, transparent 70%)", bottom: 60, left: -60 }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, -8, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 260, height: 260, background: "radial-gradient(circle, rgba(100,181,246,0.25) 0%, transparent 70%)", top: "40%", left: "12%" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </>
  );
}

/* ─── GIID Logo Placeholder ─── */
function GiidLogo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center rounded-2xl shadow-lg"
        style={{ width: 56, height: 56, background: "linear-gradient(135deg,#1565C0 0%,#2ECC71 100%)" }}
      >
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-0.5px" }}>G</span>
      </div>
      <div>
        <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", lineHeight: 1.1 }}>GIID</div>
        <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em" }}>TAMBARAM</div>
      </div>
    </div>
  );
}

/* ─── Flat SVG Illustration — Teacher & Children ─── */
function TeacherIllustration() {
  return (
    <svg viewBox="0 0 520 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-label="Illustration of a teacher and children learning together">

      {/* Floor */}
      <ellipse cx="260" cy="355" rx="220" ry="18" fill="rgba(21,101,192,0.08)" />

      {/* Whiteboard */}
      <rect x="60" y="60" width="180" height="120" rx="12" fill="#ffffff" stroke="#E3F2FD" strokeWidth="3" />
      <rect x="60" y="165" width="180" height="8" rx="4" fill="#BBDEFB" />
      {/* Board stand */}
      <line x1="110" y1="173" x2="100" y2="220" stroke="#90CAF9" strokeWidth="4" strokeLinecap="round" />
      <line x1="190" y1="173" x2="200" y2="220" stroke="#90CAF9" strokeWidth="4" strokeLinecap="round" />
      {/* Board content */}
      <text x="150" y="105" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="22" fill="#1565C0">A B C</text>
      <rect x="88" y="118" width="144" height="6" rx="3" fill="#E3F2FD" />
      <rect x="88" y="132" width="100" height="6" rx="3" fill="#E8F5E9" />
      <rect x="88" y="146" width="120" height="6" rx="3" fill="#E3F2FD" />

      {/* Stars on board */}
      <text x="82" y="90" fontSize="14" fill="#FFD54F">★</text>
      <text x="228" y="90" fontSize="14" fill="#FFD54F">★</text>

      {/* ── TEACHER ── */}
      {/* Body */}
      <rect x="262" y="165" width="52" height="95" rx="22" fill="#1565C0" />
      {/* Collar accent */}
      <rect x="279" y="165" width="18" height="28" rx="9" fill="#5C9CE6" />
      {/* Head */}
      <ellipse cx="288" cy="148" rx="26" ry="26" fill="#FDBCB4" />
      {/* Hair */}
      <ellipse cx="288" cy="128" rx="26" ry="14" fill="#5D4037" />
      <ellipse cx="264" cy="145" rx="8" ry="10" fill="#5D4037" />
      <ellipse cx="312" cy="145" rx="8" ry="10" fill="#5D4037" />
      {/* Eyes */}
      <ellipse cx="280" cy="148" rx="3.5" ry="3.5" fill="#0D2137" />
      <ellipse cx="296" cy="148" rx="3.5" ry="3.5" fill="#0D2137" />
      <ellipse cx="280.5" cy="147" rx="1.2" ry="1.2" fill="#fff" />
      <ellipse cx="296.5" cy="147" rx="1.2" ry="1.2" fill="#fff" />
      {/* Smile */}
      <path d="M281 156 Q288 162 295 156" stroke="#0D2137" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Arms */}
      <rect x="228" y="175" width="40" height="14" rx="7" fill="#1565C0" />
      <rect x="308" y="175" width="38" height="14" rx="7" fill="#1565C0" />
      {/* Right hand holding pointer */}
      <ellipse cx="346" cy="182" rx="8" ry="8" fill="#FDBCB4" />
      <line x1="352" y1="178" x2="400" y2="130" stroke="#90CAF9" strokeWidth="3" strokeLinecap="round" />
      {/* Left hand holding book */}
      <ellipse cx="228" cy="182" rx="8" ry="8" fill="#FDBCB4" />
      <rect x="200" y="170" width="32" height="24" rx="4" fill="#2ECC71" />
      <rect x="204" y="175" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
      <rect x="204" y="181" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
      <rect x="204" y="187" width="22" height="3" rx="1.5" fill="rgba(255,255,255,0.6)" />
      {/* Legs */}
      <rect x="268" y="256" width="20" height="65" rx="10" fill="#0D47A1" />
      <rect x="292" y="256" width="20" height="65" rx="10" fill="#0D47A1" />
      {/* Shoes */}
      <ellipse cx="278" cy="323" rx="16" ry="8" fill="#212121" />
      <ellipse cx="302" cy="323" rx="16" ry="8" fill="#212121" />

      {/* ── CHILD 1 (left, sitting) ── */}
      <rect x="100" y="240" width="60" height="20" rx="8" fill="#E8F5E9" stroke="#A5D6A7" strokeWidth="2"/>
      {/* Body */}
      <rect x="116" y="218" width="36" height="60" rx="16" fill="#FF7043" />
      {/* Head */}
      <ellipse cx="134" cy="202" rx="20" ry="20" fill="#FDBCB4" />
      {/* Hair */}
      <ellipse cx="134" cy="185" rx="20" ry="12" fill="#1A237E" />
      {/* Eyes */}
      <ellipse cx="128" cy="202" rx="2.8" ry="2.8" fill="#0D2137" />
      <ellipse cx="140" cy="202" rx="2.8" ry="2.8" fill="#0D2137" />
      {/* Smile */}
      <path d="M128 210 Q134 215 140 210" stroke="#0D2137" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Arms */}
      <rect x="96" y="228" width="24" height="12" rx="6" fill="#FF7043" />
      <rect x="152" y="228" width="24" height="12" rx="6" fill="#FF7043" />
      {/* Book on lap */}
      <rect x="110" y="268" width="48" height="32" rx="6" fill="#5C6BC0" />
      <rect x="115" y="273" width="38" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="115" y="280" width="28" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="115" y="287" width="33" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
      {/* Legs */}
      <rect x="116" y="276" width="14" height="42" rx="7" fill="#F57C00" />
      <rect x="142" y="276" width="14" height="42" rx="7" fill="#F57C00" />
      <ellipse cx="123" cy="318" rx="12" ry="6" fill="#37474F" />
      <ellipse cx="149" cy="318" rx="12" ry="6" fill="#37474F" />

      {/* ── CHILD 2 (right, standing with tablet) ── */}
      {/* Body */}
      <rect x="370" y="205" width="40" height="80" rx="18" fill="#AB47BC" />
      {/* Head */}
      <ellipse cx="390" cy="190" rx="22" ry="22" fill="#FDBCB4" />
      {/* Hair — pigtails */}
      <ellipse cx="390" cy="172" rx="22" ry="14" fill="#4E342E" />
      <ellipse cx="370" cy="178" rx="8" ry="14" fill="#4E342E" />
      <ellipse cx="410" cy="178" rx="8" ry="14" fill="#4E342E" />
      {/* Eyes */}
      <ellipse cx="384" cy="190" rx="2.8" ry="2.8" fill="#0D2137" />
      <ellipse cx="396" cy="190" rx="2.8" ry="2.8" fill="#0D2137" />
      {/* Smile */}
      <path d="M384 198 Q390 204 396 198" stroke="#0D2137" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Arms */}
      <rect x="346" y="215" width="28" height="12" rx="6" fill="#AB47BC" />
      <rect x="406" y="215" width="28" height="12" rx="6" fill="#AB47BC" />
      {/* Tablet in left hand */}
      <rect x="316" y="200" width="36" height="46" rx="6" fill="#fff" stroke="#90CAF9" strokeWidth="2.5" />
      <rect x="320" y="205" width="28" height="34" rx="4" fill="#E3F2FD" />
      <text x="334" y="226" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="11" fill="#1565C0">1+1</text>
      <text x="334" y="238" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="11" fill="#2ECC71">= 2</text>
      {/* Legs */}
      <rect x="374" y="281" width="14" height="52" rx="7" fill="#7B1FA2" />
      <rect x="392" y="281" width="14" height="52" rx="7" fill="#7B1FA2" />
      <ellipse cx="381" cy="335" rx="12" ry="6" fill="#212121" />
      <ellipse cx="399" cy="335" rx="12" ry="6" fill="#212121" />

      {/* ── CHILD 3 (far right, small, raising hand) ── */}
      <rect x="452" y="240" width="38" height="80" rx="16" fill="#26A69A" />
      <ellipse cx="471" cy="226" rx="18" ry="18" fill="#FDBCB4" />
      <ellipse cx="471" cy="210" rx="18" ry="10" fill="#FF8F00" />
      <ellipse cx="455" cy="216" rx="6" ry="10" fill="#FF8F00" />
      <ellipse cx="487" cy="216" rx="6" ry="10" fill="#FF8F00" />
      <ellipse cx="466" cy="226" rx="2.5" ry="2.5" fill="#0D2137" />
      <ellipse cx="476" cy="226" rx="2.5" ry="2.5" fill="#0D2137" />
      <path d="M466 233 Q471 238 476 233" stroke="#0D2137" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Raised arm */}
      <rect x="482" y="218" width="12" height="46" rx="6" fill="#26A69A" transform="rotate(-28 482 218)" />
      <ellipse cx="497" cy="203" rx="8" ry="8" fill="#FDBCB4" />
      {/* Other arm */}
      <rect x="440" y="250" width="24" height="11" rx="5.5" fill="#26A69A" />
      {/* Legs */}
      <rect x="455" y="316" width="12" height="38" rx="6" fill="#00796B" />
      <rect x="471" y="316" width="12" height="38" rx="6" fill="#00796B" />
      <ellipse cx="461" cy="354" rx="10" ry="5" fill="#37474F" />
      <ellipse cx="477" cy="354" rx="10" ry="5" fill="#37474F" />

      {/* ── Floating elements ── */}
      <text x="50" y="240" fontSize="22" fill="#FFD54F" opacity="0.85">★</text>
      <text x="430" y="155" fontSize="18" fill="#FFD54F" opacity="0.8">★</text>
      <text x="480" y="220" fontSize="14" fill="#FF7043" opacity="0.7">★</text>
      <rect x="425" y="60" width="44" height="34" rx="6" fill="#EF5350" />
      <rect x="429" y="66" width="36" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="429" y="73" width="28" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="429" y="80" width="32" height="4" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="35" y="150" width="8" height="38" rx="3" fill="#FDD835" transform="rotate(20 35 150)" />
      <polygon points="35,188 43,188 39,200" fill="#FF8F00" transform="rotate(20 35 150)" />
      <circle cx="470" cy="100" r="16" fill="#FFF9C4" stroke="#FFD54F" strokeWidth="2.5" />
      <text x="470" y="106" textAnchor="middle" fontSize="16" fill="#F9A825">💡</text>
      <circle cx="60" cy="290" r="5" fill="#90CAF9" opacity="0.7" />
      <circle cx="78" cy="305" r="3.5" fill="#A5D6A7" opacity="0.7" />
      <circle cx="500" cy="290" r="4" fill="#CE93D8" opacity="0.7" />
    </svg>
  );
}

/* ─── Stat chip ─── */
function StatChip({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-sm" style={{ border: "1.5px solid rgba(21,101,192,0.10)" }}>
      <span className="material-icons-round text-base" style={{ color, fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 13, color: "#0D2137", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 10, color: "#4A6580" }}>{label}</div>
      </div>
    </div>
  );
}

export default function SplashPage() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing platform...");
  const [stats,setStats]=useState({students:0,modules:0,success:0});
  const [info,setInfo]=useState("");
  useEffect(()=>{axios.get(`${API_BASE}/results/public-summary`).then(r=>setStats(r.data)).catch(()=>{});},[]);

  const steps = [
    "Initializing platform...",
    "Loading learning modules...",
    "Configuring adaptive engine...",
    "Preparing your workspace...",
    "Ready to learn!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + Math.random() * 18 + 4, 100);
        const stepIndex = Math.floor((next / 100) * (steps.length - 1));
        setLoadingText(steps[Math.min(stepIndex, steps.length - 1)]);
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, 480);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center"
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "linear-gradient(135deg, #1a6db5 0%, #1565C0 30%, #0d9e6e 70%, #27ae60 100%)",
        minHeight: "100vh",
      }}
    >
      <BgOrbs />
      {info && <div onClick={()=>setInfo("")} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(13,33,55,.45)",display:"grid",placeItems:"center",padding:20}}><div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:20,padding:28,maxWidth:520,fontFamily:"Poppins, sans-serif",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}><h2 style={{marginTop:0,color:"#0D2137"}}>{info}</h2><p style={{color:"#4A6580",lineHeight:1.7}}>{info==="About"?"LearnAble is the GIID adaptive learning platform for structured, accessible and personalized learning.":info==="Contact"?"Use your GIID centre contact channel or administrator account for support and platform assistance.":"For help, sign in and use Settings, Students, Learning Modules, Analytics, Reports and AI Generator. All operational data is fetched from the backend database."}</p><button onClick={()=>setInfo("")} style={{padding:"10px 18px",border:0,borderRadius:10,background:"#1565C0",color:"#fff",fontWeight:700}}>Close</button></div></div>}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col"
        style={{ width: 980, maxWidth: "96vw" }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-6 px-1">
          <GiidLogo />
          <div className="flex items-center gap-2">
            {["About", "Contact", "Help"].map((item) => (
              <button
                key={item}
                onClick={()=>setInfo(item)}
                className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontFamily: "Poppins, sans-serif", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer" }}
              >
                {item}
              </button>
            ))}
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{ background: "rgba(255,255,255,0.92)", color: "#1565C0", fontFamily: "Poppins, sans-serif", border: "1px solid rgba(255,255,255,0.5)", textDecoration: "none" }}
            >
              Teacher Login →
            </Link>
            <Link to="/login?role=admin" className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background:"rgba(13,33,55,0.9)", color:"#fff", fontFamily:"Poppins, sans-serif", border:"1px solid rgba(255,255,255,0.35)", textDecoration:"none" }}>Admin Login →</Link>
          </div>
        </div>

        {/* White card */}
        <div
          className="w-full rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: "#fff", boxShadow: "0 32px 80px rgba(13,33,55,0.22), 0 8px 24px rgba(13,33,55,0.10)" }}
        >
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", minHeight: 560 }}>

            {/* LEFT — info panel */}
            <div
              className="flex flex-col justify-between p-12"
              style={{ background: "linear-gradient(160deg, #f0f7ff 0%, #e8f8f1 100%)" }}
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                  style={{ background: "linear-gradient(90deg,#1565C0,#27ae60)", boxShadow: "0 2px 12px rgba(21,101,192,0.25)" }}
                >
                  <span className="material-icons-round text-white" style={{ fontSize: 14 }}>school</span>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 11, color: "#fff", letterSpacing: "0.06em" }}>ADAPTIVE LEARNING PLATFORM</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.55 }}
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 38, color: "#0D2137", lineHeight: 1.15, marginBottom: 16 }}
                >
                  Intelligent<br />
                  <span style={{ background: "linear-gradient(90deg,#1565C0,#27ae60)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Adaptive Learning
                  </span><br />
                  Platform
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.5 }}
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 15, color: "#4A6580", lineHeight: 1.65, maxWidth: 340, marginBottom: 28 }}
                >
                  Empowering Personalized Learning for Students with Intellectual Disabilities
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.54, duration: 0.5 }}
                  className="flex flex-wrap gap-3 mb-8"
                >
                  <StatChip icon="people" label="Active Students" value={String(stats.students)} color="#1565C0" />
                  <StatChip icon="auto_awesome" label="Learning Paths" value={String(stats.modules)} color="#27ae60" />
                  <StatChip icon="verified" label="Success Rate" value={`${stats.success}%`} color="#AB47BC" />
                </motion.div>
              </div>

              {/* Loading section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-4"
              >
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "linear-gradient(135deg,#1565C0,#0d9e6e)", boxShadow: "0 8px 28px rgba(21,101,192,0.30)" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.9)", marginBottom: 2 }}>
                        {loadingText}
                      </div>
                      <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
                        Please wait while we set up your experience
                      </div>
                    </div>
                    <LoadingDots />
                  </div>
                  <ProgressBar value={progress} />
                  <div className="flex justify-between mt-2">
                    <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Loading</span>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 11, color: "rgba(255,255,255,0.9)" }}>{Math.round(progress)}%</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {["AI-Powered", "Accessible", "Inclusive", "Real-time Feedback"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ background: "rgba(21,101,192,0.08)", color: "#1565C0", fontFamily: "Poppins, sans-serif", border: "1px solid rgba(21,101,192,0.15)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT — illustration panel */}
            <div
              className="relative flex flex-col items-center justify-center p-8"
              style={{ background: "#fff" }}
            >
              <div
                className="absolute top-8 right-8 rounded-full"
                style={{ width: 120, height: 120, background: "linear-gradient(135deg,rgba(21,101,192,0.06),rgba(39,174,96,0.08))", border: "1.5px solid rgba(21,101,192,0.10)" }}
              />
              <div
                className="absolute bottom-12 left-6 rounded-full"
                style={{ width: 72, height: 72, background: "rgba(39,174,96,0.08)", border: "1.5px solid rgba(39,174,96,0.15)" }}
              />

              <motion.div
                initial={{ opacity: 0, x: 16, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute top-8 right-6 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2"
                style={{ background: "#fff", border: "1.5px solid rgba(21,101,192,0.12)", zIndex: 2 }}
              >
                <div className="flex items-center justify-center rounded-xl" style={{ width: 32, height: 32, background: "linear-gradient(135deg,#FFD54F,#FF8F00)" }}>
                  <span className="material-icons-round text-white" style={{ fontSize: 18 }}>emoji_events</span>
                </div>
                <div>
                  <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 12, color: "#0D2137" }}>Achievement</div>
                  <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 10, color: "#4A6580" }}>Level 3 Unlocked!</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -16, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.75, duration: 0.5 }}
                className="absolute bottom-10 left-6 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-2"
                style={{ background: "#fff", border: "1.5px solid rgba(39,174,96,0.15)", zIndex: 2 }}
              >
                <div className="flex items-center justify-center rounded-xl" style={{ width: 32, height: 32, background: "linear-gradient(135deg,#2ECC71,#1a8a4a)" }}>
                  <span className="material-icons-round text-white" style={{ fontSize: 18 }}>trending_up</span>
                </div>
                <div>
                  <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 12, color: "#0D2137" }}>Progress</div>
                  <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 10, color: "#4A6580" }}>78% this week</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
                style={{ maxWidth: 460 }}
              >
                <TeacherIllustration />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="text-center mt-2"
              >
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: 13, color: "#4A6580" }}>
                  Every child learns differently — and that is{" "}
                  <span style={{ color: "#1565C0", fontWeight: 600 }}>beautiful.</span>
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex items-center justify-between mt-5 px-2"
        >
          <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            © 2025 GIID Tambaram. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Use", "Accessibility"].map((item) => (
              <a
                key={item}
                href="#"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.65)", textDecoration: "none" }}
              >
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
