import { creature, eqp, global, you, dom, callback, checksd, item, wpn, acc, abl, effect, skl } from '../state';
import { random, rand } from '../random';
import { giveSkExp } from '../game/progression';
import { area_init } from '../game/movement';
import { wpndiestt, attack } from '../game/combat';
import { dropC } from '../game/inventory';
import { giveWealth } from '../game/economy';
import { giveExp } from '../game/progression';
import { kill } from '../game/utils-game';
import { update_m } from '../ui/stats';
import { msg } from '../ui/messages';

// ==========================================================================
// Creature constructor + instances
// ==========================================================================
function Creature(this: any, cfg?: any) {
  this.name = 'Nothing';
  this.desc = 'Empty space';
  this.type = 3;
  //h,b,u,e,p,d
  this.id = 0;
  this.lvl = 1;
  this.exp = 1;
  this.stat_p = [1, 1, 1, 1];
  //hp, str, agl, int
  this.eqp = [eqp.dummy, eqp.dummy];
  this.cls = [0, 0, 0];
  this.aff = [0, 0, 0, 0, 0, 0, 0];
  //phy air eth fir wtr lgt drk
  this.res = { poison: 1, burn: 1, frost: 1, paralize: 1, blind: 1, sleep: 1, curse: 1, death: 1, bleed: 1, ph: 1, venom: 1, fpoison: 1 };
  this.atype = 0;
  this.ctype = 0;
  this.atkmode = 1;
  this.hp = this.hp_r = this.hpmax = 17;
  this.str = this.str_r = this.agl = this.agl_r = this.int = this.int_r = this.spd = this.spd_r = 1;
  this.stra = this.agla = this.inta = this.spda = this.hpa = 0;
  this.strm = this.intm = this.spdm = this.aglm = this.hpm = 1
  this.crt = .008;
  this.dmlt = 1;
  this.rnk = 0;
  this.pts = 1;
  this.eva = 0;
  this.data = { lstdmg: 0, oneshot: true };
  this.stat_r = function (this: any) {
    this.stre = this.inte = this.agle = this.spde = this.sate = this.hpe = 1;
    for (let idx in this.eff) this.eff[idx].mods();
    this.str = (this.str_r + this.stra) * this.strm * this.stre;
    this.str_d = this.str
    this.int = (this.int_r + this.inta) * this.intm * this.inte;
    this.int_d = this.int
    this.agl = (this.agl_r + this.agla) * this.aglm * this.agle;
    this.agl_d = this.agl
    this.spd = (this.spd_r + this.spda) * this.spdm * this.spde;
    this.spd_d = this.spd
    this.hpmax = Math.ceil((this.hp_r + this.hpa) * this.hpm * this.hpe);
    this.dmlt = 1;
    for (let idx in this.eff) {
      if (this.eff[idx].type === 2) { this.eff[idx].un(); this.eff[idx].use(this.eff[idx].y, this.eff[idx].z) };
    } update_m(); if (this.hp > this.hpmax) this.hp = this.hpmax
  }
  this.alive = true;
  this.eff = [];
  this.drop = [];
  this.onDeath = function (this: any, killer: any) {
    callback.onDeath.fire(this, killer)
    this.hp = 0;
    this.alive = false;
    let tt = 0;
    for (let obj in global.bestiary) {
      if (global.bestiary[obj].id === this.id) { global.bestiary[obj].kills++; break }
      if (++tt === global.bestiary.length) global.bestiary.push({ id: this.id, kills: 1 });
    }
    global.stat.akills++;
    global.stat.pts += this.pts;
    if (you.eqp[0].id !== 10000) you.eqp[0].data.kills ? you.eqp[0].data.kills++ : (you.eqp[0].data.kills = 1);
    if (this.type !== 2 && this.type !== 4) global.spirits++;
    else if (this.type === 4) global.spirits--;
    if (global.flags.m_blh === false) msg(this.name + ' died ', 'burlywood');
    global.flags.civil = true;
    global.flags.btl = false;
    let df = 1;
    let ld = this.lvl - you.lvl;
    if (ld < 0) df = Math.sqrt(Math.abs(ld)) + Math.abs(ld) * .1 * Math.abs(ld);
    giveExp(this.exp + (this.exp * this.lvl / 10 << 0) / df);
    dropC(this);
    global.s_l = 0;
    if (you.mods.enmondren > 0) if (random() < you.mods.enmondren) { let aam = 1 + rand(this.lvl << 0, (this.lvl / 4) << 0) ** (1 + (this.rnk / 5) << 0) * you.mods.enmondrts; giveWealth(rand(aam * .5 << 0 || 1, aam * 1.5 << 0 || 1)); }
    if (--global.current_z.size > 0) area_init(global.current_z);
    else { if (global.current_z.size <= -1) area_init(global.current_z); else { msg('Area cleared', 'orange'); global.current_z.onEnd(); global.flags.civil = true; global.flags.btl = false; } };
    if (global.flags.to_pause === true) global.flags.btl = false;
    wpndiestt(killer, this);
    if (this.blood) global.stat.bloodt += this.blood;
    for (let a in checksd) checksd[a].f(this, checksd[a].o);
    for (let x in global.achchk[1]) global.achchk[1][x](killer);
    dom.d5_1_1m.update();
    dom.d7m.update();
    kill(this)
  };
  this.onDeathE = function (this: any) {
    giveSkExp(skl.war, (this.rnk * 2 - 1) * (1 + this.lvl * .05) * .1);
  }
  this.battle_ai = function (this: any, x: any, y: any, z: any) {
  /*me = this.data;
if(!me.lasthp) me.lasthp=this.hp;
me.cdmg = me.lasthp-this.hp;
me.avgdmg = (me.cdmg+me.lstdmg)/2;
me.lasthp=this.hp;
me.lstdmg=me.cdmg;
if(this.hp-me.avgdmg<=0) {msg('too scary, running away'); global.flags.btlinterrupt=true;}
*/return attack(x, y)
  }
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}
// @ts-ignore: constructor function
creature.default = new Creature(); global.current_m = creature.default;

