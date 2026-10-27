const axios = require('axios');
const crypto = require('crypto');
const { retrieveKnowledge, formatContext } = require('./ragService');
const { ALL_ITEMS } = require('../config/facpConfig');
const VALID_FACP_CODES = new Set(ALL_ITEMS.map(x => x.id || x.code).filter(Boolean));

const GAME_TYPES = ['visual-sequence', 'matching', 'choice', 'drag-sort', 'memory'];
const MODULE_CATEGORIES = ['ADL', 'Academic', 'Motor', 'Language', 'Vocational', 'Therapeutic', 'Specialized Care'];

function cleanText(value, fallback = '') {
  if (value === null || value === undefined) return String(fallback ?? '').trim();
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (Array.isArray(value)) return value.map(v => cleanText(v)).filter(Boolean).join(', ').trim();
  if (typeof value === 'object') {
    const preferred = ['text', 'label', 'name', 'title', 'value', 'instruction', 'description', 'content'];
    for (const key of preferred) {
      if (value[key] !== undefined && value[key] !== null) {
        const out = cleanText(value[key]);
        if (out) return out;
      }
    }
    return '';
  }
  return String(value).trim();
}
const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || min));

function normalizeGameType(value, requested = []) {
  const requestedList = (Array.isArray(requested) ? requested : [requested]).map(x => cleanText(x).toLowerCase());
  const requestedType = requestedList.find(x => GAME_TYPES.includes(x) || x === 'sequence');
  if (requestedType) return requestedType === 'sequence' ? 'visual-sequence' : requestedType;
  const v = cleanText(value).toLowerCase();
  if (v === 'sequence') return 'visual-sequence';
  if (GAME_TYPES.includes(v)) return v;
  const first = (Array.isArray(requested) ? requested : []).map(String).map(x => x.toLowerCase());
  const found = first.find(x => GAME_TYPES.includes(x) || x === 'sequence');
  return found === 'sequence' ? 'visual-sequence' : (found || 'choice');
}

function normalizeModuleCategory(value, focus = '') {
  const raw = cleanText(value, focus).toLowerCase();
  const aliases = {
    adl: 'ADL', 'activities of daily living': 'ADL', personal: 'ADL', hygiene: 'ADL', grooming: 'ADL',
    academic: 'Academic', cognitive: 'Academic', 'academic / cognitive skills': 'Academic',
    motor: 'Motor', communication: 'Language', language: 'Language', social: 'Language',
    vocational: 'Vocational', therapeutic: 'Therapeutic', 'specialized care': 'Specialized Care',
  };
  return aliases[raw] || MODULE_CATEGORIES.find(x => x.toLowerCase() === raw) || 'ADL';
}

function normalizeSteps(steps = []) {
  if (!Array.isArray(steps)) return [];
  const generic = /^(learning step|step|look|understand|try|practice|learn|start|do it)\s*\d*$/i;
  return steps.map((s) => ({
    title: cleanText(s?.title),
    instruction: cleanText(s?.instruction || s?.action || s?.description),
    example: cleanText(s?.example || s?.exampleText),
    tamil: cleanText(s?.tamil || s?.tamilInstruction),
    emoji: cleanText(s?.emoji, '⭐'),
    image: cleanText(s?.image || s?.exampleImage),
    audioText: cleanText(s?.audioText, s?.instruction || s?.action || s?.description),
  })).filter(x => (x.title || x.instruction) && !generic.test(x.title || '') && !generic.test(x.instruction || '')).slice(0, 8);
}


function getDifficultyProfile(learningLevel, difficulty) {
  const level = ['Beginner', 'Intermediate', 'Advanced'].includes(String(learningLevel))
    ? String(learningLevel)
    : 'Beginner';
  const mapped = { Beginner: 'Easy', Intermediate: 'Medium', Advanced: 'Hard' };
  const effectiveDifficulty = mapped[level] || String(difficulty || 'Easy');
  const profiles = {
    Beginner: {
      difficulty: 'Easy', itemCount: 4, maxItems: 4, optionCount: 3,
      instruction: 'Use very simple one-step language, strong visual cues, familiar examples, minimal distractors and 4 playable items/questions.'
    },
    Intermediate: {
      difficulty: 'Medium', itemCount: 6, maxItems: 6, optionCount: 4,
      instruction: 'Use short but slightly more complex instructions, moderate distractors, 5-6 playable items/questions and require simple discrimination or ordering.'
    },
    Advanced: {
      difficulty: 'Hard', itemCount: 8, maxItems: 8, optionCount: 4,
      instruction: 'Use more varied examples, less prompting, 6-8 playable items/questions and stronger distractors while remaining appropriate to the target activity.'
    },
  };
  return { learningLevel: level, difficulty: effectiveDifficulty, ...profiles[level] };
}

function normalizeFunctionalLevel(value) {
  const allowed = ['Preprimary', 'Primary-I', 'Primary-II', 'Secondary', 'Prevocational-I', 'Prevocational-II', 'Vocational', 'Care Group'];
  const v = String(value || '').trim();
  return allowed.includes(v) ? v : '';
}

