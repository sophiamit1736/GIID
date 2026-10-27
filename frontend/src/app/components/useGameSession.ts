import { useCallback, useEffect, useRef, useState } from "react";
import { getAdaptiveSummary, saveResult } from "../api/resultApi";

export type StepResult = {
  step: number;
  title?: string;
  status: "correct" | "incorrect" | "prompted" | "skipped" | "completed";
  attempts?: number;
  helpUsed?: boolean;
  responseTime?: number;
};

type Args = {
  studentId: string;
  activityName: string;
  moduleId: string;
  gameId?: string;
  domain: string;
  level: string;
  gameType: string;
  totalItems: number;
  timeLimit?: number;
  active?: boolean;
  facpItemCodes?: string[];
  countdown?: boolean;
};

export function useGameSession({ studentId, activityName, moduleId, gameId = "", domain, level, gameType, totalItems, timeLimit = 120, active = true, facpItemCodes = [], countdown = true }: Args) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [attempts, setAttempts] = useState(0);
  const [helpRequests, setHelpRequests] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());
  const attemptsRef = useRef(0);
  const helpRef = useRef(0);
  const finishLock = useRef(false);
  const lastStudentRef = useRef("");

  const reset = useCallback(() => {
    startedAt.current = Date.now();
    finishLock.current = false;
    setTimeLeft(timeLimit);
    attemptsRef.current = 0;
    helpRef.current = 0;
    setAttempts(0);
    setHelpRequests(0);
    setFinished(false);
    setSaving(false);
    setSaved(false);
    setRecommendation(null);
    setError("");
  }, [timeLimit]);

  useEffect(() => {
    if (lastStudentRef.current !== studentId) {
      lastStudentRef.current = studentId;
      startedAt.current = Date.now();
      finishLock.current = false;
      setTimeLeft(timeLimit);
      setAttempts(0);
      setHelpRequests(0);
      setFinished(false);
      setSaved(false);
      setRecommendation(null);
      setError("");
    }
  }, [studentId, timeLimit]);

  useEffect(() => {
    if (!countdown || !active || finished || !studentId || timeLeft <= 0) return;
    const timer = window.setInterval(() => setTimeLeft(v => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [active, countdown, finished, studentId, timeLeft]);

  const addAttempt = useCallback(() => { attemptsRef.current += 1; setAttempts(v => v + 1); }, []);
  const requestHelp = useCallback(() => { helpRef.current += 1; setHelpRequests(v => v + 1); }, []);

  const complete = useCallback(async ({ correctAnswers, completedItems = totalItems, score, stepResults = [] as StepResult[] }: { correctAnswers: number; completedItems?: number; score?: number; stepResults?: StepResult[] }) => {
    if (finishLock.current || finished) return null;
    if (!active) { setError("Start the activity before submitting a result."); return null; }
    if (!studentId) { setError("Please select a learner before starting the activity."); return null; }
    finishLock.current = true;
    setFinished(true);
    setSaving(true);
    setError("");
    const elapsed = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const accuracy = totalItems ? Math.round((correctAnswers / totalItems) * 100) : 0;
    const currentAttempts = Math.max(1, attemptsRef.current);
    const currentHelp = helpRef.current;
    const completionRate = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
    try {
      const response = await saveResult({
        student: studentId, activityName, moduleId, gameId, domain, level,
        totalQuestions: totalItems, correctAnswers, wrongAnswers: Math.max(0, totalItems - correctAnswers),
        score: score ?? accuracy, accuracy, timeTaken: elapsed,
        attempts: currentAttempts, helpRequests: currentHelp, gameType,
        completionRate, timeLimit, completedItems, stepResults, facpItemCodes, dataSource: "prototype", isDemoData: false,
      });
      // The backend is authoritative for ALPI metrics. Never use a different
      // client-side formula for the displayed Performance Index.
      const savedResult = response.data?.result;
      const backendPerformanceIndex = Number(savedResult?.performanceIndex ?? accuracy);
      const adaptive = await getAdaptiveSummary(studentId, 'game');
      const rec = adaptive.data?.recommendation || adaptive.data?.mlPrediction?.nextActivity || null;
      setRecommendation(rec);
      setSaved(true);
      return { accuracy, elapsed, performanceIndex: backendPerformanceIndex, recommendation: rec };
    } catch (e: any) {
      setError(e?.response?.data?.message || "Could not save this activity result.");
      finishLock.current = false;
      setFinished(false);
      return null;
    } finally { setSaving(false); }
  }, [studentId, activityName, moduleId, gameId, domain, level, gameType, totalItems, timeLimit, finished, active, facpItemCodes]);

  return { timeLeft, attempts, helpRequests, finished, saving, saved, recommendation, error, addAttempt, requestHelp, complete, reset };
}
