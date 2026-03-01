
import { YEAR, MONTH, WEEK, DAY, HOUR, SILVER, GOLD } from './constants';
import { Base64, utf8_to_b64, b64_to_utf8 } from './base64';
import { random, rand, randf, _rand, xmur3 } from './random';
import { select, shuffle, deepCopy, copy, objempty, format3, col, scan, scanbyid, scanbyuid, find, findbyid, findbest, findworst } from './utils';
import { addElement, empty, appear, fade } from './dom-utils';
import { dom, global, listen, w_manager, offline, callback, effector,
  timers, chss, test, planner, check, home,
  itemgroup, sectors, inv, furn, qsts, dar, acts, plans, checksd,
  you, time, data, gameText, flags, setYou, setTime,
  setInv, setDar, setFurn, setQsts, setActs, setSectors, stats, combat, } from './state';
const { creature, effect, wpn, eqp, acc, sld, item, rcp, area, sector, ttl, skl, abl,
  furniture, vendor, quest, act, container, mastery } = data;
import { weather, Weather, Time, setWeather, isWeather, wManager, getSeason,
  getMinute, getHour, getDay, getMonth, getYear, getLunarPhase,
  timeConv, timeDisp, attachCallback, detachCallback, wdrseason } from './systems/weather';
import { You } from './systems/player';
import { save, load } from './systems/save-load';
import { ontick } from './systems/loop';
import { msg, _msg, msg_add } from './ui/messages';
import { dscr, addDesc, descsinfo } from './ui/descriptions';
import { update_db, update_d, update_m, m_update } from './ui/stats';
import { giveEff, removeEff } from './ui/effects';
import { equip, unequip, eqpres } from './ui/equipment';
import { renderItem, updateInv, isort, rsort, invbtsrst, rstcrtthg, reduce } from './ui/inventory';
import { chs, clr_chs, icon, Chs, activatef, deactivatef } from './ui/choices';
import { renderRcp, refreshRcp, renderSkl, renderAct, refreshAct, activateAct, deactivateAct, renderFurniture, showFurniturePanel } from './ui/panels';
import { recshop, rendershopitem, mf } from './ui/shop';
import { formatw, cansee, kill, roll } from './game/utils-game';
import { giveExp, giveSkExp, giveCrExp, giveTitle, giveRcp, lvlup, giveAction } from './game/progression';
import { giveWealth, spend, restock } from './game/economy';
import { giveItem, removeItem, listen_k, updateTrunkLeftItem, iftrunkopen, iftrunkopenc, addToContainer, dropC, wearing, wearingany, giveFurniture, rendertrunkitem, removeFromContainer } from './game/inventory';
import { fght, attack, tattack, dmg_calc, dumb, hit_calc, wpndiestt } from './game/combat';
import { Effector, smove, inSector, area_init, addtosector, activateEffectors, deactivateEffectors, runEffectors } from './game/movement';
import { canMake, make } from './game/crafting';
import { canScout, scoutGeneric, disassembleGeneric } from './game/exploration';
import './data/titles';
import './data/effects';
import './data/furniture';
import './data/skills';
import './data/items';
import './data/equipment';
import './data/abilities';
import './data/creatures';
import './data/world';
import './data/crafting';
import './data/vendors';
import './data/actions';
import './data/mastery';

// Mark as ES module (prevents esbuild CommonJS shim overhead)
export {};

