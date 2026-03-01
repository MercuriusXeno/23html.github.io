import { item, dom, global, effect, skl, inv, wpn, eqp, sld, acc, furniture, home, furn, sector, ttl, chss, rcp, timers, area, creature, time, gameText, flags } from '../state';
import { HOUR } from '../constants';
import { random, rand, randf } from '../random';
import { select, findbyid, z_bake } from '../utils';
import { appear } from '../dom-utils';
import { dumb, tattack } from '../game/combat';
import { smove, inSector, area_init } from '../game/movement';
import { canRead } from '../game/utils-game';
import { giveItem, removeItem } from '../game/inventory';
import { giveWealth, spend } from '../game/economy';
import { giveSkExp, giveExp, giveRcp } from '../game/progression';
import { msg, _msg, msg_add } from '../ui/messages';
import { giveEff, removeEff } from '../ui/effects';
import { dscr } from '../ui/descriptions';
import { chs, activatef } from '../ui/choices';
import { reduce } from '../ui/inventory';
import { update_d } from '../ui/stats';
import { ontick } from '../systems/loop';
import { giveFurniture } from '../game/inventory';

// ==========================================================================
// Item constructor + factory functions + instances
// ==========================================================================

function Item(this: any, cfg: any) {
  this.name = 'dummy';
  this.desc = '';
  this.eff = [];
  this.data = { dscv: false };
  this.amount = 0;
  this.type = 1;
  this.stype = 1;
  this.rar = 1;
  this.new = false;
  this.have = false;
  this.important = false;
  this.onGet = function (_player: any) { };
  this.use = function (_player: any) { };
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}

// --- Item factory helpers ---

function foodItem(opts: any) {
  let stat = opts.stat || 'fooda';
  let glt = opts.glt || 1;
  let poisonChance = opts.poison || 0;
  let drunk = opts.drunk || null;
  let drka = opts.drka || 0;
// @ts-ignore: constructor function
  let it = new Item({
    id: opts.id,
    name: opts.name,
    val: opts.val,
    desc: opts.desc + dom.dseparator + 'Restores<span style=\'color:lime\'> ' + opts.val + ' </span>energy',
    stype: 4,
    rar: opts.rar || 1,
    use: function (player: any) {
      if (poisonChance > 0 && random() < poisonChance) {
        if (effect.fpn.active === false) giveEff(player, effect.fpn, rand(15, 35));
        else effect.fpn.duration += rand(5, 25);
      }
      player.sat + this.val > player.satmax ? player.sat = player.satmax : player.sat += this.val;
      skl.glt.use(glt);
      global.stat[stat]++;
      if (drka) giveSkExp(skl.drka, drka);
      if (drunk) {
        global.stat.foodal++;
        if (effect.drunk.active === false) giveEff(player, effect.drunk, drunk.dur);
        else effect.drunk.duration += drunk.add;
      }
      this.amount--;
      dom.d5_3_1.update();
      msg('Restored ' + this.val + ' energy', 'lime');
    }
  });
  if (opts.rot) it.rot = opts.rot;
  if (opts.onChange) it.onChange = opts.onChange;
  if (opts.onGet) it.onGet = opts.onGet;
  item[opts.key] = it;
  return it;
}

function healItem(opts: any) {
  let potion = opts.potion || false;
// @ts-ignore: constructor function
  let it = new Item({
    id: opts.id,
    name: opts.name,
    val: opts.val,
    desc: opts.desc + dom.dseparator + 'Restores<span style=\'color:lime\'> ' + opts.val + ' </span>health',
    stype: 4,
    rar: opts.rar || 1,
    use: function (player: any) {
      player.hp + this.val > player.hpmax ? player.hp = player.hpmax : player.hp += this.val;
      if (potion) global.stat.potnst++;
      global.stat.medst++;
      this.amount--;
      dom.d5_1_1.update();
      msg('Restored ' + this.val + ' hp', 'lime');
    }
  });
  if (opts.onGet) it.onGet = opts.onGet;
  item[opts.key] = it;
  return it;
}

function expItem(opts: any) {
// @ts-ignore: constructor function
  let it = new Item({
    id: opts.id,
    name: opts.name,
    desc: opts.desc,
    stype: 4,
    rar: opts.rar || 1,
    use: function () {
      giveExp(opts.exp, true, true, true);
      global.stat.plst++;
      global.stat.medst++;
      if (opts.extra) opts.extra();
      this.amount--;
    }
  });
  item[opts.key] = it;
  return it;
}

// @ts-ignore: constructor function
item.rcs = new Item({ id: 3000, name: 'Reality shot', desc: 'Amplifies surrounding awareness and perception senses', stype: 4, rar: 3,
  use: function () {
    msg('placeholder');
  }
});

healItem({ key: 'hrb1', id: 3001, name: 'Cure Grass', val: 7, desc: 'Herb with minor healing properties. Has to be processed before use. Can somewhat speed up recovery of tiny cuts and bruises if applied directly',
  onGet: function () {
    if (this.amount >= 50) { giveRcp(rcp.hlstw); this.onGet = function () { } }
  }
});

