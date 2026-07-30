# Frontend CSS Refactoring Plan

## Analysis of `styles.css`

The current stylesheet has ~70 rules across 1,025 lines. While functional, it contains
significant repetition that can be consolidated using CSS custom properties (design tokens)
and semantic component classes.

---

## 1. Design Tokens (CSS Custom Properties)

Repeated color values, gradients, and borders that should become `:root` variables.

### Panel Backgrounds (dark navy spectrum)
| Token | Value | Used By |
|-------|-------|---------|
| `--panel-bg` | `rgb(0, 40, 64)` | `.d`, `#bbts` gradient start |
| `--panel-bg-dark` | `rgb(0, 5, 51)` | `#ctrmg`, `#inv`, `#inv_control_b` gradient start |
| `--panel-bg-mid` | `rgb(0, 65, 107)` | `#ctrmg`, `#inv`, `#inv_control_b` gradient end |
| `--panel-bg-darker` | `rgb(0, 20, 44)` | `#chs` background |
| `--panel-bg-choice` | `rgb(0, 44, 87)` | `.chs` background |

### Text Colors
| Token | Value | Used By |
|-------|-------|---------|
| `--text-cyan` | `rgb(188, 254, 254)` | `#ctrmg`, `#inv`, `.panel-nav-tab` |
| `--text-white` | `white` | `.d` |

### Interactive/Hover Colors
| Token | Value | Used By |
|-------|-------|---------|
| `--hover-blue` | `rgb(20, 50, 84)` | `.stat-row:hover`, `#bst_entrh:hover`, `.quantity-btn:hover` |
| `--hover-option` | `#154080` | `.skill-entry:hover`, `.option-label-alt:hover`, `.option-value-alt:hover`, `#qtrtn:hover` |
| `--hover-tab` | `rgb(105, 105, 199)` | `.dd:hover` |
| `--bg-option` | `rgb(10, 30, 54)` | `.option-row`, `.quantity-btn:hover`, `#bst_entrh` bg |

### Purple Spectrum (messages, crafting)
| Token | Value | Used By |
|-------|-------|---------|
| `--msg-bg` | `rgb(36, 21, 59)` | `.msg`, `#crf_r` |
| `--msg-bg-hover` | `#282756` | `.msg:hover` |
| `--msg-panel-start` | `rgb(60, 50, 90)` | `#gmsgs` gradient start |
| `--msg-panel-end` | `rgb(24, 16, 49)` | `#gmsgs` gradient end |
| `--craft-entry-bg` | `rgb(46, 41, 169)` | `.craft-log-entry` |

### Borders
| Token | Value | Used By |
|-------|-------|---------|
| `--border-blue` | `#44c` | `.inventory-slot`, `.stat-row`, `.stat-label`, `.tracked-item` |
| `--border-purple` | `#9485ed` | `.list-row`, `.list-col-rank`, `.list-col-stat`, `.quantity-btn` |
| `--border-choice` | `#3848c0` | `.chs`, `.choice-detail`, `#chs` |
| `--border-recipe` | `#3e4092` | `.recipe-cell`, `#rptbn` |
| `--border-panel` | `solid 3px black` | `#d1`, `#ctrmg`, `#inv`, `#gmsgs` |

### Gradients
| Token | Value | Used By |
|-------|-------|---------|
| `--gradient-teal` | `linear-gradient(90deg, rgb(25,129,108), rgb(1,41,39))` | Shared hover, `.d2`, `.d3`, `.d3m` |
| `--gradient-panel` | `linear-gradient(90deg, rgb(0,5,51), rgb(0,65,107))` | `#ctrmg`, `#inv`, `#inv_control_b` |
| `--gradient-header` | `linear-gradient(270deg, rgb(36,37,62), rgb(11,32,80))` | `#ctrm_1` |
| `--gradient-info` | `linear-gradient(270deg, rgb(84,28,112), rgb(29,62,116))` | `#ainfo` |

### Sizing
| Token | Value | Used By |
|-------|-------|---------|
| `--font-main` | `1.1em MS Gothic` | `html body`, `#nch`, `.option-input` |
| `--font-small` | `.9em MS Gothic` | `.msg`, `.control-tab`, `#dscr`, Firefox `.option-input` |
| `--scrollbar-color` | `#5fc3ff` | Scrollbar styles |
| `--icon-size` | `16px` | `.delete-btn`, `.disassemble-btn`, `.eq_r`, `.eq_l`, `.special-action` |

---

## 2. Repeated Structural Patterns (Component Classes)

### Pattern A: "Panel" — Absolute positioned container
**Found in:** `.d`, `#ctrmg`, `#inv`, `#gmsgs`, `#dscr`, `.popup-list`, `#youttlc`

Common properties: `position: absolute`, border, background gradient/color, fixed dimensions.

```css
/* Proposed */
.panel {
  position: absolute;
  border: var(--border-panel);
}
.panel--dark {
  background: var(--gradient-panel);
  color: var(--text-cyan);
}
```

