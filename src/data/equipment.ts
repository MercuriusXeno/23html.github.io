import { wpn, eqp, acc, sld, item, dom, global, inv, rcp, skl, callback, checksd, flags } from '../state';
import type { Player, Combatant } from '../types';
import { recshop } from '../ui/shop';
import { giveSkExp, giveRcp } from '../game/progression';
import { equip } from '../ui/equipment';
import { msg } from '../ui/messages';
import { attachCallback, detachCallback } from '../systems/weather';

// ==========================================================================
// Equipment constructor + instances + disassembly data
// ==========================================================================

function Eqp(this: any, cfg?: any) {
  this.name = 'nothing';
  this.desc = '';
  this.str = 0;
  this.agl = 0;
  this.int = 0;
  this.spd = 0;
  this.dp = 15;
  this.dpmax = 15;
  this.eff = [];
  this.data = { dscv: false };
  this.cls = [0, 0, 0];
  // edge, pierce, blunt
  //this.ccls=[0,0,0];
  this.aff = [0, 0, 0, 0, 0, 0, 0];
  //p, a, e, f, w, l, d
  //this.caff = [0,0,0,0,0,0,0];
  //this.maff=[0,0,0,0,0,0,0];
  //this.cmaff=[0,0,0,0,0,0,0];
  this.atype = 0;
  this.ctype = 0;
  this.wtype = 0;
  // un, srd, axe, knf, spr, hmr, stff
  this.atkmode = 1;
  this.rar = 1;
  this.type = 2;
  this.amount = 1;
  this.stype = 2;
  this.slot = 0;
  this.id = 10000;
  this.important = false;
  this.new = false;
  this.cond = function () { return true };
  this.onGet = function (_player: Player) { };
  this.oneq = function (_player: Player) { };
  this.onuneq = function (_player: Player) { };
  this.use = function (this: any) { equip(this) };
  if (cfg) for (let k in cfg) this[k] = cfg[k];
// @ts-ignore: constructor function
// @ts-ignore: constructor function
} eqp.dummy = new Eqp();

// @ts-ignore: constructor function
wpn.stk1 = new Eqp({ id: 10001, name: 'A Stick', desc: 'Your favorite weapon!' + dom.dseparator, slot: 1, str: 2, cls: [0, 0, 1], ctype: 2, wtype: 5, dp: 13, dpmax: 13 });

// @ts-ignore: constructor function
wpn.stk2 = new Eqp({ id: 10002, name: 'Sharpened Stick', desc: 'Long stick with a sharpened end. Watch out, you may hurt someone with it' + dom.dseparator, slot: 1, str: 5, cls: [0, 3, 0], ctype: 1, wtype: 4, dp: 16, dpmax: 16,
  onGet: function () {
    let n = 0
    for (let a in inv) if (inv[a].id === this.id) n++
    if (n >= 4) giveRcp(rcp.stksld)
  }
});

// @ts-ignore: constructor function
wpn.knf1 = new Eqp({ id: 10003, name: 'Wooden Knife', desc: 'Lost kid\'s toy. The relic of many playground battles' + dom.dseparator, slot: 1, str: 4, cls: [0, 0, 2], ctype: 2, wtype: 3, dp: 31, dpmax: 31 });

// @ts-ignore: constructor function
wpn.knf2 = new Eqp({ id: 10004, name: 'Rusty Dagger', desc: 'Used up useless knife. More of a blunt weapon in it\'s current state' + dom.dseparator, slot: 1, str: 7, agl: -1, cls: [3, 2, 1], dp: 11, dpmax: 11, wtype: 3 });

// @ts-ignore: constructor function
wpn.ktn1 = new Eqp({ id: 10005, name: 'Rusty Katana', desc: 'Old worthless blade, forgotten for ages. It falls apart as you attempt to swing it' + dom.dseparator, slot: 1, str: 15, agl: -2, cls: [4, 1, 2], dp: 21, dpmax: 21, wtype: 1 });

// @ts-ignore: constructor function
wpn.ktn2 = new Eqp({ id: 10006, name: 'Red Katana', desc: 'Polished rusty katana. Still nearly useless in a fight' + dom.dseparator, slot: 1, str: 42, agl: -4, cls: [5, 3, 2], dp: 17, dpmax: 17, wtype: 1 });

// @ts-ignore: constructor function
wpn.trch = new Eqp({ id: 10007, name: 'Torch', desc: 'Used to light up dark places or for burning up thing' + dom.dseparator + '<span style="color:yellow;background-color:crimson">Fire DMG +10</span><br>', slot: 1, str: 2, atype: 3, aff: [0, 0, 0, 10, 0, 5, 0], cls: [0, 0, 3], ctype: 2, dp: 10, dpmax: 10, degrade: .03, wtype: 5,
  oneq: function (player: Player) { player.mods.light += 1 },
  onuneq: function (player: Player) { player.mods.light -= 1 },
  onDegrade: function () { msg('Your torch burned down', 'darkgrey') }
});

// @ts-ignore: constructor function
wpn.twg = new Eqp({ id: 10009, name: 'Dry Twig', desc: 'With this you can pretend you\'re a wizard' + dom.dseparator + '<span style="color:lightgoldenrodyellow;text-shadow:gold 0px 0px 5px">Light DMG +3</span><br>', slot: 1, int: 3, cls: [0, 0, 2], aff: [0, 1, 0, 0, 0, 3, 5], atype: 5, atkmode: 2, dp: 12, dpmax: 12, wtype: 6 });

// @ts-ignore: constructor function
wpn.dgknf = new Eqp({ id: 10010, name: 'Dagger', desc: 'Simple knife used by wayfarers. Not a combat weapon, has a minor domestic use' + dom.dseparator, slot: 1, str: 11, cls: [4, 2, 0], dp: 22, dpmax: 22, wtype: 3 });

// @ts-ignore: constructor function
wpn.bknf = new Eqp({ id: 10011, name: 'Battle Knife', desc: 'A good dagger for the novice' + dom.dseparator, slot: 1, wtype: 3 });

// @ts-ignore: constructor function
wpn.skknf = new Eqp({ id: 10012, name: 'Scramasax', desc: 'A good knife for both combat and daily use' + dom.dseparator, slot: 1, wtype: 3, ctype: 1 });

// @ts-ignore: constructor function
wpn.drknf = new Eqp({ id: 10013, name: 'Dirk', desc: 'A steady knife you can depend on' + dom.dseparator, slot: 1, wtype: 3 });

// @ts-ignore: constructor function
wpn.thknf = new Eqp({ id: 10014, name: 'Throwing Knife', desc: 'A finely honed throwing knife' + dom.dseparator, slot: 1, wtype: 3, ctype: 1 });

// @ts-ignore: constructor function
wpn.kdknf = new Eqp({ id: 10015, name: 'Kudi', desc: 'A dangerous dagger with a curved blade' + dom.dseparator, slot: 1, wtype: 3 });

// @ts-ignore: constructor function
wpn.krsnf = new Eqp({ id: 10016, name: 'Kris', desc: 'An exotic dagger with a wavy blade' + dom.dseparator, slot: 1, wtype: 3, ctype: 1 });

// @ts-ignore: constructor function
wpn.cqsnf = new Eqp({ id: 10017, name: 'Cinquedea', desc: 'The knife of theives' + dom.dseparator, slot: 1, wtype: 3, ctype: 1 });

// @ts-ignore: constructor function
wpn.kkknf = new Eqp({ id: 10018, name: 'Khukuri', desc: 'A knife with a heavy, curved blade' + dom.dseparator, slot: 1, wtype: 3 });

// @ts-ignore: constructor function
wpn.bdknf = new Eqp({ id: 10019, name: 'Baselard', desc: 'A battle knife with a flat, thin blade, perfect for deploying fast attacks' + dom.dseparator, slot: 1, wtype: 3 });

// @ts-ignore: constructor function
wpn.stknf = new Eqp({ id: 10020, name: 'Stiletto', desc: 'A stabbing dagger with a thin, sharp blade' + dom.dseparator, slot: 1, wtype: 3, ctype: 1 });

// @ts-ignore: constructor function
wpn.jmknf = new Eqp({ id: 10021, name: 'Jamadhar', desc: 'An exotic dagger with three blades in one hilt' + dom.dseparator, slot: 1, wtype: 3, ctype: 1 });

// @ts-ignore: constructor function
wpn.skknf = new Eqp({ id: 10022, name: 'Soul Kiss', desc: 'Cursed knife capable of rapturing the soul' + dom.dseparator, slot: 1, wtype: 3 });

// @ts-ignore: constructor function
wpn.rbknf = new Eqp({ id: 10023, name: 'Ribsplitter', desc: 'Unusualy long knife with a curved tip' + dom.dseparator, slot: 1, wtype: 3 });

// @ts-ignore: constructor function
wpn.gaknf = new Eqp({ id: 10024, name: 'Glacialdra', desc: '', slot: 1, rar: 3, wtype: 3 });

// @ts-ignore: constructor function
wpn.ekmw = new Eqp({ id: 10025, name: 'Ekimnekuwa', desc: 'Also known as "Hiking Stick". Sturdy, used for support while travelling on foot in forests, mountains, through the snow, water, or any other difficult to navigate landscape' + dom.dseparator, slot: 1, ctype: 2, wtype: 5 });

// @ts-ignore: constructor function
wpn.mnkm = new Eqp({ id: 10026, name: 'Menokamakiri', desc: 'Short knife, designed for women. Light and durable, functions like a hunting knife' + dom.dseparator, slot: 1, wtype: 3 });

