require("dotenv").config();
const mongoose=require("mongoose");
const LearningModule=require("./models/LearningModule");
(async()=>{try{await mongoose.connect(process.env.MONGO_URI);await LearningModule.updateOne({moduleId:"academic-colours"},{$set:{interactiveSteps:[
{title:"Learn RED",instruction:"This is RED.",emoji:"🔴",audioText:"This is red."},
{title:"Learn BLUE",instruction:"This is BLUE.",emoji:"🔵",audioText:"This is blue."},
{title:"Learn YELLOW",instruction:"This is YELLOW.",emoji:"🟡",audioText:"This is yellow."}
]}});console.log("academic-colours updated");}catch(e){console.error(e)}finally{await mongoose.disconnect()}})();