// Firefox detection global
declare var InstallTrigger: any;

    // ==========================================================================
    // Bootstrap
    // ==========================================================================
    window.addEventListener('load', () => { load() });

    function giveQst(q: any) {
      if (!q.data.started) { q.init(); q.data.started = true; msg((q.repeatable ? '<span style="color:cyan">Repeatable</span> q' : 'Q') + 'uest accepted: ' + '<span style="color:orange">"' + q.name + '"</span>', 'lightblue', q, 8); let have = false; for (let a in qsts) if (qsts[a].id === q.id) { have = true; break } if (!have) qsts.push(q); }
    }

    function finishQst(q: any) {
      if (q.data.started) { q.data.done = true; q.data.started = false; q.data.pending = false; msg('Quest completed: ', 'lime'); msg_add('"' + q.name + '"', 'orange'); q.rwd(you); stats.qstc++ }
    }

    gameText.alcohol_d = ["You drank some alcohol. You feel warm inside.", "You drank alcohol. Party on!", "You drank lots of alcohol. Are those white mice?", "You drank unholy amounts of alcohol. But what do you care?", "You embalmed yourself alive with so much alcohol, that even undead will leave your dead body alone."];

    ////misc////
    global.wdrop = [{ item: item.lckl, c: .0000048 }];
    global.rdrop = [ // g f e 
      [{ item: item.lsrd, c: .00026 }],
      [{ item: item.lsrd, c: .0005 }],
      [{ item: item.lsrd, c: .00098 }, { item: item.lsstn, c: .00023 }],
      [], [], [], []];
    global.achchk = [//1 - you die, 2 - enemy dies
      [
        function (x: any) { if (ttl.ddw.have === false) { if ((x.id === 103 || x.id === 102) && x.lvl === 1) { giveTitle(ttl.ddw) } } }
      ],
      [
        function (x: any) { if (ttl.kill1.have === false) { if (stats.akills >= 10000) { giveTitle(ttl.kill1) } } },
        function (x: any) { if (ttl.kill2.have === false) { if (stats.akills >= 50000) { giveTitle(ttl.kill2) } } },
        function (x: any) { if (ttl.kill3.have === false) { if (stats.akills >= 200000) { giveTitle(ttl.kill3) } } },
        function (x: any) { if (ttl.kill4.have === false) { if (stats.akills >= 1000000) { giveTitle(ttl.kill4) } } },
        function (x: any) { if (ttl.kill5.have === false) { if (stats.akills >= 5000000) { giveTitle(ttl.kill5) } } },
      ]
    ];
    global.monchk = [
      function (x: any) { if (ttl.mone1.have === false) { if (stats.moneyg >= GOLD) { giveTitle(ttl.mone1) } } },
    ];
    global.ttlschk = [
      function (x: any) { if (ttl.ttsttl1.have === false) { if (global.titles.length >= 10) { giveTitle(ttl.ttsttl1) } } },
      function (x: any) { if (ttl.ttsttl2.have === false) { if (global.titles.length >= 25) { giveTitle(ttl.ttsttl2) } } },
      function (x: any) { if (ttl.ttsttl3.have === false) { if (global.titles.length >= 50) { giveTitle(ttl.ttsttl3) } } },
    ];

    global.shptchk = [
      function (x: any) { if (ttl.shpt1.have === false) { if (stats.buyt >= 500) { giveTitle(ttl.shpt1) } } },
    ];
    global.cptchk = [
      function (x: any) { if (ttl.cpet1.have === false) { if (stats.cat_c >= 9999) { giveTitle(ttl.cpet1) } } },
    ];
    global.htrchl = [
      function (x: any) { if (ttl.hstr1.have === false) { if (x >= 100) { giveTitle(ttl.hstr1) } } },
      function (x: any) { if (ttl.hstr2.have === false) { if (x >= 250) { giveTitle(ttl.hstr2) } } },
      function (x: any) { if (ttl.hstr3.have === false) { if (x >= 500) { giveTitle(ttl.hstr3) } } },
    ];
    global.nethmchk = [
      function (x: any) { if (ttl.neet.have === false) { if (stats.athmec >= YEAR) { giveTitle(ttl.neet) } } },
      function (x: any) { if (ttl.neet2.have === false) { if (stats.athmec >= YEAR * 5) { giveTitle(ttl.neet2) } } },
      function (x: any) { if (ttl.neet3.have === false) { if (stats.athmec >= YEAR * 10) { giveTitle(ttl.neet3) } } },
    ];

    ///////////////////////////////////////////
    //U
    ///////////////////////////////////////////

    // @ts-ignore: constructor function
    setYou(new You()); you.eqp[0].ctype = 2; giveTitle(ttl.new, true);
    you.ai = function (this: any) {
      //if(you.hp*100/you.hpmax<50) item.hrb1.use();
      //if(you.sat*100/you.satmax<90) item.appl.use();
    }

    // shuffle() imported from ./utils

    ///////////////////////////////////////////
    //DOM
    ///////////////////////////////////////////
    dom.d0 = addElement(document.body, 'div', 'd1', 'd');
    if (!flags.aw_u) dom.d0.style.display = 'none';
    dom.d1 = addElement(dom.d0, 'div');
    dom.d101 = addElement(dom.d0, 'div', 'se_i');
    dom.d2c = addElement(dom.d1, 'div', null, 'd2');
    dom.d2 = addElement(dom.d2c, 'div');
    dom.d2.innerHTML = you.name;
    dom.d2_a = addElement(dom.d2c, 'input', 'nch');
    dom.d2_a.addEventListener('focusin', function (this: any) { dom.d2_a.value = you.name; you.name = ''; dom.d2.innerHTML = '　' });
    dom.d2_a.addEventListener('focusout', function (this: any) { you.name = dom.d2_a.value; dom.d2_a.value = ''; dom.d2.innerHTML = you.name });
    addDesc(dom.d2c, null, 2, you.name, you.desc);
    dom.d3 = addElement(dom.d1, 'div', null, 'd3');
    dom.d3.innerHTML = ' lvl:' + you.lvl + ' \'' + you.title.name + '\'';
    dom.d3.addEventListener('click', function (this: any) {
      if (!flags.ttlscrnopn) {
        flags.ttlscrnopn = true;
        dom.ttlcont = addElement(document.body, 'div', 'youttlc');
        dom.ttlhead = addElement(dom.ttlcont, 'div', 'youttlh');
        dom.ttlhead.innerHTML = 'SELECT YOUR TITLE';
        dom.ttlbd = addElement(dom.ttlcont, 'div');
        dom.ttlbd.style.overflow = 'auto';
        dom.ttlbd.style.maxHeight = window.innerHeight - 130;
        for (let obj in global.titles) {
          this.ttlent = addElement(dom.ttlbd, 'div', null, 'title-entry');
          let title = global.titles[obj]
          if (obj as any === 0) this.ttlent.style.borderTop = '';
          this.ttlent.innerHTML = '"' + title.name + '"';
          if (global.titles[obj].talent) this.ttlent.innerHTML += " <span style='color:yellow;text-shadow:0px 0px 5px orange'>*</span>"
          addDesc(this.ttlent, title, 5);
          this.ttlent.addEventListener('click', function (this: any) {
            you.title = title;
            empty(dom.ttlcont);
            document.body.removeChild(dom.ttlcont);
            dom.d3.innerHTML = ' lvl:' + you.lvl + ' \'' + you.title.name + '\'';
            empty(global.dscr);
            global.dscr.style.display = 'none';
            flags.ttlscrnopn = false;
          });
        }
      }
    });
    addDesc(dom.d3, you.title, 5, true);
    //dom.d5 = addElement(dom.d1,'div','d5'); ???????
    dom.d5_1 = addElement(dom.d1, 'div', null, 'hp');
    dom.d5_2 = addElement(dom.d1, 'div', null, 'exp');
    dom.d5_3 = addElement(dom.d1, 'div', null, 'en');
    addDesc(dom.d5_1, null, 2, 'Health', function (this: any) { return ('Physical health points, needed to stay alive. You will probably die if it reaches 0<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.stat_p[0] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d5_2, null, 2, 'Experience', function (this: any) { return ('Physical and combat experience. You\'ll have to work hard to achieve new heights<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>EXP Gain Potential: <span style="color:gold">' + (you.exp_t * 100 << 0) + '%</span><br>Current EXP Gain: <span style="color:yellow">' + (you.exp_t * 100 * you.efficiency() << 0) + '%</span></small>') }, true);
    addDesc(dom.d5_3, null, 2, 'Energy meter', function (this: any) {
      let lose = you.mods.sdrate;
      if (flags.iswet === true) lose *= (3 / (1 + (skl.abw.lvl * .03)))
      if (flags.iscold === true) lose += effect.cold.duration / 1000 / (1 + skl.coldr.lvl * .05);
      lose = (lose * 100 << 0) / 100
      return ('Influences the effectiveness of your actions, eat a lot to keep it full<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Energy Effectiveness: <span style="color:deeppink">' + ((you.mods.sbonus + 1) * 100 << 0) + '%</span><br>Energy Consumption Rate: <span style="color:gold">' + lose + '/s</span></small>')
    }, true)
    dom.d5_1_1 = addElement(dom.d5_1, 'div', 'hpp');
    dom.d5_2_1 = addElement(dom.d5_2, 'div', 'expp');
    dom.d5_3_1 = addElement(dom.d5_3, 'div', 'enn');
    dom.d6 = addElement(dom.d1, 'div', 'd6');
    addDesc(dom.d6, null, 2, 'Power rank', 'Your power position in this realm. The lower the number the stronger you are');
    dom.d4 = addElement(dom.d1, 'div', 'd4');
    dom.d4_1 = addElement(dom.d4, 'span', null, 'dd');
    dom.d4_2 = addElement(dom.d4, 'span', null, 'dd');
    dom.d4_3 = addElement(dom.d4, 'span', null, 'dd');
    dom.d4_4 = addElement(dom.d4, 'span', null, 'dd');
    addDesc(dom.d4_1, null, 2, 'Physical Strength', function (this: any) { return ('Determines physical damage dealt and received<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.stat_p[1] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d4_2, null, 2, 'Agility', function (this: any) { return ('Determines hit/dodge rate<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.stat_p[2] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d4_3, null, 2, 'Mental acuity', function (this: any) { return ('Determines magic damage dealt and received<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.stat_p[3] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d4_4, null, 2, 'Speed', 'Allows for faster attacks and multihit combos');
    dom.d7 = addElement(dom.d1, 'div', 'eq_w');
    dom.d7_1 = addElement(dom.d7, 'div', null, 'ddd_2');
    dom.d7_slot_1 = addElement(dom.d7_1, 'div', null, 'ddd_1');
    dom.d7_slot_1.innerHTML = 'Weapon';
    dom.d7_slot_1.style.color = 'grey';
    dom.d7_slot_2 = addElement(dom.d7_1, 'div', null, 'ddd_1');
    dom.d7_slot_2.innerHTML = 'Shield';
    dom.d7_slot_2.style.color = 'grey';
    dom.d7_2 = addElement(dom.d7, 'div', null, 'ddd_2');
    dom.d7_slot_3 = addElement(dom.d7_2, 'div', null, 'ddd_1');
    dom.d7_slot_3.innerHTML = 'Head';
    dom.d7_slot_3.style.color = 'grey';
    dom.d7_slot_4 = addElement(dom.d7_2, 'div', null, 'ddd_1');
    dom.d7_slot_4.innerHTML = 'Body';
    dom.d7_slot_4.style.color = 'grey';
    dom.d7_3 = addElement(dom.d7, 'div', null, 'ddd_2');
    dom.d7_slot_5 = addElement(dom.d7_3, 'div', null, 'ddd_1');
    dom.d7_slot_5.innerHTML = 'L Arm';
    dom.d7_slot_5.style.color = 'grey';
    dom.d7_slot_6 = addElement(dom.d7_3, 'div', null, 'ddd_1');
    dom.d7_slot_6.innerHTML = 'R Arm';
    dom.d7_slot_6.style.color = 'grey';
    dom.d7_4 = addElement(dom.d7, 'div', null, 'ddd_2');
    dom.d7_slot_7 = addElement(dom.d7_4, 'div', null, 'ddd_1');
    dom.d7_slot_7.innerHTML = 'Legs';
    dom.d7_slot_7.style.color = 'grey';
    dom.d7_slot_8 = addElement(dom.d7_4, 'div', null, 'ddd_1');
    dom.d7_slot_8.innerHTML = 'Accessory';
    dom.d7_slot_8.style.color = 'grey';
    dom.d7_5 = addElement(dom.d7, 'div', null, 'ddd_2');
    dom.d7_5.style.borderBottom = 'solid 2px rgb(12,86,195)';
    dom.d7_slot_9 = addElement(dom.d7_5, 'div', null, 'ddd_1');
    dom.d7_slot_9.innerHTML = '∥LOCKED∥';
    dom.d7_slot_9.style.color = 'grey';
    dom.d7_slot_10 = addElement(dom.d7_5, 'div', null, 'ddd_1');
    dom.d7_slot_10.innerHTML = '∥LOCKED∥';
    dom.d7_slot_10.style.color = 'grey';
    dom.d8 = addElement(dom.d1, 'div');
    dom.d8.style.fontSize = '.9em';
    dom.d8.style.paddingTop = '5px';
    dom.d8_2 = addElement(dom.d1, 'div');
    dom.d8_2.style.fontSize = '.7em';
    if (typeof InstallTrigger == 'undefined') dom.d8_2.style.paddingTop = '5px';
    dom.d8_2.innerHTML = 'Critical chance: ' + ((you.mods.crflt + you.crt) * 100) + '%';
    dom.d7_slot_3.addEventListener('mouseenter', function (this: any) { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[2].str * (you.eqp[2].dp / you.eqp[2].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_3.addEventListener('mouseleave', function (this: any) { this.innerHTML = global._tad; });
    dom.d7_slot_4.addEventListener('mouseenter', function (this: any) { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[3].str * (you.eqp[3].dp / you.eqp[3].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_4.addEventListener('mouseleave', function (this: any) { this.innerHTML = global._tad; });
    dom.d7_slot_5.addEventListener('mouseenter', function (this: any) { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[4].str * (you.eqp[4].dp / you.eqp[4].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_5.addEventListener('mouseleave', function (this: any) { this.innerHTML = global._tad; });
    dom.d7_slot_6.addEventListener('mouseenter', function (this: any) { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[5].str * (you.eqp[5].dp / you.eqp[5].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_6.addEventListener('mouseleave', function (this: any) { this.innerHTML = global._tad; });
    dom.d7_slot_7.addEventListener('mouseenter', function (this: any) { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[6].str * (you.eqp[6].dp / you.eqp[6].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_7.addEventListener('mouseleave', function (this: any) { this.innerHTML = global._tad; });
    dom.d1m = addElement(document.body, 'div', 'd1', 'd');
    if (!flags.aw_u) dom.d1m.style.display = 'none';
    dom.d101m = addElement(dom.d1m, 'div', 'se_i');
    dom.d1m.style.top = 8;
    dom.d1m.style.left = 457;
    dom.d1m.style.position = 'absolute';
    dom.d101m.style.top = 264
    global.special_x = dom.d1m.style.left;
    global.special_y = dom.d1m.style.top;

    dom._d23m = addElement(dom.d1m, 'div');
    addDesc(dom._d23m, null, 3, combat.current_m.name, combat.current_m.desc);
    dom.d2m = addElement(dom._d23m, 'div', null, 'd2');
    dom.d3m = addElement(dom._d23m, 'div', null, 'd3m');
    dom.d5_1m = addElement(dom.d1m, 'div', null, 'hp');
    dom.d5_2m = addElement(dom.d1m, 'div', null, 'exp');
    dom.d5_1_1m = addElement(dom.d5_1m, 'div', 'hpp');
    dom.d5_2_1m = addElement(dom.d5_2m, 'div');
    dom.d5_1_1m.update = function (this: any) {
      this.innerHTML = 'hp: ' + format3(combat.current_m.hp.toString()) + '/' + format3(combat.current_m.hpmax.toString());
      dom.d5_1m.style.width = 100 * combat.current_m.hp / combat.current_m.hpmax + '%';
    }
    dom.d4m = addElement(dom.d1m, 'div', 'd4');
    dom.d4_1m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d4_2m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d4_3m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d4_4m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d9m = addElement(dom.d1m, 'div');
    dom.d9m.update = function (this: any) { this.innerHTML = 'rank: ' + gameText.eranks[combat.current_m.rnk]; if (combat.current_m.rnk <= 4) this.style.color = 'lightgrey'; else if (combat.current_m.rnk > 4 && combat.current_m.rnk <= 7) this.style.color = 'white'; else if (combat.current_m.rnk > 7 && combat.current_m.rnk <= 10) this.style.color = 'lightblue'; else if (combat.current_m.rnk > 10 && combat.current_m.rnk <= 13) this.style.color = 'lightgreen'; else if (combat.current_m.rnk > 13 && combat.current_m.rnk <= 16) this.style.color = 'lime'; else if (combat.current_m.rnk > 16 && combat.current_m.rnk <= 19) this.style.color = 'yellow' }
    dom.d9m.style.borderBottom = '#545299 dotted 2px';
    dom.d9m.style.backgroundColor = '#272744';
    dom.d8m_c = addElement(dom.d1m, 'small', 'bbts');
    dom.d8m1 = addElement(dom.d8m_c, 'div', null, 'bbts');
    dom.d8m1.innerHTML = 'Pause next battle: <span style=\'color:green\'>&nbspOFF';
    dom.d8m1.addEventListener('click', function (this: any) {
      if (flags.to_pause === true) { if (!flags.civil) flags.btl = true; flags.to_pause = false; this.innerHTML = 'Pause next battle: <span style=\'color:green\'>&nbspOFF'; }
      else { flags.to_pause = true; this.innerHTML = 'Pause next battle: <span style=\'color:crimson\'>&nbspON'; }
    });
    dom.d8m2 = addElement(dom.d8m_c, 'div', null, 'bbts');
    dom.d8m2.innerHTML = 'Resume the fight';
    dom.d8m2.style.right = '0px';
    dom.d8m2.style.position = 'absolute';
    dom.d8m2.addEventListener('click', function (this: any) { if (!flags.civil) flags.btl = true; });
    dom.d7m_c = addElement(dom.d1m, 'div', 'ainfo');
    dom.d7m = addElement(dom.d7m_c, 'small');
    dom.d7m.update = function (this: any) { combat.current_z.size >= 0 ? this.innerHTML = 'Area: ' + combat.current_z.name + ' / ' + combat.current_z.size : this.innerHTML = 'Area: ' + combat.current_z.name + ' / ' + '∞'; };
    dom.d7m.update();
    dom.inv_ctx = addElement(document.body, 'div', 'inv');
    if (!flags.aw_u) dom.inv_ctx.style.display = 'none';
    dom.inventory = addElement(dom.inv_ctx, 'div');
    dom.inv_control = addElement(dom.inventory, 'div', 'inv_control');
    dom.inv_btn_1 = addElement(dom.inv_control, 'div', null, 'bts');
    dom.inv_btn_2 = addElement(dom.inv_control, 'div', null, 'bts');
    dom.inv_btn_3 = addElement(dom.inv_control, 'div', null, 'bts');
    dom.inv_btn_4 = addElement(dom.inv_control, 'div', null, 'bts');
    dom.inv_btn_5 = addElement(dom.inv_control, 'div', null, 'bts');
    dom.inv_ctx_b = addElement(dom.inventory, 'div', 'inv_ctx_b');
    dom.inv_control_b = addElement(dom.inv_ctx, 'div', 'inv_control_b');
    dom.inv_btn_1_b = addElement(dom.inv_control_b, 'div', null, 'nav-button');
    dom.inv_btn_2_b = addElement(dom.inv_control_b, 'div', null, 'nav-button');
    dom.inv_btn_3_b = addElement(dom.inv_control_b, 'div', null, 'nav-button');
    dom.mn = addElement(dom.inv_control_b, 'div', 'mn');
    dom.mn_1 = addElement(dom.mn, 'small', 'mnb');
    dom.mn_1.innerHTML = '㊧0';
    dom.mn_2 = addElement(dom.mn, 'small', 'mnb');
    dom.mn_2.innerHTML = '●0';
    dom.mn_3 = addElement(dom.mn, 'small', 'mnb');
    dom.mn_3.innerHTML = '●0';
    dom.mn_4 = addElement(dom.mn, 'small', 'mnb');
    dom.mn_4.innerHTML = '●0';
    dom.mn_1.style.textShadow = 'red -1px 1px 0px, crimson 2px 0px 0px';
    dom.mn_1.style.backgroundColor = 'darkred';
    dom.mn_1.style.color = 'chartreuse';
    dom.mn_2.style.color = '#ffd700';
    dom.mn_2.style.backgroundColor = '664200';
    dom.mn_3.style.color = '#c0c0c0';
    dom.mn_3.style.backgroundColor = '383838';
    dom.mn_4.style.color = '#ff743f';
    dom.mn_4.style.backgroundColor = '662617';
    dom.mn_1.style.opacity = 0;
    dom.mn_2.style.display = 'none';
    dom.mn_3.style.display = 'none';
    dom.mn_4.style.display = 'none';
    dom.ctrmg = addElement(document.body, 'div', 'ctrmg');
    dom.ctrmg_ca = addElement(dom.ctrmg, 'div');
    dom.ctrmg_cb = addElement(dom.ctrmg, 'div');
    dom.ctrwin1 = addElement(dom.ctrmg_cb, 'div');
    dom.ctrwin1.style.display = '';
    dom.ctrwin2 = addElement(dom.ctrmg_cb, 'div', null, 'ctrl-window-body');
    dom.ctrwin2.style.display = 'none';
    dom.ctrwin3 = addElement(dom.ctrmg_cb, 'div', null, 'ctrl-window-body');
    dom.ctrwin3.style.display = 'none';
    dom.ctrwin4 = addElement(dom.ctrmg_cb, 'div', null, 'ctrl-window-body');
    dom.ctrwin4.style.display = 'none';
    dom.ctrwin5 = addElement(dom.ctrmg_cb, 'div', null, 'ctrl-window-body');
    dom.ctrwin5.style.display = 'none';
    dom.ctrwin6 = addElement(dom.ctrmg_cb, 'div', null, 'ctrl-window-body');
    dom.ctrwin6.style.display = 'none';
    dom.ctrwin7 = addElement(dom.ctrmg_cb, 'div', null, 'ctrl-window-body');
    dom.ctrwin7.style.display = 'none';
    dom.nthngdsp = addElement(dom.ctrmg_cb, 'div');
    dom.nthngdsp.style.top = 200;
    dom.nthngdsp.style.left = 210
    dom.nthngdsp.style.position = 'relative';
    dom.nthngdsp.style.color = 'grey';
    dom.nthngdsp.innerHTML = 'Nothing here yet';
    dom.nthngdsp.style.display = 'none'
    dom.ctr_1 = addElement(dom.ctrmg_ca, 'div', 'ctrm_1');
    if (!flags.aw_u) dom.ctr_1.style.display = 'none';
    dom.ctr_1a = addElement(dom.ctr_1, 'div');
    dom.d_weather = addElement(dom.ctr_1a, 'div', 'ctr_w');
    dom.d_weathers = addElement(dom.d_weather, 'small');
    dom.d_weathert = addElement(dom.d_weather, 'span');
    dom.d_weathers.style.marginRight = 5
    dom.d_weathers.addEventListener('click', () => { flags.ssngaijin = !flags.ssngaijin; wdrseason(flags.ssngaijin) })
    dom.d_moon = addElement(dom.d_weather, 'span');
    dom.d_anomaly = addElement(dom.d_weather, 'span');
    dom.d_anomaly.innerHTML = '';
    if (typeof InstallTrigger == 'undefined') {
      dom.d_anomaly.style.float = 'right';
      dom.d_anomaly.style.top = -4;
      dom.d_anomaly.style.position = 'relative';
      dom.d_moon.style.float = 'right';
      dom.d_moon.style.top = -4;
      dom.d_moon.style.position = 'relative';
    }
    dom.d_time = addElement(dom.ctr_1a, 'div', 'ctr_t');
    dom.d_time.addEventListener('click', function (this: any) { if (flags.tmmode >= 3) flags.tmmode = 1; else flags.tmmode++; this.innerHTML = '<small>' + getDay(flags.tmmode) + '</small> ' + timeDisp(time) });
    // Weather/time init (after DOM elements exist)
    setWeather(weather.clear, 600);
    wManager(); dom.d_time.innerHTML = '<small>' + getDay(flags.tmmode) + '</small> ' + timeDisp(time);
    dom.d_lct = addElement(dom.ctr_1a, 'div', 'ctr_l');
    dom.d_lct.style.display = 'none';
    dom.d_lct.innerHTML = 'Location: '
    dom.d_lctc = addElement(dom.d_lct, 'div');
    dom.d_lctc.style.fontSize = '0.85em';
    dom.d_lctc.style.paddingTop = 7;
    dom.d_lctc.style.marginLeft = -1;
    dom.d_lctc.style.display = 'flex'
    dom.d_lctt = addElement(dom.d_lctc, 'span');
    dom.d_lctte = addElement(dom.d_lctc, 'span')
    dom.ctr_2 = addElement(dom.ctrwin1, 'div', 'ctrm_2');
    dom.ct_ctrl = addElement(dom.ctrmg, 'div', 'ct_ctrl');
    if (!flags.aw_u) dom.ct_ctrl.style.display = 'none';
    dom.ct_bt1 = addElement(dom.ct_ctrl, 'div', null, 'control-tab');
    dom.ct_bt1.innerHTML = flags.asbu ? 'assemble' : '???????';
    dom.ct_bt2 = addElement(dom.ct_ctrl, 'div', null, 'control-tab');
    dom.ct_bt2.innerHTML = flags.sklu ? 'skills' : '???????';
    dom.ct_bt3 = addElement(dom.ct_ctrl, 'div', null, 'control-tab');
    dom.ct_bt3.innerHTML = flags.actsu ? 'actions' : '???????';
    dom.ct_bt6 = addElement(dom.ct_ctrl, 'div', null, 'control-tab');
    dom.ct_bt6.innerHTML = flags.jnlu ? 'journal' : '???????';
    dom.ct_bt7 = addElement(dom.ct_ctrl, 'div', null, 'control-tab');
    dom.ct_bt7.innerHTML = 'settings';
    dom.ct_bt1.style.borderLeft = 'none';
    dom.ct_bt7.style.borderRight = 'none';

    dom.ct_bt7.addEventListener('click', () => {
      dom.nthngdsp.style.display = 'none';
      if (global.lw_op === 7) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lw_op = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = ''; dom.ctrwin3.style.display = 'none'; dom.ctrwin1.style.display = 'none'; dom.ctrwin2.style.display = 'none'; global.lw_op = 7 }
      clearInterval(timers.sklupdate);
      clearInterval(timers.bstmonupdate)
    });
    dom.ct_bt1.addEventListener('click', () => {
      dom.nthngdsp.style.display = 'none';
      if (global.lw_op === 1) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lw_op = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else {
        dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = ''; dom.ctrwin1.style.display = 'none'; global.lw_op = 1;
        if (global.rec_d.length > 0) { dom.ct_bt1_c.style.display = ''; rsort(global.rm); clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) } else { dom.ct_bt1_c.style.display = 'none'; dom.nthngdsp.style.display = '' }
      }
    });

    dom.ct_bt3.addEventListener('click', function (this: any) {
      dom.nthngdsp.style.display = 'none';
      if (global.lw_op === 3) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lw_op = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else {
        dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = ''; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = 'none'; global.lw_op = 3; empty(dom.ctrwin5);
        if (acts.length > 0) {
          this.acch = addElement(dom.ctrwin5, 'div');
          this.acch.innerHTML = 'A c t i o n　　l i s t';
          this.acch.style.padding = '2px';
          this.acch.style.textAlign = 'center';
          this.acch.style.backgroundColor = '#050730';
          this.acch_e = addElement(this.acch, 'div');
          this.acch_e.style.float = 'right';
          this.acch_e.style.display = 'flex';
          this.acch_e.style.position = 'relative';
          this.acch_e.style.top = -6;
          this.acch_e.style.right = -2;
          this.acch_e.style.height = 20;
          dom.acccon = addElement(dom.ctrwin5, 'div');
          empty(dom.acccon);
          for (let a in acts) {
            renderAct(acts[a]);
          }
        } else dom.nthngdsp.style.display = ''
      }
    });

    dom.ct_bt2.addEventListener('click', function (this: any) {
      dom.nthngdsp.style.display = 'none';
      if (global.lw_op === 2) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lw_op = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else {
        dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = ''; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = 'none'; global.lw_op = 2; if (you.skls.length > 0) {
          dom.nthngdsp.style.display = 'none';
          empty(dom.ctrwin3);
          this.skwm = addElement(dom.ctrwin3, 'div');
          this.skwm.innerHTML = 'S k i l l　　l i s t';
          this.skwm.style.padding = '2px';
          this.skwm.style.textAlign = 'center';
          this.skwm.style.backgroundColor = '#050730';
          this.skwm_e = addElement(this.skwm, 'div');
          this.skwm_e.style.float = 'right';
          this.skwm_e.style.display = 'flex';
          this.skwm_e.style.position = 'relative';
          this.skwm_e.style.top = -6;
          this.skwm_e.style.right = -2;
          this.skwm_e.style.height = 20;
          this.skwm_e_btn_1_b = addElement(this.skwm_e, 'div', null, 'nav-button');
          this.skwm_e_btn_1_b.innerHTML = 'A-Z';
          this.skwm_e_btn_1_b.style.border = '1px solid #46a';
          this.skwm_e_btn_2_b = addElement(this.skwm_e, 'div', null, 'nav-button');
          this.skwm_e_btn_2_b.innerHTML = 'TPE';
          this.skwm_e_btn_2_b.style.border = '1px solid #46a';
          this.skwm_e_btn_3_b = addElement(this.skwm_e, 'div', null, 'nav-button');
          this.skwm_e_btn_3_b.innerHTML = 'LVL';
          this.skwm_e_btn_3_b.style.border = '1px solid #46a';
          this.skwm_e_btn_1_b.addEventListener('click', function (this: any) {
            if (flags.ssort_a === true) {
              you.skls.sort(function (a: any, b: any) { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
              flags.ssort_a = false;
            } else {
              you.skls.sort(function (a: any, b: any) { if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
              flags.ssort_a = true;
            } empty(dom.skcon)
            for (let m = 0; m < you.skls.length; m++) { renderSkl(you.skls[m]); if (m === you.skls.length - 1) dom.skcon.children[m].style.borderBottom = '1px solid #46a'; }
          });
          this.skwm_e_btn_2_b.addEventListener('click', function (this: any) {
            if (flags.ssort_b === true) {
              you.skls.sort(function (a: any, b: any) { if (a.type < b.type) return -1; if (a.type > b.type) return 1; if (a.id < b.id) return -1; if (a.id > b.id) return 1; return 0 });
              flags.ssort_b = false;
            } else {
              you.skls.sort(function (a: any, b: any) { if (a.type > b.type) return -1; if (a.type < b.type) return 1; if (a.id > b.id) return -1; if (a.id < b.id) return 1; return 0 });
              flags.ssort_b = true;
            } empty(dom.skcon)
            for (let m = 0; m < you.skls.length; m++) { renderSkl(you.skls[m]); if (m === you.skls.length - 1) dom.skcon.children[m].style.borderBottom = '1px solid #46a'; }
          });
          this.skwm_e_btn_3_b.addEventListener('click', function (this: any) {
            if (flags.ssort_b === true) {
              you.skls.sort(function (a: any, b: any) { if (a.lvl < b.lvl) return -1; if (a.lvl > b.lvl) return 1; if (a.exp < b.exp) return -1; if (a.exp > b.exp) return 1; return 0 });
              flags.ssort_b = false;
            } else {
              you.skls.sort(function (a: any, b: any) { if (a.lvl > b.lvl) return -1; if (a.lvl < b.lvl) return 1; if (a.exp > b.exp) return -1; if (a.exp < b.exp) return 1; return 0 });
              flags.ssort_b = true;
            } empty(dom.skcon)
            for (let m = 0; m < you.skls.length; m++) { renderSkl(you.skls[m]); if (m === you.skls.length - 1) dom.skcon.children[m].style.borderBottom = '1px solid #46a'; }
          });
          addDesc(this.skwm_e_btn_1_b, null, 2, 'Filter', 'Alphabetically');
          addDesc(this.skwm_e_btn_2_b, null, 2, 'Filter', 'by Type');
          addDesc(this.skwm_e_btn_3_b, null, 2, 'Filter', 'by Levels');
          dom.skcon = addElement(dom.ctrwin3, 'div');
          dom.skcon.style.overflow = 'auto';
          dom.skcon.style.height = 335;
          dom.skcon.style.width = '100%'
          for (let m = 0; m < you.skls.length; m++) { renderSkl(you.skls[m]); if (m === you.skls.length - 1) dom.skcon.children[m].style.borderBottom = '1px solid #46a'; }
          let sklsize = you.skls.length;
          timers.sklupdate = setInterval(() => {
            if (sklsize < you.skls.length) {
              empty(dom.skcon);
              for (let m = 0; m < you.skls.length; m++) { renderSkl(you.skls[m]); if (m === you.skls.length - 1) dom.skcon.children[m].style.borderBottom = '1px solid #46a'; }
            }
            for (let n = 1; n < you.skls.length + 1; n++) {
              dom.skcon.children[n - 1].children[0].innerHTML = you.skls[n - 1].name + ' lvl: ' + you.skls[n - 1].lvl;
              dom.skcon.children[n - 1].children[0].style.fontSize = you.skls[n - 1].sp;
              dom.skcon.children[n - 1].children[1].innerHTML = '　exp: ' + formatw(Math.floor(you.skls[n - 1].exp)) + '/' + formatw(you.skls[n - 1].expnext_t);
              dom.skcon.children[n - 1].children[2].children[0].style.width = you.skls[n - 1].exp / you.skls[n - 1].expnext_t * 100 + '%';
              //if(you.skls[n-1].lastupd&&you.skls[n-1].lastupd-time.minute>=1) dom.skcon.children[n-1].children[2].children[0].style.backgroundColor='limegreen'; else dom.skcon.children[n-1].children[2].children[0].style.backgroundColor='yellow';
            }
          }, 1000)
        } else dom.nthngdsp.style.display = ''
      }
    });
    dom.ct_bt6.addEventListener('click', function (this: any) {
      if (!flags.jnlu) return; dom.nthngdsp.style.display = 'none';
      if (global.lw_op === 6) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lw_op = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else {
        dom.ctrwin6.style.display = ''; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = 'none'; global.lw_op = 6;
        empty(dom.ctrwin6)
        this.jlbl = addElement(dom.ctrwin6, 'div');
        this.jlbl.innerHTML = 'J o u r n a l';
        this.jlbl.style.padding = '2px';
        this.jlbl.style.textAlign = 'center';
        this.jlbl.style.backgroundColor = '#050730';
        this.jlbl.style.borderBottom = '1px solid rgb(12,86,195)'
        this.jlmain = addElement(dom.ctrwin6, 'div');
        this.jlmain.style.height = 336;
        this.jlmain.style.background = 'linear-gradient(0deg, rgb(35, 67, 125), rgb(19, 18, 97))'
        this.jlbod = addElement(this.jlmain, 'div');
        this.jlbrw1 = addElement(this.jlbod, 'div', null, 'journal-row');
        dom.jlbrw1s1 = addElement(this.jlbrw1, 'div', 'jcell1', 'journal-cell');
        dom.jlbrw1s2 = addElement(this.jlbrw1, 'div', 'jcell2', 'journal-cell');
        this.jlbrw2 = addElement(this.jlbod, 'div', null, 'journal-row');
        this.jlbrw2s1 = addElement(this.jlbrw2, 'div', 'jcell3', 'journal-cell');
        this.jlbrw2s2 = addElement(this.jlbrw2, 'div', 'jcell4', 'journal-cell');
        this.jlbod.style.height = 100;
        this.jlbod.style.width = '100%';
        dom.jlbrw1s1.innerHTML = 'Q U E S T S';
        dom.jlbrw1s2.innerHTML = flags.bstu === true ? 'B E S T I A R Y' : '????????????'
        this.jlbrw2s1.innerHTML = '????????????';
        this.jlbrw2s2.innerHTML = 'S T A T I S T I C S';
        dom.jlbrw1s1.addEventListener('click', () => {
          empty(dom.ctrwin6); global.lw_op = -1;
          qsts.sort(function (a: any, b: any) { if ((a.id > b.id) && a.data.started === true) return -1; if ((a.id < b.id) && a.data.done === true && a.data.started === false) return 1; return 0 });
          dom.qstbody = addElement(dom.ctrwin6, 'div');
          this.qstlbl = addElement(dom.qstbody, 'div');
          this.qstlbl.innerHTML = 'Q U E S T　　L I S T'
          this.qstlbl.style.textAlign = 'center';
          this.qstlbl.style.padding = 7;
          this.qstlbl.style.background = 'linear-gradient(180deg,#182347,#13152f)';
          for (let a in qsts) {
            let c: any, rarc: any, rarts = '';
            switch (qsts[a].rar) {
              case 0: { rarc = 'grey'; break }
              case 1: { rarc = 'white'; break }
              case 2: { rarts = '0px 0px 1px blue'; rarc = 'cyan'; break }
              case 3: { rarts = '0px 0px 2px lime'; rarc = 'lime'; break }
              case 4: { rarts = '0px 0px 3px orange'; rarc = 'yellow'; break }
              case 5: { rarts = '0px 0px 2px crimson,0px 0px 5px red'; rarc = 'orange'; break }
              case 6: { rarts = '1px 1px 1px black,0px 0px 2px purple'; rarc = 'purple'; break }
              case 7: { rarts = 'hotpink 1px 1px .1em,cyan -1px -1px .1em'; rarc = 'black'; break }
            }
            if (qsts[a].data.done) c = 'green';
            if (qsts[a].data.started) c = 'cyan'
            this.qstcell = addElement(dom.qstbody, 'div', null, 'skill-entry');
            this.qstcell.innerHTML = qsts[a].name;
            this.qstcell.style.color = c;
            this.qstcell.style.textAlign = 'center';
            this.qstcell.style.display = 'block';
            let rar = '';
            for (let i = 0; i < qsts[a].rar; i++) rar += ' ★ ';
            this.qstcell.innerHTML += ' <small style="font-size:.6em;color:' + rarc + ';text-shadow:' + rarts + '">' + rar + '</small>'
            if (qsts[a].repeatable) this.qstcell.innerHTML += '<small style="color:grey"> ≶</small>';
            if (qsts.length - 1 == Number(a)) this.qstcell.style.borderBottom = '1px solid #46a';
            this.qstcell.addEventListener('click', function (this: any) {
              empty(dom.qstbody); this.qmain = addElement(dom.qstbody, 'div');
              this.qmain.style.height = 359;
              this.qmain.style.width = '100%';
              this.qmain.style.background = 'linear-gradient(180deg,#040b2d,#29071c)';
              this.qmain.style.textAlign = 'center'
              this.qlabl = addElement(this.qmain, 'small');
              this.qlabl.innerHTML = '#' + qsts[a].id + ': ' + qsts[a].name + ' [<small style="color:' + rarc + ';text-shadow:' + rarts + '">' + rar + '</small>]' + (qsts[a].data.done && !qsts[a].data.started ? '<span style="color:lime"> completed</span>' : '<span style="color:yellow"> in progress</span>');
              this.qlabl.style.padding = 6;
              this.qlabl.style.borderBottom = 'dotted 2px #2b408a';
              this.qlabl.style.backgroundColor = '#12152f';
              this.qlabl.style.display = 'inherit'
              this.qstatba = addElement(this.qmain, 'small');
              this.qstatba.innerHTML = 'Location: <span style="color:green">' + qsts[a].loc + '</span>';
              this.qstatba.style.borderBottom = '1px solid #2b408a';
              this.qstatba.style.display = 'block';
              this.qdsc = addElement(this.qmain, 'div');
              this.qdsc.innerHTML = qsts[a].desc;
              this.qdsc.style.padding = 12;
              this.qdsc.style.borderBottom = 'dotted 2px #2b408a';
              this.qdsc.style.color = '#f7ff82'
              this.qtodo = addElement(this.qmain, 'div');
              let goals = qsts[a].data.done && !qsts[a].data.started ? qsts[a].goalsf() : qsts[a].goals();
              this.qtodo.style.padding = 6;
              this.qtodo.innerHTML = '「Objectives」';
              this.qtodo.style.color = '#ffc319';
              this.qtodo.style.backgroundColor = '#12152f'
              this.qgoalbod = addElement(this.qmain, 'div');
              this.qgoalbod.style.borderBottom = 'dotted 2px #2b408a';
              for (let b in goals) {
                this.qtodoitm = addElement(this.qgoalbod, 'div');
                this.qtodoitm.style.padding = 4;
                this.qtodoitm.style.fontSize = 'smaller';
                this.qtodoitm.style.backgroundColor = '#182247';
                this.qtodoitm.style.borderTop = '1px solid #3b3158'
                this.qtodoitm.innerHTML = goals[b];
              }
              this.qstatbak = addElement(this.qmain, 'div', 'qtrtn');
              this.qstatbak.innerHTML = '<= Return';
              this.qstatbak.addEventListener('click', () => { dom.jlbrw1s1.click() });
            });
          }
        });
        dom.jlbrw1s2.addEventListener('click', function (this: any) {
          if (!flags.bstu) return; empty(dom.ctrwin6); global.lw_op = -1;
          let bst_entr_case = addElement(dom.ctrwin6, 'div');
          bst_entr_case.style.height = '84%';
          bst_entr_case.style.backgroundColor = 'rgb(0,20,44)';
          bst_entr_case.style.overflow = 'auto'
          this.bst_entr_head = addElement(bst_entr_case, 'div', null, 'list-row');
          this.bst_entr_head.style.textAlign = 'center';
          this.bst_entr_head.style.paddingTop = '3px';
          this.bst_entr_head.style.paddingBottom = '3px';
          this.bst_entr_head1 = addElement(this.bst_entr_head, 'div', null, 'list-col-name');
          this.bst_entr_head1.innerHTML = 'name'
          this.bst_entr_head2 = addElement(this.bst_entr_head, 'div', null, 'list-col-rank');
          this.bst_entr_head2.innerHTML = 'rank'
          this.bst_entr_head3 = addElement(this.bst_entr_head, 'div', null, 'list-col-stat');
          this.bst_entr_head3.innerHTML = 'kills'
          for (let ii = 1; ii < global.bestiary.length; ii++) {
            let mon;
            for (let id in creature) if (creature[id].id === global.bestiary[ii].id) mon = creature[id];
            this.bst_entr_m_case = addElement(bst_entr_case, 'div', 'bst_entrh', 'list-row');
            this.bst_entr_m_case.style.backgroundColor = 'rgb(10,30,54)';
            this.bst_entr_m_e1 = addElement(this.bst_entr_m_case, 'div', null, 'list-col-name');
            this.bst_entr_m_e1.innerHTML = mon.name;
            this.bst_entr_m_e2 = addElement(this.bst_entr_m_case, 'div', null, 'list-col-rank');
            this.bst_entr_m_e2.innerHTML = gameText.eranks[mon.rnk];
            if (mon.rnk <= 4) this.bst_entr_m_e2.style.color = 'lightgrey';
            else if (mon.rnk > 4 && mon.rnk <= 7) this.bst_entr_m_e2.style.color = 'white';
            else if (mon.rnk > 7 && mon.rnk <= 10) this.bst_entr_m_e2.style.color = 'lightblue';
            else if (mon.rnk > 10 && mon.rnk <= 13) this.bst_entr_m_e2.style.color = 'lightgreen';
            else if (mon.rnk > 13 && mon.rnk <= 16) this.bst_entr_m_e2.style.color = 'lime';
            else if (mon.rnk > 16 && mon.rnk <= 19) this.bst_entr_m_e2.style.color = 'yellow';
            this.bst_entr_m_e3 = addElement(this.bst_entr_m_case, 'div', null, 'list-col-stat');
            this.bst_entr_m_e3.innerHTML = global.bestiary[ii].kills;
            addDesc(this.bst_entr_m_case, mon, 10);
          } let monsize = global.bestiary.length;
          timers.bstmonupdate = setInterval(function (this: any) {
            if (monsize < global.bestiary.length) {
              for (let ii = monsize; ii < global.bestiary.length; ii++) {
                let mon;
                for (let id in creature) if (creature[id].id === global.bestiary[ii].id) mon = creature[id];
                this.bst_entr_m_case = addElement(bst_entr_case, 'div', 'bst_entrh', 'list-row');
                this.bst_entr_m_case.style.backgroundColor = 'rgb(10,30,54)';
                this.bst_entr_m_e1 = addElement(this.bst_entr_m_case, 'div', null, 'list-col-name');
                this.bst_entr_m_e1.innerHTML = mon.name;
                this.bst_entr_m_e2 = addElement(this.bst_entr_m_case, 'div', null, 'list-col-rank');
                this.bst_entr_m_e2.innerHTML = gameText.eranks[mon.rnk];
                if (mon.rnk <= 4) this.bst_entr_m_e2.style.color = 'lightgrey';
                else if (mon.rnk > 4 && mon.rnk <= 7) this.bst_entr_m_e2.style.color = 'white';
                else if (mon.rnk > 7 && mon.rnk <= 10) this.bst_entr_m_e2.style.color = 'lightblue';
                else if (mon.rnk > 10 && mon.rnk <= 13) this.bst_entr_m_e2.style.color = 'lightgreen';
                else if (mon.rnk > 13 && mon.rnk <= 16) this.bst_entr_m_e2.style.color = 'lime';
                else if (mon.rnk > 16 && mon.rnk <= 19) this.bst_entr_m_e2.style.color = 'yellow';
                this.bst_entr_m_e3 = addElement(this.bst_entr_m_case, 'div', null, 'list-col-stat');
                this.bst_entr_m_e3.innerHTML = global.bestiary[ii].kills;
                addDesc(this.bst_entr_m_case, mon, 10);
              } monsize = global.bestiary.length
            }
            for (let ii = 1; ii < global.bestiary.length; ii++) {
              let mon;
              for (let id in creature) if (creature[id].id === global.bestiary[ii].id) mon = creature[id];
              bst_entr_case.children[ii].children[2].innerHTML = global.bestiary[ii].kills;
            }
          }, 1000);
        });
        this.jlbrw2s2.addEventListener('click', function (this: any) {
          empty(dom.ctrwin6); global.lw_op = -1;
          dom.ch_1 = addElement(dom.ctrwin6, 'div');
          dom.ch_1.style.height = '359px';
          dom.ch_1.style.background = 'linear-gradient(0deg, rgb(24, 18, 51), rgb(0, 44, 87))';
          dom.flsthdr = addElement(dom.ch_1, 'div');
          dom.flsthdr.innerHTML = 'S T A T S';
          dom.flsthdr.style.background = 'linear-gradient(0deg,rgb(21, 17, 49),rgb(0, 42, 85))';
          dom.flsthdr.style.borderBottom = '1px #44c dashed';
          dom.flsthdr.style.padding = 2;
          dom.flsthdr.style.fontSize = 'small';
          dom.flsthdr.style.height = 18
          dom.statbod = addElement(dom.ch_1, 'div');
          dom.statbod.style.overflow = 'auto';
          dom.statbod.style.maxHeight = '93%';
          dom.statbod.style.background = 'linear-gradient(90deg,rgb(1,1,87),rgb(55,7,57))';
          dom.ch_1.style.textAlign = 'center';
          dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
          dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
          dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
          dom.tcleft.innerHTML = 'Game start time';
          dom.tcright.innerHTML = stats.sttime
          /*dom.tccon=addElement(dom.statbod,'small',null,'stat-row');
          dom.tcleft=addElement(dom.tccon,'div',null,'stat-label');
          dom.tcright=addElement(dom.tccon,'div',null,'stat-value');
          dom.tcleft.innerHTML='Time passed';
          let br=stats.tick;
          dom.tcright.innerHTML=(br>=86400?(br/(86400)<<0+' Days '):'')+(br%86400>=3600?(((br%86400/3600)<<0)%24+':'):'')+(br%3600<60?'00':(br%3600>=600?(br%3600/60)<<0:'0'+(br%3600/60)<<0))+(':'+(br%360<60?'0'+br%60:br%60));
          */
          dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
          dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
          dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
          dom.tcleft.innerHTML = 'Ingame time passed';
          let br = time.minute - 338143959;
          dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60);
          dom.tcright.style.fontSize = '.9em';
          if (stats.gsvs > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Game saves';
            dom.tcright.innerHTML += stats.gsvs
          }
          if (stats.athme > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total time spent at home';
            let br = stats.athme;
            dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60)
          }
          if (stats.timeslp > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Time Slept';
            let br = stats.timeslp;
            dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60)
          }
          if (stats.lgtstk > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times struck by lightning';
            dom.tcright.innerHTML = '<span style="color:black;background-color:yellow">' + stats.lgtstk + '</span>'
          }
          if (stats.qstc > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Quests completed';
            dom.tcright.innerHTML = stats.qstc
          }
          if (stats.jcom > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Jobs completed';
            dom.tcright.innerHTML = stats.jcom
          }
          if (stats.dsct > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Discoveries made';
            dom.tcright.innerHTML = stats.dsct
          }
          if (stats.smovet > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times walked';
            dom.tcright.innerHTML = stats.smovet
          }
          if (stats.cat_c > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Cat pets';
            dom.tcright.innerHTML = stats.cat_c
          }
          if (stats.fooda > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Food consumed';
            dom.tcright.innerHTML = stats.fooda
          }
          if (stats.foodt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Bad food consumed';
            dom.tcright.innerHTML = stats.foodt
          }
          if (stats.foodb > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Drinks consumed';
            dom.tcright.innerHTML = stats.foodb
          }
          if (stats.foodal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Alcohol consumed';
            dom.tcright.innerHTML = stats.foodal
          }
          if (stats.ftried > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Unique food tried';
            dom.tcright.innerHTML = stats.ftried
          }
          if (stats.medst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Medicine used';
            dom.tcright.innerHTML = stats.medst
          }
          if (stats.potst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Potions consumed';
            dom.tcright.innerHTML = stats.potst
          }
          if (stats.plst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Pills consumed';
            dom.tcright.innerHTML = stats.plst
          }
          if (stats.igtttl > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items picked up';
            dom.tcright.innerHTML = stats.igtttl
          }
          if (stats.dsst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items disassembled';
            dom.tcright.innerHTML = stats.dsst
          }
          if (stats.thrt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items thrown away';
            dom.tcright.innerHTML = stats.thrt
          }
          if (stats.crftt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items crafted';
            dom.tcright.innerHTML = stats.crftt
          }
          if (global.rec_d.length > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Recipes unlocked';
            dom.tcright.innerHTML = global.rec_d.length
          }
          if (you.skls.length > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Skills unlocked';
            dom.tcright.innerHTML = you.skls.length
          }
          if (global.titles.length > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Titles unlocked';
            dom.tcright.innerHTML = global.titles.length
          }
          if (stats.exptotl > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total EXP gained';
            dom.tcright.innerHTML = formatw(stats.exptotl)
          }
          if (stats.slvs > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total skill levels';
            dom.tcright.innerHTML = stats.slvs
          }
          if (stats.moneyg > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Money acquired';
            dom.ch_etn2_1 = addElement(dom.tcright, 'span');
            dom.ch_etn2_1.style.width = '33.3%';
            dom.ch_etn2_2 = addElement(dom.tcright, 'span');
            dom.ch_etn2_2.style.width = '33.3%';
            dom.ch_etn2_3 = addElement(dom.tcright, 'span');
            dom.ch_etn2_3.style.width = '33.3%';
            let p = stats.moneyg
            if (p >= GOLD) { dom.ch_etn2_1.innerHTML = (dom.coingold + ((p / GOLD) << 0)); dom.ch_etn2_1.style.backgroundColor = 'rgb(102, 66, 0)'; }
            if (p >= SILVER && p % GOLD >= SILVER) { dom.ch_etn2_2.innerHTML = (dom.coinsilver + ((p / SILVER % SILVER) << 0)); dom.ch_etn2_2.style.backgroundColor = 'rgb(56, 56, 56)'; }
            if (p < SILVER || (p > SILVER && p % SILVER > 0)) { dom.ch_etn2_3.innerHTML = (dom.coincopper + ((p % SILVER) << 0)); dom.ch_etn2_3.style.backgroundColor = 'rgb(102, 38, 23)'; }
          }
          if (stats.moneysp > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Money spent in shops';
            dom.ch_etn2_1 = addElement(dom.tcright, 'span');
            dom.ch_etn2_1.style.width = '33.3%';
            dom.ch_etn2_2 = addElement(dom.tcright, 'span');
            dom.ch_etn2_2.style.width = '33.3%';
            dom.ch_etn2_3 = addElement(dom.tcright, 'span');
            dom.ch_etn2_3.style.width = '33.3%';
            let p = stats.moneysp
            if (p >= GOLD) { dom.ch_etn2_1.innerHTML = (dom.coingold + ((p / GOLD) << 0)); dom.ch_etn2_1.style.backgroundColor = 'rgb(102, 66, 0)'; }
            if (p >= SILVER && p % GOLD >= SILVER) { dom.ch_etn2_2.innerHTML = (dom.coinsilver + ((p / SILVER % SILVER) << 0)); dom.ch_etn2_2.style.backgroundColor = 'rgb(56, 56, 56)'; }
            if (p < SILVER || (p > SILVER && p % SILVER > 0)) { dom.ch_etn2_3.innerHTML = (dom.coincopper + ((p % SILVER) << 0)); dom.ch_etn2_3.style.backgroundColor = 'rgb(102, 38, 23)'; }
          }
          if (stats.buyt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Goods bought';
            dom.tcright.innerHTML = stats.buyt
          }
          if (stats.rdttl > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Books read';
            dom.tcright.innerHTML = stats.rdttl;
            addDesc(dom.tccon, null, 2, 'Info', '<span style="color:lie">Click to list known books</span>');
            dom.tccon.addEventListener('click', function (this: any) {
              if (!flags.bksstt) {
                flags.bksstt = true;
                dom.bkssttbd = addElement(document.body, 'div', null, 'popup-list');
                dom.bkssttbd.addEventListener('click', function (this: any) { empty(dom.bkssttbd); document.body.removeChild(dom.bkssttbd); flags.bksstt = false; global.dscr.style.display = 'none' });
                let bks = [];
                for (let a in item) if (item[a].data.finished) bks.push(item[a]);
                for (let a in bks) {
                  dom.bkssttcell = addElement(dom.bkssttbd, 'div', null, 'popup-list-cell');
                  dom.bkssttcell.innerHTML = bks[a].name;
                  addDesc(dom.bkssttcell, bks[a]);
                  switch (bks[a].rar) {
                    case 0: { dom.bkssttcell.style.color = 'grey'; break }
                    case 1: { dom.bkssttcell.style.color = 'rgb(188,254,254)'; break }
                    case 2: { dom.bkssttcell.style.textShadow = '0px 0px 1px blue'; dom.bkssttcell.style.color = 'cyan'; break }
                    case 3: { dom.bkssttcell.style.textShadow = '0px 0px 2px lime'; dom.bkssttcell.style.color = 'lime'; break }
                    case 4: { dom.bkssttcell.style.textShadow = '0px 0px 3px orange'; dom.bkssttcell.style.color = 'yellow'; break }
                    case 5: { dom.bkssttcell.style.textShadow = '0px 0px 2px crimson,0px 0px 5px red'; dom.bkssttcell.style.color = 'orange'; break }
                    case 6: { dom.bkssttcell.style.textShadow = '1px 1px 1px black,0px 0px 2px purple'; dom.bkssttcell.style.color = 'purple'; break }
                  }
                }
              }
            });
          }
          if (stats.rdgtttl > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total reading time';
            let br = stats.rdgtttl;
            dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60)
          }
          if (stats.popt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times description window appeared';
            dom.tcright.innerHTML = stats.popt
          }
          if (stats.dmgdt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total damage dealt';
            dom.tcright.innerHTML = formatw(stats.dmgdt)
          }
          if (stats.dmgrt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total damage recieved';
            dom.tcright.innerHTML = formatw(stats.dmgrt)
          }
          if (stats.deadt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times died';
            dom.tcright.innerHTML = stats.deadt
          }
          if (stats.deadt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Last cause of casualty';
            dom.tcright.innerHTML = getlastd()
          }
          if (stats.akills > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total kills';
            dom.tcright.innerHTML = stats.akills
          }
          if (stats.onesht > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times killed with a single hit';
            dom.tcright.innerHTML = stats.onesht
          }
          if (stats.misst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times missed the attack';
            dom.tcright.innerHTML = stats.misst
          }
          if (stats.dodgt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times dodged the attack';
            dom.tcright.innerHTML = stats.dodgt
          }
          if (stats.msks[0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Humanoid-class foes slayed';
            dom.tcright.innerHTML = stats.msks[0]
          }
          if (stats.msks[1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Beast-class foes slayed';
            dom.tcright.innerHTML = stats.msks[1]
          }
          if (stats.msks[2] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Undead-class foes slayed';
            dom.tcright.innerHTML = stats.msks[2]
          }
          if (stats.msks[3] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Evil-class foes slayed';
            dom.tcright.innerHTML = stats.msks[3]
          }
          if (stats.msks[4] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Phantom-class foes slayed';
            dom.tcright.innerHTML = stats.msks[4]
          }
          if (stats.msks[5] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Dragon-class foes slayed';
            dom.tcright.innerHTML = stats.msks[5]
          }
          if (stats.msts[0][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Unarmed attacks';
            dom.tcright.innerHTML = stats.msts[0][0]
          }
          if (stats.msts[0][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Unarmed kills';
            dom.tcright.innerHTML = stats.msts[0][1]
          }
          if (stats.msts[1][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Sword attacks';
            dom.tcright.innerHTML = stats.msts[1][0]
          }
          if (stats.msts[1][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Sword kills';
            dom.tcright.innerHTML = stats.msts[1][1]
          }
          if (stats.msts[2][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Axe attacks';
            dom.tcright.innerHTML = stats.msts[2][0]
          }
          if (stats.msts[2][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Axe kills';
            dom.tcright.innerHTML = stats.msts[2][1]
          }
          if (stats.msts[3][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Dagger attacks';
            dom.tcright.innerHTML = stats.msts[3][0]
          }
          if (stats.msts[3][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Dagger kills';
            dom.tcright.innerHTML = stats.msts[3][1]
          }
          if (stats.msts[4][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Polearm/Spear attacks';
            dom.tcright.innerHTML = stats.msts[4][0]
          }
          if (stats.msts[4][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Polearm/Spear kills';
            dom.tcright.innerHTML = stats.msts[4][1]
          }
          if (stats.msts[5][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Hammer/Club attacks';
            dom.tcright.innerHTML = stats.msts[5][0]
          }
          if (stats.msts[5][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Hammer/Club kills';
            dom.tcright.innerHTML = stats.msts[5][1]
          }
          if (stats.msts[6][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Staff attacks';
            dom.tcright.innerHTML = stats.msts[6][0]
          }
          if (stats.msts[6][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Staff kills';
            dom.tcright.innerHTML = stats.msts[6][1]
          }

        });
      }
    });

    dom.ct_bt1_c = addElement(dom.ctrwin2, 'div', 'crf_c');
    dom.ct_bt1_1_ncont = addElement(dom.ct_bt1_c, 'div');
    dom.ct_bt1_1_ncont.style.height = '100%';
    dom.ct_bt1_1_ncont.style.width = '45%';
    dom.ct_bt1_1_cont = addElement(dom.ct_bt1_1_ncont, 'div');
    dom.ct_bt1_1 = addElement(dom.ct_bt1_1_ncont, 'div', 'crf_l');
    dom.ct_bt1_1.style.height = 343;
    dom.ct_bt1_1.style.width = '100%';
    dom.ct_bt1_1_cont.style.bottom = 0;
    dom.ct_bt1_1_cont.style.borderBottom = '1px solid cornflowerblue ';
    dom.ct_bt1_1_cont.style.display = 'flex';
    dom.ct_bt1_1_cont_a = addElement(dom.ct_bt1_1_cont, 'small', null, 'craft-tab');
    dom.ct_bt1_1_cont_c = addElement(dom.ct_bt1_1_cont, 'small', null, 'craft-tab');
    dom.ct_bt1_1_cont_b = addElement(dom.ct_bt1_1_cont, 'small', null, 'craft-tab');
    dom.ct_bt1_1_cont_d = addElement(dom.ct_bt1_1_cont, 'small', null, 'craft-tab');
    dom.ct_bt1_1_cont_e = addElement(dom.ct_bt1_1_cont, 'small', null, 'craft-tab');
    dom.ct_bt1_1_cont_f = addElement(dom.ct_bt1_1_cont, 'small', null, 'craft-tab');
    dom.ct_bt1_1_cont_f.style.borderRight = 'none';
    16
    dom.ct_bt1_1_cont_a.style.backgroundColor = 'darkslategrey';
    dom.ct_bt1_1_cont_b.style.backgroundColor = '#332e12';
    dom.ct_bt1_1_cont_c.style.backgroundColor = '#1c3319';
    dom.ct_bt1_1_cont_d.style.backgroundColor = '#b73c0d';
    dom.ct_bt1_1_cont_e.style.backgroundColor = '#313254';
    dom.ct_bt1_1_cont_f.style.backgroundColor = '#5155d6';
    dom.ct_bt1_1_cont_a.addEventListener('click', function (this: any) { rstcrtthg(); this.style.color = 'yellow'; rsort(0) });
    dom.ct_bt1_1_cont_b.addEventListener('click', function (this: any) { rstcrtthg(); this.style.color = 'yellow'; rsort(1) });
    dom.ct_bt1_1_cont_c.addEventListener('click', function (this: any) { rstcrtthg(); this.style.color = 'yellow'; rsort(2) });
    dom.ct_bt1_1_cont_d.addEventListener('click', function (this: any) { rstcrtthg(); this.style.color = 'yellow'; rsort(3) });
    dom.ct_bt1_1_cont_e.addEventListener('click', function (this: any) { rstcrtthg(); this.style.color = 'yellow'; rsort(4) });
    dom.ct_bt1_1_cont_f.addEventListener('click', function (this: any) { rstcrtthg(); this.style.color = 'yellow'; rsort(5) });
    global.spbtsr = [dom.ct_bt1_1_cont_a, dom.ct_bt1_1_cont_b, dom.ct_bt1_1_cont_c, dom.ct_bt1_1_cont_d, dom.ct_bt1_1_cont_e, dom.ct_bt1_1_cont_f]
    dom.ct_bt1_1_cont_a.innerHTML = 'ALL';
    dom.ct_bt1_1_cont_b.innerHTML = 'FOD';
    dom.ct_bt1_1_cont_c.innerHTML = 'MED';
    dom.ct_bt1_1_cont_d.innerHTML = 'WEP';
    dom.ct_bt1_1_cont_e.innerHTML = 'EQP';
    dom.ct_bt1_1_cont_f.innerHTML = 'MAT';
    addDesc(dom.ct_bt1_1_cont_a, null, 2, 'Filter', 'All');
    addDesc(dom.ct_bt1_1_cont_b, null, 2, 'Filter', 'Food');
    addDesc(dom.ct_bt1_1_cont_c, null, 2, 'Filter', 'Medicine/Tools');
    addDesc(dom.ct_bt1_1_cont_d, null, 2, 'Filter', 'Weapons');
    addDesc(dom.ct_bt1_1_cont_e, null, 2, 'Filter', 'Equipment/Accessories');
    addDesc(dom.ct_bt1_1_cont_f, null, 2, 'Filter', 'Materials/Misc.');
    dom.ct_bt1_2 = addElement(dom.ct_bt1_c, 'div', 'crf_r');
    dom.ct_bt4_1 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_1a = addElement(dom.ct_bt4_1, 'div', null, 'option-label');
    dom.ct_bt4_1a.innerHTML = 'Message log limit';
    dom.ct_bt4_1b = addElement(dom.ct_bt4_1, 'input', null, 'option-input');
    dom.ct_bt4_1b.value = global.msgs_max;
    dom.ct_bt4_1b.type = 'number';
    dom.ct_bt4_1b.min = 1;
    dom.ct_bt4_1b.max = 100;
    dom.ct_bt4_1b.addEventListener('change', function (this: any) { if (this.value < 1) this.value = 1; else if (this.value > 100) this.value = 100; global.msgs_max = this.value });
    dom.ct_bt4_2 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_2a = addElement(dom.ct_bt4_2, 'div', null, 'option-label');
    dom.ct_bt4_2a.innerHTML = 'BG Color';
    dom.ct_bt4_21b = addElement(dom.ct_bt4_2, 'input', null, 'option-input');
    dom.ct_bt4_21b.value = global.bg_r;
    dom.ct_bt4_21b.type = 'range';
    dom.ct_bt4_21b.min = 0;
    dom.ct_bt4_21b.max = 255;
    dom.ct_bt4_21b.style.width = '85px';
    dom.ct_bt4_21b.style.height = '16px';
    dom.ct_bt4_21b.addEventListener('input', function (this: any) { document.body.removeAttribute('style'); flags.bgspc = false; global.bg_r = this.value; document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')'; dom.ct_bt4_31b.innerHTML = global.bg_r });
    dom.ct_bt4_22b = addElement(dom.ct_bt4_2, 'input', null, 'option-input');
    dom.ct_bt4_22b.value = global.bg_g;
    dom.ct_bt4_22b.type = 'range';
    dom.ct_bt4_21b.style.height = '16px';
    dom.ct_bt4_22b.style.height = '16px';
    dom.ct_bt4_22b.min = 0;
    dom.ct_bt4_22b.max = 255;
    dom.ct_bt4_22b.style.width = '85px';
    dom.ct_bt4_22b.style.left = '367px';
    dom.ct_bt4_22b.addEventListener('input', function (this: any) { document.body.removeAttribute('style'); flags.bgspc = false; global.bg_g = this.value; document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')'; dom.ct_bt4_32b.innerHTML = global.bg_g });
    dom.ct_bt4_23b = addElement(dom.ct_bt4_2, 'input', null, 'option-input');
    dom.ct_bt4_23b.value = global.bg_b;
    dom.ct_bt4_23b.type = 'range';
    dom.ct_bt4_21b.style.height = '16px';
    dom.ct_bt4_23b.style.height = '16px';
    dom.ct_bt4_23b.min = 0;
    dom.ct_bt4_23b.max = 255;
    dom.ct_bt4_23b.style.width = '85px';
    dom.ct_bt4_23b.style.left = '459px';
    dom.ct_bt4_23b.addEventListener('input', function (this: any) { document.body.removeAttribute('style'); flags.bgspc = false; global.bg_b = this.value; document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')'; dom.ct_bt4_33b.innerHTML = global.bg_b });

    dom.ct_bt4_3 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_3a = addElement(dom.ct_bt4_3, 'div', null, 'option-label');
    dom.ct_bt4_3a.innerHTML = '　';
    dom.ct_bt4_31b = addElement(dom.ct_bt4_3, 'div', null, 'option-input');
    dom.ct_bt4_31b.style.textAlign = 'center';
    dom.ct_bt4_31b.style.width = '83px';
    dom.ct_bt4_31b.innerHTML = global.bg_r || 255;
    dom.ct_bt4_32b = addElement(dom.ct_bt4_3, 'div', null, 'option-input');
    dom.ct_bt4_32b.style.textAlign = 'center';
    dom.ct_bt4_32b.style.width = '83px';
    dom.ct_bt4_32b.innerHTML = global.bg_g || 255;
    dom.ct_bt4_32b.style.left = '367px';
    dom.ct_bt4_33b = addElement(dom.ct_bt4_3, 'div', null, 'option-input');
    dom.ct_bt4_33b.style.textAlign = 'center';
    dom.ct_bt4_33b.style.width = '83px';
    dom.ct_bt4_33b.innerHTML = global.bg_b || 255;
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
    dom.ct_bt4_03b1.addEventListener('click', function (this: any) {
      flags.bgspc = false
      global.bg_r = 255;
      global.bg_g = 255;
      global.bg_b = 255;
      document.body.removeAttribute('style')
      dom.ct_bt4_31b.innerHTML = 255;
      dom.ct_bt4_32b.innerHTML = 255;
      dom.ct_bt4_33b.innerHTML = 255;
      dom.ct_bt4_21b.value = global.bg_r;
      dom.ct_bt4_22b.value = global.bg_g;
      dom.ct_bt4_23b.value = global.bg_b
      document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')';
    });
    dom.ct_bt4_03b2.addEventListener('click', function (this: any) {
      flags.bgspc = false
      global.bg_r = 188;
      global.bg_g = 188;
      global.bg_b = 188;
      document.body.removeAttribute('style')
      dom.ct_bt4_31b.innerHTML = 188;
      dom.ct_bt4_32b.innerHTML = 188;
      dom.ct_bt4_33b.innerHTML = 188;
      dom.ct_bt4_21b.value = global.bg_r;
      dom.ct_bt4_22b.value = global.bg_g;
      dom.ct_bt4_23b.value = global.bg_b
      document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')';
    });
    dom.ct_bt4_03b3.addEventListener('click', function (this: any) {
      flags.bgspc = false
      global.bg_r = 18;
      global.bg_g = 18;
      global.bg_b = 46;
      document.body.removeAttribute('style')
      dom.ct_bt4_31b.innerHTML = 18;
      dom.ct_bt4_32b.innerHTML = 18;
      dom.ct_bt4_33b.innerHTML = 46;
      dom.ct_bt4_21b.value = global.bg_r;
      dom.ct_bt4_22b.value = global.bg_g;
      dom.ct_bt4_23b.value = global.bg_b
      document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')';
    });
    dom.ct_bt4_03b4.addEventListener('click', function (this: any) {
      flags.bgspc = true
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
    dom.ct_bt4_41b.addEventListener('click', () => { nograd(flags.grd_s) });
    dom.ct_bt4_5 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_5a = addElement(dom.ct_bt4_5, 'div', null, 'option-label-alt');
    dom.ct_bt4_5b = addElement(dom.ct_bt4_5, 'div', null, 'option-value-alt');
    dom.ct_bt4_5a.innerHTML = 'Export';
    dom.ct_bt4_5a.style.border = '1px lightgrey solid';
    dom.ct_bt4_5a.addEventListener('click', function (this: any) {
      if (!flags.expatv) {
        let t = save(true);
        flags.expatv = true;
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
        dom.ct_bt4_5a_nhx.addEventListener('click', function (this: any) { flags.expatv = false; empty(dom.ct_bt4_5a_nc); document.body.removeChild(dom.ct_bt4_5a_nc); kill(dom.ct_bt4_5a_nc) });
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
    dom.ct_bt4_61b.addEventListener('click',()=>{flags.msgtm=!flags.msgtm});
    */


    dom.gmsgs = addElement(document.body, 'div', 'gmsgs');
    dom.mstt = addElement(dom.gmsgs, 'div', 'mstt');
    if (!flags.aw_u) dom.gmsgs.style.display = 'none';
    dom.mstt.style.textAlign = 'center';
    dom.mstt.innerHTML = 'm e s s a g e　　　l o g';
    dom.mstt.style.fontSize = '1.1em';
    dom.mstt.style.borderBottom = 'dashed 2px RoyalBlue';
    dom.mscont = addElement(dom.gmsgs, 'div', 'mscont');
    dom.m_control = addElement(dom.gmsgs, 'div', 'm_control');
    dom.m_b_1 = addElement(dom.m_control, 'small', null, 'msg-ctrl-btn');
    dom.m_b_1.innerHTML = 'freeze messagelog　';
    dom.m_b_1_c = addElement(dom.m_b_1, 'span', null, 'msg-badge');
    dom.m_b_1.addEventListener('click', () => {
      if (flags.m_freeze === false) { flags.m_freeze = true; dom.m_b_1_c.innerHTML = 'Ｘ' }
      else { flags.m_freeze = false; dom.m_b_1_c.innerHTML = '' }
    });

    dom.m_b_2 = addElement(dom.m_control, 'small', null, 'msg-ctrl-btn');
    dom.m_b_2.innerHTML = '　stop combatlog　';
    dom.m_b_2.style.left = '19px';
    dom.m_b_2_c = addElement(dom.m_b_2, 'span', null, 'msg-badge');
    dom.m_b_2.addEventListener('click', () => {
      if (flags.m_blh === false) { flags.m_blh = true; dom.m_b_2_c.innerHTML = 'Ｘ' }
      else { flags.m_blh = false; dom.m_b_2_c.innerHTML = '' }
    });
    dom.m_b_3 = addElement(dom.m_control, 'small', null, 'msg-ctrl-btn');
    dom.m_b_3.innerHTML = 'CLR';
    dom.m_b_3.style.width = '36px';
    dom.m_b_3.style.borderRight = 'none';
    dom.m_b_3.style.left = '38px';
    dom.m_b_3.style.textAlign = 'center';
    dom.m_b_3.addEventListener('click', () => { empty(dom.mscont) });

    addDesc(dom.inv_btn_1, null, 2, 'Filter', 'All');
    addDesc(dom.inv_btn_2, null, 2, 'Filter', 'Weapons');
    addDesc(dom.inv_btn_3, null, 2, 'Filter', 'Armor');
    addDesc(dom.inv_btn_4, null, 2, 'Filter', 'Comestibles');
    addDesc(dom.inv_btn_5, null, 2, 'Filter', 'Materials/Other');
    addDesc(dom.inv_btn_1_b, null, 2, 'Filter', 'Alphabetically');
    addDesc(dom.inv_btn_2_b, null, 2, 'Filter', 'by Amount');
    addDesc(dom.inv_btn_3_b, null, 2, 'Filter', 'by Type');

    global.dscr = addElement(document.body, 'div', 'dscr');
    global.dscr.style.display = 'none';

    dom.inv_btn_1.innerHTML = 'ALL';
    dom.inv_btn_2.innerHTML = 'WPN';
    dom.inv_btn_3.innerHTML = 'EQP';
    dom.inv_btn_4.innerHTML = 'USE';
    dom.inv_btn_5.innerHTML = 'OTHER';
    dom.inv_btn_1_b.innerHTML = 'A-Z';
    dom.inv_btn_2_b.innerHTML = '1-9';
    dom.inv_btn_3_b.innerHTML = 'TPE';
    dom.inv_con = addElement(dom.inv_ctx_b, 'div', 'inv_con');
    dom.inv_con.style.padding = '8px';
    /*dom.inv_con.addEventListener('scroll',function(){
      for(a in this.children) {if(this.children[a].offsetTop-this.scrollTop+19<0) this.children[a].style.display='none'; else dom.inv_con[a].style.display='';}
    });*/
    dom.inv_btn_1.addEventListener('click', function (this: any) { isort(1); invbtsrst() });
    dom.inv_btn_2.addEventListener('click', function (this: any) { isort(2); invbtsrst() });
    dom.inv_btn_3.addEventListener('click', function (this: any) { isort(3); invbtsrst() });
    dom.inv_btn_4.addEventListener('click', function (this: any) { isort(4); invbtsrst() });
    dom.inv_btn_5.addEventListener('click', function (this: any) { isort(5); invbtsrst() });
    dom.inv_btn_1_b.addEventListener('click', function (this: any) {
      if (flags.sort_a === true) {
        inv.sort(function (a: any, b: any) { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
        flags.sort_a = false;
      } else {
        inv.sort(function (a: any, b: any) { if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
        flags.sort_a = true;
      } iftrunkopenc(1);
      isort(global.sm)
    });
    dom.inv_btn_2_b.addEventListener('click', function (this: any) {
      if (flags.sort_b === true) {
        inv.sort(function (a: any, b: any) { if (a.amount < b.amount) return -1; if (a.amount > b.amount) return 1; if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
        flags.sort_b = false;
      } else {
        inv.sort(function (a: any, b: any) { if (a.amount > b.amount) return -1; if (a.amount < b.amount) return 1; if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
        flags.sort_b = true;
      } iftrunkopenc(1);
      isort(global.sm)
    });
    dom.inv_btn_3_b.addEventListener('click', function (this: any) {
      if (flags.sort_c === true) {
        inv.sort(function (a: any, b: any) { if (a.id < b.id) return -1; if (a.id > b.id) return 1; if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
        flags.sort_c = false;
      } else {
        inv.sort(function (a: any, b: any) { if (a.id > b.id) return -1; if (a.id < b.id) return 1; if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
        flags.sort_c = true;
      } iftrunkopenc(1);
      isort(global.sm)
    });
    dom.d3.update = function (this: any) { this.innerHTML = ' lvl:' + you.lvl + ' \'' + you.title.name + '\''; }
    dom.d5_1_1.update = function (this: any) { this.innerHTML = 'hp: ' + format3(you.hp.toString()) + '/' + format3(you.hpmax.toString()); dom.d5_1.style.width = 100 * you.hp / you.hpmax + '%' };
    dom.d5_2_1.update = function (this: any) { this.innerHTML = 'exp: ' + format3(Math.round(you.exp).toString()) + '/' + format3(you.expnext_t.toString()); dom.d5_2.style.width = 100 * you.exp / you.expnext_t + '%' };
    dom.d5_2_1.update();
    dom.d5_3_1.update = function (this: any) { this.innerHTML = 'energy: ' + format3(Math.round(you.sat).toString()) + '/' + format3(you.satmax.toString()) + ' eff: ' + Math.round(you.efficiency() * 100) + '%'; dom.d5_3.style.width = you.sat >= 0 ? 100 * you.sat / you.satmax + '%' : '0%' };
    dom.d6.update = function (this: any) { this.innerHTML = 'rank: ' + format3(you.rank().toString()) };
    dom.d6.update();
    dom.hit_c = function (this: any) {
      let hit_a = hit_calc(1)!;
      let hit_b = hit_calc(2)!;
      let drk = (flags.isdark && !cansee());
      if (hit_a > 100) hit_a = 100;
      else if (hit_a < 0) hit_a = 0;
      if (hit_b > 100) hit_b = 100;
      else if (hit_b < 0) hit_b = 0;
      dom.d8.innerHTML = 'hit chance: <span style="color:' + (drk ? 'darkgrey' : '') + '">' + Math.round(hit_a * (drk ? (.3 + skl.ntst.lvl * .07) : 1)) + '%</span> / dodge chance: ' + (100 - Math.round(hit_b)) + '%' + (you.mods.ddgmod !== 0 ? ('(<span style="color:orange">' + you.mods.ddgmod * 100 + '%</span>)') : '');
    }

    dom.sl = addElement(document.body, 'div', 'sl', 'no-select');
    dom.sl.style.zIndex = 10000;
    dom.sl_s = addElement(dom.sl, 'span', null, 'sl');
    dom.sl_s.innerHTML = 'save';
    dom.sl_s.addEventListener('click', () => { save(); let j = addElement(dom.sl, 'span'); j.style.fontSize = '.9em'; j.style.padding = '3px'; j.innerHTML = 'saved...'; fade(j); setTimeout(() => { dom.sl.removeChild(j) }, 500) });
    dom.sl_l = addElement(dom.sl, 'span', null, 'sl');
    dom.sl_l.innerHTML = 'load';
    dom.sl_l.addEventListener('click', () => load());
    dom.sl_extra = addElement(dom.sl, 'span', null, 'sl');
    dom.sl_extra.style.borderLeft = 'none';
    dom.sl_extra.innerHTML = '<span style="color:crimson">game not saved!</span>';
    dom.autosve = addElement(dom.sl, 'span', null, 'sl');
    dom.autosve.innerHTML = 'Autosave';
    dom.autosve.style.position = 'fixed';
    dom.autosve.style.width = 'auto';
    dom.autosve.style.right = '139px';
    dom.autosve.style.bottom = '1px';
    dom.autosve.style.paddingRight = '20px';
    dom.autosves = addElement(dom.autosve, 'input');
    dom.autosves.type = 'checkbox';
    dom.autosves.margin = 0;
    dom.autosves.style.position = 'fixed';
    if (typeof InstallTrigger === 'undefined') dom.autosves.style.bottom = 'inherit';
    dom.autosves.addEventListener('click', function (this: any) {
      flags.autosave = !flags.autosave;
      if (flags.autosave === true) timers.autos = setInterval(function (this: any) { save(true); }, 30000);
      else clearInterval(timers.autos)
    });
    dom.sl_h = addElement(dom.sl, 'span', null, 'sl');
    dom.sl_h.innerHTML = '>>';
    dom.sl_h.style.right = '214px';
    dom.sl_h.style.position = 'fixed';
    dom.sl_h.style.width = 'auto';
    dom.sl_h.style.bottom = '1px';
    dom.sl_h.addEventListener('click', () => {
      dom.sl.style.display = 'none';
      if (dom.sl_h_n) empty(dom.sl_h_n);
      dom.sl_h_n = addElement(document.body, 'span', null, 'sl');
      dom.sl_h_n.innerHTML = '<<';
      dom.sl_h_n.style.right = 0;
      dom.sl_h_n.style.position = 'absolute';
      dom.sl_h_n.style.bottom = 0;
      dom.sl_h_n.style.width = 14;
      dom.sl_h_n.style.backgroundColor = 'lightgrey'
      dom.sl_h_n.addEventListener('click', () => {
        dom.sl.style.display = '';
        empty(dom.sl_h_n);
        document.body.removeChild(dom.sl_h_n);
      });
    });

    dom.vrs = addElement(dom.sl, 'div', null, 'sl');
    dom.vrs.style.position = 'fixed';
    dom.vrs.style.width = 'auto';
    dom.vrs.innerHTML = 'v' + global.ver;
    dom.vrs.style.right = '105px';
    dom.vrs.style.bottom = '1px';
    dom.vrs.style.color = 'black';
    dom.vrs.style.textDecoration = 'underline'
    dom.vrs.addEventListener('click', function (this: any) { window.open('/changelog/changelog.html', '_blank') });
    dom.vrs.href = 'changelog';
    dom.sl_kill = addElement(dom.sl, 'span', null, 'sl');
    dom.sl_kill.style.position = 'fixed';
    dom.sl_kill.style.width = 'auto';
    dom.sl_kill.innerHTML = 'delete the save';
    dom.sl_kill.style.right = '5px';
    dom.sl_kill.style.bottom = '1px';
    dom.sl_kill.addEventListener('click', () => { localStorage.clear(); msg('Save deleted', '') });

    update_db()
    update_d()

    gameText.mtp = ['Human', 'Beast', 'Undead', 'Evil', 'Phantom', 'Dragon'];

    let testz = new (area._ctor)();
    testz.apop = 4000;
    testz.bpop = 6000;
    testz.vsize = 10000;
    global.zone_a_p[0] = testz;

    function offline_a() {
      global.offline_evil_index = 0;
      for (let i in global.zone_a_p) {
        let zone = global.zone_a_p[i];
        let apower = zone.apop / zone.bpop * 2;
        zone.vsize += zone.vsize * 0.0008 + 5;
        zone.apop += zone.apop * (randf(Math.log(zone.apop) * 0.8, Math.log(zone.apop) * 1.2) / 1000);
        zone.bpop += zone.bpop * (randf(Math.log(zone.bpop) * 0.8, Math.log(zone.bpop) * 1.2) / 1000);
        if (zone.apop > 0) zone.vsize -= Math.log2(zone.apop) * 2;
        else zone.bpop -= rand(20, 50);
        if (zone.bpop > 0) zone.apop -= zone.bpop / rand(40, 100);
        if (zone.vsize < 0) zone.apop -= rand(20, 50);
        global.offline_evil_index += zone.bpop;
        console.log('docile: ' + zone.apop + ' predator: ' + zone.bpop + ' forest: ' + zone.vsize);
      }
      global.offline_evil_index = Math.sqrt(global.offline_evil_index + 2100) / 45;
    }

    // appear, fade imported from ./dom-utils

    global.t_n = 0;


    // mf — moved to ui/shop.ts

    document.body.addEventListener('keydown', function (e) {
      if (flags.kfocus !== true) {
        for (let obj in global.shortcuts) if (e.which === global.shortcuts[obj][0]) {
          let g = global.shortcuts[obj][2];
          if (g.amount > 0 || !!g.slot) {
            g.use(you); reduce(g); iftrunkopenc(1); if (g.id < 3000 && !g.data.tried) { g.data.tried = true; stats.ftried += 1; }
            break
          }
        }
      }
      if (!flags.shifton && (e.which === 69 || e.which === 16)) {
        flags.shifton = true;
        global.kkey = 1;
        descsinfo(global.shiftid)
      }
    });

    document.body.addEventListener('keyup', function (e) {
      if (e.which === 69 || e.which === 16) {
        flags.shifton = false;
        if (dom.dscshe) dom.dscshe.innerHTML = '';
        global.kkey = -1
      }
    });

    gameText.cfc = ['White', 'Black', 'Orange', 'Grey', 'Black&White', 'Brown', 'Ginger', 'Cinnamon', 'Fawn', 'Amber', 'Cream', 'Chocolate'];
    gameText.cfp = ['Spotted', 'Plain', 'Solid', 'Bicolored', 'Tabby', 'Tricolored', 'Calico', 'Tortoiseshell', 'Wavy', 'Fluffy', 'Siamese', 'Striped'];
    gameText.cln = ['Sleeping', 'Playing', 'Catching fireflies', 'Eating', 'Fish', 'People', 'Running outside', 'Warm places', 'Water', 'Fighting', 'Meowing', 'Singing', 'Catching mice', 'Its Master', 'Climbing trees', 'Toppling objects', 'Hiding', 'Safe places', 'Rooftops', 'Sitting by the window', 'Watching others', 'Master\'s bed', 'Being petted', 'Being brushed', 'Sitting on laps', 'Other cats', 'Dogs', 'Warm weather', 'Watching stars', 'Toys', 'Meat', 'Rain', 'Snow'];


    function chs_spec(type: any, x?: any) {
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
          clr_chs(); global.menuo = 3; global.cchest = x;
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
          clr_chs(); global.menuo = 4; global.shprf = x;
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
          //dom.ch_1e.style.border='1px solid #9485ed';
          dom.ch_1e.style.float = dom.ch_1e.style.textAlign = 'left';
          dom.ch_2e = addElement(dom.ch_1c, 'small');
          //dom.ch_1e.style.border='1px solid #9485ed';
          dom.ch_2e.style.float = dom.ch_2e.style.textAlign = 'right';
          dom.ch_2e.style.paddingRight = 6
          //dom.ch_1e1 = addElement(dom.ch_1e,'input'); dom.ch_1e1.style.height=18;dom.ch_1e1.style.width=40;
          //dom.ch_1e1.style.textAlign='center'; dom.ch_1e1.style.color='white'; dom.ch_1e1.style.fontFamily='MS Gothic';
          //dom.ch_1e1.style.backgroundColor='transparent'
          dom.ch_1e.innerHTML = '&nbspBuying price: <span style="color:lime">' + Math.round(((you.mods.infsrate - skl.trad.use()) * x.infl * (1 - (Math.sqrt(x.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index) * 10000) / 100 + '%</span>'
          dom.ch_2e.innerHTML = '&nbspReputation: ' + col(x.data.rep << 0, 'lime');
        }; break
        case 5: {
        }; break
      }
      return dom.ch_1;
    }

    // renderFurniture — moved to ui/panels.ts
    // recshop, rendershopitem, buycbs — moved to ui/shop.ts
    for (let x in global.cptchk) global.cptchk[x]();
    // giveFurniture — moved to game/inventory.ts

    global._preig = addElement(document.body, 'img');
    global._preig.src = 'ctst.png';
    global._preic = addElement(document.body, 'canvas');
    global._preic_tmain = global._preic.getContext('2d');
    global._preic2 = addElement(document.body, 'canvas');
    global._preic2_tmain = global._preic2.getContext('2d');
    global._preic2.width = 512;
    global._preic2.height = 512;
    global._preig.onload = function (this: any) { global._preic_tmain.drawImage(global._preig, 0, 0); global._preic2_tmain.imageSmoothingEnabled = false;; global._preic2_tmain.drawImage(global._preig, 0, 0, 400, 400) };
    document.body.removeChild(global._preig);
    document.body.removeChild(global._preic);
    document.body.removeChild(global._preic2);


// @ts-ignore: constructor function
    chss.t1 = new Chs();
    chss.t1.id = 101;
    chss.t1.sl = function (this: any) {
      global.lst_loc = 101; flags.inside = true; d_loc('Dojo, training area');
      chs('???: Kid', true);
      chs('"..."', false).addEventListener('click', function (this: any) {
        global.time += DAY;
        appear(dom.ctr_1);
        chs('???: Quit daydreaming', true);
        chs('"?"', false).addEventListener('click', function (this: any) {
          appear(dom.d0);
          chs('???: You have training to complete', true);
          chs('"!"', false).addEventListener('click', function (this: any) {
            appear(dom.inv_ctx);
            appear(dom.d_lct);
            chs('???: Grab your stuff and get to it', true);
            chs('"..."', false).addEventListener('click', function (this: any) { appear(dom.ct_ctrl); smove(chss.tdf, false); giveItem(wpn.stk1); giveItem(item.hrb1, 15); flags.aw_u = true; });
          });
        });
      });
    };
    if (flags.gameone === false) {
      combat.current_l = chss.t1;
      smove(chss.t1);
      giveFurniture(furniture.frplc, null, false);
      let _b = giveFurniture(furniture.bed1, null, false);
      home.bed = _b;
    }

// @ts-ignore: constructor function
    chss.tdf = new Chs();
    chss.tdf.id = 102;
    chss.tdf.sl = function (this: any) {
      global.lst_loc = 102; flags.inside = true;
      clr_chs();
      if (!flags.dmap) { appear(dom.gmsgs); flags.dmap = true }
      chs('"Select the difficulty"', true);
      if (!flags.tr1_win) chs('"Easiest"', false).addEventListener('click', function (this: any) {
        chs('"You are fighting training dummies"', true);
        if (!flags.dm1ap) { appear(dom.d1m); flags.dm1ap = true };
        area_init(area.trn1);
      });
      if (!flags.tr2_win) chs('"Easy"', false).addEventListener('click', function (this: any) {
        chs('"You are fighting training dummies"', true);
        if (!flags.dm1ap) { appear(dom.d1m); flags.dm1ap = true }
        area_init(area.trn2);
      });
      if (!flags.tr3_win) chs('"Normal"', false).addEventListener('click', function (this: any) {
        chs('"You are fighting training dummies"', true);
        if (!flags.dm1ap) { appear(dom.d1m); flags.dm1ap = true };
        area_init(area.trn3);
      });
    }
    chss.tdf.onEnter = function (this: any) {
      area_init(area.nwh);
    }

// @ts-ignore: constructor function
    chss.t2 = new Chs();
    chss.t2.id = 103;
    chss.t2.sl = function (this: any) {
      global.lst_loc = 103; flags.inside = true;
      chs('"Instructor: ' + select(['Good', 'Nice', 'Great', 'Excellent']) + ' ' + select(['job', 'work']) + ' kid! Here\'s the reward for completing the course"', true, 'lime');
      chs('"->"', false).addEventListener('click', function (this: any) {
        if (flags.tr1_win === true && !flags.rwd1) { flags.rwd1 = true; giveItem(item.appl, 4); giveItem(item.hrb1, 5); smove(chss.tdf); }
        else if (flags.tr2_win === true && !flags.rwd2) { flags.rwd2 = true; giveItem(item.brd, 2); giveItem(item.hrb1, 5); giveItem(eqp.sndl); smove(chss.tdf); }
        else if (flags.tr3_win === true && !flags.rwd3) { flags.rwd3 = true; let itm = giveItem(eqp.vst); itm.dp *= .7; if (flags.m_un === true) giveItem(item.cp, 10); }
        if (!flags.tr3_win || !flags.tr2_win || !flags.tr1_win) smove(chss.tdf);
        else { ; smove(chss.t3); giveTitle(ttl.inn); }
      });
    }

// @ts-ignore: constructor function
    chss.t3 = new Chs();
    chss.t3.id = 104;
    chss.t3.sl = () => {
      flags.inside = true; d_loc('Dojo, lobby'); global.lst_loc = 104; flags.inside = true;
      if (flags.nbtfail) {
        chs('"Instructor: You got beaten up by an inanimated dummy?! Pay attention to your condition!"', true);
        chs('"..."', false).addEventListener('click', () => {
          flags.nbtfail = false;
          clr_chs();
          smove(chss.tdf, false);
          giveItem(item.hrb1, 4);
        });
      }
      else {
        if (!flags.dj1end) {
          chs('"Instructor: Your training is over for today, you did well. As a reward, select one of these skill manuals to practice. The better your understanding, the stronger you will be in battle"', true);
          chs('"Practitioner Skillbook (Swords)"', false).addEventListener('click', () => { giveItem(item.skl1); flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Knives)"', false).addEventListener('click', () => { giveItem(item.skl2); flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Axes)"', false).addEventListener('click', () => { giveItem(item.skl3); flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Spears)"', false).addEventListener('click', () => { giveItem(item.skl4); flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Hammers)"', false).addEventListener('click', () => { giveItem(item.skl5); flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Martial)"', false).addEventListener('click', () => { giveItem(item.skl6); flags.dj1end = true; smove(chss.lsmain1); });
        }
        else if (flags.trnex1 === true && !flags.trnex2) {
          chs('"Instructor: Hahahhha! What a great disciple! That\'s not the dedication most of the other disciples have! Take this, it\'ll help you in your future endeavours"', true, 'yellow');
          chs('"Thanks teacher!"', false).addEventListener('click', () => {
            giveItem(acc.snch);
            smove(chss.lsmain1);
            flags.trnex2 = true;
          });
        }
        else {
          chs(select(['"Instructor: Back already?"', 'You notice other dojo disciples diligently train', 'Pieces of broken training dummies are scattered on the floor']), true);
          chs('"Dojo infoboard"', false).addEventListener('click', () => {
            smove(chss.djinf, false);
          });
          chs('"Destroy more dummies"', false).addEventListener('click', () => {
            smove(chss.return1, false);
          });
          if (flags.dj1end === true && you.lvl >= 10 && !flags.trne1e1) chs('"Challenge a stronger opponent"', false).addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne1);
            chs('"<= Escape"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (flags.trne1e1 && !flags.trne2e1) chs('"Challenge an even stronger opponent"', false, 'cornflowerblue').addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne2);
            chs('"<= Escape"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (flags.trne2e1 && !flags.trne3e1) chs('"Challenge a dangerous opponent"', false, 'crimson').addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne3);
            chs('"<= Escape"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (flags.trne3e1 && !flags.trne4e1) chs('"Challenge a powerful opponent"', false, 'red').addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne4);
            chs('"<= Escape"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (flags.dj1end) chs('"Turn in dojo gear"', false).addEventListener('click', () => {
            chs('"Instructor: You can return whatever you punched off of dummies and get coin for it, it\'s dojo\'s equipment after all. Or you can keep and use for it yourself, the choice is yours"', true);
            chs('"Return the rags"', false).addEventListener('click', () => {
              let dlr = 0;
              let stash: any[] = [];
              let verify = true;
              for (let a in inv) { if (inv[a].id === wpn.knf1.id && you.eqp[0].data.uid !== inv[a].data.uid) { stash.push(inv[a]); dlr += 1 } }
              for (let a in inv) { if (inv[a].id === wpn.wsrd2.id && you.eqp[0].data.uid !== inv[a].data.uid) { stash.push(inv[a]); dlr += 3 } }
              for (let a in inv) { if (inv[a].id === eqp.brc.id) { verify = true; for (let b in you.eqp) if (you.eqp[b].data.uid === inv[a].data.uid) verify = false; if (verify === true) { stash.push(inv[a]); dlr += 1 } } }
              for (let a in inv) { if (inv[a].id === eqp.vst.id) { verify = true; for (let b in you.eqp) if (you.eqp[b].data.uid === inv[a].data.uid) verify = false; if (verify === true) { stash.push(inv[a]); dlr += 1 } } }
              for (let a in inv) { if (inv[a].id === eqp.pnt.id) { verify = true; for (let b in you.eqp) if (you.eqp[b].data.uid === inv[a].data.uid) verify = false; if (verify === true) { stash.push(inv[a]); dlr += 1 } } }
              for (let a in inv) { if (inv[a].id === eqp.bnd.id) { verify = true; for (let b in you.eqp) if (you.eqp[b].data.uid === inv[a].data.uid) verify = false; if (verify === true) { stash.push(inv[a]); dlr += 1 } } }
              if (dlr === 0) chs('"Instructor: There\'s nothing I can take from you"', true);
              else {
                chs('"Instructor: For all your stuff I can fetch you ' + dlr + ' ' + (dom.coincopper) + ' copper. How does that sound?"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  msg(stash.length + " Items returned back to dojo", 'ghostwhite');
                  stats.ivtntdj += stash.length;
                  giveWealth(dlr);
                  for (let a in stash) removeItem(stash[a]);
                  if (stats.ivtntdj >= 300) giveTitle(ttl.tqtm);
                  smove(chss.t3, false);
                });
              }
              chs('"<= Go back"', false).addEventListener('click', () => {
                smove(chss.t3, false);
              });
            });
            chs('"<= Go back"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (flags.djmlet && getDay(1) == 'Sunday') {
            chs('"Grab a serving of free food"', false, 'lime').addEventListener('click', () => {
              if (getDay(1) == 'Sunday') {
                msg(select(['*Chow*', '*Munch*', '*Crunch*', '*Gulp*']), 'lime');
                msg(select(['That was good!', 'Delicious!', 'A little dry but, that will do', 'Tasty!', 'Phew, I needed that!']), 'lime');
                you.sat = you.satmax;
                giveSkExp(skl.glt, 42);
                dom.d5_3_1.update();
                flags.djmlet = false;
                smove(chss.t3, false);
                return
              } else {
                msg('Too late for that', 'yellow');
                flags.djmlet = false;
                smove(chss.t3, false);
                return
              }
            });
          }
          if (flags.dj1end === true) chs('"Level Advancement"', false, 'orange').addEventListener('click', () => {
            chs('"Instructor: If you put effort into training you will get rewards as long as you are still a disciple of this hall. After every 5 levels you reach, come here and recieve your share! You might get something really useful if you continue to improve your skills"', true);
            if (!flags.dj1rw1 && you.lvl >= 5) {
              chs('"Level 5 reward"', false).addEventListener('click', () => {
                chs('"Instructor: This is a good start, congratulations! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  flags.dj1rw1 = true;
                  giveWealth(25);
                  giveItem(item.sp1, 5);
                  smove(chss.t3, false);
                });
              });
            }
            if (!flags.dj1rw2 && flags.dj1rw1 === true && you.lvl >= 10) {
              chs('"Level 10 reward"', false, 'royalblue').addEventListener('click', () => {
                chs('"Instructor: You seem to not neglect your training, good job! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  flags.dj1rw2 = true;
                  giveWealth(100);
                  giveItem(item.sp2, 2);
                  smove(chss.t3, false);
                });
              });
            }
            if (!flags.dj1rw3 && flags.dj1rw2 === true && you.lvl >= 15) {
              chs('"Level 15 reward"', false, 'lime').addEventListener('click', () => {
                chs('"Instructor: You\'re slowly growing into a fine young warrior! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  flags.dj1rw3 = true;
                  giveWealth(200);
                  giveItem(item.sp3, 1);
                  giveItem(eqp.tnc);
                  giveItem(item.lifedr);
                  giveItem(eqp.knkls);
                  giveItem(eqp.knkls);
                  smove(chss.t3, false);
                });
              });
            }
            if (!flags.dj1rw4 && flags.dj1rw3 === true && you.lvl >= 20) {
              chs('"Level 20 reward"', false, 'gold').addEventListener('click', () => {
                chs('"Instructor: Time to start getting serious! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  flags.dj1rw4 = true;
                  giveWealth(300);
                  giveItem(wpn.tkmts);
                  smove(chss.t3, false);
                });
              });
            }
            if (!flags.dj1rw5 && flags.dj1rw4 === true && you.lvl >= 25) {
              chs('"Level 25 reward"', false, 'orange').addEventListener('click', () => {
                chs('"Instructor: You\'re almost ready to face real dangers of the outside world! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  flags.dj1rw5 = true;
                  giveWealth(350);
                  giveItem(acc.mnch);
                  smove(chss.t3, false);
                });
              });
            }
            if (!flags.dj1rw6 && flags.dj1rw5 === true && you.lvl >= 30) {
              chs('"Level 30 reward"', false, 'crimson').addEventListener('click', () => {
                chs('"Instructor: You are almost as strong as an average adult! Good job kid and Keep working hard! Maybe you can defend this village one day"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  flags.dj1rw6 = true;
                  giveWealth(400);
                  giveItem(item.stthbm1);
                  giveItem(item.stthbm4);
                  giveItem(item.stthbm3);
                  giveItem(item.stthbm2);
                  smove(chss.t3, false);
                });
              });
            }
            chs('"<= Return"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (item.htrdvr.have) chs('"Deliver the crate"', false, 'lightblue').addEventListener('click', () => {
            chs('"Instructor: Yamato sent something? Great timing on that, we were getting very close to running out already. This will be turned into rations for you lads, you better don\'t forget to thank our hunters properly next time you see them, as they work hard to bring food to people\'s tables. Here, small compensation for your timely delivery"', true);
            chs('"Accept"', false, 'lime').addEventListener('click', () => {
              chs('"Instructor: Hold it, that\'s not all, catch this as well, i believe it is yours. You won\'t be as lucky next time and lose your possessions for good if you leave them around again, pay better attention to where your stuff is"', true);
              chs('"Accept x2"', false, 'lime').addEventListener('click', () => {
                giveWealth(50);
                giveItem(item.key0);
                removeItem(item.htrdvr);
                smove(chss.t3, false);
              });
            });
          });
          chs('"<= Go outside"', false).addEventListener('click', () => {
            smove(chss.lsmain1);
          });
          if (flags.trne4e1 && !flags.trne4e1b) {
            chs('"Instructor: Once again, choose the skillbook of specialization you are interested in. Doesn\'t mean you have to stick with it to the bitter end, but it will help you train"', true);
            chs('"Bladesman Manual"', false).addEventListener('click', () => { giveItem(item.skl1a); flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Assassin Manual"', false).addEventListener('click', () => { giveItem(item.skl2a); flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Axeman Manual"', false).addEventListener('click', () => { giveItem(item.skl3a); flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Lancer Manual"', false).addEventListener('click', () => { giveItem(item.skl4a); flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Clubber Manual"', false).addEventListener('click', () => { giveItem(item.skl5a); flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Brawler Manual"', false).addEventListener('click', () => { giveItem(item.skl6a); flags.trne4e1b = true; smove(chss.lsmain1); });
          }
        }
      }
    }
    chss.t3.onEnter = function (this: any) {
      area_init(area.nwh);
    }

// @ts-ignore: constructor function
    chss.djinf = new Chs();
    chss.djinf.id = 160;
    chss.djinf.sl = () => {
      flags.inside = true; d_loc('Dojo, Infoboard'); global.lst_loc = 160;
      chs('Useful information regarding dojo is written here. What will you read?', true);
      chs('"Get stronger!"', false).addEventListener('click', () => {
        chs('Fight dummies provided by dojo to improve your physique and weapon skills! Destroy them and grab their stuff, or vanquish thousands for a special reward! The doors of our dojo is open for everyone willing to lead the path of a warrior', true);
        chs('"<= Return"', false).addEventListener('click', () => {
          smove(chss.djinf, false);
        });
      });
      chs('"Graduate!"', false).addEventListener('click', () => {
        chs('When you are confident in your skills, try your fist at fighting powerful golems! How much beating can you withstand?', true);
        chs('"<= Return"', false).addEventListener('click', () => {
          smove(chss.djinf, false);
        });
      });
      chs('"Claim your rewards!"', false).addEventListener('click', () => {
        chs('As long as you keep gaining experience and train hard, dojo will provide you with gifts and money! Don\'t miss out!', true);
        chs('"<= Return"', false).addEventListener('click', () => {
          smove(chss.djinf, false);
        });
      });
      chs('"Get your grub at the canteen!"', false).addEventListener('click', () => {
        chs('Our generous dojo provides ' + col('Free Meals', 'lime') + ' to every attending low-class disciple every ' + col('Sunday', 'yellow') + '! Get in time for your weekly menu!', true);
        chs('"<= Return"', false).addEventListener('click', () => {
          smove(chss.djinf, false);
        });
      });
      chs('"Measure your power!"', false).addEventListener('click', () => {
        let v = chs('Try out punching this ' + col('Indestructable Dummy', 'orange') + ' to measure the power of your fist!', true);
        chs('"Give it a try"', false).addEventListener('click', () => {
          you.stat_r();
          let hs = handStr();
          v.innerHTML = select(['Wham!', 'Slap!', 'Hit!', 'Punch!', 'Hack!']) + ' Your approximate hand strength is measured in: <br><br><span style="border:1px dashed yellow;padding:6px">' + col((format3(hs.toString()) + 'kg'), 'springgreen') + '</span><br><br>';
          for (let x in global.htrchl) global.htrchl[x](hs);
        });
        chs('"<= Return"', false).addEventListener('click', () => {
          smove(chss.djinf, false);
        });
      });
      chs('"<= Return"', false).addEventListener('click', () => {
        smove(chss.t3, false);
      });
    }

// @ts-ignore: constructor function
    chss.trne1e1 = new Chs();
    chss.trne1e1.id = 124;
    chss.trne1e1.sl = () => {
      flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 124;
      chs('Instructor: Great job smashing that golem! This golem is one of the weakest types around, but even he can become a huge trouble if you\'re not giving it your best. Now, grab this and proceed with your training', true);
      chs('"Proceed with your training"', false).addEventListener('click', () => {
        giveItem(item.hptn1, 10);
        flags.trne1e1 = true;
        smove(chss.t3);
      });
    }

// @ts-ignore: constructor function
    chss.trne2e1 = new Chs();
    chss.trne2e1.id = 125;
    chss.trne2e1.sl = () => {
      flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 125;
      chs('Instructor: Just like that, keep it up. You are starting to stand much longer in fights, such an improvement from when you just arrived here! You deserver your praise, but don\'t get complacent', true);
      chs('"Proceed with your training"', false).addEventListener('click', () => {
        giveItem(wpn.fksrd);
        giveItem(acc.otpin);
        flags.trne2e1 = true;
        smove(chss.t3);
      });
    }

// @ts-ignore: constructor function
    chss.trne3e1 = new Chs();
    chss.trne3e1.id = 126;
    chss.trne3e1.sl = () => {
      flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 126;
      chs('Instructor: That was a tough one, but you still managed to crush it! You are getting close to finishing a second course. Don\'t give up!', true);
      chs('"Proceed with your training"', false).addEventListener('click', () => {
        giveItem(item.scrlw);
        flags.trne3e1 = true;
        smove(chss.t3);
      });
    }

// @ts-ignore: constructor function
    chss.trne4e1 = new Chs();
    chss.trne4e1.id = 162;
    chss.trne4e1.sl = () => {
      flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 162;
      chs('Instructor: <span style="color:lime">As expected, you have what it takes to protect yourself! And with that, you have finished the second entry course of this dojo, job well done! Soon, you will be able to step out of the village and take on serious jobs that will let you explore the land. You better prepare yourself well before that happens!</span>', true);
      chs('"Finish training"', false, 'lime').addEventListener('click', () => {
        flags.trne4e1 = true;
        smove(chss.t3);
      });
    }

// @ts-ignore: constructor function
    chss.return1 = new Chs();
    chss.return1.id = 105;
    chss.return1.sl = () => {
      flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 105;
      chs('Punch as many as you want', true);
      if (!flags.trnex2) area_init(area.trn);
      else area_init(area.trnf);
      chs('"<= Return back into lobby"', false).addEventListener('click', () => {
        smove(chss.t3);
      });
    }

// @ts-ignore: constructor function
    chss.frstn1main = new Chs();
    chss.frstn1main.id = 113;
    chss.frstn1main.sl = () => {
      flags.inside = false; d_loc('Western Woods, The Wooden Gate'); global.lst_loc = 113;
      chs('You\'re out in the forest. You can hunt here', true);
      chs('"=> Enter the Hunter\'s lodge"', false).addEventListener('click', () => {
        smove(chss.frstn1b1);
      });
      chs('"=> Delve inside the forest"', false).addEventListener('click', () => {
        smove(chss.frstn1a1);
      });
      if (flags.frstn1a3u) chs('"=> Hunt indefinitely"', false).addEventListener('click', () => {
        smove(chss.frstn1a3);
      });
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.lsmain1);
      });
    }

// @ts-ignore: constructor function
    chss.frstn1a3 = new Chs();
    chss.frstn1a3.id = 130;
    addtosector(sector.forest1, chss.frstn1a3)
    chss.frstn1a3.sl = () => {
      flags.inside = false; d_loc('Western Woods, They\'re Nearby'); global.lst_loc = 130;
      chs('The woods are silent', true);
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn1main);
      });
    }
    chss.frstn1a3.onEnter = function (this: any) {
      area_init(area.frstn1a3);
    }

// @ts-ignore: constructor function
    chss.frstn1a4 = new Chs();
    chss.frstn1a4.id = 161;
    addtosector(sector.forest1, chss.frstn1a4)
    chss.frstn1a4.sl = () => {
      flags.inside = false; d_loc('Western Woods, Round Branches');
      if (area.frstn1a4.size > 0) {
        chs('Something ambushes you!', true, 'red');
        chs('"<= Escape"', false).addEventListener('click', () => {
          smove(chss.frstn1main);
        });
      } else {
        chs('You never knew this secluded area was here', true);
        if (!flags.frstnskltg) chs('"Look around"', false).addEventListener('click', () => {
          chs('You see something sticking out from the ground in the grass over there. Bones?', true);
          chs('"Examine whatever that might be"', false).addEventListener('click', () => {
            chs('Indeed, bones. Skeletal remains of a person to be exact. Looks like he died long time ago, much of everything rotted off, even metallic bits of whatever armor he was wearing have fallen apart.', true);
            chs('"See if you can salvage anything"', false).addEventListener('click', () => {
              chs('There isn\'t much you can take with you, except for the sword on the skeleton\'\s hip, still inside its half-desintegrated sheath. What was the cause of his death? He wasn\'t in a fight judging by the state of the sword. Was he poisoned? Or caught by surprise? Couldn\'t leave this place for whatever reason? You are not sure. The least you can do is honor the deceased by burying his remains', true);
              chs('"Make a grave"', false).addEventListener('click', () => {
                flags.frstnskltg = true;
                giveItem(wpn.mkrdwk);
                you.karma += 3;
                you.luck++;
                msg('Your good deed improved your karma!', 'gold');
                msg('LUCK Increased +1', 'gold');
                chss.frstn1a4.sl()
              })
            })
          })
        })
        chs('"<= Return"', false).addEventListener('click', () => {
          smove(chss.frstn1main);
        })
      }
    }
    chss.frstn1a4.onEnter = function (this: any) {
      if (area.frstn1a4.size > 0) area_init(area.frstn1a4);
    }
    chss.frstn1a4.onLeave = function (this: any) {
      area.frstn1a4.size = rand(5) + 20;
    }
    chss.frstn1a4.data = { scoutm: 600, scout: 0, scoutf: false, gets: [false], gotmod: 0 }
    chss.frstn1a4.scout = [
      { c: .009, f: () => { msg('You discover a pouch half-etched into the ground and covered by a rock. It probably belonged to the corpse', 'lime'); giveItem(item.mnblm, 3); chss.frstn1a4.data.gets[0] = true }, exp: 35 },
      { c: .0005, cond: () => { if (getHour() >= 0 && getHour() <= 3 && getLunarPhase() === 0) return true }, f: () => { msg('You found Moonbloom!', 'lime'); giveItem(item.mnblm); }, exp: 10 },
    ]
    chss.frstn1a4.onScout = function (this: any) { scoutGeneric(this) }


// @ts-ignore: constructor function
    chss.frstn1b1 = new Chs();
    chss.frstn1b1.id = 118;
    chss.frstn1b1.sl = () => {
      flags.inside = true; d_loc('Western Woods, Hunter\'s Lodge');
      if (wearingany(wpn.mkrdwk) && !flags.wkrtndrt) {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: You! Why do you have that?', true);
        chs('"?"', false).addEventListener('click', () => {
          chs('<span style="color:limegreen">Head Hunter Yamato</span>: The sword! Where did you get it!?', true);
          chs('Give explanation', false).addEventListener('click', () => {
            chs('<span style="color:limegreen">Head Hunter Yamato</span>: The body in the forest, you say... Dammit! Our scouts are worthless if it takes someone like you to make such an important discovery! *sigh..* This sword you\'re holding once belonged to our deputy chief - Dein. You might have not met him before if you never set your foot out of the village, he was a promising and talented young soldier who were assigned to such an remote settlement for his field training', true);
            chs('=>', false).addEventListener('click', () => {
              chs('<span style="color:limegreen">Head Hunter Yamato</span>: Then one day he staight up vanished, without letting anyone know, and he was well respected and cared for our people all the same. Of course, being a part of the military would prevent him from disclosing his plans and duties, but it is highly doubtful a special task from the higher command would be the reason of his abscence. All of his belongins, personal items and possessions are still there, where he left them. Lad knew how to fight and wield a sword, I do not for once believe a man of his caliber would perish and die like this, the corpse you speak of might not be his...', true);
              chs('Express your condolences to the deceased', false).addEventListener('click', () => {
                chs('<span style="color:limegreen">Head Hunter Yamato</span>: Alright, enough. Your sentiment is appreciated, but let us hope Dein still draws breath out there. This entire precident calls for investigation, a team of hunters will be dispatched shortly and you keep yourself alert too. And I will be taking that from your hands, thank you for bringing it here. Time will tell wether this sword becomes a memento or returns to its rightful owner', true);
                chs('Part with the sword', false).addEventListener('click', () => {
                  chs('<span style="color:limegreen">Head Hunter Yamato</span>: Here, take this for your trouble', true);
                  chs('Accept', false, 'lime').addEventListener('click', () => {
                    removeItem(findbyid(inv, wpn.mkrdwk.id));
                    giveWealth(300);
                    flags.wkrtndrt = true;
                    smove(chss.frstn1b1, false)
                  });
                });
              });
            });
          });
        });
        return;
      }
      if (!flags.frstn1b1int) { chs('<span style="color:limegreen">Head Hunter Yamato</span>: Hm? Your face is unfamiliar. Might be your first time around here I take it? These are the Western Woods, or simply the western part of the forest. Spots here are very meek and mild on danger and resources, it is perfect for newbies like you. You are free to come and hunt as much as you like. Consider doing some of the available jobs while you\'re at it. Won\'t pay much, but you can be of help to the people.', true, 'orange', undefined, undefined, undefined, '.9em'); flags.frstn1b1int = true } else flags.wkrtndrt && random() > .5 ? chs(select(['You sight the hunter thinking deeply about something', 'You hear mumbling']), true) : chs(select(['You see a variety of bows and other hunting tools arranged on the table and hanging from the walls', 'You notice head hunter maintaining his hunting gear', 'The smell of beef jerky assaults your nose']), true);
      chs('"!Ask about the jobs"', false, 'yellow').addEventListener('click', () => {
        smove(chss.frstn1b1j, false);
      });
      chs('"Tell me something"', false).addEventListener('click', () => {
        smove(chss.htrtch0, false)
      });
      if (quest.fwd1.data.done === true) {
        chs('"Sell firewood ' + dom.coincopper + '"', false).addEventListener('click', () => {
          smove(chss.frstn1b1s, false);
        });
      }
      if (item.hbtsvr.have) chs('"Deliver the satchel"', false, 'lightblue').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Delivery back? That\'s unexpected! Put this here, let me examine it... I see, we\'re going east soon, then... Well, that\'s not for you to worry about, hhah! There is another thing. You wait here a moment<br>.......<br><br> Heeere we go! Get this crate to the dojo since you\'re going in that direction anyway. They\'ll know what to do with it. Go now, go', true);
        chs('"Ok"', false).addEventListener('click', () => {
          giveItem(item.htrdvr);
          removeItem(item.hbtsvr);
          smove(chss.frstn1main);
        });
      });
      chs('"<= Exit"', false).addEventListener('click', () => {
        smove(chss.frstn1main);
      });
      if (quest.fwd1.data.done === true && quest.hnt1.data.done === true && !flags.frstn1b1g1) {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: You\'re still going around without a proper weapon? That won\'t do, catch this. It isn\'t much, but a bit better than you being nearly emptyhanded. Once you return back you should check the ' + col('Notice Board', 'lime') + ' by the village center, you never know if something important is happening in the ouskirts that you aren\'t aware of, but it will almost certainly be written there. You may find a job offer or two, or see pleads of fellow villagers asking for help with mundane things, consider those as well', true);
        chs('"Thanks!"', false).addEventListener('click', () => {
          chs('<span style="color:limegreen">Head Hunter Yamato</span>: One more thing. I\'ll ask you to do this very easy, little job. Grab this bag and get it to the village\'s herbalist. You know where the herbalist is? Here are the directions, listen well: head to the marketplace and look for a very unremarkable little building with a sign that looks like a vial. Like those vials they use in alchemy, those ones. The building is located a little further back from the road, in the shade, so you may simply forget it exists if you aren\'t specifically looking for it, you keep your eyes peeled. Now go, you should have no problem getting there', true);
          chs('"Got it"', false).addEventListener('click', () => {
            flags.frstn1b1g1 = true;
            giveItem(wpn.dgknf);
            giveItem(item.htrsvr);
            smove(chss.frstn1b1, false);
            flags.phai1udt = true;
          });
        });
      }
    }

// @ts-ignore: constructor function
    chss.htrtch0 = new Chs();
    chss.htrtch0.id = 164;
    chss.htrtch0.sl = () => {
      flags.inside = true;
      chs('<span style="color:limegreen">Head Hunter Yamato</span>: What do you want to ask, kid? Want to know how to butcher a carcass? Khahhahhah! *cough*', true);
      chs('"About monsters"', false).addEventListener('click', () => { smove(chss.htrtch1, false) });
      chs('"What are monster ranks?"', false).addEventListener('click', () => {
        chs('<div style="line-height:16px"><span style="color:limegreen">Head Hunter Yamato</span>: Ranking is a way to separate monsters by their relative danger level, they go as following:<div style="border: darkblue 1px solid;background-color:#0b1c3c;margin:10px;"><div><span style="color:lighgrey">G - Can be dealth with by able people</span></div><div><span style="color:white">F - Can be dealth with by male adults</span></div><div><span style="color:lightgreen">E - Village Crisis</span></div><div><span style="color:lime">D - Townside Crisis</span></div><div><span style="color:yellow">C - Citywide Crisis</span></div><div><span style="color:orange">B - National Crisis</span></div><div><span style="color:crimson">A - Continental Threat</span></div><div><span style="color:gold;text-shadow: 0px 0px 2px red,0px 0px 2px red,0px 0px 2px red">S - Global Crisis</span></div><div><span style="color:black;text-shadow:hotpink 1px 1px .1em,cyan -1px -1px .1em">SS - World Disaster</span></div><div><span style="color:white;text-shadow:2px 0px 2px red,-2px 0px 2px magenta,0px 2px 2px cyan,0px -2px 2px yellow,0px 0px 2px gold">SSS - Universal Calamity</div></div>We haven\'t experienced anything stronger than the E rank in all history of our village. Whatever is above the A rank is completely unheard of, and only partially mentioned in ancient texts. That\'s the realm of gods, world destroyers and higher beings that our mortal souls are unlikely to ever face</div>', true, 0, 0, 0, 0, '.9em');
        chs('"<= Return"', false).addEventListener('click', () => { smove(chss.htrtch0, false) });
      });
      chs('"<= Return"', false).addEventListener('click', () => { smove(chss.frstn1b1, false) });
    }

// @ts-ignore: constructor function
    chss.htrtch1 = new Chs();
    chss.htrtch1.id = 163;
    chss.htrtch1.sl = () => {
      flags.inside = true;
      chs('<div style="line-height:14px"><span style="color:limegreen">Head Hunter Yamato</span>: Monsters, you say? There are many and they are around, terrorizing peaceful folk in the outside world. Our remote parts don\'t see much of that, these lands are tame. Not without dangers, of course, you meet a wild boar in the forest - a single wrong move and its tusks are in your guts and that is it, end of the fool. Or those pesky slimes, while don\'t look menacing and pose little danger, they sometimes gather and destroy the fields by melting crops and soil. We have it good but starvation is worse than any monster, at times. *cough* anyway, anything living and non-living you meet can be separated into 6 categories:<br>Human, Beast, Undead, Evil, Phantom, Dragon</div>', true, 0, 0, 0, 0, '.8em');
      chs('"About Humans"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Humans and Demihumans fall into the same class. People like you and me, beastmen, orcs, goblins... Mostly creatures intelligent enough to walk on their two, use tools, form societies, make settlements, trade and speak on their own violition. You will encounter and perhaps fight them as bandits, criminals, members of the opposing factions and armies, whoever you disagree with. Always be on your guard, humanoids are cunning and skilled, versatile and very adaptive. Yet, they have mushy bodies. One correct strike and you get an advantage', true);
        chs('"<= Return"', false).addEventListener('click', () => { smove(chss.htrtch1, false) });
      });
      chs('"About Beasts"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Beasts are your usual, normal wildlife like wolves, slimes, mimics, or prone to being evil Demihumans with low intelligence and high level of aggression like ogres, harpies, minotaurs. While animals are dumb, never underestimate a wild beast. With their thick skin and natural weapons like fangs and claws, they pose a major threat when driven into a desperate state. Fire works very well against the most, especially those with fur and feathers, keep that in mind next time you go hunting', true);
        chs('"<= Return"', false).addEventListener('click', () => { smove(chss.htrtch1, false) });
      });
      chs('"About Undead"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Undead, as you could already tell, are living dead. Reanimated remains of humans and beasts by the influence of natural forces or a skilled necromancer. Even if they completely lack intelligence and wander around aimlessly, controlled bodies of the dead get strenghtened by Dark magic and gain unnatural resilience and power as a result. It doesn\'t prevent them from being hurt by fire or Holy powers, hovewer. You can deal with lesser fragile skeletal beings quickly if you bash them with something blunt', true);
        chs('"<= Return"', false).addEventListener('click', () => { smove(chss.htrtch1, false) });
      });
      chs('"About Evil"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Beings that are artificially made or existences who are inherently evil, can be classified as such. Demons, imps, golems, possessed weapons and armor, gremlins, devils and much of anything else that comes out from the Underworld. They are extremely dangerous and seek destruction all that they come across', true);
        chs('"<= Return"', false).addEventListener('click', () => { smove(chss.htrtch1, false) });
      });
      chs('"About Phantoms"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Souls of the dead, ethereal beings, manifestations of powers or other apparitions can all be called Phantoms. They take forms of wisp and sprites, benevolent or twisted elementals or spirits and wraiths that terrorize the living. They are difficult or sometimes outright impossible to hurt using normal physical means, magic or exorcism would be a preferred way of dealing with such enemies', true);
        chs('"<= Return"', false).addEventListener('click', () => { smove(chss.htrtch1, false) });
      });
      chs('"About Dragons"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Dragons are legendary creatures that possess evil and cunning intellect. Through some unknown means many dragons in ancient times were reduced to subspecies of wyverns and wyrms, or outright bastard draconids like lizardmen, and other beings with Dragon bloodline. The power of said bloodline grants them superior defence against magic and energy abilities, their physical toughness is also no joke', true);
        chs('"<= Return"', false).addEventListener('click', () => { smove(chss.htrtch1, false) });
      });
      chs('"<= Return"', false).addEventListener('click', () => { smove(chss.htrtch0, false) });
    }


// @ts-ignore: constructor function
    chss.frstn1b1s = new Chs();
    chss.frstn1b1s.id = 121;
    chss.frstn1b1s.sl = () => {
      flags.inside = true;
      chs('<span style="color:limegreen">Head Hunter Yamato</span>: I\'ll fetch you 15 copper per bundle! How many do you want to sell?', true);
      let fwd = item.fwd1.have ? item.fwd1.amount : 0;
      if (fwd >= 1) chs('"Sell 1 piece"', false, 'lightgrey').addEventListener('click', () => {
        item.fwd1.amount -= 1;
        if (item.fwd1.amount <= 0) removeItem(item.fwd1);
        giveWealth(15);
        smove(chss.frstn1b1s, false)
      });
      if (fwd >= 5) chs('"Sell 5 piece"', false, 'lime').addEventListener('click', () => {
        item.fwd1.amount -= 5;
        if (item.fwd1.amount <= 0) removeItem(item.fwd1);
        giveWealth(75);
        smove(chss.frstn1b1s, false)
      });
      if (fwd >= 10) chs('"Sell 10 pieces"', false, 'cyan').addEventListener('click', () => {
        item.fwd1.amount -= 10;
        if (item.fwd1.amount <= 0) removeItem(item.fwd1);
        giveWealth(150);
        smove(chss.frstn1b1s, false)
      });
      if (fwd >= 1) chs('"Sell Everything"', false, 'orange').addEventListener('click', () => {
        giveWealth(item.fwd1.amount * 15);
        item.fwd1.amount = 0;
        removeItem(item.fwd1);
        smove(chss.frstn1b1s, false)
      });
      chs('"<= Return"', false).addEventListener('click', () => {
        smove(chss.frstn1b1, false)
      });
    }

// @ts-ignore: constructor function
    chss.frstn1b1j = new Chs();
    chss.frstn1b1j.id = 119;
    chss.frstn1b1j.sl = () => {
      flags.inside = true;
      chs('<span style="color:limegreen">Head Hunter Yamato</span>: Here is what\'s available, take a look', true);
      if (quest.fwd1.data.done && quest.hnt1.data.done) {
        if (!quest.lmfstkil1.data.started && !quest.lmfstkil1.data.done) {
          chs('"Monster eradication"', false).addEventListener('click', () => {
            if (you.lvl < 20 || !flags.trne4e1) { msg('<span style="color:limegreen">Head Hunter Yamato</span>: Don\'t even think about it, you will not be sent to your death. Go back and train, dojo has everything you need'); return }
            if (!quest.lmfstkil1.data.started) {
              chs('<span style="color:limegreen">Head Hunter Yamato</span>: What\'s this? Your aura has changed since we last met! All the martial training you went through certainly hasn\'t gone to waste, this kid is definitely isn\'t a pushover anymore, hah! If you have the guts to take on the next task, listen well - southern forest is becoming more and more dangerous, lethal beasts keep crawling in from the farther plains, making it very difficult to do any sort of work in the south. Looks like wolves this time. Some fear, at this rate, they might reach and assault the village, and that will have need to be dealth with. This is a dangerous issue, and you will have to have courage to take it on, but in turn it will serve you as great real battle experience. Other lads have already signed up, as well. Are you willing?', true, 'yellow', 0, 0, 0, '.9em');
              chs('"Accept"', false, 'lime').addEventListener('click', () => {
                giveQst(quest.lmfstkil1);
                flags.frst1u = true;
                giveItem(item.bstr)
                chs('<span style="color:limegreen">Head Hunter Yamato</span>: Hunt down all the wolves you find and return once you destroy at least 35 of them. You will also want this, every hunter should keep his personal notes close. And prepare medicinal bandages, just in case. Be careful, and good luck', true);
                chs('"<= Return"', false).addEventListener('click', () => {
                  smove(chss.frstn1b1, false)
                });
              });
              chs('"Refuse"', false, 'crimson').addEventListener('click', () => {
                smove(chss.frstn1b1, false)
              });
            }
          });
        } else if (quest.lmfstkil1.data.started) {
          if (quest.lmfstkil1.data.mkilled < 35) {
            chs('<span style="color:limegreen">Head Hunter Yamato</span>: Having troubles with the task?', true);
            chs('"<= Return"', false).addEventListener('click', () => {
              smove(chss.frstn1b1, false);
            }); return
          }
          else chs('<span style="color:limegreen">Head Hunter Yamato</span>: What is that fire in your eyes? Can it be you are done already?', true);
          chs('"Report the sounds you heard"', false, 'lime').addEventListener('click', () => {
            chs('<span style="color:limegreen">Head Hunter Yamato</span>: That isn\'t good, sounds like trouble... Might have been the leader of the pack, furious about death of his underlings. This matter will need to be resolved quickly. As for you, go and have a good hard earned rest, you have done very well. Expect to be contacted later for further monster subjugation', true);
            chs('"Accept the reward"', false, 'lime').addEventListener('click', () => {
              finishQst(quest.lmfstkil1);
              smove(chss.frstn1main);
            });
          });
        }
      }
      if (!quest.fwd1.data.done) {
        chs('"Firewood gathering"', false).addEventListener('click', () => {
          if (!quest.fwd1.data.started) {
            chs('<span style="color:limegreen">Head Hunter Yamato</span>: While coal is not easy to obtain around here, good burnable wood is always in demand. Your job this time is to collect and bring about 10 bundles of firewood, keep an eye out while you\'re strolling out in the forest. Your deed will help the villagers, and you will get something out of it as well', true, 'yellow');
            chs('"Accept"', false, 'lime').addEventListener('click', () => {
              giveQst(quest.fwd1);
              chs('<span style="color:limegreen">Head Hunter Yamato</span>: Great! I will be awaiting your return', true);
              chs('"<= Return"', false).addEventListener('click', () => {
                smove(chss.frstn1b1, false)
              });
            });
            chs('"Refuse"', false, 'crimson').addEventListener('click', () => {
              smove(chss.frstn1b1, false)
            });
          } else {
            if (!item.fwd1.have) chs('<span style="color:limegreen">Head Hunter Yamato</span>: If you find your task too difficult, go back to the training grounds', true);
            else if (item.fwd1.amount < 10) chs('<span style="color:limegreen">Head Hunter Yamato</span>: You found some already? You still need ' + (10 - item.fwd1.amount) + ' more bundles of firewood to finish the task', true);
            else chs('<span style="color:limegreen">Head Hunter Yamato</span>: If you got requested firewood, turn it in', true);
            if (item.fwd1.amount >= 10) {
              chs('"Hand over firewood"', false, 'lime').addEventListener('click', () => {
                reduce(item.fwd1, 10)
                chs('<span style="color:limegreen">Head Hunter Yamato</span>: Very good, you didn\'t disappoint. You can never have enough burning material, be it for cooking or warmth, or anything else. Here, this is for you. And some monetary compensation for the job well done. Oh, by the way, I\'ll buy any spare firewood off of you if you need some coin', true);
                chs('"Accept the reward"', false, 'lime').addEventListener('click', () => {
                  finishQst(quest.fwd1);
                });
              });
            }
            chs('"<= Return"', false).addEventListener('click', () => {
              smove(chss.frstn1b1, false)
            });
          }
        });
      }
      if (!quest.hnt1.data.done) {
        chs('"Hunting for meat"', false).addEventListener('click', () => {
          if (!quest.hnt1.data.started) {
            chs('<span style="color:limegreen">Head Hunter Yamato</span>: If you want to survive, you will need to eat. Prove that you can handle yourself in the wilderness by hunting down wildlife. 10 piece of fresh meat should be enough, bring them to me for the evaluation', true, 'yellow');
            chs('"Accept"', false, 'lime').addEventListener('click', () => {
              giveQst(quest.hnt1);
              chs('<span style="color:limegreen">Head Hunter Yamato</span>: Great! I will be awaiting your return', true);
              chs('"<= Return"', false).addEventListener('click', () => {
                smove(chss.frstn1b1, false)
              });
            });
            chs('"Refuse"', false, 'crimson').addEventListener('click', () => {
              smove(chss.frstn1b1, false)
            });
          } else {
            if (!item.fwd1.have) chs('<span style="color:limegreen">Head Hunter Yamato</span>: If you find your task too difficult, go back to the training grounds', true);
            else if (item.rwmt1.amount < 10) chs('<span style="color:limegreen">Head Hunter Yamato</span>: Oh, so you managed to hunt down some of the animals. You still need ' + (10 - item.rwmt1.amount) + ' more chunks of meat to end he job. Hurry up before it goes bad!', true);
            else chs('<span style="color:limegreen">Head Hunter Yamato</span>: If you have everything already, leave it here', true);
            if (item.rwmt1.amount >= 10) {
              chs('"Turn in raw meat"', false, 'lime').addEventListener('click', () => {
                reduce(item.rwmt1, 10);
                chs('<span style="color:limegreen">Head Hunter Yamato</span>: Well done! Hunting down animals and stockpiling food that way is always a good precaution. Cooking or drying raw meat is generally a better idea than consuming it raw, give that a piece of mind if you\'re not sure what to do with the stuff you have.<br>All in all, you deserve a reward', true);
                chs('"Accept the reward"', false, 'lime').addEventListener('click', () => {
                  finishQst(quest.hnt1);
                  smove(chss.frstn1b1, false);
                });
              });
            }
            chs('"<= Return"', false).addEventListener('click', () => {
              smove(chss.frstn1b1, false);
            });
          }
        });
      }
      //blabla

      chs('"<= Return"', false).addEventListener('click', () => {
        smove(chss.frstn1b1, false);
      });
    }

// @ts-ignore: constructor function
    chss.frstn1a1 = new Chs();
    chss.frstn1a1.id = 114;
    addtosector(sector.forest1, chss.frstn1a1)
    chss.frstn1a1.sl = () => {
      flags.inside = false; d_loc('Western Woods, The Yellow Path');
      chs('The woods are silent', true);
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn1main);
      });
    }
    chss.frstn1a1.onEnter = function (this: any) {
      area_init(area.frstn1a2);
    }

// @ts-ignore: constructor function
    chss.frstn1a2 = new Chs();
    chss.frstn1a2.id = 115;
    addtosector(sector.forest1, chss.frstn1a2)
    chss.frstn1a2.sl = () => {
      global.lst_loc = 115; flags.inside = false; d_loc('Western Woods, The Underbushes');
      chs('You scavenged some goods from this forest area', true);
      chs('"=> Go further into the forest"', false).addEventListener('click', () => {
        smove(chss.frstn2a1);
      });
      if (flags.frstnscgr) chs('"\-\-> Enter the hidden path"', false, 'grey').addEventListener('click', () => {
        smove(chss.frstn1a4);
      });
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn1main);
      });
    }
    chss.frstn1a2.data = { scoutm: 320, scout: 0, scoutf: false, gets: [false], gotmod: 0 }
    chss.frstn1a2.scout = [
      { c: .008, f: () => { msg('You uncover a hidden passage!', 'lime'); flags.frstnscgr = true; smove(chss.frstn1a4); chss.frstn1a2.data.gets[0] = true }, exp: 66 },
    ]
    chss.frstn1a2.onScout = function (this: any) { scoutGeneric(this) }


// @ts-ignore: constructor function
    chss.frstn2a1 = new Chs();
    chss.frstn2a1.id = 120;
    addtosector(sector.forest1, chss.frstn2a1)
    chss.frstn2a1.sl = () => {
      flags.inside = false; d_loc('Western Woods, The Shaded Path');
      chs('The woods are silent', true);
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn1main);
      });
    }
    chss.frstn2a1.onEnter = function (this: any) {
      area_init(area.frstn2a2);
    }

// @ts-ignore: constructor function
    chss.frstn3main = new Chs();
    chss.frstn3main.id = 168;
    chss.frstn3main.sl = () => {
      flags.inside = false; d_loc('Southern Forest, The Oaken Gate'); global.lst_loc = 168;
      chs('The air here feels intimidating', true);
      chs('"=> Explore the depths"', false).addEventListener('click', () => {
        smove(chss.frstn9a1m);
      });
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.lsmain1);
      });
    }

// @ts-ignore: constructor function
    chss.frstn9a1m = new Chs();
    chss.frstn9a1m.id = 169;
    chss.frstn9a1m.sl = () => {
      flags.inside = false; d_loc('Southern Forest, The Foliage'); global.lst_loc = 169;
      chs('This place looks dark', true);
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn3main);
      });
    }
    chss.frstn9a1m.onEnter = function (this: any) {
      area_init(area.frstn9a1);
    }


// @ts-ignore: constructor function
    chss.lsmain1 = new Chs();
    chss.lsmain1.id = 106;
    addtosector(sector.vcent, chss.lsmain1);
    addtosector(sector.vmain1, chss.lsmain1)
    chss.lsmain1.sl = () => {
      flags.inside = false; d_loc('Village Center'); global.lst_loc = 106;
      if (isWeather(weather.sunny) || isWeather(weather.clear)) chs('The surroundings are flourishing with life, nothing bad can happen', true);
      else if (isWeather(weather.cloudy) || isWeather(weather.overcast) || isWeather(weather.stormy)) chs('You have a feeling it might rain soon', true);
      else if (isWeather(weather.storm) || isWeather(weather.rain) || isWeather(weather.drizzle)) chs('The rain feels surprisingly refreshing', true);
      else if (isWeather(weather.heavyrain) || isWeather(weather.thunder)) chs('It\'s pouring so hard the streets are completely flooded. There\'s noone around ' + (getHour() > 6 && getHour() < 21 ? 'except for a few kids' : ''), true);
      else if (isWeather(weather.misty) || isWeather(weather.foggy)) chs('Can\'t see a meter in front of you with all this fog', true);
      chs('"=> Check the Message Board"', false).addEventListener('click', () => {
        smove(chss.mbrd, false);
      });
      chs('"=> Enter Dojo"', false).addEventListener('click', () => {
        smove(chss.t3);
      });
      chs('"=> Enter Southern forest"', false).addEventListener('click', () => {
        if (!flags.frst1u) msg('Gate Guard: "Nothing for you to do there. Scram!"', 'yellow');
        else {
          if (!flags.frst1um) { msg('Gate Guard: "You were given permission to proceed. Go on"', 'yellow'); flags.frst1um = true } smove(chss.frstn3main)
        }
      })
      chs('"=> Enter Western Woods"', false).addEventListener('click', () => {
        if (you.lvl >= 6) smove(chss.frstn1main);
        else msg('Gate Guard: "It is too dangerous for you to leave at this moment. Come back when you train a bit"', 'yellow');
      })
      //  chs('"=> Visit Pill Tower"',false).addEventListener('click',()=>{
      //    smove(chss.pltwr1);
      //  });
      if (flags.mkplc1u === true) chs('"=> Visit Marketplace"', false).addEventListener('click', () => {
        smove(chss.mrktvg1);
      });
      chs('"=> Go home"', false, 'green').addEventListener('click', () => {
        smove(chss.home);
      });
      if (!flags.scrtgltt) chs('"=> Food stand"', false).addEventListener('click', () => {
        if (skl.trad.lvl >= 2 && random() < .2) flags.scrtglti = true;
        if (flags.scrtglti === true) {
          chs('...', true);
          chs('?', false).addEventListener('click', () => {
            chs('"Passerby: Looking for the foodstand guy? He took his stuff and went South. That one supposedly travels from place to place to sell the food he makes, doubt we\'ll see him back any time soon"', true);
            chs('Well then..', false).addEventListener('click', () => {
              flags.scrtgltt = true;
              smove(chss.lsmain1, false);
            });
          });
        } else smove(chss.vndr1, false);
      });
      if (random() < .15) chs('"=> Shady Kid"', false, 'springgreen').addEventListener('click', () => {
        smove(chss.vndrkd1, false);
      });

      // chs('"test"',false,'red').addEventListener('click',()=>{
      //   chss.tst.sl();
      // });
      if (!flags.catget) chs('"=> Approach the cat"', false).addEventListener('click', () => {
        smove(chss.cat1);
        if (!stats.cat_c) stats.cat_c = 0;
      });
      if (!flags.mkplc1u) {
        if (flags.dj1end === true && flags.pmfspmkm1 !== true && random() < .4) {
          chs('Paper Boy: Hey, this is for you!', true);
          chs('?', false).addEventListener('click', () => { giveItem(item.shppmf); smove(chss.lsmain1, false) });
        }
      }
    }

// @ts-ignore: constructor function
    chss.mrktvg1 = new Chs();
    chss.mrktvg1.id = 127;
    addtosector(sector.vmain1, chss.mrktvg1)
    chss.mrktvg1.sl = () => {
      flags.inside = false; d_loc('Village Center, Marketplace'); global.lst_loc = 127;
      chs('The marketplace feels busy', true);
      chs('"Grocery Shop =>"', false, 'gold').addEventListener('click', () => {
        smove(chss.grc1);
      });
      chs('"General Store =>"', false, 'gold').addEventListener('click', () => {
        smove(chss.gens1);
      });
      if (flags.phai1udt) chs('"Herbalist =>"', false, 'gold').addEventListener('click', () => {
        smove(chss.pha1);
      });
      chs('"Nervous Guy =>"', false).addEventListener('click', () => {
        smove(chss.fdwrg1qt);
      });

      if (flags.grddtjb) chs('"Checkpoint"', false, 'hotpink').addEventListener('click', () => {
        if (getHour() >= 7 && getHour() <= 10) {
          chs('Lookout Guard: Here for work? You won\'t have to do much, just stand there near the gate and look intimidating. You\'re not doing any fighting if someone dangerous comes around, that would be dealth by Us, your militia. Your shift ends at 8PM, sign up now and go', true);
          chs('"Alright..."', false).addEventListener('click', () => {
            if (getHour() >= 7 && getHour() <= 10) {
              giveQst(quest.grds1);
              smove(chss.jbgd1);
            } else {
              chs('Lookout Guard: Too damn late, next time don\'t stand there like a decoration wasting everyone\'s time', true);
              chs('"Ah..."', false).addEventListener('click', () => { smove(chss.lsmain1) });
            }
          });
          chs('"<= Maybe not"', false).addEventListener('click', () => {
            smove(chss.mrktvg1);
          });
        } else {
          chs('Lookout Guard: If you want work come at the time that\'s stated in the notice and not a minute late!', true);
          chs('"<= Return"', false).addEventListener('click', () => {
            smove(chss.mrktvg1);
          });
        }
      });
      chs('"<= Return back to the village Center"', false).addEventListener('click', () => {
        smove(chss.lsmain1);
      });
    }
    chss.mrktvg1.onEnter = function (this: any) {
      if (!timers.mktwawa1) timers.mktwawa1 = setInterval(function (this: any) {
        if (random() < .1) { if (!gameText.mktwawa1) gameText.mktwawa1 = ['<small>"...for that price? Are you cr..."</small>', '<small>"...no, go by yourself..."</small>', '<small>"...right, I\'ll take ' + rand(15) + ', put them in..."</small>', '<small>"...is this really?..."</small>', '<small>"...never seen this thing..."</small>', '<small>"...is this real?..."</small>', '<small>"...yeah, he said it\'s there..."</small>', '<small>"...mama!!..."</small>', '<small>"...right, coming next evening. You should probably p..."</small>', '<small>"...stop pushing!..."</small>', '<small>"...what a scam..."</small>', '<small>"...this isn\'t even fresh!..."</small>', '<small>"...why is this so expensive?..."</small>', '<small>"...I won\'t lower it further!..."</small>', '<small>"...I\'ll come back, just wait for a minute..."</small>', '<small>"...break time!..."</small>', '<small>"...who said so? Gotta be a lie..."</small>', '<small>"...whatever, I\'m not buying..."</small>', '<small>"...turn right and then..."</small>', '<small>"...check for yourself then..."</small>', '<small>"...she\'ll return shortly. As for you..."</small>', '<small>"...deal!..."</small>', '<small>"...try a different one..."</small>', '<small>"...buy it! You won\'t regret it!..."</small>', '<small>"Oh no! I dropped it in the forest!..."</small>']; msg(select(gameText.mktwawa1), 'rgb(' + rand(255) + ',' + rand(255) + ',' + rand(255) + ')') }
      }, 1000);
    }
    chss.mrktvg1.onLeave = function (this: any) {
      clearInterval(timers.mktwawa1);
      delete timers.mktwawa1
    }

// @ts-ignore: constructor function
    chss.jbgd1 = new Chs();
    chss.jbgd1.id = 159;
    chss.jbgd1.sl = () => {
      flags.inside = false; d_loc('Village Center, Marketplace Entry Gate'); global.lst_loc = 159;
      let c = chs('You are standing on guard duty. This isn\'t very fun', true);
      flags.work = true;
      dom.trddots = addElement(c, 'span');
      dom.trddots.frames = ['', '.', '..', '...'];
      dom.trddots.frame = 0;
      dom.trddots.style.position = 'absolute';
      clearInterval(timers.rdngdots);
      timers.rdngdots = setInterval(() => { dom.trddots.innerHTML = dom.trddots.frames[(dom.trddots.frame = dom.trddots.frame > 2 ? 0 : ++dom.trddots.frame)] }, 333)
      chs('"Be bored"', false).addEventListener('click', () => {
        msg(select(['Right...', 'This is boring', '*whistle*', 'Ah...', '...', 'Yeah...', 'Mhm...', 'Yawn..']), 'lightgrey')
      });
    }
    chss.jbgd1.onEnter = function (this: any) {
      timers.job1t = setInterval(() => {
        if (getHour() >= 20) {
          msg('Lookout Guard: Work\'s done for today, you have performed your duty just well and earned your salary, take it. You are advised to go straight home after you check out');
          finishQst(quest.grds1);
          flags.work = false;
          clearInterval(this);
          smove(chss.home);
          flags.jcom++;
        } else {
          giveSkExp(skl.ptnc, .08);
          if (random() <= .01) msg(select(['Right...', 'This is boring', '*whistle*', 'Ah...', '...', 'Yeah...', 'Mhm...', 'Yawn...']), 'lightgrey')
          if (random() <= (.0005 + skl.seye.lvl * 0.0002)) {
            msg('A passerby dropped a coin. Sweet!', 'lime');
            giveItem(select([item.cp, item.lcn, item.cn, item.cd, item.cq]));
            giveSkExp(skl.seye, 20)
          }
        }
      }, 1000)
    }
    chss.jbgd1.onLeave = function (this: any) {
      clearInterval(timers.job1t);
      flags.work = false;
    }

// @ts-ignore: constructor function
    chss.fdwrg1qt = new Chs();
    chss.fdwrg1qt.id = 165;
    chss.fdwrg1qt.sl = () => {
      d_loc('Marketplace, Stalls');
      chs('"<span style="color:cyan">Nervous Guy:</span> Argh, what am I gonna do now! How could this... Uh? S-sorry, can\'t talk right now, please leave me be. Ahh damn it..."<div style="color: darkgrey">The man then proceeds to fidget in unrest</div>', true)
      chs('"<= Walk away"', false).addEventListener('click', () => {
        smove(chss.mrktvg1, false);
      });
    }


// @ts-ignore: constructor function
    chss.grc1 = new Chs();
    chss.grc1.id = 128;
    chss.grc1.effectors = [{ e: effector.shop }];
    chss.grc1.sl = () => {
      flags.inside = true; d_loc('Marketplace, Grocery Shop'); global.lst_loc = 128;
      chs('Old Lady: ' + (select(['These are very fresh, buy some!', 'Freshest vegetables for the lowest price!', 'Try a few and you\'ll want even more!'])), true);
      chs('"Purchase"', false, 'orange').addEventListener('click', () => {
        chs_spec(4, vendor.grc1)
        vendor.grc1.restocked = false;
        clearInterval(timers.vndrstkchk);
        timers.vndrstkchk = setInterval(function (this: any) { if (vendor.grc1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.grc1.restocked = false; msg('We\'re restocking, step out for a minute'); smove(chss.mrktvg1, false); } });
        chs('"<= Return"', false, '', '', undefined, undefined, undefined, true).addEventListener('click', () => {
          smove(chss.grc1, false);
          clearInterval(timers.vndrstkchk);
        });
      });
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.mrktvg1);
      });
    }
    chss.grc1.data = { scoutm: 200, scout: 0, scoutf: false, gets: [false], gotmod: 0 }
    chss.grc1.scout = [
      { c: .01, f: () => { msg(select(['You notice a coin on the ground!', 'You pick a coin from under the counter', 'You snatch a coin while no one is looking']), 'lime'); giveItem(select([item.cp, item.cn, item.cq, item.cd])); chss.grc1.data.gets[0] = true }, exp: 5 },
    ]
    chss.grc1.onScout = function (this: any) { scoutGeneric(this) }


// @ts-ignore: constructor function
    chss.gens1 = new Chs();
    chss.gens1.id = 129;
    chss.gens1.effectors = [{ e: effector.shop }];
    chss.gens1.sl = () => {
      flags.inside = true; d_loc('Marketplace, Shabby General Store'); global.lst_loc = 129;
      chs('Sleeping Old Man: ' + (select(['...Welcome', '...', 'zzz...', 'A customer? Pick what you want', 'Take your time'])), true);
      chs('"Purchase"', false, 'orange').addEventListener('click', () => {
        chs_spec(4, vendor.gens1)
        vendor.gens1.restocked = false;
        clearInterval(timers.vndrstkchk);
        timers.vndrstkchk = setInterval(function (this: any) { if (vendor.gens1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.gens1.restocked = false; msg('We\'re restocking, step out for a minute'); smove(chss.mrktvg1, false); } });
        chs('"<= Return"', false, '', '', undefined, undefined, undefined, true).addEventListener('click', () => {
          smove(chss.gens1, false);
          clearInterval(timers.vndrstkchk);
        });
      });
      if (item.wvbkt.have) chs('"Sell straw baskets ' + dom.coincopper + '"', false).addEventListener('click', () => {
        chs('Sleeping Old Man: You made these, kid? Hahaha, alright, i\'ll take them off your hands. 15 ' + dom.coincopper + ' each!', true);
        chs('"Sell your goods"', false, 'lime').addEventListener('click', () => {
          if (item.wvbkt.amount > 0) {
            giveWealth(item.wvbkt.amount * 15);
            item.wvbkt.amount = 0;
            removeItem(item.wvbkt);
            smove(chss.gens1, false);
          } else {
            smove(chss.gens1, false);
            msg('?')
          }
        });
        chs('"<= Maybe next time"', false).addEventListener('click', () => {
          smove(chss.gens1, false);
        });
      });
      if (area.hmbsmnt.size >= 1000 && flags.hbs1 && !flags.bmntsmkgt) chs('Infestation problem', false, 'grey').addEventListener('click', () => {
        chs('Sleeping Old Man: Your basement is in bad shape? Same been happening to the other folks lately, it\'s not just you. Something is drilling through the underground right into people\'s homes! And then you get a cellar full of rats. A complete travesty! Some speculate there\'s a monster cave nearby, but nothing was found yet. But don\'t fret, there is a solution for you - you smoke the pests out. Light this bag and toss it in, the deeper the better. Your entire place will be filled with smog, so you will have to leave and stay out for a few hours, then you\'ll have a clean and monster free basement at your disposal. 5 ' + dom.coinsilver + ' silver the price', true);
        if (you.wealth >= SILVER * 5) chs('"Sounds good"', false, 'lime').addEventListener('click', () => {
          if (you.wealth < SILVER * 5) return;
          spend(SILVER * 5);
          giveItem(item.bmsmktt);
          flags.bmntsmkgt = true;
          smove(chss.gens1, false)
        });
        chs('"<= Too expensive"', false).addEventListener('click', () => {
          smove(chss.gens1, false);
        });
      });
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.mrktvg1);
      });
    }
    chss.gens1.data = { scoutm: 200, scout: 0, scoutf: false, gets: [false], gotmod: 0 }
    chss.gens1.scout = [
      { c: .01, f: () => { msg(select(['You notice a coin on the ground!', 'You pick a coin from under the counter', 'You snatch a coin while no one is looking']), 'lime'); giveItem(select([item.cp, item.cn, item.cq, item.cd])); chss.gens1.data.gets[0] = true }, exp: 5 },
    ]
    chss.gens1.onScout = function (this: any) { scoutGeneric(this) }

// @ts-ignore: constructor function
    chss.pha1 = new Chs();
    chss.pha1.id = 166;
    chss.pha1.effectors = [{ e: effector.shop }];
    chss.pha1.sl = () => {
      flags.inside = true; d_loc('Marketplace, Herbalist'); global.lst_loc = 166;
      chs('Herbalist: ' + (select(['Injured? Come in, I\'ll give you a check up', 'Yes yes..', 'Don\'t neglect your well being, stack on anything you will need'])), true);
      chs('"Purchase"', false, 'orange').addEventListener('click', () => {
        chs_spec(4, vendor.pha1)
        vendor.pha1.restocked = false;
        clearInterval(timers.vndrstkchk);
        timers.vndrstkchk = setInterval(function (this: any) { if (vendor.pha1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.pha1.restocked = false; msg('We\'re restocking, step out for a minute'); smove(chss.mrktvg1, false); } });
        chs('"<= Return"', false, '', '', undefined, undefined, undefined, true).addEventListener('click', () => {
          smove(chss.pha1, false);
          clearInterval(timers.vndrstkchk);
        });
      });
      if (item.hrb1.amount >= 50) chs('"Sell cure grass ' + dom.coincopper + '"', false).addEventListener('click', () => {
        chs('Herbalist: Yes indeed, if you have any cure grass to sell, by all means bring it here, you can never have too much. I will take bundles of 50 for 15 ' + dom.coincopper, true);
        chs('"Sell your goods"', false, 'lime').addEventListener('click', () => {
          if (item.hrb1.amount >= 50) {
            stats.hbhbsld++;
            giveWealth(15);
            item.hrb1.amount -= 50;
            reduce(item.hrb1);
            if (stats.hbhbsld >= 7 && !flags.hbhbgft) {
              chs('Herbalist: You were such a great help bringing all this cure grass to me! Take this, as a bonus', true);
              chs('"Accept"', false, 'lime').addEventListener('click', () => {
                giveItem(item.hptn1, 15);
                giveItem(item.hptn2, 3);
                vendor.pha1.data.rep = vendor.pha1.data.rep + 10 > 100 ? 100 : vendor.pha1.data.rep + 10;
                msg('The Herbalist likes you a bit more', 'lime');
                flags.hbhbgft = true;
                smove(chss.pha1, false);
                return;
              });
            }; if (item.hrb1.amount < 50) smove(chss.pha1, false)
          } else { smove(chss.pha1, false); msg('?') }
        });
        chs('"<= Rather not"', false).addEventListener('click', () => {
          smove(chss.pha1, false);
        });
      });
      if (item.htrsvr.have) chs('"Deliver the bag"', false, 'lightblue').addEventListener('click', () => {
        chs('Herbalist: And who might you be? Ohhhh, aren\'t you that dojo kid who\'s learning the art of hunting from the head himself? Come in come in, welcome! What is it you wish to deliver? Ah! Wonderful, excellent, this will last for plenty of time. Thank you for coming all this way in timely manner, you\'ve been a great help. I will give you these to sample, as a reward, they will be useful to you. Oh, and one simple request, if you don\'t mind. Give this to him when you meet next time, it is very important that he gets it.', true);
        chs('"I can do it!"', false).addEventListener('click', () => {
          removeItem(item.htrsvr); giveItem(item.atd1, 3); giveItem(item.hptn1, 10); giveItem(item.psnwrd); giveItem(item.hptn2); giveItem(item.hbtsvr); smove(chss.pha1);
        });
      });

      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.mrktvg1);
      });
    }
    chss.pha1.data = { scoutm: 200, scout: 0, scoutf: false, gets: [false], gotmod: 0 }
    chss.pha1.scout = [
      { c: .01, f: () => { msg(select(['You notice a coin on the ground!', 'You pick a coin from under the counter', 'You snatch a coin while no one is looking']), 'lime'); giveItem(select([item.cp, item.cn, item.cq, item.cd])); chss.pha1.data.gets[0] = true }, exp: 5 },
    ]
    chss.pha1.onScout = function (this: any) { scoutGeneric(this) }


// @ts-ignore: constructor function
    chss.vndr1 = new Chs();
    chss.vndr1.id = 116;
    chss.vndr1.effectors = [{ e: effector.shop }];
    addtosector(sector.vcent, chss.vndr1);
    addtosector(sector.vmain1, chss.vndr1)
    chss.vndr1.sl = () => {
      d_loc('Village Center, Street Food Stand'); global.lst_loc = 116;
      vendor.stvr1.restocked = false;
      clearInterval(timers.vndrstkchk);
      timers.vndrstkchk = setInterval(function (this: any) { if (vendor.stvr1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.stvr1.restocked = false; msg('We\'re restocking, step out for a minute'); smove(chss.lsmain1, false); } });
      let hi = 'Street Merchant Ran: Welcome! What would you like?';
      dom.vndr1 = chs(hi, true);
      for (let ost = 0; ost < vendor.stvr1.stock.length; ost++) {
        let itm = vendor.stvr1.stock[ost];
        dom.vndrs = chs(itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1], false);
        dom.vndrs.addEventListener('click', function (this: any) {
          if (you.wealth - itm[2] >= 0) { spend(itm[2]); mf(-itm[2], 1); m_update(); giveItem(itm[0]); stats.buyt++; if (--itm[1] === 0) { clr_chs(vendor.stvr1.stock.indexOf(itm) + 1); vendor.stvr1.stock.splice(vendor.stvr1.stock.indexOf(itm), 1); empty(global.dscr); global.dscr.style.display = 'none' } else this.innerHTML = itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1]; } else { clearTimeout(timers.shopcant); dom.vndr1.innerHTML = 'Sorry you can\'t afford that!'; timers.shopcant = setTimeout(() => { dom.vndr1.innerHTML = hi }, 1000) }
        });
        addDesc(dom.vndrs, itm[0]);
      }
      chs('"<= Go back"', false).addEventListener('click', () => {
        smove(chss.lsmain1, false);
        clearInterval(timers.vndrstkchk);
      });
    }

// @ts-ignore: constructor function
    chss.vndrkd1 = new Chs();
    chss.vndrkd1.id = 123;
    chss.vndrkd1.shop = true;
    addtosector(sector.vcent, chss.vndrkd1);
    addtosector(sector.vmain1, chss.vndrkd1)
    chss.vndrkd1.sl = () => {
      d_loc('Village Center, Child Trader'); global.lst_loc = 123;
      vendor.kid1.restocked = false;
      clearInterval(timers.vndrstkchk);
      timers.vndrstkchk = setInterval(function (this: any) { if (vendor.kid1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.kid1.restocked = false; msg('You, step out for a moment, I\'m getting new stuff'); smove(chss.lsmain1, false); } });
      let hi = 'Hey, I\'ve got some good stuff for you';
      dom.vndr1 = chs(hi, true);
      for (let ost = 0; ost < vendor.kid1.stock.length; ost++) {
        let itm = vendor.kid1.stock[ost];
        dom.vndrs = chs(itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1], false);
        dom.vndrs.addEventListener('click', function (this: any) {
          if (you.wealth - itm[2] >= 0) { spend(itm[2]); mf(-itm[2], 1); m_update(); giveItem(itm[0]); stats.buyt++; if (--itm[1] === 0) { clr_chs(vendor.kid1.stock.indexOf(itm) + 1); vendor.kid1.stock.splice(vendor.kid1.stock.indexOf(itm), 1); empty(global.dscr); global.dscr.style.display = 'none' } else this.innerHTML = itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1]; } else { clearTimeout(timers.shopcant); dom.vndr1.innerHTML = 'Bring money next time'; timers.shopcant = setTimeout(() => { dom.vndr1.innerHTML = hi }, 1000) }
        });
        addDesc(dom.vndrs, itm[0]);
      }
      if (skl.fgt.lvl >= 5 && !flags.vndrkd1sp1) chs('"Show me something better"', false, 'darkgrey').addEventListener('click', () => {
        chs('So you want something from the hidden stash, huh? Good eye! You are one of the dojo runts, I\'ve got just what someone like you needs. One book, 3 silver' + dom.coinsilver + '. So, watcha say?', true);
        chs('"Give me"', false, 'lime').addEventListener('click', () => {
          if (you.wealth >= 300) {
            chs('"There ya go, enjoy"', true)
            flags.vndrkd1sp1 = true;
            giveItem(item.fgtsb1);
            spend(300)
            chs('"Sweet purchase!"', false).addEventListener('click', () => {
              smove(chss.lsmain1, false);
            });
          } else {
            chs('No money - no goods! Don\'t waste my time!', true);
            chs('"<= Go back"', false).addEventListener('click', () => {
              smove(chss.lsmain1, false);
            });
          }
        });
        chs('"<= Nah"', false, 'Red').addEventListener('click', () => {
          chs('No worries, I\'ll keep it for you', true);
          chs('"<= Go back"', false).addEventListener('click', () => {
            smove(chss.lsmain1, false);
          });
        });
      });
      else if (stats.moneyg >= 1000 && !flags.vndrkd1sp2 && flags.vndrkd1sp1) chs('"Show me something better"', false, 'darkgrey').addEventListener('click', () => {
        chs('Alright, there\'s something else for you, snatched from some sleeping guy and I bet would be useful for you. Similar deal, 5 silver' + dom.coinsilver, true);
        chs('"Yes please"', false, 'lime').addEventListener('click', () => {
          if (you.wealth >= 500) {
            chs('"Deal successfully made"', true)
            flags.vndrkd1sp2 = true;
            giveItem(item.bfsnwt);
            spend(500)
            chs('"Score!"', false).addEventListener('click', () => {
              smove(chss.lsmain1, false);
            });
          } else {
            chs('No money - no goods! Don\'t waste my time!', true);
            chs('"<= Go back"', false).addEventListener('click', () => {
              smove(chss.lsmain1, false);
            });
          }
        });
        chs('"<= Nah"', false, 'Red').addEventListener('click', () => {
          chs('No worries, I\'ll keep it for you', true);
          chs('"<= Go back"', false).addEventListener('click', () => {
            smove(chss.lsmain1, false);
          });
        });
      });
      chs('"<= Go back"', false).addEventListener('click', () => {
        smove(chss.lsmain1, false);
      });
    }
    chss.vndrkd1.onLeave = function (this: any) { clearInterval(timers.vndrstkchk) }

// @ts-ignore: constructor function
    chss.tstauto = new Chs();
    chss.tstauto.id = -1;
    chss.tstauto.sl = () => {
      d_loc('Test auto'); global.lst_loc = -1;
      dom.testauto = chs('TEST', true);
      if (!flags.testauto_1 || flags.testauto_1 === false) chs('Run', false).addEventListener('click', () => {
        flags.testauto_1 = true;
        timers.testauto1 = setInterval(() => { dom.testauto.innerHTML = rand(9999999) }, 1000);
        chss.tstauto.sl();
      }); else chs('Stop', false).addEventListener('click', () => {
        flags.testauto_1 = false;
        chss.tstauto.sl();
        clearInterval(timers.testauto1);
      });
      chs('"<= Go back"', false).addEventListener('click', () => {
        chss.lsmain1.sl();
      });
    }

// @ts-ignore: constructor function
    chss.tst = new Chs();
    chss.tst.id = -1;
    chss.tst.sl = () => {
      d_loc('Test'); global.lst_loc = -1;
      dom.tst = chs('TEST', true);
      flags.btl = true;
      flags.civil = false;
      area_init(area.tst);
      chs('"<= Go back"', false).addEventListener('click', () => {
        chss.lsmain1.sl();
      });
    }

// @ts-ignore: constructor function
    chss.cat1 = new Chs();
    chss.cat1.id = 107;
    addtosector(sector.vcent, chss.cat1);
    addtosector(sector.vmain1, chss.cat1)
    chss.cat1.sl = () => {
      d_loc('Village Center, Cat'); //global.lst_loc = 107;
      let w = !stats.cat_c ? chs('There is a cat.', true) : chs('There is a cat. Pets: ' + stats.cat_c, true);
      chs('"Pet the cat"', false).addEventListener('click', (x: any) => {
        let a: any = addElement(document.body, 'span');
        a.style.pointerEvents = 'none';
        a.style.position = 'absolute';
        a.style.color = 'lime';
        a.innerHTML = select([':3', '\'w\'', '\'ω\'', '(=・∀・=)', '*ﾟヮﾟ']);
        a.style.top = -55;
        a.style.left = -55;
        a.style.fontSize = '1.25em';
        a.style.textShadow = '2px 2px 1px blue';
        a.posx = x.clientX - 20;
        a.posy = x.clientY - 20;
        a.spos = randf(-1, 1);
        let t = 0;
        let g = setInterval(() => {
          t++;
          a.style.top = a.posy - 2 * t;
          a.style.left = a.posx + Math.sin(t / 5 + a.spos) * 15;
          a.style.opacity = (110 - t) / 110;
          if (t === 110) {
            clearInterval(g);
            document.body.removeChild(a);
          }
        }, 20);
        stats.cat_c++;
        if (stats.cat_c < 333) skl.pet.use();
        w.innerHTML = 'There is a cat. Pets: ' + stats.cat_c;
        if (stats.cat_c >= 100) {
          if (!flags.cat_g) {
            clr_chs(2); flags.cat_g = true;
            chs('"???"', false).addEventListener('click', () => {
              chs('Cat wants to tag along', true);
              chs('"Take it with you"', false).addEventListener('click', () => {
                let cat = giveFurniture(furniture.cat, true, false);
                cat.data.sex = rand(1);
                cat.data.c = rand(gameText.cfc.length - 1);
                cat.data.p = rand(gameText.cfp.length - 1);
                cat.data.l1 = rand(gameText.cln.length - 1);
                let tg = rand(gameText.cln.length - 1);
                do { tg = rand(gameText.cln.length - 1) } while (tg === cat.data.l1);
                cat.data.l2 = rand(gameText.cln.length - 1);
                flags.catget = true;
                msg('The cat decided to move into your house!', 'lime');
                smove(chss.lsmain1);
              });
              chs('"Leave it as is"', false).addEventListener('click', () => {
                smove(chss.lsmain1);
              });
            });
            chs('"<= Return"', false).addEventListener('click', () => {
              smove(chss.lsmain1);
            })
          }
        }
      });
      if (stats.cat_c >= 100) {
        chs('"???"', false).addEventListener('click', () => {
          chs('Cat wants to tag along', true);
          chs('"Take it with you"', false).addEventListener('click', () => {
            let cat = giveFurniture(furniture.cat, true, false);
            cat.data.sex = rand(1);
            cat.data.c = rand(gameText.cfc.length - 1);
            cat.data.p = rand(gameText.cfp.length - 1);
            cat.data.l1 = rand(gameText.cln.length - 1);
            let tg = rand(gameText.cln.length - 1);
            do { tg = rand(gameText.cln.length - 1) } while (tg === cat.data.l1);
            cat.data.l2 = rand(gameText.cln.length - 1);
            flags.catget = true;
            msg('The cat decided to move into your house!', 'lime');
            smove(chss.lsmain1);
          });
          chs('"Leave it as is"', false).addEventListener('click', () => {
            smove(chss.lsmain1);
          });
        });
      }
      chs('"<= Return"', false).addEventListener('click', () => {
        smove(chss.lsmain1);
      });
    }

    gameText.mbrdtt = ['"If you do not work your hours daily, you will not get any dessert"', '"Do your job well and you will be rewarded"', 'There is a report of a missing cat', 'There is a section of useless gossip', 'This is an  advertisement for fresh vegetables', 'This is an advertisement for dojo membership', 'This is an advertisement for wooden furniture', 'This is an advertisement for dried meat', 'This is an advertisement for joining the militia', '"The Hunter Association offers you a large variety of boxes full of smoked meat and furs"', 'This is an advertisement for herbal medicine', 'This is an advertisement for wine kegs', 'This is an advertisement for farming equipment', 'This is an advertisement for carpentery supplies', '"All the children must return home by 8PM!"', 'This is an advertisement for smithing orders', 'This is an advertisement for cooking courses', 'This is an advertisement for bottled water', 'This is an advertisement for knitting advices', 'This is an advertisement for cleaning services', 'This is a warning to stay away from fortune tellers', 'This is an advertisement for woven straw baskets', 'This is an advertisement for hemp clothing']

// @ts-ignore: constructor function
    chss.mbrd = new Chs();
    chss.mbrd.id = 108;
    addtosector(sector.vcent, chss.mbrd);
    addtosector(sector.vmain1, chss.mbrd)
    chss.mbrd.sl = () => {
      d_loc('Village Center, Message Board'); global.lst_loc = 108;
      for (let a in inv) if (inv[a].id === acc.wdl1.id || inv[a].id === acc.sdl1.id || inv[a].id === acc.bdl1.id || inv[a].id === acc.gdl1.id) {
        if (!flags.glqtdltn && (getHour() < 20 && getHour() > 8) && random() < .15) {
          {
            chs('You notice a little girl with emerald green hair approach you', true);
            chs('"?"', false).addEventListener('click', () => {
              chs('<span style="color:lime">Xiao Xiao</span>: "Hey, hey, what are those dolls you carry? Make one for me!!"', true);
              chs('"Alright..."', false).addEventListener('click', () => {
                flags.glqtdltn = true;
                smove(chss.mbrd, false)
              });
            });
          }
          return
        } break
      }
      chs('Message Board<br>You can find jobs or other stuff here', true);
      chs('"Explore the posts"', false).addEventListener('click', () => {
        chs(select(gameText.mbrdtt), true);
        chs('"<= Return"', false).addEventListener('click', () => {
          smove(chss.mbrd, false);
        });
      });
      if (flags.frstn1b1g1) {
        chs('"Notice #4"', false).addEventListener('click', () => {
          chs('It says here:<br><span style="color:orange">Looking for a anyone with free time to assist local militia with guarding duty. Apply at the checkpoint near marketplace area between 7AM and 10AM"</span>', true);
          chs('"Huh.."', false).addEventListener('click', () => {
            flags.grddtjb = true;
            smove(chss.mbrd);
          });
        });
        chs('"Warning!"', false).addEventListener('click', () => {
          chs('Dangerous beasts were sighted in vicinity of the Southern Forest. These reports are likely linked to the cause of livestock and locals getting injured, therefore, to avoid further casualties, entry into the forest is prohibited to those without permit or high enough self-defence ability until the situation is resolved<br><br><div style="text-align:right">一Head of The Guard, Hitoshi</div>', true);
          chs('"I see"', false).addEventListener('click', () => { smove(chss.mbrd); });
        });
      }
      if (flags.glqtdltn && !flags.glqtdldn && (getHour() < 20 && getHour() > 8)) {
        chs('"Xiao Xiao =>"', false).addEventListener('click', () => { smove(chss.xpgdqt1, false) });
      }
      chs('"<= Go back"', false).addEventListener('click', () => {
        smove(chss.lsmain1, false);
      });
    }

// @ts-ignore: constructor function
    chss.xpgdqt1 = new Chs();
    chss.xpgdqt1.id = 167;
    addtosector(sector.vcent, chss.xpgdqt1);
    addtosector(sector.vmain1, chss.xpgdqt1)
    chss.xpgdqt1.sl = () => {
      d_loc('Village Center, Message Board'); global.lst_loc = 166;
      chs('<span style="color:lime">Xiao Xiao</span>: "What is it what is it?"', true);
      let dl1 = findbyid(inv, acc.wdl1.id);
      let dl2 = findbyid(inv, acc.sdl1.id);
      let dl3 = findbyid(inv, acc.bdl1.id);
      let dl4 = findbyid(inv, acc.gdl1.id);
      if (dl1) {
        chs('"Show Xiao Xiao a wooden doll"', false).addEventListener('click', () => {
          chs('<span style="color:lime">Xiao Xiao</span>: "Nooooo it\'s ugly!!"', true);
          chs('"<= Take it back"', false).addEventListener('click', () => { smove(chss.xpgdqt1, false) })
        });
      }
      if (dl2) {
        chs('"Show Xiao Xiao a straw doll"', false).addEventListener('click', () => {
          chs('<span style="color:lime">Xiao Xiao</span>: "Nooooo it\'s creepy!!"', true);
          chs('"<= Take it back"', false).addEventListener('click', () => { smove(chss.xpgdqt1, false) })
        });
      }
      if (dl3) {
        chs('"Show Xiao Xiao a bone doll"', false).addEventListener('click', () => {
          chs('<span style="color:lime">Xiao Xiao</span>: "Nooooo it\'s scary!!"', true);
          chs('"<= Take it back"', false).addEventListener('click', () => { smove(chss.xpgdqt1, false) })
        });
      }
      if (dl4) {
        chs('"Show Xiao Xiao a soul doll"', false).addEventListener('click', () => {
          chs('<span style="color:lime">Xiao Xiao</span>: "Waai thank you! I love it! I\'ll give you this! Here, take!"<br><br><span style="color:lightgrey">The girl happily runs away with her new toy</span>', true);
          chs('"Claim your hardearned reward"', false).addEventListener('click', () => { removeItem(dl4); flags.glqtdldn = true; global.offline_evil_index -= .002; msg('You feel more peaceful', 'gold'); giveItem(acc.ubrlc); smove(chss.mbrd, false) })
        });
      }
      chs('"<= Return"', false).addEventListener('click', () => {
        smove(chss.mbrd, false)
      });
    }

// @ts-ignore: constructor function
    chss.trd = new Chs();
    chss.trd.id = 109;
    chss.trd.sl = function (b: any, x: any) {
      flags.rdng = true; let rd = skl.rdg.use(); b.data.timep = b.data.timep || 0;
      b.cmax = (b.data.time * (1 / (1 + (rd) / 10)) / you.mods.rdgrt) - (1 / (1 + (rd) / 10) - 1) / you.mods.rdgrt;
      let c = b.cmax - b.data.timep;
      if (c < 0) c = 0;
      let ttxt;
      if (c > HOUR) ttxt = (c / HOUR << 0) + '</span> hours to finish';
      else ttxt = (c << 0) + '</span> minutes to finish';
      dom.trdc = chs('', true);
      dom.trd = addElement(dom.trdc, 'span');
      dom.trd.innerHTML = 'You are reading <span style="color:orange">' + b.name + '</span><br>It will take you about <span style="color:lime">' + ttxt;
      dom.trddots = addElement(dom.trdc, 'span');
      dom.trddots.frames = ['', '.', '..', '...'];
      dom.trddots.frame = 0;
      dom.trddots.style.position = 'absolute';
      timers.rdngdots = setInterval(() => { dom.trddots.innerHTML = dom.trddots.frames[(dom.trddots.frame = dom.trddots.frame > 2 ? 0 : ++dom.trddots.frame)] }, 333);
      timers.rdng = setInterval(() => {
        stats.rdgtttl++; let rd = skl.rdg.use(); giveSkExp(skl.rdg, x || 1);
        b.cmax = (b.data.time * (1 / (1 + (rd) / 10)) / you.mods.rdgrt) - (1 / (1 + (rd) / 10) - 1) / you.mods.rdgrt;
        let c = b.cmax - b.data.timep;
        if (c < 0) c = 0;
        let ttxt;
        if (c > HOUR) ttxt = (c / HOUR << 0) + '</span> hours to finish';
        else ttxt = (c << 0) + '</span> minutes to finish';
        dom.trd.innerHTML = 'You are reading <span style="color:orange">' + b.name + '</span><br>It will take you about <span style="color:lime">' + ttxt;
        if (++b.data.timep >= b.cmax) { clearInterval(timers.rdng); clearInterval(timers.rdngdots); stats.rdttl++; flags.rdng = false; for (let gg in chss) if (chss[gg].id === global.lst_loc) chss[gg].sl(); b.use(you); reduce(b); b.data.timep = 0; }
      }, 1000);
      chs('"Stop reading"', false).addEventListener('click', () => {
        clearInterval(timers.rdng);
        clearInterval(timers.rdngdots);
        flags.rdng = false;
        for (let gg in chss) if (chss[gg].id === global.lst_loc) chss[gg].sl();
      });
    }

// @ts-ignore: constructor function
    chss.home = new Chs();
    chss.home.id = 111;
    addtosector(sector.home, chss.home);
    chss.home.sl = () => {
      d_loc('Your Home'); global.lst_loc = 111;
      if (!flags.catget || sector.home.data.smkp > 0) chs('Your humble abode. You can rest here. ', true);
      else { if (!gameText.hmcttt) gameText.hmcttt = ['Your cat comes out to greet you!', '', 'You hear rustling', 'Meow']; chs('You feel safe. You can rest here. ' + select(gameText.hmcttt), true); }
      if (!flags.hbgget) chs('"Examine your bag"', false).addEventListener('click', () => {
        chs('Something you\'ve forgotten to grab before. There\'s a pack of food and some junk idea paper.', true)
        chs('Better take this with you', false).addEventListener('click', () => {
          flags.hbgget = true;
          giveItem(eqp.bnd);
          giveItem(item.ip1);
          giveItem(item.watr, 10);
          giveItem(wpn.wsrd1);
          giveItem(item.eggn, 3);
          giveItem(item.mlkn, 2);
          giveItem(item.rice, 5);
          giveItem(item.brd, 50);
          smove(chss.home, false);
        });
      });
      chs('"Crash down and take a nap"', false).addEventListener('click', () => {
        if (sector.home.data.smkp > 0) { msg('This isn\'t time for sleep', 'red'); return }
        smove(chss.hbed, false);
      });
      if (!flags.chbdfst) chs('"Examine your hidden stash"', false).addEventListener('click', () => {
        chs('You reach for a small red box which you keep your valuables in, it is time to take it out', true)
        chs('Grab the contents', false).addEventListener('click', () => {
          giveItem(item.ywlt);
          giveItem(item.pdeedhs);
          flags.chbdfst = true;
          smove(chss.home, false);
        });
      });
      chs(flags.hbs1 === true ? '"Enter the basement"' : '"Examine basement door"', false).addEventListener('click', () => {
        if (!flags.hbs1) {
          if (item.key0.have) { msg('*click...* ', 'lightgrey'); msg_add('The door has opened', 'lime'); flags.hbs1 = true; smove(chss.home, false) } else msg("It's locked");
        } else smove(chss.bsmnthm1, false)
      });
      if (flags.hsedchk) chs(' "Furniture list"', false, 'orange', '', 1, 8).addEventListener('click', () => {
        chs_spec(2);
        global.wdwidx = 1;
        chs('"<= Return"', false).addEventListener('click', () => {
          smove(chss.home, false);
        });
      });
      if (scanbyid(furn, furniture.frplc.id)) {
        chs('"Examine Fireplace"', false).addEventListener('click', () => {
          smove(chss.ofrplc, false);
        });
      }
      if (scanbyid(furn, furniture.strgbx.id)) {
        chs('"Access Storagebox"', false).addEventListener('click', () => {
          smove(chss.sboxhm, false);
        });
      }
      if (flags.catget) {
        let tcat = findbyid(furn, furniture.cat.id);
        tcat.data.mood = tcat.data.mood || 1;
        chs('"Check on Cat"', false).addEventListener('click', () => {
          if (sector.home.data.smkp > 0) { msg('Your cat went outside', 'yellow'); return }
          chs_spec(1);
          if (tcat.data.named === false) chs('"Rename"', false).addEventListener('click', () => {
            chs('Give your cat a name!<br><small>(can\'t rename later!)</small>', true);
            let inp = addElement(dom.ctr_2, 'input', 'chs') as HTMLInputElement;
            inp.style.textAlign = 'center';
            inp.style.color = 'white';
            inp.style.fontFamily = 'MS Gothic';
            chs('"Accept"', false, 'lime').addEventListener('click', () => {
              if (inp.value == '' || inp.value.search(/ *$/) === 0) msg('Actually give it a name, maybe?', 'springgreen');
              else if (inp.value.search(/[Kk][Ii][Rr][Ii]/) === 0) { msg('Hey now! o:<', 'crimson'); dom.gmsgs.children[1].lastChild.style.fontSize = '2em' } else { tcat.data.name = inp.value; tcat.data.named = true; } smove(chss.home, false);
            });
            chs('"Decline"', false, 'red').addEventListener('click', () => {
              smove(chss.home, false);
            });
          });
          dom.ctspcl = chs('"Pet ' + tcat.data.name + '"', false);
          dom.ctspcl.addEventListener('click', (x: any) => {
            let a: any = addElement(document.body, 'span');
            stats.cat_c++;
            for (let x in global.cptchk) global.cptchk[x]()
            a.style.pointerEvents = 'none';
            a.style.position = 'absolute';
            a.style.color = 'lime';
            a.innerHTML = tcat.data.mood > .2 ? select([':3', '\'w\'', '\'ω\'', '(=・∀・=)', '*ﾟヮﾟ']) : select(['¦3', 'ーωー', '( ˘ω˘)', '(´-ω-`)', '(。-∀-)']);
            a.style.top = -55;
            a.style.left = -55;
            a.style.fontSize = '1.25em';
            a.style.textShadow = '2px 2px 1px blue';
            a.posx = x.clientX - 20;
            a.posy = x.clientY - 20;
            a.spos = randf(-1, 1);
            let t = 0;
            let g = setInterval(() => {
              t++;
              a.style.top = a.posy - 2 * t;
              a.style.left = a.posx + Math.sin(t / 5 + a.spos) * 15;
              a.style.opacity = (110 - t) / 110;
              if (t === 110) {
                clearInterval(g);
                document.body.removeChild(a);
              }
            }, 20);
            tcat.data.mood = tcat.data.mood - .01 <= 0 ? 0 : tcat.data.mood - .01;
            if (tcat.data.mood >= 0.01) skl.pet.use();
          });
          chs('"<= Return"', false).addEventListener('click', () => {
            smove(chss.home, false);
            clearInterval(timers.caupd);
          });
        });
      }
      chs('"<= Go outside"', false).addEventListener('click', () => {
        smove(chss.lsmain1);
      });
    }

    chss.home.data = { scoutm: 1200, scout: 0, scoutf: false, gets: [false, false], gotmod: 0 }
    chss.home.scout = [
      { c: .006, f: () => { msg('Oh, you forgot you had this around', 'orange'); giveItem(wpn.kiknif); chss.home.data.gets[0] = true; }, exp: 30 },
      { c: .01, f: () => { msg('There was a coin stuck between the floor boards', 'orange'); giveItem(item.lcn); chss.home.data.gets[1] = true; }, exp: 3 },
    ]
    chss.home.onScout = function (this: any) { scoutGeneric(this) }

    gameText.bssel = ['Ack! There\'s dust and cobweb everywhere in this place', 'Spiderweb lands on your face as you enter', 'Various broken garbage is littered around', 'You step on some glass shards and crush them']
    gameText.bsseldark = ['Ack! Something touches you from the darkness', 'You step in and something crunches underneath', 'You feel like something moved in front of you', 'You touched cobweb and felt gross']

// @ts-ignore: constructor function
    chss.bsmnthm1 = new Chs();
    chss.bsmnthm1.id = 158;
    addtosector(sector.home, chss.bsmnthm1);
    chss.bsmnthm1.effectors = [{ e: effector.dark }]
    chss.bsmnthm1.sl = () => {
      d_loc('Your Home, Basement'); global.lst_loc = 158;
      if (area.hmbsmnt.size > 0) {
        chs('Argh! This place is infested!', true, 'red');
        area_init(area.hmbsmnt);
      } else {
        if (!cansee()) chs(select(gameText.bsseldark) + '. You can\'t see anything in this darkness, it\'ll be better if you find a lightsource', true, 'darkgrey');
        else {
          chs(select(gameText.bssel), true);
          if (!flags.bsmntchck) chs('"Examine your surroundings"', false).addEventListener('click', () => {
            if (!cansee()) {
              chs('Your light went off..', true, 'darkgrey');
              chs('"<= Return"', false).addEventListener('click', () => {
                smove(chss.home, false);
              });
            } else {
              chs("You glance around and find mountains of broken crates, shelves, boxes, furniture and other decaying goods. Don't expect to find anything of great value amongst this trash. Perhaps you can salvage at least something if you look careful enough" + (!flags.bsmntchstgt ? ', like that giant chest over there' : ''), true, 'orange');
              if (!flags.bsmntchstgt) chs('"Seek significance of a massive container"', false).addEventListener('click', () => {
                chs("It looks like an ordinary coffer, except it's unusually big and has a padlock, which thankfully isn't locked. You get a brilliant idea to carry this hunk-a-junk upstairs", true);
                chs('"Do exactly that"', false, 'lime').addEventListener('click', () => {
                  flags.bsmntchstgt = true;
                  giveFurniture(furniture.strgbx);
                  smove(chss.home, false);
                  msg('Phew! That felt like a workout! You won\'t need to descend into that awful basement anymore if you wish to access the Big Box', 'orange');
                  msg('Your muscles feel stronger!', 'lime');
                  msg('STR increased by +1 permanently', 'lime');
                  you.sat *= .5;
                  you.stra++;
                  you.stat_r();
                });
              });
              if (!flags.bsmntsctgt) chs('"Rummage through rubble"', false).addEventListener('click', () => {
                chs("Indeed, simply glancing over the rubble won\'t reveal you any hidden secrets, you think you better investigate everything carefully", true);
                chs('"Prepare for further examination"', false).addEventListener('click', () => {
                  flags.bsmntsctgt = true;
                  giveAction(act.scout);
                  global.current_a.deactivate();
                  global.current_a = act.default;
                  smove(chss.bsmnthm1, false)
                });
              });
              chs('"<= Return"', false).addEventListener('click', () => {
                smove(chss.bsmnthm1, false);
              });
            }
          });
        }
      }
      chs('"<= Return"', false).addEventListener('click', () => {
        smove(chss.home, false);
      });
    }
    chss.bsmnthm1.data = { scoutm: 900, scout: 0, scoutf: false, gets: [false, false], gotmod: 0 }
    chss.bsmnthm1.scout = [
      { c: .01, f: () => { msg('You found a pouch with some coins!', 'lime'); giveItem(item.cp, rand(1, 5)); giveItem(item.cn, rand(1, 5)); giveItem(item.cq, rand(1, 5)); chss.bsmnthm1.data.gets[0] = true; }, exp: 40 },
      { c: .03, f: () => { msg('You found a pile of scattered firewood, some logs seem useful but others have rotted completely. You decide to grab them anyway'); giveItem(item.fwd1, rand(2, 4)); giveItem(item.wdc, rand(45, 90)); chss.bsmnthm1.data.gets[1] = true; }, exp: 10 },
      {
        c: .03, f: () => {
          chs('Among the rabble and remains of collapsed bookshelves you decide to confirm if anything survived. Rotten and soaked in basement juices books seems unsalvagable, bookshelves as well, you can\'t even tell if they are made of wood anymore. One of the books was incased into a small mound formed by rocks and sand, it seems surprisingly fine', true);
          chs('"<= I\'m taking this"', false).addEventListener('click', () => { chss.bsmnthm1.data.gets[2] = true; giveItem(item.jnlbk); deactivateAct(global.current_a); smove(chss.bsmnthm1, false) })
        }, exp: 15
      },
    ];
    chss.bsmnthm1.onScout = function (this: any) { scoutGeneric(this) }

// @ts-ignore: constructor function
    chss.hbed = new Chs();
    chss.hbed.id = 112;
    addtosector(sector.home, chss.hbed)
    chss.hbed.sl = () => {
      d_loc('Your Home, Bed'); global.lst_loc = 112; let extra = '';
      if (you.alive === false) { chs(select(['You lost consciousness...', 'You have been knocked out...', 'You passed out...']), true); you.alive = true }
      else { if (flags.catget) extra = select(['. Your cat is resting next to you', '. You feel warm']); chs('Great way to pass time' + extra, true); }
      chs('"<= Get up"', false).addEventListener('click', () => {
        for (let i in chss) if (chss[i].id === global.home_loc) smove(chss[i]);
      });
    }
    chss.hbed.onStay = function (this: any) {
      let hpr = (skl.sleep.use(home.bed) + (flags.catget ? 5 : 1) + 1) << 0;
      if (!effect.fei1.active && you.hp < you.hpmax) { you.hp + hpr <= you.hpmax ? you.hp += hpr : you.hp = you.hpmax; dom.d5_1_1.update() }
      // if(combat.current_z.id!==-666&&random()<.00001){
      //   let ta = new Area(); ta.id=-666;
      //   ta.name = 'Nightmare';
      //   ta.pop = [{crt:creature.ngtmr1,lvlmin:you.lvl,lvlmax:you.lvl,c:1}]; ta.protected=true;
      //   ta.onEnd=function(){area_init(area.nwh);flags.civil=true; flags.btl=false;}; flags.civil=false; flags.btl=true;
      //   ta.size = 1; z_bake(ta); area_init(ta); dom.d7m.update(); msg('Your sins are crawling up on you','red')
      //}
    }
    chss.hbed.onEnter = function (this: any) {
      flags.sleepmode = true;
      if (effect.slep.active === false) giveEff(you, effect.slep);
      global.timescale = 5;
    }
    chss.hbed.onLeave = function (this: any) {
      flags.sleepmode = false;
      global.timescale = 1;
      removeEff(effect.slep);
    }

// @ts-ignore: constructor function
    chss.ofrplc = new Chs();
    chss.ofrplc.id = 117;
    addtosector(sector.home, chss.ofrplc)
    chss.ofrplc.sl = () => {
      d_loc('Your Home, Fireplace'); let fire = findbyid(furn, furniture.frplc.id); global.lst_loc = 117;
      //dom.d_lctt.innerHTML+='<span style="color:orange;font-size:1.2em">&nbspⓞ<span>'
      let its = []
      if (findbyid(inv, item.fwd1.id)) its.push([findbyid(inv, item.fwd1.id), 'some firewood', 30])
      if (findbyid(inv, item.coal1.id)) its.push([findbyid(inv, item.coal1.id), 'some coal', 300])
      if (findbyid(inv, item.coal2.id)) its.push([findbyid(inv, item.coal2.id), 'some charcoal', 300])
      if (findbyid(inv, wpn.stk1.id)) its.push([findbyid(inv, wpn.stk1.id), 'a stick', 15])
      if (!gameText.fplcextra) gameText.fplcextra = ['You\'ll need fire if you want to get some cooking done', 'You can warm up here if you light it up'];
      if (!gameText.frplcfrextra) gameText.frplcfrextra = ["You notice the fire flickering slightly", "Tiny fire is warming up the room", "Comfy fire lights up the surroundings", "Bright flame is roaring inside the Fireplace"];
      let textra0;
      if (fire.data.fuel === 0) textra0 = '';
      else if (fire.data.fuel <= 60) textra0 = gameText.frplcfrextra[0]
      else if (fire.data.fuel >= 130 && fire.data.fuel <= 300) textra0 = gameText.frplcfrextra[1];
      else if (fire.data.fuel >= 300 && fire.data.fuel <= 540) textra0 = gameText.frplcfrextra[2];
      else if (fire.data.fuel >= 540) textra0 = gameText.frplcfrextra[3];
      dom.frpls = chs('Comfy fireplace. ' + (select(gameText.fplcextra) + '<br>' + textra0), true);
      if (!flags.fplcgtwd) chs('"Retrieve spare firewood. You have a feeling you\'ll need it"', false).addEventListener('click', function (this: any) {
        msg("You have some lying around nearby", 'orange');
        flags.fplcgtwd = true;
        giveItem(item.fwd1, 3);
        smove(chss.ofrplc, false);
      });
      for (let a in its) {
        chs('"' + (select(["Toss ", "Throw "])) + its[a][1] + ' into the fireplace"', false).addEventListener('click', function (this: any) {
          its[a][0].amount--;
          fire.data.fuel = fire.data.fuel + its[a][2] > its[a][2] ? its[a][2] : fire.data.fuel + its[a][2];
          if (fire.data.fuel <= its[a][2]) dom.frpls.innerHTML = gameText.frplcfrextra[0]
          else if (fire.data.fuel >= 130 && fire.data.fuel <= 300) dom.frpls.innerHTML = gameText.frplcfrextra[1];
          else if (fire.data.fuel >= 300 && fire.data.fuel <= 540) dom.frpls.innerHTML = gameText.frplcfrextra[2];
          else if (fire.data.fuel >= 540) dom.frpls.innerHTML = gameText.frplcfrextra[3];
          if (its[a][0].amount <= 0) { removeItem(its[a][0]); dom.ctr_2.removeChild(this) } else if (global.sm === 1) updateInv(inv.indexOf(its[a][0]));
          else if (global.sm === its[a][0]) updateInv(global.sinv.indexOf(its[a][0]));
        });
      };
      let afire = findbyid(furn, furniture.fwdpile.id);
      if (afire && afire.data.fuel > 0) {
        chs('"Light a fire"', false, 'orange').addEventListener('click', () => {
          if (effect.fplc.active) msg('Fire is already on', 'orange');
          else { afire.data.fuel--; fire.data.fuel += 16 }
        });
      }
      chs('"<= Step away"', false).addEventListener('click', () => {
        smove(chss.home, false);
      });
    }

// @ts-ignore: constructor function
    chss.sboxhm = new Chs();
    chss.sboxhm.id = 131;
    addtosector(sector.home, chss.sboxhm)
    chss.sboxhm.sl = () => {
      d_loc('Your Home, Storage Box');
      //  chs('"Your botomless storage container, full of your belongings"',true)
      chs_spec(3, home.trunk)
      chs('"<= Step Away"', false, '', '', undefined, undefined, undefined, true).addEventListener('click', () => {
        smove(chss.home, false);
      });
    }

    gameText.catasound = ['You are hearing weird sounds', 'Crunching sound echoes', 'Your feet sink into the muddy ground', 'You hear wailing',
      'Something growls in the distance', 'Damp stagnant air of the underground makes it difficult to breathe', 'You hear bones', 'You notice something move in the darkness',
      'You feel sinister aura', 'Aged walls have something written on them, but you are unable to decipher what it is', 'Bone bits are littered on the ground', 'Old rotting cloth is hanging from the walls', 'Something rusty sparkes from below', 'old stale air fills your lungs'];

// @ts-ignore: constructor function
    chss.catamn = new Chs();
    chss.catamn.id = 132;
    addtosector(sector.cata1, chss.catamn);
    chss.catamn.sl = () => {
      d_loc('Catacombs, The Entryway'); global.lst_loc = 132;
      chs('"You have entered the Catacombs"', true, 'lightgrey', 'black')
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata1);
      });
      chs('"<= Exit"', false).addEventListener('click', () => {
        smove(chss.lsmain1);
      });
    }

