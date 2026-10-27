import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Sidebar, TopBar } from "./DashboardPage";
import studentAPI from "../api/studentApi";
import { getResults, getAllResults, getReport } from "../api/resultApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const P = "Poppins, sans-serif";
const PRIMARY = "#1565C0";
const ACCENT = "#27ae60";
const MUTED = "#4A6580";
const DARK = "#0D2137";

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportType = "weekly" | "monthly" | "custom";
type Format = "pdf" | "excel";

// ─── Preview bar data ─────────────────────────────────────────────────────────


// ─── Report Type Card ─────────────────────────────────────────────────────────
function ReportTypeCard({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        fontFamily: P,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        borderRadius: 14,
        border: selected ? `2px solid ${PRIMARY}` : "1.5px solid rgba(21,101,192,0.12)",
        background: selected ? "rgba(21,101,192,0.05)" : "#fff",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: selected ? `${PRIMARY}1a` : "#f4f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span className="material-icons-round" style={{ color: selected ? PRIMARY : MUTED, fontSize: 22 }}>
          {icon}
        </span>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: selected ? PRIMARY : DARK }}>{label}</div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{description}</div>
      </div>
      {selected && (
        <span className="material-icons-round" style={{ color: PRIMARY, fontSize: 18, marginLeft: "auto" }}>
          check_circle
        </span>
      )}
    </motion.div>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label
      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: DARK, fontFamily: P }}
    >
      <div
        onClick={onChange}
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: checked ? "none" : "1.5px solid rgba(21,101,192,0.3)",
          background: checked ? PRIMARY : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {checked && (
          <span className="material-icons-round" style={{ color: "#fff", fontSize: 13 }}>
            check
          </span>
        )}
      </div>
      {label}
    </label>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const completed = status === "Completed";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: completed ? ACCENT : "#f57c00",
        background: completed ? "rgba(39,174,96,0.12)" : "rgba(245,124,0,0.12)",
        borderRadius: 20,
        padding: "2px 8px",
        fontFamily: P,
      }}
    >
      {status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>("monthly");
  const [student, setStudent] = useState("All Students");
  const [format, setFormat] = useState<Format>("pdf");
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  const today = now.toISOString().slice(0,10);
  const [dateFrom, setDateFrom] = useState(monthStart);
  const [dateTo, setDateTo] = useState(today);
  const [checks, setChecks] = useState({
    performanceCharts: true,
    activityLog: true,
    teacherNotes: false,
    alpiSummary: true,
  });
  const [students, setStudents] = useState<any[]>([]);
  const [reportResults, setReportResults] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    studentAPI.get("/").then(r => setStudents(r.data || [])).catch(() => {}).finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    const st = student === "All Students" ? null : students.find(s => s.name === student);
    getReport({studentId: st?._id || "all", from: dateFrom, to: dateTo})
      .then(r => setReportResults(r.data?.results || []))
      .catch(() => setReportResults([]));
  }, [student, students, dateFrom, dateTo]);

  const selectedStudent = students.find(s => s.name === student);
  const reportAccuracy = reportResults.length ? Math.round(reportResults.reduce((a,r)=>a+Number(r.accuracy||0),0)/reportResults.length) : 0;
  const reportALPI = selectedStudent ? Number(selectedStudent.alpiScore||0) : reportAccuracy;
  const previewBarData = reportResults.slice().reverse().slice(-8).map((r,i)=>({week:`W${i+1}`,ALPI:Number(r.accuracy||0)}));
  const activityLog = reportResults.slice(0,8).map(r=>({date:new Date(r.completedAt||r.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}),activity:r.activityName,score:`${Number(r.accuracy||0)}%`,duration:`${Math.round(Number(r.timeTaken||0)/60)} min`,status:"Completed"}));
  const STUDENTS_LIST = ["All Students", ...students.map(s=>s.name)];

  const toggleCheck = (k: keyof typeof checks) =>
    setChecks(prev => ({ ...prev, [k]: !prev[k] }));

  const fetchReport=async()=>{const st=selectedStudent?._id; const r=await getReport({studentId:st||"all",from:dateFrom,to:dateTo}); return r.data;};
  const downloadCSV=async()=>{try{const d=await fetchReport();const rows=[["Date","Student","Code","Activity","Domain","Level","Score","Accuracy","Time (sec)","ALPI/FACP Snapshot"]];(d.results||[]).forEach((r:any)=>rows.push([new Date(r.completedAt||r.createdAt).toLocaleString("en-IN"),r.student?.name||"",r.student?.studentCode||"",r.activityName||"",r.domain||"",r.level||"",String(r.score??0),String(r.accuracy??0),String(r.timeTaken??0),String(r.facpScore??0)]));const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`learnable-report-${dateFrom}-${dateTo}.csv`;a.click();URL.revokeObjectURL(url);}catch(e:any){alert(e.response?.data?.message||"Unable to download report")}};
  const printReport=async()=>{try{const d=await fetchReport();const rows=(d.results||[]).map((r:any)=>`<tr><td>${new Date(r.completedAt||r.createdAt).toLocaleDateString("en-IN")}</td><td>${r.student?.name||""}</td><td>${r.activityName||""}</td><td>${r.domain||""}</td><td>${r.level||""}</td><td>${r.accuracy||0}%</td><td>${Math.round((r.timeTaken||0)/60)} min</td></tr>`).join("");const w=window.open("","_blank");if(!w)return;w.document.write(`<html><head><title>LearnAble Report</title><style>body{font-family:Arial;padding:30px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}h1{color:#1565C0}</style></head><body><h1>LearnAble Learning Report</h1><p>Period: ${dateFrom} to ${dateTo}</p><table><thead><tr><th>Date</th><th>Student</th><th>Activity</th><th>Domain</th><th>Level</th><th>Accuracy</th><th>Time</th></tr></thead><tbody>${rows||'<tr><td colspan="7">No results</td></tr>'}</tbody></table></body></html>`);w.document.close();w.focus();w.print();}catch(e:any){alert(e.response?.data?.message||"Unable to generate report")}};


  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: "1.5px solid rgba(21,101,192,0.15)",
    fontSize: 13,
    fontFamily: P,
    color: DARK,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: MUTED,
    marginBottom: 6,
    display: "block",
    fontFamily: P,
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: MUTED,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginBottom: 10,
    fontFamily: P,
  };

  const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: 20,
    padding: "22px 20px",
    border: "1px solid rgba(21,101,192,0.08)",
    boxShadow: "0 2px 8px rgba(21,101,192,0.06)",
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: P, background: "#f4f7fb" }}>
      <Sidebar active="Reports" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title="Reports" subtitle="Generate, preview and export student reports" />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px 40px",
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {/* ── Left Panel ── */}
          <div style={{ width: 400, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Report Type */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              style={card}
            >
              <div style={sectionLabel}>Report Type</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <ReportTypeCard
                  icon="calendar_view_week"
                  label="Weekly Report"
                  description="Summary of this week's sessions"
                  selected={selectedType === "weekly"}
                  onClick={() => setSelectedType("weekly")}
                />
                <ReportTypeCard
                  icon="calendar_month"
                  label="Monthly Report"
                  description="Detailed monthly performance report"
                  selected={selectedType === "monthly"}
                  onClick={() => setSelectedType("monthly")}
                />
                <ReportTypeCard
                  icon="tune"
                  label="Custom Report"
                  description="Define your own date range and filters"
                  selected={selectedType === "custom"}
                  onClick={() => setSelectedType("custom")}
                />
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.07 }}
              style={card}
            >
              <div style={sectionLabel}>Filters</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Student select */}
                <div>
                  <label style={labelStyle}>Student</label>
                  <select
                    value={student}
                    onChange={e => setStudent(e.target.value)}
                    style={inputStyle}
                  >
                    {STUDENTS_LIST.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Date range — only for custom */}
                {selectedType === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ display: "flex", gap: 10 }}
                  >
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>From</label>
                      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>To</label>
                      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
                    </div>
                  </motion.div>
                )}

                {/* Format toggle */}
                <div>
                  <label style={labelStyle}>Format</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["pdf", "excel"] as Format[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        style={{
                          flex: 1,
                          padding: "8px 0",
                          borderRadius: 30,
                          border: format === f ? `2px solid ${PRIMARY}` : "1.5px solid rgba(21,101,192,0.15)",
                          background: format === f ? `${PRIMARY}0f` : "#fff",
                          color: format === f ? PRIMARY : MUTED,
                          fontFamily: P,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          textTransform: "uppercase" as const,
                          letterSpacing: 0.5,
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Include sections */}
                <div>
                  <label style={labelStyle}>Include Sections</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Checkbox checked={checks.performanceCharts} onChange={() => toggleCheck("performanceCharts")} label="Performance Charts" />
                    <Checkbox checked={checks.activityLog} onChange={() => toggleCheck("activityLog")} label="Activity Log" />
                    <Checkbox checked={checks.teacherNotes} onChange={() => toggleCheck("teacherNotes")} label="Teacher Notes" />
                    <Checkbox checked={checks.alpiSummary} onChange={() => toggleCheck("alpiSummary")} label="ALPI Summary" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.14 }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {/* Generate Preview */}
              <button
                onClick={printReport}
                style={{
                  padding: "14px 0",
                  borderRadius: 14,
                  border: "none",
                  background: `linear-gradient(135deg, ${PRIMARY}, ${ACCENT})`,
                  color: "#fff",
                  fontFamily: P,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(21,101,192,0.22)",
                }}
              >
                <span className="material-icons-round" style={{ fontSize: 18 }}>visibility</span>
                Generate Preview
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                {/* Download PDF */}
                <button onClick={printReport}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    border: `1.5px solid ${PRIMARY}`,
                    background: "#fff",
                    color: PRIMARY,
                    fontFamily: P,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: 16 }}>picture_as_pdf</span>
                  PDF
                </button>

                {/* Download Excel */}
                <button onClick={downloadCSV}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    border: `1.5px solid ${ACCENT}`,
                    background: "#fff",
                    color: ACCENT,
                    fontFamily: P,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: 16 }}>table_chart</span>
                  CSV
                </button>

                {/* Print */}
                <button
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 12,
                    border: "1.5px solid rgba(74,101,128,0.3)",
                    background: "#fff",
                    color: MUTED,
                    fontFamily: P,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span className="material-icons-round" style={{ fontSize: 16 }}>print</span>
                  Print
                </button>
              </div>
            </motion.div>
          </div>

          {/* ── Right Panel — Report Preview ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ flex: 1, minWidth: 0 }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid rgba(21,101,192,0.1)",
                boxShadow: "0 4px 32px rgba(21,101,192,0.09)",
                overflow: "hidden",
              }}
            >
              {/* Preview label strip */}
              <div
                style={{
                  background: "#f4f7fb",
                  borderBottom: "1px solid rgba(21,101,192,0.08)",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: MUTED,
                  fontFamily: P,
                }}
              >
                <span className="material-icons-round" style={{ fontSize: 15 }}>description</span>
                Report Preview
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    background: "rgba(39,174,96,0.12)",
                    color: ACCENT,
                    padding: "2px 10px",
                    borderRadius: 20,
                    fontWeight: 700,
                  }}
                >
                  LIVE PREVIEW
                </span>
              </div>

              {/* Printed document simulation */}
              <div style={{ padding: "32px 40px 40px", fontFamily: P }}>

                {/* Document header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                    paddingBottom: 18,
                    borderBottom: `2px solid ${PRIMARY}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: `linear-gradient(135deg, ${PRIMARY}, #7c3aed)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span className="material-icons-round" style={{ color: "#fff", fontSize: 22 }}>school</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: DARK }}>GIID Tambaram</div>
                      <div style={{ fontSize: 11, color: MUTED }}>Intelligent Adaptive Learning Platform</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: PRIMARY }}>Student Performance Report</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                      {selectedType === "custom"
                        ? `${dateFrom} – ${dateTo}`
                        : selectedType === "weekly"
                        ? "Current week"
                        : "Current month"}
                    </div>
                  </div>
                </div>

                {/* Student info */}
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: 22,
                    padding: "14px 18px",
                    background: "#f8fafd",
                    borderRadius: 12,
                    border: "1px solid rgba(21,101,192,0.08)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>Student</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginTop: 2 }}>
                      {student === "All Students" ? "All Students" : student}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>Level</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginTop: 2 }}>{selectedStudent?.learningLevel || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>Class</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginTop: 2 }}>{selectedStudent?.studentCode || "All learners"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>Report Format</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", marginTop: 2 }}>
                      {format}
                    </div>
                  </div>
                </div>

                {/* KPI row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 22 }}>
                  {[
                    { label: "ALPI Score", value: String(reportALPI), icon: "insights", color: "#7c3aed" },
                    { label: "Activities", value: String(reportResults.length), icon: "layers", color: PRIMARY },
                    { label: "Average Accuracy", value: `${reportAccuracy}%`, icon: "timer", color: ACCENT },
                  ].map(m => (
                    <div
                      key={m.label}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        border: `1.5px solid ${m.color}20`,
                        background: `${m.color}08`,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span className="material-icons-round" style={{ color: m.color, fontSize: 22 }}>
                        {m.icon}
                      </span>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>{m.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                {checks.performanceCharts && (
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>
                      Weekly ALPI Scores
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={previewBarData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,101,192,0.08)" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: MUTED, fontFamily: P }} />
                        <YAxis domain={[55, 90]} tick={{ fontSize: 10, fill: MUTED, fontFamily: P }} />
                        <Tooltip contentStyle={{ fontFamily: P, fontSize: 12, borderRadius: 8 }} />
                        <Bar dataKey="ALPI" fill={PRIMARY} radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Activity log table */}
                {checks.activityLog && (
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>
                      Activity Log
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "#f4f7fb" }}>
                          {["Date", "Activity", "Score", "Duration", "Status"].map(h => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: MUTED, fontWeight: 600, fontSize: 11 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activityLog.map((row, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(21,101,192,0.06)" }}>
                            <td style={{ padding: "8px 12px", color: MUTED }}>{row.date}</td>
                            <td style={{ padding: "8px 12px", fontWeight: 600, color: DARK }}>{row.activity}</td>
                            <td style={{ padding: "8px 12px", fontWeight: 700, color: PRIMARY }}>{row.score}</td>
                            <td style={{ padding: "8px 12px", color: MUTED }}>{row.duration}</td>
                            <td style={{ padding: "8px 12px" }}><StatusBadge status={row.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer */}
                <div
                  style={{
                    borderTop: "1px solid rgba(21,101,192,0.1)",
                    paddingTop: 14,
                    textAlign: "center",
                    fontSize: 10,
                    color: MUTED,
                    letterSpacing: 0.3,
                  }}
                >
                  Generated by GIID Intelligent Adaptive Learning Platform &nbsp;|&nbsp; Confidential &nbsp;|&nbsp; {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
