import { addElement, empty } from '../dom-utils';
import { dom, global, you, skl, timers, acts, act } from '../state';
import { addDesc } from './descriptions';
import { msg } from './messages';
import { make } from '../game/crafting';
import { iftrunkopen } from '../game/inventory';
import { giveSkExp } from '../game/progression';
import { formatw } from '../game/utils-game';

    export function renderRcp(rcp) {
      dom.ct_bt1_1_mc = addElement(dom.ct_bt1_1, 'div', null, 'craft-log-entry');
      dom.ct_bt1_1_mc.style.position = 'relative';
      this.ct_bt1_1_m = addElement(dom.ct_bt1_1_mc, 'span');
      rcp._t = this.ct_bt1_1_m;
      if (typeof InstallTrigger !== 'undefined') { this.ct_bt1_1_m.style.paddingTop = 0; this.ct_bt1_1_m.style.paddingBottom = 0 }
      this.ct_bt1_1_m.innerHTML = rcp.name;
      let test = make(rcp, true);
      let safe = false;
      if (test.y.length != rcp.rec.length || test.o[0] === 2) this.ct_bt1_1_m.style.color = 'grey';
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
        this.ct_bt1_2a = addElement(dom.ct_bt1_2, 'div');
        this.ct_bt1_2a.innerHTML = 'reagents required';
        this.ct_bt1_2a.style.textAlign = 'center';
        this.ct_bt1_2a.style.borderBottom = '1px solid #3e4092';
        if (skl.crft.lvl > 0) {
          this.ct_bt1_2at = addElement(dom.ct_bt1_2, 'div', 'rptbn'); if (!global.flags.rptbncgt) {
            this.ct_bt1_2at.style.backgroundColor = '#a11'; this.ct_bt1_2at.innerHTML = '';
          } else {
            this.ct_bt1_2at.style.backgroundColor = 'green';
            this.ct_bt1_2at.innerHTML = '‣';
          }
          let tm = (5000 - (skl.crft.lvl * 350 + skl.ptnc.lvl * 150) < 300 ? 300 : (5000 - (skl.crft.lvl * 350 + skl.ptnc.lvl * 150)))
          addDesc(this.ct_bt1_2at, { name: "Enable Repeatable Crafting", desc: function () { let txt = "<span style='color:magenta'>Current speed: </span><span style='color:orange'>" + ((tm / 1000).toFixed(2)) + " sec</span>"; return txt } }, 9);
          this.ct_bt1_2at.addEventListener('click', function () {
            if (global.flags.rptbncgt) {
              clearInterval(timers.rptbncgt); global.flags.rptbncgtf = false;
              this.style.backgroundColor = '#a11';
              this.innerHTML = '';
            } else {
              this.style.backgroundColor = 'green';
              this.innerHTML = '‣';
            }
            global.flags.rptbncgt = !global.flags.rptbncgt
          });
        } rcp._t2 = [];
        for (let g = 0; g < rcp.rec.length; g++) {
          this.ct_bt1_2bc = addElement(dom.ct_bt1_2, 'small');
          this.ct_bt1_2bc.style.display = 'flex';
          this.ct_bt1_2bc1 = addElement(this.ct_bt1_2bc, 'div', null, 'recipe-cell');
          this.ct_bt1_2bc2 = addElement(this.ct_bt1_2bc, 'div', null, 'recipe-cell');
          rcp._t2[g] = this.ct_bt1_2bc2
          if (rcp.rec[g].item.data.dscv === true) { this.ct_bt1_2bc1.innerHTML = rcp.rec[g].item.name; addDesc(this.ct_bt1_2bc, rcp.rec[g].item) } else this.ct_bt1_2bc1.innerHTML = '?????????';
          this.ct_bt1_2bc1.style.paddingLeft = '8px';
          let num = 0;
          if (test.z.length > 0) num = test.z[g];
          if ((test.z[g] >= rcp.rec[g].amount) || test.b[g] === true) { this.ct_bt1_2bc2.style.color = 'lime'; num = rcp.rec[g].item.slot ? test.z[g] : rcp.rec[g].item.amount }
          else { this.ct_bt1_2bc2.style.color = 'grey'; num = rcp.rec[g].item.slot ? test.z[g] : rcp.rec[g].item.amount }
          let n = '';
          if (test.z[g] > 0 && rcp.rec[g].item.slot) {
            for (let r in test.r) for (let b in you.eqp) if (you.eqp[b].data.uid === test.r[r].data.uid && you.eqp[b].id !== 10000) { n = '<small style="color:orange">[E]</small>'; continue }
          }
          if ((test.z[g] >= rcp.rec[g].amount) || test.b[g] === true) this.ct_bt1_2bc2.style.color = 'lime';
          else this.ct_bt1_2bc2.style.color = 'grey';
          if (rcp.rec[g].return === true) this.ct_bt1_2bc2.innerHTML = '∞';
          else this.ct_bt1_2bc2.innerHTML = rcp.rec[g].amount + ' / ' + num + ' ' + n;
          this.ct_bt1_2bc2.style.borderRight = 'none';
          this.ct_bt1_2bc2.style.textAlign = 'center';
        }
        this.ct_bt1_2c = addElement(dom.ct_bt1_2, 'div');
        this.ct_bt1_2c.innerHTML = 'output';
        this.ct_bt1_2c.style.width = '55%';
        this.ct_bt1_2c.style.position = 'absolute';
        this.ct_bt1_2c.style.borderTop = '1px solid #3e4092';
        this.ct_bt1_2c.style.borderBottom = '1px solid #3e4092';
        this.ct_bt1_2c.style.bottom = 71;
        this.ct_bt1_2c.style.textAlign = 'center';
        for (let g in rcp.res) {
          this.ct_bt1_2cc = addElement(dom.ct_bt1_2, 'small');
          this.ct_bt1_2cc.style.display = 'flex';
          this.ct_bt1_2cc.style.position = 'absolute';
          this.ct_bt1_2cc.style.bottom = (typeof InstallTrigger !== 'undefined') ? (48 - g * 21) : (50 - g * 21);
          this.ct_bt1_2cc.style.width = '55%';
          this.ct_bt1_2cc1 = addElement(this.ct_bt1_2cc, 'div', 'toh', 'recipe-cell');
          this.ct_bt1_2cc2 = addElement(this.ct_bt1_2cc, 'div', null, 'recipe-cell');
          if (rcp.allow === true) {
            this.ct_bt1_2cc1.innerHTML = rcp.res[g].item.name; if (!!rcp.res[g].amount_max) { this.ct_bt1_2cc2.innerHTML = rcp.res[g].amount + '~' + rcp.res[g].amount_max; } else this.ct_bt1_2cc2.innerHTML = rcp.res[g].amount;
            addDesc(this.ct_bt1_2cc1, rcp.res[g].item);
            this.ct_bt1_2cc2.style.color = 'lime';
          } else {
            this.ct_bt1_2cc1.innerHTML = '?????????';
            this.ct_bt1_2cc2.innerHTML = '???';
            this.ct_bt1_2cc2.style.color = 'grey';
          }
          this.ct_bt1_2cc2.style.textAlign = 'center';
          this.ct_bt1_2cc2.style.borderRight = 'none';
          this.ct_bt1_2cc1.style.paddingLeft = '8px';
          this.ct_bt1_2cc2.style.width = '27.5%';
          this.ct_bt1_2cc1.style.width = '75%';
        }
        if (rcp.srect != null) {
          let l = test.o.length;
          this.ct_bt1_3c = addElement(dom.ct_bt1_2, 'div');
          this.ct_bt1_3c.innerHTML = 'tools needed';
          this.ct_bt1_3c.style.width = '55%';
          this.ct_bt1_3c.style.position = 'absolute';
          this.ct_bt1_3c.style.borderTop = '1px solid #3e4092';
          this.ct_bt1_3c.style.borderBottom = '1px solid #3e4092';
          this.ct_bt1_3c.style.bottom = 115 + (((l - 1) / 2) << 0) * 15;
          this.ct_bt1_3c.style.textAlign = 'center';
          // bluh!!!
          this.ct_bt1_3cc = addElement(dom.ct_bt1_2, 'small');
          //this.ct_bt1_3cc.style.fontSize='.8em';
          this.ct_bt1_3cc.style.width = '55%';
          this.ct_bt1_3cc.style.position = 'absolute';
          this.ct_bt1_3cc.style.top = 250 - (((l - 1) / 2) << 0) * 15;
          this.ct_bt1_3cc.style.textAlign = 'left';
          this.ct_bt1_3cc.style.left = '255px';
          if (l > 1) {
            for (let nu in test.o) {
              if (test.o[nu] === 1) this.ct_bt1_3cc.innerHTML += '<span style="color:lime">' + rcp.srect[nu] + '</span>' + (l - 1 == nu ? '' : ', ');
              else if (test.o[nu] === 2) this.ct_bt1_3cc.innerHTML += '<span style="color:red">' + rcp.srect[nu] + '</span>' + (l - 1 == nu ? '' : ', ');
            }
          } else { if (test.o[0] === 1) this.ct_bt1_3cc.style.color = 'lime'; else if (test.o[0] === 2) this.ct_bt1_3cc.style.color = 'red'; this.ct_bt1_3cc.innerHTML += rcp.srect[0] }
        }
      });
      dom.ct_bt1_1_mc.addEventListener('mouseenter', function () {
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
        if (global.flags.rptbncgt) { _fcraft(rcp, safe); global.crrpsat = rcp; clearInterval(timers.rptbncgt); global.flags.rptbncgtf = true; if (safe) timers.rptbncgt = setInterval(() => { _fcraft(global.crrpsat, safe); giveSkExp(skl.ptnc, .05); refreshRcp(global.curr_r) }, (5000 - (skl.crft.lvl * 350 + skl.ptnc.lvl * 150) < 300 ? 300 : (5000 - (skl.crft.lvl * 350 + skl.ptnc.lvl * 150)))) }
        else _fcraft(rcp, safe);
        refreshRcp(rcp);
      });
    }

    export function refreshRcp(fl) {
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

    function _refreshRcpCnt(r, t, t2) {
      let test = make(r, true);
      if (test.y.length != r.rec.length || test.o[0] === 2) t.style.color = 'grey';
      else t.style.color = 'rgb(188,254,254)';
    }

    function _fcraft(what, safe) {
      if (safe) { safe = false; if (global.flags.sleepmode === true) { msg('You may want to wake up first', 'red'); return }; if (global.flags.btl === true) { msg('You\'re too busy fighting', 'red'); return }; if (global.flags.rdng === true) { msg('You\'re too occupied with reading', 'red'); return }; if (global.flags.busy === true) { msg('You\'re too busy with something else', 'red'); return }; let ntest = make(what, true); for (let g = 0; g < what.rec.length; g++) { if (what.rec.length === ntest.y.length && ntest.o[0] !== 2) safe = true } if (safe) { make(what); global.stat.crftt++; iftrunkopen(1) } else { if (global.flags.rptbncgtf) { clearInterval(timers.rptbncgt); global.flags.rptbncgtf = false; } } }
    }

    export function renderSkl(skl) {
      this.skwmmc = addElement(dom.skcon, 'div', null, 'skill-entry');
      addDesc(this.skwmmc, skl, 6);
      this.skwmm1 = addElement(this.skwmmc, 'small');
      if (skl.sp) this.skwmm1.style.fontSize = skl.sp;
      this.skwmm1.style.width = '32%';
      this.skwmm1.innerHTML = skl.name + ' lvl: ' + skl.lvl;
      this.skwmm1.style.borderRight = '1px solid #46a';
      this.skwmm2 = addElement(this.skwmmc, 'small');
      this.skwmm2.innerHTML = '　exp: ' + formatw(Math.round(skl.exp)) + '/' + formatw(skl.expnext_t) + '　';
      this.skwmm2.style.borderRight = '1px solid #46a';
      this.skwmm2.style.fontSize = '.8em';
      this.skwmm2.style.width = '170px';
      this.skwmm3c = addElement(this.skwmmc, 'div');
      this.skwmm3 = addElement(this.skwmm3c, 'div');
      this.skwmm3c.style.width = '197px';
      this.skwmm3.innerHTML = '　';
      this.skwmm3.style.marginLeft = '2px';
      this.skwmm3.style.width = skl.exp / skl.expnext_t * 100 + '%';
      //if(skl.lastupd&&skl.lastupd-time.minute>=1) this.skwmm3.style.backgroundColor='limegreen'; else this.skwmm3.style.backgroundColor='yellow';
      this.skwmm3.style.backgroundColor = 'yellow';
    }

    export function renderAct(a) {
      this.accm = addElement(dom.acccon, 'div', null, 'skill-entry');
      a.t = this.accm;
      addDesc(this.accm, null, 2, a.name, a.desc());
      this.accm.innerHTML = a.name;
      this.accm.style.textAlign = 'center';
      this.accm.style.display = 'block'
      if (acts.length - 1 === acts.indexOf(a)) this.accm.style.borderBottom = '1px solid #46a';
      if (a.cond(false) !== true) this.accm.style.color = 'grey';
      if (a.active === true) this.accm.style.color = 'lime';
      this.accm.addEventListener('click', function () {
        switch (a.type) {
          case 1:
            if (a.cond() === true && a.id !== global.current_a.id) { activateAct(a); this.style.color = 'lime' } else
              if (a.id === global.current_a.id) { deactivateAct(global.current_a); this.style.color = 'inherit' }
            break;
          case 2: if (a.cond() === true) a.use();
            break;
          case 3: break;
        }
        for (let a in acts) refreshAct(acts[a].t, acts[a])
      })
    }

    export function refreshAct(e, a) { e.style.color = 'inherit'; if (a.cond(false) !== true) e.style.color = 'grey'; if (a.active === true) e.style.color = 'lime'; }

    export function activateAct(actn) {
      global.current_a.deactivate();
      actn.activate();
      global.current_a = actn;
      global.flags.busy = true;
      dom.ct_bt3.style.backgroundColor = 'darkslategray'
    }

    export function deactivateAct(actn) {
      actn.deactivate();
      global.current_a = act.default;
      global.flags.busy = false;
      dom.ct_bt3.style.backgroundColor = 'inherit';
      for (let a in acts) refreshAct(acts[a].t, acts[a])
    }
