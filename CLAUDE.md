# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Proto23** is a browser-based text RPG game, deployed as a GitHub Pages site (`23html.github.io`). The entire game lives in a single `index.html` file (~14,800 lines) containing inline CSS and JavaScript. There is no build system, bundler, or framework — open `index.html` in a browser to run the game.

## Architecture

### Single-file structure
- `index.html` — all game code: `<style>` block (lines 4–139), then a single `<script>` block (lines 143–14766)
- `changelog/changelog.html` — historical changelog
- `ctst.png` — sprite sheet, `laugh6.wav` — sound effect, `favicon.ico`

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
Game entities use constructor functions (e.g., `Item()`, `Eqp()`, `Creature()`, `Area()`, `Skill()`, `Recipe()`, `Quest()`, `Action()`, `Vendor()`, `Effect()`, `Furniture()`, `Title()`, `Container()`, `Sector()`). These are called with `new` and register themselves into their namespace object.

### Save/Load system
- `save()` serializes game state into a pipe-delimited (`|`) string of JSON segments, base64-encodes it, and stores in `localStorage` under key `"v0.3"`
- `load()` reverses the process — segments are split on `|` and parsed in order
- Adding new save fields requires appending to both `save()` and `load()` in matching order

### Key systems
- **Combat**: `fght()`, `attack()`, `dmg_calc()`, `hit_calc()` — turn-based with stats, equipment, and effects
- **Inventory**: `giveItem()`, `removeItem()`, `equip()`, `unequip()` — items tracked in `inv[]` array
- **Crafting**: `canMake()`, `make()`, `renderRcp()` — recipe-based
- **Movement**: `smove()` — transitions between areas
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

No build step. Edit `index.html` directly and refresh the browser. The game uses `localStorage` for saves — clearing it resets progress. The game targets modern browsers and uses MS Gothic font.

## CSS conventions
All styles are in the `<style>` block. Classes use short abbreviated names (`.d`, `.dd`, `.bts`, `.chs`, `.inv_slot`, etc.). Hover effects use `background` or `background-color` changes. Firefox-specific fixes are in `@supports (-moz-appearance:none)`.
