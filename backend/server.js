const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const activityResultRoutes = require("./routes/activityResultRoutes");
const learningModuleRoutes = require("./routes/learningModuleRoutes");
const aiRoutes = require("./routes/aiRoutes");
const facpRoutes = require("./routes/facpRoutes");
const adminRoutes = require("./routes/adminRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const gameRoutes = require("./routes/gameRoutes");
const moduleAssessmentRoutes = require("./routes/moduleAssessmentRoutes");
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/uploads",express.static(path.join(__dirname,"uploads")));
app.use("/api/results", activityResultRoutes);
app.get("/api/results/public-summary", async (req,res)=>{try{const Student=require("./models/Student");const LearningModule=require("./models/LearningModule");const ActivityResult=require("./models/ActivityResult");const [students,modules,results]=await Promise.all([Student.countDocuments({status:"Active"}),LearningModule.countDocuments({status:"Active"}),ActivityResult.find({}).select("accuracy").lean()]);const success=results.length?Math.round(results.reduce((a,r)=>a+Number(r.accuracy||0),0)/results.length):0;res.json({students,modules,success});}catch(e){res.json({students:0,modules:0,success:0})}});
app.use("/api/learning-modules",learningModuleRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/module-assessments", moduleAssessmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/facp", facpRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use(express.urlencoded({ extended: true }));

// Make uploaded images accessible
app.use("/uploads", express.static("uploads"));

app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
    res.send("Adaptive Learning Platform API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});