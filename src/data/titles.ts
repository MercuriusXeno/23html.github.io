// @ts-nocheck
import { ttl, you, act } from '../state';

// ==========================================================================
// Title constructor + instances
// ==========================================================================

function Title(id) {
  this.name;
  this.id = id || 0
  this.desc;
  this.have = false
  this.tget = false
  this.rar = 1;
  this.onGet = function () { }
}

ttl.new = new Title(0);
ttl.new.name = 'Nobody';
ttl.new.desc = 'Unremarkable someone trying to find his purpose in life';

ttl.inn = new Title(1);
ttl.inn.name = 'Initiate';
ttl.inn.desc = 'Dojo disciple who managed to finish the first training stages. Woo!';

ttl.thr = new Title(2);
ttl.thr.name = 'Thrasher';
ttl.thr.rar = 1;
ttl.thr.rars = true
ttl.thr.desc = 'The one who destroyed dojo\'s precious equipment. Were you a bit older you\'d pay the expences, but you made your teacher proud.';

ttl.wsl = new Title(3);
ttl.wsl.name = 'Wolf Slayer';
ttl.wsl.desc = 'You went alone against a pack of feral wolves. That amounts to something!';

ttl.knf = new Title(4);
ttl.knf.name = 'Butterfly';
ttl.knf.rar = 2
ttl.knf.desc = 'You always thought knives were cool. You aren\'t nearly precise with your knifework yet, But you will learn';

ttl.bll = new Title(5);
ttl.bll.name = 'Bully';
ttl.bll.rar = 2
ttl.bll.desc = 'You have graduated from being a mere Weakling. You feel powerful! You still find it difficult to stand your own in a fight';

ttl.cvl = new Title(6);
ttl.cvl.name = 'Civilian';
ttl.cvl.desc = 'You\'re not very suitable for combat. But you think you\'re out of options';

ttl.stk = new Title(7);
ttl.stk.name = 'Stick Kid';
ttl.stk.desc = 'You always liked swinging that thing around. You think you\'re beginning to understand how to land hits properly. Or not';

ttl.fgt = new Title(8);
ttl.fgt.name = 'Fighter';
ttl.fgt.rar = 2
ttl.fgt.desc = 'You begin to start liking to fight! At the very least you can now somewhat defend yourself against mild threats and not just die in one hit';

ttl.pbg = new Title(9);
ttl.pbg.name = 'Weakling';
ttl.pbg.desc = 'You can\'t really hit anything with these frail arms of yours';

ttl.brw = new Title(10);
ttl.brw.name = 'Brawler';
ttl.brw.desc = 'You feel like you can pack a punch! And recieve one. You\'re starting to feel a bit more comfortable with your bare fists';

ttl.stb = new Title(11);
ttl.stb.name = 'Stabber';
ttl.stb.rar = 3
ttl.stb.desc = 'Even if it\'s a smaller tool compared to any other weapon, you\'ve learned how to make knives useful for self-defence, since they are somewhat easier to handle than the rest. You can hit vitals better too';

ttl.slp1 = new Title(12);
ttl.slp1.name = 'Sleeper';
ttl.slp1.desc = 'You really like sleeping don\'t you? You spend a lot of time in your bed';

ttl.slp2 = new Title(13);
ttl.slp2.name = 'Heavy Sleeper';
ttl.slp2.rar = 2
ttl.slp2.desc = 'You learned to sleep very soundly, without any care for the outside world. Your body begins to adapt and grow stronger with every break you take';

ttl.slp3 = new Title(14);
ttl.slp3.name = 'Dreamwatcher';
ttl.slp3.rar = 3
ttl.slp3.desc = '3';

ttl.tcvl = new Title(15);
ttl.tcvl.name = 'Trained Civilian';
ttl.tcvl.rar = 2
ttl.tcvl.desc = 'You\'re still nearly useless in a real fight, but you have learned to at least move out of the way of danger';

