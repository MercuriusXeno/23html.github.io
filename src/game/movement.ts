// ==========================================================================
// Movement & Area System
// ==========================================================================

import type { Area, Sector, Creature } from '../types';
import { random, rand } from '../random';
import { copy, scanbyid } from '../utils';
import { empty } from '../dom-utils';
import { dom, global, you, sectors, effector, data, flags, stats, combat, } from '../state';
const { creature, area, effect, act, skl } = data;
import { msg } from '../ui/messages';
import { clr_chs } from '../ui/choices';
import { update_m } from '../ui/stats';
import { giveEff } from '../ui/effects';
import { giveSkExp, lvlup } from './progression';

export function Effector(this: any) {
  this.id = 0;
  this.x = '@';
  this.c = 'white';
  this.active = false;
  this.activate = function () { }
  this.deactivate = function () { }
  this.use = function () { }
}

// @ts-ignore: constructor function
effector.dark = new Effector();
effector.dark.activate = function () { flags.isdark = true }
effector.dark.deactivate = function () { flags.isdark = false }
effector.dark.x = '闇';
effector.dark.c = 'darkgrey';

// @ts-ignore: constructor function
effector.shop = new Effector();
effector.shop.activate = function () { flags.isshop = true }
effector.shop.deactivate = function () { flags.isshop = false }
effector.shop.x = '$';
effector.shop.c = 'gold';

export function activateEffectors(effectors: any[]) {
  if (!effectors) return;
  for (let a in effectors) if (!effectors[a].e.active && (!effectors[a].c || effectors[a].c() === true)) { effectors[a].e.activate(); effectors[a].e.active = true }
}

export function deactivateEffectors(effectors: any[]) {
  if (!effectors) return
  for (let a in effectors) if (effectors[a].e.active) { effectors[a].e.deactivate(); effectors[a].e.active = false }
}

export function runEffectors(effectors: any[]) {
  if (!effectors) return
  for (let a in effectors) effectors[a].e.use();
}

export function inSector(sec: Sector) {
  for (let a in combat.currentLocation.sector) if ((combat.currentLocation.sector as any)[a].id === sec.id) return true
}

export function addtosector(sec: Sector, loc: Area) {
  sec.group.push(loc.id);
  if (!loc.sector) loc.sector = [];
  loc.sector.push(sec);
}

function mon_gen(crt: Creature) {
  crt.eff = [];
  global.enemyEffects = [];
  empty(dom.d101m);
  let newobj = copy(crt);
  newobj.drop = crt.drop;
  if (!flags.inside) {
    if (flags.israin) giveEff(newobj, effect.wet, 5)
    if (flags.iscold) giveEff(newobj, effect.cold, 25)
  }
  newobj.sex = random() < .5;
  return newobj;
}

export function area_init(ar: Area) {
  if (ar.size !== 0) {
    if (ar.id !== 101) {
      let rnd = random();
      for (let obj in ar.pop) if (rnd >= (ar as any).popc[obj][0] && rnd <= (ar as any).popc[obj][1]) if (!ar.pop[obj].cond || ar.pop[obj].cond() === true) {
        flags.civil = false;
        flags.btl = true;
        combat.currentZone = ar;
        let temp = ar.pop[obj];
        let newobj = temp.crt.id === creature.default.id ? creature.default : mon_gen(temp.crt);
        lvlup(newobj, rand(temp.lvlmin - 1, temp.lvlmax - 1));
        //newobj.data.lasthp=newobj.hp;
        combat.currentMonster = newobj;
        update_m();
        dom.d5_1_1m.update();
        if (!!dom.d7m) dom.d7m.update();
        //dom.d5m.update();
        return newobj;
      } else (area_init(ar));
    }
  } else msg('nobody\'s here');
  if (!!dom.d7m) dom.d7m.update();
  update_m();
  dom.d5_1_1m.update();
}

function rfeff(what: Area) {
  let t = '';
  for (let a in what.sector) if ((what.sector as any)[a].effectors)
    for (let b in (what.sector as any)[a].effectors) t += '<span style="color:' + (what.sector as any)[a].effectors[b].e.c + ';font-size:1.2em">&nbsp' + (what.sector as any)[a].effectors[b].e.x + '<span>';
  if (what.effectors) for (let a in what.effectors) t += '<span style="color:' + what.effectors[a].e.c + ';font-size:1.2em">&nbsp' + what.effectors[a].e.x + '<span>';
  dom.d_lctte.innerHTML = t;
}

export function smove(where: Area, gainExp?: boolean | number) {
  flags.busy = false; flags.work = false; global.windowIndex = 0;
  if (flags.loadstate) return;
  if (!flags.wkdis) { flags.wkdis = true; if (gainExp !== false) giveSkExp(skl.walk, .25); setTimeout(() => { flags.wkdis = false }, 500) }
  you.eqp[6].dp = you.eqp[6].dp - .08 < 0 ? 0 : you.eqp[6].dp - .08;
  let flg = false;
  let und = []
  for (let c in combat.currentLocation.sector) {
    for (let a in where.sector) {
      for (let b in (where.sector as any)[a].group)
        if ((where.sector as any)[a].group[b] === combat.currentLocation.id && (where.sector as any)[a].id === (combat.currentLocation.sector as any)[c].id) flg = true
    } if (flg === false) {
      (combat.currentLocation.sector as any)[c].onLeave();
      deactivateEffectors((combat.currentLocation.sector as any)[c].effectors);
      sectors.splice(sectors.indexOf((combat.currentLocation.sector as any)[c]))
    } else flg = false
  }
  combat.currentLocation.onLeave();
  deactivateEffectors(combat.currentLocation.effectors as any);
  flags.civil = true;
  flags.btl = false;
  combat.currentZone = area.nwh;
  dom.d7m.update();
  stats.sectorMoveTotal++
  flags.inside = false;
  for (let a in where.sector) { if ((where.sector as any)[a].inside || where.inside) flags.inside = true }
  clr_chs();
  activateEffectors(where.effectors as any);
  where.sl!();
  combat.currentLocation = where;
  for (let a in sectors) sectors[a].onMove();
  global.current_a.deactivate();
  global.current_a = act.default;
  dom.ct_bt3.style.backgroundColor = 'inherit';
  for (let a in combat.currentLocation.sector) if (!scanbyid(sectors, (combat.currentLocation.sector as any)[a].id)) { sectors.push((combat.currentLocation.sector as any)[a]); (combat.currentLocation.sector as any)[a].onEnter(); activateEffectors((combat.currentLocation.sector as any)[a].effectors) }
  combat.currentLocation.onEnter!();
  rfeff(combat.currentLocation)
  if (flags.btl === false) {
    combat.currentMonster = creature.default;
    combat.currentMonster.eff = [];
    empty(dom.d101m);
    dom.d5_1_1m.update();
    update_m();
  }
}
