import { addElement, empty } from '../dom-utils';
import { col } from '../utils';
import { dom, global, you, timers, furn, skl } from '../state';
import { giveSkExp } from '../main';

    export function dscr(c, what, type, ttl, dsc, id) {
      id = id || 0;
      global.dscr.style.display = '';
      empty(global.dscr);
      global.dscr.style.top = c.clientY + 30;
      global.dscr.style.left = c.clientX + 30;
      if (!type || type === 1) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = what.name;
        switch (what.rar) {
          case 0: { this.label.style.color = 'grey'; break }
          case 2: { this.label.style.textShadow = '0px 0px 1px blue'; this.label.style.color = 'cyan'; break }
          case 3: { this.label.style.textShadow = '0px 0px 2px lime'; this.label.style.color = 'lime'; break }
          case 4: { this.label.style.textShadow = '0px 0px 3px orange'; this.label.style.color = 'yellow'; break }
          case 5: { this.label.style.textShadow = '0px 0px 2px crimson,0px 0px 5px red'; this.label.style.color = 'orange'; break }
          case 6: { this.label.style.textShadow = '1px 1px 1px black,0px 0px 2px purple'; this.label.style.color = 'purple'; break }
        }
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = typeof what.desc === 'function' ? (what.desc)(what) : what.desc;
        if (what.slot > 0) {
          if (what.slot === 1) {
            if (what.str > 0) this.text.innerHTML += 'STR: <span style=\'color:lime\'> +' + what.str + '</span><br>';
            else if (what.str < 0) this.text.innerHTML += 'STR: <span style=\'color:red\'>' + what.str + '</span><br>';
          }
          else {
            if (what.str > 0) this.text.innerHTML += 'DEF: <span style=\'color:lime\'> +' + what.str + '</span><br>';
            else if (what.str < 0) this.text.innerHTML += 'DEF: <span style=\'color:red\'>' + what.str + '</span><br>';
          }
          if (what.agl > 0) this.text.innerHTML += 'AGL: <span style=\'color:lime\'> +' + what.agl + '</span><br>';
          else if (what.agl < 0) this.text.innerHTML += 'AGL: <span style=\'color:red\'>' + what.agl + '</span><br>';
          if (what.int > 0) this.text.innerHTML += 'INT: <span style=\'color:lime\'> +' + what.int + '</span><br>';
          else if (what.int < 0) this.text.innerHTML += 'INT: <span style=\'color:red\'>' + what.int + '</span><br>';
          if (what.spd > 0) this.text.innerHTML += 'SPD: <span style=\'color:lime\'> +' + what.spd + '</span><br>';
          else if (what.spd < 0) this.text.innerHTML += 'SPD: <span style=\'color:red\'>' + what.spd + '</span><br>';

          if (what.slot < 8) {
            this.dp_c = addElement(global.dscr, 'div', 'dr_l');
            this.dp_t = addElement(this.dp_c, 'small');
            this.dp_t.innerHTML = 'DP:'
            this.dp_m = addElement(this.dp_c, 'small', 'dp_m');
            this.dp_mn = addElement(this.dp_m, 'small');
            this.dp_mn.innerHTML = ((what.dp * 10 << 0) / 10) + '\/' + what.dpmax;
            this.dp_mn.style.textShadow = '1px 1px black';
            //this.dp_mn.style.backgroundColor='rgba(102, 51, 153,.8)';
            this.dp_mn.style.position = 'inherit';
            this.dp_mn.style.top = -4;
            //this.dp_mn.style.border='1px black solid';
            this.dp_mn.style.padding = 1;
            this.dp_mn.style.left = '35%';
            let dp = what.dp * 100 / what.dpmax;
            this.dp_m.style.width = dp + '%';
            if (dp >= 90) this.dp_m.style.backgroundColor = 'royalblue';
            else if (dp < 90 && dp >= 70) this.dp_m.style.backgroundColor = 'green';
            else if (dp < 70 && dp >= 35) this.dp_m.style.backgroundColor = 'yellow';
            else if (dp < 35 && dp >= 10) this.dp_m.style.backgroundColor = 'orange';
            else if (dp < 10) this.dp_m.style.backgroundColor = 'red';
            clearInterval(timers.dp_tmr);
            timers.dp_tmr = setInterval(function () {
              let dp = what.dp * 100 / what.dpmax;
              this.dp_mn.innerHTML = ((what.dp * 10 << 0) / 10) + '\/' + what.dpmax;
              this.dp_m.style.width = dp + '%';
              if (dp >= 90) this.dp_m.style.backgroundColor = 'royalblue';
              else if (dp < 90 && dp >= 70) this.dp_m.style.backgroundColor = 'green';
              else if (dp < 70 && dp >= 35) this.dp_m.style.backgroundColor = 'yellow';
              else if (dp < 35 && dp >= 10) this.dp_m.style.backgroundColor = 'orange';
              else if (dp < 10) this.dp_m.style.backgroundColor = 'red';
            }, 1000);
          }
          this.sltic = addElement(global.dscr, 'div', 'intfffx');
          this.sltic.style.textAlign = 'left';
          let slti = addElement(this.sltic, 'small');
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
            let sp = addElement(this.sltic, 'small');
            sp.style.position = 'absolute';
            sp.style.right = 6;
            sp.innerHTML = 'kills: ' + col(what.data.kills, 'yellow');
            clearInterval(timers.wpnkilsch);
            timers.wpnkilsch = setInterval(function () {
              sp.innerHTML = 'kills: ' + col(what.data.kills, 'yellow');
            }, 1000);
          }
        } else {
          this.sltic = addElement(global.dscr, 'div');
          this.sltic.style.textAlign = 'left';
          let slti = addElement(this.sltic, 'small');
          slti.innerHTML = '<br>Class: ';
          if (what.isf === true) {
            slti.innerHTML += 'Furniture';
            this.text.innerHTML += dom.dseparator + '<span style="color:chartreuse">Use to add to the furniture list</span>';
            if (what.parent) {
              let owned = false;
              let sp = addElement(this.sltic, 'small');
              sp.style.position = 'absolute';
              sp.style.right = 6;
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
          dom.dtrd = addElement(this.sltic, 'small');
          dom.dtrd.innerHTML = 'Tried: ';
          dom.dtrd.style.position = 'relative';
          dom.dtrd.style.right = 1;
          dom.dtrd.style.float = 'right';
          if (what.data.tried === true) dom.dtrd.innerHTML += '<span style="color: lime">Yes</span>';
          else dom.dtrd.innerHTML += '<span style="color: crimson">Never</span>'
        }
        if (what.id >= 9000 && what.id < 10000) {
          dom.dtrd = addElement(this.sltic, 'small');
          dom.dtrd.innerHTML = 'Read: ';
          dom.dtrd.style.position = 'relative';
          dom.dtrd.style.right = 1;
          dom.dtrd.style.float = 'right';
          if (what.data.finished === true) dom.dtrd.innerHTML += '<span style="color: lime">Yes</span>';
          else dom.dtrd.innerHTML += '<span style="color: crimson">Never</span>'
        }
        this.rar_c = addElement(global.dscr, 'div', 'd_l');
        this.rar = addElement(this.rar_c, 'small');
        this.rar.innerHTML = '<br>Rarity: ';
        this.rar.style.position = 'relative';
        this.rar.style.float = 'left';
        for (let i = 0; i < what.rar; i++) this.rar.innerHTML += ' ★ ';
        dom.dscshe = addElement(global.dscr, 'div');
        //dom.dscshe.innerHTML = dom.dseparator+'2323';
        dom.dscshe.style.paddingTop = 20;
        global.shiftitem = { item: what };
      }
      else if (type === 2) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = ttl;
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = dsc;
      }
      else if (type === 3) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = global.current_m.name;
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = global.current_m.desc;
      }
      else if (type === 4) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = ttl;
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = dsc;
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
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = t.name
        switch (t.rar) {
          case 0: { this.label.style.color = 'grey'; break }
          case 2: { this.label.style.textShadow = '0px 0px 1px blue'; this.label.style.color = 'cyan'; break }
          case 3: { this.label.style.textShadow = '0px 0px 2px lime'; this.label.style.color = 'lime'; break }
          case 4: { this.label.style.textShadow = '0px 0px 3px orange'; this.label.style.color = 'yellow'; break }
          case 5: { this.label.style.textShadow = '0px 0px 2px crimson,0px 0px 5px red'; this.label.style.color = 'orange'; break }
          case 6: { this.label.style.textShadow = '1px 1px 1px black,0px 0px 2px purple'; this.label.style.color = 'purple'; break }
          case 7: { this.dl.style.textShadow = 'hotpink 1px 1px .1em,cyan -1px -1px .1em'; this.dl.style.color = 'black'; break }
        }
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = t.desc
        if (t.talent) this.text.innerHTML += (dom.dseparator + '<small style="color:cyan">talent effect<br></small><br><small style="color:darkorange">' + t.tdesc + '</small>')
        this.dl = addElement(global.dscr, 'small');
        this.dl.style.position = 'relative';
        this.dl.style.display = 'flex';
        this.dl.innerHTML = '<br>Rank: ' + (ttl === true ? (you.title.id === 0 ? '0' : you.title.rar) : (what.id === 0 ? '0' : what.rar));
        if (ttl === true && you.title.rars === true || !ttl && what.rars === true) this.dl.innerHTML += '★';
      }
      else if (type === 6) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = !!what.bname ? what.bname : what.name;
        this.sp = addElement(this.label, 'small');
        this.sp.style.position = 'absolute';
        this.sp.style.right = 6;
        this.sp.innerHTML = 'Ｐ: ' + (col((Math.round(what.p * 100) + '%'), 'magenta'));
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = what.desc;
        if (!!what.mlstn) {
          this.prks = addElement(global.dscr, 'div', 'd_l'); this.prks.innerHTML = '<br>Perks unlocked'; this.prks.style.color = 'cyan';
          for (let k = 0; k < what.mlstn.length; k++) if (what.mlstn[k].g === true) {
            this.prk = addElement(global.dscr, 'div', 'd_t');
            this.prk.innerHTML = 'lvl ' + what.mlstn[k].lv + ':<span style="color:yellow"> ' + what.mlstn[k].p + ' </span>';
          } else {
            this.prk = addElement(global.dscr, 'div', 'd_t');
            this.prk.innerHTML = 'lvl ' + what.mlstn[k].lv + ':<span style="color:yellow"> ' + '??????????' + ' </span>';
            return
          }
        }
      }
      else if (type === 7) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = what.x;
        this.label.style.color = 'tomato';
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = what.y;
      }
      else if (type === 8) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = what.name;
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = what.desc;
        this.dl = addElement(global.dscr, 'small');
        this.dl.style.position = 'relative';
        this.dl.style.display = 'flex';
        this.dl.innerHTML = '<br>Rank: ';
        this.db = addElement(this.dl, 'div');
        for (let i = 0; i < what.rar; i++) this.db.innerHTML += '★';
        this.db.style.paddingTop = 12;
        this.db.style.paddingLeft = 6;
        switch (what.rar) {
          case 0: { this.label.style.color = this.db.style.color = 'grey'; break }
          case 2: { this.label.style.textShadow = this.db.style.textShadow = '0px 0px 1px blue'; this.label.style.color = this.db.style.color = 'cyan'; break }
          case 3: { this.label.style.textShadow = this.db.style.textShadow = '0px 0px 2px lime'; this.label.style.color = this.db.style.color = 'lime'; break }
          case 4: { this.label.style.textShadow = this.db.style.textShadow = '0px 0px 3px orange'; this.label.style.color = this.db.style.color = 'yellow'; break }
          case 5: { this.label.style.textShadow = this.db.style.textShadow = '0px 0px 2px crimson,0px 0px 5px red'; this.label.style.color = this.db.style.color = 'orange'; break }
          case 6: { this.label.style.textShadow = this.db.style.textShadow = '1px 1px 1px black,0px 0px 2px purple'; this.label.style.color = this.db.style.color = 'purple'; break }
          case 7: { this.label.style.textShadow = this.db.style.textShadow = 'hotpink 1px 1px .1em,cyan -1px -1px .1em'; this.label.style.color = this.db.style.color = 'black'; break }
        }
      }
      else if (type === 9) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = what.name;
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = typeof what.desc === 'function' ? (what.desc)(what) : what.desc;
      }
      else if (type === 10) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = what.name;
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = what.desc + dom.dseparator;
        let t = Object.keys(global.drdata);
        let ids = [];
        for (let a in t) ids[a] = Number(t[a].substring(1));
        this.o = addElement(this.text, 'small');
        this.o.innerHTML = 'drop table';
        this.o.style.color = 'cyan';
        let thing = false;
        for (let a in ids) {
          if (ids[a] === what.id || what.un) {
            let dt = global.drdata[Object.keys(global.drdata)[a]]; thing = true;
            for (let b in what.drop) {
              this.dbig = addElement(this.text, 'div');
              this.dbig.style.display = 'flex';
              this.dbig.style.border = '#1f72a2 1px solid';
              this.dbig.style.backgroundColor = '#202031';
              this.dcell1 = addElement(this.dbig, 'div');
              this.dcell2 = addElement(this.dbig, 'div');
              this.dbig.style.textAlign = 'center';
              this.dcell1.style.width = '80%';
              this.dcell1.style.borderRight = '#1f72a2 1px solid';
              this.dcell2.style.width = '20%';
              if (b != what.drop.length - 1) this.dbig.style.borderBottom = 'none'
              this.dcell2.innerHTML = ((what.drop[b].chance * 100000000 << 0) / 1000000 + '%');
              if (what.drop[b].chance >= .05) this.dcell2.style.color = 'lime';
              else if (what.drop[b].chance < .05 && what.drop[b].chance > .01) this.dcell2.style.color = 'yellow';
              else if (what.drop[b].chance <= .01 && what.drop[b].chance > .001) this.dcell2.style.color = 'orange';
              else if (what.drop[b].chance <= .001) this.dcell2.style.color = 'crimson';
              if (dt[b] || what.un) {
                this.dcell1.innerHTML += what.drop[b].item.name
                if (what.drop[b].cond && !what.drop[b].cond()) { this.dcell1.style.textDecoration = 'line-through'; this.dcell1.style.color = 'red' }
                switch (what.rar) {
                  case 0: { this.dcell1.style.color = 'grey'; break }
                  case 2: { this.dcell1.style.textShadow = '0px 0px 1px blue'; this.dcell1.style.color = 'cyan'; break }
                  case 3: { this.dcell1.style.textShadow = '0px 0px 2px lime'; this.dcell1.style.color = 'lime'; break }
                  case 4: { this.dcell1.style.textShadow = '0px 0px 3px orange'; this.dcell1.style.color = 'yellow'; break }
                  case 5: { this.dcell1.style.textShadow = '0px 0px 2px crimson,0px 0px 5px red'; this.dcell1.style.color = 'orange'; break }
                  case 6: { this.dcell1.style.textShadow = '1px 1px 1px black,0px 0px 2px purple'; this.dcell1.style.color = 'purple'; break }
                }
                if (what.drop[b].max) {
                  this.dcell1b = addElement(this.dcell1, 'small'); this.dcell1b.style.color = 'inherit'; this.dcell1b.style.position = 'absolute'
                  this.dcell1b.style.right = 70;
                  this.dcell1b.style.paddingTop = 2;
                  this.dcell1b.innerHTML = what.drop[b].max;
                  if (what.drop[b].min && what.drop[b].min !== what.drop[b].max) this.dcell1b.innerHTML += ('-' + what.drop[b].min)
                }
              }
              else { this.dcell1.innerHTML = '???????????'; this.dcell1.style.color = 'yellow' }
            }
            break
          }
        }
        if (!thing) {
          for (let b in what.drop) {
            this.dbig = addElement(this.text, 'div');
            this.dbig.style.display = 'flex';
            this.dbig.style.border = '#1f72a2 1px solid';
            this.dbig.style.backgroundColor = '#202031';
            this.dcell1 = addElement(this.dbig, 'div');
            this.dcell2 = addElement(this.dbig, 'div');
            this.dbig.style.textAlign = 'center';
            this.dcell1.style.width = '80%';
            this.dcell1.style.borderRight = '#1f72a2 1px solid';
            this.dcell2.style.width = '20%'
            if (b != what.drop.length - 1) this.dbig.style.borderBottom = 'none'
            this.dcell1.innerHTML = '???????????';
            this.dcell1.style.color = 'yellow';
            this.dcell2.innerHTML = ((what.drop[b].chance * 100000000 << 0) / 1000000 + '%');
            if (what.drop[b].chance >= .05) this.dcell2.style.color = 'lime';
            else if (what.drop[b].chance < .05 && what.drop[b].chance > .01) this.dcell2.style.color = 'yellow';
            else if (what.drop[b].chance <= .01 && what.drop[b].chance > .001) this.dcell2.style.color = 'orange';
            else if (what.drop[b].chance <= .001) this.dcell2.style.color = 'crimson';
          }
        }
      }
      else if (type === 12) {
        this.label = addElement(global.dscr, 'div', 'd_l');
        this.label.innerHTML = ttl;
        this.text = addElement(global.dscr, 'div', 'd_t');
        this.text.innerHTML = typeof dsc === 'function' ? (dsc)(what) : dsc;
      }
    }

    export function addDesc(dm, what, type, ttl, dsc, f, id) {
      dm.addEventListener('mouseenter', a => { dscr(a, what, type, ttl, f === true ? (dsc)() : dsc, id); giveSkExp(skl.rdg, .002); global.stat.popt++; global.curwds = this; global.shiftid = id; if (global.kkey === 1) descsinfo(global.shiftid) });
      dm.addEventListener('mousemove', a => { global.dscr.style.top = global.dscr.clientHeight + 60 + a.clientY > document.body.clientHeight ? (a.clientY + 30 + global.dscr.clientHeight) - ((a.clientY + 30 + global.dscr.clientHeight) - document.body.clientHeight) - global.dscr.clientHeight - 30 : a.clientY + 30; global.dscr.style.left = global.dscr.clientWidth + 60 + a.clientX > document.body.clientWidth ? (a.clientX + 30 + global.dscr.clientWidth) - ((a.clientX + 30 + global.dscr.clientWidth) - document.body.clientWidth) - global.dscr.clientWidth - 30 : a.clientX + 30; });
      dm.addEventListener('mouseleave', () => { global.shiftid = 0; empty(global.dscr); global.dscr.style.display = 'none'; clearInterval(timers.inup); clearInterval(timers.dp_tmr); clearInterval(timers.wpnkilsch); if (dom.dscshe) dom.dscshe.innerHTML = '' });
    }

    export function descsinfo(id) {
      if (id === 100) if (global.shiftitem.item.rot && you.mods.survinf > 0) {
        let itm = global.shiftitem.item;
        let ds, rs, dt, rt, c
        switch (you.mods.survinf) {
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