### Pattern B: "List Row" — Flex row with bottom border
**Found in:** `.list-row`, `.stat-row`, `.option-row`, `.tracked-item`, `.inventory-slot`, `.msg`, `.skill-entry`, `.craft-log-entry`

Common properties: border-bottom separator, often with `display: flex`.

```css
/* Proposed */
.list-item {
  border-bottom: 1px solid var(--border-blue);
}
.list-item--flex {
  display: flex;
}
```

### Pattern C: "Inline Action Button" — Small absolute-positioned icon
**Found in:** `.delete-btn`, `.disassemble-btn`, `.eq_r`, `.eq_l`, `.special-action`

Common properties: `position: absolute; width: 16px; text-align: center; margin-top: -19px`

```css
/* Proposed */
.inline-action {
  position: absolute;
  width: var(--icon-size);
  text-align: center;
  margin-top: -19px;
}
```
Then each variant only needs `right: <value>` and color overrides.

### Pattern D: "Tab Button" — Width-percentage button in flex container
**Found in:** `.bts` (20%), `.dd` (25%), `.control-tab` (20%), `.panel-nav-tab` (20%), `.craft-tab` (100%)

Common properties: `text-align: center; width: <percentage>`

### Pattern E: "Status Bar" — Full-width gradient bar with text shadow
**Found in:** `.hp`, `.exp`, `.en`

Common properties: `width: 100%`, gradient background, text-shadow for readability

```css
/* Proposed */
.status-bar {
  width: 100%;
  text-shadow: black 1px 1px 0px, black 1px 0px 0px;
}
```

### Pattern F: "Grid Cell" — Bordered half-width cell
**Found in:** `.recipe-cell`, `.journal-cell`, `.ddd_1`

Common properties: `width: 50%; text-align: center; border`

### Pattern G: "Toolbar Control" — Bottom-fixed flex bar
**Found in:** `#ct_ctrl`, `#m_control`, `#inv_control_b`, `#bbts`

Common properties: `position: absolute; display: flex; bottom: <value>; width: 100%`

```css
/* Proposed */
.toolbar {
  position: absolute;
  display: flex;
  width: 100%;
  bottom: 0;
}
```

---

## 3. Hover State Consolidation

Currently there are two main hover patterns scattered across many rules:

### Teal Gradient Hover (11 selectors in one rule)
Already consolidated at line 76. This is the "interactive element" hover.

### Blue Solid Hover
`background-color: rgb(20, 50, 84)` or `#154080` used by:
- `.stat-row:hover`
- `#bst_entrh:hover`
- `.skill-entry:hover`
- `.option-label-alt:hover`, `.option-value-alt:hover`
- `#qtrtn:hover`
- `.quantity-btn:hover`

Could become a single utility: `.hover-highlight:hover { background-color: var(--hover-blue); }`

---

## 4. Dead / Redundant CSS

| Rule | Issue |
|------|-------|
| `.panel-nav-tab` | Defined but never applied in JS |
| `#chs height: 60px` then `height: auto` | Second declaration overrides first |
| `.ddd_1 height: 100%` then `height: initial` | Second overrides first |
| `.special-action` in `@supports` | Duplicated twice in Firefox block |
| `.exp` text-shadow | Has typo `0pzx` (should be `0px`) |

---

## 5. Proposed `:root` Block

```css
:root {
  /* Panel backgrounds */
  --panel-bg: rgb(0, 40, 64);
  --panel-bg-dark: rgb(0, 5, 51);
  --panel-bg-mid: rgb(0, 65, 107);

  /* Text */
  --text-cyan: rgb(188, 254, 254);

  /* Hover */
  --hover-blue: rgb(20, 50, 84);
  --hover-option: #154080;
  --bg-option: rgb(10, 30, 54);

  /* Messages / purple */
  --msg-bg: rgb(36, 21, 59);

  /* Borders */
  --border-blue: #44c;
  --border-purple: #9485ed;
  --border-choice: #3848c0;
  --border-panel: solid 3px black;

  /* Gradients */
  --gradient-teal: linear-gradient(90deg, rgb(25, 129, 108), rgb(1, 41, 39));
  --gradient-panel: linear-gradient(90deg, var(--panel-bg-dark), var(--panel-bg-mid));

  /* Typography */
  --font-main: 1.1em MS Gothic;
  --font-small: .9em MS Gothic;

  /* Sizing */
  --icon-size: 16px;
  --scrollbar-color: #5fc3ff;
}
```

---

## 6. Implementation Order

When we get to this:

1. Add `:root` design tokens — zero visual change, just variables
2. Replace hardcoded values with `var(--token)` references — zero visual change
3. Extract component base classes (`.panel`, `.list-item`, `.inline-action`, `.toolbar`) — refactor JS to apply them
4. Reduce individual rules to only their unique overrides
5. Fix dead CSS and typos
6. Consolidate hover states

Each step is independently verifiable in the browser.
