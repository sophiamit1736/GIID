import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate, useParams } from "react-router";
import { Sidebar, TopBar } from "./DashboardPage";

const P = "Poppins, sans-serif";

/* ─── Star Rating Row ─── */
function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center justify-between py-3">
      <span style={{ fontFamily: P, fontWeight: 500, fontSize: 14, color: "#0D2137", minWidth: 180 }}>
        {label}
      </span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
              fontSize: 32,
              color: star <= (hovered || value) ? "#FFA726" : "rgba(0,0,0,0.15)",
              transition: "color 0.15s, transform 0.1s",
              transform: star <= (hovered || value) ? "scale(1.12)" : "scale(1)",
              lineHeight: 1,
            }}
            aria-label={`Rate ${star}`}
          >
            ★
          </button>
        ))}
      </div>
      <span style={{ fontFamily: P, fontWeight: 600, fontSize: 13, color: "#1565C0", minWidth: 24, textAlign: "right" }}>
        {value > 0 ? `${value}/5` : "—"}
      </span>
    </div>
  );
}

/* ─── Styled Select ─── */
function ObsSelect({
  label,
  icon,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex items-center gap-4 py-4 px-5 rounded-xl"
      style={{
        background: "#F8FAFF",
        border: `2px solid ${focused ? "#1565C0" : "rgba(21,101,192,0.18)"}`,
        boxShadow: focused ? "0 0 0 4px rgba(21,101,192,0.08)" : "none",
        transition: "all 0.2s",
      }}
    >
      <span
        className="material-icons-round"
        style={{ fontSize: 22, color: focused ? "#1565C0" : "#4A6580", flexShrink: 0 }}
      >
        {icon}
      </span>
      <label
        style={{ fontFamily: P, fontWeight: 500, fontSize: 14, color: "#0D2137", minWidth: 200, flexShrink: 0 }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: P,
          fontSize: 14,
          fontWeight: 500,
          color: value ? "#0D2137" : "#90a4b8",
          background: "transparent",
          border: "none",
          outline: "none",
          flex: 1,
          cursor: "pointer",
        }}
      >
        <option value="" disabled>Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <span className="material-icons-round" style={{ fontSize: 18, color: "#90a4b8", flexShrink: 0 }}>
        expand_more
      </span>
    </div>
  );
}

/* ─── Mock student data ─── */
const MOCK_STUDENT = {
  id: "1",
  name: "Aarav Kumar",
  age: 10,
  level: "Moderate",
  initials: "AK",
  session: "28 Jul 2025, 10:30 AM",
};

