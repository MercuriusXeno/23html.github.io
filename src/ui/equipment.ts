import type { Equipment } from '../types';
import { dom, global, settings, you, planner, data, gameText, flags } from '../state';
const { eqp } = data;
import { giveEff, removeEff } from './effects';
import { update_d } from './stats';
import { msg } from './messages';
import { isort } from './inventory';

    export function equip(gear: Equipment, opts?: { save?: boolean }) {
      if (!gear.data || !gear.data.uid) return;
      if (gear.data.uid === you.eqp[gear.slot - 1].data.uid) { unequip(gear); if (gear.twoh === true) { dom.d7_slot_2.innerHTML = 'Shield'; dom.d7_slot_2.style.color = 'grey' }; isort(settings.sortMode) } else {
        if (gear.req && !gear.req() && !flags.loadstate) { msg("Requirenments not met!", 'red'); return }
    /*switch(gear.slot){
      case 5 :{
        if(you.eqp[4].id===10000) you.eqp[4]=gear;
        else if(you.eqp[5].id===10000) {you.eqp[5]=gear;gear.slot=6} else {unequip(you.eqp[4]);you.eqp[4]=gear}
      } break;
      case 6 :{
        if(you.eqp[5].id===10000) you.eqp[5]=gear;
        else if(you.eqp[4].id===10000) {you.eqp[4]=gear;gear.slot=5} else {unequip(you.eqp[5]);you.eqp[5]=gear}
      } break;
    default: {unequip(you.eqp[gear.slot-1]); you.eqp[gear.slot-1] = gear;};
    break
    }*/  unequip(you.eqp[gear.slot - 1]); you.eqp[gear.slot - 1] = gear;
        if (gear.twoh === true) { if (you.eqp[1].id !== 10000) unequip(you.eqp[1]) } else if (you.eqp[1].id !== 10000 && you.eqp[0].twoh === true) unequip(you.eqp[0]);
        if (gear.eff.length > 0) for (let k = 0; k < gear.eff.length; k++) { gear.eff[k].use(you, gear.eff[k].y, gear.eff[k].z); giveEff(you, gear.eff[k]) }
        gear.oneq(you);
        if (gear.degrade) planner.itmwear.data.items.push(gear)
        if (gear.slot === 1) you.atkmode = gear.atkmode;
        gear.wc = gameText.wecs[gear.rar][0];
        //gear.wbc=gameText.wecs[gear.rar][1];
        let spst;
        switch (gear.rar) {
          case 2: spst = '0px 0px 2px blue';
            break;
          case 3: spst = '0px 0px 2px lime';
            break;
          case 4: spst = '0px 0px 3px orange';
            break;
          case 5: spst = '0px 0px 2px crimson,0px 0px 5px red';
            break;
          case 6: spst = '1px 1px 1px black,0px 0px 2px purple';
            break;
        }
        switch (gear.slot - 1) {
          case 0: { dom.d7_slot_1.removeAttribute('style'); dom.d7_slot_1.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_1.style.color = gear.wc; dom.d7_slot_1.style.textShadow = spst }; if (!!gear.wbc) dom.d7_slot_1.style.backgroundColor = gear.wbc; } break;
          case 1: { dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_2.style.color = gear.wc; dom.d7_slot_2.style.textShadow = spst } if (!!gear.wbc) dom.d7_slot_2.style.backgroundColor = gear.wbc; } break;
          case 2: { dom.d7_slot_3.removeAttribute('style'); dom.d7_slot_3.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_3.style.color = gear.wc; dom.d7_slot_3.style.textShadow = spst } if (!!gear.wbc) dom.d7_slot_3.style.backgroundColor = gear.wbc; } break;
          case 3: { dom.d7_slot_4.removeAttribute('style'); dom.d7_slot_4.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_4.style.color = gear.wc; dom.d7_slot_4.style.textShadow = spst } if (!!gear.wbc) dom.d7_slot_4.style.backgroundColor = gear.wbc; } break;
          case 4: { dom.d7_slot_5.removeAttribute('style'); dom.d7_slot_5.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_5.style.color = gear.wc; dom.d7_slot_5.style.textShadow = spst } if (!!gear.wbc) dom.d7_slot_5.style.backgroundColor = gear.wbc; } break;
          case 5: { dom.d7_slot_6.removeAttribute('style'); dom.d7_slot_6.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_6.style.color = gear.wc; dom.d7_slot_6.style.textShadow = spst } if (!!gear.wbc) dom.d7_slot_6.style.backgroundColor = gear.wbc; } break;
          case 6: { dom.d7_slot_7.removeAttribute('style'); dom.d7_slot_7.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_7.style.color = gear.wc; dom.d7_slot_7.style.textShadow = spst } if (!!gear.wbc) dom.d7_slot_7.style.backgroundColor = gear.wbc; } break;
          case 7: { dom.d7_slot_8.removeAttribute('style'); dom.d7_slot_8.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_8.style.color = gear.wc; dom.d7_slot_8.style.textShadow = spst } if (!!gear.wbc) dom.d7_slot_8.style.backgroundColor = gear.wbc; } break;
          case 8: { dom.d7_slot_9.removeAttribute('style'); dom.d7_slot_9.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_9.style.color = gear.wc; dom.d7_slot_9.style.textShadow = spst } if (!!gear.wbc) dom.d7_slot_9.style.backgroundColor = gear.wbc; } break;
          case 9: { dom.d7_slot_10.removeAttribute('style'); dom.d7_slot_10.innerHTML = you.eqp[gear.slot - 1].name; if (!!gear.wc) { dom.d7_slot_10.style.color = gear.wc; dom.d7_slot_10.style.textShadow = spst } if (!!gear.wbc) dom.d7_slot_10.style.backgroundColor = gear.wbc; } break;
        }
        if (gear.twoh === true) { dom.d7_slot_2.innerHTML = you.eqp[0].name; dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.style.color = 'lightgrey' } else {
          if (you.eqp[1].id === 10000) { dom.d7_slot_2.innerHTML = 'Shield'; dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.style.color = 'grey' }
        }
        if (!opts || !opts.save) { you.stat_r(); update_d(); isort(settings.sortMode) }
      }
    }

    export function unequip(gear: Equipment, opts?: { save?: boolean }) {
      if (!gear.data || !gear.data.uid) return;
      if (gear.eff.length > 0) for (let k = 0; k < gear.eff.length; k++) { gear.eff[k].un(you); removeEff(gear.eff[k]) }
      gear.onuneq(you);
      you.eqp[gear.slot - 1] = eqp.dummy;
      if (gear.degrade) planner.itmwear.data.items.splice(planner.itmwear.data.items.indexOf(gear), 1)
      switch (gear.slot - 1) {
        case 0: { dom.d7_slot_1.innerHTML = 'Weapon'; dom.d7_slot_1.removeAttribute('style'); dom.d7_slot_1.style.color = 'grey'; you.eqp[0].cls[2] = you.lvl / 5 << 0; you.eqp[0].aff[0] = you.lvl / 8 << 0; you.eqp[0].ctype = 2 } break;
        case 1: { dom.d7_slot_2.innerHTML = 'Shield'; dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.style.color = 'grey' } break;
        case 2: { dom.d7_slot_3.innerHTML = 'Head'; dom.d7_slot_3.removeAttribute('style'); dom.d7_slot_3.style.color = 'grey' } break;
        case 3: { dom.d7_slot_4.innerHTML = 'Body'; dom.d7_slot_4.removeAttribute('style'); dom.d7_slot_4.style.color = 'grey' } break;
        case 4: { dom.d7_slot_5.innerHTML = 'L arm'; dom.d7_slot_5.removeAttribute('style'); dom.d7_slot_5.style.color = 'grey' } break;
        case 5: { dom.d7_slot_6.innerHTML = 'R arm'; dom.d7_slot_6.removeAttribute('style'); dom.d7_slot_6.style.color = 'grey' } break;
        case 6: { dom.d7_slot_7.innerHTML = 'Legs'; dom.d7_slot_7.removeAttribute('style'); dom.d7_slot_7.style.color = 'grey' } break;
        case 7: { dom.d7_slot_8.innerHTML = 'Accessory'; dom.d7_slot_8.removeAttribute('style'); dom.d7_slot_8.style.color = 'grey' } break;
        case 8: { dom.d7_slot_9.innerHTML = 'Accessory'; dom.d7_slot_9.removeAttribute('style'); dom.d7_slot_9.style.color = 'grey' } break;
        case 9: { dom.d7_slot_10.innerHTML = 'Accessory'; dom.d7_slot_10.removeAttribute('style'); dom.d7_slot_10.style.color = 'grey' } break;
      }
      if (!opts || !opts.save) { you.stat_r(); update_d() }
    }

    export function eqpres() {
      dom.d7_slot_1.innerHTML = 'Weapon';
      dom.d7_slot_1.removeAttribute('style');
      dom.d7_slot_1.style.color = 'grey';
      dom.d7_slot_2.innerHTML = 'Shield';
      dom.d7_slot_2.removeAttribute('style');
      dom.d7_slot_2.style.color = 'grey';
      dom.d7_slot_3.innerHTML = 'Head';
      dom.d7_slot_3.removeAttribute('style');
      dom.d7_slot_3.style.color = 'grey';
      dom.d7_slot_4.innerHTML = 'Body';
      dom.d7_slot_4.removeAttribute('style');
      dom.d7_slot_4.style.color = 'grey';
      dom.d7_slot_5.innerHTML = 'L arm';
      dom.d7_slot_5.removeAttribute('style');
      dom.d7_slot_5.style.color = 'grey';
      dom.d7_slot_6.innerHTML = 'R arm';
      dom.d7_slot_6.removeAttribute('style');
      dom.d7_slot_6.style.color = 'grey';
      dom.d7_slot_7.innerHTML = 'Legs';
      dom.d7_slot_7.removeAttribute('style');
      dom.d7_slot_7.style.color = 'grey'
      dom.d7_slot_8.innerHTML = 'Accessory';
      dom.d7_slot_8.removeAttribute('style');
      dom.d7_slot_8.style.color = 'grey'
      //    dom.d7_slot_9.innerHTML = 'Accessory';dom.d7_slot_9.removeAttribute('style');dom.d7_slot_9.style.color='grey'
      //    dom.d7_slot_10.innerHTML = 'Accessory';dom.d7_slot_10.removeAttribute('style');dom.d7_slot_10.style.color='grey'
    }
