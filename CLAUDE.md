# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Proto23** is a browser-based text RPG game, deployed as a GitHub Pages site (`23html.github.io`). The game is split across `src/main.ts`, `src/game/`, `src/ui/`, `src/data/`, `src/systems/`, and `src/locations/`, bundled via esbuild to `dist/bundle.js`, which `index.html` loads. CSS is in `styles.css`.

## Architecture

### File structure
- `index.html` — shell HTML, loads `styles.css` and `dist/bundle.js`
- `src/main.ts` — core game init, DOM setup, planners, debug, combat death text
- `src/game/` — game logic modules:
  - `utils-game.ts` — Game utility functions (`formatw`, `cansee`, `kill`, `roll`, `canRead`)
  - `progression.ts` — XP/leveling (`giveExp`, `giveSkExp`, `giveCrExp`, `giveTitle`, `giveRcp`, `lvlup`, `giveAction`)
  - `economy.ts` — Wealth/shopping (`giveWealth`, `spend`, `restock`)
  - `inventory.ts` — Item management (`giveItem`, `removeItem`, `giveFurniture`, trunk/container functions)
  - `combat.ts` — Combat system (`fght`, `attack`, `tattack`, `dmg_calc`, `dumb`, `hit_calc`, `wpndiestt`)
  - `movement.ts` — Area transitions (`smove`, `area_init`, `inSector`, `Effector`, `addtosector`)
  - `crafting.ts` — Recipe crafting (`canMake`, `make`)
  - `exploration.ts` — Scouting/disassembly (`canScout`, `scoutGeneric`, `disassembleGeneric`)
  - `quests.ts` — quest system
- `src/ui/` — UI modules:
  - `messages.ts` — Game log (`msg`, `_msg`, `msg_add`)
  - `descriptions.ts` — Tooltip/description popups (`dscr`, `addDesc`, `descsinfo`)
  - `stats.ts` — Stat display updates (`updateStatDisplay`, `updateCombatDisplay`, `updateMonsterDisplay`, `updateWealthDisplay`)
  - `effects.ts` — Effect display (`giveEff`, `removeEff`)
  - `equipment.ts` — Equipment slot display (`equip`, `unequip`, `resetEquipDisplay`)
  - `inventory.ts` — Inventory rendering/sorting (`renderItem`, `isort`, `rsort`, `reduce`)
  - `choices.ts` — Choice buttons and icons (`chs`, `clr_chs`, `icon`, `Chs`)
  - `panels.ts` — Crafting/skill/action/furniture panels (`renderRcp`, `renderSkl`, `renderAct`, `deactivateAct`, `renderFurniture`, `showFurniturePanel`)
  - `shop.ts` — Shop UI rendering (`recshop`, `rendershopitem`, `buycbs`, `coinAnimation`)
  - `settings.ts` — settings panel
  - `special-panels.ts` — special panels
- `src/data/` — data definition modules: titles, effects, furniture, skills, items, equipment, abilities, creatures, world, crafting, vendors, actions, mastery
- `src/systems/` — system modules:
  - `weather.ts` — Weather/time/calendar system, callbacks, season display (`wdrseason`)
  - `save-load.ts` — Save/load serialization
  - `player.ts` — Player (`You`) constructor
  - `loop.ts` — Game tick loop (`ontick`)
- `src/locations/` — location script modules: dojo, forest, village, special, home, catacombs
- `src/events.ts` — event bus decoupling game/ modules from DOM/UI
- `src/state.ts` — shared game state: grouped exports (`data`, `gameText`, `flags`, `stats`, `combat`, `settings`), namespace singletons (`dom`, `global`), setter functions (`setYou`, `resetFlags`, etc.)
- `src/constants.ts`, `src/base64.ts`, `src/random.ts`, `src/utils.ts`, `src/dom-utils.ts` — utility modules
- `styles.css` — extracted CSS (previously inline `<style>` block)
- `build.mjs` — esbuild build script (`src/main.ts` → `dist/bundle.js` as IIFE)
- `package.json` — project config, scripts: `build`, `watch`, `typecheck`
- `tsconfig.json` — TypeScript config (`strict: true`, `allowJs: true`, `noEmit: true`)
- `.vscode/launch.json` — Chrome debug launch (builds first via `preLaunchTask`)
- `.vscode/tasks.json` — npm build task for VSCode
- `dist/bundle.js` — built output (gitignored)
- `changelog/changelog.html` — historical changelog
- `ctst.png` — sprite sheet, `laugh6.wav` — sound effect, `favicon.ico`