// @ts-ignore: constructor function
creature.bat = new Creature({ name: 'Bat', id: 101, desc: 'Aggressive little bats living in the dark', type: 1, exp: 8, hp_r: 39, blood: .0852, stat_p: [.5, 1, 1.5, .5], aff: [-5, 25, -5, -5, 10, -5, 5], cls: [-4, -7, -3], atype: 1, ctype: 1, str_r: 2, agl_r: 10, spd_r: 2, drop: [{ item: item.sbone, chance: .1 }, { item: item.appl, chance: .06 }], rnk: 3, pts: 6 });

// @ts-ignore: constructor function
creature.cbat = new Creature({ id: 109, name: 'Cave bat', desc: 'Large, agile bats that swooop down to strike from the air', drop: [] });

// @ts-ignore: constructor function
creature.stirge = new Creature({ id: 110, name: 'Stirge', desc: 'Giant vampire bats rumored to drain a victim\'s life in a single blow', drop: [] });

// @ts-ignore: constructor function
creature.spd1 = new Creature({ name: 'Attic spider', id: 104, desc: 'Small docile spiders who live in damp and dark places', type: 1, exp: 8, hp_r: 26, stat_p: [.6, 1.1, 1.6, 1], aff: [2, 5, 10, -35, 10, -5, 15], cls: [4, 6, -6], str_r: 3, agl_r: 8, spd_r: 2, rnk: 3, pts: 5, drop: [{ item: item.ltcc, chance: .01 }, { item: item.thrdnl, chance: .1 }] });
creature.spd1.battle_ai = function (this: any, x: any, y: any, z: any) {
  if (random() <= .3) return attack(x, y, abl.pbite, 3);
  return attack(x, y)
}

