// @ts-nocheck
import { container, home, rcp, item, wpn, eqp, acc, sld, inv, you, skl, global } from '../state';
import { random } from '../random';
import { giveCrExp, giveSkExp } from '../game/progression';
import { giveItem } from '../game/inventory';
import { msg } from '../ui/messages';

// ==========================================================================
// Container + Recipe constructors + instances
// ==========================================================================

function Container(id) {
  this.id = id || 0;
  this.c = [];
}

container.home_strg = new Container(1);
if (!home.trunk) { home.trunk = container.home_strg }

///////////////////////////////////////////
//REC
///////////////////////////////////////////

function Recipe(cfg) {
  this.name = '';
  this.locked = true;
  this.allow = true;
  this.have = false;
  this.rec = [];
  this.res = [];
  this.srec = function () { };
  this.srece = false;
  this.srect = null;
  this.onmake = function () { };
  this.type = 0;
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}

rcp.test = new Recipe({ id: 101, name: 'Test', rec: [{ item: acc.dticket, amount: 1 }, { item: acc.dticket, amount: 1 }], res: [{ item: item.sbone, amount: 991 }] });

rcp.wp2 = new Recipe({
  id: 102, name: 'Sharpened Stick', type: 3, rec: [{ item: wpn.stk1, amount: 1 }], res: [{ item: wpn.stk2, amount: 1 }], srect: ['Any sharp tool'], srec: [function () {
    for (let hh in inv) if (inv[hh].ctype === 0 && inv[hh].cls[0] >= 2) return true;
  }]
});
rcp.wp2.onmake = function () { giveCrExp(skl.crft, .5, 1) }

rcp.strawp = new Recipe({ id: 103, name: 'Straw Pendant', type: 4, rec: [{ item: item.sstraw, amount: 5 }], res: [{ item: acc.strawp, amount: 1 }] });
rcp.strawp.onmake = function () { giveCrExp(skl.crft, .1, 1) }

rcp.hlpd = new Recipe({ id: 104, name: 'Low-grade Healing Powder', type: 2, rec: [{ item: item.hrb1, amount: 3 }], res: [{ item: item.hlpd, amount: 1 }] });
rcp.hlpd.onmake = function () { giveCrExp(skl.alch, .2, 1) }