function validatePlayableGameConfig(gameConfig, activityType) {
  if (!gameConfig || typeof gameConfig !== 'object') throw new Error('AI did not return a game configuration.');
  const type = normalizeGameType(activityType);

  if (type === 'choice') {
    if (!Array.isArray(gameConfig.questions) || gameConfig.questions.length < 4) throw new Error('Choice game requires at least 4 questions.');
    gameConfig.questions.forEach((q, i) => {
      if (!q || !cleanText(q.text)) throw new Error(`Choice question ${i + 1} has no question text.`);
      if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 4) throw new Error(`Choice question ${i + 1} needs 3-4 options.`);
      const opts = q.options.map(x => cleanText(x)).filter(Boolean);
      if (new Set(opts.map(x => x.toLowerCase())).size !== opts.length) throw new Error(`Choice question ${i + 1} has duplicate options.`);
      const correct = Number(q.correct);
      if (!Number.isInteger(correct) || correct < 0 || correct >= opts.length) throw new Error(`Choice question ${i + 1} has an invalid correct answer.`);
    });
    return true;
  }

  if (type === 'matching' || type === 'memory') {
    if (!Array.isArray(gameConfig.pairs) || gameConfig.pairs.length < 4) throw new Error(`${type} game requires at least 4 pairs.`);
    const ids = new Set();
    gameConfig.pairs.forEach((p, i) => {
      if (!p || !cleanText(p.left) || !cleanText(p.right)) throw new Error(`${type} pair ${i + 1} needs left and right content.`);
      const id = cleanText(p.id, `pair-${i + 1}`);
      if (ids.has(id)) throw new Error(`${type} contains duplicate pair IDs.`);
      ids.add(id);
    });
    return true;
  }

  if (type === 'drag-sort') {
    if (!Array.isArray(gameConfig.bins) || gameConfig.bins.length < 2) throw new Error('Drag-sort needs at least 2 groups.');
    if (!Array.isArray(gameConfig.items) || gameConfig.items.length < 4) throw new Error('Drag-sort needs at least 4 items.');
    const bins = new Set(gameConfig.bins.map(b => cleanText(b.id)));
    gameConfig.items.forEach((item, i) => {
      if (!item || !cleanText(item.label || item.value)) throw new Error(`Drag-sort item ${i + 1} has no content.`);
      if (!bins.has(cleanText(item.correctBin))) throw new Error(`Drag-sort item ${i + 1} has an invalid correct group.`);
    });
    return true;
  }

  if (type === 'visual-sequence') {
    if (!Array.isArray(gameConfig.items) || gameConfig.items.length < 4) throw new Error('Sequence game needs at least 4 items.');
    if (!Array.isArray(gameConfig.shuffledItems) || gameConfig.shuffledItems.length !== gameConfig.items.length) throw new Error('Sequence game needs shuffledItems.');
    const ordered = gameConfig.items.map(x => cleanText(x.id));
    const shuffled = gameConfig.shuffledItems.map(x => cleanText(x.id));
    if (new Set(ordered).size !== ordered.length || ordered.slice().sort().join('|') !== shuffled.slice().sort().join('|')) throw new Error('Sequence shuffledItems must contain the same IDs.');
    if (ordered.join('|') === shuffled.join('|')) throw new Error('Sequence shuffledItems must differ from the correct order.');
    return true;
  }

  throw new Error(`Unsupported game type: ${type}`);
}


function validateLearningLevelComplexity(gameConfig, activityType, learningLevel) {
  const profile = getDifficultyProfile(learningLevel);
  const type = normalizeGameType(activityType);
  if (type === 'choice') {
    if (profile.learningLevel === 'Beginner' && gameConfig.questions.some(q => q.options.length > 3)) {
      throw new Error('Beginner choice game must use at most 3 options per question.');
    }
    return true;
  }
  if (type === 'matching' || type === 'memory') {
    if (gameConfig.pairs.length > profile.maxItems) throw new Error(`${profile.learningLevel} ${type} game has too many pairs for the learner level.`);
  }
  if (type === 'visual-sequence') {
    if (gameConfig.items.length > profile.maxItems) throw new Error(`${profile.learningLevel} sequence game has too many steps for the learner level.`);
  }
  if (type === 'drag-sort') {
    if (gameConfig.items.length > profile.maxItems) throw new Error(`${profile.learningLevel} sorting game has too many items for the learner level.`);
  }
  return true;
}

function firstNonEmptyText(...values) {
  for (const value of values) {
    const text = cleanText(value);
    if (text) return text;
  }
  return '';
}

function normalizeCorrectAnswer(q, options) {
  const rawIndex = q?.correctIndex ?? q?.correctAnswerIndex;
  if (Number.isInteger(Number(rawIndex))) {
    const n = Number(rawIndex);
    if (n >= 0 && n < options.length) return n;
  }

  // Models sometimes return the correct answer as text instead of an index.
  const answerText = firstNonEmptyText(q?.correctAnswer, q?.answer, q?.correctOption);
  if (answerText) {
    const wanted = answerText.toLowerCase();
    const found = options.findIndex(option => option.toLowerCase() === wanted);
    if (found >= 0) return found;
  }

  // Finally accept a numeric `correct`. The prompt specifies 0-based indices.
  // If it is outside that range, also accept the common 1-based form.
  const n = Number(q?.correct);
  if (Number.isInteger(n) && n >= 0 && n < options.length) return n;
  if (Number.isInteger(n) && n >= 1 && n <= options.length) return n - 1;
  return NaN;
}

