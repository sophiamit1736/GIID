const ActivityResult = require("../models/ActivityResult");
const LearningModule = require("../models/LearningModule");
const Student = require("../models/Student");
const { predictForStudent } = require('../services/mlServiceClient');
const { calculateALPI, recalculateALPI, calculatePerformanceMetrics } = require('../services/alpiService');

// Save a completed learning activity and its performance signals.
const saveResult = async (req, res) => {
  try {
    const {
      student, activityName, moduleId, gameId, domain, level,
      totalQuestions, correctAnswers, score, accuracy, timeTaken,
      attempts, helpRequests, gameType, evidenceType, completionRate, efficiencyScore, timeLimit, completedItems,
      stepResults = [],
      facpItemCodes = [], sessionId = "", dataSource = "prototype", isDemoData = false,
    } = req.body;

    if (!student || !activityName) return res.status(400).json({ message: 'student and activityName are required.' });
    if (gameType && gameType !== 'module' && !moduleId) {
      return res.status(400).json({ message: 'Adaptive game results must reference the Learning Module they practise.' });
    }

    const learner = await Student.findById(student).select('facpScore facpApplicableItems facpFunctionalLevel').lean();
    if (!learner) return res.status(404).json({ message: 'Student not found.' });

    const total = Math.max(0, Math.floor(Number(totalQuestions || 0)));
    if (total < 1) return res.status(400).json({ message: 'totalQuestions must be at least 1 for a completed learning activity.' });

    const metrics = calculatePerformanceMetrics({
      totalQuestions: total,
      correctAnswers: Number(correctAnswers || 0),
      completedItems: completedItems == null ? total : Number(completedItems),
      timeTaken: Number(timeTaken || 0),
      timeLimit: Number(timeLimit || 0),
      attempts: Number(attempts || 1),
      helpRequests: Number(helpRequests || 0),
    });

    const safeAccuracy = metrics.accuracy;
    const safeCompletion = metrics.completionRate;
    const safeEfficiency = metrics.efficiencyScore;
    const performanceIndex = metrics.performanceIndex;

    const normalizedSource = ["prototype", "institute", "demo"].includes(String(dataSource))
      ? String(dataSource)
      : "prototype";

    const result = await ActivityResult.create({
      student, teacher: req.user.id, sessionId: sessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, dataSource: isDemoData ? "demo" : (dataSource === "institute" ? "institute" : "prototype"), isDemoData: Boolean(isDemoData), activityName, gameId: gameId || '', moduleId: moduleId || '', domain: domain || 'General',
      sessionId: String(sessionId || "").trim(),
      dataSource: normalizedSource,
      isDemoData: Boolean(isDemoData) || normalizedSource === "demo",
      level: level || 'Beginner', totalQuestions: total, correctAnswers: metrics.correctAnswers,
      wrongAnswers: Math.max(0, total - metrics.correctAnswers),
      score: safeAccuracy, accuracy: safeAccuracy, timeTaken: metrics.timeTaken, timeLimit: metrics.timeLimit,
      attempts: metrics.attempts, helpRequests: metrics.helpRequests,
      gameType: gameType || 'module',
      evidenceType: evidenceType || (gameType && gameType !== 'module' ? 'game' : 'lesson'),
      completionRate: safeCompletion, efficiencyScore: safeEfficiency,
      performanceIndex, stepResults: Array.isArray(stepResults) ? stepResults : [],
      facpScore: Number(learner.facpScore || 0),
      facpItemCodes: Array.isArray(facpItemCodes) ? facpItemCodes.map(String).filter(Boolean).slice(0, 20) : [],
    });

    const alpiStats = await recalculateALPI(student);

    res.status(201).json({
      result,
      alpi: alpiStats.alpi,
      calculation: {
        performanceIndex: '55% accuracy + 30% efficiency + 15% completion; efficiency = 60% time efficiency + 40% independence.',
        alpi: 'Recency-weighted average of the latest 10 activity Performance Index values; newest activity has the highest weight.',
        activitiesIncluded: alpiStats.activitiesIncluded,
        recentWindow: alpiStats.recentWindow,
        facp: 'FACP baseline is stored separately and is not overwritten by activity performance.',
      },
    });
  } catch (err) {
    console.error('saveResult error:', err);
    res.status(500).json({ message: err.message });
  }
};

