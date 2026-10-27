const mongoose = require("mongoose");

const assessmentItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  tamil: { type: String, default: "" },
  options: { type: [String], default: [] },
  correctIndex: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  facpItemCodes: { type: [String], default: [] },
}, { _id: false });

const moduleAssessmentSchema = new mongoose.Schema({
  assessmentId: { type: String, required: true, unique: true, index: true },
  moduleId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  instructions: { type: String, default: "Choose the picture or answer that matches the lesson." },
  items: { type: [assessmentItemSchema], default: [] },
  minimumItems: { type: Number, default: 6, min: 1 },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active", index: true },
}, { timestamps: true });

module.exports = mongoose.models.ModuleAssessment || mongoose.model("ModuleAssessment", moduleAssessmentSchema);
