import { area, sector, creature, item, wpn, acc, ttl, global, dom, you, time, furn, furniture, effect, effector, skl, chss, itemgroup, act } from '../state';
import { findbyid, select, z_bake } from '../utils';
import { random, rand } from '../random';
import { smove, inSector } from '../game/movement';
import { scoutGeneric } from '../game/exploration';
import { giveItem } from '../game/inventory';
import { giveTitle, giveSkExp, giveExp } from '../game/progression';
import { roll } from '../game/utils-game';
import { msg } from '../ui/messages';
import { activatef, deactivatef } from '../ui/choices';
import { giveEff, removeEff } from '../ui/effects';
import { getSeason, isWeather, weather, getHour } from '../systems/weather';
// Explicit deps: world.ts references creature/item/wpn/acc/eqp instances at eval time
import './items';
import './equipment';
import './abilities';
import './creatures';

// ==========================================================================
// Area + Sector constructors + instances
// ==========================================================================

export function Area(this: any, cfg?: any) {
  this.name = 'Nowhere';
  this.id = 0;
  this.pop = [];
  this.size = 10
  this.drop = [];
  this.onEnd = function () { };
  this.onDeath = function () { };
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}
area._ctor = Area;

// @ts-ignore: constructor function
area.nwh = new Area({ id: 101, name: 'Somewhere', pop: [{ crt: creature.default, lvlmin: 1, lvlmax: 1, c: 1 }], size: 1 });
z_bake(area.nwh);
global.current_z = area.nwh;

// @ts-ignore: constructor function
area.trn = new Area({ id: 102, name: 'Training Grounds', pop: [{ crt: creature.sdummy, lvlmin: 1, lvlmax: 9, c: .3 }, { crt: creature.tdummy, lvlmin: 4, lvlmax: 8, c: .3 }, { crt: creature.wdummy, lvlmin: 3, lvlmax: 5, c: .3 }], size: 10000 });
z_bake(area.trn);
area.trn.onEnd = function (this: any) { this.size = -1; giveTitle(ttl.thr); global.flags.trnex1 = true; smove(chss.t3, false) };
area.trn.drop = [{ item: item.appl, c: .02 }, { item: acc.gpin, c: .00012, cond: () => { return ttl.tqtm.tget } }]

// @ts-ignore: constructor function
area.trnf = new Area({});
area.trn.id = 107;
area.trnf.name = 'Training Grounds';
area.trnf.pop = [{ crt: creature.sdummy, lvlmin: 1, lvlmax: 12, c: .3 }, { crt: creature.tdummy, lvlmin: 7, lvlmax: 13, c: .3 }, { crt: creature.wdummy, lvlmin: 8, lvlmax: 10, c: .3 }];
area.trnf.size = -1;
z_bake(area.trnf);
area.trnf.protected = true
area.trnf.drop = [{ item: acc.gpin, c: .00012, cond: () => { return ttl.tqtm.tget } }]

// @ts-ignore: constructor function
area.trn1 = new Area({ id: 103, name: 'Training Grounds', pop: [{ crt: creature.sdummy, lvlmin: 1, lvlmax: 1, c: .5 }, { crt: creature.tdummy, lvlmin: 1, lvlmax: 1, c: .5 }], size: 10 });
z_bake(area.trn1);
area.trn1.onEnd = function () { smove(chss.t2, false); global.flags.tr1_win = true; };
area.trn1.onDeath = function () { if (!global.flags.dj1end) global.flags.nbtfail = true; }
area.trn1.drop = [{ item: item.appl, c: .28 }]

// @ts-ignore: constructor function
area.trn2 = new Area({ id: 104, name: 'Training Grounds', pop: [{ crt: creature.sdummy, lvlmin: 1, lvlmax: 3, c: .4 }, { crt: creature.tdummy, lvlmin: 1, lvlmax: 3, c: .6 }], size: 20 });
z_bake(area.trn2);
area.trn2.onEnd = function () { smove(chss.t2, false); global.flags.tr2_win = true; };
area.trn2.onDeath = function () { if (!global.flags.dj1end) global.flags.nbtfail = true; }
area.trn2.drop = [{ item: item.appl, c: .28 }]