ttl.plm = new Title(16);
ttl.plm.name = 'Prick';
ttl.plm.desc = 'You found it fun to make little holes in plant leaves and look through them at the Sun. You think this could be morbidly useful in a fight';

ttl.wlk = new Title(17);
ttl.wlk.name = 'Walker';
ttl.wlk.desc = 'All this walking around feels very beneficial for your body';
ttl.wlk.talent = function () { you.mods.runerg -= .05 }
ttl.wlk.onGet = function () { if (act.demo.active) you.mods.sdrate -= .005 }
ttl.wlk.tdesc = 'Running consumes 5% less energy'

ttl.eat1 = new Title(18);
ttl.eat1.name = 'Starving Child';
ttl.eat1.desc = 'You\'ve been all skin and bones as long as you can remember. You will need to start eating properly if you wish to survive';

ttl.eat2 = new Title(19);
ttl.eat2.name = 'Hungry Child';
ttl.eat2.rar = 2
ttl.eat2.desc = 'You begin to gain some weight eating all this boring and dry food. But you\'re not complaining, at least you live';

ttl.eat4 = new Title(20);
ttl.eat4.name = 'Satiated';
ttl.eat4.rar = 4
ttl.eat4.desc = 'Being full is good, but you start to wonder what kinds of different dishes exist in the world';

ttl.eat5 = new Title(21);
ttl.eat5.name = 'Mini-Gourmand';
ttl.eat5.rar = 5
ttl.eat5.desc = 'You begin to understand the importance of tasty food! You crave the larger variety';

ttl.cck = new Title(22);
ttl.cck.name = 'Campfire Cook';
ttl.cck.desc = 'Not something to brag about, but you won\'t completely starve to death if you find yourself in the wilds without a proper meal';

ttl.rok = new Title(23);
ttl.rok.name = 'Rookie';
ttl.rok.rar = 3
ttl.rok.desc = 'A novice fighter. You have a knack for martial arts but it doesn\'t amount to much yet';

ttl.rnr = new Title(24);
ttl.rnr.name = 'Runner';
ttl.rnr.rar = 3
ttl.rnr.desc = 'Your body is in much better shape, so is your stamina. Moving around fast doesn\'t bother you as much anymore, but you spend your energy and get kind of hungry from it';

ttl.jgg = new Title(25);
ttl.jgg.name = 'Jogger';
ttl.jgg.rar = 2
ttl.jgg.desc = 'Simply walking doesn\'t cut it anymore, maybe you should speed up a bit while travelling on foot?';
ttl.jgg.talent = function () { you.mods.runerg -= .15 }
ttl.jgg.onGet = function () { if (act.demo.active) you.mods.sdrate -= .015 }
ttl.jgg.tdesc = 'Running consumes 15% less energy'

ttl.spn = new Title(26);
ttl.spn.name = 'Sprinter';
ttl.spn.rar = 4
ttl.spn.desc = 's';

ttl.ilt = new Title(27);
ttl.ilt.name = 'Illiterate';
ttl.ilt.desc = 'You have a really difficult time understanding even the basic writings. Even the signs outside the shops give you trouble';

ttl.und = new Title(28);
ttl.und.name = 'Uneducated';
ttl.und.rar = 2
ttl.und.desc = 'You are not very friendly with books, your entire literature knowledge is nothing but simple kiddie stories and fairy tales';

ttl.aaa = new Title(29);
ttl.aaa.name = 'aaa';
ttl.aaa.desc = 'They say that in the hands of a gosu with great inner ki, even a dead leaf can become a weapon that can pierce iron plates';

ttl.eat3 = new Title(30);
ttl.eat3.name = 'Malnourished';
ttl.eat3.rar = 3
ttl.eat3.desc = 'You are clearly undereating, yet, eating something other than bland untasty bread leaves you in a positive mood ';