export default function TeacherObservationPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const student = MOCK_STUDENT; // use mock regardless of studentId

  // Dropdown states
  const [overallObs, setOverallObs] = useState("");
  const [engagement, setEngagement] = useState("");
  const [assistance, setAssistance] = useState("");
  const [completion, setCompletion] = useState("");

  // Star ratings
  const [commRating, setCommRating] = useState(0);
  const [attnRating, setAttnRating] = useState(0);
  const [socialRating, setSocialRating] = useState(0);

  // Comments
  const [notes, setNotes] = useState("");
  const [notesFocused, setNotesFocused] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setShowToast(true);
    await new Promise((r) => setTimeout(r, 1500));
    navigate(`/students/${student.id}`);
  }

  const levelColor =
    student.level === "Mild"
      ? "#27ae60"
      : student.level === "Moderate"
      ? "#FFA726"
      : "#EF5350";

  return (
    <div className="flex" style={{ minHeight: "100vh", background: "#F0F6FF", fontFamily: P }}>
      <Sidebar active="Students" />

      <div className="flex-1 flex flex-col">
        <TopBar title="Session Observation" subtitle="Record student session details and progress" />

        {/* Success toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 py-4"
              style={{
                background: "linear-gradient(135deg,#27ae60,#2ECC71)",
                boxShadow: "0 4px 24px rgba(39,174,96,0.35)",
              }}
            >
              <span className="material-icons-round text-white mr-3" style={{ fontSize: 22 }}>check_circle</span>
              <span style={{ fontFamily: P, fontWeight: 600, fontSize: 15, color: "#fff" }}>
                Observation saved successfully! Redirecting…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Centered content */}
        <div className="flex-1 flex justify-center px-6 py-8">
          <div className="w-full" style={{ maxWidth: 720 }}>

            {/* Student info strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl p-5 mb-5 flex items-center gap-4 flex-wrap"
              style={{
                background: "#fff",
                boxShadow: "0 2px 16px rgba(21,101,192,0.09)",
                border: "1.5px solid rgba(21,101,192,0.10)",
              }}
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 52,
                  height: 52,
                  background: "linear-gradient(135deg,#1565C0,#27ae60)",
                }}
              >
                <span style={{ fontFamily: P, fontWeight: 700, fontSize: 18, color: "#fff" }}>
                  {student.initials}
                </span>
              </div>

              {/* Name & meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontFamily: P, fontWeight: 700, fontSize: 17, color: "#0D2137" }}>
                    {student.name}
                  </span>
                  <span style={{ fontFamily: P, fontWeight: 400, fontSize: 13, color: "#4A6580" }}>
                    Age {student.age}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full"
                    style={{
                      background: `${levelColor}18`,
                      color: levelColor,
                      fontFamily: P,
                      fontWeight: 600,
                      fontSize: 12,
                      border: `1.5px solid ${levelColor}40`,
                    }}
                  >
                    {student.level}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-icons-round" style={{ fontSize: 14, color: "#4A6580" }}>schedule</span>
                  <span style={{ fontFamily: P, fontWeight: 400, fontSize: 13, color: "#4A6580" }}>
                    Session: {student.session}
                  </span>
                </div>
              </div>

              {/* Back link */}
              <Link
                to={`/students/${studentId ?? student.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-150"
                style={{
                  fontFamily: P,
                  fontWeight: 500,
                  fontSize: 13,
                  color: "#1565C0",
                  textDecoration: "none",
                  background: "#E3F2FD",
                  border: "1.5px solid rgba(21,101,192,0.18)",
                  flexShrink: 0,
                }}
              >
                <span className="material-icons-round" style={{ fontSize: 16 }}>arrow_back</span>
                Back to Student
              </Link>
            </motion.div>

            {/* Observation form card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="rounded-2xl p-8 bg-white"
              style={{ boxShadow: "0 4px 32px rgba(21,101,192,0.10)", border: "1.5px solid rgba(21,101,192,0.08)" }}
            >
              {/* Card title */}
              <div className="flex items-center gap-3 mb-7">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, background: "linear-gradient(135deg,#1565C0,#27ae60)", flexShrink: 0 }}
                >
                  <span className="material-icons-round text-white" style={{ fontSize: 22 }}>assignment</span>
                </div>
                <div>
                  <h2 style={{ fontFamily: P, fontWeight: 700, fontSize: 20, color: "#0D2137", lineHeight: 1.2 }}>
                    Session Observation
                  </h2>
                  <p style={{ fontFamily: P, fontWeight: 400, fontSize: 13, color: "#4A6580" }}>
                    Record observations for this learning session
                  </p>
                </div>
              </div>

              {/* ── 4 Dropdown sections ── */}
              <div className="flex flex-col gap-3 mb-8">
                <ObsSelect
                  label="Overall Observation"
                  icon="star"
                  value={overallObs}
                  onChange={setOverallObs}
                  options={["Excellent", "Good", "Average", "Needs Improvement"]}
                />
                <ObsSelect
                  label="Student Engagement"
                  icon="psychology"
                  value={engagement}
                  onChange={setEngagement}
                  options={["High", "Medium", "Low"]}
                />
                <ObsSelect
                  label="Assistance Required"
                  icon="support_agent"
                  value={assistance}
                  onChange={setAssistance}
                  options={["Independent", "Minimal Prompting", "Moderate Support", "Full Assistance"]}
                />
                <ObsSelect
                  label="Activity Completion"
                  icon="task_alt"
                  value={completion}
                  onChange={setCompletion}
                  options={["Completed All", "Completed Most", "Partial", "Did Not Complete"]}
                />
              </div>

              {/* ── Rating scales ── */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons-round" style={{ fontSize: 20, color: "#1565C0" }}>grade</span>
                  <span style={{ fontFamily: P, fontWeight: 600, fontSize: 15, color: "#0D2137" }}>
                    Skill Ratings
                  </span>
                </div>
                <div
                  className="rounded-xl px-5"
                  style={{ background: "#F8FAFF", border: "1.5px solid rgba(21,101,192,0.12)" }}
                >
                  <StarRating label="Communication Skills" value={commRating} onChange={setCommRating} />
                  <div style={{ height: 1, background: "rgba(21,101,192,0.08)" }} />
                  <StarRating label="Attention & Focus" value={attnRating} onChange={setAttnRating} />
                  <div style={{ height: 1, background: "rgba(21,101,192,0.08)" }} />
                  <StarRating label="Social Participation" value={socialRating} onChange={setSocialRating} />
                </div>
              </div>

              {/* ── Comments textarea ── */}
              <div className="mb-8">
                <label
                  htmlFor="teacherNotes"
                  style={{ fontFamily: P, fontWeight: 500, fontSize: 14, color: "#0D2137", display: "block", marginBottom: 8 }}
                >
                  Teacher Notes & Observations
                </label>
                <textarea
                  id="teacherNotes"
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onFocus={() => setNotesFocused(true)}
                  onBlur={() => setNotesFocused(false)}
                  placeholder="Describe the student's behavior, achievements, and areas for improvement during this session..."
                  style={{
                    width: "100%",
                    fontFamily: P,
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#0D2137",
                    background: "#F8FAFF",
                    border: `2px solid ${notesFocused ? "#1565C0" : "rgba(21,101,192,0.18)"}`,
                    borderRadius: 16,
                    padding: "14px 16px",
                    outline: "none",
                    resize: "vertical",
                    boxShadow: notesFocused ? "0 0 0 4px rgba(21,101,192,0.08)" : "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* ── Action buttons ── */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-150"
                  style={{
                    fontFamily: P,
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#1565C0",
                    background: "#fff",
                    border: "2px solid rgba(21,101,192,0.28)",
                    cursor: "pointer",
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: 18 }}>close</span>
                  Cancel
                </button>

                <motion.button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  whileTap={{ scale: saving ? 1 : 0.97 }}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl transition-all duration-150"
                  style={{
                    fontFamily: P,
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#fff",
                    background: saving
                      ? "linear-gradient(135deg,#5c8fd6,#4aaa78)"
                      : "linear-gradient(135deg,#1565C0 0%,#0d9e6e 100%)",
                    border: "none",
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: saving ? "none" : "0 4px 18px rgba(21,101,192,0.30)",
                  }}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <span className="material-icons-round" style={{ fontSize: 18 }}>save</span>
                      Save Observation
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
