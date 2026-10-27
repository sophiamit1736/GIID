import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import API from "../api/authApi";


const P = "Poppins, sans-serif";

/* ─── Left panel illustration ─── */
function RegisterIllustration() {
  return (
    <svg
      viewBox="0 0 480 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Teacher at desk with books and laptop"
    >
      {/* Floor shadow */}
      <ellipse cx="240" cy="342" rx="200" ry="14" fill="rgba(0,0,0,0.10)" />

      {/* Desk */}
      <rect x="60" y="248" width="360" height="24" rx="10" fill="#EFEBE9" stroke="#D7CCC8" strokeWidth="2" />
      <rect x="80" y="272" width="16" height="64" rx="6" fill="#D7CCC8" />
      <rect x="384" y="272" width="16" height="64" rx="6" fill="#D7CCC8" />

      {/* Open book left */}
      <rect x="72" y="200" width="70" height="52" rx="6" fill="#fff" stroke="#90CAF9" strokeWidth="2" />
      <rect x="72" y="200" width="35" height="52" rx="6" fill="#E3F2FD" />
      <line x1="107" y1="200" x2="107" y2="252" stroke="#90CAF9" strokeWidth="1.5" />
      <rect x="80" y="212" width="20" height="3" rx="1.5" fill="#90CAF9" />
      <rect x="80" y="220" width="16" height="3" rx="1.5" fill="#90CAF9" />
      <rect x="80" y="228" width="18" height="3" rx="1.5" fill="#90CAF9" />
      <rect x="80" y="236" width="12" height="3" rx="1.5" fill="#90CAF9" />
      <rect x="114" y="212" width="20" height="3" rx="1.5" fill="#BBDEFB" />
      <rect x="114" y="220" width="16" height="3" rx="1.5" fill="#BBDEFB" />
      <rect x="114" y="228" width="18" height="3" rx="1.5" fill="#BBDEFB" />

      {/* Open book right */}
      <rect x="162" y="208" width="70" height="44" rx="6" fill="#fff" stroke="#A5D6A7" strokeWidth="2" />
      <rect x="162" y="208" width="35" height="44" rx="6" fill="#E8F5E9" />
      <line x1="197" y1="208" x2="197" y2="252" stroke="#A5D6A7" strokeWidth="1.5" />
      <rect x="170" y="220" width="18" height="3" rx="1.5" fill="#A5D6A7" />
      <rect x="170" y="228" width="14" height="3" rx="1.5" fill="#A5D6A7" />
      <rect x="170" y="236" width="16" height="3" rx="1.5" fill="#A5D6A7" />
      <rect x="204" y="220" width="18" height="3" rx="1.5" fill="#C8E6C9" />
      <rect x="204" y="228" width="14" height="3" rx="1.5" fill="#C8E6C9" />

      {/* Pencil holder */}
      <rect x="390" y="214" width="28" height="36" rx="8" fill="#B3E5FC" stroke="#4FC3F7" strokeWidth="1.5" />
      {/* Pencils */}
      <rect x="396" y="190" width="5" height="30" rx="2" fill="#FDD835" />
      <polygon points="396,190 401,190 398.5,182" fill="#FF8F00" />
      <rect x="404" y="194" width="5" height="26" rx="2" fill="#EF5350" />
      <polygon points="404,194 409,194 406.5,186" fill="#B71C1C" />
      <rect x="412" y="188" width="5" height="32" rx="2" fill="#66BB6A" />
      <polygon points="412,188 417,188 414.5,180" fill="#2E7D32" />

      {/* Laptop */}
      <rect x="256" y="178" width="130" height="76" rx="8" fill="#37474F" />
      <rect x="262" y="184" width="118" height="64" rx="5" fill="#1565C0" />
      {/* Screen content */}
      <rect x="270" y="192" width="102" height="10" rx="3" fill="rgba(255,255,255,0.20)" />
      <rect x="270" y="208" width="60" height="7" rx="2" fill="rgba(255,255,255,0.30)" />
      <rect x="270" y="220" width="80" height="7" rx="2" fill="rgba(255,255,255,0.20)" />
      <rect x="270" y="232" width="50" height="7" rx="2" fill="rgba(39,174,96,0.60)" />
      <text x="321" y="204" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="11" fill="#27ae60">GIID</text>
      {/* Laptop base */}
      <rect x="240" y="252" width="162" height="8" rx="4" fill="#546E7A" />

      {/* Teacher body */}
      {/* Legs */}
      <rect x="218" y="310" width="20" height="28" rx="8" fill="#0D47A1" />
      <rect x="246" y="310" width="20" height="28" rx="8" fill="#0D47A1" />
      <ellipse cx="228" cy="338" rx="16" ry="7" fill="#212121" />
      <ellipse cx="256" cy="338" rx="16" ry="7" fill="#212121" />
      {/* Torso */}
      <rect x="200" y="218" width="84" height="100" rx="26" fill="#1565C0" />
      {/* Shirt detail */}
      <rect x="220" y="218" width="44" height="30" rx="14" fill="#5C9CE6" />
      {/* Left arm pointing at laptop */}
      <rect x="196" y="226" width="46" height="14" rx="7" fill="#1565C0" />
      <ellipse cx="194" cy="233" rx="10" ry="10" fill="#FDBCB4" />
      {/* Right arm */}
      <rect x="284" y="226" width="46" height="14" rx="7" fill="#1565C0" />
      <ellipse cx="332" cy="233" rx="10" ry="10" fill="#FDBCB4" />
      {/* Head */}
      <ellipse cx="242" cy="196" rx="36" ry="36" fill="#FDBCB4" />
      {/* Hair */}
      <ellipse cx="242" cy="168" rx="36" ry="18" fill="#4E342E" />
      <ellipse cx="208" cy="186" rx="10" ry="14" fill="#4E342E" />
      <ellipse cx="276" cy="186" rx="10" ry="14" fill="#4E342E" />
      {/* Eyes */}
      <ellipse cx="233" cy="196" rx="4.5" ry="4.5" fill="#0D2137" />
      <ellipse cx="251" cy="196" rx="4.5" ry="4.5" fill="#0D2137" />
      <ellipse cx="234" cy="194.5" rx="1.8" ry="1.8" fill="#fff" />
      <ellipse cx="252" cy="194.5" rx="1.8" ry="1.8" fill="#fff" />
      {/* Glasses */}
      <rect x="224" y="191" width="16" height="11" rx="4" fill="none" stroke="#5D4037" strokeWidth="2" />
      <rect x="243" y="191" width="16" height="11" rx="4" fill="none" stroke="#5D4037" strokeWidth="2" />
      <line x1="240" y1="196" x2="243" y2="196" stroke="#5D4037" strokeWidth="1.5" />
      {/* Smile */}
      <path d="M234 207 Q242 214 250 207" stroke="#0D2137" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Decorations */}
      <text x="44" y="130" fontSize="24" fill="#FFD54F" opacity="0.9">★</text>
      <text x="430" y="100" fontSize="20" fill="#FFD54F" opacity="0.75">★</text>
      {/* Lightbulb */}
      <circle cx="440" cy="168" r="14" fill="#FFF9C4" stroke="#FFD54F" strokeWidth="2" />
      <rect x="435" y="180" width="10" height="6" rx="2" fill="#FFD54F" />
      <line x1="440" y1="150" x2="440" y2="144" stroke="#FDD835" strokeWidth="2" strokeLinecap="round" />
      <line x1="426" y1="156" x2="421" y2="151" stroke="#FDD835" strokeWidth="2" strokeLinecap="round" />
      <line x1="454" y1="156" x2="459" y2="151" stroke="#FDD835" strokeWidth="2" strokeLinecap="round" />
      {/* Small circles */}
      <circle cx="46" cy="280" r="6" fill="#27ae60" opacity="0.6" />
      <circle cx="462" cy="310" r="5" fill="#FF7043" opacity="0.55" />
      <circle cx="46" cy="360" r="4" fill="#AB47BC" opacity="0.5" />
    </svg>
  );
}

