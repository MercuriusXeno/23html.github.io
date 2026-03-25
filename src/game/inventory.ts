import type { Item, Equipment, Creature, Container, Furniture } from '../types';
import { random, rand } from '../random';
import { copy, deepCopy, scan, scanbyid } from '../utils';
import { addElement, empty } from '../dom-utils';
import { dom, global, settings, you, inv, dar, planner, timers, furn, data, flags, stats, combat, } from '../state';
const { skl, creature } = data;
import { msg, msg_add } from '../ui/messages';
import { renderItem, updateInv, isort, rsort } from '../ui/inventory';
import { unequip } from '../ui/equipment';
import { addDesc } from '../ui/descriptions';
import { renderFurniture } from '../ui/panels';
import { giveSkExp } from './progression';
import { kill } from './utils-game';

    export function giveItem(obj: Item | Equipment, am?: number, ignore?: boolean, flag?: { fl?: boolean; fi?: boolean }) {
      am = am || 1;
      if (!!obj.slot) {
        let nitm; for (let p = 0; p < am; p++) {
          obj.new = true; obj.data.uid = ++global.uid;
          let tmp = obj;
          obj.data.dscv = true;
          obj.have = true;
          nitm = copy(obj);
          nitm.data = deepCopy(obj.data);
          nitm.eff = tmp.eff;
          if (tmp.dss) nitm.dss = tmp.dss;
          inv.push(nitm);
          msg('New item obtained: <span style="color:coral">' + nitm.name + '</span>', 'cyan', obj);
          obj.onGet(you);
          if (settings.sm === nitm.stype) global.sinv.push(nitm);
          if (nitm.stype === settings.sm || settings.sm === 1) renderItem(nitm);
          let g = obj.id! / 10000 << 0;
          if (!scan(dar[g], obj.id as any)) dar[g].push(obj.id as any);
          if (flag && flag.fl) iftrunkopen(1);
          else iftrunkopenc(1);
          if (!flags.loadstate && !ignore) stats.igtttl += am;
        }
        return nitm;
      }
      if (!obj.have) {
        obj.new = true; if (flags.blken === true) {
          global.spnew++; clearInterval(timers.nsblk); timers.nsblk = setInterval(function () {
            let a = document.querySelectorAll('.blinks');
            let g = a.length;
            for (let i = 0; i < g; i++) (a[i] as HTMLElement).style.opacity = '' + global.vsnew / 10;
            if (--global.vsnew < 0) global.vsnew = 10;
          }, 100)
        }
        obj.have = true;
        obj.data.dscv = true;
        inv.push(obj as any);
        obj.amount += am;
        msg('New item obtained: <span style="color:coral">' + obj.name + '</span><span style="color:lime"> x' + am + '</span>', 'cyan', obj);
        obj.onGet(you);
        if (settings.sm === obj.stype) global.sinv.push(obj);
        if (obj.stype === settings.sm || settings.sm === 1) renderItem(obj as any);
      } else {
        obj.amount += am;
        msg('Item Acquired: <span style="color:chartreuse">' + obj.name + '</span><span style="color:lime"> x' + am + '</span>', 'cyan', obj);
        if (settings.sm === 1) updateInv(inv.indexOf(obj as any));
        else if (settings.sm === obj.stype) updateInv(global.sinv.indexOf(obj));
        obj.onGet(you);
      }
      let g = obj.id! / 10000 << 0;
      if (!scan(dar[g], obj.id as any)) dar[g].push(obj.id as any);
      if (obj.multif) for (let a = 0; a < am; a++) obj.multif()
      if (obj.rot) {
        let thave = false;
        for (let a in planner.imorph.data.items) if (planner.imorph.data.items[a].id === obj.id) { thave = true; break }
        if (!thave) { planner.imorph.data.items.push(obj); obj.data.rottil = 0 }
      }
      if (flag && !flag.fi && flag.fl) iftrunkopen(1);
      else iftrunkopenc(1);
      if (!flags.loadstate && !ignore) stats.igtttl += am;
      return obj;
    }

    export function listen_k(e: any) {
      combat.keytarget = e.target;
      if (e.which === 46) {
        for (let obj in global.shortcuts) if (global.shortcuts[obj][0] === global.keyobj.data.skey) global.shortcuts.splice(global.shortcuts.indexOf(global.shortcuts[obj]), 1)
        combat.keytarget!.children[0].innerHTML = global.keyobj.name;
        global.keyobj.data.skey = null;
      }
      else if ((e.which >= 47 && e.which <= 90) || (e.which >= 96 && e.which <= 105)) {
        combat.keytarget!.children[0].innerHTML = global.keyobj.name + '<small> {' + String.fromCharCode(global.keyobj.data.skey) + '}</small>';
        if (global.keyobj.data.skey > 0 && e.which !== global.keyobj.data.skey) { for (let obje in global.shortcuts) { if (global.shortcuts[obje][2].data.skey === global.keyobj.data.skey) { global.shortcuts[obje][2].data.skey = null; global.shortcuts.splice(global.shortcuts.indexOf(global.shortcuts[obje]), 1); } } }
        let tg;
        for (let obj in global.shortcuts) {
          if (e.which === global.shortcuts[obj][0]) { global.shortcuts[obj][2].data.skey = null; global.shortcuts.splice(global.shortcuts.indexOf(global.shortcuts[obj]), 1); }
        } global.keyobj.data.skey = e.which; global.shortcuts.push([e.which, global.keyobj.id, global.keyobj]); global.shortcuts[global.shortcuts.length - 1][2].data.skey = e.which; isort(settings.sm)
      }
    }

    export function removeItem(obj: Item | Equipment, flag?: { fl?: boolean }) {
      if (obj.slot) if (wearing(obj)) unequip(obj as Equipment)
      if (obj.data.skey) {
        for (let s in global.shortcuts) if (obj.data.skey === global.shortcuts[s][0]) { global.shortcuts.splice(global.shortcuts.indexOf(obj.data.skey), 1); continue };
      }
      let idx;
      if (settings.sm === 1) {
        idx = inv.indexOf(obj as any);
        dom.inv_con.removeChild(dom.inv_con.children[idx])
      } else if (settings.sm === obj.stype) {
        idx = global.sinv.indexOf(obj);
        dom.inv_con.removeChild(dom.inv_con.children[idx])
        global.sinv.splice(idx, 1);
      }
      global.dscr.style.display = 'none';
      inv.splice(inv.indexOf(obj as any), 1);
      obj.have = false;
      if (obj.rot) for (let a in planner.imorph.data.items) if (planner.imorph.data.items[a].id === obj.id) { planner.imorph.data.items.splice(planner.imorph.data.items.indexOf(obj)); }
      if (global.lw_op === 1) rsort(settings.rm)
      if (flag && flag.fl) iftrunkopen(1);
      else iftrunkopenc(1);
      if (obj.slot) kill(obj)
    }

    export function rendertrunkitem(root: any, item: any, ni?: any) {
      if (!ni) { ni = new Object(); ni.right = false }; let trunk = global.cchest;
      dom.invp1_con = addElement(root, 'div', null, 'tracked-item');
      ni.right === true ? dom.invp1_con.style.borderLeft = '1px rgb(204, 68, 68) solid' : dom.invp1_con.style.borderRight = '1px rgb(204, 68, 68) solid';
      if (ni.right === true) {
        let c = copy(item);
        c.data = ni.nit.data;
        c.dp = ni.nit.dp;
        addDesc(dom.invp1_con, c);
      } else addDesc(dom.invp1_con, item);
      dom.invp1_s = addElement(dom.invp1_con, 'small');
      dom.invp2_s = addElement(dom.invp1_con, 'small');
      dom.invp1_s.style.marginLeft = ni.right ? '23px' : '3px';
      dom.invp1_s.innerHTML = item.name;
      dom.invp2_s.style.right = ni.right ? '3px' : '20px';
      dom.invp2_s.innerHTML = !item.slot ? ('x' + (ni.right === true ? ni.nit.am : item.amount)) : '';
      dom.invp2_s.style.position = 'absolute';
      if (!!item.c || !!item.bc) {
        if (!!item.c) dom.invp1_s.style.color = item.c;
        if (!!item.bc) dom.invp1_s.style.backgroundColor = item.bc;
      }
      else {
        switch (item.stype) {
          case 2: dom.invp1_s.style.color = 'rgb(255,192,5)';
            break;
          case 3: dom.invp1_s.style.color = 'rgb(0,235,255)';
            break;
          case 4: dom.invp1_s.style.color = 'rgb(44,255,44)';
            break;
        }
      }

      dom.invp1_con.addEventListener('mouseenter', function (this: any) {
        dom.invp1_op2 = addElement(this, 'small', null, ni.right ? 'track-move-left' : 'track-move-right');
        dom.invp1_op2.innerHTML = ni.right ? '<<' : '>>';
        dom.invp1_op2.addEventListener('mouseenter', function () { flags.rtcrutch = true });
        //ugly hack
        dom.invp1_op2.addEventListener('mouseleave', function () { flags.rtcrutch = false });
        //self to self: revisit later V:
        dom.invp1_op2.addEventListener('click', function () {
          let scann = false; let titem;
          if (ni.right === false) {
            for (let a in trunk.c) { if (trunk.c[a].item.id === item.id && !item.slot) { scann = true; titem = trunk.c[a]; break } }
            if (scann === false) {
              let nit = addToContainer(trunk, item, item.amount);
              item.amount = 0;
              titem = nit;
              if (item.amount <= 0 || item.slot) { dom.invp1.removeChild(dom.invp1.children[inv.indexOf(item)]); removeItem(item, { fl: true }) } else if (settings.sm === 1) updateInv(inv.indexOf(item));
              else if (settings.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } else {
              titem.am += item.amount;
              item.amount = 0;
              if (item.amount <= 0) { dom.invp1.removeChild(dom.invp1.children[inv.indexOf(item)]); removeItem(item, { fl: true }); } else if (settings.sm === 1) updateInv(inv.indexOf(item));
              else if (settings.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } if (titem.item.onTIn) titem.item.onTIn(trunk, titem); //  big stack moves into container
          } else {
            for (let a in inv) { if (inv[a].id === item.id && !item.slot) { scann = true; titem = inv[a]; break } }
            if (scann === false) {
              let fin; if (ni.nit.item.slot) { for (let a in trunk.c) { if (trunk.c[a].data.uid === ni.nit.data.uid) { fin = trunk.c[a]; break } } } else { for (let a in trunk.c) { if (trunk.c[a].item.id === ni.nit.item.id) { fin = trunk.c[a]; break } } }
              let g = giveItem(ni.nit.item, ni.nit.am, true, { fl: true });
              g.data = ni.nit.data;
              g.dp = ni.nit.dp;
              dom.invp2.removeChild(dom.invp2.children[trunk.c.indexOf(fin)]);
              removeFromContainer(trunk, fin);
              rendertrunkitem(dom.invp1, g);
              if (trunk.c.length === 0) global.dscr.style.display = 'none'
            }
            else {
              titem!.amount += ni.nit.am;
              let fin;
              for (let a in trunk.c) { if (trunk.c[a].item.id === ni.nit.item.id) { fin = trunk.c[a]; break } }
              dom.invp2.removeChild(dom.invp2.children[trunk.c.indexOf(fin)]);
              removeFromContainer(trunk, fin);
              if (trunk.c.length === 0) global.dscr.style.display = 'none'
              if (settings.sm === 1) updateInv(inv.indexOf(item));
              else if (settings.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } if (ni.nit.item.onTOut) ni.nit.item.onTOut(trunk, ni.nit); //  big stack moves out of container
          } iftrunkopen();
        });
      });
      dom.invp1_con.addEventListener('mouseleave', function (this: any) {
        empty(this.children[2]);
        this.removeChild(this.children[2]);
      });
      dom.invp1_con.addEventListener('click', function (this: any) {
        if (flags.rtcrutch === true) { this.children[0].click(); return } else {
          let scann = false; let titem;
          if (ni.right === false) {
            for (let a in trunk.c) { if (trunk.c[a].item.id === item.id && !item.slot) { scann = true; titem = trunk.c[a]; break } }
            if (scann === false) {
              let nit = addToContainer(trunk, item);
              item.amount--;
              titem = nit;
              if (item.amount <= 0) { dom.invp1.removeChild(dom.invp1.children[inv.indexOf(item)]); removeItem(item, { fl: true }); } else if (settings.sm === 1) updateInv(inv.indexOf(item));
              else if (settings.sm === item.stype) updateInv(global.sinv.indexOf(item));

            } else {
              titem!.am++;
              item.amount--;
              if (item.amount <= 0 || item.slot) { dom.invp1.removeChild(dom.invp1.children[inv.indexOf(item)]); removeItem(item, { fl: true }) } else if (settings.sm === 1) updateInv(inv.indexOf(item));
              else if (settings.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } if (titem.item.onTIn) titem.item.onTIn(trunk, titem); //  1 item moves into container
          } else {
            for (let a in inv) { if (inv[a].id === item.id && !item.slot) { scann = true; titem = inv[a]; break } }
            if (scann === false) {
              let fin; if (ni.nit.item.slot) { for (let a in trunk.c) { if (trunk.c[a].data.uid === ni.nit.data.uid) { fin = trunk.c[a]; break } } } else { for (let a in trunk.c) { if (trunk.c[a].item.id === ni.nit.item.id) { fin = trunk.c[a]; break } } }
              let g = giveItem(ni.nit.item, 1, true, { fl: true });
              g.data = ni.nit.data;
              g.dp = ni.nit.dp;
              rendertrunkitem(dom.invp1, g);
              if (--fin.am <= 0) { dom.invp2.removeChild(dom.invp2.children[trunk.c.indexOf(fin)]); removeFromContainer(trunk, fin) } if (trunk.c.length === 0) global.dscr.style.display = 'none'
            }
            else {
              titem!.amount++;
              let fin;
              for (let a in trunk.c) { if (trunk.c[a].item.id === ni.nit.item.id) { fin = trunk.c[a]; break } }
              if (--fin.am <= 0) { dom.invp2.removeChild(dom.invp2.children[trunk.c.indexOf(fin)]); removeFromContainer(trunk, fin) } if (trunk.c.length === 0) global.dscr.style.display = 'none';
              if (settings.sm === 1) updateInv(inv.indexOf(item));
              else if (settings.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } if (ni.nit.item.onTOut) ni.nit.item.onTOut(trunk, ni.nit); //  1 item moves out of container
          } iftrunkopen()
        }
      });
    }

    function updateTrunkItem(root: any, idx: any, item: any, am: any) {
      if (root.children[idx]) root.children[idx].children[1].innerHTML = item.slot ? '' : 'x' + am;
    }

    export function updateTrunkLeftItem(item: any, kill?: any) {
      if (global.menuo === 3) {
        for (let a in inv) if ((inv[a].data.uid && inv[a].data.uid === item.data.uid) || (inv[a].id === item.id)) {
          if (kill) dom.invp1.removeChild(dom.invp1.children[inv.indexOf(inv[a])]);
          else {
            dom.invp1.children[inv.indexOf(inv[a])].children[1].innerHTML = item.slot ? '' : 'x' + item.amount;
          }
        }
      }
    }

    export function iftrunkopen(side?: any) {
      if (global.menuo === 3) {
        let trunk = global.cchest;
        if (!side || side === 1) for (let obj in inv) updateTrunkItem(dom.invp1, obj, inv[obj], inv[obj].amount);
        if (!side || side === 2) for (let obj in trunk.c) updateTrunkItem(dom.invp2, obj, trunk.c[obj].item, trunk.c[obj].am);
        if (trunk.length === 0) dom.invp2noth.style.display = '';
        else dom.invp2noth.style.display = 'none'
      }
    }

    export function iftrunkopenc(side?: any) {
      if (global.menuo === 3) {
        let trunk = global.cchest;
        if (!side || side === 1) { empty(dom.invp1); for (let obj in inv) rendertrunkitem(dom.invp1, inv[obj]); }
        if (!side || side === 2) { empty(dom.invp2); for (let obj in trunk.c) rendertrunkitem(dom.invp2, trunk.c[obj].item, { right: true, nit: { item: trunk.c[obj].item, data: trunk.c[obj].data, am: trunk.c[obj].am, dp: trunk.c[obj].dp } }); }
        if (trunk.length === 0) dom.invp2noth.style.display = '';
        else dom.invp2noth.style.display = 'none'
      }
    }

    export function addToContainer(cont: any, thing: any, am?: any, data?: any) {
      let it = thing;
      if (thing.slot) it = deepCopy(thing);
      let r = { item: it, am: am || 1, data: data || thing.data, dp: thing.slot ? thing.dp : 0 }
      if (r.item.slot) r.data.uid = ++global.uid;
      cont.c.push(r);
      if (global.menuo == 3) rendertrunkitem(dom.invp2, r.item, { right: true, nit: { item: r.item, data: r.data, am: r.am, dp: r.dp } });
      return r;
    }

    export function removeFromContainer(cont: any, item: any, find?: any) {
      if (find) {
        for (let a in cont.c) if (cont.c.indexOf(cont.c[a]) === cont.c.indexOf(item)) {
          cont.c.splice(cont.c.indexOf(item), 1)
          break
        }
      }
      else cont.c.splice(cont.c.indexOf(item), 1);
    }

    export function dropC(crt: Creature, t?: number) {
      t = t || 1;
      for (let j in crt.drop) if (!crt.drop[j].cond || (!!crt.drop[j].cond && crt.drop[j].cond!() === true)) if (random() < crt.drop[j].chance! + (crt.drop[j].chance! / 100 * you.luck)) {
        giveItem(crt.drop[j].item, !!crt.drop[j].min ? rand(crt.drop[j].min!, crt.drop[j].max!) : t); if (you.mods.lkdbt > 0 && random() < you.mods.lkdbt) giveItem(crt.drop[j].item);
        let d = global.drdata["d" + crt.id];
        if (!d) { d = global.drdata["d" + crt.id] = []; d[j] = 1 } else d[j] = 1;
      }
      for (let jj in global.wdrop) if (random() < global.wdrop[jj].c + (global.wdrop[jj].c / 100 * you.luck)) giveItem(global.wdrop[jj].item, t);
      for (let obj in combat.current_z.drop) if (!combat.current_z.drop[obj].cond || (!!combat.current_z.drop[obj].cond && combat.current_z.drop[obj].cond!() === true)) if (random() < combat.current_z.drop[obj].c! + (combat.current_z.drop[obj].c! / 100 * you.luck) + (combat.current_z.drop[obj].c! / 75 * skl.hst.lvl)) { giveItem(combat.current_z.drop[obj].item, t); giveSkExp(skl.hst, .2) }
      if (crt.rnk < 22) { let ar = (crt.rnk - 1) / 3 << 0; for (let a in global.rdrop[ar]) if (random() < global.rdrop[ar][a].c + (global.rdrop[ar][a].c / 100 * you.luck)) giveItem(global.rdrop[ar][a].item, t) }
    }

    export function wearing(itm: Item | Equipment) { for (let obj in you.eqp) if (itm.data.uid === you.eqp[obj].data.uid && you.eqp[obj].id !== 10000) return true }
    export function wearingany(itm: Item | Equipment) { for (let obj in you.eqp) if (itm.id === you.eqp[obj].id && you.eqp[obj].id !== 10000) return true }

    export function giveFurniture(frt: Furniture, l?: boolean, show?: boolean) {
      let frn = l === true ? copy(frt) : frt;
      if (show !== false) msg('Furniture Acquired: <span style="color:orange">"' + frt.name + '"</span>', 'yellow', frt, 9);
      if (scanbyid(furn, frn.id)) frn.data.amount++;
      else { furn.push(frn); frn.data.amount++; }
      frn.onGive();
      if (global.wdwidx === 1) { empty(dom.ch_1h); for (let a in furn) renderFurniture(furn[a]) }
      let v = 0;
      for (let a in furn) if (furn[a].v) { if (furn[a].multv) v += furn[a].v * furn[a].amount; else v += furn[a].v } if (dom.flsthdrbb) dom.flsthdrbb.innerHTML = v;
      return frn
    }
