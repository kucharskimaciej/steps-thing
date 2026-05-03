# TODO

Project tracking checklist generated from `tasks/`. Mark items complete here as work lands.

## 1. Project Setup

Context: [tasks/1 - project setup/context.md](tasks/1%20-%20project%20setup/context.md)

- [x] [Initialize Next.js and Convex app](tasks/1%20-%20project%20setup/1%20-%20initialize%20nextjs%20convex%20app.md)
- [x] [Configure auth and route protection](tasks/1%20-%20project%20setup/2%20-%20configure%20auth%20and%20route%20protection.md)
  - Manual Clerk/Convex sign-in verification is pending real local environment values.
- [ ] [Create app shell navigation and responsive layout](tasks/1%20-%20project%20setup/3%20-%20create%20app%20shell%20navigation%20and%20responsive%20layout.md)

## 2. Data Model And Migrations

Context: [tasks/2 - data model and migrations/context.md](tasks/2%20-%20data%20model%20and%20migrations/context.md)

- [ ] [Define Convex schema and indexes](tasks/2%20-%20data%20model%20and%20migrations/1%20-%20define%20convex%20schema%20and%20indexes.md)
- [ ] [Implement domain configuration and derived helpers](tasks/2%20-%20data%20model%20and%20migrations/2%20-%20implement%20domain%20configuration%20and%20derived%20helpers.md)
- [ ] [Implement owner-scoped queries and mutations](tasks/2%20-%20data%20model%20and%20migrations/3%20-%20implement%20owner%20scoped%20queries%20and%20mutations.md)
- [ ] [Create migration and backfill tooling](tasks/2%20-%20data%20model%20and%20migrations/4%20-%20create%20migration%20and%20backfill%20tooling.md)

## 3. Video Storage And Playback

Context: [tasks/3 - video storage and playback/context.md](tasks/3%20-%20video%20storage%20and%20playback/context.md)

- [ ] [Implement video hashing, upload, and duplicate detection](tasks/3%20-%20video%20storage%20and%20playback/1%20-%20implement%20video%20hashing%20upload%20and%20duplicate%20detection.md)
- [ ] [Implement video processing pipeline](tasks/3%20-%20video%20storage%20and%20playback/2%20-%20implement%20video%20processing%20pipeline.md)
- [ ] [Build video player and modal](tasks/3%20-%20video%20storage%20and%20playback/3%20-%20build%20video%20player%20and%20modal.md)

## 4. Step Authoring

Context: [tasks/4 - step authoring/context.md](tasks/4%20-%20step%20authoring/context.md)

- [ ] [Build step form validation and smart tags](tasks/4%20-%20step%20authoring/1%20-%20build%20step%20form%20validation%20and%20smart%20tags.md)
- [ ] [Implement create step page](tasks/4%20-%20step%20authoring/2%20-%20implement%20create%20step%20page.md)
- [ ] [Implement edit step page](tasks/4%20-%20step%20authoring/3%20-%20implement%20edit%20step%20page.md)
- [ ] [Implement inline edit modal](tasks/4%20-%20step%20authoring/4%20-%20implement%20inline%20edit%20modal.md)

## 5. Feed Search And Practice

Context: [tasks/5 - feed search and practice/context.md](tasks/5%20-%20feed%20search%20and%20practice/context.md)

- [ ] [Implement search filters, scoring, and sorting](tasks/5%20-%20feed%20search%20and%20practice/1%20-%20implement%20search%20filters%20scoring%20and%20sorting.md)
- [ ] [Build search overlay UI](tasks/5%20-%20feed%20search%20and%20practice/2%20-%20build%20search%20overlay%20UI.md)
- [ ] [Build virtualized feed and step actions](tasks/5%20-%20feed%20search%20and%20practice/3%20-%20build%20virtualized%20feed%20and%20step%20actions.md)
- [ ] [Implement view and practice recording](tasks/5%20-%20feed%20search%20and%20practice/4%20-%20implement%20view%20and%20practice%20recording.md)

## 6. Step List And Public Sharing

Context: [tasks/6 - step list and public sharing/context.md](tasks/6%20-%20step%20list%20and%20public%20sharing/context.md)

- [ ] [Implement private step list](tasks/6%20-%20step%20list%20and%20public%20sharing/1%20-%20implement%20private%20step%20list.md)
- [ ] [Implement public step page](tasks/6%20-%20step%20list%20and%20public%20sharing/2%20-%20implement%20public%20step%20page.md)

## 7. Sessions And Historical Practice

Context: [tasks/7 - sessions and historical practice/context.md](tasks/7%20-%20sessions%20and%20historical%20practice/context.md)

- [ ] [Implement sessions list](tasks/7%20-%20sessions%20and%20historical%20practice/1%20-%20implement%20sessions%20list.md)
- [ ] [Implement session detail and cart feed](tasks/7%20-%20sessions%20and%20historical%20practice/2%20-%20implement%20session%20detail%20and%20cart%20feed.md)
- [ ] [Implement historical session detail](tasks/7%20-%20sessions%20and%20historical%20practice/3%20-%20implement%20historical%20session%20detail.md)

## 8. Quality, Security, And Release

Context: [tasks/8 - quality security and release/context.md](tasks/8%20-%20quality%20security%20and%20release/context.md)

- [ ] [Complete automated test coverage](tasks/8%20-%20quality%20security%20and%20release/1%20-%20complete%20automated%20test%20coverage.md)
- [ ] [Perform security and access review](tasks/8%20-%20quality%20security%20and%20release/2%20-%20perform%20security%20and%20access%20review.md)
- [ ] [Create release smoke test and operational checklist](tasks/8%20-%20quality%20security%20and%20release/3%20-%20create%20release%20smoke%20test%20and%20operational%20checklist.md)

## Standard Verification

Run the relevant checks for each task before marking it complete. At minimum, setup requires:

- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm test`
- [x] `pnpm build`
