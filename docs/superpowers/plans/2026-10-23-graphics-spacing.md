# Graphics and spacing implementation plan

**Goal:** Improve the lightweight top-down graphics and prevent units sharing occupied space.
**Architecture:** Keep Canvas and existing mission state. Route movement around occupied actor bounds; reserve nearby distinct work positions without changing target identity or rescue progress.
**Tech stack:** Plain JavaScript, Canvas, Node simulation tests and Playwright.
**Spec:** User request: prettier graphics and avoidance of unit collisions, autonomous execution.

## Constraints and review focus

- Preserve touch targets, local records, room routes and all nine tutorials.
- Shared work targets must remain usable by two crew members.
- Parked vehicles must be avoided while arrivals and departures complete.
- Ambulances must deliver multiple patients without blocking each other.
- Existing house door routes must stay wall safe.
- Draw shapes without external assets or new dependencies.

## Tasks

- [x] Add failing movement scenarios for shared goals, crossing paths, vehicle obstacles and fleet progress.
- [x] Add collision-aware movement and distinct nearby arrival positions; run movement and existing mission tests.
- [x] Improve vehicle silhouettes, uniform details, road markings and selected unit presentation; inspect touch screenshots.
- [x] Run full simulation and browser suites, independent Superpowers review, fix findings and prepare verified source for publication.

## Execution record

- Shared-goal crew regression observed failing before movement implementation, then passing.
- Independent reviewer found indoor wall detours and a two-ambulance deadlock. Both reproduced in `tests/unit-spacing.cjs` before their fixes and now pass.
- House walls now participate in avoidance. Vehicles with occupied destinations approach a free waiting position and retry the actual destination, so neither blocks movement solely because a distant destination is occupied.
- Increased the two-ambulance arrival allowance from 10 to 15 seconds: the second ambulance was still approaching at 10 seconds because it now maintains physical spacing.
- Four-vehicle scenario checks spacing at every tick during arrival, six-person shared work, boarding and departure. Both RTW complete all three airport transports.
- 19 Node simulation suites passed, including all nine complete tutorial playthroughs. Tunnel browser suite passed at 390×844/easy, 844×390/normal, 820×1180/hard.
- Graphics inspected at 1180×820 and touch landscape. Four distinct vehicle types arrive and render without page errors. Canvas draw averaged 0.9 ms on the test host (not an iPad hardware benchmark).
- General touch browser flow passed on all three viewports, including intro, training, hydrant/Y connections and local record persistence.