### Work tracking and design docs
Open work is tracked in the fleet work store (threads and tasks), not in-repo roadmap files. The old `ROADMAP.md` and `docs/phase7-plan.md` were migrated there and deleted; git history holds both. Design references that remain in-repo:
- `docs/CLASS_MAP.md` — CSS class rename mapping (cryptic → semantic, pending application)
- `docs/frontend-refactoring.md` — CSS design token and component class analysis
- `src/types.ts` — entity and state interfaces (Player, Item, Creature, Effect, Skill, Area, Equipment, Flags, Stats, CombatState, Settings, etc.)

### Typing endgame
Every game entity deserves a real class, not a function+config-merge hack. The type aliases in `src/types.ts` are stepping stones, not destinations: they describe current shapes so `any` can be killed, and become class definitions when constructors are converted. Endgame is zero `any`, zero `[key: string]: any` index signatures, fully closed types. Treat every interim alias or index signature as tracked debt and eliminate it when the surrounding code is ready.

### Global namespace objects
The game uses plain JS objects as namespaces (not modules). Key globals defined at the top of the script:

| Object | Purpose |
|--------|---------|
| `you` | Player character state (stats, equipment, inventory, effects) |
| `global` | Miscellaneous game-wide state (grab-bag remainder pending dispersal) |
| `data` | Grouped registry export: `{ creature, item, wpn, eqp, acc, sld, rcp, skl, effect, area, sector, furniture, vendor, quest, act, abl, container, ttl, mastery }` |
| `gameText` | Read-only display constants: `nt` (number suffixes), `wecs` (rarity colors), `lunarp` (moon phases), `eranks` (ranking labels) |
| `flags` | Game state flags: `btl`, `monsterFreeze`, `civil`, `sleepmode`, `pauseNextBattle`, `criticalHit`, etc. |
| `stats` | Gameplay statistics: `tick`, `allKills`, `foodAttempts`, `moneyGained`, `deathsInCombat`, etc. |
| `combat` | Ephemeral combat state: `currentMonster`, `currentLocation`, `currentZone`, `attackDamageFromMonster`, `hitAccuracy`, `keyTarget`, etc. (not serialized) |
| `settings` | User-configurable preferences: `sortMode`, `recipeSortMode`, `msgs_max`, `fps`, `timescale`, `home_loc`, `bg_r/g/b` |
| `dom` | DOM element references |
| `creature` | Monster/NPC definitions |
| `area` / `sector` | Map zones and sector groupings |
| `item` / `wpn` / `eqp` / `sld` / `acc` | Item categories (general / weapon / equipment / shield / accessory) |
| `rcp` | Crafting recipes |
| `skl` | Skills |
| `effect` | Status effects |
| `vendor` | Shop/vendor definitions |
| `quest` | Quest definitions |
| `weather` / `w_manager` | Weather system |
| `timers` | setInterval references |
| `callback` | Event hook system |
| `container` | Storage containers (chests, bags) |
| `furniture` | Home furniture |
| `ttl` | Titles |
| `act` | Actions |

