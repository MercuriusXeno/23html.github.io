// ==========================================================================
// Movement & Area System
// ==========================================================================

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

export function activateEffectors(e: any) {
  if (!e) return;
  for (let a in e) if (!e[a].e.active && (!e[a].c || e[a].c() === true)) { e[a].e.activate(); e[a].e.active = true }
}

export function deactivateEffectors(e: any) {
  if (!e) return
  for (let a in e) if (e[a].e.active) { e[a].e.deactivate(); e[a].e.active = false }
}

export function runEffectors(e: any) {
  if (!e) return
  for (let a in e) e[a].e.use();
}

export function inSector(sector: any) {
  for (let a in combat.current_l.sector) if (combat.current_l.sector[a].id === sector.id) return true
}

export function addtosector(sector: any, loc: any) {
  sector.group.push(loc.id);
  loc.sector.push(sector);
}

function mon_gen(crt: any) {
  crt.eff = [];
  global.e_em = [];
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

export function area_init(area: any) {
  if (area.size !== 0) {
    if (area.id !== 101) {
      let rnd = random();
      for (let obj in area.pop) if (rnd >= area.popc[obj][0] && rnd <= area.popc[obj][1]) if (!area.pop[obj].cond || area.pop[obj].cond() === true) {
        flags.civil = false;
        flags.btl = true;
        combat.current_z = area;
        let temp = area.pop[obj];
        let newobj = temp.crt.id === creature.default.id ? creature.default : mon_gen(temp.crt);
        lvlup(newobj, rand(temp.lvlmin - 1, temp.lvlmax - 1));
        //newobj.data.lasthp=newobj.hp;
        combat.current_m = newobj;
        update_m();
        dom.d5_1_1m.update();
        if (!!dom.d7m) dom.d7m.update();
        //dom.d5m.update();
        return newobj;
      } else (area_init(area));
    }
  } else msg('nobody\'s here');
  if (!!dom.d7m) dom.d7m.update();
  update_m();
  dom.d5_1_1m.update();
}

function rfeff(what: any) {
  let t = '';
  for (let a in what.sector) if (what.sector[a].effectors)
    for (let b in what.sector[a].effectors) t += '<span style="color:' + what.sector[a].effectors[b].e.c + ';font-size:1.2em">&nbsp' + what.sector[a].effectors[b].e.x + '<span>';
  if (what.effectors) for (let a in what.effectors) t += '<span style="color:' + what.effectors[a].e.c + ';font-size:1.2em">&nbsp' + what.effectors[a].e.x + '<span>';
  dom.d_lctte.innerHTML = t;
}

export function smove(where: any, lv?: any) {
  flags.busy = false; flags.work = false; global.wdwidx = 0;
  if (flags.loadstate) return;
  if (!flags.wkdis) { flags.wkdis = true; if (lv !== false) giveSkExp(skl.walk, .25); setTimeout(() => { flags.wkdis = false }, 500) }
  you.eqp[6].dp = you.eqp[6].dp - .08 < 0 ? 0 : you.eqp[6].dp - .08;
  let flg = false;
  let und = []
  for (let c in combat.current_l.sector) {
    for (let a in where.sector) {
      for (let b in where.sector[a].group)
        if (where.sector[a].group[b] === combat.current_l.id && where.sector[a].id === combat.current_l.sector[c].id) flg = true
    } if (flg === false) {
      combat.current_l.sector[c].onLeave();
      deactivateEffectors(combat.current_l.sector[c].effectors);
      sectors.splice(sectors.indexOf(combat.current_l.sector[c]))
    } else flg = false
  }
  combat.current_l.onLeave();
  deactivateEffectors(combat.current_l.effectors);
  flags.civil = true;
  flags.btl = false;
  combat.current_z = area.nwh;
  dom.d7m.update();
  stats.smovet++
  flags.inside = false;
  for (let a in where.sector) { if (where.sector[a].inside || where.inside) flags.inside = true }
  clr_chs();
  activateEffectors(where.effectors);
  where.sl();
  combat.current_l = where;
  for (let a in sectors) sectors[a].onMove();
  global.current_a.deactivate();
  global.current_a = act.default;
  dom.ct_bt3.style.backgroundColor = 'inherit';
  for (let a in combat.current_l.sector) if (!scanbyid(sectors, combat.current_l.sector[a].id)) { sectors.push(combat.current_l.sector[a]); combat.current_l.sector[a].onEnter(); activateEffectors(combat.current_l.sector[a].effectors) }
  combat.current_l.onEnter();
  rfeff(combat.current_l)
  if (flags.btl === false) {
    combat.current_m = creature.default;
    combat.current_m.eff = [];
    empty(dom.d101m);
    dom.d5_1_1m.update();
    update_m();
  }
}
