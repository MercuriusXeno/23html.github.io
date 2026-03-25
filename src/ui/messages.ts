import { addElement } from '../dom-utils';
import { dom, global, settings, flags } from '../state';
import { addDesc } from './descriptions';

    export function msg(txt: string, color?: string, dsc?: any, type?: number | null, bgColor?: string, chck?: any): void {
      if (flags.monsterFreeze === false && flags.loadstate === false) {
        while (dom.gmsgs.children[1].children.length > settings.msgs_max - 1) dom.gmsgs.children[1].removeChild(dom.gmsgs.children[1].children[0]);
        let msg = addElement(dom.mscont, 'div', null, 'msg');
        if (flags.messageTime) {
          let now = new Date();
          let g = addElement(msg, 'small');
          g.innerHTML = '[' + (now.getHours() < 10 ? ('0' + now.getHours()) : now.getHours()) + ':' + (now.getMinutes() < 10 ? ('0' + now.getMinutes()) : now.getMinutes()) + ':' + (now.getSeconds() < 10 ? ('0' + now.getSeconds()) : now.getSeconds()) + ']'
          g.style.backgroundColor = '#242848';
          g.style.display = 'flex';
        }
        let mtxt = addElement(msg, 'span');
        if (dsc) { if (type) addDesc(msg, dsc, type); else addDesc(msg, dsc); }
        //let nt = new String(); for(let a in txt){nt+=txt[a].charCodeAt()!==32?String.fromCharCode(41216-txt[a].charCodeAt()):' '}; txt=nt;
        if (color) mtxt.innerHTML = '<span style=color:' + color + (bgColor ? (';background-color:' + bgColor) : '') + '>' + txt + '</span>';
        else mtxt.innerHTML = txt;
        dom.mscont.scrollTop = dom.mscont.scrollHeight;
        global.lastmsg = msg.innerHTML;
        //if(true) {if(msg.innerHTML==global.lstmsg) msg.innerHTML=global.lastmsg+'('+(++global.lastMessageCount)+')';
        //  else {global.lastmsg=msg.innerHTML;global.lastMessageCount=0;}} else global.lastmsg=msg.innerHTML;
      }
    }

    export function _msg(txt: string, color?: string, dsc?: any, type?: number | null, bgColor?: string, chck?: any): void {
      while (dom.gmsgs.children[1].children.length > settings.msgs_max - 1) dom.gmsgs.children[1].removeChild(dom.gmsgs.children[1].children[0]);
      let msg = addElement(dom.mscont, 'div', null, 'msg');
      if (dsc) { if (type) addDesc(msg, dsc, type); else addDesc(msg, dsc); }
      if (color) msg.innerHTML = '<span style=color:' + color + (bgColor ? (';background-color:' + bgColor) : '') + '>' + txt + '</span>';
      else msg.innerHTML = txt;
      dom.mscont.scrollTop = dom.mscont.scrollHeight;
    }


    export function msg_add(txt: string, color?: string, bgColor?: string, shadow?: string): void {
      if (flags.monsterFreeze === false && flags.loadstate === false) {
        let bac = '';
        let b = '';
        if (bgColor) bac = 'background-color:' + bgColor;
        if (shadow) b = 'text-shadow:' + shadow.toString();
        else b = '';
        if (color) (dom.gmsgs.children[1].children[dom.gmsgs.children[1].children.length - 1] as HTMLElement).innerHTML += '<span style=\"color:' + color + ';' + bac + ';' + b + '\">' + txt + '</span>';
        else (dom.gmsgs.children[1].children[dom.gmsgs.children[1].children.length - 1] as HTMLElement).innerHTML += txt;
        dom.mscont.scrollTop = dom.mscont.scrollHeight;
      }
    }
