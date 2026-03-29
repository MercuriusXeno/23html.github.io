import type { Item, Equipment } from '../types';
import { random, rand } from '../random';
import { global, you, data, gameText, flags } from '../state';
const { skl } = data;
import { emit } from '../events';
import { giveItem } from './inventory';

    export function roll(itm: Item | Equipment, chance: number, mi?: number, ma?: number): void {
      mi = mi || 1;
      let r = random();
      if (r < chance + (chance / 100 * you.luck)) giveItem(itm, (!!ma ? rand(mi, ma) : rand(mi)));
    }

    export function formatw(amount: number): string | number {
      let b = (Math.log(Math.abs(amount + 1)) * 0.43429448190325178 | 0) + 1;
      if (b > 3) { let n = amount / 1000 ** ((b - 1) / 3 << 0) * 10; return ((n - ~~n >= 0.5 ? 1 : 0) + ~~n) / 10 + gameText.nt[((b - 4) / 3 << 0)] } return amount;
    }

    export function kill(obj: any): void { obj = null; }

    export function handStr(): number {
      return (5000 + (you.str * 800)) * (1 + you.lvl * .03) * (1 + skl.unc.lvl * .1 + skl.fgt.lvl * .08 + skl.tghs.lvl * .11) / 1000 << 0
    }

    export function cansee(): boolean | undefined { if ((flags.isdark && you.mods.light > 0) || skl.ntst.lvl >= 12) return true }

    export function canRead(): boolean {
      if (!flags.civil || flags.btl) { emit('msg', 'It is too dangerous to read right now', 'red'); return false }
      if (flags.rdng) { emit('msg', "You're already reading", 'orange'); return false }
      if (flags.work) { emit('msg', "You have a job to do", 'orange'); return false }
      if (flags.busy) { emit('msg', "You'll have to stop what you're doing first", 'orange'); return false }
      if (flags.isshop) { emit('msg', "This isn't the library", 'orange'); return false }
      if (flags.sleepmode) { emit('msg', "You can't read while sleeping", 'orange'); return false }
      return true;
    }
