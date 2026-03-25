import type { Combatant, Creature, Ability } from '../types';
import { random, rand, randf } from '../random';
import { select } from '../utils';
import { addElement } from '../dom-utils';
import { dom, global, settings, you, timers, time, data, flags, stats, combat, } from '../state';
const { abl, skl, effect, creature } = data;
import { msg, msg_add } from '../ui/messages';
import { updateCombatDisplay } from '../ui/stats';
import { giveSkExp } from './progression';
import { giveItem } from './inventory';
import { cansee, formatw } from './utils-game';

function allbuff(who: Combatant) {
  who.stat_r();
  for (let g in who.eff) if (who.eff[g].type === 1) who.eff[g].use(you, who.eff[g].y, who.eff[g].z);
  if (who.id === you.id) {
    let dm = skl.fgt.use();
    if (you.eqp[0].twoh === true) dm += skl.twoh.use();
    you.str += dm;
    you.int += dm;
    usePlayerWeaponSkill();
  }
}

export function fght(att: Combatant, def: Combatant) {
  /*if(flags.btlinterrupt===true){
    msg('battle interrupted');
    if(combat.currentZone.size>0) {area_init(combat.currentZone);combat.currentZone.size--;}else if(combat.currentZone.size===-1)area_init(combat.currentZone);
    else {msg('Area cleared','orange');combat.currentZone.onEnd();flags.civil=true;flags.btl=false;};
    dom.d7m.update();
    flags.btlinterrupt=false;
    return;
  }*/
  if (!att.alive || !def.alive) {
    return;
  }
  if (flags.smkactv) { flags.smkactv = false; return; }
  att.stat_r();
  def.stat_r();
  for (let g in att.eff) if (att.eff[g].type === 1) att.eff[g].use(you, att.eff[g].y, att.eff[g].z);
  for (let g in def.eff) if (def.eff[g].type === 1) def.eff[g].use(you, def.eff[g].y, def.eff[g].z);
  if (att.spd > 0 && def.spd > 0) {
    global.speedLevel += Math.abs(att.spd - def.spd);
  } else {
    global.speedLevel = Math.abs(att.spd - def.spd);
  }
  let inn, sc;
  if (att.spd >= def.spd || att.spd <= 0) { inn = att; sc = def; } else { inn = def; sc = att };
  global.miss = 0;
  let isyouinn = inn.id === you.id;
  //if(isyouinn===false){if(random()<.9){console.log('stealth active'); inn=att; sc=def}}
  if (inn.spd > 0) {
    if (global.speedLevel / sc.spd >= 2) {
      let acc_dmg = 0;
      let hts = 0;
      flags.multih = true;
      for (let ii = 0; ii < Math.ceil(global.speedLevel / sc.spd); ii++) {
        hts++;
        acc_dmg += inn.battle_ai!(inn, sc);
        if (sc.hp <= 0) break;
      }
      flags.multih = false;
      if (att.id === you.id && acc_dmg >= sc.hpmax) stats.oneShotKills++;
      if (flags.monsterBattleHide === false && (hts - global.miss) > 0) {
        if (hts === 1) printHitMessage(inn.name, acc_dmg, !isyouinn);
        else
          printMultihitMessage(hts, inn.name, acc_dmg, !isyouinn);
      }
      else if (flags.monsterBattleHide === false) msg(inn.name + ' missed', 'grey');
      if (sc.hp <= 0 && sc.alive === true) { combat.attackDamageFromYou = [3, combat.attackDamageFromYouDamageType]; sc.onDeath(inn); sc.onDeathE(inn); }
      global.speedLevel = global.speedLevel % sc.spd;
    } else {
      doSingleAttack(inn, sc, isyouinn);
    }
  }
  if (!sc.alive) {
    you.stat_r();
    return;
  }
  timers.btl2 = setTimeout(function () {
    if (flags.btl === true) {
      doSingleAttack(sc, inn, !isyouinn);
      you.stat_r();
    }
  }, 500 / settings.fps);
}