// @ts-ignore: constructor function
    chss.cata1 = new Chs();
    chss.cata1.id = 133;
    addtosector(sector.cata1, chss.cata1)
    chss.cata1.sl = () => {
      d_loc('Catacombs, The Casket Service'); global.lst_loc = 133;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata13);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata2);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.catamn);
      });
    }

// @ts-ignore: constructor function
    chss.cata2 = new Chs();
    chss.cata2.id = 134;
    addtosector(sector.cata1, chss.cata2)
    chss.cata2.sl = () => {
      d_loc('Catacombs, The Mourning Hall'); global.lst_loc = 134;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata1);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata3);
      });
    }

// @ts-ignore: constructor function
    chss.cata3 = new Chs();
    chss.cata3.id = 135;
    addtosector(sector.cata1, chss.cata3)
    chss.cata3.sl = () => {
      d_loc('Catacombs, The Last Breath'); global.lst_loc = 135;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata4);
      });
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata2);
      });
    }

// @ts-ignore: constructor function
    chss.cata4 = new Chs();
    chss.cata4.id = 136;
    addtosector(sector.cata1, chss.cata4)
    chss.cata4.sl = () => {
      d_loc('Catacombs, Tunnel of the Dead'); global.lst_loc = 136;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata5);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata3);
      });
    }

