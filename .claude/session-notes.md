# Session Notes
<!-- Written by /wrapup. Read by /catchup at the start of the next session. -->
<!-- Overwritten each session — history preserved in git log of this file. -->

- **Date:** 2026-02-26
- **Branch:** main

## What Was Done
- Completed Phase 5: Inversion of Control for Data Module Delegates (~385 delegates across 11 data modules)
- Phase 5.1: Equipment `oneq`/`onuneq`/`onDegrade` (~90 delegates) → `player` param, call sites in `ui/equipment.ts`
- Phase 5.2: Skill milestones + `onLevel`/`onGive` (~140 delegates) → call sites in `game/progression.ts`, `systems/save-load.ts`
- Phase 5.3: Effect `use`/`un`/`mods`/`onGive`/`onRemove`/`onClick` (~40 delegates) → call sites in 6 files
- Phase 5.4: Item `use`/`onGet` (~50+ delegates, including factory functions) → call sites in `main.ts`, `ui/inventory.ts`, `game/inventory.ts`
- Phase 5.5: Creature `onDeath` — replaced `you.` with existing `killer.` param (no signature change needed)
- Phase 5.6: world.ts `onStay`, actions.ts use/activate/deactivate, furniture.ts activate/deactivate/rwd, mastery.ts `onlevel`, titles.ts `talent`/`onGet`, abilities.ts `f`
- Removed `you` from imports in 9 data modules: equipment, effects, items, world, actions, furniture, mastery, titles, abilities

## Decisions Made
- Creature `onDeath` uses `killer` param instead of adding new `player` param: killer IS always the player for creature deaths, avoids signature/call-site changes
- Abilities `abl.rstab.f`: changed `you.res.poison` to `y.res.poison` (defender param): the ability applies poison to the defender, not self
- Action `use` closures capture `player` from enclosing `activate` scope: setInterval in activate passes `player` to `this.use(player)`
- Constructor defaults use `_player: any` (underscore prefix) for unused params to avoid TS warnings
- `you` stays in creatures.ts (effect calls, drop conditions), skills.ts (use functions), crafting.ts (recipe conditions)

## Open Items
- [ ] Phase 4.3: Dependency injection for state (broader than Phase 5 delegate IoC)
- [ ] Phase 4.4: Externalize game content to JSON data files
- [ ] Skill `use` functions in `skills.ts` still reference `you` directly (not IoC'd in Phase 5.2)
- [ ] Drop condition closures in `creatures.ts` (`cond: () => { return you.lvl <= 20 }`) still reference `you`

## Next Steps
1. Browser playtest Phase 5 changes (equip/unequip, level skills, gain/lose effects, use items, kill creatures, run/scout actions, level mastery, earn titles)
2. Consider Phase 4.3 dependency injection or Phase 4.4 content externalization
3. CSS refactoring per `CLASS_MAP.md` and `frontend-refactoring.md`

## Context for Next Session
Phase 5 IoC is complete. All data module delegates that referenced `you` now receive it as a parameter (or use an existing param like `killer`). Bundle size stable at ~796kb, typecheck 0 errors. The remaining `you` imports in 3 data modules (creatures, crafting, skills) are for non-delegate code that wasn't in Phase 5 scope.