function normalizeGameConfig(config, type) {
  const cfg = config && typeof config === 'object' ? JSON.parse(JSON.stringify(config)) : {};
  // Accept common LLM field aliases before strict validation. This is normalization,
  // not a hard-coded educational answer: the content still comes from Groq.
  if (type === 'choice' && !Array.isArray(cfg.questions)) cfg.questions = cfg.quiz?.questions || cfg.choices || [];
  if ((type === 'matching' || type === 'memory') && !Array.isArray(cfg.pairs)) cfg.pairs = cfg.matches || cfg.matchingPairs || [];
  if (type === 'drag-sort' && !Array.isArray(cfg.items)) cfg.items = cfg.sortItems || [];
  if (type === 'visual-sequence' && !Array.isArray(cfg.items)) cfg.items = cfg.sequenceItems || [];
  if (type === 'visual-sequence' && !Array.isArray(cfg.shuffledItems)) cfg.shuffledItems = cfg.shuffled || [];
  if (type === 'choice' && Array.isArray(cfg.questions)) {
    cfg.questions = cfg.questions.map((q, i) => {
      const options = Array.isArray(q?.options)
        ? q.options.map(x => cleanText(x)).filter(Boolean)
        : [];
      const text = firstNonEmptyText(q?.text, q?.question, q?.questionText, q?.prompt, q?.title, q?.question?.text);
      return {
        id: cleanText(q?.id, `q-${i + 1}`),
        text,
        shortText: firstNonEmptyText(q?.shortText, q?.shortLabel, text),
        tamil: firstNonEmptyText(q?.tamil, q?.questionTamil),
        audioText: firstNonEmptyText(q?.audioText, text),
        visualKey: cleanText(q?.visualKey, 'general-choice'),
        emoji: cleanText(q?.emoji, '👉'),
        options: options.map((option, optionIndex) => ({
          text: option,
          shortText: firstNonEmptyText(q?.optionMeta?.[optionIndex]?.shortText, option),
          tamil: cleanText(q?.optionMeta?.[optionIndex]?.tamil),
          audioText: firstNonEmptyText(q?.optionMeta?.[optionIndex]?.audioText, option),
          visualKey: cleanText(q?.optionMeta?.[optionIndex]?.visualKey, 'general-choice'),
          emoji: cleanText(q?.optionMeta?.[optionIndex]?.emoji, '🔹'),
        })),
        correct: normalizeCorrectAnswer(q, options),
        feedbackCorrect: cleanText(q?.feedbackCorrect, 'Great job!'),
        feedbackCorrectTamil: cleanText(q?.feedbackCorrectTamil),
        feedbackIncorrect: cleanText(q?.feedbackIncorrect, 'Try again.'),
        feedbackIncorrectTamil: cleanText(q?.feedbackIncorrectTamil),
      };
    });
  }
  if ((type === 'matching' || type === 'memory') && Array.isArray(cfg.pairs)) {
    cfg.pairs = cfg.pairs.map((p, i) => ({
      id: cleanText(p?.id, `pair-${i + 1}`),
      left: cleanText(p?.left),
      right: cleanText(p?.right),
      shortLeft: firstNonEmptyText(p?.shortLeft, p?.left),
      shortRight: firstNonEmptyText(p?.shortRight, p?.right),
      tamilLeft: cleanText(p?.tamilLeft),
      tamilRight: cleanText(p?.tamilRight),
      audioLeft: firstNonEmptyText(p?.audioLeft, p?.left),
      audioRight: firstNonEmptyText(p?.audioRight, p?.right),
      visualKeyLeft: cleanText(p?.visualKeyLeft, 'general'),
      visualKeyRight: cleanText(p?.visualKeyRight, 'general'),
      emoji: cleanText(p?.emoji, '⭐'),
      leftImage: cleanText(p?.leftImage),
      rightImage: cleanText(p?.rightImage),
    }));
  }
  if (type === 'drag-sort') {
    cfg.bins = Array.isArray(cfg.bins) ? cfg.bins.map((b, i) => ({ id: cleanText(b?.id, `bin-${i + 1}`), label: cleanText(b?.label, `Group ${i + 1}`), emoji: cleanText(b?.emoji, '📦') })) : [];
    cfg.items = Array.isArray(cfg.items) ? cfg.items.map((x, i) => {
      const label = cleanText(x?.label, x?.value);
      return { id: cleanText(x?.id, `item-${i + 1}`), label, shortLabel: firstNonEmptyText(x?.shortLabel, label), value: cleanText(x?.value, label), tamil: cleanText(x?.tamil), audioText: firstNonEmptyText(x?.audioText, label), visualKey: cleanText(x?.visualKey, 'general'), emoji: cleanText(x?.emoji, '⭐'), image: cleanText(x?.image), correctBin: cleanText(x?.correctBin) };
    }) : [];
  }
  if (type === 'visual-sequence') {
    const normalizeStep = (x, i) => {
      const label = cleanText(x?.label, x?.value);
      return { id: cleanText(x?.id, `step-${i + 1}`), label, shortLabel: firstNonEmptyText(x?.shortLabel, label), value: cleanText(x?.value, label), tamil: cleanText(x?.tamil), audioText: firstNonEmptyText(x?.audioText, label), visualKey: cleanText(x?.visualKey, 'general'), emoji: cleanText(x?.emoji, '⭐'), image: cleanText(x?.image) };
    };
    cfg.items = Array.isArray(cfg.items) ? cfg.items.map(normalizeStep) : [];
    cfg.shuffledItems = Array.isArray(cfg.shuffledItems) ? cfg.shuffledItems.map(normalizeStep) : [];
    if (cfg.items.length >= 4 && cfg.shuffledItems.length === cfg.items.length) {
      const sameOrder = cfg.items.every((item, i) => String(item.id) === String(cfg.shuffledItems[i]?.id));
      if (sameOrder) {
        // Preserve AI content but guarantee that the learner sees a genuine ordering challenge.
        cfg.shuffledItems = [cfg.shuffledItems[1], cfg.shuffledItems[0], ...cfg.shuffledItems.slice(2)];
      }
    }
  }
  return cfg;
}

function normalizeGeneratedActivity(parsed, input, ragChunks) {
  const activityType = normalizeGameType(parsed?.activityType || parsed?.gameConfig?.type, input.activityTypes);
  const suppliedConfig = parsed?.gameConfig || parsed?.game || parsed?.config || parsed;
  const gameConfig = normalizeGameConfig(suppliedConfig, activityType);
  validatePlayableGameConfig(gameConfig, activityType);
  validateLearningLevelComplexity(gameConfig, activityType, input.learningLevel || input.level || 'Beginner');

  const steps = []; // AI games are immediately playable; no separate learning-step screen.
  return {
    title: cleanText(parsed?.title, `${input.topic} Game`),
    description: cleanText(parsed?.description, `Adaptive ${activityType} game for ${input.topic}.`),
    category: normalizeModuleCategory(parsed?.category, input.focus),
    skill: cleanText(parsed?.skill, input.topic),
    facpDomain: cleanText(parsed?.facpDomain, input.focus),
    facpItemCodes: Array.isArray(parsed?.facpItemCodes) ? parsed.facpItemCodes.map(String).filter(x => VALID_FACP_CODES.has(x)) : [],
    level: ['Beginner', 'Intermediate', 'Advanced'].includes(parsed?.level) ? parsed.level : (input.level || 'Beginner'),
    learnerLearningLevel: input.learningLevel || input.level || 'Beginner',
    difficulty: getDifficultyProfile(input.learningLevel || input.level || 'Beginner', input.difficulty).difficulty,
    duration: clamp(parsed?.duration || 10, 5, 30),
    ageGroups: Array.isArray(parsed?.ageGroups) ? parsed.ageGroups.map(String).filter(Boolean) : [String(input.age || '')],
    objectives: Array.isArray(parsed?.objectives) ? parsed.objectives.map(String).filter(Boolean).slice(0, 6) : [`Practise ${input.topic}`],
    activityType,
    steps: steps.map(x => x.instruction).slice(0, 12),
    learningSteps: [],
    interactiveSteps: steps,
    adaptations: Array.isArray(parsed?.adaptations) ? parsed.adaptations.map(String).filter(Boolean).slice(0, 8) : ['Use visual prompts', 'Allow extra time', 'Repeat difficult items'],
    gameConfig: { ...gameConfig, type: activityType },
    ragSources: ragChunks.map(c => ({ sourceType: c.sourceType, title: c.title, domain: c.domain, skill: c.skill, sourceId: c.sourceId, retrievalScore: c.retrievalScore })),
    ragRetrievedCount: ragChunks.length,
    generatedBy: 'Groq', generationSource: 'groq-rag', generatedAt: new Date().toISOString(),
    coverEmoji: cleanText(parsed?.coverEmoji, '🎮'),
    generationNonce: input.generationNonce || '',
  };
}

