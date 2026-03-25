import type { Equipment } from '../types';
import { dom, global, settings, you, planner, data, gameText, flags } from '../state';
const { eqp } = data;
import { giveEff, removeEff } from './effects';
import { update_d } from './stats';
import { msg } from './messages';
import { isort } from './inventory';

    export function equip(w: Equipment, opts?: { save?: boolean }) {
      if (!w.data || !w.data.uid) return;
      if (w.data.uid === you.eqp[w.slot - 1].data.uid) { unequip(w); if (w.twoh === true) { dom.d7_slot_2.innerHTML = 'Shield'; dom.d7_slot_2.style.color = 'grey' }; isort(settings.sortMode) } else {
        if (w.req && !w.req() && !flags.loadstate) { msg("Requirenments not met!", 'red'); return }
    /*switch(w.slot){
      case 5 :{
        if(you.eqp[4].id===10000) you.eqp[4]=w;
        else if(you.eqp[5].id===10000) {you.eqp[5]=w;w.slot=6} else {unequip(you.eqp[4]);you.eqp[4]=w}
      } break;
      case 6 :{
        if(you.eqp[5].id===10000) you.eqp[5]=w;
        else if(you.eqp[4].id===10000) {you.eqp[4]=w;w.slot=5} else {unequip(you.eqp[5]);you.eqp[5]=w}
      } break;
    default: {unequip(you.eqp[w.slot-1]); you.eqp[w.slot-1] = w;};
    break
    }*/  unequip(you.eqp[w.slot - 1]); you.eqp[w.slot - 1] = w;
        if (w.twoh === true) { if (you.eqp[1].id !== 10000) unequip(you.eqp[1]) } else if (you.eqp[1].id !== 10000 && you.eqp[0].twoh === true) unequip(you.eqp[0]);
        if (w.eff.length > 0) for (let k = 0; k < w.eff.length; k++) { w.eff[k].use(you, w.eff[k].y, w.eff[k].z); giveEff(you, w.eff[k]) }
        w.oneq(you);
        if (w.degrade) planner.itmwear.data.items.push(w)
        if (w.slot === 1) you.atkmode = w.atkmode;
        w.wc = gameText.wecs[w.rar][0];
        //w.wbc=gameText.wecs[w.rar][1];
        let spst;
        switch (w.rar) {
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
        switch (w.slot - 1) {
          case 0: { dom.d7_slot_1.removeAttribute('style'); dom.d7_slot_1.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_1.style.color = w.wc; dom.d7_slot_1.style.textShadow = spst }; if (!!w.wbc) dom.d7_slot_1.style.backgroundColor = w.wbc; } break;
          case 1: { dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_2.style.color = w.wc; dom.d7_slot_2.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_2.style.backgroundColor = w.wbc; } break;
          case 2: { dom.d7_slot_3.removeAttribute('style'); dom.d7_slot_3.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_3.style.color = w.wc; dom.d7_slot_3.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_3.style.backgroundColor = w.wbc; } break;
          case 3: { dom.d7_slot_4.removeAttribute('style'); dom.d7_slot_4.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_4.style.color = w.wc; dom.d7_slot_4.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_4.style.backgroundColor = w.wbc; } break;
          case 4: { dom.d7_slot_5.removeAttribute('style'); dom.d7_slot_5.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_5.style.color = w.wc; dom.d7_slot_5.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_5.style.backgroundColor = w.wbc; } break;
          case 5: { dom.d7_slot_6.removeAttribute('style'); dom.d7_slot_6.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_6.style.color = w.wc; dom.d7_slot_6.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_6.style.backgroundColor = w.wbc; } break;
          case 6: { dom.d7_slot_7.removeAttribute('style'); dom.d7_slot_7.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_7.style.color = w.wc; dom.d7_slot_7.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_7.style.backgroundColor = w.wbc; } break;
          case 7: { dom.d7_slot_8.removeAttribute('style'); dom.d7_slot_8.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_8.style.color = w.wc; dom.d7_slot_8.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_8.style.backgroundColor = w.wbc; } break;
          case 8: { dom.d7_slot_9.removeAttribute('style'); dom.d7_slot_9.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_9.style.color = w.wc; dom.d7_slot_9.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_9.style.backgroundColor = w.wbc; } break;
          case 9: { dom.d7_slot_10.removeAttribute('style'); dom.d7_slot_10.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_10.style.color = w.wc; dom.d7_slot_10.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_10.style.backgroundColor = w.wbc; } break;
        }
        if (w.twoh === true) { dom.d7_slot_2.innerHTML = you.eqp[0].name; dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.style.color = 'lightgrey' } else {
          if (you.eqp[1].id === 10000) { dom.d7_slot_2.innerHTML = 'Shield'; dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.style.color = 'grey' }
        }
        if (!opts || !opts.save) { you.stat_r(); update_d(); isort(settings.sortMode) }
      }
    }

    export function unequip(w: Equipment, opts?: { save?: boolean }) {
      if (!w.data || !w.data.uid) return;
      if (w.eff.length > 0) for (let k = 0; k < w.eff.length; k++) { w.eff[k].un(you); removeEff(w.eff[k]) }
      w.onuneq(you);
      you.eqp[w.slot - 1] = eqp.dummy;
      if (w.degrade) planner.itmwear.data.items.splice(planner.itmwear.data.items.indexOf(w), 1)
      switch (w.slot - 1) {
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