export function attack(att: Combatant, def: Combatant, atk?: Ability, power?: number) {
  if (!flags.btl) return
  allbuff(att);
  allbuff(def);
  atk = atk || abl.default;
  let isyou = att.id === you.id;
  global.mabl = atk;
  let dmg: any;
  let hit: any;
  let dk: any = false
  let a = 2 + rand(4);
  if (isyou === true) {
    wpnhitstt();
    hit = hit_calc(1);
    giveSkExp(skl.fgt, def.rnk);
    dk = flags.isdark && !cansee();
    if (dk) hit *= .3 + skl.ntst.lvl * .07;
  } else hit = hit_calc(2);
  global.target = you.eqp[a];
  global.t_n = a;
  if (rand(100) < hit) {
    global.target_g = a;
    if (isyou === true) {
      let t = you.eqp[0].dp > 0 ? 1 : .5;
      switch (you.eqp[0].wtype) {
        case 0: giveSkExp(skl.unc, t);
          break;
        case 1: giveSkExp(skl.srdc, t);
          break;
        case 2: giveSkExp(skl.axc, t);
          break;
        case 3: giveSkExp(skl.knfc, t);
          break;
        case 4: giveSkExp(skl.plrmc, t);
          break;
        case 5: giveSkExp(skl.hmrc, t);
          break;
        case 6: giveSkExp(skl.stfc, t);
          break;
      }
      if (dk) giveSkExp(skl.ntst, .1);
      if (you.mods.toSteal > 0) {
        let itm = select(def.drop);
        if (random() < (itm.chance + (itm.chance / 100 * you.luck)) * .01 * skl.stel.use()) { giveItem(itm.item); giveSkExp(skl.stel, 1 / itm.chance * 10) } else giveSkExp(skl.stel, 1);
      }
    } else {
      if (you.eqp[1].id !== 10000 && !you.eqp[0].twoh) giveSkExp(skl.shdc, .2);
      you.stat_r();
      if (you.mods.dodgeModifier !== 0) if (random() < you.mods.dodgeModifier) { global.miss++; if (flags.monsterBattleHide === false && (!flags.multih && flags.monsterBattleHide === false)) msg(att.name + ' missed', 'grey'); flags.missed = true; giveSkExp(skl.evas, .5); return 0 }
    }
    dmg = Math.round(atk.f(att, def, power));
    def.hp -= dmg;
    flags.missed = false;
    if (flags.monsterBattleHide === false && (!flags.multih && flags.monsterBattleHide === false)) printHitMessage(att.name, dmg, att.id === you.id ? false : true);
    if (isyou === true) {
      dom.d8_2.innerHTML = 'Critical chance: ' + (Math.round(you.mods.critChanceFlat * 1000 + ((you.critChance * (2 - (you.sat / you.satmax + you.mods.satiationBonus) * 2) + you.critChance) * (you.luck / 25 + 1) + skl.seye.use()) * 1000) / 10) + '%'; if (you.eqp[0].id != 10000) you.eqp[0].dp > 0 ? you.eqp[0].dp -= .008 : you.eqp[0].dp = 0; stats.damageDealtTotal += dmg;
      if (flags.effectShake === true) {
        dom.d1m.style.left = parseInt(global.special_x) + rand(-3, 3) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + rand(-3, 3) + 'px';
        setTimeout(() => { dom.d1m.style.left = parseInt(global.special_x) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + 'px'; }, 60);
      }
    }
    else { if (global.target.id !== 10000) global.target.dp > 0 ? global.target.dp -= .008 : global.target.dp = 0; if (you.eqp[1].id !== 10000) you.eqp[1].dp > 0 ? you.eqp[1].dp -= .008 : you.eqp[1].dp = 0; if (dmg > 0) giveSkExp(skl.painr, 1); if (global.target.id === 10000 && dmg > 0) giveSkExp(skl.tghs, dmg * .05); stats.damageReceivedTotal += dmg }
  } else {
    global.miss++;
    stats.missesTotal++;
    ;
    if (flags.monsterBattleHide === false && (!flags.multih && flags.monsterBattleHide === false)) msg(att.name + ' missed', 'grey');
    flags.missed = true;
    if (dk) giveSkExp(skl.ntst, .01);
    if (!isyou) stats.dodgesTotal++;
  } updateCombatDisplay();
  if (!flags.multih) { if (isyou && dmg >= def.hpmax) stats.oneShotKills++; if (def.hp <= 0 && def.alive === true) { combat.attackDamageFromYou = [3, combat.attackDamageFromYouDamageType]; def.onDeath(att); def.onDeathE(att); } }
  return dmg || 0;
}