function buildGameSchema(type) {
  switch (type) {
    case 'visual-sequence':
      return `gameConfig: {"type":"visual-sequence","items":[{"id":"step-1","label":"...","shortLabel":"...","tamil":"...","audioText":"...","visualKey":"...","emoji":"⭐","image":""},{"id":"step-2","label":"...","shortLabel":"...","tamil":"...","audioText":"...","visualKey":"...","emoji":"⭐","image":""},{"id":"step-3","label":"...","shortLabel":"...","tamil":"...","audioText":"...","visualKey":"...","emoji":"⭐","image":""},{"id":"step-4","label":"...","shortLabel":"...","tamil":"...","audioText":"...","visualKey":"...","emoji":"⭐","image":""}],"shuffledItems":[{"id":"step-3"},{"id":"step-1"},{"id":"step-4"},{"id":"step-2"}]}`;
    case 'matching':
      return `gameConfig: {"type":"matching","pairs":[{"id":"pair-1","left":"...","right":"...","shortLeft":"...","shortRight":"...","tamilLeft":"...","tamilRight":"...","audioLeft":"...","audioRight":"...","visualKeyLeft":"...","visualKeyRight":"...","emoji":"⭐"},{"id":"pair-2","left":"...","right":"..."},{"id":"pair-3","left":"...","right":"..."},{"id":"pair-4","left":"...","right":"..."}]}`;
    case 'memory':
      return `gameConfig: {"type":"memory","pairs":[{"id":"pair-1","left":"...","right":"...","shortLeft":"...","shortRight":"...","tamilLeft":"...","tamilRight":"...","audioLeft":"...","audioRight":"...","visualKeyLeft":"...","visualKeyRight":"...","emoji":"⭐"},{"id":"pair-2","left":"...","right":"..."},{"id":"pair-3","left":"...","right":"..."},{"id":"pair-4","left":"...","right":"..."}]}`;
    case 'drag-sort':
      return `gameConfig: {"type":"drag-sort","bins":[{"id":"bin-1","label":"Group A","tamil":"","emoji":"📦"},{"id":"bin-2","label":"Group B","tamil":"","emoji":"📦"}],"items":[{"id":"item-1","label":"...","shortLabel":"...","tamil":"...","audioText":"...","visualKey":"...","emoji":"⭐","correctBin":"bin-1"},{"id":"item-2","label":"...","correctBin":"bin-2"},{"id":"item-3","label":"...","correctBin":"bin-1"},{"id":"item-4","label":"...","correctBin":"bin-2"}]}`;
    default:
      return `gameConfig: {"type":"choice","questions":[{"id":"q1","text":"...","shortText":"...","tamil":"...","audioText":"...","visualKey":"...","emoji":"👉","options":["...","...","..."],"optionMeta":[{"tamil":"...","audioText":"...","visualKey":"...","emoji":"🔹"},{"tamil":"...","audioText":"...","visualKey":"...","emoji":"🔹"},{"tamil":"...","audioText":"...","visualKey":"...","emoji":"🔹"}],"correct":0},{"id":"q2","text":"...","options":["...","...","..."],"correct":0},{"id":"q3","text":"...","options":["...","...","..."],"correct":0},{"id":"q4","text":"...","options":["...","...","..."],"correct":0}]}`;
  }
}

function buildPrompts(input, referenceText) {
  const requestedType = normalizeGameType('', input.activityTypes);
  const typeInstruction = requestedType
    ? `The teacher explicitly requested game type: ${requestedType}. You MUST return activityType exactly "${requestedType}" and gameConfig.type exactly "${requestedType}". Do not substitute choice or another type.`
    : 'No game type was requested. Choose exactly one supported type.';
  const profile = getDifficultyProfile(input.learningLevel || input.level || 'Beginner', input.difficulty);
  const systemPrompt = `You are the game-design engine inside GIID LearnAble. Create ONE fully playable educational GAME for the learner. Do not create a generic lesson. The React renderer already supports only visual-sequence, matching, choice, drag-sort and memory.

Ground the target skill in the retrieved repository context. The TARGET LEARNING MODULE is authoritative. Every question, pair, sequence step and sorting item must directly teach/practise that target. Never switch to another ADL, academic or hygiene topic. Never invent FACP codes. Never invent URLs. Images are optional and must never be required for play. Use simple English and Tamil. Every playable element MUST include a shortLabel, audioText and Tamil text when a natural translation exists. Use a visualKey/emoji that represents the concrete concept. Do not require reading long sentences to play. Never rely on colour alone.

ACCESSIBLE GAME DESIGN: Use large-target, tap-first interactions. No countdown is required. Keep each instruction to one short sentence. Prefer one action per tap. Wrong answers should allow retry rather than immediately ending the round. Visuals and audio are support, not decoration.

LEARNING LEVEL IS A HARD GAME-DIFFICULTY CONSTRAINT:
- Learner learning level: ${profile.learningLevel}
- Game difficulty: ${profile.difficulty}
- ${profile.instruction}
Never generate a harder or more complex game than this learner level.

${typeInstruction}

STRICT GAME RULES:
- visual-sequence: Beginner=4 items, Intermediate=6 items, Advanced=8 items. Every item has a unique id. shuffledItems must contain exactly the same ids in a DIFFERENT order.
- matching: Beginner=4 pairs, Intermediate=6 pairs, Advanced=8 pairs. Each pair has a unique id and plain-string left/right values.
- choice: exactly 4 questions. Beginner=3 options per question; Intermediate/Advanced=4 options. correct is a 0-based integer.
- drag-sort: Beginner=4 items, Intermediate=6 items, Advanced=8 items; at least 2 bins. Every item.correctBin MUST exactly equal one bin.id.
- memory: Beginner=4 pairs, Intermediate=6 pairs, Advanced=8 pairs. Each pair has left/right values that form a meaningful recall/matching pair. Do NOT make memory cards from step numbers or generic Step 1/Step 2 labels.
- The game must directly exercise the selected module's stated objectives/steps. Never substitute another activity because it is easier to generate.

Return ONLY valid JSON. Do not wrap JSON in markdown. Every generation must be a new playable game instance; vary questions/items/pairs while keeping the same target skill. gameConfig is mandatory and is the complete playable game. The game itself must clearly explain what the learner should do. Do not output a separate learningSteps lesson. Do not reveal the game's correct answers or exact ordered solution before the learner finishes. Do not output video URLs.`;
  const variationNonce = input.generationNonce || crypto.randomUUID();
  const userPrompt = `Learner profile:
Age: ${input.age ?? 'not available'}
Learning level: ${profile.learningLevel}
Game difficulty: ${profile.difficulty}
FACP functional level: ${input.facpFunctionalLevel || 'not available'}
FACP domain: ${input.focus || 'General'}
Target skill: ${input.topic || 'Learning skill'}
FACP item codes: ${(input.facpItemCodes || []).join(', ') || 'none supplied'}
Recent performance: ${input.recentPerformance ?? 'not available'}
ALPI: ${input.alpi ?? 0}
FACP current score: ${input.facpScore ?? 0}
TARGET LEARNING MODULE (must stay on this topic): ${input.targetLearningModuleTitle || 'Use the supplied target skill.'}
TARGET MODULE SKILL: ${input.targetLearningModuleSkill || input.topic || 'not available'}
Target module description: ${input.targetLearningModuleDescription || 'not available'}
Target module objectives: ${(input.targetLearningModuleObjectives || []).join(' | ') || 'not available'}
Target module steps: ${(input.targetLearningModuleSteps || []).join(' | ') || 'not available'}
Target module activity type: ${input.targetLearningModuleActivityType || 'not available'}
Target module FACP levels: ${(input.targetLearningModuleFacpLevels || []).join(', ') || 'not available'}
Recent generated game titles to avoid repeating: ${(input.recentGeneratedGameTitles || []).join(' | ') || 'none'}
Recent generated game skills to vary when possible: ${(input.recentGeneratedGameSkills || []).join(' | ') || 'none'}

Retrieved repository context:
${referenceText || 'No matching repository text. Stay within the supplied target skill.'}

Create age-appropriate, meaningful game content. ${typeInstruction}
Set the JSON skill field to the target module skill when possible. The playable game content must use the concrete actions/concepts from the target module objectives and steps, even if the game title uses a natural learner-friendly phrase.

Generation variation token: ${variationNonce}. Produce a genuinely NEW set of game questions/items/pairs compared with previous games; do not merely rename the same content. Do NOT reuse the same examples from recent games. Stay strictly within the target module.

Expected gameConfig shape for this request:
${buildGameSchema(requestedType)}`;
  return { systemPrompt, userPrompt };
}