const getStudentResults = async (req, res) => {
  try {
    const results = await ActivityResult.find({
      student: req.params.studentId,
    })
      .sort({ createdAt: -1 })
      .populate("student", "name studentCode");

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Adaptive summary used by the learner/teacher UI.
const getAdaptiveSummary = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const mode = req.query.mode === 'game' ? 'game' : 'module';
    const [results, student] = await Promise.all([
      ActivityResult.find({ student: studentId }).sort({ completedAt: -1, createdAt: -1 }).lean(),
      Student.findById(studentId).select('facpScore facpApplicableItems alpiScore learningLevel').lean(),
    ]);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const alpi = calculateALPI(results);
    if (Number(student.alpiScore || 0) !== alpi) await Student.findByIdAndUpdate(studentId, { alpiScore: alpi });

    if (!results.length) {
      const ml = await predictForStudent(studentId, { mode });
      const first = ml.nextActivity;
      return res.json({
        alpi: 0,
        totalActivities: 0,
        domainMastery: [],
        latest: null,
        readiness: Number(student.facpApplicableItems || 0) > 0 ? Math.round(Number(student.facpScore || 0)) : 0,
        recommendation: first
          ? {
              type: mode === 'game' ? 'game' : 'baseline',
              activityMode: mode,
              title: mode === 'game' ? `Play next game: ${first.title}` : `Start with: ${first.title}`,
              reason: ml.reason || 'Start with an active learning module appropriate for the learner.',
              moduleId: first.moduleId,
              model: ml.model,
              confidence: ml.confidence,
              difficulty: ml.recommendedDifficulty,
            }
          : mode === 'game'
            ? { type: 'game-generation', activityMode: 'game', title: 'Generate the next recommended game', reason: 'No approved playable game is available for this learner yet.', moduleId: '' }
            : { type: 'baseline', title: 'No active learning activity available', reason: 'Create or activate a learning module first.', moduleId: '' },
        mlPrediction: ml,
        calculation: { formula: 'ALPI = recency-weighted mean of activity Performance Index (latest 10)', activitiesIncluded: 0 },
      });
    }

    const domainMap = new Map();
    for (const r of results) {
      const domain = r.domain || 'General';
      const current = domainMap.get(domain) || { sum: 0, count: 0 };
      current.sum += Number(r.performanceIndex ?? r.accuracy ?? 0);
      current.count += 1;
      domainMap.set(domain, current);
    }
    const domainMastery = Array.from(domainMap.entries()).map(([domain, v]) => ({
      domain, mastery: Math.round(v.sum / v.count), activities: v.count,
    }));

    const facp = Number(student.facpScore || 0);
    const hasFacp = Number(student.facpApplicableItems || 0) > 0;
    const readiness = hasFacp ? Math.round(alpi * 0.60 + facp * 0.40) : alpi;
    const ml = await predictForStudent(studentId, { mode });

    let recommendation;
    if (ml.nextActivity) {
      const difficulty = ml.recommendedDifficulty || 'Beginner';
      recommendation = {
        type: mode === 'game' ? 'game' : (difficulty === 'Advanced' ? 'advance' : difficulty === 'Intermediate' ? 'practice' : 'support'),
        activityMode: mode,
        title: mode === 'game' ? `Next recommended game: ${ml.nextActivity.title}` : `Next activity: ${ml.nextActivity.title}`,
        reason: ml.reason || (mode === 'game' ? "Recommended from the learner's current FACP, ALPI and recent game performance." : 'Adaptive recommendation based on FACP baseline and learning performance.'),
        moduleId: ml.nextActivity.moduleId, model: ml.model, confidence: ml.confidence,
        difficulty,
      };
    } else {
      recommendation = mode === 'game'
        ? { type: 'game-generation', activityMode: 'game', title: 'Generate the next recommended game', reason: 'No approved playable game is available for this learner yet.', moduleId: '' }
        : { type: 'baseline', title: 'No next activity available', reason: 'No active learning module is available.', moduleId: '' };
    }

    res.json({
      alpi, totalActivities: results.length, domainMastery, latest: results[0],
      readiness, activityMode: mode,
      calculation: {
        formula: 'ALPI = recency-weighted average of the latest 10 activity Performance Index values',
        performanceIndexFormula: '55% accuracy + 30% efficiency + 15% completion',
        activitiesIncluded: results.length,
        facpRelationship: hasFacp ? 'FACP remains the baseline; readiness blends 60% ALPI + 40% FACP for recommendation context.' : 'No FACP baseline yet; readiness follows ALPI.',
      },
      performanceFeatures: {
        accuracy: Number(results[0].accuracy || 0), completionRate: Number(results[0].completionRate || 0),
        efficiencyScore: Number(results[0].efficiencyScore || 0), performanceIndex: Number(results[0].performanceIndex || 0),
        helpRequests: Number(results[0].helpRequests || 0), timeTaken: Number(results[0].timeTaken || 0), facpScore: facp,
      },
      recommendation, mlPrediction: ml,
    });
  } catch (err) {
    console.error('getAdaptiveSummary error:', err);
    res.status(500).json({ message: err.message });
  }
};


