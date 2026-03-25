import { SILVER } from '../constants';
import { random, rand } from '../random';
import { select } from '../utils';
import { addElement, empty } from '../dom-utils';
import { dom, global, chss, data, flags, stats, timers, effector, gameText, you } from '../state';
import { weather, isWeather, getHour } from '../systems/weather';
import { msg } from '../ui/messages';
import { addDesc } from '../ui/descriptions';
import { updateWealthDisplay } from '../ui/stats';
import { chs, choiceNav, choiceAction, clr_chs, Chs } from '../ui/choices';
import { reduce } from '../ui/inventory';
import { coinAnimation } from '../ui/shop';
import { chs_spec } from '../ui/special-panels';
import { d_loc, smove, addtosector, area_init } from '../game/movement';
import { giveSkExp } from '../game/progression';
import { giveWealth, spend } from '../game/economy';
import { giveItem, removeItem } from '../game/inventory';
import { giveQst, finishQst } from '../game/quests';
import { scoutGeneric } from '../game/exploration';

const { item, skl, sector, quest, vendor, area } = data;

export function initVillageLocations() {

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
      choiceNav('"=> Check the Message Board"', chss.mbrd, false);
      choiceNav('"=> Enter Dojo"', chss.t3);
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
      if (flags.mkplc1u === true) choiceNav('"=> Visit Marketplace"', chss.mrktvg1);
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
        if (!stats.catCount) stats.catCount = 0;
      });
      if (!flags.mkplc1u) {
        if (flags.dj1end === true && flags.pcoinAnimationspmkm1 !== true && random() < .4) {
          chs('Paper Boy: Hey, this is for you!', true);
          choiceAction('?', () => { giveItem(item.shppcoinAnimation); smove(chss.lsmain1, false) });
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
      choiceNav('"Nervous Guy =>"', chss.fdwrg1qt);

      if (flags.grddtjb) chs('"Checkpoint"', false, 'hotpink').addEventListener('click', () => {
        if (getHour() >= 7 && getHour() <= 10) {
          chs('Lookout Guard: Here for work? You won\'t have to do much, just stand there near the gate and look intimidating. You\'re not doing any fighting if someone dangerous comes around, that would be dealth by Us, your militia. Your shift ends at 8PM, sign up now and go', true);
          chs('"Alright..."', false).addEventListener('click', () => {
            if (getHour() >= 7 && getHour() <= 10) {
              giveQst(quest.grds1);
              smove(chss.jbgd1);
            } else {
              chs('Lookout Guard: Too damn late, next time don\'t stand there like a decoration wasting everyone\'s time', true);
              choiceNav('"Ah..."', chss.lsmain1);
            }
          });
          choiceNav('"<= Maybe not"', chss.mrktvg1);
        } else {
          chs('Lookout Guard: If you want work come at the time that\'s stated in the notice and not a minute late!', true);
          choiceNav('"<= Return"', chss.mrktvg1);
        }
      });
      choiceNav('"<= Return back to the village Center"', chss.lsmain1);
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
          (flags as any).jobsCompleted++;
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
      choiceNav('"<= Walk away"', chss.mrktvg1, false);
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
      choiceNav('"<= Return back"', chss.mrktvg1);
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
        choiceNav('"<= Maybe next time"', chss.gens1, false);
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
        choiceNav('"<= Too expensive"', chss.gens1, false);
      });
      choiceNav('"<= Return back"', chss.mrktvg1);
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
            stats.herbalistHerbsSold++;
            giveWealth(15);
            item.hrb1.amount -= 50;
            reduce(item.hrb1);
            if (stats.herbalistHerbsSold >= 7 && !flags.hbhbgft) {
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
        choiceNav('"<= Rather not"', chss.pha1, false);
      });
      if (item.htrsvr.have) chs('"Deliver the bag"', false, 'lightblue').addEventListener('click', () => {
        chs('Herbalist: And who might you be? Ohhhh, aren\'t you that dojo kid who\'s learning the art of hunting from the head himself? Come in come in, welcome! What is it you wish to deliver? Ah! Wonderful, excellent, this will last for plenty of time. Thank you for coming all this way in timely manner, you\'ve been a great help. I will give you these to sample, as a reward, they will be useful to you. Oh, and one simple request, if you don\'t mind. Give this to him when you meet next time, it is very important that he gets it.', true);
        chs('"I can do it!"', false).addEventListener('click', () => {
          removeItem(item.htrsvr); giveItem(item.atd1, 3); giveItem(item.hptn1, 10); giveItem(item.psnwrd); giveItem(item.hptn2); giveItem(item.hbtsvr); smove(chss.pha1);
        });
      });

      choiceNav('"<= Return back"', chss.mrktvg1);
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
          if (you.wealth - itm[2] >= 0) { spend(itm[2]); coinAnimation(-itm[2], 1); updateWealthDisplay(); giveItem(itm[0]); stats.buyTotal++; if (--itm[1] === 0) { clr_chs(vendor.stvr1.stock.indexOf(itm) + 1); vendor.stvr1.stock.splice(vendor.stvr1.stock.indexOf(itm), 1); empty(global.dscr); global.dscr.style.display = 'none' } else this.innerHTML = itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1]; } else { clearTimeout(timers.shopcant); dom.vndr1.innerHTML = 'Sorry you can\'t afford that!'; timers.shopcant = setTimeout(() => { dom.vndr1.innerHTML = hi }, 1000) }
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
          if (you.wealth - itm[2] >= 0) { spend(itm[2]); coinAnimation(-itm[2], 1); updateWealthDisplay(); giveItem(itm[0]); stats.buyTotal++; if (--itm[1] === 0) { clr_chs(vendor.kid1.stock.indexOf(itm) + 1); vendor.kid1.stock.splice(vendor.kid1.stock.indexOf(itm), 1); empty(global.dscr); global.dscr.style.display = 'none' } else this.innerHTML = itm[0].name + ' <small style="color:rgb(255, 116, 63)">' + itm[2] + '●</small> x' + itm[1]; } else { clearTimeout(timers.shopcant); dom.vndr1.innerHTML = 'Bring money next time'; timers.shopcant = setTimeout(() => { dom.vndr1.innerHTML = hi }, 1000) }
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
            choiceNav('"Sweet purchase!"', chss.lsmain1, false);
          } else {
            chs('No money - no goods! Don\'t waste my time!', true);
            choiceNav('"<= Go back"', chss.lsmain1, false);
          }
        });
        chs('"<= Nah"', false, 'Red').addEventListener('click', () => {
          chs('No worries, I\'ll keep it for you', true);
          choiceNav('"<= Go back"', chss.lsmain1, false);
        });
      });
      else if (stats.moneyGained >= 1000 && !flags.vndrkd1sp2 && flags.vndrkd1sp1) chs('"Show me something better"', false, 'darkgrey').addEventListener('click', () => {
        chs('Alright, there\'s something else for you, snatched from some sleeping guy and I bet would be useful for you. Similar deal, 5 silver' + dom.coinsilver, true);
        chs('"Yes please"', false, 'lime').addEventListener('click', () => {
          if (you.wealth >= 500) {
            chs('"Deal successfully made"', true)
            flags.vndrkd1sp2 = true;
            giveItem(item.bfsnwt);
            spend(500)
            choiceNav('"Score!"', chss.lsmain1, false);
          } else {
            chs('No money - no goods! Don\'t waste my time!', true);
            choiceNav('"<= Go back"', chss.lsmain1, false);
          }
        });
        chs('"<= Nah"', false, 'Red').addEventListener('click', () => {
          chs('No worries, I\'ll keep it for you', true);
          choiceNav('"<= Go back"', chss.lsmain1, false);
        });
      });
      choiceNav('"<= Go back"', chss.lsmain1, false);
    }
    chss.vndrkd1.onLeave = function (this: any) { clearInterval(timers.vndrstkchk) }

// @ts-ignore: constructor function
    chss.tstauto = new Chs();
    chss.tstauto.id = -1;
    chss.tstauto.sl = () => {
      d_loc('Test auto'); global.lst_loc = -1;
      dom.testauto = chs('TEST', true);
      if (!flags.testauto_1 || (flags.testauto_1 as any) === false) chs('Run', false).addEventListener('click', () => {
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

}