// @ts-ignore: constructor function
    chss.cata5 = new Chs();
    chss.cata5.id = 137;
    addtosector(sector.cata1, chss.cata5)
    chss.cata5.sl = () => {
      d_loc('Catacombs, Movement Below'); global.lst_loc = 137;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata6, false);
      });
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata12);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata4);
      });
    }

// @ts-ignore: constructor function
    chss.cata6 = new Chs();
    chss.cata6.id = 138;
    addtosector(sector.cata1, chss.cata6)
    chss.cata6.sl = () => {
      d_loc('Catacombs, The Web Corridor'); global.lst_loc = 138;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata7);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata5);
      });
    }

// @ts-ignore: constructor function
    chss.cata7 = new Chs();
    chss.cata7.id = 139;
    addtosector(sector.cata1, chss.cata7)
    chss.cata7.sl = () => {
      d_loc('Catacombs, Grievance'); global.lst_loc = 139;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata8);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata6);
      });
    }

// @ts-ignore: constructor function
    chss.cata8 = new Chs();
    chss.cata8.id = 140;
    addtosector(sector.cata1, chss.cata8)
    chss.cata8.sl = () => {
      d_loc('Catacombs, Forgotten Post'); global.lst_loc = 140;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata9);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata7);
      });
    }

