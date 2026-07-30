# Phase 7: Testable Seams & Event Extraction — Implementation Plan

Status: **draft**
Date: 2025-03-25

## Summary Table

| Step | Name | Files | Handlers Affected | Effort | Risk |
|------|------|-------|-------------------|--------|------|
| 7.1 | `choiceNav()` helper | main.ts, ui/choices.ts | ~31 pure-nav | S | Low |
| 7.2 | `choiceAction()` helper | main.ts, ui/choices.ts | ~40 simple-action | S | Low |
| 7.3 | Shop buy DRY-up | ui/shop.ts | 5 buy handlers | M | Low |
| 7.4 | Equipment slot tooltip loop | main.ts | 10 (5 pairs) | S | Low |
| 7.5 | Sort button parameterization | main.ts | 11 (6 recipe + 5 inv) | S | Low |
| 7.6 | Confirm dialog extraction | ui/inventory.ts | 12 (2 dialogs x 6 handlers) | M | Low |
| 7.7 | `addDesc` tooltip trio refactor | ui/descriptions.ts | 3 per call (~50 call sites) | M | Medium |
| 7.8 | DOM init extraction | main.ts | ~200 lines | M | Medium |
| 7.9 | Settings panel extraction | main.ts | ~300 lines | M | Medium |
| 7.10 | Location script file extraction | main.ts, new locations/*.ts | ~250 remaining chs handlers | L | Medium |
| 7.11 | Game logic / DOM decoupling seams | game/*.ts, ui/*.ts | N/A (structural) | L | High |
| 7.12 | Test harness bootstrap | new: test/, package.json | N/A | M | Low |
| 7.13 | **Location conversation tree system** | new system + migrate all sl() | ~2,600 lines redesigned | **XL** | **High** |

Recommended execution order: 7.1 -> 7.2 -> 7.4 -> 7.5 -> 7.3 -> 7.6 -> 7.7 -> 7.8 -> 7.9 -> 7.10 -> 7.11 -> 7.12 -> 7.13

---

## Step 7.1: `choiceNav()` helper for pure navigation choices

**Pattern being replaced:**
```ts
chs('"<= Return"', false).addEventListener('click', () => { smove(chss.target, false) });
```

**Extraction:**
Add a `choiceNav(text: string, target: any, animate?: boolean)` function to `ui/choices.ts`:
```ts
export function choiceNav(text: string, target: any, animate: boolean = true) {
  chs(text, false).addEventListener('click', () => { smove(target, animate) });
}
```

**Scope:** ~31 instances in `main.ts` match the exact pattern `chs(text).addEventListener('click', () => { smove(target) })` with no additional logic.

**Files changed:** `src/ui/choices.ts` (add function), `src/main.ts` (replace 31 call sites)

**Risks:**
- None. The helper is a trivial wrapper; closure captures are limited to `target` (a `chss.*` reference, stable object).
- The `animate` parameter defaults to `true` to match the current `smove(target)` default. Cases passing `false` explicitly keep it.

**Verification:** Build + manual nav testing through dojo, forest, hunter's lodge, xiao xiao areas.

---

## Step 7.2: `choiceAction()` helper for single-action choices

**Pattern being replaced:**
```ts
chs('"text"', false).addEventListener('click', () => { doSomething(); smove(target); });
```

**Extraction:**
Add a `choiceAction(text: string, action: () => void, opts?)` function to `ui/choices.ts`:
```ts
export function choiceAction(text: string, action: () => void, opts?: { color?: string; bg?: string }) {
  let el = chs(text, false, opts?.color, opts?.bg);
  el.addEventListener('click', action);
  return el;
}
```

**Scope:** ~40 additional instances in `main.ts` where the click handler does 1-3 simple statements (give item, set flag, smove). These are NOT pure-nav but have trivially simple bodies.

**Files changed:** `src/ui/choices.ts` (add function), `src/main.ts` (replace ~40 call sites)

**Risks:**
- Low. The callback is passed as-is; no closure semantics change.
- Some callbacks reference local variables from the enclosing `sl()` function. These closures remain valid because `choiceAction` receives the closure, not the variable directly.
- Do NOT try to extract callbacks that reference `this` (function expressions using `this` for DOM traversal). Leave those alone.

**Decision: Do NOT extract location scripts themselves.** The ~250 remaining `chs().addEventListener` calls inside `sl()` functions have complex, branching logic (conditional rendering, nested choices, state-dependent flows). A `choiceNav`/`choiceAction` helper handles the leaf cases. The `sl()` functions stay in main.ts for now; extracting locations is a Phase 8+ concern after data externalization.

---

## Step 7.3: Shop buy handler parameterization

**Current state:** `ui/shop.ts` lines 98-157 contain 4 nearly identical click handlers for buy-1x/5x/10x/Max buttons, plus a 5th duplicate on the item name element (lines 162-176). The only differences are:
1. Quantity: `1`, `5`, `10`, `max` (computed)
2. Wealth check multiplier: `p`, `p*5`, `p*10`, `p`
3. Stock check: `itm[1] > 0`, `itm[1] >= 5`, `itm[1] >= 10`, `itm[1] > 0`
4. Lottery chance: `.0008`, `.004`, `.008`, `.0008 * max`
5. Reputation bonus multiplier: `1`, `5*(1+.05)`, `10*(1+.1)`, `max*(1+max*.01)`

**Extraction:**
Create a `buyItem(itm, vnd, qty: number | 'max', el: HTMLElement)` function in `ui/shop.ts` that parameterizes all 5 differences. The `el` parameter replaces the `this.parentElement.parentElement.parentElement` DOM traversal (pass it in from the event context).

**Also extract:** The price calculation `Math.ceil(itm[2] * (you.mods.inflationRate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offlineEvilIndex)` is duplicated 8 times across the file. Extract as `calcPrice(itm, vnd): number`.

**Scope:** 5 handlers collapsed to 5 one-liner calls to `buyItem`. Price calc extracted from ~8 sites.

**Files changed:** `src/ui/shop.ts`

**Risks:**
- The reputation bonus formula differs per quantity (`1`, `5*(1.05)`, `10*(1.1)`, `max*(1+max*.01)`). This is intentional game design (bulk discount reputation scaling). Must parameterize correctly, not assume linear.
- The `this` binding in handlers is used for DOM traversal (`this.parentElement.parentElement.parentElement`). The extracted function must receive the root element explicitly. Use `function(this: any) { buyItem(itm, vnd, 1, this.parentElement.parentElement.parentElement) }` or capture via closure from `mouseenter`.
- The item-name click handler (line 162) uses a different DOM path (`this.parentElement.parentElement` instead of `this.parentElement.parentElement.parentElement`). Account for this.

---

## Step 7.4: Equipment slot tooltip loop

**Current state:** `main.ts` lines 246-255 contain 5 pairs of mouseenter/mouseleave handlers for `dom.d7_slot_3` through `dom.d7_slot_7`. Each pair is identical except for the slot index (2-6 in `you.eqp[N]`).

**Extraction:**
```ts
function addEquipSlotTooltip(slotEl: HTMLElement, eqpIndex: number) {
  slotEl.addEventListener('mouseenter', function(this: any) {
    global._tad = this.innerHTML;
    this.innerHTML = 'DEF: ' + Math.round(
      you.eqp[eqpIndex].str * (you.eqp[eqpIndex].dp / you.eqp[eqpIndex].dpmax)
      + you.str_base + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)
    );
  });
  slotEl.addEventListener('mouseleave', function(this: any) { this.innerHTML = global._tad; });
}
// Then: [3,4,5,6,7].forEach(i => addEquipSlotTooltip(dom['d7_slot_'+i], i-1));
```

**Scope:** 10 handlers -> 1 function + 1 loop.

**Files changed:** `src/main.ts`

**Risks:**
- `global._tad` is a shared mutable variable. Currently only one tooltip can be hovered at a time (mutually exclusive DOM slots), so this is safe. The extraction preserves this behavior.
- Dynamic property access `dom['d7_slot_'+i]` requires the Dom type to accommodate it. Alternatively, build the array explicitly: `[dom.d7_slot_3, dom.d7_slot_4, ...]`.

---

## Step 7.5: Sort button parameterization

**Current state:**
- Lines 1238-1243: 6 recipe sort buttons, each does `rstcrtthg(); this.style.color = 'yellow'; rsort(N)` where N = 0-5.
- Lines 1605-1609: 5 inventory sort buttons, each does `isort(N); invbtsrst()` where N = 1-5.

**Extraction:**
```ts
function addSortButton(el: HTMLElement, sortFn: (n: number) => void, resetFn: () => void, n: number) {
  el.addEventListener('click', function(this: any) { resetFn(); this.style.color = 'yellow'; sortFn(n); });
}
```
Or simpler: just loop over the arrays with index.

**Scope:** 11 handlers -> 2 loops.

**Files changed:** `src/main.ts`

**Risks:** None. Pure mechanical replacement. The `this` binding for `style.color = 'yellow'` must be preserved via `function()` (not arrow). The inventory sort buttons don't set color, so they can use a simpler form.

---

## Step 7.6: Confirm dialog extraction

**Current state:** `ui/inventory.ts` has two nearly identical confirm dialog builders (lines 43-87 for throw-away, lines 122-166 for disassemble). Each builds a modal overlay + dialog box + YES/NO buttons with identical hover handlers.

**Extraction:**
Create `showConfirmDialog(message: string, onConfirm: () => void): void` in a new export from `ui/inventory.ts` (or a shared `ui/dialogs.ts` if preferred).

The function handles:
- Overlay creation (prm)
- Dialog box creation (prm2)
- Message display
- YES/NO buttons with hover highlight handlers (6 handlers per dialog -> 0 inline)
- Cleanup on either button

**Scope:** 2 dialog builders x ~30 lines each -> 1 function (~35 lines) + 2 one-liner calls. Eliminates 12 addEventListener calls (4 hover + 2 click per dialog).

**Files changed:** `src/ui/inventory.ts` (or new `src/ui/dialogs.ts`)

**Risks:**
- The two dialogs have slightly different heights (80px vs 90px) and message formatting. Parameterize height or compute from content.
- The throw-away dialog does additional work in onConfirm (give skill XP, stats tracking). This goes in the callback, not the dialog function.

---

## Step 7.7: `addDesc` tooltip trio refactor

**Current state:** `ui/descriptions.ts` `addDesc()` attaches 3 event listeners (mouseenter, mousemove, mouseleave) to every element that has a tooltip. This is called ~50 times across the codebase. The 3 handlers are always the same structure.

**Assessment:** This is already a helper function, so it's not boilerplate in the traditional sense. The improvement here is:
1. Replace 3 `addEventListener` calls with event delegation on a parent container, OR
2. Keep `addDesc` but make the mousemove/mouseleave handlers shared (not re-created per element).

**Extraction option A (event delegation):**
Mark elements with `data-desc-*` attributes. One delegated listener on a container handles all tooltips. This would eliminate ~150 listener registrations but requires refactoring how tooltip data is stored.

**Extraction option B (shared handlers):**
The `mousemove` and `mouseleave` handlers are identical for every element. Extract them as module-level named functions and reuse:
```ts
function handleDescMove(a: MouseEvent) { /* position logic */ }
function handleDescLeave() { /* cleanup logic */ }
export function addDesc(dm, what, type?, ttl?, dsc?, f?, id?) {
  dm.addEventListener('mouseenter', (a) => { /* unique per element */ });
  dm.addEventListener('mousemove', handleDescMove);
  dm.addEventListener('mouseleave', handleDescLeave);
}
```

**Recommendation:** Option B first (simple, safe). Option A is a future optimization.

**Scope:** 2 handlers become shared references instead of new closures per call site. ~100 fewer closure allocations.

**Files changed:** `src/ui/descriptions.ts`

**Risks:**
- Medium. The `mouseleave` handler clears `timers.inup`, `timers.dp_tmr`, `timers.wpnkilsch` and checks `dom.dscshe`. These are global side effects that don't depend on the element, so sharing is safe.
- The `mousemove` handler references `global.dscr` — also element-independent. Safe to share.
- The `mouseenter` handler is unique per element (captures `what`, `type`, `ttl`, `dsc`, `id`). Cannot be shared.

---

## Step 7.8: DOM init extraction

**Current state:** `main.ts` lines ~133-650 build the entire DOM (stat display, equipment slots, battle UI, crafting panel, skills panel, options panel). This is a single imperative block with ~200 addEventListener calls mixed in.

**Extraction:** Break into focused init functions:
- `initPlayerPanel()` — lines ~133-260 (stat bars, equipment slots, tooltips)
- `initBattleUI()` — lines ~260-400 (monster display, attack buttons)
- `initBottomPanel()` — lines ~400-650 (crafting, skills, actions, options tabs)

Each function lives in `main.ts` (not extracted to modules) as named functions called from the top-level flow. This makes the init sequence readable and each section independently reviewable.

**Scope:** ~500 lines reorganized into 3-4 named functions. No handler extraction — just structural grouping.

**Files changed:** `src/main.ts`

**Risks:**
- Medium. Variable declaration order matters. Some DOM elements created in one section are referenced in another (e.g., `dom.ct_ctrl` created early, used later). Since all references go through `dom.*`, the init functions can run in any order as long as `dom` assignments happen before anything reads them.
- Must not change execution order of side effects (e.g., `setWeather()` call position).

---

## Step 7.9: Settings panel extraction

**Current state:** `main.ts` lines ~1250-1550 build the options/settings panel. This is self-contained: it creates DOM elements, attaches input/click handlers for message count, background color sliders, export/import dialogs.

**Extraction:** Move to `src/ui/settings.ts` as `initSettingsPanel()`.

**Scope:** ~300 lines, ~20 addEventListener calls.

**Files changed:** new `src/ui/settings.ts`, `src/main.ts` (call `initSettingsPanel()`)

**Risks:**
- Medium. The export/import dialogs reference `save()` and `load()` from `systems/save-load.ts`. This creates a new import dependency but no circularity.
- The `draggable()` function is defined in `main.ts`. Must either extract it to a utility module or pass it in.

---

## Step 7.10: Location script file extraction (mechanical move)

**Current state:** ~2,600 lines of location scripts (`chss.*.sl = function() { ... }`) in `main.ts` lines ~1900-4500.

**This step is a mechanical extraction only** — move location scripts out of main.ts into grouped files without redesigning them. The `sl()` functions remain imperative closures; this just unblocks main.ts shrinkage.

**Extraction strategy:**
1. Extract quest helpers (`giveQst`/`finishQst`, `d_loc`, `dojo_win`) to `game/quests.ts` or shared utils.
2. Group locations by area into files: `src/locations/dojo.ts`, `src/locations/forest.ts`, `src/locations/town.ts`, etc.
3. Each file exports an `init` function that populates `chss.*`.
4. Import order: location files run after data modules but before DOM init.

**After Steps 7.1-7.2:** `choiceNav`/`choiceAction` helpers will have simplified ~70 of the ~250 handler chains, shortening each `sl()` body.

**Scope:** ~2,600 lines moved out of main.ts into ~5-8 files. main.ts drops to ~2,000 lines.

**Files changed:** `src/main.ts`, new `src/locations/*.ts`, new `src/game/quests.ts`

**Risks:**
- Medium. Location scripts reference `chss.*` cross-location. Safe because `sl()` is only called at runtime via `smove()`, not at import time.
- Quest functions are currently local to main.ts — must extract first.

**NOTE:** This step does NOT address the fundamental design problem with `sl()` functions. See 7.13.

---

## Step 7.13: Location script conversation tree system (design required)

**Problem statement:** The `sl()` functions are ~2,600 lines of deeply nested imperative spaghetti masquerading as data. Each location defines a conversation/choice tree through raw closure nesting: `chs().addEventListener('click', () => { chs().addEventListener('click', () => { ... }) })`. This is:
- Unreadable (nesting 3-5 levels deep)
- Untestable (logic baked into anonymous closures)
- Un-authorable (adding a new location requires copy-pasting 50+ lines of boilerplate)
- Unmaintainable (a typo in a nested closure silently breaks a branch)

**This IS a pattern.** Conversation trees / dialogue systems are a solved problem in game design. The current implementation just doesn't use one.

**Design goal:** A declarative location/dialogue tree system where:
- Locations are described as data (nodes, edges, conditions, actions)
- An interpreter/renderer walks the tree and produces UI
- Adding a new location means adding data, not writing imperative DOM code
- Conditional branches are expressed as predicates on state, not nested closures
- The tree structure is introspectable (testable, visualizable, serializable)

**Possible shapes (needs architect deep-dive):**
1. **Node graph** — each location is a node with typed edges (nav, dialogue, action). Conditions are predicate functions. A walker renders the current node.
2. **DSL/builder** — `location('town_square').choice('Go north', nav('forest')).choice('Talk to merchant', dialogue([...]))` fluent API.
3. **Data-driven** — JSON/object literal trees with string action references resolved at runtime.

**Scope:** Large. This is a system design task, not a mechanical refactor. Requires:
1. Architect designs the tree system
2. Build interpreter/renderer
3. Migrate 1-2 simple locations as proof of concept
4. Migrate remaining locations incrementally

**Dependencies:** Benefits from 7.1-7.2 (choice helpers reveal the patterns), 7.10 (files already separated by area).

**Risks:**
- High design risk — wrong abstraction worse than no abstraction. Must prove the system on simple AND complex locations before committing.
- Some `sl()` functions have genuinely complex imperative logic (multi-step quest flows, conditional NPC spawns, dynamic shop openings). The system must handle these without degenerate escape hatches.
- Migration is incremental — old `sl()` and new tree nodes must coexist during transition.

---

## Step 7.11: Game logic / DOM decoupling seams

**Goal:** Identify the tightest coupling points between game logic and DOM manipulation, and insert seams that allow testing game logic without a DOM.

**Key coupling points identified:**
1. `game/combat.ts` calls `msg()`, `updateCombatDisplay()`, `updateMonsterDisplay()` directly
2. `game/movement.ts` calls `chs()`, `clr_chs()`, `msg()` directly
3. `game/inventory.ts` calls `msg()`, `isort()`, rendering functions directly
4. `game/progression.ts` calls `msg()`, `updateStatDisplay()` directly

**Strategy:** Introduce a notification/event pattern rather than direct calls:
- Option A: Callback registry — game functions accept optional callbacks for UI updates
- Option B: Simple event emitter — game functions emit events, UI subscribes
- Option C: Return values — game functions return result objects, callers handle UI

**Recommendation:** Option C for new code, Option A as migration path. Start with one module (`game/economy.ts` is simplest — `giveWealth`/`spend` currently call `msg()` and return void). Make them return a result, let the call site handle messaging.

**Scope:** This is structural work with no fixed line count. Start with 1-2 functions as proof of concept.

**Files changed:** Selected `game/*.ts` modules and their call sites.

**Risks:**
- High. Changing function signatures has wide blast radius. Must be done one function at a time with full regression testing.
- The `msg()` calls in game logic are sometimes conditional on game state. Moving the decision to the call site means the call site must understand the condition.
- Some functions are called from data module delegates (equipment `oneq`, item `use`), which are hard to intercept.

---

## Step 7.12: Test harness bootstrap

**Goal:** Establish the testing infrastructure so future changes can be verified automatically.

**Setup:**
1. Add vitest (lightweight, esbuild-native, no jsdom required for pure logic tests)
2. Create `src/__tests__/` directory
3. Write initial tests for pure functions that already have no DOM dependency:
   - `game/utils-game.ts`: `formatw`, `roll`
   - `game/economy.ts`: `giveWealth`, `spend` (after 7.11 decoupling)
   - `game/combat.ts`: `dmg_calc`, `hit_calc` (pure math, but currently import `you` — may need player mock)
   - `utils.ts`: `col`, `scan`, `scanbyid`, `format3`

4. Add `npm test` script to `package.json`

**Scope:** ~5-10 initial test files, testing ~15-20 pure functions.

**Files changed:** `package.json` (add vitest), new `src/__tests__/*.test.ts`, possibly `vitest.config.ts`

**Risks:**
- Low for the harness itself.
- Some "pure" functions read global state (`you`, `flags`, `stats`). Tests must either mock the state module or set up a test player. The Phase 5 IoC work (player as parameter) helps here — delegates already receive player.
- DOM-dependent functions cannot be tested without jsdom or happy-dom. Defer those until Step 7.11 creates seams.

---

## Execution Notes

**Verification protocol (every step):**
1. `npm run build` succeeds
2. `npm run typecheck` passes with 0 errors
3. Browser test: fresh start, load existing save, navigate, fight, craft, save/reload
4. No console errors
5. Bundle size delta < 1kb (helpers add code, but inlining removal should offset)

**Step independence:**
- Steps 7.1-7.6 are independent of each other and can be done in any order. They share no dependencies.
- Step 7.7 is independent.
- Steps 7.8-7.9 depend on 7.1-7.2 being done first (fewer handlers to move means cleaner init functions).
- Step 7.10 depends on 7.1-7.2 (helpers reduce noise in location scripts before extraction).
- Step 7.11 is independent but benefits from all prior steps reducing main.ts complexity.
- Step 7.12 depends on 7.11 for the most useful tests, but the harness itself can be set up anytime.
- **Step 7.13** depends on 7.10 (files separated) and benefits from 7.1-7.2 (patterns visible). Requires dedicated architect design session before implementation.

**What this phase does NOT do:**
- Does not introduce a full event system or state management library.
- Does not rename remaining `global.*` properties (done in Phase 6).
- Does not add jsdom/browser testing — only pure logic tests.
