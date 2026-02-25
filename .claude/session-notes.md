# Session Notes
<!-- Written by /wrapup. Read by /catchup at the start of the next session. -->
<!-- Overwritten each session — history preserved in git log of this file. -->

- **Date:** 2026-02-25
- **Branch:** main

## What Was Done
- Completed Phase 3 Step 3.7: main.ts cleanup pass
- Removed 34 `// --- ... moved to src/...` extraction comment markers from `src/main.ts`
- Removed 4 commented-out dead code blocks (DOM mousedown/mouseup listeners, unused tab buttons, placeholder achievement checks)
- Collapsed blank line gaps left by removals
- `src/main.ts` reduced from ~6,180 to ~6,105 lines (75 lines removed)
- Updated `ROADMAP.md`: Step 3.7 checked off, Phase 3 fully complete
- Updated `CLAUDE.md`: line counts, Phase 3 status, ROADMAP description
- Updated `MEMORY.md`: line counts, Phase 3 status

## Decisions Made
- Commented-out achievement check stubs (monchk, shptchk) removed — they were placeholders with duplicate GOLD thresholds, not real future content
- Commented-out DOM mousedown/mouseup listeners removed — shake effect was abandoned
- No exports removed — audit confirmed all exports are used by ui/ modules despite appearing internal

## Open Items
- [ ] CSS semantic rename from `CLASS_MAP.md` (deferred — do after modularization)
- [ ] `.exp` text-shadow typo `0pzx` in styles.css
- [ ] Heavy rendering functions still in main.ts could be extracted in Phase 4

## Next Steps
1. Phase 4 Step 4.1: Resolve circular imports — barrel exports for `src/data/`
2. Phase 4 Step 4.5: Enable `strict: true` incrementally (low-risk, catches bugs)
3. Phase 4 Steps 4.2-4.4: Deeper architecture improvements

## Context for Next Session
Phase 3 (TypeScript + ES Modules) is fully complete. The monolith has been split into utility modules (5), state module (1), data modules (13), system modules (3), and UI modules (8). main.ts is ~6,100 lines — mostly DOM setup, core game logic, and heavy rendering functions too entangled to extract cleanly. Bundle size is stable at ~789kb. Phase 4 (architecture improvements) is next.
