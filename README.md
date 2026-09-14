# EDLIZ Surfer

A small Next.js app for working through Zimbabwe's **EDLIZ 2025** (Essential
Medicines List and Standard Treatment Guidelines) a little at a time — the
goal is at least one topic a day.

- **Today** (`/`) — shows the next topic in the guideline you haven't
  covered yet, with a streak counter and overall progress. Marking it done
  reveals a bonus topic if you want to keep going.
- **Browse** (`/browse`) — every chapter and section, collapsible, with a
  search box and completion checkmarks. Jump to anything out of order.
- Progress (completed topics + streak) is stored in your browser's
  `localStorage` — nothing leaves your machine, no account needed.

Content lives in `lib/edlizData.ts` — the guideline's chapters/sections,
extracted directly from the official EDLIZ 2025 PDF. `lib/topics.ts`
flattens that into the ordered curriculum the app walks through.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
