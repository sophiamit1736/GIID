import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { Sidebar, TopBar } from "./DashboardPage";
import { getStudents } from "../api/studentApi";
import { getFACPTemplate, getFACPStudentSummary, saveFACPAssessment, finalizeFACPBaseline } from "../api/facpApi";

const P = "Poppins, sans-serif";
const CODE_OPTIONS = ["+", "C", "GP", "VP", "M", "PP", "-", "NE", "NA"];
const RECREATION_GRADES = ["A", "B", "C", "D", "E", "NE"];
const PERIODS = ["Entry", "I Term", "II Term", "III Term"];

function mapGIIDGroupToFACPLevel(group: any, age?: any): string {
  const raw = String(group || "").trim().toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, " ");
  if (!raw) return "";
  if (/care\s*-?\s*group|caregroup/.test(raw)) return "Care Group";
  if (/^vocational\b/.test(raw)) return "Vocational";
  if (/pre\s*-?\s*vocational\s*[- ]?(?:ii|2)\b/.test(raw) || /^prevocational\s*[- ]?(?:ii|2)\b/.test(raw)) return "Prevocational-II";
  if (/pre\s*-?\s*vocational\s*[- ]?(?:i|1)\b/.test(raw) || /^prevocational\s*[- ]?(?:i|1)\b/.test(raw)) return "Prevocational-I";
  if (/^secondary\b|secondary/.test(raw)) return "Secondary";
  if (/^primary\s*[- ]?(?:ii|2)\b/.test(raw)) return "Primary-II";
  if (/^primary\s*[- ]?(?:i|1)\b/.test(raw)) return "Primary-I";
  if (/^primary\b/.test(raw)) return Number(age) >= 11 ? "Primary-II" : "Primary-I";
  if (/pre\s*-?\s*primary|preprimary/.test(raw)) return "Preprimary";
  return "";
}

const statusMeta: Record<string, { label: string; bg: string; color: string }> = {
  "+": { label: "Yes — Independent", bg: "#E8F5E9", color: "#2E7D32" },
  C: { label: "Occasional Cueing — pass/strengthen", bg: "#E3F2FD", color: "#1565C0" },
  GP: { label: "Gestural Prompting", bg: "#F3E5F5", color: "#7B1FA2" },
  VP: { label: "Verbal Prompting", bg: "#FFF8E1", color: "#F57F17" },
  M: { label: "Modelling", bg: "#E0F2F1", color: "#00695C" },
  PP: { label: "Physical Prompting", bg: "#FBE9E7", color: "#E64A19" },
  NE: { label: "No Exposure", bg: "#ECEFF1", color: "#546E7A" },
  NA: { label: "Not Applicable", bg: "#F5F5F5", color: "#757575" },
  "-": { label: "No — task not performed", bg: "#F5F5F5", color: "#757575" },
};