// @ts-ignore: constructor function
    chss.cata9 = new Chs();
    chss.cata9.id = 141;
    addtosector(sector.cata1, chss.cata9)
    chss.cata9.sl = () => {
      d_loc('Catacombs, Withered Hand'); global.lst_loc = 141;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata8);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata10);
      });
    }

// @ts-ignore: constructor function
    chss.cata10 = new Chs();
    chss.cata10.id = 142;
    addtosector(sector.cata1, chss.cata10)
    chss.cata10.sl = () => {
      d_loc('Catacombs, The Rusted Arc'); global.lst_loc = 142;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata9);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata11);
      });
    }

// @ts-ignore: constructor function
    chss.cata11 = new Chs();
    chss.cata11.id = 143;
    addtosector(sector.cata1, chss.cata11)
    chss.cata11.sl = () => {
      d_loc('Catacombs, Old One\'s Destination'); global.lst_loc = 143;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata10);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata12);
      });
    }

// @ts-ignore: constructor function
    chss.cata12 = new Chs();
    chss.cata12.id = 144;
    addtosector(sector.cata1, chss.cata12)
    chss.cata12.sl = () => {
      d_loc('Catacombs, Thawing Candles'); global.lst_loc = 144;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata11);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata5);
      });
    }

