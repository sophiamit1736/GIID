const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Stable identifier for the original GIID register row.
    sourceRecordId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 1,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    disabilityLevel: {
      type: String,
      enum: ["Mild", "Moderate", "Severe", "Profound", "Unspecified"],
      required: true,
    },

    learningLevel: {
      type: String,
      enum: ["Not Assessed", "Beginner", "Intermediate", "Advanced"],
      default: "Not Assessed",
      required: true,
    },

    // Current FACP functional level. This is separate from LearnAble's
    // Beginner/Intermediate/Advanced learningLevel. It is selected/confirmed
    // through FACP assessment and drives which official checklist appears.
    facpFunctionalLevel: {
      type: String,
      enum: ["Preprimary", "Primary-I", "Primary-II", "Secondary", "Prevocational-I", "Prevocational-II", "Vocational", "Care Group"],
      default: null,
    },

    // GIID source-record fields imported from the official student register.
    admissionNumber: { type: String, default: "", index: true, trim: true },
    group: { type: String, default: "", trim: true },
    careType: { type: String, default: "", trim: true },
    idCardNumber: { type: String, default: "", trim: true },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    disabilityType: { type: String, default: "", trim: true },
    udidEnrollmentNumber: { type: String, default: "", index: true, trim: true },
    caseAssessmentStatus: { type: String, default: "", trim: true },
    caseAssessmentDate: { type: Date, default: null },
    facpStatus: { type: String, default: "", trim: true },
    facpCompletionDate: { type: Date, default: null },
    sourceSheet: { type: String, default: "", trim: true },

    // Current FACP quantitative result. This may change after later term assessments.
    facpScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Immutable admission/entry baseline once the teacher explicitly finalizes
    // the Entry FACP cycle. Never overwrite this with later term scores.
    facpBaselineScore: { type: Number, default: null, min: 0, max: 100 },
    facpBaselineApplicableItems: { type: Number, default: 0, min: 0 },
    facpBaselineAchievedItems: { type: Number, default: 0, min: 0 },
    facpBaselineAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: "FACPAssessment", default: null },
    facpBaselineAssessmentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "FACPAssessment" }],
    facpBaselineCompletedAt: { type: Date, default: null },
    facpBaselineFunctionalLevel: { type: String, default: null },

    facpApplicableItems: {
      type: Number,
      default: 0,
      min: 0,
    },

    facpAchievedItems: {
      type: Number,
      default: 0,
      min: 0,
    },

    facpIndependentItems: { type: Number, default: 0, min: 0 },
    facpAssessed: { type: Boolean, default: false },
    facpAssessmentComplete: { type: Boolean, default: false },

    facpLastAssessedAt: {
      type: Date,
      default: null,
    },

    // Adaptive Learning Performance Index (0-100).
    // Updated automatically from completed ActivityResult records.
    alpiScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    guardianName: {
      type: String,
      required: true,
      trim: true,
    },

    guardianPhone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    photo: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);