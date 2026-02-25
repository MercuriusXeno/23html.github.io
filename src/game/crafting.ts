// ==========================================================================
// Crafting System
// ==========================================================================

import { rand } from '../random';
import { findworst } from '../utils';
import { global, inv } from '../state';
import { isort } from '../ui/inventory';
import { giveItem, removeItem } from './inventory';

function evaluateSpecialRequirementsForRecipe(recipe) {
  if (recipe.srect == null) {
    return [0];
  }

  let results = [];
  for (let i in recipe.srec) {
    results[i] = (recipe.srec[i]() === true) ? 1 : 2;
  }
  return results;
}

function scan2(arr, val, am) {
  for (let o = 0; o < arr.length + 1; o++) {
    if (o === arr.length) return { a: false, b: arr[o] };
    if (arr[o].id === val.id && arr[o].amount >= am) return { a: true, b: arr[o] };
    else continue;
  }
}

export function canMake(rc, times) {
  let missing = [];
  let has = [];
  let z = [];
  let b = [];
  let r = [];
  let o = evaluateSpecialRequirementsForRecipe(rc);
  for (let i = 0; i < rc.rec.length; i++) {
    let sc = new Object();
    if (!rc.rec[i].item.slot) {
      sc = scan2(inv, rc.rec[i].item, rc.rec[i].amount * times);
      z.push(rc.rec[i].item.amount * times);
    } else {
      let ar = findworst(inv, rc.rec[i].item);
      if (ar.length >= rc.rec[i].amount * times) sc.a = true;
      z.push(ar.length);
      r = ar;
    }
    if (!sc.a) {
      missing.push(rc.rec[i].item);
      b.push(false)
    } else {
      has.push(rc.rec[i].item);
      b.push(true)
    }
  } for (let a in global.tstcr) global.tstcr[a].testc = false;
  return { x: missing, y: has, z, o, success: missing.length === 0 && !o.includes(2), b, r };
}


export function make(rc, rp, times) {
  times = times || 1
  let check = canMake(rc, times);
  if (rp || !check.success) {
    return check;
  } for (let k = 0; k < times; k++) {
    for (let j = 0; j < rc.rec.length; j++) {
      if (rc.rec[j].return) continue;
      if (!rc.rec[j].item.slot) {
        let itemToAlter = scan2(inv, rc.rec[j].item, rc.rec[j].amount).b;
        itemToAlter.amount -= rc.rec[j].amount;
        if (itemToAlter.amount === 0) removeItem(itemToAlter);
      } else {
        let ar = findworst(inv, rc.rec[j].item);
        let finar = [];
        for (let m = 0; m < rc.rec[j].amount; m++) finar.push(ar[m]);
        for (let m in finar) removeItem(finar[m]);
      }
    }
    if (!!rc.cmake) { rc.cmake(); }
    else {
      for (let itm in rc.res) {
        if (!rc.res[itm].amount_max) giveItem(rc.res[itm].item, rc.res[itm].amount);
        else { giveItem(rc.res[itm].item, rand(rc.res[itm].amount, rc.res[itm].amount_max)); }
      }
      rc.onmake();
    }
  }
  isort(global.sm);
}