### Constructor pattern
Game entities use constructor functions (e.g., `Item()`, `Eqp()`, `Creature()`, `Area()`, `Skill()`, `Recipe()`, `Quest()`, `Action()`, `Vendor()`, `Effect()`, `Furniture()`, `Title()`, `Container()`, `Sector()`). All constructors accept an optional `cfg` config object: `if(cfg) for(let k in cfg) this[k]=cfg[k]`. Delegate functions (`.use`, `.oneq`, `.onuneq`, `.onDeath`, `.onGet`, etc.) are included directly in the constructor config. Factory functions (`foodItem()`, `healItem()`, `expItem()`) create common item patterns with standardized `.use` functions. Remaining post-construction assignments are limited to sub-property access (`.data.time`, `.eqp[0].aff`), cross-module references (`.dss`), and conditional assignments.

### Delegate IoC pattern
Most data module delegates that previously imported and mutated the `you` singleton now receive the player as a parameter instead:
- **Equipment** (`oneq`, `onuneq`, `onDegrade`): `function(player: any) { player.mods.X += val }`
- **Skills** (milestone `f`, `onLevel`, `onGive`): `(player: any) => { player.str_bonus += 1 }`
- **Effects** (`use`, `un`, `mods`, `onGive`, `onRemove`, `onClick`): player is first param
- **Items** (`use`, `onGet`): `function(player: any) { ... }`
- **Creatures** (`onDeath`): uses existing `killer` param (which IS the player) instead of importing `you`
- **Actions/Furniture/Titles/Mastery/Abilities**: delegates receive `player` as first param

Call sites pass `you` as the argument (e.g., `w.oneq(you)`, `skl.mlstn[ss].f(you)`). Constructor defaults use `_player: any` for unused params. This removes `you` from imports in most data modules (equipment, effects, items, world, actions, furniture, mastery, titles, abilities); creatures, crafting, and skills still import it for non-delegate reasons.

