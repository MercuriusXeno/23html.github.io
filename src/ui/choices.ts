import { addElement, empty } from '../dom-utils';
import { dom, global, you, timers, skl } from '../state';
import { giveSkExp } from '../game/progression';

    export function chs(txt: string, f?: any, c?: string, bc?: string, iconx?: number, icony?: number, size?: string, ignore?: any, slimsize?: string) {
      if (f === true) { clr_chs(); dom.ch_1 = addElement(dom.ctr_2, 'div', 'chs'); dom.ch_1.innerHTML = txt; }
      else { dom.ch_1 = addElement(dom.ctr_2, 'div', null, 'chs'); dom.ch_1.innerHTML = txt; }
      if (!!iconx) { dom.ch_1.insertBefore(icon(dom.ch_1, iconx, icony!), dom.ch_1.firstChild); }
      if (c) dom.ch_1.style.color = c;
      if (bc) dom.ch_1.style.backgroundColor = bc;
      if (size) dom.ch_1.style.fontSize = size;
      if (slimsize) dom.ch_1.style.height = slimsize;
      if (!ignore) global.menuo = 0;
      dom.ch_1.addEventListener('click', () => { clearInterval(timers.rptbncgt); global.flags.rptbncgtf = false; if (!global.flags.jdgdis) { global.flags.jdgdis = true; giveSkExp(skl.jdg, .1); setTimeout(() => { global.flags.jdgdis = false }, 500) } })
      return dom.ch_1;
    }

    export function clr_chs(index?: number) {
      if (!index) empty(dom.ctr_2);
      else dom.ctr_2.removeChild(dom.ctr_2.children[index]);
    }

    export function icon(root: any, x: number, y: number, sx?: number, sy?: number, sz?: number) { //sz=2
      if (window.location.pathname.length === 1) {
        sx = sx || 16; sy = sy || 16
        var div: any = addElement(root, 'canvas');
        div.width = sx;
        div.height = sy;
        let data = global._preic_tmain.getImageData(x * sx - sx, y * sy - sy, sx, sy);
        div.getContext('2d').putImageData(data, 0, 0);
        //    let temp = addElement(root,'canvas'); temp.width=sx;temp.height=sy;
        //    let data = global._preic_tmain.getImageData(x*sx-sx,y*sy-sy,sx,sy);
        //    temp.getContext('2d').putImageData(data,0,0);
        //    var div = addElement(root,'canvas'); div.width=sx*sz;div.height=sy*sz;
        //    div.getContext('2d').imageSmoothingEnabled=false;
        //    div.getContext('2d').drawImage(temp,0,0,sx,sy,0,0,sx*sz,sy*sz);
      } else div = addElement(root, 'span');
      return div;
    }

    export function Chs(this: any) {
      this.ttl;
      this.sl = function () { };
      this.data = {};
      this.onStay = function () { };
      this.onEnter = function () { };
      this.onLeave = function () { };
      this.onScout = function () { };
      this.sector = []
    }

    export function activatef(f: any) {
      if (!f.active) {
        f.activate();
        f.active = true;
      }
    }

    export function deactivatef(f: any) {
      if (f.active) {
        f.deactivate();
        f.active = false;
      }
    }
