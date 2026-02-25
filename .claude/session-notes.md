# Session Notes
<!-- Written by /wrapup. Read by /catchup at the start of the next session. -->
<!-- Overwritten each session — history preserved in git log of this file. -->

- **Date:** 2026-02-25
- **Branch:** main

## What Was Done
- Completed Phase 4.1: Resolve Circular Imports (all 10 steps)
- Step 1: Redirected ~40 re-exports from `main.ts` to actual source modules (ui/*, systems/*)
- Created 8 new modules under `src/game/`:
  - `utils-game.ts` (formatw, cansee, kill, roll)
  - `progression.ts` (giveExp, giveSkExp, giveCrExp, giveTitle, giveRcp, lvlup)
  - `economy.ts` (giveWealth, spend, restock)
  - `inventory.ts` (giveItem, removeItem, trunk/container fns, dropC, wearing)
  - `combat.ts` (fght, attack, dmg_calc, hit_calc, wpndiestt + 11 internal helpers)
  - `movement.ts` (smove, area_init, inSector, Effector, addtosector, effector helpers)
  - `crafting.ts` (canMake, make + scan2, evaluateSpecialRequirementsForRecipe)
  - `exploration.ts` (canScout, scoutGeneric, disassembleGeneric)
- All data/ui modules now import from `src/game/` instead of `src/main.ts`
- `main.ts` reduced from ~6,100 to ~4,934 lines; game modules total ~1,220 lines

## Decisions Made
- `mf` kept in main.ts: shop UI function, not combat-related
- `recshop` exported from main.ts: runtime-only circular dep with economy.ts, safe with esbuild
- `dumb` moved to combat.ts: only appeared as dialogue word "dumb" elsewhere, not a function call
- Undeclared vars `sk`, `cdmg` in dmg_calc declared with `let`: were implicit globals

## Open Items
- [ ] Browser testing needed — build passes but no runtime verification this session
- [ ] CSS semantic rename from `CLASS_MAP.md` (deferred)

## Next Steps
1. Browser-test the game (fresh start + save/load + combat + crafting + movement)
2. Consider extracting remaining main.ts functions (giveFurniture, giveAction, giveQst, etc.)
3. Phase 4.2+ from ROADMAP (dependency injection, JSON data, strict TS)

## Context for Next Session
Phase 4.1 is fully complete. `src/game/` has 8 modules with ~1,220 lines extracted from main.ts. No data or UI module imports from main.ts anymore — only `economy.ts→recshop` and `save-load.ts→wdrseason` remain as runtime circular deps. Bundle size stable at 788.1kb. Needs browser testing.
