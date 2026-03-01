// ==========================================================================
// Exploration & Scouting
// ==========================================================================

import { random } from '../random';
import { select } from '../utils';
import { dom, global, you, inv, data, flags, stats, } from '../state';
const { skl, act } = data;
import { msg } from '../ui/messages';
import { updateInv } from '../ui/inventory';
import { deactivateAct } from '../ui/panels';
import { giveSkExp } from './progression';
import { giveItem, removeItem } from './inventory';
import { cansee } from './utils-game';

export function canScout(what: any): number {
  if (what.data.scoutm) {
    for (let a in what.scout) if (what.data.gets[a] !== true && (!what.scout[a].cond || what.scout[a].cond() === true)) return 1;
    return 2
  } return 3
}

export function scoutGeneric(chs: any): void {
  if (flags.isdark && !cansee()) return msg('You can\'t see anything', 'grey')
  let sct = select(chs.scout);
  let idx = chs.scout.indexOf(sct);
  giveSkExp(skl.scout, .3);
  chs.data.scout += 2 * (1 + skl.scout.lvl * .2);
  let m = 1;
  if (chs.data.scout >= chs.data.scoutm) { m = 5; chs.data.scout = 0 }
  if ((!sct.cond || sct.cond() === true) && !chs.data.gets[idx] && random() <= sct.c * m * (1 + skl.scout.lvl * .15) * (1 + chs.data.gotmod * .2)) { stats.dsct++; chs.data.gotmod++; sct.f(); giveSkExp(skl.scout, (sct.exp ? sct.exp : .5 / sct.c)) }
  let t = 2;
  for (let a in global.current_l.sector) { let m = canScout(global.current_l.sector[a]); if (m === 1) t = m }
  if (canScout(global.current_l) >= 2 && t >= 2) { deactivateAct(act.scout); msg('There doesn\'t seem to be anything of interest left in this area') }
}

export function disassembleGeneric(obj: any): void {
  for (let a in obj.dss) {
    let am = obj.dss[a].amount;
    if (obj.dss[a].q) am = (am + am * (obj.dss[a].q * skl.dssmb.lvl)) << 0;
    if (obj.dss[a].max) if (am > obj.dss[a].max) am = obj.dss[a].max;
    let c = 1;
    if (obj.slot) c = obj.dp / obj.dpmax;
    am = Math.ceil(am / (2 - c));
    giveItem(obj.dss[a].item, am)
  } giveSkExp(skl.dssmb, (2 ** obj.rar || 1) * 5 - 9.5); stats.dsst++;
  if (obj.slot) removeItem(obj);
  else { obj.amount--; if (obj.amount <= 0) removeItem(obj); else if (obj.stype === global.sm) updateInv(global.sinv.indexOf(obj)); else if (global.sm === 1) updateInv(inv.indexOf(obj)) }
}
