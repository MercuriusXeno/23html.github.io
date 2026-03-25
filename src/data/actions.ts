import { act, global, dom, effect, skl, timers, flags, combat, } from '../state';
import type { Player } from '../types';
import { findbyid, select } from '../utils';
import { canScout } from '../game/exploration';
import { giveExp, giveSkExp } from '../game/progression';
import { cansee } from '../game/utils-game';
import { msg } from '../ui/messages';
import { giveEff, removeEff } from '../ui/effects';
import { deactivateAct } from '../ui/panels';

// ==========================================================================
// Action constructor + instances
// ==========================================================================

function Action(this: any, cfg?: any) {
  this.name = 'dummy';
  this.desc = 'dummy';
  this.id = 0;
  this.type = 1;
  this.data = {};
  this.have = false;
  this.active = false;
  this.cond = function () { return true }
  this.use = function (_player: Player) { }
  this.activate = function (_player: Player) { }
  this.deactivate = function (_player: Player) { }
  if (cfg) for (let k in cfg) this[k] = cfg[k];
// @ts-ignore: constructor function
}; act.default = new Action(); global.current_a = act.default;

//tendon transformation scripture
//third inner cultivation
//heavenly dragon arts
//eff iron determination / golden rule / wisdom of crisis
//arhat/deep sitting arhat/raised bowl arhat/raised pagoda arhat/meditating arhat/overseas arhat/elephant riding arhat/taming tiger arhat/taming dragon arhat/

// @ts-ignore: constructor function
act.demo = new Action({
  id: 1, name: 'Run',
  desc: function () { return 'Run within this area to improve your physique' + dom.dseparator + '<span style="color:pink">Exp +0.5/s</span><br><span style="color:skyblue">Trains Walking</span><br><span style="color:crimson">Energy Consumption +0.1\/s</span>'; },
  cond: function (l: any) {
    if (!flags.btl && flags.civil && !flags.inside && !flags.sleepmode && !flags.rdng && !flags.isshop && !flags.work) return true;
    else { if (l !== false) msg('This isn\'t the best place to run around', 'red'); return false }
  },
  use: function (player: Player) {
    giveExp(.5, true, true);
    if (player.sat > 0) giveSkExp(skl.walk, 1.5);
    else giveSkExp(skl.walk, .5);
    player.eqp[6].dp = player.eqp[6].dp - .005 < 0 ? 0 : player.eqp[6].dp - .005;
  },
  activate: function (this: any, player: Player) {
    msg('You start running', 'orange');
    this.active = true;
    player.mods.satiationDrainRate += .1 * player.mods.runningEnergyCost;
    player.mods.stardustParticleSpawn += .5;
    clearInterval(timers.actm);
    giveEff(player, effect.run);
    timers.actm = setInterval(() => {
      this.use(player);
    }, 1000);
  },
  deactivate: function (this: any, player: Player) { msg('You stop', 'skyblue'); clearInterval(timers.actm); this.active = false; removeEff(effect.run); player.mods.satiationDrainRate -= .1 * player.mods.runningEnergyCost; player.mods.stardustParticleSpawn -= .5; }
});

// @ts-ignore: constructor function
act.scout = new Action({
  id: 2, name: 'Investigate',
  desc: function () { return 'Thoroughly examine current area in search for hidden passages, treasure, secrets or anything of interest' },
  cond: function (l: any) {
    if (flags.isdark && !cansee()) { return false }
    if (!flags.btl && flags.civil && !flags.sleepmode && !flags.rdng) return true;
    else { if (l !== false) msg('You\'re too occupied with something else', 'red'); return false }
  },
  activate: function (this: any, player: Player) {
    msg('You begin to look around', 'springgreen');
    this.active = true;
    clearInterval(timers.actm);
    giveEff(player, effect.scout);
    let t = 2;
    for (let a in combat.currentLocation.sector) { let m = canScout((combat.currentLocation.sector as any)[a]); if (m === 1) t = m; }
    if (canScout(combat.currentLocation) === 1 || t === 1) msg('You sense something', 'white')
    timers.actm = setInterval(() => {
      this.use(player);
    }, 1000);
  },
  use: function (this: any) {
    if (flags.isdark && !cansee()) { deactivateAct(this); msg('You can\'t see anything', 'grey'); return }
    let a1 = canScout(combat.currentLocation);
    let a2c = []
    for (let a in combat.currentLocation.sector) a2c.push(canScout((combat.currentLocation.sector as any)[a]));
    let a2 = 3;
    for (let a in a2c) if (a2c[a] !== 3) { if (a2c[a] === 1) { a2 = 1; break } else a2 = 2 }
    if (a1 === 1) combat.currentLocation.onScout();
    if (a2 === 1) { for (let a in combat.currentLocation.sector) if (canScout((combat.currentLocation.sector as any)[a]) === 1) (combat.currentLocation.sector as any)[a].onScout(); }
    if (a1 === 3 && a2 === 3) {
      msg('There doesn\'t seem to be anything of interest around..', 'lightgrey');
      deactivateAct(this)
    } else if (a1 >= 2 && a2 >= 2) {
      msg('You have already explored this area', 'lightgrey');
      deactivateAct(this);
    }
  },
  deactivate: function (this: any) { msg('You stop', 'skyblue'); clearInterval(timers.actm); this.active = false; removeEff(effect.scout); }
});

// @ts-ignore: constructor function
act.demo2 = new Action({
  id: -3, name: 'Selfharm', type: 2,
  desc: function () { return 'Injure yourself' },
  use: function (player: Player) {
    let f = findbyid(player.eff, effect.bled.id);
    if (!f) { msg('You ' + select(['stab', 'slash']) + ' your ' + select(['hand', 'chest', 'leg', 'palm', 'arm', 'foot']), 'red'); } else msg('You\'re already injured', 'orange');
    giveEff(player, effect.bled, 10, 1);
  }
});