export default function FACPAssessmentPage() {
  const { studentId = "" } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [students, setStudents] = useState<any[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [functionalLevel, setFunctionalLevel] = useState("");
  const [domain, setDomain] = useState("Personal");
  const [assessmentPeriod, setAssessmentPeriod] = useState("Entry");
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [customText, setCustomText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadSummary(id: string) {
    if (!id) return;
    try {
      const r = await getFACPStudentSummary(id);
      setSummary(r.data);
      if (r.data?.functionalLevel) {
        setFunctionalLevel(r.data.functionalLevel);
        setStudent((current: any) => current ? { ...current, facpFunctionalLevel: r.data.functionalLevel } : current);
      }
    } catch {
      setSummary(null);
    }
  }

  useEffect(() => {
    Promise.all([getStudents(), getFACPTemplate()])
      .then(([sr, tr]) => {
        const list = Array.isArray(sr.data) ? sr.data : [];
        setStudents(list);
        setTemplate(tr.data);
        const chosen = list.find((x: any) => x._id === studentId) || list[0];
        if (chosen) {
          setStudent(chosen);
          setFunctionalLevel(chosen.facpFunctionalLevel || mapGIIDGroupToFACPLevel(chosen.group, chosen.age) || "");
        }
      })
      .catch((e: any) => setMessage(e?.response?.data?.message || "Unable to load FACP."))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (student?._id) loadSummary(student._id);
  }, [student?._id]);

  const officialItems = useMemo(() => {
    if (!template?.catalogue || !functionalLevel) return [];
    return template.catalogue.filter((x: any) => x.level === functionalLevel && x.domain === domain);
  }, [template, functionalLevel, domain]);

  const items = [...officialItems, ...customItems];

  useEffect(() => {
    if (!summary?.latestItems || !functionalLevel) return;
    const latest = new Map(
      summary.latestItems
        .filter((x: any) => x.functionalLevel === functionalLevel && x.domain === domain)
        .map((x: any) => [x.code, domain === "Recreational" ? x.recreationGrade : x.status])
    );
    const next: Record<string, string> = {};
    items.forEach((item: any) => {
      if (latest.has(item.id)) next[item.id] = String(latest.get(item.id));
      else if (latest.has(item.code)) next[item.id] = String(latest.get(item.code));
    });
    setValues(next);
  // Deliberately reload when level/domain changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary?.latestItems, functionalLevel, domain]);

  const recorded = items.filter(item => Boolean(values[item.id]));
  const applicable = domain === "Recreational" ? [] : recorded.filter(item => values[item.id] !== "NA");
  const achieved = applicable.filter(item => values[item.id] === "+" || values[item.id] === "C").length;
  const liveScore = applicable.length ? Math.round((achieved / applicable.length) * 100) : 0;

  function changeLevel(next: string) {
    setFunctionalLevel(next);
    const firstAvailable = (template?.domains || []).find((d: any) => template?.domainAvailability?.[next]?.[d.id]);
    setDomain(firstAvailable?.id || 'Personal');
    setValues({});
    setCustomItems([]);
    setMessage("");
  }

  function addCustomItem() {
    const text = customText.trim();
    if (!text) return;
    const id = `CUSTOM-${Date.now()}`;
    setCustomItems(prev => [...prev, { id, code: id, text, custom: true, sourceType: "custom" }]);
    setCustomText("");
  }

  function removeCustomItem(id: string) {
    setCustomItems(prev => prev.filter(x => x.id !== id));
    setValues(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function save() {
    if (!student?._id || !functionalLevel || !domain) {
      setMessage("Select the learner, FACP functional level and domain.");
      return;
    }
    if (!recorded.length) {
      setMessage("Record at least one item before saving.");
      return;
    }
    const unrecordedCustom = customItems.filter(item => !values[item.id]);
    if (unrecordedCustom.length) {
      setMessage("Record a performance code/grade for every child-specific item before saving; added items are included in FACP scoring.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const result = await saveFACPAssessment({
        student: student._id,
        functionalLevel,
        domain,
        assessmentPeriod,
        notes,
        items: recorded.map(item => ({
          code: item.code || item.id,
          custom: Boolean(item.custom),
          activity: item.text,
          ...(domain === "Recreational"
            ? { recreationGrade: values[item.id] }
            : { status: values[item.id] }),
        })),
      });
      await loadSummary(student._id);
      const p = result.data.summary.progression;
      setMessage(
        domain === "Recreational"
          ? `FACP recreational observations saved for ${assessmentPeriod}.`
          : `FACP ${assessmentPeriod} saved. Current ${functionalLevel} score: ${result.data.summary.score}%. ${p?.action || ""}`
      );
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Unable to save FACP assessment.");
    } finally {
      setSaving(false);
    }
  }

  async function finalizeBaseline() {
    if (!student?._id) return;
    const ok = window.confirm("Finalize this learner's completed Entry FACP as the immutable admission baseline?");
    if (!ok) return;
    try {
      setSaving(true);
      const r = await finalizeFACPBaseline(student._id);
      setStudent(r.data.student);
      await loadSummary(student._id);
      setMessage(`Entry FACP baseline finalized: ${r.data.baseline.score}% (${r.data.baseline.functionalLevel}).`);
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Unable to finalize the baseline.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 30, fontFamily: P }}>Loading FACP…</div>;

  const levelItems = template?.catalogue?.filter((x: any) => x.level === functionalLevel && x.domain !== "Recreational") || [];
  const levelRecordedCodes = new Set((summary?.latestItems || [])
    .filter((x: any) => x.functionalLevel === functionalLevel && x.domain !== "Recreational")
    .map((x: any) => x.code));
  const officialComplete = functionalLevel && levelItems.length > 0 && levelItems.every((x: any) => levelRecordedCodes.has(x.id));

  return (
    <div className="flex" style={{ minHeight: "100vh", background: "#F0F6FF", fontFamily: P }}>
      <Sidebar active="FACP Assessment" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title="FACP Assessment" subtitle="Functional-level based assessment using the supplied FACP checklist" />
        <main className="flex-1 p-8 overflow-y-auto">
          <div style={{ marginBottom: 18 }}>
            <button onClick={() => navigate(student ? `/students/${student._id}` : "/students")} style={backButton}>← Student Profile</button>
          </div>

          {/* <div style={notice}>
            <b>Automatic student mapping:</b> selecting a student uses the stored GIID group/FACP mapping to load the corresponding FACP checklist. GIID groups that have no direct level in the supplied FACP document are shown as requiring confirmation rather than being silently relabelled. If the level is not yet assigned, choose it once during Entry FACP assessment. <b>Vocational note:</b> the supplied FACP PDF does not contain a vocational checklist; Vocational is retained as a separate GIID training group and must not be relabelled as Prevocational-II. <b>Important:</b> FACP is <b>not ADL 1–12</b>. The checklist changes by functional level. Select the learner's FACP level first; then assess Personal, Social, Academic, Occupational and, separately, Recreational activities from that level. Entry is recorded once on admission for the current level; it is not an annual replacement of the baseline. Teaching goals are generally set quarterly (once in 3 months), while the supplied form provides Entry/I Term/II Term/III Term recording columns across First, Second and Third Year. LearnAble does not infer the year until GIID confirms its local recording rule. The system does not invent blank checklist slots.
          </div> */}

          <div className="facp-main-grid grid gap-5" style={{ gridTemplateColumns: "280px 1fr" }}>
            <aside>
              <div style={sideCard}>
                <div style={smallLabel}>LEARNER</div>
                <div style={studentName}>{student?.name || "Select student"}</div>
                <div style={studentCode}>{student?.studentCode || ""}</div>
                <select value={student?._id || ""} onChange={e => {
                  const next = students.find(x => x._id === e.target.value);
                  setStudent(next);
                  setFunctionalLevel(next?.facpFunctionalLevel || mapGIIDGroupToFACPLevel(next?.group, next?.age) || "");
                  setAssessmentPeriod(next?.facpBaselineScore != null ? "I Term" : "Entry");
                  setValues({});
                  setCustomItems([]);
                  if (next?._id) loadSummary(next._id);
                }} style={selectStyle}>
                  {students.map(x => <option key={x._id} value={x._id}>{x.name}</option>)}
                </select>
              </div>

              <div style={sideCard}>
                <div style={smallLabel}>CURRENT FACP SCORE</div>
                <div style={{ fontSize: 34, fontWeight: 900, color: "#1565C0", marginTop: 4 }}>{summary?.score ?? student?.facpScore ?? 0}%</div>
                <div style={{ color: "#607D8B", fontSize: 12 }}>GIID group: <b>{student?.group || "Not recorded"}</b></div><div style={{ color: "#607D8B", fontSize: 12 }}>FACP level: <b>{summary?.functionalLevel || student?.facpFunctionalLevel || mapGIIDGroupToFACPLevel(student?.group, student?.age) || "Needs GIID confirmation"}</b></div>
                {/* <div style={{ marginTop: 12, fontSize: 12 }}>
                  Baseline: <b>{summary?.baseline?.finalized ? `${summary.baseline.score}%` : "Pending Entry Assessment"}</b>
                </div> */}
                {summary?.assessmentComplete && !summary?.baseline?.finalized && (
                  <button onClick={finalizeBaseline} disabled={saving} style={baselineButton}>Finalize Entry Baseline</button>
                )}
              </div>
            </aside>

            <section style={mainCard}>
              <div className="facp-header-grid grid gap-4 mb-5" style={{ gridTemplateColumns: "minmax(230px,1.2fr) minmax(230px,1fr)" }}>
                <div>
                  <div style={smallLabel}>FACP FUNCTIONAL LEVEL</div>
                  <div style={{ fontSize: 11, color: "#607D8B", marginBottom: 6 }}>Mapped from the GIID group when available. Confirm/adjust only if the official FACP placement differs.</div>
                  <select value={functionalLevel} onChange={e => changeLevel(e.target.value)} style={selectStyle}>
                    <option value="">Select functional level</option>
                    {(template?.levels || []).map((x: string) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <div style={smallLabel}>ASSESSMENT PERIOD</div>
                  <select value={assessmentPeriod} onChange={e => setAssessmentPeriod(e.target.value)} style={selectStyle}>
                    {PERIODS.map(x => <option key={x} disabled={x === "Entry" && Boolean(summary?.baseline?.finalized)}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <div style={smallLabel}>FACP AREA</div>
                  <select value={domain} onChange={e => { setDomain(e.target.value); setValues({}); setCustomItems([]); }} style={selectStyle}>
                    {(template?.domains || []).map((d: any) => {
                      const available = Boolean(template?.domainAvailability?.[functionalLevel]?.[d.id]);
                      return <option key={d.id} value={d.id} disabled={!available}>{available ? d.name : `${d.name} — not in this FACP level`}</option>;
                    })}
                  </select>
                </div>
              </div>

              {functionalLevel ? (
                <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, background: "#F8FAFF", color: "#607D8B", fontSize: 12 }}>
                  <b>{functionalLevel}</b> → <b>{domain}</b>. Official source page number is shown on every checklist item. Custom items are allowed for child-specific needs, consistent with the checklist's individualized use. For this level, the source provides: {(template?.domains || []).filter((d: any) => template?.domainAvailability?.[functionalLevel]?.[d.id]).map((d: any) => d.name).join(', ')}.
                </div>
              ) : (
                <div style={emptyBox}>Select the learner's FACP functional level to load the correct checklist.</div>
              )}

              {functionalLevel && domain !== "Recreational" && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                  {CODE_OPTIONS.map(code => {
                    const m = statusMeta[code];
                    return <span key={code} style={{ padding: "5px 8px", borderRadius: 8, background: m.bg, color: m.color, fontSize: 10, fontWeight: 800 }}>{code} · {m.label}</span>;
                  })}
                </div>
              )}

              {functionalLevel && domain === "Recreational" && (
                <div style={notice}><b>Recreational scoring is separate.</b> Use A/B/C/D/E/NE grades. It is not included in the quantitative FACP percentage.</div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((item: any, index: number) => {
                  const value = values[item.id] || "";
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .01 }} style={itemCard}>
                      <div style={itemNumber}>{item.number || index + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0D2137" }}>{item.text}</div>
                        {/* <div style={{ marginTop: 5, fontSize: 10, color: "#78909C" }}>
                          Official FACP source · Page {item.page || "—"}{item.section ? ` · ${item.section}` : ""}
                        </div> */}
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
                          {(domain === "Recreational" ? RECREATION_GRADES : CODE_OPTIONS).map(code => {
                            const meta = domain === "Recreational" ? { label: code, bg: "#F4F7FA", color: "#1565C0" } : statusMeta[code];
                            const active = value === code;
                            return <button key={code} onClick={() => setValues(v => ({ ...v, [item.id]: code }))} title={meta.label} style={{ padding: "7px 10px", borderRadius: 9, border: `1.5px solid ${active ? meta.color : "#D8E3ED"}`, background: active ? meta.bg : "#fff", color: active ? meta.color : "#607D8B", fontFamily: P, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>{code}</button>;
                          })}
                          {item.custom && <button onClick={() => removeCustomItem(item.id)} style={removeButton}>Remove custom item</button>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {functionalLevel && (
                <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: "#F8FAFF" }}>
                  <div style={smallLabel}>ADD CHILD-SPECIFIC ITEM</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <input value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Activity needed specifically for this learner..." style={{ ...selectStyle, flex: 1 }} />
                    <button onClick={addCustomItem} style={secondaryButton}>+ Add item</button>
                  </div>
                </div>
              )}

              {functionalLevel && summary?.progression && (
                <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: summary.progression.passed ? "#E8F5E9" : "#FFF8E1", border: "1px solid #E0E8F0" }}>
                  <div style={smallLabel}>FACP PROGRESSION / REASSESSMENT</div>
                  <div style={{ marginTop: 5, fontWeight: 900, color: summary.progression.passed ? "#2E7D32" : "#8D6E00" }}>{summary.progression.status}</div>
                  <div style={{ marginTop: 4, fontSize: 11, color: "#607D8B" }}>{summary.progression.action}</div>
                  {!summary.progression.passed && functionalLevel !== "Care Group" && <div style={{ marginTop: 7, fontSize: 11, fontWeight: 800, color: "#8D6E00" }}>Below 80%: continue the appropriate FACP pathway and reassess at the next quarterly review; do not treat this as a promotion.</div>}
                </div>
              )}

              {summary?.history?.length > 0 && (
                <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: "#F8FAFF", overflowX: "auto" }}>
                  <div style={smallLabel}>FACP ASSESSMENT HISTORY — ENTRY + QUARTERLY REVIEWS</div>
                  <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse", fontSize: 11, minWidth: 650 }}>
                    <thead><tr>{["Date", "Period", "Area", "Score", "Status"].map(h => <th key={h} style={tableHead}>{h}</th>)}</tr></thead>
                    <tbody>{summary.history.slice(0, 30).map((a: any) => (
                      <tr key={a._id}>
                        <td style={tableCell}>{new Date(a.assessedAt || a.createdAt).toLocaleDateString()}</td>
                        <td style={tableCell}>{a.assessmentPeriod}</td>
                        <td style={tableCell}>{a.domain}</td>
                        <td style={tableCell}>{a.domain === "Recreational" ? (a.recreationGrade || "—") : `${a.score ?? 0}%`}</td>
                        <td style={tableCell}>{a.domain === "Recreational" ? "Separate grade" : (Number(a.score || 0) >= 80 ? "≥80%" : "<80% — reassess")}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}

              {domain !== "Recreational" && functionalLevel && (
                <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: "#F8FAFF" }}>
                  <div style={smallLabel}>CURRENT DOMAIN SCORE</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: liveScore >= 80 ? "#2E7D32" : "#1565C0", marginTop: 3 }}>{liveScore}%</div>
                  <div style={{ fontSize: 11, color: "#607D8B" }}>{achieved} pass / {applicable.length} applicable recorded in this screen</div>
                </div>
              )}

              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Teacher notes..." rows={3} style={{ width: "100%", boxSizing: "border-box", marginTop: 14, padding: 12, borderRadius: 12, border: "1px solid #D8E3ED", fontFamily: P }} />

              {message && <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "#E8F5E9", color: "#2E7D32", fontWeight: 700 }}>{message}</div>}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <div style={{ fontSize: 11, color: officialComplete ? "#2E7D32" : "#607D8B", fontWeight: 700 }}>
                  {officialComplete ? `✓ All official quantitative items for ${functionalLevel} have observations for the current FACP snapshot.` : "Assess every official quantitative item; use NA only when the item is genuinely not applicable."}
                </div>
                <button onClick={save} disabled={saving || !functionalLevel} style={primaryButton}>{saving ? "Saving…" : "Save FACP Assessment"}</button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

const backButton: any = { border: 0, background: "transparent", color: "#1565C0", fontFamily: P, cursor: "pointer", fontWeight: 700 };
const notice: any = { padding: 14, borderRadius: 14, background: "#FFF8E1", color: "#6D4C00", fontSize: 12, lineHeight: 1.6, marginBottom: 16 };
const sideCard: any = { background: "#fff", border: "1px solid rgba(21,101,192,.08)", borderRadius: 18, padding: 18, marginBottom: 14 };
const mainCard: any = { background: "#fff", border: "1px solid rgba(21,101,192,.08)", borderRadius: 18, padding: 22 };
const smallLabel: any = { fontSize: 10, color: "#4A6580", fontWeight: 800, letterSpacing: .5 };
const studentName: any = { fontSize: 20, fontWeight: 900, color: "#0D2137", marginTop: 6 };
const studentCode: any = { fontSize: 12, color: "#607D8B", marginTop: 2 };
const selectStyle: any = { width: "100%", marginTop: 7, padding: 10, borderRadius: 10, border: "1px solid #D8E3ED", fontFamily: P, boxSizing: "border-box", background: "#fff" };
const itemCard: any = { display: "flex", gap: 12, padding: 14, borderRadius: 14, border: "1px solid rgba(21,101,192,.1)", background: "#fff" };
const itemNumber: any = { width: 38, minWidth: 38, height: 34, borderRadius: 10, background: "#EAF4FF", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, color: "#1565C0" };
const baselineButton: any = { marginTop: 12, width: "100%", padding: 10, border: 0, borderRadius: 10, background: "#8D6E00", color: "#fff", fontFamily: P, fontWeight: 800, cursor: "pointer" };
const primaryButton: any = { padding: "11px 16px", border: 0, borderRadius: 11, background: "#1565C0", color: "#fff", fontFamily: P, fontWeight: 800, cursor: "pointer" };
const secondaryButton: any = { padding: "10px 14px", border: 0, borderRadius: 10, background: "#EAF4FF", color: "#1565C0", fontFamily: P, fontWeight: 800, cursor: "pointer" };
const removeButton: any = { padding: "6px 9px", border: "1px solid #F2B8B5", borderRadius: 8, background: "#FFF5F4", color: "#B3261E", fontFamily: P, fontSize: 10, fontWeight: 800, cursor: "pointer" };
const emptyBox: any = { padding: 30, textAlign: "center", border: "1px dashed #B0C4D8", borderRadius: 14, color: "#607D8B" };

const tableHead: any = { textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #D8E3ED", color: "#4A6580", fontWeight: 800, whiteSpace: "nowrap" };
const tableCell: any = { padding: "8px 6px", borderBottom: "1px solid #E7EEF5", color: "#334E68" };