// @ts-ignore: constructor function
wpn.mkr = new Eqp({ id: 10027, name: 'Makiri', desc: 'Short sword' + dom.dseparator, slot: 1, wtype: 1 });

// @ts-ignore: constructor function
wpn.wsrd1 = new Eqp({ id: 10028, name: 'Wooden Sword', desc: 'Simple long sword carved from light wood. Easy to handle and is suitable as amateurish training weapon' + dom.dseparator, slot: 1, str: 7, cls: [1, 0, 3], dp: 33, dpmax: 33, wtype: 1, ctype: 2 });

// @ts-ignore: constructor function
wpn.wsrd2 = new Eqp({ id: 10029, name: 'Bamboo Training Sword', desc: 'A training sword for kenjutsu lessons. Designed in the late Edo period, it is strung together from four bamboo planks. The ruthless chief of a female bandit group named Danfu is known to wield it' + dom.dseparator, slot: 1, str: 10, cls: [2, 0, 3], dp: 41, dpmax: 41, wtype: 1, ctype: 2 });

// @ts-ignore: constructor function
wpn.nssrd = new Eqp({ id: 10030, name: 'Short Sword', desc: 'Short crude sword designed for self-defence. It\'s not that useful in battle, especially in unskilled hands' + dom.dseparator, slot: 1, str: 55, cls: [4, 2, 1], dp: 35, dpmax: 35, wtype: 1 });

// @ts-ignore: constructor function
wpn.heyit = new Eqp({ id: 10031, name: 'Heiyoto', desc: 'Nothing flashy or noticeable about his sword. It reflects the samurai spirit' + dom.dseparator });

// @ts-ignore: constructor function
wpn.fksrd = new Eqp({ id: 10032, name: 'Fake Sword', desc: 'The sword is made of bamboo. Poorer ronin sometimes pretend to be full-fledged samurai with this' + dom.dseparator, slot: 1, str: 23, cls: [2, 0, 4], dp: 33, dpmax: 33, wtype: 1, ctype: 2 });

// @ts-ignore: constructor function
wpn.tkmts = new Eqp({ id: 10033, name: 'Takemitsu', desc: 'This reinforced sword is made of bamboo. Not much as a weapon, but makes you seem stronger' + dom.dseparator, slot: 1, str: 35, cls: [2, 1, 5], dp: 40, dpmax: 40, wtype: 1, ctype: 2 });

// @ts-ignore: constructor function
wpn.bsrd = new Eqp({ id: 10034, name: 'Blunt Sword', desc: 'This is the blunt sword used as a bad example of a knife in demonstration sales for housewives. Good luck trying to cut onions with this' + dom.dseparator, slot: 1, str: 20, cls: [2, 3, 3], dp: 38, dpmax: 38, wtype: 1, ctype: 2 });

// @ts-ignore: constructor function
wpn.bdsrd = new Eqp({ id: 10035, name: 'Dull Sword', desc: 'A sword designed for mass production by reducing labor and material cost down to a minimum. It may look like a sword, but it\'s not really fit to cut anything. The manual suggests it be used to cut radishes' + dom.dseparator, slot: 1, str: 27, cls: [2, 3, 3], dp: 34, dpmax: 34, wtype: 1, ctype: 2 });

// @ts-ignore: constructor function
wpn.bcsrd = new Eqp({ id: 10036, name: 'Crappy Sword', desc: 'This sword is sold at the 100 Cout store under the name "Big Loss". You get what you pay for. There are even competitions to see who can sharpen this sword the best' + dom.dseparator, slot: 1, str: 40, cls: [4, 3, 3], dp: 34, dpmax: 34, wtype: 1 });

// @ts-ignore: constructor function
wpn.ktsk = new Eqp({ id: 10037, name: 'Kotesaki', desc: 'A light sword a ight-heartet guy begged the swordsmith to make. He thought his sword would make him more popular with the ladies. He managed to rack up some wins by cheating, but the ladies still don\'t like him' + dom.dseparator });

// @ts-ignore: constructor function
wpn.crsto = new Eqp({ id: 10038, name: 'Cristo', desc: 'A samurai wrongly imprisoned for a crime he didn\'t commit carved this weapon from his cell walls. He did this in a secret from the guards, but by the time he finished, his sentence was over' + dom.dseparator });

// @ts-ignore: constructor function
wpn.ksbmr = new Eqp({ id: 10039, name: 'Komusubimaru', desc: 'A swordsman who loves sumo made this sword to cheer on his favorite sumo wrestler. But the name "Komusubi" is a low rank in sumo. It was bad luck, and the wrestler never got promoted' + dom.dseparator });

// @ts-ignore: constructor function
wpn.hsmts = new Eqp({ id: 10040, name: 'Hasemitsu', desc: 'A swordsmith created this blade as he danced around bragging about his skill. You may think he was just screwing around, but this sword is actually quiet nice' + dom.dseparator });

// @ts-ignore: constructor function
wpn.kiknif = new Eqp({ id: 10041, name: 'Kitchen Knife', desc: 'A knife originally used to cut fish, not people. It\'s not a sword, but ordering one won\'t get you yelled at' + dom.dseparator + '<span style="color:deeppink">Cooking EXP gain +15%</span><br>', slot: 1, str: 24, cls: [3, 2, 0], dp: 15, dpmax: 15, wtype: 3,
  oneq: function () { skl.cook.p += .15 },
  onuneq: function () { skl.cook.p -= .15 }
});

// @ts-ignore: constructor function
wpn.gamas = new Eqp({ id: 10042, name: 'Gama', desc: 'A man\'s wife who had a face that resembles a frog died, so he hired a medium to do a seance to summon his wife\'s spirit. But the medium summoned the spirit of some toad. The husband used this sword to kill the medium' + dom.dseparator });

// @ts-ignore: constructor function
wpn.wsdmbld = new Eqp({ id: 10043, name: 'Wisdom Blade', desc: 'This is the sword used by a serial killer that struck fear in Edo. The killer stole his family sword to do his killing, so you can imagine that things got weird at the house when they found the sword missing' + dom.dseparator });

// @ts-ignore: constructor function
wpn.kurum = new Eqp({ id: 10044, name: 'Kuruma', desc: 'This is the sword used by a great tengu when he taught Ushiwakamaru how to fight at Mt. Kuruma. Ushiwakamaru is trained to fight and also became great at the pommel horse' + dom.dseparator });

// @ts-ignore: constructor function
wpn.hrsm = new Eqp({ id: 10045, name: 'Harusame', desc: 'A sword made in the quiet rain in spring. It is easy to wield and can be chewy. When dried, it won\'t be as sharp, but putting water turns it back to normal' + dom.dseparator });

// @ts-ignore: constructor function
wpn.kosgi = new Eqp({ id: 10046, name: 'Kosugi', desc: 'A sword used by the famous ninja who left the country and took and extremely dangerous mission. This sword encompasses his very being' + dom.dseparator });

// @ts-ignore: constructor function
wpn.shiran = new Eqp({ id: 10047, name: 'Shiran', desc: 'Its name comes from its purple orchid-like accessory. The true etymology of the sword is a mystery to even its swordsmith' + dom.dseparator });

// @ts-ignore: constructor function
wpn.shnztt = new Eqp({ id: 10048, name: 'Shinzanto', desc: 'Those who wield this sword also command the shaky nervousness of the rookie blacksmith who crafted it' + dom.dseparator });

// @ts-ignore: constructor function
wpn.lsrd = new Eqp({ id: 10049, name: 'Light Sword', desc: 'A basic, easy to wield civilian-level light sword' + dom.dseparator, slot: 1, wtype: 1 });

// @ts-ignore: constructor function
wpn.log = new Eqp({ id: 10050, name: 'Log', desc: 'A massive heavy tree log. How did you even think about swinging it as a weapon?' + dom.dseparator, slot: 1, twoh: true, str: 48, cls: [-5, -5, 6], agl: -15, ctype: 2, wtype: 5, dp: 68, dpmax: 68 });

// @ts-ignore: constructor function
wpn.sprw = new Eqp({ id: 10051, name: 'Spear', desc: 'Long piece of wood with a sharp metal chunk at the end of it. Couldn\'t get simpler than that' + dom.dseparator, slot: 1, str: 11, cls: [2, 4, 1], ctype: 1, wtype: 4, dp: 26, dpmax: 26 });

// @ts-ignore: constructor function
wpn.gsprw = new Eqp({ id: 10052, name: 'Guard Spear', desc: 'Basic and easy to wield spear used in self-defence' + dom.dseparator, slot: 1, str: 27, cls: [2, 5, 2], ctype: 1, wtype: 4, dp: 44, dpmax: 44 });

// @ts-ignore: constructor function
wpn.scspt1 = new Eqp({ id: 10053, name: 'Red Hand', desc: 'Burning sword that looks like a scissors blade. Its flames can evaporate any liquid' + dom.dseparator + '<span style="color:orange;text-shadow:red 0px 0px 5px,red 0px 0px 5px">Fire Affinity +25</span><br>', slot: 1, str: 54, cls: [10, 7, 3], aff: [0, 0, 0, 25, -35, 0, 0], dp: 75, dpmax: 75, wtype: 1, atype: 3, rar: 3 });

