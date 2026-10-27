# Brushing Teeth Video Integration

The brushing module now uses short video clips instead of relying only on static images.

## Required files

Put these files under:

`frontend/public/learning/videos/brushing/`

- `brushing teeth.mp4`
- `put paste on brush.mp4`
- `wash brush.mp4`

## Steps represented

1. Find the toothbrush
2. Pick up the toothbrush
3. Open the toothpaste cap
4. Squeeze toothpaste onto the brush
5. Brush the teeth
6. Wash and store the toothbrush

The same short clip can intentionally be reused for closely related micro-steps. This avoids needing a separate video for every single action while still giving the learner a clear visual demonstration.

## Update MongoDB

From the backend folder:

```powershell
node updateBrushingModule.js
```

Then restart the backend if needed and refresh the frontend.

## Important

The MP4 files are not included in the source package. Add your own appropriately licensed/created clips to the folder above.
