# CSS Class Name Mapping

## Status: Phase 1.1 — Extraction Complete, Rename Pending

This document maps original cryptic CSS class names to semantic names.
The rename will be applied in a follow-up step using a script to ensure safety.

## Ready to Rename (meaning clear, unique enough for safe replacement)

| Original | Semantic Name | Purpose |
|----------|--------------|---------|
| `inv_slot` | `inventory-slot` | Inventory item slot |
| `del_b` | `delete-btn` | Delete/discard button (x) |
| `dss_b` | `disassemble-btn` | Disassemble button |
| `crf_lg` | `craft-log-entry` | Crafting log entry |
| `crf_c_bts` | `craft-tab` | Crafting category tab |
| `bts_b` | `nav-button` | Bordered navigation button |
| `bts_m_b` | `msg-badge` | Message control badge |
| `bts_m` | `msg-ctrl-btn` | Message control button |
| `ct_bts` | `control-tab` | Control panel tab |
| `opt_c` | `option-row` | Settings option row |
| `opt_ta` | `option-label-alt` | Settings option label (alt) |
| `opt_va` | `option-value-alt` | Settings option value (alt) |
| `opt_t` | `option-label` | Settings option label |
| `opt_v` | `option-input` | Settings option value/input |
| `skwmmc` | `skill-entry` | Skill list entry row |
| `rgt_ics` | `recipe-cell` | Recipe grid cell |
| `chs_s` | `choice-detail` | Choice detail sub-line |
| `bst_entr1` | `list-col-name` | List name column |
| `bst_entr2` | `list-col-rank` | List rank column |
| `bst_entr3` | `list-col-stat` | List stat/kills column |
| `bst_entr` | `list-row` | List entry row (bestiary, etc.) |
| `dseparator` | `divider` | Horizontal divider |
| `trkitm` | `tracked-item` | Tracked item row |
| `atrkmove2` | `track-move-left` | Move tracked item left |
| `atrkmove` | `track-move-right` | Move tracked item right |
| `youttl` | `title-entry` | Player title entry |
| `ctrwinbx` | `ctrl-window-body` | Control window body |
| `ch_entbb` | `quantity-btn` | Shop quantity button |
| `sttc` | `stat-row` | Stats table row |
| `sttl` | `stat-label` | Stats table label |
| `sttr` | `stat-value` | Stats table value |
| `jcell` | `journal-cell` | Journal grid cell |
| `jrow` | `journal-row` | Journal grid row |
| `bksstt` | `popup-list` | Popup list container |
| `blssttc` | `popup-list-cell` | Popup list cell |
| `noout` | `no-outline` | Remove outline |
| `se_ia` | `sprite-cell` | Sprite sheet cell |
| `s_am` | `stack-amount` | Item stack amount |
| `spc_a` | `special-action` | Special action icon |
| `shn` | `floating-text` | Floating shine text |
| `noselect` | `no-select` | Disable text selection |
| `doselect` | `do-select` | Re-enable text selection |
| `chbtsa` | `panel-nav-tab` | Panel navigation tab |

## Flagged — Ambiguous/Risky (need clarification or careful handling)

| Original | Proposed Name | Issue |
|----------|--------------|-------|
| `d` | `player-panel` | Single letter — too short for safe global replace |
| `dd` | `panel-tab` | Two letters — collision risk with `ddd_1`, `ddd_2` |
| `ddd_1` | `equip-slot` | Substring of other patterns |
| `ddd_2` | `equip-row` | Substring of other patterns |
| `d2` | `gradient-bar` | Short, used with `d3`, `d3m` |
| `d3` | `gradient-bar-hover` | Substring of `d3m` |
| `d3m` | `gradient-bar-alt` | Related to `d3` |
| `bts` | `tab-button` | Substring of `bts_b`, `bts_m`, `bts_m_b` |
| `chs` | `choice-button` | Also used as ID `#chs` |
| `sl` | `toolbar-btn` | Also used as ID `#sl` |
| `bbts` | `action-btn` | Also used as ID `#bbts` |
| `msg` | `message-entry` | Conflicts with `msg()` function name |
| `hp` | `hp-bar` | Very short |
| `exp` | `exp-bar` | Very short, substring of other things |
| `en` | `energy-bar` | Very short |
| `eq_r` | `equip-right` | Also used as `dom.eq_r` property |
| `eq_l` | `equip-left` | Also used as `dom.eq_l` property |

## Possibly Dead CSS (defined but no JS references found)

- `.doselect` — defined but never applied via JS
- `.chbtsa` — defined but never applied via JS
