import { API_BASE } from "../api/config";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import axios from "axios";
import GameShell from "../components/GameShell";
import GameResultPanel from "../components/GameResultPanel";
import { useGameSession } from "../components/useGameSession";

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const P = "Poppins, sans-serif";
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function textOf(value: any, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((x) => textOf(x)).filter(Boolean).join(", ");
  if (typeof value === "object") {
    for (const key of ["text", "shortText", "shortLabel", "label", "name", "title", "value", "instruction", "description", "content"]) {
      if (value[key] !== undefined && value[key] !== null) {
        const out = textOf(value[key]);
        if (out) return out;
      }
    }
  }
  return fallback;
}

function visualFor(key: string, text: string, fallback = "⭐") {
  const source = `${key} ${text}`.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/greet|hello|vanakkam|வணக்கம்/, "👋"],
    [/listen|hear|கேள்/, "👂"],
    [/turn|wait|வரிசை/, "⏳"],
    [/respond|answer|reply|பதில்/, "💬"],
    [/goodbye|bye|பிரிய/, "👋"],
    [/hand.?wash|soap|rinse|wash/, "🧼"],
    [/brush|tooth|teeth/, "🪥"],
    [/dress|shirt|pants|clothes/, "👕"],
    [/eat|food|meal/, "🍎"],
    [/drink|water/, "🥤"],
    [/clean|dust|wipe/, "🧹"],
    [/money|coin|cash/, "💰"],
    [/number|count|math/, "🔢"],
    [/colour|color/, "🎨"],
    [/shape/, "🔷"],
    [/read|letter|alphabet/, "📖"],
    [/tool|machine|vocational/, "🛠️"],
    [/emotion|happy|sad|angry|feel/, "🙂"],
    [/friend|person|social|interaction|conversation/, "🧑‍🤝‍🧑"],
    [/safe|danger/, "🛡️"],
    [/sort|group|category/, "🗂️"],
    [/match|pair/, "🔗"],
  ];
  return rules.find(([pattern]) => pattern.test(source))?.[1] || fallback;
}

function safeImage(src: any) {
  const value = textOf(src);
  return value.startsWith("/") || value.startsWith("data:image/") || value.startsWith("blob:") ? value : "";
}

function speak(text: string, tamil = false) {
  if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = tamil ? "ta-IN" : "en-IN";
  utterance.rate = 0.82;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function Media({ image, emoji, text, large = false }: { image?: string; emoji?: string; text?: string; large?: boolean }) {
  const src = safeImage(image);
  if (src) return <img src={src} alt="" style={{ width: large ? 92 : 60, height: large ? 92 : 60, objectFit: "contain", borderRadius: 16 }} />;
  return <div aria-hidden="true" style={{ fontSize: large ? 68 : 46, lineHeight: 1 }}>{emoji || visualFor("", text || "")}</div>;
}

function SpeakButton({ text, tamilText, tamil, compact = false }: { text: string; tamilText?: string; tamil: boolean; compact?: boolean }) {
  const phrase = tamil && tamilText ? tamilText : text;
  return (
    <button
      type="button"
      aria-label={`Hear ${phrase}`}
      onClick={(event) => { event.stopPropagation(); speak(phrase, tamil && Boolean(tamilText)); }}
      style={{ ...styles.audioButton, ...(compact ? styles.audioButtonCompact : {}) }}
    >🔊</button>
  );
}

function VisualCard({ item, tamil, onClick, selected = false, disabled = false }: any) {
  const label = textOf(item?.shortLabel, textOf(item?.label, textOf(item?.value, "Choose")));
  const full = textOf(item?.label, textOf(item?.value, label));
  const tamilText = textOf(item?.tamil);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={`${label}. ${tamilText || full}`}
      style={{
        ...styles.visualCard,
        ...(selected ? styles.visualCardSelected : {}),
        ...(disabled ? styles.visualCardDisabled : {}),
      }}
    >
      <div style={styles.visualTop}>
        <Media image={item?.image} emoji={item?.emoji || visualFor(item?.visualKey, full)} text={full} large />
        <SpeakButton text={textOf(item?.audioText, full)} tamilText={tamilText} tamil={tamil} compact />
      </div>
      <div style={styles.visualLabel}>{tamil && tamilText ? tamilText : label}</div>
      {(!tamil || !tamilText) && full !== label && <div style={styles.smallText}>{full}</div>}
    </button>
  );
}

