# EDLIZ Surfer

A small Next.js app for working through Zimbabwe's **EDLIZ 2025** (Essential
Medicines List and Standard Treatment Guidelines) a little at a time — the
goal is at least one topic a day.

- **Home** (`/`) — an overview of the app with a live "next topic" teaser.
- **Today** (`/today`) — shows the next topic in the guideline you haven't
  covered yet, with a streak counter and overall progress. Marking it done
  reveals a bonus topic if you want to keep going.
- **Browse** (`/browse`) — every chapter and section, collapsible, with a
  search box and completion checkmarks. Jump to anything out of order.
- Progress (completed topics + streak) is stored in your browser's
  `localStorage` — nothing leaves your machine, no account needed.

Content lives in `lib/edlizData.ts` — the guideline's chapters/sections,
extracted directly from the official EDLIZ 2025 PDF. `lib/topics.ts`
flattens that into the ordered curriculum the app walks through, and
`lib/formatTopicText.ts` reconstructs readable paragraphs/headings/lists
from the PDF extraction's raw line breaks.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Optional: AI-generated background notes

Each topic has a "Generate background notes" panel that calls an LLM (via
NVIDIA's API) for a short, supplementary note on the underlying concept —
e.g. a refresher on hypertension itself while reading the guideline's
*management* of hypertension. It deliberately never generates dosing or
treatment instructions — that stays sourced only from the guideline text —
and generated notes are cached in `localStorage` per topic so you're not
re-billed for repeat views.

To enable it: copy `.env.local.example` to `.env.local`, add an API key
from [build.nvidia.com](https://build.nvidia.com), and restart the dev
server. Without a key, the panel shows a clear "not configured" message
instead of failing silently — the rest of the app works fine either way.
