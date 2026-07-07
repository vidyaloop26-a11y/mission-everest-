# Mission Everest — PRD

## Original Problem Statement
Build a 3-day Everest Expedition Leadership Internship simulation called **Mission Everest** for school students (ages 13–17), using the Vidyaloop stage documents.

- **Stage 1** — Build the full shell (5 screens: Onboarding, Expedition Chat, Weather & Route Feed, DMs, Day Reflection) and Day 1 (7 scenes). Stop at Day 1 Reflection with disabled "Report for Day 2" button.
- **Stage 2** — Build Day 2 completely, carrying forward variables from Day 1. Stop at Day 2 Reflection with disabled "Report for Day 3" button.

## Architecture
- **Stack:** React (CRA) + Tailwind CSS + shadcn/ui components. sessionStorage for all state (Supabase migration deferred). No backend calls used in Stage 1 & 2.
- **State store:** `/app/frontend/src/lib/expeditionStore.js` — single `sessionStorage` key `mission_everest_state` holds intern_name, current_day, current_scene_index, per-day decision maps, per-day reflection choices, and 12 variables.
- **Content is data-driven:** all dialogue, decisions, feed items, DMs live in JSON under `/app/frontend/src/data/` (day1.json, day2.json, feed.json, dms.json, characters.json). Zero hardcoded story in components.
- **Design:** Himalayan expedition aesthetic — icy blues, granite greys, warm amber accents. Bricolage Grotesque display, Manrope body, JetBrains Mono for tickers. Basecamp operations centre feel with mountain gradient header band and subtle grain.

## Personas
- **Primary:** School students (ages 13–17) doing a self-paced 3-day leadership simulation.
- **Secondary:** Vidyaloop program managers reviewing student progress (future dashboard, not in scope).

## Core Requirements (static)
- 5 screens: Onboarding, Expedition Chat, Weather & Route Feed, DMs, Day Reflection.
- Verbatim dialogue and decisions from Stage documents.
- 12 numeric variables applied on every decision.
- Character voices preserved: Arjun (strategic), Maya (medical), Tenzin (disciplined), Priya (logistical).
- Read-only Feed & DMs. Decision cards inline, dismiss after selection, Continue after character reaction.

## What's Been Implemented
- **2026-02 · Stage 1** — Onboarding, Expedition Chat with typing-delayed messages, inline decisions, character reactions, variable-change chips; Weather & Route Feed (8 Day-1 items); DMs; Day 1 Reflection with disabled "Report for Day 2" button; sessionStorage persistence.
- **2026-02 · Stage 2** — Day 2 (7 scenes: Morning Brief, Khumbu Icefall, Weather Update, Camp I, Oxygen/Energy, Evening Review) with decisions D5–D8. Feed extended with 7 Day-2 items (incl. the two 2.3 alerts). Day 2 Reflection with "Report for Day 3" disabled. Variables carry forward. "Report for Day 2" enabled and advances state.
- **2026-02 · Stage 3** — Day 3 (7 scenes: Summit Briefing, Death Zone, Final Ridge, Summit Decision, Summit Reached, The Descent, Mission Debrief) with decisions D9–D12. Feed extended with 6 Day-3 items (incl. the two 3.3 alerts). Day 3 Reflection routes to the **Final Summary Card** which displays all 12 variables (with deltas), a signature-trait line based on the highest of Leadership/Teamwork/Risk Management/Decision Quality, the "No certificate is generated" note, and a **Start Over** button that clears sessionStorage and returns to Onboarding.

## Prioritized Backlog
### P0 — Stage 3 (next)
- Build Day 3 (Summit Push): scenes, Hillary Step decision, oxygen crisis, summit call, descent, end-of-mission report with variable scoring readout.

### P1
- Persist state to Supabase; add teacher/admin dashboard.
- Add "Export mission report" card for students to download at end of Day 3.
- Add unread-count indicators on Feed & DMs (currently a single dot).

### P2
- Voice-over narration per character (ElevenLabs) toggle.
- Accessibility pass: reduced-motion mode, screen-reader labels on avatars.
- Localisation-ready dialogue JSON (Hindi, regional languages).

## Next Tasks
1. Await user review of Stage 2 output.
2. On approval, ingest Stage 3 document and build Day 3 following the same day-aware pattern.
3. Wire final scoring screen and a shareable PDF summary.
