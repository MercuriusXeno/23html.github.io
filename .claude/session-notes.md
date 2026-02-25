# Session Notes
<!-- Written by /wrapup. Read by /catchup at the start of the next session. -->
<!-- Overwritten each session — history preserved in git log of this file. -->

- **Date:** 2026-02-24
- **Branch:** main

## What Was Done
- Completed Phase 3 Step 3.5: Extract System Modules
- Created `src/systems/weather.ts` (~600 lines): Weather constructor, 14 weather instances, ontick handlers, callbackManager, attachCallback/detachCallback, Time constructor, time accessors, getSeason, timeConv, timeDisp, setWeather, isWeather, onSeasonTick, wManager
- Created `src/systems/player.ts` (~110 lines): You() constructor with stat_r, battle_ai, onDeath methods
- Created `src/systems/save-load.ts` (~880 lines): save(), load(), serializeIdData, loadEquipCategory, restoreDiscovery, loading screen overlay
- Reduced `src/main.ts` from ~8,865 to ~7,350 lines (-1,516 lines)
- Fixed missing imports in `src/data/world.ts` (random, rand, roll, giveSkExp, giveExp, act, isWeather, getHour, weather)
- Fixed missing imports in `src/data/equipment.ts` (callback, attachCallback, detachCallback)
- Added re-exports in main.ts for backward compat with data module imports

## Decisions Made
- Eval-time init calls (setWeather, wManager) stay in main.ts after DOM setup, not in weather.ts — DOM elements don't exist yet when weather.ts loads
- main.ts re-exports functions from system modules so data modules can import from '../main' without needing to know about systems/
- Circular deps between systems/ and main.ts are safe because references are in closures (deferred execution)

## Open Items
- [ ] Phase 3 Step 3.6: Extract UI modules (`src/ui/` — dom-setup, messages, descriptions, choices, rendering, locations)
- [ ] Phase 3 Step 3.7: Wire up final entry point — imports only, verify full game works
- [ ] CSS semantic rename from `CLASS_MAP.md` (deferred — do after modularization)
- [ ] `.exp` text-shadow typo `0pzx` in styles.css

## Next Steps
1. Step 3.6: Extract UI modules into `src/ui/`
2. Step 3.7: Final wiring of `src/main.ts` as entry point
3. Phase 4: Architecture improvements (circular imports, strict types, etc.)

## Context for Next Session
Phases 1-2 and Phase 3 Steps 3.1-3.5 are complete. The monolith has been split into utility modules (5), data modules (13), and system modules (3). main.ts is down to ~7,350 lines, mostly UI/rendering and core game logic. The next step is extracting UI modules (Step 3.6), which is the most complex extraction remaining due to heavy cross-dependencies between UI functions. Bundle size is stable at ~789kb.