export default function GeneratedGamePage() {
  const { moduleId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [game, setGame] = useState<any>(null);
  const [studentId, setStudentId] = useState(() => searchParams.get("studentId") || "");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [index, setIndex] = useState(0);
  const [sequencePool, setSequencePool] = useState<any[]>([]);
  const [sequenceOrder, setSequenceOrder] = useState<any[]>([]);
  const [matchingLeft, setMatchingLeft] = useState<string | null>(null);
  const [matchingRight, setMatchingRight] = useState<any[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [memoryOpen, setMemoryOpen] = useState<string[]>([]);
  const [sortPlaced, setSortPlaced] = useState<Record<string, string>>({});
  const [selectedSortItem, setSelectedSortItem] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [tamil, setTamil] = useState(false);

  useEffect(() => {
    if (!moduleId) {
      setLoadError("Game ID is missing.");
      setLoading(false);
      return;
    }
    api.get(`/games/${moduleId}`)
      .then((response) => setGame(response.data?.data || response.data))
      .catch((error) => setLoadError(error.response?.data?.message || "Unable to load generated game."))
      .finally(() => setLoading(false));
  }, [moduleId]);

  useEffect(() => {
    const generatedStudent = game?.generatedForStudent;
    if (generatedStudent && !studentId) setStudentId(String(generatedStudent));
  }, [game, studentId]);

  const cfg = game?.gameConfig || {};
  const type = cfg.type || game?.activityType || "choice";
  const learningLevel = game?.learnerLearningLevel || game?.level || "Beginner";

  const questions = useMemo(() => Array.isArray(cfg.questions) ? cfg.questions.map((q: any, i: number) => ({
    ...q,
    id: textOf(q?.id, `q-${i + 1}`),
    text: textOf(q?.text, `Question ${i + 1}`),
    shortText: textOf(q?.shortText, q?.text),
    tamil: textOf(q?.tamil),
    audioText: textOf(q?.audioText, q?.text),
    emoji: textOf(q?.emoji, visualFor(q?.visualKey, q?.text, "👉")),
    options: Array.isArray(q?.options) ? q.options.map((option: any, oi: number) => {
      if (typeof option === "object") return { ...option, text: textOf(option?.text, option?.label), shortText: textOf(option?.shortText, option?.text), tamil: textOf(option?.tamil), audioText: textOf(option?.audioText, option?.text), emoji: textOf(option?.emoji, visualFor(option?.visualKey, option?.text, "🔹")) };
      return { text: textOf(option), shortText: textOf(option), tamil: "", audioText: textOf(option), emoji: visualFor("", textOf(option), "🔹") };
    }) : [],
  })) : [], [cfg.questions]);

  const pairs = useMemo(() => Array.isArray(cfg.pairs) ? cfg.pairs.map((p: any, i: number) => ({
    ...p,
    id: textOf(p?.id, `pair-${i + 1}`),
    left: textOf(p?.left), right: textOf(p?.right),
    shortLeft: textOf(p?.shortLeft, p?.left), shortRight: textOf(p?.shortRight, p?.right),
    tamilLeft: textOf(p?.tamilLeft), tamilRight: textOf(p?.tamilRight),
    audioLeft: textOf(p?.audioLeft, p?.left), audioRight: textOf(p?.audioRight, p?.right),
    emoji: textOf(p?.emoji, visualFor(`${p?.visualKeyLeft || ""} ${p?.visualKeyRight || ""}`, `${p?.left || ""} ${p?.right || ""}`, "⭐")),
  })) : [], [cfg.pairs]);

  const items = useMemo(() => Array.isArray(cfg.items) ? cfg.items.map((item: any, i: number) => ({
    ...item,
    id: textOf(item?.id, `item-${i + 1}`),
    label: textOf(item?.label, item?.value),
    shortLabel: textOf(item?.shortLabel, item?.label || item?.value),
    value: textOf(item?.value, item?.label),
    tamil: textOf(item?.tamil),
    audioText: textOf(item?.audioText, item?.label || item?.value),
    emoji: textOf(item?.emoji, visualFor(item?.visualKey, item?.label || item?.value)),
    correctBin: textOf(item?.correctBin),
  })) : [], [cfg.items]);

  const total = type === "choice" ? questions.length : (type === "matching" || type === "memory" ? pairs.length : items.length);

  const session = useGameSession({
    studentId,
    activityName: game?.title || "AI Generated Activity",
    gameId: game?.gameId || moduleId,
    moduleId: game?.targetLearningModuleId || moduleId,
    domain: game?.facpDomain || game?.category || "General",
    level: learningLevel,
    gameType: type,
    totalItems: Math.max(1, total),
    active: Boolean(game && studentId),
    facpItemCodes: Array.isArray(game?.facpItemCodes) ? game.facpItemCodes : [],
    timeLimit: 0,
    countdown: false,
  });

  useEffect(() => {
    if (!game) return;
    if (type === "visual-sequence") {
      const source = Array.isArray(cfg.shuffledItems) && cfg.shuffledItems.length === items.length ? cfg.shuffledItems : shuffle(items);
      setSequencePool(source.map((x: any) => items.find((item: any) => String(item.id) === String(x.id)) || x));
      setSequenceOrder([]);
    }
    if (type === "matching") {
      setMatchingRight(shuffle(pairs));
      setMatchingLeft(null); setMatchedPairs([]);
    }
    if (type === "memory") {
      const cards = pairs.flatMap((pair: any) => [
        { id: `${pair.id}-L`, pairId: pair.id, text: pair.left, shortText: pair.shortLeft, tamil: pair.tamilLeft, audioText: pair.audioLeft, emoji: pair.emoji },
        { id: `${pair.id}-R`, pairId: pair.id, text: pair.right, shortText: pair.shortRight, tamil: pair.tamilRight, audioText: pair.audioRight, emoji: pair.emoji },
      ]);
      setMemoryCards(shuffle(cards)); setMemoryOpen([]); setMatchedPairs([]);
    }
  }, [game, type, items, pairs, cfg.shuffledItems]);

  const completedCount = type === "choice" ? index : type === "visual-sequence" ? sequenceOrder.length : type === "matching" || type === "memory" ? matchedPairs.length : Object.keys(sortPlaced).length;
  const finish = async (score: number, completedItems = total) => {
    if (done) return;
    const safe = Math.max(0, Math.min(total, Math.round(score)));
    setCorrect(safe); setDone(true);
    await session.complete({ correctAnswers: safe, completedItems: Math.max(0, Math.min(total, completedItems)), score: total ? Math.round((safe / total) * 100) : 0 });
  };

  const retry = () => {
    setCorrect(0); setDone(false); setIndex(0); setFeedback(""); setMatchingLeft(null); setMatchedPairs([]); setMemoryOpen([]); setSortPlaced({}); setSelectedSortItem(null); setSequenceOrder([]);
    if (type === "visual-sequence") setSequencePool(shuffle(items));
    if (type === "matching") setMatchingRight(shuffle(pairs));
    if (type === "memory") setMemoryCards(shuffle(pairs.flatMap((pair: any) => [
      { id: `${pair.id}-L`, pairId: pair.id, text: pair.left, shortText: pair.shortLeft, tamil: pair.tamilLeft, audioText: pair.audioLeft, emoji: pair.emoji },
      { id: `${pair.id}-R`, pairId: pair.id, text: pair.right, shortText: pair.shortRight, tamil: pair.tamilRight, audioText: pair.audioRight, emoji: pair.emoji },
    ])));
    session.reset();
  };

  const instruction = type === "choice" ? "Choose the best answer." : type === "visual-sequence" ? "Tap the step that comes next." : type === "matching" ? "Choose one picture, then choose what matches it." : type === "memory" ? "Find the matching pairs." : "Tap an item, then tap the group where it belongs.";
  const instructionTamil = type === "choice" ? "சரியான பதிலைத் தேர்வு செய்யுங்கள்." : type === "visual-sequence" ? "அடுத்து வரும் படியைத் தேர்வு செய்யுங்கள்." : type === "matching" ? "ஒரு படத்தைத் தேர்வு செய்து, அதற்குப் பொருத்தமானதைத் தேர்வு செய்யுங்கள்." : type === "memory" ? "பொருந்தும் ஜோடிகளைக் கண்டுபிடிக்கவும்." : "ஒரு பொருளைத் தேர்வு செய்து, அது சேரும் குழுவைத் தேர்வு செய்யுங்கள்.";

  const choice = questions[index];
  const submitChoice = (optionIndex: number) => {
    if (!choice || done) return;
    session.addAttempt();
    const ok = optionIndex === Number(choice.correct);
    if (!ok) {
      setFeedback(tamil ? (choice.feedbackIncorrectTamil || "மீண்டும் முயற்சி செய்யுங்கள்.") : textOf(choice.feedbackIncorrect, "Try again."));
      speak(tamil ? (choice.feedbackIncorrectTamil || "மீண்டும் முயற்சி செய்யுங்கள்.") : textOf(choice.feedbackIncorrect, "Try again."), tamil);
      return;
    }
    const next = correct + 1;
    setCorrect(next);
    setFeedback(tamil ? (choice.feedbackCorrectTamil || "நன்று!") : textOf(choice.feedbackCorrect, "Great job!"));
    speak(tamil ? (choice.feedbackCorrectTamil || "நன்று!") : textOf(choice.feedbackCorrect, "Great job!"), tamil);
    window.setTimeout(() => {
      setFeedback("");
      if (index + 1 >= questions.length) finish(next, questions.length); else setIndex((value) => value + 1);
    }, 500);
  };

  const selectSequenceItem = (item: any) => {
    if (done) return;
    session.addAttempt();
    const expected = items[sequenceOrder.length];
    if (!expected || String(expected.id) !== String(item.id)) {
      setFeedback(tamil ? "அடுத்து வரும் படியை முயற்சி செய்யுங்கள்." : "Try the step that comes next.");
      return;
    }
    const nextOrder = [...sequenceOrder, item];
    setSequenceOrder(nextOrder); setSequencePool((pool) => pool.filter((x) => String(x.id) !== String(item.id)));
    setFeedback(tamil ? "சரி!" : "Correct!");
    if (nextOrder.length === items.length) window.setTimeout(() => finish(items.length, items.length), 350);
  };

  const chooseMatch = (side: "left" | "right", id: string) => {
    if (done) return;
    if (side === "left") { setMatchingLeft(id); return; }
    if (!matchingLeft) { setFeedback(tamil ? "முதலில் இடது பக்கப் படத்தைத் தேர்வு செய்யுங்கள்." : "Choose an item on the left first."); return; }
    if (matchedPairs.includes(id)) return;
    session.addAttempt();
    const ok = matchingLeft === id;
    setFeedback(ok ? (tamil ? "சரி!" : "Match found!") : (tamil ? "மீண்டும் முயற்சி செய்யுங்கள்." : "Try another match."));
    if (ok) {
      const next = [...matchedPairs, id]; setMatchedPairs(next); setMatchingLeft(null);
      if (next.length === pairs.length) window.setTimeout(() => finish(pairs.length, pairs.length), 350);
    }
  };

  const flipMemory = (id: string) => {
    if (done || memoryOpen.includes(id) || memoryOpen.length >= 2) return;
    const card = memoryCards.find((x) => x.id === id);
    if (!card || matchedPairs.includes(card.pairId)) return;
    session.addAttempt();
    const nextOpen = [...memoryOpen, id]; setMemoryOpen(nextOpen);
    if (nextOpen.length !== 2) return;
    const [a, b] = nextOpen.map((openId) => memoryCards.find((x) => x.id === openId));
    if (a?.pairId === b?.pairId) {
      const next = [...matchedPairs, a.pairId]; setMatchedPairs(next); setMemoryOpen([]); setFeedback(tamil ? "சரி!" : "Pair found!");
      if (next.length === pairs.length) window.setTimeout(() => finish(pairs.length, pairs.length), 350);
    } else {
      setFeedback(tamil ? "மீண்டும் முயற்சி செய்யுங்கள்." : "Not a pair. Try again.");
      window.setTimeout(() => setMemoryOpen([]), 750);
    }
  };

  const placeSortItem = (binId: string) => {
    if (!selectedSortItem || done) return;
    session.addAttempt();
    const item = items.find((x: any) => String(x.id) === String(selectedSortItem));
    if (!item) return;
    if (String(item.correctBin) !== String(binId)) {
      setFeedback(tamil ? "மீண்டும் முயற்சி செய்யுங்கள்." : "Try another group.");
      return;
    }
    const nextPlaced = { ...sortPlaced, [item.id]: binId }; setSortPlaced(nextPlaced); setSelectedSortItem(null); setFeedback(tamil ? "சரி!" : "Correct!");
    if (Object.keys(nextPlaced).length === items.length) window.setTimeout(() => finish(items.length, items.length), 350);
  };

  if (loading) return <GameShell title="Loading game" icon="🎮" studentId={studentId} onStudentChange={setStudentId}><div style={styles.center}>Loading the activity…</div></GameShell>;
  if (loadError || !game) return <GameShell title="Game unavailable" icon="⚠️" studentId={studentId} onStudentChange={setStudentId}><div style={styles.error}>{loadError || "This game could not be loaded."}</div></GameShell>;

  if (done) {
    return <GameShell title={game.title} icon={game.coverEmoji || "🎮"} studentId={studentId} onStudentChange={setStudentId}>
      <GameResultPanel score={total ? Math.round((correct / total) * 100) : 0} accuracy={total ? Math.round((correct / total) * 100) : 0} timeTaken={0} recommendation={session.recommendation} onRetry={retry} saving={session.saving} error={session.error} studentId={studentId} />
    </GameShell>;
  }

  return <GameShell
    title={game.title || "Learning Game"}
    icon={game.coverEmoji || "🎮"}
    studentId={studentId}
    onStudentChange={setStudentId}
    score={total ? Math.round((correct / total) * 100) : 0}
    progress={total ? (completedCount / total) * 100 : 0}
  >
    <div className="la-access-game" style={styles.pageCard}>
      <div style={styles.accessBar}>
        <div><span style={styles.badge}>AI GENERATED • RAG GROUNDED</span><span style={styles.badgeBlue}>{learningLevel} • {game.difficulty || "Easy"}</span></div>
        <div style={styles.accessActions}>
          <button type="button" onClick={() => setTamil(false)} style={{ ...styles.toggle, ...(tamil ? {} : styles.toggleActive) }}>English</button>
          <button type="button" onClick={() => setTamil(true)} style={{ ...styles.toggle, ...(tamil ? styles.toggleActive : {}) }}>தமிழ்</button>
        </div>
      </div>

      <div style={styles.goalBox}>
        <div style={styles.goalVisual}>🎯</div>
        <div style={{ flex: 1 }}>
          <div style={styles.goalTitle}>{game.targetLearningModuleTitle || game.skill || "Selected learning skill"}</div>
          <div style={styles.goalText}>{game.description || "Practice this skill through a short interactive activity."}</div>
        </div>
        <button type="button" onClick={() => speak(tamil && instructionTamil ? instructionTamil : instruction, tamil)} style={styles.hearInstruction}>🔊 Hear instruction</button>
      </div>

      <div style={styles.instructionRow}>
        <div><strong>{tamil ? instructionTamil : instruction}</strong><div style={styles.stepCounter}>{completedCount} of {total} completed</div></div>
        <button type="button" onClick={() => speak(tamil ? instructionTamil : instruction, tamil)} style={styles.audioCircle}>🔊</button>
      </div>

      {feedback && <div role="status" style={styles.feedback}>{feedback}</div>}

      {type === "choice" && choice && <div>
        <div style={styles.questionCard}>
          <Media emoji={choice.emoji || visualFor(choice.visualKey, choice.text, "👉")} text={choice.text} large />
          <div style={styles.questionText}>{tamil && choice.tamil ? choice.tamil : choice.shortText || choice.text}</div>
          <SpeakButton text={choice.audioText || choice.text} tamilText={choice.tamil} tamil={tamil} />
        </div>
        <div className="la-access-option-grid" style={styles.optionGrid}>
          {choice.options.map((option: any, optionIndex: number) => <VisualCard key={optionIndex} item={{ ...option, label: option.shortText || option.text }} tamil={tamil} onClick={() => submitChoice(optionIndex)} />)}
        </div>
      </div>}

      {type === "visual-sequence" && <div>
        <div style={styles.sequenceAnswer}>
          {sequenceOrder.length ? sequenceOrder.map((item, i) => <div key={item.id} style={styles.sequenceChip}><span>{i + 1}</span><Media emoji={item.emoji || visualFor(item.visualKey, item.label)} text={item.label} /><b>{tamil && item.tamil ? item.tamil : item.shortLabel}</b></div>) : <div style={styles.emptyHint}>Tap the picture that should happen first.</div>}
        </div>
        <div className="la-access-option-grid" style={styles.optionGrid}>{sequencePool.map((item) => <VisualCard key={item.id} item={item} tamil={tamil} onClick={() => selectSequenceItem(item)} />)}</div>
      </div>}

      {type === "matching" && <div className="la-access-two-columns" style={styles.twoColumns}>
        <div><div style={styles.columnTitle}>CHOOSE</div>{pairs.map((pair) => <VisualCard key={pair.id} item={{ label: pair.shortLeft, value: pair.left, tamil: pair.tamilLeft, audioText: pair.audioLeft, emoji: pair.emoji, visualKey: pair.visualKeyLeft }} tamil={tamil} selected={matchingLeft === pair.id} disabled={matchedPairs.includes(pair.id)} onClick={() => chooseMatch("left", pair.id)} />)}</div>
        <div><div style={styles.columnTitle}>MATCH WITH</div>{matchingRight.map((pair) => <VisualCard key={pair.id} item={{ label: pair.shortRight, value: pair.right, tamil: pair.tamilRight, audioText: pair.audioRight, emoji: pair.emoji, visualKey: pair.visualKeyRight }} tamil={tamil} disabled={matchedPairs.includes(pair.id)} onClick={() => chooseMatch("right", pair.id)} />)}</div>
      </div>}

      {type === "memory" && <div className="la-access-memory-grid" style={styles.memoryGrid}>{memoryCards.map((card) => {
        const visible = memoryOpen.includes(card.id) || matchedPairs.includes(card.pairId);
        return <button key={card.id} type="button" disabled={matchedPairs.includes(card.pairId)} onClick={() => flipMemory(card.id)} style={{ ...styles.memoryCard, ...(visible ? styles.memoryCardOpen : {}) }} aria-label={visible ? textOf(card.shortText, card.text) : "Hidden card"}>
          {visible ? <><Media emoji={card.emoji || visualFor("", card.text)} text={card.text} /><b>{tamil && card.tamil ? card.tamil : card.shortText || card.text}</b></> : <><div style={{ fontSize: 50 }}>❓</div><span>Tap</span></>}
        </button>;
      })}</div>}

      {type === "drag-sort" && <div>
        <div className="la-access-option-grid" style={styles.optionGrid}>{items.filter((item) => !sortPlaced[item.id]).map((item) => <VisualCard key={item.id} item={item} tamil={tamil} selected={selectedSortItem === item.id} onClick={() => setSelectedSortItem(selectedSortItem === item.id ? null : item.id)} />)}</div>
        <div className="la-access-two-columns" style={styles.twoColumns}>{(Array.isArray(cfg.bins) ? cfg.bins : []).map((bin: any) => <button key={bin.id} type="button" onClick={() => placeSortItem(bin.id)} style={{ ...styles.binCard, ...(selectedSortItem ? styles.binCardReady : {}) }}><div style={{ fontSize: 46 }}>{bin.emoji || "📦"}</div><b>{tamil && bin.tamil ? bin.tamil : textOf(bin.label, "Group")}</b><span>{selectedSortItem ? "Tap to place" : "Choose an item first"}</span></button>)}</div>
      </div>}

      <div style={styles.supportBar}>
        <span>💡 You can try again. There is no countdown.</span>
        <button type="button" onClick={() => { session.requestHelp(); speak(tamil ? "முதலில் ஒரு படத்தைத் தேர்வு செய்யுங்கள்." : "Take your time. Choose one picture at a time.", tamil); }} style={styles.helpButton}>💡 Help</button>
      </div>
    </div>
  </GameShell>;
}

const styles: Record<string, React.CSSProperties> = {
  center: { padding: 50, textAlign: "center", fontFamily: P, color: "#607D8B" },
  error: { padding: 30, background: "#FFF3F3", borderRadius: 18, color: "#B71C1C", fontFamily: P },
  pageCard: { background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 5px 24px rgba(21,101,192,.08)" },
  accessBar: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" },
  accessActions: { display: "flex", gap: 6 },
  badge: { display: "inline-block", padding: "7px 10px", borderRadius: 99, background: "#E8F5E9", color: "#2E7D32", fontSize: 10, fontWeight: 900, fontFamily: P, marginRight: 6 },
  badgeBlue: { display: "inline-block", padding: "7px 10px", borderRadius: 99, background: "#EAF4FF", color: "#1565C0", fontSize: 10, fontWeight: 900, fontFamily: P },
  toggle: { minWidth: 76, minHeight: 42, borderRadius: 12, border: "1px solid #CBD8E5", background: "#fff", fontFamily: P, fontWeight: 800, cursor: "pointer" },
  toggleActive: { background: "#1565C0", color: "#fff", borderColor: "#1565C0" },
  goalBox: { marginTop: 18, padding: 16, borderRadius: 18, background: "#F4FAFF", border: "1px solid #D8E9F7", display: "flex", gap: 14, alignItems: "center" },
  goalVisual: { width: 54, height: 54, borderRadius: 16, background: "#EAF4FF", display: "grid", placeItems: "center", fontSize: 30 },
  goalTitle: { fontFamily: P, fontWeight: 900, color: "#0D2137", fontSize: 15 },
  goalText: { fontFamily: P, color: "#607D8B", fontSize: 12, lineHeight: 1.5, marginTop: 4 },
  hearInstruction: { minHeight: 46, padding: "10px 14px", borderRadius: 13, border: "1px solid #BFD4E7", background: "#fff", color: "#1565C0", fontFamily: P, fontWeight: 800, cursor: "pointer" },
  instructionRow: { marginTop: 20, padding: 18, borderRadius: 18, background: "#FFFDF2", border: "1px solid #F4E7A6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontFamily: P, color: "#3F4A22", fontSize: 18 },
  stepCounter: { fontSize: 11, color: "#71805A", marginTop: 5 },
  audioCircle: { width: 52, height: 52, borderRadius: "50%", border: "0", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,.08)", fontSize: 22, cursor: "pointer" },
  feedback: { marginTop: 14, padding: 14, borderRadius: 14, background: "#EAF7EC", color: "#246B37", fontFamily: P, fontWeight: 800, textAlign: "center" },
  questionCard: { marginTop: 18, padding: 22, borderRadius: 20, background: "#F8FBFF", border: "1px solid #DDEAF5", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" },
  questionText: { flex: 1, minWidth: 220, fontFamily: P, fontWeight: 900, color: "#0D2137", fontSize: 24, lineHeight: 1.3 },
  optionGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14, marginTop: 16 },
  visualCard: { minHeight: 150, padding: 16, borderRadius: 18, border: "2px solid #D8E4EF", background: "#fff", fontFamily: P, cursor: "pointer", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", touchAction: "manipulation" },
  visualCardSelected: { borderColor: "#1565C0", background: "#F0F7FF", boxShadow: "0 0 0 3px rgba(21,101,192,.1)" },
  visualCardDisabled: { opacity: .48, cursor: "default" },
  visualTop: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  visualLabel: { fontSize: 17, fontWeight: 900, color: "#0D2137" },
  smallText: { fontSize: 11, color: "#607D8B", maxWidth: 250, lineHeight: 1.35 },
  audioButton: { width: 46, height: 46, borderRadius: "50%", border: "1px solid #C7D9E9", background: "#F5FAFF", cursor: "pointer", fontSize: 19 },
  audioButtonCompact: { width: 44, height: 44 },
  sequenceAnswer: { minHeight: 112, marginTop: 18, padding: 14, borderRadius: 18, background: "#F8FBFF", border: "1px dashed #BFD4E7", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 },
  sequenceChip: { display: "flex", alignItems: "center", gap: 7, padding: "9px 12px", borderRadius: 14, background: "#EAF4FF", color: "#0D2137", fontFamily: P, fontSize: 12, fontWeight: 800 },
  emptyHint: { width: "100%", textAlign: "center", color: "#607D8B", fontFamily: P, fontSize: 13 },
  twoColumns: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 18 },
  columnTitle: { fontFamily: P, fontSize: 11, fontWeight: 900, color: "#607D8B", marginBottom: 8 },
  memoryGrid: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14, marginTop: 18 },
  memoryCard: { minHeight: 150, borderRadius: 18, border: "2px solid #D8E4EF", background: "#1565C0", color: "#fff", fontFamily: P, fontWeight: 800, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 10, touchAction: "manipulation" },
  memoryCardOpen: { background: "#fff", color: "#0D2137" },
  binCard: { minHeight: 160, borderRadius: 20, border: "2px dashed #BFD4E7", background: "#F8FBFF", fontFamily: P, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#0D2137" },
  binCardReady: { borderColor: "#1565C0", background: "#EFF7FF", boxShadow: "0 0 0 3px rgba(21,101,192,.08)" },
  supportBar: { marginTop: 20, padding: 13, borderRadius: 14, background: "#F7FAFD", border: "1px solid #E0EAF2", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", fontFamily: P, color: "#607D8B", fontSize: 12 },
  helpButton: { minHeight: 44, padding: "9px 14px", borderRadius: 12, border: "1px solid #C8D8E7", background: "#fff", color: "#1565C0", fontFamily: P, fontWeight: 800, cursor: "pointer" },
};
