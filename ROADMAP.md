# Proto23 Refactoring Roadmap

## Phase 1: Format & Readability ✓
**Goal:** One statement per line, consistent indentation, semantic CSS. No behavior changes.

- [x] **Step 1.1:** Extract `<style>` block → `styles.css` with semantic class renaming
- [x] **Step 1.2:** Format global declarations — one declaration per line, grouped by purpose
- [x] **Step 1.3:** Format save/load system — expand compressed lines, add section comments
- [x] **Step 1.4:** Format constructor functions and their instances — one property per line
- [x] **Step 1.5:** Format UI/rendering functions
- [x] **Step 1.6:** Format location scripts / Chs definitions
- [x] **Step 1.7:** Format game loop, weather, utilities

## Phase 2: DRY & Constructor Cleanup ✓
**Goal:** Eliminate repetitive patterns, improve constructors with config objects and factory helpers.

- [x] **Step 2.1:** Refactor `Item()` constructor — accept config object, set defaults
- [x] **Step 2.2:** Create food/consumable factory — ~100+ `item.use` functions follow identical pattern
- [x] **Step 2.3:** Refactor `Eqp()` constructor — config object, stat modifier factory for oneq/onuneq pairs
- [x] **Step 2.4:** Refactor `Creature()`, `Effect()`, `Skill()`, `Recipe()` constructors similarly
- [x] **Step 2.5:** DRY the save/load — extract repeated "serialize array of objects" pattern
- [x] **Step 2.6:** DRY the inventory load loops (5 nearly identical nested for-loops)

## Phase 3: TypeScript + ES Module Conversion
**Goal:** Convert the cleaned-up monolith to TypeScript ES modules with esbuild.

- [x] **Step 3.1:** Build pipeline — `package.json`, `tsconfig.json`, `build.mjs` (esbuild IIFE), extract script to `src/main.ts`
- [x] **Step 3.2:** Extract constants, utilities, and helper modules (`src/constants.ts`, `src/base64.ts`, `src/random.ts`, `src/utils.ts`, `src/dom-utils.ts`)
- [x] **Step 3.3:** Extract state module (`src/state.ts` — `you`, `global`, `dom`, `timers`, `callback` singletons)
- [x] **Step 3.4:** Extract data modules (`src/data/` — items, creatures, areas, skills, effects, recipes, quests, vendors, titles, furniture, actions)
- [x] **Step 3.5:** Extract system modules (`src/systems/` — weather+time+callbacks, player constructor, save-load)
- [x] **Step 3.6:** Extract UI modules (`src/ui/` — messages, descriptions, stats, effects, equipment, inventory, choices, panels)
- [x] **Step 3.7:** Main.ts cleanup pass — remove extraction comment markers, commented-out dead code, collapse blank line gaps

## Phase 4: Architecture Improvements (Future)
**Goal:** Address structural issues exposed during modularization.

- [x] **Step 4.1:** Resolve circular imports — extracted 33+ functions from `main.ts` into 8 `src/game/` modules, redirected all re-exports, eliminated data/ui/systems imports from `main.ts`
- [x] **Step 4.2:** Extract remaining main.ts exports — moved `giveAction`, `wdrseason`, `ontick`, `recshop`+shop helpers, `giveFurniture`+`renderFurniture` to proper modules. Zero imports from `main.ts` remain. Created `src/systems/loop.ts` and `src/ui/shop.ts`.
- [x] **Step 4.3:** Unglobal the globals — grouped `global` grab-bag into purpose-specific exports: `data` (19 registries), `gameText`, `flags`, `stats`, `combat`, `settings`. Consuming modules destructure from grouped exports. ~62 misc properties remain in `global` for future cleanup.
- ~~Step 4.4~~ → moved to **Step 8.1**
- [x] **Step 4.5:** Constructor delegate cleanup — folded ~389 post-construction delegate assignments (`.use`, `.oneq`, `.onuneq`, `.onDeath`, `.onGet`, etc.) into constructor config objects across 8 data modules (equipment, skills, effects, world, actions, furniture, items, creatures)
- [x] **Step 4.6:** Enable `strict: true` in tsconfig incrementally — fix type errors module by module
  - [x] Enabled `strict: true`, added `@ts-nocheck` to 33 unfixed files (0 typecheck errors)
  - [x] Fixed leaf utility modules: `dom-utils.ts`, `utils.ts`, `base64.ts`
  - [x] Fixed UI modules: `messages.ts`, `effects.ts`, `stats.ts`, `equipment.ts`, `choices.ts`, `shop.ts`, `descriptions.ts`, `panels.ts`, `inventory.ts`
  - [x] Fixed game modules: `utils-game.ts`, `economy.ts`, `exploration.ts`, `crafting.ts`, `progression.ts`, `movement.ts`, `inventory.ts`, `combat.ts`
  - [x] Fixed system modules: `loop.ts`, `save-load.ts`, `weather.ts`, `player.ts`
  - [x] Fixed all 13 data modules: titles, effects, furniture, skills, items, equipment, abilities, creatures, world, crafting, vendors, actions, mastery
  - [x] Fixed `main.ts` (~4,670 lines, ~458 errors): `this: any` on 135+ callbacks, `@ts-ignore` on 78 `new` calls, param types, HTMLElement casts, bug fixes (comma expression, operator precedence, missing `let`)
  - [ ] `random.ts` remains `@ts-nocheck` (vendored MersenneTwister IIFE — low priority)

