import { Chs, chs, choiceNav } from '../ui/choices';
import { smove, area_init, addtosector, d_loc } from '../game/movement';
import { msg } from '../ui/messages';
import { dom, global, you, chss, data, flags, stats, inv } from '../state';
import { giveItem, removeItem, wearingany } from '../game/inventory';
import { giveWealth } from '../game/economy';
import { giveQst, finishQst } from '../game/quests';
import { select, findbyid, col } from '../utils';
import { random, rand } from '../random';
import { scoutGeneric } from '../game/exploration';
import { reduce } from '../ui/inventory';
import { getHour, getLunarPhase } from '../systems/weather';

export function initForestLocations() {
  const { item, wpn, area, sector, quest, skl } = data;

// @ts-ignore: constructor function
    chss.frstn1main = new Chs();
    chss.frstn1main.id = 113;
    chss.frstn1main.sl = () => {
      flags.inside = false; d_loc('Western Woods, The Wooden Gate'); global.lst_loc = 113;
      chs('You\'re out in the forest. You can hunt here', true);
      choiceNav('"=> Enter the Hunter\'s lodge"', chss.frstn1b1);
      choiceNav('"=> Delve inside the forest"', chss.frstn1a1);
      if (flags.frstn1a3u) choiceNav('"=> Hunt indefinitely"', chss.frstn1a3);
      choiceNav('"<= Return back"', chss.lsmain1);
    }

// @ts-ignore: constructor function
    chss.frstn1a3 = new Chs();
    chss.frstn1a3.id = 130;
    addtosector(sector.forest1, chss.frstn1a3)
    chss.frstn1a3.sl = () => {
      flags.inside = false; d_loc('Western Woods, They\'re Nearby'); global.lst_loc = 130;
      chs('The woods are silent', true);
      choiceNav('"<= Return back"', chss.frstn1main);
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
        choiceNav('"<= Escape"', chss.frstn1main);
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
        choiceNav('"Sell firewood ' + dom.coincopper + '"', chss.frstn1b1s, false);
      }
      if (item.hbtsvr.have) chs('"Deliver the satchel"', false, 'lightblue').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Delivery back? That\'s unexpected! Put this here, let me examine it... I see, we\'re going east soon, then... Well, that\'s not for you to worry about, hhah! There is another thing. You wait here a moment<br>.......<br><br> Heeere we go! Get this crate to the dojo since you\'re going in that direction anyway. They\'ll know what to do with it. Go now, go', true);
        chs('"Ok"', false).addEventListener('click', () => {
          giveItem(item.htrdvr);
          removeItem(item.hbtsvr);
          smove(chss.frstn1main);
        });
      });
      choiceNav('"<= Exit"', chss.frstn1main);
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
      choiceNav('"About monsters"', chss.htrtch1, false);
      chs('"What are monster ranks?"', false).addEventListener('click', () => {
        chs('<div style="line-height:16px"><span style="color:limegreen">Head Hunter Yamato</span>: Ranking is a way to separate monsters by their relative danger level, they go as following:<div style="border: darkblue 1px solid;background-color:#0b1c3c;margin:10px;"><div><span style="color:lighgrey">G - Can be dealth with by able people</span></div><div><span style="color:white">F - Can be dealth with by male adults</span></div><div><span style="color:lightgreen">E - Village Crisis</span></div><div><span style="color:lime">D - Townside Crisis</span></div><div><span style="color:yellow">C - Citywide Crisis</span></div><div><span style="color:orange">B - National Crisis</span></div><div><span style="color:crimson">A - Continental Threat</span></div><div><span style="color:gold;text-shadow: 0px 0px 2px red,0px 0px 2px red,0px 0px 2px red">S - Global Crisis</span></div><div><span style="color:black;text-shadow:hotpink 1px 1px .1em,cyan -1px -1px .1em">SS - World Disaster</span></div><div><span style="color:white;text-shadow:2px 0px 2px red,-2px 0px 2px magenta,0px 2px 2px cyan,0px -2px 2px yellow,0px 0px 2px gold">SSS - Universal Calamity</div></div>We haven\'t experienced anything stronger than the E rank in all history of our village. Whatever is above the A rank is completely unheard of, and only partially mentioned in ancient texts. That\'s the realm of gods, world destroyers and higher beings that our mortal souls are unlikely to ever face</div>', true, 0, 0, 0, 0, '.9em');
        choiceNav('"<= Return"', chss.htrtch0, false);
      });
      choiceNav('"<= Return"', chss.frstn1b1, false);
    }

