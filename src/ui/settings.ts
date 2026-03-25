import { addElement, empty, draggable } from '../dom-utils';
import { dom, global, you, flags, settings } from '../state';
import { b64_to_utf8 } from '../base64';
import { save, load } from '../systems/save-load';
import { kill } from '../game/utils-game';

export function nograd(s: boolean) {
  if (s === true) {
    for (let i = 0; i < document.getElementsByClassName('d2').length; i++) (document.getElementsByClassName('d2')[i] as HTMLElement).style.background = '#0e574b';
    for (let i = 0; i < document.getElementsByClassName('d3').length; i++) (document.getElementsByClassName('d3')[i] as HTMLElement).style.background = '#0e574b';
    for (let i = 0; i < document.getElementsByClassName('hp').length; i++) (document.getElementsByClassName('hp')[i] as HTMLElement).style.background = '#91e6b6';
    for (let i = 0; i < document.getElementsByClassName('exp').length; i++) (document.getElementsByClassName('exp')[i] as HTMLElement).style.background = '#ea9c83';
    for (let i = 0; i < document.getElementsByClassName('en').length; i++) (document.getElementsByClassName('en')[i] as HTMLElement).style.background = '#4f3170';
    dom.inv_ctx.style.background = dom.inv_control_b.style.background = dom.ctrmg.style.background = '#00224e';
    dom.d7m_c.style.background = '#392c72';
    for (let i = 0; i < document.styleSheets[0].rules.length; i++) if ((document.styleSheets[0].rules[i] as any).selectorText == ".opt_c:hover, .ct_bts:hover, .chs:hover, .bts:hover, .bbts:hover, .bts_b:hover, .inv_slot:hover, .bts_m:hover") (document.styleSheets[0].rules[i] as any).style.background = '#0e574b';
    flags.guardStance = false;
  }
  else {
    for (let i = 0; i < document.getElementsByClassName('d2').length; i++) (document.getElementsByClassName('d2')[i] as HTMLElement).style.background = 'linear-gradient(90deg,rgb(25,129,108),rgb(1,41,39))';
    for (let i = 0; i < document.getElementsByClassName('d3').length; i++) (document.getElementsByClassName('d3')[i] as HTMLElement).style.background = 'linear-gradient(90deg,rgb(25,129,108),rgb(1,41,39))';
    for (let i = 0; i < document.getElementsByClassName('hp').length; i++) (document.getElementsByClassName('hp')[i] as HTMLElement).style.background = 'linear-gradient(90deg,rgb(254,239,157),rgb(45,223,206))';
    for (let i = 0; i < document.getElementsByClassName('exp').length; i++) (document.getElementsByClassName('exp')[i] as HTMLElement).style.background = 'linear-gradient(90deg,rgb(254,239,157),rgb(219,119,158))';
    for (let i = 0; i < document.getElementsByClassName('en').length; i++) (document.getElementsByClassName('en')[i] as HTMLElement).style.background = 'linear-gradient(270deg,rgb(124,68,112),rgb(29,29,113))';
    dom.inv_ctx.style.background = dom.inv_control_b.style.background = dom.ctrmg.style.background = 'linear-gradient(90deg,rgb(0,5,51),rgb(0,65,107))';
    dom.d7m_c.style.background = 'linear-gradient(270deg,rgb(84,28,112),rgb(29,62,116))';
    for (let i = 0; i < document.styleSheets[0].rules.length; i++) if ((document.styleSheets[0].rules[i] as any).selectorText == ".opt_c:hover, .ct_bts:hover, .chs:hover, .bts:hover, .bbts:hover, .bts_b:hover, .inv_slot:hover, .bts_m:hover") (document.styleSheets[0].rules[i] as any).style.background = 'linear-gradient(90deg,rgb(25,129,108),rgb(1,41,39))';
    flags.guardStance = true;
  }
}