ttl.srd1 = new Title(31);
ttl.srd1.name = 'Aspiring Ronin';
ttl.srd1.desc = 'Watching swordplay of elder swordmasters always fascinated you, yet even trying to hold the sword properly is apparently extremely difficult. You are not the type to give up though';

ttl.srd2 = new Title(32);
ttl.srd2.name = 'Sword Trainee';
ttl.srd2.rar = 2
ttl.srd2.desc = 'You have only just began learning the Way of the Sword, which clearly shows. You still find it hard to wield the sword properly, let alone attempting to hit something with it';

ttl.srd3 = new Title(33);
ttl.srd3.name = 'Squire';
ttl.srd3.rar = 3
ttl.srd3.desc = 'All those thousand swings training sessions weren\'t for nothing. Now you can hold your sword somewhat straight and your posture got better. Hovewer, slashing things didn\'t get any easier';

ttl.srd4 = new Title(34);
ttl.srd4.name = 'Blade for Hire';
ttl.srd4.rar = 4
ttl.srd4.desc = 'Your swordplay has reached the rank of a common foot soldier. Or so you thought. Maybe you can match a lowest level mercenary, which isn\'t something to be proud of. You are still ways away from calling yourself a proper swordsman';

ttl.lnc1 = new Title(35);
ttl.lnc1.name = 'Spearholder';
ttl.lnc1.desc = 'You have learned how the art of Spearmanship can be used for both offensive and defensive combat, which you think suits you pretty well. Hovewer, handling a spear with skill is much more difficult than you initially thought';

ttl.lnc2 = new Title(36);
ttl.lnc2.name = 'Village Militia';
ttl.lnc2.rar = 2
ttl.lnc2.desc = 'Your reflexes wielding a polearm got slightly better, at the very least you aren\'t dropping your weapon after every second swing anymore. You could be considered a part of a peasant spear group with your measly skills';

ttl.lnc3 = new Title(37);
ttl.lnc3.name = 'Phlanger';
ttl.lnc3.rar = 3
ttl.lnc3.desc = 'You\'re getting a hold of your primitive spearmanship, which is reasurring considering how much effort went into your training. You could be a part of the second-rate frontline military squad with your ability, but you will aim higher';

ttl.hmr2 = new Title(38);
ttl.hmr2.name = 'Basher';
ttl.hmr2.rar = 2
ttl.hmr2.desc = 'Squashing things with a hammer or a club may seem simple, but it does require some skill to do so properly and effectively. You understand the basics but lack the strength for it, though';

ttl.hmr3 = new Title(39);
ttl.hmr3.name = 'Heavy Hand';
ttl.hmr3.rar = 3
ttl.hmr3.desc = 'You favor strong blunt weaponry, which shows by how sturdy and hard your hands have become. This is good for your overall strength. You still lack any skill or technique, hovewer';

ttl.kill1 = new Title(40);
ttl.kill1.name = 'Pest Control';
ttl.kill1.desc = 'You have wiped out about 10000 creatures on your way. Most of them weren\'t living things though... right?';

ttl.rspn1 = new Title(41);
ttl.rspn1.name = 'Punching Bag';
ttl.rspn1.desc = 'Getting beat up like this hurts like hell. You better think of a way out of this misery!';

ttl.rfpn1 = new Title(42);
ttl.rfpn1.name = 'Garbage Eater';
ttl.rfpn1.desc = 'All the time you had to consume disgusting rotten stuff is finally paying off... Kind of. You would rather avoid doing that in the future, if possible';

ttl.rfpn2 = new Title(43);
ttl.rfpn2.name = 'Iron Stomach';
ttl.rfpn2.rar = 2;
ttl.rfpn2.desc = 'Going through these desperate times of having such an unsafe diet, your stomach doesn\'t feel as awful anymore. You really shouldn\'t be doing that';
ttl.rfpn2.talent = function () { you.mods.survinf++ }
ttl.rfpn2.tdesc = 'Allows you to roughly guess when perishable food rots (shift key)'

