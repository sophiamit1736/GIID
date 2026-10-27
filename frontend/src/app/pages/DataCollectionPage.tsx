import { useEffect, useState } from "react";
import { Sidebar, TopBar } from "./DashboardPage";
import { getCollectionSummary, getAllResults } from "../api/resultApi";

const P = "Poppins, sans-serif";
const PRIMARY = "#1565C0";
const GREEN = "#2E7D32";
const MUTED = "#607D8B";
const DARK = "#0D2137";

type Summary = {
  activeStudents: number;
  realObservations: number;
  uniqueStudentsWithData: number;
  averageAccuracy: number;
  demoObservations: number;
  latestRealObservationAt: string | null;
  bySource: { source: string; count: number }[];
  byDomain: { domain: string; count: number }[];
  byActivity: { activity: string; count: number }[];
  datasetFields: string[];
  note: string;
};

export default function DataCollectionPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setRowsLoading(true);
    setError("");
    getCollectionSummary()
      .then(r => setData(r.data))
      .catch(e => setError(e?.response?.data?.message || "Unable to load data-collection status."))
      .finally(() => setLoading(false));
    getAllResults()
      .then(r => setRows(Array.isArray(r.data) ? r.data : []))
      .catch(() => setRows([]))
      .finally(() => setRowsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const csvCell = (value: any) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const exportRows = rows.filter(r => !r.isDemoData);

  const downloadExcel = () => {
    const header = [
      "Date", "Student", "Student Code", "Activity", "Module ID", "Domain", "Level",
      "Game Type", "Score", "Accuracy", "Attempts", "Help Requests", "Time (sec)",
      "Completion %", "Efficiency %", "Performance Index", "FACP Score", "FACP Item Codes",
      "Data Source", "Session ID"
    ];
    const body = exportRows.map(r => [
      new Date(r.completedAt || r.createdAt).toLocaleString("en-IN"),
      r.student?.name || "", r.student?.studentCode || "", r.activityName || "", r.moduleId || "",
      r.domain || "", r.level || "", r.gameType || "module", r.score ?? 0, r.accuracy ?? 0,
      r.attempts ?? 0, r.helpRequests ?? 0, r.timeTaken ?? 0, r.completionRate ?? 0,
      r.efficiencyScore ?? 0, r.performanceIndex ?? 0, r.facpScore ?? 0,
      Array.isArray(r.facpItemCodes) ? r.facpItemCodes.join(" | ") : "",
      r.dataSource || "prototype", r.sessionId || ""
    ]);
    const csv = [header, ...body].map(row => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learnable-student-data-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSchema = () => {
    if (!data) return;
    const schemaRows = [["Field", "Purpose"], ...data.datasetFields.map(field => [field, "Student interaction / learning evidence"])];
    const csv = schemaRows.map(row => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "learnable-data-collection-schema.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid rgba(21,101,192,.09)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 3px 14px rgba(21,101,192,.05)",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F7FB", fontFamily: P }}>
      <Sidebar active="Data Collection" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <TopBar title="Data Collection" subtitle="Prototype deployment and real student learning evidence" />
        <main style={{ padding: "28px 32px 44px", maxWidth: 1250, margin: "0 auto" }}>
          <div style={{ ...card, background: "linear-gradient(135deg,#1565C0,#2E7D32)", color: "#fff", marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, opacity: .9 }}>CURRENT PHASE</div>
            <h1 style={{ margin: "7px 0 5px", fontSize: 25, fontWeight: 800 }}>Build → Deploy → Collect</h1>
            <p style={{ margin: 0, maxWidth: 820, fontSize: 13, lineHeight: 1.7, opacity: .94 }}>
              This semester the prototype is prepared for institute use. Every completed learning activity and game records
              measurable student interaction data. That real dataset becomes the foundation for next-semester ML, knowledge tracing
              and adaptive-learning validation.
            </p>
          </div>

          {error && <div style={{ ...card, color: "#C62828", marginBottom: 18 }}>{error}</div>}

          {loading ? (
            <div style={{ ...card, textAlign: "center", color: MUTED }}>Loading collection status...</div>
          ) : data ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14, marginBottom: 18 }}>
                {[
                  ["Active students", data.activeStudents, "students currently available"],
                  ["Real observations", data.realObservations, "usable interaction records"],
                  ["Students with data", data.uniqueStudentsWithData, "unique learners observed"],
                  ["Average accuracy", `${data.averageAccuracy}%`, "across real observations"],
                ].map(([label, value, sub]) => (
                  <div key={String(label)} style={card}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>{label}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: DARK, marginTop: 6 }}>{value}</div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <section style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 17, color: DARK }}>Data sources</h2>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Demo data is separated from future institute data.</div>
                    </div>
                    <button onClick={load} style={{ border: 0, background: "#E3F2FD", color: PRIMARY, borderRadius: 10, padding: "8px 11px", cursor: "pointer", fontWeight: 700 }}>Refresh</button>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    {data.bySource.length ? data.bySource.map(x => (
                      <div key={x.source} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #EEF3F7", fontSize: 13 }}>
                        <span style={{ textTransform: "capitalize" }}>{x.source}</span>
                        <b>{x.count}</b>
                      </div>
                    )) : <div style={{ color: MUTED, fontSize: 13 }}>No real observations yet. The prototype is ready to collect them.</div>}
                  </div>
                  <div style={{ marginTop: 16, padding: 12, background: "#E8F5E9", borderRadius: 12, color: GREEN, fontSize: 11, lineHeight: 1.6 }}>
                    <b>Next semester:</b> use the real observations for data cleaning, feature engineering, model training,
                    BKT/knowledge-tracing experiments and evaluation.
                  </div>
                </section>

                <section style={card}>
                  <h2 style={{ margin: 0, fontSize: 17, color: DARK }}>What we collect</h2>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>The learning evidence stored for each completed activity.</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 15 }}>
                    {data.datasetFields.map(field => (
                      <span key={field} style={{ padding: "6px 9px", borderRadius: 20, background: "#F1F6FB", color: "#35546B", fontSize: 10, fontWeight: 700 }}>
                        {field}
                      </span>
                    ))}
                  </div>
                  <button onClick={downloadSchema} style={{ marginTop: 18, border: `1px solid ${PRIMARY}`, background: "#fff", color: PRIMARY, borderRadius: 10, padding: "9px 13px", cursor: "pointer", fontWeight: 700 }}>
                    Export data-field schema
                  </button>
                </section>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 }}>
                <section style={card}>
                  <h2 style={{ margin: 0, fontSize: 17, color: DARK }}>Activity coverage</h2>
                  <div style={{ marginTop: 12 }}>
                    {data.byActivity.length ? data.byActivity.map(x => (
                      <div key={x.activity} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: "1px solid #EEF3F7", fontSize: 12 }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.activity}</span>
                        <b>{x.count}</b>
                      </div>
                    )) : <div style={{ color: MUTED, fontSize: 12 }}>No observations yet.</div>}
                  </div>
                </section>

                <section style={card}>
                  <h2 style={{ margin: 0, fontSize: 17, color: DARK }}>FACP / adaptive-data boundary</h2>
                  <div style={{ marginTop: 12, fontSize: 12, color: "#455A64", lineHeight: 1.8 }}>
                    <div><b>FACP:</b> functional assessment baseline and checklist evidence.</div>
                    <div><b>Learning modules:</b> activity-level learning evidence.</div>
                    <div><b>Games:</b> additional practice/engagement evidence.</div>
                    <div><b>ALPI:</b> summarizes recent activity performance.</div>
                    <div><b>Next phase:</b> use longitudinal observations to validate and improve the adaptive models.</div>
                  </div>
                  <div style={{ marginTop: 14, fontSize: 11, color: MUTED }}>
                    Demo records currently separated: <b>{data.demoObservations}</b>
                  </div>
                </section>
              </div>

              <section style={{ ...card, marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 17, color: DARK }}>Collected student data</h2>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>MongoDB is the source of truth. This table shows real observations; demo records are hidden.</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={load} style={{ border: "1px solid #D7E3EE", background: "#fff", color: DARK, borderRadius: 10, padding: "9px 13px", cursor: "pointer", fontWeight: 700 }}>↻ Refresh data</button>
                    <button onClick={downloadExcel} disabled={!exportRows.length} style={{ border: 0, background: exportRows.length ? PRIMARY : "#B0BEC5", color: "#fff", borderRadius: 10, padding: "9px 13px", cursor: exportRows.length ? "pointer" : "not-allowed", fontWeight: 700 }}>⬇ Export to Excel (CSV)</button>
                  </div>
                </div>
                <div style={{ marginTop: 14, overflowX: "auto", border: "1px solid #E7EEF4", borderRadius: 12 }}>
                  {rowsLoading ? <div style={{ padding: 24, color: MUTED, fontSize: 12 }}>Loading observations...</div> : exportRows.length ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 1050 }}>
                      <thead><tr style={{ background: "#F5F9FC", color: DARK }}>{["Date","Student","Activity","Domain","Type","Score","Accuracy","Attempts","Time","Performance","FACP","Source"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 9px", borderBottom: "1px solid #E1EAF1", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                      <tbody>{exportRows.slice(0, 100).map((r:any, i:number) => <tr key={r._id || i}>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7", whiteSpace: "nowrap" }}>{new Date(r.completedAt || r.createdAt).toLocaleString("en-IN", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7", fontWeight: 700 }}>{r.student?.name || "—"}</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7", maxWidth: 210 }}>{r.activityName || "—"}</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7" }}>{r.domain || "General"}</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7" }}>{r.gameType || "module"}</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7" }}>{r.score ?? 0}</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7" }}>{r.accuracy ?? 0}%</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7" }}>{r.attempts ?? 0}</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7" }}>{r.timeTaken ?? 0}s</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7", fontWeight: 700 }}>{r.performanceIndex ?? 0}%</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7" }}>{r.facpScore ?? 0}%</td>
                        <td style={{ padding: "9px", borderBottom: "1px solid #EEF3F7" }}>{r.dataSource || "prototype"}</td>
                      </tr>)}</tbody>
                    </table>
                  ) : <div style={{ padding: 24, color: MUTED, fontSize: 12 }}>No real student observations yet. Complete an activity/game as a learner and the record will appear here automatically.</div>}
                </div>
                {exportRows.length > 100 && <div style={{ marginTop: 8, fontSize: 10, color: MUTED }}>Showing the latest 100 rows; the Excel export contains all real observations.</div>}
              </section>

              <div style={{ marginTop: 18, fontSize: 11, color: MUTED }}>
                Latest real observation: {data.latestRealObservationAt ? new Date(data.latestRealObservationAt).toLocaleString("en-IN") : "None yet"}.
                {" "}{data.note}
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
