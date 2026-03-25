import { Chs, chs, choiceNav, choiceAction, clr_chs } from '../ui/choices';
import { smove, d_loc, addtosector } from '../game/movement';
import { addElement } from '../dom-utils';
import { msg } from '../ui/messages';
import { dom, global, you, chss, data, flags, stats, timers, gameText, inv } from '../state';
import { giveFurniture, giveItem, removeItem } from '../game/inventory';
import { giveSkExp } from '../game/progression';
import { select, findbyid } from '../utils';
import { random, rand, randf } from '../random';
import { reduce } from '../ui/inventory';
import { HOUR } from '../constants';
import { getHour } from '../systems/weather';

const { acc, skl, sector, furniture, item } = data;

export function initSpecialLocations() {
// @ts-ignore: constructor function
    chss.cat1 = new Chs();
    chss.cat1.id = 107;
    addtosector(sector.vcent, chss.cat1);
    addtosector(sector.vmain1, chss.cat1)
    chss.cat1.sl = () => {
      d_loc('Village Center, Cat'); //global.lst_loc = 107;
      let w = !stats.catCount ? chs('There is a cat.', true) : chs('There is a cat. Pets: ' + stats.catCount, true);
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
        stats.catCount++;
        if (stats.catCount < 333) skl.pet.use();
        w.innerHTML = 'There is a cat. Pets: ' + stats.catCount;
        if (stats.catCount >= 100) {
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
              choiceNav('"Leave it as is"', chss.lsmain1);
            });
            chs('"<= Return"', false).addEventListener('click', () => {
              smove(chss.lsmain1);
            })
          }
        }
      });
      if (stats.catCount >= 100) {
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
          choiceNav('"Leave it as is"', chss.lsmain1);
        });
      }
      choiceNav('"<= Return"', chss.lsmain1);
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
        choiceNav('"<= Return"', chss.mbrd, false);
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
          choiceNav('"I see"', chss.mbrd);
        });
      }
      if (flags.glqtdltn && !flags.glqtdldn && (getHour() < 20 && getHour() > 8)) {
        choiceNav('"Xiao Xiao =>"', chss.xpgdqt1, false);
      }
      choiceNav('"<= Go back"', chss.lsmain1, false);
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
          choiceNav('"<= Take it back"', chss.xpgdqt1, false)
        });
      }
      if (dl2) {
        chs('"Show Xiao Xiao a straw doll"', false).addEventListener('click', () => {
          chs('<span style="color:lime">Xiao Xiao</span>: "Nooooo it\'s creepy!!"', true);
          choiceNav('"<= Take it back"', chss.xpgdqt1, false)
        });
      }
      if (dl3) {
        chs('"Show Xiao Xiao a bone doll"', false).addEventListener('click', () => {
          chs('<span style="color:lime">Xiao Xiao</span>: "Nooooo it\'s scary!!"', true);
          choiceNav('"<= Take it back"', chss.xpgdqt1, false)
        });
      }
      if (dl4) {
        chs('"Show Xiao Xiao a soul doll"', false).addEventListener('click', () => {
          chs('<span style="color:lime">Xiao Xiao</span>: "Waai thank you! I love it! I\'ll give you this! Here, take!"<br><br><span style="color:lightgrey">The girl happily runs away with her new toy</span>', true);
          choiceAction('"Claim your hardearned reward"', () => { removeItem(dl4); flags.glqtdldn = true; global.offlineEvilIndex -= .002; msg('You feel more peaceful', 'gold'); giveItem(acc.ubrlc); smove(chss.mbrd, false) })
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
      b.cmax = (b.data.time * (1 / (1 + (rd) / 10)) / you.mods.readingRate) - (1 / (1 + (rd) / 10) - 1) / you.mods.readingRate;
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
        stats.readingTimeTotal++; let rd = skl.rdg.use(); giveSkExp(skl.rdg, x || 1);
        b.cmax = (b.data.time * (1 / (1 + (rd) / 10)) / you.mods.readingRate) - (1 / (1 + (rd) / 10) - 1) / you.mods.readingRate;
        let c = b.cmax - b.data.timep;
        if (c < 0) c = 0;
        let ttxt;
        if (c > HOUR) ttxt = (c / HOUR << 0) + '</span> hours to finish';
        else ttxt = (c << 0) + '</span> minutes to finish';
        dom.trd.innerHTML = 'You are reading <span style="color:orange">' + b.name + '</span><br>It will take you about <span style="color:lime">' + ttxt;
        if (++b.data.timep >= b.cmax) { clearInterval(timers.rdng); clearInterval(timers.rdngdots); stats.readTotal++; flags.rdng = false; for (let gg in chss) if (chss[gg].id === global.lst_loc) chss[gg].sl(); b.use(you); reduce(b); b.data.timep = 0; }
      }, 1000);
      chs('"Stop reading"', false).addEventListener('click', () => {
        clearInterval(timers.rdng);
        clearInterval(timers.rdngdots);
        flags.rdng = false;
        for (let gg in chss) if (chss[gg].id === global.lst_loc) chss[gg].sl();
      });
    }
}
