# Session Notes
<!-- Written by /wrapup. Read by /catchup at the start of the next session. -->
<!-- Overwritten each session — history preserved in git log of this file. -->

- **Date:** 2026-02-24
- **Branch:** main

## What Was Done
- Completed Phase 3 Step 3.6: Extract UI Modules
- Created 8 new modules under `src/ui/` (~1,260 lines total):
  - `messages.ts` (~49 lines): msg, _msg, msg_add — game log functions
  - `descriptions.ts` (~424 lines): dscr, addDesc, descsinfo — tooltip/popup system
  - `stats.ts` (~36 lines): update_db, update_d, update_m, m_update — stat display
  - `effects.ts` (~72 lines): giveEff, removeEff, effdfix, eff_d — effect display
  - `equipment.ts` (~110 lines): equip, unequip, eqpres — equipment slot display
  - `inventory.ts` (~260 lines): renderItem, updateInv, isort, rsort, invbtsrst, rstcrtthg, reduce
  - `choices.ts` (~64 lines): chs, clr_chs, icon, Chs constructor, activatef, deactivatef
  - `panels.ts` (~247 lines): renderRcp, refreshRcp, _refreshRcpCnt, _fcraft, renderSkl, renderAct, refreshAct, activateAct, deactivateAct
- Reduced `src/main.ts` from ~7,350 to ~6,180 lines (~1,170 lines extracted)
- Bundle size stable at 789.1kb
- All functions re-exported from main.ts for backward compat with data/system modules
- Newly exported from main.ts for UI module use: `make`, `formatw`, `iftrunkopen`, `listen_k`, `disassembleGeneric`

## Decisions Made
- Heavy rendering functions (chs_spec, renderFurniture, rendershopitem, buycbs, rendertrunkitem, etc.) stayed in main.ts — too deeply entangled to cleanly extract in 3.6g
- Step 3.6i (miscellaneous UI helpers) was skipped per plan — combat print functions, small helpers left in main.ts to avoid excessive module fragmentation
- Circular deps between ui/ modules and main.ts handled via deferred imports (function body references only)
- UI modules import from sibling ui/ modules directly where possible (e.g., effects.ts imports addDesc from descriptions.ts, not main.ts)
- Dead `format` function in messages area was deleted rather than moved

## Open Items
- [ ] Phase 3 Step 3.7: Wire up final entry point — imports only, verify full game works
- [ ] CSS semantic rename from `CLASS_MAP.md` (deferred — do after modularization)
- [ ] `.exp` text-shadow typo `0pzx` in styles.css
- [ ] Heavy rendering functions still in main.ts could be extracted in Phase 4

## Next Steps
1. Step 3.7: Final wiring of `src/main.ts` as entry point
2. Phase 4: Architecture improvements (circular imports, strict types, etc.)

## Context for Next Session
Phases 1-2 and Phase 3 Steps 3.1-3.6 are complete. The monolith has been split into utility modules (5), state module (1), data modules (13), system modules (3), and UI modules (8). main.ts is down to ~6,180 lines, mostly DOM setup (~1,500 lines of eval-time side effects), core game logic (combat, movement, item management), and some heavy rendering functions that were too entangled to extract cleanly. Step 3.7 (final wiring) is the last step before Phase 4. Bundle size is stable at ~789kb.
