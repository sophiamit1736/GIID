import { API_BASE } from "../api/config";
import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";
import axios from "axios";

/* ─── Flat SVG illustration ─── */
function TeacherIllustration() {
  return (
    <svg
      viewBox="0 0 540 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Illustration of a teacher helping children learn in a classroom"
    >
      <ellipse cx="270" cy="490" rx="240" ry="22" fill="rgba(21,101,192,0.07)" />

      {/* Window */}
      <rect x="38" y="38" width="110" height="90" rx="14" fill="#E3F2FD" stroke="#BBDEFB" strokeWidth="2.5" />
      <line x1="93" y1="38" x2="93" y2="128" stroke="#BBDEFB" strokeWidth="2" />
      <line x1="38" y1="83" x2="148" y2="83" stroke="#BBDEFB" strokeWidth="2" />
      <circle cx="70" cy="62" r="14" fill="#FFF9C4" opacity="0.8" />
      <path d="M60 62 Q70 50 80 62" fill="#FFD54F" opacity="0.6" />

      {/* Plant */}
      <rect x="410" y="390" width="36" height="28" rx="8" fill="#A5D6A7" />
      <rect x="418" y="380" width="20" height="12" rx="4" fill="#81C784" />
      <ellipse cx="406" cy="375" rx="14" ry="18" fill="#66BB6A" />
      <ellipse cx="420" cy="368" rx="12" ry="16" fill="#4CAF50" />
      <ellipse cx="434" cy="374" rx="11" ry="15" fill="#66BB6A" />

      {/* Bookshelf */}
      <rect x="390" y="42" width="120" height="100" rx="10" fill="#EFEBE9" stroke="#D7CCC8" strokeWidth="2" />
      <rect x="398" y="52" width="20" height="40" rx="4" fill="#EF5350" />
      <rect x="422" y="58" width="16" height="34" rx="4" fill="#5C6BC0" />
      <rect x="442" y="54" width="18" height="38" rx="4" fill="#26A69A" />
      <rect x="464" y="60" width="14" height="32" rx="4" fill="#FFA726" />
      <rect x="482" y="56" width="20" height="36" rx="4" fill="#AB47BC" />
      <rect x="398" y="108" width="104" height="6" rx="3" fill="#D7CCC8" />
      <rect x="398" y="118" width="80" height="22" rx="4" fill="#EFEBE9" />
      <rect x="402" y="122" width="72" height="4" rx="2" fill="#D7CCC8" />
      <rect x="402" y="130" width="52" height="4" rx="2" fill="#D7CCC8" />

      {/* Whiteboard */}
      <rect x="90" y="150" width="210" height="140" rx="14" fill="#ffffff" stroke="#E3F2FD" strokeWidth="3" />
      <rect x="90" y="278" width="210" height="10" rx="5" fill="#BBDEFB" />
      <line x1="140" y1="288" x2="128" y2="350" stroke="#90CAF9" strokeWidth="5" strokeLinecap="round" />
      <line x1="250" y1="288" x2="262" y2="350" stroke="#90CAF9" strokeWidth="5" strokeLinecap="round" />
      <text x="195" y="198" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="26" fill="#1565C0">2 + 3 = 5</text>
      <text x="195" y="230" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="14" fill="#4A6580">Learn · Grow · Achieve</text>
      <rect x="112" y="244" width="166" height="6" rx="3" fill="#E3F2FD" />
      <rect x="112" y="256" width="120" height="6" rx="3" fill="#E8F5E9" />
      <text x="104" y="175" fontSize="16" fill="#FFD54F">★</text>
      <text x="276" y="175" fontSize="16" fill="#FFD54F">★</text>

      {/* ── TEACHER ── */}
      <rect x="284" y="358" width="22" height="90" rx="11" fill="#0D47A1" />
      <rect x="312" y="358" width="22" height="90" rx="11" fill="#0D47A1" />
      <ellipse cx="295" cy="450" rx="18" ry="9" fill="#212121" />
      <ellipse cx="323" cy="450" rx="18" ry="9" fill="#212121" />
      <rect x="272" y="255" width="76" height="110" rx="28" fill="#1565C0" />
      <rect x="292" y="255" width="36" height="32" rx="14" fill="#5C9CE6" />
      <ellipse cx="310" cy="236" rx="34" ry="34" fill="#FDBCB4" />
      <ellipse cx="310" cy="210" rx="34" ry="18" fill="#4E342E" />
      <ellipse cx="278" cy="228" rx="10" ry="14" fill="#4E342E" />
      <ellipse cx="342" cy="228" rx="10" ry="14" fill="#4E342E" />
      <ellipse cx="301" cy="236" rx="4" ry="4" fill="#0D2137" />
      <ellipse cx="319" cy="236" rx="4" ry="4" fill="#0D2137" />
      <ellipse cx="301.8" cy="234.8" rx="1.5" ry="1.5" fill="#fff" />
      <ellipse cx="319.8" cy="234.8" rx="1.5" ry="1.5" fill="#fff" />
      <rect x="294" y="230" width="14" height="10" rx="4" fill="none" stroke="#5D4037" strokeWidth="2" />
      <rect x="312" y="230" width="14" height="10" rx="4" fill="none" stroke="#5D4037" strokeWidth="2" />
      <line x1="308" y1="235" x2="312" y2="235" stroke="#5D4037" strokeWidth="1.5" />
      <path d="M302 246 Q310 253 318 246" stroke="#0D2137" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="230" y="265" width="46" height="16" rx="8" fill="#1565C0" />
      <ellipse cx="228" cy="273" rx="10" ry="10" fill="#FDBCB4" />
      <rect x="344" y="265" width="44" height="16" rx="8" fill="#1565C0" />
      <ellipse cx="390" cy="273" rx="10" ry="10" fill="#FDBCB4" />
      <rect x="392" y="254" width="48" height="60" rx="6" fill="#fff" stroke="#E3F2FD" strokeWidth="2" />
      <rect x="398" y="262" width="36" height="4" rx="2" fill="#90CAF9" />
      <rect x="398" y="270" width="28" height="4" rx="2" fill="#A5D6A7" />
      <rect x="398" y="278" width="32" height="4" rx="2" fill="#90CAF9" />
      <rect x="398" y="286" width="24" height="4" rx="2" fill="#A5D6A7" />
      <text x="416" y="304" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="13" fill="#2ECC71">A+</text>

      {/* ── CHILD 1 ── */}
      <rect x="68" y="350" width="80" height="24" rx="10" fill="#FFF9C4" stroke="#FFD54F" strokeWidth="2" />
      <rect x="86" y="310" width="48" height="70" rx="20" fill="#FF7043" />
      <ellipse cx="110" cy="294" rx="26" ry="26" fill="#FDBCB4" />
      <ellipse cx="110" cy="273" rx="26" ry="16" fill="#1A237E" />
      <ellipse cx="86" cy="283" rx="8" ry="12" fill="#1A237E" />
      <ellipse cx="136" cy="283" rx="8" ry="12" fill="#1A237E" />
      <ellipse cx="103" cy="294" rx="3.2" ry="3.2" fill="#0D2137" />
      <ellipse cx="117" cy="294" rx="3.2" ry="3.2" fill="#0D2137" />
      <path d="M104 303 Q110 309 116 303" stroke="#0D2137" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="128" y="282" width="12" height="48" rx="6" fill="#FF7043" transform="rotate(-22 128 282)" />
      <ellipse cx="142" cy="270" rx="10" ry="10" fill="#FDBCB4" />
      <rect x="74" y="344" width="68" height="42" rx="8" fill="#5C6BC0" />
      <rect x="80" y="350" width="56" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
      <rect x="80" y="358" width="42" height="5" rx="2.5" fill="rgba(255,255,255,0.4)" />
      <rect x="80" y="366" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
      <rect x="90" y="375" width="16" height="54" rx="8" fill="#E64A19" />
      <rect x="112" y="375" width="16" height="54" rx="8" fill="#E64A19" />
      <ellipse cx="98" cy="430" rx="14" ry="7" fill="#37474F" />
      <ellipse cx="120" cy="430" rx="14" ry="7" fill="#37474F" />

      {/* ── CHILD 2 ── */}
      <rect x="370" y="350" width="80" height="24" rx="10" fill="#FCE4EC" stroke="#F48FB1" strokeWidth="2" />
      <rect x="388" y="310" width="48" height="70" rx="20" fill="#AB47BC" />
      <ellipse cx="412" cy="294" rx="26" ry="26" fill="#FDBCB4" />
      <ellipse cx="412" cy="274" rx="26" ry="16" fill="#4E342E" />
      <ellipse cx="388" cy="278" rx="9" ry="18" fill="#4E342E" />
      <ellipse cx="436" cy="278" rx="9" ry="18" fill="#4E342E" />
      <ellipse cx="405" cy="294" rx="3.2" ry="3.2" fill="#0D2137" />
      <ellipse cx="419" cy="294" rx="3.2" ry="3.2" fill="#0D2137" />
      <path d="M406 303 Q412 309 418 303" stroke="#0D2137" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="375" y="340" width="56" height="42" rx="8" fill="#fff" stroke="#90CAF9" strokeWidth="2.5" />
      <rect x="381" y="347" width="44" height="28" rx="5" fill="#E3F2FD" />
      <text x="403" y="364" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="12" fill="#1565C0">4×3=?</text>
      <text x="403" y="374" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="11" fill="#2ECC71">= 12 ✓</text>
      <rect x="392" y="375" width="16" height="54" rx="8" fill="#7B1FA2" />
      <rect x="414" y="375" width="16" height="54" rx="8" fill="#7B1FA2" />
      <ellipse cx="400" cy="430" rx="14" ry="7" fill="#37474F" />
      <ellipse cx="422" cy="430" rx="14" ry="7" fill="#37474F" />
      <rect x="430" y="320" width="24" height="12" rx="6" fill="#AB47BC" />
      <rect x="364" y="320" width="24" height="12" rx="6" fill="#AB47BC" />

      {/* Decorations */}
      <text x="48" y="140" fontSize="22" fill="#FFD54F" opacity="0.9">★</text>
      <text x="468" y="155" fontSize="18" fill="#FFD54F" opacity="0.8">★</text>
      <text x="480" y="220" fontSize="14" fill="#FF7043" opacity="0.7">★</text>
      <rect x="40" y="310" width="10" height="52" rx="4" fill="#FDD835" transform="rotate(15 40 310)" />
      <polygon points="40,362 50,362 45,376" fill="#FF8F00" transform="rotate(15 40 310)" />
      <rect x="40" y="308" width="10" height="8" rx="2" fill="#FF8F00" transform="rotate(15 40 310)" />
      <rect x="460" y="340" width="12" height="68" rx="4" fill="#B3E5FC" transform="rotate(-12 460 340)" stroke="#4FC3F7" strokeWidth="1.5" />
      <circle cx="55" cy="350" r="6" fill="#2ECC71" opacity="0.7" />
      <circle cx="480" cy="290" r="5" fill="#FF7043" opacity="0.6" />
      <circle cx="68" cy="420" r="4" fill="#AB47BC" opacity="0.6" />
      <circle cx="498" cy="420" r="5" fill="#FFD54F" opacity="0.7" />
    </svg>
  );
}

