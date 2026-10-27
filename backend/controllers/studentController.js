const Student = require("../models/Student");
const { normalizeGroupToFACPLevel } = require("../config/facpLevelMapper");

function calculateAgeFromDob(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const month = today.getMonth() - dob.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) age -= 1;
  return Math.max(0, age);
}

// ==========================
// CREATE STUDENT
// ==========================
const createStudent = async (req, res) => {
  try {
    // Find the highest existing student code
    const students = await Student.find({}, { studentCode: 1 });

    let maxNumber = 0;

    students.forEach((student) => {
      if (student.studentCode) {
        const num = parseInt(
          student.studentCode.replace("STU-", ""),
          10
        );

        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const studentCode = `STU-${String(maxNumber + 1).padStart(4, "0")}`;

    // Calculate age
    let age = Number(req.body.age);

    if (!Number.isFinite(age) || age < 1) {
      age = 0;
    }

    if (!age && req.body.dateOfBirth) {
      const dob = new Date(req.body.dateOfBirth);

      age = calculateAgeFromDob(dob);
    }

    const student = new Student({
      studentCode,

      name: req.body.fullName,

      age,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,

      gender: req.body.gender,

      disabilityLevel: req.body.disabilityLevel,
      // Student category/GIID group is the broad placement entered during admission.
      // The corresponding FACP functional level is derived from category + age.
      group: String(req.body.group || "").trim(),

      // Learning level is determined after the initial FACP assessment.
      learningLevel: "Not Assessed",

      facpScore: 0,
      facpAssessed: false,
      facpAssessmentComplete: false,
      facpBaselineScore: null,
      facpFunctionalLevel: normalizeGroupToFACPLevel(req.body.group, age),
      facpBaselineFunctionalLevel: null,

      guardianName: req.body.guardianName,

      guardianPhone: req.body.guardianPhone,

      address: req.body.address,

      photo: req.file ? `/uploads/${req.file.filename}` : "",

      status: "Active",
    });

    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================
// GET ALL STUDENTS
// ==========================
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    const mapped = students.map(student => {
      const data = student.toObject();
      if (!data.facpFunctionalLevel) {
        const mappedLevel = normalizeGroupToFACPLevel(data.group, data.age);
        if (mappedLevel) data.facpFunctionalLevel = mappedLevel;
      }
      return data;
    });

    res.status(200).json(mapped);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================
// GET SINGLE STUDENT
// ==========================
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const data = student.toObject();
    if (!data.facpFunctionalLevel) {
      const mappedLevel = normalizeGroupToFACPLevel(data.group, data.age);
      if (mappedLevel) data.facpFunctionalLevel = mappedLevel;
    }
    res.status(200).json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================
// UPDATE STUDENT
// ==========================
const updateStudent = async (req, res) => {
  try {
    let age = Number(req.body.age);

    if (!Number.isFinite(age) || age < 1) {
      age = 0;
    }

    if (!age && req.body.dateOfBirth) {
      const dob = new Date(req.body.dateOfBirth);

      age = calculateAgeFromDob(dob);
    }

    const updateData = {
      name: req.body.fullName,
      age,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
      gender: req.body.gender,
      disabilityLevel: req.body.disabilityLevel,
      group: req.body.group !== undefined ? String(req.body.group || "").trim() : undefined,
      learningLevel: ["Not Assessed", "Beginner", "Intermediate", "Advanced"].includes(req.body.learningLevel)
        ? req.body.learningLevel
        : "Not Assessed",
      facpFunctionalLevel: req.body.group !== undefined
        ? normalizeGroupToFACPLevel(req.body.group, age)
        : undefined,
      guardianName: req.body.guardianName,
      guardianPhone: req.body.guardianPhone,
      address: req.body.address,
    };

    if (req.file) {
      updateData.photo = `/uploads/${req.file.filename}`;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ==========================
// UPDATE LEARNING LEVEL ONLY
// ==========================
const updateLearningLevel = async (req, res) => {
  try {
    const allowed = ["Not Assessed", "Beginner", "Intermediate", "Advanced"];
    const learningLevel = String(req.body?.learningLevel || "");
    if (!allowed.includes(learningLevel)) {
      return res.status(400).json({ success: false, message: "Invalid learning level." });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { learningLevel },
      { new: true, runValidators: true }
    );

    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    return res.status(200).json(student);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================
// DELETE STUDENT
// ==========================
const deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  updateLearningLevel,
  deleteStudent,
};