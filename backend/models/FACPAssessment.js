const mongoose = require("mongoose");

const facpItemResultSchema = new mongoose.Schema({
  code: { type: String, required: true },
  skill: { type: String, default: "" },
  activity: { type: String, default: "" },
  instruction: { type: String, default: "" },
  sourcePage: { type: Number, default: null },
  sourceType: { type: String, enum: ["official-facp", "custom"], default: "official-facp" },
  custom: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["+", "C", "GP", "VP", "M", "PP", "NE", "NA", "-", null],
    default: null,
  },
  recreationGrade: {
    type: String,
    enum: ["A", "B", "C", "D", "E", "NE", null],
    default: null,
  },
  notes: { type: String, default: "" },
}, { _id: false });

const facpAssessmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assessmentType: { type: String, default: "FACP" },
  functionalLevel: {
    type: String,
    enum: ["Preprimary", "Primary-I", "Primary-II", "Secondary", "Prevocational-I", "Prevocational-II", "Vocational", "Care Group"],
    required: true,
  },
  // Kept only for backward compatibility with older records. Current UI/scoring
  // does not use academic-year or year-in-level calculation until GIID confirms it.
  academicYear: { type: String, default: "" },
  yearInLevel: { type: Number, enum: [1, 2, 3], default: null },
  assessmentPeriod: {
    type: String,
    enum: ["Entry", "I Term", "II Term", "III Term"],
    default: "Entry",
  },
  domain: {
    type: String,
    enum: ["Personal", "Social", "Academic", "Occupational", "Recreational"],
    required: true,
    index: true,
  },
  items: { type: [facpItemResultSchema], default: [] },
  applicableItems: { type: Number, default: 0, min: 0 },
  achievedItems: { type: Number, default: 0, min: 0 },
  independentItems: { type: Number, default: 0, min: 0 },
  cueingItems: { type: Number, default: 0, min: 0 },
  notApplicableItems: { type: Number, default: 0, min: 0 },
  promptedItems: { type: Number, default: 0, min: 0 },
  noExposureItems: { type: Number, default: 0, min: 0 },
  notAchievedItems: { type: Number, default: 0, min: 0 },
  score: { type: Number, default: 0, min: 0, max: 100 },
  recreationGrade: { type: String, default: null },
  promotionEligible: { type: Boolean, default: false },
  assessmentComplete: { type: Boolean, default: false },
  notes: { type: String, default: "" },
  assessedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

module.exports = mongoose.models.FACPAssessment ||
  mongoose.model("FACPAssessment", facpAssessmentSchema);
