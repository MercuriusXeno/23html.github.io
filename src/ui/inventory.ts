import { addElement, empty } from '../dom-utils';
import { scanbyuid } from '../utils';
import { dom, global, settings, you, inv, timers, data, flags, stats, } from '../state';
const { item, skl } = data;
import { addDesc } from './descriptions';
import { equip, unequip } from './equipment';
import { disassembleGeneric } from '../game/exploration';
import { removeItem, giveItem, listen_k,
  iftrunkopenc, updateTrunkLeftItem } from '../game/inventory';
import { giveSkExp } from '../game/progression';
import { renderRcp } from './panels';

    function showConfirmDialog(message: string, onConfirm: () => void) {
      let prm = addElement(document.body, 'div');
      prm.style.backgroundColor = 'grey';
      prm.style.width = document.body.clientWidth + 'px';
      prm.style.height = document.body.clientHeight + 'px';
      prm.style.position = 'absolute';
      prm.style.left = '0';
      prm.style.top = '0';
      prm.style.opacity = '0.4';
      let prm2 = addElement(document.body, 'div');
      prm2.style.position = 'absolute';
      prm2.style.top = (document.body.clientHeight / 2 - 40) + 'px';
      prm2.style.left = (1300 / 2 - 195) + 'px';
      prm2.style.width = '390px';
      prm2.style.border = '4px black solid';
      prm2.style.padding = '5px';
      prm2.style.backgroundColor = 'lightgrey';
      let pin = addElement(prm2, 'div');
      pin.innerHTML = message;
      pin.style.textAlign = 'center';
      pin.style.width = '100%';
      pin.style.borderBottom = '2px solid black';
      pin.style.paddingTop = '10px';
      let pcon = addElement(prm2, 'div');
      pcon.style.display = 'flex';
      pcon.style.textAlign = 'center';
      pcon.style.backgroundColor = 'darkgrey';
      let dismiss = () => { document.body.removeChild(prm); document.body.removeChild(prm2) };
      let phai = addElement(pcon, 'div');
      phai.style.width = '50%';
      phai.innerHTML = 'YES';
      phai.style.paddingTop = '9px';
      phai.style.paddingBottom = '9px';
      let piie = addElement(pcon, 'div');
      piie.style.width = '50%';
      piie.innerHTML = 'NO';
      piie.style.paddingTop = '9px';
      piie.style.paddingBottom = '9px';
      phai.addEventListener('mouseenter', function (this: any) { this.style.backgroundColor = '#666' });
      piie.addEventListener('mouseenter', function (this: any) { this.style.backgroundColor = '#666' });
      phai.addEventListener('mouseleave', function (this: any) { this.style.backgroundColor = 'darkgrey' });
      piie.addEventListener('mouseleave', function (this: any) { this.style.backgroundColor = 'darkgrey' });
      phai.addEventListener('click', () => { onConfirm(); dismiss() });
      piie.addEventListener('click', dismiss);
    }

    export function renderItem(obj: any) {
      let inv_slot_c = addElement(dom.inv_con, 'div', null, 'no-outline');
      let inv_slot = addElement(inv_slot_c, 'div', null, 'inventory-slot no-outline');
      /*switch(obj.wtype){
        case 1:var z= icon(inv_slot,2,1,18,18);
        z.style.paddingRight=2;
        break;
        case 2:var z= icon(inv_slot,4,1,18,18);
        z.style.paddingRight=2;
        break;
        case 3:var z= icon(inv_slot,3,1,18,18);
        z.style.paddingRight=2;
        break;
      }*/
      let inv_name = addElement(inv_slot, 'span');
      inv_name.innerHTML = obj.name;
      if (!!obj.data.skey) inv_name.innerHTML += '<small> {' + String.fromCharCode(obj.data.skey) + '}</small>';
      if (obj.new === true) inv_name.innerHTML += '<small style="font-size:.65em;color: yellow;position:absolute" class="blinks">　new</small>';
      inv_slot_c.addEventListener('mouseenter', function () {
        global.keyobj = obj;
        inv_slot.tabIndex = 0;
        inv_slot.focus();
        inv_slot.addEventListener('keydown', listen_k);
        flags.kfocus = true;
        if (obj.important === false && obj.slot) {
          dom.inv_del = addElement(inv_slot_c, 'span', null, 'delete-btn');
          dom.inv_del.innerHTML = 'x';
          addDesc(dom.inv_del, null, 2, 'Throw away', 'Deletes <span style="color:cyan">\"' + obj.name + '\"</span> permanently');
          dom.inv_del.addEventListener('click', () => {
            if (obj.data.uid === you.eqp[obj.slot - 1].data.uid) {
              showConfirmDialog('Really destroy \"' + obj.name + '\"?', () => { giveSkExp(skl.rccln, (2 ** obj.rar) * 5 - 9.5); giveSkExp(skl.thr, .5); stats.thrownTotal++; removeItem(obj) });
            }
            else { giveSkExp(skl.rccln, (2 ** obj.rar) * 5 - 9.5); removeItem(obj); giveSkExp(skl.thr, .5); stats.thrownTotal++; empty(global.dscr); }
          }
          );
        }
        if (obj.slot === 5 || obj.slot === 6) {
          dom.eq_l = addElement(inv_slot_c, 'small', null, 'eq_l');
          dom.eq_l.innerHTML = 'L';
          addDesc(dom.eq_l, obj);
          dom.eq_l.addEventListener('click', () => { if (obj.data.uid !== you.eqp[4].data.uid && obj.data.uid !== you.eqp[5].data.uid) { obj.slot = 5; equip(obj); } else if (obj.data.uid !== you.eqp[4].data.uid && obj.data.uid === you.eqp[5].data.uid) { unequip(obj); obj.slot = 5; equip(obj); } else { unequip(obj); dom.eq_l.style.backgroundColor = 'royalblue'; inv_slot_c.children[0].removeChild(inv_slot_c.children[0].lastChild!) } });
          if (obj.data.uid === you.eqp[4].data.uid) dom.eq_l.style.backgroundColor = 'crimson';
          dom.eq_r = addElement(inv_slot_c, 'small', null, 'eq_r');
          dom.eq_r.innerHTML = 'R';
          addDesc(dom.eq_r, obj);
          dom.eq_r.addEventListener('click', () => { if (obj.data.uid !== you.eqp[4].data.uid && obj.data.uid !== you.eqp[5].data.uid) { obj.slot = 6; equip(obj); } else if (obj.data.uid === you.eqp[4].data.uid && obj.data.uid !== you.eqp[5].data.uid) { unequip(obj); obj.slot = 6; equip(obj); } else { unequip(obj); dom.eq_r.style.backgroundColor = 'royalblue'; inv_slot_c.children[0].removeChild(inv_slot_c.children[0].lastChild!) } });
          if (obj.data.uid === you.eqp[5].data.uid) dom.eq_r.style.backgroundColor = 'crimson';
        }
        if (obj.dss && item.toolbx.have) {
          dom.inv_dss = addElement(inv_slot_c, 'span', null, 'disassemble-btn');
          dom.inv_dss.innerHTML = '∥';
          if (!obj.slot) dom.inv_dss.style.left = '242px';
          else if (obj.slot === 5 || obj.slot === 6) dom.inv_dss.style.left = '208px'
          let t = '';
          for (let a in obj.dss) {
            let am = obj.dss[a].amount;
            if (obj.dss[a].q) am = (am + am * (obj.dss[a].q * skl.dssmb.lvl)) << 0
            if (obj.dss[a].max) if (am > obj.dss[a].max) am = obj.dss[a].max;
            let c = 1;
            if (obj.slot) c = obj.dp / obj.dpmax;
            am = Math.ceil(am / (2 - c));
            t += '<br><span style="color:orange">' + obj.dss[a].item.name + ': <span style="color:' + (obj.dss[a].max && obj.dss[a].max === am ? 'lime' : 'lightblue') + '">' + am + '</span></span>'
          }
          addDesc(dom.inv_dss, null, 2, 'Disassemble', 'Deconstruct <span style="color:cyan">\"' + obj.name + '\"</span> into:<br>' + t);
          dom.inv_dss.addEventListener('click', () => {
            if (obj.slot && obj.data.uid === you.eqp[obj.slot - 1].data.uid) {
              showConfirmDialog('You are currently wearing \"<span style="color:crimson">' + obj.name + '</span>\"<br>Really deconstruct?', () => { disassembleGeneric(obj) });
            }
            else disassembleGeneric(obj)
          }
          );
        }
      });
      inv_slot_c.addEventListener('mouseleave', function () {
        inv_slot.tabIndex = -1;
        inv_slot.removeEventListener('keydown', listen_k);
        global.keyobj = 0;
        flags.kfocus = false;
        if (obj.important === false && obj.slot) inv_slot_c.removeChild(dom.inv_del);
        if (obj.dss && item.toolbx.have) inv_slot_c.removeChild(dom.inv_dss);
        if (obj.slot === 5 || obj.slot === 6) { inv_slot_c.removeChild(dom.eq_r); inv_slot_c.removeChild(dom.eq_l); }
      });
      if (obj.slot && scanbyuid(you.eqp, obj.data.uid) === true) {
        dom.spc_a = addElement(inv_slot, 'small', null, 'special-action');
        dom.spc_a.innerHTML = 'E';
      }
      if (!obj.slot) {
        let s_am = addElement(inv_slot, 'small', null, 'stack-amount');
        s_am.innerHTML = ' x' + (obj.amount);
        inv_slot.addEventListener('mouseenter', function (this: any) { flags.kfocus = true; this.tabIndex = 0; this.focus(); global.keyobj = obj; this.addEventListener('keydown', listen_k) })
        inv_slot.addEventListener('mouseleave', function (this: any) { flags.kfocus = false; this.tabIndex = -1; global.keyobj = 0; this.removeEventListener('keydown', listen_k); })
      }
      if (!!obj.c || !!obj.bc) {
        if (!!obj.c) inv_name.style.color = obj.c;
        if (!!obj.bc) inv_name.style.backgroundColor = obj.bc;
      }
      else {
        switch (obj.stype) {
          case 2: inv_name.style.color = 'rgb(255,192,5)';
            break;
          case 3: inv_name.style.color = 'rgb(0,235,255)';
            break;
          case 4: inv_name.style.color = 'rgb(44,255,44)';
            break;
        }
      }
      addDesc(inv_slot, obj, null, null, null, null, 100);
      inv_slot.addEventListener('click', function (x) { if (obj.amount > 0 || !!obj.slot) { obj.use(you, x); if (!obj.slot) reduce(obj); if (obj.id < 3000 && !obj.data.tried) { obj.data.tried = true; stats.foodTried += 1; if (global.dscr.style.display != 'none') dom.dtrd.innerHTML = 'Tried: <span style="color: lime">Yes</span>'; } } });
      inv_slot.addEventListener('mouseleave', function () { if (obj.new === true) { obj.new = false; clearTimeout(timers.nsblk); inv_name.innerHTML = obj.name } });
    }

    export function updateInv(slot: number) {
      if (settings.sortMode === 1) dom.inv_con.children[slot].children[0].children[1].innerHTML = ' x' + inv[slot].amount;
      else dom.inv_con.children[slot].children[0].children[1].innerHTML = ' x' + global.slottedInventory[slot].amount;
    }

    export function isort(type: number, opts?: { tr?: boolean }) {
      empty(dom.inv_con);
      if (type === 1) for (let k = 0; k < inv.length; k++) renderItem(inv[k]);
      else {
        global.slottedInventory = [];
        for (let k = 0; k < inv.length; k++) if (type === inv[k].stype) { global.slottedInventory.push(inv[k]); renderItem(inv[k]); }
      }
      settings.sortMode = type;
      if (opts && opts.tr) iftrunkopenc(1);
    }

    export function rsort(type: number) {
      empty(dom.ct_bt1_1);
      if (type === 0 || !type) for (let ind in global.recipesDiscovered) renderRcp(global.recipesDiscovered[ind]);
      else {
        global.sortedRecipes = [];
        for (let k = 0; k < global.recipesDiscovered.length; k++) if (type === global.recipesDiscovered[k].type) global.sortedRecipes.push(global.recipesDiscovered[k]);
        for (let k = 0; k < global.sortedRecipes.length; k++) renderRcp(global.sortedRecipes[k])
      }
      settings.recipeSortMode = type;
    }

    export function invbtsrst() {
      dom.inv_btn_1.removeAttribute('style');
      dom.inv_btn_2.removeAttribute('style');
      dom.inv_btn_3.removeAttribute('style');
      dom.inv_btn_4.removeAttribute('style');
      dom.inv_btn_5.removeAttribute('style');
      switch (settings.sortMode) {
        case 1: dom.inv_btn_1.style.color = 'black';
          dom.inv_btn_1.style.backgroundColor = 'yellow';
          break;
        case 2: dom.inv_btn_2.style.color = 'black';
          dom.inv_btn_2.style.backgroundColor = 'yellow';
          break;
        case 3: dom.inv_btn_3.style.color = 'black';
          dom.inv_btn_3.style.backgroundColor = 'yellow';
          break;
        case 4: dom.inv_btn_4.style.color = 'black';
          dom.inv_btn_4.style.backgroundColor = 'yellow';
          break;
        case 5: dom.inv_btn_5.style.color = 'black';
          dom.inv_btn_5.style.backgroundColor = 'yellow';
          break;
      }
    }

    export function rstcrtthg() { for (let a in global.spbtsr) global.spbtsr[a].style.color = 'inherit'; }

    export function reduce(itm: any, am?: number) { if (am) { itm.amount = itm.amount - am <= 0 ? 0 : itm.amount - am } if (itm.amount <= 0) { removeItem(itm); updateTrunkLeftItem(itm, true) } else if (settings.sortMode === 1) updateInv(inv.indexOf(itm)); else if (settings.sortMode === itm.stype) updateInv(global.slottedInventory.indexOf(itm)); updateTrunkLeftItem(itm) }
