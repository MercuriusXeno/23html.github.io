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
- [ ] **Step 4.2:** Dependency injection for state — replace direct singleton access with scoped objects where possible
- [ ] **Step 4.3:** Externalize game content — move item/creature/area definitions to JSON data files, hydrate at startup
- [ ] **Step 4.4:** Constructor delegate cleanup — pass `.use`, `.onDeath`, and other function delegates via constructor config instead of deferred assignment
- [ ] **Step 4.5:** Enable `strict: true` in tsconfig incrementally — fix type errors module by module

## Known Bugs

- [ ] **"Pause next battle" not persisted:** The toggle effect doesn't survive save/load — possibly a vanilla bug predating refactoring
- [ ] **Area clearing progress not saved:** Monster kill progress for area clearing resets on save/load

## Verification (after every step)
1. `npm run build` succeeds without errors
2. Open `index.html` in browser
3. Game loads (fresh start and from existing save)
4. Test: move between locations, fight, craft, save/reload
5. No console errors
