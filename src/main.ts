
import { YEAR, MONTH, WEEK, DAY, HOUR, SILVER, GOLD } from './constants';
import { Base64, utf8_to_b64, b64_to_utf8 } from './base64';
import { random, rand, randf, _rand, xmur3 } from './random';
import { select, shuffle, deepCopy, copy, objempty, format3, col, scan, scanbyid, scanbyuid, find, findbyid, findbest, findworst } from './utils';
import { addElement, empty, appear, fade, draggable } from './dom-utils';
import { dom, global, settings, listen, w_manager, offline, callback, effector,
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
import { updateStatDisplay, updateCombatDisplay, updateMonsterDisplay, updateWealthDisplay } from './ui/stats';
import { giveEff, removeEff } from './ui/effects';
import { equip, unequip, resetEquipDisplay } from './ui/equipment';
import { renderItem, updateInv, isort, rsort, invbtsrst, rstcrtthg, reduce } from './ui/inventory';
import { chs, choiceNav, choiceAction, clr_chs, icon, Chs, activatef, deactivatef } from './ui/choices';
import { renderRcp, refreshRcp, renderSkl, renderAct, refreshAct, activateAct, deactivateAct, renderFurniture, showFurniturePanel } from './ui/panels';
import { recshop, rendershopitem, coinAnimation } from './ui/shop';
import { initSettingsPanel } from './ui/settings';
import { formatw, cansee, kill, roll } from './game/utils-game';
import { giveExp, giveSkExp, giveCrExp, giveTitle, giveRcp, lvlup, giveAction } from './game/progression';
import { giveWealth, spend, restock } from './game/economy';
import { giveItem, removeItem, listen_k, updateTrunkLeftItem, iftrunkopen, iftrunkopenc, addToContainer, dropC, wearing, wearingany, giveFurniture, rendertrunkitem, removeFromContainer } from './game/inventory';
import { fght, attack, tattack, dmg_calc, dumb, hit_calc, wpndiestt } from './game/combat';
import { Effector, smove, inSector, area_init, addtosector, activateEffectors, deactivateEffectors, runEffectors } from './game/movement';
import { canMake, make } from './game/crafting';
import { canScout, scoutGeneric, disassembleGeneric } from './game/exploration';
import { initDojoLocations } from './locations/dojo';
import { initForestLocations } from './locations/forest';
import { initVillageLocations } from './locations/village';
import { initSpecialLocations } from './locations/special';
import { initHomeLocations } from './locations/home';
import { initCatacombsLocations } from './locations/catacombs';
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
import { on } from './events';

// Mark as ES module (prevents esbuild CommonJS shim overhead)
export {};

// Firefox detection global
declare var InstallTrigger: any;

    // ==========================================================================
    // Event subscriptions — UI reacts to game logic events
    // ==========================================================================
    // economy
    on('wealth:changed', () => updateWealthDisplay());
    on('wealth:gained', (val: number) => {
      msg('+', 'gold');
      if (val >= GOLD) msg_add(' ●' + ((val / GOLD) << 0), 'rgb(255, 215, 0)');
      if (val >= SILVER && val % GOLD >= SILVER) msg_add(' ●' + ((val / SILVER % SILVER) << 0), 'rgb(192, 192, 192)');
      if (val < SILVER || (val > SILVER && val % SILVER > 0)) msg_add(' ●' + ((val % SILVER) << 0), 'rgb(255, 116, 63)');
    });
    on('achievement:unlocked', (_id: string) => appear(dom.mn_1));
    on('shop:refresh', () => recshop());
    // progression
    on('msg', (text: string, color?: string, ref?: any, type?: number) => msg(text, color, ref, type));
    on('msg:add', (text: string, color?: string) => msg_add(text, color));
    on('stat:update', () => dom.d3.update());
    on('exp:update', () => dom.d5_2_1.update());
    on('combat:update', () => updateCombatDisplay());
    on('tab:unlock', (label: string) => {
      if (label === 'skills') dom.ct_bt2.innerHTML = label;
      else if (label === 'assemble') dom.ct_bt1.innerHTML = label;
      else if (label === 'actions') dom.ct_bt3.innerHTML = label;
    });
    on('recipe:sort', () => rsort(settings.recipeSortMode));
    on('actions:refresh', () => { if (dom.acccon) { empty(dom.acccon); for (let a in acts) renderAct(acts[a]) } });
    // player
    on('hp:update', () => dom.d5_1_1.update());
    on('hit:reset', () => dom.hit_c());
    on('monster:update', () => dom.d7m.update());
    on('stats:recalc', () => { dom.d6.update(); updateStatDisplay(); });
    // loop
    on('time:update', (html: string) => { dom.d_time.innerHTML = html });
    on('moon:update', (lunar: string[]) => { empty(dom.d_moon); dom.d_moon.innerHTML = lunar[0]; addDesc(dom.d_moon, null, 2, 'Lunar Phase', lunar[1]) });
    on('moon:visibility', (visible: boolean) => { dom.d_moon.style.display = visible ? '' : 'none' });
    on('satiation:update', () => dom.d5_3_1.update());

    // ==========================================================================
    // Bootstrap
    // ==========================================================================
    window.addEventListener('load', () => { load() });

    // giveQst, finishQst — moved to game/quests.ts

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
        function (x: any) { if (ttl.kill1.have === false) { if (stats.allKills >= 10000) { giveTitle(ttl.kill1) } } },
        function (x: any) { if (ttl.kill2.have === false) { if (stats.allKills >= 50000) { giveTitle(ttl.kill2) } } },
        function (x: any) { if (ttl.kill3.have === false) { if (stats.allKills >= 200000) { giveTitle(ttl.kill3) } } },
        function (x: any) { if (ttl.kill4.have === false) { if (stats.allKills >= 1000000) { giveTitle(ttl.kill4) } } },
        function (x: any) { if (ttl.kill5.have === false) { if (stats.allKills >= 5000000) { giveTitle(ttl.kill5) } } },
      ]
    ];
    global.monchk = [
      function (x: any) { if (ttl.mone1.have === false) { if (stats.moneyGained >= GOLD) { giveTitle(ttl.mone1) } } },
    ];
    global.ttlschk = [
      function (x: any) { if (ttl.ttsttl1.have === false) { if (global.titles.length >= 10) { giveTitle(ttl.ttsttl1) } } },
      function (x: any) { if (ttl.ttsttl2.have === false) { if (global.titles.length >= 25) { giveTitle(ttl.ttsttl2) } } },
      function (x: any) { if (ttl.ttsttl3.have === false) { if (global.titles.length >= 50) { giveTitle(ttl.ttsttl3) } } },
    ];

    global.shptchk = [
      function (x: any) { if (ttl.shpt1.have === false) { if (stats.buyTotal >= 500) { giveTitle(ttl.shpt1) } } },
    ];
    global.cptchk = [
      function (x: any) { if (ttl.cpet1.have === false) { if (stats.catCount >= 9999) { giveTitle(ttl.cpet1) } } },
    ];
    global.htrchl = [
      function (x: any) { if (ttl.hstr1.have === false) { if (x >= 100) { giveTitle(ttl.hstr1) } } },
      function (x: any) { if (ttl.hstr2.have === false) { if (x >= 250) { giveTitle(ttl.hstr2) } } },
      function (x: any) { if (ttl.hstr3.have === false) { if (x >= 500) { giveTitle(ttl.hstr3) } } },
    ];
    global.nethmchk = [
      function (x: any) { if (ttl.neet.have === false) { if (stats.atHomeCounter >= YEAR) { giveTitle(ttl.neet) } } },
      function (x: any) { if (ttl.neet2.have === false) { if (stats.atHomeCounter >= YEAR * 5) { giveTitle(ttl.neet2) } } },
      function (x: any) { if (ttl.neet3.have === false) { if (stats.atHomeCounter >= YEAR * 10) { giveTitle(ttl.neet3) } } },
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
    addDesc(dom.d5_1, null, 2, 'Health', function (this: any) { return ('Physical health points, needed to stay alive. You will probably die if it reaches 0<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.statPotential[0] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d5_2, null, 2, 'Experience', function (this: any) { return ('Physical and combat experience. You\'ll have to work hard to achieve new heights<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>EXP Gain Potential: <span style="color:gold">' + (you.exp_t * 100 << 0) + '%</span><br>Current EXP Gain: <span style="color:yellow">' + (you.exp_t * 100 * you.efficiency() << 0) + '%</span></small>') }, true);
    addDesc(dom.d5_3, null, 2, 'Energy meter', function (this: any) {
      let lose = you.mods.satiationDrainRate;
      if (flags.iswet === true) lose *= (3 / (1 + (skl.abw.lvl * .03)))
      if (flags.iscold === true) lose += effect.cold.duration / 1000 / (1 + skl.coldr.lvl * .05);
      lose = (lose * 100 << 0) / 100
      return ('Influences the effectiveness of your actions, eat a lot to keep it full<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Energy Effectiveness: <span style="color:deeppink">' + ((you.mods.satiationBonus + 1) * 100 << 0) + '%</span><br>Energy Consumption Rate: <span style="color:gold">' + lose + '/s</span></small>')
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
    addDesc(dom.d4_1, null, 2, 'Physical Strength', function (this: any) { return ('Determines physical damage dealt and received<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.statPotential[1] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d4_2, null, 2, 'Agility', function (this: any) { return ('Determines hit/dodge rate<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.statPotential[2] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d4_3, null, 2, 'Mental acuity', function (this: any) { return ('Determines magic damage dealt and received<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.statPotential[3] * 100 << 0) + '%</span></small>') }, true);
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
    dom.d8_2.innerHTML = 'Critical chance: ' + ((you.mods.critChanceFlat + you.critChance) * 100) + '%';
    [dom.d7_slot_3, dom.d7_slot_4, dom.d7_slot_5, dom.d7_slot_6, dom.d7_slot_7].forEach((el: any, i: number) => {
      let eqpIdx = i + 2;
      el.addEventListener('mouseenter', function (this: any) { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[eqpIdx].str * (you.eqp[eqpIdx].dp / you.eqp[eqpIdx].dpmax) + you.str_base + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
      el.addEventListener('mouseleave', function (this: any) { this.innerHTML = global._tad; });
    });
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
    addDesc(dom._d23m, null, 3, combat.currentMonster.name, combat.currentMonster.desc);
    dom.d2m = addElement(dom._d23m, 'div', null, 'd2');
    dom.d3m = addElement(dom._d23m, 'div', null, 'd3m');
    dom.d5_1m = addElement(dom.d1m, 'div', null, 'hp');
    dom.d5_2m = addElement(dom.d1m, 'div', null, 'exp');
    dom.d5_1_1m = addElement(dom.d5_1m, 'div', 'hpp');
    dom.d5_2_1m = addElement(dom.d5_2m, 'div');
    dom.d5_1_1m.update = function (this: any) {
      this.innerHTML = 'hp: ' + format3(combat.currentMonster.hp.toString()) + '/' + format3(combat.currentMonster.hpmax.toString());
      dom.d5_1m.style.width = 100 * combat.currentMonster.hp / combat.currentMonster.hpmax + '%';
    }
    dom.d4m = addElement(dom.d1m, 'div', 'd4');
    dom.d4_1m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d4_2m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d4_3m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d4_4m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d9m = addElement(dom.d1m, 'div');
    dom.d9m.update = function (this: any) { this.innerHTML = 'rank: ' + gameText.eranks[combat.currentMonster.rnk]; if (combat.currentMonster.rnk <= 4) this.style.color = 'lightgrey'; else if (combat.currentMonster.rnk > 4 && combat.currentMonster.rnk <= 7) this.style.color = 'white'; else if (combat.currentMonster.rnk > 7 && combat.currentMonster.rnk <= 10) this.style.color = 'lightblue'; else if (combat.currentMonster.rnk > 10 && combat.currentMonster.rnk <= 13) this.style.color = 'lightgreen'; else if (combat.currentMonster.rnk > 13 && combat.currentMonster.rnk <= 16) this.style.color = 'lime'; else if (combat.currentMonster.rnk > 16 && combat.currentMonster.rnk <= 19) this.style.color = 'yellow' }
    dom.d9m.style.borderBottom = '#545299 dotted 2px';
    dom.d9m.style.backgroundColor = '#272744';
    dom.d8m_c = addElement(dom.d1m, 'small', 'bbts');
    dom.d8m1 = addElement(dom.d8m_c, 'div', null, 'bbts');
    dom.d8m1.innerHTML = 'Pause next battle: <span style=\'color:green\'>&nbspOFF';
    dom.d8m1.addEventListener('click', function (this: any) {
      if (flags.pauseNextBattle === true) { if (!flags.civil) flags.btl = true; flags.pauseNextBattle = false; this.innerHTML = 'Pause next battle: <span style=\'color:green\'>&nbspOFF'; }
      else { flags.pauseNextBattle = true; this.innerHTML = 'Pause next battle: <span style=\'color:crimson\'>&nbspON'; }
    });
    dom.d8m2 = addElement(dom.d8m_c, 'div', null, 'bbts');
    dom.d8m2.innerHTML = 'Resume the fight';
    dom.d8m2.style.right = '0px';
    dom.d8m2.style.position = 'absolute';
    dom.d8m2.addEventListener('click', function (this: any) { if (!flags.civil) flags.btl = true; });
    dom.d7m_c = addElement(dom.d1m, 'div', 'ainfo');
    dom.d7m = addElement(dom.d7m_c, 'small');
    dom.d7m.update = function (this: any) { combat.currentZone.size >= 0 ? this.innerHTML = 'Area: ' + combat.currentZone.name + ' / ' + combat.currentZone.size : this.innerHTML = 'Area: ' + combat.currentZone.name + ' / ' + '∞'; };
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
    dom.d_weathers.addEventListener('click', () => { flags.seasonGaijin = !flags.seasonGaijin; wdrseason(flags.seasonGaijin) })
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
    dom.d_time.addEventListener('click', function (this: any) { if (flags.timeMode >= 3) flags.timeMode = 1; else flags.timeMode++; this.innerHTML = '<small>' + getDay(flags.timeMode) + '</small> ' + timeDisp(time) });
    // Weather/time init (after DOM elements exist)
    setWeather(weather.clear, 600);
    wManager(); dom.d_time.innerHTML = '<small>' + getDay(flags.timeMode) + '</small> ' + timeDisp(time);
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
      if (global.lastWindowOpen === 7) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lastWindowOpen = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = ''; dom.ctrwin3.style.display = 'none'; dom.ctrwin1.style.display = 'none'; dom.ctrwin2.style.display = 'none'; global.lastWindowOpen = 7 }
      clearInterval(timers.sklupdate);
      clearInterval(timers.bstmonupdate)
    });
    dom.ct_bt1.addEventListener('click', () => {
      dom.nthngdsp.style.display = 'none';
      if (global.lastWindowOpen === 1) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lastWindowOpen = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else {
        dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = ''; dom.ctrwin1.style.display = 'none'; global.lastWindowOpen = 1;
        if (global.recipesDiscovered.length > 0) { dom.ct_bt1_c.style.display = ''; rsort(settings.recipeSortMode); clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) } else { dom.ct_bt1_c.style.display = 'none'; dom.nthngdsp.style.display = '' }
      }
    });

    dom.ct_bt3.addEventListener('click', function (this: any) {
      dom.nthngdsp.style.display = 'none';
      if (global.lastWindowOpen === 3) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lastWindowOpen = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else {
        dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = ''; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = 'none'; global.lastWindowOpen = 3; empty(dom.ctrwin5);
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
      if (global.lastWindowOpen === 2) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lastWindowOpen = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else {
        dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = ''; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = 'none'; global.lastWindowOpen = 2; if (you.skls.length > 0) {
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
          function rerenderSkills() {
            empty(dom.skcon);
            for (let m = 0; m < you.skls.length; m++) { renderSkl(you.skls[m]); if (m === you.skls.length - 1) dom.skcon.children[m].style.borderBottom = '1px solid #46a'; }
          }
          this.skwm_e_btn_1_b.addEventListener('click', function () {
            if (flags.ssort_a === true) { you.skls.sort(function (a, b) { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 }); flags.ssort_a = false; }
            else { you.skls.sort(function (a, b) { if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 }); flags.ssort_a = true; }
            rerenderSkills();
          });
          this.skwm_e_btn_2_b.addEventListener('click', function () {
            if (flags.ssort_b === true) { you.skls.sort(function (a, b) { if (a.type < b.type) return -1; if (a.type > b.type) return 1; if (a.id! < b.id!) return -1; if (a.id! > b.id!) return 1; return 0 }); flags.ssort_b = false; }
            else { you.skls.sort(function (a, b) { if (a.type > b.type) return -1; if (a.type < b.type) return 1; if (a.id! > b.id!) return -1; if (a.id! < b.id!) return 1; return 0 }); flags.ssort_b = true; }
            rerenderSkills();
          });
          this.skwm_e_btn_3_b.addEventListener('click', function () {
            if (flags.ssort_b === true) { you.skls.sort(function (a, b) { if (a.lvl < b.lvl) return -1; if (a.lvl > b.lvl) return 1; if (a.exp < b.exp) return -1; if (a.exp > b.exp) return 1; return 0 }); flags.ssort_b = false; }
            else { you.skls.sort(function (a, b) { if (a.lvl > b.lvl) return -1; if (a.lvl < b.lvl) return 1; if (a.exp > b.exp) return -1; if (a.exp < b.exp) return 1; return 0 }); flags.ssort_b = true; }
            rerenderSkills();
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
      if (global.lastWindowOpen === 6) { dom.ctrwin6.style.display = 'none'; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = ''; global.lastWindowOpen = 0; clearInterval(timers.sklupdate); clearInterval(timers.bstmonupdate) }
      else {
        dom.ctrwin6.style.display = ''; dom.ctrwin5.style.display = 'none'; dom.ctrwin4.style.display = 'none'; dom.ctrwin3.style.display = 'none'; dom.ctrwin2.style.display = 'none'; dom.ctrwin1.style.display = 'none'; global.lastWindowOpen = 6;
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
        dom.jlbrw1s2.innerHTML = flags.bestiaryUnlocked === true ? 'B E S T I A R Y' : '????????????'
        this.jlbrw2s1.innerHTML = '????????????';
        this.jlbrw2s2.innerHTML = 'S T A T I S T I C S';
        dom.jlbrw1s1.addEventListener('click', () => {
          empty(dom.ctrwin6); global.lastWindowOpen = -1;
          qsts.sort(function (a, b) { if ((a.id > b.id) && a.data.started === true) return -1; if ((a.id < b.id) && a.data.done === true && a.data.started === false) return 1; return 0 });
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
          if (!flags.bestiaryUnlocked) return; empty(dom.ctrwin6); global.lastWindowOpen = -1;
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
            let mon: any;
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
                let mon: any;
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
          empty(dom.ctrwin6); global.lastWindowOpen = -1;
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
          dom.tcright.innerHTML = stats.startTime
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
          if (stats.gameSaves > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Game saves';
            dom.tcright.innerHTML += stats.gameSaves
          }
          if (stats.atHomeTime > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total time spent at home';
            let br = stats.atHomeTime;
            dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60)
          }
          if (stats.timeSlept > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Time Slept';
            let br = stats.timeSlept;
            dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60)
          }
          if (stats.lightningStrikes > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times struck by lightning';
            dom.tcright.innerHTML = '<span style="color:black;background-color:yellow">' + stats.lightningStrikes + '</span>'
          }
          if (stats.questsCompleted > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Quests completed';
            dom.tcright.innerHTML = stats.questsCompleted
          }
          if (stats.jobsCompleted > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Jobs completed';
            dom.tcright.innerHTML = stats.jobsCompleted
          }
          if (stats.discoveryTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Discoveries made';
            dom.tcright.innerHTML = stats.discoveryTotal
          }
          if (stats.sectorMoveTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times walked';
            dom.tcright.innerHTML = stats.sectorMoveTotal
          }
          if (stats.catCount > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Cat pets';
            dom.tcright.innerHTML = stats.catCount
          }
          if (stats.foodAttempts > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Food consumed';
            dom.tcright.innerHTML = stats.foodAttempts
          }
          if (stats.foodTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Bad food consumed';
            dom.tcright.innerHTML = stats.foodTotal
          }
          if (stats.foodBenefit > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Drinks consumed';
            dom.tcright.innerHTML = stats.foodBenefit
          }
          if (stats.foodAlcohol > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Alcohol consumed';
            dom.tcright.innerHTML = stats.foodAlcohol
          }
          if (stats.foodTried > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Unique food tried';
            dom.tcright.innerHTML = stats.foodTried
          }
          if (stats.medicineTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Medicine used';
            dom.tcright.innerHTML = stats.medicineTotal
          }
          if (stats.potst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Potions consumed';
            dom.tcright.innerHTML = stats.potst
          }
          if (stats.pillsTaken > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Pills consumed';
            dom.tcright.innerHTML = stats.pillsTaken
          }
          if (stats.itemsPickedUp > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items picked up';
            dom.tcright.innerHTML = stats.itemsPickedUp
          }
          if (stats.disassembleTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items disassembled';
            dom.tcright.innerHTML = stats.disassembleTotal
          }
          if (stats.thrownTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items thrown away';
            dom.tcright.innerHTML = stats.thrownTotal
          }
          if (stats.craftTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items crafted';
            dom.tcright.innerHTML = stats.craftTotal
          }
          if (global.recipesDiscovered.length > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Recipes unlocked';
            dom.tcright.innerHTML = global.recipesDiscovered.length
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
          if (stats.expTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total EXP gained';
            dom.tcright.innerHTML = formatw(stats.expTotal)
          }
          if (stats.skillLevelsGained > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total skill levels';
            dom.tcright.innerHTML = stats.skillLevelsGained
          }
          if (stats.moneyGained > 0) {
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
            let p = stats.moneyGained
            if (p >= GOLD) { dom.ch_etn2_1.innerHTML = (dom.coingold + ((p / GOLD) << 0)); dom.ch_etn2_1.style.backgroundColor = 'rgb(102, 66, 0)'; }
            if (p >= SILVER && p % GOLD >= SILVER) { dom.ch_etn2_2.innerHTML = (dom.coinsilver + ((p / SILVER % SILVER) << 0)); dom.ch_etn2_2.style.backgroundColor = 'rgb(56, 56, 56)'; }
            if (p < SILVER || (p > SILVER && p % SILVER > 0)) { dom.ch_etn2_3.innerHTML = (dom.coincopper + ((p % SILVER) << 0)); dom.ch_etn2_3.style.backgroundColor = 'rgb(102, 38, 23)'; }
          }
          if (stats.moneySpent > 0) {
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
            let p = stats.moneySpent
            if (p >= GOLD) { dom.ch_etn2_1.innerHTML = (dom.coingold + ((p / GOLD) << 0)); dom.ch_etn2_1.style.backgroundColor = 'rgb(102, 66, 0)'; }
            if (p >= SILVER && p % GOLD >= SILVER) { dom.ch_etn2_2.innerHTML = (dom.coinsilver + ((p / SILVER % SILVER) << 0)); dom.ch_etn2_2.style.backgroundColor = 'rgb(56, 56, 56)'; }
            if (p < SILVER || (p > SILVER && p % SILVER > 0)) { dom.ch_etn2_3.innerHTML = (dom.coincopper + ((p % SILVER) << 0)); dom.ch_etn2_3.style.backgroundColor = 'rgb(102, 38, 23)'; }
          }
          if (stats.buyTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Goods bought';
            dom.tcright.innerHTML = stats.buyTotal
          }
          if (stats.readTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Books read';
            dom.tcright.innerHTML = stats.readTotal;
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
          if (stats.readingTimeTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total reading time';
            let br = stats.readingTimeTotal;
            dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60)
          }
          if (stats.descriptionViews > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times description window appeared';
            dom.tcright.innerHTML = stats.descriptionViews
          }
          if (stats.damageDealtTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total damage dealt';
            dom.tcright.innerHTML = formatw(stats.damageDealtTotal)
          }
          if (stats.damageReceivedTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total damage recieved';
            dom.tcright.innerHTML = formatw(stats.damageReceivedTotal)
          }
          if (stats.deathTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times died';
            dom.tcright.innerHTML = stats.deathTotal
          }
          if (stats.deathTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Last cause of casualty';
            dom.tcright.innerHTML = getlastd()
          }
          if (stats.allKills > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total kills';
            dom.tcright.innerHTML = stats.allKills
          }
          if (stats.oneShotKills > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times killed with a single hit';
            dom.tcright.innerHTML = stats.oneShotKills
          }
          if (stats.missesTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times missed the attack';
            dom.tcright.innerHTML = stats.missesTotal
          }
          if (stats.dodgesTotal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times dodged the attack';
            dom.tcright.innerHTML = stats.dodgesTotal
          }
          if (stats.masterySkillKills[0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Humanoid-class foes slayed';
            dom.tcright.innerHTML = stats.masterySkillKills[0]
          }
          if (stats.masterySkillKills[1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Beast-class foes slayed';
            dom.tcright.innerHTML = stats.masterySkillKills[1]
          }
          if (stats.masterySkillKills[2] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Undead-class foes slayed';
            dom.tcright.innerHTML = stats.masterySkillKills[2]
          }
          if (stats.masterySkillKills[3] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Evil-class foes slayed';
            dom.tcright.innerHTML = stats.masterySkillKills[3]
          }
          if (stats.masterySkillKills[4] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Phantom-class foes slayed';
            dom.tcright.innerHTML = stats.masterySkillKills[4]
          }
          if (stats.masterySkillKills[5] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Dragon-class foes slayed';
            dom.tcright.innerHTML = stats.masterySkillKills[5]
          }
          if (stats.masteryStatuses[0][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Unarmed attacks';
            dom.tcright.innerHTML = stats.masteryStatuses[0][0]
          }
          if (stats.masteryStatuses[0][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Unarmed kills';
            dom.tcright.innerHTML = stats.masteryStatuses[0][1]
          }
          if (stats.masteryStatuses[1][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Sword attacks';
            dom.tcright.innerHTML = stats.masteryStatuses[1][0]
          }
          if (stats.masteryStatuses[1][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Sword kills';
            dom.tcright.innerHTML = stats.masteryStatuses[1][1]
          }
          if (stats.masteryStatuses[2][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Axe attacks';
            dom.tcright.innerHTML = stats.masteryStatuses[2][0]
          }
          if (stats.masteryStatuses[2][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Axe kills';
            dom.tcright.innerHTML = stats.masteryStatuses[2][1]
          }
          if (stats.masteryStatuses[3][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Dagger attacks';
            dom.tcright.innerHTML = stats.masteryStatuses[3][0]
          }
          if (stats.masteryStatuses[3][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Dagger kills';
            dom.tcright.innerHTML = stats.masteryStatuses[3][1]
          }
          if (stats.masteryStatuses[4][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Polearm/Spear attacks';
            dom.tcright.innerHTML = stats.masteryStatuses[4][0]
          }
          if (stats.masteryStatuses[4][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Polearm/Spear kills';
            dom.tcright.innerHTML = stats.masteryStatuses[4][1]
          }
          if (stats.masteryStatuses[5][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Hammer/Club attacks';
            dom.tcright.innerHTML = stats.masteryStatuses[5][0]
          }
          if (stats.masteryStatuses[5][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Hammer/Club kills';
            dom.tcright.innerHTML = stats.masteryStatuses[5][1]
          }
          if (stats.masteryStatuses[6][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Staff attacks';
            dom.tcright.innerHTML = stats.masteryStatuses[6][0]
          }
          if (stats.masteryStatuses[6][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Staff kills';
            dom.tcright.innerHTML = stats.masteryStatuses[6][1]
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
    [dom.ct_bt1_1_cont_a, dom.ct_bt1_1_cont_b, dom.ct_bt1_1_cont_c, dom.ct_bt1_1_cont_d, dom.ct_bt1_1_cont_e, dom.ct_bt1_1_cont_f].forEach((el: any, i: number) => {
      el.addEventListener('click', function (this: any) { rstcrtthg(); this.style.color = 'yellow'; rsort(i) });
    });
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
    initSettingsPanel();


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
      if (flags.monsterFreeze === false) { flags.monsterFreeze = true; dom.m_b_1_c.innerHTML = 'Ｘ' }
      else { flags.monsterFreeze = false; dom.m_b_1_c.innerHTML = '' }
    });

    dom.m_b_2 = addElement(dom.m_control, 'small', null, 'msg-ctrl-btn');
    dom.m_b_2.innerHTML = '　stop combatlog　';
    dom.m_b_2.style.left = '19px';
    dom.m_b_2_c = addElement(dom.m_b_2, 'span', null, 'msg-badge');
    dom.m_b_2.addEventListener('click', () => {
      if (flags.monsterBattleHide === false) { flags.monsterBattleHide = true; dom.m_b_2_c.innerHTML = 'Ｘ' }
      else { flags.monsterBattleHide = false; dom.m_b_2_c.innerHTML = '' }
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
    [dom.inv_btn_1, dom.inv_btn_2, dom.inv_btn_3, dom.inv_btn_4, dom.inv_btn_5].forEach((el: any, i: number) => {
      el.addEventListener('click', function () { isort(i + 1); invbtsrst() });
    });
    dom.inv_btn_1_b.addEventListener('click', function (this: any) {
      if (flags.sort_a === true) {
        inv.sort(function (a, b) { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
        flags.sort_a = false;
      } else {
        inv.sort(function (a, b) { if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
        flags.sort_a = true;
      } iftrunkopenc(1);
      isort(settings.sortMode)
    });
    dom.inv_btn_2_b.addEventListener('click', function (this: any) {
      if (flags.sort_b === true) {
        inv.sort(function (a, b) { if (a.amount < b.amount) return -1; if (a.amount > b.amount) return 1; if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
        flags.sort_b = false;
      } else {
        inv.sort(function (a, b) { if (a.amount > b.amount) return -1; if (a.amount < b.amount) return 1; if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
        flags.sort_b = true;
      } iftrunkopenc(1);
      isort(settings.sortMode)
    });
    dom.inv_btn_3_b.addEventListener('click', function (this: any) {
      if (flags.sort_c === true) {
        inv.sort(function (a, b) { if (a.id! < b.id!) return -1; if (a.id! > b.id!) return 1; if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
        flags.sort_c = false;
      } else {
        inv.sort(function (a, b) { if (a.id! > b.id!) return -1; if (a.id! < b.id!) return 1; if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
        flags.sort_c = true;
      } iftrunkopenc(1);
      isort(settings.sortMode)
    });
    dom.d3.update = function (this: any) { this.innerHTML = ' lvl:' + you.lvl + ' \'' + you.title.name + '\''; }
    dom.d5_1_1.update = function (this: any) { this.innerHTML = 'hp: ' + format3(you.hp.toString()) + '/' + format3(you.hpmax.toString()); dom.d5_1.style.width = 100 * you.hp / you.hpmax + '%' };
    dom.d5_2_1.update = function (this: any) { this.innerHTML = 'exp: ' + format3(Math.round(you.exp).toString()) + '/' + format3(you.expnext_t.toString()); dom.d5_2.style.width = 100 * you.exp / you.expnext_t + '%' };
    dom.d5_2_1.update();
    dom.d5_3_1.update = function (this: any) { this.innerHTML = 'energy: ' + format3(Math.round(you.sat).toString()) + '/' + format3(you.satmax.toString()) + ' eff: ' + Math.round(you.efficiency() * 100) + '%'; dom.d5_3.style.width = you.sat >= 0 ? 100 * you.sat / you.satmax + '%' : '0%' };
    dom.d6.update = function (this: any) { this.innerHTML = 'rank: ' + format3(you.rank().toString()) };
    dom.d6.update();
    dom.hit_c = function (this: any) {
      let hitAccuracy = hit_calc(1)!;
      let hitBlock = hit_calc(2)!;
      let drk = (flags.isdark && !cansee());
      if (hitAccuracy > 100) hitAccuracy = 100;
      else if (hitAccuracy < 0) hitAccuracy = 0;
      if (hitBlock > 100) hitBlock = 100;
      else if (hitBlock < 0) hitBlock = 0;
      dom.d8.innerHTML = 'hit chance: <span style="color:' + (drk ? 'darkgrey' : '') + '">' + Math.round(hitAccuracy * (drk ? (.3 + skl.ntst.lvl * .07) : 1)) + '%</span> / dodge chance: ' + (100 - Math.round(hitBlock)) + '%' + (you.mods.dodgeModifier !== 0 ? ('(<span style="color:orange">' + you.mods.dodgeModifier * 100 + '%</span>)') : '');
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

    updateStatDisplay()
    updateCombatDisplay()

    gameText.mtp = ['Human', 'Beast', 'Undead', 'Evil', 'Phantom', 'Dragon'];

    let testz = new (area._ctor)();
    testz.apop = 4000;
    testz.bpop = 6000;
    testz.vsize = 10000;
    global.zoneAreaProfile[0] = testz;

    function offline_a() {
      global.offlineEvilIndex = 0;
      for (let i in global.zoneAreaProfile) {
        let zone = global.zoneAreaProfile[i];
        let apower = zone.apop / zone.bpop * 2;
        zone.vsize += zone.vsize * 0.0008 + 5;
        zone.apop += zone.apop * (randf(Math.log(zone.apop) * 0.8, Math.log(zone.apop) * 1.2) / 1000);
        zone.bpop += zone.bpop * (randf(Math.log(zone.bpop) * 0.8, Math.log(zone.bpop) * 1.2) / 1000);
        if (zone.apop > 0) zone.vsize -= Math.log2(zone.apop) * 2;
        else zone.bpop -= rand(20, 50);
        if (zone.bpop > 0) zone.apop -= zone.bpop / rand(40, 100);
        if (zone.vsize < 0) zone.apop -= rand(20, 50);
        global.offlineEvilIndex += zone.bpop;
        console.log('docile: ' + zone.apop + ' predator: ' + zone.bpop + ' forest: ' + zone.vsize);
      }
      global.offlineEvilIndex = Math.sqrt(global.offlineEvilIndex + 2100) / 45;
    }

    // appear, fade imported from ./dom-utils

    global.t_n = 0;


    // coinAnimation — moved to ui/shop.ts

    document.body.addEventListener('keydown', function (e) {
      if (flags.kfocus !== true) {
        for (let obj in global.shortcuts) if (e.which === global.shortcuts[obj][0]) {
          let g = global.shortcuts[obj][2];
          if (g.amount > 0 || !!g.slot) {
            g.use(you); reduce(g); iftrunkopenc(1); if (g.id < 3000 && !g.data.tried) { g.data.tried = true; stats.foodTried += 1; }
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


    // chs_spec — moved to ui/special-panels.ts
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

    // Location scripts — extracted to src/locations/
    initDojoLocations();
    initForestLocations();
    initVillageLocations();
    initSpecialLocations();
    initHomeLocations();
    initCatacombsLocations();

    function getlastd() {
      switch (combat.attackDamageFromYou[0]) {
        case 1: return '<span style="color:black;background-color:yellow">Struck by lightning</span>';
          break;
        case 2: switch (combat.attackDamageFromYou[1]) {
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
          switch (combat.attackDamageFromYouDamageType.a) {
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
          switch (combat.attackDamageFromYouDamageType.c) {
            case 0: txt += '<span style="color:' + fc[0] + ';background-color:' + fc[1] + ';text-shadow:' + fc[2] + '">' + select(['Slashed', 'Lacerated', 'Cut down', 'Hacked']) + '</span>';
              break;
            case 1: txt += '<span style="color:' + fc[0] + ';background-color:' + fc[1] + ';text-shadow:' + fc[2] + '">' + select(['Pierced', 'Impaled', 'Gored']) + '</span>';
              break;
            case 2: txt += '<span style="color:' + fc[0] + ';background-color:' + fc[1] + ';text-shadow:' + fc[2] + '">' + select(['Smashed', 'Crushed', 'Destroyed']) + '</span>';
              break;
          } txt += ' by ';
          for (let a in creature) if (creature[a].id === combat.attackDamageFromYouDamageType.id) { txt += creature[a].name; break } return txt;
          break;
        default: return 'what casualty?';
          break;
      }
    }

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
          if (itm.stype === settings.sortMode) updateInv(global.slottedInventory.indexOf(itm));
          else if (settings.sortMode === 1) updateInv(inv.indexOf(itm));
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

