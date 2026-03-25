import { WEEK, DAY } from '../constants';
import { utf8_to_b64, b64_to_utf8 } from '../base64';
import { random } from '../random';
import { scanbyuid, objempty } from '../utils';
import { addElement, empty, appear, fade } from '../dom-utils';
import {
  dom, global, settings, you, time, callback, w_manager, timers, chss, home, inv, furn, qsts, dar, acts, sectors,
  itemgroup, data, gameText, flags,
  setYou, setTime, setInv, setDar, setFurn, setQsts, setActs, setSectors, resetFlags,
  stats, combat,
} from '../state';
const { effect, creature, wpn, eqp, acc, sld, item, rcp, area, sector, ttl, skl,
  furniture, vendor, quest, act, container, mastery } = data;
import { wdrseason } from './weather';
import { smove, inSector, area_init } from '../game/movement';
import { kill } from '../game/utils-game';
import { giveItem, addToContainer } from '../game/inventory';
import { giveTitle, giveRcp, giveSkExp } from '../game/progression';
import { restock } from '../game/economy';
import { msg } from '../ui/messages';
import { addDesc } from '../ui/descriptions';
import { update_db, update_d, update_m, m_update } from '../ui/stats';
import { giveEff } from '../ui/effects';
import { equip, unequip, eqpres } from '../ui/equipment';
import { rsort, invbtsrst, rstcrtthg, isort } from '../ui/inventory';
import { activatef, deactivatef } from '../ui/choices';
import { weather, setWeather, wManager, timeConv, timeDisp, getDay, getLunarPhase, getHour } from './weather';
import { You } from './player';

// ==========================================================================
// Save/Load Helpers
// ==========================================================================

function serializeIdData(collection: any, filter?: any) {
  let arr = [];
  for (let obj in collection) {
    if (filter && !filter(collection[obj])) continue;
    arr.push({ id: collection[obj].id, data: collection[obj].data });
  }
  return arr;
}

function loadEquipCategory(savedArr: any, namespace: any) {
  for (let o = 0; o < savedArr.length; o++) {
    for (let obj in namespace) {
      if (namespace[obj].id === savedArr[o].id) {
        let t = giveItem(namespace[obj], 1, true);
        t.new = false;
        t.dp = savedArr[o].dp;
        for (let a in savedArr[o].data) t.data[a] = savedArr[o].data[a];
        if (savedArr[o].toeq === true) {
          if (t.slot === 5 && you.eqp[5].id === 10000) t.slot = 6;
          equip(t, { save: true });
        }
        break;
      }
    }
  }
}

function restoreDiscovery(savedIds: any, namespace: any) {
  for (let o = 0; o < savedIds.length; o++)
    for (let obj in namespace) if (namespace[obj].id === savedIds[o]) namespace[obj].data.dscv = true;
}

// ==========================================================================
// Save
// ==========================================================================

