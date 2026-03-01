import { random, rand } from '../random';
import { shuffle } from '../utils';
import { appear } from '../dom-utils';
import { dom, global, you, data, stats, } from '../state';
const { skl, vendor } = data;
import { SILVER, GOLD } from '../constants';
import { msg, msg_add } from '../ui/messages';
import { m_update } from '../ui/stats';
import { giveSkExp } from './progression';
import { recshop } from '../ui/shop';

    export function giveWealth(val: number, mes?: any, f?: any): void {
      if (you.mods.wthexrt !== 0 && f) val += 1;
      you.wealth += val;
      stats.moneyg += val;
      for (let x in global.monchk) global.monchk[x]();
      if (!stats.mndrgnu && you.wealth >= 100000000) { stats.mndrgnu = true; appear(dom.mn_1) }
      m_update();
      giveSkExp(skl.gred, val * .01);
      if (mes !== false) {
        msg('+', 'gold');
        if (val >= GOLD) msg_add(' ●' + ((val / GOLD) << 0), 'rgb(255, 215, 0)');
        if (val >= SILVER && val % GOLD >= SILVER) msg_add(' ●' + ((val / SILVER % SILVER) << 0), 'rgb(192, 192, 192)');
        if (val < SILVER || (val > SILVER && val % SILVER > 0)) msg_add(' ●' + ((val % SILVER) << 0), 'rgb(255, 116, 63)');
      } recshop();
    }

    export function spend(m: number): void {
      if (you.wealth < m) return
      you.wealth -= m;
      stats.moneysp += m;
      m_update()
    }

    export function restock(vnd: any): void {
      vnd.stock = []; shuffle(vnd.items);
      for (let ims = 0; ims < vnd.items.length; ims++) {
        if ((!vnd.items[ims].cond || vnd.items[ims].cond() === true) && random() <= vnd.items[ims].c) vnd.stock.push([vnd.items[ims].item, rand(vnd.items[ims].min, vnd.items[ims].max), vnd.items[ims].p]);
        vnd.stock.sort(function (a: any, b: any) { if (a[0].id < b[0].id) return -1; if (a[0].id > b[0].id) return 1; return 0 });
      }
    }
