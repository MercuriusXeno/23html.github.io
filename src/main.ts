import { YEAR, MONTH, WEEK, DAY, HOUR, SILVER, GOLD } from './constants';
import { Base64, utf8_to_b64, b64_to_utf8 } from './base64';
import { random, rand, randf, _rand, xmur3 } from './random';
import { select, shuffle, deepCopy, copy, objempty, format3, col, scan, scanbyid, scanbyuid, find, findbyid, findbest, findworst } from './utils';
import { addElement, empty, appear, fade } from './dom-utils';
import { dom, global, listen, w_manager, creature, offline, effect, callback, effector,
  wpn, eqp, acc, sld, item, rcp, area, sector, timers, chss, ttl, skl, abl,
  furniture, vendor, quest, act, test, planner, check, container, mastery, home,
  itemgroup, sectors, inv, furn, qsts, dar, acts, plans, checksd,
  you, time, setYou, setTime,
  setInv, setDar, setFurn, setQsts, setActs, setSectors } from './state';
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

    // ==========================================================================
    // Bootstrap
    // ==========================================================================
    window.addEventListener('load', () => { load() });

    // --- Save/Load helpers ---
    function serializeIdData(collection, filter) {
      let arr = [];
      for (let obj in collection) {
        if (filter && !filter(collection[obj])) continue;
        arr.push({ id: collection[obj].id, data: collection[obj].data });
      }
      return arr;
    }

    function loadEquipCategory(savedArr, namespace) {
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

    function restoreDiscovery(savedIds, namespace) {
      for (let o = 0; o < savedIds.length; o++)
        for (let obj in namespace) if (namespace[obj].id === savedIds[o]) namespace[obj].data.dscv = true;
    }

    function save(lvr) {
      let storage = window.localStorage;
      global.flags.savestate = true;
      global.stat.gsvs++;
      let str = "";

      // Timestamp
      let a = new Date();
      global.lst_sve = a.getFullYear() + '/' + (a.getMonth() + 1) + '/' + a.getDate() + ' ' + a.getHours() + ':' + (a.getMinutes() >= 10 ? a.getMinutes() : '0' + a.getMinutes()) + ':' + (a.getSeconds() >= 10 ? a.getSeconds() : '0' + a.getSeconds());
      dom.sl_extra.innerHTML = 'Last save: ' + global.lst_sve;

      // Temporarily unequip everything and snapshot equipment
      let o = [];
      for (let obj in you.eqp) {
        o[obj] = you.eqp[obj];
        unequip(you.eqp[obj], { save: true });
      }
      you.stat_r();
      let freezete = global.flags.m_freeze;

      if (inSector(sector.home)) {
        for (let a in furn) deactivatef(furn[a]);
      }

      // Remove type-5 effects before serializing
      global.flags.m_freeze = true;
      for (let a in you.eff) {
        if (you.eff[a].type === 5) you.eff[a].onRemove();
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
      global.flags.m_freeze = true;
      global.current_a.deactivate();
      dom.ct_bt3.style.backgroundColor = 'inherit';
      for (let a in you.eff) {
        if (you.eff[a].type === 5) you.eff[a].onGive();
      }
      str += JSON.stringify(yu);
      str += '|';

      // --- Segment 1: Active effects ---
      let a4 = [];
      for (let obj in you.eff) {
        if (!!you.eff[obj].id) {
          var pw;
          !!you.eff[obj].power ? pw = you.eff[obj].power : pw = 1;
          a4[obj] = { a: you.eff[obj].id, b: you.eff[obj].duration, c: pw };
        }
      }
      global.flags.m_freeze = false;
      str += JSON.stringify(a4);
      str += '|';

      // --- Segment 2: Player skills (levels + milestones) ---
      let a6 = [];
      for (let obj in you.skls) {
        a6[obj] = { id: you.skls[obj].id, lvl: you.skls[obj].lvl, mst: [] };
        for (let m in you.skls[obj].mlstn) a6[obj].mst[m] = you.skls[obj].mlstn[m].g;
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
        uid: global.uid, jj: global.stat,
        x: global.current_z.id, a: global.rm, b: global.sm,
        e: global.flags, f: global.spirits,
        g: global.msgs_max, i: global.lst_loc,
        j: time.minute, k: w_manager.duration, l: w_manager.curr.id,
        m: global.lst_sve,
        n: global.bg_r, o: global.bg_g, p: global.bg_b,
        q: global.bestiary,
        r: global.timehold, r2: global.timewold,
        datas: datasi, u: global.timescale,
        datar: datare, z: global.offline_evil_index,
        drdata: global.drdata
      };
      str += JSON.stringify(a1);
      str += '|';

      // --- Segment 5: Discovered recipes ---
      str += JSON.stringify(serializeIdData(global.rec_d));
      str += '|';

      // --- Segment 6: Inventory (5 item categories + saved item data) ---
      let a3 = [[], [], [], [], [], []];
      for (let obj in o) equip(o[obj], { save: true });
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
      let a10 = {};
      let a11 = {};
      for (let obj in vendor) {
        let stock = [];
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
      let a13 = new Object();
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
      str += JSON.stringify(serializeIdData(chss, o => JSON.stringify(o.data) !== '{}'));
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
      global.flags.m_freeze = true;
      global.current_a.activate();
      global.flags.m_freeze = freezete;
      if (global.flags.busy === true) dom.ct_bt3.style.backgroundColor = 'darkslategray';

      // Encode and store
      str = utf8_to_b64(str);
      storage.setItem("v0.3", str);
      global.flags.savestate = false;
      if (!lvr) msg('Game Saved', 'cyan');
      return str;
    }

    // Loading screen overlay
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

    function load(dt) {
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
        global.flags.rptbncgtf = false;
        global.flags.rptbncgt = false;

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
        global.flags.loadstate = true;

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
        global.current_m.eff = [];

        // --- Segment 1: Effects ---
        let a4 = JSON.parse(str[1]);
        global.msgs_max = 300;
        empty(dom.mscont);
        global.rec_d = [];
        for (let ba in rcp) { rcp[ba].have = false; }
        global.flags.loadstate = false;

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
                    skl[b].mlstn[d].f();
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
        global.flags.loadstate = true;
        for (let o = 0; o < a4.length; o++) {
          for (let obj in effect) {
            if (effect[obj].id === a4[o].a) {
              if (effect[obj].save !== false) giveEff(you, effect[obj], a4[o].b, a4[o].c);
              else { effect[obj].onRemove(); }
              continue;
            }
          }
        }
        global.flags.loadstate = false;

        // --- Segment 4: Global state ---
        let a1 = JSON.parse(str[4]);
        global.sm = a1.b;
        global.rm = a1.a;
        global.spirits = a1.f;
        global.lst_loc = a1.i;
        global.uid = a1.uid;
        global.msgs_max = a1.g;
        global.flags = {};
        global.sinv = [];
        global.bestiary = a1.q;
        global.timehold = a1.r || ((time.minute / DAY) << 0);
        global.timewold = a1.r2 || ((time.minute / WEEK) << 0);
        global.lst_sve = a1.m;
        global.timescale = a1.u || 1;
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
        global.bg_r = a1.n;
        global.bg_g = a1.o;
        global.bg_b = a1.p;

        // Restore statistics
        for (let a in global.stat) global.stat[a] = a1.jj[a] || 0;
        let tempt = new Date();
        if (global.stat.sttime === 0)
          global.stat.sttime = tempt.getFullYear() + '/' + (tempt.getMonth() + 1) + '/' + tempt.getDate() + ' ' + tempt.getHours() + ':' + (tempt.getMinutes() >= 10 ? tempt.getMinutes() : '0' + tempt.getMinutes()) + ':' + (tempt.getSeconds() > 10 ? tempt.getSeconds() : '0' + tempt.getSeconds());
        if (global.stat.msts === 0) global.stat.msts = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
        if (global.stat.msks === 0) global.stat.msks = [0, 0, 0, 0, 0, 0, 0];

        // Restore UI settings
        dom.ct_bt4_21b.value = global.bg_r;
        dom.ct_bt4_22b.value = global.bg_g;
        dom.ct_bt4_23b.value = global.bg_b;
        global.stat.wsnburst = 50;
        dom.ctrwin4.style.display = 'none';
        dom.ctrwin2.style.display = 'none';
        dom.ctrwin1.style.display = '';
        global.lw_op = 0;

        // Restore area if in combat
        if (global.flags.civil === false && global.flags.btl === true) {
          for (let obj in area) if (area[obj].id === a1.x) { area_init(area[obj]); break; }
        }

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
        global.flags.loadstate = true;

        // Load consumable items
        if (a3[0].length != 0) {
          for (let o = 0; o < a3[0].length; o++) {
            for (let obj in item) {
              if (item[obj].id === a3[0][o].id) {
                giveItem(item[obj], a3[0][o].am, true, { fi: true });
                inv[o].new = false;
                for (let a in a3[0][o].data) inv[o].data[a] = a3[0][o].data[a];
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
        for (let o in area) if (a5[xx]) area[o].size = a5[xx++];

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
        global.flags = a1.e;
        global.flags.rdng = false;
        global.flags.civil = true;
        global.flags.btl = false;
        global.current_z = area.nwh;
        global.current_m = creature.default;
        update_m();
        dom.d7m.update();
        global.flags.wkdis = false;
        global.flags.jdgdis = false;

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
              qsts[obj] = quest[q];
              qsts[obj].data = a14[obj].data;
              if (qsts[obj].callback) qsts[obj].callback();
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
              acts[obj] = act[q];
              acts[obj].data = a15[obj].data;
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
            global.current_l = chss[obj];
            smove(chss[obj], false);
          }
        }

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
        let a18 = JSON.parse(str[17]);
        for (let obj in a18) {
          for (let q in chss) {
            if (chss[q].id === a18[obj].id) {
              if (objempty(a18[obj].data) === false) chss[q].data = a18[obj].data;
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
            ttl[a].talent();
            ttl[a].tget = true;
          }
        }

        // Final UI restoration
        isort(global.sm);
        rsort(global.rm);
        rstcrtthg();
        you.stat_r();
        global.spbtsr[global.rm].style.color = 'yellow';

        if (global.flags.aw_u) {
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

        if (global.flags.m_freeze === true) dom.m_b_1_c.innerHTML = 'Ｘ';
        if (global.flags.m_blh === true) dom.m_b_2_c.innerHTML = 'Ｘ';
        if (global.flags.jnlu) dom.ct_bt6.innerHTML = 'journal';
        if (global.flags.asbu) dom.ct_bt1.innerHTML = 'assemble';
        if (global.flags.actsu) dom.ct_bt3.innerHTML = 'actions';
        if (global.flags.sklu) dom.ct_bt2.innerHTML = 'skills';

        if (global.flags.m_un === true) {
          dom.mn_2.style.display = '';
          dom.mn_4.style.display = '';
          dom.mn_3.style.display = '';
          if (global.stat.mndrgnu) dom.mn_1.style.display = '';
          m_update();
        }

        wManager();
        dom.d_moon.innerHTML = global.text.lunarp[getLunarPhase()][0];
        addDesc(dom.d_moon, null, 2, 'Lunar Phase', global.text.lunarp[getLunarPhase()][1]);
        wdrseason(global.flags.ssngaijin);
        if (global.flags.isday === false) dom.d_moon.style.display = '';
        else dom.d_moon.style.display = 'none';

        dom.sl_extra.innerHTML = 'Last save: ' + global.lst_sve;
        dom.nthngdsp.style.display = 'none';
        dom.ctrwin6.style.display = 'none';
        invbtsrst();
        dom.d_time.innerHTML = '<small>' + getDay(global.flags.tmmode || 2) + '</small> ' + timeDisp(time);

        global.flags.loadstate = false;
        global.flags.savestate = false;
        global.flags.ttlscrnopn = false;
        global.flags.expatv = false;
        global.flags.impatv = false;
        global.flags.expatv = false;
      }
      if (!global.flags.stbxinifld) {
        addToContainer(home.trunk, eqp.gnt);
        addToContainer(home.trunk, acc.fmlim);
        addToContainer(home.trunk, wpn.bdsrd);
        addToContainer(home.trunk, item.toolbx);
        addToContainer(home.trunk, sld.tge);
        addToContainer(home.trunk, item.bonig);
        global.flags.stbxinifld = true;
      }
      if (global.flags.bgspc) document.body.style.background = 'linear-gradient(180deg,#000,#123)'; else document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')';
      if (dom.bkssttbd) { empty(dom.bkssttbd); document.body.removeChild(dom.bkssttbd); global.flags.bksstt = false; kill(dom.bkssttbd) }
      if (global.flags.expatv) { empty(dom.ct_bt4_5a_nc); document.body.removeChild(dom.ct_bt4_5a_nc); kill(dom.ct_bt4_5a_nc) }
      if (global.flags.impatv) { empty(dom.ct_bt4_5b_nc); document.body.removeChild(dom.ct_bt4_5b_nc); kill(dom.ct_bt4_5b_nc) }
      if (dom.error) { empty(dom.error); document.body.removeChild(dom.error); kill(dom.error) }
      if (global.flags.autosave === true) { dom.autosves.checked = true; timers.autos = setInterval(function () { save(true); }, 30000) }
      //if(global.flags.msgtm===true)dom.ct_bt4_61b.checked=true;
      ////patch things 
      if (skl.pet.lvl >= 10) giveTitle(ttl.pet3);
      if (item.amrthsck.data.finished) giveRcp(rcp.appljc)
      ////////////////
      if (dom.loading) { fade(dom.loading, 5, true); delete dom.loading; }; if (dom.loadingt) { fade(dom.loadingt, 5, true); delete dom.loadingt; }
    }

    // --- Titles moved to src/data/titles.ts ---

    // Title instances removed (108 titles)
    function Weather(id) {
      this.name = '?';
      this.id = id || -1
      this.ontick = function () { };
    } var weather = new Object();

    weather.sunny = new Weather(100);
    weather.sunny.name = 'Sunny';
    weather.sunny.c = 'yellow';
    weather.cloudy = new Weather(101);
    weather.cloudy.name = 'Cloudy';
    weather.cloudy.c = 'ghostwhite';
    weather.stormy = new Weather(102);
    weather.stormy.name = 'Stormy';
    weather.stormy.c = '#bdbdbd';
    weather.overcast = new Weather(103);
    weather.overcast.name = 'Overcast';
    weather.overcast.c = 'lightgrey';
    weather.storm = new Weather(104);
    weather.storm.name = 'Storm';
    weather.storm.frain = true;
    weather.storm.c = 'lightgrey';
    weather.storm.bc = '#5a5a5a';
    weather.thunder = new Weather(105);
    weather.thunder.name = 'Thunderstorm';
    weather.thunder.frain = true;
    weather.thunder.c = 'yellow';
    weather.thunder.bc = '#5a5a5a';
    weather.rain = new Weather(106);
    weather.rain.name = 'Rain';
    weather.rain.c = 'cyan';
    weather.rain.bc = '#2a3971';
    weather.rain.frain = true;
    weather.heavyrain = new Weather(107);
    weather.heavyrain.name = 'Heavy rain';
    weather.heavyrain.frain = true;
    weather.heavyrain.c = 'cyan';
    weather.heavyrain.bc = '#4d5eb3';
    weather.misty = new Weather(108);
    weather.misty.name = 'Misty';
    weather.misty.bc = '#244b68';
    weather.foggy = new Weather(109);
    weather.foggy.name = 'Foggy';
    weather.foggy.bc = '#7c8b9a';
    weather.drizzle = new Weather(110);
    weather.drizzle.name = 'Drizzle';
    weather.drizzle.bc = '254863';
    weather.drizzle.frain = true;
    weather.clear = new Weather(111);
    weather.clear.name = 'Clear';
    weather.snow = new Weather(112);
    weather.snow.name = 'Snow';
    weather.snow.c = 'white';
    weather.snow.bc = '#aaa';
    weather.snow.fsnow = true;
    weather.sstorm = new Weather(113);
    weather.sstorm.name = 'Snow Storm';
    weather.sstorm.c = 'white';
    weather.sstorm.bc = '#88a';
    weather.sstorm.fsnow = true;

    weather.storm.ontick = weather.rain.ontick = weather.heavyrain.ontick = weather.drizzle.ontick = function () {
      if (global.flags.inside === false) {
        if (effect.wet.active === false && !you.mods.rnprtk) giveEff(you, effect.wet, 5);
        let f = findbyid(global.current_m.eff, effect.wet.id);
        if (!f || f.active === false) giveEff(global.current_m, effect.wet, 5)
      }
    }

    weather.thunder.ontick = function () {
      if (global.flags.inside === false) {
        if (effect.wet.active === false && !you.mods.rnprtk) giveEff(you, effect.wet, 5);
        let f = findbyid(global.current_m.eff, effect.wet.id);
        if (!f || f.active === false) giveEff(global.current_m, effect.wet, 5)
        if (random() < .0009) {
          global.stat.lgtstk++;
          msg("You were struck by lightning!", 'black', null, null, 'yellow');
          let d = (200 / (1 + skl.aba.lvl * .05)) << 0;
          if (you.hp - d < 0) { global.atkdfty[0] = 1; you.hp = 0; you.onDeath();; giveSkExp(skl.painr, 300); giveSkExp(skl.dth, 100) } else { you.hp -= d; giveSkExp(skl.painr, 170) } giveSkExp(skl.aba, 30);
          dom.d5_1_1.update();
        }
      }
    }

    function callbackManager(id) {
      this.id = id || 0
      this.hooks = [{ f: function (victim, killer) { }, id: 0, data: {} }]
      this.fire = function () { }
    }

    callback.onDeath = new callbackManager(1);
    callback.onDeath.fire = function (victim, killer) {
      for (let a in this.hooks) this.hooks[a].f(victim, killer)
    }

    export function attachCallback(callback, what, data) {
      callback.hooks.push(what)
    }

    export function detachCallback(callback, what) {
      for (let a in callback.hooks) if (callback.hooks[a].id === what) callback.hooks.splice(callback.hooks[a], 1)
    }

    /*attachCallback(callback.onDeath,{
      f:function(victim, killer){
        if(victim.id===112) this.data.a++
        if(this.data.a===5) msg("KILLED FIVE",'yellow')
      },
      id:50,
      data:{a:0,q:true}
    })*/

    function Time() {
      this.minute = 0;
      this.hour = 0;
      this.day = 0;
      this.month = 0;
      this.year = 0;
    }

    setTime(new Time());
    time.minute = 338144100;
    global.text.d_l = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    global.text.d_s = ["Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat.", "Sun."];
    global.text.d_j = ["月", "火", "水", "木", "金", "土", "日"];

    // --- Effects moved to src/data/effects.ts ---
    // --- Furniture + Quests moved to src/data/furniture.ts ---
    function giveQst(q) {
      if (!q.data.started) { q.init(); q.data.started = true; msg((q.repeatable ? '<span style="color:cyan">Repeatable</span> q' : 'Q') + 'uest accepted: ' + '<span style="color:orange">"' + q.name + '"</span>', 'lightblue', q, 8); let have = false; for (let a in qsts) if (qsts[a].id === q.id) { have = true; break } if (!have) qsts.push(q); }
    }

    function finishQst(q) {
      if (q.data.started) { q.data.done = true; q.data.started = false; q.data.pending = false; msg('Quest completed: ', 'lime'); msg_add('"' + q.name + '"', 'orange'); q.rwd(); global.stat.qstc++ }
    }

    global.text.alcohol_d = ["You drank some alcohol. You feel warm inside.", "You drank alcohol. Party on!", "You drank lots of alcohol. Are those white mice?", "You drank unholy amounts of alcohol. But what do you care?", "You embalmed yourself alive with so much alcohol, that even undead will leave your dead body alone."];

    // --- Skills moved to src/data/skills.ts ---
    // --- Items moved to src/data/items.ts ---
    // --- Equipment moved to src/data/equipment.ts ---

    ////misc////
    global.wdrop = [{ item: item.lckl, c: .0000048 }];
    global.rdrop = [ // g f e 
      [{ item: item.lsrd, c: .00026 }],
      [{ item: item.lsrd, c: .0005 }],
      [{ item: item.lsrd, c: .00098 }, { item: item.lsstn, c: .00023 }],
      [], [], [], []];
    global.achchk = [//1 - you die, 2 - enemy dies
      [
        function (x) { if (ttl.ddw.have === false) { if ((x.id === 103 || x.id === 102) && x.lvl === 1) { giveTitle(ttl.ddw) } } }
      ],
      [
        function (x) { if (ttl.kill1.have === false) { if (global.stat.akills >= 10000) { giveTitle(ttl.kill1) } } },
        function (x) { if (ttl.kill2.have === false) { if (global.stat.akills >= 50000) { giveTitle(ttl.kill2) } } },
        function (x) { if (ttl.kill3.have === false) { if (global.stat.akills >= 200000) { giveTitle(ttl.kill3) } } },
        function (x) { if (ttl.kill4.have === false) { if (global.stat.akills >= 1000000) { giveTitle(ttl.kill4) } } },
        function (x) { if (ttl.kill5.have === false) { if (global.stat.akills >= 5000000) { giveTitle(ttl.kill5) } } },
      ]
    ];
    global.monchk = [
      function (x) { if (ttl.mone1.have === false) { if (global.stat.moneyg >= GOLD) { giveTitle(ttl.mone1) } } },
      //  function(x){if(ttl.mone2.have===false){if(global.stat.moneyg>=GOLD){giveTitle(ttl.mone2)}}},
      //  function(x){if(ttl.mone3.have===false){if(global.stat.moneyg>=GOLD){giveTitle(ttl.mone3)}}},
    ];
    global.ttlschk = [
      function (x) { if (ttl.ttsttl1.have === false) { if (global.titles.length >= 10) { giveTitle(ttl.ttsttl1) } } },
      function (x) { if (ttl.ttsttl2.have === false) { if (global.titles.length >= 25) { giveTitle(ttl.ttsttl2) } } },
      function (x) { if (ttl.ttsttl3.have === false) { if (global.titles.length >= 50) { giveTitle(ttl.ttsttl3) } } },
    ];

    global.shptchk = [
      function (x) { if (ttl.shpt1.have === false) { if (global.stat.buyt >= 500) { giveTitle(ttl.shpt1) } } },
      //  function(x){if(ttl.shpt2.have===false){if(global.stat.buyt>=5000){giveTitle(ttl.shpt2)}}},
      //  function(x){if(ttl.shpt3.have===false){if(global.stat.buyt>=10000){giveTitle(ttl.shpt3)}}},
    ];
    global.cptchk = [
      function (x) { if (ttl.cpet1.have === false) { if (global.stat.cat_c >= 9999) { giveTitle(ttl.cpet1) } } },
    ];
    global.htrchl = [
      function (x) { if (ttl.hstr1.have === false) { if (x >= 100) { giveTitle(ttl.hstr1) } } },
      function (x) { if (ttl.hstr2.have === false) { if (x >= 250) { giveTitle(ttl.hstr2) } } },
      function (x) { if (ttl.hstr3.have === false) { if (x >= 500) { giveTitle(ttl.hstr3) } } },
    ];
    global.nethmchk = [
      function (x) { if (ttl.neet.have === false) { if (global.stat.athmec >= YEAR) { giveTitle(ttl.neet) } } },
      function (x) { if (ttl.neet2.have === false) { if (global.stat.athmec >= YEAR * 5) { giveTitle(ttl.neet2) } } },
      function (x) { if (ttl.neet3.have === false) { if (global.stat.athmec >= YEAR * 10) { giveTitle(ttl.neet3) } } },
    ];

    ///////////////////////////////////////////
    //U
    ///////////////////////////////////////////

    function You() {
      this.name = 'You';
      this.title = ttl.new;
      this.desc = 'This is you';
      this.id = -1;
      this.type = 0;
      this.rank = function () { return Math.ceil(50000000000000 * (1 / (((this.agl + this.str + (you.eqp[0].str) + this.spd + this.int) ** 2) / Math.sqrt((this.agl + this.str + this.int + (this.spd / this.lvl)) * 512 / (this.luck * .1 + 1))))) };
      this.rnk = 0;
      this.lvl = 1;
      this.exp = 0;
      this.expnext = function () { return this.lvl * ((this.lvl * 2) ** 2) + (this.lvl ** 2) };
      this.expnext_t = this.expnext();
      this.exp_t = 1;
      this.efficiency = function () { let g = skl.fmn.use(); g = g >= .6 ? .6 : g; let e = (.8 - g) * this.sat / this.satmax + (.2 + g) + you.mods.sbonus; return e < 0 ? 0 : e }
      this.mods = { sbonus: 0, sdrate: .1, infsrate: 1, enmondren: 0, enmondrts: 1, ddgmod: 0, rdgrt: 1, cpwr: 1, crflt: 0, wthexrt: 0, tstl: 0, lkdbt: 0, ckfre: 0, rnprtk: 0, light: 0, undc: 0, petxp: .005, stdstps: 1, survinf: 0, runerg: 1 };
      this.ki = new Object();
      this.sat = this.satmax = this.sat_r = 200;
      this.hpmax = 39;
      this.hp = this.hp_r = 39;
      this.str = this.str_r = this.agl = this.agl_r = this.int = this.int_r = this.spd = this.spd_r = this.str_d = this.agl_d = this.int_d = 1;
      this.stra = this.agla = this.inta = this.spda = this.hpa = this.sata = 0;
      this.strm = this.intm = this.spdm = this.aglm = this.hpm = this.satm = 1
      this.stat_p = [1, 1, 1, 1];
      this.res = { poison: 1, burn: 1, frost: 1, paralize: 1, blind: 1, sleep: 1, curse: 1, death: 1, bleed: 1, ph: 1, venom: 1, fpoison: 1 };
      this.cls = [0, 0, 0];
      this.ccls = [0, 0, 0];
      this.aff = [0, 0, 0, 0, 0, 0, 0];
      this.maff = [0, 0, 0, 0, 0, 0, 0];
      this.caff = [0, 0, 0, 0, 0, 0, 0];
      this.cmaff = [0, 0, 0, 0, 0, 0, 0];
      this.dmlt = 1;
      this.luck = 1;
      this.karma = 0;
      this.crt = .008;
      this.wealth = 0;
      this.eva = 0;
      this.atkmode = 1;
      this.alive = true;
      this.eqp = [eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy, eqp.dummy];
      this.eff = [];
      this.skls = [];
      this.drop = [{ item: item.death_b, chance: 1 }];
      this.onDeath = function (killer) {
        if (you.res.death < 1 && random() >= you.res.death) { msg('You avoid death...', 'lightgrey'); you.hp = Math.ceil(you.hpmax * .1) } else {
          callback.onDeath.fire(this, killer)
          this.alive = false;
          this.hp = 1;
          if (!killer) killer = creature.default;
          if (global.current_a.id !== act.default.id) deactivateAct(global.current_a);
          global.flags.work = false
          you.sat / you.satmax > .3 ? giveSkExp(skl.dth, killer.rnk * 10 + 1) : giveSkExp(skl.dth, killer.rnk + 1);
          if (this.sat > 0) this.sat *= (.55 * (1 - skl.dth.use()));
          giveItem(item.death_b);
          dom.d5_1_1.update();
          global.s_l = 0;
          global.stat.deadt++;
          for (let x in global.achchk[0]) global.achchk[0][x](killer);
          clearInterval(timers.rdng);
          clearInterval(timers.rdngdots);
          global.flags.rdng = false;
          clearInterval(timers.job1t);
          clearInterval(timers.bstmonupdate)
          for (let o in this.eff) removeEff(this.eff[o])
          global.flags.btl = false;
          global.flags.civil = true;
          global.current_z.onDeath();
          if (sector.home.data.smkp > 0) { smove(chss.lsmain1, false); msg('You ran out of your smoked up house', 'grey') } else smove(chss.hbed, false);
          global.current_z = area.nwh;
          dom.hit_c();
          dom.d7m.update()
        }
      }
      this.onDeathE = function () { }
      this.ai = function () { }
      this.battle_ai = function (x, y, z) { return attack(x, y) }
      this.stat_r = function () {
        this.stre = this.inte = this.agle = this.spde = this.sate = this.hpe = 1;
        for (let idx in this.eff) this.eff[idx].mods();
        this.str = (this.str_r + this.stra) * this.strm * this.stre;
        this.str_d = this.str
        this.int = (this.int_r + this.inta) * this.intm * this.inte;
        this.int_d = this.int
        this.agl = (this.agl_r + this.agla) * this.aglm * this.agle;
        this.agl_d = this.agl
        this.spd = (this.spd_r + this.spda) * this.spdm * this.spde;
        this.spd_d = this.spd
        this.hpmax = Math.ceil((this.hp_r + this.hpa) * this.hpm * this.hpe);
        this.satmax = Math.ceil((this.sat_r + this.sata) * this.satm * this.sate);
        this.str_d += this.eqp[0].str;
        this.dmlt = 1;
        for (let obj in this.eqp) {
          this.int_d += this.eqp[obj].int;
          this.agl_d += this.eqp[obj].agl;
          this.spd += this.eqp[obj].spd;
        }
        for (let idx in this.eff) {
          if (this.eff[idx].type === 2) { this.eff[idx].un(); this.eff[idx].use(this.eff[idx].y, this.eff[idx].z) };
        } dom.d6.update(); update_db(); if (you.hp > you.hpmax) you.hp = you.hpmax; dom.d5_1_1.update();
      }
    } setYou(new You()); you.eqp[0].ctype = 2; giveTitle(ttl.new, true);
    you.ai = function () {
      //if(you.hp*100/you.hpmax<50) item.hrb1.use();
      //if(you.sat*100/you.satmax<90) item.appl.use();
    }

    // --- Creatures moved to src/data/creatures.ts ---
    ///////////////////////////////////////////
    //EFFECTORS
    ///////////////////////////////////////////
    function Effector() {
      this.id = 0;
      this.x = '@';
      this.c = 'white';
      this.active = false;
      this.activate = function () { }
      this.deactivate = function () { }
      this.use = function () { }
    }

    effector.dark = new Effector();
    effector.dark.activate = function () { global.flags.isdark = true }
    effector.dark.deactivate = function () { global.flags.isdark = false }
    effector.dark.x = '闇';
    effector.dark.c = 'darkgrey';

    effector.shop = new Effector();
    effector.shop.activate = function () { global.flags.isshop = true }
    effector.shop.deactivate = function () { global.flags.isshop = false }
    effector.shop.x = '$';
    effector.shop.c = 'gold';

    function activateEffectors(e) {
      if (!e) return;
      for (let a in e) if (!e[a].e.active && (!e[a].c || e[a].c() === true)) { e[a].e.activate(); e[a].e.active = true }
    }

    function deactivateEffectors(e) {
      if (!e) return
      for (let a in e) if (e[a].e.active) { e[a].e.deactivate(); e[a].e.active = false }
    }

    function runEffectors(e) {
      if (!e) return
      for (let a in e) e[a].e.use();
    }

    ///////////////////////////////////////////
    // --- Areas + Sectors moved to src/data/world.ts ---
    export function inSector(sector) {
      for (let a in global.current_l.sector) if (global.current_l.sector[a].id === sector.id) return true
    }

    function addtosector(sector, loc) {
      sector.group.push(loc.id);
      loc.sector.push(sector);
    }

    export function giveCrExp(skl, am, lvl) {
      if (!lvl || skl.lvl < lvl) giveSkExp(skl, am);
    }

    ///////////////////////////////////////////
    // --- Container + Recipes moved to src/data/crafting.ts ---
    function evaluateSpecialRequirementsForRecipe(recipe) {
      if (recipe.srect == null) {
        return [0];
      }

      let results = [];
      for (let i in recipe.srec) {
        results[i] = (recipe.srec[i]() === true) ? 1 : 2;
      }
      return results;
    }

    function scan2(arr, val, am) {
      for (let o = 0; o < arr.length + 1; o++) {
        if (o === arr.length) return { a: false, b: arr[o] };
        if (arr[o].id === val.id && arr[o].amount >= am) return { a: true, b: arr[o] };
        else continue;
      }
    }

    export function canMake(rc, times) {
      let missing = [];
      let has = [];
      let z = [];
      let b = [];
      let r = [];
      let o = evaluateSpecialRequirementsForRecipe(rc);
      for (let i = 0; i < rc.rec.length; i++) {
        let sc = new Object();
        if (!rc.rec[i].item.slot) {
          sc = scan2(inv, rc.rec[i].item, rc.rec[i].amount * times);
          z.push(rc.rec[i].item.amount * times);
        } else {
          let ar = findworst(inv, rc.rec[i].item);
          if (ar.length >= rc.rec[i].amount * times) sc.a = true;
          z.push(ar.length);
          r = ar;
        }
        if (!sc.a) {
          missing.push(rc.rec[i].item);
          b.push(false)
        } else {
          has.push(rc.rec[i].item);
          b.push(true)
        }
      } for (let a in global.tstcr) global.tstcr[a].testc = false;
      return { x: missing, y: has, z, o, success: missing.length === 0 && !o.includes(2), b, r };
    }


    function make(rc, rp, times) {
      times = times || 1
      let check = canMake(rc, times);
      if (rp || !check.success) {
        return check;
      } for (let k = 0; k < times; k++) {
        for (let j = 0; j < rc.rec.length; j++) {
          if (rc.rec[j].return) continue;
          if (!rc.rec[j].item.slot) {
            let itemToAlter = scan2(inv, rc.rec[j].item, rc.rec[j].amount).b;
            itemToAlter.amount -= rc.rec[j].amount;
            if (itemToAlter.amount === 0) removeItem(itemToAlter);
          } else {
            let ar = findworst(inv, rc.rec[j].item);
            let finar = [];
            for (let m = 0; m < rc.rec[j].amount; m++) finar.push(ar[m]);
            for (let m in finar) removeItem(finar[m]);
          }
        }
        if (!!rc.cmake) { rc.cmake(); }
        else {
          for (let itm in rc.res) {
            if (!rc.res[itm].amount_max) giveItem(rc.res[itm].item, rc.res[itm].amount);
            else { giveItem(rc.res[itm].item, rand(rc.res[itm].amount, rc.res[itm].amount_max)); }
          }
          rc.onmake();
        }
      }
      isort(global.sm);
    }



    export function restock(vnd) {
      vnd.stock = []; shuffle(vnd.items);
      for (let ims = 0; ims < vnd.items.length; ims++) {
        if ((!vnd.items[ims].cond || vnd.items[ims].cond() === true) && random() <= vnd.items[ims].c) vnd.stock.push([vnd.items[ims].item, rand(vnd.items[ims].min, vnd.items[ims].max), vnd.items[ims].p]);
        vnd.stock.sort(function (a, b) { if (a[0].id < b[0].id) return -1; if (a[0].id > b[0].id) return 1; return 0 });
      }
    }

    // shuffle() imported from ./utils

    ///////////////////////////////////////////
    // --- Actions moved to src/data/actions.ts ---

    function giveAction(a) {
      if (a.have === false) {
        if (!global.flags.actsu) { global.flags.actsu = true; dom.ct_bt3.innerHTML = 'actions' }
        msg('You learned a new action: <span style="color:tomato">"' + a.name + '"</span>', 'lime', a, 9);
        a.have = true;
        acts.push(a);
        if (acts.length >= 1 && dom.acccon) { empty(dom.acccon); for (let a in acts) renderAct(acts[a]) }
      }
    }

    ///////////////////////////////////////////
    //DOM
    ///////////////////////////////////////////
    dom.d0 = addElement(document.body, 'div', 'd1', 'd');
    if (!global.flags.aw_u) dom.d0.style.display = 'none';
    dom.d1 = addElement(dom.d0, 'div');
    dom.d101 = addElement(dom.d0, 'div', 'se_i');
    dom.d2c = addElement(dom.d1, 'div', null, 'd2');
    dom.d2 = addElement(dom.d2c, 'div');
    dom.d2.innerHTML = you.name;
    dom.d2_a = addElement(dom.d2c, 'input', 'nch');
    dom.d2_a.addEventListener('focusin', function () { dom.d2_a.value = you.name; you.name = ''; dom.d2.innerHTML = '　' });
    dom.d2_a.addEventListener('focusout', function () { you.name = dom.d2_a.value; dom.d2_a.value = ''; dom.d2.innerHTML = you.name });
    addDesc(dom.d2c, null, 2, you.name, you.desc);
    dom.d3 = addElement(dom.d1, 'div', null, 'd3');
    dom.d3.innerHTML = ' lvl:' + you.lvl + ' \'' + you.title.name + '\'';
    dom.d3.addEventListener('click', function () {
      if (!global.flags.ttlscrnopn) {
        global.flags.ttlscrnopn = true;
        dom.ttlcont = addElement(document.body, 'div', 'youttlc');
        dom.ttlhead = addElement(dom.ttlcont, 'div', 'youttlh');
        dom.ttlhead.innerHTML = 'SELECT YOUR TITLE';
        dom.ttlbd = addElement(dom.ttlcont, 'div');
        dom.ttlbd.style.overflow = 'auto';
        dom.ttlbd.style.maxHeight = window.innerHeight - 130;
        for (let obj in global.titles) {
          this.ttlent = addElement(dom.ttlbd, 'div', null, 'title-entry');
          let title = global.titles[obj]
          if (obj === 0) this.ttlent.style.borderTop = '';
          this.ttlent.innerHTML = '"' + title.name + '"';
          if (global.titles[obj].talent) this.ttlent.innerHTML += " <span style='color:yellow;text-shadow:0px 0px 5px orange'>*</span>"
          addDesc(this.ttlent, title, 5);
          this.ttlent.addEventListener('click', function () {
            you.title = title;
            empty(dom.ttlcont);
            document.body.removeChild(dom.ttlcont);
            dom.d3.innerHTML = ' lvl:' + you.lvl + ' \'' + you.title.name + '\'';
            empty(global.dscr);
            global.dscr.style.display = 'none';
            global.flags.ttlscrnopn = false;
          });
        }
      }
    });
    addDesc(dom.d3, you.title, 5, true);
    //dom.d5 = addElement(dom.d1,'div','d5'); ???????
    dom.d5_1 = addElement(dom.d1, 'div', null, 'hp');
    dom.d5_2 = addElement(dom.d1, 'div', null, 'exp');
    dom.d5_3 = addElement(dom.d1, 'div', null, 'en');
    addDesc(dom.d5_1, null, 2, 'Health', function () { return ('Physical health points, needed to stay alive. You will probably die if it reaches 0<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.stat_p[0] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d5_2, null, 2, 'Experience', function () { return ('Physical and combat experience. You\'ll have to work hard to achieve new heights<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>EXP Gain Potential: <span style="color:gold">' + (you.exp_t * 100 << 0) + '%</span><br>Current EXP Gain: <span style="color:yellow">' + (you.exp_t * 100 * you.efficiency() << 0) + '%</span></small>') }, true);
    addDesc(dom.d5_3, null, 2, 'Energy meter', function () {
      let lose = you.mods.sdrate;
      if (global.flags.iswet === true) lose *= (3 / (1 + (skl.abw.lvl * .03)))
      if (global.flags.iscold === true) lose += effect.cold.duration / 1000 / (1 + skl.coldr.lvl * .05);
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
    addDesc(dom.d4_1, null, 2, 'Physical Strength', function () { return ('Determines physical damage dealt and received<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.stat_p[1] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d4_2, null, 2, 'Agility', function () { return ('Determines hit/dodge rate<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.stat_p[2] * 100 << 0) + '%</span></small>') }, true);
    addDesc(dom.d4_3, null, 2, 'Mental acuity', function () { return ('Determines magic damage dealt and received<div style="  border-bottom: 1px solid grey;width:100%;height:8px">　</div><br><small>Growth Potential: <span style="color:lime">' + (you.stat_p[3] * 100 << 0) + '%</span></small>') }, true);
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
    dom.d7_slot_3.addEventListener('mouseenter', function () { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[2].str * (you.eqp[2].dp / you.eqp[2].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_3.addEventListener('mouseleave', function () { this.innerHTML = global._tad; });
    dom.d7_slot_4.addEventListener('mouseenter', function () { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[3].str * (you.eqp[3].dp / you.eqp[3].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_4.addEventListener('mouseleave', function () { this.innerHTML = global._tad; });
    dom.d7_slot_5.addEventListener('mouseenter', function () { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[4].str * (you.eqp[4].dp / you.eqp[4].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_5.addEventListener('mouseleave', function () { this.innerHTML = global._tad; });
    dom.d7_slot_6.addEventListener('mouseenter', function () { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[5].str * (you.eqp[5].dp / you.eqp[5].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_6.addEventListener('mouseleave', function () { this.innerHTML = global._tad; });
    dom.d7_slot_7.addEventListener('mouseenter', function () { global._tad = this.innerHTML; this.innerHTML = 'DEF: ' + Math.round(you.eqp[6].str * (you.eqp[6].dp / you.eqp[6].dpmax) + you.str_r + you.eqp[1].str * (you.eqp[1].dp / you.eqp[1].dpmax)) });
    dom.d7_slot_7.addEventListener('mouseleave', function () { this.innerHTML = global._tad; });
    dom.d1m = addElement(document.body, 'div', 'd1', 'd');
    if (!global.flags.aw_u) dom.d1m.style.display = 'none';
    dom.d101m = addElement(dom.d1m, 'div', 'se_i');
    dom.d1m.style.top = 8;
    dom.d1m.style.left = 457;
    dom.d1m.style.position = 'absolute';
    dom.d101m.style.top = 264
    global.special_x = dom.d1m.style.left;
    global.special_y = dom.d1m.style.top;

    /*dom.d1m.addEventListener('mousedown',function(){
      this.style.left=parseInt(global.special_x)+rand(-5,5)+'px';
      this.style.top=parseInt(global.special_y)+rand(-5,5)+'px';
    });
    dom.d1m.addEventListener('mouseup',function(){
      this.style.left=parseInt(global.special_x)+'px';
      this.style.top=parseInt(global.special_y)+'px';
    });*/
    dom._d23m = addElement(dom.d1m, 'div');
    addDesc(dom._d23m, null, 3, global.current_m.name, global.current_m.desc);
    dom.d2m = addElement(dom._d23m, 'div', null, 'd2');
    dom.d3m = addElement(dom._d23m, 'div', null, 'd3m');
    dom.d5_1m = addElement(dom.d1m, 'div', null, 'hp');
    dom.d5_2m = addElement(dom.d1m, 'div', null, 'exp');
    dom.d5_1_1m = addElement(dom.d5_1m, 'div', 'hpp');
    dom.d5_2_1m = addElement(dom.d5_2m, 'div');
    dom.d5_1_1m.update = function () {
      this.innerHTML = 'hp: ' + format3(global.current_m.hp.toString()) + '/' + format3(global.current_m.hpmax.toString());
      dom.d5_1m.style.width = 100 * global.current_m.hp / global.current_m.hpmax + '%';
    }
    dom.d4m = addElement(dom.d1m, 'div', 'd4');
    dom.d4_1m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d4_2m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d4_3m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d4_4m = addElement(dom.d4m, 'span', null, 'dd');
    dom.d9m = addElement(dom.d1m, 'div');
    dom.d9m.update = function () { this.innerHTML = 'rank: ' + global.text.eranks[global.current_m.rnk]; if (global.current_m.rnk <= 4) this.style.color = 'lightgrey'; else if (global.current_m.rnk > 4 && global.current_m.rnk <= 7) this.style.color = 'white'; else if (global.current_m.rnk > 7 && global.current_m.rnk <= 10) this.style.color = 'lightblue'; else if (global.current_m.rnk > 10 && global.current_m.rnk <= 13) this.style.color = 'lightgreen'; else if (global.current_m.rnk > 13 && global.current_m.rnk <= 16) this.style.color = 'lime'; else if (global.current_m.rnk > 16 && global.current_m.rnk <= 19) this.style.color = 'yellow' }
    dom.d9m.style.borderBottom = '#545299 dotted 2px';
    dom.d9m.style.backgroundColor = '#272744';
    dom.d8m_c = addElement(dom.d1m, 'small', 'bbts');
    dom.d8m1 = addElement(dom.d8m_c, 'div', null, 'bbts');
    dom.d8m1.innerHTML = 'Pause next battle: <span style=\'color:green\'>&nbspOFF';
    dom.d8m1.addEventListener('click', function () {
      if (global.flags.to_pause === true) { if (!global.flags.civil) global.flags.btl = true; global.flags.to_pause = false; this.innerHTML = 'Pause next battle: <span style=\'color:green\'>&nbspOFF'; }
      else { global.flags.to_pause = true; this.innerHTML = 'Pause next battle: <span style=\'color:crimson\'>&nbspON'; }
    });
    dom.d8m2 = addElement(dom.d8m_c, 'div', null, 'bbts');
    dom.d8m2.innerHTML = 'Resume the fight';
    dom.d8m2.style.right = '0px';
    dom.d8m2.style.position = 'absolute';
    dom.d8m2.addEventListener('click', function () { if (!global.flags.civil) global.flags.btl = true; });
    dom.d7m_c = addElement(dom.d1m, 'div', 'ainfo');
    dom.d7m = addElement(dom.d7m_c, 'small');
    dom.d7m.update = function () { global.current_z.size >= 0 ? this.innerHTML = 'Area: ' + global.current_z.name + ' / ' + global.current_z.size : this.innerHTML = 'Area: ' + global.current_z.name + ' / ' + '∞'; };
    dom.d7m.update();
    dom.inv_ctx = addElement(document.body, 'div', 'inv');
    if (!global.flags.aw_u) dom.inv_ctx.style.display = 'none';
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
    if (!global.flags.aw_u) dom.ctr_1.style.display = 'none';
    dom.ctr_1a = addElement(dom.ctr_1, 'div');
    dom.d_weather = addElement(dom.ctr_1a, 'div', 'ctr_w');
    dom.d_weathers = addElement(dom.d_weather, 'small');
    dom.d_weathert = addElement(dom.d_weather, 'span');
    dom.d_weathers.style.marginRight = 5
    dom.d_weathers.addEventListener('click', () => { global.flags.ssngaijin = !global.flags.ssngaijin; wdrseason(global.flags.ssngaijin) })
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
    dom.d_time.addEventListener('click', function () { if (global.flags.tmmode >= 3) global.flags.tmmode = 1; else global.flags.tmmode++; this.innerHTML = '<small>' + getDay(global.flags.tmmode) + '</small> ' + timeDisp(time) });
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
    if (!global.flags.aw_u) dom.ct_ctrl.style.display = 'none';
    dom.ct_bt1 = addElement(dom.ct_ctrl, 'div', null, 'control-tab');
    dom.ct_bt1.innerHTML = global.flags.asbu ? 'assemble' : '???????';
    dom.ct_bt2 = addElement(dom.ct_ctrl, 'div', null, 'control-tab');
    dom.ct_bt2.innerHTML = global.flags.sklu ? 'skills' : '???????';
    dom.ct_bt3 = addElement(dom.ct_ctrl, 'div', null, 'control-tab');
    dom.ct_bt3.innerHTML = global.flags.actsu ? 'actions' : '???????';
    //dom.ct_bt4 = addElement(dom.ct_ctrl ,'div',null,'control-tab'); dom.ct_bt4.innerHTML = '';
    //dom.ct_bt5 = addElement(dom.ct_ctrl ,'div',null,'control-tab'); dom.ct_bt5.innerHTML = '';
    dom.ct_bt6 = addElement(dom.ct_ctrl, 'div', null, 'control-tab');
    dom.ct_bt6.innerHTML = global.flags.jnlu ? 'journal' : '???????';
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

    dom.ct_bt3.addEventListener('click', () => {
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

    function renderAct(a) {
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
    function refreshAct(e, a) { e.style.color = 'inherit'; if (a.cond(false) !== true) e.style.color = 'grey'; if (a.active === true) e.style.color = 'lime'; }

    function activateAct(actn) {
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

    dom.ct_bt2.addEventListener('click', function () {
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
          this.skwm_e_btn_1_b.addEventListener('click', function () {
            if (global.flags.ssort_a === true) {
              you.skls.sort(function (a, b) { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
              global.flags.ssort_a = false;
            } else {
              you.skls.sort(function (a, b) { if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
              global.flags.ssort_a = true;
            } empty(dom.skcon)
            for (let m = 0; m < you.skls.length; m++) { renderSkl(you.skls[m]); if (m === you.skls.length - 1) dom.skcon.children[m].style.borderBottom = '1px solid #46a'; }
          });
          this.skwm_e_btn_2_b.addEventListener('click', function () {
            if (global.flags.ssort_b === true) {
              you.skls.sort(function (a, b) { if (a.type < b.type) return -1; if (a.type > b.type) return 1; if (a.id < b.id) return -1; if (a.id > b.id) return 1; return 0 });
              global.flags.ssort_b = false;
            } else {
              you.skls.sort(function (a, b) { if (a.type > b.type) return -1; if (a.type < b.type) return 1; if (a.id > b.id) return -1; if (a.id < b.id) return 1; return 0 });
              global.flags.ssort_b = true;
            } empty(dom.skcon)
            for (let m = 0; m < you.skls.length; m++) { renderSkl(you.skls[m]); if (m === you.skls.length - 1) dom.skcon.children[m].style.borderBottom = '1px solid #46a'; }
          });
          this.skwm_e_btn_3_b.addEventListener('click', function () {
            if (global.flags.ssort_b === true) {
              you.skls.sort(function (a, b) { if (a.lvl < b.lvl) return -1; if (a.lvl > b.lvl) return 1; if (a.exp < b.exp) return -1; if (a.exp > b.exp) return 1; return 0 });
              global.flags.ssort_b = false;
            } else {
              you.skls.sort(function (a, b) { if (a.lvl > b.lvl) return -1; if (a.lvl < b.lvl) return 1; if (a.exp > b.exp) return -1; if (a.exp < b.exp) return 1; return 0 });
              global.flags.ssort_b = true;
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
    dom.ct_bt6.addEventListener('click', function () {
      if (!global.flags.jnlu) return; dom.nthngdsp.style.display = 'none';
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
        dom.jlbrw1s2.innerHTML = global.flags.bstu === true ? 'B E S T I A R Y' : '????????????'
        this.jlbrw2s1.innerHTML = '????????????';
        this.jlbrw2s2.innerHTML = 'S T A T I S T I C S';
        dom.jlbrw1s1.addEventListener('click', () => {
          empty(dom.ctrwin6); global.lw_op = -1;
          qsts.sort(function (a, b) { if ((a.id > b.id) && a.data.started === true) return -1; if ((a.id < b.id) && a.data.done === true && a.data.started === false) return 1 });
          dom.qstbody = addElement(dom.ctrwin6, 'div');
          this.qstlbl = addElement(dom.qstbody, 'div');
          this.qstlbl.innerHTML = 'Q U E S T　　L I S T'
          this.qstlbl.style.textAlign = 'center';
          this.qstlbl.style.padding = 7;
          this.qstlbl.style.background = 'linear-gradient(180deg,#182347,#13152f)';
          for (let a in qsts) {
            let c, rarc, rarts = '';
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
            this.qstcell.addEventListener('click', function () {
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
        dom.jlbrw1s2.addEventListener('click', function () {
          if (!global.flags.bstu) return; empty(dom.ctrwin6); global.lw_op = -1;
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
            this.bst_entr_m_e2.innerHTML = global.text.eranks[mon.rnk];
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
          timers.bstmonupdate = setInterval(function () {
            if (monsize < global.bestiary.length) {
              for (let ii = monsize; ii < global.bestiary.length; ii++) {
                let mon;
                for (let id in creature) if (creature[id].id === global.bestiary[ii].id) mon = creature[id];
                this.bst_entr_m_case = addElement(bst_entr_case, 'div', 'bst_entrh', 'list-row');
                this.bst_entr_m_case.style.backgroundColor = 'rgb(10,30,54)';
                this.bst_entr_m_e1 = addElement(this.bst_entr_m_case, 'div', null, 'list-col-name');
                this.bst_entr_m_e1.innerHTML = mon.name;
                this.bst_entr_m_e2 = addElement(this.bst_entr_m_case, 'div', null, 'list-col-rank');
                this.bst_entr_m_e2.innerHTML = global.text.eranks[mon.rnk];
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
        this.jlbrw2s2.addEventListener('click', function () {
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
          dom.tcright.innerHTML = global.stat.sttime
          /*dom.tccon=addElement(dom.statbod,'small',null,'stat-row');
          dom.tcleft=addElement(dom.tccon,'div',null,'stat-label');
          dom.tcright=addElement(dom.tccon,'div',null,'stat-value');
          dom.tcleft.innerHTML='Time passed';
          let br=global.stat.tick;
          dom.tcright.innerHTML=(br>=86400?(br/(86400)<<0+' Days '):'')+(br%86400>=3600?(((br%86400/3600)<<0)%24+':'):'')+(br%3600<60?'00':(br%3600>=600?(br%3600/60)<<0:'0'+(br%3600/60)<<0))+(':'+(br%360<60?'0'+br%60:br%60));
          */
          dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
          dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
          dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
          dom.tcleft.innerHTML = 'Ingame time passed';
          let br = time.minute - 338143959;
          dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60);
          dom.tcright.style.fontSize = '.9em';
          if (global.stat.gsvs > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Game saves';
            dom.tcright.innerHTML += global.stat.gsvs
          }
          if (global.stat.athme > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total time spent at home';
            let br = global.stat.athme;
            dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60)
          }
          if (global.stat.timeslp > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Time Slept';
            let br = global.stat.timeslp;
            dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60)
          }
          if (global.stat.lgtstk > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times struck by lightning';
            dom.tcright.innerHTML = '<span style="color:black;background-color:yellow">' + global.stat.lgtstk + '</span>'
          }
          if (global.stat.qstc > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Quests completed';
            dom.tcright.innerHTML = global.stat.qstc
          }
          if (global.stat.jcom > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Jobs completed';
            dom.tcright.innerHTML = global.stat.jcom
          }
          if (global.stat.dsct > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Discoveries made';
            dom.tcright.innerHTML = global.stat.dsct
          }
          if (global.stat.smovet > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times walked';
            dom.tcright.innerHTML = global.stat.smovet
          }
          if (global.stat.cat_c > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Cat pets';
            dom.tcright.innerHTML = global.stat.cat_c
          }
          if (global.stat.fooda > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Food consumed';
            dom.tcright.innerHTML = global.stat.fooda
          }
          if (global.stat.foodt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Bad food consumed';
            dom.tcright.innerHTML = global.stat.foodt
          }
          if (global.stat.foodb > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Drinks consumed';
            dom.tcright.innerHTML = global.stat.foodb
          }
          if (global.stat.foodal > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Alcohol consumed';
            dom.tcright.innerHTML = global.stat.foodal
          }
          if (global.stat.ftried > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Unique food tried';
            dom.tcright.innerHTML = global.stat.ftried
          }
          if (global.stat.medst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Medicine used';
            dom.tcright.innerHTML = global.stat.medst
          }
          if (global.stat.potst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Potions consumed';
            dom.tcright.innerHTML = global.stat.potst
          }
          if (global.stat.plst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Pills consumed';
            dom.tcright.innerHTML = global.stat.plst
          }
          if (global.stat.igtttl > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items picked up';
            dom.tcright.innerHTML = global.stat.igtttl
          }
          if (global.stat.dsst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items disassembled';
            dom.tcright.innerHTML = global.stat.dsst
          }
          if (global.stat.thrt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items thrown away';
            dom.tcright.innerHTML = global.stat.thrt
          }
          if (global.stat.crftt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Items crafted';
            dom.tcright.innerHTML = global.stat.crftt
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
          if (global.stat.exptotl > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total EXP gained';
            dom.tcright.innerHTML = formatw(global.stat.exptotl)
          }
          if (global.stat.slvs > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total skill levels';
            dom.tcright.innerHTML = global.stat.slvs
          }
          if (global.stat.moneyg > 0) {
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
            let p = global.stat.moneyg
            if (p >= GOLD) { dom.ch_etn2_1.innerHTML = (dom.coingold + ((p / GOLD) << 0)); dom.ch_etn2_1.style.backgroundColor = 'rgb(102, 66, 0)'; }
            if (p >= SILVER && p % GOLD >= SILVER) { dom.ch_etn2_2.innerHTML = (dom.coinsilver + ((p / SILVER % SILVER) << 0)); dom.ch_etn2_2.style.backgroundColor = 'rgb(56, 56, 56)'; }
            if (p < SILVER || (p > SILVER && p % SILVER > 0)) { dom.ch_etn2_3.innerHTML = (dom.coincopper + ((p % SILVER) << 0)); dom.ch_etn2_3.style.backgroundColor = 'rgb(102, 38, 23)'; }
          }
          if (global.stat.moneysp > 0) {
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
            let p = global.stat.moneysp
            if (p >= GOLD) { dom.ch_etn2_1.innerHTML = (dom.coingold + ((p / GOLD) << 0)); dom.ch_etn2_1.style.backgroundColor = 'rgb(102, 66, 0)'; }
            if (p >= SILVER && p % GOLD >= SILVER) { dom.ch_etn2_2.innerHTML = (dom.coinsilver + ((p / SILVER % SILVER) << 0)); dom.ch_etn2_2.style.backgroundColor = 'rgb(56, 56, 56)'; }
            if (p < SILVER || (p > SILVER && p % SILVER > 0)) { dom.ch_etn2_3.innerHTML = (dom.coincopper + ((p % SILVER) << 0)); dom.ch_etn2_3.style.backgroundColor = 'rgb(102, 38, 23)'; }
          }
          if (global.stat.buyt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Goods bought';
            dom.tcright.innerHTML = global.stat.buyt
          }
          if (global.stat.rdttl > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Books read';
            dom.tcright.innerHTML = global.stat.rdttl;
            addDesc(dom.tccon, null, 2, 'Info', '<span style="color:lie">Click to list known books</span>');
            dom.tccon.addEventListener('click', function () {
              if (!global.flags.bksstt) {
                global.flags.bksstt = true;
                dom.bkssttbd = addElement(document.body, 'div', null, 'popup-list');
                dom.bkssttbd.addEventListener('click', function () { empty(dom.bkssttbd); document.body.removeChild(dom.bkssttbd); global.flags.bksstt = false; global.dscr.style.display = 'none' });
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
          if (global.stat.rdgtttl > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total reading time';
            let br = global.stat.rdgtttl;
            dom.tcright.innerHTML = (br >= YEAR ? '<span style="color:orange">' + (br / YEAR << 0) + '</span> Years ' : '') + (br >= MONTH ? '<span style="color:yellow">' + (br / MONTH << 0) % 12 + '</span> Months ' : '') + (br >= DAY ? '<span style="color:lime">' + (br / DAY << 0) % 30 + '</span> Days ' : '') + (br / HOUR % 24 << 0) + ':' + (br % 60 < 10 ? '0' + br % 60 : br % 60)
          }
          if (global.stat.popt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times description window appeared';
            dom.tcright.innerHTML = global.stat.popt
          }
          if (global.stat.dmgdt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total damage dealt';
            dom.tcright.innerHTML = formatw(global.stat.dmgdt)
          }
          if (global.stat.dmgrt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total damage recieved';
            dom.tcright.innerHTML = formatw(global.stat.dmgrt)
          }
          if (global.stat.deadt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times died';
            dom.tcright.innerHTML = global.stat.deadt
          }
          if (global.stat.deadt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Last cause of casualty';
            dom.tcright.innerHTML = getlastd()
          }
          if (global.stat.akills > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Total kills';
            dom.tcright.innerHTML = global.stat.akills
          }
          if (global.stat.onesht > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times killed with a single hit';
            dom.tcright.innerHTML = global.stat.onesht
          }
          if (global.stat.misst > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times missed the attack';
            dom.tcright.innerHTML = global.stat.misst
          }
          if (global.stat.dodgt > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Times dodged the attack';
            dom.tcright.innerHTML = global.stat.dodgt
          }
          if (global.stat.msks[0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Humanoid-class foes slayed';
            dom.tcright.innerHTML = global.stat.msks[0]
          }
          if (global.stat.msks[1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Beast-class foes slayed';
            dom.tcright.innerHTML = global.stat.msks[1]
          }
          if (global.stat.msks[2] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Undead-class foes slayed';
            dom.tcright.innerHTML = global.stat.msks[2]
          }
          if (global.stat.msks[3] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Evil-class foes slayed';
            dom.tcright.innerHTML = global.stat.msks[3]
          }
          if (global.stat.msks[4] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Phantom-class foes slayed';
            dom.tcright.innerHTML = global.stat.msks[4]
          }
          if (global.stat.msks[5] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Dragon-class foes slayed';
            dom.tcright.innerHTML = global.stat.msks[5]
          }
          if (global.stat.msts[0][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Unarmed attacks';
            dom.tcright.innerHTML = global.stat.msts[0][0]
          }
          if (global.stat.msts[0][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Unarmed kills';
            dom.tcright.innerHTML = global.stat.msts[0][1]
          }
          if (global.stat.msts[1][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Sword attacks';
            dom.tcright.innerHTML = global.stat.msts[1][0]
          }
          if (global.stat.msts[1][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Sword kills';
            dom.tcright.innerHTML = global.stat.msts[1][1]
          }
          if (global.stat.msts[2][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Axe attacks';
            dom.tcright.innerHTML = global.stat.msts[2][0]
          }
          if (global.stat.msts[2][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Axe kills';
            dom.tcright.innerHTML = global.stat.msts[2][1]
          }
          if (global.stat.msts[3][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Dagger attacks';
            dom.tcright.innerHTML = global.stat.msts[3][0]
          }
          if (global.stat.msts[3][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Dagger kills';
            dom.tcright.innerHTML = global.stat.msts[3][1]
          }
          if (global.stat.msts[4][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Polearm/Spear attacks';
            dom.tcright.innerHTML = global.stat.msts[4][0]
          }
          if (global.stat.msts[4][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Polearm/Spear kills';
            dom.tcright.innerHTML = global.stat.msts[4][1]
          }
          if (global.stat.msts[5][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Hammer/Club attacks';
            dom.tcright.innerHTML = global.stat.msts[5][0]
          }
          if (global.stat.msts[5][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Hammer/Club kills';
            dom.tcright.innerHTML = global.stat.msts[5][1]
          }
          if (global.stat.msts[6][0] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Staff attacks';
            dom.tcright.innerHTML = global.stat.msts[6][0]
          }
          if (global.stat.msts[6][1] > 0) {
            dom.tccon = addElement(dom.statbod, 'small', null, 'stat-row');
            dom.tcleft = addElement(dom.tccon, 'div', null, 'stat-label');
            dom.tcright = addElement(dom.tccon, 'div', null, 'stat-value');
            dom.tcleft.innerHTML = 'Staff kills';
            dom.tcright.innerHTML = global.stat.msts[6][1]
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
    dom.ct_bt1_1_cont_a.addEventListener('click', function () { rstcrtthg(); this.style.color = 'yellow'; rsort(0) });
    dom.ct_bt1_1_cont_b.addEventListener('click', function () { rstcrtthg(); this.style.color = 'yellow'; rsort(1) });
    dom.ct_bt1_1_cont_c.addEventListener('click', function () { rstcrtthg(); this.style.color = 'yellow'; rsort(2) });
    dom.ct_bt1_1_cont_d.addEventListener('click', function () { rstcrtthg(); this.style.color = 'yellow'; rsort(3) });
    dom.ct_bt1_1_cont_e.addEventListener('click', function () { rstcrtthg(); this.style.color = 'yellow'; rsort(4) });
    dom.ct_bt1_1_cont_f.addEventListener('click', function () { rstcrtthg(); this.style.color = 'yellow'; rsort(5) });
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
    dom.ct_bt4_1b.addEventListener('change', function () { if (this.value < 1) this.value = 1; else if (this.value > 100) this.value = 100; global.msgs_max = this.value });
    function rstcrtthg() { for (let a in global.spbtsr) global.spbtsr[a].style.color = 'inherit'; }

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
    dom.ct_bt4_21b.addEventListener('input', function () { document.body.removeAttribute('style'); global.flags.bgspc = false; global.bg_r = this.value; document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')'; dom.ct_bt4_31b.innerHTML = global.bg_r });
    dom.ct_bt4_22b = addElement(dom.ct_bt4_2, 'input', null, 'option-input');
    dom.ct_bt4_22b.value = global.bg_g;
    dom.ct_bt4_22b.type = 'range';
    dom.ct_bt4_21b.style.height = '16px';
    dom.ct_bt4_22b.style.height = '16px';
    dom.ct_bt4_22b.min = 0;
    dom.ct_bt4_22b.max = 255;
    dom.ct_bt4_22b.style.width = '85px';
    dom.ct_bt4_22b.style.left = '367px';
    dom.ct_bt4_22b.addEventListener('input', function () { document.body.removeAttribute('style'); global.flags.bgspc = false; global.bg_g = this.value; document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')'; dom.ct_bt4_32b.innerHTML = global.bg_g });
    dom.ct_bt4_23b = addElement(dom.ct_bt4_2, 'input', null, 'option-input');
    dom.ct_bt4_23b.value = global.bg_b;
    dom.ct_bt4_23b.type = 'range';
    dom.ct_bt4_21b.style.height = '16px';
    dom.ct_bt4_23b.style.height = '16px';
    dom.ct_bt4_23b.min = 0;
    dom.ct_bt4_23b.max = 255;
    dom.ct_bt4_23b.style.width = '85px';
    dom.ct_bt4_23b.style.left = '459px';
    dom.ct_bt4_23b.addEventListener('input', function () { document.body.removeAttribute('style'); global.flags.bgspc = false; global.bg_b = this.value; document.body.style.backgroundColor = 'rgb(' + global.bg_r + ',' + global.bg_g + ',' + global.bg_b + ')'; dom.ct_bt4_33b.innerHTML = global.bg_b });

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
    dom.ct_bt4_03b1.addEventListener('click', function () {
      global.flags.bgspc = false
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
    dom.ct_bt4_03b2.addEventListener('click', function () {
      global.flags.bgspc = false
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
    dom.ct_bt4_03b3.addEventListener('click', function () {
      global.flags.bgspc = false
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
    dom.ct_bt4_03b4.addEventListener('click', function () {
      global.flags.bgspc = true
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
    dom.ct_bt4_41b.addEventListener('click', () => { nograd(global.flags.grd_s) });
    dom.ct_bt4_5 = addElement(dom.ctrwin4, 'div', null, 'option-row');
    dom.ct_bt4_5a = addElement(dom.ct_bt4_5, 'div', null, 'option-label-alt');
    dom.ct_bt4_5b = addElement(dom.ct_bt4_5, 'div', null, 'option-value-alt');
    dom.ct_bt4_5a.innerHTML = 'Export';
    dom.ct_bt4_5a.style.border = '1px lightgrey solid';
    dom.ct_bt4_5a.addEventListener('click', function () {
      if (!global.flags.expatv) {
        t = save(true);
        global.flags.expatv = true;
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
        dom.ct_bt4_5a_nhv.addEventListener('click', function () { dom.ct_bt4_5a_nbc.value = t });
        dom.ct_bt4_5a_nhz = addElement(dom.ct_bt4_5a_nh, 'div');
        dom.ct_bt4_5a_nhz.style.float = 'left';
        dom.ct_bt4_5a_nhz.style.backgroundColor = 'grey';
        dom.ct_bt4_5a_nhz.innerHTML = 'Export As File'
        dom.ct_bt4_5a_nhz.addEventListener('click', function () {
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
        dom.ct_bt4_5a_nhx.addEventListener('click', function () { global.flags.expatv = false; empty(dom.ct_bt4_5a_nc); document.body.removeChild(dom.ct_bt4_5a_nc); kill(dom.ct_bt4_5a_nc) });
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
    dom.ct_bt4_5b.addEventListener('click', function () {
      if (!global.flags.impatv) {
        global.flags.impatv = true;
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
        dom.ct_bt4_5b_nhv.addEventListener('click', function () {
          if (dom.ct_bt4_5b_nbc.value == "" || dom.ct_bt4_5b_nbc.value == "?") { dom.ct_bt4_5b_nbc.value = '?'; return }
          let storage = window.localStorage;
          let t = dom.ct_bt4_5b_nbc.value;
          bt = b64_to_utf8(dom.ct_bt4_5b_nbc.value);
          if (/savevalid/g.test(bt)) {
            storage.setItem("v0.2a", t);
            load(t);
            global.flags.impatv = false;
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
        dom.ct_bt4_5b_nhx.addEventListener('click', function () { global.flags.impatv = false; empty(dom.ct_bt4_5b_nc); document.body.removeChild(dom.ct_bt4_5b_nc) });
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
        dom.ct_bt4_5b_nhz2.addEventListener('change', function () {
          let r = new FileReader();
          r.readAsText(this.files[0]);
          let storage = window.localStorage;
          r.addEventListener('load', function () {
            let t = b64_to_utf8(r.result);
            if (/savevalid/g.test(t)) {
              dom.ct_bt4_5b_nbc.value = 'Load Successful';
              storage.setItem("v0.2a", r.result);
              load(r.result);
              global.flags.impatv = false;
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
    dom.ct_bt4_61b.addEventListener('click',()=>{global.flags.msgtm=!global.flags.msgtm});
    */


    dom.gmsgs = addElement(document.body, 'div', 'gmsgs');
    dom.mstt = addElement(dom.gmsgs, 'div', 'mstt');
    if (!global.flags.aw_u) dom.gmsgs.style.display = 'none';
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
      if (global.flags.m_freeze === false) { global.flags.m_freeze = true; dom.m_b_1_c.innerHTML = 'Ｘ' }
      else { global.flags.m_freeze = false; dom.m_b_1_c.innerHTML = '' }
    });

    dom.m_b_2 = addElement(dom.m_control, 'small', null, 'msg-ctrl-btn');
    dom.m_b_2.innerHTML = '　stop combatlog　';
    dom.m_b_2.style.left = '19px';
    dom.m_b_2_c = addElement(dom.m_b_2, 'span', null, 'msg-badge');
    dom.m_b_2.addEventListener('click', () => {
      if (global.flags.m_blh === false) { global.flags.m_blh = true; dom.m_b_2_c.innerHTML = 'Ｘ' }
      else { global.flags.m_blh = false; dom.m_b_2_c.innerHTML = '' }
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

    function invbtsrst() {
      dom.inv_btn_1.removeAttribute('style');
      dom.inv_btn_2.removeAttribute('style');
      dom.inv_btn_3.removeAttribute('style');
      dom.inv_btn_4.removeAttribute('style');
      dom.inv_btn_5.removeAttribute('style');
      switch (global.sm) {
        case 1: dom.inv_btn_1.style.color = 'black';
          dom.inv_btn_1.style.backgroundColor = 'yellow';
          break;
        case 2: dom.inv_btn_2.style.color = 'black';
          dom.inv_btn_2.style.backgroundColor = 'yellow';
          break;
        case 3: dom.inv_btn_3.style.color = 'black';
          dom.inv_btn_3.style.backgroundColor = 'yellow';
          break;
        case 4: dom.inv_btn_4.style.color = 'black';
          dom.inv_btn_4.style.backgroundColor = 'yellow';
          break;
        case 5: dom.inv_btn_5.style.color = 'black';
          dom.inv_btn_5.style.backgroundColor = 'yellow';
          break;
      }
    }

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
    dom.inv_btn_1.addEventListener('click', function () { isort(1); invbtsrst() });
    dom.inv_btn_2.addEventListener('click', function () { isort(2); invbtsrst() });
    dom.inv_btn_3.addEventListener('click', function () { isort(3); invbtsrst() });
    dom.inv_btn_4.addEventListener('click', function () { isort(4); invbtsrst() });
    dom.inv_btn_5.addEventListener('click', function () { isort(5); invbtsrst() });
    dom.inv_btn_1_b.addEventListener('click', function () {
      if (global.flags.sort_a === true) {
        inv.sort(function (a, b) { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
        global.flags.sort_a = false;
      } else {
        inv.sort(function (a, b) { if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
        global.flags.sort_a = true;
      } iftrunkopenc(1);
      isort(global.sm)
    });
    dom.inv_btn_2_b.addEventListener('click', function () {
      if (global.flags.sort_b === true) {
        inv.sort(function (a, b) { if (a.amount < b.amount) return -1; if (a.amount > b.amount) return 1; if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
        global.flags.sort_b = false;
      } else {
        inv.sort(function (a, b) { if (a.amount > b.amount) return -1; if (a.amount < b.amount) return 1; if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
        global.flags.sort_b = true;
      } iftrunkopenc(1);
      isort(global.sm)
    });
    dom.inv_btn_3_b.addEventListener('click', function () {
      if (global.flags.sort_c === true) {
        inv.sort(function (a, b) { if (a.id < b.id) return -1; if (a.id > b.id) return 1; if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0 });
        global.flags.sort_c = false;
      } else {
        inv.sort(function (a, b) { if (a.id > b.id) return -1; if (a.id < b.id) return 1; if (a.name > b.name) return -1; if (a.name < b.name) return 1; return 0 });
        global.flags.sort_c = true;
      } iftrunkopenc(1);
      isort(global.sm)
    });
    dom.d3.update = function () { this.innerHTML = ' lvl:' + you.lvl + ' \'' + you.title.name + '\''; }
    dom.d5_1_1.update = function () { this.innerHTML = 'hp: ' + format3(you.hp.toString()) + '/' + format3(you.hpmax.toString()); dom.d5_1.style.width = 100 * you.hp / you.hpmax + '%' };
    dom.d5_2_1.update = function () { this.innerHTML = 'exp: ' + format3(Math.round(you.exp).toString()) + '/' + format3(you.expnext_t.toString()); dom.d5_2.style.width = 100 * you.exp / you.expnext_t + '%' };
    dom.d5_2_1.update();
    dom.d5_3_1.update = function () { this.innerHTML = 'energy: ' + format3(Math.round(you.sat).toString()) + '/' + format3(you.satmax.toString()) + ' eff: ' + Math.round(you.efficiency() * 100) + '%'; dom.d5_3.style.width = you.sat >= 0 ? 100 * you.sat / you.satmax + '%' : '0%' };
    dom.d6.update = function () { this.innerHTML = 'rank: ' + format3(you.rank().toString()) };
    dom.d6.update();
    dom.hit_c = function () {
      let hit_a = hit_calc(1);
      let hit_b = hit_calc(2);
      let drk = (global.flags.isdark && !cansee());
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
    dom.sl_l.addEventListener('click', () => load(null, true));
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
    dom.autosves.addEventListener('click', function () {
      global.flags.autosave = !global.flags.autosave;
      if (global.flags.autosave === true) timers.autos = setInterval(function () { save(true); }, 30000);
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
    dom.vrs.addEventListener('click', function () { window.open('/changelog/changelog.html', '_blank') });
    dom.vrs.href = 'changelog';
    dom.sl_kill = addElement(dom.sl, 'span', null, 'sl');
    dom.sl_kill.style.position = 'fixed';
    dom.sl_kill.style.width = 'auto';
    dom.sl_kill.innerHTML = 'delete the save';
    dom.sl_kill.style.right = '5px';
    dom.sl_kill.style.bottom = '1px';
    dom.sl_kill.addEventListener('click', () => { localStorage.clear(); msg('Save deleted', '') });

    export function update_db() {
      dom.d4_1.innerHTML = 'STR: ' + Math.round(you.str_d);
      dom.d4_2.innerHTML = 'AGL: ' + Math.round(you.agl_d);
      dom.d4_3.innerHTML = 'INT: ' + Math.round(you.int_d);
      dom.d4_4.innerHTML = 'SPD: ' + you.spd;
    } update_db()

    export function update_d() {
      dom.d5_1_1m.innerHTML = 'hp: ' + format3(global.current_m.hp.toString()) + '/' + format3(global.current_m.hpmax.toString());
      dom.d5_1m.style.width = 100 * global.current_m.hp / global.current_m.hpmax + '%';
      dom.hit_c();
      dom.d5_3_1.update();
      dom.d5_1_1.update();
    } update_d()

    global.text.mtp = ['Human', 'Beast', 'Undead', 'Evil', 'Phantom', 'Dragon'];

    export function update_m() {
      dom.d2m.innerHTML = global.current_m.name;
      let mtp = global.text.mtp[global.current_m.type];
      if (global.current_m.id >= 1) mtp += global.current_m.sex === true ? ' ♂' : ' ♀';
      dom.d3m.innerHTML = ' lvl:' + global.current_m.lvl + ' \'' + mtp + '\'';
      dom.d4_1m.innerHTML = 'STR: ' + Math.round(global.current_m.str);
      dom.d4_2m.innerHTML = 'AGL: ' + Math.round(global.current_m.agl);
      dom.d4_3m.innerHTML = 'INT: ' + Math.round(global.current_m.int);
      dom.d4_4m.innerHTML = 'SPD: ' + global.current_m.spd;
      dom.d9m.update();
    }

    testz = new (area._ctor)();
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

    export function msg(txt, c, dsc, type, bc, chck) {
      if (global.flags.m_freeze === false && global.flags.loadstate === false) {
        while (dom.gmsgs.children[1].children.length > global.msgs_max - 1) dom.gmsgs.children[1].removeChild(dom.gmsgs.children[1].children[0]);
        let msg = addElement(dom.mscont, 'div', null, 'msg');
        if (global.flags.msgtm) {
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

    export function _msg(txt, c, dsc, type, bc, chck) {
      while (dom.gmsgs.children[1].children.length > global.msgs_max - 1) dom.gmsgs.children[1].removeChild(dom.gmsgs.children[1].children[0]);
      let msg = addElement(dom.mscont, 'div', null, 'msg');
      if (dsc) { if (type) addDesc(msg, dsc, type); else addDesc(msg, dsc); }
      if (c) msg.innerHTML = '<span style=color:' + c + (bc ? (';background-color:' + bc) : '') + '>' + txt + '</span>';
      else msg.innerHTML = txt;
      dom.mscont.scrollTop = dom.mscont.scrollHeight;
    }


    function msg_add(txt, c, bc, shd) {
      if (global.flags.m_freeze === false && global.flags.loadstate === false) {
        let bac = '';
        let b = '';
        if (bc) bac = 'background-color:' + bc;
        if (shd) b = 'text-shadow:' + shd.toString();
        else b = '';
        if (c) dom.gmsgs.children[1].children[dom.gmsgs.children[1].children.length - 1].innerHTML += '<span style=\"color:' + c + ';' + bac + ';' + b + '\">' + txt + '</span>';
        else dom.gmsgs.children[1].children[dom.gmsgs.children[1].children.length - 1].innerHTML += txt;
        dom.mscont.scrollTop = dom.mscont.scrollHeight;
      }
    }

    function format(thing, what) {
      msg('wHw')
    }

    // appear, fade imported from ./dom-utils

    function addDesc(dm, what, type, ttl, dsc, f, id) {
      dm.addEventListener('mouseenter', a => { dscr(a, what, type, ttl, f === true ? (dsc)() : dsc, id); giveSkExp(skl.rdg, .002); global.stat.popt++; global.curwds = this; global.shiftid = id; if (global.kkey === 1) descsinfo(global.shiftid) });
      dm.addEventListener('mousemove', a => { global.dscr.style.top = global.dscr.clientHeight + 60 + a.clientY > document.body.clientHeight ? (a.clientY + 30 + global.dscr.clientHeight) - ((a.clientY + 30 + global.dscr.clientHeight) - document.body.clientHeight) - global.dscr.clientHeight - 30 : a.clientY + 30; global.dscr.style.left = global.dscr.clientWidth + 60 + a.clientX > document.body.clientWidth ? (a.clientX + 30 + global.dscr.clientWidth) - ((a.clientX + 30 + global.dscr.clientWidth) - document.body.clientWidth) - global.dscr.clientWidth - 30 : a.clientX + 30; });
      dm.addEventListener('mouseleave', () => { global.shiftid = 0; empty(global.dscr); global.dscr.style.display = 'none'; clearInterval(timers.inup); clearInterval(timers.dp_tmr); clearInterval(timers.wpnkilsch); if (dom.dscshe) dom.dscshe.innerHTML = '' });
    }

    global.t_n = 0;

    function allbuff(who) {
      who.stat_r();
      for (let g in who.eff) if (who.eff[g].type === 1) who.eff[g].use(who.eff[g].y, who.eff[g].z);
      if (who.id === you.id) {
        let dm = skl.fgt.use();
        if (you.eqp[0].twoh === true) dm += skl.twoh.use();
        you.str += dm;
        you.int += dm;
        usePlayerWeaponSkill();
      }
    }

    function fght(att, def) {
      /*if(global.flags.btlinterrupt===true){
        msg('battle interrupted');
        if(global.current_z.size>0) {area_init(global.current_z);global.current_z.size--;}else if(global.current_z.size===-1)area_init(global.current_z);
        else {msg('Area cleared','orange');global.current_z.onEnd();global.flags.civil=true;global.flags.btl=false;};
        dom.d7m.update();
        global.flags.btlinterrupt=false;
        return;
      }*/
      if (!att.alive || !def.alive) {
        return;
      }
      if (global.flags.smkactv) { global.flags.smkactv = false; return; }
      att.stat_r();
      def.stat_r();
      for (let g in att.eff) if (att.eff[g].type === 1) att.eff[g].use(att.eff[g].y, att.eff[g].z);
      for (let g in def.eff) if (def.eff[g].type === 1) def.eff[g].use(def.eff[g].y, def.eff[g].z);
      if (att.spd > 0 && def.spd > 0) {
        global.s_l += Math.abs(att.spd - def.spd);
      } else {
        global.s_l = Math.abs(att.spd - def.spd);
      }
      let inn, sc;
      if (att.spd >= def.spd || att.spd <= 0) { inn = att; sc = def; } else { inn = def; sc = att };
      global.miss = 0;
      let isyouinn = inn.id === you.id;
      //if(isyouinn===false){if(random()<.9){console.log('stealth active'); inn=att; sc=def}}
      if (inn.spd > 0) {
        if (global.s_l / sc.spd >= 2) {
          let acc_dmg = 0;
          let hts = 0;
          global.flags.multih = true;
          for (let ii = 0; ii < Math.ceil(global.s_l / sc.spd); ii++) {
            hts++;
            acc_dmg += inn.battle_ai(inn, sc);
            if (sc.hp <= 0) break;
          }
          global.flags.multih = false;
          if (att.id === you.id && acc_dmg >= sc.hpmax) global.stat.onesht++;
          if (global.flags.m_blh === false && (hts - global.miss) > 0) {
            if (hts === 1) printHitMessage(inn.name, acc_dmg, !isyouinn);
            else
              printMultihitMessage(hts, inn.name, acc_dmg, !isyouinn);
          }
          else if (global.flags.m_blh === false) msg(inn.name + ' missed', 'grey');
          if (sc.hp <= 0 && sc.alive === true) { global.atkdfty = [3, global.atkdftydt]; sc.onDeath(inn); sc.onDeathE(inn); }
          global.s_l = global.s_l % sc.spd;
        } else {
          doSingleAttack(inn, sc, isyouinn);
        }
      }
      if (!sc.alive) {
        you.stat_r();
        return;
      }
      timers.btl2 = setTimeout(function () {
        if (global.flags.btl === true) {
          doSingleAttack(sc, inn, !isyouinn);
          you.stat_r();
        }
      }, 500 / global.fps);
    }

    export function attack(att, def, atk, power) {
      if (!global.flags.btl) return
      allbuff(att);
      allbuff(def);
      atk = atk || abl.default;
      let isyou = att.id === you.id;
      global.mabl = atk;
      let dmg;
      let hit;
      let dk = false
      let a = 2 + rand(4);
      if (isyou === true) {
        wpnhitstt();
        hit = hit_calc(1);
        giveSkExp(skl.fgt, def.rnk);
        dk = global.flags.isdark && !cansee();
        if (dk) hit *= .3 + skl.ntst.lvl * .07;
      } else hit = hit_calc(2);
      global.target = you.eqp[a];
      global.t_n = a;
      if (rand(100) < hit) {
        global.target_g = a;
        if (isyou === true) {
          let t = you.eqp[0].dp > 0 ? 1 : .5;
          switch (you.eqp[0].wtype) {
            case 0: giveSkExp(skl.unc, t);
              break;
            case 1: giveSkExp(skl.srdc, t);
              break;
            case 2: giveSkExp(skl.axc, t);
              break;
            case 3: giveSkExp(skl.knfc, t);
              break;
            case 4: giveSkExp(skl.plrmc, t);
              break;
            case 5: giveSkExp(skl.hmrc, t);
              break;
            case 6: giveSkExp(skl.stfc, t);
              break;
          }
          if (dk) giveSkExp(skl.ntst, .1);
          if (you.mods.tstl > 0) {
            itm = select(def.drop);
            if (random() < (itm.chance + (itm.chance / 100 * you.luck)) * .01 * skl.stel.use()) { giveItem(itm.item); giveSkExp(skl.stel, 1 / itm.chance * 10) } else giveSkExp(skl.stel, 1);
          }
        } else {
          if (you.eqp[1].id !== 10000 && !you.eqp[0].twoh) giveSkExp(skl.shdc, .2);
          you.stat_r();
          if (you.mods.ddgmod !== 0) if (random() < you.mods.ddgmod) { global.miss++; if (global.flags.m_blh === false && (!global.flags.multih && global.flags.m_blh === false)) msg(att.name + ' missed', 'grey'); global.flags.msd = true; giveSkExp(skl.evas, .5); return 0 }
        }
        dmg = Math.round(atk.f(att, def, power));
        def.hp -= dmg;
        global.flags.msd = false;
        if (global.flags.m_blh === false && (!global.flags.multih && global.flags.m_blh === false)) printHitMessage(att.name, dmg, att.id === you.id ? false : true);
        if (isyou === true) {
          dom.d8_2.innerHTML = 'Critical chance: ' + (Math.round(you.mods.crflt * 1000 + ((you.crt * (2 - (you.sat / you.satmax + you.mods.sbonus) * 2) + you.crt) * (you.luck / 25 + 1) + skl.seye.use()) * 1000) / 10) + '%'; if (you.eqp[0].id != 10000) you.eqp[0].dp > 0 ? you.eqp[0].dp -= .008 : you.eqp[0].dp = 0; global.stat.dmgdt += dmg;
          if (global.flags.eshake === true) {
            dom.d1m.style.left = parseInt(global.special_x) + rand(-3, 3) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + rand(-3, 3) + 'px';
            setTimeout(() => { dom.d1m.style.left = parseInt(global.special_x) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + 'px'; }, 60);
          }
        }
        else { if (global.target.id !== 10000) global.target.dp > 0 ? global.target.dp -= .008 : global.target.dp = 0; if (you.eqp[1].id !== 10000) you.eqp[1].dp > 0 ? you.eqp[1].dp -= .008 : you.eqp[1].dp = 0; if (dmg > 0) giveSkExp(skl.painr, 1); if (global.target.id === 10000 && dmg > 0) giveSkExp(skl.tghs, dmg * .05); global.stat.dmgrt += dmg }
      } else {
        global.miss++;
        global.stat.misst++;
        ;
        if (global.flags.m_blh === false && (!global.flags.multih && global.flags.m_blh === false)) msg(att.name + ' missed', 'grey');
        global.flags.msd = true;
        if (dk) giveSkExp(skl.ntst, .01);
        if (!isyou) global.stat.dodgt++;
      } update_d();
      if (!global.flags.multih) { if (isyou && dmg >= def.hpmax) global.stat.onesht++; if (def.hp <= 0 && def.alive === true) { global.atkdfty = [3, global.atkdftydt]; def.onDeath(att); def.onDeathE(att); } }
      return dmg || 0;
    }

    function tattack(pow, type, e) {
      let dmg;
      let ddat = skl.thr.use();
      let m = global.current_m;
      global.atkdftm[0] = type;
      let agl_bonus = 0;
      let spd = m.spd > 0 ? m.spd : 0;
      for (let i = 0; i < you.eqp.length; i++) agl_bonus += you.eqp[i].agl;
      let hit = ((you.agl + agl_bonus / 2) * you.efficiency()) / ((spd * 5 + m.agl)) * 130 + 5 + ddat.b;
      giveSkExp(skl.thr, e);
      giveSkExp(skl.fgt, skl.thr.lvl * 5 + 1);
      if (rand(100) < hit) {
        dmg = Math.round(((1 + you.str_r * .05) * (you.efficiency() + 1) * pow * (ddat.a + 1)) / 2);
        global.stat.dmgdt += dmg;
        if (!global.flags.m_blh) msg('You hit ' + global.current_m.name + ' for <span style="color:hotpink">' + dmg + '</span> damage', 'yellow');
        global.current_m.hp -= dmg;
        if (m.hp <= 0 && m.alive === true) { m.onDeath(you); m.onDeathE(); } dom.d5_1_1m.update();
        if (global.flags.eshake === true) {
          dom.d1m.style.left = parseInt(global.special_x) + rand(-3, 3) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + rand(-3, 3) + 'px';
          setTimeout(() => { dom.d1m.style.left = parseInt(global.special_x) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + 'px'; }, 60);
        }
      } else {
        if (global.flags.m_blh === false) msg(you.name + ' missed', 'grey');
      }
    }

    export function dmg_calc(att, def, atk) {
      let isyou = att.id === you.id;
      let atea = atk.aff || isyou ? att.eqp[0].atype : att.atype;
      let atcs = atk.class || isyou ? att.eqp[0].ctype : att.ctype;
      global.atype_d = atk.aff || att.atype;
      let ta = effect.tarnish.active === true ? .7 : (effect.prostasia.active === true ? 1.3 : 1);
      let eff = you.efficiency();
      let dmg = 0;
      let b = 1;
      if (atk.stt === 1) {
        if (isyou === true) {
          global.atype_d = atk.aff || you.eqp[0].atype; global.atkdftm = [atea, atcs, 0];
          let b = you.luck / 25 + 1;
          let undc = 0;
          if (you.eqp[0].id === 10000) undc = you.mods.undc;
          dmg = (att.str * eff + (((att.eqp[0].str + undc) * (att.eqp[0].dp / att.eqp[0].dpmax) * .9 + .1) * (att.eqp[0].id === 10000 ? 1 : ta))) * (100 + (att.eqp[0].aff[atea] * 10 + atk.affp * 10 + att.eqp[0].cls[atcs] * 10 + att.maff[global.current_m.type] * 10 + att.aff[atea] * 10) * (att.eqp[0].id === 10000 ? 1 : ta)) / 100 - (def.str * (100 + def.aff[atea] * 5 + def.cls[atcs] * 5) / 100) + 1;
        } else {
          dmg = (att.str * (100 + att.eqp[0].aff[att.atype] * 10 + atk.affp * 10 + att.eqp[0].cls[att.ctype] * 10) / 100 - ((def.str * eff + (global.target.str * ((global.target.dp / global.target.dpmax) * .85 + .15) * ta)) * (100 + global.target.aff[att.atype] * 5 * ta + global.target.cls[att.ctype] * 5 * ta + you.caff[att.atype] * 10 + you.cmaff[global.current_m.type] * 10 + you.ccls[att.ctype] * 10) / 100 + ((you.eqp[1].str * (1 + skl.shdc.lvl / 20) * (you.eqp[1].dp / you.eqp[1].dpmax) * .6 + .4) * ta) / 2) * (100 - (you.eqp[1].aff[att.atype] * 5 * (1 + skl.shdc.lvl / 20) + global.target.cls[att.ctype] * 5 * (1 + skl.shdc.lvl / 20) * ta)) / 100);
          b = 1;
        }
      }
      else if (atk.stt === 2) {
        if (isyou === true) {
          global.atype_d = atk.aff || you.eqp[0].atype;
          let b = you.luck / 20 + 1;
          dmg = (att.int * eff + ((att.eqp[0].int * (att.eqp[0].dp / att.eqp[0].dpmax) * .9 + .1) * (att.eqp[0].id === 10000 ? 1 : ta))) * (100 + (att.eqp[0].aff[atea] * 10 + atk.affp * 10 + att.eqp[0].cls[atcs] * 10 + att.maff[global.current_m.type] * 10 + att.aff[atea] * 10) * (att.eqp[0].id === 10000 ? 1 : ta)) / 100 - (def.int * (100 + def.aff[atea] * 5 + def.cls[atcs] * 5) / 100) + 1;
        } else {
          dmg = (att.int * (100 + att.eqp[0].aff[att.atype] * 15 + atk.affp * 15 + att.eqp[0].cls[att.ctype] * 5) / 100 - ((def.int * eff + (global.target.int * ((global.target.dp / global.target.dpmax) * .85 + .15) * ta)) * (100 + global.target.aff[att.atype] * 5 * ta + global.target.cls[att.ctype] * 5 * ta + you.caff[att.atype] * 10 + you.cmaff[global.current_m.type] * 10 + you.ccls[att.ctype] * 10) / 100 + ((you.eqp[1].int * (1 + skl.shdc.lvl / 20) * (you.eqp[1].dp / you.eqp[1].dpmax) * .6 + .4) * ta) / 2) * (100 - (you.eqp[1].aff[att.atype] * 5 * (1 + skl.shdc.lvl / 20) + global.target.cls[att.ctype] * 5 * (1 + skl.shdc.lvl / 20) * ta)) / 100);
          b = 1;
        }
      }
      let ran = random();
      let c = 0;
      if (isyou === true) c = skl.seye.use();
      let ctr_r = (att.crt * (2 - (you.sat / you.satmax + you.mods.sbonus) * 2) + att.crt) * b + c + you.mods.crflt;
      if (isyou === false && dmg > 0) {
        switch (global.atype_d) {
          case 1: giveSkExp(skl.aba, dmg * .01);
            break;
          case 2: giveSkExp(skl.abe, dmg * .01);
            break;
          case 3: giveSkExp(skl.abf, dmg * .01);
            break;
          case 4: giveSkExp(skl.abw, dmg * .01);
            break;
          case 5: giveSkExp(skl.abl, dmg * .01);
            break;
          case 6: giveSkExp(skl.abd, dmg * .01);
            break;
        }
        global.atkdftydt.a = atea;
        global.atkdftydt.c = atcs;
        global.atkdftydt.id = att.id
      }
      let pn = isyou === true ? 1 : 1 - skl.painr.use();
      dmg = dmg * def.res.ph * pn;
      if (ran < ctr_r) {
        let cpw = 1; let dmod = 1; let cbst = 1;
        if (isyou === true) {
          giveSkExp(skl.seye, 1); cpw = you.mods.cpwr; cbst = 1 + skl.war.use();
          dom.d1m.style.left = parseInt(global.special_x) + rand(-3, 3) + 'px';
          dom.d1m.style.top = parseInt(global.special_y) + rand(-3, 3) + 'px';
          setTimeout(() => { dom.d1m.style.left = parseInt(global.special_x) + 'px'; dom.d1m.style.top = parseInt(global.special_y) + 'px'; }, 60);
        } else {
          giveSkExp(skl.dngs, 1);
          sk = skl.dngs.use();
          dmod = 1 - sk * (sk > 25 ? .01 : .02)
        }
        if (dmg <= 0) dmg = 0;
        cdmg = dmg * randf(1.9 * cpw, 2.1 * cpw) * .5 * dmod * cbst;
        global.flags.crti = true;
        return dmg + cdmg <= 1 ? rand(1, 5) : Math.ceil((dmg + cdmg) * att.dmlt * randf(.9, 1.1)) + rand(1, 5);
      } else return dmg > 0 ? Math.ceil(dmg * att.dmlt * randf(.9, 1.1)) : 0;
    }

    function dumb(x) {
      if (x) {
        let arr = [];
        for (let m = 0; m < 5; m++) {
          arr[m] = new Object();
          arr[m].obj = addElement(document.body, 'span', null, 'floating-text');
          arr[m].obj.style.pointerEvents = 'none';
          arr[m].obj.innerHTML = select(['x', 'X', '*', '#', '$']);
          arr[m].obj.style.top = -55;
          arr[m].obj.style.left = -55;
          arr[m].posx = x.clientX;
          arr[m].posy = x.clientY;
          arr[m].accx = rand(-10, 10);
          arr[m].accy = rand(15, 25);
        }
        let t = 0;
        let g = setInterval(() => {
          t++;
          for (let m = 0; m < 5; m++) {
            arr[m].obj.style.top = arr[m].posy - (arr[m].accy - t) * t * .4;
            arr[m].obj.style.left = arr[m].posx + arr[m].accx * t * .5;
            arr[m].obj.style.opacity = (30 - t) / 30;
          }
          if (t === 30) {
            clearInterval(g);
            for (let m = 0; m < 5; m++) document.body.removeChild(arr[m].obj);
          }
        }, 20);
      }
    }

    function mf(num, index) {
      let d = addElement(document.body, 'small');
      let c = ['rgb(255, 116, 63)', 'rgb(192, 192, 192)', 'rgb(255, 215, 0)'];
      d.style.position = 'absolute';
      d.style.opacity = 1;
      d.style.width = 100;
      d.style.top = 755;
      d.style.left = 328 - 50 * index;
      d.innerHTML = '<span style="color: ' + c[index - 1] + '">●</span><span style="color: rgb(255,70,70)">' + num + '</span>';
      let t = 0;
      let g = setInterval(() => {
        t++;
        d.style.top = parseInt(d.style.top) - 2 + 'px';
        d.style.opacity = (30 - t) / 30;
        if (t === 30) {
          clearInterval(g);
          document.body.removeChild(d);
        }
      }, 30);
    }

    export function hit_calc(tp) {
      if (tp === 1) {
        let agl_bonus = 0;
        let spd = global.current_m.spd > 0 ? global.current_m.spd : 0;
        for (let i = 0; i < you.eqp.length; i++) agl_bonus += you.eqp[i].agl;
        //return (200 + ((you.agl+agl_bonus)*you.efficiency()) - (global.current_m.spd+global.current_m.agl+100/(100*you.efficiency())*100));
        return ((you.agl + agl_bonus / 2) * you.efficiency()) / ((spd + global.current_m.agl + global.current_m.eva)) * 130 + 5;
      }
      else if (tp === 2) {
        let agl_bonus = 0;
        let spd = you.spd > 0 ? you.spd : 0;
        for (let i = 0; i < you.eqp.length; i++) agl_bonus += you.eqp[i].agl;
        return global.current_m.agl / ((spd + you.agl + agl_bonus / 2) * you.efficiency()) * 100 + 10 - skl.evas.lvl
        //return (210 + global.current_m.agl - (you.spd+you.agl+100*(100*you.efficiency())/100)); 
      }
    }

    function wpnhitstt() {
      switch (you.eqp[0].wtype) {
        case 0: global.stat.msts[0][0]++;
          break
        case 1: global.stat.msts[1][0]++;
          break
        case 2: global.stat.msts[2][0]++;
          break
        case 3: global.stat.msts[3][0]++;
          break
        case 4: global.stat.msts[4][0]++;
          break
        case 5: global.stat.msts[5][0]++;
          break
        case 6: global.stat.msts[6][0]++;
          break
        case 7: global.stat.msts[7][0]++;
          break
      }
    }

    export function wpndiestt(killer, me) {
      switch (killer.eqp[0].wtype) {
        case 0: global.stat.msts[0][1]++;
          break
        case 1: global.stat.msts[1][1]++;
          break
        case 2: global.stat.msts[2][1]++;
          break
        case 3: global.stat.msts[3][1]++;
          break
        case 4: global.stat.msts[4][1]++;
          break
        case 5: global.stat.msts[5][1]++;
          break
        case 6: global.stat.msts[6][1]++;
          break
        case 7: global.stat.msts[7][1]++;
          break
      }
      switch (me.type) {
        case 0: global.stat.msks[0]++;
          break
        case 1: global.stat.msks[1]++;
          break
        case 2: global.stat.msks[2]++;
          break
        case 3: global.stat.msks[3]++;
          break
        case 4: global.stat.msks[4]++;
          break
        case 5: global.stat.msks[5]++;
          break
      }
    }

    function renderRcp(rcp) {
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

    function refreshRcp(fl) {
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

    function renderSkl(skl) {
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

    export function area_init(area) {
      if (area.size !== 0) {
        if (area.id !== 101) {
          let rnd = random();
          for (let obj in area.pop) if (rnd >= area.popc[obj][0] && rnd <= area.popc[obj][1]) if (!area.pop[obj].cond || area.pop[obj].cond() === true) {
            global.flags.civil = false;
            global.flags.btl = true;
            global.current_z = area;
            let temp = area.pop[obj];
            let newobj = temp.crt.id === creature.default.id ? creature.default : mon_gen(temp.crt);
            lvlup(newobj, rand(temp.lvlmin - 1, temp.lvlmax - 1));
            //newobj.data.lasthp=newobj.hp; 
            global.current_m = newobj;
            update_m();
            dom.d5_1_1m.update();
            if (!!dom.d7m) dom.d7m.update();
            //dom.d5m.update();
            return newobj;
          } else (area_init(area));
        }
      } else msg('nobody\'s here');
      if (!!dom.d7m) dom.d7m.update();
      update_m();
      dom.d5_1_1m.update();
    }

    function mon_gen(crt) {
      crt.eff = [];
      global.e_em = [];
      empty(dom.d101m);
      let newobj = copy(crt);
      newobj.drop = crt.drop;
      if (!global.flags.inside) {
        if (global.flags.israin) giveEff(newobj, effect.wet, 5)
        if (global.flags.iscold) giveEff(newobj, effect.cold, 25)
      }
      newobj.sex = random() < .5;
      return newobj;
    }

    export function giveEff(target, e, d, y, z) {
      if (target.id !== 0) {
        let ef = e;
        if (target.id !== you.id) { ef = new Object(); for (let g in e) ef[g] = e[g]; }
        if (target.id === you.id || global.flags.btl) {
          let p = findbyid(target.eff, e.id);
          if (!p || !p.active) {
            if (d) ef.duration = d; ef.y = y; ef.z = z; if (ef.x) eff_d(ef, ef.x, ef.c, ef.b, target);
            ef.target = target;
            target.eff.push(ef);
          } ef.onGive(d, y, z); ef.active = true;
        } effdfix();
        target.stat_r();
        return e
      }
    }


    export function removeEff(e, t) {
      if (e.active === true) {
        if (e.x) {
          if (e.target.id === you.id) {
            node = global.e_e.indexOf(e); dom.d101.removeChild(dom.d101.children[node]); global.e_e.splice(node, 1);
            if (dom.d101.children.length > you.eff.length) empty(dom.d101);
          }
          else {
            node = global.e_em.indexOf(e); dom.d101m.removeChild(dom.d101m.children[node]); global.e_em.splice(node, 1);
            if (dom.d101m.children.length > e.target.eff.length) empty(dom.d101m);
          } e.onRemove(); global.dscr.style.display = 'none';
        } e.target.eff.splice(e.target.eff.indexOf(e), 1); e.active = false; clearInterval(timers.inup); effdfix()
      }
      e.target.stat_r();
    }

    function effdfix() {
      if (you.eff.length >= 21) {
        dom.d7.style.height = 104;
        for (let i = 0; i < document.getElementsByClassName('sprite-cell').length; i++) document.getElementsByClassName('sprite-cell')[i].style.display = 'inline-block';
        document.getElementById('se_i').style.display = 'block';
      } else {
        dom.d7.style.height = 125;
        for (let i = 0; i < document.getElementsByClassName('sprite-cell').length; i++) document.getElementsByClassName('sprite-cell')[i].style.display = '';
        document.getElementById('se_i').style.display = 'flex';
      }
    }

    function eff_d(e, s, c, b, tgt) {
      if (tgt.id === you.id) {
        let ic = addElement(dom.d101, 'div', null, 'sprite-cell');
        ic.innerHTML = s;
        ic.style.color = c;
        ic.style.backgroundColor = b;
        ic.addEventListener('click', () => { e.onClick() })
        addDesc(ic, e, 4, e.name, e.desc);
        if (e.duration !== 0) global.e_e.push(e);
      }
      else {
        let ic = addElement(dom.d101m, 'div', null, 'sprite-cell');
        ic.innerHTML = s;
        ic.style.color = c;
        ic.style.backgroundColor = b;
        addDesc(ic, e, 4, e.name, e.desc);
        if (e.duration !== 0) global.e_em.push(e);
      }
    }

    export function equip(w, flags) {
      if (!w.data || !w.data.uid) return;
      if (w.data.uid === you.eqp[w.slot - 1].data.uid) { unequip(w); if (w.twoh === true) { dom.d7_slot_2.innerHTML = 'Shield'; dom.d7_slot_2.style.color = 'grey' }; isort(global.sm) } else {
        if (w.req && !w.req() && !global.flags.loadstate) { msg("Requirenments not met!", 'red'); return }
    /*switch(w.slot){
      case 5 :{
        if(you.eqp[4].id===10000) you.eqp[4]=w;
        else if(you.eqp[5].id===10000) {you.eqp[5]=w;w.slot=6} else {unequip(you.eqp[4]);you.eqp[4]=w}
      } break;
      case 6 :{
        if(you.eqp[5].id===10000) you.eqp[5]=w;
        else if(you.eqp[4].id===10000) {you.eqp[4]=w;w.slot=5} else {unequip(you.eqp[5]);you.eqp[5]=w}
      } break;
    default: {unequip(you.eqp[w.slot-1]); you.eqp[w.slot-1] = w;};
    break
    }*/  unequip(you.eqp[w.slot - 1]); you.eqp[w.slot - 1] = w;
        if (w.twoh === true) { if (you.eqp[1].id !== 10000) unequip(you.eqp[1]) } else if (you.eqp[1].id !== 10000 && you.eqp[0].twoh === true) unequip(you.eqp[0]);
        if (w.eff.length > 0) for (let k = 0; k < w.eff.length; k++) { w.eff[k].use(w.eff[k].y, w.eff[k].z); giveEff(you, w.eff[k]) }
        w.oneq();
        if (w.degrade) planner.itmwear.data.items.push(w)
        if (w.slot === 1) you.atkmode = w.atkmode;
        w.wc = global.text.wecs[w.rar][0];
        //w.wbc=global.text.wecs[w.rar][1];
        let spst;
        switch (w.rar) {
          case 2: spst = '0px 0px 2px blue';
            break;
          case 3: spst = '0px 0px 2px lime';
            break;
          case 4: spst = '0px 0px 3px orange';
            break;
          case 5: spst = '0px 0px 2px crimson,0px 0px 5px red';
            break;
          case 6: spst = '1px 1px 1px black,0px 0px 2px purple';
            break;
        }
        switch (w.slot - 1) {
          case 0: { dom.d7_slot_1.removeAttribute('style'); dom.d7_slot_1.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_1.style.color = w.wc; dom.d7_slot_1.style.textShadow = spst }; if (!!w.wbc) dom.d7_slot_1.style.backgroundColor = w.wbc; } break;
          case 1: { dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_2.style.color = w.wc; dom.d7_slot_2.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_2.style.backgroundColor = w.wbc; } break;
          case 2: { dom.d7_slot_3.removeAttribute('style'); dom.d7_slot_3.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_3.style.color = w.wc; dom.d7_slot_3.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_3.style.backgroundColor = w.wbc; } break;
          case 3: { dom.d7_slot_4.removeAttribute('style'); dom.d7_slot_4.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_4.style.color = w.wc; dom.d7_slot_4.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_4.style.backgroundColor = w.wbc; } break;
          case 4: { dom.d7_slot_5.removeAttribute('style'); dom.d7_slot_5.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_5.style.color = w.wc; dom.d7_slot_5.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_5.style.backgroundColor = w.wbc; } break;
          case 5: { dom.d7_slot_6.removeAttribute('style'); dom.d7_slot_6.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_6.style.color = w.wc; dom.d7_slot_6.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_6.style.backgroundColor = w.wbc; } break;
          case 6: { dom.d7_slot_7.removeAttribute('style'); dom.d7_slot_7.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_7.style.color = w.wc; dom.d7_slot_7.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_7.style.backgroundColor = w.wbc; } break;
          case 7: { dom.d7_slot_8.removeAttribute('style'); dom.d7_slot_8.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_8.style.color = w.wc; dom.d7_slot_8.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_8.style.backgroundColor = w.wbc; } break;
          case 8: { dom.d7_slot_9.removeAttribute('style'); dom.d7_slot_9.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_9.style.color = w.wc; dom.d7_slot_9.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_9.style.backgroundColor = w.wbc; } break;
          case 9: { dom.d7_slot_10.removeAttribute('style'); dom.d7_slot_10.innerHTML = you.eqp[w.slot - 1].name; if (!!w.wc) { dom.d7_slot_10.style.color = w.wc; dom.d7_slot_10.style.textShadow = spst } if (!!w.wbc) dom.d7_slot_10.style.backgroundColor = w.wbc; } break;
        }
        if (w.twoh === true) { dom.d7_slot_2.innerHTML = you.eqp[0].name; dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.style.color = 'lightgrey' } else {
          if (you.eqp[1].id === 10000) { dom.d7_slot_2.innerHTML = 'Shield'; dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.style.color = 'grey' }
        }
        if (!flags || !flags.save) { you.stat_r(); update_d(); isort(global.sm) }
      }
    }

    function unequip(w, flags) {
      if (!w.data || !w.data.uid) return;
      if (w.eff.length > 0) for (let k = 0; k < w.eff.length; k++) { w.eff[k].un(); removeEff(w.eff[k]) }
      w.onuneq();
      you.eqp[w.slot - 1] = eqp.dummy;
      if (w.degrade) planner.itmwear.data.items.splice(planner.itmwear.data.items.indexOf(w), 1)
      switch (w.slot - 1) {
        case 0: { dom.d7_slot_1.innerHTML = 'Weapon'; dom.d7_slot_1.removeAttribute('style'); dom.d7_slot_1.style.color = 'grey'; you.eqp[0].cls[2] = you.lvl / 5 << 0; you.eqp[0].aff[0] = you.lvl / 8 << 0; you.eqp[0].ctype = 2 } break;
        case 1: { dom.d7_slot_2.innerHTML = 'Shield'; dom.d7_slot_2.removeAttribute('style'); dom.d7_slot_2.style.color = 'grey' } break;
        case 2: { dom.d7_slot_3.innerHTML = 'Head'; dom.d7_slot_3.removeAttribute('style'); dom.d7_slot_3.style.color = 'grey' } break;
        case 3: { dom.d7_slot_4.innerHTML = 'Body'; dom.d7_slot_4.removeAttribute('style'); dom.d7_slot_4.style.color = 'grey' } break;
        case 4: { dom.d7_slot_5.innerHTML = 'L arm'; dom.d7_slot_5.removeAttribute('style'); dom.d7_slot_5.style.color = 'grey' } break;
        case 5: { dom.d7_slot_6.innerHTML = 'R arm'; dom.d7_slot_6.removeAttribute('style'); dom.d7_slot_6.style.color = 'grey' } break;
        case 6: { dom.d7_slot_7.innerHTML = 'Legs'; dom.d7_slot_7.removeAttribute('style'); dom.d7_slot_7.style.color = 'grey' } break;
        case 7: { dom.d7_slot_8.innerHTML = 'Accessory'; dom.d7_slot_8.removeAttribute('style'); dom.d7_slot_8.style.color = 'grey' } break;
        case 8: { dom.d7_slot_9.innerHTML = 'Accessory'; dom.d7_slot_9.removeAttribute('style'); dom.d7_slot_9.style.color = 'grey' } break;
        case 9: { dom.d7_slot_10.innerHTML = 'Accessory'; dom.d7_slot_10.removeAttribute('style'); dom.d7_slot_10.style.color = 'grey' } break;
      }
      if (!flags || !flags.save) { you.stat_r(); update_d() }
    }

    function eqpres() {
      dom.d7_slot_1.innerHTML = 'Weapon';
      dom.d7_slot_1.removeAttribute('style');
      dom.d7_slot_1.style.color = 'grey';
      dom.d7_slot_2.innerHTML = 'Shield';
      dom.d7_slot_2.removeAttribute('style');
      dom.d7_slot_2.style.color = 'grey';
      dom.d7_slot_3.innerHTML = 'Head';
      dom.d7_slot_3.removeAttribute('style');
      dom.d7_slot_3.style.color = 'grey';
      dom.d7_slot_4.innerHTML = 'Body';
      dom.d7_slot_4.removeAttribute('style');
      dom.d7_slot_4.style.color = 'grey';
      dom.d7_slot_5.innerHTML = 'L arm';
      dom.d7_slot_5.removeAttribute('style');
      dom.d7_slot_5.style.color = 'grey';
      dom.d7_slot_6.innerHTML = 'R arm';
      dom.d7_slot_6.removeAttribute('style');
      dom.d7_slot_6.style.color = 'grey';
      dom.d7_slot_7.innerHTML = 'Legs';
      dom.d7_slot_7.removeAttribute('style');
      dom.d7_slot_7.style.color = 'grey'
      dom.d7_slot_8.innerHTML = 'Accessory';
      dom.d7_slot_8.removeAttribute('style');
      dom.d7_slot_8.style.color = 'grey'
      //    dom.d7_slot_9.innerHTML = 'Accessory';dom.d7_slot_9.removeAttribute('style');dom.d7_slot_9.style.color='grey'
      //    dom.d7_slot_10.innerHTML = 'Accessory';dom.d7_slot_10.removeAttribute('style');dom.d7_slot_10.style.color='grey'
    }

    export function giveRcp(rcp) {
      if (!global.flags.asbu) { global.flags.asbu = true; dom.ct_bt1.innerHTML = 'assemble' }
      if (rcp.have === false) {
        global.rec_d.push(rcp);
        rcp.have = true;
        if (global.lw_op === 1) rsort(global.rm)
        msg('New blueprint unlocked: ', 'cyan');
        msg_add('"' + rcp.name + '"', 'orange');
        return 1;
      } else return 0;
    }

    export function giveWealth(val, mes, f) {
      if (you.mods.wthexrt !== 0 && f) val += 1;
      you.wealth += val;
      global.stat.moneyg += val;
      for (let x in global.monchk) global.monchk[x]();
      if (!global.stat.mndrgnu && you.wealth >= 100000000) { global.stat.mndrgnu = true; appear(dom.mn_1) }
      m_update();
      giveSkExp(skl.gred, val * .01);
      if (mes !== false) {
        msg('+', 'gold');
        if (val >= GOLD) msg_add(' ●' + ((val / GOLD) << 0), 'rgb(255, 215, 0)');
        if (val >= SILVER && val % GOLD >= SILVER) msg_add(' ●' + ((val / SILVER % SILVER) << 0), 'rgb(192, 192, 192)');
        if (val < SILVER || (val > SILVER && val % SILVER > 0)) msg_add(' ●' + ((val % SILVER) << 0), 'rgb(255, 116, 63)');
      } recshop();
    }

    export function spend(m) {
      if (you.wealth < m) return
      you.wealth -= m;
      global.stat.moneysp += m;
      m_update()
    }

    export function giveItem(obj, am, ignore, flag) {
      am = am || 1;
      if (!!obj.slot) {
        let nitm; for (let p = 0; p < am; p++) {
          obj.new = true; obj.data.uid = ++global.uid;
          let tmp = obj;
          obj.data.dscv = true;
          obj.have = true;
          nitm = copy(obj);
          nitm.data = deepCopy(obj.data);
          nitm.eff = tmp.eff;
          if (tmp.dss) nitm.dss = tmp.dss;
          inv.push(nitm);
          msg('New item obtained: <span style="color:coral">' + nitm.name + '</span>', 'cyan', obj);
          obj.onGet();
          if (global.sm === nitm.stype) global.sinv.push(nitm);
          if (nitm.stype === global.sm || global.sm === 1) renderItem(nitm);
          let g = obj.id / 10000 << 0;
          if (!scan(dar[g], obj.id)) dar[g].push(obj.id);
          if (flag && flag.fl) iftrunkopen(1);
          else iftrunkopenc(1);
          if (!global.flags.loadstate && !ignore) global.stat.igtttl += am;
        }
        return nitm;
      }
      if (!obj.have) {
        obj.new = true; if (global.flags.blken === true) {
          global.spnew++; clearInterval(timers.nsblk); timers.nsblk = setInterval(function () {
            let a = document.querySelectorAll('.blinks');
            let g = a.length;
            for (let i = 0; i < g; i++) a[i].style.opacity = global.vsnew / 10;
            if (--global.vsnew < 0) global.vsnew = 10;
          }, 100)
        }
        obj.have = true;
        obj.data.dscv = true;
        inv.push(obj);
        obj.amount += am;
        msg('New item obtained: <span style="color:coral">' + obj.name + '</span><span style="color:lime"> x' + am + '</span>', 'cyan', obj);
        obj.onGet();
        if (global.sm === obj.stype) global.sinv.push(obj);
        if (obj.stype === global.sm || global.sm === 1) renderItem(obj);
      } else {
        obj.amount += am;
        msg('Item Acquired: <span style="color:chartreuse">' + obj.name + '</span><span style="color:lime"> x' + am + '</span>', 'cyan', obj);
        if (global.sm === 1) updateInv(inv.indexOf(obj));
        else if (global.sm === obj.stype) updateInv(global.sinv.indexOf(obj));
        obj.onGet();
      }
      let g = obj.id / 10000 << 0;
      if (!scan(dar[g], obj.id)) dar[g].push(obj.id);
      if (obj.multif) for (let a = 0; a < am; a++) obj.multif()
      if (obj.rot) {
        let thave = false;
        for (let a in planner.imorph.data.items) if (planner.imorph.data.items[a].id === obj.id) { thave = true; break }
        if (!thave) { planner.imorph.data.items.push(obj); obj.data.rottil = 0 }
      }
      if (flag && !flag.fi && flag.fl) iftrunkopen(1);
      else iftrunkopenc(1);
      if (!global.flags.loadstate && !ignore) global.stat.igtttl += am;
      return obj;
    }

    function listen_k(e) {
      global.keytarget = e.target;
      if (e.which === 46) {
        for (let obj in global.shortcuts) if (global.shortcuts[obj][0] === global.keyobj.data.skey) global.shortcuts.splice(global.shortcuts.indexOf(global.shortcuts[obj]), 1)
        global.keytarget.children[0].innerHTML = global.keyobj.name;
        global.keyobj.data.skey = null;
      }
      else if ((e.which >= 47 && e.which <= 90) || (e.which >= 96 && e.which <= 105)) {
        global.keytarget.children[0].innerHTML = global.keyobj.name + '<small> {' + String.fromCharCode(global.keyobj.data.skey) + '}</small>';
        if (global.keyobj.data.skey > 0 && e.which !== global.keyobj.data.skey) { for (let obje in global.shortcuts) { if (global.shortcuts[obje][2].data.skey === global.keyobj.data.skey) { global.shortcuts[obje][2].data.skey = null; global.shortcuts.splice(global.shortcuts.indexOf(global.shortcuts[obje]), 1); } } }
        let tg;
        for (let obj in global.shortcuts) {
          if (e.which === global.shortcuts[obj][0]) { global.shortcuts[obj][2].data.skey = null; global.shortcuts.splice(global.shortcuts.indexOf(global.shortcuts[obj]), 1); }
        } global.keyobj.data.skey = e.which; global.shortcuts.push([e.which, global.keyobj.id, global.keyobj]); global.shortcuts[global.shortcuts.length - 1][2].data.skey = e.which; isort(global.sm)
      }
    }

    document.body.addEventListener('keydown', function (e) {
      if (global.flags.kfocus !== true) {
        for (let obj in global.shortcuts) if (e.which === global.shortcuts[obj][0]) {
          g = global.shortcuts[obj][2];
          if (g.amount > 0 || !!g.slot) {
            g.use(); reduce(g); iftrunkopenc(1); if (g.id < 3000 && !g.data.tried) { g.data.tried = true; global.stat.ftried += 1; }
            break
          }
        }
      }
      if (!global.flags.shifton && (e.which === 69 || e.which === 16)) {
        global.flags.shifton = true;
        global.kkey = 1;
        descsinfo(global.shiftid)
      }
    });

    document.body.addEventListener('keyup', function (e) {
      if (e.which === 69 || e.which === 16) {
        global.flags.shifton = false;
        if (dom.dscshe) dom.dscshe.innerHTML = '';
        global.kkey = -1
      }
    });

    function descsinfo(id) {
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

    function renderItem(obj) {
      let inv_slot_c = addElement(dom.inv_con, 'div', null, 'no-outline');
      let inv_slot = addElement(inv_slot_c, 'div', null, 'inventory-slot no-outline');
      /*switch(obj.wtype){
        case 1:var z= icon(inv_slot,2,1,18,18);
        z.style.paddingRight=2;
        break;
        case 2:var z= icon(inv_slot,4,1,18,18);
        z.style.paddingRight=2;
        break;
        case 3:var z= icon(inv_slot,3,1,18,18);
        z.style.paddingRight=2;
        break;
      }*/
      let inv_name = addElement(inv_slot, 'span');
      inv_name.innerHTML = obj.name;
      if (!!obj.data.skey) inv_name.innerHTML += '<small> {' + String.fromCharCode(obj.data.skey) + '}</small>';
      if (obj.new === true) inv_name.innerHTML += '<small style="font-size:.65em;color: yellow;position:absolute" class="blinks">　new</small>';
      inv_slot_c.addEventListener('mouseenter', function () {
        global.keyobj = obj;
        inv_slot.tabIndex = 0;
        inv_slot.focus();
        inv_slot.addEventListener('keydown', listen_k);
        global.flags.kfocus = true;
        if (obj.important === false && obj.slot) {
          dom.inv_del = addElement(inv_slot_c, 'span', null, 'delete-btn');
          dom.inv_del.innerHTML = 'x';
          addDesc(dom.inv_del, null, 2, 'Throw away', 'Deletes <span style="color:cyan">\"' + obj.name + '\"</span> permanently');
          dom.inv_del.addEventListener('click', () => {
            if (obj.data.uid === you.eqp[obj.slot - 1].data.uid) {
              let prm = addElement(document.body, 'div');
              prm.style.backgroundColor = 'grey';
              prm.style.width = document.body.clientWidth;
              prm.style.height = document.body.clientHeight;
              prm.style.position = 'absolute';
              prm.style.left = 0;
              prm.style.top = 0;
              prm.style.opacity = .4;
              let prm2 = addElement(document.body, 'div');
              prm2.style.position = 'absolute';
              prm2.style.top = document.body.clientHeight / 2 - 40;
              prm2.style.left = 1300 / 2 - 195;
              prm2.style.width = 390;
              prm2.style.height = 80;
              prm2.style.border = '4px black solid';
              prm2.style.padding = 5;
              prm2.style.backgroundColor = 'lightgrey';
              let pin = addElement(prm2, 'div');
              pin.style.height = 32;
              pin.innerHTML = 'Really destroy \"' + obj.name + '\"\?';
              pin.style.textAlign = 'center';
              pin.style.width = '100%';
              pin.style.borderBottom = '2px solid black';
              pin.style.paddingTop = 10;
              let pcon = addElement(prm2, 'div');
              pcon.style.display = 'flex';
              pcon.style.textAlign = 'center';
              pcon.style.backgroundColor = 'darkgrey';
              let phai = addElement(pcon, 'div');
              phai.style.width = '50%';
              phai.innerHTML = 'YES';
              phai.style.paddingTop = 9;
              phai.style.paddingBottom = 9;
              let piie = addElement(pcon, 'div');
              piie.style.width = '50%';
              piie.innerHTML = 'NO';
              piie.style.paddingTop = 9;
              piie.style.paddingBottom = 9;
              phai.addEventListener('mouseenter', function () { this.style.backgroundColor = '#666' });
              piie.addEventListener('mouseenter', function () { this.style.backgroundColor = '#666' });
              phai.addEventListener('mouseleave', function () { this.style.backgroundColor = 'darkgrey' });
              piie.addEventListener('mouseleave', function () { this.style.backgroundColor = 'darkgrey' });
              phai.addEventListener('click', () => { giveSkExp(skl.rccln, (2 ** obj.rar) * 5 - 9.5); giveSkExp(skl.thr, .5); global.stat.thrt++; removeItem(obj); document.body.removeChild(prm); document.body.removeChild(prm2) });
              piie.addEventListener('click', () => { document.body.removeChild(prm); document.body.removeChild(prm2) });
            }
            else { giveSkExp(skl.rccln, (2 ** obj.rar) * 5 - 9.5); removeItem(obj); giveSkExp(skl.thr, .5); global.stat.thrt++; empty(global.dscr); }
          }
          );
        }
        if (obj.slot === 5 || obj.slot === 6) {
          dom.eq_l = addElement(inv_slot_c, 'small', null, 'eq_l');
          dom.eq_l.innerHTML = 'L';
          addDesc(dom.eq_l, obj);
          dom.eq_l.addEventListener('click', () => { if (obj.data.uid !== you.eqp[4].data.uid && obj.data.uid !== you.eqp[5].data.uid) { obj.slot = 5; equip(obj); } else if (obj.data.uid !== you.eqp[4].data.uid && obj.data.uid === you.eqp[5].data.uid) { unequip(obj); obj.slot = 5; equip(obj); } else { unequip(obj); dom.eq_l.style.backgroundColor = 'royalblue'; this.children[0].removeChild(this.children[0].lastChild) } });
          if (obj.data.uid === you.eqp[4].data.uid) dom.eq_l.style.backgroundColor = 'crimson';
          dom.eq_r = addElement(inv_slot_c, 'small', null, 'eq_r');
          dom.eq_r.innerHTML = 'R';
          addDesc(dom.eq_r, obj);
          dom.eq_r.addEventListener('click', () => { if (obj.data.uid !== you.eqp[4].data.uid && obj.data.uid !== you.eqp[5].data.uid) { obj.slot = 6; equip(obj); } else if (obj.data.uid === you.eqp[4].data.uid && obj.data.uid !== you.eqp[5].data.uid) { unequip(obj); obj.slot = 6; equip(obj); } else { unequip(obj); dom.eq_r.style.backgroundColor = 'royalblue'; this.children[0].removeChild(this.children[0].lastChild) } });
          if (obj.data.uid === you.eqp[5].data.uid) dom.eq_r.style.backgroundColor = 'crimson';
        }
        if (obj.dss && item.toolbx.have) {
          dom.inv_dss = addElement(inv_slot_c, 'span', null, 'disassemble-btn');
          dom.inv_dss.innerHTML = '∥';
          if (!obj.slot) dom.inv_dss.style.left = 242;
          else if (obj.slot === 5 || obj.slot === 6) dom.inv_dss.style.left = 208
          let t = '';
          for (let a in obj.dss) {
            let am = obj.dss[a].amount;
            if (obj.dss[a].q) am = (am + am * (obj.dss[a].q * skl.dssmb.lvl)) << 0
            if (obj.dss[a].max) if (am > obj.dss[a].max) am = obj.dss[a].max;
            let c = 1;
            if (obj.slot) c = obj.dp / obj.dpmax;
            am = Math.ceil(am / (2 - c));
            t += '<br><span style="color:orange">' + obj.dss[a].item.name + ': <span style="color:' + (obj.dss[a].max && obj.dss[a].max === am ? 'lime' : 'lightblue') + '">' + am + '</span></span>'
          }
          addDesc(dom.inv_dss, null, 2, 'Disassemble', 'Deconstruct <span style="color:cyan">\"' + obj.name + '\"</span> into:<br>' + t);
          dom.inv_dss.addEventListener('click', () => {
            if (obj.slot && obj.data.uid === you.eqp[obj.slot - 1].data.uid) {
              let prm = addElement(document.body, 'div');
              prm.style.backgroundColor = 'grey';
              prm.style.width = document.body.clientWidth;
              prm.style.height = document.body.clientHeight;
              prm.style.position = 'absolute';
              prm.style.left = 0;
              prm.style.top = 0;
              prm.style.opacity = .4;
              let prm2 = addElement(document.body, 'div');
              prm2.style.position = 'absolute';
              prm2.style.top = document.body.clientHeight / 2 - 40;
              prm2.style.left = 1300 / 2 - 195;
              prm2.style.width = 390;
              prm2.style.height = 90;
              prm2.style.border = '4px black solid';
              prm2.style.padding = 5;
              prm2.style.backgroundColor = 'lightgrey';
              let pin = addElement(prm2, 'div');
              pin.style.height = 42;
              pin.innerHTML = 'You are currently wearing \"<span style="color:crimson">' + obj.name + '</span>\"<br>Really deconstruct?';
              pin.style.textAlign = 'center';
              pin.style.width = '100%';
              pin.style.borderBottom = '2px solid black';
              pin.style.paddingTop = 10;
              let pcon = addElement(prm2, 'div');
              pcon.style.display = 'flex';
              pcon.style.textAlign = 'center';
              pcon.style.backgroundColor = 'darkgrey';
              let phai = addElement(pcon, 'div');
              phai.style.width = '50%';
              phai.innerHTML = 'YES';
              phai.style.paddingTop = 9;
              phai.style.paddingBottom = 9;
              let piie = addElement(pcon, 'div');
              piie.style.width = '50%';
              piie.innerHTML = 'NO';
              piie.style.paddingTop = 9;
              piie.style.paddingBottom = 9;
              phai.addEventListener('mouseenter', function () { this.style.backgroundColor = '#666' });
              piie.addEventListener('mouseenter', function () { this.style.backgroundColor = '#666' });
              phai.addEventListener('mouseleave', function () { this.style.backgroundColor = 'darkgrey' });
              piie.addEventListener('mouseleave', function () { this.style.backgroundColor = 'darkgrey' });
              phai.addEventListener('click', () => { disassembleGeneric(obj); document.body.removeChild(prm); document.body.removeChild(prm2) });
              piie.addEventListener('click', () => { document.body.removeChild(prm); document.body.removeChild(prm2) });
            }
            else disassembleGeneric(obj)
          }
          );
        }
      });
      inv_slot_c.addEventListener('mouseleave', function () {
        inv_slot.tabIndex = -1;
        inv_slot.removeEventListener('keydown', listen_k);
        global.keyobj = 0;
        global.flags.kfocus = false;
        if (obj.important === false && obj.slot) inv_slot_c.removeChild(dom.inv_del);
        if (obj.dss && item.toolbx.have) inv_slot_c.removeChild(dom.inv_dss);
        if (obj.slot === 5 || obj.slot === 6) { inv_slot_c.removeChild(dom.eq_r); inv_slot_c.removeChild(dom.eq_l); }
      });
      if (obj.slot && scanbyuid(you.eqp, obj.data.uid) === true) {
        dom.spc_a = addElement(inv_slot, 'small', null, 'special-action');
        dom.spc_a.innerHTML = 'E';
      }
      if (!obj.slot) {
        let s_am = addElement(inv_slot, 'small', null, 'stack-amount');
        s_am.innerHTML = ' x' + (obj.amount);
        inv_slot.addEventListener('mouseenter', function () { global.flags.kfocus = true; this.tabIndex = 0; this.focus(); global.keyobj = obj; this.addEventListener('keydown', listen_k) })
        inv_slot.addEventListener('mouseleave', function () { global.flags.kfocus = false; this.tabIndex = -1; global.keyobj = 0; this.removeEventListener('keydown', listen_k); })
      }
      if (!!obj.c || !!obj.bc) {
        if (!!obj.c) inv_name.style.color = obj.c;
        if (!!obj.bc) inv_name.style.backgroundColor = obj.bc;
      }
      else {
        switch (obj.stype) {
          case 2: inv_name.style.color = 'rgb(255,192,5)';
            break;
          case 3: inv_name.style.color = 'rgb(0,235,255)';
            break;
          case 4: inv_name.style.color = 'rgb(44,255,44)';
            break;
        }
      }
      addDesc(inv_slot, obj, null, null, null, null, 100);
      inv_slot.addEventListener('click', function (x) { if (obj.amount > 0 || !!obj.slot) { obj.use(x); if (!obj.slot) reduce(obj); if (obj.id < 3000 && !obj.data.tried) { obj.data.tried = true; global.stat.ftried += 1; if (global.dscr.style.display != 'none') dom.dtrd.innerHTML = 'Tried: <span style="color: lime">Yes</span>'; } } });
      inv_slot.addEventListener('mouseleave', function () { if (obj.new === true) { obj.new = false; clearTimeout(timers.nsblk); inv_name.innerHTML = obj.name } });
    }

    function updateInv(slot) {
      if (global.sm === 1) dom.inv_con.children[slot].children[0].children[1].innerHTML = ' x' + inv[slot].amount;
      else dom.inv_con.children[slot].children[0].children[1].innerHTML = ' x' + global.sinv[slot].amount;
    }

    export function removeItem(obj, flag) {
      if (obj.slot) if (wearing(obj)) unequip(obj)
      if (obj.data.skey) {
        for (let s in global.shortcuts) if (obj.data.skey === global.shortcuts[s][0]) { global.shortcuts.splice(global.shortcuts.indexOf(obj.data.skey), 1); continue };
      }
      let idx;
      if (global.sm === 1) {
        idx = inv.indexOf(obj);
        dom.inv_con.removeChild(dom.inv_con.children[idx])
      } else if (global.sm === obj.stype) {
        idx = global.sinv.indexOf(obj);
        dom.inv_con.removeChild(dom.inv_con.children[idx])
        global.sinv.splice(idx, 1);
      }
      global.dscr.style.display = 'none';
      inv.splice(inv.indexOf(obj), 1);
      obj.have = false;
      if (obj.rot) for (let a in planner.imorph.data.items) if (planner.imorph.data.items[a].id === obj.id) { planner.imorph.data.items.splice(planner.imorph.data.items.indexOf(obj)); }
      if (global.lw_op === 1) rsort(global.rm)
      if (flag && flag.fl) iftrunkopen(1);
      else iftrunkopenc(1);
      if (obj.slot) kill(obj)
    }

    function m_update() {
      dom.mn_1.innerHTML = '㊧' + (you.wealth / 100000000 << 0);
      dom.mn_2.innerHTML = '●' + (you.wealth / 10000 % 10000 << 0);
      dom.mn_3.innerHTML = '●' + (you.wealth / 100 % 100 << 0);
      dom.mn_4.innerHTML = '●' + (you.wealth % 100 << 0);
    }

    export function chs(txt, f, c, bc, iconx, icony, size, ignore, slimsize) {
      if (f === true) { clr_chs(); dom.ch_1 = addElement(dom.ctr_2, 'div', 'chs'); dom.ch_1.innerHTML = txt; }
      else { dom.ch_1 = addElement(dom.ctr_2, 'div', null, 'chs'); dom.ch_1.innerHTML = txt; }
      if (!!iconx) { dom.ch_1.insertBefore(icon(dom.ch_1, iconx, icony), dom.ch_1.firstChild); }
      if (c) dom.ch_1.style.color = c;
      if (bc) dom.ch_1.style.backgroundColor = bc;
      if (size) dom.ch_1.style.fontSize = size;
      if (slimsize) dom.ch_1.style.height = slimsize;
      if (!ignore) global.menuo = 0;
      dom.ch_1.addEventListener('click', () => { clearInterval(timers.rptbncgt); global.flags.rptbncgtf = false; if (!global.flags.jdgdis) { global.flags.jdgdis = true; giveSkExp(skl.jdg, .1); setTimeout(() => { global.flags.jdgdis = false }, 500) } })
      return dom.ch_1;
    }

    global.text.cfc = ['White', 'Black', 'Orange', 'Grey', 'Black&White', 'Brown', 'Ginger', 'Cinnamon', 'Fawn', 'Amber', 'Cream', 'Chocolate'];
    global.text.cfp = ['Spotted', 'Plain', 'Solid', 'Bicolored', 'Tabby', 'Tricolored', 'Calico', 'Tortoiseshell', 'Wavy', 'Fluffy', 'Siamese', 'Striped'];
    global.text.cln = ['Sleeping', 'Playing', 'Catching fireflies', 'Eating', 'Fish', 'People', 'Running outside', 'Warm places', 'Water', 'Fighting', 'Meowing', 'Singing', 'Catching mice', 'Its Master', 'Climbing trees', 'Toppling objects', 'Hiding', 'Safe places', 'Rooftops', 'Sitting by the window', 'Watching others', 'Master\'s bed', 'Being petted', 'Being brushed', 'Sitting on laps', 'Other cats', 'Dogs', 'Warm weather', 'Watching stars', 'Toys', 'Meat', 'Rain', 'Snow'];


    function chs_spec(type, x) {
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
          dom.ch_1_3.innerHTML = 'Pattern: <span style="color:cyan">' + global.text.cfp[c.data.p] + '</span> | Color: <span style="color:cyan">' + global.text.cfc[c.data.c] + '</span>';
          dom.ch_1_4 = addElement(dom.ch_1, 'div', null, 'choice-detail');
          dom.ch_1_4.innerHTML = 'Likes: <span style="color:lime">' + global.text.cln[c.data.l1] + '</span> And <span style="color:lime">' + global.text.cln[c.data.l2] + '</span>';
          timers.caupd = setInterval(() => { dom.ch_1_2.innerHTML = 'Age: ' + (c.data.age >= YEAR ? '<span style="color:orange">' + (c.data.age / YEAR << 0) + '</span> Years ' : '') + (c.data.age >= MONTH ? '<span style="color:yellow">' + (c.data.age / MONTH << 0) % 12 + '</span> Months ' : '') + (c.data.age >= DAY ? '<span style="color:lime">' + (c.data.age / DAY << 0) % 30 + '</span> Days ' : ''); }, 1000);
        }; break
        case 2: {
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

    //linear-gradient(0deg,rgb(1,1,111),rgb(22,222,22))

    function renderFurniture(frn) {
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
      dom.ch_etn.addEventListener('mouseenter', function () {
        if (frn.removable === true) {
          dom.chsfdel = addElement(this.children[0], 'div', null, 'delete-btn');
          dom.chsfdel.innerHTML = 'x';
          dom.chsfdel.style.right = 5;
          dom.chsfdel.style.top = 19;
          dom.chsfdel.addEventListener('click', function () {
            frn.data.amount--;
            frn.onRemove();
            if (frn.data.amount === 0) { deactivatef(frn); frn.onDestroy(); global.dscr.style.display = 'none'; furn.splice(furn.indexOf(frn), 1); chs_spec(2); chs('"<= Return"', false).addEventListener('click', () => { smove(chss.home, false) }) } else
              this.parentElement.parentElement.children[1].innerHTML = 'x' + frn.data.amount;
            let v = 0;
            for (let a in furn) if (furn[a].v) { if (furn[a].multv) v += furn[a].v * furn[a].amount; else v += furn[a].v } dom.flsthdrbb.innerHTML = v;
          });
        }
      });
      dom.ch_etn.addEventListener('mouseleave', function () {
        if (frn.removable === true) this.children[0].removeChild(dom.chsfdel);
      });
      dom.ch_etn.addEventListener('click', function () {
        frn.onSelect();
        //this.dispatchEvent(new window.Event('mouseenter'))
      });
      dom.ch_etn2 = addElement(dom.ch_etn, 'div', null, 'list-col-rank');
      dom.ch_etn2.innerHTML = 'x' + frn.data.amount;
      dom.ch_etn2.style.width = '6%';
      addDesc(dom.ch_etn, frn, 9);
    }

    function recshop() {
      if (global.menuo === 4) {
        empty(dom.ch_1h); for (let it in global.shprf.stock) { rendershopitem(dom.ch_1h, global.shprf.stock[it], global.shprf) }
        dom.ch_1e.innerHTML = '&nbspBuying price: <span style="color:lime">' + Math.round(((you.mods.infsrate - skl.trad.use()) * global.shprf.infl * (1 - (Math.sqrt(global.shprf.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index) * 10000) / 100 + '%</span>'
        dom.ch_2e.innerHTML = '&nbspReputation: ' + col(global.shprf.data.rep << 0, 'lime')
      }
    }

    function rendershopitem(root, itm, vnd) {
      dom.ch_etn = addElement(root, 'div', 'bst_entrh', 'list-row');
      dom.ch_etn.style.backgroundColor = 'rgb(10,30,54)';
      addDesc(dom.ch_etn, itm[0]);
      dom.ch_etn1 = addElement(dom.ch_etn, 'div', null, 'list-col-name');
      dom.ch_etn1.style.width = '79%'
      dom.ch_etn1n = addElement(dom.ch_etn1, 'div');
      dom.ch_etn1n.innerHTML = itm[0].name;
      dom.ch_etn1n.style.width = 305;
      dom.ch_etn1b = addElement(dom.ch_etn1, 'div');
      dom.ch_etn1.style.display = 'flex';
      dom.ch_etn1b.style.display = 'inline-flex';
      dom.ch_etn1b.style.position = 'absolute';
      dom.ch_etn1b.style.right = 6;
      dom.ch_etn1b.style.textAlign = 'center';
      dom.ch_etn1b.style.backgroundColor = 'rgb(20,50,84)'
      let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
      switch (itm[0].stype) {
        case 2: dom.ch_etn1n.style.color = 'rgb(255,192,5)';
          break;
        case 3: dom.ch_etn1n.style.color = 'rgb(0,235,255)';
          break;
        case 4: dom.ch_etn1n.style.color = 'rgb(44,255,44)';
          break;
      }
      dom.ch_etn2 = addElement(dom.ch_etn, 'div', null, 'list-col-rank');
      dom.ch_etn2.style.display = 'flex';
      dom.ch_etn2.style.width = '22%';
      dom.ch_etn2.style.textAlign = 'left';
      if (you.wealth < p) { dom.ch_etn2.style.color = 'red'; dom.ch_etn.style.backgroundColor = 'rgb(68,26,38)' }
      dom.ch_etn2_1 = addElement(dom.ch_etn2, 'span');
      dom.ch_etn2_1.style.width = '33.3%';
      dom.ch_etn2_2 = addElement(dom.ch_etn2, 'span');
      dom.ch_etn2_2.style.width = '33.3%';
      dom.ch_etn2_3 = addElement(dom.ch_etn2, 'span');
      dom.ch_etn2_3.style.width = '33.3%';
      if (p >= GOLD) { dom.ch_etn2_1.innerHTML = (dom.coingold + ((p / GOLD) << 0)); dom.ch_etn2_1.style.backgroundColor = 'rgb(102, 66, 0)'; }
      if (p >= SILVER && p % GOLD >= SILVER) { dom.ch_etn2_2.innerHTML = (dom.coinsilver + ((p / SILVER % SILVER) << 0)); dom.ch_etn2_2.style.backgroundColor = 'rgb(56, 56, 56)'; }
      if (p < SILVER || (p > SILVER && p % SILVER > 0)) { dom.ch_etn2_3.innerHTML = (dom.coincopper + ((p % SILVER) << 0)); dom.ch_etn2_3.style.backgroundColor = 'rgb(102, 38, 23)'; }
      dom.ch_etn3 = addElement(dom.ch_etn, 'div', null, 'list-col-stat');
      dom.ch_etn3.style.width = '14%';
      dom.ch_etn3.style.color = 'lime';
      dom.ch_etn3.innerHTML = itm[1];
      if (itm[1] === 0) { dom.ch_etn3.innerHTML = '<small>sold out</small>'; dom.ch_etn1n.style.color = 'grey'; dom.ch_etn2.style.color = 'grey'; dom.ch_etn3.style.color = 'grey'; }
      dom.ch_etn.addEventListener('mouseenter', function () {
        dom.ch_etn1b1 = addElement(this.children[0].children[1], 'small', null, 'quantity-btn');
        dom.ch_etn1b1.innerHTML = '1';
        dom.ch_etn1b2 = addElement(this.children[0].children[1], 'small', null, 'quantity-btn');
        dom.ch_etn1b2.innerHTML = '5';
        dom.ch_etn1b3 = addElement(this.children[0].children[1], 'small', null, 'quantity-btn');
        dom.ch_etn1b3.innerHTML = '10';
        dom.ch_etn1b4 = addElement(this.children[0].children[1], 'small', null, 'quantity-btn');
        dom.ch_etn1b4.innerHTML = 'M';
        buycbs(itm, vnd)
        dom.ch_etn1b1.addEventListener('click', function () {
          let el = this.parentElement.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
          if (you.wealth >= p && itm[1] > 0) {
            itm[1]--; giveItem(itm[0]); spend(p); m_update(); giveSkExp(skl.gred, itm[2] * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05)
            if (p >= GOLD) mf(-Math.ceil((p - GOLD) / GOLD), 3);
            if (p >= SILVER) mf(-Math.ceil((p - SILVER) / SILVER % 100), 2);
            mf(-p % 100, 1);
            global.stat.buyt++;
            if (random() < .0008) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
            global.stat.shppnt += p * .01;
            vnd.data.rep += itm[2] * .0004 * vnd.repsc;
            if (vnd.data.rep > 100) vnd.data.rep = 100
            if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = el.children[0].children[0].style.color = el.children[1].style.color = 'grey' } else el.children[2].innerHTML = itm[1];
          } buycbs(itm, vnd)
        });
        dom.ch_etn1b2.addEventListener('click', function () {
          let el = this.parentElement.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
          if (you.wealth >= p * 5 && itm[1] >= 5) {
            itm[1] -= 5; giveItem(itm[0], 5); spend(p * 5); m_update(); giveSkExp(skl.gred, itm[2] * 5 * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05 * 5)
            if (p * 5 >= GOLD) mf(-Math.ceil((p * 5 - GOLD) / GOLD), 3);
            if (p * 5 >= SILVER) mf(-Math.ceil((p * 5 - SILVER) / SILVER % 100), 2);
            mf(-p * 5 % 100, 1);
            global.stat.buyt += 5;
            if (random() < .004) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
            global.stat.shppnt += p * .01;
            vnd.data.rep += itm[2] * (5 * (1 + .05)) * .0004 * vnd.repsc;
            if (vnd.data.rep > 100) vnd.data.rep = 100
            if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = el.children[0].children[0].style.color = el.children[1].style.color = 'grey' } else el.children[2].innerHTML = itm[1];
          } buycbs(itm, vnd)
        });
        dom.ch_etn1b3.addEventListener('click', function () {
          let el = this.parentElement.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
          if (you.wealth >= p * 10 && itm[1] >= 10) {
            itm[1] -= 10; giveItem(itm[0], 10); spend(p * 10); m_update(); giveSkExp(skl.gred, itm[2] * 10 * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05 * 10)
            if (p * 10 >= GOLD) mf(-Math.ceil((p * 10 - GOLD) / GOLD), 3);
            if (p * 10 >= SILVER) mf(-Math.ceil((p * 10 - SILVER) / SILVER % 100), 2);
            mf(-p * 10 % 100, 1);
            global.stat.buyt += 10;
            if (random() < .008) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
            global.stat.shppnt += p * .01;
            vnd.data.rep += itm[2] * (10 * (1 + .1)) * .0004 * vnd.repsc;
            if (vnd.data.rep > 100) vnd.data.rep = 100
            if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = el.children[0].children[0].style.color = el.children[1].style.color = 'grey' } else el.children[2].innerHTML = itm[1];
          } buycbs(itm, vnd)
        });
        dom.ch_etn1b4.addEventListener('click', function () {
          let el = this.parentElement.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index); let max = (you.wealth / p) << 0; if (max > itm[1]) max = itm[1];
          if (you.wealth >= p && itm[1] > 0) {
            itm[1] -= max; giveItem(itm[0], max); spend(p * max); m_update(); giveSkExp(skl.gred, itm[2] * max * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05 * max)
            if (p * max >= GOLD) mf(-Math.ceil((p * max - GOLD) / GOLD), 3);
            if (p * max >= SILVER) mf(-Math.ceil((p * max - SILVER) / SILVER % 100), 2);
            mf(-p * max % 100, 1);
            global.stat.buyt += max;
            if (random() < .0008 * max) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
            global.stat.shppnt += p * .01;
            vnd.data.rep += itm[2] * (max * (1 + max * .01)) * .0004 * vnd.repsc;
            if (vnd.data.rep > 100) vnd.data.rep = 100
            if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = el.children[0].children[0].style.color = el.children[1].style.color = 'grey'; } else el.children[2].innerHTML = itm[1];
          } buycbs(itm, vnd)
        });
      });
      dom.ch_etn.addEventListener('mouseleave', function () {
        empty(this.children[0].children[1]);
      });
      dom.ch_etn1n.addEventListener('click', function () {
        let el = this.parentElement.parentElement; let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
        if (you.wealth >= p && itm[1] > 0) {
          itm[1]--; giveItem(itm[0]); spend(p); m_update(); giveSkExp(skl.gred, itm[2] * .05); giveSkExp(skl.trad, itm[2] ** (1 + itm[0].rar * .1) * .05)
          if (p >= GOLD) mf(-Math.ceil((p - GOLD) / GOLD), 3);
          if (p >= SILVER) mf(-Math.ceil((p - SILVER) / SILVER % 100), 2);
          mf(-p % 100, 1);
          global.stat.buyt++;
          if (random() < .0008) { giveItem(acc.dticket); msg('Thank you for your patronage!', 'gold', null, null, 'magenta') };
          global.stat.shppnt += p * .01;
          vnd.data.rep += itm[2] * .0004 * vnd.repsc;
          if (vnd.data.rep > 100) vnd.data.rep = 100
          if (itm[1] === 0) { el.children[2].innerHTML = '<small>sold out</small>'; el.children[2].style.color = this.style.color = el.children[1].style.color = 'grey' } else el.children[2].innerHTML = itm[1];
        } buycbs(itm, vnd)
      });
    }

    function buycbs(itm, vnd) {
      let p = Math.ceil(itm[2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index);
      if (you.wealth < p || itm[1] <= 0) dom.ch_etn1b1.style.color = 'grey';
      if (you.wealth < p * 5 || itm[1] < 5) dom.ch_etn1b2.style.color = 'grey';
      if (you.wealth < p * 10 || itm[1] < 10) dom.ch_etn1b3.style.color = 'grey';
      if (you.wealth < p || itm[1] <= 0) dom.ch_etn1b4.style.color = 'grey';
      dom.ch_1e.innerHTML = '&nbspBuying price: <span style="color:lime">' + Math.round(((you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index) * 10000) / 100 + '%</span>'
      dom.ch_2e.innerHTML = '&nbspReputation: ' + col(vnd.data.rep << 0, 'lime');
      for (let i = 0; i < vnd.stock.length; i++) { if (you.wealth < Math.ceil(vnd.stock[i][2] * (you.mods.infsrate - skl.trad.use()) * vnd.infl * (1 - (Math.sqrt(vnd.data.rep) ** 1.3 + 0.05) * .01) * global.offline_evil_index)) { dom.ch_1h.children[i].children[1].style.color = 'red'; dom.ch_1h.children[i].style.backgroundColor = 'rgb(68,26,38)' } }
      for (let x in global.shptchk) global.shptchk[x]();
      //put it here for now
    }
    for (let x in global.cptchk) global.cptchk[x]();

    function rendertrunkitem(root, item, ni) {
      if (!ni) { ni = new Object(); ni.right = false }; let trunk = global.cchest;
      dom.invp1_con = addElement(root, 'div', null, 'tracked-item');
      ni.right === true ? dom.invp1_con.style.borderLeft = '1px rgb(204, 68, 68) solid' : dom.invp1_con.style.borderRight = '1px rgb(204, 68, 68) solid';
      if (ni.right === true) {
        let c = copy(item);
        c.data = ni.nit.data;
        c.dp = ni.nit.dp;
        addDesc(dom.invp1_con, c);
      } else addDesc(dom.invp1_con, item);
      dom.invp1_s = addElement(dom.invp1_con, 'small');
      dom.invp2_s = addElement(dom.invp1_con, 'small');
      dom.invp1_s.style.marginLeft = ni.right ? 23 : 3;
      dom.invp1_s.innerHTML = item.name;
      dom.invp2_s.style.right = ni.right ? 3 : 20;
      dom.invp2_s.innerHTML = !item.slot ? ('x' + (ni.right === true ? ni.nit.am : item.amount)) : '';
      dom.invp2_s.style.position = 'absolute';
      if (!!item.c || !!item.bc) {
        if (!!item.c) dom.invp1_s.style.color = item.c;
        if (!!item.bc) dom.invp1_s.style.backgroundColor = item.bc;
      }
      else {
        switch (item.stype) {
          case 2: dom.invp1_s.style.color = 'rgb(255,192,5)';
            break;
          case 3: dom.invp1_s.style.color = 'rgb(0,235,255)';
            break;
          case 4: dom.invp1_s.style.color = 'rgb(44,255,44)';
            break;
        }
      }

      dom.invp1_con.addEventListener('mouseenter', function () {
        dom.invp1_op2 = addElement(this, 'small', null, ni.right ? 'track-move-left' : 'track-move-right');
        dom.invp1_op2.innerHTML = ni.right ? '<<' : '>>';
        dom.invp1_op2.addEventListener('mouseenter', function () { global.flags.rtcrutch = true });
        //ugly hack
        dom.invp1_op2.addEventListener('mouseleave', function () { global.flags.rtcrutch = false });
        //self to self: revisit later V:
        dom.invp1_op2.addEventListener('click', function () {
          let scann = false; let titem;
          if (ni.right === false) {
            for (let a in trunk.c) { if (trunk.c[a].item.id === item.id && !item.slot) { scann = true; titem = trunk.c[a]; break } }
            if (scann === false) {
              let nit = addToContainer(trunk, item, item.amount);
              item.amount = 0;
              titem = nit;
              if (item.amount <= 0 || item.slot) { dom.invp1.removeChild(dom.invp1.children[inv.indexOf(item)]); removeItem(item, { fl: true }) } else if (global.sm === 1) updateInv(inv.indexOf(item));
              else if (global.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } else {
              titem.am += item.amount;
              item.amount = 0;
              if (item.amount <= 0) { dom.invp1.removeChild(dom.invp1.children[inv.indexOf(item)]); removeItem(item, { fl: true }); } else if (global.sm === 1) updateInv(inv.indexOf(item));
              else if (global.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } if (titem.item.onTIn) titem.item.onTIn(trunk, titem); //  big stack moves into container
          } else {
            for (let a in inv) { if (inv[a].id === item.id && !item.slot) { scann = true; titem = inv[a]; break } }
            if (scann === false) {
              let fin; if (ni.nit.item.slot) { for (let a in trunk.c) { if (trunk.c[a].data.uid === ni.nit.data.uid) { fin = trunk.c[a]; break } } } else { for (let a in trunk.c) { if (trunk.c[a].item.id === ni.nit.item.id) { fin = trunk.c[a]; break } } }
              let g = giveItem(ni.nit.item, ni.nit.am, true, { fl: true });
              g.data = ni.nit.data;
              g.dp = ni.nit.dp;
              dom.invp2.removeChild(dom.invp2.children[trunk.c.indexOf(fin)]);
              removeFromContainer(trunk, fin);
              rendertrunkitem(dom.invp1, g);
              if (trunk.c.length === 0) global.dscr.style.display = 'none'
            }
            else {
              titem.amount += ni.nit.am;
              let fin;
              for (let a in trunk.c) { if (trunk.c[a].item.id === ni.nit.item.id) { fin = trunk.c[a]; break } }
              dom.invp2.removeChild(dom.invp2.children[trunk.c.indexOf(fin)]);
              removeFromContainer(trunk, fin);
              if (trunk.c.length === 0) global.dscr.style.display = 'none'
              if (global.sm === 1) updateInv(inv.indexOf(item));
              else if (global.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } if (ni.nit.item.onTOut) ni.nit.item.onTOut(trunk, ni.nit); //  big stack moves out of container
          } iftrunkopen();
        });
      });
      dom.invp1_con.addEventListener('mouseleave', function () {
        empty(this.children[2]);
        this.removeChild(this.children[2]);
      });
      dom.invp1_con.addEventListener('click', function () {
        if (global.flags.rtcrutch === true) { this.children[0].click(); return } else {
          scann = false; let titem;
          if (ni.right === false) {
            for (let a in trunk.c) { if (trunk.c[a].item.id === item.id && !item.slot) { scann = true; titem = trunk.c[a]; break } }
            if (scann === false) {
              let nit = addToContainer(trunk, item);
              item.amount--;
              titem = nit;
              if (item.amount <= 0) { dom.invp1.removeChild(dom.invp1.children[inv.indexOf(item)]); removeItem(item, { fl: true }); } else if (global.sm === 1) updateInv(inv.indexOf(item));
              else if (global.sm === item.stype) updateInv(global.sinv.indexOf(item));

            } else {
              titem.am++;
              item.amount--;
              if (item.amount <= 0 || item.slot) { dom.invp1.removeChild(dom.invp1.children[inv.indexOf(item)]); removeItem(item, { fl: true }) } else if (global.sm === 1) updateInv(inv.indexOf(item));
              else if (global.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } if (titem.item.onTIn) titem.item.onTIn(trunk, titem); //  1 item moves into container
          } else {
            for (let a in inv) { if (inv[a].id === item.id && !item.slot) { scann = true; titem = inv[a]; break } }
            if (scann === false) {
              let fin; if (ni.nit.item.slot) { for (let a in trunk.c) { if (trunk.c[a].data.uid === ni.nit.data.uid) { fin = trunk.c[a]; break } } } else { for (let a in trunk.c) { if (trunk.c[a].item.id === ni.nit.item.id) { fin = trunk.c[a]; break } } }
              let g = giveItem(ni.nit.item, 1, true, { fl: true });
              g.data = ni.nit.data;
              g.dp = ni.nit.dp;
              rendertrunkitem(dom.invp1, g);
              if (--fin.am <= 0) { dom.invp2.removeChild(dom.invp2.children[trunk.c.indexOf(fin)]); removeFromContainer(trunk, fin) } if (trunk.c.length === 0) global.dscr.style.display = 'none'
            }
            else {
              titem.amount++;
              let fin;
              for (let a in trunk.c) { if (trunk.c[a].item.id === ni.nit.item.id) { fin = trunk.c[a]; break } }
              if (--fin.am <= 0) { dom.invp2.removeChild(dom.invp2.children[trunk.c.indexOf(fin)]); removeFromContainer(trunk, fin) } if (trunk.c.length === 0) global.dscr.style.display = 'none';
              if (global.sm === 1) updateInv(inv.indexOf(item));
              else if (global.sm === item.stype) updateInv(global.sinv.indexOf(item));
            } if (ni.nit.item.onTOut) ni.nit.item.onTOut(trunk, ni.nit); //  1 item moves out of container
          } iftrunkopen()
        }
      });
    }

    function updateTrunkItem(root, idx, item, am) {
      if (root.children[idx]) root.children[idx].children[1].innerHTML = item.slot ? '' : 'x' + am;
    }

    function updateTrunkLeftItem(item, kill) {
      if (global.menuo === 3) {
        for (let a in inv) if ((inv[a].data.uid && inv[a].data.uid === item.data.uid) || (inv[a].id === item.id)) {
          if (kill) dom.invp1.removeChild(dom.invp1.children[inv.indexOf(inv[a])]);
          else {
            dom.invp1.children[inv.indexOf(inv[a])].children[1].innerHTML = item.slot ? '' : 'x' + item.amount;
          }
        }
      }
    }

    function iftrunkopen(side) {
      if (global.menuo === 3) {
        let trunk = global.cchest;
        if (!side || side === 1) for (let obj in inv) updateTrunkItem(dom.invp1, obj, inv[obj], inv[obj].amount);
        if (!side || side === 2) for (let obj in trunk.c) updateTrunkItem(dom.invp2, obj, trunk.c[obj].item, trunk.c[obj].am);
        if (trunk.length === 0) dom.invp2noth.style.display = '';
        else dom.invp2noth.style.display = 'none'
      }
    }

    function iftrunkopenc(side) {
      if (global.menuo === 3) {
        let trunk = global.cchest;
        if (!side || side === 1) { empty(dom.invp1); for (let obj in inv) rendertrunkitem(dom.invp1, inv[obj]); }
        if (!side || side === 2) { empty(dom.invp2); for (let obj in trunk.c) rendertrunkitem(dom.invp2, trunk.c[obj].item, { right: true, nit: { item: trunk.c[obj].item, data: trunk.c[obj].data, am: trunk.c[obj].am, dp: trunk.c[obj].dp } }); }
        if (trunk.length === 0) dom.invp2noth.style.display = '';
        else dom.invp2noth.style.display = 'none'
      }
    }

    function addToContainer(cont, thing, am, data) {
      let it = thing;
      if (thing.slot) it = deepCopy(thing);
      let r = { item: it, am: am || 1, data: data || thing.data, dp: thing.slot ? thing.dp : 0 }
      if (r.item.slot) r.data.uid = ++global.uid;
      cont.c.push(r);
      if (global.menuo == 3) rendertrunkitem(dom.invp2, r.item, { right: true, nit: { item: r.item, data: r.data, am: r.am, dp: r.dp } });
      return r;
    }

    function removeFromContainer(cont, item, find) {
      if (find) {
        for (let a in cont.c) if (cont.c.indexOf(cont.c[a]) === cont.c.indexOf(item)) {
          cont.c.splice(cont.c.indexOf(item), 1)
          break
        }
      }
      else cont.c.splice(cont.c.indexOf(item), 1);
    }

    function clr_chs(index) {
      if (!index) empty(dom.ctr_2);
      else dom.ctr_2.removeChild(dom.ctr_2.children[index]);
    }

    export function smove(where, lv) {
      global.flags.busy = false; global.flags.work = false; global.wdwidx = 0;
      if (global.flags.loadstate) return;
      if (!global.flags.wkdis) { global.flags.wkdis = true; if (lv !== false) giveSkExp(skl.walk, .25); setTimeout(() => { global.flags.wkdis = false }, 500) }
      you.eqp[6].dp = you.eqp[6].dp - .08 < 0 ? 0 : you.eqp[6].dp - .08;
      let flg = false;
      let und = []
      for (let c in global.current_l.sector) {
        for (let a in where.sector) {
          for (let b in where.sector[a].group)
            if (where.sector[a].group[b] === global.current_l.id && where.sector[a].id === global.current_l.sector[c].id) flg = true
        } if (flg === false) {
          global.current_l.sector[c].onLeave();
          deactivateEffectors(global.current_l.sector[c].effectors);
          sectors.splice(sectors.indexOf(global.current_l.sector[c]))
        } else flg = false
      }
      global.current_l.onLeave();
      deactivateEffectors(global.current_l.effectors);
      global.flags.civil = true;
      global.flags.btl = false;
      global.current_z = area.nwh;
      dom.d7m.update();
      global.stat.smovet++
      global.flags.inside = false;
      for (let a in where.sector) { if (where.sector[a].inside || where.inside) global.flags.inside = true }
      clr_chs();
      activateEffectors(where.effectors);
      where.sl();
      global.current_l = where;
      for (let a in sectors) sectors[a].onMove();
      global.current_a.deactivate();
      global.current_a = act.default;
      dom.ct_bt3.style.backgroundColor = 'inherit';
      for (let a in global.current_l.sector) if (!scanbyid(sectors, global.current_l.sector[a].id)) { sectors.push(global.current_l.sector[a]); global.current_l.sector[a].onEnter(); activateEffectors(global.current_l.sector[a].effectors) }
      global.current_l.onEnter();
      rfeff(global.current_l)
      if (global.flags.btl === false) {
        global.current_m = creature.default;
        global.current_m.eff = [];
        empty(dom.d101m);
        dom.d5_1_1m.update();
        update_m();
      }
    }

    function giveFurniture(frt, l, show) {
      let frn = l === true ? copy(frt) : frt;
      if (show !== false) msg('Furniture Acquired: <span style="color:orange">"' + frt.name + '"</span>', 'yellow', frt, 9);
      if (scanbyid(furn, frn.id)) frn.data.amount++;
      else { furn.push(frn); frn.data.amount++; }
      frn.onGive();
      if (global.wdwidx === 1) { empty(dom.ch_1h); for (let a in furn) renderFurniture(furn[a]) }
      let v = 0;
      for (let a in furn) if (furn[a].v) { if (furn[a].multv) v += furn[a].v * furn[a].amount; else v += furn[a].v } if (dom.flsthdrbb) dom.flsthdrbb.innerHTML = v;
      return frn
    }

    export function activatef(f) {
      if (!f.active) {
        f.activate();
        f.active = true;
      }
    }

    export function deactivatef(f) {
      if (f.active) {
        f.deactivate();
        f.active = false;
      }
    }

    global._preig = addElement(document.body, 'img');
    global._preig.src = 'ctst.png';
    //global._preig.crossOrigin = "Anonymous";
    global._preig.src = 'http://127.0.0.1:8887/ctst.png';
    global._preic = addElement(document.body, 'canvas');
    global._preic_tmain = global._preic.getContext('2d');
    global._preic2 = addElement(document.body, 'canvas');
    global._preic2_tmain = global._preic2.getContext('2d');
    global._preic2.width = 512;
    global._preic2.height = 512;
    global._preig.onload = function () { global._preic_tmain.drawImage(global._preig, 0, 0); global._preic2_tmain.imageSmoothingEnabled = false;; global._preic2_tmain.drawImage(global._preig, 0, 0, 400, 400) };
    document.body.removeChild(global._preig);
    document.body.removeChild(global._preic);
    document.body.removeChild(global._preic2);


    function icon(root, x, y, sx, sy, sz) { //sz=2
      if (window.location.pathname.length === 1) {
        sx = sx || 16; sy = sy || 16
        var div = addElement(root, 'canvas');
        div.width = sx;
        div.height = sy;
        let data = global._preic_tmain.getImageData(x * sx - sx, y * sy - sy, sx, sy);
        div.getContext('2d').putImageData(data, 0, 0);
        //    let temp = addElement(root,'canvas'); temp.width=sx;temp.height=sy;
        //    let data = global._preic_tmain.getImageData(x*sx-sx,y*sy-sy,sx,sy); 
        //    temp.getContext('2d').putImageData(data,0,0);
        //    var div = addElement(root,'canvas'); div.width=sx*sz;div.height=sy*sz;
        //    div.getContext('2d').imageSmoothingEnabled=false;
        //    div.getContext('2d').drawImage(temp,0,0,sx,sy,0,0,sx*sz,sy*sz);
      } else div = addElement(root, 'span');
      return div;
    }

    function Chs() {
      this.ttl;
      this.sl = function () { };
      this.data = {};
      this.onStay = function () { };
      this.onEnter = function () { };
      this.onLeave = function () { };
      this.onScout = function () { };
      this.sector = []
    }


    chss.t1 = new Chs();
    chss.t1.id = 101;
    chss.t1.sl = function () {
      global.lst_loc = 101; global.flags.inside = true; d_loc('Dojo, training area');
      chs('???: Kid', true);
      chs('"..."', false).addEventListener('click', function () {
        global.time += DAY;
        appear(dom.ctr_1);
        chs('???: Quit daydreaming', true);
        chs('"?"', false).addEventListener('click', function () {
          appear(dom.d0);
          chs('???: You have training to complete', true);
          chs('"!"', false).addEventListener('click', function () {
            appear(dom.inv_ctx);
            appear(dom.d_lct);
            chs('???: Grab your stuff and get to it', true);
            chs('"..."', false).addEventListener('click', function () { appear(dom.ct_ctrl); smove(chss.tdf, false); giveItem(wpn.stk1); giveItem(item.hrb1, 15); global.flags.aw_u = true; });
          });
        });
      });
    };
    if (global.flags.gameone === false) {
      global.current_l = chss.t1;
      smove(chss.t1);
      giveFurniture(furniture.frplc, null, false);
      let _b = giveFurniture(furniture.bed1, null, false);
      home.bed = _b;
    }

    chss.tdf = new Chs();
    chss.tdf.id = 102;
    chss.tdf.sl = function () {
      global.lst_loc = 102; global.flags.inside = true;
      clr_chs();
      if (!global.flags.dmap) { appear(dom.gmsgs); global.flags.dmap = true }
      chs('"Select the difficulty"', true);
      if (!global.flags.tr1_win) chs('"Easiest"', false).addEventListener('click', function () {
        chs('"You are fighting training dummies"', true);
        if (!global.flags.dm1ap) { appear(dom.d1m); global.flags.dm1ap = true };
        area_init(area.trn1);
      });
      if (!global.flags.tr2_win) chs('"Easy"', false).addEventListener('click', function () {
        chs('"You are fighting training dummies"', true);
        if (!global.flags.dm1ap) { appear(dom.d1m); global.flags.dm1ap = true }
        area_init(area.trn2);
      });
      if (!global.flags.tr3_win) chs('"Normal"', false).addEventListener('click', function () {
        chs('"You are fighting training dummies"', true);
        if (!global.flags.dm1ap) { appear(dom.d1m); global.flags.dm1ap = true };
        area_init(area.trn3);
      });
    }
    chss.tdf.onEnter = function () {
      area_init(area.nwh);
    }

    chss.t2 = new Chs();
    chss.t2.id = 103;
    chss.t2.sl = function () {
      global.lst_loc = 103; global.flags.inside = true;
      chs('"Instructor: ' + select(['Good', 'Nice', 'Great', 'Excellent']) + ' ' + select(['job', 'work']) + ' kid! Here\'s the reward for completing the course"', true, 'lime');
      chs('"->"', false).addEventListener('click', function () {
        if (global.flags.tr1_win === true && !global.flags.rwd1) { global.flags.rwd1 = true; giveItem(item.appl, 4); giveItem(item.hrb1, 5); smove(chss.tdf); }
        else if (global.flags.tr2_win === true && !global.flags.rwd2) { global.flags.rwd2 = true; giveItem(item.brd, 2); giveItem(item.hrb1, 5); giveItem(eqp.sndl); smove(chss.tdf); }
        else if (global.flags.tr3_win === true && !global.flags.rwd3) { global.flags.rwd3 = true; let itm = giveItem(eqp.vst); itm.dp *= .7; if (global.flags.m_un === true) giveItem(item.cp, 10); }
        if (!global.flags.tr3_win || !global.flags.tr2_win || !global.flags.tr1_win) smove(chss.tdf);
        else { ; smove(chss.t3); giveTitle(ttl.inn); }
      });
    }

    chss.t3 = new Chs();
    chss.t3.id = 104;
    chss.t3.sl = () => {
      global.flags.inside = true; d_loc('Dojo, lobby'); global.lst_loc = 104; global.flags.inside = true;
      if (global.flags.nbtfail) {
        chs('"Instructor: You got beaten up by an inanimated dummy?! Pay attention to your condition!"', true);
        chs('"..."', false).addEventListener('click', () => {
          global.flags.nbtfail = false;
          clr_chs();
          smove(chss.tdf, false);
          giveItem(item.hrb1, 4);
        });
      }
      else {
        if (!global.flags.dj1end) {
          chs('"Instructor: Your training is over for today, you did well. As a reward, select one of these skill manuals to practice. The better your understanding, the stronger you will be in battle"', true);
          chs('"Practitioner Skillbook (Swords)"', false).addEventListener('click', () => { giveItem(item.skl1); global.flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Knives)"', false).addEventListener('click', () => { giveItem(item.skl2); global.flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Axes)"', false).addEventListener('click', () => { giveItem(item.skl3); global.flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Spears)"', false).addEventListener('click', () => { giveItem(item.skl4); global.flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Hammers)"', false).addEventListener('click', () => { giveItem(item.skl5); global.flags.dj1end = true; smove(chss.lsmain1); });
          chs('"Practitioner Skillbook (Martial)"', false).addEventListener('click', () => { giveItem(item.skl6); global.flags.dj1end = true; smove(chss.lsmain1); });
        }
        else if (global.flags.trnex1 === true && !global.flags.trnex2) {
          chs('"Instructor: Hahahhha! What a great disciple! That\'s not the dedication most of the other disciples have! Take this, it\'ll help you in your future endeavours"', true, 'yellow');
          chs('"Thanks teacher!"', false).addEventListener('click', () => {
            giveItem(acc.snch);
            smove(chss.lsmain1);
            global.flags.trnex2 = true;
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
          if (global.flags.dj1end === true && you.lvl >= 10 && !global.flags.trne1e1) chs('"Challenge a stronger opponent"', false).addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne1);
            chs('"<= Escape"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (global.flags.trne1e1 && !global.flags.trne2e1) chs('"Challenge an even stronger opponent"', false, 'cornflowerblue').addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne2);
            chs('"<= Escape"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (global.flags.trne2e1 && !global.flags.trne3e1) chs('"Challenge a dangerous opponent"', false, 'crimson').addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne3);
            chs('"<= Escape"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (global.flags.trne3e1 && !global.flags.trne4e1) chs('"Challenge a powerful opponent"', false, 'red').addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne4);
            chs('"<= Escape"', false).addEventListener('click', () => {
              smove(chss.t3, false);
            });
          });
          if (global.flags.dj1end) chs('"Turn in dojo gear"', false).addEventListener('click', () => {
            chs('"Instructor: You can return whatever you punched off of dummies and get coin for it, it\'s dojo\'s equipment after all. Or you can keep and use for it yourself, the choice is yours"', true);
            chs('"Return the rags"', false).addEventListener('click', () => {
              let dlr = 0;
              stash = [];
              verify = true;
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
                  global.stat.ivtntdj += stash.length;
                  giveWealth(dlr);
                  for (let a in stash) removeItem(stash[a]);
                  if (global.stat.ivtntdj >= 300) giveTitle(ttl.tqtm);
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
          if (global.flags.djmlet && getDay(1) == 'Sunday') {
            chs('"Grab a serving of free food"', false, 'lime').addEventListener('click', () => {
              if (getDay(1) == 'Sunday') {
                msg(select(['*Chow*', '*Munch*', '*Crunch*', '*Gulp*']), 'lime');
                msg(select(['That was good!', 'Delicious!', 'A little dry but, that will do', 'Tasty!', 'Phew, I needed that!']), 'lime');
                you.sat = you.satmax;
                giveSkExp(skl.glt, 42);
                dom.d5_3_1.update();
                global.flags.djmlet = false;
                smove(chss.t3, false);
                return
              } else {
                msg('Too late for that', 'yellow');
                global.flags.djmlet = false;
                smove(chss.t3, false);
                return
              }
            });
          }
          if (global.flags.dj1end === true) chs('"Level Advancement"', false, 'orange').addEventListener('click', () => {
            chs('"Instructor: If you put effort into training you will get rewards as long as you are still a disciple of this hall. After every 5 levels you reach, come here and recieve your share! You might get something really useful if you continue to improve your skills"', true);
            if (!global.flags.dj1rw1 && you.lvl >= 5) {
              chs('"Level 5 reward"', false).addEventListener('click', () => {
                chs('"Instructor: This is a good start, congratulations! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  global.flags.dj1rw1 = true;
                  giveWealth(25);
                  giveItem(item.sp1, 5);
                  smove(chss.t3, false);
                });
              });
            }
            if (!global.flags.dj1rw2 && global.flags.dj1rw1 === true && you.lvl >= 10) {
              chs('"Level 10 reward"', false, 'royalblue').addEventListener('click', () => {
                chs('"Instructor: You seem to not neglect your training, good job! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  global.flags.dj1rw2 = true;
                  giveWealth(100);
                  giveItem(item.sp2, 2);
                  smove(chss.t3, false);
                });
              });
            }
            if (!global.flags.dj1rw3 && global.flags.dj1rw2 === true && you.lvl >= 15) {
              chs('"Level 15 reward"', false, 'lime').addEventListener('click', () => {
                chs('"Instructor: You\'re slowly growing into a fine young warrior! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  global.flags.dj1rw3 = true;
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
            if (!global.flags.dj1rw4 && global.flags.dj1rw3 === true && you.lvl >= 20) {
              chs('"Level 20 reward"', false, 'gold').addEventListener('click', () => {
                chs('"Instructor: Time to start getting serious! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  global.flags.dj1rw4 = true;
                  giveWealth(300);
                  giveItem(wpn.tkmts);
                  smove(chss.t3, false);
                });
              });
            }
            if (!global.flags.dj1rw5 && global.flags.dj1rw4 === true && you.lvl >= 25) {
              chs('"Level 25 reward"', false, 'orange').addEventListener('click', () => {
                chs('"Instructor: You\'re almost ready to face real dangers of the outside world! Keep working hard!"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  global.flags.dj1rw5 = true;
                  giveWealth(350);
                  giveItem(acc.mnch);
                  smove(chss.t3, false);
                });
              });
            }
            if (!global.flags.dj1rw6 && global.flags.dj1rw5 === true && you.lvl >= 30) {
              chs('"Level 30 reward"', false, 'crimson').addEventListener('click', () => {
                chs('"Instructor: You are almost as strong as an average adult! Good job kid and Keep working hard! Maybe you can defend this village one day"', true);
                chs('"Accept"', false, 'lime').addEventListener('click', () => {
                  global.flags.dj1rw6 = true;
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
          if (global.flags.trne4e1 && !global.flags.trne4e1b) {
            chs('"Instructor: Once again, choose the skillbook of specialization you are interested in. Doesn\'t mean you have to stick with it to the bitter end, but it will help you train"', true);
            chs('"Bladesman Manual"', false).addEventListener('click', () => { giveItem(item.skl1a); global.flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Assassin Manual"', false).addEventListener('click', () => { giveItem(item.skl2a); global.flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Axeman Manual"', false).addEventListener('click', () => { giveItem(item.skl3a); global.flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Lancer Manual"', false).addEventListener('click', () => { giveItem(item.skl4a); global.flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Clubber Manual"', false).addEventListener('click', () => { giveItem(item.skl5a); global.flags.trne4e1b = true; smove(chss.lsmain1); });
            chs('"Brawler Manual"', false).addEventListener('click', () => { giveItem(item.skl6a); global.flags.trne4e1b = true; smove(chss.lsmain1); });
          }
        }
      }
    }
    chss.t3.onEnter = function () {
      area_init(area.nwh);
    }

    chss.djinf = new Chs();
    chss.djinf.id = 160;
    chss.djinf.sl = () => {
      global.flags.inside = true; d_loc('Dojo, Infoboard'); global.lst_loc = 160;
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

    chss.trne1e1 = new Chs();
    chss.trne1e1.id = 124;
    chss.trne1e1.sl = () => {
      global.flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 124;
      chs('Instructor: Great job smashing that golem! This golem is one of the weakest types around, but even he can become a huge trouble if you\'re not giving it your best. Now, grab this and proceed with your training', true);
      chs('"Proceed with your training"', false).addEventListener('click', () => {
        giveItem(item.hptn1, 10);
        global.flags.trne1e1 = true;
        smove(chss.t3);
      });
    }

    chss.trne2e1 = new Chs();
    chss.trne2e1.id = 125;
    chss.trne2e1.sl = () => {
      global.flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 125;
      chs('Instructor: Just like that, keep it up. You are starting to stand much longer in fights, such an improvement from when you just arrived here! You deserver your praise, but don\'t get complacent', true);
      chs('"Proceed with your training"', false).addEventListener('click', () => {
        giveItem(wpn.fksrd);
        giveItem(acc.otpin);
        global.flags.trne2e1 = true;
        smove(chss.t3);
      });
    }

    chss.trne3e1 = new Chs();
    chss.trne3e1.id = 126;
    chss.trne3e1.sl = () => {
      global.flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 126;
      chs('Instructor: That was a tough one, but you still managed to crush it! You are getting close to finishing a second course. Don\'t give up!', true);
      chs('"Proceed with your training"', false).addEventListener('click', () => {
        giveItem(item.scrlw);
        global.flags.trne3e1 = true;
        smove(chss.t3);
      });
    }

    chss.trne4e1 = new Chs();
    chss.trne4e1.id = 162;
    chss.trne4e1.sl = () => {
      global.flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 162;
      chs('Instructor: <span style="color:lime">As expected, you have what it takes to protect yourself! And with that, you have finished the second entry course of this dojo, job well done! Soon, you will be able to step out of the village and take on serious jobs that will let you explore the land. You better prepare yourself well before that happens!</span>', true);
      chs('"Finish training"', false, 'lime').addEventListener('click', () => {
        global.flags.trne4e1 = true;
        smove(chss.t3);
      });
    }

    chss.return1 = new Chs();
    chss.return1.id = 105;
    chss.return1.sl = () => {
      global.flags.inside = true; d_loc('Dojo, training area'); global.lst_loc = 105;
      chs('Punch as many as you want', true);
      if (!global.flags.trnex2) area_init(area.trn);
      else area_init(area.trnf);
      chs('"<= Return back into lobby"', false).addEventListener('click', () => {
        smove(chss.t3);
      });
    }

    chss.frstn1main = new Chs();
    chss.frstn1main.id = 113;
    chss.frstn1main.sl = () => {
      global.flags.inside = false; d_loc('Western Woods, The Wooden Gate'); global.lst_loc = 113;
      chs('You\'re out in the forest. You can hunt here', true);
      chs('"=> Enter the Hunter\'s lodge"', false).addEventListener('click', () => {
        smove(chss.frstn1b1);
      });
      chs('"=> Delve inside the forest"', false).addEventListener('click', () => {
        smove(chss.frstn1a1);
      });
      if (global.flags.frstn1a3u) chs('"=> Hunt indefinitely"', false).addEventListener('click', () => {
        smove(chss.frstn1a3);
      });
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.lsmain1);
      });
    }

    chss.frstn1a3 = new Chs();
    chss.frstn1a3.id = 130;
    addtosector(sector.forest1, chss.frstn1a3)
    chss.frstn1a3.sl = () => {
      global.flags.inside = false; d_loc('Western Woods, They\'re Nearby'); global.lst_loc = 130;
      chs('The woods are silent', true);
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn1main);
      });
    }
    chss.frstn1a3.onEnter = function () {
      area_init(area.frstn1a3);
    }

    chss.frstn1a4 = new Chs();
    chss.frstn1a4.id = 161;
    addtosector(sector.forest1, chss.frstn1a4)
    chss.frstn1a4.sl = () => {
      global.flags.inside = false; d_loc('Western Woods, Round Branches');
      if (area.frstn1a4.size > 0) {
        chs('Something ambushes you!', true, 'red');
        chs('"<= Escape"', false).addEventListener('click', () => {
          smove(chss.frstn1main);
        });
      } else {
        chs('You never knew this secluded area was here', true);
        if (!global.flags.frstnskltg) chs('"Look around"', false).addEventListener('click', () => {
          chs('You see something sticking out from the ground in the grass over there. Bones?', true);
          chs('"Examine whatever that might be"', false).addEventListener('click', () => {
            chs('Indeed, bones. Skeletal remains of a person to be exact. Looks like he died long time ago, much of everything rotted off, even metallic bits of whatever armor he was wearing have fallen apart.', true);
            chs('"See if you can salvage anything"', false).addEventListener('click', () => {
              chs('There isn\'t much you can take with you, except for the sword on the skeleton\'\s hip, still inside its half-desintegrated sheath. What was the cause of his death? He wasn\'t in a fight judging by the state of the sword. Was he poisoned? Or caught by surprise? Couldn\'t leave this place for whatever reason? You are not sure. The least you can do is honor the deceased by burying his remains', true);
              chs('"Make a grave"', false).addEventListener('click', () => {
                global.flags.frstnskltg = true;
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
    chss.frstn1a4.onEnter = function () {
      if (area.frstn1a4.size > 0) area_init(area.frstn1a4);
    }
    chss.frstn1a4.onLeave = function () {
      area.frstn1a4.size = rand(5) + 20;
    }
    chss.frstn1a4.data = { scoutm: 600, scout: 0, scoutf: false, gets: [false], gotmod: 0 }
    chss.frstn1a4.scout = [
      { c: .009, f: () => { msg('You discover a pouch half-etched into the ground and covered by a rock. It probably belonged to the corpse', 'lime'); giveItem(item.mnblm, 3); chss.frstn1a4.data.gets[0] = true }, exp: 35 },
      { c: .0005, cond: () => { if (getHour() >= 0 && getHour() <= 3 && getLunarPhase() === 0) return true }, f: () => { msg('You found Moonbloom!', 'lime'); giveItem(item.mnblm); }, exp: 10 },
    ]
    chss.frstn1a4.onScout = function () { scoutGeneric(this) }


    chss.frstn1b1 = new Chs();
    chss.frstn1b1.id = 118;
    chss.frstn1b1.sl = () => {
      global.flags.inside = true; d_loc('Western Woods, Hunter\'s Lodge');
      if (wearingany(wpn.mkrdwk) && !global.flags.wkrtndrt) {
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
                    global.flags.wkrtndrt = true;
                    smove(chss.frstn1b1, false)
                  });
                });
              });
            });
          });
        });
        return;
      }
      if (!global.flags.frstn1b1int) { chs('<span style="color:limegreen">Head Hunter Yamato</span>: Hm? Your face is unfamiliar. Might be your first time around here I take it? These are the Western Woods, or simply the western part of the forest. Spots here are very meek and mild on danger and resources, it is perfect for newbies like you. You are free to come and hunt as much as you like. Consider doing some of the available jobs while you\'re at it. Won\'t pay much, but you can be of help to the people.', true, 'orange', null, null, null, '.9em'); global.flags.frstn1b1int = true } else global.flags.wkrtndrt && random() > .5 ? chs(select(['You sight the hunter thinking deeply about something', 'You hear mumbling']), true) : chs(select(['You see a variety of bows and other hunting tools arranged on the table and hanging from the walls', 'You notice head hunter maintaining his hunting gear', 'The smell of beef jerky assaults your nose']), true);
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
      if (quest.fwd1.data.done === true && quest.hnt1.data.done === true && !global.flags.frstn1b1g1) {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: You\'re still going around without a proper weapon? That won\'t do, catch this. It isn\'t much, but a bit better than you being nearly emptyhanded. Once you return back you should check the ' + col('Notice Board', 'lime') + ' by the village center, you never know if something important is happening in the ouskirts that you aren\'t aware of, but it will almost certainly be written there. You may find a job offer or two, or see pleads of fellow villagers asking for help with mundane things, consider those as well', true);
        chs('"Thanks!"', false).addEventListener('click', () => {
          chs('<span style="color:limegreen">Head Hunter Yamato</span>: One more thing. I\'ll ask you to do this very easy, little job. Grab this bag and get it to the village\'s herbalist. You know where the herbalist is? Here are the directions, listen well: head to the marketplace and look for a very unremarkable little building with a sign that looks like a vial. Like those vials they use in alchemy, those ones. The building is located a little further back from the road, in the shade, so you may simply forget it exists if you aren\'t specifically looking for it, you keep your eyes peeled. Now go, you should have no problem getting there', true);
          chs('"Got it"', false).addEventListener('click', () => {
            global.flags.frstn1b1g1 = true;
            giveItem(wpn.dgknf);
            giveItem(item.htrsvr);
            smove(chss.frstn1b1, false);
            global.flags.phai1udt = true;
          });
        });
      }
    }

    chss.htrtch0 = new Chs();
    chss.htrtch0.id = 164;
    chss.htrtch0.sl = () => {
      global.flags.inside = true;
      chs('<span style="color:limegreen">Head Hunter Yamato</span>: What do you want to ask, kid? Want to know how to butcher a carcass? Khahhahhah! *cough*', true);
      chs('"About monsters"', false).addEventListener('click', () => { smove(chss.htrtch1, false) });
      chs('"What are monster ranks?"', false).addEventListener('click', () => {
        chs('<div style="line-height:16px"><span style="color:limegreen">Head Hunter Yamato</span>: Ranking is a way to separate monsters by their relative danger level, they go as following:<div style="border: darkblue 1px solid;background-color:#0b1c3c;margin:10px;"><div><span style="color:lighgrey">G - Can be dealth with by able people</span></div><div><span style="color:white">F - Can be dealth with by male adults</span></div><div><span style="color:lightgreen">E - Village Crisis</span></div><div><span style="color:lime">D - Townside Crisis</span></div><div><span style="color:yellow">C - Citywide Crisis</span></div><div><span style="color:orange">B - National Crisis</span></div><div><span style="color:crimson">A - Continental Threat</span></div><div><span style="color:gold;text-shadow: 0px 0px 2px red,0px 0px 2px red,0px 0px 2px red">S - Global Crisis</span></div><div><span style="color:black;text-shadow:hotpink 1px 1px .1em,cyan -1px -1px .1em">SS - World Disaster</span></div><div><span style="color:white;text-shadow:2px 0px 2px red,-2px 0px 2px magenta,0px 2px 2px cyan,0px -2px 2px yellow,0px 0px 2px gold">SSS - Universal Calamity</div></div>We haven\'t experienced anything stronger than the E rank in all history of our village. Whatever is above the A rank is completely unheard of, and only partially mentioned in ancient texts. That\'s the realm of gods, world destroyers and higher beings that our mortal souls are unlikely to ever face</div>', true, 0, 0, 0, 0, '.9em');
        chs('"<= Return"', false).addEventListener('click', () => { smove(chss.htrtch0, false) });
      });
      chs('"<= Return"', false).addEventListener('click', () => { smove(chss.frstn1b1, false) });
    }

    chss.htrtch1 = new Chs();
    chss.htrtch1.id = 163;
    chss.htrtch1.sl = () => {
      global.flags.inside = true;
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


    chss.frstn1b1s = new Chs();
    chss.frstn1b1s.id = 121;
    chss.frstn1b1s.sl = () => {
      global.flags.inside = true;
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

    chss.frstn1b1j = new Chs();
    chss.frstn1b1j.id = 119;
    chss.frstn1b1j.sl = () => {
      global.flags.inside = true;
      chs('<span style="color:limegreen">Head Hunter Yamato</span>: Here is what\'s available, take a look', true);
      if (quest.fwd1.data.done && quest.hnt1.data.done) {
        if (!quest.lmfstkil1.data.started && !quest.lmfstkil1.data.done) {
          chs('"Monster eradication"', false).addEventListener('click', () => {
            if (you.lvl < 20 || !global.flags.trne4e1) { msg('<span style="color:limegreen">Head Hunter Yamato</span>: Don\'t even think about it, you will not be sent to your death. Go back and train, dojo has everything you need'); return }
            if (!quest.lmfstkil1.data.started) {
              chs('<span style="color:limegreen">Head Hunter Yamato</span>: What\'s this? Your aura has changed since we last met! All the martial training you went through certainly hasn\'t gone to waste, this kid is definitely isn\'t a pushover anymore, hah! If you have the guts to take on the next task, listen well - southern forest is becoming more and more dangerous, lethal beasts keep crawling in from the farther plains, making it very difficult to do any sort of work in the south. Looks like wolves this time. Some fear, at this rate, they might reach and assault the village, and that will have need to be dealth with. This is a dangerous issue, and you will have to have courage to take it on, but in turn it will serve you as great real battle experience. Other lads have already signed up, as well. Are you willing?', true, 'yellow', 0, 0, 0, '.9em');
              chs('"Accept"', false, 'lime').addEventListener('click', () => {
                giveQst(quest.lmfstkil1);
                global.flags.frst1u = true;
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

    chss.frstn1a1 = new Chs();
    chss.frstn1a1.id = 114;
    addtosector(sector.forest1, chss.frstn1a1)
    chss.frstn1a1.sl = () => {
      global.flags.inside = false; d_loc('Western Woods, The Yellow Path');
      chs('The woods are silent', true);
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn1main);
      });
    }
    chss.frstn1a1.onEnter = function () {
      area_init(area.frstn1a2);
    }

    chss.frstn1a2 = new Chs();
    chss.frstn1a2.id = 115;
    addtosector(sector.forest1, chss.frstn1a2)
    chss.frstn1a2.sl = () => {
      global.lst_loc = 115; global.flags.inside = false; d_loc('Western Woods, The Underbushes');
      chs('You scavenged some goods from this forest area', true);
      chs('"=> Go further into the forest"', false).addEventListener('click', () => {
        smove(chss.frstn2a1);
      });
      if (global.flags.frstnscgr) chs('"\-\-> Enter the hidden path"', false, 'grey').addEventListener('click', () => {
        smove(chss.frstn1a4);
      });
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn1main);
      });
    }
    chss.frstn1a2.data = { scoutm: 320, scout: 0, scoutf: false, gets: [false], gotmod: 0 }
    chss.frstn1a2.scout = [
      { c: .008, f: () => { msg('You uncover a hidden passage!', 'lime'); global.flags.frstnscgr = true; smove(chss.frstn1a4); chss.frstn1a2.data.gets[0] = true }, exp: 66 },
    ]
    chss.frstn1a2.onScout = function () { scoutGeneric(this) }


    chss.frstn2a1 = new Chs();
    chss.frstn2a1.id = 120;
    addtosector(sector.forest1, chss.frstn2a1)
    chss.frstn2a1.sl = () => {
      global.flags.inside = false; d_loc('Western Woods, The Shaded Path');
      chs('The woods are silent', true);
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn1main);
      });
    }
    chss.frstn2a1.onEnter = function () {
      area_init(area.frstn2a2);
    }

    chss.frstn3main = new Chs();
    chss.frstn3main.id = 168;
    chss.frstn3main.sl = () => {
      global.flags.inside = false; d_loc('Southern Forest, The Oaken Gate'); global.lst_loc = 168;
      chs('The air here feels intimidating', true);
      chs('"=> Explore the depths"', false).addEventListener('click', () => {
        smove(chss.frstn9a1m);
      });
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.lsmain1);
      });
    }

    chss.frstn9a1m = new Chs();
    chss.frstn9a1m.id = 169;
    chss.frstn9a1m.sl = () => {
      global.flags.inside = false; d_loc('Southern Forest, The Foliage'); global.lst_loc = 169;
      chs('This place looks dark', true);
      chs('"<= Return back"', false).addEventListener('click', () => {
        smove(chss.frstn3main);
      });
    }
    chss.frstn9a1m.onEnter = function () {
      area_init(area.frstn9a1);
    }


    chss.lsmain1 = new Chs();
    chss.lsmain1.id = 106;
    addtosector(sector.vcent, chss.lsmain1);
    addtosector(sector.vmain1, chss.lsmain1)
    chss.lsmain1.sl = () => {
      global.flags.inside = false; d_loc('Village Center'); global.lst_loc = 106;
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
        if (!global.flags.frst1u) msg('Gate Guard: "Nothing for you to do there. Scram!"', 'yellow');
        else {
          if (!global.flags.frst1um) { msg('Gate Guard: "You were given permission to proceed. Go on"', 'yellow'); global.flags.frst1um = true } smove(chss.frstn3main)
        }
      })
      chs('"=> Enter Western Woods"', false).addEventListener('click', () => {
        if (you.lvl >= 6) smove(chss.frstn1main);
        else msg('Gate Guard: "It is too dangerous for you to leave at this moment. Come back when you train a bit"', 'yellow');
      })
      //  chs('"=> Visit Pill Tower"',false).addEventListener('click',()=>{
      //    smove(chss.pltwr1);
      //  });
      if (global.flags.mkplc1u === true) chs('"=> Visit Marketplace"', false).addEventListener('click', () => {
        smove(chss.mrktvg1);
      });
      chs('"=> Go home"', false, 'green').addEventListener('click', () => {
        smove(chss.home);
      });
      if (!global.flags.scrtgltt) chs('"=> Food stand"', false).addEventListener('click', () => {
        if (skl.trad.lvl >= 2 && random() < .2) global.flags.scrtglti = true;
        if (global.flags.scrtglti === true) {
          chs('...', true);
          chs('?', false).addEventListener('click', () => {
            chs('"Passerby: Looking for the foodstand guy? He took his stuff and went South. That one supposedly travels from place to place to sell the food he makes, doubt we\'ll see him back any time soon"', true);
            chs('Well then..', false).addEventListener('click', () => {
              global.flags.scrtgltt = true;
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
      if (!global.flags.catget) chs('"=> Approach the cat"', false).addEventListener('click', () => {
        smove(chss.cat1);
        if (!global.stat.cat_c) global.stat.cat_c = 0;
      });
      if (!global.flags.mkplc1u) {
        if (global.flags.dj1end === true && global.flags.pmfspmkm1 !== true && random() < .4) {
          chs('Paper Boy: Hey, this is for you!', true);
          chs('?', false).addEventListener('click', () => { giveItem(item.shppmf); smove(chss.lsmain1, false) });
        }
      }
    }

    chss.mrktvg1 = new Chs();
    chss.mrktvg1.id = 127;
    addtosector(sector.vmain1, chss.mrktvg1)
    chss.mrktvg1.sl = () => {
      global.flags.inside = false; d_loc('Village Center, Marketplace'); global.lst_loc = 127;
      chs('The marketplace feels busy', true);
      chs('"Grocery Shop =>"', false, 'gold').addEventListener('click', () => {
        smove(chss.grc1);
      });
      chs('"General Store =>"', false, 'gold').addEventListener('click', () => {
        smove(chss.gens1);
      });
      if (global.flags.phai1udt) chs('"Herbalist =>"', false, 'gold').addEventListener('click', () => {
        smove(chss.pha1);
      });
      chs('"Nervous Guy =>"', false).addEventListener('click', () => {
        smove(chss.fdwrg1qt);
      });

      if (global.flags.grddtjb) chs('"Checkpoint"', false, 'hotpink').addEventListener('click', () => {
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
    chss.mrktvg1.onEnter = function () {
      if (!timers.mktwawa1) timers.mktwawa1 = setInterval(function () {
        if (random() < .1) { if (!global.text.mktwawa1) global.text.mktwawa1 = ['<small>"...for that price? Are you cr..."</small>', '<small>"...no, go by yourself..."</small>', '<small>"...right, I\'ll take ' + rand(15) + ', put them in..."</small>', '<small>"...is this really?..."</small>', '<small>"...never seen this thing..."</small>', '<small>"...is this real?..."</small>', '<small>"...yeah, he said it\'s there..."</small>', '<small>"...mama!!..."</small>', '<small>"...right, coming next evening. You should probably p..."</small>', '<small>"...stop pushing!..."</small>', '<small>"...what a scam..."</small>', '<small>"...this isn\'t even fresh!..."</small>', '<small>"...why is this so expensive?..."</small>', '<small>"...I won\'t lower it further!..."</small>', '<small>"...I\'ll come back, just wait for a minute..."</small>', '<small>"...break time!..."</small>', '<small>"...who said so? Gotta be a lie..."</small>', '<small>"...whatever, I\'m not buying..."</small>', '<small>"...turn right and then..."</small>', '<small>"...check for yourself then..."</small>', '<small>"...she\'ll return shortly. As for you..."</small>', '<small>"...deal!..."</small>', '<small>"...try a different one..."</small>', '<small>"...buy it! You won\'t regret it!..."</small>', '<small>"Oh no! I dropped it in the forest!..."</small>']; msg(select(global.text.mktwawa1), 'rgb(' + rand(255) + ',' + rand(255) + ',' + rand(255) + ')') }
      }, 1000);
    }
    chss.mrktvg1.onLeave = function () {
      clearInterval(timers.mktwawa1);
      delete timers.mktwawa1
    }

    chss.jbgd1 = new Chs();
    chss.jbgd1.id = 159;
    chss.jbgd1.sl = () => {
      global.flags.inside = false; d_loc('Village Center, Marketplace Entry Gate'); global.lst_loc = 159;
      let c = chs('You are standing on guard duty. This isn\'t very fun', true);
      global.flags.work = true;
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
    chss.jbgd1.onEnter = function () {
      timers.job1t = setInterval(() => {
        if (getHour() >= 20) {
          msg('Lookout Guard: Work\'s done for today, you have performed your duty just well and earned your salary, take it. You are advised to go straight home after you check out');
          finishQst(quest.grds1);
          global.flags.work = false;
          clearInterval(this);
          smove(chss.home);
          global.flags.jcom++;
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
    chss.jbgd1.onLeave = function () {
      clearInterval(timers.job1t);
      global.flags.work = false;
    }

    chss.fdwrg1qt = new Chs();
    chss.fdwrg1qt.id = 165;
    chss.fdwrg1qt.sl = () => {
      d_loc('Marketplace, Stalls');
      chs('"<span style="color:cyan">Nervous Guy:</span> Argh, what am I gonna do now! How could this... Uh? S-sorry, can\'t talk right now, please leave me be. Ahh damn it..."<div style="color: darkgrey">The man then proceeds to fidget in unrest</div>', true)
      chs('"<= Walk away"', false).addEventListener('click', () => {
        smove(chss.mrktvg1, false);
      });
    }


    chss.grc1 = new Chs();
    chss.grc1.id = 128;
    chss.grc1.effectors = [{ e: effector.shop }];
    chss.grc1.sl = () => {
      global.flags.inside = true; d_loc('Marketplace, Grocery Shop'); global.lst_loc = 128;
      chs('Old Lady: ' + (select(['These are very fresh, buy some!', 'Freshest vegetables for the lowest price!', 'Try a few and you\'ll want even more!'])), true);
      chs('"Purchase"', false, 'orange').addEventListener('click', () => {
        chs_spec(4, vendor.grc1)
        vendor.grc1.restocked = false;
        clearInterval(timers.vndrstkchk);
        timers.vndrstkchk = setInterval(function () { if (vendor.grc1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.grc1.restocked = false; msg('We\'re restocking, step out for a minute'); smove(chss.mrktvg1, false); } });
        chs('"<= Return"', false, '', '', null, null, null, true).addEventListener('click', () => {
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
    chss.grc1.onScout = function () { scoutGeneric(this) }


    chss.gens1 = new Chs();
    chss.gens1.id = 129;
    chss.gens1.effectors = [{ e: effector.shop }];
    chss.gens1.sl = () => {
      global.flags.inside = true; d_loc('Marketplace, Shabby General Store'); global.lst_loc = 129;
      chs('Sleeping Old Man: ' + (select(['...Welcome', '...', 'zzz...', 'A customer? Pick what you want', 'Take your time'])), true);
      chs('"Purchase"', false, 'orange').addEventListener('click', () => {
        chs_spec(4, vendor.gens1)
        vendor.gens1.restocked = false;
        clearInterval(timers.vndrstkchk);
        timers.vndrstkchk = setInterval(function () { if (vendor.gens1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.gens1.restocked = false; msg('We\'re restocking, step out for a minute'); smove(chss.mrktvg1, false); } });
        chs('"<= Return"', false, '', '', null, null, null, true).addEventListener('click', () => {
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
      if (area.hmbsmnt.size >= 1000 && global.flags.hbs1 && !global.flags.bmntsmkgt) chs('Infestation problem', false, 'grey').addEventListener('click', () => {
        chs('Sleeping Old Man: Your basement is in bad shape? Same been happening to the other folks lately, it\'s not just you. Something is drilling through the underground right into people\'s homes! And then you get a cellar full of rats. A complete travesty! Some speculate there\'s a monster cave nearby, but nothing was found yet. But don\'t fret, there is a solution for you - you smoke the pests out. Light this bag and toss it in, the deeper the better. Your entire place will be filled with smog, so you will have to leave and stay out for a few hours, then you\'ll have a clean and monster free basement at your disposal. 5 ' + dom.coinsilver + ' silver the price', true);
        if (you.wealth >= SILVER * 5) chs('"Sounds good"', false, 'lime').addEventListener('click', () => {
          if (you.wealth < SILVER * 5) return;
          spend(SILVER * 5);
          giveItem(item.bmsmktt);
          global.flags.bmntsmkgt = true;
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
    chss.gens1.onScout = function () { scoutGeneric(this) }

    chss.pha1 = new Chs();
    chss.pha1.id = 166;
    chss.pha1.effectors = [{ e: effector.shop }];
    chss.pha1.sl = () => {
      global.flags.inside = true; d_loc('Marketplace, Herbalist'); global.lst_loc = 166;
      chs('Herbalist: ' + (select(['Injured? Come in, I\'ll give you a check up', 'Yes yes..', 'Don\'t neglect your well being, stack on anything you will need'])), true);
      chs('"Purchase"', false, 'orange').addEventListener('click', () => {
        chs_spec(4, vendor.pha1)
        vendor.pha1.restocked = false;
        clearInterval(timers.vndrstkchk);
        timers.vndrstkchk = setInterval(function () { if (vendor.pha1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.pha1.restocked = false; msg('We\'re restocking, step out for a minute'); smove(chss.mrktvg1, false); } });
        chs('"<= Return"', false, '', '', null, null, null, true).addEventListener('click', () => {
          smove(chss.pha1, false);
          clearInterval(timers.vndrstkchk);
        });
      });
      if (item.hrb1.amount >= 50) chs('"Sell cure grass ' + dom.coincopper + '"', false).addEventListener('click', () => {
        chs('Herbalist: Yes indeed, if you have any cure grass to sell, by all means bring it here, you can never have too much. I will take bundles of 50 for 15 ' + dom.coincopper, true);
        chs('"Sell your goods"', false, 'lime').addEventListener('click', () => {
          if (item.hrb1.amount >= 50) {
            global.stat.hbhbsld++;
            giveWealth(15);
            item.hrb1.amount -= 50;
            reduce(item.hrb1);
            if (global.stat.hbhbsld >= 7 && !global.flags.hbhbgft) {
              chs('Herbalist: You were such a great help bringing all this cure grass to me! Take this, as a bonus', true);
              chs('"Accept"', false, 'lime').addEventListener('click', () => {
                giveItem(item.hptn1, 15);
                giveItem(item.hptn2, 3);
                vendor.pha1.data.rep = vendor.pha1.data.rep + 10 > 100 ? 100 : vendor.pha1.data.rep + 10;
                msg('The Herbalist likes you a bit more', 'lime');
                global.flags.hbhbgft = true;
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
    chss.pha1.onScout = function () { scoutGeneric(this) }


    chss.vndr1 = new Chs();
    chss.vndr1.id = 116;
    chss.vndr1.effectors = [{ e: effector.shop }];
    addtosector(sector.vcent, chss.vndr1);
    addtosector(sector.vmain1, chss.vndr1)
    chss.vndr1.sl = () => {
      d_loc('Village Center, Street Food Stand'); global.lst_loc = 116;
      vendor.stvr1.restocked = false;
      clearInterval(timers.vndrstkchk);
      timers.vndrstkchk = setInterval(function () { if (vendor.stvr1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.stvr1.restocked = false; msg('We\'re restocking, step out for a minute'); smove(chss.lsmain1, false); } });
      let hi = 'Street Merchant Ran: Welcome! What would you like?';
      dom.vndr1 = chs(hi, true);
      for (let ost = 0; ost < vendor.stvr1.stock.length; ost++) {
        let itm = vendor.stvr1.stock[ost];
        dom.vndrs = chs(itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1], false);
        dom.vndrs.addEventListener('click', function () {
          if (you.wealth - itm[2] >= 0) { spend(itm[2]); mf(-itm[2], 1); m_update(); giveItem(itm[0]); global.stat.buyt++; if (--itm[1] === 0) { clr_chs(vendor.stvr1.stock.indexOf(itm) + 1); vendor.stvr1.stock.splice(vendor.stvr1.stock.indexOf(itm), 1); empty(global.dscr); global.dscr.style.display = 'none' } else this.innerHTML = itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1]; } else { clearTimeout(timers.shopcant); dom.vndr1.innerHTML = 'Sorry you can\'t afford that!'; timers.shopcant = setTimeout(() => { dom.vndr1.innerHTML = hi }, 1000) }
        });
        addDesc(dom.vndrs, itm[0]);
      }
      chs('"<= Go back"', false).addEventListener('click', () => {
        smove(chss.lsmain1, false);
        clearInterval(timers.vndrstkchk);
      });
    }

    chss.vndrkd1 = new Chs();
    chss.vndrkd1.id = 123;
    chss.vndrkd1.shop = true;
    addtosector(sector.vcent, chss.vndrkd1);
    addtosector(sector.vmain1, chss.vndrkd1)
    chss.vndrkd1.sl = () => {
      d_loc('Village Center, Child Trader'); global.lst_loc = 123;
      vendor.kid1.restocked = false;
      clearInterval(timers.vndrstkchk);
      timers.vndrstkchk = setInterval(function () { if (vendor.kid1.restocked === true) { clearInterval(timers.vndrstkchk); vendor.kid1.restocked = false; msg('You, step out for a moment, I\'m getting new stuff'); smove(chss.lsmain1, false); } });
      let hi = 'Hey, I\'ve got some good stuff for you';
      dom.vndr1 = chs(hi, true);
      for (let ost = 0; ost < vendor.kid1.stock.length; ost++) {
        let itm = vendor.kid1.stock[ost];
        dom.vndrs = chs(itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1], false);
        dom.vndrs.addEventListener('click', function () {
          if (you.wealth - itm[2] >= 0) { spend(itm[2]); mf(-itm[2], 1); m_update(); giveItem(itm[0]); global.stat.buyt++; if (--itm[1] === 0) { clr_chs(vendor.kid1.stock.indexOf(itm) + 1); vendor.kid1.stock.splice(vendor.kid1.stock.indexOf(itm), 1); empty(global.dscr); global.dscr.style.display = 'none' } else this.innerHTML = itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1]; } else { clearTimeout(timers.shopcant); dom.vndr1.innerHTML = 'Bring money next time'; timers.shopcant = setTimeout(() => { dom.vndr1.innerHTML = hi }, 1000) }
        });
        addDesc(dom.vndrs, itm[0]);
      }
      if (skl.fgt.lvl >= 5 && !global.flags.vndrkd1sp1) chs('"Show me something better"', false, 'darkgrey').addEventListener('click', () => {
        chs('So you want something from the hidden stash, huh? Good eye! You are one of the dojo runts, I\'ve got just what someone like you needs. One book, 3 silver' + dom.coinsilver + '. So, watcha say?', true);
        chs('"Give me"', false, 'lime').addEventListener('click', () => {
          if (you.wealth >= 300) {
            chs('"There ya go, enjoy"', true)
            global.flags.vndrkd1sp1 = true;
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
      else if (global.stat.moneyg >= 1000 && !global.flags.vndrkd1sp2 && global.flags.vndrkd1sp1) chs('"Show me something better"', false, 'darkgrey').addEventListener('click', () => {
        chs('Alright, there\'s something else for you, snatched from some sleeping guy and I bet would be useful for you. Similar deal, 5 silver' + dom.coinsilver, true);
        chs('"Yes please"', false, 'lime').addEventListener('click', () => {
          if (you.wealth >= 500) {
            chs('"Deal successfully made"', true)
            global.flags.vndrkd1sp2 = true;
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
    chss.vndrkd1.onLeave = function () { clearInterval(timers.vndrstkchk) }

    chss.tstauto = new Chs();
    chss.tstauto.id = -1;
    chss.tstauto.sl = () => {
      d_loc('Test auto'); global.lst_loc = -1;
      dom.testauto = chs('TEST', true);
      if (!global.flags.testauto_1 || global.flags.testauto_1 === false) chs('Run', false).addEventListener('click', () => {
        global.flags.testauto_1 = true;
        timers.testauto1 = setInterval(() => { dom.testauto.innerHTML = rand(9999999) }, 1000);
        chss.tstauto.sl();
      }); else chs('Stop', false).addEventListener('click', () => {
        global.flags.testauto_1 = false;
        chss.tstauto.sl();
        clearInterval(timers.testauto1);
      });
      chs('"<= Go back"', false).addEventListener('click', () => {
        chss.lsmain1.sl();
      });
    }

    chss.tst = new Chs();
    chss.tst.id = -1;
    chss.tst.sl = () => {
      d_loc('Test'); global.lst_loc = -1;
      dom.tst = chs('TEST', true);
      global.flags.btl = true;
      global.flags.civil = false;
      area_init(area.tst);
      chs('"<= Go back"', false).addEventListener('click', () => {
        chss.lsmain1.sl();
      });
    }

    chss.cat1 = new Chs();
    chss.cat1.id = 107;
    addtosector(sector.vcent, chss.cat1);
    addtosector(sector.vmain1, chss.cat1)
    chss.cat1.sl = () => {
      d_loc('Village Center, Cat'); //global.lst_loc = 107;
      let w = !global.stat.cat_c ? chs('There is a cat.', true) : chs('There is a cat. Pets: ' + global.stat.cat_c, true);
      chs('"Pet the cat"', false).addEventListener('click', x => {
        let a = addElement(document.body, 'span');
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
        global.stat.cat_c++;
        if (global.stat.cat_c < 333) skl.pet.use();
        w.innerHTML = 'There is a cat. Pets: ' + global.stat.cat_c;
        if (global.stat.cat_c >= 100) {
          if (!global.flags.cat_g) {
            clr_chs(2); global.flags.cat_g = true;
            chs('"???"', false).addEventListener('click', () => {
              chs('Cat wants to tag along', true);
              chs('"Take it with you"', false).addEventListener('click', () => {
                let cat = giveFurniture(furniture.cat, true, false);
                cat.data.sex = rand(1);
                cat.data.c = rand(global.text.cfc.length - 1);
                cat.data.p = rand(global.text.cfp.length - 1);
                cat.data.l1 = rand(global.text.cln.length - 1);
                let tg = rand(global.text.cln.length - 1);
                do { tg = rand(global.text.cln.length - 1) } while (tg === cat.data.l1);
                cat.data.l2 = rand(global.text.cln.length - 1);
                global.flags.catget = true;
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
      if (global.stat.cat_c >= 100) {
        chs('"???"', false).addEventListener('click', () => {
          chs('Cat wants to tag along', true);
          chs('"Take it with you"', false).addEventListener('click', () => {
            let cat = giveFurniture(furniture.cat, true, false);
            cat.data.sex = rand(1);
            cat.data.c = rand(global.text.cfc.length - 1);
            cat.data.p = rand(global.text.cfp.length - 1);
            cat.data.l1 = rand(global.text.cln.length - 1);
            let tg = rand(global.text.cln.length - 1);
            do { tg = rand(global.text.cln.length - 1) } while (tg === cat.data.l1);
            cat.data.l2 = rand(global.text.cln.length - 1);
            global.flags.catget = true;
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

    global.text.mbrdtt = ['"If you do not work your hours daily, you will not get any dessert"', '"Do your job well and you will be rewarded"', 'There is a report of a missing cat', 'There is a section of useless gossip', 'This is an  advertisement for fresh vegetables', 'This is an advertisement for dojo membership', 'This is an advertisement for wooden furniture', 'This is an advertisement for dried meat', 'This is an advertisement for joining the militia', '"The Hunter Association offers you a large variety of boxes full of smoked meat and furs"', 'This is an advertisement for herbal medicine', 'This is an advertisement for wine kegs', 'This is an advertisement for farming equipment', 'This is an advertisement for carpentery supplies', '"All the children must return home by 8PM!"', 'This is an advertisement for smithing orders', 'This is an advertisement for cooking courses', 'This is an advertisement for bottled water', 'This is an advertisement for knitting advices', 'This is an advertisement for cleaning services', 'This is a warning to stay away from fortune tellers', 'This is an advertisement for woven straw baskets', 'This is an advertisement for hemp clothing']

    chss.mbrd = new Chs();
    chss.mbrd.id = 108;
    addtosector(sector.vcent, chss.mbrd);
    addtosector(sector.vmain1, chss.mbrd)
    chss.mbrd.sl = () => {
      d_loc('Village Center, Message Board'); global.lst_loc = 108;
      for (let a in inv) if (inv[a].id === acc.wdl1.id || inv[a].id === acc.sdl1.id || inv[a].id === acc.bdl1.id || inv[a].id === acc.gdl1.id) {
        if (!global.flags.glqtdltn && (getHour() < 20 && getHour() > 8) && random() < .15) {
          {
            chs('You notice a little girl with emerald green hair approach you', true);
            chs('"?"', false).addEventListener('click', () => {
              chs('<span style="color:lime">Xiao Xiao</span>: "Hey, hey, what are those dolls you carry? Make one for me!!"', true);
              chs('"Alright..."', false).addEventListener('click', () => {
                global.flags.glqtdltn = true;
                smove(chss.mbrd, false)
              });
            });
          }
          return
        } break
      }
      chs('Message Board<br>You can find jobs or other stuff here', true);
      chs('"Explore the posts"', false).addEventListener('click', () => {
        chs(select(global.text.mbrdtt), true);
        chs('"<= Return"', false).addEventListener('click', () => {
          smove(chss.mbrd, false);
        });
      });
      if (global.flags.frstn1b1g1) {
        chs('"Notice #4"', false).addEventListener('click', () => {
          chs('It says here:<br><span style="color:orange">Looking for a anyone with free time to assist local militia with guarding duty. Apply at the checkpoint near marketplace area between 7AM and 10AM"</span>', true);
          chs('"Huh.."', false).addEventListener('click', () => {
            global.flags.grddtjb = true;
            smove(chss.mbrd);
          });
        });
        chs('"Warning!"', false).addEventListener('click', () => {
          chs('Dangerous beasts were sighted in vicinity of the Southern Forest. These reports are likely linked to the cause of livestock and locals getting injured, therefore, to avoid further casualties, entry into the forest is prohibited to those without permit or high enough self-defence ability until the situation is resolved<br><br><div style="text-align:right">一Head of The Guard, Hitoshi</div>', true);
          chs('"I see"', false).addEventListener('click', () => { smove(chss.mbrd); });
        });
      }
      if (global.flags.glqtdltn && !global.flags.glqtdldn && (getHour() < 20 && getHour() > 8)) {
        chs('"Xiao Xiao =>"', false).addEventListener('click', () => { smove(chss.xpgdqt1, false) });
      }
      chs('"<= Go back"', false).addEventListener('click', () => {
        smove(chss.lsmain1, false);
      });
    }

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
          chs('"Claim your hardearned reward"', false).addEventListener('click', () => { removeItem(dl4); global.flags.glqtdldn = true; global.offline_evil_index -= .002; msg('You feel more peaceful', 'gold'); giveItem(acc.ubrlc); smove(chss.mbrd, false) })
        });
      }
      chs('"<= Return"', false).addEventListener('click', () => {
        smove(chss.mbrd, false)
      });
    }

    chss.trd = new Chs();
    chss.trd.id = 109;
    chss.trd.sl = function (b, x) {
      global.flags.rdng = true; let rd = skl.rdg.use(); b.data.timep = b.data.timep || 0;
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
        global.stat.rdgtttl++; let rd = skl.rdg.use(); giveSkExp(skl.rdg, x || 1);
        b.cmax = (b.data.time * (1 / (1 + (rd) / 10)) / you.mods.rdgrt) - (1 / (1 + (rd) / 10) - 1) / you.mods.rdgrt;
        let c = b.cmax - b.data.timep;
        if (c < 0) c = 0;
        let ttxt;
        if (c > HOUR) ttxt = (c / HOUR << 0) + '</span> hours to finish';
        else ttxt = (c << 0) + '</span> minutes to finish';
        dom.trd.innerHTML = 'You are reading <span style="color:orange">' + b.name + '</span><br>It will take you about <span style="color:lime">' + ttxt;
        if (++b.data.timep >= b.cmax) { clearInterval(timers.rdng); clearInterval(timers.rdngdots); global.stat.rdttl++; global.flags.rdng = false; for (let gg in chss) if (chss[gg].id === global.lst_loc) chss[gg].sl(); b.use(); reduce(b); b.data.timep = 0; }
      }, 1000);
      chs('"Stop reading"', false).addEventListener('click', () => {
        clearInterval(timers.rdng);
        clearInterval(timers.rdngdots);
        global.flags.rdng = false;
        for (let gg in chss) if (chss[gg].id === global.lst_loc) chss[gg].sl();
      });
    }

    chss.home = new Chs();
    chss.home.id = 111;
    addtosector(sector.home, chss.home);
    chss.home.sl = () => {
      d_loc('Your Home'); global.lst_loc = 111;
      if (!global.flags.catget || sector.home.data.smkp > 0) chs('Your humble abode. You can rest here. ', true);
      else { if (!global.text.hmcttt) global.text.hmcttt = ['Your cat comes out to greet you!', '', 'You hear rustling', 'Meow']; chs('You feel safe. You can rest here. ' + select(global.text.hmcttt), true); }
      if (!global.flags.hbgget) chs('"Examine your bag"', false).addEventListener('click', () => {
        chs('Something you\'ve forgotten to grab before. There\'s a pack of food and some junk idea paper.', true)
        chs('Better take this with you', false).addEventListener('click', () => {
          global.flags.hbgget = true;
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
      if (!global.flags.chbdfst) chs('"Examine your hidden stash"', false).addEventListener('click', () => {
        chs('You reach for a small red box which you keep your valuables in, it is time to take it out', true)
        chs('Grab the contents', false).addEventListener('click', () => {
          giveItem(item.ywlt);
          giveItem(item.pdeedhs);
          global.flags.chbdfst = true;
          smove(chss.home, false);
        });
      });
      chs(global.flags.hbs1 === true ? '"Enter the basement"' : '"Examine basement door"', false).addEventListener('click', () => {
        if (!global.flags.hbs1) {
          if (item.key0.have) { msg('*click...* ', 'lightgrey'); msg_add('The door has opened', 'lime'); global.flags.hbs1 = true; smove(chss.home, false) } else msg("It's locked");
        } else smove(chss.bsmnthm1, false)
      });
      if (global.flags.hsedchk) chs(' "Furniture list"', false, 'orange', '', 1, 8).addEventListener('click', () => {
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
      if (global.flags.catget) {
        tcat = findbyid(furn, furniture.cat.id);
        tcat.data.mood = tcat.data.mood || 1;
        chs('"Check on Cat"', false).addEventListener('click', () => {
          if (sector.home.data.smkp > 0) { msg('Your cat went outside', 'yellow'); return }
          chs_spec(1);
          if (tcat.data.named === false) chs('"Rename"', false).addEventListener('click', () => {
            chs('Give your cat a name!<br><small>(can\'t rename later!)</small>', true);
            let inp = addElement(dom.ctr_2, 'input', 'chs');
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
          dom.ctspcl.addEventListener('click', x => {
            let a = addElement(document.body, 'span');
            global.stat.cat_c++;
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
    chss.home.onScout = function () { scoutGeneric(this) }

    global.text.bssel = ['Ack! There\'s dust and cobweb everywhere in this place', 'Spiderweb lands on your face as you enter', 'Various broken garbage is littered around', 'You step on some glass shards and crush them']
    global.text.bsseldark = ['Ack! Something touches you from the darkness', 'You step in and something crunches underneath', 'You feel like something moved in front of you', 'You touched cobweb and felt gross']

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
        if (!cansee()) chs(select(global.text.bsseldark) + '. You can\'t see anything in this darkness, it\'ll be better if you find a lightsource', true, 'darkgrey');
        else {
          chs(select(global.text.bssel), true);
          if (!global.flags.bsmntchck) chs('"Examine your surroundings"', false).addEventListener('click', () => {
            if (!cansee()) {
              chs('Your light went off..', true, 'darkgrey');
              chs('"<= Return"', false).addEventListener('click', () => {
                smove(chss.home, false);
              });
            } else {
              chs("You glance around and find mountains of broken crates, shelves, boxes, furniture and other decaying goods. Don't expect to find anything of great value amongst this trash. Perhaps you can salvage at least something if you look careful enough" + (!global.flags.bsmntchstgt ? ', like that giant chest over there' : ''), true, 'orange');
              if (!global.flags.bsmntchstgt) chs('"Seek significance of a massive container"', false).addEventListener('click', () => {
                chs("It looks like an ordinary coffer, except it's unusually big and has a padlock, which thankfully isn't locked. You get a brilliant idea to carry this hunk-a-junk upstairs", true);
                chs('"Do exactly that"', false, 'lime').addEventListener('click', () => {
                  global.flags.bsmntchstgt = true;
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
              if (!global.flags.bsmntsctgt) chs('"Rummage through rubble"', false).addEventListener('click', () => {
                chs("Indeed, simply glancing over the rubble won\'t reveal you any hidden secrets, you think you better investigate everything carefully", true);
                chs('"Prepare for further examination"', false).addEventListener('click', () => {
                  global.flags.bsmntsctgt = true;
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
      { c: .03, f: () => { msg('You found a pile of scattered firewood, some logs seem useful but others have rotted completely. You decide to grab them anyway'); giveItem(item.fwd1, rand(2, 4)); giveItem(item.wdc, (45, 90)); chss.bsmnthm1.data.gets[1] = true; }, exp: 10 },
      {
        c: .03, f: () => {
          chs('Among the rabble and remains of collapsed bookshelves you decide to confirm if anything survived. Rotten and soaked in basement juices books seems unsalvagable, bookshelves as well, you can\'t even tell if they are made of wood anymore. One of the books was incased into a small mound formed by rocks and sand, it seems surprisingly fine', true);
          chs('"<= I\'m taking this"', false).addEventListener('click', () => { chss.bsmnthm1.data.gets[2] = true; giveItem(item.jnlbk); deactivateAct(global.current_a); smove(chss.bsmnthm1, false) })
        }, exp: 15
      },
    ];
    chss.bsmnthm1.onScout = function () { scoutGeneric(this) }

    chss.hbed = new Chs();
    chss.hbed.id = 112;
    addtosector(sector.home, chss.hbed)
    chss.hbed.sl = () => {
      d_loc('Your Home, Bed'); global.lst_loc = 112; let extra = '';
      if (you.alive === false) { chs(select(['You lost consciousness...', 'You have been knocked out...', 'You passed out...']), true); you.alive = true }
      else { if (global.flags.catget) extra = select(['. Your cat is resting next to you', '. You feel warm']); chs('Great way to pass time' + extra, true); }
      chs('"<= Get up"', false).addEventListener('click', () => {
        for (let i in chss) if (chss[i].id === global.home_loc) smove(chss[i]);
      });
    }
    chss.hbed.onStay = function () {
      let hpr = (skl.sleep.use(home.bed) + (global.flags.catget ? 5 : 1) + 1) << 0;
      if (!effect.fei1.active && you.hp < you.hpmax) { you.hp + hpr <= you.hpmax ? you.hp += hpr : you.hp = you.hpmax; dom.d5_1_1.update() }
      // if(global.current_z.id!==-666&&random()<.00001){
      //   let ta = new Area(); ta.id=-666;
      //   ta.name = 'Nightmare';
      //   ta.pop = [{crt:creature.ngtmr1,lvlmin:you.lvl,lvlmax:you.lvl,c:1}]; ta.protected=true;
      //   ta.onEnd=function(){area_init(area.nwh);global.flags.civil=true; global.flags.btl=false;}; global.flags.civil=false; global.flags.btl=true;
      //   ta.size = 1; z_bake(ta); area_init(ta); dom.d7m.update(); msg('Your sins are crawling up on you','red')
      //}
    }
    chss.hbed.onEnter = function () {
      global.flags.sleepmode = true;
      if (effect.slep.active === false) giveEff(you, effect.slep);
      global.timescale = 5;
    }
    chss.hbed.onLeave = function () {
      global.flags.sleepmode = false;
      global.timescale = 1;
      removeEff(effect.slep);
    }

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
      if (!global.text.fplcextra) global.text.fplcextra = ['You\'ll need fire if you want to get some cooking done', 'You can warm up here if you light it up'];
      if (!global.text.frplcfrextra) global.text.frplcfrextra = ["You notice the fire flickering slightly", "Tiny fire is warming up the room", "Comfy fire lights up the surroundings", "Bright flame is roaring inside the Fireplace"];
      let textra0;
      if (fire.data.fuel === 0) textra0 = '';
      else if (fire.data.fuel <= 60) textra0 = global.text.frplcfrextra[0]
      else if (fire.data.fuel >= 130 && fire.data.fuel <= 300) textra0 = global.text.frplcfrextra[1];
      else if (fire.data.fuel >= 300 && fire.data.fuel <= 540) textra0 = global.text.frplcfrextra[2];
      else if (fire.data.fuel >= 540) textra0 = global.text.frplcfrextra[3];
      dom.frpls = chs('Comfy fireplace. ' + (select(global.text.fplcextra) + '<br>' + textra0), true);
      if (!global.flags.fplcgtwd) chs('"Retrieve spare firewood. You have a feeling you\'ll need it"', false).addEventListener('click', function () {
        msg("You have some lying around nearby", 'orange');
        global.flags.fplcgtwd = true;
        giveItem(item.fwd1, 3);
        smove(chss.ofrplc, false);
      });
      for (let a in its) {
        chs('"' + (select(["Toss ", "Throw "])) + its[a][1] + ' into the fireplace"', false).addEventListener('click', function () {
          its[a][0].amount--;
          fire.data.fuel = fire.data.fuel + its[a][2] > its[a][2] ? its[a][2] : fire.data.fuel + its[a][2];
          if (fire.data.fuel <= its[a][2]) dom.frpls.innerHTML = global.text.frplcfrextra[0]
          else if (fire.data.fuel >= 130 && fire.data.fuel <= 300) dom.frpls.innerHTML = global.text.frplcfrextra[1];
          else if (fire.data.fuel >= 300 && fire.data.fuel <= 540) dom.frpls.innerHTML = global.text.frplcfrextra[2];
          else if (fire.data.fuel >= 540) dom.frpls.innerHTML = global.text.frplcfrextra[3];
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

    chss.sboxhm = new Chs();
    chss.sboxhm.id = 131;
    addtosector(sector.home, chss.sboxhm)
    chss.sboxhm.sl = () => {
      d_loc('Your Home, Storage Box');
      //  chs('"Your botomless storage container, full of your belongings"',true)
      chs_spec(3, home.trunk)
      chs('"<= Step Away"', false, '', '', null, null, null, true).addEventListener('click', () => {
        smove(chss.home, false);
      });
    }

    global.text.catasound = ['You are hearing weird sounds', 'Crunching sound echoes', 'Your feet sink into the muddy ground', 'You hear wailing',
      'Something growls in the distance', 'Damp stagnant air of the underground makes it difficult to breathe', 'You hear bones', 'You notice something move in the darkness',
      'You feel sinister aura', 'Aged walls have something written on them, but you are unable to decipher what it is', 'Bone bits are littered on the ground', 'Old rotting cloth is hanging from the walls', 'Something rusty sparkes from below', 'old stale air fills your lungs'];

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

    chss.cata1 = new Chs();
    chss.cata1.id = 133;
    addtosector(sector.cata1, chss.cata1)
    chss.cata1.sl = () => {
      d_loc('Catacombs, The Casket Service'); global.lst_loc = 133;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
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

    chss.cata2 = new Chs();
    chss.cata2.id = 134;
    addtosector(sector.cata1, chss.cata2)
    chss.cata2.sl = () => {
      d_loc('Catacombs, The Mourning Hall'); global.lst_loc = 134;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata1);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata3);
      });
    }

    chss.cata3 = new Chs();
    chss.cata3.id = 135;
    addtosector(sector.cata1, chss.cata3)
    chss.cata3.sl = () => {
      d_loc('Catacombs, The Last Breath'); global.lst_loc = 135;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata4);
      });
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata2);
      });
    }

    chss.cata4 = new Chs();
    chss.cata4.id = 136;
    addtosector(sector.cata1, chss.cata4)
    chss.cata4.sl = () => {
      d_loc('Catacombs, Tunnel of the Dead'); global.lst_loc = 136;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata5);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata3);
      });
    }

    chss.cata5 = new Chs();
    chss.cata5.id = 137;
    addtosector(sector.cata1, chss.cata5)
    chss.cata5.sl = () => {
      d_loc('Catacombs, Movement Below'); global.lst_loc = 137;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
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

    chss.cata6 = new Chs();
    chss.cata6.id = 138;
    addtosector(sector.cata1, chss.cata6)
    chss.cata6.sl = () => {
      d_loc('Catacombs, The Web Corridor'); global.lst_loc = 138;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata7);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata5);
      });
    }

    chss.cata7 = new Chs();
    chss.cata7.id = 139;
    addtosector(sector.cata1, chss.cata7)
    chss.cata7.sl = () => {
      d_loc('Catacombs, Grievance'); global.lst_loc = 139;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata8);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata6);
      });
    }

    chss.cata8 = new Chs();
    chss.cata8.id = 140;
    addtosector(sector.cata1, chss.cata8)
    chss.cata8.sl = () => {
      d_loc('Catacombs, Forgotten Post'); global.lst_loc = 140;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata9);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata7);
      });
    }

    chss.cata9 = new Chs();
    chss.cata9.id = 141;
    addtosector(sector.cata1, chss.cata9)
    chss.cata9.sl = () => {
      d_loc('Catacombs, Withered Hand'); global.lst_loc = 141;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata8);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata10);
      });
    }

    chss.cata10 = new Chs();
    chss.cata10.id = 142;
    addtosector(sector.cata1, chss.cata10)
    chss.cata10.sl = () => {
      d_loc('Catacombs, The Rusted Arc'); global.lst_loc = 142;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata9);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata11);
      });
    }

    chss.cata11 = new Chs();
    chss.cata11.id = 143;
    addtosector(sector.cata1, chss.cata11)
    chss.cata11.sl = () => {
      d_loc('Catacombs, Old One\'s Destination'); global.lst_loc = 143;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata10);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata12);
      });
    }

    chss.cata12 = new Chs();
    chss.cata12.id = 144;
    addtosector(sector.cata1, chss.cata12)
    chss.cata12.sl = () => {
      d_loc('Catacombs, Thawing Candles'); global.lst_loc = 144;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata11);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata5);
      });
    }

    chss.cata13 = new Chs();
    chss.cata13.id = 145;
    addtosector(sector.cata1, chss.cata13)
    chss.cata13.sl = () => {
      d_loc('Catacombs, The Endless Echoes'); global.lst_loc = 145;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata14);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata1);
      });
    }

    chss.cata14 = new Chs();
    chss.cata14.id = 146;
    addtosector(sector.cata1, chss.cata14)
    chss.cata14.sl = () => {
      d_loc('Catacombs, The Dusty Underpass'); global.lst_loc = 146;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata15);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata13);
      });
    }

    chss.cata15 = new Chs();
    chss.cata15.id = 147;
    addtosector(sector.cata1, chss.cata15)
    chss.cata15.sl = () => {
      d_loc('Catacombs, Light\'s Corner'); global.lst_loc = 147;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata16);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata14);
      });
    }

    chss.cata16 = new Chs();
    chss.cata16.id = 148;
    addtosector(sector.cata1, chss.cata16)
    chss.cata16.sl = () => {
      d_loc('Catacombs, Son\'s Last Visit'); global.lst_loc = 148;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata17);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata15);
      });
    }

    chss.cata17 = new Chs();
    chss.cata17.id = 149;
    addtosector(sector.cata1, chss.cata17)
    chss.cata17.sl = () => {
      d_loc('Catacombs, The Stone Plate'); global.lst_loc = 149;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata18);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata16);
      });
    }

    chss.cata18 = new Chs();
    chss.cata18.id = 150;
    addtosector(sector.cata1, chss.cata18)
    chss.cata18.sl = () => {
      d_loc('Catacombs, Cracked Passageway'); global.lst_loc = 150;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata19);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata17);
      });
    }

    chss.cata19 = new Chs();
    chss.cata19.id = 151;
    addtosector(sector.cata1, chss.cata19)
    chss.cata19.sl = () => {
      d_loc('Catacombs, The Limited Leeway'); global.lst_loc = 151;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata20);
      });
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata18);
      });
    }

    chss.cata20 = new Chs();
    chss.cata20.id = 152;
    addtosector(sector.cata1, chss.cata20)
    chss.cata20.sl = () => {
      d_loc('Catacombs, The Brittle Turn'); global.lst_loc = 152;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata19);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata21);
      });
    }

    chss.cata21 = new Chs();
    chss.cata21.id = 153;
    addtosector(sector.cata1, chss.cata21)
    chss.cata21.sl = () => {
      d_loc('Catacombs, Bright Ray Above'); global.lst_loc = 153;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata20);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata22);
      });
    }

    chss.cata22 = new Chs();
    chss.cata22.id = 154;
    addtosector(sector.cata1, chss.cata22)
    chss.cata22.sl = () => {
      d_loc('Catacombs, Nowhere To Run'); global.lst_loc = 154;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata21);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata23);
      });
    }

    chss.cata23 = new Chs();
    chss.cata23.id = 155;
    addtosector(sector.cata1, chss.cata23)
    chss.cata23.sl = () => {
      d_loc('Catacombs, The Aging Room'); global.lst_loc = 155;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata22);
      });
      chs('"↓ Move South"', false).addEventListener('click', () => {
        smove(chss.cata24);
      });
    }

    chss.cata24 = new Chs();
    chss.cata24.id = 156;
    addtosector(sector.cata1, chss.cata24)
    chss.cata24.sl = () => {
      d_loc('Catacombs, Eleven Wisemen'); global.lst_loc = 156;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"↑ Move North"', false).addEventListener('click', () => {
        smove(chss.cata23);
      });
      chs('"← Move West"', false).addEventListener('click', () => {
        smove(chss.cata25);
      });
    }

    chss.cata25 = new Chs();
    chss.cata25.id = 157;
    addtosector(sector.cata1, chss.cata25)
    chss.cata25.sl = () => {
      d_loc('Catacombs, The End Of Journey'); global.lst_loc = 157;
      chs(select(global.text.catasound), true, 'lightgrey', 'black');
      chs('"→ Move East"', false).addEventListener('click', () => {
        smove(chss.cata24);
      });
    }


    function wManager() {
      let ses = getSeason()
      if (w_manager.duration > 0) w_manager.duration -= global.timescale;
      else {
        let chance = rand(1, 100);
        switch (ses) {
          case 1:
            switch (w_manager.curr.id) {
              case weather.sunny.id:
                if (chance <= 10) setWeather(weather.cloudy, rand(120, 220));
                else if (chance > 10 && chance <= 20) setWeather(weather.overcast, rand(90, 280));
                else if (chance > 20 && chance <= 90 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(300, 500));
                else if (chance > 20 && chance <= 90 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(200, 400));
                else setWeather(weather.sunny, rand(22, 44));
                break;
              case weather.cloudy.id:
                if (chance <= 15) setWeather(weather.stormy, rand(100, 200));
                else if (chance > 15 && chance <= 35) setWeather(weather.overcast, rand(90, 220));
                else if (chance > 35 && chance <= 45) setWeather(weather.rain, rand(150, 250));
                else if (chance > 45 && chance <= 65) setWeather(weather.drizzle, rand(30, 80));
                else if (chance > 65 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(300, 500));
                else if (chance > 65 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(200, 400));
                else setWeather(weather.cloudy, rand(90, 160));
                break;
              case weather.stormy.id:
                if (chance < 10) setWeather(weather.cloudy, rand(90, 120));
                else if (chance > 10 && chance <= 40) setWeather(weather.storm, rand(90, 160));
                else if (chance > 40 && chance <= 60) setWeather(weather.rain, rand(120, 200));
                else if (chance > 60 && chance <= 75) setWeather(weather.drizzle, rand(20, 40));
                else setWeather(weather.stormy, rand(60, 120));
                break;
              case weather.storm.id:
                if (chance < 5) setWeather(weather.stormy, rand(80, 120));
                else if (chance > 5 && chance <= 65) setWeather(weather.rain, rand(180, 250));
                else if (chance > 65 && chance <= 75) setWeather(weather.heavyrain, rand(80, 150));
                else setWeather(weather.storm, rand(20, 80));
                break;
              case weather.overcast.id:
                if (chance < 20) setWeather(weather.stormy, rand(50, 120));
                else if (chance > 20 && chance <= 45) setWeather(weather.cloudy, rand(100, 200));
                else if (chance > 45 && chance <= 60) setWeather(weather.clear, rand(150, 250));
                else setWeather(weather.overcast, rand(40, 90));
                break;
              case weather.rain.id:
                if (chance < 10) setWeather(weather.drizzle, rand(30, 50));
                else if (chance > 10 && chance <= 20) setWeather(weather.heavyrain, rand(100, 200));
                else if (chance > 20 && chance <= 30) setWeather(weather.overcast, rand(52, 173));
                else if (chance > 30 && chance <= 55) setWeather(weather.misty, rand(25, 55));
                else if (chance > 55 && chance <= 80) setWeather(weather.clear, rand(225, 455));
                else setWeather(weather.rain, rand(80, 120));
                break;
              case weather.heavyrain.id:
                if (chance < 10) setWeather(weather.storm, rand(80, 130));
                else if (chance > 10 && chance <= 65) setWeather(weather.rain, rand(100, 170));
                else if (chance > 65 && chance <= 75) setWeather(weather.misty, rand(15, 40));
                else if (chance > 75 && chance <= 80) setWeather(weather.clear, rand(110, 200));
                else if (chance > 80 && chance <= 90) setWeather(weather.thunder, rand(120, 200));
                else setWeather(weather.heavyrain, rand(50, 100));
                break;
              case weather.misty.id:
                if (chance < 50) setWeather(weather.foggy, rand(22, 33));
                else if (chance > 50 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 50 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else setWeather(weather.misty, rand(11, 22));
                break;
              case weather.foggy.id:
                if (chance < 20) setWeather(weather.overcast, rand(80, 130));
                else if (chance > 20 && chance <= 70 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 20 && chance <= 70 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else setWeather(weather.foggy, rand(11, 22));
                break;
              case weather.drizzle.id:
                if (chance < 20) setWeather(weather.overcast, rand(30, 60));
                else if (chance > 20 && chance <= 50) setWeather(weather.rain, rand(90, 180));
                else if (chance > 50 && chance <= 65) setWeather(weather.clear, rand(90, 180));
                else setWeather(weather.drizzle, rand(30, 62));
                break;
              case weather.clear.id:
                if (chance < 10) setWeather(weather.overcast, rand(30, 60));
                else if (chance > 10 && chance <= 55 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 10 && chance <= 55 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else if (chance > 55 && chance <= 65) setWeather(weather.cloudy, rand(100, 200));
                else setWeather(weather.clear, rand(160, 290));
                break;
              case weather.thunder.id:
                if (chance < 50) setWeather(weather.heavyrain, rand(60, 90));
                else if (chance > 50 && chance <= 80) setWeather(weather.storm, rand(80, 120));
                else setWeather(weather.thunder, rand(40, 60));
                break;
              default: setWeather(weather.clear, rand(30, 60));
                break;
            }
            break;
          case 2:
            switch (w_manager.curr.id) {
              case weather.sunny.id:
                if (chance <= 5) setWeather(weather.cloudy, rand(60, 120));
                else if (chance > 5 && chance <= 90 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(400, 700));
                else if (chance > 15 && chance <= 90 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(300, 500));
                else setWeather(weather.sunny, rand(90, 180));
                break;
              case weather.cloudy.id:
                if (chance <= 3) setWeather(weather.stormy, rand(30, 60));
                else if (chance > 3 && chance <= 8) setWeather(weather.overcast, rand(40, 120));
                else if (chance > 8 && chance <= 15) setWeather(weather.rain, rand(50, 100));
                else if (chance > 15 && chance <= 25) setWeather(weather.drizzle, rand(30, 80));
                else if (chance > 25 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(300, 500));
                else if (chance > 25 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(200, 400));
                else setWeather(weather.cloudy, rand(40, 120));
                break;
              case weather.stormy.id:
                if (chance < 35) setWeather(weather.cloudy, rand(60, 120));
                else if (chance > 35 && chance <= 40) setWeather(weather.storm, rand(90, 160));
                else if (chance > 40 && chance <= 60) setWeather(weather.rain, rand(70, 120));
                else if (chance > 60 && chance <= 85) setWeather(weather.drizzle, rand(60, 900));
                else setWeather(weather.stormy, rand(60, 120));
                break;
              case weather.storm.id:
                if (chance < 5) setWeather(weather.stormy, rand(30, 50));
                else if (chance > 5 && chance <= 65) setWeather(weather.rain, rand(140, 200));
                else if (chance > 65 && chance <= 70) setWeather(weather.heavyrain, rand(80, 150));
                else setWeather(weather.storm, rand(20, 80));
                break;
              case weather.overcast.id:
                if (chance < 5) setWeather(weather.stormy, rand(20, 60));
                else if (chance > 5 && chance <= 45) setWeather(weather.cloudy, rand(100, 200));
                else if (chance > 45 && chance <= 65) setWeather(weather.clear, rand(150, 250));
                else setWeather(weather.overcast, rand(60, 110));
                break;
              case weather.rain.id:
                if (chance < 10) setWeather(weather.drizzle, rand(50, 70));
                else if (chance > 10 && chance <= 15) setWeather(weather.heavyrain, rand(50, 80));
                else if (chance > 15 && chance <= 40) setWeather(weather.overcast, rand(82, 173));
                else if (chance > 40 && chance <= 55) setWeather(weather.misty, rand(25, 55));
                else if (chance > 55 && chance <= 80) setWeather(weather.clear, rand(225, 455));
                else setWeather(weather.rain, rand(80, 120));
                break;
              case weather.heavyrain.id:
                if (chance < 10) setWeather(weather.storm, rand(80, 130));
                else if (chance > 10 && chance <= 65) setWeather(weather.rain, rand(100, 170));
                else if (chance > 65 && chance <= 75) setWeather(weather.misty, rand(15, 40));
                else if (chance > 75 && chance <= 87) setWeather(weather.clear, rand(110, 200));
                else if (chance > 87 && chance <= 90) setWeather(weather.thunder, rand(120, 200));
                else setWeather(weather.heavyrain, rand(50, 100));
                break;
              case weather.misty.id:
                if (chance < 50) setWeather(weather.foggy, rand(22, 33));
                else if (chance > 50 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 50 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else setWeather(weather.misty, rand(11, 22));
                break;
              case weather.foggy.id:
                if (chance < 20) setWeather(weather.overcast, rand(80, 130));
                else if (chance > 20 && chance <= 70 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 20 && chance <= 70 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else setWeather(weather.foggy, rand(11, 22));
                break;
              case weather.drizzle.id:
                if (chance < 15) setWeather(weather.overcast, rand(30, 60));
                else if (chance > 15 && chance <= 40) setWeather(weather.cloudy, rand(90, 180));
                else if (chance > 40 && chance <= 50) setWeather(weather.rain, rand(50, 111));
                else if (chance > 50 && chance <= 65) setWeather(weather.clear, rand(90, 180));
                else setWeather(weather.drizzle, rand(30, 62));
                break;
              case weather.clear.id:
                if (chance < 5) setWeather(weather.overcast, rand(30, 60));
                else if (chance > 5 && chance <= 55 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 10 && chance <= 55 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else if (chance > 55 && chance <= 65) setWeather(weather.cloudy, rand(100, 200));
                else setWeather(weather.clear, rand(160, 290));
                break;
              case weather.thunder.id:
                if (chance < 50) setWeather(weather.heavyrain, rand(60, 90));
                else if (chance > 50 && chance <= 80) setWeather(weather.storm, rand(80, 120));
                else setWeather(weather.thunder, rand(40, 60));
                break;
              default: setWeather(weather.clear, rand(30, 60));
                break;
            }
            break;
          case 3:
            switch (w_manager.curr.id) {
              case weather.sunny.id:
                if (chance <= 25) setWeather(weather.cloudy, rand(120, 220));
                else if (chance > 25 && chance <= 60) setWeather(weather.overcast, rand(90, 280));
                else if (chance > 60 && chance <= 90 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(80, 150));
                else if (chance > 60 && chance <= 90 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(120, 180));
                else setWeather(weather.sunny, rand(22, 44));
                break;
              case weather.cloudy.id:
                if (chance <= 30) setWeather(weather.stormy, rand(100, 200));
                else if (chance > 30 && chance <= 55) setWeather(weather.overcast, rand(90, 220));
                else if (chance > 55 && chance <= 85) setWeather(weather.rain, rand(150, 250));
                else if (chance > 85 && chance <= 90) setWeather(weather.drizzle, rand(70, 120));
                else if (chance > 90 && chance <= 95 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(170, 250));
                else if (chance > 90 && chance <= 95 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(180, 300));
                else setWeather(weather.cloudy, rand(90, 160));
                break;
              case weather.stormy.id:
                if (chance < 15) setWeather(weather.cloudy, rand(90, 120));
                else if (chance > 15 && chance <= 40) setWeather(weather.storm, rand(90, 160));
                else if (chance > 40 && chance <= 70) setWeather(weather.rain, rand(120, 200));
                else if (chance > 70 && chance <= 85) setWeather(weather.drizzle, rand(20, 40));
                else setWeather(weather.stormy, rand(60, 120));
                break;
              case weather.storm.id:
                if (chance < 10) setWeather(weather.stormy, rand(80, 120));
                else if (chance > 10 && chance <= 45) setWeather(weather.rain, rand(180, 250));
                else if (chance > 45 && chance <= 85) setWeather(weather.heavyrain, rand(100, 190));
                else setWeather(weather.storm, rand(20, 80));
                break;
              case weather.overcast.id:
                if (chance < 20) setWeather(weather.stormy, rand(50, 120));
                else if (chance > 20 && chance <= 55) setWeather(weather.cloudy, rand(80, 150));
                else if (chance > 55 && chance <= 60) setWeather(weather.clear, rand(150, 250));
                else setWeather(weather.overcast, rand(40, 90));
                break;
              case weather.rain.id:
                if (chance < 10) setWeather(weather.drizzle, rand(30, 50));
                else if (chance > 10 && chance <= 30) setWeather(weather.heavyrain, rand(100, 200));
                else if (chance > 30 && chance <= 40) setWeather(weather.overcast, rand(52, 173));
                else if (chance > 40 && chance <= 50) setWeather(weather.misty, rand(25, 55));
                else if (chance > 50 && chance <= 65) setWeather(weather.clear, rand(100, 200));
                else setWeather(weather.rain, rand(80, 120));
                break;
              case weather.heavyrain.id:
                if (chance < 15) setWeather(weather.storm, rand(80, 130));
                else if (chance > 15 && chance <= 55) setWeather(weather.rain, rand(100, 170));
                else if (chance > 55 && chance <= 65) setWeather(weather.misty, rand(15, 40));
                else if (chance > 65 && chance <= 70) setWeather(weather.clear, rand(110, 200));
                else if (chance > 70 && chance <= 95) setWeather(weather.thunder, rand(120, 200));
                else setWeather(weather.heavyrain, rand(50, 100));
                break;
              case weather.misty.id:
                if (chance < 25) setWeather(weather.foggy, rand(22, 33));
                else if (chance > 25 && chance <= 55) setWeather(weather.overcast, rand(60, 100));
                else if (chance > 55 && chance <= 75) setWeather(weather.cloudy, rand(60, 100));
                else setWeather(weather.misty, rand(11, 22));
                break;
              case weather.foggy.id:
                if (chance < 20) setWeather(weather.overcast, rand(80, 130));
                else if (chance > 20 && chance <= 40) setWeather(weather.rain, rand(100, 200));
                else if (chance > 40 && chance <= 70) setWeather(weather.heavyrain, rand(100, 200));
                else setWeather(weather.foggy, rand(11, 22));
                break;
              case weather.drizzle.id:
                if (chance < 15) setWeather(weather.overcast, rand(30, 60));
                else if (chance > 15 && chance <= 55) setWeather(weather.rain, rand(90, 180));
                else if (chance > 55 && chance <= 60) setWeather(weather.clear, rand(60, 100));
                else if (chance > 60 && chance <= 70) setWeather(weather.cloudy, rand(40, 90));
                else setWeather(weather.drizzle, rand(30, 62));
                break;
              case weather.clear.id:
                if (chance < 25) setWeather(weather.overcast, rand(80, 140));
                else if (chance > 25 && chance <= 45 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 25 && chance <= 45 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else if (chance > 45 && chance <= 70) setWeather(weather.cloudy, rand(100, 200));
                else if (chance > 70 && chance <= 90) setWeather(weather.drizzle, rand(30, 80));
                else setWeather(weather.clear, rand(120, 200));
                break;
              case weather.thunder.id:
                if (chance < 30) setWeather(weather.heavyrain, rand(60, 90));
                else if (chance > 30 && chance <= 60) setWeather(weather.storm, rand(80, 120));
                else setWeather(weather.thunder, rand(40, 60));
                break;
              default: setWeather(weather.clear, rand(30, 60));
                break;
            }
            break;
          case 4:
            switch (w_manager.curr.id) {
              case weather.sunny.id:
                if (chance <= 40) setWeather(weather.cloudy, rand(120, 220));
                else if (chance > 40 && chance <= 80) setWeather(weather.overcast, rand(90, 280));
                else if (chance > 80 && chance <= 90 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 300));
                else if (chance > 80 && chance <= 90 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 300));
                else setWeather(weather.sunny, rand(22, 44));
                break;
              case weather.cloudy.id:
                if (chance <= 15) setWeather(weather.overcast, rand(90, 220));
                else if (chance > 15 && chance <= 17) setWeather(weather.rain, rand(30, 80));
                else if (chance > 17 && chance <= 20) setWeather(weather.drizzle, rand(30, 80));
                else if (chance > 20 && chance <= 30 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 300));
                else if (chance > 20 && chance <= 30 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 300));
                else if (chance > 30 && chance <= 60) setWeather(weather.snow, rand(180, 300));
                else if (chance > 60 && chance <= 70) setWeather(weather.sstorm, rand(90, 200));
                else setWeather(weather.cloudy, rand(90, 160));
                break;
              case weather.overcast.id:
                if (chance < 20) setWeather(weather.snow, rand(50, 120));
                else if (chance > 20 && chance <= 45) setWeather(weather.cloudy, rand(100, 200));
                else if (chance > 45 && chance <= 60) setWeather(weather.clear, rand(150, 250));
                else if (chance > 60 && chance <= 70) setWeather(weather.sstorm, rand(150, 250));
                else setWeather(weather.overcast, rand(40, 90));
                break;
              case weather.rain.id:
                if (chance < 10) setWeather(weather.drizzle, rand(30, 50));
                else if (chance > 10 && chance <= 20) setWeather(weather.snow, rand(100, 200));
                else if (chance > 20 && chance <= 30) setWeather(weather.overcast, rand(52, 173));
                else if (chance > 30 && chance <= 55) setWeather(weather.misty, rand(25, 55));
                else if (chance > 55 && chance <= 80) setWeather(weather.clear, rand(225, 455));
                else setWeather(weather.rain, rand(20, 40));
                break;
              case weather.misty.id:
                if (chance < 30) setWeather(weather.foggy, rand(22, 33));
                else if (chance > 30 && chance <= 50) setWeather(weather.snow, rand(100, 200));
                else if (chance > 50 && chance <= 80 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 50 && chance <= 80 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else setWeather(weather.misty, rand(11, 22));
                break;
              case weather.foggy.id:
                if (chance < 20) setWeather(weather.overcast, rand(80, 130));
                else if (chance > 20 && chance <= 70 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 20 && chance <= 70 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else setWeather(weather.foggy, rand(11, 22));
                break;
              case weather.drizzle.id:
                if (chance < 20) setWeather(weather.overcast, rand(30, 60));
                else if (chance > 20 && chance <= 25) setWeather(weather.rain, rand(90, 120));
                else if (chance > 25 && chance <= 40) setWeather(weather.snow, rand(90, 180));
                else if (chance > 40 && chance <= 65) setWeather(weather.clear, rand(90, 150));
                else setWeather(weather.drizzle, rand(30, 62));
                break;
              case weather.clear.id:
                if (chance < 10) setWeather(weather.overcast, rand(30, 60));
                else if (chance > 10 && chance <= 55 && getHour() >= 5 && getHour() <= 16) setWeather(weather.sunny, rand(100, 200));
                else if (chance > 10 && chance <= 55 && getHour() < 5 && getHour() > 16) setWeather(weather.clear, rand(100, 200));
                else if (chance > 55 && chance <= 65) setWeather(weather.cloudy, rand(100, 200));
                else if (chance > 65 && chance <= 75) setWeather(weather.snow, rand(100, 200));
                else setWeather(weather.clear, rand(160, 290));
                break;
              case weather.snow.id:
                if (chance < 20) setWeather(weather.sstorm, rand(80, 130));
                else if (chance > 20 && chance <= 25) setWeather(weather.rain, rand(15, 50));
                else if (chance > 25 && chance <= 40) setWeather(weather.clear, rand(90, 150));
                else if (chance > 40 && chance <= 65) setWeather(weather.overcast, rand(140, 320));
                else if (chance > 60 && chance <= 85) setWeather(weather.cloudy, rand(120, 200));
                else setWeather(weather.snow, rand(30, 62));
                break;
              case weather.sstorm.id:
                if (chance < 10) setWeather(weather.overcast, rand(30, 60));
                else if (chance > 10 && chance <= 35) setWeather(weather.snow, rand(90, 120));
                else if (chance > 35 && chance <= 45) setWeather(weather.cloudy, rand(90, 180));
                else if (chance > 45 && chance <= 65) setWeather(weather.overcast, rand(90, 150));
                else setWeather(weather.sstorm, rand(40, 120));
                break;
              default: setWeather(weather.clear, rand(30, 60));
                break;
            }
            break;
        }
        dom.d_weathert.style.backgroundColor = dom.d_weathert.style.color = 'inherit';
        dom.d_weathert.innerHTML = w_manager.curr.name
        dom.d_weathert.style.color = w_manager.curr.c ? w_manager.curr.c : 'inherit';
        dom.d_weathert.style.backgroundColor = w_manager.curr.bc ? w_manager.curr.bc : 'inherit';
        switch (w_manager.curr.id) {
          case weather.sunny.id:
            if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Sunrise'; dom.d_weathert.style.color = '#ffef33'; dom.d_weathert.style.backgroundColor = '#bf495f' }
            else if (getHour() >= 20 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
            else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Bright Night'; dom.d_weathert.style.color = 'cornflowerblue'; dom.d_weathert.style.backgroundColor = '#1d4677' }
            break;
          case weather.cloudy.id:
            if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Sunrise'; dom.d_weathert.style.color = '#ffef33'; dom.d_weathert.style.backgroundColor = '#bf495f' }
            else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Night'; dom.d_weathert.style.color = '#69e1e6'; dom.d_weathert.style.backgroundColor = '#091523' }
            break;
          case weather.overcast.id:
            if (getHour() >= 18 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
            else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Night'; dom.d_weathert.style.color = '#69e1e6'; dom.d_weathert.style.backgroundColor = '#091523' }
            break;
          case weather.rain.id:
            if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Rainy Night'; dom.d_weathert.style.color = 'cyan'; dom.d_weathert.style.backgroundColor = '#111f63' }
            break;
          case weather.misty.id:
            if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Misty Morning'; dom.d_weathert.style.color = '#ffb91d'; dom.d_weathert.style.backgroundColor = '#926b64' }
            else if (getHour() >= 18 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
            else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Misty Night'; dom.d_weathert.style.color = '#1f69a9'; dom.d_weathert.style.backgroundColor = '#2c3044' }
            break;
          case weather.foggy.id:
            if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Foggy Morning'; dom.d_weathert.style.color = '#ffc94f'; dom.d_weathert.style.backgroundColor = '#8e8280' }
            else if (getHour() >= 18 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
            else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Foggy Night'; dom.d_weathert.style.color = '#6dbbff'; dom.d_weathert.style.backgroundColor = '#273267' }
            break;
          case weather.drizzle.id:
            if (getHour() >= 22 && getHour() <= 3) { dom.d_weathert.innerHTML = 'Night Drizzle'; dom.d_weathert.style.color = 'cyan'; dom.d_weathert.style.backgroundColor = '#111f63' }
            break;
          case weather.clear.id:
            if ((getHour() > 4 && getMinute() >= 30) && getHour() <= 6) { dom.d_weathert.innerHTML = 'Sunrise'; dom.d_weathert.style.color = '#ffef33'; dom.d_weathert.style.backgroundColor = '#9c3f3f' }
            else if (getHour() >= 20 && getHour() <= 21) { dom.d_weathert.innerHTML = 'Dusk'; dom.d_weathert.style.color = 'yellow'; dom.d_weathert.style.backgroundColor = '#e8421c' }
            else if (getHour() >= 22 || getHour() <= 3) { dom.d_weathert.innerHTML = 'Starry Night'; dom.d_weathert.style.color = '#ffff66'; dom.d_weathert.style.backgroundColor = '#00397b' }
            break;
        }
      } w_manager.curr.ontick(); onSeasonTick(ses);
    }

    function setWeather(w, d) {
      w_manager.curr = w;
      w_manager.duration = d;
      dom.d_weathert.style.backgroundColor = dom.d_weathert.style.color = 'inherit';
      dom.d_weathert.innerHTML = w_manager.curr.name;
      //empty(dom.d_weather); icon(dom.d_weather,1,1,32,32)
      if (w.frain === true) { global.flags.israin = true; global.flags.issnow = false; dom.d_anomaly.innerHTML = '🌧' } else if (w.fsnow === true) { global.flags.issnow = true; global.flags.israin = false; dom.d_anomaly.innerHTML = '❄️' } else { global.flags.israin = false; dom.d_anomaly.innerHTML = ''; global.flags.issnow = false }
      if (w.c) dom.d_weathert.style.color = w.c;
      if (w.bc) dom.d_weathert.style.backgroundColor = w.bc;
    } setWeather(weather.clear, 600);

    function isWeather(weather) {
      return w_manager.curr.id === weather.id
    } wManager(); dom.d_time.innerHTML = '<small>' + getDay(global.flags.tmmode) + '</small> ' + timeDisp(time)

    function onSeasonTick(season) {
      switch (season) {
        case 4:
          if (global.stat.wsnrest > 0) { global.stat.wsnrest--; return }
          if (!global.flags.inside) {
            if (!effect.cold.active) giveEff(you, effect.cold, 5);
            else {
              if (w_manager.curr.id === weather.snow.id || w_manager.curr.id === weather.sstorm.id) { effect.cold.duration += rand(3, 7); giveSkExp(skl.coldr, .02) } else effect.cold.duration += rand(1, 3)
              if (effect.wet.active) {
                effect.cold.duration += rand(5, 10);
                effect.wet.duration -= 5;
              }
            }
          }
          if (global.stat.wsnburst <= 0) {
            global.stat.wsnburst = rand(200, 1300)
            global.stat.wsnrest = rand(20, 100)
          }
          global.stat.wsnburst--
          break
      }
    }

    function getMinute() { return time.minute % 60 }
    function getHour() { return time.hour % 24; }
    function getDay(n) { return n === 1 ? global.text.d_l[time.day % 7] : (n === 2 ? global.text.d_s[time.day % 7] : global.text.d_j[time.day % 7]) }
    function getMonth() { return time.month % 12 + 1; }
    function getYear() { return time.year; }
    function getLunarPhase() { return (time.day % 62.64 / 7.83) << 0 }
    export function getSeason(flag) {
      if (getMonth() > 2 && getMonth() <= 5) return !flag ? 1 : "Spring";
      else if (getMonth() > 5 && getMonth() <= 8) return !flag ? 2 : "Summer";
      else if (getMonth() > 8 && getMonth() <= 11) return !flag ? 3 : "Autumn";
      else return !flag ? 4 : "Winter";
    }

    function timeConv(chrono) {
      chrono.year = (chrono.minute / (518400)) << 0;
      chrono.month = (chrono.minute / (43200)) << 0;
      chrono.day = (chrono.minute / (1440)) << 0;
      chrono.hour = (chrono.minute / 60) << 0;
    }

    function timeDisp(time, future) {
      let time_t = time;
      if (future) { time_t = copy(time); time_t.minute += future; }
      timeConv(time_t);
      let mm = time_t.minute % 60;
      if (mm < 10) mm = '0' + mm;
      return time_t.year + '/' + ((time_t.month % 12) + 1) + '/' + ((time_t.day % 30) + 1) + ' ' + time_t.hour % 24 + ':' + mm;
    }

    export function dropC(crt, t) {
      t = t || 1;
      for (let j in crt.drop) if (!crt.drop[j].cond || (!!crt.drop[j].cond && crt.drop[j].cond() === true)) if (random() < crt.drop[j].chance + (crt.drop[j].chance / 100 * you.luck)) {
        giveItem(crt.drop[j].item, !!crt.drop[j].min ? rand(crt.drop[j].min, crt.drop[j].max) : t); if (you.mods.lkdbt > 0 && random() < you.mods.lkdbt) giveItem(crt.drop[j].item);
        let d = global.drdata["d" + crt.id];
        if (!d) { d = global.drdata["d" + crt.id] = []; d[j] = 1 } else d[j] = 1;
      }
      for (let jj in global.wdrop) if (random() < global.wdrop[jj].c + (global.wdrop[jj].c / 100 * you.luck)) giveItem(global.wdrop[jj].item, t);
      for (let obj in global.current_z.drop) if (!global.current_z.drop[obj].cond || (!!global.current_z.drop[obj].cond && global.current_z.drop[obj].cond() === true)) if (random() < global.current_z.drop[obj].c + (global.current_z.drop[obj].c / 100 * you.luck) + (global.current_z.drop[obj].c / 75 * skl.hst.lvl)) { giveItem(global.current_z.drop[obj].item, t); giveSkExp(skl.hst, .2) }
      if (crt.rnk < 22) { let ar = (crt.rnk - 1) / 3 << 0; for (let a in global.rdrop[ar]) if (random() < global.rdrop[ar][a].c + (global.rdrop[ar][a].c / 100 * you.luck)) giveItem(global.rdrop[ar][a].item, t) }
    }

    function dropread() {
      let t = Object.keys(global.drdata);
      let ids = [];
      for (let a in t) ids[a] = Number(t[a].substring(1))
      for (let a in ids) {
        for (let b in creature) {
          if (ids[a] === creature[b].id) {
            let dt = global.drdata[Object.keys(global.drdata)[a]]
            for (let c = 0; c < dt.length; c++) { if (dt[c]) console.log(creature[b].drop[c].item.name); else console.log("??????") }
          }
        }
      }
    }

    function roll(itm, c, mi, ma) {
      mi = mi || 1;
      let r = random();
      if (r < c + (c / 100 * you.luck)) giveItem(itm, (!!ma ? rand(mi, ma) : rand(mi)));
    }

    function handStr() {
      return (5000 + (you.str * 800)) * (1 + you.lvl * .03) * (1 + skl.unc.lvl * .1 + skl.fgt.lvl * .08 + skl.tghs.lvl * .11) / 1000 << 0
    }

    // format3() imported from ./utils

    function formatw(a) {
      let b = (Math.log(Math.abs(a + 1)) * 0.43429448190325178 | 0) + 1;
      if (b > 3) { let n = a / 1000 ** ((b - 1) / 3 << 0) * 10; return ((n - ~~n >= 0.5 ? 1 : 0) + ~~n) / 10 + global.text.nt[((b - 4) / 3 << 0)] } return a;
    }

    function d_loc(text) {
      let txt;
      if (global.flags.inside === true) txt = '|' + text + '|';
      else txt = text
      dom.d_lctt.innerHTML = txt;
      global.current_l.locn = text;
    }

    function rfeff(what) {
      let t = '';
      for (let a in what.sector) if (what.sector[a].effectors)
        for (let b in what.sector[a].effectors) t += '<span style="color:' + what.sector[a].effectors[b].e.c + ';font-size:1.2em">&nbsp' + what.sector[a].effectors[b].e.x + '<span>';
      if (what.effectors) for (let a in what.effectors) t += '<span style="color:' + what.effectors[a].e.c + ';font-size:1.2em">&nbsp' + what.effectors[a].e.x + '<span>';
      dom.d_lctte.innerHTML = t;
    }

    function lvlup(p, t) {
      if (t === 0) {
        p.hp = p.hp_r;
        p.str = p.str_r;
        p.agl = p.agl_r;
        p.spd = p.spd_r;
      } else {
        t = t || 1
        p.lvl += t;
        let sb = randf(t * p.stat_p[1], 2 * t * p.stat_p[1]);
        p.str_r += sb;
        let sa = randf(t * p.stat_p[2], 2 * t * p.stat_p[2]);
        p.agl_r += sa;
        let si = randf(t * p.stat_p[3], 2 * t * p.stat_p[3]);
        p.int_r += si;
        let hpp;
        if (p.id === you.id) hpp = Math.round(rand(1.4 * Math.log(p.lvl) * t * p.stat_p[0], 1.8 * p.lvl * t * p.stat_p[0]));
        else hpp = Math.round(rand(1.8 * Math.log(p.lvl) * t * p.stat_p[0], 2.2 * p.lvl * t * p.stat_p[0]));
        p.hp_r += hpp;
        p.hpmax += hpp;
        p.hp += hpp;
        if (p.id !== you.id) p.hp = p.hpmax = p.hp_r;
        if (p.id != you.id) p.exp = p.exp * (1 + t / 5) + 1 << 0;
        else {
          dom.d3.update();
          msg("Leveled Up " + you.lvl, 'orange');
          msg('STR +' + Math.round(sb), 'darkturquoise');
          msg_add(' | AGL +' + Math.round(sa), 'darkturquoise');
          msg_add(' | INT +' + Math.round(si), 'darkturquoise');
          msg_add(' | HP +' + hpp, 'darkturquoise');
          you.expnext_t = you.expnext();
          if (you.eqp[0].id === 10000) { you.eqp[0].cls[2] = you.lvl / 4 << 0; you.eqp[0].aff[0] = you.lvl / 5 << 0; you.eqp[0].ctype = 2 }
          if (global.stat.deadt < 1 && you.lvl >= 20) giveTitle(ttl.ndthextr)
        }
      } p.stat_r(); update_d();
    }

    export function giveExp(exp, r, g, b) {
      if (!r) exp = Math.round((exp * you.exp_t * (0.4 + you.efficiency() * 0.6))) - (you.lvl - 1);
      exp = exp <= 0 ? 1 : exp;
      if (!b) { if (global.flags.m_blh === false) if (!g) { msg('EXP: +' + formatw(exp), 'hotpink'); global.stat.exptotl += exp } } else { msg('EXP: +' + formatw(exp), 'hotpink'); global.stat.exptotl += exp }
      if (you.exp + exp < you.expnext_t) you.exp += exp;
      else {
        let extra = (you.exp + exp) - you.expnext_t;
        you.exp = 0;
        lvlup(you);
        giveExp(extra, true, true);
      }
      dom.d5_2_1.update();
    }

    export function giveSkExp(skl, exp, res) {
      exp = res === false ? exp : exp * skl.p; //skl.lastupd = time.minute+2;
      if (skl.exp + exp < skl.expnext_t) skl.exp += exp;
      else {
        let extra = (skl.exp + exp) - skl.expnext_t;
        skl.exp = 0;
        skl.lvl++;
        global.stat.slvs++;
        if (!scanbyid(you.skls, skl.id)) { you.skls.push(skl); msg('<span style="text-shadow:cyan 0px 0px 2px">New Skill Unlocked! <span style="text-shadow:red 0px 0px 2px;color:orange">"' + (!!skl.bname ? skl.bname : skl.name) + '"</span></span>', 'aqua', skl, 6); if (!global.flags.sklu) { dom.ct_bt2.innerHTML = 'skills'; global.flags.sklu = true } }
        else { msg('Skill <span style="color:tomato">\'' + (!!skl.bname ? skl.bname : skl.name) + '\'</span> Leveled Up: ' + skl.lvl, 'deepskyblue', skl, 6); } skl.onLevel();
        skl.expnext_t = skl.expnext();
        if (!!skl.mlstn) for (let ss = 0; ss < skl.mlstn.length; ss++) if (skl.mlstn[ss].lv === skl.lvl && skl.mlstn[ss].g === false) { msg("NEW PERK UNLOCKED " + '<span style="color:tomato">("' + skl.name + '")<span style="color:orange">lvl: ' + skl.mlstn[ss].lv + '</span></span>', 'lime', { x: skl.name, y: 'Perk lvl ' + skl.mlstn[ss].lv + ': <span style="color:yellow">' + skl.mlstn[ss].p + '</span>' }, 7); skl.mlstn[ss].f(); skl.mlstn[ss].g = true };
        giveSkExp(skl, extra, false);
      } skl.onGive(exp);
    }

    export function giveTitle(title, lv) {
      if (title.have === false) {
        global.titles.push(title);
        if (title.id !== 0) global.titlese.push(title);
        you.title = title;
        title.have = true;
        if (!title.tget && title.talent) { title.talent(); title.tget = true }
        title.onGet();
        for (let x in global.ttlschk) global.ttlschk[x]();
        if (!lv) { msg('New Title Earned! ' + col('"' + title.name + '"', 'orange'), 'cyan', title, 5); dom.d3.update(); }
      } else return;
    }

    function isort(type, flags) {
      empty(dom.inv_con);
      if (type === 1) for (let k = 0; k < inv.length; k++) renderItem(inv[k]);
      else {
        global.sinv = [];
        for (let k = 0; k < inv.length; k++) if (type === inv[k].stype) { global.sinv.push(inv[k]); renderItem(inv[k]); }
      }
      global.sm = type;
      if (flags && flags.tr) iftrunkopenc(1);
    }

    export function rsort(type) {
      empty(dom.ct_bt1_1);
      if (type === 0 || !type) for (let ind in global.rec_d) renderRcp(global.rec_d[ind]);
      else {
        global.srcp = [];
        for (let k = 0; k < global.rec_d.length; k++) if (type === global.rec_d[k].type) global.srcp.push(global.rec_d[k]);
        for (let k = 0; k < global.srcp.length; k++) renderRcp(global.srcp[k])
      }
      global.rm = type;
    }

    // objempty() imported from ./utils

    export function kill(obj) { obj = null; }

    function effAct_test() {
      for (let index in you.eff) you.eff[index].use(creature.bat);
    }

    function canRead() {
      if (!global.flags.civil || global.flags.civil.btl) { msg('It is too dangerous to read right now', 'red'); return false }
      if (global.flags.rdng) { msg("You\'re already reading", 'orange'); return false }
      if (global.flags.work) { msg("You have a job to do", 'orange'); return false }
      if (global.flags.busy) { msg("You'll have to stop what you're doing first", 'orange'); return false }
      if (global.flags.isshop) { msg("This isn\'t the library", 'orange'); return false }
      if (global.flags.sleepmode) { msg("You can't read while sleeping", 'orange'); return false }
      return true;
    }

    export function canScout(what) {
      if (what.data.scoutm) {
        for (let a in what.scout) if (what.data.gets[a] !== true && (!what.scout[a].cond || what.scout[a].cond() === true)) return 1;
        return 2
      } return 3
    }

    export function scoutGeneric(chs) {
      if (global.flags.isdark && !cansee()) return msg('You can\'t see anything', 'grey')
      let sct = select(chs.scout);
      let idx = chs.scout.indexOf(sct);
      giveSkExp(skl.scout, .3);
      chs.data.scout += 2 * (1 + skl.scout.lvl * .2);
      let m = 1;
      if (chs.data.scout >= chs.data.scoutm) { m = 5; chs.data.scout = 0 }
      if ((!sct.cond || sct.cond() === true) && !chs.data.gets[idx] && random() <= sct.c * m * (1 + skl.scout.lvl * .15) * (1 + chs.data.gotmod * .2)) { global.stat.dsct++; chs.data.gotmod++; sct.f(); giveSkExp(skl.scout, (sct.exp ? sct.exp : .5 / sct.c)) }
      let t = 2;
      for (let a in global.current_l.sector) { let m = canScout(global.current_l.sector[a]); if (m === 1) t = m }
      if (canScout(global.current_l) >= 2 && t >= 2) { deactivateAct(act.scout); msg('There doesn\'t seem to be anything of interest left in this area') }
    }

    function disassembleGeneric(obj) {
      for (let a in obj.dss) {
        let am = obj.dss[a].amount;
        if (obj.dss[a].q) am = (am + am * (obj.dss[a].q * skl.dssmb.lvl)) << 0;
        if (obj.dss[a].max) if (am > obj.dss[a].max) am = obj.dss[a].max;
        let c = 1;
        if (obj.slot) c = obj.dp / obj.dpmax;
        am = Math.ceil(am / (2 - c));
        giveItem(obj.dss[a].item, am)
      } giveSkExp(skl.dssmb, (2 ** obj.rar || 1) * 5 - 9.5); global.stat.dsst++;
      if (obj.slot) removeItem(obj);
      else { obj.amount--; if (obj.amount <= 0) removeItem(obj); else if (obj.stype === global.sm) updateInv(global.sinv.indexOf(obj)); else if (global.sm === 1) updateInv(inv.indexOf(obj)) }
    }

    global.text.ssns = ['春', '夏', '秋', '冬']

    function wdrseason(flag) {
      let s;
      s = !flag ? getSeason(true) : global.text.ssns[getSeason() - 1];
      dom.d_weathers.innerHTML = '[' + s + ']';
      switch (getSeason()) {
        case 1: dom.d_weathers.style.color = 'springgreen';
          dom.d_weathers.style.backgroundColor = '#253';
          break
        case 2: dom.d_weathers.style.color = 'lime';
          dom.d_weathers.style.backgroundColor = '#141';
          break
        case 3: dom.d_weathers.style.color = 'yellow';
          dom.d_weathers.style.backgroundColor = '#631';
          break
        case 4: dom.d_weathers.style.color = 'ghostwhite';
          dom.d_weathers.style.backgroundColor = '#556';
          break
      }
    }

    function ontick() {
      global.stat.tick++;
      time.minute += global.timescale;
      wManager();
      for (let a in plans[0]) plans[0][a].f();
      dom.d_time.innerHTML = '<small>' + getDay(global.flags.tmmode || 2) + '</small> ' + timeDisp(time);
      //global.stat.seed1=(random()*7e+7<<7)%7&7
      global.current_l.onStay();
      runEffectors(global.current_l.effectors)
      for (let a in sectors) { sectors[a].onStay(); runEffectors(sectors[a].effectors) }
      giveSkExp(skl.aba, .004);
      let timeh = (time.minute / DAY) << 0;
      if (global.timehold !== timeh) {
        global.timehold = timeh; //proc when day passes
        for (let a in plans[1]) plans[1][a].f();
        for (let vnd in vendor) vendor[vnd].onDayPass();
        empty(dom.d_moon);
        dom.d_moon.innerHTML = global.text.lunarp[getLunarPhase()][0];
        addDesc(dom.d_moon, null, 2, 'Lunar Phase', global.text.lunarp[getLunarPhase()][1])
        wdrseason(global.flags.ssngaijin);
        if (getSeason() === 4) global.flags.iscold = true;
        else global.flags.iscold = false;
        global.offline_evil_index += .00008
        ///////////////////////////////// 
        let timew = (time.minute / WEEK) << 0;
        if (global.timewold !== timew) {
          global.timewold = timew; //proc when week passes
          for (let a in plans[2]) plans[2][a].f();
        }
      }
      let h = getHour();
      if (h > 5 && h < 22) { global.flags.isday = true; dom.d_moon.style.display = 'none' } else { if (global.flags.inside === false && random() < .00002 * you.mods.stdstps) { msg('A star particle landed on you!', 'gold', null, null, 'darkblue'); giveItem(item.stdst) } global.flags.isday = false; dom.d_moon.style.display = '' }
      for (let g = 0; g < you.eff.length; g++) if (you.eff[g].type === 3 || you.eff[g].type === 5 || you.eff[g].type === 6) you.eff[g].use(you.eff[g].y, you.eff[g].z);
      for (let g = 0; g < global.current_m.eff.length; g++) if (global.current_m.eff[g].type === 3 || global.current_m.eff[g].type === 5 || global.current_m.eff[g].type === 6) global.current_m.eff[g].use(global.current_m.eff[g].y, global.current_m.eff[g].z);
      if (global.flags.btl === true) timers.btl = setTimeout(fght(you, global.current_m), 1000 / global.fps);
      else giveSkExp(skl.mdt, .0065 * (1 + skl.ptnc.lvl * .15) * (effect.incsk.active === true ? 2 : 1))
      for (let obj in furn) furn[obj].use();
      //for(let q in qsts) qsts[q].tracker();
      if (you.sat > 0) {
        let lose = you.mods.sdrate
        if (global.flags.iswet === true) lose *= (3 / (1 + (skl.abw.lvl * .03)))
        if (global.flags.iscold === true) lose += effect.cold.duration / 1000 / (1 + skl.coldr.lvl * .05);
        you.sat -= lose
      } else giveSkExp(skl.fmn, .1);
      if (global.flags.sleepmode) global.stat.timeslp += global.timescale;
      if (random() < .00000001) { let au = new Audio("laugh6.wav"); au.play() }
      dom.d5_3_1.update();
    }

    (function update() {
      setTimeout(function () { update(); ontick(); }, 1000 / global.fps);
    })();

    // select() imported from ./utils

    function nograd(s) {
      if (s === true) {
        for (let i = 0; i < document.getElementsByClassName('d2').length; i++) document.getElementsByClassName('d2')[i].style.background = '#0e574b';
        for (let i = 0; i < document.getElementsByClassName('d3').length; i++) document.getElementsByClassName('d3')[i].style.background = '#0e574b';
        for (let i = 0; i < document.getElementsByClassName('hp').length; i++) document.getElementsByClassName('hp')[i].style.background = '#91e6b6';
        for (let i = 0; i < document.getElementsByClassName('exp').length; i++) document.getElementsByClassName('exp')[i].style.background = '#ea9c83';
        for (let i = 0; i < document.getElementsByClassName('en').length; i++) document.getElementsByClassName('en')[i].style.background = '#4f3170';
        dom.inv_ctx.style.background = dom.inv_control_b.style.background = dom.ctrmg.style.background = '#00224e';
        dom.d7m_c.style.background = '#392c72';
        for (let i = 0; i < document.styleSheets[0].rules.length; i++) if (document.styleSheets[0].rules[i].selectorText == ".opt_c:hover, .ct_bts:hover, .chs:hover, .bts:hover, .bbts:hover, .bts_b:hover, .inv_slot:hover, .bts_m:hover") document.styleSheets[0].rules[i].style.background = '#0e574b';
        global.flags.grd_s = false;
      }
      else {
        for (let i = 0; i < document.getElementsByClassName('d2').length; i++) document.getElementsByClassName('d2')[i].style.background = 'linear-gradient(90deg,rgb(25,129,108),rgb(1,41,39))';
        for (let i = 0; i < document.getElementsByClassName('d3').length; i++) document.getElementsByClassName('d3')[i].style.background = 'linear-gradient(90deg,rgb(25,129,108),rgb(1,41,39))';
        for (let i = 0; i < document.getElementsByClassName('hp').length; i++) document.getElementsByClassName('hp')[i].style.background = 'linear-gradient(90deg,rgb(254,239,157),rgb(45,223,206))';
        for (let i = 0; i < document.getElementsByClassName('exp').length; i++) document.getElementsByClassName('exp')[i].style.background = 'linear-gradient(90deg,rgb(254,239,157),rgb(219,119,158))';
        for (let i = 0; i < document.getElementsByClassName('en').length; i++) document.getElementsByClassName('en')[i].style.background = 'linear-gradient(270deg,rgb(124,68,112),rgb(29,29,113))';
        dom.inv_ctx.style.background = dom.inv_control_b.style.background = dom.ctrmg.style.background = 'linear-gradient(90deg,rgb(0,5,51),rgb(0,65,107))';
        dom.d7m_c.style.background = 'linear-gradient(270deg,rgb(84,28,112),rgb(29,62,116))';
        for (let i = 0; i < document.styleSheets[0].rules.length; i++) if (document.styleSheets[0].rules[i].selectorText == ".opt_c:hover, .ct_bts:hover, .chs:hover, .bts:hover, .bbts:hover, .bts_b:hover, .inv_slot:hover, .bts_m:hover") document.styleSheets[0].rules[i].style.background = 'linear-gradient(90deg,rgb(25,129,108),rgb(1,41,39))';
        global.flags.grd_s = true;
      }
    }

    export function reduce(itm, am) { if (am) { itm.amount = itm.amount - am <= 0 ? 0 : itm.amount - am } if (itm.amount <= 0) { removeItem(itm); updateTrunkLeftItem(itm, true) } else if (global.sm === 1) updateInv(inv.indexOf(itm)); else if (global.sm === itm.stype) updateInv(global.sinv.indexOf(itm)); updateTrunkLeftItem(itm) }
    export function cansee() { if ((global.flags.isdark && you.mods.light > 0) || skl.ntst.lvl >= 12) return true }

    // col() imported from ./utils

    function usePlayerWeaponSkill() {
      switch (you.eqp[0].wtype) {
        case 0: skl.unc.use();
          break;
        case 1: skl.srdc.use();
          break;
        case 2: skl.axc.use();
          break;
        case 3: skl.knfc.use();
          break;
        case 4: skl.plrmc.use();
          break;
        case 5: skl.hmrc.use();
          break;
        case 6: skl.stfc.use();
          break;
      }
    }

    function printBodyPartHit(partNumber) {
      switch (partNumber) {
        case 2: msg_add(' (head)', 'orange');
          break;
        case 3: msg_add(' (body)', 'orange');
          break;
        case 4: msg_add(' (L hand)', 'orange');
          break;
        case 5: msg_add(' (R hand)', 'orange');
          break;
        case 6: msg_add(' (legs)', 'orange');
          break;
      }
    }

    function printCritIfCrit() {
      if (global.flags.crti) { msg_add(' CRIT! ', 'yellow'); global.flags.crti = false }
    }

    function printDamageNumber(ddmg) {
      let col;
      let bcol = '';
      let shd = '';
      switch (global.atype_d) {
        case 0: col = 'pink';
          break;
        case 1: col = 'lime';
          break;
        case 2: col = 'yellow';
          break;
        case 3: col = 'orange';
          bcol = 'crimson';
          break;
        case 4: col = 'cyan';
          break;
        case 5: col = 'lightgoldenrodyellow';
          shd = "gold 0px 0px 5px";
          break;
        case 6: col = 'thistle';
          shd = "blueviolet 0px 0px 5px";
          break;
      }
      if (ddmg > 9999) formatw(ddmg);
      msg_add(ddmg, col, bcol, shd);
    }

    function printHitMessage(attackerName, ddmg, targetsPlayer) {
      if (global.mabl.id === 0) msg(attackerName + (targetsPlayer === true ? global.mabl.atrg : global.mabl.btrg));
      else msg((targetsPlayer === true ? attackerName : '') + (targetsPlayer === true ? global.mabl.atrg : ('You ' + global.mabl.btrg)));
      printHitMessageResult(ddmg, targetsPlayer);
    }

    function printMultihitMessage(times, attackerName, acc_dmg, targetsPlayer) {
      msg(attackerName + ' -> x' + (times - global.miss) + '(<span style="color:lightgrey">' + times + '</span>) for ');
      printHitMessageResult(acc_dmg, targetsPlayer);
      if (time - global.miss > 0) printBodyPartHit(global.target_g)
    }

    function printHitMessageResult(ddmg, targetsPlayer) {
      printDamageNumber(ddmg);
      printCritIfCrit();
      if (targetsPlayer === true && !global.flags.msd) printBodyPartHit(global.t_n)
    }

    function doSingleAttack(attacker, defender, isPlayerAttacking) {
      if (isPlayerAttacking) {
        let dm = skl.fgt.use();
        if (you.eqp[0].twoh === true) dm += skl.twoh.use();
        you.str += dm;
        you.int += dm;
        usePlayerWeaponSkill();
      }
      attacker.battle_ai(attacker, defender);
    }

    function getlastd() {
      switch (global.atkdfty[0]) {
        case 1: return '<span style="color:black;background-color:yellow">Struck by lightning</span>';
          break;
        case 2: switch (global.atkdfty[1]) {
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
          switch (global.atkdftydt.a) {
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
          switch (global.atkdftydt.c) {
            case 0: txt += '<span style="color:' + fc[0] + ';background-color:' + fc[1] + ';text-shadow:' + fc[2] + '">' + select(['Slashed', 'Lacerated', 'Cut down', 'Hacked']) + '</span>';
              break;
            case 1: txt += '<span style="color:' + fc[0] + ';background-color:' + fc[1] + ';text-shadow:' + fc[2] + '">' + select(['Pierced', 'Impaled', 'Gored']) + '</span>';
              break;
            case 2: txt += '<span style="color:' + fc[0] + ';background-color:' + fc[1] + ';text-shadow:' + fc[2] + '">' + select(['Smashed', 'Crushed', 'Destroyed']) + '</span>';
              break;
          } txt += ' by ';
          for (let a in creature) if (creature[a].id === global.atkdftydt.id) { txt += creature[a].name; break } return txt;
          break;
        default: return 'what casualty?';
          break;
      }
    }

    function draggable(root, target) {
      root.addEventListener('mousedown', function (x) { global.ctarget = target; this.boxoffsetx = x.clientX - parseInt(target.style.left); this.boxoffsety = x.clientY - parseInt(target.style.top); global.croot = root; document.body.addEventListener('mousemove', draggablemove) });
      root.addEventListener('mouseup', function (x) { global.ctarget = null; global.croot = null; document.body.removeEventListener('mousemove', draggablemove) });
    }

    function draggablemove(x) {
      if (global.ctarget) { global.ctarget.style.left = x.clientX - global.croot.boxoffsetx; global.ctarget.style.top = x.clientY - global.croot.boxoffsety }
    }

    function _dbgman() { let g = 0; for (let a in chss) if (chss[a].id > g) g = chss[a].id; return g; }
    function _dbgitc() { let g = 0; for (let a in item) g++; for (let a in acc) g++; for (let a in sld) g++; for (a in eqp) g++; for (let a in wpn) g++; return g; }
    function _dbgspawn(arr, times) {
      let result = [];
      for (let g = 0; g < times; g++) {
        for (let a in arr) {
          let t = 0;
          if (random() < arr[a].chance + (arr[a].chance / 100 * you.luck)) {
            for (let b in result) {
              if (result[b].item.id === arr[a].item.id) { result[b].am++; break }
              if (++t === result.length) result.push({ item: arr[a].item, am: 1 });
            }
            if (!result.length > 0) result.push({ item: arr[a].item, am: 1 });
          }
        }
      }
      console.log('Spawn from the drop array ' + times + ' times\n::RESULT::');
      for (let a in result) console.log(result[a].item.name + ': x' + result[a].am)
      console.log('::END::')
    }

    function _dbggibberish(w, l) {
      let a = new String();
      for (let b = 0; b < w; b++) {
        lr = rand(1, l);
        for (let c = 0; c < lr; c++) {
          a += String.fromCharCode(rand(40960, 42124));
        } a += ' ';
      } return a;
    }

    function giveall(what) {
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
    function wearing(itm) { for (let obj in you.eqp) if (itm.data.uid === you.eqp[obj].data.uid && you.eqp[obj].id !== 10000) return true }
    function wearingany(itm) { for (let obj in you.eqp) if (itm.id === you.eqp[obj].id && you.eqp[obj].id !== 10000) return true }
    // findbest, findworst imported from ./utils

    function addPlan(plan, data) {
      let p = deepCopy(plan);
      if (data) p.data = data;
      plans[plan.id].push(p);
    }

    /////plans/////
    function Plan() {
      this.id = 0;
      this.f = function () { };
      this.data = {};
      this.destroy = function () { plans.splice(plans.indexOf(this), 1) }
    }

    planner.test = new Plan();
    planner.test.id = 1;
    planner.test.data = { date: 42 };
    planner.test.f = function () {
      if (time.minute >= this.data.date) {
        msg('done');
        this.destroy();
      }
    }

    planner.chkrot = new Plan();
    planner.chkrot.id = 1;
    planner.chkrot.data = { items: [] };
    planner.chkrot.f = function () {
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

    planner.imorph = new Plan();
    planner.imorph.id = 1;
    planner.imorph.data = { items: [] };
    planner.imorph.f = function () {
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

    planner.cchk = new Plan();
    planner.cchk.id = 1;
    planner.cchk.f = function () {
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
              let citm = false;
              for (let b in container.home_strg.c) if (container.home_strg.c[b].item.id === nitm[0].id) { citm = container.home_strg.c[b]; break }
              if (citm) citm.am += nitm[1];
              else addToContainer(container.home_strg, nitm[0], nitm[1]);
            } iftrunkopenc();
          }
        }
      }
    }; addPlan(planner.cchk)

    planner.itmwear = new Plan();
    planner.itmwear.data = { items: [] };
    planner.itmwear.f = function () {
      for (let a in planner.itmwear.data.items) {
        let itm = planner.itmwear.data.items[a];
        if (itm.dp - itm.degrade < 0) itm.dp = 0;
        else itm.dp -= itm.degrade;
        if (itm.dp <= 0) {
          itm.onDegrade();
          planner.itmwear.data.items.splice(planner.itmwear.data.items.indexOf(itm));
          removeItem(itm);
        }
      }
    }; addPlan(planner.itmwear)

    planner.djfood = new Plan();
    planner.djfood.id = 1;
    planner.djfood.f = function () {
      if (getDay(1) === "Sunday") global.flags.djmlet = true;
    }; addPlan(planner.djfood)

    planner.areafillw = new Plan();
    planner.areafillw.id = 2;
    planner.areafillw.f = function () {
      area.hmbsmnt.size += rand(5, 15);
    }; addPlan(planner.areafillw)

    planner.zrespawn = new Plan();
    planner.zrespawn.id = 1;
    planner.zrespawn.f = function () {
      if (random() <= .03 && global.flags.catget) {
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

    function _drawmap(mapdata) {
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
          tmain.fillRect(x * size, y * size, size, size);
        }
      }
      // mapdata.guicache = tmain.getImageData(0,0,canvas.width,canvas.height);
      test.maps.gui.addEventListener('mousemove', xy => {
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

    // --- Mastery moved to src/data/mastery.ts ---

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
      test.mguidk.addEventListener('click', function () { empty(test.mguic); document.body.removeChild(test.mguic); delete test.mguic });
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
      test.mgui.addEventListener('mousemove', xy => {
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
      test.mgui.addEventListener('click', xy => {
        if (test.mgui.selected && test.mgui.selected.data.lvl < test.mgui.selected.limit && test.mgui.selected.have) { test.mgui.selected.data.lvl++; test.mgui.selected.onlevel(); you.stat_r(); dom.d5_1_1m.update(); dom.d5_3_1.update(); global.dscr.children[1].innerHTML = test.mgui.selected.desc(); _renderm(tmain, true); }
      })
    }

    function _renderm(tmain, forced) {
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