## Phase 5: Inversion of Control for Data Module Delegates ✓
**Goal:** Replace direct `you` singleton imports in data module delegate functions with explicit `player` parameter, decoupling data definitions from global player state.

- [x] **Step 5.1:** Equipment `oneq`/`onuneq`/`onDegrade` (~90 delegates) — replaced `you.` with `player.`, updated call sites in `ui/equipment.ts`, `main.ts`
- [x] **Step 5.2:** Skill milestones + `onLevel`/`onGive` (~140 delegates) — updated call sites in `game/progression.ts`, `systems/save-load.ts`
- [x] **Step 5.3:** Effect delegates `use`/`un`/`mods`/`onGive`/`onRemove`/`onClick` (~40 delegates) — updated call sites in `ui/effects.ts`, `systems/loop.ts`, `systems/player.ts`, `game/combat.ts`, `data/creatures.ts`, `systems/save-load.ts`, `main.ts`
- [x] **Step 5.4:** Item `use`/`onGet` (~50+ delegates, including factory functions) — updated call sites in `main.ts`, `ui/inventory.ts`, `game/inventory.ts`
- [x] **Step 5.5:** Creature `onDeath` — replaced `you.` with existing `killer.` param (killer IS always the player for creature deaths)
- [x] **Step 5.6:** Remaining data modules — world.ts `onStay`, actions.ts `use`/`activate`/`deactivate`, furniture.ts `activate`/`deactivate`/quest `rwd`, mastery.ts `onlevel`, titles.ts `talent`/`onGet`, abilities.ts `f`

**Result:** `you` removed from imports in 9 data modules (equipment, effects, items, world, actions, furniture, mastery, titles, abilities). Remaining 3 (creatures, crafting, skills) still import `you` for non-delegate reasons.

## Phase 6: Naming & Types (Future)
**Goal:** Replace cryptic variable/field/property names with meaningful names throughout the codebase. Replace `any` types with accurate types that reflect each argument's purpose.

- [x] **Step 6.1:** Rename state properties — player stats (`str_r`→`str_base`, `stra`→`str_bonus`, `strm`→`str_mult`, `stre`→`str_eff`), player mods (all 20 fields), combat state, stats counters (~50 fields), flags, global misc, settings. Save-load uses `PLAYER_KEY_MAP`/`STATS_KEY_MAP`/`FLAGS_KEY_MAP`/`MODS_KEY_MAP` to migrate old saves
- [x] **Step 6.2:** Rename function parameters — 3 tiers: high-volume UI (equipment, effects, descriptions, messages), moderate-volume game logic (progression, crafting, movement, panels, choices), low-volume utils + function name renames (`update_d`→`updateCombatDisplay`, `update_m`→`updateMonsterDisplay`, `m_update`→`updateWealthDisplay`, `update_db`→`updateStatDisplay`, `mf`→`coinAnimation`, `eqpres`→`resetEquipDisplay`)
- [x] **Step 6.3:** Define interfaces/types for core entities — `Player`, `Item`, `Creature`, `Effect`, `Skill`, `Area`, `Equipment` etc. (23 entity types + 8 state types in `src/types.ts`)
- [x] **Step 6.4:** Replace `any` in function signatures with accurate types — constructor configs, delegate callbacks, utility params (all game/, ui/, systems/ modules typed)
- [x] **Step 6.5:** Replace `any` on state exports — `dom`, `global`, `flags`, `stats`, `settings`, `combat` etc. (all state.ts exports typed)

## Phase 7: Testable Seams & Event Extraction (Future)
**Goal:** Create testable seams for monolithic methods. Extract baked-in event listener closures to named, first-class function references that can be tested and replaced independently.

- [ ] **Step 7.1:** Extract inline event listeners — replace anonymous closures in `addEventListener`/`onclick`/`onmouseover` with named handler functions
- [ ] **Step 7.2:** Extract monolithic initialization — break up large init blocks (DOM setup, game start) into focused, individually-callable functions
- [ ] **Step 7.3:** Decouple DOM mutation from game logic — separate state changes from DOM updates in combat, inventory, movement
- [ ] **Step 7.4:** Create unit-testable interfaces — introduce test harness, mock DOM layer, write first tests for pure game logic (combat math, progression, economy)

## Phase 8: Data Externalization (Future)
**Goal:** Separate game content from code for easier authoring and modding.

- [ ] **Step 8.1:** Externalize game content — move item/creature/area definitions to JSON data files, hydrate at startup

## Known Bugs

- [x] **"Pause next battle" not honored on load:** Flag was saved/loaded correctly but button display wasn't synced (showed OFF when secretly ON). Also, `smove()` during load triggered `area_init()` which started combat before `to_pause` was checked — fixed by syncing button innerHTML and checking `to_pause` after `smove`
- [x] **Area clearing progress lost on page reload:** `if (a5[xx])` in load treated size `0` (cleared areas) as falsy, skipping restoration and misaligning the index for all subsequent areas — fixed with `if (xx < a5.length)`
- [x] **Inventory crash on load:** `giveItem` return value wasn't captured in `save-load.ts`, causing `inv[o].data` to be undefined — fixed by using returned item reference
- [x] **Bare variable assignments crash in strict mode:** 8 implicit globals (`testz`, `tcat`, `t`, `bt`, `g`, `stash`/`verify`, `lr`, `scann`) caused `ReferenceError` in esbuild's strict IIFE — added `let` declarations

## Verification (after every step)
1. `npm run build` succeeds without errors
2. Open `index.html` in browser
3. Game loads (fresh start and from existing save)
4. Test: move between locations, fight, craft, save/reload
5. No console errors
