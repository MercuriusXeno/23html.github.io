import { you, callback, global, dom, timers, chss, setYou, data, flags, stats, } from '../state';
const { ttl, eqp, item, skl, creature, act, sector, area } = data;
import { random } from '../random';
import { smove } from '../game/movement';
import { attack } from '../game/combat';
import { giveItem } from '../game/inventory';
import { giveSkExp, giveTitle } from '../game/progression';
import { msg } from '../ui/messages';
import { removeEff } from '../ui/effects';
import { deactivateAct } from '../ui/panels';
import { update_db } from '../ui/stats';

// ==========================================================================
// Player Constructor
// ==========================================================================

export function You(this: any) {
  this.name = 'You';
  this.title = ttl.new;
  this.desc = 'This is you';
  this.id = -1;
  this.type = 0;
  this.rank = function (this: any) { return Math.ceil(50000000000000 * (1 / (((this.agl + this.str + (you.eqp[0].str) + this.spd + this.int) ** 2) / Math.sqrt((this.agl + this.str + this.int + (this.spd / this.lvl)) * 512 / (this.luck * .1 + 1))))) };
  this.rnk = 0;
  this.lvl = 1;
  this.exp = 0;
  this.expnext = function (this: any) { return this.lvl * ((this.lvl * 2) ** 2) + (this.lvl ** 2) };
  this.expnext_t = this.expnext();
  this.exp_t = 1;
  this.efficiency = function (this: any) { let g = skl.fmn.use(); g = g >= .6 ? .6 : g; let e = (.8 - g) * this.sat / this.satmax + (.2 + g) + you.mods.sbonus; return e < 0 ? 0 : e }
  this.mods = { sbonus: 0, sdrate: .1, infsrate: 1, enmondren: 0, enmondrts: 1, ddgmod: 0, rdgrt: 1, cpwr: 1, crflt: 0, wthexrt: 0, tstl: 0, lkdbt: 0, ckfre: 0, rnprtk: 0, light: 0, undc: 0, petxp: .005, stdstps: 1, survinf: 0, runerg: 1 };
  this.ki = new Object();
  this.sat = this.satmax = this.sat_r = 200;
  this.hpmax = 39;
  this.hp = this.hp_r = 39;
  this.str = this.str_r = this.agl = this.agl_r = this.int = this.int_r = this.spd = this.spd_r = this.str_d = this.agl_d = this.int_d = 1;
  this.stra = this.agla = this.inta = this.spda = this.hpa = this.sata = 0;
  this.strm = this.intm = this.spdm = this.aglm = this.hpm = this.satm = 1
  this.stat_p = [1, 1, 1, 1];
  this.res = { poison: 1, burn: 1, frost: 1, paralize: 1, blind: 1, sleep: 1, curse: 1, death: 1, bleed: 1, ph: 1, venom: 1, fpoison: 1 };
  this.cls = [0, 0, 0];
  this.ccls = [0, 0, 0];
  this.aff = [0, 0, 0, 0, 0, 0, 0];
  this.maff = [0, 0, 0, 0, 0, 0, 0];
  this.caff = [0, 0, 0, 0, 0, 0, 0];
  this.cmaff = [0, 0, 0, 0, 0, 0, 0];
  this.dmlt = 1;
  this.luck = 1;
  this.karma = 0;
  this.crt = .008;
  this.wealth = 0;
  this.eva = 0;
  this.atkmode = 1;
  this.alive = true;
  this.eqp = [eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy];
  this.eff = [];
  this.skls = [];
  this.drop = [{ item: item.death_b, chance: 1 }];
  this.onDeath = function (this: any, killer: any) {
    if (you.res.death < 1 && random() >= you.res.death) { msg('You avoid death...', 'lightgrey'); you.hp = Math.ceil(you.hpmax * .1) } else {
      callback.onDeath.fire(this, killer)
      this.alive = false;
      this.hp = 1;
      if (!killer) killer = creature.default;
      if (global.current_a.id !== act.default.id) deactivateAct(global.current_a);
      flags.work = false
      you.sat / you.satmax > .3 ? giveSkExp(skl.dth, killer.rnk * 10 + 1) : giveSkExp(skl.dth, killer.rnk + 1);
      if (this.sat > 0) this.sat *= (.55 * (1 - skl.dth.use()));
      giveItem(item.death_b);
      dom.d5_1_1.update();
      global.s_l = 0;
      stats.deadt++;
      for (let x in global.achchk[0]) global.achchk[0][x](killer);
      clearInterval(timers.rdng);
      clearInterval(timers.rdngdots);
      flags.rdng = false;
      clearInterval(timers.job1t);
      clearInterval(timers.bstmonupdate)
      for (let o in this.eff) removeEff(this.eff[o])
      flags.btl = false;
      flags.civil = true;
      global.current_z.onDeath();
      if (sector.home.data.smkp > 0) { smove(chss.lsmain1, false); msg('You ran out of your smoked up house', 'grey') } else smove(chss.hbed, false);
      global.current_z = area.nwh;
      dom.hit_c();
      dom.d7m.update()
    }
  }
  this.onDeathE = function () { }
  this.ai = function () { }
  this.battle_ai = function (x: any, y: any, z: any) { return attack(x, y) }
  this.stat_r = function (this: any) {
    this.stre = this.inte = this.agle = this.spde = this.sate = this.hpe = 1;
    for (let idx in this.eff) this.eff[idx].mods(you);
    this.str = (this.str_r + this.stra) * this.strm * this.stre;
    this.str_d = this.str
    this.int = (this.int_r + this.inta) * this.intm * this.inte;
    this.int_d = this.int
    this.agl = (this.agl_r + this.agla) * this.aglm * this.agle;
    this.agl_d = this.agl
    this.spd = (this.spd_r + this.spda) * this.spdm * this.spde;
    this.spd_d = this.spd
    this.hpmax = Math.ceil((this.hp_r + this.hpa) * this.hpm * this.hpe);
    this.satmax = Math.ceil((this.sat_r + this.sata) * this.satm * this.sate);
    this.str_d += this.eqp[0].str;
    this.dmlt = 1;
    for (let obj in this.eqp) {
      this.int_d += this.eqp[obj].int;
      this.agl_d += this.eqp[obj].agl;
      this.spd += this.eqp[obj].spd;
    }
    for (let idx in this.eff) {
      if (this.eff[idx].type === 2) { this.eff[idx].un(you); this.eff[idx].use(you, this.eff[idx].y, this.eff[idx].z) };
    } dom.d6.update(); update_db(); if (you.hp > you.hpmax) you.hp = you.hpmax; dom.d5_1_1.update();
  }
}