export function tattack(pow: number, type: number, e: number) {
  let dmg;
  let ddat = skl.thr.use();
  let m = combat.currentMonster;
  combat.attackDamageFromMonster[0] = type;
  let agl_bonus = 0;
  let spd = m.spd > 0 ? m.spd : 0;
  for (let i = 0; i < you.eqp.length; i++) agl_bonus += you.eqp[i].agl;
  let hit = ((you.agl + agl_bonus / 2) * you.efficiency()) / ((spd * 5 + m.agl)) * 130 + 5 + ddat.b;
  giveSkExp(skl.thr, e);
  giveSkExp(skl.fgt, skl.thr.lvl * 5 + 1);
  if (rand(100) < hit) {
    dmg = Math.round(((1 + you.str_base * .05) * (you.efficiency() + 1) * pow * (ddat.a + 1)) / 2);
    stats.damageDealtTotal += dmg;
    if (!flags.monsterBattleHide) msg('You hit ' + combat.currentMonster.name + ' for <span style="color:hotpink">' + dmg + '</span> damage', 'yellow');
    combat.currentMonster.hp -= dmg;
    if (m.hp <= 0 && m.alive === true) { m.onDeath(you); m.onDeathE(); } dom.d5_1_1m.update();
    if (flags.effectShake === true) {
      dom.d1m.style.left = parseInt(global.special_x) + rand(-3, 3) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + rand(-3, 3) + 'px';
      setTimeout(() => { dom.d1m.style.left = parseInt(global.special_x) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + 'px'; }, 60);
    }
  } else {
    if (flags.monsterBattleHide === false) msg(you.name + ' missed', 'grey');
  }
}

