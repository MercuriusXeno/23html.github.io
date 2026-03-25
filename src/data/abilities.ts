import { abl, effect } from '../state';
import { random } from '../random';
import { findbyid } from '../utils';
import { dmg_calc } from '../game/combat';
import { giveEff } from '../ui/effects';
import abilitiesData from './abilities.json'

// ==========================================================================
// Ability constructor + instances
// ==========================================================================

class Ability {
  constructor(
    public name = '',
    public id = 0,
    public atrg = ' -> ',
    public btrg = ' -> ',
    public cls: any,
    public aff: any,
    public affp: any,
    public stt = 1,
  ) { }
  f = function (this: any, x: any, y: any) { return dmg_calc(x, y, this) }
}

function init_collection(data: any) {
  for (let spec of data) {
    const { id, name, abbr, atrg, btrg, cls, aff, affp, stt } = spec;
    abl[abbr] = new Ability(name, id, atrg, btrg, cls, aff, affp, stt)
  }
}

function add_custom_logic() {
  abl.rstab.f = function (this: any, x: any, y: any) {
    if (y.res.poison >= random()) { if (effect.psn.active === false) giveEff(y, effect.psn, 5, 1); else effect.psn.duration += 5; }
    return dmg_calc(x, y, this) * 1.1;
  }
  abl.scrtch.f = function (this: any, x: any, y: any, z: any) {
    if (random() < .05) {
      let f = findbyid(y.eff, effect.bled.id);
      if (random() < y.res.bleed) { giveEff(y, effect.bled, 5, z || 3); if (f) f.duration += 3 }
    }
    return dmg_calc(x, y, this) * 1.1;
  }
  abl.spark.f = function (this: any, x: any, y: any) {
    return dmg_calc(x, y, this) * 1.2;
  }
  abl.dstab.f = function (this: any, x: any, y: any) {
    return (dmg_calc(x, y, this) * 0.7 + dmg_calc(x, y, this) * 0.7)
  }
  abl.pbite.f = function (this: any, x: any, y: any, z: any) {
    if (random() < .25) {
      if (random() < y.res.poison) giveEff(y, effect.psn, 15, z || 3)
    }
    return dmg_calc(x, y, this) * 1.15;
  }
  abl.bite.f = function (this: any, x: any, y: any, z: any) {
    if (random() < .15) {
      let f = findbyid(y.eff, effect.bled.id);
      if (random() < y.res.bleed) { giveEff(y, effect.bled, 10, z || 4); if (f) f.duration += 6 }
    }
    return dmg_calc(x, y, this) * 1.15;
  }
  abl.bash.f = function (this: any, x: any, y: any) {
    return dmg_calc(x, y, this) * 1.3
  }
}

init_collection(abilitiesData)
add_custom_logic()