// @ts-ignore: constructor function
area.trn3 = new Area({ id: 105, name: 'Training Grounds', pop: [{ crt: creature.sdummy, lvlmin: 3, lvlmax: 5, c: .35 }, { crt: creature.tdummy, lvlmin: 2, lvlmax: 3, c: .45 }, { crt: creature.wdummy, lvlmin: 1, lvlmax: 1, c: .25 }], size: 50 });
z_bake(area.trn3);
area.trn3.onEnd = function () { smove(chss.t2, false); global.flags.tr3_win = true; };
area.trn3.onDeath = function () { if (!global.flags.dj1end) global.flags.nbtfail = true; }
area.trn3.drop = [{ item: item.appl, c: .28 }]

// @ts-ignore: constructor function
area.clg = new Area({ id: 106, name: 'Damp cellar', pop: [{ crt: creature.bat, lvlmin: 1, lvlmax: 4 }, { crt: creature.spd1, lvlmin: 2, lvlmax: 4 }], size: 33 });
z_bake(area.clg);
area.clg.onEnd = function () { if (!global.flags.q1lwn) { global.flags.q1lwn = true; smove(chss.q1lwn, false); } else smove(chss.q1l, false) };

// @ts-ignore: constructor function
area.tst = new Area({ id: 108, name: 'Test', pop: [{ crt: creature.skl, lvlmin: 1, lvlmax: 1, c: 1 }], size: -1 });
z_bake(area.tst);
area.tst.onEnd = function () { };

// @ts-ignore: constructor function
area.frstn1a2 = new Area({ id: 109, name: 'Western forest hunting area', pop: [{ crt: creature.rbt1, lvlmin: 1, lvlmax: 5, c: .20 }, { crt: creature.slm1, lvlmin: 1, lvlmax: 6, c: .40 }, { crt: creature.slm2, lvlmin: 1, lvlmax: 6, c: .40 }], size: 60 });
z_bake(area.frstn1a2);
area.frstn1a2.onEnd = function (this: any) {
  roll(item.acrn, .2, 1, 3);
  roll(item.wbrs, .2, 1, 3);
  roll(item.cp, .5, 1, 5);
  roll(wpn.knf2, .06);
  roll(wpn.ktn1, .04);
  roll(item.hrb1, .6, 1, 4);
  roll(wpn.stk1, .3);
  roll(item.sbone, .1, 1, 3);
  giveItem(item.wbrs, rand(1, 2));
  roll(item.wdc, 1, 7, 22);
  roll(item.spb, .7);
  roll(item.pcn, .1, 1, 2);
  this.size = rand(40) + 30;
  smove(chss.frstn1a2);
}; area.frstn1a2.drop = [{ item: item.hrb1, c: .02 }, { item: item.wdc, c: .05 }]

// @ts-ignore: constructor function
area.hmbsmnt = new Area({ id: 110, name: 'Your basement', pop: [{ crt: creature.bat, lvlmin: 10, lvlmax: 17, c: .50 }, { crt: creature.spd1, lvlmin: 10, lvlmax: 17, c: .50 }], size: 10 });
z_bake(area.hmbsmnt);
area.hmbsmnt.onEnd = function () {
  smove(chss.bsmnthm1, false);
}
area.hmbsmnt.drop = [{ item: item.cp, c: .05 }, { item: item.lcn, c: .003 }, { item: item.cn, c: .02 }, { item: item.cd, c: .01 }, { item: item.wdc, c: .08 }, { item: acc.wpeny, c: .001 }]