export function dmg_calc(att: Combatant, def: Combatant, atk: Ability) {
  let isyou = att.id === you.id;
  let atea: any = atk.aff || isyou ? att.eqp[0].atype : att.atype;
  let atcs: any = atk.class || isyou ? att.eqp[0].ctype : att.ctype;
  global.atype_d = atk.aff || att.atype;
  let ta = effect.tarnish.active === true ? .7 : (effect.prostasia.active === true ? 1.3 : 1);
  let eff = you.efficiency();
  let dmg = 0;
  let b = 1;
  if (atk.stt === 1) {
    if (isyou === true) {
      global.atype_d = atk.aff || you.eqp[0].atype; combat.attackDamageFromMonster = [atea, atcs, 0];
      let b = you.luck / 25 + 1;
      let unarmedDamage = 0;
      if (you.eqp[0].id === 10000) unarmedDamage = you.mods.unarmedDamage;
      dmg = (att.str * eff + (((att.eqp[0].str + unarmedDamage) * (att.eqp[0].dp / att.eqp[0].dpmax) * .9 + .1) * (att.eqp[0].id === 10000 ? 1 : ta))) * (100 + (att.eqp[0].aff[atea] * 10 + atk.affp * 10 + att.eqp[0].cls[atcs] * 10 + att.maff[combat.currentMonster.type] * 10 + att.aff[atea] * 10) * (att.eqp[0].id === 10000 ? 1 : ta)) / 100 - (def.str * (100 + def.aff[atea] * 5 + def.cls[atcs] * 5) / 100) + 1;
    } else {
      dmg = (att.str * (100 + att.eqp[0].aff[att.atype!] * 10 + atk.affp * 10 + att.eqp[0].cls[att.ctype!] * 10) / 100 - ((def.str * eff + (global.target.str * ((global.target.dp / global.target.dpmax) * .85 + .15) * ta)) * (100 + global.target.aff[att.atype!] * 5 * ta + global.target.cls[att.ctype!] * 5 * ta + you.caff[att.atype!] * 10 + you.combatMonsterAffinity[combat.currentMonster.type] * 10 + you.combatClass[att.ctype!] * 10) / 100 + ((you.eqp[1].str * (1 + skl.shdc.lvl / 20) * (you.eqp[1].dp / you.eqp[1].dpmax) * .6 + .4) * ta) / 2) * (100 - (you.eqp[1].aff[att.atype!] * 5 * (1 + skl.shdc.lvl / 20) + global.target.cls[att.ctype!] * 5 * (1 + skl.shdc.lvl / 20) * ta)) / 100);
      b = 1;
    }
  }
  else if (atk.stt === 2) {
    if (isyou === true) {
      global.atype_d = atk.aff || you.eqp[0].atype;
      let b = you.luck / 20 + 1;
      dmg = (att.int * eff + ((att.eqp[0].int * (att.eqp[0].dp / att.eqp[0].dpmax) * .9 + .1) * (att.eqp[0].id === 10000 ? 1 : ta))) * (100 + (att.eqp[0].aff[atea] * 10 + atk.affp * 10 + att.eqp[0].cls[atcs] * 10 + att.maff[combat.currentMonster.type] * 10 + att.aff[atea] * 10) * (att.eqp[0].id === 10000 ? 1 : ta)) / 100 - (def.int * (100 + def.aff[atea] * 5 + def.cls[atcs] * 5) / 100) + 1;
    } else {
      dmg = (att.int * (100 + att.eqp[0].aff[att.atype!] * 15 + atk.affp * 15 + att.eqp[0].cls[att.ctype!] * 5) / 100 - ((def.int * eff + (global.target.int * ((global.target.dp / global.target.dpmax) * .85 + .15) * ta)) * (100 + global.target.aff[att.atype!] * 5 * ta + global.target.cls[att.ctype!] * 5 * ta + you.caff[att.atype!] * 10 + you.combatMonsterAffinity[combat.currentMonster.type] * 10 + you.combatClass[att.ctype!] * 10) / 100 + ((you.eqp[1].int * (1 + skl.shdc.lvl / 20) * (you.eqp[1].dp / you.eqp[1].dpmax) * .6 + .4) * ta) / 2) * (100 - (you.eqp[1].aff[att.atype!] * 5 * (1 + skl.shdc.lvl / 20) + global.target.cls[att.ctype!] * 5 * (1 + skl.shdc.lvl / 20) * ta)) / 100);
      b = 1;
    }
  }
  let ran = random();
  let c = 0;
  if (isyou === true) c = skl.seye.use();
  let ctr_r = (att.critChance * (2 - (you.sat / you.satmax + you.mods.satiationBonus) * 2) + att.critChance) * b + c + you.mods.critChanceFlat;
  if (isyou === false && dmg > 0) {
    switch (global.atype_d) {
      case 1: giveSkExp(skl.aba, dmg * .01);
        break;
      case 2: giveSkExp(skl.abe, dmg * .01);
        break;
      case 3: giveSkExp(skl.abf, dmg * .01);
        break;
      case 4: giveSkExp(skl.abw, dmg * .01);
        break;
      case 5: giveSkExp(skl.abl, dmg * .01);
        break;
      case 6: giveSkExp(skl.abd, dmg * .01);
        break;
    }
    combat.attackDamageFromYouDamageType.a = atea;
    combat.attackDamageFromYouDamageType.c = atcs;
    combat.attackDamageFromYouDamageType.id = att.id
  }
  let pn = isyou === true ? 1 : 1 - skl.painr.use();
  dmg = dmg * def.res.ph * pn;
  if (ran < ctr_r) {
    let cpw = 1; let dmod = 1; let cbst = 1;
    if (isyou === true) {
      giveSkExp(skl.seye, 1); cpw = you.mods.critPower; cbst = 1 + skl.war.use();
      dom.d1m.style.left = parseInt(global.special_x) + rand(-3, 3) + 'px';
      dom.d1m.style.top = parseInt(global.special_y) + rand(-3, 3) + 'px';
      setTimeout(() => { dom.d1m.style.left = parseInt(global.special_x) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + 'px'; }, 60);
    } else {
      giveSkExp(skl.dngs, 1);
      let sk = skl.dngs.use();
      dmod = 1 - sk * (sk > 25 ? .01 : .02)
    }
    if (dmg <= 0) dmg = 0;
    let cdmg = dmg * randf(1.9 * cpw, 2.1 * cpw) * .5 * dmod * cbst;
    flags.criticalHit = true;
    return dmg + cdmg <= 1 ? rand(1, 5) : Math.ceil((dmg + cdmg) * att.damageMultiplier * randf(.9, 1.1)) + rand(1, 5);
  } else return dmg > 0 ? Math.ceil(dmg * att.damageMultiplier * randf(.9, 1.1)) : 0;
}

