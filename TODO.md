# To-Do

## Layout & Structure
- Lock layout: top bar, category tiles, category modal overlay, checklist drawer, helper panel placement.
- HUD integration: cards + filters; show FF band/status; link checklist tasks to selected goal.

## Goals & Buckets
- Finalize goals: Stat Growth, War Readiness, Income, Faction Support, Custom (confirm/add any special cases like Chain Prep/Hospital Farming).
- Finalize time buckets: Month with Week1–4; filters for Today/This Week/This Month.

## Checklist & Persistence
- Implement checklist CRUD (add/edit/delete, tick/untick) with localStorage persistence.
- Group tasks by goal and bucket; add filters and "mark all done" per goal.
- Add notes and snooze per task; progress X/Y per goal/week.

## Helper/Recommendations
- Implement 4-part helper responses (Quick, Alternatives, Caution, Next Step); default to Stat Growth.
- Add Profile Insight to auto-plan when goals are missing; merge with user-set goals.

## Data & API Wiring
- Use TORN_API_KEY script property; default API_BASE=https://api.torn.com.
- Resolve user and faction names by ID; surface errors/empty responses.
- Status ribbon: Live/Fetching/Error; handle rate-limit responses gracefully (retry/backoff messaging).

## KPIs
- Stat Growth: sessions done/planned, time, estimated gain, FF band alignment.
- War Readiness: progress summary (e.g., scouted targets, FF readiness), extend to Income/Faction when data is available.

## Polish
- Optional demo/walkthrough toggle for onboarding.
- Confirm styling: dark, compact cards, clear spacing in modals and drawers.