const getAllResults = async (req, res) => {
  try {
    const results = await ActivityResult.find({}).sort({ createdAt: -1 }).limit(500).populate("student", "name studentCode").lean();
    res.json(results);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAnalytics = async (req, res) => {
  try {
    const results = await ActivityResult.find({}).sort({ createdAt: 1 }).populate("student", "name studentCode age learningLevel").lean();
    const students = await Student.find({ status: "Active" }).select("name studentCode age learningLevel alpiScore facpScore").sort({ name: 1 }).lean();
    const totalActivities = results.length;
    const avgAccuracy = totalActivities ? Math.round(results.reduce((s, r) => s + Number(r.accuracy || 0), 0) / totalActivities) : 0;
    const completedStudents = new Map();
    results.forEach(r => { const id = String(r.student?._id || r.student || ""); if (!completedStudents.has(id)) completedStudents.set(id, []); completedStudents.get(id).push(r); });
    const studentProgress = students.map(st => ({
      id: st._id, name: st.name, studentCode: st.studentCode, age: st.age, learningLevel: st.learningLevel,
      alpi: Number(st.alpiScore || 0), facp: Number(st.facpScore || 0), activities: (completedStudents.get(String(st._id)) || []).length,
      accuracy: (() => { const a=completedStudents.get(String(st._id))||[]; return a.length ? Math.round(a.reduce((x,r)=>x+Number(r.accuracy||0),0)/a.length) : 0; })()
    }));
    const domainMap = {};
    results.forEach(r => { const d=r.domain||"General"; domainMap[d] ||= {sum:0,count:0}; domainMap[d].sum += Number(r.accuracy||0); domainMap[d].count++; });
    const domainMastery = Object.entries(domainMap).map(([domain,v]) => ({ domain, mastery: Math.round(v.sum/v.count), activities:v.count }));
    const activityDistribution = {};
    results.forEach(r => { const k=r.activityName||"Unknown"; activityDistribution[k]=(activityDistribution[k]||0)+1; });
    const timelineMap = {};
    results.forEach(r => { const d=new Date(r.completedAt||r.createdAt); const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; timelineMap[key] ||= []; timelineMap[key].push(Number(r.accuracy||0)); });
    const timeline = Object.entries(timelineMap).map(([month, vals])=>({ month, accuracy: Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) }));
    res.json({ totalStudents: students.length, totalActivities, avgAccuracy, studentProgress, domainMastery, activityDistribution: Object.entries(activityDistribution).map(([name,value])=>({name,value})), timeline });
  } catch (err) { console.error("getAnalytics error:", err); res.status(500).json({message: err.message}); }
};

const getReport = async (req,res)=>{
 try{
  const {studentId,from,to}=req.query; const filter={}; if(studentId&&studentId!=='all')filter.student=studentId;
  if(from||to){filter.completedAt={}; if(from)filter.completedAt.$gte=new Date(`${from}T00:00:00`); if(to)filter.completedAt.$lte=new Date(`${to}T23:59:59.999`);}
  const results=await ActivityResult.find(filter).sort({completedAt:-1}).populate('student','name studentCode').lean();
  const students=await Student.find({status:'Active'}).select('name studentCode alpiScore facpScore learningLevel').lean();
  const reportStudents=studentId&&studentId!=='all'?students.filter(s=>String(s._id)===String(studentId)):students;
  res.json({results,students:reportStudents,generatedAt:new Date().toISOString()});
 }catch(e){res.status(500).json({message:e.message});}
};


// Deployment/data-collection status. This intentionally separates demo data
// from institute observations so the next-semester ML dataset can be built
// from real usage without accidentally training on demonstration records.

const exportCollectionCSV = async (req, res) => {
  try {
    const results = await ActivityResult.find({ isDemoData: { $ne: true } })
      .sort({ completedAt: -1 })
      .populate('student', 'name studentCode')
      .lean();
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Date','Student','Student Code','Activity','Module ID','Domain','Level','Game Type','Score','Accuracy','Attempts','Help Requests','Time (sec)','Completion %','Efficiency %','Performance Index','FACP Score','FACP Item Codes','Data Source','Session ID'];
    const rows = results.map(r => [
      new Date(r.completedAt || r.createdAt).toISOString(), r.student?.name || '', r.student?.studentCode || '', r.activityName || '', r.moduleId || '', r.domain || '', r.level || '', r.gameType || 'module', r.score ?? 0, r.accuracy ?? 0, r.attempts ?? 0, r.helpRequests ?? 0, r.timeTaken ?? 0, r.completionRate ?? 0, r.efficiencyScore ?? 0, r.performanceIndex ?? 0, r.facpScore ?? 0, Array.isArray(r.facpItemCodes) ? r.facpItemCodes.join(' | ') : '', r.dataSource || 'prototype', r.sessionId || ''
    ]);
    const csv = [header, ...rows].map(row => row.map(esc).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="learnable-student-data-${new Date().toISOString().slice(0,10)}.csv"`);
    res.send('\ufeff' + csv);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getCollectionSummary = async (req, res) => {
  try {
    const realFilter = { isDemoData: { $ne: true } };
    const [students, realResults, demoResults, latestReal] = await Promise.all([
      Student.countDocuments({ status: "Active" }),
      ActivityResult.find(realFilter)
        .select("student activityName domain accuracy performanceIndex completedAt dataSource")
        .sort({ completedAt: -1 })
        .lean(),
      ActivityResult.countDocuments({ isDemoData: true }),
      ActivityResult.findOne(realFilter)
        .sort({ completedAt: -1, createdAt: -1 })
        .select("completedAt createdAt")
        .lean(),
    ]);

    const uniqueStudents = new Set(realResults.map(r => String(r.student))).size;
    const avgAccuracy = realResults.length
      ? Math.round(realResults.reduce((sum, r) => sum + Number(r.accuracy || 0), 0) / realResults.length)
      : 0;

    const bySource = {};
    const byDomain = {};
    const byActivity = {};

    for (const r of realResults) {
      const source = r.dataSource || "prototype";
      bySource[source] = (bySource[source] || 0) + 1;

      const domain = r.domain || "General";
      byDomain[domain] = (byDomain[domain] || 0) + 1;

      const activity = r.activityName || "Unknown";
      byActivity[activity] = (byActivity[activity] || 0) + 1;
    }

    res.json({
      phase: "Prototype deployment and data collection",
      readyForInstituteCollection: true,
      activeStudents: students,
      realObservations: realResults.length,
      uniqueStudentsWithData: uniqueStudents,
      averageAccuracy: avgAccuracy,
      demoObservations: demoResults,
      latestRealObservationAt: latestReal?.completedAt || latestReal?.createdAt || null,
      bySource: Object.entries(bySource).map(([source, count]) => ({ source, count })),
      byDomain: Object.entries(byDomain).map(([domain, count]) => ({ domain, count })),
      byActivity: Object.entries(byActivity)
        .map(([activity, count]) => ({ activity, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12),
      datasetFields: [
        "student",
        "gameId",
        "sessionId",
        "dataSource",
        "activityName",
        "moduleId",
        "domain",
        "level",
        "score",
        "accuracy",
        "attempts",
        "helpRequests",
        "timeTaken",
        "completionRate",
        "efficiencyScore",
        "performanceIndex",
        "facpScore",
        "facpItemCodes",
        "stepResults",
        "completedAt",
      ],
      note: "Demo records are excluded from real observation counts. Institute observations are retained for next-semester ML/BKT analysis.",
    });
  } catch (err) {
    console.error("getCollectionSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  saveResult,
  getStudentResults,
  getAdaptiveSummary,
  getAnalytics,
  getAllResults,
  getReport,
  getCollectionSummary,
  exportCollectionCSV,
};
