import { random, rand } from '../random';
import { global, you, skl } from '../state';
import { giveItem } from './inventory';

    export function roll(itm, c, mi, ma) {
      mi = mi || 1;
      let r = random();
      if (r < c + (c / 100 * you.luck)) giveItem(itm, (!!ma ? rand(mi, ma) : rand(mi)));
    }

    export function formatw(a) {
      let b = (Math.log(Math.abs(a + 1)) * 0.43429448190325178 | 0) + 1;
      if (b > 3) { let n = a / 1000 ** ((b - 1) / 3 << 0) * 10; return ((n - ~~n >= 0.5 ? 1 : 0) + ~~n) / 10 + global.text.nt[((b - 4) / 3 << 0)] } return a;
    }

    export function kill(obj) { obj = null; }

    export function cansee() { if ((global.flags.isdark && you.mods.light > 0) || skl.ntst.lvl >= 12) return true }
