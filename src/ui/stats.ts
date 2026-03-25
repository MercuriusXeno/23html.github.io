import { format3 } from '../utils';
import { dom, global, you, gameText, combat, } from '../state';

    export function updateStatDisplay() {
      dom.d4_1.innerHTML = 'STR: ' + Math.round(you.str_display);
      dom.d4_2.innerHTML = 'AGL: ' + Math.round(you.agl_display);
      dom.d4_3.innerHTML = 'INT: ' + Math.round(you.int_display);
      dom.d4_4.innerHTML = 'SPD: ' + you.spd;
    }

    export function updateCombatDisplay() {
      dom.d5_1_1m.innerHTML = 'hp: ' + format3(combat.currentMonster.hp.toString()) + '/' + format3(combat.currentMonster.hpmax.toString());
      dom.d5_1m.style.width = 100 * combat.currentMonster.hp / combat.currentMonster.hpmax + '%';
      dom.hit_c();
      dom.d5_3_1.update();
      dom.d5_1_1.update();
    }

    export function updateMonsterDisplay() {
      dom.d2m.innerHTML = combat.currentMonster.name;
      let mtp = gameText.mtp[combat.currentMonster.type];
      if (combat.currentMonster.id >= 1) mtp += (combat.currentMonster.sex as any) === true ? ' ♂' : ' ♀';
      dom.d3m.innerHTML = ' lvl:' + combat.currentMonster.lvl + ' \'' + mtp + '\'';
      dom.d4_1m.innerHTML = 'STR: ' + Math.round(combat.currentMonster.str);
      dom.d4_2m.innerHTML = 'AGL: ' + Math.round(combat.currentMonster.agl);
      dom.d4_3m.innerHTML = 'INT: ' + Math.round(combat.currentMonster.int);
      dom.d4_4m.innerHTML = 'SPD: ' + combat.currentMonster.spd;
      dom.d9m.update();
    }

    export function updateWealthDisplay() {
      dom.mn_1.innerHTML = '㊧' + (you.wealth / 100000000 << 0);
      dom.mn_2.innerHTML = '●' + (you.wealth / 10000 % 10000 << 0);
      dom.mn_3.innerHTML = '●' + (you.wealth / 100 % 100 << 0);
      dom.mn_4.innerHTML = '●' + (you.wealth % 100 << 0);
    }