// @ts-ignore: constructor function
wpn.scspt2 = new Eqp({ id: 10054, name: 'Blue Hand', desc: 'Freezing sword that looks like a scissors blade. Its edge can calm the fieriest fire' + dom.dseparator + '<span style="color:cyan;text-shadow:blue 0px 0px 5px,blue 0px 0px 5px">Water Affinity +25</span><br>', slot: 1, str: 52, cls: [11, 8, 5], aff: [0, 0, 0, -35, 25, 0, 0], dp: 65, dpmax: 65, wtype: 1, atype: 4, rar: 3 });

// @ts-ignore: constructor function
wpn.scspt3 = new Eqp({ id: 10055, name: 'Fate Cutters', desc: 'Two swords combined together, forming a scissors-shaped weapon. It is said a mad blacksmith created this blade to hunt demigods' + dom.dseparator + '<span style="color:mediumorchid;text-shadow:darkblue 0px 0px 5px,darkblue 0px 0px 5px">Dark Affinity +30</span><br>', slot: 1, twoh: true, str: 108, cls: [15, 12, 6], aff: [0, 0, 0, 15, 15, -5, 30], dp: 99, dpmax: 99, wtype: 1, atype: 6, rar: 4 });

// @ts-ignore: constructor function
wpn.shrsb = new Eqp({ id: 10056, name: 'Shears', desc: 'Massive gardening shears, for tiding up the bushes and other decorative flora. A murderer in the past was known to commit atrocities with a similar tool' + dom.dseparator, slot: 1, twoh: true, str: 40, agl: -11, cls: [8, 5, 1], dp: 45, dpmax: 45, wtype: 3 });

// @ts-ignore: constructor function
wpn.evob = new Eqp({ id: 10057, name: 'Sword Of Evolution', desc: 'This living blade can absorb the blood and souls of defeated foes, it gets sharper with each kill' + dom.dseparator, slot: 1, str: 1, rar: 4, dp: 30, dpmax: 30, wtype: 1,
  oneq: function (player: Player) {
    attachCallback(callback.onDeath, {
      f: function (victim: Combatant, killer: Combatant) {
        player.eqp[0].str += victim.str * .00005
        player.eqp[0].agl += victim.agl * .000003
        player.eqp[0].int += victim.int * .000001
        let d = victim.lvl * .001 ** (1 + victim.rnk * .01);
        player.eqp[0].dp += d;
        player.eqp[0].dpmax += d
      },
      id: 10057,
      data: { q: true }
    })
  },
  onuneq: function () { detachCallback(callback.onDeath, 10057) }
});

// @ts-ignore: constructor function
wpn.mkrdwk = new Eqp({ id: 10058, name: 'Marked Wakizashi', desc: 'Old wakizashi variant with red hilt. Scarred and chipped blade hints that it was used rather heavily in the past' + dom.dseparator, slot: 1, important: true, rar: 2, str: 40, cls: [4, 3, 2], dp: 48, dpmax: 48, wtype: 1 });

// @ts-ignore: constructor function
eqp.bnd = new Eqp({ id: 20001, name: 'Bandana', desc: 'Thin cloth bandana. It protects your face from sweat' + dom.dseparator, slot: 3, str: 3, agl: 1, aff: [1, 0, 1, 4, -2, 0, 0], cls: [1, 0, 2], stype: 3, dp: 11, dpmax: 11 });

// @ts-ignore: constructor function
eqp.pnt = new Eqp({ id: 20002, name: 'Dojo Pants', desc: 'Perfect for morning runs' + dom.dseparator, slot: 7, str: 4, agl: 2, aff: [2, 0, 3, 4, -1, 0, 0], cls: [2, 1, 1], stype: 3, dp: 19, dpmax: 19 });

// @ts-ignore: constructor function
eqp.brc = new Eqp({ id: 20003, name: 'Bandage', desc: 'Simple handwraps' + dom.dseparator, slot: 5, str: 2, agl: 1, int: 3, aff: [0, 0, 0, 0, 0, 0, 0], cls: [1, 0, 1], stype: 3, dp: 11, dpmax: 11 });

// @ts-ignore: constructor function
eqp.gnt = new Eqp({ id: 20004, name: 'Gauntlet', desc: 'Tough leather gauntlet that covers your entire hand. May prevent you from losing fingers' + dom.dseparator, slot: 5, str: 10, stype: 3, aff: [2, 1, 3, 3, 2, 2, 1], cls: [3, 2, 4], dp: 24, dpmax: 24 });

// @ts-ignore: constructor function
eqp.vst = new Eqp({ id: 20005, name: 'Linen Vest', desc: 'You\'ll feel chilly without sleeves' + dom.dseparator, slot: 4, str: 6, stype: 3, aff: [1, 0, 0, 0, 0, 1, 0], cls: [3, 1, 1], dp: 23, dpmax: 23 });

// @ts-ignore: constructor function
eqp.thd = new Eqp({ id: 20006, name: 'Yellow Hood', desc: '', slot: 3, stype: 3 });

// @ts-ignore: constructor function
eqp.amsk = new Eqp({ id: 20007, name: 'Wolf Mask', desc: 'A cute wolf mask.<br>It symbolizes <span style="color:orange;text-shadow:red 0px 0px 5px,red 0px 0px 5px">Fire</span>', slot: 3, stype: 3, caff: [1, 0, 0, 20, 0, 0, 0], cls: [5, 5, 5], rar: 2, dp: 30, dpmax: 30,
  oneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] += (this.caff as any)[afn] },
  onuneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] -= (this.caff as any)[afn] }
});

// @ts-ignore: constructor function
eqp.bmsk = new Eqp({ id: 20008, name: 'Frog Mask', desc: 'A cute frog mask.<br>It symbolizes <span style="color:cyan;text-shadow:blue 0px 0px 5px,blue 0px 0px 5px">Water</span>', slot: 3, stype: 3, caff: [1, 0, 0, 0, 20, 0, 0], cls: [5, 5, 5], rar: 2, dp: 30, dpmax: 30,
  oneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] += (this.caff as any)[afn] },
  onuneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] -= (this.caff as any)[afn] }
});

// @ts-ignore: constructor function
eqp.cmsk = new Eqp({ id: 20009, name: 'Cat Mask', desc: 'A cute cat mask. <br>It symbolizes <span style="color:lime;text-shadow:green 0px 0px 5px,green 0px 0px 5px">Wind</span>', slot: 3, stype: 3, caff: [1, 20, 0, 0, 0, 0, 0], cls: [5, 5, 5], rar: 2, dp: 30, dpmax: 30,
  oneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] += (this.caff as any)[afn] },
  onuneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] -= (this.caff as any)[afn] }
});

// @ts-ignore: constructor function
eqp.dmsk = new Eqp({ id: 20010, name: 'Dog Mask', desc: 'A cute dog mask. <br>It symbolizes <span style="color:gold;text-shadow:orange 0px 0px 5px,orange 0px 0px 5px">Bravery</span>', slot: 3, stype: 3, caff: [1, 0, 20, 0, 0, 0, 0], cls: [5, 5, 5], rar: 2, dp: 30, dpmax: 30,
  oneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] += (this.caff as any)[afn] },
  onuneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] -= (this.caff as any)[afn] }
});

// @ts-ignore: constructor function
eqp.emsk = new Eqp({ id: 20011, name: 'Fox Mask', desc: 'A cute fox mask. <br>It symbolizes <span style="color:lightgoldenrodyellow;text-shadow:gold 0px 0px 5px">Light</span>', slot: 3, stype: 3, caff: [1, 0, 0, 0, 0, 20, 0], cls: [5, 5, 5], rar: 2, dp: 30, dpmax: 30,
  oneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] += (this.caff as any)[afn] },
  onuneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] -= (this.caff as any)[afn] }
});

// @ts-ignore: constructor function
eqp.fmsk = new Eqp({ id: 20012, name: 'Devil Mask', desc: 'A viscous devil mask. <br>It symbolizes <span style="color:mediumorchid;text-shadow:darkblue 0px 0px 5px,darkblue 0px 0px 5px">Darkness</span>', slot: 3, stype: 3, caff: [1, 0, 0, 0, 0, 0, 20], cls: [5, 5, 5], rar: 2, dp: 30, dpmax: 30,
  oneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] += (this.caff as any)[afn] },
  onuneq: function (player: Player) { for (let afn in this.caff) (player.caff as any)[afn] -= (this.caff as any)[afn] }
});

// @ts-ignore: constructor function
eqp.nkgd = new Eqp({ id: 20013, name: 'Neck Guard', desc: 'Metal plating worn around the neck. Minor protection from direct frontal attacks' + dom.dseparator, str: 7, slot: 3, stype: 3, aff: [3, -3, -3, -3, -3, -3, -3], cls: [4, 4, 4], dp: 35, dpmax: 35 });

// @ts-ignore: constructor function
eqp.sndl = new Eqp({ id: 20014, name: 'Sandals', desc: 'Cheap unremarkable sandals made from light leather. Aren\'t even that comfortable to wear' + dom.dseparator, slot: 7, str: 3, agl: 1, aff: [2, 0, 2, 3, -1, 0, 0], cls: [1, 1, 1], stype: 3, dp: 12, dpmax: 12 });

// @ts-ignore: constructor function
eqp.ykkr = new Eqp({ id: 20015, name: 'Yukker', desc: 'Warm deerskin boots, worn by civilians and hunters during winter for maximum protection from cold and environmental hazards' + dom.dseparator, slot: 7, str: 11, agl: 2, aff: [3, 5, 15, 7, 3, 0, 0], cls: [5, 4, 8], stype: 3, dp: 22, dpmax: 22 });

