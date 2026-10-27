const crypto = require("crypto");
const ModuleAssessment = require("../models/ModuleAssessment");
const LearningModule = require("../models/LearningModule");

function shuffleDeterministic(arr, seed) {
  const out = [...arr];
  let x = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    x = (1664525 * x + 1013904223) >>> 0;
    const j = x % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function makeItems(module) {
  const steps = (module.interactiveSteps || []).filter(s => s && (s.instruction || s.title));
  const usable = steps.slice(0, 10);
  if (usable.length < 4) return [];

  const items = [];
  const codes = Array.isArray(module.facpItemCodes) ? module.facpItemCodes : [];

  // 1) Identify a step from its picture.
  usable.slice(0, Math.min(4, usable.length)).forEach((step, i) => {
    const correct = step.instruction || step.title;
    const distractors = usable.filter((_, j) => j !== i).map(s => s.instruction || s.title).slice(0, 3);
    const options = [correct, ...distractors];
    const shuffled = shuffleDeterministic(options, i + 31);
    items.push({
      id: `identify-${i + 1}`,
      question: `Which instruction matches this step?`,
      tamil: step.tamil || "",
      options: shuffled,
      correctIndex: shuffled.indexOf(correct),
      image: step.image || "",
      facpItemCodes: codes[i] ? [codes[i]] : [],
    });
  });

  // 2) Ask what comes next for up to four transitions.
  usable.slice(0, Math.min(4, usable.length - 1)).forEach((step, i) => {
    const next = usable[i + 1];
    const correct = next.instruction || next.title;
    const distractors = usable.filter((_, j) => j !== i + 1).map(s => s.instruction || s.title).slice(0, 3);
    const options = shuffleDeterministic([correct, ...distractors], i + 101);
    items.push({
      id: `next-${i + 1}`,
      question: `What comes next after “${step.instruction || step.title}”?`,
      tamil: "அடுத்ததாக என்ன செய்ய வேண்டும்?",
      options,
      correctIndex: options.indexOf(correct),
      image: next.image || "",
      facpItemCodes: codes[i + 1] ? [codes[i + 1]] : [],
    });
  });

  return items.slice(0, 8);
}

async function ensureModuleAssessment(moduleId) {
  const module = await LearningModule.findOne({ moduleId, status: "Active", gameConfig: null }).lean();
  if (!module) throw new Error("Learning module not found.");

  const existing = await ModuleAssessment.findOne({ moduleId, status: "Active" }).lean();
  if (existing && existing.items.length >= existing.minimumItems) return existing;

  const items = makeItems(module);
  if (items.length < 6) throw new Error("This module needs at least 6 usable micro-steps before an assessment can be created.");

  const assessmentId = `ASSESS-${moduleId}-${crypto.createHash("sha1").update(JSON.stringify(items)).digest("hex").slice(0, 10)}`;
  return ModuleAssessment.findOneAndUpdate(
    { moduleId },
    {
      assessmentId,
      moduleId,
      title: `${module.title} — Learning Assessment`,
      instructions: "Look carefully and choose the answer that matches what you learned.",
      items,
      minimumItems: 6,
      status: "Active",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

module.exports = { ensureModuleAssessment };