/* ─── Input field ─── */
function InputField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  rightEl,
  error,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: string;
  rightEl?: React.ReactNode;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: 13, color: "#0D2137" }}>
        {label}
      </label>
      <div
        className="flex items-center rounded-2xl transition-all duration-200 overflow-hidden"
        style={{
          border: `2px solid ${error ? "#d4183d" : focused ? "#1565C0" : "rgba(21,101,192,0.18)"}`,
          background: focused ? "#f0f7ff" : "#F8FAFF",
          boxShadow: focused ? "0 0 0 4px rgba(21,101,192,0.10)" : "none",
        }}
      >
        <span className="material-icons-round pl-4 pr-2" style={{ fontSize: 20, color: error ? "#d4183d" : focused ? "#1565C0" : "#90a4b8" }}>
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={id}
          className="flex-1 bg-transparent outline-none py-3.5 pr-2"
          style={{ fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 400, color: "#0D2137" }}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
        {rightEl && <div className="pr-3">{rightEl}</div>}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" style={{ fontFamily: "Poppins, sans-serif", fontSize: 12, color: "#d4183d" }}>
          <span className="material-icons-round align-text-bottom" style={{ fontSize: 14 }}>error_outline</span>{" "}
          {error}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const location=useLocation();
  const expectedRole=new URLSearchParams(location.search).get("role") || "teacher";

  function validate() {
  const e: { username?: string; password?: string } = {};

  if (!username.trim()) {
    e.username = "Email is required.";
  }

  if (!password) {
    e.password = "Password is required.";
  }

  return e;
}
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const errs = validate();
  setErrors(errs);

  if (Object.keys(errs).length) return;

  try {
    setLoading(true);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username, // your input field currently stores email
        password,
        expectedRole,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      setLoading(false);
      return;
    }

    // Save token
    localStorage.setItem("token", data.token);

    // Save user
    localStorage.setItem("user", JSON.stringify(data.user));

    setSuccess(true);

    setTimeout(() => {
      window.location.href = data.user.role === "admin" ? "/admin" : "/dashboard";
    }, 1500);

  } catch (err) {
    console.error(err);
    alert("Server Error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full min-h-screen flex" style={{ fontFamily: "Poppins, sans-serif", background: "#EBF5FB" }}>

      {/* ── LEFT panel ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          width: "52%",
          minHeight: "100vh",
          background: "linear-gradient(150deg, #1a6db5 0%, #1565C0 35%, #0d9e6e 75%, #27ae60 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 440, height: 440, background: "radial-gradient(circle, rgba(46,204,113,0.18) 0%, transparent 70%)", top: -100, right: -80 }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ width: 320, height: 320, background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)", bottom: 40, left: -40 }}
          animate={{ scale: [1, 1.10, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />

        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div
              className="flex items-center justify-center rounded-2xl shadow-lg"
              style={{ width: 48, height: 48, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(6px)", border: "1.5px solid rgba(255,255,255,0.35)" }}
            >
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>G</span>
            </div>
            <div>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.1 }}>GIID Tambaram</div>
              <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.07em" }}>ADAPTIVE LEARNING PLATFORM</div>
            </div>
          </Link>
        </div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 px-8"
          style={{ maxWidth: 540, width: "100%" }}
        >
          <TeacherIllustration />
        </motion.div>

        {/* Caption */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10 mx-8 mt-2 px-6 py-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.25)", maxWidth: 480 }}
        >
          <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 15, color: "#fff", lineHeight: 1.55, marginBottom: 4 }}>
            "Empowering every child to learn at their own pace."
          </p>
          <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
            Intelligent Adaptive Learning Platform for Students with Intellectual Disabilities
          </p>
        </motion.div>

        {/* Stat pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="relative z-10 flex gap-4 mt-6 mb-8"
        >
          {[
            { icon: "people", value: "2,400+", label: "Students" },
            { icon: "auto_awesome", value: "120+", label: "Modules" },
            { icon: "verified", value: "94%", label: "Success" },
          ].map(({ icon, value, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <span className="material-icons-round" style={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }}>{icon}</span>
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 13, color: "#fff" }}>{value}</span>
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── RIGHT panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: "#F0F6FF" }}>
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
          style={{ maxWidth: 440 }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              <div className="flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: "linear-gradient(135deg,#1565C0,#27ae60)" }}>
                <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 17, color: "#fff" }}>G</span>
              </div>
              <div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14, color: "#0D2137" }}>GIID Tambaram</div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 10, color: "#4A6580" }}>Adaptive Learning Platform</div>
              </div>
            </Link>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-10"
            style={{ background: "#fff", boxShadow: "0 8px 48px rgba(21,101,192,0.12), 0 2px 12px rgba(21,101,192,0.07)" }}
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div
                  className="flex items-center justify-center rounded-full mb-5"
                  style={{ width: 72, height: 72, background: "linear-gradient(135deg,#27ae60,#2ECC71)" }}
                >
                  <span className="material-icons-round text-white" style={{ fontSize: 40 }}>check_circle</span>
                </div>
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 22, color: "#0D2137", marginBottom: 8 }}>
                  Welcome back!
                </h2>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 14, color: "#4A6580", lineHeight: 1.6 }}>
                  You have successfully signed in. Redirecting to your dashboard…
                </p>
                <div className="flex gap-1.5 mt-6">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block rounded-full"
                      style={{ width: 9, height: 9, background: "#1565C0" }}
                      animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{ width: 40, height: 40, background: "linear-gradient(135deg,#1565C0,#27ae60)" }}
                    >
                      <span className="material-icons-round text-white" style={{ fontSize: 22 }}>school</span>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: "#E3F2FD", color: "#1565C0", fontFamily: "Poppins, sans-serif" }}
                    >
                      Teacher Portal
                    </span>
                  </div>
                  <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 26, color: "#0D2137", lineHeight: 1.2, marginBottom: 6 }}>
                    Welcome back
                  </h1>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 14, color: "#4A6580", lineHeight: 1.55 }}>
                    Sign in to manage your students and learning modules.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} noValidate className="flex flex-col gap-5">
                  {serverError && (
                  <div
                    style={{
                      background: "#FEE2E2",
                      color: "#B91C1C",
                      padding: "12px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      marginBottom: "10px",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {serverError}
                  </div>
                )}
                  <InputField
                    id="username"
                    label="Email"
                    type="text"
                    value={username}
                    onChange={setUsername}
                    placeholder="Enter your Email"
                    icon="person"
                    error={errors.username}
                  />
                  <InputField
                    id="current-password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="Enter your password"
                    icon="lock"
                    error={errors.password}
                    rightEl={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="flex items-center justify-center p-1 rounded-lg transition-colors"
                        style={{ color: "#90a4b8", background: "none", border: "none", cursor: "pointer" }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />

                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div
                        onClick={() => setRememberMe((v) => !v)}
                        className="flex items-center justify-center rounded-lg transition-all duration-200"
                        style={{
                          width: 22, height: 22,
                          border: `2px solid ${rememberMe ? "#1565C0" : "rgba(21,101,192,0.30)"}`,
                          background: rememberMe ? "#1565C0" : "#fff",
                          cursor: "pointer",
                        }}
                      >
                        {rememberMe && (
                          <span className="material-icons-round text-white" style={{ fontSize: 15 }}>check</span>
                        )}
                      </div>
                      <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 13, color: "#4A6580" }}>
                        Remember me
                      </span>
                    </label>
                    <a href="#" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: 13, color: "#1565C0", textDecoration: "none" }} className="hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 mt-1 transition-all duration-200"
                    style={{
                      background: loading
                        ? "linear-gradient(135deg,#5c8fd6,#4aaa78)"
                        : "linear-gradient(135deg,#1565C0 0%,#0d9e6e 100%)",
                      color: "#fff",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                      fontSize: 15,
                      border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: loading ? "none" : "0 6px 24px rgba(21,101,192,0.32)",
                    }}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Signing in…
                      </>
                    ) : (
                      <>
                        <span className="material-icons-round" style={{ fontSize: 20 }}>login</span>
                        Sign In
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px" style={{ background: "rgba(21,101,192,0.12)" }} />
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 12, color: "#90a4b8" }}>or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(21,101,192,0.12)" }} />
                </div>

                {/* SSO */}
                {/* <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 transition-all duration-200"
                  style={{
                    background: "#fff", border: "2px solid rgba(21,101,192,0.18)",
                    fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: 14, color: "#0D2137",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(21,101,192,0.06)",
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: 20, color: "#1565C0" }}>corporate_fare</span>
                  Sign in with Institution SSO
                </button> */}

                <p className="text-center mt-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 13, color: "#90a4b8" }}>
                  New to GIID?{" "}
                  <Link to="/register" style={{ color: "#1565C0", fontWeight: 600, textDecoration: "none" }} className="hover:underline">
                    Create an account →
                  </Link>
                </p>
                <p className="text-center mt-2" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 12, color: "#90a4b8" }}>
                  Need access?{" "}
                  <a href="#" style={{ color: "#1565C0", fontWeight: 500, textDecoration: "none" }} className="hover:underline">
                    Contact your administrator
                  </a>
                </p>
              </>
            )}
          </div>

          {/* Back link + footer */}
          <div className="flex items-center justify-between mt-5 px-1">
            <Link
              to="/"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, fontSize: 13, color: "#1565C0", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
              className="hover:underline"
            >
              <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
              Back to Home
            </Link>
            <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: 12, color: "#4A6580" }}>
              © 2025 GIID Tambaram
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
