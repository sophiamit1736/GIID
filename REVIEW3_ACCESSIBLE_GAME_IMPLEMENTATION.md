# LearnAble Review 3 — Accessible Adaptive Game Implementation

This update keeps the existing FACP + BKT + ALPI + RAG + Groq adaptive architecture and upgrades the generated-game experience for GIID learners.

## End-to-end flow

FACP assessment -> FACP functional-level eligibility -> BKT/ALPI/recent performance -> selected learning module -> learning level/difficulty -> pedagogically appropriate game type -> RAG grounding -> Groq game generation -> validation/repair -> accessible playable game -> ActivityResult -> ALPI/BKT update -> next recommendation.

## Accessibility changes

- Large tap-first controls.
- No countdown timer in AI-generated games; elapsed time is still recorded for analytics.
- Wrong choices can be retried instead of immediately ending a round.
- Visual concept cues are shown with semantic emoji/local visual keys.
- Audio instruction and item-level read-aloud use the browser Speech Synthesis API.
- English/Tamil display toggle.
- Short labels are preferred over long instructional sentences.
- Sequence and sorting activities can be completed with taps; drag is not required.
- Social/communication modules prefer choice-based situational games over text-heavy sequence games.
- Responsive layout for desktop/tablet/mobile.
- AI schema now supports shortLabel, audioText, Tamil text, visualKey and per-option metadata.

## Important scope note

These are broad accessibility defaults. They do not diagnose or infer an individual learner's disability needs. For a production deployment, a teacher/therapist should be able to configure learner-specific access preferences (for example audio preference, text visibility, reduced motion, switch/keyboard access, or other accommodations) based on the learner's actual needs.

## Verification

Backend JavaScript/Python syntax was checked after the update. Full frontend production build requires installing frontend dependencies with `npm install` in the user's environment.