export function initSettingsPanel() {
    dom.ct_bt4_1 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_1a = addElement(dom.ct_bt4_1, 'div', null, 'option-label');
    dom.ct_bt4_1a.innerHTML = 'Message log limit';
    dom.ct_bt4_1b = addElement(dom.ct_bt4_1, 'input', null, 'option-input');
    dom.ct_bt4_1b.value = settings.msgs_max;
    dom.ct_bt4_1b.type = 'number';
    dom.ct_bt4_1b.min = 1;
    dom.ct_bt4_1b.max = 100;
    dom.ct_bt4_1b.addEventListener('change', function (this: any) { if (this.value < 1) this.value = 1; else if (this.value > 100) this.value = 100; settings.msgs_max = this.value });
    dom.ct_bt4_2 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_2a = addElement(dom.ct_bt4_2, 'div', null, 'option-label');
    dom.ct_bt4_2a.innerHTML = 'BG Color';
    dom.ct_bt4_21b = addElement(dom.ct_bt4_2, 'input', null, 'option-input');
    dom.ct_bt4_21b.value = settings.bg_r;
    dom.ct_bt4_21b.type = 'range';
    dom.ct_bt4_21b.min = 0;
    dom.ct_bt4_21b.max = 255;
    dom.ct_bt4_21b.style.width = '85px';
    dom.ct_bt4_21b.style.height = '16px';
    dom.ct_bt4_21b.addEventListener('input', function (this: any) { document.body.removeAttribute('style'); flags.bgspc = false; settings.bg_r = this.value; document.body.style.backgroundColor = 'rgb(' + settings.bg_r + ',' + settings.bg_g + ',' + settings.bg_b + ')'; dom.ct_bt4_31b.innerHTML = settings.bg_r });
    dom.ct_bt4_22b = addElement(dom.ct_bt4_2, 'input', null, 'option-input');
    dom.ct_bt4_22b.value = settings.bg_g;
    dom.ct_bt4_22b.type = 'range';
    dom.ct_bt4_21b.style.height = '16px';
    dom.ct_bt4_22b.style.height = '16px';
    dom.ct_bt4_22b.min = 0;
    dom.ct_bt4_22b.max = 255;
    dom.ct_bt4_22b.style.width = '85px';
    dom.ct_bt4_22b.style.left = '367px';
    dom.ct_bt4_22b.addEventListener('input', function (this: any) { document.body.removeAttribute('style'); flags.bgspc = false; settings.bg_g = this.value; document.body.style.backgroundColor = 'rgb(' + settings.bg_r + ',' + settings.bg_g + ',' + settings.bg_b + ')'; dom.ct_bt4_32b.innerHTML = settings.bg_g });
    dom.ct_bt4_23b = addElement(dom.ct_bt4_2, 'input', null, 'option-input');
    dom.ct_bt4_23b.value = settings.bg_b;
    dom.ct_bt4_23b.type = 'range';
    dom.ct_bt4_21b.style.height = '16px';
    dom.ct_bt4_23b.style.height = '16px';
    dom.ct_bt4_23b.min = 0;
    dom.ct_bt4_23b.max = 255;
    dom.ct_bt4_23b.style.width = '85px';
    dom.ct_bt4_23b.style.left = '459px';
    dom.ct_bt4_23b.addEventListener('input', function (this: any) { document.body.removeAttribute('style'); flags.bgspc = false; settings.bg_b = this.value; document.body.style.backgroundColor = 'rgb(' + settings.bg_r + ',' + settings.bg_g + ',' + settings.bg_b + ')'; dom.ct_bt4_33b.innerHTML = settings.bg_b });

    dom.ct_bt4_3 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_3a = addElement(dom.ct_bt4_3, 'div', null, 'option-label');
    dom.ct_bt4_3a.innerHTML = '　';
    dom.ct_bt4_31b = addElement(dom.ct_bt4_3, 'div', null, 'option-input');
    dom.ct_bt4_31b.style.textAlign = 'center';
    dom.ct_bt4_31b.style.width = '83px';
    dom.ct_bt4_31b.innerHTML = settings.bg_r || 255;
    dom.ct_bt4_32b = addElement(dom.ct_bt4_3, 'div', null, 'option-input');
    dom.ct_bt4_32b.style.textAlign = 'center';
    dom.ct_bt4_32b.style.width = '83px';
    dom.ct_bt4_32b.innerHTML = settings.bg_g || 255;
    dom.ct_bt4_32b.style.left = '367px';
    dom.ct_bt4_33b = addElement(dom.ct_bt4_3, 'div', null, 'option-input');
    dom.ct_bt4_33b.style.textAlign = 'center';
    dom.ct_bt4_33b.style.width = '83px';
    dom.ct_bt4_33b.innerHTML = settings.bg_b || 255;
    dom.ct_bt4_33b.style.left = '459px';

    dom.ct_bt4_03 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_03a = addElement(dom.ct_bt4_03, 'div', null, 'option-label');
    dom.ct_bt4_03a.innerHTML = 'BG presets';
    dom.ct_bt4_03b = addElement(dom.ct_bt4_03, 'div', null, 'option-input');
    dom.ct_bt4_03b.style.width = 274;
    dom.ct_bt4_03b.style.height = 20;
    dom.ct_bt4_03b.style.display = 'flex';
    dom.ct_bt4_03b.style.padding = 0;
    dom.ct_bt4_03b.style.textAlign = 'center'
    dom.ct_bt4_03b1 = addElement(dom.ct_bt4_03b, 'small');
    dom.ct_bt4_03b2 = addElement(dom.ct_bt4_03b, 'small');
    dom.ct_bt4_03b3 = addElement(dom.ct_bt4_03b, 'small');
    dom.ct_bt4_03b4 = addElement(dom.ct_bt4_03b, 'small');
    dom.ct_bt4_03b1.style.width = dom.ct_bt4_03b2.style.width = dom.ct_bt4_03b3.style.width = dom.ct_bt4_03b4.style.width = '25%'
    dom.ct_bt4_03b1.innerHTML = 'White';
    dom.ct_bt4_03b2.innerHTML = 'grey';
    dom.ct_bt4_03b3.innerHTML = 'night';
    dom.ct_bt4_03b4.innerHTML = 'special'
    dom.ct_bt4_03b1.style.color = '#000';
    dom.ct_bt4_03b1.style.backgroundColor = 'white';
    dom.ct_bt4_03b2.style.color = 'lightgrey';
    dom.ct_bt4_03b2.style.backgroundColor = '#666';
    dom.ct_bt4_03b3.style.color = 'yellow';
    dom.ct_bt4_03b3.style.backgroundColor = 'rgb(18,18,46)';
    dom.ct_bt4_03b4.style.background = 'linear-gradient(180deg,#000,#123)';

    let applyBgPreset = (r: number, g: number, b: number) => {
      flags.bgspc = false;
      settings.bg_r = r;
      settings.bg_g = g;
      settings.bg_b = b;
      document.body.removeAttribute('style');
      dom.ct_bt4_31b.innerHTML = r;
      dom.ct_bt4_32b.innerHTML = g;
      dom.ct_bt4_33b.innerHTML = b;
      dom.ct_bt4_21b.value = settings.bg_r;
      dom.ct_bt4_22b.value = settings.bg_g;
      dom.ct_bt4_23b.value = settings.bg_b;
      document.body.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';
    };
    dom.ct_bt4_03b1.addEventListener('click', () => { applyBgPreset(255, 255, 255) });
    dom.ct_bt4_03b2.addEventListener('click', () => { applyBgPreset(188, 188, 188) });
    dom.ct_bt4_03b3.addEventListener('click', () => { applyBgPreset(18, 18, 46) });
    dom.ct_bt4_03b4.addEventListener('click', () => {
      flags.bgspc = true;
      dom.ct_bt4_31b.innerHTML = 'SPCL';
      dom.ct_bt4_32b.innerHTML = 'SPCL';
      dom.ct_bt4_33b.innerHTML = 'SPCL';
      document.body.style.background = 'linear-gradient(180deg,#000,#123)';
    });

    dom.ct_bt4_4 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_4a = addElement(dom.ct_bt4_4, 'div', null, 'option-label');
    dom.ct_bt4_4a.innerHTML = 'Destroy gradients';
    dom.ct_bt4_41b = addElement(dom.ct_bt4_4, 'input', null, 'option-input');
    dom.ct_bt4_41b.type = 'checkbox';
    dom.ct_bt4_41b.addEventListener('click', () => { nograd(flags.guardStance) });
    dom.ct_bt4_5 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_5a = addElement(dom.ct_bt4_5, 'div', null, 'option-label-alt');
    dom.ct_bt4_5b = addElement(dom.ct_bt4_5, 'div', null, 'option-value-alt');
    dom.ct_bt4_5a.innerHTML = 'Export';
    dom.ct_bt4_5a.style.border = '1px lightgrey solid';
    dom.ct_bt4_5a.addEventListener('click', function (this: any) {
      if (!flags.exportActive) {
        let t = save(true);
        flags.exportActive = true;
        dom.ct_bt4_5a_nc = addElement(document.body, 'div');
        dom.ct_bt4_5a_nc.style.position = 'absolute';
        dom.ct_bt4_5a_nc.style.padding = 2;
        dom.ct_bt4_5a_nc.style.top = 370;
        dom.ct_bt4_5a_nc.style.left = 330;
        dom.ct_bt4_5a_nc.style.width = 600;
        dom.ct_bt4_5a_nc.style.height = 400;
        dom.ct_bt4_5a_nc.style.border = '2px solid black';
        dom.ct_bt4_5a_nc.style.backgroundColor = 'lightgrey';
        dom.ct_bt4_5a_nh = addElement(dom.ct_bt4_5a_nc, 'div');
        dom.ct_bt4_5a_nh.style.height = 20;
        dom.ct_bt4_5a_nh.style.borderBottom = '2px solid black';
        dom.ct_bt4_5a_nhv = addElement(dom.ct_bt4_5a_nh, 'div');
        dom.ct_bt4_5a_nhv.style.float = 'left';
        dom.ct_bt4_5a_nhv.style.marginRight = 6;
        dom.ct_bt4_5a_nhv.style.backgroundColor = 'grey';
        dom.ct_bt4_5a_nhv.innerHTML = 'Export As Text'
        dom.ct_bt4_5a_nhv.addEventListener('click', function (this: any) { dom.ct_bt4_5a_nbc.value = t });
        dom.ct_bt4_5a_nhz = addElement(dom.ct_bt4_5a_nh, 'div');
        dom.ct_bt4_5a_nhz.style.float = 'left';
        dom.ct_bt4_5a_nhz.style.backgroundColor = 'grey';
        dom.ct_bt4_5a_nhz.innerHTML = 'Export As File'
        dom.ct_bt4_5a_nhz.addEventListener('click', function (this: any) {
          let a = new Date();
          let temp = document.createElement('a');
          temp.href = 'data:text/plain;charset=utf-8,' + t;
          let n = you.name;
          if (/(<.*>)|(\(.*\))/.test(you.name)) n = '';
          temp.download = n + ' - v' + global.ver + ' - ' + (a.getFullYear() + '/' + (a.getMonth() + 1) + '/' + a.getDate() + ' ' + a.getHours() + '_' + (a.getMinutes() >= 10 ? a.getMinutes() : '0' + a.getMinutes()) + '_' + (a.getSeconds() >= 10 ? a.getSeconds() : '0' + a.getSeconds())) + ' [Proto23]';
          temp.click();
        });
        dom.ct_bt4_5a_nhx = addElement(dom.ct_bt4_5a_nh, 'div');
        draggable(dom.ct_bt4_5a_nh, dom.ct_bt4_5a_nc);
        dom.ct_bt4_5a_nhx.innerHTML = '✖';
        dom.ct_bt4_5a_nhx.style.float = 'right';
        dom.ct_bt4_5a_nhx.style.backgroundColor = 'red';
        dom.ct_bt4_5a_nhx.addEventListener('click', function (this: any) { flags.exportActive = false; empty(dom.ct_bt4_5a_nc); document.body.removeChild(dom.ct_bt4_5a_nc); kill(dom.ct_bt4_5a_nc) });
        dom.ct_bt4_5a_nb = addElement(dom.ct_bt4_5a_nc, 'div');
        dom.ct_bt4_5a_nbc = addElement(dom.ct_bt4_5a_nb, 'textArea');
        dom.ct_bt4_5a_nbc.style.fontFamily = 'MS Gothic';
        dom.ct_bt4_5a_nbc.style.width = '100%';
        dom.ct_bt4_5a_nbc.style.height = '378px';
        dom.ct_bt4_5a_nbc.style.overflow = 'auto'

      }
    });
    dom.ct_bt4_5b.innerHTML = 'Import';
    dom.ct_bt4_5b.style.border = '1px lightgrey solid';
    dom.ct_bt4_5b.addEventListener('click', function (this: any) {
      if (!flags.impatv) {
        flags.impatv = true;
        dom.ct_bt4_5b_nc = addElement(document.body, 'div');
        dom.ct_bt4_5b_nc.style.position = 'absolute';
        dom.ct_bt4_5b_nc.style.padding = 2;
        dom.ct_bt4_5b_nc.style.top = 370;
        dom.ct_bt4_5b_nc.style.left = 330;
        dom.ct_bt4_5b_nc.style.width = 600;
        dom.ct_bt4_5b_nc.style.height = 400;
        dom.ct_bt4_5b_nc.style.border = '2px solid black';
        dom.ct_bt4_5b_nc.style.backgroundColor = 'lightgrey';
        dom.ct_bt4_5b_nh = addElement(dom.ct_bt4_5b_nc, 'div');
        dom.ct_bt4_5b_nh.style.height = 20;
        dom.ct_bt4_5b_nh.style.borderBottom = '2px solid black';
        dom.ct_bt4_5b_nhv = addElement(dom.ct_bt4_5b_nh, 'div');
        draggable(dom.ct_bt4_5b_nh, dom.ct_bt4_5b_nc);
        dom.ct_bt4_5b_nhv.style.float = 'left';
        dom.ct_bt4_5b_nhv.style.backgroundColor = 'grey';
        dom.ct_bt4_5b_nhv.innerHTML = 'Import As Text';
        dom.ct_bt4_5b_nhv.style.marginRight = 6
        dom.ct_bt4_5b_nhv.addEventListener('click', function (this: any) {
          if (dom.ct_bt4_5b_nbc.value == "" || dom.ct_bt4_5b_nbc.value == "?") { dom.ct_bt4_5b_nbc.value = '?'; return }
          let storage = window.localStorage;
          let t = dom.ct_bt4_5b_nbc.value;
          let bt = b64_to_utf8(dom.ct_bt4_5b_nbc.value);
          if (/savevalid/g.test(bt)) {
            storage.setItem("v0.2a", t);
            load(t);
            flags.impatv = false;
            empty(dom.ct_bt4_5b_nc);
            document.body.removeChild(dom.ct_bt4_5b_nc);
            kill(dom.ct_bt4_5b_nc)
          }
          else { dom.ct_bt4_5b_nbc.value = 'Save Invalid'; return }
        });
        dom.ct_bt4_5b_nhx = addElement(dom.ct_bt4_5b_nh, 'div');
        dom.ct_bt4_5b_nhx.innerHTML = '✖';
        dom.ct_bt4_5b_nhx.style.float = 'right';
        dom.ct_bt4_5b_nhx.style.backgroundColor = 'red';
        dom.ct_bt4_5b_nhx.addEventListener('click', function (this: any) { flags.impatv = false; empty(dom.ct_bt4_5b_nc); document.body.removeChild(dom.ct_bt4_5b_nc) });
        dom.ct_bt4_5b_nhz = addElement(dom.ct_bt4_5b_nh, 'div');
        dom.ct_bt4_5b_nhz.style.float = 'left';
        dom.ct_bt4_5b_nhz.style.backgroundColor = 'grey';
        dom.ct_bt4_5b_nhz.innerHTML = 'Load File';
        ;
        dom.ct_bt4_5b_nhz2 = addElement(dom.ct_bt4_5b_nhz, 'input');
        dom.ct_bt4_5b_nhz2.innerHTML = '323'
        dom.ct_bt4_5b_nhz2.accept = '.txt';
        dom.ct_bt4_5b_nhz2.type = 'file';
        dom.ct_bt4_5b_nhz2.style.opacity = 0;
        dom.ct_bt4_5b_nhz2.style.position = 'absolute';
        dom.ct_bt4_5b_nhz2.style.left = 128
        dom.ct_bt4_5b_nhz2.style.width = 81;
        dom.ct_bt4_5b_nhz2.style.top = 0;
        dom.ct_bt4_5b_nhz2.style.height = 18;
        dom.ct_bt4_5b_nhz2.addEventListener('change', function (this: any) {
          let r = new FileReader();
          r.readAsText(this.files[0]);
          let storage = window.localStorage;
          r.addEventListener('load', function (this: any) {
            let t = b64_to_utf8(r.result as string);
            if (/savevalid/g.test(t)) {
              dom.ct_bt4_5b_nbc.value = 'Load Successful';
              storage.setItem("v0.2a", r.result as string);
              load(r.result);
              flags.impatv = false;
              empty(dom.ct_bt4_5b_nc);
              document.body.removeChild(dom.ct_bt4_5b_nc);
              kill(dom.ct_bt4_5b_nc)
            }
            else { dom.ct_bt4_5b_nbc.value = 'Save Invalid'; return }
          })
        })
        dom.ct_bt4_5b_nb = addElement(dom.ct_bt4_5b_nc, 'div');
        dom.ct_bt4_5b_nbc = addElement(dom.ct_bt4_5b_nb, 'textArea');
        dom.ct_bt4_5b_nbc.style.fontFamily = 'MS Gothic';
        dom.ct_bt4_5b_nbc.style.width = '100%';
        dom.ct_bt4_5b_nbc.style.height = '378px';
        dom.ct_bt4_5b_nbc.style.overflow = 'auto'
      }
    });
    /*
    dom.ct_bt4_6 = addElement(dom.ctrwin4,'div',null,'option-row');
    dom.ct_bt4_6a = addElement(dom.ct_bt4_6,'div',null,'option-label');
    dom.ct_bt4_6a.innerHTML = 'Attach timestamp to messages';
    dom.ct_bt4_61b = addElement(dom.ct_bt4_6,'input',null,'option-input');
    dom.ct_bt4_61b.type='checkbox';
    dom.ct_bt4_61b.addEventListener('click',()=>{flags.messageTime=!flags.messageTime});
    */
}