export function dumb(x: MouseEvent) {
  if (x) {
    let arr: any[] = [];
    for (let m = 0; m < 5; m++) {
      arr[m] = {} as any;
      arr[m].obj = addElement(document.body, 'span', null, 'floating-text');
      arr[m].obj.style.pointerEvents = 'none';
      arr[m].obj.innerHTML = select(['x', 'X', '*', '#', '$']);
      arr[m].obj.style.top = -55;
      arr[m].obj.style.left = -55;
      arr[m].posx = x.clientX;
      arr[m].posy = x.clientY;
      arr[m].accx = rand(-10, 10);
      arr[m].accy = rand(15, 25);
    }
    let t = 0;
    let g = setInterval(() => {
      t++;
      for (let m = 0; m < 5; m++) {
        arr[m].obj.style.top = arr[m].posy - (arr[m].accy - t) * t * .4;
        arr[m].obj.style.left = arr[m].posx + arr[m].accx * t * .5;
        arr[m].obj.style.opacity = (30 - t) / 30;
      }
      if (t === 30) {
        clearInterval(g);
        for (let m = 0; m < 5; m++) document.body.removeChild(arr[m].obj);
      }
    }, 20);
  }
}

export function hit_calc(tp: number) {
  if (tp === 1) {
    let agl_bonus = 0;
    let spd = combat.currentMonster.spd > 0 ? combat.currentMonster.spd : 0;
    for (let i = 0; i < you.eqp.length; i++) agl_bonus += you.eqp[i].agl;
    //return (200 + ((you.agl+agl_bonus)*you.efficiency()) - (combat.currentMonster.spd+combat.currentMonster.agl+100/(100*you.efficiency())*100));
    return ((you.agl + agl_bonus / 2) * you.efficiency()) / ((spd + combat.currentMonster.agl + combat.currentMonster.evasion)) * 130 + 5;
  }
  else if (tp === 2) {
    let agl_bonus = 0;
    let spd = you.spd > 0 ? you.spd : 0;
    for (let i = 0; i < you.eqp.length; i++) agl_bonus += you.eqp[i].agl;
    return combat.currentMonster.agl / ((spd + you.agl + agl_bonus / 2) * you.efficiency()) * 100 + 10 - skl.evas.lvl
    //return (210 + combat.currentMonster.agl - (you.spd+you.agl+100*(100*you.efficiency())/100));
  }
}

function wpnhitstt() {
  switch (you.eqp[0].wtype) {
    case 0: stats.masteryStatuses[0][0]++;
      break
    case 1: stats.masteryStatuses[1][0]++;
      break
    case 2: stats.masteryStatuses[2][0]++;
      break
    case 3: stats.masteryStatuses[3][0]++;
      break
    case 4: stats.masteryStatuses[4][0]++;
      break
    case 5: stats.masteryStatuses[5][0]++;
      break
    case 6: stats.masteryStatuses[6][0]++;
      break
    case 7: stats.masteryStatuses[7][0]++;
      break
  }
}

