import { Chs, chs, choiceNav, choiceAction } from '../ui/choices';
import { addtosector, d_loc, area_init, smove } from '../game/movement';
import { addElement } from '../dom-utils';
import { msg, msg_add } from '../ui/messages';
import { dom, global, you, chss, data, flags, stats, settings, gameText, inv, furn, home, effector, timers } from '../state';
import { giveItem, removeItem, giveFurniture } from '../game/inventory';
import { giveAction } from '../game/progression';
import { giveEff, removeEff } from '../ui/effects';
import { select, findbyid, scanbyid } from '../utils';
import { rand, randf } from '../random';
import { chs_spec } from '../ui/special-panels';
import { scoutGeneric } from '../game/exploration';
import { updateInv } from '../ui/inventory';
import { cansee } from '../game/utils-game';
import { deactivateAct } from '../ui/panels';

const { item, wpn, eqp, skl, area, sector, effect, act, furniture } = data;

export function initHomeLocations() {
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
        global.windowIndex = 1;
        choiceNav('"<= Return"', chss.home, false);
      });
      if (scanbyid(furn, furniture.frplc.id)) {
        choiceNav('"Examine Fireplace"', chss.ofrplc, false);
      }
      if (scanbyid(furn, furniture.strgbx.id)) {
        choiceNav('"Access Storagebox"', chss.sboxhm, false);
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
            stats.catCount++;
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
      choiceNav('"<= Go outside"', chss.lsmain1);
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
              choiceNav('"<= Return"', chss.home, false);
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
                  you.str_bonus++;
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
              choiceNav('"<= Return"', chss.bsmnthm1, false);
            }
          });
        }
      }
      choiceNav('"<= Return"', chss.home, false);
    }
    chss.bsmnthm1.data = { scoutm: 900, scout: 0, scoutf: false, gets: [false, false], gotmod: 0 }
    chss.bsmnthm1.scout = [
      { c: .01, f: () => { msg('You found a pouch with some coins!', 'lime'); giveItem(item.cp, rand(1, 5)); giveItem(item.cn, rand(1, 5)); giveItem(item.cq, rand(1, 5)); chss.bsmnthm1.data.gets[0] = true; }, exp: 40 },
      { c: .03, f: () => { msg('You found a pile of scattered firewood, some logs seem useful but others have rotted completely. You decide to grab them anyway'); giveItem(item.fwd1, rand(2, 4)); giveItem(item.wdc, rand(45, 90)); chss.bsmnthm1.data.gets[1] = true; }, exp: 10 },
      {
        c: .03, f: () => {
          chs('Among the rabble and remains of collapsed bookshelves you decide to confirm if anything survived. Rotten and soaked in basement juices books seems unsalvagable, bookshelves as well, you can\'t even tell if they are made of wood anymore. One of the books was incased into a small mound formed by rocks and sand, it seems surprisingly fine', true);
          choiceAction('"<= I\'m taking this"', () => { chss.bsmnthm1.data.gets[2] = true; giveItem(item.jnlbk); deactivateAct(global.current_a); smove(chss.bsmnthm1, false) })
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
        for (let i in chss) if (chss[i].id === settings.home_loc) smove(chss[i]);
      });
    }
    chss.hbed.onStay = function (this: any) {
      let hpr = (skl.sleep.use(home.bed) + (flags.catget ? 5 : 1) + 1) << 0;
      if (!effect.fei1.active && you.hp < you.hpmax) { you.hp + hpr <= you.hpmax ? you.hp += hpr : you.hp = you.hpmax; dom.d5_1_1.update() }
      // if(combat.currentZone.id!==-666&&random()<.00001){
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
      settings.timescale = 5;
    }
    chss.hbed.onLeave = function (this: any) {
      flags.sleepmode = false;
      settings.timescale = 1;
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
      if (findbyid(inv, item.fwd1.id!)) its.push([findbyid(inv, item.fwd1.id!), 'some firewood', 30])
      if (findbyid(inv, item.coal1.id!)) its.push([findbyid(inv, item.coal1.id!), 'some coal', 300])
      if (findbyid(inv, item.coal2.id!)) its.push([findbyid(inv, item.coal2.id!), 'some charcoal', 300])
      if (findbyid(inv, wpn.stk1.id)) its.push([findbyid(inv, wpn.stk1.id), 'a stick', 15])
      if (!gameText.fplcextra) gameText.fplcextra = ['You\'ll need fire if you want to get some cooking done', 'You can warm up here if you light it up'];
      if (!gameText.frplcfrextra) gameText.frplcfrextra = ["You notice the fire flickering slightly", "Tiny fire is warming up the room", "CocoinAnimationy fire lights up the surroundings", "Bright flame is roaring inside the Fireplace"];
      let textra0;
      if (fire.data.fuel === 0) textra0 = '';
      else if (fire.data.fuel <= 60) textra0 = gameText.frplcfrextra[0]
      else if (fire.data.fuel >= 130 && fire.data.fuel <= 300) textra0 = gameText.frplcfrextra[1];
      else if (fire.data.fuel >= 300 && fire.data.fuel <= 540) textra0 = gameText.frplcfrextra[2];
      else if (fire.data.fuel >= 540) textra0 = gameText.frplcfrextra[3];
      dom.frpls = chs('CocoinAnimationy fireplace. ' + (select(gameText.fplcextra) + '<br>' + textra0), true);
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
          if (its[a][0].amount <= 0) { removeItem(its[a][0]); dom.ctr_2.removeChild(this) } else if (settings.sortMode === 1) updateInv(inv.indexOf(its[a][0]));
          else if (settings.sortMode === its[a][0]) updateInv(global.slottedInventory.indexOf(its[a][0]));
        });
      };
      let afire = findbyid(furn, furniture.fwdpile.id);
      if (afire && afire.data.fuel > 0) {
        chs('"Light a fire"', false, 'orange').addEventListener('click', () => {
          if (effect.fplc.active) msg('Fire is already on', 'orange');
          else { afire.data.fuel--; fire.data.fuel += 16 }
        });
      }
      choiceNav('"<= Step away"', chss.home, false);
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
}
