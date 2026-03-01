import { DAY, WEEK } from '../constants';
import { random } from '../random';
import { empty } from '../dom-utils';
import { dom, global, you, time, timers, furn, plans, sectors, data, gameText, flags, stats, combat, } from '../state';
const { skl, vendor, effect, item } = data;
import { wManager, getDay, timeDisp, getLunarPhase, getHour, getSeason, wdrseason } from './weather';
import { runEffectors } from '../game/movement';
import { giveSkExp } from '../game/progression';
import { giveItem } from '../game/inventory';
import { fght } from '../game/combat';
import { msg } from '../ui/messages';
import { addDesc } from '../ui/descriptions';

    export function ontick() {
      stats.tick++;
      time.minute += global.timescale;
      wManager();
      for (let a in plans[0]) plans[0][a].f();
      dom.d_time.innerHTML = '<small>' + getDay(flags.tmmode || 2) + '</small> ' + timeDisp(time);
      //stats.seed1=(random()*7e+7<<7)%7&7
      combat.current_l.onStay(you);
      runEffectors(combat.current_l.effectors)
      for (let a in sectors) { sectors[a].onStay(you); runEffectors(sectors[a].effectors) }
      giveSkExp(skl.aba, .004);
      let timeh = (time.minute / DAY) << 0;
      if (global.timehold !== timeh) {
        global.timehold = timeh; //proc when day passes
        for (let a in plans[1]) plans[1][a].f();
        for (let vnd in vendor) vendor[vnd].onDayPass();
        empty(dom.d_moon);
        dom.d_moon.innerHTML = gameText.lunarp[getLunarPhase()][0];
        addDesc(dom.d_moon, null, 2, 'Lunar Phase', gameText.lunarp[getLunarPhase()][1])
        wdrseason(flags.ssngaijin);
        if (getSeason() === 4) flags.iscold = true;
        else flags.iscold = false;
        global.offline_evil_index += .00008
        /////////////////////////////////
        let timew = (time.minute / WEEK) << 0;
        if (global.timewold !== timew) {
          global.timewold = timew; //proc when week passes
          for (let a in plans[2]) plans[2][a].f();
        }
      }
      let h = getHour();
      if (h > 5 && h < 22) { flags.isday = true; dom.d_moon.style.display = 'none' } else { if (flags.inside === false && random() < .00002 * you.mods.stdstps) { msg('A star particle landed on you!', 'gold', null, null, 'darkblue'); giveItem(item.stdst) } flags.isday = false; dom.d_moon.style.display = '' }
      for (let g = 0; g < you.eff.length; g++) if (you.eff[g].type === 3 || you.eff[g].type === 5 || you.eff[g].type === 6) you.eff[g].use(you, you.eff[g].y, you.eff[g].z);
      for (let g = 0; g < combat.current_m.eff.length; g++) if (combat.current_m.eff[g].type === 3 || combat.current_m.eff[g].type === 5 || combat.current_m.eff[g].type === 6) combat.current_m.eff[g].use(you, combat.current_m.eff[g].y, combat.current_m.eff[g].z);
      // @ts-ignore fght() called immediately; setTimeout with void handler is intentional (no-op timer)
      if (flags.btl === true) timers.btl = setTimeout(fght(you, combat.current_m), 1000 / global.fps);
      else giveSkExp(skl.mdt, .0065 * (1 + skl.ptnc.lvl * .15) * (effect.incsk.active === true ? 2 : 1))
      for (let obj in furn) furn[obj].use();
      //for(let q in qsts) qsts[q].tracker();
      if (you.sat > 0) {
        let lose = you.mods.sdrate
        if (flags.iswet === true) lose *= (3 / (1 + (skl.abw.lvl * .03)))
        if (flags.iscold === true) lose += effect.cold.duration / 1000 / (1 + skl.coldr.lvl * .05);
        you.sat -= lose
      } else giveSkExp(skl.fmn, .1);
      if (flags.sleepmode) stats.timeslp += global.timescale;
      if (random() < .00000001) { let au = new Audio("laugh6.wav"); au.play() }
      dom.d5_3_1.update();
    }
