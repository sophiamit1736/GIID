require("dotenv").config();
const mongoose = require("mongoose");
const LearningModule = require("./models/LearningModule");

// These are the 9 UNIQUE brushing-teeth videos supplied with this project.
// Each video is used exactly once. Do not reuse a video for another step.
const VIDEO_BASE = "/learning/videos/brushing/";
const video = (filename) => `${VIDEO_BASE}${encodeURIComponent(filename)}`;

const brushingSteps = [
  {
    title: "Find the toothbrush",
    instruction: "Find your toothbrush.",
    tamil: "உங்கள் பல் துலக்கும் பிரஷ்ஷை கண்டுபிடிக்கவும்.",
    audioText: "Find your toothbrush.",
    video: video("finding_toothbrush.mp4"),
    action: { type: "guided-step", step: 1, expected: "continue" },
  },
  {
    title: "Pick up the toothbrush",
    instruction: "Pick up the toothbrush.",
    tamil: "பல் துலக்கும் பிரஷ்ஷை எடுக்கவும்.",
    audioText: "Pick up the toothbrush.",
    video: video("pickup_brush.mp4"),
    action: { type: "guided-step", step: 2, expected: "continue" },
  },
  {
    title: "Wet the toothbrush",
    instruction: "Wet the toothbrush with water.",
    tamil: "பிரஷ்ஷை தண்ணீரில் நனைக்கவும்.",
    audioText: "Wet the toothbrush with water.",
    video: video("wet_toothbrush.mp4"),
    action: { type: "guided-step", step: 3, expected: "continue" },
  },
  {
    title: "Open the toothpaste cap",
    instruction: "Open the toothpaste cap.",
    tamil: "பற்பசையின் மூடியைத் திறக்கவும்.",
    audioText: "Open the toothpaste cap.",
    video: video("open_pastecap.mp4"),
    action: { type: "guided-step", step: 4, expected: "continue" },
  },
  {
    title: "Squeeze toothpaste onto the brush",
    instruction: "Squeeze toothpaste onto the toothbrush.",
    tamil: "பற்பசையை பிரஷ்ஷின் மீது பிழிந்து வைக்கவும்.",
    audioText: "Squeeze toothpaste onto the toothbrush.",
    video: video("apply_toothpaste_on_brush.mp4"),
    action: { type: "guided-step", step: 5, expected: "continue" },
  },
  {
    title: "Spread the toothpaste on the brush",
    instruction: "Put the toothpaste neatly on the brush.",
    tamil: "பற்பசையை பிரஷ்ஷில் நன்றாக வைக்கவும்.",
    audioText: "Put the toothpaste neatly on the brush.",
    video: video("apply_toothpaste.mp4"),
    action: { type: "guided-step", step: 6, expected: "continue" },
  },
  {
    title: "Brush your teeth",
    instruction: "Brush your teeth gently.",
    tamil: "உங்கள் பற்களை மெதுவாக துலக்கவும்.",
    audioText: "Brush your teeth gently.",
    video: video("brushing_teeth.mp4"),
    action: { type: "guided-step", step: 7, expected: "continue" },
  },
  {
    title: "Rinse your mouth",
    instruction: "Rinse your mouth with water.",
    tamil: "தண்ணீரால் உங்கள் வாயை கழுவவும்.",
    audioText: "Rinse your mouth with water.",
    video: video("rinse_mouth.mp4"),
    action: { type: "guided-step", step: 8, expected: "continue" },
  },
  {
    title: "Put the toothbrush back",
    instruction: "Put the toothbrush back in its place.",
    tamil: "பல் துலக்கும் பிரஷ்ஷை அதன் இடத்தில் வைக்கவும்.",
    audioText: "Put the toothbrush back in its place.",
    video: video("put_brush_back.mp4"),
    action: { type: "guided-step", step: 9, expected: "continue" },
  },
];

function validateUniqueVideos(steps) {
  const videos = steps.map((step) => step.video).filter(Boolean);
  const unique = new Set(videos);
  if (videos.length !== 9 || unique.size !== 9) {
    throw new Error(`Brushing Teeth must contain exactly 9 unique videos. Found ${videos.length} videos / ${unique.size} unique.`);
  }
}

async function update() {
  try {
    validateUniqueVideos(brushingSteps);
    await mongoose.connect(process.env.MONGO_URI);

    const module = await LearningModule.findOneAndUpdate(
      { moduleId: "adl-brushing" },
      {
        $set: {
          steps: brushingSteps.map((step) => step.instruction),
          interactiveSteps: brushingSteps,
          activityType: "visual-sequence",
          audioEnabled: true,
          adaptations: [
            "Show one short video at a time",
            "Use simple English and Tamil instructions",
            "Repeat the current video when needed",
            "Allow extra practice time",
          ],
        },
      },
      { new: true, runValidators: true }
    );

    if (!module) throw new Error('Module "adl-brushing" was not found. Run the main seed first.');

    console.log(`Updated Brushing Teeth: ${module.interactiveSteps.length} steps.`);
    module.interactiveSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.title} -> ${step.video}`);
    });
  } catch (error) {
    console.error("Failed to update Brushing Teeth module:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

update();
