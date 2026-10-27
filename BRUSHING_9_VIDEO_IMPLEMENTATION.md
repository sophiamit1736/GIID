# Brushing Teeth – 9 Unique Video Steps

The project contains exactly 9 supplied brushing-teeth videos and maps them one-to-one to 9 learning steps.

1. Find the toothbrush → `finding toothbrush.mp4`
2. Pick up the toothbrush → `pick up brush.mp4`
3. Wet the toothbrush → `wet toothbrush.mp4`
4. Open the toothpaste cap → `open tooth paste cap.mp4`
5. Squeeze toothpaste onto the brush → `Apply Toothpaste on Brush.mp4`
6. Spread the toothpaste on the brush → `apply toothpaste.mp4`
7. Brush your teeth → `brushing teeth.mp4`
8. Rinse your mouth → `Rinse Mouth.mp4`
9. Put the toothbrush back → `Put toothbrush back.mp4`

No clip is repeated. The backend schema also validates that `adl-brushing` contains exactly nine unique video URLs.

## Update MongoDB

From `backend`:

```powershell
node updateBrushingModule.js
```

The learning-module UI reads `interactiveSteps[step].video`, so the selected clip is shown for the current step.

The existing ActivityResult/ALPI/ML pipeline is not removed by this change. Game results continue to be saved for the selected student and included in the existing ALPI calculation.
