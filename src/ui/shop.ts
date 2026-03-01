import { GOLD, SILVER } from '../constants';
import { random } from '../random';
import { col } from '../utils';
import { addElement, empty } from '../dom-utils';
import { dom, global, you, data, stats, } from '../state';
const { skl, acc } = data;
import { msg } from './messages';
import { addDesc } from './descriptions';
import { m_update } from './stats';
import { giveItem } from '../game/inventory';
import { spend } from '../game/economy';
import { giveSkExp } from '../game/progression';

    export function mf(num: number, index: number) {
      let d = addElement(document.body, 'small');
      let c = ['rgb(255, 116, 63)', 'rgb(192, 192, 192)', 'rgb(255, 215, 0)'];
      d.style.position = 'absolute';
      d.style.opacity = '1';
      d.style.width = '100px';
      d.style.top = '755px';
      d.style.left = (328 - 50 * index) + 'px';
      d.innerHTML = '<span style="color: ' + c[index - 1] + '">●</span><span style="color: rgb(255,70,70)">' + num + '</span>';
      let t = 0;
      let g = setInterval(() => {
        t++;
        d.style.top = parseInt(d.style.top) - 2 + 'px';
        d.style.opacity = '' + (30 - t) / 30;
        if (t === 30) {
          clearInterval(g);
          document.body.removeChild(d);
        }
      }, 30);
    }

    export function recshop() {
      if (global.menuo === 4) {
        empty(dom.ch_1h); for (let it in global.shprf.stock) { rendershopitem(dom.ch_1h, global.shprf.stock[it], global.shprf) }
        dom.ch_1e.innerHTML = '&nbspBuying price: <span style="color:lime">' + Math.round(((you.mods.infsrate - skl.trad.use()) * global.shprf.infl * (1 - (Math.sqrt(global.shprf.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index) * 10000) / 100 + '%</span>'
        dom.ch_2e.innerHTML = '&nbspReputation: ' + col('' + (global.shprf.data.rep << 0), 'lime')
      }
    }

    export function rendershopitem(root: any, itm: any, vnd: any) {
      dom.ch_etn = addElement(root, 'div', 'bst_entrh', 'list-row');
      dom.ch_etn.style.backgroundColor = 'rgb(10,30,54)';
      addDesc(dom.ch_etn, itm[0]);
      dom.ch_etn1 = addElement(dom.ch_etn, 'div', null, 'list-col-name');
      dom.ch_etn1.style.width = '79%'
      dom.ch_etn1n = addElement(dom.ch_etn1, 'div');
      dom.ch_etn1n.innerHTML = itm[0].name;
      dom.ch_etn1n.style.width = 305;
      dom.ch_etn1b = addElement(dom.ch_etn1, 'div');
      dom.ch_etn1.style.display = 'flex';
      dom.ch_etn1b.style.display = 'inline-flex';
      dom.ch_etn1b.style.position = 'absolute';
      dom.ch_etn1b.style.right = 6;
      dom.ch_etn1b.style.textAlign = 'center';
      dom.ch_etn1b.style.backgroundColor = 'rgb(20,50,84)'
      let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
      switch (itm[0].stype) {
        case 2: dom.ch_etn1n.style.color = 'rgb(255,192,5)';
          break;
        case 3: dom.ch_etn1n.style.color = 'rgb(0,235,255)';
          break;
        case 4: dom.ch_etn1n.style.color = 'rgb(44,255,44)';
          break;
      }
      dom.ch_etn2 = addElement(dom.ch_etn, 'div', null, 'list-col-rank');
      dom.ch_etn2.style.display = 'flex';
      dom.ch_etn2.style.width = '22%';
      dom.ch_etn2.style.textAlign = 'left';
      if (you.wealth < p) { dom.ch_etn2.style.color = 'red'; dom.ch_etn.style.backgroundColor = 'rgb(68,26,38)' }
      dom.ch_etn2_1 = addElement(dom.ch_etn2, 'span');
      dom.ch_etn2_1.style.width = '33.3%';
      dom.ch_etn2_2 = addElement(dom.ch_etn2, 'span');
      dom.ch_etn2_2.style.width = '33.3%';
      dom.ch_etn2_3 = addElement(dom.ch_etn2, 'span');
      dom.ch_etn2_3.style.width = '33.3%';
      if (p >= GOLD) { dom.ch_etn2_1.innerHTML = (dom.coingold + ((p / GOLD) << 0)); dom.ch_etn2_1.style.backgroundColor = 'rgb(102, 66, 0)'; }
      if (p >= SILVER && p % GOLD >= SILVER) { dom.ch_etn2_2.innerHTML = (dom.coinsilver + ((p / SILVER % SILVER) << 0)); dom.ch_etn2_2.style.backgroundColor = 'rgb(56, 56, 56)'; }
      if (p < SILVER || (p > SILVER && p % SILVER > 0)) { dom.ch_etn2_3.innerHTML = (dom.coincopper + ((p % SILVER) << 0)); dom.ch_etn2_3.style.backgroundColor = 'rgb(102, 38, 23)'; }
      dom.ch_etn3 = addElement(dom.ch_etn, 'div', null, 'list-col-stat');
      dom.ch_etn3.style.width = '14%';
      dom.ch_etn3.style.color = 'lime';
      dom.ch_etn3.innerHTML = itm[1];
      if (itm[1] === 0) { dom.ch_etn3.innerHTML = '<small>sold out</small>'; dom.ch_etn1n.style.color = 'grey'; dom.ch_etn2.style.color = 'grey'; dom.ch_etn3.style.color = 'grey'; }
      dom.ch_etn.addEventListener('mouseenter', function (this: any) {
        dom.ch_etn1b1 = addElement(this.children[0].children[1] as HTMLElement, 'small', null, 'quantity-btn');
        dom.ch_etn1b1.innerHTML = '1';
        dom.ch_etn1b2 = addElement(this.children[0].children[1] as HTMLElement, 'small', null, 'quantity-btn');
        dom.ch_etn1b2.innerHTML = '5';
        dom.ch_etn1b3 = addElement(this.children[0].children[1] as HTMLElement, 'small', null, 'quantity-btn');
        dom.ch_etn1b3.innerHTML = '10';
        dom.ch_etn1b4 = addElement(this.children[0].children[1] as HTMLElement, 'small', null, 'quantity-btn');
        dom.ch_etn1b4.innerHTML = 'M';
        buycbs(itm, vnd)
        dom.ch_etn1b1.addEventListener('click', function (this: any) {
          let el = this.parentElement.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
          if (you.wealth >= p && itm[1] > 0) {
            itm[1]--; giveItem(itm[0]); spend(p); m_update(); giveSkExp(skl.gred, itm[2] * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05)
            if (p >= GOLD) mf(-Math.ceil((p - GOLD) / GOLD), 3);
            if (p >= SILVER) mf(-Math.ceil((p - SILVER) / SILVER % 100), 2);
            mf(-p % 100, 1);
            stats.buyt++;
            if (random() < .0008) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
            stats.shppnt += p * .01;
            vnd.data.rep += itm[2] * .0004 * vnd.repsc;
            if (vnd.data.rep > 100) vnd.data.rep = 100
            if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = el.children[0].children[0].style.color = el.children[1].style.color = 'grey' } else el.children[2].innerHTML = itm[1];
          } buycbs(itm, vnd)
        });
        dom.ch_etn1b2.addEventListener('click', function (this: any) {
          let el = this.parentElement.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
          if (you.wealth >= p * 5 && itm[1] >= 5) {
            itm[1] -= 5; giveItem(itm[0], 5); spend(p * 5); m_update(); giveSkExp(skl.gred, itm[2] * 5 * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05 * 5)
            if (p * 5 >= GOLD) mf(-Math.ceil((p * 5 - GOLD) / GOLD), 3);
            if (p * 5 >= SILVER) mf(-Math.ceil((p * 5 - SILVER) / SILVER % 100), 2);
            mf(-p * 5 % 100, 1);
            stats.buyt += 5;
            if (random() < .004) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
            stats.shppnt += p * .01;
            vnd.data.rep += itm[2] * (5 * (1 + .05)) * .0004 * vnd.repsc;
            if (vnd.data.rep > 100) vnd.data.rep = 100
            if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = el.children[0].children[0].style.color = el.children[1].style.color = 'grey' } else el.children[2].innerHTML = itm[1];
          } buycbs(itm, vnd)
        });
        dom.ch_etn1b3.addEventListener('click', function (this: any) {
          let el = this.parentElement.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
          if (you.wealth >= p * 10 && itm[1] >= 10) {
            itm[1] -= 10; giveItem(itm[0], 10); spend(p * 10); m_update(); giveSkExp(skl.gred, itm[2] * 10 * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05 * 10)
            if (p * 10 >= GOLD) mf(-Math.ceil((p * 10 - GOLD) / GOLD), 3);
            if (p * 10 >= SILVER) mf(-Math.ceil((p * 10 - SILVER) / SILVER % 100), 2);
            mf(-p * 10 % 100, 1);
            stats.buyt += 10;
            if (random() < .008) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
            stats.shppnt += p * .01;
            vnd.data.rep += itm[2] * (10 * (1 + .1)) * .0004 * vnd.repsc;
            if (vnd.data.rep > 100) vnd.data.rep = 100
            if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = el.children[0].children[0].style.color = el.children[1].style.color = 'grey' } else el.children[2].innerHTML = itm[1];
          } buycbs(itm, vnd)
        });
        dom.ch_etn1b4.addEventListener('click', function (this: any) {
          let el = this.parentElement.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index); let max = (you.wealth / p) << 0; if (max > itm[1]) max = itm[1];
          if (you.wealth >= p && itm[1] > 0) {
            itm[1] -= max; giveItem(itm[0], max); spend(p * max); m_update(); giveSkExp(skl.gred, itm[2] * max * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05 * max)
            if (p * max >= GOLD) mf(-Math.ceil((p * max - GOLD) / GOLD), 3);
            if (p * max >= SILVER) mf(-Math.ceil((p * max - SILVER) / SILVER % 100), 2);
            mf(-p * max % 100, 1);
            stats.buyt += max;
            if (random() < .0008 * max) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
            stats.shppnt += p * .01;
            vnd.data.rep += itm[2] * (max * (1 + max * .01)) * .0004 * vnd.repsc;
            if (vnd.data.rep > 100) vnd.data.rep = 100
            if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = el.children[0].children[0].style.color = el.children[1].style.color = 'grey'; } else el.children[2].innerHTML = itm[1];
          } buycbs(itm, vnd)
        });
      });
      dom.ch_etn.addEventListener('mouseleave', function (this: any) {
        empty(this.children[0].children[1]);
      });
      dom.ch_etn1n.addEventListener('click', function (this: any) {
        let el = this.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
        if (you.wealth >= p && itm[1] > 0) {
          itm[1]--; giveItem(itm[0]); spend(p); m_update(); giveSkExp(skl.gred, itm[2] * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05)
          if (p >= GOLD) mf(-Math.ceil((p - GOLD) / GOLD), 3);
          if (p >= SILVER) mf(-Math.ceil((p - SILVER) / SILVER % 100), 2);
          mf(-p % 100, 1);
          stats.buyt++;
          if (random() < .0008) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
          stats.shppnt += p * .01;
          vnd.data.rep += itm[2] * .0004 * vnd.repsc;
          if (vnd.data.rep > 100) vnd.data.rep = 100
          if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = this.style.color = el.children[1].style.color = 'grey' } else el.children[2].innerHTML = itm[1];
        } buycbs(itm, vnd)
      });
    }

    function buycbs(itm: any, vnd: any) {
      let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
      if (you.wealth < p || itm[1] <= 0) dom.ch_etn1b1.style.color = 'grey';
      if (you.wealth < p * 5 || itm[1] < 5) dom.ch_etn1b2.style.color = 'grey';
      if (you.wealth < p * 10 || itm[1] < 10) dom.ch_etn1b3.style.color = 'grey';
      if (you.wealth < p || itm[1] <= 0) dom.ch_etn1b4.style.color = 'grey';
      dom.ch_1e.innerHTML = '&nbspBuying price: <span style="color:lime">' + Math.round(((you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index) * 10000) / 100 + '%</span>'
      dom.ch_2e.innerHTML = '&nbspReputation: ' + col('' + (vnd.data.rep << 0), 'lime');
      for (let i = 0; i < vnd.stock.length; i++) { if (you.wealth < Math.ceil(vnd.stock[i][2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index)) { dom.ch_1h.children[i].children[1].style.color = 'red'; dom.ch_1h.children[i].style.backgroundColor = 'rgb(68,26,38)' } }
      for (let x in global.shptchk) global.shptchk[x]();
      //put it here for now
    }