// @ts-ignore: constructor function
creature.tdummy = new Creature({ id: 103, name: 'Training dummy', desc: 'He\'s made of fabric', drop: [{ item: wpn.knf1, chance: .01, cond: () => { return you.lvl <= 20 } }, { item: eqp.brc, chance: .03, cond: () => { return you.lvl <= 20 } }, { item: item.hrb1, chance: .02 }], aff: [0, 0, 15, -25, -5, -666, 666], stat_p: [.1, .5, .4, .2], ctype: 2, int_r: 0, rnk: 1 });
creature.tdummy.battle_ai = function (this: any, x: any, y: any, z: any) {
  if (random() <= .001) return attack(x, y, abl.rstab);
  return attack(x, y)
}
creature.tdummy.onDeathE = function (this: any) { };

// @ts-ignore: constructor function
creature.sdummy = new Creature({ id: 102, name: 'Straw dummy', desc: 'He\'s made of straw', drop: [{ item: item.sstraw, chance: .085 }, { item: item.hrb1, chance: .02 }], aff: [0, 0, 15, -25, -5, -666, 666], stat_p: [.25, .6, .3, .2], ctype: 2, int_r: 0, rnk: 1 });
creature.sdummy.battle_ai = function (this: any, x: any, y: any, z: any) {
  if (random() <= .001) return attack(x, y, abl.rstab);
  return attack(x, y)
}
creature.sdummy.onDeathE = function (this: any) { };

// @ts-ignore: constructor function
creature.wdummy = new Creature({ id: 112, name: 'Wooden dummy', desc: 'He\'s made of wood', stat_p: [.4, .8, .12, .2], aff: [0, 0, 15, -30, 20, -666, 666], cls: [-1, 2, 4], str_r: 3, ctype: 2, rnk: 1, drop: [{ item: eqp.pnt, chance: .008, cond: () => { return you.lvl <= 20 } }, { item: eqp.vst, chance: .007, cond: () => { return you.lvl <= 20 } }, { item: eqp.bnd, chance: .01, cond: () => { return you.lvl <= 20 } }, { item: item.wdc, chance: .03 }, { item: wpn.wsrd2, chance: .002, cond: () => { return you.lvl <= 20 } }] });
creature.wdummy.battle_ai = function (this: any, x: any, y: any, z: any) {
  if (random() <= .001) return attack(x, y, abl.rstab);
  return attack(x, y)
}
creature.wdummy.onDeathE = function (this: any) { };

// @ts-ignore: constructor function
creature.puppet = new Creature({ id: 105, name: 'Puppet', desc: 'Animated doll with agile movements', drop: [] });
creature.puppet.battle_ai = function (this: any, x: any, y: any, z: any) { }

// @ts-ignore: constructor function
creature.bpuppet = new Creature({ id: 106, name: 'Battle Puppet', desc: 'Animated doll with martial ability', drop: [] });
creature.bpuppet.battle_ai = function (this: any, x: any, y: any, z: any) { }

// @ts-ignore: constructor function
creature.doll = new Creature({ id: 107, name: 'Doll', desc: 'Child\'s toy possessed by an evil spirit', drop: [] });
creature.doll.battle_ai = function (this: any, x: any, y: any, z: any) { }

// @ts-ignore: constructor function
creature.ndoll = new Creature({ id: 108, name: 'Necro doll', desc: 'Evil Dolls used in dark rituals', drop: [] });
creature.ndoll.battle_ai = function (this: any, x: any, y: any, z: any) { }

// @ts-ignore: constructor function
creature.cdoll = new Creature({ id: 111, name: 'Quicksilver', desc: 'Dolls possessed by the souls of children who lost their lives to war or illness', drop: [] });
creature.cdoll.battle_ai = function (this: any, x: any, y: any, z: any) { }

// @ts-ignore: constructor function
creature.zomb1 = new Creature({ id: 113, name: 'Zombie', desc: 'Once the inhabitants of the surface, zombies emerge from the Dark to attack the living' });

// @ts-ignore: constructor function
creature.mumy = new Creature({ id: 114, name: 'Mummy', desc: 'Ancient corpses infused with the power of Dark' });

// @ts-ignore: constructor function
creature.ghl = new Creature({ id: 115, name: 'Ghoul', desc: 'Ghouls lurk in the Catacombs, longing for human flesh. Attacking their heads proves effective' });

