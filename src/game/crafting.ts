// ==========================================================================
// Crafting System
// ==========================================================================

import type { Recipe } from '../types';
import { rand } from '../random';
import { findworst } from '../utils';
import { global, settings, inv } from '../state';
import { isort } from '../ui/inventory';
import { giveItem, removeItem } from './inventory';

function evaluateSpecialRequirementsForRecipe(recipe: Recipe): (0 | 1 | 2)[] {
  if (recipe.srect == null) {
    return [0];
  }

  let results: (0 | 1 | 2)[] = [];
  for (let i in recipe.srec) {
    results[i as any] = ((recipe.srec as any)[i]() === true) ? 1 : 2;
  }
  return results;
}

function scan2(arr: any[], val: { id?: number }, am: number): { a: boolean; b: any } | undefined {
  for (let o = 0; o < arr.length + 1; o++) {
    if (o === arr.length) return { a: false, b: arr[o] };
    if (arr[o].id === val.id && arr[o].amount >= am) return { a: true, b: arr[o] };
    else continue;
  }
}

export function canMake(recipe: Recipe, times: number): { x: any[]; y: any[]; z: number[]; o: (0 | 1 | 2)[]; success: boolean; b: boolean[]; r: any[] } {
  let missing: any[] = [];
  let has: any[] = [];
  let z: any[] = [];
  let b: any[] = [];
  let r: any[] = [];
  let o = evaluateSpecialRequirementsForRecipe(recipe);
  for (let i = 0; i < recipe.rec.length; i++) {
    let sc: any = new Object();
    if (!recipe.rec[i].item.slot) {
      sc = scan2(inv, recipe.rec[i].item, recipe.rec[i].amount * times);
      z.push(recipe.rec[i].item.amount * times);
    } else {
      let ar = findworst(inv, recipe.rec[i].item);
      if (ar.length >= recipe.rec[i].amount * times) sc.a = true;
      z.push(ar.length);
      r = ar;
    }
    if (!sc.a) {
      missing.push(recipe.rec[i].item);
      b.push(false)
    } else {
      has.push(recipe.rec[i].item);
      b.push(true)
    }
  } for (let a in global.testCorc) global.testCorc[a].testc = false;
  return { x: missing, y: has, z, o, success: missing.length === 0 && !o.includes(2), b, r };
}


export function make(recipe: Recipe, preview?: boolean, times?: number): any {
  times = times || 1
  let check = canMake(recipe, times);
  if (preview || !check.success) {
    return check;
  } for (let k = 0; k < times; k++) {
    for (let j = 0; j < recipe.rec.length; j++) {
      if (recipe.rec[j].return) continue;
      if (!recipe.rec[j].item.slot) {
        let itemToAlter = scan2(inv, recipe.rec[j].item, recipe.rec[j].amount)!.b;
        itemToAlter.amount -= recipe.rec[j].amount;
        if (itemToAlter.amount === 0) removeItem(itemToAlter);
      } else {
        let ar = findworst(inv, recipe.rec[j].item);
        let finar: any[] = [];
        for (let m = 0; m < recipe.rec[j].amount; m++) finar.push(ar[m]);
        for (let m in finar) removeItem(finar[m]);
      }
    }
    if (!!recipe.cmake) { recipe.cmake(); }
    else {
      for (let itm in recipe.res) {
        if (!recipe.res[itm].amount_max) giveItem(recipe.res[itm].item, recipe.res[itm].amount);
        else { giveItem(recipe.res[itm].item, rand(recipe.res[itm].amount, recipe.res[itm].amount_max)); }
      }
      recipe.onmake();
    }
  }
  isort(settings.sortMode);
}