/* ─── Reusable FormField ─── */
function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  rightEl,
  children,
}: {
  id: string;
  label: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  icon: string;
  rightEl?: React.ReactNode;
  children?: React.ReactNode; // for select
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        style={{ fontFamily: P, fontWeight: 500, fontSize: 13, color: "#0D2137" }}
      >
        {label}
      </label>
      <div
        className="flex items-center rounded-2xl transition-all duration-200 overflow-hidden"
        style={{
          border: `2px solid ${focused ? "#1565C0" : "rgba(21,101,192,0.18)"}`,
          background: focused ? "#f0f7ff" : "#F8FAFF",
          boxShadow: focused ? "0 0 0 4px rgba(21,101,192,0.10)" : "none",
        }}
      >
        <span
          className="material-icons-round pl-4 pr-2"
          style={{ fontSize: 20, color: focused ? "#1565C0" : "#90a4b8", flexShrink: 0 }}
        >
          {icon}
        </span>
        {children ? (
          <div className="flex-1 pr-2 py-0.5">
            {children}
          </div>
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none py-3.5 pr-2"
            style={{ fontFamily: P, fontSize: 14, fontWeight: 400, color: "#0D2137" }}
          />
        )}
        {rightEl && <div className="pr-3">{rightEl}</div>}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [deptFocused, setDeptFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (
    !fullName ||
    !email ||
    !department ||
    !password ||
    !confirmPassword
  ) {
    alert("Please fill all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    const res = await API.post("/register", {
      name: fullName,
      email,
      employeeId,
      department,
      password,
      role: "teacher",
    });

    alert(res.data.message);

    navigate("/login");
  } catch (err: any) {
    alert(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
}

  const eyeButton = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      style={{ color: "#90a4b8", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
      aria-label={show ? "Hide password" : "Show password"}
    >
      <span className="material-icons-round" style={{ fontSize: 20 }}>
        {show ? "visibility_off" : "visibility"}
      </span>
    </button>
  );

  return (
    <div
      className="w-full min-h-screen flex"
      style={{ fontFamily: P, background: "#EBF5FB" }}
    >
      {/* ── LEFT panel ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-between relative overflow-hidden"
        style={{
          width: "52%",
          minHeight: "100vh",
          background: "linear-gradient(150deg,#1a6db5 0%,#1565C0 35%,#0d9e6e 75%,#27ae60 100%)",
        }}
      >
        {/* dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* animated orbs */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 440,
            height: 440,
            background: "radial-gradient(circle, rgba(46,204,113,0.18) 0%, transparent 70%)",
            top: -100,
            right: -80,
          }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 320,
            height: 320,
            background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)",
            bottom: 40,
            left: -40,
          }}
          animate={{ scale: [1, 1.10, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />

        {/* Logo top-left */}
        <div className="self-start z-10 pt-8 pl-8">
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <div
              className="flex items-center justify-center rounded-2xl shadow-lg"
              style={{
                width: 48,
                height: 48,
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(6px)",
                border: "1.5px solid rgba(255,255,255,0.35)",
              }}
            >
              <span style={{ fontFamily: P, fontWeight: 800, fontSize: 18, color: "#fff" }}>G</span>
            </div>
            <div>
              <div style={{ fontFamily: P, fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1.1 }}>GIID Tambaram</div>
              <div style={{ fontFamily: P, fontWeight: 400, fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.07em" }}>
                ADAPTIVE LEARNING PLATFORM
              </div>
            </div>
          </Link>
        </div>

        {/* Center illustration */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 px-10 flex-1 flex items-center"
          style={{ maxWidth: 480, width: "100%" }}
        >
          <RegisterIllustration />
        </motion.div>

        {/* Bottom caption */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10 mx-8 mb-8 px-6 py-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(10px)",
            border: "1.5px solid rgba(255,255,255,0.25)",
            maxWidth: 440,
          }}
        >
          <p style={{ fontFamily: P, fontWeight: 600, fontSize: 15, color: "#fff", lineHeight: 1.55 }}>
            "Join the platform shaping the future of special education."
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT panel ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-10"
        style={{ background: "#F0F6FF" }}
      >
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
          style={{ maxWidth: 480 }}
        >
          {/* Card */}
          <div
            className="rounded-3xl p-10"
            style={{
              background: "#fff",
              boxShadow: "0 8px 48px rgba(21,101,192,0.12), 0 2px 12px rgba(21,101,192,0.07)",
            }}
          >
            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 40, height: 40, background: "linear-gradient(135deg,#1565C0,#27ae60)" }}
                >
                  <span className="material-icons-round text-white" style={{ fontSize: 22 }}>school</span>
                </div>
                <span
                  className="px-3 py-1 rounded-full"
                  style={{ background: "#E3F2FD", color: "#1565C0", fontFamily: P, fontWeight: 600, fontSize: 12 }}
                >
                  Teacher Portal
                </span>
              </div>
              <h1 style={{ fontFamily: P, fontWeight: 700, fontSize: 26, color: "#0D2137", lineHeight: 1.2, marginBottom: 6 }}>
                Create Account
              </h1>
              <p style={{ fontFamily: P, fontWeight: 400, fontSize: 14, color: "#4A6580", lineHeight: 1.55 }}>
                Register to start managing students and adaptive learning modules.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

  <FormField
    id="fullName"
    label="Full Name"
    type="text"
    value={fullName}
    onChange={setFullName}
    placeholder="Enter your full name"
    icon="person"
  />

  <FormField
    id="email"
    label="Email Address"
    type="email"
    value={email}
    onChange={setEmail}
    placeholder="you@institution.edu"
    icon="email"
  />

  {/* <FormField
    id="employeeId"
    label="Employee ID"
    type="text"
    value={employeeId}
    onChange={setEmployeeId}
    placeholder="EMP-001"
    icon="badge"
  /> */}

  {/* Department */}

  <div className="flex flex-col gap-1.5">

    <label
      htmlFor="department"
      style={{
        fontFamily: P,
        fontWeight: 500,
        fontSize: 13,
        color: "#0D2137",
      }}
    >
      Department
    </label>

    <div
      className="flex items-center rounded-2xl transition-all duration-200 overflow-hidden"
      style={{
        border: `2px solid ${
          deptFocused
            ? "#1565C0"
            : "rgba(21,101,192,0.18)"
        }`,
        background: deptFocused
          ? "#f0f7ff"
          : "#F8FAFF",
        boxShadow: deptFocused
          ? "0 0 0 4px rgba(21,101,192,0.10)"
          : "none",
      }}
    >

      <span
        className="material-icons-round pl-4 pr-2"
        style={{
          fontSize: 20,
          color: deptFocused
            ? "#1565C0"
            : "#90a4b8",
        }}
      >
        work
      </span>

      <select
        id="department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        onFocus={() => setDeptFocused(true)}
        onBlur={() => setDeptFocused(false)}
        className="flex-1 bg-transparent outline-none py-3.5 pr-3"
        style={{
          fontFamily: P,
          fontSize: 14,
          border: "none",
        }}
      >
        <option value="">Select Department</option>

        <option value="Special Education">
          Special Education
        </option>

        <option value="Primary">
          Primary
        </option>

        <option value="Secondary">
          Secondary
        </option>

        <option value="Support Staff">
          Support Staff
        </option>

      </select>

    </div>

  </div>

  <FormField
    id="password"
    label="Password"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={setPassword}
    placeholder="Enter password"
    icon="lock"
    rightEl={eyeButton(showPassword, () =>
      setShowPassword(!showPassword)
    )}
  />

  <FormField
    id="confirmPassword"
    label="Confirm Password"
    type={showConfirmPassword ? "text" : "password"}
    value={confirmPassword}
    onChange={setConfirmPassword}
    placeholder="Confirm password"
    icon="lock"
    rightEl={eyeButton(
      showConfirmPassword,
      () =>
        setShowConfirmPassword(
          !showConfirmPassword
        )
    )}
  />

  <label
    className="flex items-start gap-3 cursor-pointer mt-2"
  >

    <input
      type="checkbox"
      checked={agreed}
      onChange={(e) =>
        setAgreed(e.target.checked)
      }
    />

    <span
      style={{
        fontFamily: P,
        fontSize: 13,
        color: "#4A6580",
      }}
    >
      I agree to the Terms and Conditions
    </span>

  </label>
                {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || !agreed}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 mt-2"
                style={{
                  background:
                    loading || !agreed
                      ? "linear-gradient(135deg,#5c8fd6,#4aaa78)"
                      : "linear-gradient(135deg,#1565C0,#27AE60)",
                  border: "none",
                  color: "#fff",
                  fontFamily: P,
                  fontWeight: 600,
                  fontSize: 15,
                  cursor:
                    loading || !agreed
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    loading || !agreed ? 0.75 : 1,
                  boxShadow:
                    loading
                      ? "none"
                      : "0 6px 24px rgba(21,101,192,.25)",
                }}
              >
                {loading ? (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="animate-spin"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="rgba(255,255,255,.3)"
                        strokeWidth="3"
                      />

                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="#fff"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>

                    Creating Account...
                  </>
                ) : (
                  <>
                    <span
                      className="material-icons-round"
                      style={{ fontSize: 20 }}
                    >
                      person_add
                    </span>

                    Create Account
                  </>
                )}
              </motion.button>

            </form>

            {/* Login Link */}

            <p
              className="text-center mt-6"
              style={{
                fontFamily: P,
                fontSize: 13,
                color: "#4A6580",
              }}
            >
              Already have an account?{" "}

              <Link
                to="/login"
                style={{
                  color: "#1565C0",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign In →
              </Link>

            </p>

          </div>

          {/* Footer */}

          <p
            className="text-center mt-5"
            style={{
              fontFamily: P,
              fontSize: 12,
              color: "#607D8B",
            }}
          >
            © 2026 GIID Tambaram. All rights reserved.
          </p>

        </motion.div>

      </div>

    </div>
  );
}