# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Proto23** is a browser-based text RPG game, deployed as a GitHub Pages site (`23html.github.io`). The game is split across `src/main.ts` (~4,900 lines), `src/game/` (8 modules, ~1,220 lines), `src/ui/` (8 modules, ~1,270 lines), `src/data/` (13 modules, ~5,150 lines), and `src/systems/` (3 modules, ~1,610 lines), bundled via esbuild to `dist/bundle.js`, which `index.html` loads. CSS is in `styles.css`.

## Architecture

### File structure
- `index.html` — shell HTML, loads `styles.css` and `dist/bundle.js`
- `src/main.ts` — core game logic, DOM setup, location scripts (~4,900 lines)
- `src/game/` — 8 game logic modules (~1,220 lines):
  - `utils-game.ts` — Game utility functions (`formatw`, `cansee`, `kill`, `roll`)
  - `progression.ts` — XP/leveling (`giveExp`, `giveSkExp`, `giveCrExp`, `giveTitle`, `giveRcp`, `lvlup`)
  - `economy.ts` — Wealth/shopping (`giveWealth`, `spend`, `restock`)
  - `inventory.ts` — Item management (`giveItem`, `removeItem`, trunk/container functions)
  - `combat.ts` — Combat system (`fght`, `attack`, `dmg_calc`, `hit_calc`, `wpndiestt`)
  - `movement.ts` — Area transitions (`smove`, `area_init`, `inSector`, `Effector`, `addtosector`)
  - `crafting.ts` — Recipe crafting (`canMake`, `make`)
  - `exploration.ts` — Scouting/disassembly (`canScout`, `scoutGeneric`, `disassembleGeneric`)
- `src/ui/` — 8 UI modules (~1,270 lines):
  - `messages.ts` — Game log (`msg`, `_msg`, `msg_add`)
  - `descriptions.ts` — Tooltip/description popups (`dscr`, `addDesc`, `descsinfo`)
  - `stats.ts` — Stat display updates (`update_db`, `update_d`, `update_m`, `m_update`)
  - `effects.ts` — Effect display (`giveEff`, `removeEff`)
  - `equipment.ts` — Equipment slot display (`equip`, `unequip`, `eqpres`)
  - `inventory.ts` — Inventory rendering/sorting (`renderItem`, `isort`, `rsort`, `reduce`)
  - `choices.ts` — Choice buttons and icons (`chs`, `clr_chs`, `icon`, `Chs`)
  - `panels.ts` — Crafting/skill/action panels (`renderRcp`, `renderSkl`, `renderAct`, `deactivateAct`)
- `src/data/` — 13 data definition modules (~5,100 lines): titles, effects, furniture, skills, items, equipment, abilities, creatures, world, crafting, vendors, actions, mastery
- `src/systems/` — 3 system modules (~1,590 lines):
  - `weather.ts` — Weather/time/calendar system, callbacks (~600 lines)
  - `save-load.ts` — Save/load serialization (~880 lines)
  - `player.ts` — Player (`You`) constructor (~110 lines)
- `src/state.ts` — shared game state singletons and setter functions
- `src/constants.ts`, `src/base64.ts`, `src/random.ts`, `src/utils.ts`, `src/dom-utils.ts` — utility modules
- `styles.css` — extracted CSS (previously inline `<style>` block)
- `build.mjs` — esbuild build script (`src/main.ts` → `dist/bundle.js` as IIFE)
- `package.json` — project config, scripts: `build`, `watch`, `typecheck`
- `tsconfig.json` — TypeScript config (`strict: false`, `allowJs: true`, `noEmit: true`)
- `dist/bundle.js` — built output (gitignored)
- `changelog/changelog.html` — historical changelog
- `ctst.png` — sprite sheet, `laugh6.wav` — sound effect, `favicon.ico`

### Refactoring artifacts
- `ROADMAP.md` — 4-phase refactoring plan with checkboxes (Phases 1-3 complete, Phase 4 future)
- `CLASS_MAP.md` — CSS class rename mapping (cryptic → semantic, pending application)
- `frontend-refactoring.md` — CSS design token and component class analysis (future work)

### Global namespace objects
The game uses plain JS objects as namespaces (not modules). Key globals defined at the top of the script:

| Object | Purpose |
|--------|---------|
| `you` | Player character state (stats, equipment, inventory, effects) |
| `global` | Game-wide state, flags, settings, statistics |
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
Game entities use constructor functions (e.g., `Item()`, `Eqp()`, `Creature()`, `Area()`, `Skill()`, `Recipe()`, `Quest()`, `Action()`, `Vendor()`, `Effect()`, `Furniture()`, `Title()`, `Container()`, `Sector()`). All constructors accept an optional `cfg` config object: `if(cfg) for(let k in cfg) this[k]=cfg[k]`. Factory functions (`foodItem()`, `healItem()`, `expItem()`) create common item patterns with standardized `.use` functions.

### Save/Load system
- `save()` serializes game state into a pipe-delimited (`|`) string of JSON segments, base64-encodes it, and stores in `localStorage` under key `"v0.3"`
- `load()` reverses the process — segments are split on `|` and parsed in order
- Adding new save fields requires appending to both `save()` and `load()` in matching order
- Helpers: `serializeIdData()` for save, `loadEquipCategory()` and `restoreDiscovery()` for load

### Key systems
- **Combat** (`game/combat.ts`): `fght()`, `attack()`, `dmg_calc()`, `hit_calc()` — turn-based with stats, equipment, and effects
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
`global.ver` tracks the current game version (currently 470).

## Development

### Build commands
- `npm run build` — bundle `src/main.ts` → `dist/bundle.js` (esbuild, IIFE format)
- `npm run watch` — rebuild on file changes
- `npm run typecheck` — run `tsc --noEmit` for type checking (many errors expected until modules get proper types)

### Workflow
Edit files in `src/`, run `npm run build` (or use `npm run watch`), refresh `index.html` in browser. The game uses `localStorage` for saves — clearing it resets progress. The game targets modern browsers and uses MS Gothic font.

## CSS conventions
All styles are in `styles.css`. Classes use short abbreviated names (`.d`, `.dd`, `.bts`, `.chs`, `.inv_slot`, etc.). Hover effects use `background` or `background-color` changes. Firefox-specific fixes are in `@supports (-moz-appearance:none)`. See `CLASS_MAP.md` for the planned semantic rename mapping.
