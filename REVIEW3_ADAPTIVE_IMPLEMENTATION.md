# LearnAble Review 3 — Adaptive Recommendation and Game Quality

## Final runtime flow

Student -> FACP assessment -> FACP functional level + weak FACP item/domain -> eligible FACP-mapped learning modules -> BKT/ALPI/recent performance ranking -> selected learning module -> learner learning level controls game difficulty -> activity-specific AI game -> validation -> playable game -> performance result -> ALPI/BKT update -> next recommendation.

## Important boundaries

- FACP functional level is a hard curriculum eligibility filter.
- Beginner/Intermediate/Advanced is a learner difficulty signal, not an FACP placement.
- BKT estimates learner mastery; it does not invent curriculum topics.
- The recommendation engine chooses a module/activity before the LLM is called.
- The LLM generates a variation of the selected activity; it does not choose an unrelated topic.
- Generated games are validated before being saved.
- Games are kept separate from LearningModule records.

## Commands after updating the database

```powershell
cd C:\Users\sophi\Downloads\GIID\backend
npm install
npm run backfill:module-facp-levels
npm run verify:facp-mapping
```

Start BKT in another terminal:

```powershell
cd C:\Users\sophi\Downloads\GIID\backend
.\venv\Scripts\activate
python -m pip install -r requirements-ml.txt
python -m uvicorn ml_service:app --host 0.0.0.0 --port 8001
```

Then start Node:

```powershell
cd C:\Users\sophi\Downloads\GIID\backend
npm run dev
```

## Game selection

The generator prefers interaction types that match the selected module:

- routines/procedures -> visual sequence
- recognition -> matching
- classification -> drag-sort
- communication/social/decision -> choice
- recall/pairing -> memory

The generator receives the selected module title, skill, objectives, steps, FACP level, learning level, difficulty and recent game history. It is instructed not to switch topics or expose a separate learning-step screen.

## Data requirement

Run the semantic FACP mapping backfill on the existing MongoDB data. Do not use the older arbitrary first-items mapping. A module with no semantically matched official FACP items is reported as unmapped instead of being linked to an unrelated checklist item.