// @ts-ignore: constructor function
area.trne1 = new Area({ id: 111, name: 'Training Grounds', pop: [{ crt: creature.golem1, lvlmin: 20, lvlmax: 20, c: 1 }], size: 1 });
z_bake(area.trne1);
area.trne1.protected = true
area.trne1.onEnd = function (this: any) { this.size = 1; if (!global.flags.trne1e1) smove(chss.trne1e1, false); else smove(chss.t3, false) };

// @ts-ignore: constructor function
area.frstn2a2 = new Area({ id: 112, name: 'Western forest hunting area', pop: [{ crt: creature.rbt1, lvlmin: 1, lvlmax: 7, c: .25 }, { crt: creature.slm1, lvlmin: 1, lvlmax: 8, c: .20 }, { crt: creature.slm2, lvlmin: 1, lvlmax: 8, c: .20 }, { crt: creature.slm3, lvlmin: 1, lvlmax: 5, c: .25 }], size: 50 });
z_bake(area.frstn2a2);
area.frstn2a2.onEnd = function (this: any) {
  roll(item.acrn, .2, 1, 3);
  roll(item.cp, .2, 1, 8);
  roll(wpn.knf2, .03);
  roll(wpn.ktn1, .04);
  roll(item.hrb1, .4, 2, 5);
  roll(wpn.stk1, .4);
  roll(item.sbone, .2, 1, 3);
  giveItem(item.wbrs, rand(1, 3));
  roll(item.wdc, 1, 5, 17);
  roll(item.spb, .6);
  roll(item.pcn, .3, 1, 3);
  if (!global.flags.wp2sgt) roll(item.wp2s, .2);
  this.size = rand(50) + 40;
  if (!global.flags.frstn1a3u) { msg('You have discovered a new hunting area', 'lime'); global.flags.frstn1a3u = true; smove(chss.frstn1main) } else smove(chss.frstn1a2);
}; area.frstn2a2.drop = [{ item: item.hrb1, c: .03 }, { item: item.wdc, c: .06 }]

// @ts-ignore: constructor function
area.trne2 = new Area({ id: 113, name: 'Training Grounds', pop: [{ crt: creature.golem2, lvlmin: 23, lvlmax: 23, c: 1 }], size: 1 });
z_bake(area.trne2);
area.trne2.protected = true
area.trne2.onEnd = function (this: any) { this.size = 1; if (!global.flags.trne2e1) smove(chss.trne2e1, false); else smove(chss.t3, false) };

// @ts-ignore: constructor function
area.trne3 = new Area({ id: 114, name: 'Training Grounds', pop: [{ crt: creature.golem3, lvlmin: 25, lvlmax: 25, c: 1 }], size: 1 });
z_bake(area.trne3);
area.trne3.protected = true
area.trne3.onEnd = function (this: any) { this.size = 1; if (!global.flags.trne3e1) smove(chss.trne3e1, false); else smove(chss.t3, false) };

// @ts-ignore: constructor function
area.frstn1a3 = new Area({ id: 115, name: 'Western forest hunting area', pop: [{ crt: creature.rbt1, lvlmin: 3, lvlmax: 8, c: .35 }, { crt: creature.slm1, lvlmin: 3, lvlmax: 9, c: .15 }, { crt: creature.slm2, lvlmin: 3, lvlmax: 9, c: .15 }, { crt: creature.slm3, lvlmin: 2, lvlmax: 5, c: .2 }], size: -1 });
z_bake(area.frstn1a3);
area.frstn1a3.protected = true
area.frstn1a3.drop = [{ item: item.hrb1, c: .009 }, { item: item.wdc, c: .025 }, { item: item.acrn, c: .001 }, { item: item.mshr, c: .002 }, { item: item.cp, c: .002 }, { item: wpn.knf2, c: .00009 }, { item: wpn.ktn1, c: .00006 }, { item: wpn.stk1, c: .0007 }, { item: item.sbone, c: .0009 }, { item: item.wbrs, c: .003 }, { item: item.spb, c: .0004 }, { item: item.pcn, c: .001 }, { item: item.fwd1, c: .0009 }]

