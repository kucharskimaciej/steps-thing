# Plan: Implement Session Detail And Cart Feed

## Phases

1. Tracer: owned session detail loads session + steps and selects active step.
2. Add unlocked sidebar add/remove/clear and selected count.
3. Add cart feed modal using selected steps and `collectionId`.
4. Add locked read-only behavior and delete session.
5. Add mobile initial modal behavior and tests.

## Files

- `app/(authenticated)/sessions/[sessionId]/page.tsx`
- `components/sessions/session-detail.tsx`
- `components/sessions/session-step-sidebar.tsx`
- `components/sessions/session-cart-modal.tsx`
- `tests/components/session-detail.test.tsx`

## Verification

- `pnpm test -- --run`
- `pnpm typecheck`
- `pnpm lint`
- Manual add/remove/lock/practice checks.

## Commit Message

`feat(sessions): implement session detail`

## Unresolved Questions

- Should removing a session require confirmation?