// @ts-ignore: constructor function
item.atd1 = new Item({ id: 3002, name: 'Herbal Antidote', desc: 'Bundle of certain common herbs, mixed together. Tastes incredibly bitter, but helps to detoxify blood from containments' + dom.dseparator + '<span style=\'color:lime\'> Neautralizes the effects of weak poisons </span>', stype: 4,
  use: function () {
    global.stat.medst++
    if (effect.psn.active === true) { if (effect.psn.duration - 30 <= 0) { removeEff(effect.psn); msg('You feel better', 'lime') } else { effect.psn.duration -= 30; msg('You feel a little better', 'lightgreen') } } else msg('Tastes like medicine..', 'lightblue');
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.psnwrd = new Item({ id: 3003, name: 'Poison Ward', desc: 'Solution developed to protect residents from diseases during times of plague' + dom.dseparator + '<span style=\'color:lime\'> Grants invulnerability to poisons for a few hours </span>', stype: 4, rar: 2,
  use: function (player: any) {
    global.stat.medst++
    if (effect.psnwrd.active === false) giveEff(player, effect.psnwrd, 600);
    else effect.psnwrd.duration = 600;
    this.amount--;
  }
});

healItem({ key: 'hlpd', id: 3004, name: 'Low-grade Healing Powder', val: 16, desc: 'Finely crushed cure grass. Used as a base to make weak medicine' });

// @ts-ignore: constructor function
item.smm = new Item({ id: 3005, name: 'Stomach Medicine', desc: 'Mixture of ginger, bittervine,  and other herbs. Destroys toxins in one\'s body' + dom.dseparator + '<span style=\'color:lime\'> Alliviates food poisoning </span>', stype: 4,
  use: function () {
    global.stat.medst++
    if (effect.fpn.active === true) { if (effect.fpn.duration - 30 <= 0) { removeEff(effect.fpn); msg('You feel better', 'lime') } else { effect.fpn.duration -= 30; msg('You feel a little better', 'lightgreen') } } else msg('Tastes like medicine..', 'lightblue');
    this.amount--;
  }
});

expItem({ key: 'sp1', id: 3006, name: 'Low-grade Spirit Pill', desc: 'Tiny cheap spirit pill, made from condensed Ki. Lowest type, given to weak people and children to nourish their bodies.' + dom.dseparator + '<span style=\'color:orange\'> Grants +500 EXP </span>', exp: 500 });

expItem({ key: 'sp2', id: 3007, name: 'Mid-grade Spirit Pill', desc: 'Small cheap spirit pill, made from condensed Ki. Developed to help young martial artists to go through their training' + dom.dseparator + '<span style=\'color:orange\'> Grants +2500 EXP </span>', exp: 2500 });

expItem({ key: 'sp3', id: 3008, name: 'High-grade Spirit Pill', desc: 'Small spirit pill, made from condensed Ki. Given to young warriors as energy supplement' + dom.dseparator + '<span style=\'color:orange\'> Grants +15000 EXP </span>', exp: 15000 });

// @ts-ignore: constructor function
item.lsrd = new Item({ id: 3009, name: 'Life Shard', desc: 'A fragment of living energy, trapped within a crystallic shell. Absorbing these slightly increases lifespan' + dom.dseparator + '<span style=\'color:hotpink\'> Increases HP by +2 permanently </span>', stype: 4,
  use: function (player: any) {
    player.hpmax += 2;
    player.hp += 2;
    player.hpa += 2;
    dom.d5_1_1.update();
    msg('HP increased by +2 permanently', 'hotpink')
    this.amount--;
  }
});

healItem({ key: 'hptn1', id: 3010, name: 'Lesser Healing Potion', val: 50, desc: 'Weakest healing potion you can possibly find. Nearly useless for actual healing, but can act as a headache reliever', potion: true });

// @ts-ignore: constructor function
item.lckl = new Item({ id: 3011, name: 'Lucky Clover', desc: 'Clover of the rare breed. Whoever is able to find even one will be blessed by the Gods of Luck' + dom.dseparator + '<span style="color: red">L</span><span style="color: orange">U</span><span style="color: gold">C</span><span style="color: YELLOW">K +1</span>', stype: 4, rar: 4,
  onGet: function () {
    if (this.amount >= 7) { giveRcp(rcp.clrpin); this.onGet = function () { } }
  },
  use: function (player: any, x: any) {
    player.luck += 1;
    msg('Your Luck Increases!', 'gold');
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.wstn1 = new Item({ id: 3012, name: 'Grey Whetsone', desc: 'Cheap and crude piece of whetstone. Not nearly good enough to maintain the life of a weapon, you can at least scrap off dirt and blood with it' + dom.dseparator + '<span style="color: lightgreen">Repairs equipped Weapon for <span style="color: lime">+2 DP</span></span>', stype: 4,
  use: function (player: any, x: any) {
    if (player.eqp[0].id === 10000) msg('Repair what?...', 'lightgrey');
    else {
      player.eqp[0].dp + 2 >= player.eqp[0].dpmax ? player.eqp[0].dp = player.eqp[0].dpmax : player.eqp[0].dp += 2;
      msg('You\'ve repaired ' + player.eqp[0].name + ' slightly', 'yellow');
      this.amount--;
    }
  }
});

// @ts-ignore: constructor function
item.bdgh = new Item({ id: 3013, name: 'Bandage', desc: 'Clean piece of thin sturdy cloth, perfect for wrapping and securing open wounds' + dom.dseparator + '<span style="color:lime">Somewhat stops bleeding</span>', stype: 4,
  use: function (player: any) {
    if (!effect.bled.active) { msg('You\'re not bleeding', 'orange'); return }
    let f = findbyid(player.eff, effect.bled.id);
    if (f.duration - 20 <= 0) removeEff(f, f.target);
    else f.duration -= 20;
    msg("You bandage your wounds", 'lime');
    this.amount--;
  },
  onGet: function () {
    if (this.amount >= 5) { giveRcp(rcp.mdcag); this.onGet = function () { } }
  }
});

// @ts-ignore: constructor function
item.amshrm = new Item({ id: 3014, name: 'Asura Mushroom', desc: 'The ultimate mushroom of the mushroom world. Eating it makes you feel a mysterious kind of vitality' + dom.dseparator + '<span style="color: springgreen">Permanently increases STR by +5</span>', stype: 4, rar: 4,
  use: function (player: any, x: any) {
    player.stra += 5;
    msg('You feel the surge of strength!', 'crimson');
    msg('STR +5!', 'lime');
    player.stat_r();
    update_d();
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.akhrb = new Item({ id: 3015, name: 'Aspha Herb', desc: 'Diet-oriented vegetable with misleading effect. It was such a terrible taste and bitter texture that no one would willingly eat them' + dom.dseparator + '<span style="color: orange">Makes you feel bad</span>', stype: 4, rar: 2,
  use: function (player: any, x: any) {
    if (this.disabled !== true) {
      this.disabled = true;
      if (random() < .005) { msg('You managed to consume it', 'lime'); giveSkExp(skl.glt, rand(100, (355 * (skl.glt.lvl * .2 + 1)))); player.sat *= .2; this.amount--; } else { msg(select(['You retch..', 'You feel like vomiting..', 'You feel sick..', 'Your insides turn just by looking at this thing..', 'You immidiately spit it out..', 'Your body rejects this..', 'Your body screams..']), 'grey') } setTimeout(() => { this.disabled = false }, 200);
    }
  }
});

// @ts-ignore: constructor function
item.cndl = new Item({ id: 3016, name: 'Candle', desc: 'A tall wax candle, made to burn for a very long time', stype: 4,
  use: function (player: any, x: any) {
    if (!effect.cdlt.active) giveEff(player, effect.cdlt);
    else effect.cdlt.duration = 360;
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.incsk = new Item({ id: 3017, name: 'Incense Stick', desc: 'A stick of aromatic incense. It calms your soul and mind' + dom.dseparator + '<span style="color: skyblue">Doubles meditation gain<br>Doubles cultivation gain</span>', stype: 4,
  use: function (player: any, x: any) {
    if (effect.incsk.active === true) effect.insck.duration = 600;
    else giveEff(player, effect.incsk);
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.sp0a = new Item({ id: 3018, name: 'Spirit Opening Powder', desc: 'Powder refined from blood of the wyrm. Has potential to improve internal energy' + dom.dseparator + '<span style=\'color:orange\'> Grants +95000 EXP </span><br><span style=\'color:deeppink\'>EXP Gain +1%</span>', stype: 4, rar: 2,
  use: function (player: any) {
    global.stat.medst++
    giveExp(95000, true, true, true);
    player.exp_t += .01;
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.smkbmb = new Item({ id: 3019, name: 'Smoke Bomb', desc: 'Pellets that release thick smog when crushed. Can create a smokescreen to help you escape from danger' + dom.dseparator + '<span style=\'color:springgreen\'>Bypasses current enemy</span>', stype: 4,
  use: function () {
    if (flags.civil === true && flags.btl === false) { msg('You\'re not in combat!', 'red'); return }
    if (global.current_z.size === 1 || global.current_z.size === 0 || global.current_z.isboss) { msg('You can\'t pass this enemy!', 'red'); return }
    else {
      clearInterval(timers.btl); clearInterval(timers.btl2); msg('*Puff*', 'black', null, null, 'lightgrey'); flags.smkactv = true;
      global.current_z.size--;
      area_init(global.current_z);
      dom.d7m.update();
      this.amount--;
    }
  }
});

// @ts-ignore: constructor function
item.svial1 = new Item({ id: 3020, name: 'Skeleton Vial', desc: 'Summons a lvl 10 Skeleton', stype: 4,
  use: function () {
    if (flags.civil === true && flags.btl === false) {
      if (flags.sleepmode || flags.rdng || flags.isshop || flags.busy || flags.work) { msg('Unable to summon!', 'red'); return }
      let ta = new area._ctor();
      ta.id = -1
      ta.name = 'Somewhere';
      ta.pop = [{ crt: creature.skl, lvlmin: 10, lvlmax: 10, c: 1 }];
      ta.protected = true;
      ta.onEnd = function () { area_init(area.nwh); flags.civil = true; flags.btl = false; };
      flags.civil = false;
      flags.btl = true;
      ta.size = 1;
      z_bake(ta);
      area_init(ta);
      dom.d7m.update();
      msg('The creature arises from the ground!', 'white', null, null, 'red')
      this.amount--;
    } else msg('You\'re already in a battle!', 'red')
  }
});

// @ts-ignore: constructor function
item.mpwdr = new Item({ id: 3021, name: 'Monster Powder', desc: 'Dried and grounded sunbloom mixed with red salts, it emits aura often mistaken for soul energy that attracts nearby creatures<br>' + dom.dseparator + '<span style=\'color:seagreen\'>Increases area size by 5</span>', stype: 4,
  use: function () {
    if (global.current_z.protected || global.current_z.id <= 101 || global.current_z.size <= 1) { msg('Unable to use it here!', 'red'); return }
    msg('You spread some powder on the ground', 'lime', null, null, 'brown')
    global.current_z.size += 5;
    dom.d7m.update();
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.smbpll = new Item({ id: 3022, name: 'Slumber Pill', desc: 'Pill with a strong sedative effect. Normally used by sick and old people to treat insomnia, if they can afford it. Has other uses if you are creative enough' + dom.dseparator + '<span style=\'color:lightgrey\'>Makes you sleep through 18 hours in an instant</span>', stype: 4,
  use: function (player: any, x: any) {
    if (flags.btl || flags.rdng || flags.isshop || flags.busy || flags.work) { msg('You can\'t sleep now!', 'red'); return } else {
      let b = .1; let s = HOUR * 18; if (!flags.sleepmode) giveEff(player, effect.slep); else if (global.current_l.id === 112) b += home.bed.sq; global.stat.plst++
      for (let a = 0; a < s; a++) { giveSkExp(skl.sleep, .1); ontick() } if (!flags.sleepmode) removeEff(effect.slep);
    }
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.lifedr = new Item({ id: 3023, name: 'Life Drop', desc: 'A single drop of revitalizing liquid. Consuming even such a meager amount has a miraclous effect on the lifeforce of a mortal' + dom.dseparator + '<span style=\'color:hotpink\'> Increases HP by +40 permanently </span><br><span style=\'color:lime\'>HP growth rate +2%</span>', stype: 4, rar: 2,
  use: function (player: any) {
    player.stat_p[0] += .03;
    player.hpmax += 40;
    player.hp += 40;
    player.hpa += 40;
    dom.d5_1_1.update();
    msg('HP increased by +40 permanently', 'hotpink');
    msg('HP potential grows!', 'pink')
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.mnblm = new Item({ id: 3024, name: 'Moonbloom', desc: 'A yellow flower which is said to bud on new moons. The flower\' nectar is the favourite of spirits and is effective for recovering from exhaustion, but only by refining it into a pill or elixir is it possible to draw out its full potential, which makes it prized by alchemists' + dom.dseparator + '<span style=\'color:hotpink\'> Increases SAT by +2 permanently </span>', stype: 4, rar: 2,
  use: function (player: any) {
    player.satmax += 2;
    player.sat += 2;
    player.sata += 2;
    dom.d5_3_1.update();
    msg('SAT increased by +2 permanently', 'hotpink');
    this.amount--;
  }
});

healItem({ key: 'hptn2', id: 3025, name: 'Minor Healing Potion', val: 450, desc: 'Healing potion with weak healing powers. It is usually used by commoners as first aid before deciding whether to go see a doctor or not', potion: true });

healItem({ key: 'hptn3', id: 3026, name: 'Healing Potion', val: 2100, desc: 'Startand healing potion of common quality. It can heal wounds, bruises, burns, sprains and other minor injuries. Novice adventurers and hunters should carry a few of these at all times', potion: true });

healItem({ key: 'hptn4', id: 3027, name: 'Major Healing Potion', val: 7900, desc: 'Potions given to the knights in times of war. Can heal moderate wounds and dull out the pain. These potions sneak their way into the market by all kinds of illegal means, yet actually selling them isn\'t prohibited', potion: true, rar: 2 });

// @ts-ignore: constructor function
item.lsstn = new Item({ id: 3028, name: 'Life Stone', desc: 'Life vessel that lost its energy and became impure, now looks like an ordinary small pebble and serves very little purpose. Can be absorbed for minor health benefits' + dom.dseparator + '<span style=\'color:hotpink\'> Increases HP by +25 permanently </span>', stype: 4,
  use: function (player: any) {
    player.hpmax += 25;
    player.hp += 25;
    player.hpa += 25;
    dom.d5_1_1.update();
    msg('HP increased by +25 permanently', 'hotpink')
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.bltrt = new Item({ id: 3029, name: 'Bloat Root', desc: 'Unremarkable looking grey root that is bland and tasteless, but eating it makes you feel full. It doesn\'t seem to have any other qualities, hovewer' + dom.dseparator + 'Restores<span style=\'color:lime\'> 100 </span>energy', stype: 4, rar: 2,
  use: function (player: any) {
    player.sat + 100 > player.satmax ? player.sat = player.satmax : player.sat += 100;
    dom.d5_3_1.update();
    this.amount--;
    msg('Restored 100 energy', 'lime');
  }
});

// @ts-ignore: constructor function
item.feip1 = new Item({ id: 3030, name: 'Fei Pill', desc: 'When an alchemist miserably fails to produce a pill, this waste is created. Compound of ruined medical materials is full of poison and impurities, it can be used to kill those with weak constitution. However, it is not useless, and can be absorbed for raw ki if one endures the pain and survives after consuming it', stype: 4,
  use: function (player: any) {
    giveEff(player, effect.fei1, 60, 1);
    this.amount--;
    global.stat.plst++
  }
});

// @ts-ignore: constructor function
item.stthbm1 = new Item({ id: 3031, name: 'Morgia', desc: 'Herb of might. This fiery herb is rumored to improve muscle density' + dom.dseparator + '<span style="color: springgreen">Permanently increases STR by +1</span>', stype: 4, rar: 2,
  use: function (player: any, x: any) {
    player.stra += 1;
    msg('You feel the surge of strength!', 'crimson');
    msg('STR +1', 'lime');
    player.stat_r();
    update_d();
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.stthbm2 = new Item({ id: 3032, name: 'Springsweed', desc: 'Herb of swiftness. Loved by Serpents, this herb slightly raises one\'s reaction time' + dom.dseparator + '<span style="color: springgreen">Permanently increases SPD by +1</span>', stype: 4, rar: 2,
  use: function (player: any, x: any) {
    player.spda += 1;
    msg('You feel the surge of strength!', 'crimson');
    msg('SPD +1', 'lime');
    player.stat_r();
    update_d();
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.stthbm3 = new Item({ id: 3033, name: 'Clearbane', desc: 'Herb of clarity. This herb is often used in making of high quality incense' + dom.dseparator + '<span style="color: springgreen">Permanently increases INT by +1</span>', stype: 4, rar: 2,
  use: function (player: any, x: any) {
    player.inta += 1;
    msg('You feel the surge of strength!', 'crimson');
    msg('INT +1', 'lime');
    player.stat_r();
    update_d();
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.stthbm4 = new Item({ id: 3034, name: 'Drakevine', desc: 'Herb of flexibility. There are rumors of an old hermit growing these herbs under the hidden mountain' + dom.dseparator + '<span style="color: springgreen">Permanently increases AGL by +1</span>', stype: 4, rar: 2,
  use: function (player: any, x: any) {
    player.agla += 1;
    msg('You feel the surge of strength!', 'crimson');
    msg('AGL +1', 'lime');
    player.stat_r();
    update_d();
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.bmsmktt = new Item({ id: 3035, name: 'Smoke Pellet Cluster', desc: 'Repurposed smoke bomb, made by concentrating multiple volatile components together, making the moke several times more hazardous, but not enough to cause real damage to a living person. Since the ignition period from such a modification is much longer, it has fewer uses than a regular smoke bomb', stype: 4,
  use: function () {
    if (global.current_l.id !== 111) { msg('This isn\'t the best place to use this', 'red'); return }
    area.hmbsmnt.size = 0;
    msg('You toss a cluster down your basement and hear a distant shrill', 'yellow')
    dom.d_lctt.innerHTML += '<span style="color:grey;font-size:1.2em">&nbsp煙<span>'
    sector.home.data.smkp = 900;
    sector.home.data.smkt = time.minute;
    this.amount--;
  }
});


foodItem({ key: 'appl', id: 1, name: 'Apple', val: 7, desc: 'Juicy red fruit. Makes a fine breakfast if you have nothing else...', glt: 2 });

foodItem({ key: 'brd', id: 2, name: 'Bread', val: 14, desc: 'Simple loaf of bread, baked with care. It\'s crunchy and smells nice', glt: 2,
  onChange: function (x: any, y: any) { if (y) return [item.spb, x]; giveItem(item.spb, x) }
});
item.brd.rot = [.15, .25, .05, .15];

foodItem({ key: 'crrt', id: 3, name: 'Carrot', val: 5, desc: 'It gets very sweet when boiled', glt: 1,
  onGet: function () {
    if (this.amount >= 20) { giveRcp(rcp.bcrrt); this.onGet = function () { } }
  }
});

foodItem({ key: 'potat', id: 4, name: 'Potato', val: 7, desc: 'Universal vegetable that can be prepared in hundreds different ways', glt: 2, poison: 0.1 });

foodItem({ key: 'eggn', id: 5, name: 'Egg', val: 4, desc: 'Whole chicken egg, very nutritious', glt: 2 });

foodItem({ key: 'mlkn', id: 6, name: 'Milk', val: 8, desc: 'Power potion for your bones', glt: 2, stat: 'foodb' });

foodItem({ key: 'rwmt1', id: 7, name: 'Raw Meat', val: 11, desc: 'Edible part of some animal, has to be cooked before consumption', glt: 6, poison: 0.15,
  onChange: function (x: any, y: any) { if (y) return [item.rtnmt, x]; giveItem(item.rtnmt, x) },
  onGet: function () {
    if (this.amount >= 5) { giveRcp(rcp.rsmt); this.onGet = function () { } }
  }
});
item.rwmt1.rot = [.25, .45, .1, .2];

foodItem({ key: 'rice', id: 8, name: 'Rice', val: 2, desc: 'Clean rice grains. Healthy and delicious when cooked, but awful to eat in dry state', glt: 2 });


foodItem({ key: 'borc', id: 9, name: 'Steamed Rice', val: 18, desc: 'Fluffy rice. Simple dish that tastes good', glt: 3 });

foodItem({ key: 'begg', id: 10, name: 'Boiled Egg', val: 7, desc: 'Hard/soft-boiled egg, you aren\'t sure. Will fill you up either way', glt: 2 });

foodItem({ key: 'kit', id: 11, name: 'Kikatsugan', val: 800, desc: 'Ninja ration consisting mostly of cereals that, according to esoteric scrolls, <span style=\'color:orange\'>\"Could sustain one in both mind and body with only three grains per day\"</span>', glt: 390, rar: 4 });

foodItem({ key: 'bac', id: 12, name: 'Bacon', val: 12, desc: 'The food of kings', glt: 6 });

foodItem({ key: 'bgt', id: 13, name: 'Baguette', val: 17, desc: 'A very long bread', glt: 4 });

foodItem({ key: 'bhd', id: 14, name: 'Hardtack', val: 6, desc: 'A dry and virtually tasteless bread product capable of remaining edible without spoilage for vast lengths of time', glt: 8 });

foodItem({ key: 'spb', id: 15, name: 'Spoiled Bread', val: 8, desc: ' Piece of old stale bread covered in mold. Takes courage to eat', glt: 17, rar: 0, poison: 0.4 });

foodItem({ key: 'wsb', id: 16, name: 'Wastebread', val: 11, desc: 'When flour becomes a commodity to deal with, wayfarers and the poor resort to mix it with leftovers of other ingredients and bake it all into bread', glt: 7 });

foodItem({ key: 'onn', id: 17, name: 'Onion', val: 3, desc: 'Vegetable cultivated since ancient times. Enhances the dish in various ways, also makes you cry', glt: 8 });

foodItem({ key: 'sgr', id: 18, name: 'Sugar', val: 1, desc: 'Sweet little crystals. Kids love treats made out of them', glt: 1 });

foodItem({ key: 'wht', id: 19, name: 'Wheat', val: 1, desc: 'Raw wheat. While not very tasty, powder made out of them is the main ingredient in breadmaking', glt: 1 });

foodItem({ key: 'tmt', id: 20, name: 'Tomato', val: 8, desc: 'Soursweet juicy edible, has many uses in cooking. Rumored to be poisonous', glt: 2 });

foodItem({ key: 'cbg', id: 21, name: 'Cabbage', val: 12, desc: 'Crisp layered vegetable. Used in variety of dishes', glt: 2 });

foodItem({ key: 'mshr', id: 22, name: 'Mushroom', val: 5, desc: 'Common edible mushroom. When cooked with the right ingredients, the flavour of this mushroom is not so common', glt: 2 });

foodItem({ key: 'bnn', id: 23, name: 'Banana', val: 8, desc: 'Fruit full of potassium. Originaly cultivated as staple food, but eventually gained popularity', glt: 1 });

foodItem({ key: 'wbrs', id: 24, name: 'Wild Berries', val: 7, desc: 'Wide selection of various edible berries collected from the forest', glt: 1 });

foodItem({ key: 'strwb', id: 25, name: 'Strawberry', val: 18, desc: 'Heap of plump red berries. They are sweet and popular with children and royalty', glt: 3 });

foodItem({ key: 'orng', id: 26, name: 'Orange', val: 9, desc: 'Fragnant citruis, can be either sour or sweet depending where it was cultivated', glt: 5 });

foodItem({ key: 'ches', id: 27, name: 'Cheese', val: 13, desc: 'Fermented cow milk. Despite having strong smell it is a tasty and popular product. Can be eaten raw', glt: 5 });

foodItem({ key: 'ltcc', id: 28, name: 'Lettuce', val: 2, desc: 'Watery leaves, usually used in salads', glt: 2 });

foodItem({ key: 'brly', id: 29, name: 'Barley', val: 2, desc: 'Grainy cereal used for malting. A staple of brewing everywhere. It can also be ground into flour', glt: 1 });

foodItem({ key: 'grlc', id: 30, name: 'Garlic', val: 6, desc: 'A pungent garlic, popular as a seasoning for its strong flavor', glt: 9 });

foodItem({ key: 'pmpk', id: 31, name: 'Pumpkin', val: 12, desc: 'A large vegetable, about the size of your head. Not very tasty raw, but is great for cooking', glt: 3 });

foodItem({ key: 'lmn', id: 32, name: 'Lemon', val: 8, desc: 'Very sour citrus. Can be eaten if you really want', glt: 10 });

foodItem({ key: 'grp', id: 33, name: 'Grapes', val: 8, desc: 'A cluster of juicy grapes. If you ferment them they\'ll turn into wine', glt: 2 });

foodItem({ key: 'pnpl', id: 34, name: 'Pineapple', val: 12, desc: 'A large, spiky pineapple. A bit sour, though', glt: 3 });

foodItem({ key: 'rsmt', id: 35, name: 'Roasted Meat', val: 15, desc: 'Simple slab of meat, roasted on an open fire without any seasoning. Tastes pretty good nonetheless', glt: 4 });
item.rsmt.rot = [.1, .25, .05, .15];

foodItem({ key: 'tbrwd', id: 36, name: 'Tea', val: 20, desc: 'The beverage of gentlemen everywhere, made from applying hot water to leaves of the tea plant. Often used during the ceremonies as a social supplement', glt: 7 });

foodItem({ key: 'htbrwd', id: 37, name: 'Herbal Tea', val: 16, desc: 'Healthy beverage brewed from various herbs, has a powerful relaxation effect', glt: 5 });

foodItem({ key: 'segg', id: 38, name: 'Scrambled Eggs', val: 20, desc: 'Fluffy and delicious scrambled eggs', glt: 7 });

foodItem({ key: 'irntl', id: 39, name: 'Indigo Rantil', val: 31, desc: 'Wierd wine mixed with whiskey and rum', glt: 17, stat: 'foodb', rar: 2, drka: 21, drunk: { dur: 130, add: 75 } });

foodItem({ key: 'wine1', id: 40, name: 'One-year Wine', val: 12, desc: 'Barely reached the standard, maybe you should keep it for longer', glt: 10, stat: 'foodb', drka: 5, drunk: { dur: 60, add: 35 } });

foodItem({ key: 'wines1', id: 41, name: 'Valens', val: 100, desc: 'A Celtic red wine with delicate, yet robust, flavour', glt: 100, stat: 'foodb', rar: 4 });

foodItem({ key: 'wines2', id: 42, name: 'Prudens', val: 100, desc: 'The most elegant red wine, with gentle flavour and bouquet', glt: 100, stat: 'foodb', rar: 4 });

foodItem({ key: 'wines3', id: 43, name: 'Volare', val: 100, desc: 'A Celtic white wine known for its honey-like fragrance', glt: 100, stat: 'foodb', rar: 4 });

foodItem({ key: 'wines4', id: 44, name: 'Audentia', val: 100, desc: 'A Celtic quality sweet wine allowed to age to perfection', glt: 100, stat: 'foodb', rar: 4 });

foodItem({ key: 'wines5', id: 45, name: 'Virtus', val: 100, desc: 'A sparkling wine made from a blend of three grapes', glt: 100, stat: 'foodb', rar: 4 });

foodItem({ key: 'acrn', id: 46, name: 'Acorn', val: 4, desc: 'A handful of acorns, still in their shells. Squirrels like them, but they\'re not very good for you to eat in this state', glt: 6, poison: 0.4 });

foodItem({ key: 'wine2', id: 47, name: 'Three-year Wine', val: 24, desc: 'Delicious wine kept for more than 3 years', glt: 17, stat: 'foodb', rar: 2, drka: 12, drunk: { dur: 90, add: 45 } });

foodItem({ key: 'winec1', id: 48, name: 'Cheap Red Wine', val: 8, desc: 'Very rough wine made from fermeted fruit', glt: 9, stat: 'foodb', drka: 5, drunk: { dur: 55, add: 33 } });

foodItem({ key: 'winec2', id: 49, name: 'Cheap White Wine', val: 12, desc: 'Light wine, prepared only recently', glt: 10, stat: 'foodb', drka: 8, drunk: { dur: 60, add: 35 } });

foodItem({ key: 'ske', id: 50, name: 'Sake', val: 31, desc: 'Eastern rice wine, popular past-time drink', glt: 25, stat: 'foodb', rar: 2, drka: 25, drunk: { dur: 180, add: 115 } });

foodItem({ key: 'pske', id: 51, name: 'Premium Sake', val: 51, desc: 'Rich Sake with strong foundation, flavorful and fragnant. Valued in high society for its presige status', glt: 65, stat: 'foodb', rar: 3, drka: 150, drunk: { dur: 380, add: 190 } });

foodItem({ key: 'cbun1', id: 52, name: 'Steamed Bun', val: 19, desc: 'Plain round bun, very soft and filling', glt: 4 });

foodItem({ key: 'cbun2', id: 53, name: 'Red Bean Bun', val: 29, desc: 'Bun with red beans added to it, resulting in rich flavour', glt: 6 });

foodItem({ key: 'cbun3', id: 54, name: 'Pork Bun', val: 34, desc: 'Delicious treat with pork meat inside of it, fine addition to your dinner', glt: 8, rar: 2 });

foodItem({ key: 'scak', id: 55, name: 'Strawberry Shortcake', val: 39, desc: 'Sweet cake with cream and strawberries, has a soft texture and melts in your mouth', glt: 13 });

foodItem({ key: 'atrt', id: 56, name: 'Apple Tart', val: 29, desc: 'Crunchy small cake baked with apples', glt: 8 });

foodItem({ key: 'strt', id: 57, name: 'Strawberry Tart', val: 38, desc: 'Sweet pastry with strawberries added on top', glt: 10, rar: 2 });

foodItem({ key: 'ccak', id: 58, name: 'Cheesecake', val: 52, desc: 'Delicious sweet dessert prepared in multiple layers. With fruit jam on top!', glt: 15, rar: 2 });

foodItem({ key: 'icrm', id: 59, name: 'Ice Cream', val: 19, desc: 'A sweet, frozen food made of milk with rich amounts of sugar. Gets very popular during Summer', glt: 8 });

foodItem({ key: 'lnch1', id: 60, name: 'Bacon and Eggs', val: 40, desc: 'Breakfast of choice and a part of your morning ritual, very filling', glt: 12 });

foodItem({ key: 'lnch2', id: 61, name: 'Morning Set', val: 47, desc: 'Eggs and toast. Goes best with Coffee', glt: 15, rar: 2 });

foodItem({ key: 'lnch3', id: 62, name: 'Lunch Set', val: 58, desc: 'Hefty combination of meat, eggs and a toast.', glt: 22, rar: 2 });

foodItem({ key: 'orgs', id: 63, name: 'Onion Rings', val: 20, desc: 'Golden slices of onion, buttered and fried in flour. Crunchy!', glt: 7 });

foodItem({ key: 'fsh1', id: 65, name: 'Fish', val: 15, desc: 'Freshly caught fish. Makes a passable meal raw', glt: 8, poison: 0.1 });

foodItem({ key: 'fsh2', id: 66, name: 'Fish Fillet', val: 6, desc: 'The fillet of fish, ready to be cooked', glt: 3, poison: 0.05 });

foodItem({ key: 'ffsh1', id: 67, name: 'Cooked Fish', val: 19, desc: 'Evenly fried delicious fish. It has a very deicious aroma', glt: 4 });

foodItem({ key: 'ffsh2', id: 68, name: 'Batter Fried Fish', val: 42, desc: 'A delicious golden brown serving of crispy fried fish', glt: 10, rar: 2 });

foodItem({ key: 'ssm', id: 69, name: 'Sashimi', val: 17, desc: 'Little fish slices, served with tangly dip sauce', glt: 8, rar: 2 });

foodItem({ key: 'dssm', id: 70, name: 'Deluxe Sashimi', val: 43, desc: 'Delicious slivers of thinly sliced raw fish and tasty vegetables', glt: 15, rar: 2 });

foodItem({ key: 'mkzs', id: 71, name: 'Makizushi', val: 35, desc: 'Delicious fish slices wrapped in tasty sushi rice and rolled up in a healthy nori', glt: 17, rar: 2 });

foodItem({ key: 'nori', id: 72, name: 'Nori', val: 10, desc: 'Pages of dried seaweed, very healthy and tastes like ocean', glt: 3 });

foodItem({ key: 'fnori', id: 73, name: 'Fried Nori', val: 20, desc: 'Sheets of nori friend with salt, giving it an entirely new taste. An incredibly delicios and popular snack', glt: 7 });

foodItem({ key: 'swtch1', id: 74, name: 'Sandwich', val: 40, desc: 'Two peices of bread and a slice of cheese inbetween. Simple and tasty', glt: 5 });

foodItem({ key: 'jll', id: 75, name: 'Jelly', val: 6, desc: 'Should you really be eating this stuff?', glt: 4 });

foodItem({ key: 'flr', id: 76, name: 'Flour', val: 1, desc: 'This enriched white flour is useful for baking', glt: 2 });

foodItem({ key: 'pcns', id: 77, name: 'Pine Nuts', val: 4, desc: 'A handful of tasty crunchy nuts from a pinecone', glt: 2 });

foodItem({ key: 'dgh', id: 78, name: 'Dough', val: 4, desc: 'Flour mixed with water, kneaded into a gooey paste.  This dough can be used to bake bread more efficiently than with just flour', glt: 3 });

foodItem({ key: 'hzlnt', id: 79, name: 'Hazelnuts', val: 6, desc: 'Popular forest nuts, still in their shells. They smell like the woods they come from', glt: 2 });

foodItem({ key: 'hpck', id: 80, name: 'Hippo Cookie', val: 33, desc: 'Soft cookies in a shape of a cute hippo, baked with milk and hazelnuts. Very popular with children and adults alike', glt: 6, rar: 2 });

foodItem({ key: 'dfrt', id: 81, name: 'Dried Fruit', val: 12, desc: 'Fruit roughly chopped and sun-dried, prepared as marching rations for the rangers', glt: 2 });

foodItem({ key: 'brdb', id: 82, name: 'Burnt Bread', val: 4, desc: 'Completely ruined and unappetizing loaf of charred bread. You can still eat it, but you probably won\'t enjoy it', glt: 12, rar: 0 });

foodItem({ key: 'spcn', id: 83, name: 'Soft Windflower', val: 5, desc: 'Wild vegetable that goes well with meat. ', glt: 2 });

foodItem({ key: 'hney', id: 84, name: 'Honey', val: 11, desc: 'Sweet sticky syrup that bees make. Can be turned into candy, but also very good by itself', glt: 2 });

foodItem({ key: 'brise', id: 85, name: 'Bad Rice', val: 8, desc: 'Old spoiled rice that\'s gone bad and turned yellow. Desperate food', glt: 16, rar: 0, poison: 0.75 });

foodItem({ key: 'steak', id: 86, name: 'Steak', val: 50, desc: 'Quality steak seared to perfection with a sprinkle of salt and generous twist of pepper. The delicious aroma is enough to make you drool', glt: 15, rar: 2 });

foodItem({ key: 'spc1', id: 87, name: 'Black Pepper', val: 2, desc: 'Small black berries with pungent aroma. Perfect for spicing food up', glt: 7, rar: 2 });

foodItem({ key: 'cnmn', id: 88, name: 'Cinnamon', val: 3, desc: 'Bark sticks from the Cinnamon tree. Fragnant and good for your health', glt: 6 });

foodItem({ key: 'bttr', id: 89, name: 'Butter', val: 8, desc: 'Small brick of creamy butter, made from churned cow milk ', glt: 3 });

foodItem({ key: 'cnmnb', id: 90, name: 'Cinnamon Bun', val: 36, desc: 'Fluffy sweet pastry bun with aromatic cinnamon powder sprinkled on top of it. Rare treat everyone can enjoy ', glt: 9, rar: 2 });

foodItem({ key: 'brth', id: 91, name: 'Broth', val: 16, desc: 'Tasty and healthy meat broth. Used mainly for cooking soups, but can be consumed as is', glt: 4 });

foodItem({ key: 'eggsp', id: 92, name: 'Egg Soup', val: 46, desc: 'Popular soup made from delicious broth and eggs. It\'s a great meal to start your day with', glt: 10, rar: 2 });

foodItem({ key: 'scln', id: 93, name: 'Scallion', val: 4, desc: 'Green scallions, also known as spring onions. Slightly spicy and fragnant, they help to bring out the taste of the soups', glt: 10 });

foodItem({ key: 'crmchd', id: 94, name: 'Creamy Chowder', val: 62, desc: 'Delicious meat howder with milk, cheese and potato flakes. You can practically taste the chef\'s skill', glt: 10, rar: 2 });

foodItem({ key: 'chklt', id: 95, name: 'Chocolate', val: 9, desc: 'Ground cacao beans solidified into a sweet, tasty treat', glt: 3 });

foodItem({ key: 'fegg', id: 96, name: 'Fried Egg', val: 9, desc: 'An egg, simply fried as is. It\'s pretty good', glt: 2 });

foodItem({ key: 'crn', id: 97, name: 'Corn', val: 3, desc: 'Golden kernels, attached to a cob. Practically inedible like this', glt: 5 });

foodItem({ key: 'bcrn', id: 98, name: 'Butter Corn', val: 25, desc: 'Golden brown corn fried in generous amount of butter. Very tasty', glt: 6 });

foodItem({ key: 'pcrn', id: 99, name: 'Popcorn', val: 10, desc: 'Corn kernels, roasted under high heat. They make a *pop* sound and explode into little edible clouds', glt: 2 });

foodItem({ key: 'cpcrn', id: 100, name: 'Salted Popcorn', val: 15, desc: 'Regular popcorn, but slightly salted for extra taste', glt: 4 });

foodItem({ key: 'fbrd', id: 101, name: 'Flatbread', val: 12, desc: 'Primitive unleavened bread', glt: 2 });

foodItem({ key: 'gcce', id: 102, name: 'Ginger Cookie', val: 25, desc: 'Spiced cookies baked from a batter of flour, molasses and ginger powder', glt: 5, rar: 2 });

foodItem({ key: 'bcrc', id: 103, name: 'Bone Cracker', val: 12, desc: 'Bones of some kind, baked until crisp', glt: 3 });

foodItem({ key: 'snkb', id: 104, name: 'Snack Bar', val: 30, desc: 'Fruit, sugar, and grain meal mixed and molded before being backed into a stcik-shaped pastry', glt: 5 });

foodItem({ key: 'dmtp', id: 105, name: 'Deluxe Meat Pie', val: 60, desc: 'Premium pie with abudance of various meats, best eaten hot! Extremely filling', glt: 41, rar: 2 });

foodItem({ key: 'lkmc', id: 106, name: 'Lokum', val: 29, desc: 'Grain meal cooked down, mixed with mashed fruits and then cooled to produce a soft candy', glt: 4 });

foodItem({ key: 'vgsn', id: 107, name: 'Vegetable Sandwich', val: 35, desc: 'A sandwich with sliced cucumber filling. Tastes slightly bland', glt: 9 });

foodItem({ key: 'stgp', id: 108, name: 'Stargazing Pie', val: 55, desc: 'A pie containing a whole fish romantically gazing up at the stars', glt: 18 });

foodItem({ key: 'tdpps', id: 109, name: 'Tallow Drops', val: 33, desc: 'Nourishing tallow, molded into lozenges. Subtly sweet', glt: 4 });

foodItem({ key: 'chstn', id: 110, name: 'Chestnuts', val: 5, desc: 'Delicious acorns which release more flavour the more one chews on them', glt: 1 });

foodItem({ key: 'prfd', id: 111, name: 'Prison Food', val: 22, desc: 'This jail level delicacy is nutritious, generously portioned and inexpensive. But it doesn\'t taste good', glt: 8, rar: 0 });

foodItem({ key: 'brmt', id: 112, name: 'Burnt Meat', val: 7, desc: 'Coal-looking overcooked chunk of meat. Mildly nutritious but awful to eat', glt: 5, rar: 0 });

foodItem({ key: 'mbsps', id: 113, name: 'Mebaspa Sandwich', val: 52, desc: 'Ordinary bread with meatballs and spaghetti put in it, it\'s extremely high on cholesterol. Weird skeleton kid invented this dish', glt: 66 });

foodItem({ key: 'spgt', id: 114, name: 'Spaghetti and Meatballs', val: 33, desc: 'Long noodles with meat and meatsauce. Renown food from some far off land', glt: 5 });

foodItem({ key: 'mnj1', id: 115, name: 'Manjū', val: 26, desc: 'Popular traditional eastern confection, kneaded boiled bun with the variety of sweet fillings within in', glt: 4 });

foodItem({ key: 'mnj2', id: 116, name: 'Alcoholic Manjū', val: 38, desc: 'Manjū bun with delicious sake added to it', glt: 12, rar: 2, drka: 10 });

foodItem({ key: 'ntea1', id: 117, name: 'Landen Flower Tea', val: 26, desc: 'Rare herbal tea created by a talented pharmacist. It calms and relaxes those who drink it.', glt: 3, rar: 2 });

foodItem({ key: 'jrk1', id: 118, name: 'Beef Jerky', val: 18, desc: 'Perfectly dried strips of meat. The taste is not bad, this jerky can be kept edible for years', glt: 2 });

foodItem({ key: 'jrk2', id: 119, name: 'Spicy Jerky', val: 30, desc: 'Valuable jerky, enriched and improved. Salted and spiced into a filling and tasty travel food', glt: 5 });

foodItem({ key: 'ongr', id: 120, name: 'Onigiri', val: 25, desc: 'A simple portable food consisting of cooked rice rolled into a ball and seasoned with salt', glt: 2 });

foodItem({ key: 'rbmb', id: 121, name: 'Rice Bomb', val: 33, desc: 'A grilled onigiri with a miso-ginger glaze that creates explosion of flavour', glt: 4 });

foodItem({ key: 'mchii', id: 122, name: 'Mochi', val: 22, desc: 'Dumpling made with kneaded mochi rice flour', glt: 8 });

foodItem({ key: 'mchai', id: 123, name: 'Kuzumochi', val: 29, desc: 'Variation of mochi, made by glazing grilled rice flour with kudzu sauce', glt: 12 });

foodItem({ key: 'igum', id: 124, name: 'Ice Gummy', val: 17, desc: 'A refreshing snack made from larvae suspended in fruit juice gelatin', glt: 3 });

foodItem({ key: 'msoop', id: 125, name: 'Mushroom Soup', val: 37, desc: 'Refreshing soup made of chopped mushrooms, potatoes and onions boiled together', glt: 4 });

foodItem({ key: 'rmn1', id: 126, name: 'Chashu Ramen', val: 41, desc: 'This ramen features fresh soy sauce broth and deliciously textured chashu pork ', glt: 6 });

foodItem({ key: 'rmn2', id: 127, name: 'Miso Ramen', val: 44, desc: 'Miso and pork mixed with spicy vegetables makes for a succulent soup you\'d want to eat again', glt: 5 });

foodItem({ key: 'rmn3', id: 128, name: 'Tonkotsu Ramen', val: 48, desc: 'This delicious tonkotsu ramen is a rich pork-infused soup made from finest ingredients', glt: 9 });


foodItem({ key: 'sqdyak', id: 129, name: 'Squid Yakisoba', val: 43, desc: 'Tender, delicious yakisoba noodles are combined with tasty squid making a filling and enjoyable meal', glt: 7 });

foodItem({ key: 'mtbeer', id: 130, name: 'Malt Beer', val: 18, desc: 'This beer has a pleasant aftertaste and depth of flavor that only 100% barley malts can provide', glt: 18, stat: 'foodb', drka: 8, drunk: { dur: 40, add: 20 } });

foodItem({ key: 'dbeer', id: 131, name: 'Draft Beer', val: 15, desc: 'A medium-sized mug of draft beet that many like to start with. Its creamy head and crisp taste are perfect after a day of hard work ', glt: 19, stat: 'foodb', drka: 6, drunk: { dur: 52, add: 31 } });

foodItem({ key: 'ootee', id: 132, name: 'Oolong Tea', val: 25, desc: 'Oolong tea, famous for its thick, rich flavor and light aftertaste, is the quintessential non-alcoholic drink. Enjoy its exquisite fragrance and flavor', glt: 3, stat: 'foodb' });

foodItem({ key: 'krcsal', id: 133, name: 'Kotchori Salad', val: 49, desc: 'Kotchori salad brimming with eastern bunching onions! The peppery dressing drizzled on top and pungent onion flavor match all manners of drings', glt: 6 });

foodItem({ key: 'emdm', id: 134, name: 'Edamame', val: 21, desc: 'These soybeans in a pod are pretty much the default snack when drinking', glt: 2 });

foodItem({ key: 'skplt', id: 135, name: 'Skewer Platter', val: 61, desc: 'A plate of five different skewers. The secret to their popularity is the special spicy miso', glt: 10, rar: 2 });

foodItem({ key: 'skwre', id: 136, name: 'Eastern Chicken Skewer', val: 39, desc: 'Chicken sourced from domestic farms makes for a firm, juicy kebab with unique richness of flavor', glt: 7 });

foodItem({ key: 'smfro', id: 137, name: 'Smelt Fish with Roe', val: 34, desc: 'The burst of flavor from the roe with over many who try this perfectly grilled with delicacy', glt: 6 });

foodItem({ key: 'fsqdnr', id: 138, name: 'Fried Squid with Nori', val: 44, desc: 'A dish found on the meny of many izakaya. Fans can never get enough of the nori fragrance and firm squid flesh', glt: 6 });

foodItem({ key: 'sltyak', id: 139, name: 'Salted Yakisoba', val: 39, desc: 'This addictive yakisoba dish mixes a rich, salty sauce with piquant eastern onions, and can be eaten as a meal or a snack with drinks', glt: 8 });

foodItem({ key: 'jcmncc', id: 140, name: 'Juicy Mince Cutlet', val: 45, desc: 'This popular mince cutlet is packed with meaty goodness that fills your mouth each time you take a bite', glt: 6 });

foodItem({ key: 'sbeanf', id: 141, name: 'Stir-Fried Bean Sprouts', val: 37, desc: 'A simple dish taht cahmpiions the humble bean sprout, accented with a peppery punch. Once you start earing it, it\'s hard to put down', glt: 4 });

foodItem({ key: 'mgpch', id: 142, name: 'Mango & Peach Sherbet', val: 29, desc: 'No matter how much you\'ve already eaten, it\'s always seary to make room for this tropical sherbet dessert', glt: 3 });

foodItem({ key: 'maitake', id: 143, name: 'Maitake', val: 7, desc: 'Maitake mushrooms are a delectable addition to hotpots', glt: 2 });

foodItem({ key: 'odens', id: 144, name: 'Oden Soup', val: 40, desc: 'There is more than enough of this piping hot oden assortment to satisfy your hunger. Perfect for a colkd winter evening', glt: 5 });

foodItem({ key: 'onign1', id: 145, name: 'Seaweed Onigiri', val: 30, desc: 'Seaweed boiled in soy sauce is in the center of this onigiri', glt: 3 });



foodItem({ key: 'onign2', id: 146, name: 'Tuna Onigiri', val: 36, desc: 'This nigiri has tuna dressing with maynnaise in the middle', glt: 4 });

foodItem({ key: 'onign3', id: 147, name: 'Salmon Onigiri', val: 38, desc: 'Old standard salmon onigiri, belowed by old and young for generations', glt: 5 });

foodItem({ key: 'syakis', id: 148, name: 'Special Yakisoba', val: 50, desc: 'Yakisoba with cabbage and pork. The smell of the sauce is mouth-watering', glt: 9 });

foodItem({ key: 'kkbin', id: 149, name: 'Kakubin', val: 25, desc: 'The most popular whisky in the East. It has a sweet aroma and is thick on the palate, with a smooth, rich taste', glt: 21, stat: 'foodb', drka: 11, drunk: { dur: 80, add: 50 } });

foodItem({ key: 'blsho', id: 150, name: 'Barley Shochu', val: 39, desc: 'This barley shochy has a dry state popular with experienced drinkers', glt: 23, stat: 'foodb', drka: 21, drunk: { dur: 72, add: 36 } });

foodItem({ key: 'scwhi', id: 151, name: 'Scotch Whisky', val: 40, desc: 'This whisky has a high alcohol content, so be careful not to drink too much', glt: 30, stat: 'foodb', drka: 24, drunk: { dur: 140, add: 70 } });

foodItem({ key: 'cham1', id: 152, name: 'Satoyu Champon', val: 45, desc: 'The flavors of Satoyu condensed into one dish. The rich soup is made with fresh vegetables and a wealth of of ohter ingredients', glt: 8 });

foodItem({ key: 'cham2', id: 153, name: 'Vegetable Champon', val: 48, desc: 'This dish features seven different vegetables, and contains double the cabbage, bean sprouts, and onionof the standard champion', glt: 11, rar: 2 });

foodItem({ key: 'cham3', id: 154, name: 'Spicy Champon', val: 42, desc: 'Eye-popping champon with homemade spicy miso', glt: 14 });

foodItem({ key: 'cham4', id: 155, name: 'Light Champon', val: 26, desc: 'A small serving of champon that is popular with women. Just the thing when you are only a little hungry', glt: 7 });

foodItem({ key: 'sudon1', id: 156, name: 'Satoyu Saraudon', val: 47, desc: 'Extra thin, crispy deep-fried noodles packed with flavor, and topped with vegetable in a thick, silky sauce that melts in your mouth ', glt: 9 });

foodItem({ key: 'sudon2', id: 157, name: 'Vegetable Saraudon', val: 42, desc: 'A sister dish to the popular Vegetable Champon. Eat it with a dressing of your choice', glt: 8 });

foodItem({ key: 'sudon3', id: 158, name: 'Thick Saraudon', val: 50, desc: 'Soft, thisk, flavorsome noodle make for a filling treat. Big plate is enough to satiate you for a whole day!', glt: 10, rar: 2 });

foodItem({ key: 'sudon4', id: 159, name: 'Light Saraudon', val: 25, desc: 'A small plate of udon that hits the spot when you feel like a snack', glt: 6 });

foodItem({ key: 'goza', id: 160, name: 'Gyoza', val: 37, desc: 'Fried dumplings with a rich meat filling. The skin has rice flour blended in for amazing crispiness', glt: 5 });

foodItem({ key: 'dfrch', id: 161, name: 'Deep Fried Chicken', val: 48, desc: 'Fried chicken made with thigh meat. it\'s crunchy on the outside and juicy in the middle. Finger-smacking good!', glt: 9 });

foodItem({ key: 'ynasl', id: 162, name: 'Yuona Salad', val: 29, desc: 'Thin, deep-fried noodles topped with dressing and fresh vegetables', glt: 5 });

foodItem({ key: 'ramen1', id: 163, name: 'Shoyu Ramen', val: 40, desc: 'Famous shoyu ramen. Thick soba noodles in the soy sauce based soup, improved with rich selection of vegetables. Delicious!', glt: 7 });

foodItem({ key: 'ramen2', id: 164, name: 'Negi Ramen', val: 42, desc: 'Classic shoyu ramen topped with piquant eastern onions', glt: 8 });

foodItem({ key: 'ramen3', id: 165, name: 'Chashu Ramen', val: 50, desc: 'Tasty ramen topped with succulent, thin slices of roast pork', glt: 10 });

foodItem({ key: 'ramen4', id: 166, name: 'Negi Chashu Ramen', val: 66, desc: 'This exquisit ramen features a hefty helping of spicy eastern onions and slices of roast pork', glt: 12 });

foodItem({ key: 'bffbl', id: 167, name: 'Beef Bowl', val: 48, desc: 'A hearty beef bowl made with top quality eastern beef', glt: 7 });

foodItem({ key: 'sposs', id: 168, name: 'Sweet Potato Shochu', val: 33, desc: 'A sweet potato shochu that succeeds in bringing out the flavors of its ingredients', glt: 26, stat: 'foodb', drka: 20, drunk: { dur: 92, add: 41 } });

foodItem({ key: 'soban1', id: 169, name: 'Soba in Hot Broth', val: 40, desc: 'This house classic features freshly-boiled soba noodles served in a piping hot homemade soup', glt: 6 });

foodItem({ key: 'soban2', id: 170, name: 'Chilled Soba', val: 44, desc: 'Delicious soba noodles rinsed in water after cooking to stop them becoming too soft, served with a special dipping sauce', glt: 8 });

foodItem({ key: 'soban3', id: 171, name: 'Chilled Tanuki Soba', val: 46, desc: 'Freshly cooked soba noodles topped with chilled sauce and bits of fried tenpura batter. This is a firm favourite among population', glt: 9 });

foodItem({ key: 'soban4', id: 172, name: 'Chilled Kitsune Soba', val: 48, desc: 'Freshly cooked soba noodles topped with chilled sauce and house made fried tofu cut into easy-to-eat pieces', glt: 10 });

foodItem({ key: 'soban5', id: 173, name: 'Egg & Tenpura Soba', val: 52, desc: 'Hot soba noodles served with soft-boiled egg and vegetable tenpura. This dish is a perennial favorite', glt: 11 });

foodItem({ key: 'soban6', id: 174, name: 'Special Fuji Soba', val: 60, desc: 'Hot soba noodles topped with a lavish amount of fried tenpura batter and fried tofu, along with soft-bioled egg and "kamaboko" fish cake', glt: 15, rar: 2 });

foodItem({ key: 'soban7', id: 175, name: 'Yuzu Chicken & Spinach Soba', val: 50, desc: 'A vibrant dish of hot soba noodles topped with spinach and pieces of steamed chicken, accented with the subtle fragrance of yuzu', glt: 9 });

foodItem({ key: 'katubo', id: 176, name: 'Fried Pork Cutlet Bowl', val: 58, desc: 'This classic dish features a thick, crunchy pork cutlet topped with sauce and lightly cooked egg. It is made to order for maximum freshness', glt: 11 });

foodItem({ key: 'curry1', id: 177, name: 'Curry & Rice', val: 50, desc: 'Mild curry and rice. This curry is made with the house\'s special roux and sauce, and is petfect for those who don\'t like too much spice', glt: 14 });

foodItem({ key: 'soban8', id: 178, name: 'Pickled Ginger Soba', val: 56, desc: 'Hot soba noodles served with tenpura containing copious amounts of red pickled ginger for a pleasant meal that warms the soul', glt: 8 });

foodItem({ key: 'yktr', id: 179, name: 'Yakitori', val: 48, desc: 'This charcoal-grilled chicken on a skewer has a savory smell that is out of this world', glt: 6 });

foodItem({ key: 'tegs', id: 180, name: 'Tuna & Egg Sandwich', val: 45, desc: 'This sandwich features an egg-mayo mix with tuna on white bread', glt: 5 });

foodItem({ key: 'tamag', id: 181, name: 'Tamago', val: 15, desc: 'Delicate and tasty egg sushi', glt: 3 });

foodItem({ key: 'magr', id: 182, name: 'Maguro', val: 26, desc: 'Top-grade bluefin tuna sushi', glt: 5 });

foodItem({ key: 'ameb', id: 183, name: 'Ama-Ebi', val: 24, desc: 'This tender, sweet shrimp will melt in your mouth. It\'s unbelievably fresh!', glt: 4 });

foodItem({ key: 'engw', id: 184, name: 'Engawa', val: 32, desc: 'Tastiest engawa sushi made from eastern flounder', glt: 5 });

foodItem({ key: 'skmsk', id: 185, name: 'Seki Mackerel', val: 30, desc: 'Not all mackerel are created equal. This premium mackerel is packed with tasty fish oil', glt: 8 });

foodItem({ key: 'namatk', id: 186, name: 'Namatako', val: 29, desc: 'Octopus sushi of the highest grade. The more you chew, the better it tastes. That\'s proof of quality', glt: 7 });

foodItem({ key: 'hirame', id: 187, name: 'Hirame', val: 37, desc: 'This halibut is a popular sushi topping. Its sweet white meat doesn\'t have a trace of fishiness', glt: 9 });

foodItem({ key: 'shmaj', id: 188, name: 'Shima-Aji', val: 33, desc: 'The king of horse mackerel! It\'s a summer fish best eaten as sashimi or sushi', glt: 6 });

foodItem({ key: 'kndma', id: 189, name: 'Kinmedai', val: 38, desc: ' The shiny color of this splendid alfonsino is a feast for the eyes. It\'s fatty and melts in your mouth', glt: 7 });

foodItem({ key: 'ikura', id: 190, name: 'Ikura', val: 40, desc: ' Top quality salmon roe wrapped in nori. The best there is!', glt: 10 });

foodItem({ key: 'akagi', id: 191, name: 'Akagai', val: 37, desc: 'Popular sushi toping made from ark clams. Also known as "bloody clams" because they have red blood', glt: 8 });

foodItem({ key: 'otor', id: 192, name: 'Otoro', val: 45, desc: 'This is the richest cut from the top-grade bluefin tuna. The taste alone will leave you hungry for more', glt: 12, rar: 2 });

foodItem({ key: 'awabi', id: 193, name: 'Awabi', val: 56, desc: 'Highest quality abalone with the taste out of this world. Premium snack for those who can afford it', glt: 13, rar: 2 });

foodItem({ key: 'uni', id: 194, name: 'Uni', val: 60, desc: 'Exquisit sea urchin meat of the most excellent kind, wrapped in nori. As fresh as can be', glt: 16, rar: 3 });

foodItem({ key: 'klbi1', id: 195, name: 'Kalbi', val: 48, desc: 'This beef rib meat is popular for its incredibly rich flavor', glt: 10 });

foodItem({ key: 'klbi2', id: 196, name: 'Grade A Kalbi', val: 55, desc: 'Top-grade meat is selected from only the rarest, choicest cuts of beef rib', glt: 25, rar: 2 });

foodItem({ key: 'srln1', id: 197, name: 'Sirloin', val: 52, desc: 'Light and relatively low fat sirloin beef steak with spices', glt: 12 });

foodItem({ key: 'srln2', id: 198, name: 'Grade A Sirloin', val: 66, desc: 'Incredible top-grade beef sirloin prized for its unparalleled taste and quality', glt: 28, rar: 2 });

foodItem({ key: 'sfdpl', id: 199, name: 'Seafood Platter', val: 57, desc: 'A plate of the sea\'s delicious bounty, including shrimp, scallops, and squid', glt: 38 });

foodItem({ key: 'kmchc', id: 200, name: 'Kimchi Combo', val: 63, desc: 'A tantalizing combo dish of kimchi made from eastern cabbage, cucumbers, daikon and more', glt: 20 });

foodItem({ key: 'stnkbb', id: 201, name: 'Stone Cooked Bibimbap', val: 68, desc: 'Very hot bowl of bibimbap with special spicy sweed kochujang sauce. Roasted to a golden brown for an irresistable taste', glt: 32 });

foodItem({ key: 'spcbef', id: 202, name: 'Spicy Beef Soup', val: 49, desc: 'Spicy hot beef soup with rice and noodles. It has a very homemade feeling to it', glt: 39 });

foodItem({ key: 'binigiri', id: 203, name: 'Giant Nigiri', val: 88, desc: 'This nigiri looks way to big to eat. Who made this thing?', glt: 48, rar: 3 });

foodItem({ key: 'infpdps', id: 204, name: 'Inferno Pepper Dumpling', val: 66, desc: 'These special dumplings are so hot and addictive that you won\'t be able to talk for a week', glt: 62, rar: 3 });

foodItem({ key: 'daikn', id: 205, name: 'Daikon', val: 6, desc: 'A still-juicy daikon radish. It\'s not spicy and can be eaten raw', glt: 3 });

foodItem({ key: 'bonig', id: 206, name: 'Rotten Onigiri', val: 19, desc: 'This riceball has gone bad. You normally wouldn\'t eat this, but when you run out of food even this looks delicious', glt: 20, rar: 0, poison: 0.8 });

foodItem({ key: 'wdaikn', id: 207, name: 'Wihered Daikon', val: 4, desc: 'A daikon radish that has withered in the sun. It\'s still edible, but it\'s kinda sad', glt: 4, rar: 0 });

foodItem({ key: 'oppr', id: 208, name: 'Oni Pepper', val: 42, desc: 'An extremely spicy pepper that makes you erupt in sweat and make an expression like an oni. It hurts more coming out than going in', glt: 42, rar: 2 });

foodItem({ key: 'jdaik', id: 209, name: 'Jumbo Daikon', val: 50, desc: 'A huge, rare daikon radish. Stews made with this daikon are delicious. You can put some miso paste on it to eat raw', glt: 35, rar: 2 });

foodItem({ key: 'bmshrm', id: 210, name: 'Big Mushroom', val: 33, desc: 'A big, juicy mushroom that sucked up lots of nutrients. It doesn\'t taste ordinary. It can be stewed, roasted, fried or eaten raw', glt: 16, rar: 2 });

foodItem({ key: 'hlstw', id: 211, name: 'Healing Stew', val: 18, desc: 'Tasteless soup made by boiling heaps of cure grass in water. Healing only in name, it is known that exposing cure grass to high temperatures destroys any healing properties of the product', glt: 8 });

foodItem({ key: 'bcrrt', id: 212, name: 'Boiled Carrot', val: 9, desc: 'Regular carrot, boiled in water. It is sweet but not all that tasty, actually', glt: 5 });

foodItem({ key: 'jsdch', id: 213, name: 'Jelly Sandwich', val: 27, desc: 'Awful sandwich that doesn\'t taste like anything. It is filling, at the very least', glt: 12 });

foodItem({ key: 'agrns', id: 214, name: 'Assorted Grains', val: 3, desc: 'Buckwheat, sunflower seeds, oats, rye... Various grains, seeds and nuts in very small quantities as such making them not very useful for pretty much anything', glt: 5,
  onGet: function () {
    if (this.amount >= 10) { giveRcp(rcp.wsb); this.onGet = function () { } }
  }
});

foodItem({ key: 'eggfrc', id: 215, name: 'Egg Fried Rice', val: 33, desc: 'Stir fried egg cooked together with golden rice. Excellent and refreshing dish', glt: 9 });

foodItem({ key: 'thme', id: 216, name: 'Thyme', val: 2, desc: 'A stalk of aromatic thyme, often used in medicine as a complimentary herb. Can be made into a relaxing tea or antiseptic', glt: 3 });

foodItem({ key: 'wldhrbs', id: 217, name: 'Wild Herbs', val: 1, desc: 'A tasty collection of wild herbs including violet, sassafras, mint, clover, purslane, and fireweed', glt: 3 });

foodItem({ key: 'meffg', id: 218, name: 'Meat Effigy', val: 28, desc: 'Strange edible effigy made of who knows what. It tastes like regular jerky', glt: 10 });

foodItem({ key: 'rtnmt', id: 219, name: 'Rotten Meat', val: 4, desc: 'Greenish grey organic mass that was once something edible, now isn\'t good for pretty much anything', glt: 13, rar: 0, poison: 0.45 });
item.rtnmt.rot = [.4, .8, .3, .6];

foodItem({ key: 'appljc', id: 220, name: 'Apple Juice', val: 18, desc: 'Freshly-squeezed from real apples!', glt: 3, stat: 'foodb' });

foodItem({ key: 'frtplp', id: 221, name: 'Juice Pulp', val: 9, desc: 'Left-over byproduct from juicing the fruit.  Not very tasty, but contains a lot of healthy fiber', glt: 4 });
item.frtplp.rot = [.05, .15, .05, .15];

foodItem({ key: 'klngbr', id: 222, name: 'Kaoliang', val: 52, desc: 'Strong traditional liquor with a tangy taste and important role during social gatherings', glt: 35, stat: 'foodb', drka: 25, drunk: { dur: 80, add: 40 } });


// @ts-ignore: constructor function
item.sbone = new Item({ id: 5000, name: 'Small Bone', desc: 'Brittle bone of some animal', stype: 5,
  use: function () { msg('You rattle the bone') },
  onGet: function () {
    if (this.amount >= 50) { giveRcp(rcp.bdl1); this.onGet = function () { } }
  }
});

// @ts-ignore: constructor function
item.death_b = new Item({ id: 5001, name: 'Death Badge', desc: 'Awarded by fate for dying. Congratulations', stype: 5,
  use: function () { msg('Looking at this fills you with bad memories'); }
});

// @ts-ignore: constructor function
item.sstraw = new Item({ id: 5002, name: 'Strand Of Straw', desc: 'This fell out of a dummy when you punched it to death', stype: 5,
  use: function () { msg('You put one in your mouth...'); },
  onGet: function () {
    if (this.amount >= 30) giveRcp(rcp.strwks);
    if (this.amount >= 40) giveRcp(rcp.wvbkt);
    if (this.amount >= 50) { giveRcp(rcp.sdl1); this.onGet = function () { } }
  }
});

// @ts-ignore: constructor function
item.d6 = new Item({ id: 5003, name: 'Red Die', desc: 'Die with 6 sides. Brings luck', stype: 5, rar: 2,
  use: function () {
    let r = rand(1, 6); global.stat.die_p += r; global.stat.die_p_t += r;
    msg('You roll <span style="color:red">' + r + '</span>');
    skl.dice.use(1);
    if (random() < .05) {
      this.amount--; msg("The die crumbles in your hands", 'Magenta');
    }
  }
});

// @ts-ignore: constructor function
item.cp = new Item({ id: 5004, name: 'Penny', desc: 'A single penny, outdated form of currency. For some reason it\'s still in circulation', stype: 4,
  use: function (x: any) {
    giveWealth(1, false, true);
    this.amount--;
    dumb(x);
  }
});

// @ts-ignore: constructor function
item.lcn = new Item({ id: 5005, name: 'Large Copper Coin', desc: 'Local currency in a form of a heavy coin. Poor people can eat for a whole day with a few of those', stype: 4,
  use: function (x: any) {
    giveWealth(20, false, true);
    this.amount--;
    dumb(x);
  }
});

// @ts-ignore: constructor function
item.cn = new Item({ id: 5006, name: 'Nickel', desc: 'Small nickel, outdated form of currency. It was worth much more in the past', stype: 4,
  use: function (x: any) {
    giveWealth(5, false, true);
    this.amount--;
    dumb(x);
  }
});

// @ts-ignore: constructor function
item.cd = new Item({ id: 5007, name: 'Dime', desc: 'Round copper dime. Still shiny', stype: 4,
  use: function (x: any) {
    giveWealth(10, false, true);
    this.amount--;
    dumb(x);
  }
});

// @ts-ignore: constructor function
item.cq = new Item({ id: 5008, name: 'Quarter', desc: 'Very large coin, made of copper. Not much worth as money, but collected and used by poor blacksmiths for resmelting into tools', stype: 4,
  use: function (x: any) {
    giveWealth(25, false, true);
    this.amount--;
    dumb(x);
  }
});

// @ts-ignore: constructor function
item.watr = new Item({ id: 5009, name: 'Water', desc: 'Regular drinkable water', stype: 5,
  use: function () {
    msg('You took a sip', 'aqua');
  }
});

// @ts-ignore: constructor function
item.psb = new Item({ id: 5010, name: 'Pleasant Sleep Blanket', desc: 'Soft warm blanket. It makes you sleep better', stype: 5,
  use: function () {
  }
});

// @ts-ignore: constructor function
item.wdc = new Item({ id: 5011, name: 'Wood Splint', desc: 'A small chipped piece of wood. Not very useful by itself', stype: 5,
  onGet: function () {
    if (this.amount >= 10) giveRcp(rcp.wbdl);
    if (this.amount >= 50) { giveRcp(rcp.wdl1); this.onGet = function () { } }
  },
  use: function () {
    msg('Ouch');
  }
});

// @ts-ignore: constructor function
item.bgl = new Item({ id: 5012, name: 'Bag of lost items', desc: 'Lost possession of waifarers and travellers', stype: 4,
  use: function () {
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.salt = new Item({ id: 5013, name: 'Salt', desc: 'Rock salt crushed into tiny crystals. Yuck! You surely wouldn\'t want to eat this. It\'s good for preserving perishable foods and cooking, though', stype: 5,
  use: function () {
    msg('It stings your tongue', 'silver');
  }
});

// @ts-ignore: constructor function
item.slm = new Item({ id: 5014, name: 'Slime', desc: 'Clear blob of slime. Used in elementary alchemy to make adhesives. Also acts as a base for some potions', stype: 5,
  use: function () {
    msg('Sticky..', 'silver');
  }
});

// @ts-ignore: constructor function
item.tlvs = new Item({ id: 5015, name: 'Tea leaves', desc: 'A pinch of fragnant tea leaves, ready for brewing', stype: 5,
  use: function () {
    msg('They feel just dry enough', 'blue');
  }
});

// @ts-ignore: constructor function
item.key1 = new Item({ id: 5016, name: 'Bronze Key', desc: '', stype: 5,
  use: function () { }
});

// @ts-ignore: constructor function
item.key2 = new Item({ id: 5017, name: 'Iron Key', desc: '', stype: 5,
  use: function () { }
});

// @ts-ignore: constructor function
item.key3 = new Item({ id: 5018, name: 'Silver Key', desc: '', stype: 5,
  use: function () { }
});

// @ts-ignore: constructor function
item.key4 = new Item({ id: 5019, name: 'Gold Key', desc: '', stype: 5,
  use: function () { }
});

// @ts-ignore: constructor function
item.key5 = new Item({ id: 5020, name: 'Platinum Key', desc: '', stype: 5,
  use: function () { }
});

// @ts-ignore: constructor function
item.key6 = new Item({ id: 5021, name: 'Steel Key', desc: '', stype: 5,
  use: function () { }
});

// @ts-ignore: constructor function
item.key7 = new Item({ id: 5022, name: 'Crimson Key', desc: '', stype: 5,
  use: function () { }
});

// @ts-ignore: constructor function
item.key0 = new Item({ id: 5023, name: 'Rusty Key', stype: 5,
  desc: function () { return ('Scummy old key. ' + (flags.hbs1 ? 'You can open your basement with it' : 'What could it be for?')) },
  use: function () {
    msg(flags.hbs1 ? 'Thankfully it didn\'t break apart when you used it' : 'It looks familiar...', 'lightgrey');
  }
});

// @ts-ignore: constructor function
item.ywlt = new Item({ id: 5024, name: 'Woven Wallet', desc: 'This is your personal wallet, you received it as a gift' + dom.dseparator + '<span style=\'color:orange\'>You can feel coinage inside</spam>', stype: 4, rar: 2,
  use: function (x: any) {
    giveItem(item.cd, 2);
    giveItem(item.cq, 1);
    giveItem(item.cn, 1);
    giveItem(item.cp, rand(2, 10));
    this.amount--;
    flags.m_un = true;
    appear(dom.mn_2);
    appear(dom.mn_4);
    appear(dom.mn_3);
  }
});

// @ts-ignore: constructor function
item.hnhn = new Item({ id: 5025, name: 'Teruterubōzu', desc: 'Holy talisman. Leave it out on the rain to gain blessing of good fortune', stype: 5, rar: 2,
  use: function (x: any) { }
});

// @ts-ignore: constructor function
item.pcn = new Item({ id: 5026, name: 'Pinecone', desc: 'A spiny pod from a pine tree.  Dry seeds rattle around inside when you shake it', stype: 4,
  use: function (x: any) {
    msg(select(["*Crack..* ", "*Crunch..* ", "*Pop..* "]), 'lightgrey');
    if (random() <= (.3 + skl.dice.lvl * .03)) { msg_add("You have discovered some pine nuts inside!", 'lime'); giveItem(item.pcns, rand(1, 3)); giveSkExp(skl.dice, 2); } else { msg_add("The cone was empty..", 'grey'); giveSkExp(skl.dice, .5); }
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.pbl = new Item({ id: 5027, name: 'Pebble', desc: 'A tiny useless stone, found everywhere. Can be thrown to create distraction' + dom.dseparator + '<span style="color:yellow">+5 Throwing Damage</span>', stype: 2, c: 'yellow',
  use: function () {
    if (this.disabled !== true) {
      this.disabled = true;
      if (flags.civil === true || flags.btl === false) { msg("You threw " + this.name + " into the distance", "grey"); giveSkExp(skl.thr, 1) } else tattack(5, 1, 1);
      this.amount--;
      setTimeout(() => { this.disabled = false }, (500 / (skl.thr.lvl || 1)))
    }
  }
});

// @ts-ignore: constructor function
item.ptng1 = new Item({ id: 5028, name: 'Tattered Painting', desc: 'Scratched up and faded painting of a lady. It\'s nearly impossible to recognize any details', stype: 5,
  use: function () { }
});

// @ts-ignore: constructor function
item.fwd1 = new Item({ id: 5029, name: 'Firewood', desc: 'Type of dry wood, prepared for easy burning. Useful at camps or during winter', stype: 5,
  use: function () {
    msg('*Donk* ..It sounds hollow', 'ghostwhite')
  },
  onGet: function () {
    if (this.amount >= 60) { giveRcp(rcp.fwdpile); this.onGet = function () { } }
  }
});

// @ts-ignore: constructor function
item.coal1 = new Item({ id: 5030, name: 'Coal', desc: 'Black rocks of fossilized organic mass. This coal burns for a very long time', stype: 5,
  use: function () {
    msg('You can picture it smoldering inside your fireplace', 'grey');
  }
});

// @ts-ignore: constructor function
item.coal2 = new Item({ id: 5031, name: 'Charcoal', desc: 'Coal made from carefuly burning quality wood for lengths of time. This coal cinders for a very long time', stype: 5,
  use: function () {
    msg('Your hands get all dirty', 'black', null, null, 'lightgrey');
  }
});

// @ts-ignore: constructor function
item.cndl2 = new Item({ id: 5032, name: 'placehold', desc: 'hldplace' });

// @ts-ignore: constructor function
item.skl = new Item({ id: 5033, name: 'Skull', desc: 'Mostly undamaged human skull, taken from some unlucky corpse. It is used in various ways by all sorts of dark sorcerers, witches and alchemists', stype: 5,
  use: function () {
    msg('It looks menacing', 'purple', null, null, 'lightgrey');
  }
});

gameText.kntsct = ['Adjustable bend', 'Adjustable grip hitch', 'Albright special', 'Alpine Butterfly', 'Anchor bend', 'Angle\'s loop ', 'Arbor knot', 'Artillery loop', 'Ashley\'s bend', 'Axle hitch', 'Bachmann knot', 'Bag knot', 'Bait loop', 'Barrel knot', 'Basket weave knot', 'Becket hitch ', 'Beer knot', 'Bimini twist', 'Blackwall hitch', 'Blake\'s hitch', 'Blood knot', 'Boa knot', 'Boling knot', 'Boom hitch', 'Bourchier knot', 'Heraldic knot', 'Bumper knot', 'Bunny ears', 'Butterfly loop', 'Carrick bend', 'Cat\'s paw', 'Catshank', 'Celtic button knot', 'Chain sinnet', 'Chair knot', 'Clove hitch', 'Constrictor knot', 'Cow hitch', 'Crown knot', 'Double loop', 'Dogshank', 'Diamond knot', 'Dropper loop', 'Death knot', 'Eye splice', 'Falconer\'s knot', 'Farmer\'s loop', 'Fiador knot', 'Figure-eight knot', 'Fisherman\'s bend', 'Friendship knot', 'Hackamore', 'Garda hitch', 'Grief knot', 'Gordian knot', 'Grantchester knot', 'Ground-line hitch', 'Gripping sailor\'s hitch', 'Halter hitch', 'Handcuff knot', 'Hangman\'s noose', 'Highpoint hitch', 'Highwayman\'s hitch', 'Hitching tie', 'Hunter\'s bend', 'Icicle hitch', 'Jamming knot', 'Killick hitch', 'Klemheist knot', 'Knot of isis', 'Lariat loop', 'Lighterman\'s hitch', 'Lineman\s loop', 'Lissajous knot', 'Lobster buoy hitch', 'Magnus hitch', 'Marlinespike hitch', 'Midshipman\'s hitch', 'Miller\'s knot', 'Monkey\'s fist', 'Mountaineer\'s coil', 'Munter hitch', 'Nail knot', 'Ossel hitch', 'Overhand bend', 'Palomar knot', 'Pile hitch', 'Pipe hitch', 'Pretzel link knot', 'Power cinch', 'Racking bend', 'Reef knot', 'Reever Knot', 'Rolling hitch', 'Round turn', 'Running bowline', 'Sailor\'s hitch', 'Sheepshank', 'Shoelace knot', 'Simple knot', 'Slip knot', 'Snell knot', 'Snuggle hitch', 'Span loop', 'Square knot', 'Strangle knot', 'Surgeon\'s loop', 'Tape knot', 'Thief knot', 'Transom knot', 'Thumb knot', 'Threefoil knot', 'Trident loop', 'Trilene knot', 'Triple crown knot', 'True lover\'s knot', 'Turle knot', 'Versatackle knot', 'Underhand knot', 'Underwriter\'s knot', 'Uni knot', 'Wall and crown knot', 'Water knot', 'Windsor knot', 'Yosemite bowlin', 'Zeppelin bend']

// @ts-ignore: constructor function
item.rope = new Item({ id: 5034, name: 'Rope', desc: 'A length of sturdy rope, for tying things up', stype: 5,
  use: function () {
    msg('You practiced knot tying for a short while and made <span style="color:orange">"' + select(gameText.kntsct) + '"</span>!', 'springgreen');
  }
});

// @ts-ignore: constructor function
item.mcps = new Item({ id: 5035, name: 'Clay Milk Cap', desc: 'Milk caps made from packed clay. Children like to play with these' + dom.dseparator + '<span style="color:yellow">+9 Throwing Damage</span>', stype: 2, c: 'yellow',
  use: function () {
    if (this.disabled !== true) {
      this.disabled = true;
      if (flags.civil === true || flags.btl === false) { msg("You threw " + this.name + " into the distance", "grey"); giveSkExp(skl.thr, 1) } else tattack(9, 1, 1);
      this.amount--;
      setTimeout(() => { this.disabled = false }, (500 / (skl.thr.lvl || 1)))
    }
  }
});

// @ts-ignore: constructor function
item.stdst = new Item({ id: 5036, name: 'Stardust', desc: 'Tiny bits of solar pieces that came from the Sky. They shine in darkness and hold the energy of stars', stype: 5,
  use: function (x: any) {
    msg('It is glittering', 'gold', null, null, 'darkblue');
  }
});

// @ts-ignore: constructor function
item.gcre1 = new Item({ id: 5037, name: 'Lesser Golem Core', desc: 'Exhausted power core of a golem. It has nearly no use anymore, the entire energy supply of this thing has been used up', stype: 5,
  use: function (x: any) {
    msg('You notice specks of dull light flickering inside');
  }
});

// @ts-ignore: constructor function
item.wvbkt = new Item({ id: 5038, name: 'Straw Basket', desc: furniture.wvbkt.desc, stype: 4, isf: true, parent: furniture.wvbkt,
  use: function (x: any) {
    giveFurniture(furniture.wvbkt);
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.tbwr1 = new Item({ id: 5039, name: 'Wooden Tableware', desc: furniture.tbwr1.desc, stype: 4, isf: true, parent: furniture.tbwr1,
  use: function (x: any) {
    let f = giveFurniture(furniture.tbwr1);
    if (inSector(sector.home)) activatef(f);
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.ess1 = new Item({ id: 5040, name: 'Essence of Air', desc: 'Spirit shard of concentrated Wind power', stype: 5, rar: 2 });

// @ts-ignore: constructor function
item.ess2 = new Item({ id: 5041, name: 'Essence of Earth', desc: 'Spirit shard of concentrated Geo power', stype: 5, rar: 2 });

// @ts-ignore: constructor function
item.ess3 = new Item({ id: 5042, name: 'Essence of Flames', desc: 'Spirit shard of concentrated Fire power', stype: 5, rar: 2 });

// @ts-ignore: constructor function
item.ess4 = new Item({ id: 5043, name: 'Essence of Water', desc: 'Spirit shard of concentrated Aqua power', stype: 5, rar: 2 });

// @ts-ignore: constructor function
item.ess5 = new Item({ id: 5044, name: 'Essence of Light', desc: 'Spirit shard of concentrated Holy power', stype: 5, rar: 2 });

// @ts-ignore: constructor function
item.ess6 = new Item({ id: 5045, name: 'Essence of Night', desc: 'Spirit shard of concentrated Demonic power', stype: 5, rar: 2 });

// @ts-ignore: constructor function
item.toolbx = new Item({ id: 5046, name: 'Toolbox', desc: 'Metal box with a variety of fine tools inside, multipurpose knives, mallets, pincers, chisels and a few more. Used for precision work and tinkering with simple and complex objects' + dom.dseparator + '<span style="color:chartreuse">Allows deconstruction of items and equipment when kept in inventory</span>', stype: 5,
  use: function () {
    if (random() < .1) msg('You almost dropped the box..', 'orange');
    else msg('Dozens of tools tumble inside as you shake it', 'yellow');
  }
});

// @ts-ignore: constructor function
item.cpdst = new Item({ id: 5047, name: 'Corpse Dust', desc: 'Dust derived from the remains of the deciesed, often used for witchcraft and enchantments', stype: 5,
  use: function () {
    msg('Disgusting', 'lightgrey');
  }
});

// @ts-ignore: constructor function
item.cclth = new Item({ id: 5048, name: 'Cheap Cloth', desc: 'A poor quality swatch of cloth. Unstitches when you so much as breathe on it', stype: 5,
  use: function () {
    msg('Can you even work with something this worthless?', 'lightgrey');
  }
});

// @ts-ignore: constructor function
item.thrdnl = new Item({ id: 5049, name: 'Thread', desc: 'A small quantity of thread that could be used in sewing and tailoring projects', stype: 5,
  use: function () {
    msg('It doesn\'t seem very sturdy', 'lightgrey');
  },
  onGet: function () {
    if (this.amount >= 100) { giveRcp(rcp.cyrn); this.onGet = function () { } }
  }
});

// @ts-ignore: constructor function
item.sktbad = new Item({ id: 5050, name: 'Mistake', desc: 'A failed product of an unskilled artisan. Once destined to become something worty of display, this mangled mess is repulsive to look at', stype: 5,
  use: function () {
    msg('Better put this away', 'lightgrey');
  }
});

// @ts-ignore: constructor function
item.bblkt = new Item({ id: 5051, name: 'Ragwork Blanket', desc: furniture.bblkt.desc, stype: 4, isf: true, parent: furniture.bblkt,
  use: function (x: any) {
    let f = giveFurniture(furniture.bblkt);
    if (inSector(sector.home)) activatef(f);
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.spillw = new Item({ id: 5052, name: 'Straw Pillow', desc: furniture.spillw.desc, stype: 4, isf: true, parent: furniture.spillw,
  use: function (x: any) {
    let f = giveFurniture(furniture.spillw);
    if (inSector(sector.home)) activatef(f);
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.cyrn = new Item({ id: 5053, name: 'Yarn Ball', desc: furniture.cyrn.desc, stype: 4, isf: true, parent: furniture.cyrn,
  use: function (x: any) {
    let f = giveFurniture(furniture.cyrn);
    if (inSector(sector.home)) activatef(f);
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.dfish = new Item({ id: 5054, name: 'Dead Fish', desc: 'Carcass of some fish, looking bad, grey and dead. Can be dismantled into fishbait', stype: 5,
  use: function () {
    msg('Gross!', 'lightgrey');
  }
});

// @ts-ignore: constructor function
item.fbait1 = new Item({ id: 5055, name: 'Bait', desc: 'Organic remains rolled into a ball, favoured by fish and other aquatic population', stype: 5,
  use: function () { }
});

// @ts-ignore: constructor function
item.htrdvr = new Item({ id: 5056, name: 'Hunter\'s Crate', desc: 'Heavy wooden crate you were asked to deliver to dojo. It is sealed shut and you can\'t look inside. It smells faintly of meat, spices and mushrooms. Probably filled with preserved dry produce', stype: 5,
  use: function () {
    msg('You resist the temptation to open it', 'lightgrey')
  }
});

// @ts-ignore: constructor function
item.htrsvr = new Item({ id: 5057, name: 'Hunter\'s Bag', desc: 'Heavy canvas bag you were asked to deliver to the herbalist. It is filled with separated bundles of various herbs you can\'t identify. You\'d rather not touch anything inside as it looks dangerously poisonous', stype: 5,
  use: function () {
    msg('Strong aroma eminating from this bag makes your head spin', 'orange')
  }
});

// @ts-ignore: constructor function
item.hbtsvr = new Item({ id: 5058, name: 'Herbalist\'s Satchel', desc: 'Heavy leather satchel you were asked to deliver to the head hunter. Hundreds of vials clang Violently no matter how carefully you attempt to carry it', stype: 5,
  use: function () {
    msg('You\'ll be in trouble of you break anything inside', 'lightgrey')
  }
});

// @ts-ignore: constructor function
item.fwdpile = new Item({ id: 5059, name: 'Firewood Pile', desc: 'Stockpile of firewood neatly packed together for easy storage', stype: 4, isf: true, parent: furniture.fwdpile,
  use: function (x: any) {
    let f = giveFurniture(furniture.fwdpile);
    if (inSector(sector.home)) activatef(f);
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.lprmt = new Item({ id: 5060, name: 'Travel Permit', desc: 'Written document used in your village. Acts as a proof of one\'s strength, meaning the owner has the ability to protect himself when leaving the village, you will need this when going out. Nearly every adult you know has this', stype: 5, rar: 2,
  use: function () {
    msg('You feel pride holding this', 'green')
  }
});

// @ts-ignore: constructor function
item.bed2 = new Item({ id: 5061, name: 'Plain Bed', desc: furniture.bed2.desc, stype: 4, isf: true, parent: furniture.bed2,
  use: function (x: any) {
    let f = giveFurniture(furniture.bed2);
    if (inSector(sector.home)) activatef(f);
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.wfng = new Item({ id: 5062, name: 'Wolf Fang', desc: 'Clear and sharp fang of a predator. It still looks dangerous', stype: 5,
  use: function () {
    msg('You may prick your finger if you mishandle it', 'lightgrey')
  },
  onGet: function () {
    if (this.amount >= 10) giveRcp(rcp.wfng)
  }
});

// @ts-ignore: constructor function
item.bookgen = new Item({ id: 5063, name: 'Book', desc: furniture.bookgen.desc, stype: 4, isf: true, parent: furniture.bookgen,
  use: function (x: any) {
    let f = giveFurniture(furniture.bookgen);
    if (inSector(sector.home) && !f.active) activatef(f);
    this.amount--;
  }
});

// @ts-ignore: constructor function
item.dmice1 = new Item({ id: 5064, name: 'Dead Mouse', desc: 'Vermin hunted by your cat, now proudly displayed before you', stype: 5, rar: 0,
  use: function () {
    msg('Yeah..', 'grey')
  }
});

// @ts-ignore: constructor function
item.dbdc1 = new Item({ id: 5065, name: 'Dead Bird', desc: 'A proof of loyalty brought to you by your cat', stype: 5, rar: 0,
  use: function () {
    msg('Indeed..', 'grey')
  }
});


// @ts-ignore: constructor function
item.ip1 = new Item({ id: 9000, name: '"Idea paper"', desc: 'Tiny scrap of paper with information. You wrote it yourself to remember things.', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        giveRcp(rcp.strawp);
        giveRcp(rcp.hlpd);
        giveRcp(rcp.borc);
        giveRcp(rcp.begg);
        this.amount--;
        this.data.read = false;
        this.data.finished = true;
      } else chss.trd.sl(this, .2);
    }
  }
});
item.ip1.data.time = HOUR;

// @ts-ignore: constructor function
item.skl1 = new Item({ id: 9001, name: 'P Skillbook (Swords)', desc: 'Entry level practitioner skillbook about sword combat' + dom.dseparator + '<span style="color:deeppink">Sword Mastery EXP gain +5%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.srdc, 150);
        skl.srdc.p += .05;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this, .5);
    }
  }
});
item.skl1.data.time = HOUR * 4;

// @ts-ignore: constructor function
item.skl2 = new Item({ id: 9002, name: 'P Skillbook (Knives)', desc: 'Entry level practitioner skillbook about knife combat' + dom.dseparator + '<span style="color:deeppink">Knife Mastery EXP gain +5%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.knfc, 150);
        skl.knfc.p += .05;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this, .5);
    }
  }
});
item.skl2.data.time = HOUR * 4;

// @ts-ignore: constructor function
item.skl3 = new Item({ id: 9003, name: 'P Skillbook (Axes)', desc: 'Entry level practitioner skillbook about axe combat' + dom.dseparator + '<span style="color:deeppink">Axe Mastery EXP gain +5%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.axc, 150);
        skl.axc.p += .05;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this, .5);
    }
  }
});
item.skl3.data.time = HOUR * 4;

// @ts-ignore: constructor function
item.skl4 = new Item({ id: 9004, name: 'P Skillbook (Spears)', desc: 'Entry level practitioner skillbook about spear combat' + dom.dseparator + '<span style="color:deeppink">Polearm Mastery EXP gain +5%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.plrmc, 150);
        skl.plrmc.p += .05;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this, .5);
    }
  }
});
item.skl4.data.time = HOUR * 4;

// @ts-ignore: constructor function
item.skl5 = new Item({ id: 9005, name: 'P Skillbook (Hammers)', desc: 'Entry level practitioner skillbook about hammer combat' + dom.dseparator + '<span style="color:deeppink">Hammer Mastery EXP gain +5%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.hmrc, 150);
        skl.hmrc.p += .05;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this, .5);
    }
  }
});
item.skl5.data.time = HOUR * 4;

// @ts-ignore: constructor function
item.skl6 = new Item({ id: 9006, name: 'P Skillbook (Martial)', desc: 'Entry level practitioner skillbook about unarmed combat' + dom.dseparator + '<span style="color:deeppink">Martial Mastery EXP gain +5%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.unc, 150);
        skl.unc.p += .05;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this, .5);
    }
  }
});
item.skl6.data.time = HOUR * 4;

// @ts-ignore: constructor function
item.bstr = new Item({ id: 9007, name: '"Animalis Vicipaedia"', rar: 2, desc: 'Heavy Hunter\'s Encyclopedia. There are a few entries about wild life, beasts, and mythical creatures you can encounter, the other pages are blank. You feel the urge to fill them in' + dom.dseparator + '<span style="color:lime">Unlocks Bestiary</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        msg('Bestiary Unlocked!', 'cyan');
        this.data.read = false;
        this.amount--;
        flags.bstu = true;
        this.data.finished = true;
        if (dom.jlbrw1s2) dom.jlbrw1s2.innerHTML = 'B E S T I A R Y'
      } else chss.trd.sl(this);
    }
  }
});
item.bstr.data.time = HOUR * 17;

// @ts-ignore: constructor function
item.tbrwdb = new Item({ id: 9008, name: '"The Art of Teabrewing"', rar: 2, desc: 'Informative little book in detail describing the ways of teamaking, starting from precise amounts and proportions, specific water temperatures, correct tableware, to the defferent styles and etiquette', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        giveRcp(rcp.tbrwd);
        this.data.finished = true;
        this.data.read = false;
        this.amount--;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.tbrwdb.data.time = HOUR * 26;

gameText.mscbkatxt = ["This fairy tale is about a wolf who eats so much salted meat she becomes trapped in the butcher's cellar.",
  "In this traditional story of beastly intrigue a clever fox convinces an elderly lion to kill a derogatory wolf.",
  "This is an illustrated fairy tale book about a conversation between a mouse and a cat.",
  "An amusing collection of stories featuring a Thunder God on the cover.",
  "This is a well illustrated fairy tale about a war between the birds and the beasts, with particulars on the wartime conduct and eventual fate of the bat.",
  "This book, titled \"The Rattlesnake's Vengeance\" is a collection of local myths and legends.",
  "This fairy tale book is a regional variant of a tale of friendship between the Demon and the Angel",
  "This fairy tale book is entitled \"Little Red Cap\".  It details a red-cloaked child's various encounters with talking wolves.", "A collection of ghost stories warning about the dangers of stealing from the dead.",
  "A book of culinary fairy tales.  The cover features an orange fairy juggling a lemon, a lime, and a tangerine slimes.",
  "A book of fables about people who change into birds.",
  "This compendium of amusing folk tales about the devil is titled \"Hell's Kettle: Legends of the Devil.\"",
  "This charming book of fables is titled, \"The Crystal Mountain and the Princess.\"",
  "This is a collection of fairy tale stories warning against the consequences of extreme greed.",
  "In this fairy tale a strong man frightens an ogre by squeezing water out of a stone.",
  "This book of rustic folk tales bears the title: \"How to Shout Down the Devil.\"",
  "The title of this book is \"Village Folk-tales of Darion.\"  It includes fables about logical errors and foolish misjudgements of the village men.",
  "This book of folk tales is titled, \"The Girl with the Ugly Name, and Other Stories.\"",
  "Titled \"The Fleeing Pancake\", this collection of silly folk tales is suitable for small children."];

// @ts-ignore: constructor function
item.msc1 = new Item({ id: 9009, name: '"Book of Fairy Tales"', save: true, stype: 4,
  desc: function () { return 'An amusing collection of folklore featuring the usual cast of fairies and demons' + dom.dseparator + '<span style="color:limegreen">' + gameText.mscbkatxt[this.data.bid] + '</span>' },
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        giveExp(this.data.exp || 500, true, true, true); this.data.bid = rand(gameText.mscbkatxt.length - 1); this.data.exp = rand(500, 5000); this.desc = 'An amusing collection of folklore featuring the usual cast of fairies and demons' + dom.dseparator + '<span style="color:limegreen">' + gameText.mscbkatxt[item.msc1.data.bid] + '</span>'; this.data.time = this.data.timep = rand(2, 10) * HOUR;
        this.data.bid = rand(gameText.mscbkatxt.length - 1);
        this.data.finished = true;
        this.data.read = false;
        this.amount--;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.msc1.data.time = HOUR * 6;

// @ts-ignore: constructor function
item.bcpn = new Item({ id: 9010, name: '"Cooking with Poison"', rar: 2, desc: 'A leatherbound book with an embossed cauldron on the cover. Inside it describes ways to purify food through alchemy', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.data.finished = true;
        this.data.read = false;
        this.amount--;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.bcpn.data.time = HOUR * 30;

// @ts-ignore: constructor function
item.mdc1 = new Item({ id: 9011, name: '"First Aid Manual"', desc: 'Tiny red pocket-sized guide to emergency care, covers basic bandaging and wound treating', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        let dt = 0;
        dt += giveRcp(rcp.bdgh);
        dt += giveRcp(rcp.mdcag);
        dt += giveRcp(rcp.hptn1);
        this.data.finished = true;
        giveItem(item.bookgen)
        if (dt === 0) msg('You haven\'t learned anything new...', 'lightgrey')
        this.data.read = false;
        this.amount--;
      } else chss.trd.sl(this);
    }
  }
});
item.mdc1.data.time = HOUR * 12;

// @ts-ignore: constructor function
item.dmkbk = new Item({ id: 9012, name: '"Dollmaker\'s Handbook"', desc: 'A very short manual filled with illustrations about primitive dollmaking. The instructions are easy to understand so children could make the dolls too. Looks like there was a chapter dedicated to sewing, now it\'s almost entirely missing', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        giveItem(item.bookgen)
        let dt = 0;
        dt += giveRcp(rcp.sdl1);
        dt += giveRcp(rcp.wdl1);
        dt += giveRcp(rcp.gdl1);
        dt += giveRcp(rcp.bdl1);
        dt += giveRcp(rcp.cyrn);
        this.data.finished = true;
        if (dt === 0) msg('You haven\'t learned anything new...', 'lightgrey')
        this.data.read = false;
        this.amount--;
      } else chss.trd.sl(this);
    }
  }
});
item.dmkbk.data.time = HOUR * 12;

// @ts-ignore: constructor function
item.scrlw = new Item({ id: 9013, name: '"Ragged Parchment"', desc: 'Scummy sheet of paper tainted with something teal. Some kinds of materials are listed here', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        let dt = 0;
        dt += giveRcp(rcp.hptn1);
        this.data.finished = true;
        if (dt === 0) msg('You already know how to make lesser potions', 'lightgrey')
        this.data.read = false;
        this.amount--;
      } else chss.trd.sl(this);
    }
  }
});
item.scrlw.data.time = HOUR * 3;

// @ts-ignore: constructor function
item.wp2s = new Item({ id: 9014, name: '"Rotten Illustration"', desc: 'Found this within old bushery, it looks like a drawing of something in charcoal', stype: 4,
  onGet: function () { flags.wp2sgt = true },
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        let dt = 0;
        dt += giveRcp(rcp.wp2);
        this.data.finished = true;
        if (dt === 0) msg('You already know how to sharpen sticks', 'lightgrey')
        this.data.read = false;
        this.amount--;
      } else chss.trd.sl(this);
    }
  }
});
item.wp2s.data.time = HOUR * 2;

// @ts-ignore: constructor function
item.shppmf = new Item({ id: 9015, name: '"Pamphlet"', desc: 'This was shoved onto you by someone on the streets. Store names, discount prices, hot items... An entire wall of advertisements in tiny letters, to fit as much of it as possible on this piece of paper. It is a good idea to memorize the addresses', stype: 4,
  onGet: function () { flags.pmfspmkm1 = true },
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        flags.mkplc1u = true;
        this.data.finished = true;
        msg('Right, you could go to the marketplace', 'lime');
        if (global.current_l.id === chss.lsmain1.id) smove(chss.lsmain1, false);
        this.data.read = false;
        this.amount--;
      } else chss.trd.sl(this);
    }
  }
});
item.shppmf.data.time = HOUR * 3;

// @ts-ignore: constructor function
item.amrthsck = new Item({ id: 9016, name: '"Guide To Living By Yourself"', desc: 'Looks like a page from someone\'s notebook, marked "H", poorly written in bad handwriting. It lists several simple things you can cook and make from widely available cheap materials', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        giveItem(item.bookgen)
        let dt = 0;
        dt += giveRcp(rcp.bcrrt);
        dt += giveRcp(rcp.bcrc);
        dt += giveRcp(rcp.hlstw);
        dt += giveRcp(rcp.rsmt);
        dt += giveRcp(rcp.segg);
        dt += giveRcp(rcp.jsdch);
        dt += giveRcp(rcp.appljc);
        dt += giveRcp(rcp.bblkt);
        dt += giveRcp(rcp.spillw);
        this.data.finished = true;
        if (dt === 0) msg('You haven\'t learned anything new...', 'lightgrey')
        this.data.read = false;
        this.amount--;
      } else chss.trd.sl(this);
    }
  }
});
item.amrthsck.data.time = HOUR * 12;

// @ts-ignore: constructor function
item.skl1a = new Item({ id: 9017, name: '"Bladesman Manual"', rar: 2, desc: 'Technique book full of fundamental knowledge about swordfighting' + dom.dseparator + '<span style="color:deeppink">Sword Mastery EXP gain +15%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.srdc, 3250);
        skl.srdc.p += .15;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.skl1a.data.time = HOUR * 14;

// @ts-ignore: constructor function
item.skl2a = new Item({ id: 9018, name: '"Assassin Manual"', rar: 2, desc: 'Technique book full of fundamental knowledge about kinfefighting' + dom.dseparator + '<span style="color:deeppink">Knife Mastery EXP gain +15%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.knfc, 3250);
        skl.knfc.p += .15;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.skl2a.data.time = HOUR * 14;

// @ts-ignore: constructor function
item.skl3a = new Item({ id: 9019, name: '"Axeman Manual"', rar: 2, desc: 'Technique book full of fundamental knowledge about axefighting' + dom.dseparator + '<span style="color:deeppink">Axe Mastery EXP gain +15%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.axc, 150);
        skl.axc.p += .05;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.skl3a.data.time = HOUR * 14;

// @ts-ignore: constructor function
item.skl4a = new Item({ id: 9020, name: '"Lancer Manual"', rar: 2, desc: 'Technique book full of fundamental knowledge about spearfighting' + dom.dseparator + '<span style="color:deeppink">Polearm Mastery EXP gain +15%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.plrmc, 3250);
        skl.plrmc.p += .15;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.skl4a.data.time = HOUR * 14;

// @ts-ignore: constructor function
item.skl5a = new Item({ id: 9021, name: '"Clubber Manual"', rar: 2, desc: 'Technique book full of fundamental knowledge about bluntfighting' + dom.dseparator + '<span style="color:deeppink">Hammer Mastery EXP gain +15%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.hmrc, 3250);
        skl.hmrc.p += .15;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.skl5a.data.time = HOUR * 14;

// @ts-ignore: constructor function
item.skl6a = new Item({ id: 9022, name: '"Brawler Manual"', rar: 2, desc: 'Technique book full of fundamental knowledge about fistfighting' + dom.dseparator + '<span style="color:deeppink">Martial Mastery EXP gain +15%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        giveSkExp(skl.unc, 3250);
        skl.unc.p += .15;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.skl6a.data.time = HOUR * 14;

// @ts-ignore: constructor function
item.brdbn = new Item({ id: 9023, name: '"Your First Bread"', desc: 'Very primitive instruction booklet about making simple breads. The way it\'s written, it looks very similar to manuals given to slaves and servants at the beginning of their service, if they are able to read', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        let dt = 0;
        dt += giveRcp(rcp.flr);
        dt += giveRcp(rcp.dgh);
        dt += giveRcp(rcp.brd);
        this.data.finished = true;
        giveItem(item.bookgen)
        if (dt === 0) msg('You haven\'t learned anything new...', 'lightgrey')
        this.data.read = false;
        this.amount--;
      } else chss.trd.sl(this);
    }
  }
});
item.brdbn.data.time = HOUR * 7;

// @ts-ignore: constructor function
item.bfsnwt = new Item({ id: 9024, name: '"Beggar Fashion"', desc: 'Some nonsence illustration with a name, featuring a group of peasants in rags posing awkwardly. What even is this?', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        let dt = 0;
        dt += giveRcp(rcp.ptchpts);
        dt += giveRcp(rcp.ptchct);
        if (dt === 0) msg('You haven\'t learned anything new...', 'lightgrey')
        this.data.read = false;
        this.amount--;
      } else chss.trd.sl(this);
    }
  }
});
item.bfsnwt.data.time = HOUR * 4;

// @ts-ignore: constructor function
item.pdeedhs = new Item({ id: 9025, name: '"Property Deed"', rar: 2, desc: 'This old looking legal document indentifies you as a sole owner of this broken down hut you live in. It was passed down to you by your ancestors, you speculate' + dom.dseparator + '<span style="color:lime">Allows you to list and examine your possessions</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        flags.hsedchk = true;
        if (global.current_l.id === 111) smove(chss.home, false)
        this.data.read = false;
        this.amount--;
      } else chss.trd.sl(this);
    }
  }
});
item.pdeedhs.data.time = 30;

// @ts-ignore: constructor function
item.fgtsb1 = new Item({ id: 9026, name: '"Street Fighting"', desc: 'Someone\'s observational notes of street gangs and their violent encounters. There\'s an amusing essay about dirty tricks in the front section' + dom.dseparator + '<span style="color:deeppink">Fighting EXP gain +15%</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        this.amount--;
        skl.fgt.p += .15;
        this.data.read = false;
        this.data.finished = true;
        giveItem(item.bookgen)
      } else chss.trd.sl(this);
    }
  }
});
item.fgtsb1.data.time = HOUR * 6;

// @ts-ignore: constructor function
item.jnlbk = new Item({ id: 9027, name: '"Empty Journal"', desc: 'Dusty old tome, pure as snow and untainted by ink. Feels like it was purified by magic. When you gaze upon it, you are compelled to record your encounters and anything else that you find important and crucial for your adventures' + dom.dseparator + '<span style="color:lime">Unlocks Journal</span>', stype: 4,
  use: function () {
    if (canRead()) {
      if (this.data.timep >= this.cmax) {
        msg('Journal Unlocked!', 'cyan');
        this.data.read = false;
        this.amount--;
        flags.jnlu = true;
        this.data.finished = true;
        dom.ct_bt6.innerHTML = 'journal'
      } else chss.trd.sl(this);
    }
  }
});
item.jnlbk.data.time = HOUR * 4;