ttl.rfpn3 = new Title(44);
ttl.rfpn3.name = 'Omnivore';
ttl.rfpn3.rar = 3;
ttl.rfpn3.desc = 'It seems like you can eat a lot of awful stuff and feel fine afterwards. Is that really worth it? You think it is. The taste doesn\'t get any better though...';

ttl.tqtm = new Title(45);
ttl.tqtm.name = 'Quartermaster';
ttl.tqtm.rars = true;
ttl.tqtm.desc = 'You have returned more than 300 pieces of dojo supplies. How much of that stuff do they have?';
ttl.tqtm.talent = function () {/*(:*/ }
ttl.tqtm.tdesc = 'Dummies may drop something special'

ttl.ddw = new Title(46);
ttl.ddw.name = 'Glass Bones';
ttl.ddw.rar = 0;
ttl.ddw.rars = true;
ttl.ddw.desc = 'Bizzarely, you got yourself knocked out by the weakest enemy in existence. How did that happen? You feel like you have achieved somewhat absurd understanding of how frail your body actually is. Perhaps violence isn\'t for you';

ttl.neet = new Title(47);
ttl.neet.name = 'Hikikomori';
ttl.neet.rars = true;
ttl.neet.desc = 'You have spent an entire year at your house without going out even once. You were somewhat productive in your seclusion, but the time spent didn\'t even feel like a year, however...';

ttl.aptc = new Title(48);
ttl.aptc.name = 'Apprentice';
ttl.aptc.rar = 2;
ttl.aptc.desc = 'You have succesfully completed the second part of dojo\'s training courses. You are impressed by your own achievements!';

ttl.sld1 = new Title(49);
ttl.sld1.name = 'Wimp';
ttl.sld1.desc = 'The fear of pain has forced you to begin taking cover behind whatever you take your hands on. Shields fall within this category nicely, you think you should try learning how to handle them properly';

ttl.sld2 = new Title(50);
ttl.sld2.name = 'Defender';
ttl.sld2.rar = 2;
ttl.sld2.desc = 'Even if you\'re still full of openings and have a terrible time adjusting to the weight of a shield you\'re holding, you can still manage to reflect the slowest, stupidest and the most direct attack you\'re facing. Sometimes';

ttl.sld3 = new Title(51);
ttl.sld3.name = 'Protector';
ttl.sld3.rar = 3;
ttl.sld3.desc = 'You understand better how shields work, and your reaction time against frontal attacks has improved as well. Your openings are still plentiful, but you manage to stay alive';

ttl.sld4 = new Title(52);
ttl.sld4.name = 'Sentry';
ttl.sld4.rar = 4;
ttl.sld4.desc = '';

ttl.seye1 = new Title(53);
ttl.seye1.name = 'Bat Eyes';
ttl.seye1.desc = 'Sometimes when you hit an enemy the certain way your attack feels somewhat stronger, you noticed. What\'s that about?';

ttl.seye2 = new Title(54);
ttl.seye2.name = 'Suspicious Eyes';
ttl.seye2.rar = 2;
ttl.seye2.desc = 'You have confirmed it, bashing the enemy on the head makes your battles end slightly quicker. Is it only the head that does that?';

ttl.pet1 = new Title(55);
ttl.pet1.name = 'Valley Cat';
ttl.pet1.desc = 'Stray animals don\'t seem to be wary of you that much, for some reason. You are able to hug a random cat without it running away';

ttl.pet2 = new Title(56);
ttl.pet2.name = 'Animal Friend';
ttl.pet2.rar = 2;
ttl.pet2.desc = 'Minor predators don\'t view you as a threat, which is good, but you don\'t want to bother them when they\'re hungry, though. You think you have a way to avoid the dangers of wild life, at least';

