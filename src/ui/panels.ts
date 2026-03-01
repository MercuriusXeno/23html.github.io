import { addElement, empty } from '../dom-utils';
declare var InstallTrigger: any;
import { dom, global, you, timers, acts, home, furn, chss, data, flags } from '../state';
const { skl, act } = data;
import { addDesc } from './descriptions';
import { chs, clr_chs, deactivatef } from './choices';
import { msg } from './messages';
import { make } from '../game/crafting';
import { iftrunkopen } from '../game/inventory';
import { giveSkExp } from '../game/progression';
import { smove } from '../game/movement';
import { formatw } from '../game/utils-game';

    export function renderRcp(rcp: any) {
      let self: any = {};
      dom.ct_bt1_1_mc = addElement(dom.ct_bt1_1, 'div', null, 'craft-log-entry');
      dom.ct_bt1_1_mc.style.position = 'relative';
      self.ct_bt1_1_m = addElement(dom.ct_bt1_1_mc, 'span');
      rcp._t = self.ct_bt1_1_m;
      if (typeof InstallTrigger !== 'undefined') { self.ct_bt1_1_m.style.paddingTop = 0; self.ct_bt1_1_m.style.paddingBottom = 0 }
      self.ct_bt1_1_m.innerHTML = rcp.name;
      let test = make(rcp, true);
      let safe = false;
      if (test.y.length != rcp.rec.length || test.o[0] === 2) self.ct_bt1_1_m.style.color = 'grey';
      if (dom.spcldom && rcp.id === dom.spcldom.rcp.id) {
        dom.rcpcurar = addElement(dom.ct_bt1_1_mc, 'span');
        dom.rcpcurar.innerHTML = '⋗⋗';
        dom.spcldom = dom.ct_bt1_1_mc;
        dom.spcldom.rcp = rcp;
        dom.rcpcurar.style.position = 'absolute';
        dom.rcpcurar.style.right = 2;
        dom.rcpcurar.style.color = 'rgb(188,254,254)';
      }
      dom.ct_bt1_1_mc.addEventListener('mouseenter', function () {
        test = make(rcp, true); global.curr_r = rcp
        empty(dom.ct_bt1_2);
        self.ct_bt1_2a = addElement(dom.ct_bt1_2, 'div');
        self.ct_bt1_2a.innerHTML = 'reagents required';
        self.ct_bt1_2a.style.textAlign = 'center';
        self.ct_bt1_2a.style.borderBottom = '1px solid #3e4092';
        if (skl.crft.lvl > 0) {
          self.ct_bt1_2at = addElement(dom.ct_bt1_2, 'div', 'rptbn'); if (!flags.rptbncgt) {
            self.ct_bt1_2at.style.backgroundColor = '#a11'; self.ct_bt1_2at.innerHTML = '';
          } else {
            self.ct_bt1_2at.style.backgroundColor = 'green';
            self.ct_bt1_2at.innerHTML = '‣';
          }
          let tm = (5000 - (skl.crft.lvl * 350 + skl.ptnc.lvl * 150) < 300 ? 300 : (5000 - (skl.crft.lvl * 350 + skl.ptnc.lvl * 150)))
          addDesc(self.ct_bt1_2at, { name: "Enable Repeatable Crafting", desc: function () { let txt = "<span style='color:magenta'>Current speed: </span><span style='color:orange'>" + ((tm / 1000).toFixed(2)) + " sec</span>"; return txt } }, 9);
          self.ct_bt1_2at.addEventListener('click', function () {
            if (flags.rptbncgt) {
              clearInterval(timers.rptbncgt); flags.rptbncgtf = false;
              self.style.backgroundColor = '#a11';
              self.innerHTML = '';
            } else {
              self.style.backgroundColor = 'green';
              self.innerHTML = '‣';
            }
            flags.rptbncgt = !flags.rptbncgt
          });
        } rcp._t2 = [];
        for (let g = 0; g < rcp.rec.length; g++) {
          self.ct_bt1_2bc = addElement(dom.ct_bt1_2, 'small');
          self.ct_bt1_2bc.style.display = 'flex';
          self.ct_bt1_2bc1 = addElement(self.ct_bt1_2bc, 'div', null, 'recipe-cell');
          self.ct_bt1_2bc2 = addElement(self.ct_bt1_2bc, 'div', null, 'recipe-cell');
          rcp._t2[g] = self.ct_bt1_2bc2
          if (rcp.rec[g].item.data.dscv === true) { self.ct_bt1_2bc1.innerHTML = rcp.rec[g].item.name; addDesc(self.ct_bt1_2bc, rcp.rec[g].item) } else self.ct_bt1_2bc1.innerHTML = '?????????';
          self.ct_bt1_2bc1.style.paddingLeft = '8px';
          let num = 0;
          if (test.z.length > 0) num = test.z[g];
          if ((test.z[g] >= rcp.rec[g].amount) || test.b[g] === true) { self.ct_bt1_2bc2.style.color = 'lime'; num = rcp.rec[g].item.slot ? test.z[g] : rcp.rec[g].item.amount }
          else { self.ct_bt1_2bc2.style.color = 'grey'; num = rcp.rec[g].item.slot ? test.z[g] : rcp.rec[g].item.amount }
          let n = '';
          if (test.z[g] > 0 && rcp.rec[g].item.slot) {
            for (let r in test.r) for (let b in you.eqp) if (you.eqp[b].data.uid === test.r[r].data.uid && you.eqp[b].id !== 10000) { n = '<small style="color:orange">[E]</small>'; continue }
          }
          if ((test.z[g] >= rcp.rec[g].amount) || test.b[g] === true) self.ct_bt1_2bc2.style.color = 'lime';
          else self.ct_bt1_2bc2.style.color = 'grey';
          if (rcp.rec[g].return === true) self.ct_bt1_2bc2.innerHTML = '∞';
          else self.ct_bt1_2bc2.innerHTML = rcp.rec[g].amount + ' / ' + num + ' ' + n;
          self.ct_bt1_2bc2.style.borderRight = 'none';
          self.ct_bt1_2bc2.style.textAlign = 'center';
        }
        self.ct_bt1_2c = addElement(dom.ct_bt1_2, 'div');
        self.ct_bt1_2c.innerHTML = 'output';
        self.ct_bt1_2c.style.width = '55%';
        self.ct_bt1_2c.style.position = 'absolute';
        self.ct_bt1_2c.style.borderTop = '1px solid #3e4092';
        self.ct_bt1_2c.style.borderBottom = '1px solid #3e4092';
        self.ct_bt1_2c.style.bottom = 71;
        self.ct_bt1_2c.style.textAlign = 'center';
        for (let g in rcp.res) {
          self.ct_bt1_2cc = addElement(dom.ct_bt1_2, 'small');
          self.ct_bt1_2cc.style.display = 'flex';
          self.ct_bt1_2cc.style.position = 'absolute';
          self.ct_bt1_2cc.style.bottom = (typeof InstallTrigger !== 'undefined') ? (48 - Number(g) * 21) : (50 - Number(g) * 21);
          self.ct_bt1_2cc.style.width = '55%';
          self.ct_bt1_2cc1 = addElement(self.ct_bt1_2cc, 'div', 'toh', 'recipe-cell');
          self.ct_bt1_2cc2 = addElement(self.ct_bt1_2cc, 'div', null, 'recipe-cell');
          if (rcp.allow === true) {
            self.ct_bt1_2cc1.innerHTML = rcp.res[g].item.name; if (!!rcp.res[g].amount_max) { self.ct_bt1_2cc2.innerHTML = rcp.res[g].amount + '~' + rcp.res[g].amount_max; } else self.ct_bt1_2cc2.innerHTML = rcp.res[g].amount;
            addDesc(self.ct_bt1_2cc1, rcp.res[g].item);
            self.ct_bt1_2cc2.style.color = 'lime';
          } else {
            self.ct_bt1_2cc1.innerHTML = '?????????';
            self.ct_bt1_2cc2.innerHTML = '???';
            self.ct_bt1_2cc2.style.color = 'grey';
          }
          self.ct_bt1_2cc2.style.textAlign = 'center';
          self.ct_bt1_2cc2.style.borderRight = 'none';
          self.ct_bt1_2cc1.style.paddingLeft = '8px';
          self.ct_bt1_2cc2.style.width = '27.5%';
          self.ct_bt1_2cc1.style.width = '75%';
        }
        if (rcp.srect != null) {
          let l = test.o.length;
          self.ct_bt1_3c = addElement(dom.ct_bt1_2, 'div');
          self.ct_bt1_3c.innerHTML = 'tools needed';
          self.ct_bt1_3c.style.width = '55%';
          self.ct_bt1_3c.style.position = 'absolute';
          self.ct_bt1_3c.style.borderTop = '1px solid #3e4092';
          self.ct_bt1_3c.style.borderBottom = '1px solid #3e4092';
          self.ct_bt1_3c.style.bottom = 115 + (((l - 1) / 2) << 0) * 15;
          self.ct_bt1_3c.style.textAlign = 'center';
          // bluh!!!
          self.ct_bt1_3cc = addElement(dom.ct_bt1_2, 'small');
          //self.ct_bt1_3cc.style.fontSize='.8em';
          self.ct_bt1_3cc.style.width = '55%';
          self.ct_bt1_3cc.style.position = 'absolute';
          self.ct_bt1_3cc.style.top = 250 - (((l - 1) / 2) << 0) * 15;
          self.ct_bt1_3cc.style.textAlign = 'left';
          self.ct_bt1_3cc.style.left = '255px';
          if (l > 1) {
            for (let nu in test.o) {
              if (test.o[nu] === 1) self.ct_bt1_3cc.innerHTML += '<span style="color:lime">' + rcp.srect[nu] + '</span>' + (l - 1 == Number(nu) ? '' : ', ');
              else if (test.o[nu] === 2) self.ct_bt1_3cc.innerHTML += '<span style="color:red">' + rcp.srect[nu] + '</span>' + (l - 1 == Number(nu) ? '' : ', ');
            }
          } else { if (test.o[0] === 1) self.ct_bt1_3cc.style.color = 'lime'; else if (test.o[0] === 2) self.ct_bt1_3cc.style.color = 'red'; self.ct_bt1_3cc.innerHTML += rcp.srect[0] }
        }
      });
      dom.ct_bt1_1_mc.addEventListener('mouseenter', function (this: any) {
        if (dom.rcpcurar) dom.spcldom.removeChild(dom.rcpcurar);
        dom.rcpcurar = addElement(this, 'span');
        dom.rcpcurar.innerHTML = '⋗⋗';
        dom.spcldom = this;
        dom.spcldom.rcp = rcp;
        dom.rcpcurar.style.position = 'absolute';
        dom.rcpcurar.style.right = 2;
        dom.rcpcurar.style.color = 'rgb(188,254,254)';
      })
      dom.ct_bt1_1_mc.addEventListener('click', function () {
        test = make(rcp, true); if (rcp.rec.length === test.y.length && test.o[0] !== 2) safe = true
        if (flags.rptbncgt) { _fcraft(rcp, safe); global.crrpsat = rcp; clearInterval(timers.rptbncgt); flags.rptbncgtf = true; if (safe) timers.rptbncgt = setInterval(() => { _fcraft(global.crrpsat, safe); giveSkExp(skl.ptnc, .05); refreshRcp(global.curr_r) }, (5000 - (skl.crft.lvl * 350 + skl.ptnc.lvl * 150) < 300 ? 300 : (5000 - (skl.crft.lvl * 350 + skl.ptnc.lvl * 150)))) }
        else _fcraft(rcp, safe);
        refreshRcp(rcp);
      });
    }

    export function refreshRcp(fl: any) {
      if (global.rm === 0 || !global.rm) {
        for (let a in global.rec_d) _refreshRcpCnt(global.rec_d[a], global.rec_d[a]._t)
      } else {
        for (let a in global.srcp) _refreshRcpCnt(global.srcp[a], global.srcp[a]._t)
      }
      let t2 = fl._t2;
      let test = make(fl, true);
      for (let g in fl.rec) {
        if (!t2) break;
        let n = '';
        if (test.z[g] > 0 && fl.rec[g].item.slot) {
          for (let r in test.r) for (let b in you.eqp) if (you.eqp[b].data.uid === test.r[r].data.uid && you.eqp[b].id !== 10000) { n = '<small style="color:orange">[E]</small>'; continue }
        }
        let num = 0;
        if (test.z.length > 0) num = test.z[g];
        if ((test.z[g] >= fl.rec[g].amount) || test.b[g] === true) { t2[g].style.color = 'lime'; num = fl.rec[g].item.slot ? test.z[g] : fl.rec[g].item.amount }
        else { t2[g].style.color = 'grey'; num = fl.rec[g].item.slot ? test.z[g] : fl.rec[g].item.amount }
        t2[g].innerHTML = fl.rec[g].amount + ' / ' + num + ' ' + n;
      }
    }

    function _refreshRcpCnt(r: any, t: any, t2?: any) {
      let test = make(r, true);
      if (test.y.length != r.rec.length || test.o[0] === 2) t.style.color = 'grey';
      else t.style.color = 'rgb(188,254,254)';
    }

    function _fcraft(what: any, safe: any) {
      if (safe) { safe = false; if (flags.sleepmode === true) { msg('You may want to wake up first', 'red'); return }; if (flags.btl === true) { msg('You\'re too busy fighting', 'red'); return }; if (flags.rdng === true) { msg('You\'re too occupied with reading', 'red'); return }; if (flags.busy === true) { msg('You\'re too busy with something else', 'red'); return }; let ntest = make(what, true); for (let g = 0; g < what.rec.length; g++) { if (what.rec.length === ntest.y.length && ntest.o[0] !== 2) safe = true } if (safe) { make(what); global.stat.crftt++; iftrunkopen(1) } else { if (flags.rptbncgtf) { clearInterval(timers.rptbncgt); flags.rptbncgtf = false; } } }
    }

    export function renderSkl(skl: any) {
      let self: any = {};
      self.skwmmc = addElement(dom.skcon, 'div', null, 'skill-entry');
      addDesc(self.skwmmc, skl, 6);
      self.skwmm1 = addElement(self.skwmmc, 'small');
      if (skl.sp) self.skwmm1.style.fontSize = skl.sp;
      self.skwmm1.style.width = '32%';
      self.skwmm1.innerHTML = skl.name + ' lvl: ' + skl.lvl;
      self.skwmm1.style.borderRight = '1px solid #46a';
      self.skwmm2 = addElement(self.skwmmc, 'small');
      self.skwmm2.innerHTML = '　exp: ' + formatw(Math.round(skl.exp)) + '/' + formatw(skl.expnext_t) + '　';
      self.skwmm2.style.borderRight = '1px solid #46a';
      self.skwmm2.style.fontSize = '.8em';
      self.skwmm2.style.width = '170px';
      self.skwmm3c = addElement(self.skwmmc, 'div');
      self.skwmm3 = addElement(self.skwmm3c, 'div');
      self.skwmm3c.style.width = '197px';
      self.skwmm3.innerHTML = '　';
      self.skwmm3.style.marginLeft = '2px';
      self.skwmm3.style.width = skl.exp / skl.expnext_t * 100 + '%';
      //if(skl.lastupd&&skl.lastupd-time.minute>=1) self.skwmm3.style.backgroundColor='limegreen'; else self.skwmm3.style.backgroundColor='yellow';
      self.skwmm3.style.backgroundColor = 'yellow';
    }

    export function renderAct(a: any) {
      let self: any = {};
      self.accm = addElement(dom.acccon, 'div', null, 'skill-entry');
      a.t = self.accm;
      addDesc(self.accm, null, 2, a.name, a.desc());
      self.accm.innerHTML = a.name;
      self.accm.style.textAlign = 'center';
      self.accm.style.display = 'block'
      if (acts.length - 1 === acts.indexOf(a)) self.accm.style.borderBottom = '1px solid #46a';
      if (a.cond(false) !== true) self.accm.style.color = 'grey';
      if (a.active === true) self.accm.style.color = 'lime';
      self.accm.addEventListener('click', function () {
        switch (a.type) {
          case 1:
            if (a.cond() === true && a.id !== global.current_a.id) { activateAct(a); self.style.color = 'lime' } else
              if (a.id === global.current_a.id) { deactivateAct(global.current_a); self.style.color = 'inherit' }
            break;
          case 2: if (a.cond() === true) a.use();
            break;
          case 3: break;
        }
        for (let a in acts) refreshAct(acts[a].t, acts[a])
      })
    }

    export function refreshAct(e: any, a: any) { e.style.color = 'inherit'; if (a.cond(false) !== true) e.style.color = 'grey'; if (a.active === true) e.style.color = 'lime'; }

    export function activateAct(actn: any) {
      global.current_a.deactivate(you);
      actn.activate(you);
      global.current_a = actn;
      flags.busy = true;
      dom.ct_bt3.style.backgroundColor = 'darkslategray'
    }

    export function deactivateAct(actn: any) {
      actn.deactivate(you);
      global.current_a = act.default;
      flags.busy = false;
      dom.ct_bt3.style.backgroundColor = 'inherit';
      for (let a in acts) refreshAct(acts[a].t, acts[a])
    }

    export function renderFurniture(frn: any) {
      dom.ch_etn = addElement(dom.ch_1h, 'div', 'bst_entrh', 'list-row');
      dom.ch_etn.style.backgroundColor = 'rgb(10,30,54)';
      dom.ch_etn1 = addElement(dom.ch_etn, 'div', null, 'list-col-name');
      dom.ch_etn1.innerHTML = frn.name;
      switch (frn.id) {
        case home.bed.id:
          dom.ch_etn1.innerHTML += ' <small style="color:grey">[z]</small>';
          break
        case home.pilw && home.pilw.id:
          dom.ch_etn1.innerHTML += ' <small style="color:grey">[zp]</small>';
          break
        case home.blkt && home.blkt.id:
          dom.ch_etn1.innerHTML += ' <small style="color:grey">[zb]</small>';
          break
        case home.tbw && home.tbw.id:
          dom.ch_etn1.innerHTML += ' <small style="color:pink">[t]</small>';
          break
      }
      dom.ch_etn.addEventListener('mouseenter', function (this: any) {
        if (frn.removable === true) {
          dom.chsfdel = addElement(this.children[0], 'div', null, 'delete-btn');
          dom.chsfdel.innerHTML = 'x';
          dom.chsfdel.style.right = 5;
          dom.chsfdel.style.top = 19;
          dom.chsfdel.addEventListener('click', function (this: any) {
            frn.data.amount--;
            frn.onRemove();
            if (frn.data.amount === 0) { deactivatef(frn); frn.onDestroy(); global.dscr.style.display = 'none'; furn.splice(furn.indexOf(frn), 1); showFurniturePanel(); chs('"<= Return"', false).addEventListener('click', () => { smove(chss.home, false) }) } else
              this.parentElement.parentElement.children[1].innerHTML = 'x' + frn.data.amount;
            let v = 0;
            for (let a in furn) if (furn[a].v) { if (furn[a].multv) v += furn[a].v * furn[a].amount; else v += furn[a].v } dom.flsthdrbb.innerHTML = v;
          });
        }
      });
      dom.ch_etn.addEventListener('mouseleave', function (this: any) {
        if (frn.removable === true) this.children[0].removeChild(dom.chsfdel);
      });
      dom.ch_etn.addEventListener('click', function () {
        frn.onSelect();
      });
      dom.ch_etn2 = addElement(dom.ch_etn, 'div', null, 'list-col-rank');
      dom.ch_etn2.innerHTML = 'x' + frn.data.amount;
      dom.ch_etn2.style.width = '6%';
      addDesc(dom.ch_etn, frn, 9);
    }

    export function showFurniturePanel() {
      clr_chs()
      dom.ch_1 = addElement(dom.ctr_2, 'div');
      dom.ch_1.style.height = '76%';
      dom.ch_1.style.backgroundColor = 'rgb(0,20,44)';
      dom.flsthdr = addElement(dom.ch_1, 'div');
      dom.flsthdra = addElement(dom.flsthdr, 'div');
      dom.flsthdr.style.display = 'flex'
      dom.flsthdra.innerHTML = 'Furniture Owned';
      dom.flsthdra.style.position = 'relative';
      dom.flsthdra.style.left = 120;
      dom.flsthdr.style.borderBottom = '1px #44c solid';
      dom.flsthdr.style.padding = 2;
      dom.flsthdrbc = addElement(dom.flsthdr, 'div');
      dom.flsthdrb = addElement(dom.flsthdrbc, 'small');
      dom.flsthdrb.innerHTML = 'Home rating: ';
      dom.flsthdrbc.style.left = 237;
      dom.flsthdrb.style.paddingLeft = 6;
      dom.flsthdrbc.style.position = 'relative';
      dom.flsthdrbc.style.borderLeft = '1px solid rgb(68, 68, 204)'
      dom.flsthdrbb = addElement(dom.flsthdrbc, 'small');
      dom.flsthdrbb.style.color = 'lime';
      let v = 0;
      for (let a in furn) if (furn[a].v) { if (furn[a].multv) v += furn[a].v * furn[a].amount; else v += furn[a].v } dom.flsthdrbb.innerHTML = v;
      dom.ch_1h = addElement(dom.ch_1, 'div', null);
      dom.ch_1h.style.textAlign = 'left';
      dom.ch_1h.style.display = 'block'
      for (let a in furn) {
        renderFurniture(furn[a]);
      }
    }
