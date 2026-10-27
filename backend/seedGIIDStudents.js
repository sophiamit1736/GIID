const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config();

const Student = require("./models/Student");
const { normalizeGroupToFACPLevel } = require("./config/facpLevelMapper");

// =========================================================
// CONFIG
// =========================================================

const SEED_FILE = path.join(
  __dirname,
  "data",
  "giid_students_seed.json"
);

// =========================================================
// HELPERS
// =========================================================

function cleanString(value, fallback = "") {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    String(value).trim().toLowerCase() === "nan"
  ) {
    return fallback;
  }

  return String(value).trim();
}

// =========================================================
// NUMBER PARSER
// =========================================================

function toNumber(value, fallback = null) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    String(value).trim().toLowerCase() === "nan"
  ) {
    return fallback;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return fallback;
  }

  return number;
}

// =========================================================
// PERCENTAGE PARSER
// =========================================================

function parsePercentage(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    String(value).trim().toLowerCase() === "nan"
  ) {
    return 0;
  }

  let number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  // Example: 0.85 -> 85
  if (number >= 0 && number <= 1) {
    number = number * 100;
  }

  // Example: 8500 -> 85
  else if (number > 100 && number <= 10000) {
    number = number / 100;
  }

  // Ensure between 0 and 100
  number = Math.max(0, Math.min(100, number));

  return Number(number.toFixed(2));
}

// =========================================================
// DATE PARSER
// =========================================================

function parseDate(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    String(value).trim().toLowerCase() === "nan"
  ) {
    return null;
  }

  // Already Date object
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  const stringValue = String(value).trim();

  // -------------------------------------------------------
  // EXCEL SERIAL DATE
  // -------------------------------------------------------

  if (/^\d+(\.\d+)?$/.test(stringValue)) {
    const serial = Number(stringValue);

    if (serial > 20000 && serial < 60000) {
      const excelEpoch = new Date(
        Date.UTC(1899, 11, 30)
      );

      const date = new Date(
        excelEpoch.getTime() +
          serial * 24 * 60 * 60 * 1000
      );

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // -------------------------------------------------------
  // NORMAL DATE
  // -------------------------------------------------------

  const date = new Date(stringValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

// =========================================================
// AGE CALCULATOR
// =========================================================

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age--;
  }

  return age > 0 ? age : null;
}

// =========================================================
// GENDER NORMALIZER
// =========================================================

function normalizeGender(value) {
  const gender = cleanString(value);

  if (!gender) {
    return "Other";
  }

  const lower = gender.toLowerCase();

  if (
    lower === "male" ||
    lower === "m"
  ) {
    return "Male";
  }

  if (
    lower === "female" ||
    lower === "f"
  ) {
    return "Female";
  }

  if (
    lower === "other" ||
    lower === "o"
  ) {
    return "Other";
  }

  return "Other";
}

// =========================================================
// STATUS NORMALIZER
// =========================================================

function normalizeStatus(value) {
  return cleanString(value);
}

// =========================================================
// DISABILITY LEVEL NORMALIZER
// =========================================================

function normalizeDisabilityLevel(value) {
  const level = cleanString(value);

  if (!level) {
    return "Unspecified";
  }

  const lower = level.toLowerCase();

  if (lower === "mild") {
    return "Mild";
  }

  if (lower === "moderate") {
    return "Moderate";
  }

  if (lower === "severe") {
    return "Severe";
  }

  if (lower === "profound") {
    return "Profound";
  }

  if (
    lower === "unspecified" ||
    lower === "not specified" ||
    lower === "unknown" ||
    lower === "na" ||
    lower === "n/a"
  ) {
    return "Unspecified";
  }

  // Anything else defaults safely
  return "Unspecified";
}

// =========================================================
// LOAD JSON
// =========================================================

function loadStudents() {
  if (!fs.existsSync(SEED_FILE)) {
    throw new Error(
      `Seed file not found:\n${SEED_FILE}`
    );
  }

  let raw = fs.readFileSync(
    SEED_FILE,
    "utf8"
  );

  // Remove UTF-8 BOM
  raw = raw.replace(/^\uFEFF/, "");

  // Replace invalid JSON NaN values
  raw = raw.replace(
    /:\s*NaN\s*([,}])/g,
    ": null$1"
  );

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "❌ Unable to parse giid_students_seed.json"
    );

    console.error(error.message);

    throw error;
  }
}

// =========================================================
// BUILD STUDENT OBJECT
// =========================================================

