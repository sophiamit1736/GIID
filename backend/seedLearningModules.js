require("dotenv").config();
const mongoose = require("mongoose");
const LearningModule = require("./models/LearningModule");
const { DOMAINS } = require("./config/facpConfig");
const { getModuleFACPLevels } = require("./config/moduleFACPLevels");

const modules = [
  // ADL
  {
    moduleId: "adl-brushing",
    title: "Brushing Teeth",
    description: "Learn a simple routine for brushing teeth independently.",
    category: "ADL", skill: "Personal Hygiene", level: "Beginner", duration: 10,
    ageGroups: ["Early", "Middle", "Teen"],
    objectives: ["Recognise a toothbrush", "Follow brushing steps", "Build independent hygiene habits"],
    steps: ["Find your toothbrush", "Pick up the toothbrush", "Wet the toothbrush", "Open the toothpaste cap", "Apply toothpaste", "Brush your teeth", "Rinse your mouth", "Rinse the toothbrush", "Put the toothbrush away"],
    interactiveSteps: [
      {title:"Find the toothbrush",instruction:"Find your toothbrush.",tamil:"உங்கள் பல் துலக்கும் பிரஷ்ஷை கண்டுபிடிக்கவும்.",audioText:"Find your toothbrush.",video:"/learning/videos/brushing/finding_toothbrush.mp4",image:"/learning/brushing/step1.png",action:{type:"guided-step",step:1,expected:"continue"}},
      {title:"Pick up the toothbrush",instruction:"Pick up the toothbrush with your hand.",tamil:"கையால் பல் துலக்கும் பிரஷ்ஷை எடுக்கவும்.",audioText:"Pick up the toothbrush with your hand.",video:"/learning/videos/brushing/pickup_brush.mp4",image:"/learning/brushing/step1.png",action:{type:"guided-step",step:2,expected:"continue"}},
      {title:"Wet the toothbrush",instruction:"Wet the toothbrush with a little water.",tamil:"பிரஷ்ஷை சிறிது தண்ணீரில் நனைக்கவும்.",audioText:"Wet the toothbrush with a little water.",video:"/learning/videos/brushing/wet_toothbrush.mp4",image:"/learning/brushing/step2.png",action:{type:"guided-step",step:3,expected:"continue"}},
      {title:"Open the toothpaste",instruction:"Open the toothpaste cap.",tamil:"பற்பசையின் மூடியைத் திறக்கவும்.",audioText:"Open the toothpaste cap.",video:"/learning/videos/brushing/open_pastecap.mp4",image:"/learning/brushing/step2.png",action:{type:"guided-step",step:4,expected:"continue"}},
      {title:"Apply toothpaste",instruction:"Squeeze a small amount of toothpaste onto the brush.",tamil:"சிறிதளவு பற்பசையை பிரஷ்ஷில் வைக்கவும்.",audioText:"Squeeze a small amount of toothpaste onto the brush.",video:"/learning/videos/brushing/apply_toothpaste_on_brush.mp4",image:"/learning/brushing/step3.png",action:{type:"guided-step",step:5,expected:"continue"}},
      {title:"Spread toothpaste on the brush",instruction:"Put the toothpaste onto the bristles evenly.",tamil:"பற்பசையை பிரஷ்ஷின் நார்களில் சமமாக வைக்கவும்.",audioText:"Put the toothpaste onto the bristles evenly.",video:"/learning/videos/brushing/apply_toothpaste.mp4",image:"/learning/brushing/step4.png",action:{type:"guided-step",step:6,expected:"continue"}},
      {title:"Brush your teeth",instruction:"Brush the front and back teeth gently.",tamil:"முன் மற்றும் பின் பற்களை மெதுவாகத் துலக்கவும்.",audioText:"Brush your teeth gently.",video:"/learning/videos/brushing/brushing_teeth.mp4",image:"/learning/brushing/step5.png",action:{type:"guided-step",step:7,expected:"continue"}},
      {title:"Rinse your mouth",instruction:"Rinse your mouth with clean water.",tamil:"சுத்தமான தண்ணீரால் வாயை கொப்பளிக்கவும்.",audioText:"Rinse your mouth with clean water.",video:"/learning/videos/brushing/rinse_mouth.mp4",image:"/learning/brushing/step6.png",action:{type:"guided-step",step:8,expected:"continue"}},
      {title:"Rinse and store the toothbrush",instruction:"Rinse the toothbrush and put it back in its place.",tamil:"பிரஷ்ஷை கழுவி அதன் இடத்தில் வைக்கவும்.",audioText:"Rinse the toothbrush and put it back.",video:"/learning/videos/brushing/put_brush_back.mp4",image:"/learning/brushing/step6.png",action:{type:"guided-step",step:9,expected:"continue"}}
    ],
    adaptations:["Use picture instructions","Demonstrate each step","Allow extra practice time","Use audio prompts when needed"], activityType:"visual-sequence", audioEnabled:true, icon:"clean_hands", color:"#1565C0"
  },
  {
    moduleId: "adl-combing", title: "Combing Hair", description: "Practice a simple hair-grooming routine.", category: "ADL", skill: "Grooming", level: "Beginner", duration: 10,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Identify a comb", "Hold and use a comb", "Complete a grooming routine"],
    steps: ["Find the comb", "Hold the comb safely", "Start at the top", "Comb gently through the hair", "Return the comb"],
    adaptations: ["Use a large easy-grip comb", "Use a mirror", "Give hand-over-hand support when needed"], icon: "face", color: "#8E44AD"
  },
  {
    moduleId: "adl-dressing", title: "Dressing Practice", description: "Practice identifying clothes and following dressing steps.", category: "ADL", skill: "Self Care", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Identify clothing items", "Follow a dressing sequence", "Develop independence"],
    steps: ["Identify the clothing item", "Find the front", "Put on the clothing", "Adjust the clothing", "Place unused clothes properly"],
    adaptations: ["Use large fasteners", "Use visual sequence cards", "Provide physical assistance only when required"], icon: "checkroom", color: "#7E57C2"
  },
  {
    moduleId: "adl-buttoning", title: "Buttoning Practice", description: "Develop hand skills needed for fastening buttons.", category: "ADL", skill: "Dressing", level: "Beginner", duration: 12,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Identify buttons and holes", "Improve finger control", "Fasten and unfasten buttons"],
    steps: ["Hold the fabric", "Find the button hole", "Push the button through", "Pull the fabric gently", "Repeat with the next button"],
    adaptations: ["Start with large buttons", "Use a button board", "Use fewer buttons"], icon: "radio_button_checked", color: "#5E35B1"
  },
  {
    moduleId: "adl-toilet", title: "Toilet Routine", description: "Learn a structured and age-appropriate toilet routine.", category: "ADL", skill: "Toilet Training", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Recognise the toilet routine", "Follow hygiene steps", "Increase independence"],
    steps: ["Go to the toilet", "Use the toilet safely", "Flush", "Wash hands", "Dry hands", "Return to the activity"],
    adaptations: ["Use a visual sequence", "Use consistent verbal prompts", "Provide privacy and appropriate support"], icon: "wc", color: "#00897B"
  },
  {
    moduleId: "adl-drinking", title: "Drinking Skills", description: "Practice safe and independent drinking from a cup.", category: "ADL", skill: "Drinking", level: "Beginner", duration: 10,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Identify a cup", "Hold a cup safely", "Drink independently"],
    steps: ["Pick up the cup", "Bring it to the mouth", "Take a small sip", "Lower the cup", "Place the cup back"],
    adaptations: ["Use a handled cup", "Use a smaller amount of liquid", "Use visual prompts"], icon: "local_drink", color: "#0288D1"
  },
  {
    moduleId: "adl-eating", title: "Eating Skills", description: "Practice basic eating routines and utensil use.", category: "ADL", skill: "Eating", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Identify eating utensils", "Practice spoon handling", "Build independent eating habits"],
    steps: ["Sit correctly", "Identify the spoon", "Hold the utensil", "Take food carefully", "Eat slowly", "Finish and clean the area"],
    adaptations: ["Use adapted utensils", "Use visual prompts", "Reduce distractions"], icon: "restaurant", color: "#FF7043"
  },
  {
    moduleId: "adl-grooming", title: "Personal Grooming", description: "Practice simple grooming routines such as washing hands and face.", category: "ADL", skill: "Grooming", level: "Beginner", duration: 12,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Recognise grooming items", "Follow a hygiene sequence", "Increase self-care independence"],
    steps: ["Choose the grooming item", "Wash or clean the required area", "Dry properly", "Put the item away"],
    adaptations: ["Use picture prompts", "Use one routine at a time", "Provide physical guidance when necessary"], icon: "soap", color: "#26A69A"
  },

  // Academic
  {
    moduleId: "academic-colours", title: "Colour Recognition", description: "Learn to identify and differentiate common colours.", category: "Academic", skill: "Colours", level: "Beginner", duration: 10,
    ageGroups: ["Early", "Middle"], objectives: ["Identify basic colours", "Match similar colours", "Use colour names"],
    steps: ["Look at the colour", "Listen to the colour name", "Find the matching colour", "Say or select the colour"],
    adaptations: ["Use high-contrast colours", "Use fewer choices", "Repeat instructions"], icon: "palette", color: "#E91E63"
  },
  {
    moduleId: "academic-numbers", title: "Number Recognition", description: "Recognise numbers and connect them with quantities.", category: "Academic", skill: "Numeracy", level: "Beginner", duration: 12,
    ageGroups: ["Early", "Middle"], objectives: ["Recognise numbers", "Count objects", "Match numbers with quantities"],
    steps: ["Look at the number", "Say or select the number", "Count the objects", "Match the quantity"],
    adaptations: ["Start with 1–3", "Use physical objects", "Provide visual counting support"], icon: "123", color: "#26A69A"
  },
  {
    moduleId: "academic-shapes", title: "Shape Recognition", description: "Identify common shapes through visual matching.", category: "Academic", skill: "Shapes", level: "Beginner", duration: 10,
    ageGroups: ["Early", "Middle"], objectives: ["Recognise basic shapes", "Match identical shapes", "Identify shapes in everyday objects"],
    steps: ["Look at the shape", "Name or select the shape", "Find the matching shape", "Find the shape in an object"],
    adaptations: ["Begin with two choices", "Use large visual cards", "Use familiar objects"], icon: "category", color: "#1565C0"
  },
  {
    moduleId: "academic-time", title: "Understanding Time", description: "Build basic understanding of daily routines and time concepts.", category: "Academic", skill: "Time", level: "Beginner", duration: 15,
    ageGroups: ["Middle", "Teen"], objectives: ["Recognise parts of the day", "Match activities to times", "Read simple clock times"],
    steps: ["Identify morning, afternoon and night", "Match a routine to its time", "Read a simple clock", "Arrange daily activities"],
    adaptations: ["Use routine pictures", "Start with full-hour times", "Use a visual timetable"], icon: "schedule", color: "#3949AB"
  },
  {
    moduleId: "academic-money", title: "Money Skills", description: "Learn to recognise common coins and notes and practise simple purchasing.", category: "Academic", skill: "Money", level: "Intermediate", duration: 15,
    ageGroups: ["Middle", "Teen"], objectives: ["Recognise money", "Match prices and amounts", "Practise simple transactions"],
    steps: ["Identify the coin or note", "Match it to its value", "Choose money for a simple price", "Practise giving and receiving money"],
    adaptations: ["Use large visual money cards", "Start with two denominations", "Use real-life role play"], icon: "payments", color: "#43A047"
  },
  {
    moduleId: "academic-reading", title: "Early Reading", description: "Build early reading skills using familiar words and pictures.", category: "Academic", skill: "Reading", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Recognise familiar words", "Connect words with pictures", "Follow simple text"],
    steps: ["Look at the word", "Listen to the word", "Match it with a picture", "Read or select the word"],
    adaptations: ["Use large print", "Use picture-word cards", "Accept pointing or AAC responses"], icon: "menu_book", color: "#1E88E5"
  },
  {
    moduleId: "academic-alphabet", title: "Alphabet Skills", description: "Recognise letters and connect uppercase and lowercase forms.", category: "Academic", skill: "Alphabet", level: "Beginner", duration: 12,
    ageGroups: ["Early", "Middle"], objectives: ["Recognise letters", "Match uppercase and lowercase", "Connect letters with sounds"],
    steps: ["Look at the letter", "Say or hear the letter", "Match uppercase and lowercase", "Find a familiar word beginning with it"],
    adaptations: ["Teach a few letters at a time", "Use tactile letters", "Use picture cues"], icon: "abc", color: "#AB47BC"
  },
  {
    moduleId: "academic-prewriting", title: "Pre-Writing Skills", description: "Develop early pencil control through lines, curves and simple patterns.", category: "Academic", skill: "Pre-Writing", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle"], objectives: ["Improve pencil grasp", "Trace basic patterns", "Develop hand control"],
    steps: ["Hold the writing tool", "Trace straight lines", "Trace curves", "Copy simple shapes", "Complete a simple pattern"],
    adaptations: ["Use thick pencils or crayons", "Use tracing guides", "Allow breaks between tasks"], icon: "edit", color: "#FB8C00"
  },

  // Motor
  {
    moduleId: "motor-fine", title: "Fine Motor Practice", description: "Develop hand and finger control through simple activities.", category: "Motor", skill: "Fine Motor", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Improve finger movement", "Improve grasp", "Improve hand control"],
    steps: ["Pick up objects", "Move objects between containers", "Stack objects", "Place objects accurately"],
    adaptations: ["Use larger objects", "Reduce the number of objects", "Provide additional support"], icon: "pan_tool", color: "#5C6BC0"
  },
  {
    moduleId: "motor-coordination", title: "Eye-Hand Coordination", description: "Practise coordinating visual attention with hand movements.", category: "Motor", skill: "Eye-Hand Coordination", level: "Beginner", duration: 12,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Track objects visually", "Reach accurately", "Improve coordination"],
    steps: ["Look at the target", "Reach toward the target", "Touch or move the target", "Repeat with different positions"],
    adaptations: ["Use large targets", "Increase target contrast", "Slow down the activity"], icon: "touch_app", color: "#26A69A"
  },
  {
    moduleId: "motor-gross", title: "Gross Motor Activities", description: "Build whole-body movement, balance and basic coordination.", category: "Motor", skill: "Gross Motor", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Improve balance", "Practise large movements", "Build body coordination"],
    steps: ["Warm up", "Walk along a simple path", "Reach and move arms", "Practise balance", "Cool down"],
    adaptations: ["Use support rails or a chair when appropriate", "Shorten the movement sequence", "Allow rest breaks"], icon: "directions_run", color: "#43A047"
  },
  {
    moduleId: "motor-physical", title: "Physical Activity Routine", description: "Follow a simple structured physical activity routine.", category: "Motor", skill: "Physical Activity", level: "Beginner", duration: 15,
    ageGroups: ["Middle", "Teen"], objectives: ["Follow a movement routine", "Improve stamina", "Build participation"],
    steps: ["Warm up", "Follow guided movements", "Complete a simple activity", "Take a rest", "Cool down"],
    adaptations: ["Adjust intensity", "Use visual movement cards", "Provide seated alternatives when suitable"], icon: "fitness_center", color: "#00897B"
  },
  {
    moduleId: "motor-outdoor", title: "Outdoor Play", description: "Use simple outdoor games to support movement and social participation.", category: "Motor", skill: "Outdoor Play", level: "Beginner", duration: 20,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Participate in outdoor play", "Practise movement skills", "Build social participation"],
    steps: ["Choose a safe activity", "Follow the rules", "Take turns", "Complete the activity", "Cool down"],
    adaptations: ["Use simple rules", "Reduce group size", "Provide close supervision"], icon: "sports_soccer", color: "#2E7D32"
  },

  // Language
  {
    moduleId: "language-vocabulary", title: "Everyday Vocabulary", description: "Build vocabulary using familiar objects and pictures.", category: "Language", skill: "Expressive Language", level: "Beginner", duration: 10,
    ageGroups: ["Early", "Middle"], objectives: ["Identify familiar objects", "Understand object names", "Practise communication"],
    steps: ["Look at the picture", "Listen to the word", "Select the matching picture", "Say, sign or communicate the word"],
    adaptations: ["Use picture communication", "Accept gestures or signs", "Use fewer choices"], icon: "record_voice_over", color: "#AB47BC"
  },
  {
    moduleId: "language-receptive", title: "Receptive Language", description: "Practise understanding words, instructions and simple questions.", category: "Language", skill: "Receptive Language", level: "Beginner", duration: 12,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Understand simple instructions", "Identify named objects", "Respond to simple questions"],
    steps: ["Listen to the instruction", "Look for the requested item", "Follow one step", "Progress to two steps", "Respond to a simple question"],
    adaptations: ["Use gestures", "Use one-step instructions", "Repeat and simplify language"], icon: "hearing", color: "#8E24AA"
  },
  {
    moduleId: "language-expressive", title: "Expressive Language", description: "Encourage children to communicate needs, choices and ideas.", category: "Language", skill: "Expressive Language", level: "Beginner", duration: 12,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Make choices", "Name familiar items", "Communicate needs"],
    steps: ["Choose an object or picture", "Name or point to it", "Use a word, sign or communication aid", "Build a short phrase"],
    adaptations: ["Accept AAC, gestures or signs", "Use choice boards", "Give extra response time"], icon: "chat", color: "#7E57C2"
  },
  {
    moduleId: "language-story", title: "Story and Picture Sequence", description: "Use pictures to understand and arrange simple story sequences.", category: "Language", skill: "Story Sequencing", level: "Intermediate", duration: 15,
    ageGroups: ["Middle", "Teen"], objectives: ["Understand sequence", "Identify beginning and ending", "Answer simple questions"],
    steps: ["Look at the pictures", "Identify what is happening", "Arrange the pictures", "Answer simple questions"],
    adaptations: ["Use shorter stories", "Use familiar situations", "Provide verbal or visual prompts"], icon: "auto_stories", color: "#7E57C2"
  },
  {
    moduleId: "language-rhymes", title: "Rhymes and Songs", description: "Use familiar rhymes and songs to support listening and communication.", category: "Language", skill: "Rhymes", level: "Beginner", duration: 10,
    ageGroups: ["Early", "Middle"], objectives: ["Attend to sounds", "Imitate words or actions", "Participate in familiar rhymes"],
    steps: ["Listen to the rhyme", "Watch the actions", "Join with a sound or word", "Repeat the action or phrase"],
    adaptations: ["Use action-based rhymes", "Repeat short phrases", "Accept non-verbal participation"], icon: "music_note", color: "#EC407A"
  },
  {
    moduleId: "language-lip-tongue", title: "Lip and Tongue Exercises", description: "Use simple guided oral-motor exercises as part of communication practice.", category: "Language", skill: "Oral Motor Practice", level: "Beginner", duration: 8,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Increase awareness of mouth movements", "Imitate simple movements", "Support communication practice"],
    steps: ["Sit comfortably", "Watch the demonstration", "Move the lips as shown", "Move the tongue as shown", "Repeat gently"],
    adaptations: ["Use mirror demonstration", "Use short repetitions", "Stop if the child is uncomfortable"], icon: "face", color: "#D81B60"
  },
  {
    moduleId: "language-sign", title: "Basic Sign Communication", description: "Introduce simple signs for common needs, objects and choices.", category: "Language", skill: "Sign Language", level: "Beginner", duration: 12,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Recognise common signs", "Use signs for choices", "Communicate basic needs"],
    steps: ["Watch the sign", "Imitate the movement", "Match the sign to a picture", "Use the sign to make a choice"],
    adaptations: ["Teach a few signs at a time", "Pair signs with pictures", "Accept the child's preferred communication method"], icon: "sign_language", color: "#5E35B1"
  },

  // Vocational
  {
    moduleId: "vocational-tools", title: "Tool Identification", description: "Identify common tools and understand their basic use.", category: "Vocational", skill: "Tool Identification", level: "Beginner", duration: 15,
    ageGroups: ["Teen"], objectives: ["Identify common tools", "Match tools with uses", "Develop workplace awareness"],
    steps: ["Look at the tool", "Identify its name", "Match the tool to its use", "Practise safe handling"],
    adaptations: ["Use photographs first", "Introduce one tool at a time", "Provide close supervision"], icon: "build", color: "#795548"
  },
  {
    moduleId: "vocational-machines", title: "Machine Identification", description: "Recognise common machines and understand their basic purpose.", category: "Vocational", skill: "Machine Identification", level: "Beginner", duration: 15,
    ageGroups: ["Teen"], objectives: ["Recognise common machines", "Match machines with tasks", "Learn basic safety awareness"],
    steps: ["Look at the machine", "Learn its name", "Identify what it does", "Identify basic safety rules"],
    adaptations: ["Use photographs or videos", "Teach one machine at a time", "Keep practical equipment supervised"], icon: "precision_manufacturing", color: "#6D4C41"
  },
  {
    moduleId: "vocational-leather-tracing", title: "Leather Tracing", description: "Practise tracing simple patterns used in leather product work.", category: "Vocational", skill: "Leather Tracing", level: "Beginner", duration: 20,
    ageGroups: ["Teen"], objectives: ["Follow a pattern", "Improve hand control", "Prepare a simple traced design"],
    steps: ["Choose the pattern", "Position the template", "Trace the outline", "Check the traced line", "Store the material safely"],
    adaptations: ["Use large simple patterns", "Use thick guide lines", "Provide hand guidance"], icon: "draw", color: "#8D6E63"
  },
  {
    moduleId: "vocational-stitching", title: "Stitching Practice", description: "Practise basic stitching movements using suitable materials.", category: "Vocational", skill: "Stitching", level: "Intermediate", duration: 20,
    ageGroups: ["Teen"], objectives: ["Develop hand control", "Follow a stitching pattern", "Build vocational readiness"],
    steps: ["Identify the materials", "Follow the marked line", "Complete simple stitches", "Check the finished work"],
    adaptations: ["Use larger holes", "Use thick thread", "Use pre-marked patterns"], icon: "content_cut", color: "#8D6E63"
  },
  {
    moduleId: "vocational-leather-cutting", title: "Leather Cutting Practice", description: "Practise following marked cutting lines with appropriate supervision.", category: "Vocational", skill: "Leather Cutting", level: "Intermediate", duration: 20,
    ageGroups: ["Teen"], objectives: ["Follow marked lines", "Develop accuracy", "Understand basic safety"],
    steps: ["Inspect the pattern", "Identify the cutting line", "Follow the demonstration", "Complete the supervised cut", "Check the edge"],
    adaptations: ["Use safe training tools", "Start with soft materials", "Require close adult supervision"], icon: "content_cut", color: "#A1887F"
  },
  {
    moduleId: "vocational-leather-pasting", title: "Leather Pasting", description: "Practise applying and joining materials to create simple products.", category: "Vocational", skill: "Leather Pasting", level: "Beginner", duration: 15,
    ageGroups: ["Teen"], objectives: ["Apply material accurately", "Follow a joining pattern", "Keep the workspace organised"],
    steps: ["Prepare the pieces", "Apply the appropriate amount", "Align the pieces", "Press and hold", "Clean the workspace"],
    adaptations: ["Use larger pieces", "Use pre-cut materials", "Provide direct supervision for adhesives"], icon: "layers", color: "#795548"
  },
  {
    moduleId: "vocational-leather-punching", title: "Leather Punching Practice", description: "Practise placing holes along a simple marked pattern with safe supervision.", category: "Vocational", skill: "Leather Punching", level: "Intermediate", duration: 20,
    ageGroups: ["Teen"], objectives: ["Follow marked positions", "Develop hand control", "Learn basic tool safety"],
    steps: ["Mark the positions", "Position the material", "Watch the demonstration", "Punch each marked position", "Check the pattern"],
    adaptations: ["Use pre-marked materials", "Use training tools", "Provide close supervision"], icon: "radio_button_unchecked", color: "#6D4C41"
  },

  // Therapeutic / recreational
  {
    moduleId: "therapeutic-yoga", title: "Yoga and Movement", description: "Follow simple age-appropriate movement and breathing activities.", category: "Therapeutic", skill: "Yoga", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Follow simple movements", "Practise controlled breathing", "Support participation and relaxation"],
    steps: ["Sit or stand comfortably", "Follow the warm-up", "Try simple poses", "Practise slow breathing", "Relax and finish"],
    adaptations: ["Use seated alternatives", "Demonstrate visually", "Allow rest breaks"], icon: "self_improvement", color: "#43A047"
  },
  {
    moduleId: "therapeutic-music", title: "Music Therapy Activities", description: "Use rhythm, music and simple instruments to encourage participation and expression.", category: "Therapeutic", skill: "Music", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Attend to rhythm", "Imitate simple patterns", "Encourage expression and participation"],
    steps: ["Listen to the rhythm", "Choose an instrument", "Copy a simple beat", "Take turns", "Finish with a calm song"],
    adaptations: ["Use low-volume sounds", "Offer sensory-friendly choices", "Allow non-verbal participation"], icon: "music_note", color: "#EF6C00"
  },
  {
    moduleId: "therapeutic-play", title: "Play Therapy Activities", description: "Use structured play to support communication, attention and participation.", category: "Therapeutic", skill: "Play Therapy", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle"], objectives: ["Engage in structured play", "Practise turn taking", "Build attention and interaction"],
    steps: ["Choose a play activity", "Follow the simple rule", "Take a turn", "Wait for another turn", "Finish and tidy up"],
    adaptations: ["Use preferred toys", "Start with short turns", "Reduce the number of rules"], icon: "toys", color: "#FF7043"
  },
  {
    moduleId: "therapeutic-gardening", title: "Gardening Activities", description: "Use simple gardening tasks to build motor, sensory and routine skills.", category: "Therapeutic", skill: "Gardening", level: "Beginner", duration: 20,
    ageGroups: ["Middle", "Teen"], objectives: ["Follow a simple gardening routine", "Develop hand skills", "Encourage responsibility"],
    steps: ["Choose a plant", "Prepare the soil", "Place the seed or plant", "Water gently", "Clean the area"],
    adaptations: ["Use raised containers", "Use lightweight tools", "Provide gloves for sensory comfort"], icon: "yard", color: "#558B2F"
  },
  {
    moduleId: "therapeutic-computer", title: "Computer Aided Learning", description: "Use simple computer activities to practise learning and independence.", category: "Therapeutic", skill: "Computer Aided Education", level: "Beginner", duration: 15,
    ageGroups: ["Middle", "Teen"], objectives: ["Use basic computer controls", "Follow simple digital tasks", "Build confidence with technology"],
    steps: ["Wake or open the device", "Use the mouse or touch screen", "Open the assigned activity", "Complete the task", "Exit safely"],
    adaptations: ["Use larger controls", "Use touch input", "Provide visual step cards"], icon: "computer", color: "#1976D2"
  },
  {
    moduleId: "therapeutic-social", title: "Social Interaction", description: "Practise greetings, turn taking and simple social interactions.", category: "Therapeutic", skill: "Social Skills", level: "Beginner", duration: 15,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Practise greetings", "Take turns", "Respond to simple social cues"],
    steps: ["Greet the person", "Listen", "Take a turn", "Respond", "Say goodbye"],
    adaptations: ["Use role play", "Use picture prompts", "Allow alternative communication"], icon: "groups", color: "#00897B"
  },

  // Specialized care
  {
    moduleId: "specialized-adl", title: "Individual ADL Support", description: "Provide structured practice for students requiring additional support with daily routines.", category: "Specialized Care", skill: "Individualized ADL", level: "Beginner", duration: 20,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Identify an individual ADL goal", "Practise one routine", "Build independence at the learner's pace"],
    steps: ["Select the target routine", "Break it into small steps", "Demonstrate the step", "Support the learner to practise", "Record the level of assistance"],
    adaptations: ["Use an individual visual schedule", "Use task analysis", "Adjust prompts to the learner's needs"], icon: "accessibility_new", color: "#455A64"
  },
  {
    moduleId: "specialized-intensive", title: "Intensive Support Routine", description: "Provide a highly structured activity routine for learners who require intensive support.", category: "Specialized Care", skill: "Intensive Support", level: "Beginner", duration: 20,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Follow a predictable routine", "Increase participation", "Reduce task complexity"],
    steps: ["Prepare the environment", "Show the first step", "Provide the required support", "Complete one step at a time", "End with a familiar routine"],
    adaptations: ["Use one-to-one support", "Use consistent prompts", "Allow frequent breaks"], icon: "support_agent", color: "#546E7A"
  },
  {
    moduleId: "specialized-assessment", title: "Assessment Based Intervention", description: "Use observed performance to choose and adjust an individual learning activity.", category: "Specialized Care", skill: "Assessment Based Intervention", level: "Intermediate", duration: 20,
    ageGroups: ["Early", "Middle", "Teen"], objectives: ["Observe current performance", "Identify a target skill", "Adjust the activity based on performance"],
    steps: ["Choose the target skill", "Observe the learner", "Record successful and difficult steps", "Adjust prompts or task difficulty", "Plan the next practice"],
    adaptations: ["Use individual goals", "Repeat observations", "Consult the responsible teacher or therapist"], icon: "assignment_turned_in", color: "#37474F"
  }
];


