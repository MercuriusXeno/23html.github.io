import { vendor, item, wpn, eqp, sld, acc, chss } from '../state';
import { random } from '../random';
import { restock } from '../game/economy';

// ==========================================================================
// Vendor constructor + instances
// ==========================================================================

function Vendor(cfg) {
  this.name = '';
  this.items = [];
  this.stock = [];
  this.data = { time: 1, rep: 0 };
  this.timeorig = 1;
  this.restocked = false;
  this.extra = function () { }
  this.onRestock = function () { this.restocked = true }
  this.onDayPass = function () { if (--this.data.time === 0) { restock(this); this.data.time = this.timeorig; this.onRestock(); this.extra() } }
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}

vendor.stvr1 = new Vendor({ name: 'Street Vendor', infl: 2, dfl: .3, items: [{ item: item.cbun1, p: 6, c: .8, min: 1, max: 4 }, { item: item.strwb, p: 8, c: .01, min: 1, max: 8 }, { item: item.cbun2, p: 7, c: .5, min: 1, max: 4 }, { item: item.brd, p: 5, c: 1, min: 4, max: 8 }] });

vendor.kid1 = new Vendor({ name: 'Child Trader', items: [{ item: item.pbl, p: 1, c: 1, min: 10, max: 50 }, { item: item.mcps, p: 2, c: .3, min: 6, max: 16 }, { item: item.spb, p: 3, c: .8, min: 2, max: 8 }, { item: item.bonig, p: 11, c: .2, min: 2, max: 5 }] });

vendor.grc1 = new Vendor({ name: 'Grocery Shop', infl: 1.15, dfl: .3, repsc: 8, items: [{ item: item.rice, p: 4, c: 1, min: 40, max: 50 }, { item: item.eggn, p: 7, c: 1, min: 8, max: 32 }, { item: item.onn, p: 8, c: 1, min: 5, max: 12 }, { item: item.salt, p: 25, c: .3, min: 2, max: 7 }, { item: item.grlc, p: 14, c: .15, min: 1, max: 8 }, { item: item.wht, p: 5, c: 1, min: 13, max: 29 }, { item: item.ltcc, p: 8, c: .6, min: 3, max: 6 }, { item: item.mlkn, p: 10, c: .4, min: 2, max: 4 }, { item: item.appl, p: 5, c: .8, min: 5, max: 20 }, { item: item.brd, p: 12, c: .85, min: 3, max: 10 }, { item: item.bgt, p: 17, c: .35, min: 1, max: 6 }, { item: item.rwmt1, p: 31, c: .25, min: 4, max: 8 }, { item: item.agrns, p: 8, c: .2, min: 10, max: 30 }, { item: item.watr, p: 2, c: .85, min: 20, max: 70 }] });
vendor.grc1.extra = function () {
  if (random() < .2) chss.grc1.data.gets[0] = false;
}

vendor.gens1 = new Vendor({ name: 'General Store', time: 3, timeorig: 3, infl: 1.2, dfl: .2, repsc: 4, items: [{ item: item.fwd1, p: 25, c: 1, min: 8, max: 20 }, { item: item.coal2, p: 80, c: .5, min: 2, max: 5 }, { item: item.amrthsck, p: 360, c: .2, min: 1, max: 1 }, { item: item.dmkbk, p: 390, c: .15, min: 1, max: 1 }, { item: item.wsb, p: 16, c: .7, min: 5, max: 11 }, { item: wpn.wsrd1, p: 35, c: .6, min: 1, max: 3 }, { item: eqp.rncp, p: 60, c: .3, min: 1, max: 3 }, { item: eqp.rnss, p: 70, c: .3, min: 1, max: 3 }, { item: eqp.tnc, p: 56, c: .3, min: 1, max: 3 }, { item: eqp.sndl, p: 32, c: .3, min: 1, max: 6 }, { item: wpn.bsrd, p: 100, c: .3, min: 1, max: 2 }, { item: wpn.sprw, p: 130, c: .3, min: 1, max: 3 }, { item: item.wine1, p: 116, c: .2, min: 1, max: 7 }, { item: item.rope, p: 100, c: .65, min: 1, max: 6 }, { item: item.msc1, p: 110, c: .25, min: 1, max: 4 }, { item: item.tbwr1, p: 130, c: .65, min: 1, max: 4 }, { item: item.bed2, p: 500, c: .45, min: 1, max: 1 }, { item: item.cndl, p: 200, c: .55, min: 1, max: 2 }, { item: item.cclth, p: 7, c: .85, min: 15, max: 50 }, { item: item.thrdnl, p: 2, c: .85, min: 3, max: 70 }, { item: acc.ndlb, p: 50, c: .73, min: 1, max: 15 }] });
vendor.gens1.extra = function () {
  if (random() < .2) chss.gens1.data.gets[0] = false;
}

vendor.pha1 = new Vendor({ name: 'Herbalist', time: 2, timeorig: 2, infl: 1.25, dfl: .2, repsc: 6, items: [{ item: item.sp1, p: 20, c: 1, min: 3, max: 15 }, { item: item.sp2, p: 230, c: .8, min: 2, max: 10 }, { item: item.sp3, p: 690, c: .7, min: 1, max: 5 }, { item: item.bdgh, p: 6, c: .9, min: 5, max: 15 }, { item: acc.vtmns, p: 150, c: .5, min: 1, max: 3 }, { item: acc.mpst, p: 100, c: .8, min: 1, max: 6 }, { item: acc.mshst, p: 480, c: .6, min: 1, max: 1 }, { item: acc.mhhst, p: 600, c: .4, min: 1, max: 1 }, { item: item.hptn1, p: 20, c: 1, min: 8, max: 35 }, { item: item.atd1, p: 40, c: .7, min: 4, max: 13 }, { item: item.psnwrd, p: 400, c: .25, min: 2, max: 5 }, { item: item.smm, p: 70, c: .75, min: 2, max: 8 }, { item: item.mdc1, p: 150, c: .75, min: 1, max: 1 }] });
vendor.pha1.extra = function () {
  if (random() < .2) chss.pha1.data.gets[0] = false;
}