ttl.dngs1 = new Title(57);
ttl.dngs1.name = 'Wary';
ttl.dngs1.desc = 'Sometimes when you\'re hit it hurts much more then usual. You hate this, but why does that happen? You have to figure out how to avoid this';

ttl.dngs2 = new Title(58);
ttl.dngs2.name = 'Careful';
ttl.dngs2.rar = 2;
ttl.dngs2.desc = 'Avoiding hits to the vitals is much harder, as you found out. You must think of a way to take precautions to guarantee your own safety';

ttl.rtr1 = new Title(59);
ttl.rtr1.name = 'Coward';
ttl.rtr1.rar = 1;
ttl.rtr1.desc = 'You can\'t stomach the thought of getting seriously injured at all. Running away from danger is where it\'s at';

ttl.ddcd = new Title(60);
ttl.ddcd.name = 'null';
ttl.ddcd.rar = 0;
ttl.ddcd.rars = true;
ttl.ddcd.desc = 'null';

ttl.neet2 = new Title(61);
ttl.neet2.name = 'Shut In';
ttl.neet2.rar = 2;
ttl.neet2.rars = true;
ttl.neet2.desc = 'Staying home for a year was nothing, this time you went half a decade staying put in your comfortable living space, caring not for the outside world. You are not sure how you feel about nobody ever checking on you..';

ttl.neet3 = new Title(62);
ttl.neet3.name = 'Hermit';
ttl.neet3.rar = 3;
ttl.neet3.rars = true;
ttl.neet3.desc = 'Tenth of century at home, you did it. What were you even doing in there? Sleeping? Cultivating? It doesn\'t matter, you can proudly call yourself a hermit and stay forgotten until you decide to show yourself in light again';

ttl.coo1 = new Title(63);
ttl.coo1.name = 'Kitchen Nightmare';
ttl.coo1.desc = 'Either cooking is a very difficult art, or you\'re just very bad at it. Leaving you alone in the kitchen is a recipe for disaster. But you won\'t become good without making some mistakes first';

ttl.kill2 = new Title(64);
ttl.kill2.name = 'Sweeper';
ttl.kill2.rar = 2;
ttl.kill2.desc = 'Eliminating 50000 creatures like it was nothing made you wonder whether this realm is filled with weaklings or it is you who are simply too strong to handle. It is probably the former';

ttl.kill3 = new Title(65);
ttl.kill3.name = 'Bone Collector';
ttl.kill3.rar = 3;
ttl.kill3.desc = 'Hack and slash! 200000 foes have fallen under mighty arm! You\'re getting a little too comfortable on your path of destruction';

ttl.kill4 = new Title(66);
ttl.kill4.name = 'Decamate';
ttl.kill4.rar = 4;
ttl.kill4.desc = 'Million down, billions to go...';

ttl.kill5 = new Title(67);
ttl.kill5.name = 'Sentinel';
ttl.kill5.rar = 5;
ttl.kill5.desc = '5 million deaths! You managed to undo the population of the small city. That\'s quiet a feat given your low power level';

ttl.axc1 = new Title(68);
ttl.axc1.name = 'Hack';
ttl.axc1.desc = 'Axes are difficult to handle, you learned. This isn\'t simply chpping firewood on a log, you a need hard grip and proper hand flexibility to fight with them efficiently';

ttl.axc2 = new Title(69);
ttl.axc2.name = 'Chopper';
ttl.axc2.desc = 'You feel strong when using axes in battles! You only feel that way, you are not any strong with it yet. It is difficut for you to find the right balance to swing that thing';

ttl.axc3 = new Title(70);
ttl.axc3.name = 'Axejack';
ttl.axc3.rar = 3;
ttl.axc3.desc = '';

ttl.dth1 = new Title(71);
ttl.dth1.name = 'Fallen';
ttl.dth1.desc = 'Somehow you always escape life threatening situations even after being hit and bruised a lot, hovewer you still lose conciousness. Newbie\'s luck?';