// Keep the existing module catalogue/UI data, while normalising every module into
// the same observable, multilingual micro-step structure used by the learner UI.
const categoryToFACP = {
  ADL: "Personal",
  Academic: "Academic",
  Motor: "Personal",
  Language: "Social",
  Vocational: "Occupational",
  Therapeutic: "Personal",
  "Specialized Care": "Personal",
};

function enrichModules() {
  for (const module of modules) {
    const facpDomain = categoryToFACP[module.category] || "Personal";
    const domain = DOMAINS.find(d => d.id === facpDomain);
    const facpLevels = getModuleFACPLevels(module.moduleId);

    if (!facpLevels.length) {
      throw new Error(`No FACP functional-level mapping configured for module: ${module.moduleId}`);
    }

    // Curriculum-safe semantic mapping. Never assign the first checklist rows
    // simply because they are available; that can associate an unrelated FACP
    // skill with a learning module. The official catalogue is searched only
    // inside the module's configured FACP level(s) and domain.
    const moduleTokens = new Set(
      [module.title, module.skill, module.description, ...(module.objectives || []), ...(module.steps || [])]
        .join(' ')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(x => x.length > 2)
    );
    const codes = [];
    for (const level of facpLevels) {
      const rows = (domain?.levels?.find(x => x.level === level)?.items || []);
      const ranked = rows.map(item => {
        const itemTokens = new Set(String(item.text || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(x => x.length > 2));
        let score = 0;
        for (const token of moduleTokens) if (itemTokens.has(token)) score += 1;
        return { item, score };
      }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
      for (const x of ranked.slice(0, 8)) {
        if (!codes.includes(x.item.id)) codes.push(x.item.id);
        if (codes.length >= 8) break;
      }
      if (codes.length >= 8) break;
    }

    if (!codes.length) {
      throw new Error(`No semantically relevant official FACP item mapping found for module: ${module.moduleId} (${facpDomain}, ${facpLevels.join(', ')})`);
    }
    module.facpDomain = facpDomain;
    module.facpLevels = facpLevels;
    module.facpItemCodes = codes;

    if (!Array.isArray(module.interactiveSteps) || module.interactiveSteps.length === 0) {
      module.interactiveSteps = (module.steps || []).map((instruction, index) => ({
        title: instruction,
        instruction,
        tamil: "",
        emoji: module.coverEmoji || "🌟",
        image: "",
        video: "",
        audio: "",
        audioText: instruction,
        action: { type: "guided-step", step: index + 1, expected: "continue" },
        choices: [],
        correctChoice: "",
      }));
    }
  }
}

enrichModules();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await LearningModule.deleteMany({});
    await LearningModule.insertMany(modules);
    console.log(`Seeded ${modules.length} learning modules.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Learning module seed failed:", error);
    process.exit(1);
  }
}

seed();