rcp.borc = new Recipe({ id: 105, name: 'Boiled Rice', type: 1, rec: [{ item: item.rice, amount: 2 }, { item: item.watr, amount: 2 }], res: [{ item: item.borc, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.borc.onmake = function () { giveCrExp(skl.cook, .5, 1) }

rcp.begg = new Recipe({ id: 106, name: 'Boiled Egg', type: 1, rec: [{ item: item.eggn, amount: 1 }, { item: item.watr, amount: 2 }], res: [{ item: item.begg, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.begg.onmake = function () { giveCrExp(skl.cook, .2, 1) }

rcp.trr = new Recipe({ id: 107, name: 'Trinity', type: 4, rec: [{ item: acc.mstn, amount: 1 }, { item: acc.srng, amount: 1 }, { item: acc.bstn, amount: 1 }, { item: acc.mstn, amount: 1 }], res: [{ item: acc.trrng, amount: 1 }] });

rcp.rsmt = new Recipe({ id: 108, name: 'Roasted Meat', type: 1, rec: [{ item: item.rwmt1, amount: 1 }], res: [{ item: item.rsmt, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.rsmt.cmake = function () { let rn = random() + skl.cook.lvl * .1; if (rn >= .30) giveItem(rcp.rsmt.res[0].item); else { giveItem(item.brmt); msg('It didn\'t turn out very well...', 'black', null, null, 'lightgrey'); } giveCrExp(skl.cook, .2, 1); }

rcp.segg = new Recipe({ id: 109, name: 'Scrambled Eggs', type: 1, rec: [{ item: item.eggn, amount: 2 }], res: [{ item: item.segg, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.segg.onmake = function () { giveCrExp(skl.cook, 1, 2) }

rcp.lnch1 = new Recipe({ id: 110, name: 'Bacon and Eggs', type: 1, rec: [{ item: item.eggn, amount: 2 }, { item: item.bac, amount: 1 }], res: [{ item: item.lnch1, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.lnch1.onmake = function () { giveCrExp(skl.cook, 5, 3) }

rcp.lnch2 = new Recipe({ id: 111, name: 'Morning Set', type: 1, rec: [{ item: item.eggn, amount: 2 }, { item: item.brd, amount: 1 }], res: [{ item: item.lnch2, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.lnch2.onmake = function () { giveCrExp(skl.cook, 8, 3) }

rcp.lnch3 = new Recipe({ id: 112, name: 'Lunch Set', type: 1, rec: [{ item: item.eggn, amount: 2 }, { item: item.brd, amount: 1 }, { item: item.rwmt1, amount: 1 }], res: [{ item: item.lnch3, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.lnch3.onmake = function () { giveCrExp(skl.cook, 10, 4) }

rcp.orgs = new Recipe({ id: 113, name: 'Onion Rings', type: 1, rec: [{ item: item.flr, amount: 2 }, { item: item.onn, amount: 1 }], res: [{ item: item.orgs, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.orgs.onmake = function () { giveCrExp(skl.cook, 8, 4) }

rcp.ffsh1 = new Recipe({ id: 114, name: 'Cooked Fish', type: 1, rec: [{ item: item.fsh1, amount: 1 }], res: [{ item: item.ffsh1, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.ffsh1.onmake = function () { giveCrExp(skl.cook, 2, 2) }

rcp.ffsh2 = new Recipe({ id: 115, name: 'Batter Fried Fish', type: 1, rec: [{ item: item.fsh2, amount: 1 }, { item: item.flr, amount: 1 }, { item: item.eggn, amount: 1 }, { item: item.salt, amount: 1 }], res: [{ item: item.ffsh2, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.ffsh2.onmake = function () { giveCrExp(skl.cook, 12, 5) }

rcp.fnori = new Recipe({ id: 116, name: 'Fried Nori', type: 1, rec: [{ item: item.nori, amount: 1 }, { item: item.salt, amount: 1 }], res: [{ item: item.fnori, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.fnori.onmake = function () { giveCrExp(skl.cook, 4, 4) }

rcp.cbun1 = new Recipe({ id: 117, name: 'Steamed Bun', type: 1, rec: [{ item: item.watr, amount: 1 }, { item: item.salt, amount: 1 }, { item: item.dgh, amount: 1 }], res: [{ item: item.cbun1, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.cbun1.onmake = function () { giveCrExp(skl.cook, 5, 3) }

rcp.dgh = new Recipe({ id: 118, name: 'Dough', type: 1, rec: [{ item: item.watr, amount: 1 }, { item: item.flr, amount: 3 }], res: [{ item: item.dgh, amount: 1 }] });
rcp.dgh.onmake = function () { giveCrExp(skl.cook, .5, 2) }

rcp.flr = new Recipe({ id: 119, name: 'Flour', type: 1, rec: [{ item: item.wht, amount: 1 }], res: [{ item: item.flr, amount: 2 }] });
rcp.flr.onmake = function () { giveCrExp(skl.cook, .2, 2) }

rcp.wbdl = new Recipe({ id: 120, name: 'Small Wood Bundle', type: 5, rec: [{ item: item.wdc, amount: 25 }], res: [{ item: item.fwd1, amount: 1 }] });
rcp.wbdl.onmake = function () { giveCrExp(skl.crft, .5, 1) }

rcp.sshl = new Recipe({ id: 121, name: 'Star Shell', type: 4, rec: [{ item: acc.snch, amount: 1 }, { item: acc.mnch, amount: 1 }], res: [{ item: acc.sshl, amount: 1 }] });
rcp.sshl.onmake = function () { giveCrExp(skl.crft, 10) }

rcp.hptn1 = new Recipe({ id: 122, name: 'Lesser Healing Potion', type: 2, rec: [{ item: item.slm, amount: 1 }, { item: item.hlpd, amount: 2 }], res: [{ item: item.hptn1, amount: 1 }] });
rcp.hptn1.onmake = function () { giveCrExp(skl.alch, 1, 2) }

rcp.hpck = new Recipe({ id: 123, name: 'Hippo Cookie', type: 1, rec: [{ item: item.flr, amount: 1 }, { item: item.hzlnt, amount: 1 }, { item: item.sgr, amount: 1 }, { item: item.mlkn, amount: 1 }], res: [{ item: item.hpck, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.hpck.onmake = function () { giveCrExp(skl.cook, 7, 4) }

rcp.sdl1 = new Recipe({ id: 124, name: 'Straw Effigy', type: 4, rec: [{ item: item.sstraw, amount: 50 }], res: [{ item: acc.sdl1, amount: 1 }] });
rcp.sdl1.onmake = function () { giveCrExp(skl.crft, 3, 2) }

rcp.mnknk = new Recipe({ id: 125, name: 'Maneki-Neko', type: 4, rec: [{ item: acc.cfgn, amount: 1 }, { item: acc.lckcn, amount: 1 },], res: [{ item: acc.mnknk, amount: 1 }] });
rcp.mnknk.onmake = function () { giveCrExp(skl.crft, 25) }

rcp.wdl1 = new Recipe({
  id: 126, name: 'Wood Effigy', type: 4, rec: [{ item: item.wdc, amount: 40 }], res: [{ item: acc.wdl1, amount: 1 }], srect: ['Any sharp tool'], srec: [function () {
    for (let hh in inv) if (inv[hh].ctype === 0 && inv[hh].cls[0] >= 2) return true;
  }]
});
rcp.wdl1.onmake = function () { giveCrExp(skl.crft, 3, 2) }

rcp.gdl1 = new Recipe({ id: 127, name: 'Soul Puppet', type: 4, rec: [{ item: acc.wdl1, amount: 1 }, { item: acc.sdl1, amount: 1 }, { item: acc.bdl1, amount: 1 }, { item: item.lsrd, amount: 5 }], res: [{ item: acc.gdl1, amount: 1 }] });
rcp.gdl1.onmake = function () { giveCrExp(skl.crft, 5, 2) }

rcp.tbrwd = new Recipe({ id: 128, name: 'Tea', type: 1, rec: [{ item: item.tlvs, amount: 1 }, { item: item.watr, amount: 1 },], res: [{ item: item.tbrwd, amount: 1 }] });
rcp.tbrwd.onmake = function () { giveCrExp(skl.cook, 1) }

rcp.brd = new Recipe({ id: 129, name: 'Bread', type: 1, rec: [{ item: item.dgh, amount: 1 }], res: [{ item: item.brd, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.brd.cmake = function () { let rn = random() + skl.cook.lvl * .05; if (rn >= .25) giveItem(rcp.brd.res[0].item); else { giveItem(item.brdb); msg('It didn\'t turn out very well...', 'black', null, null, 'lightgrey'); } giveCrExp(skl.cook, 2, 3) }

rcp.steak = new Recipe({ id: 130, name: 'Steak', type: 1, rec: [{ item: item.salt, amount: 1 }, { item: item.rwmt1, amount: 1 }, { item: item.spc1, amount: 1 }], res: [{ item: item.steak, amount: 1 }], srect: ['Nearby firesource', 'Cooking lvl: 3'], srec: [function () { if (you.mods.ckfre > 0) return true }, function () { if (skl.cook.lvl === 3) return true }] });
rcp.steak.onmake = function () { giveCrExp(skl.cook, 7) }

rcp.cnmnb = new Recipe({ id: 131, name: 'Cinnamon Bun', type: 1, rec: [{ item: item.sgr, amount: 1 }, { item: item.bttr, amount: 1 }, { item: item.cnmn, amount: 1 }, { item: item.wht, amount: 1 }], res: [{ item: item.cnmnb, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.cnmnb.onmake = function () { giveCrExp(skl.cook, 6, 5) }

rcp.brth = new Recipe({ id: 132, name: 'Broth', type: 1, rec: [{ item: item.watr, amount: 2 }, { item: item.rwmt1, amount: 1 }], res: [{ item: item.brth, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.brth.onmake = function () { giveCrExp(skl.cook, .5, 2) }

rcp.eggsp = new Recipe({ id: 133, name: 'Egg Soup', type: 1, rec: [{ item: item.brth, amount: 1 }, { item: item.eggn, amount: 2 }, { item: item.salt, amount: 1 }, { item: item.scln, amount: 1 }], res: [{ item: item.eggsp, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.eggsp.onmake = function () { giveCrExp(skl.cook, 5, 4) }

rcp.crmchd = new Recipe({ id: 134, name: 'Creamy Chowder', type: 1, rec: [{ item: item.mlkn, amount: 1 }, { item: item.ches, amount: 1 }, { item: item.rwmt1, amount: 1 }, { item: item.potat, amount: 1 }], res: [{ item: item.crmchd, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.crmchd.onmake = function () { giveCrExp(skl.cook, 15) }

rcp.mink = new Recipe({ id: 135, name: 'Magic Ink', type: 4, rec: [{ item: acc.qill, amount: 1 }, { item: acc.bink, amount: 1 }], res: [{ item: acc.mink, amount: 1 }] });
rcp.mink.onmake = function () { giveCrExp(skl.crft, 2.5, 4) }

rcp.msoop = new Recipe({ id: 136, name: 'Mushroom Soup', type: 1, rec: [{ item: item.watr, amount: 2 }, { item: item.mshr, amount: 2 }, { item: item.potat, amount: 1 }, { item: item.onn, amount: 1 }], res: [{ item: item.msoop, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.msoop.onmake = function () { giveCrExp(skl.cook, 4, 3) }

rcp.jln4 = new Recipe({ id: 137, name: 'Grand Gelatin', type: 4, rec: [{ item: acc.jln1, amount: 1 }, { item: acc.jln2, amount: 1 }, { item: acc.jln3, amount: 1 },], res: [{ item: acc.jln4, amount: 1 }] });
rcp.jln4.onmake = function () { giveCrExp(skl.crft, 15) }

rcp.strwks = new Recipe({ id: 138, name: 'Straw Kasa', type: 4, rec: [{ item: item.sstraw, amount: 30 }], res: [{ item: eqp.strwks, amount: 1 }] });
rcp.strwks.onmake = function () { giveCrExp(skl.crft, 3, 2) }

rcp.bdl1 = new Recipe({
  id: 139, name: 'Bone Doll', type: 4, rec: [{ item: item.sbone, amount: 30 }], res: [{ item: acc.bdl1, amount: 1 }], srect: ['Any sharp tool'], srec: [function () {
    for (let hh in inv) if (inv[hh].ctype === 0 && inv[hh].cls[0] >= 2) return true;
  }]
});
rcp.bdl1.onmake = function () { giveCrExp(skl.crft, 3, 2) }

rcp.wvbkt = new Recipe({ id: 140, name: 'Straw Basket', type: 5, rec: [{ item: item.sstraw, amount: 40 }], res: [{ item: item.wvbkt, amount: 1 }] });
rcp.wvbkt.onmake = function () { giveCrExp(skl.crft, 3, 2) }

rcp.hlstw = new Recipe({ id: 141, name: 'Healing Stew', type: 1, rec: [{ item: item.watr, amount: 2 }, { item: item.hrb1, amount: 28 }], res: [{ item: item.hlstw, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.hlstw.onmake = function () { giveCrExp(skl.cook, 1, 2) }

rcp.bcrc = new Recipe({ id: 142, name: 'Bone Cracker', type: 1, rec: [{ item: item.sbone, amount: 25 }], res: [{ item: item.bcrc, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.bcrc.onmake = function () { giveCrExp(skl.cook, 1.7, 3) }

rcp.bcrrt = new Recipe({ id: 143, name: 'Boiled Carrot', type: 1, rec: [{ item: item.crrt, amount: 1 }, { item: item.watr, amount: 1 }], res: [{ item: item.bcrrt, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.bcrrt.onmake = function () { giveCrExp(skl.cook, .3, 2) }

rcp.jsdch = new Recipe({ id: 144, name: 'Jelly Sandwich', type: 1, rec: [{ item: item.jll, amount: 1 }, { item: item.brd, amount: 1 }, { item: item.ltcc, amount: 1 }], res: [{ item: item.jsdch, amount: 1 }] });
rcp.jsdch.onmake = function () { giveCrExp(skl.cook, .8, 2) }

rcp.dcard1 = new Recipe({ id: 145, name: 'Discount Card', type: 4, rec: [{ item: acc.dticket, amount: 5 }], res: [{ item: acc.dcard1, amount: 1 }] });
rcp.dcard1.onmake = function () { giveCrExp(skl.crft, 16) }

rcp.wsb = new Recipe({ id: 146, name: 'Wastebread', type: 1, rec: [{ item: item.agrns, amount: 3 }], res: [{ item: item.wsb, amount: 1 }] });
rcp.wsb.onmake = function () { giveCrExp(skl.cook, .5, 3) }

rcp.stksld = new Recipe({ id: 147, name: 'Stake Shield', type: 4, rec: [{ item: wpn.stk2, amount: 4 }], res: [{ item: sld.stksld, amount: 1 }] });
rcp.stksld.onmake = function () { giveCrExp(skl.crft, 2.5, 2) }

rcp.clrpin = new Recipe({ id: 148, name: 'Clover Pin', type: 4, rec: [{ item: item.lckl, amount: 7 }], res: [{ item: acc.clrpin, amount: 1 }] });
rcp.clrpin.onmake = function () { giveCrExp(skl.crft, 77) }

rcp.ptchct = new Recipe({
  id: 149, name: 'Patchwork Coat', type: 4, rec: [{ item: item.cclth, amount: 11 }, { item: item.thrdnl, amount: 4 }], res: [{ item: eqp.ptchct, amount: 1 }], srect: ['Tailoring tool lvl: 1'], srec: [function () {
    for (let hh in inv) if (inv[hh].tlrq >= 1) return true;
  }]
});
rcp.ptchct.onmake = function () { giveCrExp(skl.crft, 3, 2); giveCrExp(skl.tlrng, 2, 1) }

rcp.ptchpts = new Recipe({
  id: 150, name: 'Patchwork Pants', type: 4, rec: [{ item: item.cclth, amount: 9 }, { item: item.thrdnl, amount: 3 }], res: [{ item: eqp.ptchpts, amount: 1 }], srect: ['Tailoring tool lvl: 1'], srec: [function () {
    for (let hh in inv) if (inv[hh].tlrq >= 1) return true;
  }]
});
rcp.ptchpts.onmake = function () { giveCrExp(skl.crft, 2, 2); giveCrExp(skl.tlrng, 3, 1) }

rcp.bblkt = new Recipe({
  id: 151, name: 'Ragwork Blanket', type: 5, rec: [{ item: item.cclth, amount: 40 }, { item: item.thrdnl, amount: 18 }], res: [{ item: item.bblkt, amount: 1 }], srect: ['Tailoring tool lvl: 1'], srec: [function () {
    for (let hh in inv) if (inv[hh].tlrq >= 1) return true;
  }]
});
rcp.bblkt.onmake = function () { giveCrExp(skl.crft, 4, 2); giveCrExp(skl.tlrng, 7, 1) }

rcp.spillw = new Recipe({ id: 152, name: 'Straw Pillow', type: 5, rec: [{ item: item.cclth, amount: 15 }, { item: item.thrdnl, amount: 8 }, { item: item.sstraw, amount: 80 }], res: [{ item: item.spillw, amount: 1 }] });
rcp.spillw.onmake = function () { giveCrExp(skl.crft, 3, 2); giveCrExp(skl.tlrng, 4, 1) }

rcp.alseto = new Recipe({ id: 153, name: 'Basic Alchemy Set', type: 4, rec: [{ item: acc.mpst, amount: 1 }, { item: acc.mshst, amount: 1 }, { item: acc.mhhst, amount: 1 }], res: [{ item: acc.alseto, amount: 1 }] });
rcp.alseto.onmake = function () { giveCrExp(skl.crft, 15, 2); }

rcp.mdcag = new Recipe({ id: 154, name: 'Adhesive Bandage', type: 4, rec: [{ item: item.bdgh, amount: 1 }, { item: item.watr, amount: 5 }, { item: item.hrb1, amount: 50 }, { item: item.slm, amount: 10 }], res: [{ item: acc.mdcag, amount: 1 }] });
rcp.mdcag.onmake = function () { giveCrExp(skl.alch, 2, 2) }

rcp.mdcbg = new Recipe({ id: 155, name: 'Medicated Bandage', type: 4, rec: [{ item: acc.mdcag, amount: 1 }, { item: acc.vtmns, amount: 1 }, { item: item.hptn1, amount: 8 }], res: [{ item: acc.mdcbg, amount: 1 }] });
rcp.mdcbg.onmake = function () { giveCrExp(skl.alch, 3, 2) }

rcp.cyrn = new Recipe({ id: 156, name: 'Yarn Ball', type: 5, rec: [{ item: item.thrdnl, amount: 200 }], res: [{ item: item.cyrn, amount: 1 }] });
rcp.cyrn.onmake = function () { giveCrExp(skl.crft, 4, 2) }

rcp.fwdpile = new Recipe({ id: 157, name: 'Firewood Pile', type: 5, rec: [{ item: item.fwd1, amount: 60 }], res: [{ item: item.fwdpile, amount: 1 }] });
rcp.fwdpile.onmake = function () { giveCrExp(skl.crft, 5, 2) }

rcp.fmlim2 = new Recipe({ id: 158, name: 'Family Heirloom+', type: 4, rec: [{ item: acc.strawp, amount: 1 }, { item: acc.fmlim, amount: 1 }], res: [{ item: acc.fmlim2, amount: 1 }] });
rcp.fmlim2.onmake = function () { giveCrExp(skl.crft, 5, 2) }

rcp.appljc = new Recipe({ id: 159, name: 'Apple Juice', type: 1, rec: [{ item: item.appl, amount: 3 }], res: [{ item: item.appljc, amount: 1 }, { item: item.frtplp, amount: 1 }] });
rcp.appljc.onmake = function () { giveCrExp(skl.cook, .5, 2) }

rcp.bdgh = new Recipe({ id: 160, name: 'Bandage', type: 2, rec: [{ item: item.cclth, amount: 1 }, { item: item.watr, amount: 3 }], res: [{ item: item.bdgh, amount: 1 }], srect: ['Nearby firesource'], srec: [function () { if (you.mods.ckfre > 0) return true }] });
rcp.bdgh.onmake = function () { giveCrExp(skl.crft, .5, 2) }

rcp.wfng = new Recipe({ id: 161, name: 'Wolf Fang Necklace', type: 4, rec: [{ item: item.wfng, amount: 5 }, { item: item.thrdnl, amount: 1 }], res: [{ item: acc.wfng, amount: 1 }] });
rcp.wfng.onmake = function () { giveCrExp(skl.crft, 5, 3) }

rcp.wfar = new Recipe({ id: 162, name: 'Wolf Array', type: 4, rec: [{ item: acc.wfng, amount: 3 }], res: [{ item: acc.wfar, amount: 1 }] });
rcp.wfar.onmake = function () { giveCrExp(skl.crft, 10, 3) }