export function wpndiestt(killer: Combatant, me: Creature) {
  switch (killer.eqp[0].wtype) {
    case 0: stats.masteryStatuses[0][1]++;
      break
    case 1: stats.masteryStatuses[1][1]++;
      break
    case 2: stats.masteryStatuses[2][1]++;
      break
    case 3: stats.masteryStatuses[3][1]++;
      break
    case 4: stats.masteryStatuses[4][1]++;
      break
    case 5: stats.masteryStatuses[5][1]++;
      break
    case 6: stats.masteryStatuses[6][1]++;
      break
    case 7: stats.masteryStatuses[7][1]++;
      break
  }
  switch (me.type) {
    case 0: stats.masterySkillKills[0]++;
      break
    case 1: stats.masterySkillKills[1]++;
      break
    case 2: stats.masterySkillKills[2]++;
      break
    case 3: stats.masterySkillKills[3]++;
      break
    case 4: stats.masterySkillKills[4]++;
      break
    case 5: stats.masterySkillKills[5]++;
      break
  }
}

function usePlayerWeaponSkill() {
  switch (you.eqp[0].wtype) {
    case 0: skl.unc.use();
      break;
    case 1: skl.srdc.use();
      break;
    case 2: skl.axc.use();
      break;
    case 3: skl.knfc.use();
      break;
    case 4: skl.plrmc.use();
      break;
    case 5: skl.hmrc.use();
      break;
    case 6: skl.stfc.use();
      break;
  }
}

function printBodyPartHit(partNumber: number) {
  switch (partNumber) {
    case 2: msg_add(' (head)', 'orange');
      break;
    case 3: msg_add(' (body)', 'orange');
      break;
    case 4: msg_add(' (L hand)', 'orange');
      break;
    case 5: msg_add(' (R hand)', 'orange');
      break;
    case 6: msg_add(' (legs)', 'orange');
      break;
  }
}

function printCritIfCrit() {
  if (flags.criticalHit) { msg_add(' CRIT! ', 'yellow'); flags.criticalHit = false }
}

function printDamageNumber(ddmg: number) {
  let col;
  let bcol = '';
  let shd = '';
  switch (global.atype_d) {
    case 0: col = 'pink';
      break;
    case 1: col = 'lime';
      break;
    case 2: col = 'yellow';
      break;
    case 3: col = 'orange';
      bcol = 'crimson';
      break;
    case 4: col = 'cyan';
      break;
    case 5: col = 'lightgoldenrodyellow';
      shd = "gold 0px 0px 5px";
      break;
    case 6: col = 'thistle';
      shd = "blueviolet 0px 0px 5px";
      break;
  }
  if (ddmg > 9999) formatw(ddmg as any);
  msg_add(ddmg as any, col, bcol, shd);
}

function printHitMessage(attackerName: string, ddmg: number, targetsPlayer: boolean) {
  if (global.mabl.id === 0) msg(attackerName + (targetsPlayer === true ? global.mabl.atrg : global.mabl.btrg));
  else msg((targetsPlayer === true ? attackerName : '') + (targetsPlayer === true ? global.mabl.atrg : ('You ' + global.mabl.btrg)));
  printHitMessageResult(ddmg, targetsPlayer);
}

function printMultihitMessage(times: number, attackerName: string, acc_dmg: number, targetsPlayer: boolean) {
  msg(attackerName + ' -> x' + (times - global.miss) + '(<span style="color:lightgrey">' + times + '</span>) for ');
  printHitMessageResult(acc_dmg, targetsPlayer);
  if (time - global.miss > 0) printBodyPartHit(global.target_g)
}

function printHitMessageResult(ddmg: number, targetsPlayer: boolean) {
  printDamageNumber(ddmg);
  printCritIfCrit();
  if (targetsPlayer === true && !flags.missed) printBodyPartHit(global.t_n)
}

function doSingleAttack(attacker: Combatant, defender: Combatant, isPlayerAttacking: boolean) {
  if (isPlayerAttacking) {
    let dm = skl.fgt.use();
    if (you.eqp[0].twoh === true) dm += skl.twoh.use();
    you.str += dm;
    you.int += dm;
    usePlayerWeaponSkill();
  }
  attacker.battle_ai!(attacker, defender);
}