// @ts-ignore: constructor function
creature.ght = new Creature({ id: 116, name: 'Ghast', desc: 'The living dead, given power by demons of the Underworld' });

// @ts-ignore: constructor function
creature.zmbf = new Creature({ id: 117, name: 'Zombie Fighter', desc: 'Corpses of common soldiers, brought back to life through the Dark\'s taint' });

// @ts-ignore: constructor function
creature.zmbk = new Creature({ id: 118, name: 'Zombie Knight', desc: 'Zombies of the Knights of the Cross, still in possession of potent martial skills' });

// @ts-ignore: constructor function
creature.zmbm = new Creature({ id: 119, name: 'Zombie Mage', desc: 'Zombies of Dark mages, who employ powerful offensive magic' });

// @ts-ignore: constructor function
creature.skl = new Creature();
creature.skl.name = 'Skeleton';
creature.skl.id = 120;
creature.skl.desc = 'Skeletal remains of zombie corpses. They lurk in darkness to attack the living';
creature.skl.type = 2;
creature.skl.exp = 15;
creature.skl.hp_r = 132;
creature.skl.stat_p = [1.3, 1.15, 1.05, .1];
creature.skl.aff = [12, 20, -4, -11, 31, -33, 51];
creature.skl.cls = [0, 9, -16];
creature.skl.eqp[0].aff = [8, 20, -4, -11, 31, -33, 51];
creature.skl.eqp[0].cls = [2, 5, 5];
creature.skl.ctype = 1;
creature.skl.str_r = 17;
creature.skl.agl_r = 19;
creature.skl.spd_r = 2;
creature.skl.drop = [];
creature.skl.rnk = 7;
creature.skl.pts = 17;

// @ts-ignore: constructor function
creature.slm1 = new Creature({ name: 'Blue Slime', id: 121, desc: 'Lesser slimes, devoid of any senses. They survive by absorbing debris from the ground', type: 1, exp: 3, hp_r: 65, stat_p: [0.7, .8, 1.5, .3], aff: [5, 5, 15, -20, -15, 25, 34], cls: [5, 5, 20], ctype: 2, str_r: 2, agl_r: 5, eva: 6, spd_r: 1, drop: [{ item: item.watr, chance: .01 }, { item: item.slm, chance: .03 }, { item: item.jll, chance: .01 }], rnk: 2, pts: 3 });

// @ts-ignore: constructor function
creature.slm2 = new Creature();
creature.slm2.name = 'Green Slime';
creature.slm2.id = 122;
creature.slm2.desc = 'Small forest slimes. They hide in leaves and grass';
creature.slm2.type = 1;
creature.slm2.exp = 4;
creature.slm2.hp_r = 70;
creature.slm2.stat_p = [0.75, .85, 1.5, .3];
creature.slm2.aff = [5, 5, 15, -20, -15, 25, 34]
creature.slm2.cls = [4, 4, 22];
creature.slm2.eqp[0].aff = [2, 12, 5, -12, 6, 0, 0];
creature.slm2.eqp[0].cls = [2, 2, 2];
creature.slm2.ctype = 1;
creature.slm2.str_r = 3;
creature.slm2.agl_r = 5;
creature.slm2.eva = 6;
creature.slm2.spd_r = 1;
creature.slm2.drop = [{ item: item.watr, chance: .01 }, { item: item.slm, chance: .04 }, { item: item.jll, chance: .01 }, { item: acc.jln2, chance: .0005 },];
creature.slm2.rnk = 2;
creature.slm2.pts = 3;

