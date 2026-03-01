import { addElement } from '../dom-utils';
import { dom, global, flags } from '../state';
import { addDesc } from './descriptions';

    export function msg(txt: string, c?: string, dsc?: any, type?: any, bc?: string, chck?: any): void {
      if (flags.m_freeze === false && flags.loadstate === false) {
        while (dom.gmsgs.children[1].children.length > global.msgs_max - 1) dom.gmsgs.children[1].removeChild(dom.gmsgs.children[1].children[0]);
        let msg = addElement(dom.mscont, 'div', null, 'msg');
        if (flags.msgtm) {
          let now = new Date();
          let g = addElement(msg, 'small');
          g.innerHTML = '[' + (now.getHours() < 10 ? ('0' + now.getHours()) : now.getHours()) + ':' + (now.getMinutes() < 10 ? ('0' + now.getMinutes()) : now.getMinutes()) + ':' + (now.getSeconds() < 10 ? ('0' + now.getSeconds()) : now.getSeconds()) + ']'
          g.style.backgroundColor = '#242848';
          g.style.display = 'flex';
        }
        let mtxt = addElement(msg, 'span');
        if (dsc) { if (type) addDesc(msg, dsc, type); else addDesc(msg, dsc); }
        //let nt = new String(); for(let a in txt){nt+=txt[a].charCodeAt()!==32?String.fromCharCode(41216-txt[a].charCodeAt()):' '}; txt=nt;
        if (c) mtxt.innerHTML = '<span style=color:' + c + (bc ? (';background-color:' + bc) : '') + '>' + txt + '</span>';
        else mtxt.innerHTML = txt;
        dom.mscont.scrollTop = dom.mscont.scrollHeight;
        global.lastmsg = msg.innerHTML;
        //if(true) {if(msg.innerHTML==global.lstmsg) msg.innerHTML=global.lastmsg+'('+(++global.lastmsgc)+')';
        //  else {global.lastmsg=msg.innerHTML;global.lastmsgc=0;}} else global.lastmsg=msg.innerHTML;
      }
    }

    export function _msg(txt: string, c?: string, dsc?: any, type?: any, bc?: string, chck?: any): void {
      while (dom.gmsgs.children[1].children.length > global.msgs_max - 1) dom.gmsgs.children[1].removeChild(dom.gmsgs.children[1].children[0]);
      let msg = addElement(dom.mscont, 'div', null, 'msg');
      if (dsc) { if (type) addDesc(msg, dsc, type); else addDesc(msg, dsc); }
      if (c) msg.innerHTML = '<span style=color:' + c + (bc ? (';background-color:' + bc) : '') + '>' + txt + '</span>';
      else msg.innerHTML = txt;
      dom.mscont.scrollTop = dom.mscont.scrollHeight;
    }


    export function msg_add(txt: string, c?: string, bc?: string, shd?: any): void {
      if (flags.m_freeze === false && flags.loadstate === false) {
        let bac = '';
        let b = '';
        if (bc) bac = 'background-color:' + bc;
        if (shd) b = 'text-shadow:' + shd.toString();
        else b = '';
        if (c) (dom.gmsgs.children[1].children[dom.gmsgs.children[1].children.length - 1] as HTMLElement).innerHTML += '<span style=\"color:' + c + ';' + bac + ';' + b + '\">' + txt + '</span>';
        else (dom.gmsgs.children[1].children[dom.gmsgs.children[1].children.length - 1] as HTMLElement).innerHTML += txt;
        dom.mscont.scrollTop = dom.mscont.scrollHeight;
      }
    }
