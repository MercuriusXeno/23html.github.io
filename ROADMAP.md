# Proto23 Refactoring Roadmap

## Phase 1: Format & Readability
**Goal:** One statement per line, consistent indentation, semantic CSS. No behavior changes.

- [x] **Step 1.1:** Extract `<style>` block → `styles.css` with semantic class renaming
- [x] **Step 1.2:** Format global declarations — one declaration per line, grouped by purpose
- [x] **Step 1.3:** Format save/load system — expand compressed lines, add section comments
- [x] **Step 1.4:** Format constructor functions and their instances — one property per line
- [x] **Step 1.5:** Format UI/rendering functions
- [x] **Step 1.6:** Format location scripts / Chs definitions
- [x] **Step 1.7:** Format game loop, weather, utilities

## Phase 2: DRY & Constructor Cleanup
**Goal:** Eliminate repetitive patterns, improve constructors with config objects and factory helpers.

- [x] **Step 2.1:** Refactor `Item()` constructor — accept config object, set defaults
- [x] **Step 2.2:** Create food/consumable factory — ~100+ `item.use` functions follow identical pattern
- [x] **Step 2.3:** Refactor `Eqp()` constructor — config object, stat modifier factory for oneq/onuneq pairs
- [x] **Step 2.4:** Refactor `Creature()`, `Effect()`, `Skill()`, `Recipe()` constructors similarly
- [x] **Step 2.5:** DRY the save/load — extract repeated "serialize array of objects" pattern
- [x] **Step 2.6:** DRY the inventory load loops (5 nearly identical nested for-loops)

## Phase 3: TypeScript + ES Module Conversion
**Goal:** Convert the cleaned-up monolith to TypeScript ES modules.

- [ ] **Step 3.1:** Set up `tsconfig.json`, `src/` directory, dev pipeline
- [ ] **Step 3.2:** Extract constants, types, and utility modules
- [ ] **Step 3.3:** Extract state module (`global`, `you`, `dom` globals)
- [ ] **Step 3.4:** Extract data modules (`src/data/` — items, equipment, skills, etc.)
- [ ] **Step 3.5:** Extract system modules (`src/systems/` — combat, inventory, crafting, save-load, weather, effects)
- [ ] **Step 3.6:** Extract UI modules (`src/ui/` — rendering, DOM setup, window management)
- [ ] **Step 3.7:** Wire up `src/main.ts` entry point, verify full game works as ES modules

## Verification (after every step)
1. Open `index.html` in browser (local server for Phase 3+)
2. Verify game loads (fresh start and from existing save)
3. Test core loops: move between locations, fight, craft, save/reload
4. No console errors