// @ts-ignore: constructor function
eqp.tnc = new Eqp({ id: 20016, name: 'Tunic', desc: 'A simple, short-sleeved shirt. It\'s somewhat short in length and tailored to snugly fit the wearer\'s body' + dom.dseparator, slot: 4, str: 9, stype: 3, aff: [2, 1, -1, 1, 1, 5, 0], cls: [2, 2, 3], dp: 26, dpmax: 26 });

// @ts-ignore: constructor function
eqp.rncp = new Eqp({ id: 20017, name: 'Rain Cap', desc: 'The cap with the wide brim for keeping the rain from the wearer\'s eyes' + dom.dseparator, slot: 3, str: 9, aff: [2, 3, 2, 5, 14, 5, -5], cls: [3, 2, 2], stype: 3, dp: 17, dpmax: 17 });

// @ts-ignore: constructor function
eqp.rnss = new Eqp({ id: 20018, name: 'Rain Shoes', desc: 'Simple shoes made from tree rubber. Sturdy and longlasting, they protect one\'s toes from cold' + dom.dseparator, slot: 7, str: 9, agl: 2, aff: [4, 5, 10, 9, 14, 1, 0], cls: [3, 7, 5], stype: 3, dp: 22, dpmax: 22 });

// @ts-ignore: constructor function
eqp.hkgd = new Eqp({ id: 20019, name: 'Headguard', desc: 'A simple and light helmet that provides minimal protection against falling debris and the like' + dom.dseparator, str: 14, slot: 3, stype: 3, aff: [5, -4, -4, -4, -4, -4, -1], cls: [5, 5, 7], dp: 28, dpmax: 28 });

// @ts-ignore: constructor function
eqp.wkss = new Eqp({ id: 20020, name: 'Worker Shoes', desc: 'Safety shoes for laborers. The metal reinforcement offers dependable protection for the toes' + dom.dseparator, slot: 7, str: 16, agl: 2, aff: [7, 12, 8, 7, 8, 1, 2], cls: [5, 4, 6], stype: 3, dp: 22, dpmax: 22 });

// @ts-ignore: constructor function
eqp.jhmt = new Eqp({ id: 20021, name: 'Junk Helmet', desc: 'A helmet clobbled together from scrap material. It looks terribly heavy but provides good protection around the head and neck' + dom.dseparator, str: 18, slot: 3, stype: 3, aff: [8, -5, -5, -5, -5, -5, -5], cls: [8, 8, 8], dp: 28, dpmax: 28 });

// @ts-ignore: constructor function
eqp.knkn = new Eqp({ id: 20022, name: 'Knit Knee-Highs', desc: 'Long boots woven from linen. Light and breathable, so they\'re comfortable when it\'s hot' + dom.dseparator, slot: 7, str: 19, agl: 2, aff: [3, 4, 7, 15, 10, 3, 2], cls: [3, 3, 3], stype: 3, dp: 32, dpmax: 32 });

// @ts-ignore: constructor function
eqp.brbn = new Eqp({ id: 20023, name: 'Burnouns', desc: 'A long, hooded cloak. Protetcs the wearer from both the scorching sun and chilling cold' + dom.dseparator, slot: 4, str: 33, agl: -4, stype: 3, aff: [4, 7, 5, 19, 21, -15, 15], cls: [8, 5, 8], dp: 41, dpmax: 41 });

// @ts-ignore: constructor function
eqp.ovrl = new Eqp({ id: 20024, name: 'Overalls', desc: 'Work clothes made of heavy cloth that cover the entire body. Protects from bumps and scratches' + dom.dseparator, slot: 4, str: 25, stype: 3, aff: [6, 6, 5, 9, 8, 9, 3], cls: [8, 8, 8], dp: 33, dpmax: 33 });

// @ts-ignore: constructor function
eqp.prsnu = new Eqp({ id: 20025, name: 'Prison Uniform', desc: 'Made of ugly, coarse cloth, this garment\'s sturdiness is its only redeeming trait. It holds up well under what washing it does get' + dom.dseparator, slot: 4, str: 40, stype: 3, aff: [9, 6, 5, 9, 8, 9, 3], cls: [10, 10, 5], dp: 38, dpmax: 38 });

// @ts-ignore: constructor function
eqp.prsna = new Eqp({ id: 20026, name: 'Prison Apparel', desc: 'It looks just like any other prison uniform, but the neck, sleeves and elbows have been made far more comfortable with soft threads' + dom.dseparator, slot: 4, rar: 2, str: 44, agl: 5, stype: 3, aff: [9, 7, 8, 9, 8, 9, 3], cls: [10, 10, 10], dp: 38, dpmax: 38 });

// @ts-ignore: constructor function
eqp.strwks = new Eqp({ id: 20027, name: 'Straw Kasa', desc: 'A Sando-gasa is made by weaving straw together. Great for boys who are too embarrassed to use a parasol' + dom.dseparator, slot: 3, str: 6, aff: [3, 3, 2, 13, 2, 5, -5], cls: [2, 1, 1], stype: 3, dp: 18, dpmax: 18 });

// @ts-ignore: constructor function
eqp.knkls = new Eqp({ id: 20028, name: 'Knuckles', desc: 'Leather bands that cover fingers' + dom.dseparator + 'Unarmed STR: <span style="color:lime">+4</span><br>', slot: 5, str: 4, undc: 4, aff: [1, 0, 0, 0, 0, 0, 0], cls: [2, 1, 1], stype: 3, dp: 17, dpmax: 17,
  oneq: function (player: Player) { player.mods.undc += this.undc },
  onuneq: function (player: Player) { player.mods.undc -= this.undc }
});

// @ts-ignore: constructor function
eqp.reedhd = new Eqp({ id: 20029, name: 'Reed Hood', desc: 'A hat that covers the face of Zen monks made from woven reed. Wearing this doesn\'t necessarily make you a monk, though' + dom.dseparator, slot: 3, str: 25, aff: [4, 1, 7, 13, 2, 9, -5], cls: [3, 3, 3], stype: 3, dp: 28, dpmax: 28 });

// @ts-ignore: constructor function
eqp.ptchct = new Eqp({ id: 20030, name: 'Patchwork Coat', desc: 'Coat stitched together from patches of cloth of various sizes and thickness. Somewhat durable but looks desperate' + dom.dseparator, slot: 4, str: 14, stype: 3, aff: [4, 2, 1, 2, 2, 3, 3], cls: [1, 4, 4], dp: 40, dpmax: 40 });

// @ts-ignore: constructor function
eqp.ptchpts = new Eqp({ id: 20031, name: 'Patchwork Pants', desc: 'Crude attempt at pants, very baggy looking and somewhat uncomfortable to wear. Potential holes near stitch areas make your lower body shiver when it\'s windy' + dom.dseparator, slot: 7, str: 12, stype: 3, aff: [3, 2, 8, 4, 5, 5, 2], cls: [3, 5, 5], dp: 38, dpmax: 38 });

// @ts-ignore: constructor function
sld.bkl = new Eqp({ id: 30001, name: 'Buckler', desc: 'Tiny shield that is supposed to be strapped onto an arm. Low defence, but provides high mobility' + dom.dseparator, slot: 2, str: 5, aff: [2, 2, 2, 2, 2, 2, 2], cls: [2, 2, 2], stype: 3, dp: 36, dpmax: 36 });

// @ts-ignore: constructor function
sld.tge = new Eqp({ id: 30002, name: 'Targe', desc: 'Simple square shield with reinforced corners' + dom.dseparator, slot: 2, str: 9, aff: [4, 3, 3, 3, 3, 3, 3], cls: [3, 3, 4], stype: 3, dp: 38, dpmax: 38 });

// @ts-ignore: constructor function
sld.plt = new Eqp({ id: 30003, name: 'Pelta Shield', desc: 'Triangular shield composed of several layers of wood banded together, making it a little on the heavy side', slot: 2, str: 15, aff: [8, 6, 5, 4, 5, 3, 3], cls: [5, 5, 5], stype: 3, dp: 41, dpmax: 41 });

