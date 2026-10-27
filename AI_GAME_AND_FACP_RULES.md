# LearnAble Phase-II: FACP + ALPI + AI Game Rules

## New learner / admission workflow
1. Create the student. Registration does **not** accept or invent a FACP score.
2. Open FACP Assessment for the student.
3. Select the appropriate functional level and Entry assessment period.
4. Record the observed FACP code for each applicable checklist item.
5. Save Entry observations. The system calculates the current FACP quantitative percentage.
6. After the teacher has completed the Entry assessment cycle, click **Finalize Entry Baseline**. This stores an immutable admission baseline snapshot.
7. Later quarterly assessments update the current FACP score but never overwrite the baseline.
8. ALPI starts at 0 until the learner completes learning activities/games.

## FACP quantitative calculation
Source-aligned codes:
- + = Yes / child can perform without help
- C = Occasional Cueing
- VP = Verbal Prompting
- PP = Physical Prompting
- GP = Gestural Prompting
- M = Modelling
- - = No; task has to be completely done for the child
- NA = Not Applicable; deleted from the total
- NE = No Exposure; recorded but not a pass

LearnAble quantitative percentage:
`(+ and C pass observations) / (all recorded observations except NA) * 100`

80% is used as the project progression criterion. Recreation uses the separate A/B/C/D/E/NE grading scheme and is not mixed into this percentage.

## ALPI
ALPI is a LearnAble project-specific learning-performance index, not an official FACP score.

For each completed game/activity:
- Accuracy = correct answers / total questions * 100
- Completion = completed items / total questions * 100
- Time efficiency = based on timeTaken vs timeLimit; if no time limit is supplied, 100
- Independence = reduced by repeated attempts and help requests
- Efficiency = 60% time efficiency + 40% independence
- Performance Index = 55% accuracy + 30% efficiency + 15% completion

ALPI = recency-weighted average of the latest 10 Performance Index values; newer activities have greater weight.

FACP and ALPI are stored separately. Recommendation readiness may use both, but ALPI is never written into FACP.

## AI game generation
AI generation does not require video and does not require `interactiveSteps` to be present.

The system retrieves FACP/module knowledge using RAG and sends learner capability information to Groq. Groq generates the **playable game configuration**. The fixed React game engine renders that configuration.

The AI may choose:
- visual-sequence
- matching
- choice
- drag-sort
- memory

The game is validated before it is approved. Invalid game output is regenerated up to four times.

The adaptive student-aware flow chooses the target skill from:
1. support-needing FACP item/domain, when available;
2. otherwise weakest recent activity domain;
3. otherwise an active learning module selected without repeatedly choosing the same recent activity.

The game difficulty is based on current learner capability/performance, not on a hard-coded brushing-teeth topic.
