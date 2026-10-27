# V4 Implementation Notes

The legacy LearningScreenPage game implementations were replaced by a single unified game runner. Legacy dedicated routes (`/learn/picture-identification`, `/learn/drag-drop`, `/learn/memory`, `/learn/sequence`, `/learn/emotions`, `/learn/handwashing`, `/learn/money`) now resolve to the unified runner so those URLs cannot bypass the common metrics architecture.

`useGameSession.ts` remains the source of truth for session timer, attempts, help, single-submit protection and performance calculation.