function buildStudent(rawStudent, index) {

  // -------------------------------------------------------
  // BASIC DETAILS
  // -------------------------------------------------------

  const admissionNumber = cleanString(
    rawStudent.admissionNumber ||
    rawStudent["ADMISSION NUMBER"] ||
    rawStudent.admission_number
  );

  const name = cleanString(
    rawStudent.name ||
    rawStudent.studentName ||
    rawStudent["STUDENTS NAME"] ||
    rawStudent.student_name
  );

  const dateOfBirth = parseDate(
    rawStudent.dateOfBirth ||
    rawStudent.dob ||
    rawStudent.DOB ||
    rawStudent["Date of Birth"]
  );

  const gender = normalizeGender(
    rawStudent.gender ||
    rawStudent.Gender
  );

  // -------------------------------------------------------
  // AGE
  // -------------------------------------------------------

  const ageFromJSON = toNumber(
    rawStudent.age ??
    rawStudent.Age,
    null
  );

  const calculatedAge =
    calculateAge(dateOfBirth);

  let age =
    calculatedAge !== null
      ? calculatedAge
      : ageFromJSON;

  // Age is required in schema.
  // Safe fallback only if source data has no valid age/DOB.
  if (!age || age < 1) {
    age = 1;
  }

  // -------------------------------------------------------
  // UNIQUE IDENTIFIERS
  // -------------------------------------------------------

  const studentCode =
    cleanString(
      rawStudent.studentCode ||
      rawStudent.student_code
    ) ||
    admissionNumber ||
    `GIID-${String(index + 1).padStart(4, "0")}`;

  const sourceRecordId =
    cleanString(
      rawStudent.sourceRecordId ||
      rawStudent.source_record_id
    ) ||
    `GIID-SOURCE-${index + 1}`;

  // -------------------------------------------------------
  // PERCENTAGE
  // -------------------------------------------------------

  const percentage =
    parsePercentage(
      rawStudent.percentage ??
      rawStudent.PERCENTAGE
    );

  // -------------------------------------------------------
  // DISABILITY
  // -------------------------------------------------------

  const disabilityType = cleanString(
    rawStudent.disabilityType ||
    rawStudent.typeOfDisability ||
    rawStudent["TYPE OF DISABILITY"]
  );

  const disabilityLevel =
    normalizeDisabilityLevel(
      rawStudent.disabilityLevel ||
      rawStudent["DISABILITY LEVEL"]
    );

  // -------------------------------------------------------
  // REQUIRED GUARDIAN DETAILS
  // -------------------------------------------------------

  const guardianName = cleanString(
    rawStudent.guardianName ||
    rawStudent["GUARDIAN NAME"],
    "Not Provided"
  );

  const guardianPhone = cleanString(
    rawStudent.guardianPhone ||
    rawStudent["GUARDIAN PHONE"],
    "Not Provided"
  );

  // -------------------------------------------------------
  // FINAL OBJECT
  // -------------------------------------------------------

  return {

    studentCode,

    sourceRecordId,

    name,

    age,

    dateOfBirth,

    gender,

    disabilityLevel,

    learningLevel:
      cleanString(
        rawStudent.learningLevel,
        "Beginner"
      ),

    admissionNumber,

    group: cleanString(
      rawStudent.group ||
      rawStudent.GROUP
    ),

    // Map the GIID register's existing class/group to the corresponding FACP
    // functional level. This is source-data mapping, not an age/disability inference.
    facpFunctionalLevel: normalizeGroupToFACPLevel(
      rawStudent.group || rawStudent.GROUP,
      age
    ),

    careType: cleanString(
      rawStudent.careType ||
      rawStudent.dayCareHostel ||
      rawStudent["Day Care/Hostel"] ||
      rawStudent["Day Care/Hostel "]
    ),

    idCardNumber: cleanString(
      rawStudent.idCardNumber ||
      rawStudent["ID CARD NUMBER"]
    ),

    percentage,

    disabilityType,

    udidEnrollmentNumber: cleanString(
      rawStudent.udidEnrollmentNumber ||
      rawStudent["UDID/ ENROLLMENT NUMBER"]
    ),

    caseAssessmentStatus:
      normalizeStatus(
        rawStudent.caseAssessmentStatus ||
        rawStudent.caseAssessmentCompletionStatus
      ),

    caseAssessmentDate:
      parseDate(
        rawStudent.caseAssessmentDate ||
        rawStudent.dateOfCompletionCA
      ),

    facpStatus:
      normalizeStatus(
        rawStudent.facpStatus ||
        rawStudent.facpCompletionStatus
      ),

    facpCompletionDate:
      parseDate(
        rawStudent.facpCompletionDate ||
        rawStudent.dateOfCompletionFACP
      ),

    sourceSheet: cleanString(
      rawStudent.sourceSheet,
      "GIID Student Register"
    ),

    guardianName,

    guardianPhone,

    address: cleanString(
      rawStudent.address
    ),

    photo: cleanString(
      rawStudent.photo
    ),

    status: "Active"
  };
}

