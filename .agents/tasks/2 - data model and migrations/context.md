# Data Model And Migration Context

The rewrite stores canonical data in Convex. Normalize legacy snake_case fields to camelCase in new code, but support migration from the legacy Firebase shape.

Core entities:

- Step
- Video object embedded in Step
- Practice record embedded in Step
- Practice session

All private records must be owner-scoped. Public step reads are allowed by step ID.

Important derived helpers:

- Tags grouped into `kind`, `difficulty`, `feeling`, `artist`, `content`, `meta`, and `all`.
- Existing user tags and artists.
- Variations by `variationKey`.
- Steps by practice date.
- Next per-user `identifier`.