// @ts-ignore: constructor function
sld.qad = new Eqp({ id: 30004, name: 'Quad Shield', desc: '', slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.crc = new Eqp({ id: 30005, name: 'Circle Shield', desc: '', slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.rnd = new Eqp({ id: 30006, name: 'Round Shield', desc: '', slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.twr = new Eqp({ id: 30007, name: 'Tower Shield', desc: '', slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.spk = new Eqp({ id: 30008, name: 'Spiked Shield', desc: '', slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.kit = new Eqp({ id: 30009, name: 'Kite Shield', desc: '', slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.kit = new Eqp({ id: 30010, name: 'Casserole Shield', desc: '', slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.htr = new Eqp({ id: 30011, name: 'Heater Shield', desc: '', slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.ovl = new Eqp({ id: 30012, name: 'Oval Shield', desc: '', slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.knt = new Eqp({ id: 30013, name: 'Knight Shield', desc: '', rar: 4, slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.hpt = new Eqp({ id: 30014, name: 'Hoplite Shield', desc: '', rar: 4, slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.jrt = new Eqp({ id: 30015, name: 'Jazeraint Shield', desc: '', rar: 4, slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.drd = new Eqp({ id: 30016, name: 'Dread Shield', desc: '', rar: 4, slot: 2, str: 0, stype: 3 });

// @ts-ignore: constructor function
sld.stksld = new Eqp({ id: 30017, name: 'Stake Shield', desc: 'Not actually a shield, but a row of spiky wood stakes tightly packed together to form a square panel. It\'s a bit heavy' + dom.dseparator + '<span style="color:hotpink">Physical ATK +4</span><br>', slot: 2, str: 7, aff: [2, 2, 2, 2, 2, 2, 2], cls: [3, 3, 3], stype: 3, dp: 23, dpmax: 23,
  oneq: function (player: Player) { player.aff[0] += 4 },
  onuneq: function (player: Player) { player.aff[0] -= 4 }
});

// @ts-ignore: constructor function
acc.strawp = new Eqp({ id: 40001, name: 'Straw Pendant', desc: 'You made this yourself!' + dom.dseparator + '<span style=\'color:green\'><span style=\'color:lime\'> +50 </span> to max energy<br><span style="color: lime">SPD +1</span></span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.sata += 50; player.sat += 50; player.spda += 1 },
  onuneq: function (player: Player) { player.sata -= 50; player.sat -= 50; player.spda -= 1 },
  onGet: function () { if (acc.fmlim.have) { giveRcp(rcp.fmlim2); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.snch = new Eqp({ id: 40002, name: 'Sun Charm', desc: 'Little charm with a piece of power of the Sun imbued into it. It absorbs Sun energy' + dom.dseparator + '<span style=\'color:gold\'>Raises stats during day</span>', slot: 8, stype: 3, rar: 2,
  oneq: function () {
    if (flags.savestate === false) msg('You feel closer to the Sun..', 'gold')
  }
});

// @ts-ignore: constructor function
acc.mnch = new Eqp({ id: 40003, name: 'Moon Charm', desc: 'Little charm with a piece of power of the Moon imbued into it. It absorbs Moon energy' + dom.dseparator + '<span style=\'color:cyan\'>Raises stats during night</span>', slot: 8, stype: 3, rar: 2,
  oneq: function () {
    if (flags.savestate === false) msg('You feel closer to the Moon..', 'gold')
  }
});

// @ts-ignore: constructor function
acc.mstn = new Eqp({ id: 40004, name: 'Mana Stone', desc: 'Gem imbued with raw arcanic power', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.bstn = new Eqp({ id: 40005, name: 'Blood Stone', desc: 'Gem imbued with the power of blood', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.sstn = new Eqp({ id: 40006, name: 'Soul Stone', desc: 'Gem with a fraction of a soul trapped inside of it', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.srng = new Eqp({ id: 40007, name: 'Silver Ring', desc: 'Simple ring made of silver. It is used as a base for making enchanted accessories', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.grng = new Eqp({ id: 40008, name: 'Gold Ring', desc: 'Valuable ring made of gold. Has high vanity value and can be improved by setting gems into it', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.trrng = new Eqp({ id: 40009, name: 'Trinity', desc: 'Rings were given to the Knights in ancient times, as a symbol of loyalty. Strenghtens mind and body', slot: 8, stype: 3, rar: 3 });

// @ts-ignore: constructor function
acc.akh = new Eqp({ id: 40010, name: 'Ankh', desc: 'A symbol of life ☥', slot: 8, stype: 3, rar: 3 });

// @ts-ignore: constructor function
acc.gmph1 = new Eqp({ id: 40011, name: 'Titan Malachite', desc: 'Malachite with a Titan\'s soul bound inside. Slightly increases the power of direct attacks', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.gmph2 = new Eqp({ id: 40012, name: 'Talos Feldspar', desc: 'Feldspar imbued with the dark powers of Talos. Increases the power of direct attacks', slot: 8, stype: 3, rar: 3 });

// @ts-ignore: constructor function
acc.gmai1 = new Eqp({ id: 40013, name: 'Sylphid Topaz', desc: 'Topaz imbued with the power of the Sylphs. Slightly increases air affinity', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.gmai2 = new Eqp({ id: 40014, name: 'Djinn Amber', desc: 'Amber imbued with the power of Sylphs. Increases air affinity', slot: 8, stype: 3, rar: 3 });

// @ts-ignore: constructor function
acc.gmfr1 = new Eqp({ id: 40015, name: 'Salamander Ruby', desc: 'Ruby imbued with the power of the Salamanders. Slightly increases fire affinity', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.gmfr2 = new Eqp({ id: 40016, name: 'Ifrit Carnelian', desc: 'Carnelian imbued with the power of Ifrit. Increases fire affinity', slot: 8, stype: 3, rar: 3 });

// @ts-ignore: constructor function
acc.gmea1 = new Eqp({ id: 40017, name: 'Gnome Emerald', desc: 'Emerald imbued with the power of the Gnomes. Slightly increases earth affinity', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.gmea2 = new Eqp({ id: 40018, name: 'Dao Moonstone', desc: 'Moonstone imbued with the power of Dao. Increases earth affinity', slot: 8, stype: 3, rar: 3 });

// @ts-ignore: constructor function
acc.gmwt1 = new Eqp({ id: 40019, name: 'Undine Jasper', desc: 'Jasper imbued with the power of the Undines. Slightly increases water affinity', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.gmwt2 = new Eqp({ id: 40020, name: 'Marid Aquamarine', desc: 'Aquamarine imbued with the power of Marid. Increases water affinity', slot: 8, stype: 3, rar: 3 });

// @ts-ignore: constructor function
acc.gmhl1 = new Eqp({ id: 40021, name: 'Angel Pearl', desc: 'Pearl imbued with the power of the angels. Slightly increases light affinity', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.gmhl2 = new Eqp({ id: 40022, name: 'Seraphim Diamond', desc: 'Diamond with a seraph\'s soul bound inside. Increases light affinity', slot: 8, stype: 3, rar: 3 });

// @ts-ignore: constructor function
acc.gmdk1 = new Eqp({ id: 40023, name: 'Morlock Jet', desc: 'Jet stone sealed with Morlock\'s magical power. Slightly increases dark affinity', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.gmdk2 = new Eqp({ id: 40024, name: 'Berial Blackpearl', desc: 'Blackpearl with Berial\'s soul bound inside. Increases dark affinity', slot: 8, stype: 3, rar: 3 });

// @ts-ignore: constructor function
acc.wfng = new Eqp({ id: 40025, name: 'Wolf Fang Necklace', desc: 'Menacing fang of the wolf, in the form of a pendant. Wearing this can help to repell and scare away minor beasts' + dom.dseparator + '<span style="color:orange">Beast Class DEF +15</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.cmaff[1] += 15 },
  onuneq: function (player: Player) { player.cmaff[1] -= 15 },
  onGet: function () {
    if (!rcp.wfar.have) {
      let f = 0; for (let a in inv) if (inv[a].id === this.id) f++
      if (f >= 3) giveRcp(rcp.wfar)
    }
  }
});

// @ts-ignore: constructor function
acc.wfar = new Eqp({ id: 40026, name: 'Wolf Array', desc: 'Array composed of interlinked fangs of the wolf. Used by hunters as a mean of protection agains wildlife' + dom.dseparator + '<span style="color:orange">Beast Class DEF +30</span>', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.cmaff[1] += 30 },
  onuneq: function (player: Player) { player.cmaff[1] -= 30 }
});

// @ts-ignore: constructor function
acc.sshl = new Eqp({ id: 40027, name: 'Star Shell', desc: 'A little shell with a fraction of power of Space within it. It radiates incomprehencible energy when you touch it' + dom.dseparator + '<span style=\'color:gold\'>Raises stats+', slot: 8, stype: 3, rar: 2,
  oneq: function () { },
  onuneq: function () { }
});

// @ts-ignore: constructor function
acc.qill = new Eqp({ id: 40028, name: 'Quill', desc: 'Feather of a large bird, turned into a writing tool ' + dom.dseparator + '<span style="color:lime">AGL +5</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.agla += 5 },
  onuneq: function (player: Player) { player.agla -= 5 },
  onGet: function () {
    if (acc.bink.have) { giveRcp(rcp.mink); this.onGet = function () { } }
  }
});

// @ts-ignore: constructor function
acc.bink = new Eqp({ id: 40029, name: 'Black Ink', desc: 'Pitch black Ink, useful in writing. Stains left by it will never come off' + dom.dseparator + '<span style="color:lime">INT +3</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.inta += 3 },
  onuneq: function (player: Player) { player.inta -= 3 },
  onGet: function () {
    if (acc.qill.have) { giveRcp(rcp.mink); this.onGet = function () { } }
  }
});

// @ts-ignore: constructor function
acc.mink = new Eqp({ id: 40030, name: 'Magic Ink', desc: 'Glowing magic ink, used for writing magical and runic inscriptions. ' + dom.dseparator + '<span style="color:lime">INT +8</span><br><span style="color:lime">AGL +10</span>', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.inta += 8; player.agla += 10; },
  onuneq: function (player: Player) { player.inta -= 8; player.agla -= 10; }
});

// @ts-ignore: constructor function
acc.rfot = new Eqp({ id: 40031, name: 'Rabbit Foot', desc: 'Lucky charm made from a foot of a rabbit. Wearing this gives you a strange feeling of satisfaction' + dom.dseparator + '<span style="color:gold">LUCK +2</span>', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.luck += 2 },
  onuneq: function (player: Player) { player.luck -= 2 }
});

// @ts-ignore: constructor function
acc.sdl1 = new Eqp({ id: 40032, name: 'Straw Effigy', desc: 'Small handcrafted straw doll. Dolls of this type are used to bind with the souls of the living. Appropriate for Curses and Dark Magic manipulation' + dom.dseparator + '<span style="color:hotpink">Physical DEF +5</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.caff[0] += 5; },
  onuneq: function (player: Player) { player.caff[0] -= 5; },
  onGet: function () { if (acc.bdl1.have && acc.wdl1.have) { giveRcp(rcp.gdl1); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.lckcn = new Eqp({ id: 40033, name: 'Lucky Coin', desc: 'Special little coin, unlike any other. You have a feeling you should hold onto it' + dom.dseparator + '<span style="color:gold">LUCK +3</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.luck += 3; },
  onuneq: function (player: Player) { player.luck -= 3; },
  onGet: function () { if (acc.cfgn.have) { giveRcp(rcp.mnknk); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.cfgn = new Eqp({ id: 40034, name: 'Cat Figurine', desc: 'Small figurine of a cat. It eminates powerful energy' + dom.dseparator + '<span style="color:deeppink">Energy Effectiveness +5%</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.mods.sbonus += .05 },
  onuneq: function (player: Player) { player.mods.sbonus -= .05 },
  onGet: function () { if (acc.lckcn.have) { giveRcp(rcp.mnknk); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.mnknk = new Eqp({ id: 40035, name: 'Maneki-Neko', desc: 'Little statue of a Divine Cat holding a Coin. This treasure is rumored to bring luck and prosperity to its owner' + dom.dseparator + '<span style="color:gold">LUCK +4</span><br><span style="color:deeppink">Energy Effectiveness +10%</span>', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.luck += 4; player.mods.sbonus += .1; },
  onuneq: function (player: Player) { player.luck -= 4; player.mods.sbonus -= .1; }
});

// @ts-ignore: constructor function
acc.wdl1 = new Eqp({ id: 40036, name: 'Wood Effigy', desc: 'Small wooden doll with flexible joints. This type can be used, with Dark enchantment, to take control of living things.' + dom.dseparator + '<span style="color:crimson">Piercing DEF +5</span><br><span style="color:crimson">Edged DEF +5</span><br><span style="color:crimson">Blunt DEF +5</span>', ccls: [5, 5, 5], slot: 8, stype: 3,
  oneq: function (player: Player) { for (let afn = 0; afn < this.ccls.length; afn++)player.ccls[afn] += this.ccls[afn] },
  onuneq: function (player: Player) { for (let afn = 0; afn < this.ccls.length; afn++)player.ccls[afn] -= this.ccls[afn] },
  onGet: function () { if (acc.sdl1.have && acc.bdl1.have) { giveRcp(rcp.gdl1); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.gdl1 = new Eqp({ id: 40037, name: 'Soul Puppet', desc: 'Dolls that could be remotely controlled by one\'s soul. Employed by spies to infiltrate enemy lines unnoticed' + dom.dseparator + '<span style="color:crimson">Piercing DEF +4</span><br><span style="color:crimson">Edged DEF +4</span><br><span style="color:crimson">Blunt DEF +4</span><br><span style="color:thistle;text-shadow:blueviolet 0px 0px 5px">Dark RES +6</span><br><span style="color:royalblue;text-shadow:blueviolet 0px 0px 5px">Evil Class DEF +2</span><br><span style="color:hotpink">Physical DEF +3</span>', ccls: [4, 4, 4], slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.caff[0] += 3; player.caff[6] += 2; for (let afn = 0; afn < this.ccls.length; afn++)player.ccls[afn] += this.ccls[afn]; player.cmaff[3] += 6 },
  onuneq: function (player: Player) { player.caff[0] -= 3; player.caff[6] -= 2; for (let afn = 0; afn < this.ccls.length; afn++)player.ccls[afn] -= this.ccls[afn]; player.cmaff[3] -= 6 }
});

// @ts-ignore: constructor function
acc.rnsn = new Eqp({ id: 40038, name: 'Rain Stone', desc: 'This stone, eroded by years of rain, can actually mimic rain to fool plants and animals. For this reason, it\'s in high demand for horticultural use' + dom.dseparator + '', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.hndm = new Eqp({ id: 40039, name: 'Fey Hound Mane', desc: 'A tuft of a fey hound\'s mane, said to ward off evil. It raises resistance to heat and cold' + dom.dseparator + '', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.dcpe = new Eqp({ id: 40040, name: 'Deception Eye', desc: 'A mysterious gem. It feels like it\'s looking at something, but you can\'t really tell' + dom.dseparator + '', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.bdl1 = new Eqp({ id: 40041, name: 'Bone Doll', desc: 'A small doll carved from beast bone. It\'s a charm that protects the wearer from evil' + dom.dseparator + '<span style="color:thistle;text-shadow:blueviolet 0px 0px 5px">Dark RES +5</span><br><span style="color:royalblue;text-shadow:blueviolet 0px 0px 5px">Evil Class DEF +5</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.caff[6] += 5; player.cmaff[3] += 5 },
  onuneq: function (player: Player) { player.caff[6] -= 5; player.cmaff[3] -= 5; },
  onGet: function () { if (acc.sdl1.have && acc.wdl1.have) { giveRcp(rcp.gdl1); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.fssn = new Eqp({ id: 40042, name: 'Bonefish Spine', desc: 'A spine taken from a bonefish, which are still keen in undeath. It\'s said to raise spiritual awareness of the holder' + dom.dseparator + '', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.mpst = new Eqp({ id: 40043, name: 'Mortar and Pestle', desc: 'A basic stone bowl and a pounder used to mince and crush herbs, seeds, bones and other pharmaceutical oddities' + dom.dseparator + '<span style="color:deeppink">Alchemy EXP gain +5%</span><br><br><small style="color:deeppink">Alchemy quality:<span style="color:orange"> 1</span></small>', slot: 8, alchq: 1, stype: 3,
  oneq: function () { skl.alch.p += .05 },
  onuneq: function () { skl.alch.p -= .05 },
  onGet: function () { if (acc.mpst.have && acc.mshst.have && acc.mhhst) { giveRcp(rcp.alseto); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.vtmns = new Eqp({ id: 40044, name: 'Vitamins', desc: 'A bottle of powerful vitamins, which grant one\'s body incresed vitality' + dom.dseparator + '<span style="color:limegreen">Poison resist +5%</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.res.poison -= .05 },
  onuneq: function (player: Player) { player.res.poison += .05 },
  onGet: function () { if (acc.mdcag.have && acc.vtmns.have) { giveRcp(rcp.mdcbg); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.mdcag = new Eqp({ id: 40045, name: 'Adhesive Bandage', desc: 'Bandage, boiled in hot water and sterilized using herbs' + dom.dseparator + '<span style="color:chartreuse">Bleed resist +5%</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.res.bleed -= .05 },
  onuneq: function (player: Player) { player.res.bleed += .05 },
  onGet: function () { if (acc.mdcag.have && acc.vtmns.have) { giveRcp(rcp.mdcbg); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.mdcbg = new Eqp({ id: 40046, name: 'Medicated Bandage', desc: 'Sterile bandage soaked in strong medical solution' + dom.dseparator + '<span style="color:chartreuse">Bleed resist +8%</span><br><span style="color:limegreen">Poison resist +8%</span>', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.res.bleed -= .08; player.res.poison -= .08 },
  onuneq: function (player: Player) { player.res.bleed += .08; player.res.poison += .08 }
});

// @ts-ignore: constructor function
acc.mshst = new Eqp({ id: 40047, name: 'Retort', desc: 'Alchemical vessel used for distilling, important for vapor separation' + dom.dseparator + '<span style="color:deeppink">Alchemy EXP gain +10%</span><br><br><small style="color:deeppink">Alchemy quality:<span style="color:orange"> 1</span></small>', slot: 8, alchq: 1, stype: 3,
  oneq: function () { skl.alch.p += .1 },
  onuneq: function () { skl.alch.p -= .1 },
  onGet: function () { if (acc.mpst.have && acc.mshst.have && acc.mhhst) { giveRcp(rcp.alseto); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.mhhst = new Eqp({ id: 40048, name: 'Alembic', desc: 'Alchemical vessel used in distilling, especially useful for cooling' + dom.dseparator + '<span style="color:deeppink">Alchemy EXP gain +15%</span><br><br><small style="color:deeppink">Alchemy quality:<span style="color:orange"> 1</span></small>', slot: 8, alchq: 1, stype: 3,
  oneq: function () { skl.alch.p += .15 },
  onuneq: function () { skl.alch.p -= .15 },
  onGet: function () { if (acc.mpst.have && acc.mshst.have && acc.mhhst) { giveRcp(rcp.alseto); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.asfk = new Eqp({ id: 40049, name: 'Alchemical Flask', desc: 'A sealed flask with some vicious limegreen bubbling liquid moving inside. Opening this thing is a very bad idea' + dom.dseparator + '<span style="color:chartreuse">Damage reduction +3%</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.res.ph -= .03 },
  onuneq: function (player: Player) { player.res.ph += .03 }
});

// @ts-ignore: constructor function
acc.alseto = new Eqp({ id: 40050, name: 'Basic Alchemy Set', desc: 'Wide variety of aberrant glassware and precision tools for all types of entry level alchemy-based manipulations. A necessity for making basic medicine, pills, poisons, elixirs and everything inbetween' + dom.dseparator + '<span style="color:deeppink">Alchemy EXP gain +50%</span><br><br><small style="color:deeppink">Alchemy quality:<span style="color:orange"> 2</span></small><br><br>', slot: 8, alchq: 2, stype: 3, int: 15, rar: 2,
  oneq: function () { skl.alch.p += .5 },
  onuneq: function () { skl.alch.p -= .5 }
});

// @ts-ignore: constructor function
acc.csfk = new Eqp({ id: 40051, name: 'Corrupt Flask', desc: 'Glass container with an evil essence trapped inside of it. It is trying to break free' + dom.dseparator + '<span style="color:thistle;text-shadow:blueviolet 0px 0px 5px">Dark RES +10</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.caff[6] += 10 },
  onuneq: function (player: Player) { player.caff[6] -= 10 }
});

// @ts-ignore: constructor function
acc.gsfk = new Eqp({ id: 40052, name: 'Plague Flask', desc: 'Locked vessel containing a volatile tissue sample from the plague beast. Should be handled with extreme care and must not be unsealed under any circumstances' + dom.dseparator + '<span style="color:chartreuse">Damage reduction +4%</span><br><span style="color:thistle;text-shadow:blueviolet 0px 0px 5px">Dark RES +35</span>', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.res.ph -= .04; player.caff[6] += 35 },
  onuneq: function (player: Player) { player.res.ph += .04; player.caff[6] -= 35 }
});

// @ts-ignore: constructor function
acc.jln1 = new Eqp({ id: 40053, name: 'Life Jelly', desc: 'Concentrated red jelly. Improves life force' + dom.dseparator + '<span style="color:chartreuse">MAX HP +400</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.hpa += 400 },
  onuneq: function (player: Player) { player.hpa -= 400 }
});

// @ts-ignore: constructor function
acc.jln2 = new Eqp({ id: 40054, name: 'Stamina Jelly', desc: 'Concentrated green jelly. Improves stamina' + dom.dseparator + '<span style="color:chartreuse">MAX SAT +100</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.sat += 100; player.sata += 100; },
  onuneq: function (player: Player) { player.sat -= 100; player.sata -= 100; }
});

// @ts-ignore: constructor function
acc.jln3 = new Eqp({ id: 40055, name: 'Vital Jelly', desc: 'Concentrated blue jelly. Improves metabolism' + dom.dseparator + '<span style="color:chartreuse">SPD +2</span><br><span style="color:crimson">Energy Consumtion +0.2\/s</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.spda += 2; player.mods.sdrate += .2 },
  onuneq: function (player: Player) { player.spda -= 2; player.mods.sdrate -= .2 }
});

// @ts-ignore: constructor function
acc.jln4 = new Eqp({ id: 40056, name: 'Grand Gelatin', desc: 'proc', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.spda += 2; player.mods.sdrate += .2 },
  onuneq: function (player: Player) { player.spda -= 2; player.mods.sdrate -= .2 }
});

// @ts-ignore: constructor function
acc.mstone = new Eqp({ id: 40057, name: 'Moon Stone', desc: 'proc', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.sstone = new Eqp({ id: 40058, name: 'Sun Stone', desc: 'proc', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.cstone = new Eqp({ id: 40059, name: 'Celestial Stone', desc: 'proc', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.coring = new Eqp({ id: 40060, name: 'Coin Ring', desc: 'Golden ring whith runic engraving of a coin on it. Rumored to attract wealth ' + dom.dseparator + '<span style="color:orange">Defeated enemies occasionally drop money</span>', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.mods.enmondren += .01 },
  onuneq: function (player: Player) { player.mods.enmondren -= .01 }
});

// @ts-ignore: constructor function
acc.dticket = new Eqp({ id: 40061, name: 'Discount Ticket', desc: 'Small ticket that allows you to buy things for cheaper, if you show it to the shopkeeper. Sometimes given to random customers for promotional purposes ' + dom.dseparator + '<span style="color:thistle">Shop price reduction -1%</span>', slot: 8, stype: 3,
  onGet: function () { let b = 0; for (let a in inv) if (inv[a].id === this.id) b++; if (b >= 5) giveRcp(rcp.dcard1) },
  oneq: function (player: Player) { player.mods.infsrate -= .01; recshop(); },
  onuneq: function (player: Player) { player.mods.infsrate += .01; recshop(); }
});

// @ts-ignore: constructor function
acc.dcard1 = new Eqp({ id: 40062, name: 'Discount Card', desc: 'A card given to the most loyal customers in popular shops' + dom.dseparator + '<span style="color:thistle">Shop price reduction -5%</span>', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.mods.infsrate -= .05; recshop(); },
  onuneq: function (player: Player) { player.mods.infsrate += .05; recshop(); }
});

// @ts-ignore: constructor function
acc.rgreed = new Eqp({ id: 40063, name: 'Ring of Greed', desc: 'Expensive ring employed by rich merchants and gamblers. Makes you seem like a symbol of authority, brings tremendous luck and helps during negotiations' + dom.dseparator + '<span style="color:orange">Defeated enemies sometimes drop money</span><br><span style="color:gold">+15% dropped money</span><br><span style="color:thistle">Shop price reduction -10%</span>', slot: 8, stype: 3, rar: 3,
  oneq: function (player: Player) { player.mods.infsrate -= .1; player.mods.enmondren += .03; recshop(); },
  onuneq: function (player: Player) { player.mods.infsrate += .1; player.mods.enmondren -= .03; recshop(); }
});

// @ts-ignore: constructor function
acc.medl1 = new Eqp({ id: 40064, name: 'Moon Medal', desc: 'proc', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.medl2 = new Eqp({ id: 40065, name: 'Little Light Medal', desc: 'proc', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.medl3 = new Eqp({ id: 40066, name: 'Moonlight Medal', desc: 'proc', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.medl4 = new Eqp({ id: 40067, name: 'White Boar Medal', desc: 'proc', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.medl5 = new Eqp({ id: 40068, name: 'Jade Skin Medal', desc: 'proc', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.medl6 = new Eqp({ id: 40069, name: 'White Jade Medal', desc: 'proc', slot: 8, stype: 3, rar: 2 });

// @ts-ignore: constructor function
acc.coindct = new Eqp({ id: 40070, name: 'Coin of Deceit', desc: 'Crooked tainted coin with seemingly evil aura floating about it' + dom.dseparator + '<span style="color:royalblue">Crit Chance +3%</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.mods.crflt += .03; },
  onuneq: function (player: Player) { player.mods.crflt -= .03; }
});

// @ts-ignore: constructor function
acc.slchth = new Eqp({ id: 40071, name: 'Silencing Sheath', desc: 'Light conciealed sheath for storing small knives and other assassin tools. Unconspicous and easy to use, it is favoured by the agents of the Underworld' + dom.dseparator + '<span style="color:mediumpurple">Crit Damage +15%</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.mods.cpwr += .15; },
  onuneq: function (player: Player) { player.mods.cpwr -= .15; }
});

// @ts-ignore: constructor function
acc.rmedlon = new Eqp({ id: 40072, name: 'Ruin Medallion', desc: 'Evil Medallion imbued with the curse of misforture. Brings terrible luck to everyone around its bearer' + dom.dseparator + '<span style="color:royalblue">Crit Chance +6%</span>', slot: 8, stype: 3, rar: 2,
  oneq: function (player: Player) { player.mods.crflt += .06; },
  onuneq: function (player: Player) { player.mods.crflt -= .06; }
});

// @ts-ignore: constructor function
acc.mirgmirr = new Eqp({ id: 40073, name: 'Mirage Mirror', desc: 'Mirror of clouded darkness. It bends light around you.' + dom.dseparator + '<span style="color:royalblue">Reduces enemy aggression<br>Auto Dodge +10%</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.mods.ddgmod += .1; },
  onuneq: function (player: Player) { player.mods.ddgmod -= .1; }
});

// @ts-ignore: constructor function
acc.aihomnt = new Eqp({ id: 40074, name: 'Airia Hair Ornament', desc: 'An ornament made of light magic ore. Wraps the wearer with a thin magic barrier' + dom.dseparator + '<span style="color:royalblue">Reduces enemy aggression<br>Magic DEF +15</span>', slot: 8, stype: 3,
  oneq: function () { },
  onuneq: function () { }
});

// @ts-ignore: constructor function
acc.gourd1 = new Eqp({ id: 40075, name: 'Gourd', desc: 'One of the oldest crop plants in existence. You can use it to store water... or sake' + dom.dseparator + '<span style="color:chartreuse">Max SAT +150</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.sat += 150; player.sata += 150; },
  onuneq: function (player: Player) { player.sat -= 150; player.sata -= 150; }
});

// @ts-ignore: constructor function
acc.stupa = new Eqp({ id: 40076, name: 'Stupa', desc: 'Stupa are long boards placed next to graves to pay respects to the dead. They are usually to be written with an ink brush' + dom.dseparator + '<span style="color:ghostwhite;text-shadow:0px 0px 5px royalblue">Keeps your soul in the mortal world</span><br><span style="color:ghostwhite;text-shadow:0px 0px 5px royalblue">+2% Chance To Avoid Death</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.res.death -= .02 },
  onuneq: function (player: Player) { player.res.death += .02 }
});

// @ts-ignore: constructor function
acc.wpeny = new Eqp({ id: 40077, name: 'Penny of Wealth', desc: 'An extra shiny penny, that looks like it\'s made of gold. It probably isn\'t, but you feel richer just by holding it' + dom.dseparator + '<span style="color:orange">Picking a coin gives you an extra coin<br><span style="color:gold">Greed EXP gain +20%</span></span>', slot: 8, stype: 3,
  oneq: function (player: Player) { skl.gred.p += .2; player.mods.wthexrt++ },
  onuneq: function (player: Player) { skl.gred.p -= .2; player.mods.wthexrt-- }
});

// @ts-ignore: constructor function
acc.rngsgn = new Eqp({ id: 40078, name: 'Signet Ring', desc: 'A gold and silver ring with a wide stamp attached to the band. A long time ago, the stamp was legible, but now the pattern is too worn to discern its former use', slot: 8, stype: 3 });

// @ts-ignore: constructor function
acc.fmlim = new Eqp({ id: 40079, important: true, name: 'Family Heirloom', desc: 'A treasure passed down in your family. This plain looking medalion doesn\'t look anything special, it appears incomplete with an empty socket in the center. You fail to see any value in this piece of junk' + dom.dseparator + '<span style="color:chartreuse">MAX HP +2</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.hpa += 2 },
  onuneq: function (player: Player) { player.hpa -= 2 },
  onGet: function () { if (acc.strawp.have) { giveRcp(rcp.fmlim2); this.onGet = function () { } } }
});

// @ts-ignore: constructor function
acc.pbrs = new Eqp({ id: 40080, name: 'Pet Brush', desc: 'Special brush designed for tending to fur of the animals. Cats especially enjoy being brushed by this tool' + dom.dseparator + '<span style="color:deeppink">Petting EXP gain +200%</span>', slot: 8, stype: 3,
  oneq: function () { skl.pet.p += 2; },
  onuneq: function () { skl.pet.p -= 2; }
});

// @ts-ignore: constructor function
acc.clrpin = new Eqp({ id: 40081, name: 'Clover Pin', desc: 'Small golden pin in a shape of a clover. Senior gamblers wear these pins to display their prestige and status' + dom.dseparator + '<span style="color:gold">Minor chance for an enemy dropped item to duplicate</span>', slot: 8, stype: 3, rar: 4,
  oneq: function (player: Player) { player.mods.lkdbt += .01; },
  onuneq: function (player: Player) { player.mods.lkdbt -= .01; }
});

// @ts-ignore: constructor function
acc.prtckst = new Eqp({ id: 40082, name: 'Portable Cooking Set', desc: 'Box-sized kit containing every crucial cooking utencil you may need for comfortable and effortless foodmaking session anywhere at any time, complimented with variously sized knives, cutting boards, pots and even everlasting fire burner' + dom.dseparator + '<span style="color:deeppink">Cooking EXP gain +200%</span><br><span style="color:springgreen">Allows cooking everywhere</span>', slot: 8, stype: 3, rar: 3,
  oneq: function (player: Player) { skl.cook.p += 2; player.mods.ckfre += 1 },
  onuneq: function (player: Player) { skl.cook.p -= 2; player.mods.ckfre -= 1 }
});

// @ts-ignore: constructor function
acc.ubrlc = new Eqp({ id: 40083, name: 'Umbrella', desc: 'Light umbrella with a cloud pattern. Young masters and ladies carry these to display their carefree nature' + dom.dseparator + '<span style="color:cyan;background-color:blue">Prevents you from getting rained on</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.mods.rnprtk += 1; },
  onuneq: function (player: Player) { player.mods.rnprtk -= 1; }
});

// @ts-ignore: constructor function
acc.sltbg = new Eqp({ id: 40084, name: 'Bag of Salt', desc: 'Little canvas bag filled with salt. Commoners believe that spreading salt can repel evil, so you can keep some on yourself for protection' + dom.dseparator + '<span style="color:tomato;text-shadow:blueviolet 0px 0px 5px">Undead Class DEF +12</span><br><span style="color:tomato;text-shadow:blueviolet 0px 0px 5px">Undead Class ATK +8</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.cmaff[2] += 12; player.maff[2] += 8 },
  onuneq: function (player: Player) { player.cmaff[2] -= 12; player.maff[2] -= 8 }
});

// @ts-ignore: constructor function
acc.chlsbd = new Eqp({ id: 40085, name: 'Chalice', slot: 8, stype: 3,
  desc: function (x: any, y: any) {
    return '<div style="color:red">Collected blood: <br><span>0ml</span><span style="display:inline-table;width:130px;border:1px solid darkgrey;margin: 7px;background:linear-gradient(90deg,#690000,red)"><span style="display:block;background-color:black;float:right;width:' + (100 - x.data.bld / x.data.bldmax * 100) + '%">　</span></span><span>' + x.data.bldmax + 'ml</span></div>'
  },
  onKill: function (x: any, y: any) { if ((x.type === 1 || x.type === 0 || x.type === 5) && x.blood) { if (y.data.bld + x.blood * 5 > y.data.bldmax) y.data.bld = y.data.bldmax; else y.data.bld += x.blood * 5 } },
  oneq: function () { checksd.push({ f: this.onKill, o: this }) },
  onuneq: function () { checksd.splice(checksd.indexOf({ f: this.onKill, o: this }), 1) }
});

// @ts-ignore: constructor function
acc.otpin = new Eqp({ id: 40086, name: 'Sword Medal', desc: 'Wearable ornament in the shape of a sword. Even if ranking the lowest, it serves as a proof of one\'s affiliation with dojo and martial arts in general' + dom.dseparator + '<span style="color:magenta"> EXP Gain +25%<br>All masteries EXP Gain +10%</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { skl.unc.p += .1; skl.srdc.p += .1; skl.knfc.p += .1; skl.axc.p += .1; skl.plrmc.p += .1; skl.stfc.p += .1; skl.bwc.p += .1; skl.hmrc.p += .1; player.exp_t += .25 },
  onuneq: function (player: Player) { skl.unc.p -= .1; skl.srdc.p -= .1; skl.knfc.p -= .1; skl.axc.p -= .1; skl.plrmc.p -= .1; skl.stfc.p -= .1; skl.bwc.p -= .1; skl.hmrc.p -= .1; player.exp_t -= .25 }
});

// @ts-ignore: constructor function
acc.fmlim2 = new Eqp({ id: 40087, important: true, name: 'Family Heirloom+', desc: 'You reinforced your family pendant\'s string with straw to prevent possible breaking. It looks even more lame like this' + dom.dseparator + '<span style="color:chartreuse">MAX HP +5<br>Max SAT +25<br>SPD +1</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.hpa += 5; player.sata += 25; player.spda += 1 },
  onuneq: function (player: Player) { player.hpa -= 5; player.sata -= 25; player.spda -= 1 }
});

// @ts-ignore: constructor function
acc.gpin = new Eqp({ id: 40088, name: 'Fighter Insignia', desc: 'Ring tempered by unending fighter spirit, was formerly owned by a rookie knight' + dom.dseparator + '<span style="color:chartreuse">STR +20<br>AGL +5</span>', slot: 8, stype: 3,
  oneq: function (player: Player) { player.stra += 20; player.agla += 5 },
  onuneq: function (player: Player) { player.stra -= 20; player.agla -= 5 }
});

// @ts-ignore: constructor function
acc.ndlb = new Eqp({ id: 40089, name: 'Wooden Needle', desc: 'Very primitive needle crafted from tough wood. Despite its simplicity, the craftsmanship is quiet nice' + dom.dseparator + '<span style="color:magenta">Tailoring EXP Gain +10%</span><br><br><small style="color:deeppink">Tailoring quality:<span style="color:orange"> 1</span></small>', slot: 8, tlrq: 1, stype: 3,
  oneq: function () { skl.tlrng.p += .1 },
  onuneq: function () { skl.tlrng.p -= .1 }
});

/*Orlandu - "Actonite containing a fragment of Orlandu's skeleton"
Ogimus - "Amethyst containing Ogmious the Guardian's soul"
Balvus - "Chiastrite containing the ashes of Balvus"
Beowulf - "Moon Zircon"
Sigguld - "Fire agate with the soul of Sigguld the Dragoon"
Altema - "Garnet containing Altema the Fallen's spirit"
Haeralis - "Star sapphire with the power of Haeralis the Brave"
Orion - "Black coral holding the hair of Orion the Beast"
Iocus - "Lazurite containing St. Iocus's prayer"
Trinity - "Jade containing the Nordic holy spirits"
Dragonite - "Serpentine containing a dragon's power"
Demonia - "Blood opal containing the blood of devils"

suffering
resentment
*/

////dss////
wpn.stk1.dss = [{ item: item.wdc, amount: 2, q: 1.5, max: 5 }]
wpn.knf1.dss = [{ item: item.wdc, amount: 1, q: 1, max: 2 }]
item.fsh1.dss = [{ item: item.fsh2, amount: 1 }]
eqp.bnd.dss = eqp.pnt.dss = eqp.brc.dss = eqp.vst.dss = [{ item: item.cclth, amount: 1, q: .5, max: 2 }]
eqp.tnc.dss = [{ item: item.cclth, amount: 2 }]
item.dfish.dss = [{ item: item.fbait1, amount: 1, q: .75, max: 3 }]
item.cclth.dss = [{ item: item.thrdnl, amount: 1, q: 1, max: 2 }]
item.dmice1.dss = [{ item: item.sbone, amount: 1, q: .6, max: 3 }]
item.dbdc1.dss = [{ item: item.sbone, amount: 1, q: .5, max: 2 }]
