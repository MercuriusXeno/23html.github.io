import { YEAR, MONTH, DAY } from '../constants';
import { col, findbyid } from '../utils';
import { addElement, empty } from '../dom-utils';
import { dom, global, you, time, timers, inv, furn, data, flags, gameText, combat } from '../state';
const { skl, furniture, vendor } = data;
import { clr_chs } from './choices';
import { rendershopitem } from './shop';
import { showFurniturePanel } from './panels';
import { rendertrunkitem } from '../game/inventory';

export function chs_spec(type: number, x?: any) {
  switch (type) {
    case 1: {
      clr_chs(); let c = findbyid(furn, furniture.cat.id); let br = time.minute - c.data.age;
      dom.ch_1 = addElement(dom.ctr_2, 'div', 'chs');
      dom.ch_1.style.height = '200px';
      dom.ch_1_1 = addElement(dom.ch_1, 'div', null, 'choice-detail');
      dom.ch_1_1.innerHTML = 'Name: <span style="color:orange">' + c.data.name + (c.data.sex === true ? ' ♂' : ' ♀') + '</span>';
      dom.ch_1_1.style.marginTop = -17;
      dom.ch_1_12 = addElement(dom.ch_1, 'div', null, 'choice-detail');
      dom.ch_1_12.innerHTML = 'Day of birth: <span style="color:lime">' + (((br / (YEAR)) << 0) + '/' + (((br / (MONTH) << 0) % 12) + 1) + '/' + (((br / DAY << 0) % 30) + 1)) + '</span>';
      dom.ch_1_2 = addElement(dom.ch_1, 'div', null, 'choice-detail');
      dom.ch_1_2.innerHTML = 'Age: ' + (c.data.age >= YEAR ? '<span style="color:orange">' + (c.data.age / YEAR << 0) + '</span> Years ' : '') + (c.data.age >= MONTH ? '<span style="color:yellow">' + (c.data.age / MONTH << 0) % 12 + '</span> Months ' : '') + (c.data.age >= DAY ? '<span style="color:lime">' + (c.data.age / DAY << 0) % 30 + '</span> Days ' : '');
      dom.ch_1_3 = addElement(dom.ch_1, 'div', null, 'choice-detail');
      dom.ch_1_3.innerHTML = 'Pattern: <span style="color:cyan">' + gameText.cfp[c.data.p] + '</span> | Color: <span style="color:cyan">' + gameText.cfc[c.data.c] + '</span>';
      dom.ch_1_4 = addElement(dom.ch_1, 'div', null, 'choice-detail');
      dom.ch_1_4.innerHTML = 'Likes: <span style="color:lime">' + gameText.cln[c.data.l1] + '</span> And <span style="color:lime">' + gameText.cln[c.data.l2] + '</span>';
      timers.caupd = setInterval(() => { dom.ch_1_2.innerHTML = 'Age: ' + (c.data.age >= YEAR ? '<span style="color:orange">' + (c.data.age / YEAR << 0) + '</span> Years ' : '') + (c.data.age >= MONTH ? '<span style="color:yellow">' + (c.data.age / MONTH << 0) % 12 + '</span> Months ' : '') + (c.data.age >= DAY ? '<span style="color:lime">' + (c.data.age / DAY << 0) % 30 + '</span> Days ' : ''); }, 1000);
    }; break
    case 2: {
      showFurniturePanel();
    }; break
    case 3: {
      clr_chs(); global.menuOpen = 3; global.cchest = x;
      dom.ch_1a = addElement(dom.ctr_2, 'div');
      dom.ch_1a.style.height = '74.5%';
      dom.ch_1a.style.backgroundColor = 'rgb(0,20,44)';
      dom.ch_1a.style.display = 'flex';
      dom.ch_1a.style.overflow = 'auto';
      dom.ch_1a.style.position = 'relative';
      dom.invp1 = addElement(dom.ch_1a, 'div');
      dom.invp2 = addElement(dom.ch_1a, 'div');
      dom.invp1.style.width = dom.invp2.style.width = '50%';
      dom.invp2noth = addElement(dom.ctr_2, 'div');
      dom.invp2noth.style.top = 150;
      dom.invp2noth.style.position = 'absolute';
      dom.invp2noth.style.color = 'grey';
      dom.invp2noth.innerHTML = 'Nothing in the box yet';
      dom.invp2noth.style.left = 301;
      dom.invp2noth.style.pointerEvents = 'none';
      for (let obj in inv) rendertrunkitem(dom.invp1, inv[obj]);
      for (let obj in x.c) rendertrunkitem(dom.invp2, x.c[obj].item, { right: true, nit: { item: x.c[obj].item, data: x.c[obj].data, am: x.c[obj].am, dp: x.c[obj].dp } });
      if (x.c.length > 0) dom.invp2noth.style.display = 'none';
      if (inv.length >= 21) dom.invp2noth.style.left = 301;
      else dom.invp2noth.style.left = 314
    }; break
    case 4: {
      clr_chs(); global.menuOpen = 4; global.shprf = x;
      dom.ch_1 = addElement(dom.ctr_2, 'div');
      dom.ch_1.style.height = '76%';
      dom.ch_1.style.backgroundColor = 'rgb(0,20,44)';
      dom.flsthdr = addElement(dom.ch_1, 'div');
      dom.flsthdr.innerHTML = x.name
      dom.flsthdr.style.borderBottom = '1px #44c solid';
      dom.flsthdr.style.padding = 2;
      dom.ch_1h = addElement(dom.ch_1, 'div');
      dom.ch_1h.style.textAlign = 'left';
      dom.ch_1h.style.display = 'block';
      dom.ch_1h.style.height = '87%';
      dom.ch_1h.style.overflow = 'auto';
      if (dom.ch_etn) empty(dom.ch_etn);
      for (let it in x.stock) {
        rendershopitem(dom.ch_1h, x.stock[it], x)
      }
      dom.ch_1c = addElement(dom.ch_1, 'div');
      dom.ch_1c.style.backgroundColor = 'rgb(10, 30, 54)';
      dom.ch_1c.style.height = '5%';
      dom.ch_1c.style.width = '100%';
      dom.ch_1e = addElement(dom.ch_1c, 'small');
      dom.ch_1e.style.float = dom.ch_1e.style.textAlign = 'left';
      dom.ch_2e = addElement(dom.ch_1c, 'small');
      dom.ch_2e.style.float = dom.ch_2e.style.textAlign = 'right';
      dom.ch_2e.style.paddingRight = 6
      dom.ch_1e.innerHTML = '&nbspBuying price: <span style="color:lime">' + Math.round(((you.mods.inflationRate - skl.trad.use()) * x.infl * (1 - (Math.sqrt(x.data.rep) ** 1.3 + 0.05) * .01) * global.offlineEvilIndex) * 10000) / 100 + '%</span>'
      dom.ch_2e.innerHTML = '&nbspReputation: ' + col(x.data.rep << 0, 'lime');
    }; break
    case 5: {
    }; break
  }
  return dom.ch_1;
}