ttl.dth2 = new Title(72);
ttl.dth2.name = 'Decadent';
ttl.dth2.rar = 2;
ttl.dth2.desc = 'Often you manage to avoid death even after being heavily injured. Perhaps you have a very resilient body, or Heavens aren\'t willing to accept you yet';

ttl.dth3 = new Title(73);
ttl.dth3.name = 'Cadaver';
ttl.dth3.rar = 3;
ttl.dth3.desc = '';

ttl.sld5 = new Title(74);
ttl.sld5.name = 'Bastion';
ttl.sld5.rar = 5;
ttl.sld5.desc = '';

ttl.seye3 = new Title(75);
ttl.seye3.name = 'Dissector';
ttl.seye3.rar = 3;
ttl.seye3.desc = 'By slaying foes as much as you did, you learned how to quickly notice your enemies\' weak points. This knowledge will allow you quickly and effectively dispose of those standing in your way';

ttl.fmn1 = new Title(76);
ttl.fmn1.name = 'Scrawny';
ttl.fmn1.desc = 'You feel terrible. You might want to eat something or you\'ll end up being nothing more than a skeleton';

ttl.fmn2 = new Title(77);
ttl.fmn2.name = 'Bag Of Bones';
ttl.fmn2.rar = 2;
ttl.fmn2.desc = 'Days of hunger took a toll on your body, yet made you learn to conserve your energy by other means, which shows. Just a bit';

ttl.fmn3 = new Title(78);
ttl.fmn3.name = 'Emaciated';
ttl.fmn3.rar = 3;
ttl.fmn3.desc = 'Yesterdays\'s weakness is today\'s strength. Or so you\'ve heard. You are not feeling as awful and weak by starving yourself, but there\'s still nothing to be proud of';

ttl.shpt1 = new Title(79);
ttl.shpt1.name = 'Third-Rate Shopper';
ttl.shpt1.desc = 'You left the shop with half a thousand goods total. It\'s a tiny amount if you think about it - food, cooking ingredients, household tools';

ttl.shpt2 = new Title(80);
ttl.shpt2.name = '';
ttl.shpt2.rar = 2;
ttl.shpt2.desc = ''

ttl.shpt3 = new Title(81);
ttl.shpt3.name = '';
ttl.shpt3.rar = 3;
ttl.shpt3.desc = ''

ttl.mone1 = new Title(82);
ttl.mone1.name = 'Beggar';
ttl.mone1.desc = 'Acquiring a whole 1 Gold coin worth of money is a lot for someone as pathetic you. You could survive with that amount for a year!';

ttl.mone2 = new Title(83);
ttl.mone2.name = 'Peasant';
ttl.mone2.rar = 2;
ttl.mone2.desc = ''

ttl.mone3 = new Title(84);
ttl.mone3.name = '';
ttl.mone3.rar = 3;
ttl.mone3.desc = ''

ttl.geti1 = new Title(85);
ttl.geti1.name = 'Collector';
ttl.geti1.desc = ''

ttl.geti2 = new Title(86);
ttl.geti2.name = 'Packmule';
ttl.geti2.rar = 2;
ttl.geti2.desc = ''

ttl.geti3 = new Title(87);
ttl.geti3.name = 'Hoarder';
ttl.geti3.rar = 3
ttl.geti3.desc = ''

ttl.geti4 = new Title(88);
ttl.geti4.name = 'Treasure Hunter';
ttl.geti4.rar = 4
ttl.geti4.desc = ''

ttl.tghs1 = new Title(89);
ttl.tghs1.name = 'Scarred';
ttl.tghs1.desc = ''

ttl.tghs2 = new Title(90);
ttl.tghs2.name = 'Thickskinned';
ttl.tghs2.rar = 2;
ttl.tghs2.desc = ''

ttl.tghs3 = new Title(91);
ttl.tghs3.name = 'Brute';
ttl.tghs3.rar = 3;
ttl.tghs3.desc = ''

