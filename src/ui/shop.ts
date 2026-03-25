import type { Vendor } from '../types';
import { GOLD, SILVER } from '../constants';
import { random } from '../random';
import { col } from '../utils';
import { addElement, empty } from '../dom-utils';
import { dom, global, you, data, stats, } from '../state';
const { skl, acc } = data;
import { msg } from './messages';
import { addDesc } from './descriptions';
import { updateWealthDisplay } from './stats';
import { giveItem } from '../game/inventory';
import { spend } from '../game/economy';
import { giveSkExp } from '../game/progression';

    export function coinAnimation(num: number, index: number) {
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
      if (global.menuOpen === 4) {
        empty(dom.ch_1h); for (let it in global.shprf.stock) { rendershopitem(dom.ch_1h, global.shprf.stock[it], global.shprf) }
        dom.ch_1e.innerHTML = '&nbspBuying price: <span style="color:lime">' + Math.round(((you.mods.inflationRate - skl.trad.use()) * global.shprf.infl * (1 - (Math.sqrt(global.shprf.data.rep) ** 1.3 + 0.05) * .01) * global.offlineEvilIndex) * 10000) / 100 + '%</span>'
        dom.ch_2e.innerHTML = '&nbspReputation: ' + col('' + (global.shprf.data.rep << 0), 'lime')
      }
    }

    function calcPrice(itm: any[], vnd: Vendor): number {
      return Math.ceil(itm[2] * (you.mods.inflationRate - skl.trad.use()) * vnd.infl! * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offlineEvilIndex);
    }

    function buyItem(itm: any[], vnd: Vendor, qty: number, el: any) {
      let p = calcPrice(itm, vnd);
      let totalCost = p * qty;
      if (you.wealth >= totalCost && itm[1] >= qty) {
        itm[1] -= qty; giveItem(itm[0], qty); spend(totalCost); updateWealthDisplay();
        giveSkExp(skl.gred, itm[2] * qty * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05 * qty);
        if (totalCost >= GOLD) coinAnimation(-Math.ceil((totalCost - GOLD) / GOLD), 3);
        if (totalCost >= SILVER) coinAnimation(-Math.ceil((totalCost - SILVER) / SILVER % 100), 2);
        coinAnimation(-totalCost % 100, 1);
        stats.buyTotal += qty;
        let lotteryChance = qty <= 1 ? .0008 : qty === 5 ? .004 : qty === 10 ? .008 : .0008 * qty;
        if (random() < lotteryChance) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') }
        stats.shopPoints += p * .01;
        let repBonus = qty <= 1 ? 1 : qty === 5 ? 5 * (1 + .05) : qty === 10 ? 10 * (1 + .1) : qty * (1 + qty * .01);
        vnd.data.rep += itm[2] * repBonus * .0004 * vnd.repsc!;
        if (vnd.data.rep > 100) vnd.data.rep = 100;
        if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = el.children[0].children[0].style.color = el.children[1].style.color = 'grey'; }
        else el.children[2].innerHTML = itm[1];
      }
      buycbs(itm, vnd);
    }

    export function rendershopitem(root: HTMLElement, itm: any[], vnd: Vendor) {
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
      let p = calcPrice(itm, vnd);
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
        dom.ch_etn1b1.addEventListener('click', function (this: any) { buyItem(itm, vnd, 1, this.parentElement.parentElement.parentElement) });
        dom.ch_etn1b2.addEventListener('click', function (this: any) { buyItem(itm, vnd, 5, this.parentElement.parentElement.parentElement) });
        dom.ch_etn1b3.addEventListener('click', function (this: any) { buyItem(itm, vnd, 10, this.parentElement.parentElement.parentElement) });
        dom.ch_etn1b4.addEventListener('click', function (this: any) {
          let p = calcPrice(itm, vnd); let max = (you.wealth / p) << 0; if (max > itm[1]) max = itm[1];
          buyItem(itm, vnd, max, this.parentElement.parentElement.parentElement);
        });
      });
      dom.ch_etn.addEventListener('mouseleave', function (this: any) {
        empty(this.children[0].children[1]);
      });
      dom.ch_etn1n.addEventListener('click', function (this: any) { buyItem(itm, vnd, 1, this.parentElement.parentElement) });
    }

    function buycbs(itm: any[], vnd: Vendor) {
      let p = calcPrice(itm, vnd);
      if (you.wealth < p || itm[1] <= 0) dom.ch_etn1b1.style.color = 'grey';
      if (you.wealth < p * 5 || itm[1] < 5) dom.ch_etn1b2.style.color = 'grey';
      if (you.wealth < p * 10 || itm[1] < 10) dom.ch_etn1b3.style.color = 'grey';
      if (you.wealth < p || itm[1] <= 0) dom.ch_etn1b4.style.color = 'grey';
      dom.ch_1e.innerHTML = '&nbspBuying price: <span style="color:lime">' + Math.round(((you.mods.inflationRate - skl.trad.use()) * vnd.infl! * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offlineEvilIndex) * 10000) / 100 + '%</span>'
      dom.ch_2e.innerHTML = '&nbspReputation: ' + col('' + (vnd.data.rep << 0), 'lime');
      for (let i = 0; i < vnd.stock.length; i++) { if (you.wealth < calcPrice(vnd.stock[i], vnd)) { dom.ch_1h.children[i].children[1].style.color = 'red'; dom.ch_1h.children[i].style.backgroundColor = 'rgb(68,26,38)' } }
      for (let x in global.shptchk) global.shptchk[x]();
      //put it here for now
    }