// @ts-ignore: constructor function
area.frstn1a4 = new Area({ id: 116, name: 'Western forest hidden area', pop: [{ crt: creature.slm4, lvlmin: 9, lvlmax: 11, c: 1 }], size: 25 });
z_bake(area.frstn1a4);
area.frstn1a4.protected = true
area.frstn1a4.drop = [{ item: item.cp, c: .006 }, { item: wpn.stk1, c: .0009 }, { item: item.sbone, c: .0005 }]
area.frstn1a4.onEnd = function () {
  chss.frstn1a4.sl()
};

// @ts-ignore: constructor function
area.trne4 = new Area({ id: 117, name: 'Training Grounds', pop: [{ crt: creature.golem4, lvlmin: 28, lvlmax: 28, c: 1 }], size: 1 });
z_bake(area.trne4);
area.trne4.protected = true
area.trne4.onEnd = function (this: any) { this.size = 1; if (!global.flags.trne4e1) smove(chss.trne4e1, false); else smove(chss.t3, false); giveTitle(ttl.aptc) };

// @ts-ignore: constructor function
area.frstn9a1 = new Area({ id: 118, name: 'Southern forest hunting area', pop: [{ crt: creature.wolf1, lvlmin: 7, lvlmax: 8, c: .25 }, { crt: creature.slm5, lvlmin: 10, lvlmax: 11, c: .75 }], size: 48 });
z_bake(area.frstn9a1);
area.frstn9a1.onEnd = function (this: any) {
  roll(item.acrn, .2, 1, 5);
  roll(item.mshr, .35, 1, 3);
  roll(wpn.stk1, .15);
  roll(item.sbone, .3, 1, 3);
  roll(item.wdc, 1, 5, 17);
  roll(item.appl, .25, 2, 5);
  roll(item.pcn, .5, 1, 3);
  this.size = rand(20) + 40;
  smove(chss.frstn3main)
}; area.frstn9a1.drop = [{ item: item.hrb1, c: .03 }, { item: item.wdc, c: .06 }]




///////////////////////////////////////////
//ZNE SECTOR
///////////////////////////////////////////
function Sector(this: any, cfg?: any) {
  this.id = 0
  this.group = [0];
  this.data = {};
  this.active = false;
  this.onEnter = function () { }
  this.onLeave = function () { }
  this.onStay = function () { }
  this.onMove = function () { }
  this.onScout = function () { }
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}



// @ts-ignore: constructor function
sector.home = new Sector({
  id: 1, inside: true, ddata: {}, data: { scoutm: 100, scout: 0, scoutf: false, gets: [false], gotmod: 0, smkp: 0, ctlt: [] }, scout: [
    { c: .1, cond: () => { if (sector.home.data.ctlt.length != 0) return true }, f: () => { let i = select(sector.home.data.ctlt); msg(select(['Your cat found something for you', 'Another one of your cat\'s gifts', 'Something was lying in the corner of the room. Probably cat\'s', 'Your cat dropped something before you']), 'lime'); let k = itemgroup[(i + 1) / 10000 << 0]; for (let v in k) if (k[v].id === i) giveItem(k[v]); sector.home.data.ctlt.splice(sector.home.data.ctlt.indexOf(i), 1); }, exp: 2 },
  ]
});
sector.home.onEnter = function (this: any) {
  let fire = findbyid(furn, furniture.frplc.id);
  for (let f in furn) activatef(furn[f])
  if (this.data.smkp > 0) {
    dom.d_lctt.innerHTML += '<span style="color:grey;font-size:1.2em">&nbsp煙<span>'
    let re = time.minute - this.data.smkt;
    this.data.smkp -= re;
  }
}
sector.home.onScout = function (this: any) { scoutGeneric(this) }
sector.home.onMove = function (this: any) {
  if (this.data.smkp > 0) {
    dom.d_lctt.innerHTML += '<span style="color:grey;font-size:1.2em">&nbsp煙<span>'
  }
}
sector.home.onLeave = function (this: any) {
  global.stat.athmec = 0;
  if (effect.fplc.active === true) removeEff(effect.fplc);
  this.data.smkt = time.minute;
  for (let f in furn) deactivatef(furn[f])
}
sector.home.onStay = function (this: any) {
  if (this.data.smkp > 0) {
    if (effect.smoke.active) effect.smoke.duration = 26;
    else giveEff(you, effect.smoke, 26)
    if (--this.data.smkp <= 0) smove(global.current_l)
  }
  if (global.flags.catget) giveSkExp(skl.pet, you.mods.petxp);
  global.stat.athme += global.timescale;
  global.stat.athmec += global.timescale;
  for (let x in global.nethmchk) global.nethmchk[x]();
  let fire = findbyid(furn, furniture.frplc.id);

  if (effect.fplc.active === false && fire.data.fuel > 0) giveEff(you, effect.fplc, fire.data.fuel)
  if (fire.data.fuel > 0) {
    if (effect.fplc.active === false) giveEff(you, effect.fplc, 2)
    let afire = findbyid(furn, furniture.fwdpile.id);
    if (afire && fire.data.fuel <= 2 && afire.data.fuel > 0) { fire.data.fuel += 30; afire.data.fuel-- }
  }
}