ttl.dth4 = new Title(92);
ttl.dth4.name = 'Carcass';
ttl.dth4.rar = 4;
ttl.dth4.desc = '';

ttl.ttsttl1 = new Title(93);
ttl.ttsttl1.name = 'Unknown';
ttl.ttsttl1.desc = 'You barely took a single minor step into the world by gathering 10 titles. Nobody takes notice of you or your ambition, you are but a filler existence that doesn\'t amount to anything yet';

ttl.ttsttl2 = new Title(94);
ttl.ttsttl2.name = 'Nameless';
ttl.ttsttl2.rar = 2;
ttl.ttsttl2.desc = '25 titles would be something an average working man would aquire effortlessly by simply living his life. You shouldn\'t feel proud by only reaching this high';

ttl.ttsttl3 = new Title(95);
ttl.ttsttl3.name = 'Ordinary';
ttl.ttsttl3.rar = 3;
ttl.ttsttl3.desc = 'You\'re finally getting somewhere, having a basic set of skills and minor achievements. You could even be called reliable by some. But once again, you are feeling like a part of the mass';

ttl.ttsttl4 = new Title(96);
ttl.ttsttl4.name = 'Accomplished';
ttl.ttsttl4.rar = 4;
ttl.ttsttl4.desc = '100';

ttl.hstr1 = new Title(97);
ttl.hstr1.name = 'Pathetic';
ttl.hstr1.desc = 'Your weak punch can barely exert a power of 100kg, which is a measly amount in the martial world. A simple farmer can hit harder than this';

ttl.hstr2 = new Title(98);
ttl.hstr2.name = 'Softhitter';
ttl.hstr2.rar = 2;
ttl.hstr2.desc = 'You got somewhat stronger in reaching 250kg worth of punch power. You can manage some physical labor with that strength, but nothing noteworthy';

ttl.hstr3 = new Title(99);
ttl.hstr3.name = 'Jawbreaker';
ttl.hstr3.rar = 3;
ttl.hstr3.desc = 'Half ton punch isn\'t bad, you can successfully push a body a few meters back if you hit correctly in the right spot. This only applies to entities without strong physical protection, you are no match to anything with real strength';

ttl.hstr4 = new Title(100);
ttl.hstr4.name = 'Nameless';
ttl.hstr4.rar = 4;
ttl.hstr4.desc = '1000';

ttl.cpet1 = new Title(101);
ttl.cpet1.name = 'Cat Lover';
ttl.cpet1.rar = 2;
ttl.cpet1.desc = 'You really love that kitty';

ttl.jbs1 = new Title(102);
ttl.jbs1.name = 'Errand Boy';
ttl.jbs1.desc = '';

ttl.jbs2 = new Title(103);
ttl.jbs2.name = 'Part-Timer';
ttl.jbs2.rar = 2;
ttl.jbs2.desc = '';

ttl.jbs3 = new Title(104);
ttl.jbs3.name = 'Hired Hand';
ttl.jbs3.rar = 3;
ttl.jbs3.desc = '';

ttl.pet3 = new Title(105);
ttl.pet3.name = 'Wild Kid';
ttl.pet3.rar = 3;
ttl.pet3.desc = 'All that time you spent with your cat made you understand a whole lot about the habits and behaviour of vicious predators. You feel that knowledge might prove to be useful one day';

ttl.ndthextr = new Title(106);
ttl.ndthextr.name = 'Safehouse';
ttl.ndthextr.rar = 0;
ttl.ndthextr.rars = true;
ttl.ndthextr.desc = 'You kept yourself well and protected, avoiding danger and moving out of harm\'s way for quiet some time. Almost like any other person who fears for his life';

ttl.indkill = new Title(107);
ttl.indkill.name = 'Indirect Killer';
ttl.indkill.rar = 2;
ttl.indkill.rars = true;
ttl.indkill.desc = '';
