import type { Item, Equipment, Effect, Skill, Title, Creature, Furniture, Action } from '../types';
import { addElement, empty } from '../dom-utils';
import { col } from '../utils';
import { dom, global, you, timers, furn, data, stats, combat, } from '../state';
const { skl } = data;
import { giveSkExp } from '../game/progression';

    export function dscr(event: MouseEvent, what: any, type?: number, ttl?: any, dsc?: any, id?: number) {
      let self: any = {};
      id = id || 0;
      global.dscr.style.display = '';
      empty(global.dscr);
      global.dscr.style.top = event.clientY + 30;
      global.dscr.style.left = event.clientX + 30;
      if (!type || type === 1) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = what.name;
        switch (what.rar) {
          case 0: { self.label.style.color = 'grey'; break }
          case 2: { self.label.style.textShadow = '0px 0px 1px blue'; self.label.style.color = 'cyan'; break }
          case 3: { self.label.style.textShadow = '0px 0px 2px lime'; self.label.style.color = 'lime'; break }
          case 4: { self.label.style.textShadow = '0px 0px 3px orange'; self.label.style.color = 'yellow'; break }
          case 5: { self.label.style.textShadow = '0px 0px 2px crimson,0px 0px 5px red'; self.label.style.color = 'orange'; break }
          case 6: { self.label.style.textShadow = '1px 1px 1px black,0px 0px 2px purple'; self.label.style.color = 'purple'; break }
        }
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = typeof what.desc === 'function' ? (what.desc)(what) : what.desc;
        if (what.slot > 0) {
          if (what.slot === 1) {
            if (what.str > 0) self.text.innerHTML += 'STR: <span style=\'color:lime\'> +' + what.str + '</span><br>';
            else if (what.str < 0) self.text.innerHTML += 'STR: <span style=\'color:red\'>' + what.str + '</span><br>';
          }
          else {
            if (what.str > 0) self.text.innerHTML += 'DEF: <span style=\'color:lime\'> +' + what.str + '</span><br>';
            else if (what.str < 0) self.text.innerHTML += 'DEF: <span style=\'color:red\'>' + what.str + '</span><br>';
          }
          if (what.agl > 0) self.text.innerHTML += 'AGL: <span style=\'color:lime\'> +' + what.agl + '</span><br>';
          else if (what.agl < 0) self.text.innerHTML += 'AGL: <span style=\'color:red\'>' + what.agl + '</span><br>';
          if (what.int > 0) self.text.innerHTML += 'INT: <span style=\'color:lime\'> +' + what.int + '</span><br>';
          else if (what.int < 0) self.text.innerHTML += 'INT: <span style=\'color:red\'>' + what.int + '</span><br>';
          if (what.spd > 0) self.text.innerHTML += 'SPD: <span style=\'color:lime\'> +' + what.spd + '</span><br>';
          else if (what.spd < 0) self.text.innerHTML += 'SPD: <span style=\'color:red\'>' + what.spd + '</span><br>';

          if (what.slot < 8) {
            self.dp_c = addElement(global.dscr, 'div', 'dr_l');
            self.dp_t = addElement(self.dp_c, 'small');
            self.dp_t.innerHTML = 'DP:'
            self.dp_m = addElement(self.dp_c, 'small', 'dp_m');
            self.dp_mn = addElement(self.dp_m, 'small');
            self.dp_mn.innerHTML = ((what.dp * 10 << 0) / 10) + '\/' + what.dpmax;
            self.dp_mn.style.textShadow = '1px 1px black';
            //self.dp_mn.style.backgroundColor='rgba(102, 51, 153,.8)';
            self.dp_mn.style.position = 'inherit';
            self.dp_mn.style.top = -4;
            //self.dp_mn.style.border='1px black solid';
            self.dp_mn.style.padding = 1;
            self.dp_mn.style.left = '35%';
            let dp = what.dp * 100 / what.dpmax;
            self.dp_m.style.width = dp + '%';
            if (dp >= 90) self.dp_m.style.backgroundColor = 'royalblue';
            else if (dp < 90 && dp >= 70) self.dp_m.style.backgroundColor = 'green';
            else if (dp < 70 && dp >= 35) self.dp_m.style.backgroundColor = 'yellow';
            else if (dp < 35 && dp >= 10) self.dp_m.style.backgroundColor = 'orange';
            else if (dp < 10) self.dp_m.style.backgroundColor = 'red';
            clearInterval(timers.dp_tmr);
            timers.dp_tmr = setInterval(function () {
              let dp = what.dp * 100 / what.dpmax;
              self.dp_mn.innerHTML = ((what.dp * 10 << 0) / 10) + '\/' + what.dpmax;
              self.dp_m.style.width = dp + '%';
              if (dp >= 90) self.dp_m.style.backgroundColor = 'royalblue';
              else if (dp < 90 && dp >= 70) self.dp_m.style.backgroundColor = 'green';
              else if (dp < 70 && dp >= 35) self.dp_m.style.backgroundColor = 'yellow';
              else if (dp < 35 && dp >= 10) self.dp_m.style.backgroundColor = 'orange';
              else if (dp < 10) self.dp_m.style.backgroundColor = 'red';
            }, 1000);
          }
          self.sltic = addElement(global.dscr, 'div', 'intfffx');
          self.sltic.style.textAlign = 'left';
          let slti = addElement(self.sltic, 'small');
          slti.innerHTML = '<br>Class: ';
          if (!!what.wtype) {
            switch (what.wtype) {
              case 0: slti.innerHTML += 'Unarmed';
                break;
              case 1: slti.innerHTML += 'Sword';
                break;
              case 2: slti.innerHTML += 'Axe';
                break;
              case 3: slti.innerHTML += 'Knife';
                break;
              case 4: slti.innerHTML += 'Spear/Polearm';
                break;
              case 5: slti.innerHTML += 'Club/Hammer';
                break;
              case 6: slti.innerHTML += 'Staff/Wand';
                break;
              case 7: slti.innerHTML += 'Bow/Crossbow';
                break;
            }
          }
          else {
            switch (what.slot) {
              case 2: slti.innerHTML += 'Shield';
                break;
              case 3: slti.innerHTML += 'Head';
                break;
              case 4: slti.innerHTML += 'Body';
                break;
              case 5: slti.innerHTML += 'Hands';
                break;
              case 6: slti.innerHTML += 'Hands';
                break;
              case 7: slti.innerHTML += 'Legs';
                break;
              case 8: slti.innerHTML += 'Accessory';
                break;
              case 9: slti.innerHTML += 'Accessory';
                break;
              case 10: slti.innerHTML += 'Accessory';
                break;
            }
          }
          if (what.twoh === true) slti.innerHTML += ' (2H)';
          if (what.slot === 1) switch (what.ctype) {
            case 0: slti.innerHTML += ', Edged';
              break;
            case 1: slti.innerHTML += ', Piercing';
              break;
            case 2: slti.innerHTML += ', Blunt';
              break;
          }
          if (what.data.kills) {
            let sp = addElement(self.sltic, 'small');
            sp.style.position = 'absolute';
            sp.style.right = '6px';
            sp.innerHTML = 'kills: ' + col(what.data.kills, 'yellow');
            clearInterval(timers.wpnkilsch);
            timers.wpnkilsch = setInterval(function () {
              sp.innerHTML = 'kills: ' + col(what.data.kills, 'yellow');
            }, 1000);
          }
        } else {
          self.sltic = addElement(global.dscr, 'div');
          self.sltic.style.textAlign = 'left';
          let slti = addElement(self.sltic, 'small');
          slti.innerHTML = '<br>Class: ';
          if (what.isf === true) {
            slti.innerHTML += 'Furniture';
            self.text.innerHTML += dom.dseparator + '<span style="color:chartreuse">Use to add to the furniture list</span>';
            if (what.parent) {
              let owned = false;
              let sp = addElement(self.sltic, 'small');
              sp.style.position = 'absolute';
              sp.style.right = '6px';
              for (let a in furn) if (furn[a].id === what.parent.id) { owned = true; break };
              sp.innerHTML = 'owned: <span style="color:' + (owned ? 'lime' : 'red') + '">' + (owned ? 'yes' : 'no') + '</span>'
            }
          }
          else if (what.id < 3000) { slti.innerHTML += 'Food'; if (what.rot) slti.innerHTML += '(' + '<span style="color:orange">perishable</span>' + ')' }
          else if (what.id >= 3000 && what.id < 5000) slti.innerHTML += 'Medicine/Tool';
          else if (what.id >= 5000 && what.id < 9000) slti.innerHTML += 'Material/Misc';
          else slti.innerHTML += 'Book';
        }
        if (what.id < 3000) {
          dom.dtrd = addElement(self.sltic, 'small');
          dom.dtrd.innerHTML = 'Tried: ';
          dom.dtrd.style.position = 'relative';
          dom.dtrd.style.right = 1;
          dom.dtrd.style.float = 'right';
          if (what.data.tried === true) dom.dtrd.innerHTML += '<span style="color: lime">Yes</span>';
          else dom.dtrd.innerHTML += '<span style="color: crimson">Never</span>'
        }
        if (what.id >= 9000 && what.id < 10000) {
          dom.dtrd = addElement(self.sltic, 'small');
          dom.dtrd.innerHTML = 'Read: ';
          dom.dtrd.style.position = 'relative';
          dom.dtrd.style.right = 1;
          dom.dtrd.style.float = 'right';
          if (what.data.finished === true) dom.dtrd.innerHTML += '<span style="color: lime">Yes</span>';
          else dom.dtrd.innerHTML += '<span style="color: crimson">Never</span>'
        }
        self.rar_c = addElement(global.dscr, 'div', 'd_l');
        self.rar = addElement(self.rar_c, 'small');
        self.rar.innerHTML = '<br>Rarity: ';
        self.rar.style.position = 'relative';
        self.rar.style.float = 'left';
        for (let i = 0; i < what.rar; i++) self.rar.innerHTML += ' ★ ';
        dom.dscshe = addElement(global.dscr, 'div');
        //dom.dscshe.innerHTML = dom.dseparator+'2323';
        dom.dscshe.style.paddingTop = 20;
        global.shiftitem = { item: what };
      }
      else if (type === 2) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = ttl;
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = dsc;
      }
      else if (type === 3) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = combat.currentMonster.name;
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = combat.currentMonster.desc;
      }
      else if (type === 4) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = ttl;
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = dsc;
        dom.gde = addElement(global.dscr, 'small');
        dom.gde.style.position = 'relavite';
        dom.gde.style.float = 'left';
        dom.gde.innerHTML = '<br>Duration: ';
        if (what.duration !== -1) dom.gde.innerHTML += what.duration;
        else dom.gde.innerHTML += '∞';
        if (what.power) {
          dom.gde1 = addElement(global.dscr, 'small');
          dom.gde1.style.position = 'relavite';
          dom.gde1.style.float = 'right';
          dom.gde1.innerHTML = '<br>Power: ';
          dom.gde1.innerHTML += what.power;
        }
        clearInterval(timers.inup);
        timers.inup = setInterval(function () { dom.gde.innerHTML = '<br>Duration: '; if (what.duration !== -1) dom.gde.innerHTML += what.duration; else dom.gde.innerHTML += '∞'; }, 200);
      }
      else if (type === 5) {
        let t = ttl === true ? you.title : what;
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = t.name
        switch (t.rar) {
          case 0: { self.label.style.color = 'grey'; break }
          case 2: { self.label.style.textShadow = '0px 0px 1px blue'; self.label.style.color = 'cyan'; break }
          case 3: { self.label.style.textShadow = '0px 0px 2px lime'; self.label.style.color = 'lime'; break }
          case 4: { self.label.style.textShadow = '0px 0px 3px orange'; self.label.style.color = 'yellow'; break }
          case 5: { self.label.style.textShadow = '0px 0px 2px crimson,0px 0px 5px red'; self.label.style.color = 'orange'; break }
          case 6: { self.label.style.textShadow = '1px 1px 1px black,0px 0px 2px purple'; self.label.style.color = 'purple'; break }
          case 7: { self.dl.style.textShadow = 'hotpink 1px 1px .1em,cyan -1px -1px .1em'; self.dl.style.color = 'black'; break }
        }
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = t.desc
        if (t.talent) self.text.innerHTML += (dom.dseparator + '<small style="color:cyan">talent effect<br></small><br><small style="color:darkorange">' + t.tdesc + '</small>')
        self.dl = addElement(global.dscr, 'small');
        self.dl.style.position = 'relative';
        self.dl.style.display = 'flex';
        self.dl.innerHTML = '<br>Rank: ' + (ttl === true ? (you.title.id === 0 ? '0' : you.title.rar) : (what.id === 0 ? '0' : what.rar));
        if (ttl === true && you.title.rars === true || !ttl && what.rars === true) self.dl.innerHTML += '★';
      }
      else if (type === 6) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = !!what.bname ? what.bname : what.name;
        self.sp = addElement(self.label, 'small');
        self.sp.style.position = 'absolute';
        self.sp.style.right = '6px';
        self.sp.innerHTML = 'Ｐ: ' + (col((Math.round(what.p * 100) + '%'), 'magenta'));
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = what.desc;
        if (!!what.mlstn) {
          self.prks = addElement(global.dscr, 'div', 'd_l'); self.prks.innerHTML = '<br>Perks unlocked'; self.prks.style.color = 'cyan';
          for (let k = 0; k < what.mlstn.length; k++) if (what.mlstn[k].g === true) {
            self.prk = addElement(global.dscr, 'div', 'd_t');
            self.prk.innerHTML = 'lvl ' + what.mlstn[k].lv + ':<span style="color:yellow"> ' + what.mlstn[k].p + ' </span>';
          } else {
            self.prk = addElement(global.dscr, 'div', 'd_t');
            self.prk.innerHTML = 'lvl ' + what.mlstn[k].lv + ':<span style="color:yellow"> ' + '??????????' + ' </span>';
            return
          }
        }
      }
      else if (type === 7) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = what.x;
        self.label.style.color = 'tomato';
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = what.y;
      }
      else if (type === 8) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = what.name;
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = what.desc;
        self.dl = addElement(global.dscr, 'small');
        self.dl.style.position = 'relative';
        self.dl.style.display = 'flex';
        self.dl.innerHTML = '<br>Rank: ';
        self.db = addElement(self.dl, 'div');
        for (let i = 0; i < what.rar; i++) self.db.innerHTML += '★';
        self.db.style.paddingTop = 12;
        self.db.style.paddingLeft = 6;
        switch (what.rar) {
          case 0: { self.label.style.color = self.db.style.color = 'grey'; break }
          case 2: { self.label.style.textShadow = self.db.style.textShadow = '0px 0px 1px blue'; self.label.style.color = self.db.style.color = 'cyan'; break }
          case 3: { self.label.style.textShadow = self.db.style.textShadow = '0px 0px 2px lime'; self.label.style.color = self.db.style.color = 'lime'; break }
          case 4: { self.label.style.textShadow = self.db.style.textShadow = '0px 0px 3px orange'; self.label.style.color = self.db.style.color = 'yellow'; break }
          case 5: { self.label.style.textShadow = self.db.style.textShadow = '0px 0px 2px crimson,0px 0px 5px red'; self.label.style.color = self.db.style.color = 'orange'; break }
          case 6: { self.label.style.textShadow = self.db.style.textShadow = '1px 1px 1px black,0px 0px 2px purple'; self.label.style.color = self.db.style.color = 'purple'; break }
          case 7: { self.label.style.textShadow = self.db.style.textShadow = 'hotpink 1px 1px .1em,cyan -1px -1px .1em'; self.label.style.color = self.db.style.color = 'black'; break }
        }
      }
      else if (type === 9) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = what.name;
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = typeof what.desc === 'function' ? (what.desc)(what) : what.desc;
      }
      else if (type === 10) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = what.name;
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = what.desc + dom.dseparator;
        let t = Object.keys(global.dropData);
        let ids: any[] = [];
        for (let a in t) ids[a as any] = Number(t[a as any].substring(1));
        self.o = addElement(self.text, 'small');
        self.o.innerHTML = 'drop table';
        self.o.style.color = 'cyan';
        let thing = false;
        for (let a in ids) {
          if (ids[a] === what.id || what.un) {
            let dt = global.dropData[Object.keys(global.dropData)[a]]; thing = true;
            for (let b in what.drop) {
              self.dbig = addElement(self.text, 'div');
              self.dbig.style.display = 'flex';
              self.dbig.style.border = '#1f72a2 1px solid';
              self.dbig.style.backgroundColor = '#202031';
              self.dcell1 = addElement(self.dbig, 'div');
              self.dcell2 = addElement(self.dbig, 'div');
              self.dbig.style.textAlign = 'center';
              self.dcell1.style.width = '80%';
              self.dcell1.style.borderRight = '#1f72a2 1px solid';
              self.dcell2.style.width = '20%';
              if (Number(b) != what.drop.length - 1) self.dbig.style.borderBottom = 'none'
              self.dcell2.innerHTML = ((what.drop[b].chance * 100000000 << 0) / 1000000 + '%');
              if (what.drop[b].chance >= .05) self.dcell2.style.color = 'lime';
              else if (what.drop[b].chance < .05 && what.drop[b].chance > .01) self.dcell2.style.color = 'yellow';
              else if (what.drop[b].chance <= .01 && what.drop[b].chance > .001) self.dcell2.style.color = 'orange';
              else if (what.drop[b].chance <= .001) self.dcell2.style.color = 'crimson';
              if (dt[b] || what.un) {
                self.dcell1.innerHTML += what.drop[b].item.name
                if (what.drop[b].cond && !what.drop[b].cond()) { self.dcell1.style.textDecoration = 'line-through'; self.dcell1.style.color = 'red' }
                switch (what.rar) {
                  case 0: { self.dcell1.style.color = 'grey'; break }
                  case 2: { self.dcell1.style.textShadow = '0px 0px 1px blue'; self.dcell1.style.color = 'cyan'; break }
                  case 3: { self.dcell1.style.textShadow = '0px 0px 2px lime'; self.dcell1.style.color = 'lime'; break }
                  case 4: { self.dcell1.style.textShadow = '0px 0px 3px orange'; self.dcell1.style.color = 'yellow'; break }
                  case 5: { self.dcell1.style.textShadow = '0px 0px 2px crimson,0px 0px 5px red'; self.dcell1.style.color = 'orange'; break }
                  case 6: { self.dcell1.style.textShadow = '1px 1px 1px black,0px 0px 2px purple'; self.dcell1.style.color = 'purple'; break }
                }
                if (what.drop[b].max) {
                  self.dcell1b = addElement(self.dcell1, 'small'); self.dcell1b.style.color = 'inherit'; self.dcell1b.style.position = 'absolute'
                  self.dcell1b.style.right = 70;
                  self.dcell1b.style.paddingTop = 2;
                  self.dcell1b.innerHTML = what.drop[b].max;
                  if (what.drop[b].min && what.drop[b].min !== what.drop[b].max) self.dcell1b.innerHTML += ('-' + what.drop[b].min)
                }
              }
              else { self.dcell1.innerHTML = '???????????'; self.dcell1.style.color = 'yellow' }
            }
            break
          }
        }
        if (!thing) {
          for (let b in what.drop) {
            self.dbig = addElement(self.text, 'div');
            self.dbig.style.display = 'flex';
            self.dbig.style.border = '#1f72a2 1px solid';
            self.dbig.style.backgroundColor = '#202031';
            self.dcell1 = addElement(self.dbig, 'div');
            self.dcell2 = addElement(self.dbig, 'div');
            self.dbig.style.textAlign = 'center';
            self.dcell1.style.width = '80%';
            self.dcell1.style.borderRight = '#1f72a2 1px solid';
            self.dcell2.style.width = '20%'
            if (Number(b) != what.drop.length - 1) self.dbig.style.borderBottom = 'none'
            self.dcell1.innerHTML = '???????????';
            self.dcell1.style.color = 'yellow';
            self.dcell2.innerHTML = ((what.drop[b].chance * 100000000 << 0) / 1000000 + '%');
            if (what.drop[b].chance >= .05) self.dcell2.style.color = 'lime';
            else if (what.drop[b].chance < .05 && what.drop[b].chance > .01) self.dcell2.style.color = 'yellow';
            else if (what.drop[b].chance <= .01 && what.drop[b].chance > .001) self.dcell2.style.color = 'orange';
            else if (what.drop[b].chance <= .001) self.dcell2.style.color = 'crimson';
          }
        }
      }
      else if (type === 12) {
        self.label = addElement(global.dscr, 'div', 'd_l');
        self.label.innerHTML = ttl;
        self.text = addElement(global.dscr, 'div', 'd_t');
        self.text.innerHTML = typeof dsc === 'function' ? (dsc)(what) : dsc;
      }
    }

    export function addDesc(this: any, dm: HTMLElement, what: any, type?: number | null, ttl?: string | boolean | null, dsc?: string | (() => string) | null, f?: boolean | null, id?: number | null) {
      dm.addEventListener('mouseenter', (a: any) => { dscr(a, what, type ?? undefined, ttl, f === true ? (dsc as () => string)() : dsc, id ?? undefined); giveSkExp(skl.rdg, .002); stats.descriptionViews++; global.curwds = this; global.shiftid = id; if (global.kkey === 1) descsinfo(global.shiftid) });
      dm.addEventListener('mousemove', (a: any) => { global.dscr.style.top = global.dscr.clientHeight + 60 + a.clientY > document.body.clientHeight ? (a.clientY + 30 + global.dscr.clientHeight) - ((a.clientY + 30 + global.dscr.clientHeight) - document.body.clientHeight) - global.dscr.clientHeight - 30 : a.clientY + 30; global.dscr.style.left = global.dscr.clientWidth + 60 + a.clientX > document.body.clientWidth ? (a.clientX + 30 + global.dscr.clientWidth) - ((a.clientX + 30 + global.dscr.clientWidth) - document.body.clientWidth) - global.dscr.clientWidth - 30 : a.clientX + 30; });
      dm.addEventListener('mouseleave', () => { global.shiftid = 0; empty(global.dscr); global.dscr.style.display = 'none'; clearInterval(timers.inup); clearInterval(timers.dp_tmr); clearInterval(timers.wpnkilsch); if (dom.dscshe) dom.dscshe.innerHTML = '' });
    }

    export function descsinfo(id: number) {
      if (id === 100) if (global.shiftitem.item.rot && you.mods.survivalInfo > 0) {
        let itm = global.shiftitem.item;
        let ds, rs, dt, rt, c
        switch (you.mods.survivalInfo) {
          case 1:
            ds = Math.ceil(itm.amount * ((itm.rot[2] + itm.rot[3]) / 2));
            rs = itm.data.rottil;
            dt = '';
            rt = '';
            c = '';
            if (ds < 5) dt = 'a couple';
            else if (ds < 10) dt = 'a few';
            else if (ds < 30) dt = 'some';
            else if (ds < 50) dt = 'multiple';
            else if (ds < 100) dt = 'dozens';
            else dt = 'many';
            if (rs < .1) { rt = 'very fresh'; c = 'lime' } else if (rs < .2) { rt = 'fresh'; c = 'limegreen' } else if (rs < .5) { rt = 'like it\'s reaching midlife'; c = 'yellow' } else if (rs < .75) { rt = 'will go bad soon'; c = 'grey' } else if (rs < 1) { rt = 'are almost decayed'; c = 'red' }
            if (rs < .5) dom.dscshe.innerHTML = dom.dseparator + '<span style="color:orange">This food looks <span style="color:' + c + '">' + rt + '</span>';
            else dom.dscshe.innerHTML = dom.dseparator + '<span style="color:orange"><span style="color:cyan">' + dt + '</span> units of this item <span style="color:' + c + '">' + rt + '</span></span>';
            break;
          case 2:
            ds = Math.ceil(itm.amount * ((itm.rot[2] + itm.rot[3]) / 2));
            rs = (Math.ceil((1 - itm.data.rottil) / ((itm.rot[0] + itm.rot[1]) / 2)));
            dom.dscshe.innerHTML = dom.dseparator + '<span style="color:orange">Upon examination, about <span style="color:cyan">' + ds + '</span> units of this item will decay in approximately <span style="color:yellow">' + rs + '</span> days</span>';
            break;
        }
        dom.dscshe.style.paddingTop = 20;
      }
    }
