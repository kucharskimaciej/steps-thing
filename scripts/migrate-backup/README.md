# Backup Migration Tooling

Canonical backup:

```bash
backups/database.20260507-110251
```

Audit is credential-free and reads Firestore-export-shaped JSON:

```bash
pnpm migration:audit
pnpm migration:audit -- --backup=backups/database.20260507-110251
```

Import defaults to dry-run. Dry-run audits constrained domain values and reports
counts without calling Convex:

```bash
pnpm migration:import
```

Write mode is explicit:

```bash
STEPS_ADMIN_USER_IDS="clerk-user-id" \
CONVEX_ADMIN_TOKEN="..." \
CONVEX_ADMIN_USER_ID="clerk-user-id" \
NEXT_PUBLIC_CONVEX_URL="https://..." \
pnpm migration:import -- --write
```

The import mutation upserts by `legacyId`, so reruns replace the same imported
records instead of creating duplicates. Sessions resolve `legacyStepIds` after
step import.

Backfills are explicit Convex admin mutations:

```bash
pnpm exec convex run adminBackfills:refreshSmartTags
pnpm exec convex run adminBackfills:recreateThumbnails
pnpm exec convex run adminBackfills:recomputeTokens
```

`recreateThumbnails` clears generated image keys and marks affected steps with
`needsVideoProcessing`. A later video-processing story can consume that marker.
