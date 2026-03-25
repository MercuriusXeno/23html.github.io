import { Chs, chs, choiceNav, choiceAction, clr_chs } from '../ui/choices';
import { smove, area_init, d_loc } from '../game/movement';
import { appear } from '../dom-utils';
import { msg } from '../ui/messages';
import { dom, global, you, chss, data, flags, stats, inv, home } from '../state';
import { giveItem, removeItem, giveFurniture } from '../game/inventory';
import { giveTitle, giveSkExp } from '../game/progression';
import { giveWealth } from '../game/economy';
import { select, col, format3 } from '../utils';
import { handStr } from '../game/utils-game';
import { DAY } from '../constants';
import { getDay } from '../systems/weather';
import { combat } from '../state';

const { wpn, item, eqp, acc, area, ttl, skl, furniture } = data;

export function initDojoLocations() {
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
      combat.currentLocation = chss.t1;
      smove(chss.t1);
      giveFurniture(furniture.frplc, null as any, false);
      let _b = giveFurniture(furniture.bed1, null as any, false);
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
          choiceAction('"Practitioner Skillbook (Swords)"', () => { giveItem(item.skl1); flags.dj1end = true; smove(chss.lsmain1); });
          choiceAction('"Practitioner Skillbook (Knives)"', () => { giveItem(item.skl2); flags.dj1end = true; smove(chss.lsmain1); });
          choiceAction('"Practitioner Skillbook (Axes)"', () => { giveItem(item.skl3); flags.dj1end = true; smove(chss.lsmain1); });
          choiceAction('"Practitioner Skillbook (Spears)"', () => { giveItem(item.skl4); flags.dj1end = true; smove(chss.lsmain1); });
          choiceAction('"Practitioner Skillbook (Hammers)"', () => { giveItem(item.skl5); flags.dj1end = true; smove(chss.lsmain1); });
          choiceAction('"Practitioner Skillbook (Martial)"', () => { giveItem(item.skl6); flags.dj1end = true; smove(chss.lsmain1); });
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
          choiceNav('"Dojo infoboard"', chss.djinf, false);
          choiceNav('"Destroy more dummies"', chss.return1, false);
          if (flags.dj1end === true && you.lvl >= 10 && !flags.trne1e1) chs('"Challenge a stronger opponent"', false).addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne1);
            choiceNav('"<= Escape"', chss.t3, false);
          });
          if (flags.trne1e1 && !flags.trne2e1) chs('"Challenge an even stronger opponent"', false, 'cornflowerblue').addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne2);
            choiceNav('"<= Escape"', chss.t3, false);
          });
          if (flags.trne2e1 && !flags.trne3e1) chs('"Challenge a dangerous opponent"', false, 'crimson').addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne3);
            choiceNav('"<= Escape"', chss.t3, false);
          });
          if (flags.trne3e1 && !flags.trne4e1) chs('"Challenge a powerful opponent"', false, 'red').addEventListener('click', () => {
            chs('"You are facing a golem"', true);
            area_init(area.trne4);
            choiceNav('"<= Escape"', chss.t3, false);
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
                  stats.itemsReturnedToDojo += stash.length;
                  giveWealth(dlr);
                  for (let a in stash) removeItem(stash[a]);
                  if (stats.itemsReturnedToDojo >= 300) giveTitle(ttl.tqtm);
                  smove(chss.t3, false);
                });
              }
              choiceNav('"<= Go back"', chss.t3, false);
            });
            choiceNav('"<= Go back"', chss.t3, false);
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
            choiceNav('"<= Return"', chss.t3, false);
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
          choiceNav('"<= Go outside"', chss.lsmain1);
          if (flags.trne4e1 && !flags.trne4e1b) {
            chs('"Instructor: Once again, choose the skillbook of specialization you are interested in. Doesn\'t mean you have to stick with it to the bitter end, but it will help you train"', true);
            choiceAction('"Bladesman Manual"', () => { giveItem(item.skl1a); flags.trne4e1b = true; smove(chss.lsmain1); });
            choiceAction('"Assassin Manual"', () => { giveItem(item.skl2a); flags.trne4e1b = true; smove(chss.lsmain1); });
            choiceAction('"Axeman Manual"', () => { giveItem(item.skl3a); flags.trne4e1b = true; smove(chss.lsmain1); });
            choiceAction('"Lancer Manual"', () => { giveItem(item.skl4a); flags.trne4e1b = true; smove(chss.lsmain1); });
            choiceAction('"Clubber Manual"', () => { giveItem(item.skl5a); flags.trne4e1b = true; smove(chss.lsmain1); });
            choiceAction('"Brawler Manual"', () => { giveItem(item.skl6a); flags.trne4e1b = true; smove(chss.lsmain1); });
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
        choiceNav('"<= Return"', chss.djinf, false);
      });
      chs('"Graduate!"', false).addEventListener('click', () => {
        chs('When you are confident in your skills, try your fist at fighting powerful golems! How much beating can you withstand?', true);
        choiceNav('"<= Return"', chss.djinf, false);
      });
      chs('"Claim your rewards!"', false).addEventListener('click', () => {
        chs('As long as you keep gaining experience and train hard, dojo will provide you with gifts and money! Don\'t miss out!', true);
        choiceNav('"<= Return"', chss.djinf, false);
      });
      chs('"Get your grub at the canteen!"', false).addEventListener('click', () => {
        chs('Our generous dojo provides ' + col('Free Meals', 'lime') + ' to every attending low-class disciple every ' + col('Sunday', 'yellow') + '! Get in time for your weekly menu!', true);
        choiceNav('"<= Return"', chss.djinf, false);
      });
      chs('"Measure your power!"', false).addEventListener('click', () => {
        let v = chs('Try out punching this ' + col('Indestructable Dummy', 'orange') + ' to measure the power of your fist!', true);
        chs('"Give it a try"', false).addEventListener('click', () => {
          you.stat_r();
          let hs = handStr();
          v.innerHTML = select(['Wham!', 'Slap!', 'Hit!', 'Punch!', 'Hack!']) + ' Your approximate hand strength is measured in: <br><br><span style="border:1px dashed yellow;padding:6px">' + col((format3(hs.toString()) + 'kg'), 'springgreen') + '</span><br><br>';
          for (let x in global.htrchl) global.htrchl[x](hs);
        });
        choiceNav('"<= Return"', chss.djinf, false);
      });
      choiceNav('"<= Return"', chss.t3, false);
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
      choiceNav('"<= Return back into lobby"', chss.t3);
    }
}