export function save(lvr?: any) {
  let storage = window.localStorage;
  flags.savestate = true;
  stats.gsvs++;
  let str = "";

  // Timestamp
  let a = new Date();
  global.lst_sve = a.getFullYear() + '/' + (a.getMonth() + 1) + '/' + a.getDate() + ' ' + a.getHours() + ':' + (a.getMinutes() >= 10 ? a.getMinutes() : '0' + a.getMinutes()) + ':' + (a.getSeconds() >= 10 ? a.getSeconds() : '0' + a.getSeconds());
  dom.sl_extra.innerHTML = 'Last save: ' + global.lst_sve;

  // Temporarily unequip everything and snapshot equipment
  let o: any[] = [];
  for (let obj in you.eqp) {
    o[obj as any] = you.eqp[obj];
    unequip(you.eqp[obj], { save: true });
  }
  you.stat_r();
  let freezete = flags.m_freeze;

  if (inSector(sector.home)) {
    for (let a in furn) deactivatef(furn[a]);
  }

  // Remove type-5 effects before serializing
  flags.m_freeze = true;
  for (let a in you.eff) {
    if (you.eff[a].type === 5) you.eff[a].onRemove(you);
  }

  // --- Segment 0: Player stats ---
  let yu = {
    name: you.name, title: you.title.id, lvl: you.lvl,
    exp: you.exp, exp_t: you.exp_t,
    sat: you.sat, satmax: you.satmax, sat_r: you.sat_r,
    hp: you.hp, hpmax: you.hpmax, hp_r: you.hp_r,
    str: you.str, str_r: you.str_r,
    agl: you.agl, agl_r: you.agl_r,
    int: you.int, int_r: you.int_r,
    spd: you.spd, spd_r: you.spd_r,
    luck: you.luck, stat_p: you.stat_p,
    wealth: you.wealth, crt: you.crt,
    res: you.res, mods: you.mods,
    stra: you.stra, strm: you.strm,
    inta: you.inta, intm: you.intm,
    agla: you.agla, aglm: you.agml,
    spda: you.spda, spdm: you.spdm,
    hpa: you.hpa, hpm: you.hpm,
    sata: you.sata, satm: you.satm,
    cls: you.cls, ccls: you.ccls,
    aff: you.aff, maff: you.maff,
    caff: you.caff, cmaff: you.cmaff,
    karma: you.karma, ki: you.ki
  };
  flags.m_freeze = true;
  global.current_a.deactivate();
  dom.ct_bt3.style.backgroundColor = 'inherit';
  for (let a in you.eff) {
    if (you.eff[a].type === 5) you.eff[a].onGive(you);
  }
  str += JSON.stringify(yu);
  str += '|';

  // --- Segment 1: Active effects ---
  let a4: any[] = [];
  for (let obj in you.eff) {
    if (!!you.eff[obj].id) {
      var pw;
      !!you.eff[obj].power ? pw = you.eff[obj].power : pw = 1;
      a4[obj as any] = { a: you.eff[obj].id, b: you.eff[obj].duration, c: pw };
    }
  }
  flags.m_freeze = false;
  str += JSON.stringify(a4);
  str += '|';

  // --- Segment 2: Player skills (levels + milestones) ---
  let a6: any[] = [];
  for (let obj in you.skls) {
    a6[obj as any] = { id: you.skls[obj].id, lvl: you.skls[obj].lvl, mst: [] as any[] };
    for (let m in you.skls[obj].mlstn) a6[obj as any].mst[m as any] = you.skls[obj].mlstn[m].g;
  }
  str += JSON.stringify(a6);
  str += '|';

  // --- Segment 3: Skill XP and multipliers ---
  let a7 = [];
  for (let obj in skl) a7.push([skl[obj].exp, skl[obj].p]);
  str += JSON.stringify(a7);
  str += '|';

  // --- Segment 4: Global state ---
  var datasi = [];
  let nindxdt = 0;
  for (let obj in item) {
    if (item[obj].data.tried === true) datasi[nindxdt++] = item[obj].id;
  }
  var datare = [];
  let nindxat = 0;
  for (let obj in item) {
    if (item[obj].data.finished === true) datare[nindxat++] = item[obj].id;
  }
  let a1 = {
    uid: global.uid, jj: stats,
    x: combat.current_z.id, a: settings.rm, b: settings.sm,
    e: flags, f: global.spirits,
    g: settings.msgs_max, i: global.lst_loc,
    j: time.minute, k: w_manager.duration, l: w_manager.curr.id,
    m: global.lst_sve,
    n: settings.bg_r, o: settings.bg_g, p: settings.bg_b,
    q: global.bestiary,
    r: global.timehold, r2: global.timewold,
    datas: datasi, u: settings.timescale,
    datar: datare, z: global.offline_evil_index,
    drdata: global.drdata
  };
  str += JSON.stringify(a1);
  str += '|';

  // --- Segment 5: Discovered recipes ---
  str += JSON.stringify(serializeIdData(global.rec_d));
  str += '|';

  // --- Segment 6: Inventory (5 item categories + saved item data) ---
  let a3: any[][] = [[], [], [], [], [], []];
  for (let obj in o) equip(o[obj as any], { save: true });
  you.stat_r();
  for (let obj in inv) {
    let expectedIndex = Math.max(0, Math.min(4, Math.floor(inv[obj].id / 10000)));
    if (expectedIndex === 0) {
      a3[0].push({ id: inv[obj].id, am: inv[obj].amount, data: inv[obj].data });
    } else {
      a3[expectedIndex].push({ id: inv[obj].id, dp: inv[obj].dp, toeq: true, data: inv[obj].data });
      if (!scanbyuid(you.eqp, inv[obj].data.uid))
        a3[expectedIndex][a3[expectedIndex].length - 1].toeq = false;
    }
  }
  for (let a in item) {
    if (item[a].save === true) a3[5].push({ item: item[a].id, data: item[a].data });
  }
  str += JSON.stringify(a3);
  str += '|';

  // --- Segment 7: Area sizes ---
  let a5 = [];
  let xx = 0;
  for (let o in area) a5[xx++] = area[o].size;
  str += JSON.stringify(a5);
  str += '|';

  // --- Segment 8: Discovery arrays ---
  let a8 = dar;
  str += JSON.stringify(a8);
  str += '|';

  // --- Segment 9: Furniture ---
  str += JSON.stringify(serializeIdData(furn));
  str += '|';

  // --- Segment 10: Vendors ---
  let a10: any = {};
  let a11: any = {};
  for (let obj in vendor) {
    let stock: any[] = [];
    for (let i = 0; i < vendor[obj].stock.length; i++) {
      stock[i] = [];
      stock[i][0] = vendor[obj].stock[i][0].id;
      stock[i][1] = vendor[obj].stock[i][1];
      stock[i][2] = vendor[obj].stock[i][2];
    }
    a10[obj] = { stock: stock, data: vendor[obj].data };
  }
  str += JSON.stringify(a10);
  str += '|';

  // --- Segment 11: Titles ---
  let a12 = [];
  for (let a in global.titles) a12.push(global.titles[a].id);
  str += JSON.stringify(a12);
  str += '|';

  // --- Segment 12: Home furniture assignments ---
  let a13: any = {};
  for (let s in home) a13[s] = home[s].id;
  str += JSON.stringify(a13);
  str += '|';

  // --- Segment 13: Active quests ---
  str += JSON.stringify(serializeIdData(qsts));
  str += '|';

  // --- Segment 14: Active actions ---
  str += JSON.stringify(serializeIdData(acts));
  str += '|';

  // --- Segment 15: Sector data ---
  str += JSON.stringify(serializeIdData(sector));
  str += '|';

  // --- Segment 16: Containers ---
  let a18 = [];
  for (let obj in container) {
    let cont = [];
    for (let a in container[obj].c) {
      cont.push({
        id: container[obj].c[a].item.id,
        data: container[obj].c[a].data,
        am: container[obj].c[a].am,
        dp: container[obj].c[a].dp
      });
    }
    a18.push({ id: container[obj].id, c: cont });
  }
  str += JSON.stringify(a18);
  str += '|';

  // --- Segment 17: Location data ---
  str += JSON.stringify(serializeIdData(chss, (o: any) => JSON.stringify(o.data) !== '{}'));
  str += '|savevalid|';

  // --- Segment 19: Title talents ---
  let a20 = [];
  for (let a in ttl) {
    if (ttl[a].tget) a20.push(ttl[a].id);
  }
  str += JSON.stringify(a20);

  // Re-activate furniture and restore state
  if (inSector(sector.home)) {
    for (let a in furn) activatef(furn[a]);
  }
  flags.m_freeze = true;
  global.current_a.activate();
  flags.m_freeze = freezete;
  if (flags.busy === true) dom.ct_bt3.style.backgroundColor = 'darkslategray';

  // Encode and store
  str = utf8_to_b64(str);
  storage.setItem("v0.3", str);
  flags.savestate = false;
  if (!lvr) msg('Game Saved', 'cyan');
  return str;
}

