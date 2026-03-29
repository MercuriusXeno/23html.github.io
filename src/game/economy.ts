import type { Vendor } from '../types';
import { random, rand } from '../random';
import { shuffle } from '../utils';
import { global, you, data, stats, } from '../state';
const { skl } = data;
import { SILVER, GOLD } from '../constants';
import { giveSkExp } from './progression';
import { emit } from '../events';

    export function giveWealth(val: number, showMessage?: boolean, extraWealth?: boolean): void {
      if (you.mods.wealthExtra !== 0 && extraWealth) val += 1;
      you.wealth += val;
      stats.moneyGained += val;
      for (let x in global.monchk) global.monchk[x]();
      if (!stats.mndrgnu && you.wealth >= 100000000) { stats.mndrgnu = true; emit('achievement:unlocked', 'mn_1') }
      emit('wealth:changed');
      giveSkExp(skl.gred, val * .01);
      if (showMessage !== false) {
        emit('wealth:gained', val);
      } emit('shop:refresh');
    }

    export function spend(amount: number): void {
      if (you.wealth < amount) return
      you.wealth -= amount;
      stats.moneySpent += amount;
      emit('wealth:changed');
    }

    export function restock(vnd: Vendor): void {
      vnd.stock = []; shuffle(vnd.items);
      for (let ims = 0; ims < vnd.items.length; ims++) {
        if ((!vnd.items[ims].cond || vnd.items[ims].cond?.() === true) && random() <= vnd.items[ims].c) vnd.stock.push([vnd.items[ims].item, rand(vnd.items[ims].min, vnd.items[ims].max), vnd.items[ims].p]);
        vnd.stock.sort(function (a: any, b: any) { if (a[0].id < b[0].id) return -1; if (a[0].id > b[0].id) return 1; return 0 });
      }
    }
