import { format3 } from '../utils';
import { dom, global, you, gameText, combat, } from '../state';

    export function update_db() {
      dom.d4_1.innerHTML = 'STR: ' + Math.round(you.str_d);
      dom.d4_2.innerHTML = 'AGL: ' + Math.round(you.agl_d);
      dom.d4_3.innerHTML = 'INT: ' + Math.round(you.int_d);
      dom.d4_4.innerHTML = 'SPD: ' + you.spd;
    }

    export function update_d() {
      dom.d5_1_1m.innerHTML = 'hp: ' + format3(combat.current_m.hp.toString()) + '/' + format3(combat.current_m.hpmax.toString());
      dom.d5_1m.style.width = 100 * combat.current_m.hp / combat.current_m.hpmax + '%';
      dom.hit_c();
      dom.d5_3_1.update();
      dom.d5_1_1.update();
    }

    export function update_m() {
      dom.d2m.innerHTML = combat.current_m.name;
      let mtp = gameText.mtp[combat.current_m.type];
      if (combat.current_m.id >= 1) mtp += (combat.current_m.sex as any) === true ? ' ♂' : ' ♀';
      dom.d3m.innerHTML = ' lvl:' + combat.current_m.lvl + ' \'' + mtp + '\'';
      dom.d4_1m.innerHTML = 'STR: ' + Math.round(combat.current_m.str);
      dom.d4_2m.innerHTML = 'AGL: ' + Math.round(combat.current_m.agl);
      dom.d4_3m.innerHTML = 'INT: ' + Math.round(combat.current_m.int);
      dom.d4_4m.innerHTML = 'SPD: ' + combat.current_m.spd;
      dom.d9m.update();
    }

    export function m_update() {
      dom.mn_1.innerHTML = '㊧' + (you.wealth / 100000000 << 0);
      dom.mn_2.innerHTML = '●' + (you.wealth / 10000 % 10000 << 0);
      dom.mn_3.innerHTML = '●' + (you.wealth / 100 % 100 << 0);
      dom.mn_4.innerHTML = '●' + (you.wealth % 100 << 0);
    }