async function callGroq(apiKey, systemPrompt, userPrompt, maxTokens = 1800) {
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.15,
        response_format: { type: 'json_object' },
        max_tokens: maxTokens,
      }, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 90000,
      });
      return JSON.parse(response.data?.choices?.[0]?.message?.content || '{}');
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status === 429 && attempt < maxAttempts) {
        const retryAfter = Number(error?.response?.headers?.['retry-after']);
        const waitSeconds = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 20) : Math.min(3 * attempt, 8);
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
        continue;
      }
      throw error;
    }
  }
  throw lastError || new Error('Groq generation failed.');
}

async function repairGame(apiKey, activity, input, validationMessage) {
  const requestedType = normalizeGameType('', input.activityTypes);
  const type = requestedType || normalizeGameType(activity?.activityType || activity?.gameConfig?.type);
  const profile = getDifficultyProfile(input.learningLevel || input.level || 'Beginner', input.difficulty);
  const system = `You are a strict JSON game repair engine for GIID LearnAble. Repair ONLY the playable game configuration. Keep the educational topic and meaning. The target module/skill is authoritative; do not switch topics. Return ONLY JSON. The required type is "${type}". Learner level is ${profile.learningLevel}; difficulty is ${profile.difficulty}. Never make the repaired game harder than this level. No videos or URLs.`;
  const user = `Required game type: ${type}\nLEARNER LEVEL: ${profile.learningLevel}\nGAME DIFFICULTY: ${profile.difficulty}\nTARGET LEARNING MODULE: ${input.targetLearningModuleTitle || input.topic || 'selected skill'}\nTARGET SKILL: ${input.targetLearningModuleSkill || input.topic || 'selected skill'}\nTARGET DESCRIPTION: ${input.targetLearningModuleDescription || 'not available'}\nTARGET OBJECTIVES: ${(input.targetLearningModuleObjectives || []).join(' | ')}\nTARGET STEPS: ${(input.targetLearningModuleSteps || []).join(' | ')}\nValidation error: ${validationMessage}\nCurrent activity JSON:\n${JSON.stringify(activity).slice(0, 12000)}\n\nReturn the corrected complete activity JSON. The following shape is mandatory:\n${buildGameSchema(type)}\nFor Beginner use exactly 4 items/pairs where the game type permits and 3 choices for choice; Intermediate use 6; Advanced use 8. For visual-sequence, shuffledItems must be a different order. For drag-sort, every correctBin must equal a bin id. For choice, correct is 0-based. Do not include learningSteps; the game must be immediately playable and self-explanatory.`;
  return callGroq(apiKey, system, user, 1500);
}

async function generateActivity(input) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) { const e = new Error('GROQ_API_KEY is not configured. Add your Groq key to backend/.env.'); e.statusCode = 503; throw e; }

  const query = `${input.targetLearningModuleTitle || ''} ${input.targetLearningModuleDescription || ''} ${input.topic || ''} ${input.focus || ''} ${input.level || ''} ${input.difficulty || ''} ${(input.facpItemCodes || []).join(' ')}`;
  const ragChunks = await retrieveKnowledge(query, {
    domain: input.focus || '', skill: input.topic || '', limit: 2, studentId: input.studentId || '',
  });
  if (!ragChunks.length) { const e = new Error('RAG knowledge base is empty. Run npm run seed:rag before generating AI games.'); e.statusCode = 503; throw e; }

  const referenceText = formatContext(ragChunks, 1800);
  const generationNonce = input.generationNonce || crypto.randomUUID();
  const { systemPrompt, userPrompt } = buildPrompts({ ...input, generationNonce }, referenceText);
  let parsed;
  let validationError = '';

  try {
    parsed = await callGroq(apiKey, systemPrompt, userPrompt, 1250);
    const normalized = normalizeGeneratedActivity(parsed, { ...input, generationNonce }, ragChunks);
    assertGeneratedTopicAlignment(normalized, input);
    return normalized;
  } catch (error) {
    if (error?.response?.status === 429) {
      const retryAfter = error?.response?.headers?.['retry-after'];
      const e = new Error(retryAfter
        ? `Groq rate limit reached. Retry after approximately ${retryAfter} seconds.`
        : 'Groq rate limit reached. Please wait briefly and generate again.');
      e.statusCode = 429;
      throw e;
    }
    if (error?.response?.status === 413) {
      const e = new Error('Groq rejected the AI game request as too large. The LearnAble request has been minimized; restart the backend and try again.');
      e.statusCode = 413;
      throw e;
    }
    validationError = error?.message || 'The generated JSON was invalid.';
  }

  // Only repair validation/format problems. A 429 is never followed by
  // multiple additional API calls, which used to make the rate-limit problem worse.
  try {
    const repaired = await repairGame(apiKey, parsed || {}, input, validationError);
    const normalizedRepair = normalizeGeneratedActivity(repaired, { ...input, generationNonce }, ragChunks);
    assertGeneratedTopicAlignment(normalizedRepair, input);
    return normalizedRepair;
  } catch (error) {
    if (error?.response?.status === 429) {
      const e = new Error('Groq rate limit reached while repairing the generated game. Please wait briefly and try again.');
      e.statusCode = 429;
      throw e;
    }
    validationError = error?.message || validationError;
    console.error("AI generation failure details:", {
  message: error.message,
  status: error.response?.status,
  responseData: error.response?.data
});
  }

  throw new Error(`AI game generation failed after validation and repair. ${validationError}`);
}