// ==========================================================================
// Loading screen overlay
// ==========================================================================

dom.loading = addElement(document.body, 'div');
dom.loading.style.zIndex = 9997;
dom.loading.style.width = '100%';
dom.loading.style.height = '100%';
dom.loading.style.position = 'absolute';
dom.loading.style.backgroundColor = 'lightgrey';
dom.loading.style.margin = -8;
dom.loadingt = addElement(document.body, 'div');
dom.loadingt.style.zIndex = 9998;
dom.loadingt.innerHTML = 'LOADING';
dom.loadingt.style.textAlign = 'center';
dom.loadingt.style.top = window.innerHeight / 2 - 50;
dom.loadingt.style.fontSize = '4em';
dom.loadingt.style.position = 'absolute';
dom.loadingt.style.left = window.innerWidth / 2 - 150;

// ==========================================================================
// Load
// ==========================================================================

export function load(dt?: any) {
  var str = dt || window.localStorage.getItem("v0.3");
  str = b64_to_utf8(str);

  if (str && str != '') {
    // Error overlay (shown if load fails partway through)
    dom.error = addElement(document.body, 'div');
    dom.error.style.width = '100%';
    dom.error.style.height = 'auto';
    dom.error.style.position = 'absolute';
    dom.error.style.fontSize = '2em';
    dom.error.style.color = 'red';
    dom.error.style.zIndex = 9999;
    dom.error.style.lineHeight = 'normal';
    dom.error.style.opacity = 0;
    setTimeout(function () { appear(dom.error) }, 500);
    dom.error.style.textAlign = 'center';
    dom.error.innerHTML = 'SOMETHING BROKE<br>PERHAPS DUE TO STUPIDITY OR DATA STRUCTURE CHANGES<br>⋗1 DELETING THE SAVE IS ADVISED<br>⋗2 OR WAITING FOR SOME TIME TIL FIXED<br>⋗3 OR CHECKING IN DIFFERENT BROWSER, MIGHT WORK THERE(MEANS THE SAVE IS BORKED(REFER TO 1))';

    // Clear all intervals
    clearInterval(timers.mnch);
    clearInterval(timers.snch);
    clearInterval(timers.autos);
    clearInterval(timers.rdng);
    clearInterval(timers.rdngdots);
    global.menuo = 0;
    clearInterval(timers.actm);
    clearInterval(timers.job1t);
    clearInterval(timers.bstmonupdate);
    clearInterval(timers.rptbncgt);
    flags.rptbncgtf = false;
    flags.rptbncgt = false;

    str = str.split('|');

    // --- Segment 0: Player stats ---
    let yu_s = JSON.parse(str[0]);
    for (let a in ttl) { ttl[a].have = false; ttl[a].tget = false; }
    global.titles = [];
    you.name = yu_s.name;
    for (let o in ttl) if (ttl[o].id === yu_s.title) you.title = ttl[o];
    you.lvl = yu_s.lvl;
    you.exp = yu_s.exp;
    you.exp_t = yu_s.exp_t;
    you.expnext_t = you.expnext();
    you.sat = yu_s.sat;
    you.satmax = yu_s.satmax;
    you.sat_r = yu_s.sat_r;
    you.sata = yu_s.sata || 0;
    you.satm = yu_s.satm || 1;
    you.ki = yu_s.ki || new Object();
    you.hp = yu_s.hp;
    you.hpmax = yu_s.hpmax;
    you.hp_r = yu_s.hp_r;
    you.hpa = yu_s.hpa || 0;
    you.hpm = yu_s.hpm || 1;
    you.hp = you.hp > you.hpmax ? you.hpmax : you.hp;
    you.str = yu_s.str;
    you.str_r = yu_s.str_r;
    you.stra = yu_s.stra || 0;
    you.strm = yu_s.strm || 1;
    you.agl = yu_s.agl;
    you.agl_r = yu_s.agl_r;
    you.agla = yu_s.agla || 0;
    you.aglm = yu_s.aglm || 1;
    you.int = yu_s.int;
    you.int_r = yu_s.int_r;
    you.inta = yu_s.inta || 0;
    you.intm = yu_s.intm || 1;
    you.spd = yu_s.spd;
    you.spd_r = yu_s.spd_r;
    you.spda = yu_s.spda || 0;
    you.spdm = yu_s.spdm || 1;
    you.cls = yu_s.cls || [0, 0, 0];
    you.ccls = yu_s.ccls || [0, 0, 0];
    you.aff = yu_s.aff || [0, 0, 0, 0, 0, 0, 0];
    you.maff = yu_s.maff || [0, 0, 0, 0, 0, 0, 0];
    you.caff = yu_s.caff || [0, 0, 0, 0, 0, 0, 0];
    you.cmaff = yu_s.cmaff || [0, 0, 0, 0, 0, 0, 0];
    you.luck = yu_s.luck;
    you.stat_p = yu_s.stat_p;
    you.karma = yu_s.karma || 0;
    you.wealth = yu_s.wealth;
    you.crt = yu_s.crt;
    flags.loadstate = true;

    // Clean up quest callbacks
    for (let a in callback)
      for (let b in callback[a].hooks)
        if (callback[a].hooks[b].data.q) callback[a].hooks.splice(callback[a].hooks[b], 1);

    // Reset items and inventory
    for (let obj in item) { item[obj].amount = 0; item[obj].have = false; }
    setInv([]);
    for (let g in yu_s.res) you.res[g] = yu_s.res[g];
    for (let g in yu_s.mods) you.mods[g] = yu_s.mods[g];
    you.eqp = [eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy];

    // Reset effects
    for (let a in you.eff) you.eff[a].active = false;
    you.eff = [];
    empty(dom.d101);
    global.e_e = [];
    global.e_em = [];
    empty(dom.d101m);
    combat.current_m.eff = [];

    // --- Segment 1: Effects ---
    let a4 = JSON.parse(str[1]);
    settings.msgs_max = 300;
    empty(dom.mscont);
    global.rec_d = [];
    for (let ba in rcp) { rcp[ba].have = false; }
    flags.loadstate = false;

    // --- Segment 2: Skills ---
    let a6 = JSON.parse(str[2]);
    you.skls = [];
    for (let ab in skl) { skl[ab].lvl = 0; skl[ab].exp = 0; }
    for (let a in global.rec_d) global.rec_d[a].have = false;
    global.rec_d = [];
    for (let i in skl)
      for (let ii in skl[i].mlstn) skl[i].mlstn[ii].g = false;

    for (let a in a6) {
      for (let b in skl) {
        if (a6[a].id === skl[b].id) {
          you.skls.push(skl[b]);
          skl[b].lvl = a6[a].lvl;
          for (let c in a6[a].mst) skl[b].mlstn[c].g = a6[a].mst[c];
          if (skl[b].mlstn) {
            for (let d in skl[b].mlstn) {
              if (skl[b].mlstn[d].g === false && skl[b].mlstn[d].lv <= skl[b].lvl) {
                skl[b].mlstn[d].f(you);
                skl[b].mlstn[d].g = true;
                msg("NEW PERK UNLOCKED " + '<span style="color:tomato">("' + skl[b].name + '")<span style="color:orange">lvl: ' + skl[b].mlstn[d].lv + '</span></span>', 'lime', { x: skl[b].name, y: 'Perk lvl ' + skl[b].mlstn[d].lv + ': <span style="color:yellow">' + skl[b].mlstn[d].p + '</span>' }, 7);
              }
            }
          }
        }
      }
    }

    // --- Segment 3: Skill XP ---
    var ro = [];
    for (let io in global.rec_d) ro.push(global.rec_d[io].id);
    let a7 = JSON.parse(str[3]);
    let skk = 0;
    for (let obj in skl) {
      if (a7[skk]) {
        skl[obj].exp = a7[skk][0] || 0;
        skl[obj].expnext_t = skl[obj].expnext();
        skl[obj].p = a7[skk++][1];
        if (!skl[obj].p) skl[obj].p = 1;
        if (skl[obj].p < .99) skl[obj].p += 1;
      }
    }

    // Restore effects
    flags.loadstate = true;
    for (let o = 0; o < a4.length; o++) {
      for (let obj in effect) {
        if (effect[obj].id === a4[o].a) {
          if (effect[obj].save !== false) giveEff(you, effect[obj], a4[o].b, a4[o].c);
          else { effect[obj].onRemove(you); }
          continue;
        }
      }
    }
    flags.loadstate = false;

    // --- Segment 4: Global state ---
    let a1 = JSON.parse(str[4]);
    settings.sm = a1.b;
    settings.rm = a1.a;
    global.spirits = a1.f;
    global.lst_loc = a1.i;
    global.uid = a1.uid;
    settings.msgs_max = a1.g;
    resetFlags();
    global.sinv = [];
    global.bestiary = a1.q;
    global.timehold = a1.r || ((time.minute / DAY) << 0);
    global.timewold = a1.r2 || ((time.minute / WEEK) << 0);
    global.lst_sve = a1.m;
    settings.timescale = a1.u || 1;
    global.offline_evil_index = a1.z || 1;
    global.drdata = a1.drdata || {};

    // Restore tried/finished item flags
    for (let gb = 0; gb < a1.datas.length; gb++) {
      for (let itm in item) if (item[itm].id === a1.datas[gb]) item[itm].data.tried = true;
    }
    if (a1.datar) {
      for (let gb = 0; gb < a1.datar.length; gb++) {
        for (let itm in item) if (item[itm].id === a1.datar[gb]) item[itm].data.finished = true;
      }
    }

    // Restore time and weather
    time.minute = a1.j;
    timeConv(time);
    for (let w in weather) if (weather[w].id === a1.l) setWeather(weather[w], a1.k);

    // Restore background color
    settings.bg_r = a1.n;
    settings.bg_g = a1.o;
    settings.bg_b = a1.p;

    // Restore statistics
    for (let a in stats) stats[a] = a1.jj[a] || 0;
    let tempt = new Date();
    if (stats.sttime === 0)
      stats.sttime = tempt.getFullYear() + '/' + (tempt.getMonth() + 1) + '/' + tempt.getDate() + ' ' + tempt.getHours() + ':' + (tempt.getMinutes() >= 10 ? tempt.getMinutes() : '0' + tempt.getMinutes()) + ':' + (tempt.getSeconds() > 10 ? tempt.getSeconds() : '0' + tempt.getSeconds());
    if (stats.msts === 0) stats.msts = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
    if (stats.msks === 0) stats.msks = [0, 0, 0, 0, 0, 0, 0];

    // Restore UI settings
    dom.ct_bt4_21b.value = settings.bg_r;
    dom.ct_bt4_22b.value = settings.bg_g;
    dom.ct_bt4_23b.value = settings.bg_b;
    stats.wsnburst = 50;
    dom.ctrwin4.style.display = 'none';
    dom.ctrwin2.style.display = 'none';
    dom.ctrwin1.style.display = '';
    global.lw_op = 0;

    // (area_init is triggered by smove → location sl() script below)

    // --- Segment 5: Recipes ---
    let a2 = JSON.parse(str[5]);
    for (let o = 0; o < a2.length; o++) {
      for (let obj in rcp) {
        if (rcp[obj].id === a2[o].id && rcp[obj].have === false) {
          global.rec_d.push(rcp[obj]);
          rcp[obj].have = true;
          rcp[obj].data = a2[o].data;
        }
      }
    }
    for (let o = 0; o < ro.length; o++) {
      for (let obj in rcp) {
        if (rcp[obj].id === ro[o] && rcp[obj].have === false) {
          global.rec_d.push(rcp[obj]);
          rcp[obj].have = true;
        }
      }
    }
    dom.d2.innerHTML = you.name;
    eqpres();
    unequip(you.eqp[4], { save: true });
    unequip(you.eqp[5], { save: true });
    you.stat_r();

    // --- Segment 6: Inventory ---
    let a3 = JSON.parse(str[6]);
    flags.loadstate = true;

    // Load consumable items
    if (a3[0].length != 0) {
      for (let o = 0; o < a3[0].length; o++) {
        for (let obj in item) {
          if (item[obj].id === a3[0][o].id) {
            let loaded = giveItem(item[obj], a3[0][o].am, true, { fi: true });
            loaded.new = false;
            for (let a in a3[0][o].data) loaded.data[a] = a3[0][o].data[a];
          }
          continue;
        }
      }
    }
    // Load equipment categories (weapons, armor, shields, accessories)
    loadEquipCategory(a3[1], wpn);
    loadEquipCategory(a3[2], eqp);
    loadEquipCategory(a3[3], sld);
    loadEquipCategory(a3[4], acc);

    // Bare-hands scaling
    if (you.eqp[0].id === 10000) {
      you.eqp[0].cls[2] = you.lvl / 4 << 0;
      you.eqp[0].aff[0] = you.lvl / 5 << 0;
      you.eqp[0].ctype = 2;
    }

    // --- Segment 7: Area sizes ---
    let a5 = JSON.parse(str[7]);
    let xx = 0;
    for (let o in area) if (xx < a5.length) area[o].size = a5[xx++];

    // --- Segment 8: Discovery arrays ---
    let a8 = JSON.parse(str[8]);
    setDar(a8);
    restoreDiscovery(a8[0], item);
    restoreDiscovery(a8[1], wpn);
    restoreDiscovery(a8[2], eqp);
    restoreDiscovery(a8[3], sld);
    restoreDiscovery(a8[4], acc);

    // Restore saved item data
    if (a3[5].length != 0) {
      for (let a in a3[5])
        for (let b in item) if (item[b].id === a3[5][a].item) item[b].data = a3[5][a].data;
    }

    // --- Segment 9: Furniture ---
    for (let a in furniture) furniture[a].active = false;
    for (let a in furn) furn[a].data = {};
    setFurn([]);
    let a9 = JSON.parse(str[9]);
    for (let a = 0; a < a9.length; a++) {
      for (let obj in furniture) {
        if (furniture[obj].id === a9[a].id && a9[a].data.amount > 0) {
          furn[a] = furniture[obj];
          furn[a].data = a9[a].data;
        }
      }
    }

    // --- Segment 10: Vendors ---
    let a10 = JSON.parse(str[10]);
    let a11 = JSON.parse(str[11]);
    resetFlags(a1.e);
    flags.rdng = false;
    flags.civil = true;
    flags.btl = false;
    combat.current_z = area.nwh;
    combat.current_m = creature.default;
    update_m();
    dom.d7m.update();
    flags.wkdis = false;
    flags.jdgdis = false;

    for (let obj in vendor) {
      if (a10[obj] && a10[obj].stock) {
        vendor[obj].stock = a10[obj].stock;
        vendor[obj].data = a10[obj].data;
        if (!vendor[obj].data.time || vendor[obj].data.time < 0) vendor[obj].data.time = 1;
        for (let itm = 0; itm < a10[obj].stock.length; itm++) {
          let k = itemgroup[(a10[obj].stock[itm][0] + 1) / 10000 << 0];
          for (let v in k) if (k[v].id === a10[obj].stock[itm][0]) { vendor[obj].stock[itm][0] = k[v]; continue; }
        }
      } else {
        restock(vendor[obj]);
      }
    }

    // --- Segment 11: Titles ---
    let a12 = JSON.parse(str[11]);
    for (let ttlid = 0; ttlid < a12.length; ttlid++) {
      for (let obj in ttl) {
        if (ttl[obj].id === a12[ttlid]) {
          global.titles[ttlid] = ttl[obj];
          global.titles[ttlid].have = true;
        }
      }
    }
    for (let obj in global.titlese) global.titles.push(global.titlese[obj]);
    global.titlese = [];

    // --- Segment 12: Home furniture ---
    let a13 = JSON.parse(str[12]);
    for (let s in a13) {
      for (let ss in furn) if (furn[ss].id === a13[s]) home[s] = furn[ss];
    }
    setQsts([]);

    // --- Segment 13: Quests ---
    let a14 = JSON.parse(str[13]);
    for (let obj in a14) {
      for (let q in quest) {
        if (quest[q].id === a14[obj].id) {
          qsts[obj as any] = quest[q];
          qsts[obj as any].data = a14[obj].data;
          if (qsts[obj as any].callback) qsts[obj as any].callback();
        }
      }
    }

    // --- Segment 14: Actions ---
    global.current_a = act.default;
    setActs([]);
    for (let a in act) { act[a].have = false; act[a].data = {}; act[a].active = false; }
    let a15 = JSON.parse(str[14]);
    for (let obj in a15) {
      for (let q in act) {
        if (act[q].id === a15[obj].id) {
          acts[obj as any] = act[q];
          acts[obj as any].data = a15[obj].data;
          act[q].have = true;
        }
      }
    }
    for (let a in sectors) sectors[a].onLeave();
    setSectors([]);

    // --- Segment 15: Sectors ---
    let a16 = JSON.parse(str[15]);
    for (let obj in a16) {
      for (let q in sector) {
        if (sector[q].id === a16[obj].id) {
          if (objempty(a16[obj].data) === false) {
            for (let a in a16[obj].data) sector[q].data[a] = a16[obj].data[a];
          } else if (sector[q].ddata) {
            sector[q].data = sector[q].ddata;
          }
        }
      }
    }

    // Navigate to last location
    clearInterval(timers.vndrstkchk);
    for (let obj in chss) {
      if (chss[obj].id === a1.i) {
        combat.current_l = chss[obj];
        smove(chss[obj], false);
      }
    }
    if (flags.to_pause === true) flags.btl = false;

    // --- Segment 16: Containers ---
    let a17 = JSON.parse(str[16]);
    for (let a in container) container[a].c = [];
    if (a17[0] && !a17[0].c) { a17 = [{ id: 1, c: a17 }]; }
    for (let a in a17) {
      for (let d in container) {
        if (container[d].id === a17[a].id) {
          for (let c in a17[a].c) {
            let k = itemgroup[(a17[a].c[c].id + 1) / 10000 << 0];
            for (let b in k) {
              if (k[b].id === a17[a].c[c].id) {
                let ni = { item: k[b], data: a17[a].c[c].data, am: a17[a].c[c].am, dp: a17[a].c[c].dp };
                container[d].c.push(ni);
                break;
              }
            }
          }
          break;
        }
      }
    }

    // --- Segment 17: Location data ---
    let a18_2 = JSON.parse(str[17]);
    for (let obj in a18_2) {
      for (let q in chss) {
        if (chss[q].id === a18_2[obj].id) {
          if (objempty(a18_2[obj].data) === false) chss[q].data = a18_2[obj].data;
        }
      }
    }

    // --- Segment 19: Title talents ---
    if (str[19]) {
      let a19 = JSON.parse(str[19]);
      for (let a in a19)
        for (let b in ttl) if (a19[a] === ttl[b].id) ttl[b].tget = true;
    }
    for (let a in ttl) {
      if (ttl[a].have && ttl[a].talent && !ttl[a].tget) {
        ttl[a].talent(you);
        ttl[a].tget = true;
      }
    }

    // Final UI restoration
    isort(settings.sm);
    rsort(settings.rm);
    rstcrtthg();
    you.stat_r();
    global.spbtsr[settings.rm].style.color = 'yellow';

    if (flags.aw_u) {
      dom.d0.style.display = '';
      dom.d1m.style.display = '';
      dom.inv_ctx.style.display = '';
      dom.gmsgs.style.display = '';
      dom.ct_ctrl.style.display = '';
      dom.ctr_1.style.display = '';
      dom.d_lct.style.display = '';
    }
    dom.ctrwin3.style.display = 'none';
    dom.ctrwin5.style.display = 'none';

    // Update all displays
    dom.d5_1_1.update();
    dom.d5_2_1.update();
    dom.d6.update();
    update_d();
    dom.d3.update();
    update_m();
    m_update();
    dom.d7m.update();
    dom.d5_3_1.update();

    if (flags.m_freeze === true) dom.m_b_1_c.innerHTML = 'Ｘ';
    if (flags.m_blh === true) dom.m_b_2_c.innerHTML = 'Ｘ';
    if (flags.to_pause === true) dom.d8m1.innerHTML = 'Pause next battle: <span style=\'color:crimson\'>&nbspON';
    if (flags.jnlu) dom.ct_bt6.innerHTML = 'journal';
    if (flags.asbu) dom.ct_bt1.innerHTML = 'assemble';
    if (flags.actsu) dom.ct_bt3.innerHTML = 'actions';
    if (flags.sklu) dom.ct_bt2.innerHTML = 'skills';

    if (flags.m_un === true) {
      dom.mn_2.style.display = '';
      dom.mn_4.style.display = '';
      dom.mn_3.style.display = '';
      if (stats.mndrgnu) dom.mn_1.style.display = '';
      m_update();
    }

    wManager();
    dom.d_moon.innerHTML = gameText.lunarp[getLunarPhase()][0];
    addDesc(dom.d_moon, null, 2, 'Lunar Phase', gameText.lunarp[getLunarPhase()][1]);
    wdrseason(flags.ssngaijin);
    if (flags.isday === false) dom.d_moon.style.display = '';
    else dom.d_moon.style.display = 'none';

    dom.sl_extra.innerHTML = 'Last save: ' + global.lst_sve;
    dom.nthngdsp.style.display = 'none';
    dom.ctrwin6.style.display = 'none';
    invbtsrst();
    dom.d_time.innerHTML = '<small>' + getDay(flags.tmmode || 2) + '</small> ' + timeDisp(time);

    flags.loadstate = false;
    flags.savestate = false;
    flags.ttlscrnopn = false;
    flags.expatv = false;
    flags.impatv = false;
    flags.expatv = false;
  }
  if (!flags.stbxinifld) {
    addToContainer(home.trunk, eqp.gnt);
    addToContainer(home.trunk, acc.fmlim);
    addToContainer(home.trunk, wpn.bdsrd);
    addToContainer(home.trunk, item.toolbx);
    addToContainer(home.trunk, sld.tge);
    addToContainer(home.trunk, item.bonig);
    flags.stbxinifld = true;
  }
  if (flags.bgspc) document.body.style.background = 'linear-gradient(180deg,#000,#123)'; else document.body.style.backgroundColor = 'rgb(' + settings.bg_r + ',' + settings.bg_g + ',' + settings.bg_b + ')';
  if (dom.bkssttbd) { empty(dom.bkssttbd); document.body.removeChild(dom.bkssttbd); flags.bksstt = false; kill(dom.bkssttbd) }
  if (flags.expatv) { empty(dom.ct_bt4_5a_nc); document.body.removeChild(dom.ct_bt4_5a_nc); kill(dom.ct_bt4_5a_nc) }
  if (flags.impatv) { empty(dom.ct_bt4_5b_nc); document.body.removeChild(dom.ct_bt4_5b_nc); kill(dom.ct_bt4_5b_nc) }
  if (dom.error) { empty(dom.error); document.body.removeChild(dom.error); kill(dom.error) }
  if (flags.autosave === true) { dom.autosves.checked = true; timers.autos = setInterval(function () { save(true); }, 30000) }
  //if(flags.msgtm===true)dom.ct_bt4_61b.checked=true;
  ////patch things
  if (skl.pet.lvl >= 10) giveTitle(ttl.pet3);
  if (item.amrthsck.data.finished) giveRcp(rcp.appljc)
  ////////////////
  if (dom.loading) { fade(dom.loading, 5, true); delete dom.loading; }; if (dom.loadingt) { fade(dom.loadingt, 5, true); delete dom.loadingt; }
}
