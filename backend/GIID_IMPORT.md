# GIID Student Register Import

The seed dataset was generated from the `Altogether` sheet of the GIID student register supplied for LearnAble.

- Source rows imported: 101
- Unique source row IDs: 101
- Duplicate admission numbers are preserved as separate students when the source names differ.
- Aadhaar data is intentionally not imported into the application.
- `sourceRecordId` provides a stable, duplicate-safe link to the source register row.

Run:

```bash
npm run seed:giid
```

The command is safe to run repeatedly: existing rows are updated instead of duplicated.
