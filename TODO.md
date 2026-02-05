# To-Do

## Layout \& Structure

* Lock layout: top bar, category tiles, category modal overlay, checklist drawer, helper panel placement.
* HUD integration: cards + filters; show FF band/status; link checklist tasks to selected goal.

## Goals \& Buckets

* Finalize goals: Stat Growth, War Readiness, Income, Faction Support, Custom (confirm/add any special cases like Chain Prep/Hospital Farming).
* Finalize time buckets: Month with Week1–4; filters for Today/This Week/This Month.

## Checklist \& Persistence

* Implement checklist CRUD (add/edit/delete, tick/untick) with localStorage persistence.
* Group tasks by goal and bucket; add filters and "mark all done" per goal.
* Add notes and snooze per task; progress X/Y per goal/week.

## Helper/Recommendations

* Implement 4-part helper responses (Quick, Alternatives, Caution, Next Step); default to Stat Growth.
* Add Profile Insight to auto-plan when goals are missing; merge with user-set goals.

## Data \& API Wiring

* Use TORN\_API\_KEY script property; default API\_BASE=https://api.torn.com.
* Resolve user and faction names by ID; surface errors/empty responses.
* Status ribbon: Live/Fetching/Error; handle rate-limit responses gracefully (retry/backoff messaging).

## KPIs

* Stat Growth: sessions done/planned, time, estimated gain, FF band alignment.
* War Readiness: progress summary (e.g., scouted targets, FF readiness), extend to Income/Faction when data is available.

## Polish

* Optional demo/walkthrough toggle for onboarding.
* Confirm styling: dark, compact cards, clear spacing in modals and drawers.





ONLY READ BELOW THIS LINE



Goal:



Add and validate the code for API links/data pulls (the Torn API calls).

Ensure the logic for fetching and displaying real user/faction data is ready and working.

No visual/UX/design changes right now—just get real, live data wired and visible for testing.

Implementation outline:



Make each tile (Stat Growth, War Readiness, Income, Faction Support, Custom) call the appropriate Torn API via Apps Script (if not already).

Display the fetched data dynamically in each card/hub/modal.

Validate (test) the API connectivity, key usage, and error handling.

Next Steps:



Wire up each tile to trigger its own data load (connecting modals/cards to server-side fetches).

Show response data clearly—either directly in the modals or in the HUD cards under the tiles.

Minimal validation/test interface so you can check the payloads are arriving and parsed.

What to expect:



No new styling or UI/UX changes—focus 100% on the real API data and visual confirmation.

A single revised script file, ready for you to test live data coming in through your Torn API keys.

Estimated time:

7–15 minutes (for thorough, correct validation and to ensure each endpoint works as intended).



Proceeding now!

Feel free to sa





Add form/input fields for user to enter Torn User ID and Faction ID

Store/remember entered User ID and Faction ID during session (e.g., global JS variable)

Validate inputs for correct format before running API calls

Trigger API fetches using user-supplied IDs rather than hardcoded defaults

Add error/message feedback if Torn API key or IDs are missing or invalid

Optionally, allow user to update/change IDs and refresh data after initial entry

Ensure all modal/popout panels fetch and display new data when IDs are updated