// @ts-ignore: constructor function
    chss.cata13 = new Chs();
    chss.cata13.id = 145;
    addtosector(sector.cata1, chss.cata13)
    chss.cata13.sl = () => {
      d_loc('Catacombs, The Endless Echoes'); global.lst_loc = 145;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata14);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata1);
      });
    }

// @ts-ignore: constructor function
    chss.cata14 = new Chs();
    chss.cata14.id = 146;
    addtosector(sector.cata1, chss.cata14)
    chss.cata14.sl = () => {
      d_loc('Catacombs, The Dusty Underpass'); global.lst_loc = 146;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata15);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata13);
      });
    }

// @ts-ignore: constructor function
    chss.cata15 = new Chs();
    chss.cata15.id = 147;
    addtosector(sector.cata1, chss.cata15)
    chss.cata15.sl = () => {
      d_loc('Catacombs, Light\'s Corner'); global.lst_loc = 147;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata16);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata14);
      });
    }

// @ts-ignore: constructor function
    chss.cata16 = new Chs();
    chss.cata16.id = 148;
    addtosector(sector.cata1, chss.cata16)
    chss.cata16.sl = () => {
      d_loc('Catacombs, Son\'s Last Visit'); global.lst_loc = 148;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata17);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata15);
      });
    }