// @ts-ignore: constructor function
sector.vcent = new Sector({ id: 2 });
sector.vcent.onStay = function () {
  if (random() < .03 && !isWeather(weather.sstorm) && !isWeather(weather.heavyrain) && !isWeather(weather.thunder) && (getHour() > 8 && getHour() < 20)) {
    ; if (!global.text.vlg1) global.text.vlg1 = ['\"♪La, laaaah, la, la-la. Lah, la-la,la la....♪\"', '\"Eat flowers evil-doer!♪\"', '\"Oh my! Such pretty flowers♪\"', '\"Can I tag along? I won\'t be a bother♪\"'];
    if (!global.text.vlg1s) global.text.vlg1s = ['\"Let\'s build a snowman!♪\"', '\"Yey, snow!♪\"', '\"Everything is so white and beautiful♪\"', 'A snowball lands on you. Hey!'];
    msg(getSeason() === 4 ? select(global.text.vlg1s) : select(global.text.vlg1), 'yellow');
  }
}

// @ts-ignore: constructor function
sector.forest1 = new Sector({ id: 3, data: { scoutm: 7000, scout: 0, scoutf: false } });
sector.forest1.onStay = function (this: any) {
  if (!this.data.scoutf) {
    if (this.data.scout <= this.data.scoutm) { if (global.flags.btl || act.scout.active === true) { this.data.scout += .1; giveSkExp(skl.tpgrf, .001) } } else {
      msg('Area Explored!', 'lime');
      this.data.scoutf = true;
      giveExp(7000, true, true, true);
    }
  }
}

// @ts-ignore: constructor function
sector.cata1 = new Sector({ id: 4, inside: true, effectors: [{ e: effector.dark }], data: { scoutm: 11000, scout: 0, scoutf: false } });

// @ts-ignore: constructor function
sector.vmain1 = new Sector({ id: 5 });
/*
sector.vmain1.data={scoutm:400,scout:0,scoutf:false,gets:[false],gotmod:0}
sector.vmain1.scout=[
  {c:.11,f:()=>{msg(select(['You notice a coin on the ground!','You pick a coin from under the counter','You snatch a coin while no one is looking']),'lime');giveItem(select([item.cp,item.cn,item.cq,item.cd]));sector.vmain1.data.gets[0]=true},exp:5},
  {c:.05,f:()=>{msg(select(['You notice a coin on the ground!','You pick a coin from under the counter','You snatch a coin while no one is looking']),'lime');giveItem(select([item.cp,item.cn,item.cq,item.cd]));sector.vmain1.data.gets[1]=true},exp:5},
]
sector.vmain1.onScout=function(){scoutGeneric(this)}*/
