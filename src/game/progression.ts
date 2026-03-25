import type { Action, Combatant, Recipe, Skill, Title } from '../types';
import { randf, rand } from '../random';
import { col, scanbyid } from '../utils';
import { empty } from '../dom-utils';
import { dom, global, settings, you, acts, data, flags, stats, } from '../state';
const { skl: sklState, ttl } = data;
import { msg, msg_add } from '../ui/messages';
import { updateCombatDisplay } from '../ui/stats';
import { rsort } from '../ui/inventory';
import { renderAct } from '../ui/panels';
import { formatw } from './utils-game';

    export function lvlup(combatant: Combatant, levels?: number) {
      if (levels === 0) {
        combatant.hp = combatant.hp_base;
        combatant.str = combatant.str_base;
        combatant.agl = combatant.agl_base;
        combatant.spd = combatant.spd_base;
      } else {
        levels = levels || 1
        combatant.lvl += levels;
        let sb = randf(levels * combatant.statPotential[1], 2 * levels * combatant.statPotential[1]);
        combatant.str_base += sb;
        let sa = randf(levels * combatant.statPotential[2], 2 * levels * combatant.statPotential[2]);
        combatant.agl_base += sa;
        let si = randf(levels * combatant.statPotential[3], 2 * levels * combatant.statPotential[3]);
        combatant.int_base += si;
        let hpp;
        if (combatant.id === you.id) hpp = Math.round(rand(1.4 * Math.log(combatant.lvl) * levels * combatant.statPotential[0], 1.8 * combatant.lvl * levels * combatant.statPotential[0]));
        else hpp = Math.round(rand(1.8 * Math.log(combatant.lvl) * levels * combatant.statPotential[0], 2.2 * combatant.lvl * levels * combatant.statPotential[0]));
        combatant.hp_base += hpp;
        combatant.hpmax += hpp;
        combatant.hp += hpp;
        if (combatant.id !== you.id) combatant.hp = combatant.hpmax = combatant.hp_base;
        if (combatant.id != you.id) combatant.exp = combatant.exp * (1 + levels / 5) + 1 << 0;
        else {
          dom.d3.update();
          msg("Leveled Up " + you.lvl, 'orange');
          msg('STR +' + Math.round(sb), 'darkturquoise');
          msg_add(' | AGL +' + Math.round(sa), 'darkturquoise');
          msg_add(' | INT +' + Math.round(si), 'darkturquoise');
          msg_add(' | HP +' + hpp, 'darkturquoise');
          you.expnext_t = you.expnext();
          if (you.eqp[0].id === 10000) { you.eqp[0].cls[2] = you.lvl / 4 << 0; you.eqp[0].aff[0] = you.lvl / 5 << 0; you.eqp[0].ctype = 2 }
          if (stats.deathTotal < 1 && you.lvl >= 20) giveTitle(ttl.ndthextr)
        }
      } combatant.stat_r(); updateCombatDisplay();
    }

    export function giveExp(exp: number, raw?: boolean, gift?: boolean, battleShow?: boolean) {
      if (!raw) exp = Math.round((exp * you.exp_t * (0.4 + you.efficiency() * 0.6))) - (you.lvl - 1);
      exp = exp <= 0 ? 1 : exp;
      if (!battleShow) { if (flags.monsterBattleHide === false) if (!gift) { msg('EXP: +' + formatw(exp), 'hotpink'); stats.expTotal += exp } } else { msg('EXP: +' + formatw(exp), 'hotpink'); stats.expTotal += exp }
      if (you.exp + exp < you.expnext_t) you.exp += exp;
      else {
        let extra = (you.exp + exp) - you.expnext_t;
        you.exp = 0;
        lvlup(you);
        giveExp(extra, true, true, false);
      }
      dom.d5_2_1.update();
    }

    export function giveSkExp(skl: Skill, exp: number, raw?: boolean) {
      exp = raw === false ? exp : exp * skl.p; //skl.lastupd = time.minute+2;
      if (skl.exp + exp < skl.expnext_t) skl.exp += exp;
      else {
        let extra = (skl.exp + exp) - skl.expnext_t;
        skl.exp = 0;
        skl.lvl++;
        stats.skillLevelsGained++;
        if (!scanbyid(you.skls, skl.id)) { you.skls.push(skl); msg('<span style="text-shadow:cyan 0px 0px 2px">New Skill Unlocked! <span style="text-shadow:red 0px 0px 2px;color:orange">"' + (!!skl.bname ? skl.bname : skl.name) + '"</span></span>', 'aqua', skl, 6); if (!flags.sklu) { dom.ct_bt2.innerHTML = 'skills'; flags.sklu = true } }
        else { msg('Skill <span style="color:tomato">\'' + (!!skl.bname ? skl.bname : skl.name) + '\'</span> Leveled Up: ' + skl.lvl, 'deepskyblue', skl, 6); } skl.onLevel(you);
        skl.expnext_t = skl.expnext();
        if (!!skl.mlstn) for (let ss = 0; ss < skl.mlstn.length; ss++) if (skl.mlstn[ss].lv === skl.lvl && skl.mlstn[ss].g === false) { msg("NEW PERK UNLOCKED " + '<span style="color:tomato">("' + skl.name + '")<span style="color:orange">lvl: ' + skl.mlstn[ss].lv + '</span></span>', 'lime', { x: skl.name, y: 'Perk lvl ' + skl.mlstn[ss].lv + ': <span style="color:yellow">' + skl.mlstn[ss].p + '</span>' }, 7); skl.mlstn[ss].f(you); skl.mlstn[ss].g = true };
        giveSkExp(skl, extra, false);
      } skl.onGive(you, exp);
    }

    export function giveTitle(title: Title, silent?: boolean) {
      if (title.have === false) {
        global.titles.push(title);
        if (title.id !== 0) global.titlesEarned.push(title);
        you.title = title;
        title.have = true;
        if (!title.tget && title.talent) { title.talent(you); title.tget = true }
        title.onGet(you);
        for (let x in global.ttlschk) global.ttlschk[x]();
        if (!silent) { msg('New Title Earned! ' + col('"' + title.name + '"', 'orange'), 'cyan', title, 5); dom.d3.update(); }
      } else return;
    }

    export function giveRcp(rcp: Recipe) {
      if (!flags.asbu) { flags.asbu = true; dom.ct_bt1.innerHTML = 'assemble' }
      if (rcp.have === false) {
        global.recipesDiscovered.push(rcp);
        rcp.have = true;
        if (global.lastWindowOpen === 1) rsort(settings.recipeSortMode)
        msg('New blueprint unlocked: ', 'cyan');
        msg_add('"' + rcp.name + '"', 'orange');
        return 1;
      } else return 0;
    }

    export function giveCrExp(skl: Skill, amount: number, lvl?: number) {
      if (!lvl || skl.lvl < lvl) giveSkExp(skl, amount);
    }

    export function giveAction(action: Action) {
      if (action.have === false) {
        if (!flags.actsu) { flags.actsu = true; dom.ct_bt3.innerHTML = 'actions' }
        msg('You learned a new action: <span style="color:tomato">"' + action.name + '"</span>', 'lime', action, 9);
        action.have = true;
        acts.push(action);
        if (acts.length >= 1 && dom.acccon) { empty(dom.acccon); for (let a in acts) renderAct(acts[a]) }
      }
    }