// @ts-ignore: constructor function
    chss.htrtch1 = new Chs();
    chss.htrtch1.id = 163;
    chss.htrtch1.sl = () => {
      flags.inside = true;
      chs('<div style="line-height:14px"><span style="color:limegreen">Head Hunter Yamato</span>: Monsters, you say? There are many and they are around, terrorizing peaceful folk in the outside world. Our remote parts don\'t see much of that, these lands are tame. Not without dangers, of course, you meet a wild boar in the forest - a single wrong move and its tusks are in your guts and that is it, end of the fool. Or those pesky slimes, while don\'t look menacing and pose little danger, they sometimes gather and destroy the fields by melting crops and soil. We have it good but starvation is worse than any monster, at times. *cough* anyway, anything living and non-living you meet can be separated into 6 categories:<br>Human, Beast, Undead, Evil, Phantom, Dragon</div>', true, 0, 0, 0, 0, '.8em');
      chs('"About Humans"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Humans and Demihumans fall into the same class. People like you and me, beastmen, orcs, goblins... Mostly creatures intelligent enough to walk on their two, use tools, form societies, make settlements, trade and speak on their own violition. You will encounter and perhaps fight them as bandits, criminals, members of the opposing factions and armies, whoever you disagree with. Always be on your guard, humanoids are cunning and skilled, versatile and very adaptive. Yet, they have mushy bodies. One correct strike and you get an advantage', true);
        choiceNav('"<= Return"', chss.htrtch1, false);
      });
      chs('"About Beasts"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Beasts are your usual, normal wildlife like wolves, slimes, mimics, or prone to being evil Demihumans with low intelligence and high level of aggression like ogres, harpies, minotaurs. While animals are dumb, never underestimate a wild beast. With their thick skin and natural weapons like fangs and claws, they pose a major threat when driven into a desperate state. Fire works very well against the most, especially those with fur and feathers, keep that in mind next time you go hunting', true);
        choiceNav('"<= Return"', chss.htrtch1, false);
      });
      chs('"About Undead"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Undead, as you could already tell, are living dead. Reanimated remains of humans and beasts by the influence of natural forces or a skilled necromancer. Even if they completely lack intelligence and wander around aimlessly, controlled bodies of the dead get strenghtened by Dark magic and gain unnatural resilience and power as a result. It doesn\'t prevent them from being hurt by fire or Holy powers, hovewer. You can deal with lesser fragile skeletal beings quickly if you bash them with something blunt', true);
        choiceNav('"<= Return"', chss.htrtch1, false);
      });
      chs('"About Evil"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Beings that are artificially made or existences who are inherently evil, can be classified as such. Demons, imps, golems, possessed weapons and armor, gremlins, devils and much of anything else that comes out from the Underworld. They are extremely dangerous and seek destruction all that they come across', true);
        choiceNav('"<= Return"', chss.htrtch1, false);
      });
      chs('"About Phantoms"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Souls of the dead, ethereal beings, manifestations of powers or other apparitions can all be called Phantoms. They take forms of wisp and sprites, benevolent or twisted elementals or spirits and wraiths that terrorize the living. They are difficult or sometimes outright impossible to hurt using normal physical means, magic or exorcism would be a preferred way of dealing with such enemies', true);
        choiceNav('"<= Return"', chss.htrtch1, false);
      });
      chs('"About Dragons"', false, 0, 0, 0, 0, '.8em', 0, '15px').addEventListener('click', () => {
        chs('<span style="color:limegreen">Head Hunter Yamato</span>: Dragons are legendary creatures that possess evil and cunning intellect. Through some unknown means many dragons in ancient times were reduced to subspecies of wyverns and wyrms, or outright bastard draconids like lizardmen, and other beings with Dragon bloodline. The power of said bloodline grants them superior defence against magic and energy abilities, their physical toughness is also no joke', true);
        choiceNav('"<= Return"', chss.htrtch1, false);
      });
      choiceNav('"<= Return"', chss.htrtch0, false);
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
        if (!quest.lcoinAnimationstkil1.data.started && !quest.lcoinAnimationstkil1.data.done) {
          chs('"Monster eradication"', false).addEventListener('click', () => {
            if (you.lvl < 20 || !flags.trne4e1) { msg('<span style="color:limegreen">Head Hunter Yamato</span>: Don\'t even think about it, you will not be sent to your death. Go back and train, dojo has everything you need'); return }
            if (!quest.lcoinAnimationstkil1.data.started) {
              chs('<span style="color:limegreen">Head Hunter Yamato</span>: What\'s this? Your aura has changed since we last met! All the martial training you went through certainly hasn\'t gone to waste, this kid is definitely isn\'t a pushover anymore, hah! If you have the guts to take on the next task, listen well - southern forest is becoming more and more dangerous, lethal beasts keep crawling in from the farther plains, making it very difficult to do any sort of work in the south. Looks like wolves this time. Some fear, at this rate, they might reach and assault the village, and that will have need to be dealth with. This is a dangerous issue, and you will have to have courage to take it on, but in turn it will serve you as great real battle experience. Other lads have already signed up, as well. Are you willing?', true, 'yellow', 0, 0, 0, '.9em');
              chs('"Accept"', false, 'lime').addEventListener('click', () => {
                giveQst(quest.lcoinAnimationstkil1);
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
        } else if (quest.lcoinAnimationstkil1.data.started) {
          if (quest.lcoinAnimationstkil1.data.mkilled < 35) {
            chs('<span style="color:limegreen">Head Hunter Yamato</span>: Having troubles with the task?', true);
            choiceNav('"<= Return"', chss.frstn1b1, false); return;
          }
          else chs('<span style="color:limegreen">Head Hunter Yamato</span>: What is that fire in your eyes? Can it be you are done already?', true);
          chs('"Report the sounds you heard"', false, 'lime').addEventListener('click', () => {
            chs('<span style="color:limegreen">Head Hunter Yamato</span>: That isn\'t good, sounds like trouble... Might have been the leader of the pack, furious about death of his underlings. This matter will need to be resolved quickly. As for you, go and have a good hard earned rest, you have done very well. Expect to be contacted later for further monster subjugation', true);
            chs('"Accept the reward"', false, 'lime').addEventListener('click', () => {
              finishQst(quest.lcoinAnimationstkil1);
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
            choiceNav('"<= Return"', chss.frstn1b1, false);
          }
        });
      }
      //blabla

      choiceNav('"<= Return"', chss.frstn1b1, false);
    }

// @ts-ignore: constructor function
    chss.frstn1a1 = new Chs();
    chss.frstn1a1.id = 114;
    addtosector(sector.forest1, chss.frstn1a1)
    chss.frstn1a1.sl = () => {
      flags.inside = false; d_loc('Western Woods, The Yellow Path');
      chs('The woods are silent', true);
      choiceNav('"<= Return back"', chss.frstn1main);
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
      choiceNav('"=> Go further into the forest"', chss.frstn2a1);
      if (flags.frstnscgr) chs('"\-\-> Enter the hidden path"', false, 'grey').addEventListener('click', () => {
        smove(chss.frstn1a4);
      });
      choiceNav('"<= Return back"', chss.frstn1main);
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
      choiceNav('"<= Return back"', chss.frstn1main);
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
      choiceNav('"=> Explore the depths"', chss.frstn9a1m);
      choiceNav('"<= Return back"', chss.lsmain1);
    }

// @ts-ignore: constructor function
    chss.frstn9a1m = new Chs();
    chss.frstn9a1m.id = 169;
    chss.frstn9a1m.sl = () => {
      flags.inside = false; d_loc('Southern Forest, The Foliage'); global.lst_loc = 169;
      chs('This place looks dark', true);
      choiceNav('"<= Return back"', chss.frstn3main);
    }
    chss.frstn9a1m.onEnter = function (this: any) {
      area_init(area.frstn9a1);
    }
}
