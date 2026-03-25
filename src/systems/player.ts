import type { Combatant } from '../types';
import { you, callback, global, dom, timers, chss, setYou, data, flags, stats, combat, } from '../state';
const { ttl, eqp, item, skl, creature, act, sector, area } = data;
import { random } from '../random';
import { smove } from '../game/movement';
import { attack } from '../game/combat';
import { giveItem } from '../game/inventory';
import { giveSkExp, giveTitle } from '../game/progression';
import { msg } from '../ui/messages';
import { removeEff } from '../ui/effects';
import { deactivateAct } from '../ui/panels';
import { updateStatDisplay } from '../ui/stats';

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
  this.efficiency = function (this: any) { let g = skl.fmn.use(); g = g >= .6 ? .6 : g; let e = (.8 - g) * this.sat / this.satmax + (.2 + g) + you.mods.satiationBonus; return e < 0 ? 0 : e }
  this.mods = { satiationBonus: 0, satiationDrainRate: .1, inflationRate: 1, enemyMoneyDropRateEnhance: 0, enemyMoneyDropRateTries: 1, dodgeModifier: 0, readingRate: 1, critPower: 1, critChanceFlat: 0, wealthExtra: 0, toSteal: 0, luckDoubleTry: 0, cookingFire: 0, rainProtect: 0, light: 0, unarmedDamage: 0, pettingExperience: .005, stardustParticleSpawn: 1, survivalInfo: 0, runningEnergyCost: 1 };
  this.ki = new Object();
  this.sat = this.satmax = this.sat_base = 200;
  this.hpmax = 39;
  this.hp = this.hp_base = 39;
  this.str = this.str_base = this.agl = this.agl_base = this.int = this.int_base = this.spd = this.spd_base = this.str_display = this.agl_display = this.int_display = 1;
  this.str_bonus = this.agl_bonus = this.int_bonus = this.spd_bonus = this.hp_bonus = this.sat_bonus = 0;
  this.str_mult = this.int_mult = this.spd_mult = this.agl_mult = this.hp_mult = this.sat_mult = 1
  this.statPotential = [1, 1, 1, 1];
  this.res = { poison: 1, burn: 1, frost: 1, paralize: 1, blind: 1, sleep: 1, curse: 1, death: 1, bleed: 1, ph: 1, venom: 1, fpoison: 1 };
  this.cls = [0, 0, 0];
  this.combatClass = [0, 0, 0];
  this.aff = [0, 0, 0, 0, 0, 0, 0];
  this.maff = [0, 0, 0, 0, 0, 0, 0];
  this.caff = [0, 0, 0, 0, 0, 0, 0];
  this.combatMonsterAffinity = [0, 0, 0, 0, 0, 0, 0];
  this.damageMultiplier = 1;
  this.luck = 1;
  this.karma = 0;
  this.critChance = .008;
  this.wealth = 0;
  this.evasion = 0;
  this.atkmode = 1;
  this.alive = true;
  this.eqp = [eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy];
  this.eff = [];
  this.skls = [];
  this.drop = [{ item: item.death_b, chance: 1 }];
  this.onDeath = function (this: any, killer: Combatant) {
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
      global.speedLevel = 0;
      stats.deathTotal++;
      for (let x in global.achchk[0]) global.achchk[0][x](killer);
      clearInterval(timers.rdng);
      clearInterval(timers.rdngdots);
      flags.rdng = false;
      clearInterval(timers.job1t);
      clearInterval(timers.bstmonupdate)
      for (let o in this.eff) removeEff(this.eff[o])
      flags.btl = false;
      flags.civil = true;
      combat.currentZone.onDeath();
      if (sector.home.data.smkp > 0) { smove(chss.lsmain1, false); msg('You ran out of your smoked up house', 'grey') } else smove(chss.hbed, false);
      combat.currentZone = area.nwh;
      dom.hit_c();
      dom.d7m.update()
    }
  }
  this.onDeathE = function () { }
  this.ai = function () { }
  this.battle_ai = function (x: Combatant, y: Combatant, z?: any) { return attack(x, y) }
  this.stat_r = function (this: any) {
    this.str_eff = this.int_eff = this.agl_eff = this.spd_eff = this.sat_eff = this.hp_eff = 1;
    for (let idx in this.eff) this.eff[idx].mods(you);
    this.str = (this.str_base + this.str_bonus) * this.str_mult * this.str_eff;
    this.str_display = this.str
    this.int = (this.int_base + this.int_bonus) * this.int_mult * this.int_eff;
    this.int_display = this.int
    this.agl = (this.agl_base + this.agl_bonus) * this.agl_mult * this.agl_eff;
    this.agl_display = this.agl
    this.spd = (this.spd_base + this.spd_bonus) * this.spd_mult * this.spd_eff;
    this.spd_display = this.spd
    this.hpmax = Math.ceil((this.hp_base + this.hp_bonus) * this.hp_mult * this.hp_eff);
    this.satmax = Math.ceil((this.sat_base + this.sat_bonus) * this.sat_mult * this.sat_eff);
    this.str_display += this.eqp[0].str;
    this.damageMultiplier = 1;
    for (let obj in this.eqp) {
      this.int_display += this.eqp[obj].int;
      this.agl_display += this.eqp[obj].agl;
      this.spd += this.eqp[obj].spd;
    }
    for (let idx in this.eff) {
      if (this.eff[idx].type === 2) { this.eff[idx].un(you); this.eff[idx].use(you, this.eff[idx].y, this.eff[idx].z) };
    } dom.d6.update(); updateStatDisplay(); if (you.hp > you.hpmax) you.hp = you.hpmax; dom.d5_1_1.update();
  }
}