// @ts-ignore: constructor function
    chss.cata17 = new Chs();
    chss.cata17.id = 149;
    addtosector(sector.cata1, chss.cata17)
    chss.cata17.sl = () => {
      d_loc('Catacombs, The Stone Plate'); global.lst_loc = 149;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata18);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata16);
      });
    }

// @ts-ignore: constructor function
    chss.cata18 = new Chs();
    chss.cata18.id = 150;
    addtosector(sector.cata1, chss.cata18)
    chss.cata18.sl = () => {
      d_loc('Catacombs, Cracked Passageway'); global.lst_loc = 150;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata19);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata17);
      });
    }

// @ts-ignore: constructor function
    chss.cata19 = new Chs();
    chss.cata19.id = 151;
    addtosector(sector.cata1, chss.cata19)
    chss.cata19.sl = () => {
      d_loc('Catacombs, The Limited Leeway'); global.lst_loc = 151;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata20);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata18);
      });
    }

// @ts-ignore: constructor function
    chss.cata20 = new Chs();
    chss.cata20.id = 152;
    addtosector(sector.cata1, chss.cata20)
    chss.cata20.sl = () => {
      d_loc('Catacombs, The Brittle Turn'); global.lst_loc = 152;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata19);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata21);
      });
    }