// @ts-ignore: constructor function
creature.rbt1 = new Creature();
creature.rbt1.name = 'Wild Rabbit';
creature.rbt1.id = 123;
creature.rbt1.desc = 'Docile rabbits, often found in plains and woods. They\'re difficult to catch';
creature.rbt1.type = 1;
creature.rbt1.exp = 5;
creature.rbt1.stat_p = [1, .9, 2, .3];
creature.rbt1.aff = [6, 15, 15, -10, 16, 33, 2]
creature.rbt1.cls = [4, -2, 5];
creature.rbt1.eqp[0].aff = [5, 6, 6, 0, 2, 0, 0];
creature.rbt1.eqp[0].cls = [2, 3, 1];
creature.rbt1.ctype = 1;
creature.rbt1.hp_r = 55;
creature.rbt1.blood = .108
creature.rbt1.str_r = 2;
creature.rbt1.agl_r = 10;
creature.rbt1.eva = 40;
creature.rbt1.spd_r = 2;
creature.rbt1.drop = [{ item: item.sbone, chance: .1 }, { item: item.rwmt1, chance: .06 }, { item: item.crrt, chance: .04 }, { item: acc.rfot, chance: .00004 }];
creature.rbt1.rnk = 2;
creature.rbt1.pts = 4;

// @ts-ignore: constructor function
creature.slm3 = new Creature();
creature.slm3.name = 'Cyan Slime';
creature.slm3.id = 124;
creature.slm3.desc = 'Brightly colored slime. It looks like it can perfectly reflect the sky';
creature.slm3.type = 1;
creature.slm3.exp = 8;
creature.slm3.hp_r = 120;
creature.slm3.stat_p = [1.2, 1.2, 2.9, .8];
creature.slm3.aff = [15, 5, 15, -10, -5, 55, 34]
creature.slm3.cls = [9, 9, 24];
creature.slm3.eqp[0].aff = [4, 6, 7, -12, 6, 0, 0];
creature.slm3.eqp[0].cls = [4, 4, 4];
creature.slm3.ctype = 1;
creature.slm3.atype = 1;
creature.slm3.str_r = 5;
creature.slm3.agl_r = 8;
creature.slm3.eva = 15;
creature.slm3.spd_r = 2;
creature.slm3.drop = [{ item: item.watr, chance: .03 }, { item: item.slm, chance: .05 }, { item: item.jll, chance: .02 }];
creature.slm3.rnk = 3;
creature.slm3.pts = 4;

// @ts-ignore: constructor function
creature.slm4 = new Creature();
creature.slm4.name = 'Clear Slime';
creature.slm4.id = 125;
creature.slm4.desc = 'Weird transparent slime, bearing no distinct color. They can hide anywhere and are very difficult to notice';
creature.slm4.type = 1;
creature.slm4.exp = 10;
creature.slm4.hp_r = 95;
creature.slm4.stat_p = [1.24, 1.23, 2.97, .82];
creature.slm4.aff = [15, 5, 15, -10, -5, 55, 34]
creature.slm4.cls = [12, 12, 28];
creature.slm4.eqp[0].aff = [4, 9, 7, -12, 12, 0, 0];
creature.slm4.eqp[0].cls = [6, 5, 4];
creature.slm4.ctype = 2;
creature.slm4.atype = 4;
creature.slm4.str_r = 9;
creature.slm4.agl_r = 9;
creature.slm4.eva = 20;
creature.slm4.spd_r = 2;
creature.slm4.drop = [{ item: item.watr, chance: .035 }, { item: item.slm, chance: .02 }, { item: item.jll, chance: .06 }];
creature.slm4.rnk = 3;
creature.slm4.pts = 5;

// @ts-ignore: constructor function
creature.kksh = new Creature({ name: 'Scarecrow', id: 126, desc: 'Once protector of fields, this figure has turned to evil by the influence of Dark. It hangs still in ambush, waiting for unsuspecting passersby', exp: 5, hp_r: 100, stat_p: [1.1, 1.2, 2.9, .8], aff: [15, 5, 15, -10, -5, 55, 34], cls: [9, 9, 35], ctype: 1, atype: 1, str_r: 5, agl_r: 13, spd_r: 2, drop: [{ item: item.watr, chance: .03 }, { item: item.slm, chance: .06 }, { item: item.jll, chance: .02 }], rnk: 10 });

