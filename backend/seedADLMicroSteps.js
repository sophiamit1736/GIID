require("dotenv").config();
const mongoose = require("mongoose");
const LearningModule = require("./models/LearningModule");

const step = (title, instruction, tamil, video) => ({
  title,
  instruction,
  audioText: instruction,
  tamil,
  video,
  action: "tap",
});

const modules = [
  {
    moduleId: "adl-brushing",
    title: "Brushing Teeth",
    description: "Learn tooth brushing with nine clear video-guided steps.",
    category: "ADL",
    skill: "Personal Hygiene",
    level: "Beginner",
    duration: 8,
    ageGroups: ["6-10", "11-15", "16-18"],
    objectives: ["Follow a tooth-brushing routine", "Learn one action at a time", "Complete the routine with minimal prompts"],
    adaptations: ["Show one short video at a time", "Use simple English and Tamil instructions", "Repeat the current video when needed", "Allow extra response time"],
    activityType: "visual-sequence",
    interactiveSteps: [
      step("Find the toothbrush", "Find your toothbrush.", "உங்கள் பல் துலக்கும் பிரஷ்ஷை கண்டுபிடிக்கவும்.", "/learning/videos/brushing/finding_toothbrush.mp4"),
      step("Pick up the toothbrush", "Pick up the toothbrush.", "பல் துலக்கும் பிரஷ்ஷை எடுக்கவும்.", "/learning/videos/brushing/pickup_brush.mp4"),
      step("Wet the toothbrush", "Wet the toothbrush with water.", "பிரஷ்ஷை தண்ணீரில் நனைக்கவும்.", "/learning/videos/brushing/wet_toothbrush.mp4"),
      step("Open the toothpaste cap", "Open the toothpaste cap.", "பற்பசையின் மூடியைத் திறக்கவும்.", "/learning/videos/brushing/open_pastecap.mp4"),
      step("Squeeze toothpaste onto the brush", "Squeeze toothpaste onto the toothbrush.", "பற்பசையை பிரஷ்ஷின் மீது பிழிந்து வைக்கவும்.", "/learning/videos/brushing/apply_toothpaste_on_brush.mp4"),
      step("Spread the toothpaste on the brush", "Put the toothpaste neatly on the brush.", "பற்பசையை பிரஷ்ஷில் நன்றாக வைக்கவும்.", "/learning/videos/brushing/apply_toothpaste.mp4"),
      step("Brush your teeth", "Brush your teeth gently.", "உங்கள் பற்களை மெதுவாக துலக்கவும்.", "/learning/videos/brushing/brushing_teeth.mp4"),
      step("Rinse your mouth", "Rinse your mouth with water.", "தண்ணீரால் உங்கள் வாயை கழுவவும்.", "/learning/videos/brushing/rinse_mouth.mp4"),
      step("Put the toothbrush back", "Put the toothbrush back in its place.", "பல் துலக்கும் பிரஷ்ஷை அதன் இடத்தில் வைக்கவும்.", "/learning/videos/brushing/put_brush_back.mp4"),
    ],
  },
  {
    moduleId: "adl-combing",
    title: "Combing Hair",
    description: "Learn how to comb hair step by step.",
    category: "ADL",
    skill: "Personal Grooming",
    level: "Beginner",
    duration: 6,
    ageGroups: ["6-10", "11-15", "16-18"],
    objectives: ["Identify a comb", "Hold and use a comb safely", "Complete a simple grooming routine"],
    adaptations: ["Use a wide-tooth comb", "Demonstrate slowly", "Allow hand-over-hand prompting when needed"],
    activityType: "visual-sequence",
    interactiveSteps: [
      step("Stand near the mirror", "Stand in front of the mirror.", "கண்ணாடி முன் நிற்கவும்.", "/learning/videos/combing/01_mirror.mp4"),
      step("Find the comb", "Find the comb.", "சீப்பை கண்டுபிடிக்கவும்.", "/learning/videos/combing/02_find_comb.mp4"),
      step("Pick up the comb", "Pick up the comb.", "சீப்பை எடுக்கவும்.", "/learning/videos/combing/03_pick_comb.mp4"),
      step("Hold the comb", "Hold the comb correctly.", "சீப்பை சரியாக பிடிக்கவும்.", "/learning/videos/combing/04_hold_comb.mp4"),
      step("Touch the hair gently", "Touch your hair gently.", "உங்கள் முடியை மெதுவாக தொடவும்.", "/learning/videos/combing/05_touch_hair.mp4"),
      step("Comb the front", "Comb the front of your hair.", "முன்புற முடியை சீவவும்.", "/learning/videos/combing/06_front.mp4"),
      step("Comb the left side", "Comb the left side of your hair.", "இடது பக்க முடியை சீவவும்.", "/learning/videos/combing/07_left.mp4"),
      step("Comb the right side", "Comb the right side of your hair.", "வலது பக்க முடியை சீவவும்.", "/learning/videos/combing/08_right.mp4"),
      step("Comb the back", "Comb the back of your hair.", "பின்புற முடியை சீவவும்.", "/learning/videos/combing/09_back.mp4"),
      step("Comb slowly if hair is tangled", "Comb tangled hair slowly.", "சிக்கிய முடியை மெதுவாக சீவவும்.", "/learning/videos/combing/10_tangled.mp4"),
      step("Check the hair", "Check your hair in the mirror.", "கண்ணாடியில் உங்கள் முடியை பார்க்கவும்.", "/learning/videos/combing/11_check.mp4"),
      step("Adjust the hair", "Adjust your hair neatly.", "முடியை ஒழுங்குபடுத்தவும்.", "/learning/videos/combing/12_adjust.mp4"),
      step("Clean the comb", "Clean the comb.", "சீப்பை சுத்தம் செய்யவும்.", "/learning/videos/combing/13_clean.mp4"),
      step("Put the comb away", "Keep the comb in its place.", "சீப்பை அதன் இடத்தில் வைக்கவும்.", "/learning/videos/combing/14_store.mp4"),
      step("Look in the mirror", "Look in the mirror.", "கண்ணாடியில் பார்க்கவும்.", "/learning/videos/combing/15_final_check.mp4"),
      step("Finish", "Combing hair is complete.", "முடி சீவுதல் முடிந்தது.", "/learning/videos/combing/16_finish.mp4"),
    ],
  },
  {
    moduleId: "adl-dressing",
    title: "Dressing",
    description: "Learn a simple dressing routine one small step at a time.",
    category: "ADL",
    skill: "Dressing",
    level: "Beginner",
    duration: 8,
    ageGroups: ["6-10", "11-15", "16-18"],
    objectives: ["Identify clothing", "Put on a shirt and pants", "Arrange clothes independently"],
    adaptations: ["Lay clothes in order before starting", "Use loose clothing for practice", "Give one prompt at a time"],
    activityType: "visual-sequence",
    interactiveSteps: [
      step("Find the shirt", "Find the shirt.", "சட்டையை கண்டுபிடிக்கவும்.", "/learning/videos/dressing/01_find_shirt.mp4"),
      step("Pick up the shirt", "Pick up the shirt.", "சட்டையை எடுக்கவும்.", "/learning/videos/dressing/02_pick_shirt.mp4"),
      step("Find the front", "Find the front of the shirt.", "சட்டையின் முன்புறத்தை கண்டுபிடிக்கவும்.", "/learning/videos/dressing/03_front.mp4"),
      step("Find the neck opening", "Find the neck opening.", "கழுத்து திறப்பை கண்டுபிடிக்கவும்.", "/learning/videos/dressing/04_neck.mp4"),
      step("Put your head through", "Put your head through the neck opening.", "கழுத்து திறப்பின் வழியாக தலையை விடவும்.", "/learning/videos/dressing/05_head.mp4"),
      step("Find the left sleeve", "Find the left sleeve.", "இடது கைப்பகுதியை கண்டுபிடிக்கவும்.", "/learning/videos/dressing/06_left_sleeve.mp4"),
      step("Put in the left hand", "Put your left hand into the sleeve.", "இடது கையை கைப்பகுதிக்குள் விடவும்.", "/learning/videos/dressing/07_left_hand.mp4"),
      step("Find the right sleeve", "Find the right sleeve.", "வலது கைப்பகுதியை கண்டுபிடிக்கவும்.", "/learning/videos/dressing/08_right_sleeve.mp4"),
      step("Put in the right hand", "Put your right hand into the sleeve.", "வலது கையை கைப்பகுதிக்குள் விடவும்.", "/learning/videos/dressing/09_right_hand.mp4"),
      step("Pull the shirt down", "Pull the shirt down.", "சட்டையை கீழே இழுக்கவும்.", "/learning/videos/dressing/10_pull_down.mp4"),
      step("Straighten the collar", "Straighten the collar.", "காலரை சரி செய்யவும்.", "/learning/videos/dressing/11_collar.mp4"),
      step("Find the pants", "Find the pants.", "கால்சட்டையை கண்டுபிடிக்கவும்.", "/learning/videos/dressing/12_find_pants.mp4"),
      step("Pick up the pants", "Pick up the pants.", "கால்சட்டையை எடுக்கவும்.", "/learning/videos/dressing/13_pick_pants.mp4"),
      step("Find the front", "Find the front of the pants.", "கால்சட்டையின் முன்புறத்தை கண்டுபிடிக்கவும்.", "/learning/videos/dressing/14_pants_front.mp4"),
      step("Put in the left leg", "Put your left leg into the pants.", "இடது காலை கால்சட்டைக்குள் விடவும்.", "/learning/videos/dressing/15_left_leg.mp4"),
      step("Put in the right leg", "Put your right leg into the pants.", "வலது காலை கால்சட்டைக்குள் விடவும்.", "/learning/videos/dressing/16_right_leg.mp4"),
      step("Pull pants up", "Pull the pants up.", "கால்சட்டையை மேலே இழுக்கவும்.", "/learning/videos/dressing/17_pull_up.mp4"),
      step("Adjust the waistband", "Adjust the waistband.", "இடுப்பு பகுதியை சரி செய்யவும்.", "/learning/videos/dressing/18_waist.mp4"),
      step("Straighten the clothes", "Straighten your clothes.", "உங்கள் உடையை ஒழுங்குபடுத்தவும்.", "/learning/videos/dressing/19_straighten.mp4"),
      step("Check in the mirror", "Check your clothes in the mirror.", "கண்ணாடியில் உங்கள் உடையை பார்க்கவும்.", "/learning/videos/dressing/20_check.mp4"),
      step("Stand straight", "Stand straight.", "நிமிர்ந்து நிற்கவும்.", "/learning/videos/dressing/21_stand.mp4"),
      step("Finish", "Dressing is complete.", "உடை அணிதல் முடிந்தது.", "/learning/videos/dressing/22_finish.mp4"),
    ],
  },
  {
    moduleId: "adl-buttoning",
    title: "Buttoning a Shirt",
    description: "Learn how to button a shirt using small hand-motor steps.",
    category: "ADL",
    skill: "Fine Motor and Dressing",
    level: "Beginner",
    duration: 6,
    ageGroups: ["6-10", "11-15", "16-18"],
    objectives: ["Find a button and button hole", "Coordinate both hands", "Complete buttoning from top to bottom"],
    adaptations: ["Start with large buttons", "Use contrasting button and shirt colours", "Allow repeated practice"],
    activityType: "visual-sequence",
    interactiveSteps: [
      step("Hold the shirt", "Hold the front of the shirt.", "சட்டையின் முன்பகுதியை பிடிக்கவும்.", "/learning/videos/buttoning/01_hold_shirt.mp4"),
      step("Find the first button", "Find the first button.", "முதல் பொத்தானை கண்டுபிடிக்கவும்.", "/learning/videos/buttoning/02_find_button.mp4"),
      step("Find the button hole", "Find the first button hole.", "முதல் பொத்தான் துளையை கண்டுபிடிக்கவும்.", "/learning/videos/buttoning/03_find_hole.mp4"),
      step("Hold the button", "Hold the button with your fingers.", "விரல்களால் பொத்தானை பிடிக்கவும்.", "/learning/videos/buttoning/04_hold_button.mp4"),
      step("Push through the hole", "Push the button through the hole.", "பொத்தானை துளைக்குள் நுழைக்கவும்.", "/learning/videos/buttoning/05_push_button.mp4"),
      step("Pull the button through", "Pull the button through completely.", "பொத்தானை முழுவதும் இழுக்கவும்.", "/learning/videos/buttoning/06_pull_button.mp4"),
      step("Check the first button", "Check that the first button is closed.", "முதல் பொத்தான் மூடியுள்ளதா பார்க்கவும்.", "/learning/videos/buttoning/07_check_one.mp4"),
      step("Find the second button", "Find the second button.", "இரண்டாவது பொத்தானை கண்டுபிடிக்கவும்.", "/learning/videos/buttoning/08_second.mp4"),
      step("Button the second", "Push the second button through the hole.", "இரண்டாவது பொத்தானை துளைக்குள் நுழைக்கவும்.", "/learning/videos/buttoning/09_button_two.mp4"),
      step("Check the second button", "Check the second button.", "இரண்டாவது பொத்தானை சரிபார்க்கவும்.", "/learning/videos/buttoning/10_check_two.mp4"),
      step("Find the third button", "Find the third button.", "மூன்றாவது பொத்தானை கண்டுபிடிக்கவும்.", "/learning/videos/buttoning/11_third.mp4"),
      step("Button the third", "Push the third button through the hole.", "மூன்றாவது பொத்தானை துளைக்குள் நுழைக்கவும்.", "/learning/videos/buttoning/12_button_three.mp4"),
      step("Repeat the movement", "Repeat the same movement for the next button.", "அடுத்த பொத்தானுக்கும் இதே செயலை செய்யவும்.", "/learning/videos/buttoning/13_repeat.mp4"),
      step("Finish the remaining buttons", "Continue until all buttons are closed.", "அனைத்து பொத்தான்களும் மூடும் வரை தொடரவும்.", "/learning/videos/buttoning/14_remaining.mp4"),
      step("Check all buttons", "Check all the buttons.", "அனைத்து பொத்தான்களையும் சரிபார்க்கவும்.", "/learning/videos/buttoning/15_check_all.mp4"),
      step("Straighten the shirt", "Straighten the shirt.", "சட்டையை ஒழுங்குபடுத்தவும்.", "/learning/videos/buttoning/16_straighten.mp4"),
      step("Look in the mirror", "Look in the mirror.", "கண்ணாடியில் பார்க்கவும்.", "/learning/videos/buttoning/17_mirror.mp4"),
      step("Finish", "Buttoning is complete.", "பொத்தான் போடுதல் முடிந்தது.", "/learning/videos/buttoning/18_finish.mp4"),
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const data of modules) {
    await LearningModule.findOneAndUpdate(
      { moduleId: data.moduleId },
      { $set: { ...data, steps: data.interactiveSteps.map(s => s.instruction) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded ${data.title}: ${data.interactiveSteps.length} micro-steps`);
  }
  await mongoose.disconnect();
  console.log("ADL micro-step modules ready.");
}

seed().catch(async err => {
  console.error(err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
