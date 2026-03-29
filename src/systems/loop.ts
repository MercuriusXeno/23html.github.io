import { DAY, WEEK } from '../constants';
import { random } from '../random';
import { global, settings, you, time, timers, furn, plans, sectors, data, gameText, flags, stats, combat, } from '../state';
const { skl, vendor, effect, item } = data;
import { wManager, getDay, timeDisp, getLunarPhase, getHour, getSeason, wdrseason } from './weather';
import { runEffectors } from '../game/movement';
import { giveSkExp } from '../game/progression';
import { giveItem } from '../game/inventory';
import { fght } from '../game/combat';
import { emit } from '../events';

    export function ontick() {
      stats.tick++;
      time.minute += settings.timescale;
      wManager();
      for (let a in plans[0]) plans[0][a].f();
      emit('time:update', '<small>' + getDay(flags.timeMode || 2) + '</small> ' + timeDisp(time));
      //stats.seed1=(random()*7e+7<<7)%7&7
      combat.currentLocation.onStay(you);
      runEffectors(combat.currentLocation.effectors as any)
      for (let a in sectors) { sectors[a].onStay(you); runEffectors(sectors[a].effectors as any) }
      giveSkExp(skl.aba, .004);
      let timeh = (time.minute / DAY) << 0;
      if (global.timehold !== timeh) {
        global.timehold = timeh; //proc when day passes
        for (let a in plans[1]) plans[1][a].f();
        for (let vnd in vendor) vendor[vnd].onDayPass();
        emit('moon:update', gameText.lunarp[getLunarPhase()]);
        wdrseason(flags.seasonGaijin);
        if (getSeason() === 4) flags.iscold = true;
        else flags.iscold = false;
        global.offlineEvilIndex += .00008
        /////////////////////////////////
        let timew = (time.minute / WEEK) << 0;
        if (global.timewold !== timew) {
          global.timewold = timew; //proc when week passes
          for (let a in plans[2]) plans[2][a].f();
        }
      }
      let h = getHour();
      if (h > 5 && h < 22) { flags.isday = true; emit('moon:visibility', false) } else { if (flags.inside === false && random() < .00002 * you.mods.stardustParticleSpawn) { emit('msg', 'A star particle landed on you!', 'gold', null, null, 'darkblue'); giveItem(item.stdst) } flags.isday = false; emit('moon:visibility', true) }
      for (let g = 0; g < you.eff.length; g++) if (you.eff[g].type === 3 || you.eff[g].type === 5 || you.eff[g].type === 6) you.eff[g].use(you, you.eff[g].y, you.eff[g].z);
      for (let g = 0; g < combat.currentMonster.eff.length; g++) if (combat.currentMonster.eff[g].type === 3 || combat.currentMonster.eff[g].type === 5 || combat.currentMonster.eff[g].type === 6) combat.currentMonster.eff[g].use(you, combat.currentMonster.eff[g].y, combat.currentMonster.eff[g].z);
      // @ts-ignore fght() called immediately; setTimeout with void handler is intentional (no-op timer)
      if (flags.btl === true) timers.btl = setTimeout(fght(you, combat.currentMonster), 1000 / settings.fps);
      else giveSkExp(skl.mdt, .0065 * (1 + skl.ptnc.lvl * .15) * (effect.incsk.active === true ? 2 : 1))
      for (let obj in furn) furn[obj].use();
      //for(let q in qsts) qsts[q].tracker();
      if (you.sat > 0) {
        let lose = you.mods.satiationDrainRate
        if (flags.iswet === true) lose *= (3 / (1 + (skl.abw.lvl * .03)))
        if (flags.iscold === true) lose += effect.cold.duration / 1000 / (1 + skl.coldr.lvl * .05);
        you.sat -= lose
      } else giveSkExp(skl.fmn, .1);
      if (flags.sleepmode) stats.timeSlept += settings.timescale;
      if (random() < .00000001) { let au = new Audio("laugh6.wav"); au.play() }
      emit('satiation:update');
    }