// @ts-ignore: constructor function
creature.golem1 = new Creature({ name: 'Straw Golem', id: 127, desc: 'Big golem composed of straw. These golems are brittle and weak, their main purpose is to assist newbies in training', exp: 50, hp_r: 500, stat_p: [0.05, 0.2, 0.2, 0.2], aff: [10, 8, 5, -60, -5, 15, 14], cls: [10, 15, 10], ctype: 2, str_r: 15, agl_r: 30, spd_r: 3, drop: [{ item: item.sstraw, chance: 1, min: 13, max: 25 }, { item: item.lsrd, chance: 1 }], rnk: 4, un: true, pts: 200 });

// @ts-ignore: constructor function
creature.golem2 = new Creature({ name: 'Reinforced Straw Golem', id: 128, desc: 'This golem\'s joints have been binded by the rope, giving it sturdier and more stable frame', exp: 60, hp_r: 700, stat_p: [0.06, 0.25, 0.2, 0.25], aff: [11, 8, 5, -60, -5, 15, 14], cls: [11, 16, 11], ctype: 2, str_r: 18, agl_r: 35, spd_r: 3, rnk: 4, un: true, drop: [{ item: item.sstraw, chance: 1, min: 13, max: 25 }, { item: item.lsrd, chance: 1, min: 2, max: 2 }, { item: item.rope, chance: .1 }], pts: 400 });

// @ts-ignore: constructor function
creature.golem3 = new Creature({ name: 'Paper Golem', id: 129, desc: 'Slim golem made of paper-like material. While not as tough as other training golems, it has a light body which allows it to move faster', exp: 80, hp_r: 400, stat_p: [0.06, 0.3, 0.3, 0.3], aff: [11, 8, 5, -60, -5, 15, 14], cls: [10, 20, 14], ctype: 2, str_r: 21, agl_r: 70, spd_r: 4, rnk: 4, un: true, drop: [{ item: item.lsrd, chance: 1, min: 4, max: 4 }, { item: item.bhd, chance: .5, min: 1, max: 4 }], pts: 500 });

// @ts-ignore: constructor function
creature.golem4 = new Creature({ name: 'Attack Golem', id: 130, desc: 'Golem with implanted martial prowess. Somewhat similar to a trained militant, they pose a dangerous threat to any unprepared opponent', exp: 120, hp_r: 730, stat_p: [0.06, 0.3, 0.3, 0.3], aff: [19, 8, 5, -60, -5, 15, 14], cls: [20, 25, 18], ctype: 2, str_r: 25, agl_r: 50, spd_r: 4, rnk: 5, un: true, pts: 800, drop: [{ item: item.lsstn, chance: 1 }] });
creature.golem4.battle_ai = function (this: any, x: any, y: any, z: any) {
  if (random() <= .2) return attack(x, y, abl.bash);
  return attack(x, y)
}

// @ts-ignore: constructor function
creature.ngtmr1 = new Creature({ name: 'Nightmare', id: 131, desc: 'Manifestation of your fears', exp: 1, hp_r: 100000000, stat_p: [0, 0, 0, 0], cls: [9999, 9999, 9999], str_r: 1, agl_r: 1, rnk: 0 });
creature.ngtmr1.battle_ai = function (this: any) {
  return false
}

// @ts-ignore: constructor function
creature.lrck = new Creature({ name: 'Locked Rock', id: 132, desc: 'A rock shaped monster found in caves and dungeons. It has a habit of closing of paths by mimicking a wall, but it\'s fighting prowess is close to zero.', exp: 123, hp_r: 9000, stat_p: [1.5, 1.2, 1, 1], cls: [90, 120, 60], str_r: 90, agl_r: 1, rnk: 11 });
creature.lrck.battle_ai = function (this: any) {
  return false
}

// @ts-ignore: constructor function
creature.lsprt = new Creature({ name: 'Lamp Spirit', id: 133, desc: 'Small fire sprites that manifest inside oil lamps located in mines and other places with low human activity. While not sinister by nature, they enjoy playing pranks on people', exp: 5, hp_r: 100, stat_p: [1.1, 1.2, 2.9, .8], aff: [15, 5, 15, -10, -5, 55, 34], cls: [9, 9, 35], ctype: 1, atype: 1, str_r: 5, agl_r: 13, spd_r: 2, drop: [{ item: item.watr, chance: .03 }, { item: item.slm, chance: .06 }, { item: item.jll, chance: .02 }], rnk: 10 });