// =========================================================
// MAIN SEED FUNCTION
// =========================================================

async function run() {
  let connected = false;

  try {

    console.log(
      "=========================================="
    );

    console.log(
      " GIID STUDENT SEED"
    );

    console.log(
      "=========================================="
    );

    // -----------------------------------------------------
    // MONGODB URI
    // -----------------------------------------------------

    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MongoDB connection string not found. " +
        "Check MONGODB_URI or MONGO_URI in .env"
      );
    }

    console.log("📂 Seed file:");
    console.log(SEED_FILE);

    // -----------------------------------------------------
    // LOAD DATA
    // -----------------------------------------------------

    const rawStudents =
      loadStudents();

    if (!Array.isArray(rawStudents)) {
      throw new Error(
        "giid_students_seed.json must contain an array."
      );
    }

    console.log(
      `📊 Records found in JSON: ${rawStudents.length}`
    );

    // -----------------------------------------------------
    // CONNECT
    // -----------------------------------------------------

    console.log(
      "🔌 Connecting to MongoDB..."
    );

    await mongoose.connect(
      mongoUri
    );

    connected = true;

    console.log(
      "✅ MongoDB connected"
    );

    // -----------------------------------------------------
    // COUNTERS
    // -----------------------------------------------------

    let created = 0;
    let updated = 0;
    let skipped = 0;

    // -----------------------------------------------------
    // PROCESS STUDENTS
    // -----------------------------------------------------

    for (
      let i = 0;
      i < rawStudents.length;
      i++
    ) {

      const rawStudent =
        rawStudents[i];

      try {

        const student =
          buildStudent(
            rawStudent,
            i
          );

        // -------------------------------------------------
        // NAME CHECK
        // -------------------------------------------------

        if (!student.name) {

          console.log(
            `⚠️ Skipping record ${i + 1}: name missing`
          );

          skipped++;

          continue;
        }

        // -------------------------------------------------
        // FIND EXISTING STUDENT
        // -------------------------------------------------

        let existing = null;

        // 1. SOURCE RECORD ID

        if (student.sourceRecordId) {

          existing =
            await Student.findOne({
              sourceRecordId:
                student.sourceRecordId
            });

        }

        // 2. STUDENT CODE

        if (
          !existing &&
          student.studentCode
        ) {

          existing =
            await Student.findOne({
              studentCode:
                student.studentCode
            });

        }

        // 3. ADMISSION NUMBER + NAME

        if (
          !existing &&
          student.admissionNumber &&
          student.name
        ) {

          existing =
            await Student.findOne({
              admissionNumber:
                student.admissionNumber,
              name:
                student.name
            });

        }

        // -------------------------------------------------
        // UPDATE
        // -------------------------------------------------

        if (existing) {

          Object.keys(student).forEach(
            (key) => {

              const value =
                student[key];

              if (
                value !== "" &&
                value !== null &&
                value !== undefined
              ) {

                existing[key] =
                  value;

              }

            }
          );

          await existing.save();

          updated++;

          console.log(
            `🔄 Updated: ${student.name} (${student.studentCode})`
          );

        }

        // -------------------------------------------------
        // CREATE
        // -------------------------------------------------

        else {

          await Student.create(
            student
          );

          created++;

          console.log(
            `✅ Created: ${student.name} (${student.studentCode})`
          );

        }

      } catch (studentError) {

        console.error(
          `❌ Error processing record ${i + 1}:`
        );

        console.error(
          studentError.message
        );

        skipped++;

      }

    }

    // -----------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------

    const total =
      await Student.countDocuments();

    console.log("");

    console.log(
      "=========================================="
    );

    console.log(
      " GIID SEED COMPLETED"
    );

    console.log(
      "=========================================="
    );

    console.log(
      `📥 Input records : ${rawStudents.length}`
    );

    console.log(
      `🆕 Created       : ${created}`
    );

    console.log(
      `🔄 Updated       : ${updated}`
    );

    console.log(
      `⚠️ Skipped       : ${skipped}`
    );

    console.log(
      `👨‍🎓 DB total      : ${total}`
    );

    console.log(
      "=========================================="
    );

  } catch (error) {

    console.error("");

    console.error(
      "❌ SEED FAILED"
    );

    console.error(
      error.message
    );

    process.exitCode = 1;

  } finally {

    // -----------------------------------------------------
    // DISCONNECT
    // -----------------------------------------------------

    if (
      connected ||
      mongoose.connection.readyState !== 0
    ) {

      await mongoose.disconnect();

      console.log(
        "🔌 MongoDB disconnected"
      );

    }

  }
}

// =========================================================
// RUN
// =========================================================

if (require.main === module) run();
module.exports = { loadStudents, buildStudent };