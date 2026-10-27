import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { getModuleAssessment, submitModuleAssessment } from "../api/moduleAssessmentApi";

const P = "Poppins, sans-serif";

type Assessment = {
  assessmentId: string;
  title: string;
  instructions: string;
  items: Array<{
    id: string;
    question: string;
    tamil?: string;
    options: string[];
    correctIndex: number;
    image?: string;
  }>;
};

export default function ModuleAssessment({
  moduleId,
  studentId,
  onComplete,
}: {
  moduleId: string;
  studentId: string;
  onComplete: (result: { correct: number; total: number; helpRequests: number; attempts: number; persisted?: boolean }) => void;
}) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [helpRequests, setHelpRequests] = useState(0);
  const [attempts] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getModuleAssessment(moduleId)
      .then((res) => {
        if (!mounted) return;
        setAssessment(res.data);
        setAnswers(Array(res.data.items.length).fill(-1));
      })
      .catch((e) => {
        console.error(e);
        if (mounted) setError(e?.response?.data?.message || "Unable to prepare the assessment.");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [moduleId]);

  if (loading) return <div className="rounded-[30px] p-8 text-center" style={{ background: "#fff", fontFamily: P }}>Preparing your assessment…</div>;
  if (error || !assessment) return <div className="rounded-[30px] p-8 text-center" style={{ background: "#fff", fontFamily: P, color: "#C62828" }}>{error || "Assessment unavailable."}</div>;

  const current = assessment.items[index];
  const selected = answers[index] ?? -1;

  const choose = (optionIndex: number) => {
    if (submitting) return;
    setAnswers((prev) => { const next = [...prev]; next[index] = optionIndex; return next; });
  };

  const askHelp = () => {
    setHelpRequests((v) => v + 1);
    window.speechSynthesis?.cancel();
    if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance("Look at the picture and choose the answer that matches what you learned."));
  };

  const next = async () => {
    if (selected < 0) return;
    if (index < assessment.items.length - 1) {
      setIndex((v) => v + 1);
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitModuleAssessment({
        student: studentId,
        moduleId,
        answers,
        timeTaken: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
        attempts,
        helpRequests,
      });
      const saved = response.data?.result;
      onComplete({
        correct: Number(saved?.correctAnswers || 0),
        total: assessment.items.length,
        helpRequests,
        attempts,
        persisted: true,
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "The assessment could not be saved.");
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] p-6 md:p-8" style={{ background: "#fff", boxShadow: "0 10px 35px rgba(21,101,192,.09)" }}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <span className="inline-block px-3 py-1 rounded-full" style={{ background: "#E8F5E9", color: "#2E7D32", fontFamily: P, fontWeight: 700, fontSize: 11 }}>LEARNING ASSESSMENT</span>
          <h2 style={{ fontFamily: P, fontSize: 23, fontWeight: 800, color: "#0D2137", marginTop: 10 }}>{assessment.title}</h2>
          <p style={{ fontFamily: P, fontSize: 13, color: "#607D8B", marginTop: 5 }}>{assessment.instructions}</p>
        </div>
        <div className="px-4 py-3 rounded-2xl text-center" style={{ background: "#F0F6FF", color: "#1565C0", fontFamily: P, fontWeight: 700, minWidth: 90 }}>{index + 1} / {assessment.items.length}</div>
      </div>

      <div className="h-2 rounded-full overflow-hidden mb-6" style={{ background: "#E7EEF5" }}>
        <div className="h-full rounded-full" style={{ width: `${((index + 1) / assessment.items.length) * 100}%`, background: "linear-gradient(90deg,#42A5F5,#66BB6A)" }} />
      </div>

      {current.image && <img src={current.image} alt="assessment" className="mx-auto w-full max-w-[420px] aspect-[4/3] object-contain rounded-3xl mb-5" />}
      <h3 className="text-center mb-2" style={{ fontFamily: P, fontSize: 19, fontWeight: 800, color: "#0D2137", lineHeight: 1.4 }}>{current.question}</h3>
      {current.tamil && <div className="text-center mb-5" style={{ fontFamily: P, color: "#2E7D32", fontSize: 14, fontWeight: 700 }}>{current.tamil}</div>}

      <div className="grid gap-3 md:grid-cols-2">
        {current.options.map((option, i) => (
          <button key={`${current.id}-${i}`} onClick={() => choose(i)} disabled={submitting} className="rounded-2xl p-4 text-left" style={{ background: selected === i ? "#EAF4FF" : "#F8FBFD", border: selected === i ? "3px solid #1565C0" : "2px solid #D9E6F2", color: "#263238", fontFamily: P, fontWeight: 700, cursor: submitting ? "default" : "pointer" }}>
            {String.fromCharCode(65 + i)}. {option}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mt-5">
        <button onClick={askHelp} disabled={submitting} className="flex-1 py-3 rounded-2xl border-0" style={{ background: "#FFF8E1", color: "#6D5600", fontFamily: P, fontWeight: 700 }}>💡 I need help</button>
        <button onClick={next} disabled={selected < 0 || submitting} className="flex-1 py-3 rounded-2xl border-0 text-white" style={{ background: selected < 0 || submitting ? "#B0BEC5" : "#1565C0", fontFamily: P, fontWeight: 800 }}>{index === assessment.items.length - 1 ? (submitting ? "Saving…" : "Finish Assessment") : "Next →"}</button>
      </div>
      {error && <div className="mt-4 rounded-2xl p-4" style={{ background: "#FFF4E5", color: "#E65100", fontFamily: P, fontSize: 12 }}>{error}</div>}
    </motion.div>
  );
}
