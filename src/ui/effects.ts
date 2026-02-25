import { addElement, empty } from '../dom-utils';
import { findbyid } from '../utils';
import { dom, global, you, timers } from '../state';
import { addDesc } from './descriptions';

    let node: any;

    export function giveEff(target: any, e: any, d?: any, y?: any, z?: any): any {
      if (target.id !== 0) {
        let ef = e;
        if (target.id !== you.id) { ef = new Object(); for (let g in e) ef[g] = e[g]; }
        if (target.id === you.id || global.flags.btl) {
          let p = findbyid(target.eff, e.id);
          if (!p || !p.active) {
            if (d) ef.duration = d; ef.y = y; ef.z = z; if (ef.x) eff_d(ef, ef.x, ef.c, ef.b, target);
            ef.target = target;
            target.eff.push(ef);
          } ef.onGive(d, y, z); ef.active = true;
        } effdfix();
        target.stat_r();
        return e
      }
    }


    export function removeEff(e: any, t?: any): void {
      if (e.active === true) {
        if (e.x) {
          if (e.target.id === you.id) {
            node = global.e_e.indexOf(e); dom.d101.removeChild(dom.d101.children[node]); global.e_e.splice(node, 1);
            if (dom.d101.children.length > you.eff.length) empty(dom.d101);
          }
          else {
            node = global.e_em.indexOf(e); dom.d101m.removeChild(dom.d101m.children[node]); global.e_em.splice(node, 1);
            if (dom.d101m.children.length > e.target.eff.length) empty(dom.d101m);
          } e.onRemove(); global.dscr.style.display = 'none';
        } e.target.eff.splice(e.target.eff.indexOf(e), 1); e.active = false; clearInterval(timers.inup); effdfix()
      }
      e.target.stat_r();
    }

    function effdfix(): void {
      if (you.eff.length >= 21) {
        dom.d7.style.height = 104;
        for (let i = 0; i < document.getElementsByClassName('sprite-cell').length; i++) (document.getElementsByClassName('sprite-cell')[i] as HTMLElement).style.display = 'inline-block';
        (document.getElementById('se_i') as HTMLElement).style.display = 'block';
      } else {
        dom.d7.style.height = 125;
        for (let i = 0; i < document.getElementsByClassName('sprite-cell').length; i++) (document.getElementsByClassName('sprite-cell')[i] as HTMLElement).style.display = '';
        (document.getElementById('se_i') as HTMLElement).style.display = 'flex';
      }
    }

    function eff_d(e: any, s: string, c: string, b: string, tgt: any): void {
      if (tgt.id === you.id) {
        let ic = addElement(dom.d101, 'div', null, 'sprite-cell');
        ic.innerHTML = s;
        ic.style.color = c;
        ic.style.backgroundColor = b;
        ic.addEventListener('click', () => { e.onClick() })
        addDesc(ic, e, 4, e.name, e.desc);
        if (e.duration !== 0) global.e_e.push(e);
      }
      else {
        let ic = addElement(dom.d101m, 'div', null, 'sprite-cell');
        ic.innerHTML = s;
        ic.style.color = c;
        ic.style.backgroundColor = b;
        addDesc(ic, e, 4, e.name, e.desc);
        if (e.duration !== 0) global.e_em.push(e);
      }
    }
