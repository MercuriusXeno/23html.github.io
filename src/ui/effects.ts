import type { Combatant, Effect } from '../types';
import { addElement, empty } from '../dom-utils';
import { findbyid } from '../utils';
import { dom, global, you, timers, flags } from '../state';
import { addDesc } from './descriptions';

    let node: number;

    export function giveEff(target: Combatant, effect: Effect, duration?: number, y?: any, z?: any): Effect | undefined {
      if (target.id !== 0) {
        let ef: Effect = effect;
        if (target.id !== you.id) { ef = new Object() as Effect; for (let g in effect) (ef as any)[g] = (effect as any)[g]; }
        if (target.id === you.id || flags.btl) {
          let p = findbyid(target.eff, effect.id);
          if (!p || !p.active) {
            if (duration) ef.duration = duration; ef.y = y; ef.z = z; if (ef.x) eff_d(ef, ef.x, ef.c!, ef.b!, target);
            ef.target = target;
            target.eff.push(ef);
          } ef.onGive(you, duration, y, z); ef.active = true;
        } effdfix();
        target.stat_r();
        return effect
      }
    }


    export function removeEff(effect: Effect, _target?: any): void {
      if (effect.active === true) {
        if (effect.x) {
          if (effect.target!.id === you.id) {
            node = global.effects.indexOf(effect); dom.d101.removeChild(dom.d101.children[node]); global.effects.splice(node, 1);
            if (dom.d101.children.length > you.eff.length) empty(dom.d101);
          }
          else {
            node = global.enemyEffects.indexOf(effect); dom.d101m.removeChild(dom.d101m.children[node]); global.enemyEffects.splice(node, 1);
            if (dom.d101m.children.length > effect.target!.eff.length) empty(dom.d101m);
          } effect.onRemove(you); global.dscr.style.display = 'none';
        } effect.target!.eff.splice(effect.target!.eff.indexOf(effect), 1); effect.active = false; clearInterval(timers.inup); effdfix()
      }
      effect.target!.stat_r();
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

    function eff_d(effect: Effect, symbol: string, color: string, bgColor: string, tgt: Combatant): void {
      if (tgt.id === you.id) {
        let ic = addElement(dom.d101, 'div', null, 'sprite-cell');
        ic.innerHTML = symbol;
        ic.style.color = color;
        ic.style.backgroundColor = bgColor;
        ic.addEventListener('click', () => { effect.onClick(you) })
        addDesc(ic, effect, 4, effect.name, effect.desc);
        if (effect.duration !== 0) global.effects.push(effect);
      }
      else {
        let ic = addElement(dom.d101m, 'div', null, 'sprite-cell');
        ic.innerHTML = symbol;
        ic.style.color = color;
        ic.style.backgroundColor = bgColor;
        addDesc(ic, effect, 4, effect.name, effect.desc);
        if (effect.duration !== 0) global.enemyEffects.push(effect);
      }
    }