function facpDomainToModuleCategory(domain = '') {
  const map = {
    personal: ['ADL', 'Specialized Care', 'Motor', 'Therapeutic'],
    academic: ['Academic'],
    social: ['Language', 'Therapeutic'],
    occupational: ['Vocational'],
    recreational: ['Therapeutic', 'Language'],
  };
  return map[String(domain).trim().toLowerCase()] || [];
}

function textTokens(value = '') {
  return new Set(String(value || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(x => x.length > 2));
}

function moduleRelevanceScore(module, targetDomain, weakItem, recentModuleIds, recentGameModuleIds, learningLevel, facpScore) {
  const targetCategories = facpDomainToModuleCategory(targetDomain);
  const targetText = `${weakItem?.instruction || ''} ${weakItem?.activity || ''} ${weakItem?.skill || ''}`;
  const query = textTokens(targetText);
  const moduleText = textTokens(`${module.title || ''} ${module.skill || ''} ${module.description || ''} ${(module.objectives || []).join(' ')}`);
  let score = 0;
  if (String(module.facpDomain || '').toLowerCase() === String(targetDomain || '').toLowerCase()) score += 100;
  if (targetCategories.includes(module.category)) score += 70;
  if (weakItem?.code && Array.isArray(module.facpItemCodes) && module.facpItemCodes.includes(weakItem.code)) score += 140;
  if (query.size) for (const t of query) if (moduleText.has(t)) score += 12;
  if (!recentModuleIds.has(String(module.moduleId))) score += 30;
  if (!recentGameModuleIds.has(String(module.moduleId))) score += 35;
  if (learningLevel && String(module.level || '') === String(learningLevel)) score += 35;
  const fs = Number(facpScore);
  if (Number.isFinite(fs)) {
    if (fs < 40 && module.level === 'Beginner') score += 20;
    else if (fs >= 75 && module.level === 'Advanced') score += 10;
  }
  return score;
}

function chooseAdaptiveGameType(module, recentTypes = []) {
  const text = `${module?.title || ''} ${module?.skill || ''} ${module?.description || ''} ${(module?.objectives || []).join(' ')}`.toLowerCase();
  const preferences = [];

  // Prefer a pedagogically natural interaction. Social/communication modules
  // use choice before sequence so the learner responds to a concrete situation
  // instead of reading/arranging long social-skill sentences.
  if (/social|emotion|choice|communication|language|concept|safety|receptive|expressive|greeting|turn taking|conversation|interaction/.test(text)) {
    preferences.push('choice');
  }
  if (/sequence|routine|steps|order|dressing|toilet|brushing|combing|drinking|eating|daily/.test(text)) {
    preferences.push('visual-sequence');
  }
  if (/colour|color|shape|alphabet|letter|number|numeracy|money|vocabulary|identify|recognition|tool|machine|object|animal|fruit|clothing/.test(text)) {
    preferences.push('matching');
  }
  if (/sort|sorting|category|classif|group|size|big|small|long|short/.test(text)) {
    preferences.push('drag-sort');
  }
  if (/memory|recall|picture|vocabulary/.test(text)) {
    preferences.push('memory');
  }

  // Remove duplicates while preserving the pedagogically preferred order.
  const ordered = [...new Set(preferences)];
  const uniqueRecent = new Set(recentTypes.map(x => String(x || '').toLowerCase()));
  const fresh = ordered.find(type => !uniqueRecent.has(type));
  if (fresh) return fresh;
  if (ordered.length) return ordered[0];

  // Generic modules still get a playable interaction, but never an arbitrary
  // memory game. Choice is the safest generic fallback.
  return uniqueRecent.has('choice') ? 'matching' : 'choice';
}

function assertGeneratedTopicAlignment(activity, input) {
  const moduleTitle = input.targetLearningModuleTitle || '';
  const moduleSkill = input.targetLearningModuleSkill || input.topic || '';
  const objectives = input.targetLearningModuleObjectives || [];
  const steps = input.targetLearningModuleSteps || [];
  const generatedHeader = `${activity.title || ''} ${activity.description || ''} ${activity.skill || ''}`.toLowerCase();
  const generatedContent = JSON.stringify(activity.gameConfig || {}).toLowerCase();

  // Do not require the generated title/skill to literally repeat words such as
  // "social" or "interaction". A valid game may use the concrete instructional
  // vocabulary instead (for example: "greet", "listen", "take a turn",
  // "respond", "say goodbye"). The old validator rejected these valid games.
  const stopWords = new Set([
    'learn','learning','practice','practise','activity','skills','skill','simple','basic','game',
    'the','and','with','from','this','that','your','you','use','using','into','then','step','steps','student',
    'a','an','to','of','for','on','in','or','is','are'
  ]);
  const titleSkillTokens = [...textTokens(`${moduleTitle} ${moduleSkill}`)]
    .filter(t => !stopWords.has(t));
  const anchorTokens = [...textTokens([...objectives, ...steps].join(' '))]
    .filter(t => !stopWords.has(t));

  // First validate the actual playable content against the module's objectives
  // and steps. This is the important curriculum-grounding check.
  const anchorHits = anchorTokens.filter(t => generatedContent.includes(t));
  const requiredAnchorHits = anchorTokens.length < 5 ? 1 : 2;

  // Header evidence is useful, but it is only a secondary signal. This allows
  // semantically correct games whose wording differs from the module title.
  const headerHits = titleSkillTokens.filter(t => generatedHeader.includes(t));
  const hasHeaderEvidence = headerHits.length >= 1;
  const hasStrongContentEvidence = anchorHits.length >= requiredAnchorHits;

  if (anchorTokens.length && !hasStrongContentEvidence) {
    throw new Error(`Generated game content is not sufficiently grounded in the selected module objectives/steps: ${moduleTitle || moduleSkill}.`);
  }

  // If the module has no useful objective/step vocabulary, fall back to a
  // lightweight header check rather than silently accepting an unrelated game.
  if (!anchorTokens.length && titleSkillTokens.length && !hasHeaderEvidence) {
    throw new Error(`Generated game skill does not match the selected module: ${moduleTitle || moduleSkill}.`);
  }

  return true;
}

async function generateAdaptiveActivityForStudent({ studentId, requestedType }) {
  const Student = require('../models/Student');
  const ActivityResult = require('../models/ActivityResult');
  const FACPAssessment = require('../models/FACPAssessment');
  const LearningModule = require('../models/LearningModule');
  const Game = require('../models/Game');
  const { normalizeGroupToFACPLevel } = require('../config/facpLevelMapper');
  const student = await Student.findById(studentId).lean();
  if (!student) throw new Error('Student not found.');

  const [results, facpRows, modules, recentGames] = await Promise.all([
    ActivityResult.find({ student: studentId }).sort({ completedAt: -1, createdAt: -1 }).limit(30).lean(),
    FACPAssessment.find({ student: studentId }).sort({ assessedAt: -1, createdAt: -1 }).limit(200).lean(),
    LearningModule.find({ status: 'Active', gameConfig: null }).select('moduleId title skill category facpDomain facpItemCodes facpLevels level activityType description objectives steps').lean(),
    Game.find({ generatedForStudent: studentId, status: 'Active' }).sort({ createdAt: -1 }).limit(12).select('gameId title skill activityType targetLearningModuleId').lean(),
  ]);

  // The same BKT predictor used by the adaptive recommendation endpoint also
  // drives student-aware AI game generation. This prevents the AI generator
  // from randomly choosing a topic after the ML decision has been made.
  const { predictForStudent } = require('./mlServiceClient');
  const bktPrediction = await predictForStudent(studentId, { mode: 'game' });

  const latestByCode = new Map();
  for (const assessment of facpRows) for (const item of assessment.items || []) if (!latestByCode.has(item.code)) latestByCode.set(item.code, { ...item, domain: assessment.domain });

  const domainStats = {};
  for (const item of latestByCode.values()) {
    if (item.status === 'NA') continue;
    const d = item.domain || 'General'; domainStats[d] ||= { pass: 0, total: 0 };
    domainStats[d].total += 1; if (item.status === '+' || item.status === 'C') domainStats[d].pass += 1;
  }
  const domains = Object.entries(domainStats).map(([domain, v]) => ({ domain, score: Math.round(v.pass / Math.max(1, v.total) * 100) })).sort((a, b) => a.score - b.score);

  const activityStats = {};
  for (const r of results) { const d = r.domain || 'General'; activityStats[d] ||= { sum: 0, n: 0 }; activityStats[d].sum += Number(r.performanceIndex ?? r.accuracy ?? 0); activityStats[d].n += 1; }
  const activityDomains = Object.entries(activityStats).map(([domain, v]) => ({ domain, score: Math.round(v.sum / v.n) })).sort((a, b) => a.score - b.score);

  const targetDomain = bktPrediction?.targetDomain && bktPrediction.targetDomain !== 'General'
    ? bktPrediction.targetDomain
    : (domains[0]?.domain || activityDomains[0]?.domain || modules[0]?.facpDomain || 'Personal');

  const recentTitles = new Set(results.slice(0, 15).map(r => String(r.activityName || '').trim().toLowerCase()).filter(Boolean));
  const recentModuleIds = new Set(results.slice(0, 15).map(r => String(r.moduleId || '')).filter(Boolean));
  const recentGameTitles = new Set(recentGames.map(g => String(g.title || '').trim().toLowerCase()).filter(Boolean));
  const recentGameSkills = new Set(recentGames.map(g => String(g.skill || '').trim().toLowerCase()).filter(Boolean));
  const recentGameModuleIds = new Set(recentGames.map(g => String(g.targetLearningModuleId || '')).filter(Boolean));
  const recentGameTypes = recentGames.map(g => String(g.activityType || '').toLowerCase()).filter(Boolean);

  const priority = { PP: 1, M: 2, VP: 3, GP: 4, '-': 5, NE: 6 };
  const weakItems = [...latestByCode.values()]
    .filter(x => String(x.domain || '').toLowerCase() === String(targetDomain).toLowerCase())
    .filter(x => x.status !== '+' && x.status !== 'NA')
    .sort((a, b) => (priority[a.status] || 99) - (priority[b.status] || 99));
  const weakestItem = weakItems[0] || null;

  const learningModules = modules.filter(m => Array.isArray(m.facpItemCodes) && m.facpItemCodes.length > 0 && Array.isArray(m.facpLevels) && m.facpLevels.length > 0 && !m.gameConfig);
  if (!learningModules.length) throw new Error('No active level-mapped learning modules are available. Run npm run backfill:module-facp-levels first.');

  // HARD FACP CURRICULUM FILTER.
  // FACP functional level determines which curriculum modules are eligible.
  // LearnAble's Beginner/Intermediate/Advanced learningLevel only controls
  // difficulty and must never be used as a substitute for FACP placement.
  const functionalLevel = student.facpFunctionalLevel || normalizeGroupToFACPLevel(student.group, student.age);
  const levelCandidates = functionalLevel
    ? learningModules.filter(m => m.facpLevels.includes(functionalLevel))
    : learningModules;

  if (functionalLevel && !levelCandidates.length) {
    throw new Error(`No learning modules are mapped to FACP functional level ${functionalLevel}. Run npm run backfill:module-facp-levels.`);
  }

  // If the BKT service suggests a module, only honour it when it belongs to the
  // student's FACP curriculum. A prediction can rank within the eligible set;
  // it cannot override the curriculum boundary.
  const predictedId = (results.length || facpRows.length)
    ? String(bktPrediction?.nextActivity?.moduleId || '')
    : '';
  const candidatePool = levelCandidates;
  const rankedModules = [...candidatePool].sort((a, b) => {
    const ap = predictedId && String(a.moduleId) === predictedId ? 80 : 0;
    const bp = predictedId && String(b.moduleId) === predictedId ? 80 : 0;
    return (bp + moduleRelevanceScore(b, targetDomain, weakestItem, recentModuleIds, recentGameModuleIds, student.learningLevel, student.facpScore))
      - (ap + moduleRelevanceScore(a, targetDomain, weakestItem, recentModuleIds, recentGameModuleIds, student.learningLevel, student.facpScore));
  });

  // Prefer unseen modules, then modules not used in recent games. If the level
  // curriculum is exhausted, rotate deterministically instead of always taking
  // the first seeded module.
  const freshCandidates = rankedModules.filter(m => !recentGameModuleIds.has(String(m.moduleId)) && !recentModuleIds.has(String(m.moduleId)));
  const gameFreshCandidates = rankedModules.filter(m => !recentGameModuleIds.has(String(m.moduleId)));
  const rotationSeed = [...String(studentId)].reduce((n, ch) => n + ch.charCodeAt(0), 0) + recentGames.length + results.length;
  const rotateAmong = (list) => {
    if (!list.length) return null;
    const topScore = moduleRelevanceScore(list[0], targetDomain, weakestItem, recentModuleIds, recentGameModuleIds, student.learningLevel, student.facpScore) + (predictedId && String(list[0].moduleId) === predictedId ? 80 : 0);
    const ties = list.filter(m => {
      const s = moduleRelevanceScore(m, targetDomain, weakestItem, recentModuleIds, recentGameModuleIds, student.learningLevel, student.facpScore) + (predictedId && String(m.moduleId) === predictedId ? 80 : 0);
      return s === topScore;
    });
    return ties[rotationSeed % ties.length];
  };
  const candidate = rotateAmong(freshCandidates) || rotateAmong(gameFreshCandidates) || rotateAmong(rankedModules);

  // Keep the selected target module's FACP codes primary; add weak-item codes
  // only when they belong to the same FACP level/domain.
  const candidateLevelItems = new Set(candidate.facpItemCodes || []);
  const alignedWeakItems = weakItems.filter(x => candidateLevelItems.has(x.code));

  const recentPerformance = results.length ? Math.round(results.slice(0, 10).reduce((s, r) => s + Number(r.performanceIndex ?? r.accuracy ?? 0), 0) / Math.min(results.length, 10)) : Number(student.alpiScore || 0);
  const alpi = Number(student.alpiScore || 0);
  const facpScore = Number(student.facpScore || 0);
  const level = ['Beginner', 'Intermediate', 'Advanced'].includes(student.learningLevel)
    ? student.learningLevel
    : (bktPrediction?.recommendedLevel || (recentPerformance >= 80 ? 'Advanced' : recentPerformance >= 60 ? 'Intermediate' : 'Beginner'));
  // The learner's learningLevel is authoritative for game difficulty. BKT/ALPI
  // may help choose the module, but they must not silently make a Beginner game Hard.
  const difficulty = { Beginner: 'Easy', Intermediate: 'Medium', Advanced: 'Hard' }[level] || 'Easy';
  const chosenGameType = requestedType ? normalizeGameType(requestedType) : chooseAdaptiveGameType(candidate, recentGameTypes);

  const generated = await generateActivity({
    studentId: String(student._id),
    topic: candidate?.skill || candidate?.title || weakestItem?.instruction || targetDomain,
    age: student.age, level, difficulty, focus: targetDomain,
    facpItemCodes: [...new Set([...(candidate?.facpItemCodes || []), ...alignedWeakItems.slice(0, 4).map(x => x.code)])].slice(0, 12), recentPerformance, alpi, facpScore,
    learningLevel: level, difficulty,
    facpFunctionalLevel: functionalLevel || '',
    targetLearningModuleId: candidate?.moduleId || '',
    targetLearningModuleTitle: candidate?.title || '',
    targetLearningModuleSkill: candidate?.skill || '',
    targetLearningModuleDescription: candidate?.description || '',
    targetLearningModuleObjectives: candidate?.objectives || [],
    targetLearningModuleSteps: candidate?.steps || [],
    targetLearningModuleActivityType: candidate?.activityType || '',
    targetLearningModuleFacpLevels: candidate?.facpLevels || [],
    recentGeneratedGameTitles: [...recentGameTitles].slice(0, 12),
    recentGeneratedGameSkills: [...recentGameSkills].slice(0, 12),
    generationNonce: crypto.randomUUID(),
    activityTypes: [chosenGameType],
  });

  generated.facpItemCodes = [...new Set([...(generated.facpItemCodes || []), ...(candidate?.facpItemCodes || []), ...alignedWeakItems.slice(0, 4).map(x => x.code)])].slice(0, 12);
  generated.facpDomain = candidate?.facpDomain || targetDomain;
  generated.generatedForStudent = String(student._id);
  generated.targetLearningModuleId = candidate?.moduleId || '';
  generated.targetLearningModuleTitle = candidate?.title || '';
  generated.targetLearningModuleFacpItemCodes = candidate?.facpItemCodes || [];
  generated.targetLearningModuleFacpLevels = candidate?.facpLevels || [];
  generated.facpFunctionalLevel = functionalLevel || '';
  generated.learnerLearningLevel = student.learningLevel || level;
  generated.difficulty = difficulty;
  generated.estimatedMastery = Number(bktPrediction?.estimatedMastery ?? 0);
  generated.generationReason = `Targets learning module ${candidate?.title || candidate?.skill || targetDomain}${alignedWeakItems[0] ? ` and FACP skill ${alignedWeakItems[0].code}` : ''}.`;
  generated.recommendationContext = {
    reason: alignedWeakItems[0]
      ? `Generated a game for ${candidate?.title || candidate?.skill}, aligned with support-needing FACP skill ${alignedWeakItems[0].code}.`
      : `Generated a game for the selected learning module ${candidate?.title || candidate?.skill || targetDomain}.`,
    targetDomain, functionalLevel, targetItem: alignedWeakItems[0] ? { code: alignedWeakItems[0].code, instruction: alignedWeakItems[0].instruction, status: alignedWeakItems[0].status } : null,
    recentPerformance, alpi, facpScore, learningLevel: level, difficulty,
    bktModel: bktPrediction?.model || 'BayesianKnowledgeTracing', estimatedMastery: bktPrediction?.estimatedMastery ?? null,
    previousActivitiesExcluded: [...recentTitles].slice(0, 10), recentGeneratedGamesExcluded: [...recentGameTitles].slice(0, 10), recentGameModuleIds: [...recentGameModuleIds].slice(0, 10), candidateModule: candidate?.title || null, gameType: chosenGameType,
  };
  return generated;
}

function fallbackActivity() { throw new Error('Fallback generation is disabled. Configure Groq and generate a real AI game.'); }

module.exports = { generateActivity, fallbackActivity, generateAdaptiveActivityForStudent, normalizeGeneratedActivity, validatePlayableGameConfig };
