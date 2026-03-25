import { abl, effect } from '../state';
import type { Combatant } from '../types';
import { random } from '../random';
import { findbyid } from '../utils';
import { dmg_calc } from '../game/combat';
import { giveEff } from '../ui/effects';
import abilitiesData from './abilities.json'

// ==========================================================================
// Ability constructor + instances
// ==========================================================================

function Ability(this: any, id?: any) {
  this.name = '';
  this.id = id || 0
  this.atrg = ' -> ';
  this.btrg = ' -> ';
  this.cls;
  this.aff;
  this.affp = 0
  this.stt = 1;
  this.f = function (this: any, x: Combatant, y: Combatant) { return dmg_calc(x, y, this) }
} // @ts-ignore: constructor function
abl.default = new Ability();


// @ts-ignore: constructor function
abl.bite = new Ability(1);
abl.bite.name = 'Bite';
abl.bite.atrg = ' <span style="color:hotpink">bites you</span> -> ';
abl.bite.f = function (this: any, x: Combatant, y: Combatant, z: any) {
  if (random() < .15) {
    let f = findbyid(y.eff, effect.bled.id);
    if (random() < y.res.bleed) { giveEff(y, effect.bled, 10, z || 4); if (f) f.duration += 6 }
  }
  return dmg_calc(x, y, this) * 1.15;
}

// @ts-ignore: constructor function
abl.rstab = new Ability(2);
abl.rstab.name = 'Selfharm';
abl.rstab.atrg = ' <span style="color:magenta">stabs you with something rusty</span> -> ';
abl.rstab.cls = 1;
abl.rstab.f = function (this: any, x: Combatant, y: Combatant) {
  if (y.res.poison >= random()) { if (effect.psn.active === false) giveEff(y, effect.psn, 5, 1); else effect.psn.duration += 5; }
  return dmg_calc(x, y, this) * 1.1;
}

// @ts-ignore: constructor function
abl.scrtch = new Ability(3);
abl.scrtch.name = 'Scratch';
abl.scrtch.atrg = ' <span style="color:hotpink">scratches you</span> -> ';
abl.scrtch.cls = 0;
abl.scrtch.f = function (this: any, x: Combatant, y: Combatant, z: any) {
  if (random() < .05) {
    let f = findbyid(y.eff, effect.bled.id);
    if (random() < y.res.bleed) { giveEff(y, effect.bled, 5, z || 3); if (f) f.duration += 3 }
  }
  return dmg_calc(x, y, this) * 1.1;
}

// @ts-ignore: constructor function
abl.spark = new Ability(4);
abl.spark.name = 'Spark';
abl.spark.atrg = ' <span style="color:yellow">electrocutes you</span> -> ';
abl.spark.btrg = ' <span style="color:yellow">electrocute the enemy</span> -> ';
abl.spark.cls = 1;
abl.spark.aff = 1;
abl.spark.stt = 2;
abl.spark.affp = 25;
abl.spark.f = function (this: any, x: Combatant, y: Combatant) {
  return dmg_calc(x, y, this) * 1.2;
}

// @ts-ignore: constructor function
abl.dstab = new Ability(5);
abl.dstab.name = 'Double Stab';
abl.dstab.atrg = ' <span style="color:pink">doublestabs you</span> -> ';
abl.dstab.btrg = ' <span style="color:pink">You doublestab the enemy</span> -> ';
abl.dstab.cls = 1;
abl.dstab.f = function (this: any, x: Combatant, y: Combatant) {
  return (dmg_calc(x, y, this) * 0.7 + dmg_calc(x, y, this) * 0.7)
}

// @ts-ignore: constructor function
abl.pbite = new Ability(6);
abl.pbite.name = 'Poison Bite';
abl.pbite.atrg = ' <span style="color:magenta">bites you</span> -> ';
abl.pbite.cls = 1;
abl.pbite.f = function (this: any, x: Combatant, y: Combatant, z: any) {
  if (random() < .25) {
    if (random() < y.res.poison) giveEff(y, effect.psn, 15, z || 3)
  }
  return dmg_calc(x, y, this) * 1.15;
}

// @ts-ignore: constructor function
abl.bash = new Ability(7);
abl.bash.name = 'Bash';
abl.bash.atrg = ' <span style="color:lightgrey">bashes you</span> -> ';
abl.bash.cls = 2;
abl.bash.f = function (this: any, x: Combatant, y: Combatant) {
  return dmg_calc(x, y, this) * 1.3
}

init_collection(abilitiesData)
add_custom_logic()