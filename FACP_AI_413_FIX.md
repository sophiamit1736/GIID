# FACP + AI 413 fixes

- FACP uses the supplied checklist functional levels and source domains; there is no ADL-1..ADL-12 official structure.
- For most functional levels the source contains Personal, Social, Academic, Occupational and Recreational.
- The supplied Care Group checklist contains Personal and Recreational sections; the UI now makes unavailable domains explicit instead of silently hiding them.
- AI game RAG context is capped to four retrieved chunks / 9000 characters and Groq output is capped at 3200 tokens to avoid oversized requests.
- HTTP 413 is no longer retried four times; it returns a clear request-too-large error.
- FACP item IDs are used correctly when validating AI-generated FACP references.
