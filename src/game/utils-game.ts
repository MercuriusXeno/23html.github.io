import { random, rand } from '../random';
import { global, you, data, gameText, flags } from '../state';
const { skl } = data;
import { msg } from '../ui/messages';
import { giveItem } from './inventory';

    export function roll(itm: any, c: number, mi?: number, ma?: number): void {
      mi = mi || 1;
      let r = random();
      if (r < c + (c / 100 * you.luck)) giveItem(itm, (!!ma ? rand(mi, ma) : rand(mi)));
    }

    export function formatw(a: number): any {
      let b = (Math.log(Math.abs(a + 1)) * 0.43429448190325178 | 0) + 1;
      if (b > 3) { let n = a / 1000 ** ((b - 1) / 3 << 0) * 10; return ((n - ~~n >= 0.5 ? 1 : 0) + ~~n) / 10 + gameText.nt[((b - 4) / 3 << 0)] } return a;
    }

    export function kill(obj: any): void { obj = null; }

    export function cansee(): boolean | undefined { if ((flags.isdark && you.mods.light > 0) || skl.ntst.lvl >= 12) return true }

    export function canRead(): boolean {
      if (!flags.civil || flags.civil.btl) { msg('It is too dangerous to read right now', 'red'); return false }
      if (flags.rdng) { msg("You're already reading", 'orange'); return false }
      if (flags.work) { msg("You have a job to do", 'orange'); return false }
      if (flags.busy) { msg("You'll have to stop what you're doing first", 'orange'); return false }
      if (flags.isshop) { msg("This isn't the library", 'orange'); return false }
      if (flags.sleepmode) { msg("You can't read while sleeping", 'orange'); return false }
      return true;
    }
