import { act, global, dom, effect, skl, timers } from '../state';
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
  this.use = function (_player: any) { }
  this.activate = function (_player: any) { }
  this.deactivate = function (_player: any) { }
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
    if (!global.flags.btl && global.flags.civil && !global.flags.inside && !global.flags.sleepmode && !global.flags.rdng && !global.flags.isshop && !global.flags.work) return true;
    else { if (l !== false) msg('This isn\'t the best place to run around', 'red'); return false }
  },
  use: function (player: any) {
    giveExp(.5, true, true);
    if (player.sat > 0) giveSkExp(skl.walk, 1.5);
    else giveSkExp(skl.walk, .5);
    player.eqp[6].dp = player.eqp[6].dp - .005 < 0 ? 0 : player.eqp[6].dp - .005;
  },
  activate: function (this: any, player: any) {
    msg('You start running', 'orange');
    this.active = true;
    player.mods.sdrate += .1 * player.mods.runerg;
    player.mods.stdstps += .5;
    clearInterval(timers.actm);
    giveEff(player, effect.run);
    timers.actm = setInterval(() => {
      this.use(player);
    }, 1000);
  },
  deactivate: function (this: any, player: any) { msg('You stop', 'skyblue'); clearInterval(timers.actm); this.active = false; removeEff(effect.run); player.mods.sdrate -= .1 * player.mods.runerg; player.mods.stdstps -= .5; }
});

// @ts-ignore: constructor function
act.scout = new Action({
  id: 2, name: 'Investigate',
  desc: function () { return 'Thoroughly examine current area in search for hidden passages, treasure, secrets or anything of interest' },
  cond: function (l: any) {
    if (global.flags.isdark && !cansee()) { return false }
    if (!global.flags.btl && global.flags.civil && !global.flags.sleepmode && !global.flags.rdng) return true;
    else { if (l !== false) msg('You\'re too occupied with something else', 'red'); return false }
  },
  activate: function (this: any, player: any) {
    msg('You begin to look around', 'springgreen');
    this.active = true;
    clearInterval(timers.actm);
    giveEff(player, effect.scout);
    let t = 2;
    for (let a in global.current_l.sector) { let m = canScout(global.current_l.sector[a]); if (m === 1) t = m; }
    if (canScout(global.current_l) === 1 || t === 1) msg('You sense something', 'white')
    timers.actm = setInterval(() => {
      this.use(player);
    }, 1000);
  },
  use: function (this: any) {
    if (global.flags.isdark && !cansee()) { deactivateAct(this); msg('You can\'t see anything', 'grey'); return }
    let a1 = canScout(global.current_l);
    let a2c = []
    for (let a in global.current_l.sector) a2c.push(canScout(global.current_l.sector[a]));
    let a2 = 3;
    for (let a in a2c) if (a2c[a] !== 3) { if (a2c[a] === 1) { a2 = 1; break } else a2 = 2 }
    if (a1 === 1) global.current_l.onScout();
    if (a2 === 1) { for (let a in global.current_l.sector) if (canScout(global.current_l.sector[a]) === 1) global.current_l.sector[a].onScout(); }
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
  use: function (player: any) {
    let f = findbyid(player.eff, effect.bled.id);
    if (!f) { msg('You ' + select(['stab', 'slash']) + ' your ' + select(['hand', 'chest', 'leg', 'palm', 'arm', 'foot']), 'red'); } else msg('You\'re already injured', 'orange');
    giveEff(player, effect.bled, 10, 1);
  }
});
