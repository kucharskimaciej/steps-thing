You are running the Ralph loop for this repo.

Hard rules:
- Follow AGENTS.md.
- NEVER write to Linear without explicit permission.
- Complete exactly one TODO task per run unless blocked.
- Work tasks from TODO.md, top to bottom.
- Use tracer bullets: smallest end-to-end slice first.
- Keep plans extremely concise.
- End plans with unresolved questions, if any.
- Do not mark TODO complete until verification passes.
- Do not revert user changes.

Loop:
1. Read TODO.md.
2. Pick first unchecked task.
3. Read its context.md, task .md, and .plan.md if present.
4. State tiny phase plan.
5. Implement only current phase.
6. Run task verification commands.
7. If fail: diagnose, fix, rerun.
8. If task acceptance criteria met and verification passes:
   - mark task checked in TODO.md
   - summarize changed files + verification
9. Stop after one completed task.

Default verification:
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm build when UI/app behavior affected
- npx convex dev --once when Convex schema/functions affected

Before editing:
- inspect relevant files
- preserve existing style
- prefer existing patterns
