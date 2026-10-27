# Brushing Teeth Videos

Place the following MP4 files in this folder. The application already references these paths from the `adl-brushing` module:

1. `brushing teeth.mp4` — finding/picking up the toothbrush and brushing
2. `put paste on brush.mp4` — opening toothpaste and putting toothpaste on the brush
3. `wash brush.mp4` — washing and storing the toothbrush

If your downloaded videos have different names, either rename them to the names above or update `backend/updateBrushingModule.js`.

After changing the video mapping, run:

```powershell
cd backend
node updateBrushingModule.js
```

The video is stored as a URL in `interactiveSteps[].video`; the actual MP4 remains in the frontend `public` folder and is not stored in MongoDB.