// @ts-ignore: constructor function
creature.dcrps1 = new Creature({ id: 134, name: 'Disaster Corpse', desc: 'Undead bodies manifested purely by death ki. They appear in ancient battlefields or other areas with extremely heavy concentration of dark ki. These corpses share countless memories of residue souls' });

// @ts-ignore: constructor function
creature.unsctn = new Creature({ id: 135, name: 'Unchanging Skeleton', desc: 'People that neither die nor dissolve, active in the world but don\'t have minds or memories. They won\'t hurt people other than pulling pranks and causing trouble, but would go frenzy if exposed to death ki for too long' });

// @ts-ignore: constructor function
creature.wolf1 = new Creature();
creature.wolf1.name = 'Weakened Wolf';
creature.wolf1.id = 136;
creature.wolf1.desc = 'Wolves affected by a disease or other negative influences. While not nearly as dangerous as its healthy counterpart, even in such a low state they pose danger to those who aren\'t careful'//'Predatorous inhabitants of forests with a proud character. They stalk their prey and hunt in packs';
creature.wolf1.type = 1;
creature.wolf1.exp = 15;
creature.wolf1.hp_r = 400;
creature.wolf1.stat_p = [1.3, 1.15, 1.35, .9];
creature.wolf1.aff = [22, 20, -4, -11, 31, -33, 51];
creature.wolf1.cls = [36, 32, 45];
creature.wolf1.eqp[0].aff = [12, 20, -4, -11, 31, -33, 51];
creature.wolf1.eqp[0].cls = [8, 9, 8];
creature.wolf1.ctype = 1;
creature.wolf1.str_r = 20;
creature.wolf1.agl_r = 20;
creature.wolf1.int_r = 10;
creature.wolf1.spd_r = 3;
creature.wolf1.eva = 25;
creature.wolf1.drop = [{ item: item.sbone, chance: .15 }, { item: item.rwmt1, chance: .06 }, { item: item.wfng, chance: .005 }];
creature.wolf1.rnk = 4;
creature.wolf1.blood = .986
creature.wolf1.pts = 9;
creature.wolf1.battle_ai = function (this: any, x: any, y: any, z: any) {
  if (random() <= .3) return attack(x, y, abl.bite);
  else if (random() <= .1) return attack(x, y, abl.scratch)
  return attack(x, y)
}

// @ts-ignore: constructor function
creature.slm5 = new Creature();
creature.slm5.name = 'Blue Slime';
creature.slm5.id = 137;
creature.slm5.desc = 'Slime of a very deep darkblue hue, which looks shiny under the light and almost completely dark in the shade';
creature.slm5.type = 1;
creature.slm5.exp = 12;
creature.slm5.hp_r = 220;
creature.slm5.stat_p = [0.5, 1.1, 2.97, .6];
creature.slm5.aff = [19, 15, 15, 3, -5, 55, 34]
creature.slm5.cls = [23, 23, 23];
creature.slm5.eqp[0].aff = [4, 9, 7, -12, 12, 0, 0];
creature.slm5.eqp[0].cls = [7, 7, 7];
creature.slm5.ctype = 2;
creature.slm5.atype = 4;
creature.slm5.str_r = 8;
creature.slm5.agl_r = 9;
creature.slm5.eva = 22;
creature.slm5.spd_r = 2;
creature.slm5.drop = [{ item: item.watr, chance: .085 }, { item: item.slm, chance: .03 }, { item: item.jll, chance: .07 }, { item: acc.jln3, chance: .0005 }];
creature.slm5.rnk = 3;
creature.slm5.pts = 5;
creature.slm5.battle_ai = function (this: any, x: any, y: any, z: any) {
  if (random() <= .15) return attack(x, y, abl.bash);
  return attack(x, y)
}