### State module imports
Consuming modules (game/, ui/, systems/, main.ts) import grouped exports and destructure:
```typescript
import { dom, global, you, data, flags, stats, combat, settings, gameText } from '../state';
const { creature, item, wpn, skl } = data;
```
Data modules (src/data/*.ts) import individual registry vars directly since they populate them:
```typescript
import { creature, item, wpn, effect, skl } from '../state';
```
Setter functions are used for objects that need full reassignment in save/load: `resetFlags(v?)`, `setYou(v)`, `setTime(v)`, etc.

### Save/Load system
- `save()` serializes game state into a pipe-delimited (`|`) string of JSON segments, base64-encodes it, and stores in `localStorage` under key `"v0.3"`
- `load()` reverses the process — segments are split on `|` and parsed in order
- Adding new save fields requires appending to both `save()` and `load()` in matching order
- Helpers: `serializeIdData()` for save, `loadEquipCategory()` and `restoreDiscovery()` for load
- **Rename migration**: Since the state-property renames, save keys use new names but old saves still have old keys. `load()` uses key-mapping objects (`PLAYER_KEY_MAP`, `STATS_KEY_MAP`, `FLAGS_KEY_MAP`, `MODS_KEY_MAP`) to translate old serialized keys to new runtime property names. When renaming a serialized property, add the old→new mapping to the appropriate map

### Key systems
- **Combat** (`game/combat.ts`): `fght()`, `attack()`, `tattack()`, `dmg_calc()`, `hit_calc()` — turn-based with stats, equipment, and effects
- **Inventory** (`game/inventory.ts` + `ui/inventory.ts`): `giveItem()`, `removeItem()`, `equip()`, `unequip()` — items tracked in `inv[]` array
- **Crafting** (`game/crafting.ts`): `canMake()`, `make()`, `renderRcp()` — recipe-based
- **Movement** (`game/movement.ts`): `smove()`, `area_init()` — transitions between areas, effector system
- **Time**: `Time()` constructor, constants `YEAR`, `MONTH`, `WEEK`, `DAY`, `HOUR` (in minutes)
- **UI**: `chs()` for choice buttons, `msg()` / `_msg()` for game log, `dscr()` for description popups, `addElement()` for DOM creation
- **Weather**: `wManager()`, `setWeather()`, seasonal system
- **Effects**: `giveEff()`, `removeEff()` — buff/debuff system with types
- **Skills**: `giveCrExp()` for skill XP, milestone/perk system via `mlstn`

### Currency
Copper-based: `SILVER = 100`, `GOLD = 10000`. Use `giveWealth()` / `spend()`.

### Version
`global.ver` tracks the current game version.

## Development

### Build commands
- `npm run build` — bundle `src/main.ts` → `dist/bundle.js` (esbuild, IIFE format)
- `npm run watch` — rebuild on file changes
- `npm run typecheck` — run `tsc --noEmit` for type checking (0 errors; only `random.ts` uses `@ts-nocheck` — vendored MersenneTwister)

### Workflow
Edit files in `src/`, run `npm run build` (or use `npm run watch`), refresh `index.html` in browser. In VSCode, press F5 to build and launch in Chrome. The game uses `localStorage` for saves — clearing it resets progress. The game targets modern browsers and uses MS Gothic font.

## Key gotchas

### Modules and build
- Data module import order matters (eval-time deps): titles → effects → furniture → skills → items → equipment → abilities → creatures → world → crafting → vendors → actions → mastery
- esbuild wraps output in a CommonJS shim (significant bundle-size overhead) when the entry has no exports; `export {}` in main.ts prevents it. With ES module imports esbuild uses the `__esm` lazy init pattern instead
- Data modules can reference functions without importing them (closures that used to see main.ts scope). esbuild does not error; they silently become `undefined` globals and crash only when the closure executes. All data modules were audited and fixed
- Eval-time side effects that depend on DOM elements (e.g. `setWeather(...)`) cannot live in extracted modules; keep those init calls in main.ts after DOM setup
- Runtime-only circular deps are fine with esbuild (imports used only inside function bodies). Known safe pairs: `game/inventory` ↔ `ui/panels`, `ui/shop` ↔ `game/economy`
- `delete` on a bare identifier is invalid in ESM strict mode (the old `kill()` had one; it was a no-op anyway)
- Strict-typing pattern: constructor functions take `this: any, cfg: any`; `new Foo(...)` calls get `// @ts-ignore: constructor function`; `random.ts` stays `@ts-nocheck` (vendored MersenneTwister)

### Refactoring traps
- Same-line statements get lost when folding assignments into constructor configs: `item.x.stype = 4; item.x.data.time=HOUR;` dropped the second statement and 28 reading items lost their duration. Check for multiple statements per line before refactoring
- Semicolon-splitting formatters break on `//` comments containing semicolons
- ASI trap when deleting a function between two statements: if the preceding line lacks `;` and the next starts with `(` or `[`, the value gets called as a function (`arr = [1,2,3]\n(function(){})()` parses as one expression)
- Bulk line-range cuts are risky: main.ts had non-location code (Plan constructor, planner defs, `getlastd`, `addPlan`) interspersed between location scripts. Grep for function definitions in the range before cutting

### DOM, CSS, and naming
- `className` is only set via `addElement(parent, tag, id, cls)`; there is no classList usage
- Some CSS classes double as IDs (`bbts`, `chs`, `sl`); renaming them is risky. Some appear unused in JS (`.doselect`, `.chbtsa`)
- The `msg` function name conflicts with the `.msg` CSS class; no simple rename possible
- `var global = new Object()` shadows `globalThis.global`; safe inside the bundle but watch for it

### Save format
- Pipe-delimited segments are position-ordered and include a `savevalid` marker segment; see `save()`/`load()` for the current layout

## CSS conventions
All styles are in `styles.css`. Classes use short abbreviated names (`.d`, `.dd`, `.bts`, `.chs`, `.inv_slot`, etc.). Hover effects use `background` or `background-color` changes. Firefox-specific fixes are in `@supports (-moz-appearance:none)`. See `docs/CLASS_MAP.md` for the planned semantic rename mapping.