// @ts-ignore: constructor function
    chss.cata21 = new Chs();
    chss.cata21.id = 153;
    addtosector(sector.cata1, chss.cata21)
    chss.cata21.sl = () => {
      d_loc('Catacombs, Bright Ray Above'); global.lst_loc = 153;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata20);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata22);
      });
    }

// @ts-ignore: constructor function
    chss.cata22 = new Chs();
    chss.cata22.id = 154;
    addtosector(sector.cata1, chss.cata22)
    chss.cata22.sl = () => {
      d_loc('Catacombs, Nowhere To Run'); global.lst_loc = 154;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata21);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata23);
      });
    }

// @ts-ignore: constructor function
    chss.cata23 = new Chs();
    chss.cata23.id = 155;
    addtosector(sector.cata1, chss.cata23)
    chss.cata23.sl = () => {
      d_loc('Catacombs, The Aging Room'); global.lst_loc = 155;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata22);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata24);
      });
    }

// @ts-ignore: constructor function
    chss.cata24 = new Chs();
    chss.cata24.id = 156;
    addtosector(sector.cata1, chss.cata24)
    chss.cata24.sl = () => {
      d_loc('Catacombs, Eleven Wisemen'); global.lst_loc = 156;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata23);
      });
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata25);
      });
    }

// @ts-ignore: constructor function
    chss.cata25 = new Chs();
    chss.cata25.id = 157;
    addtosector(sector.cata1, chss.cata25)
    chss.cata25.sl = () => {
      d_loc('Catacombs, The End Of Journey'); global.lst_loc = 157;
      chs(select(gameText.catasound), true, 'lightgrey', 'black');
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata24);
      });
    }


    function handStr() {
      return (5000 + (you.str * 800)) * (1 + you.lvl * .03) * (1 + skl.unc.lvl * .1 + skl.fgt.lvl * .08 + skl.tghs.lvl * .11) / 1000 << 0
    }

    // format3() imported from ./utils

    function d_loc(text: any) {
      let txt;
      if (flags.inside === true) txt = '|' + text + '|';
      else txt = text
      dom.d_lctt.innerHTML = txt;
      combat.current_l.locn = text;
    }

    // objempty() imported from ./utils

    function effAct_test() {
      for (let index in you.eff) you.eff[index].use(you, creature.bat);
    }

    // canRead — moved to game/utils-game.ts

    gameText.ssns = ['春', '夏', '秋', '冬'];

    // wdrseason — moved to systems/weather.ts
    // ontick — moved to systems/loop.ts

    (function update() {
      setTimeout(function (this: any) { update(); ontick(); }, 1000 / global.fps);
    })();

    // select() imported from ./utils

    function nograd(s: any) {
      if (s === true) {
        for (let i = 0; i < document.getElementsByClassName('d2').length; i++) (document.getElementsByClassName('d2')[i] as HTMLElement).style.background = '#0e574b';
        for (let i = 0; i < document.getElementsByClassName('d3').length; i++) (document.getElementsByClassName('d3')[i] as HTMLElement).style.background = '#0e574b';
        for (let i = 0; i < document.getElementsByClassName('hp').length; i++) (document.getElementsByClassName('hp')[i] as HTMLElement).style.background = '#91e6b6';
        for (let i = 0; i < document.getElementsByClassName('exp').length; i++) (document.getElementsByClassName('exp')[i] as HTMLElement).style.background = '#ea9c83';
        for (let i = 0; i < document.getElementsByClassName('en').length; i++) (document.getElementsByClassName('en')[i] as HTMLElement).style.background = '#4f3170';
        dom.inv_ctx.style.background = dom.inv_control_b.style.background = dom.ctrmg.style.background = '#00224e';
        dom.d7m_c.style.background = '#392c72';
        for (let i = 0; i < document.styleSheets[0].rules.length; i++) if ((document.styleSheets[0].rules[i] as any).selectorText == ".opt_c:hover, .ct_bts:hover, .chs:hover, .bts:hover, .bbts:hover, .bts_b:hover, .inv_slot:hover, .bts_m:hover") (document.styleSheets[0].rules[i] as any).style.background = '#0e574b';
        flags.grd_s = false;
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
        flags.grd_s = true;
      }
    }

    // col() imported from ./utils

    function getlastd() {
      switch (combat.atkdfty[0]) {
        case 1: return '<span style="color:black;background-color:yellow">Struck by lightning</span>';
          break;
        case 2: switch (combat.atkdfty[1]) {
          case 1: return '<span style="color:red;background-color:darkmagenta">Suffocated from poison</span>';
            break;
          case 2: return '<span style="color:darkmagenta;">Suffocated from venom</span>';
            break;
          case 3: return '<span style="color:red;background-color:darkred">Bled out</span>';
            break;
          case 4: return '<span style="color:white;background-color:black">Rotten from corruption</span>';
            break;
        }; break;
        case 3: let txt = '';
          let fc = ['', '', '']
          switch (combat.atkdftydt.a) {
            case 0: fc[0] = 'pink';
              break;
            case 1: fc[0] = 'lime';
              break;
            case 2: fc[0] = 'yellow';
              ;
              break;
            case 3: fc[0] = 'orange';
              fc[1] = 'crimson';
              break;
            case 4: fc[0] = 'cyan';
              break;
            case 5: fc[0] = 'lightgoldenrodyellow';
              fc[2] = 'gold 0px 0px 5px';
              break;
            case 6: fc[0] = 'thistle';
              fc[2] = 'blueviolet 0px 0px 5px';
              break;
          }
          switch (combat.atkdftydt.c) {
            case 0: txt += '<span style="color:' + fc[0] + ';background-color:' + fc[1] + ';text-shadow:' + fc[2] + '">' + select(['Slashed', 'Lacerated', 'Cut down', 'Hacked']) + '</span>';
              break;
            case 1: txt += '<span style="color:' + fc[0] + ';background-color:' + fc[1] + ';text-shadow:' + fc[2] + '">' + select(['Pierced', 'Impaled', 'Gored']) + '</span>';
              break;
            case 2: txt += '<span style="color:' + fc[0] + ';background-color:' + fc[1] + ';text-shadow:' + fc[2] + '">' + select(['Smashed', 'Crushed', 'Destroyed']) + '</span>';
              break;
          } txt += ' by ';
          for (let a in creature) if (creature[a].id === combat.atkdftydt.id) { txt += creature[a].name; break } return txt;
          break;
        default: return 'what casualty?';
          break;
      }
    }

    function draggable(root: any, target: any) {
      root.addEventListener('mousedown', function (this: any, x: any) { global.ctarget = target; this.boxoffsetx = x.clientX - parseInt(target.style.left); this.boxoffsety = x.clientY - parseInt(target.style.top); global.croot = root; document.body.addEventListener('mousemove', draggablemove) });
      root.addEventListener('mouseup', function (x: any) { global.ctarget = null; global.croot = null; document.body.removeEventListener('mousemove', draggablemove) });
    }

    function draggablemove(x: any) {
      if (global.ctarget) { global.ctarget.style.left = x.clientX - global.croot.boxoffsetx; global.ctarget.style.top = x.clientY - global.croot.boxoffsety }
    }

    function _dbgman() { let g = 0; for (let a in chss) if (chss[a].id > g) g = chss[a].id; return g; }
    function _dbgitc() { let g = 0; for (let a in item) g++; for (let a in acc) g++; for (let a in sld) g++; for (let a in eqp) g++; for (let a in wpn) g++; return g; }
    function _dbgspawn(arr: any, times: any) {
      let result: any[] = [];
      for (let g = 0; g < times; g++) {
        for (let a in arr) {
          let t = 0;
          if (random() < arr[a].chance + (arr[a].chance / 100 * you.luck)) {
            for (let b in result) {
              if (result[b].item.id === arr[a].item.id) { result[b].am++; break }
              if (++t === result.length) result.push({ item: arr[a].item, am: 1 });
            }
            if (result.length === 0) result.push({ item: arr[a].item, am: 1 });
          }
        }
      }
      console.log('Spawn from the drop array ' + times + ' times\n::RESULT::');
      for (let a in result) console.log(result[a].item.name + ': x' + result[a].am)
      console.log('::END::')
    }

    function _dbggibberish(w: any, l: any) {
      let a = new String();
      for (let b = 0; b < w; b++) {
        let lr = rand(1, l);
        for (let c = 0; c < lr; c++) {
          a += String.fromCharCode(rand(40960, 42124));
        } a += ' ';
      } return a;
    }

    function giveall(what: any) {
      /*switch(what){
        case item: for(let a in item) giveItem(item[a]);
        break;
        case wpn: for(let a in wpn) giveItem(wpn[a]);
        break;
        case eqp: for(let a in eqp) giveItem(eqp[a]);
        break;
        case acc: for(let a in acc) giveItem(acc[a]);
        break;
        case ttl: for(let a in ttl) giveTitle(ttl[a]);
        break;
        case rcp: for(let a in rcp) giveRcp(rcp[a]);
        break;
      }*/
    }

    // scan, scanbyid, scanbyuid, find, findbyid imported from ./utils
    // findbest, findworst imported from ./utils

    function addPlan(plan: any, data?: any) {
      let p = deepCopy(plan);
      if (data) p.data = data;
      plans[plan.id].push(p);
    }

    /////plans/////
    function Plan(this: any) {
      this.id = 0;
      this.f = function (this: any) { };
      this.data = {};
      this.destroy = function (this: any) { plans.splice(plans.indexOf(this), 1) }
    }

// @ts-ignore: constructor function
    planner.test = new Plan();
    planner.test.id = 1;
    planner.test.data = { date: 42 };
    planner.test.f = function (this: any) {
      if (time.minute >= this.data.date) {
        msg('done');
        this.destroy();
      }
    }

// @ts-ignore: constructor function
    planner.chkrot = new Plan();
    planner.chkrot.id = 1;
    planner.chkrot.data = { items: [] };
    planner.chkrot.f = function (this: any) {
      for (let a in planner.chkrot.data.items) {
        let itm = planner.chkrot.data.items[a];
        let wmod = 1;
        if (getSeason() === 2) wmod = 0.5;
        else if (getSeason() === 4) wmod = 2.5;
        itm.data.rottil += randf(itm.rot[0] / wmod, itm.rot[1] / wmod);
        if (itm.data.rottil >= 1) {
          let am = (itm.amount * randf(itm.rot[2], itm.rot[3]) + 1) << 0;
          itm.data.rottil--;
          itm.amount -= am;
          if (itm.stype === global.sm) updateInv(global.sinv.indexOf(itm));
          else if (global.sm === 1) updateInv(inv.indexOf(itm));
          if (itm.amount <= 0) { planner.chkrot.data.items.splice(planner.chkrot.data.items.indexOf(itm)); removeItem(itm) }
          msg('Your <span style="color:cyan">x' + am + '</span> <span style="color: orange">' + itm.name + '</span> ' + select(['rotted away', 'went bad', 'spoiled']) + '!', 'yellow', null, null, 'green')
          if (itm.onChange) itm.onChange(am)
        }
      }
    };

// @ts-ignore: constructor function
    planner.imorph = new Plan();
    planner.imorph.id = 1;
    planner.imorph.data = { items: [] };
    planner.imorph.f = function (this: any) {
      for (let a in planner.imorph.data.items) {
        planner.imorph.data.items[a].alttype = planner.imorph.data.items[a].alttype || 1;
        switch (planner.imorph.data.items[a].alttype) {
          case 1:
            let itm = planner.imorph.data.items[a];
            let wmod = 1;
            switch (getSeason()) { case 2: wmod = 0.5; break; case 4: wmod = 2.5; break };
            itm.data.rottil += randf(itm.rot[0] / wmod, itm.rot[1] / wmod);
            if (itm.data.rottil >= 1) {
              let am = (itm.amount * randf(itm.rot[2], itm.rot[3]) + 1) << 0;
              itm.data.rottil--;
              reduce(itm, am);
              if (itm.amount <= 0) planner.imorph.data.items.splice(planner.imorph.data.items.indexOf(itm));
              msg('Your <span style="color:cyan">x' + am + '</span> <span style="color: orange">' + itm.name + '</span> ' + select(['rotted away', 'went bad', 'spoiled']) + '!', 'yellow', null, null, 'green')
              if (itm.onChange) itm.onChange(am)
            } break;
        }
      }
    }; addPlan(planner.imorph)

// @ts-ignore: constructor function
    planner.cchk = new Plan();
    planner.cchk.id = 1;
    planner.cchk.f = function (this: any) {
      for (let a in container.home_strg.c) {
        if (container.home_strg.c[a].item.rot) {
          let itm = container.home_strg.c[a].item;
          let data = container.home_strg.c[a].data;
          let wmod = 1;
          switch (getSeason()) { case 2: wmod = 0.25; break; case 4: wmod = 1.25; break };
          data.rottil += randf(itm.rot[0] / wmod, itm.rot[1] / wmod);
          if (data.rottil >= 1) {
            let am = (itm.amount * randf(itm.rot[2], itm.rot[3]) + 1) << 0;
            data.rottil--;
            container.home_strg.c[a].am -= am;
            if (container.home_strg.c[a].am <= 0) removeFromContainer(container.home_strg, container.home_strg.c[a]);
            if (itm.onChange) {
              let nitm = itm.onChange(am, true);
              let citm: any = false;
              for (let b in container.home_strg.c) if (container.home_strg.c[b].item.id === nitm[0].id) { citm = container.home_strg.c[b]; break }
              if (citm) citm.am += nitm[1];
              else addToContainer(container.home_strg, nitm[0], nitm[1]);
            } iftrunkopenc();
          }
        }
      }
    }; addPlan(planner.cchk)

// @ts-ignore: constructor function
    planner.itmwear = new Plan();
    planner.itmwear.data = { items: [] };
    planner.itmwear.f = function (this: any) {
      for (let a in planner.itmwear.data.items) {
        let itm = planner.itmwear.data.items[a];
        if (itm.dp - itm.degrade < 0) itm.dp = 0;
        else itm.dp -= itm.degrade;
        if (itm.dp <= 0) {
          itm.onDegrade(you);
          planner.itmwear.data.items.splice(planner.itmwear.data.items.indexOf(itm));
          removeItem(itm);
        }
      }
    }; addPlan(planner.itmwear)

// @ts-ignore: constructor function
    planner.djfood = new Plan();
    planner.djfood.id = 1;
    planner.djfood.f = function (this: any) {
      if (getDay(1) === "Sunday") flags.djmlet = true;
    }; addPlan(planner.djfood)

// @ts-ignore: constructor function
    planner.areafillw = new Plan();
    planner.areafillw.id = 2;
    planner.areafillw.f = function (this: any) {
      area.hmbsmnt.size += rand(5, 15);
    }; addPlan(planner.areafillw)

// @ts-ignore: constructor function
    planner.zrespawn = new Plan();
    planner.zrespawn.id = 1;
    planner.zrespawn.f = function (this: any) {
      if (random() <= .03 && flags.catget) {
        let things = [{ t: item.dmice1, c: .25 }, { t: item.dbdc1, c: .25 }, { t: item.d6, c: .05 }, { t: item.mcps, c: .2 }, { t: item.pcn, c: .2 }, { t: item.cp, c: .4 }]
        for (let a in things) if (random() <= things[a].c) sector.home.data.ctlt.push(things[a].t.id)
      }
    }; addPlan(planner.zrespawn)

    // addElement, deepCopy, copy imported from ./utils and ./dom-utils
    // empty() imported from ./dom-utils

    test.maps = {};
    test.maps.cellsize = 20;
    test.maps.mapdata = [];
    test.maps.mapdata[0] = {}
    test.maps.mapdata[0].data =
      [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [1, 1, 0, 2, 3, 1, 1, 3, 2, 0, 1],
      [1, 2, 3, 1, 0, 1, 1, 0, 0, 0, 1],
      [1, 1, 0, 1, 0, 1, 1, 1, 2, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 3, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1]];
    test.maps.mapdata[0].c = ['white', 'grey', 'red', 'ghostwhite'];
    test.maps.mapdata[0].d = ['corridor', 'wall', 'secret', 'secret enter'];

    function _drawmap(mapdata: any) {
      if (test.maps.gui) {
        empty(test.maps.gui);
        document.body.removeChild(test.maps.gui);
        delete test.maps.gui
        empty(test.maps.guioverlay);
        document.body.removeChild(test.maps.guioverlay);
        delete test.maps.guioverlay
      }
      let size = test.maps.cellsize;
      test.maps.gui = addElement(document.body, 'canvas');
      test.maps.gui.style.position = 'absolute';
      test.maps.gui.style.top = 0;
      test.maps.gui.style.left = 0;
      test.maps.guit = test.maps.gui.getContext('2d');
      test.maps.guioverlay = addElement(document.body, 'canvas');
      test.maps.guioverlay.style.position = 'absolute';
      test.maps.guioverlay.width = window.innerWidth;
      test.maps.guioverlay.height = window.innerHeight;
      test.maps.guioverlay.style.pointerEvents = 'none';
      test.maps.guioverlay.style.top = 0;
      test.maps.guioverlay.style.left = 0
      draggable(test.maps.gui, test.maps.gui);
      let canvas = test.maps.gui;
      let tmain = test.maps.guit;
      let tmaino = test.maps.guioverlay.getContext('2d');
      canvas.height = mapdata.data.length * size;
      canvas.width = mapdata.data[0].length * size;
      for (let y in mapdata.data) {
        for (let x in mapdata.data[y]) {
          tmain.fillStyle = mapdata.c[mapdata.data[y][x]];
          tmain.fillRect((x as any) * size, (y as any) * size, size, size);
        }
      }
      // mapdata.guicache = tmain.getImageData(0,0,canvas.width,canvas.height);
      test.maps.gui.addEventListener('mousemove', (xy: any) => {
        //tmain.clearRect(0,0,canvas.height,canvas.width)
        tmaino.clearRect(0, 0, test.maps.guioverlay.height, test.maps.guioverlay.width)
        //tmain.putImageData(mapdata.guicache,0,0)
        let l = parseInt(test.maps.gui.style.left);
        let t = parseInt(test.maps.gui.style.top);
        let cx = xy.clientX - parseInt(test.maps.gui.style.left);
        let cy = xy.clientY - parseInt(test.maps.gui.style.top);
        tmaino.strokeStyle = 'lime';
        tmaino.strokeRect(l + (cx / size << 0) * size, t + (cy / size << 0) * size, size, size);
        tmaino.strokeStyle = 'red';
        tmaino.beginPath();
        tmaino.moveTo(cx + 20 + l, cy + 20 + t);
        tmaino.lineTo(cx + 35 + l, cy + 30 + t);
        tmaino.lineTo(cx + 90 + l, cy + 30 + t);
        tmaino.stroke();
        tmaino.closePath();
        tmaino.font = 'italic  bold .6em "MS Gothic"';
        tmaino.fillStyle = 'crimson';
        tmaino.fillText('X:' + ((cx / size << 0) + 1) + ' Y:' + ((cy / size << 0) + 1), cx + 40 + l, cy + 45 + t);
        tmaino.fillText(mapdata.d[mapdata.data[cy / size << 0][cx / size << 0]], cx + 40 + l, cy + 25 + t);
      })
      test.maps.gui.addEventListener('mouseleave', () => {
        tmaino.clearRect(0, 0, test.maps.guioverlay.height, test.maps.guioverlay.width)
      })
    }

    /*pts=[];
    wind = -2;
    canvas = addElement(document.body,'canvas');
    canvas.style.position='absolute';
    canvas.style.top=canvas.style.left=0;
    canvas.style.pointerEvents='none'
    tmain = canvas.getContext('2d');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    tmain.globalCompositeOperation='destination-over';
    tmain.fillStyle='white';
    tmain.font='20px MS Gothic';
    drawsnow = setInterval(()=>{ //tmain.clearRect(0,0,window.innerWidth,window.innerHeight); 
      for(let a in pts){ 
        let p = pts[a];
        p.windtimedest>p.windtime?p.windtime++:p.windtime--;
        if(p.windtime===p.windtimedest) {p.windtimedest=rand(550); p.windold=p.wind; p.wind = random()*wind}
        p.y+=.5;
        p.x+=(p.wind-p.windold)*(Math.min(p.windtimedest/Math.max(p.windtimedest,p.windtime)))
        tmain.fillText(p.c,p.x,p.y); 
        if(p.y>=window.innerHeight) pts.splice(pts[a],1);
      }
      if(random()<.1){pts.push({x:rand(window.innerWidth*1.5+10),y:0,wind:.1,windtimedest:1,switch:true,windold:.1,windded:0,windtime:0,c:select(['*',"'",'.','。'])})}
    },10)*/

    function _drawmwindow() {
      if (test.mguic) {
        empty(test.mguic);
        document.body.removeChild(test.mguic);
        delete test.mguic;
      }
      test.mguic = addElement(document.body, 'div');
      test.mguic.style.height = 500;
      test.mguic.style.width = 500;
      test.mguic.style.padding = 2;
      test.mguic.style.position = 'absolute';
      test.mguic.style.top = 100;
      test.mguic.style.left = 100;
      test.mguic.style.border = '2px solid black';
      test.mguic.style.backgroundColor = '#558';
      test.mguid = addElement(test.mguic, 'div');
      test.mguid.style.height = 20;
      test.mguid.style.borderBottom = '2px solid rgb(0,40,64)'
      test.mguid.innerHTML = "M A S T E R I E S";
      test.mguid.style.color = 'lime';
      test.mguid.style.textAlign = 'center'
      test.mguidk = addElement(test.mguid, 'div');
      test.mguidk.innerHTML = '✖';
      test.mguidk.style.float = 'right';
      test.mguidk.style.color = 'black'
      test.mguidk.style.backgroundColor = 'crimson';
      test.mguidk.addEventListener('click', function (this: any) { empty(test.mguic); document.body.removeChild(test.mguic); delete test.mguic });
      test.mgui = addElement(test.mguic, 'canvas');
      test.mgui.offsetx = 0;
      test.mgui.offsety = 0;
      draggable(test.mguid, test.mguic);
      let canvas = test.mgui;
      let tmain = test.mgui.getContext("2d");
      canvas.height = 478;
      canvas.width = 500;
      let HEIGHT = canvas.height;
      let WIDTH = canvas.width;
      let _gr = tmain.createLinearGradient(200, 200, 200, 500);
      _gr.addColorStop(0, "#000");
      _gr.addColorStop(1, "#123")
      tmain.fillStyle = _gr;
      tmain.fillRect(0, 0, WIDTH, HEIGHT);
      tmain.c = canvas;
      tmain._bg = tmain.getImageData(0, 0, WIDTH, HEIGHT);
      _renderm(tmain)
      test.mgui.addEventListener('mousemove', (xy: any) => {
        for (let a in mastery) {
          let m = mastery[a];
          if (xy.offsetX > m.x - 3 && xy.offsetX < m.x + 53 && xy.offsetY > m.y - 3 && xy.offsetY < m.y + 53) {
            if (test.mgui.selected && test.mgui.selected.id === m.id) {
              global.dscr.style.top = global.dscr.clientHeight + 60 + xy.clientY > document.body.clientHeight ? (xy.clientY + 30 + global.dscr.clientHeight) - ((xy.clientY + 30 + global.dscr.clientHeight) - document.body.clientHeight) - global.dscr.clientHeight - 30 : xy.clientY + 30;
              global.dscr.style.left = global.dscr.clientWidth + 60 + xy.clientX > document.body.clientWidth ? (xy.clientX + 30 + global.dscr.clientWidth) - ((xy.clientX + 30 + global.dscr.clientWidth) - document.body.clientWidth) - global.dscr.clientWidth - 30 : xy.clientX + 30;
              return
            }
            test.mgui.selected = m;
            _renderm(tmain);
            if (!m.hidden && (m.dscv || m.have)) dscr(xy, null, 12, !m.have ? '????????' : m.name, !m.have ? m.condd : m.desc);
            return
          }
        } if (test.mgui.selected) {
          test.mgui.selected = null;
          empty(global.dscr);
          global.dscr.style.display = 'none';
          _renderm(tmain);
        }
      })
      test.mgui.addEventListener('click', (xy: any) => {
        if (test.mgui.selected && test.mgui.selected.data.lvl < test.mgui.selected.limit && test.mgui.selected.have) { test.mgui.selected.data.lvl++; test.mgui.selected.onlevel(you); you.stat_r(); dom.d5_1_1m.update(); dom.d5_3_1.update(); global.dscr.children[1].innerHTML = test.mgui.selected.desc(); _renderm(tmain, true); }
      })
    }

    function _renderm(tmain: any, forced?: any) {
      tmain.clearRect(0, 0, tmain.c.width, tmain.c.height);
      tmain.putImageData(tmain._bg, 0, 0)
      let ofx = test.mgui.offsetx;
      let ofy = test.mgui.offsety;
      for (let a in mastery) {
        let m = mastery[a]; if (mastery[a].have) {
          if (m.linkto) for (let b in m.linkto) {
            if (m.data.lvl <= 0 || (m.linkto[b].hidden && !m.linkto[b].have)) break;
            let p = m.linkto[b];
            tmain.beginPath();
            tmain.moveTo(m.x + 25, m.y + 25);
            tmain.lineTo(p.x + 25, p.y + 25);
            if (p.have) { tmain.lineWidth = 6; tmain.strokeStyle = '#a44'; tmain.stroke(); tmain.lineWidth = 2; tmain.strokeStyle = '#ff0'; tmain.stroke(); }
            else { tmain.lineWidth = 6; tmain.strokeStyle = '#444'; tmain.stroke(); tmain.lineWidth = 1; tmain.strokeStyle = '#ccc'; tmain.stroke(); }
            tmain.closePath();
          }
        }
        if (m.linkfrom && (!m.hidden)) {
          let t = m.linkfrom.length; for (let c in m.linkfrom) {
            let p = m.linkfrom[c];
            if (p.data.lvl > 0) t--;
          } if (t === 0) m.have = true; else if (t !== m.linkfrom.length) {
            m.dscv = true;
            tmain.fillStyle = '#555';
            tmain.fillRect(m.x + ofx - 2, m.y + ofy - 2, 54, 54);
            tmain.fillStyle = 'grey'
            tmain.fillRect(m.x + ofx, m.y + ofy, 50, 50);
            tmain.fillStyle = '#333';
            tmain.font = ' 1.2em "MS Gothic"'
            tmain.fillText('???', m.x + ofx + 9, m.y + ofy + 33)
          }
        }
        if (m.have) {
          tmain.fillStyle = test.mgui.selected && m.id === test.mgui.selected.id ? 'lime' : 'red';
          tmain.fillRect(m.x + ofx - 2, m.y + ofy - 2, 54, 54);
          tmain.fillStyle = 'rgba(0,0,0,.5)'
          tmain.fillRect(m.x + ofx, m.y + ofy + 54, 50, 9);
          tmain.font = ' .6em "MS PGothic"';
          tmain.fillStyle = m.data.lvl === 0 ? 'crimson' : (m.data.lvl === m.limit ? 'lime' : 'yellow');
          tmain.fillText(m.data.lvl + '/' + m.limit, m.x + ofx + 1, m.y + ofy + 62)
          if (m.icon) {
            let data = global._preic2_tmain.getImageData((m.icon[0] - 1) * 50, (m.icon[1] - 1) * 50, 50, 50);
            tmain.putImageData(data, m.x, m.y);
          }
        }
      }
    }


    // rand, randf, _rand imported from ./random


    // MersenneTwister, random, xmur3 imported from ./random

    // Base64, utf8_to_b64, b64_to_utf8 imported from ./base64

