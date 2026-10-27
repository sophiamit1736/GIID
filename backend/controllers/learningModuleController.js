const LearningModule = require("../models/LearningModule");

// Get all modules
const getModules = async (req, res) => {
  try {
    const { category, level } = req.query;

    const filter = {
      status: "Active",
      gameConfig: null,
    };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (level && level !== "All") {
      filter.level = level;
    }

    const modules = await LearningModule.find(filter).sort({
      createdAt: -1,
    });

    res.json(modules);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch learning modules",
    });
  }
};


// Get single module
const getModule = async (req, res) => {
  try {
    const module = await LearningModule.findOne({
      moduleId: req.params.moduleId,
      status: "Active",
      gameConfig: null,
    });

    if (!module) {
      return res.status(404).json({
        message: "Learning module not found",
      });
    }

    res.json(module);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch learning module",
    });
  }
};


// Create module
const createModule = async (req, res) => {
  try {
    const body = req.body;
    const duplicate = await LearningModule.findOne({ title: new RegExp(`^${String(body.title || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), skill: body.skill });
    if (duplicate) return res.status(409).json({ message: 'Duplicate activity already exists.', module: duplicate });
    const module = await LearningModule.create(body);

    res.status(201).json(module);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// Update module
const updateModule = async (req, res) => {
  try {
    const body = req.body || {};
    if (body.title || body.skill) {
      const current = await LearningModule.findOne({ moduleId: req.params.moduleId }).lean();
      if (!current) return res.status(404).json({ message: "Learning module not found" });
      const title = String(body.title ?? current.title).trim();
      const skill = String(body.skill ?? current.skill).trim();
      const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const duplicate = await LearningModule.findOne({
        moduleId: { $ne: req.params.moduleId },
        title: new RegExp(`^${escaped}$`, 'i'),
        skill: new RegExp(`^${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      });
      if (duplicate) return res.status(409).json({ message: 'Duplicate activity already exists.', module: duplicate });
    }
    const module = await LearningModule.findOneAndUpdate(
      { moduleId: req.params.moduleId }, body, { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({
        message: "Learning module not found",
      });
    }

    res.json(module);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


const deleteModule = async (req, res) => {
  try {
    const module = await LearningModule.findOneAndDelete({ moduleId: req.params.moduleId });
    if (!module) return res.status(404).json({ message: 'Learning module not found' });
    res.json({ message: 'Learning module deleted', moduleId: req.params.moduleId });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getModules, getModule, createModule, updateModule, deleteModule };