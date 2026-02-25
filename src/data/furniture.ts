// @ts-nocheck
import { furniture, quest, home, dom, global, you, item, sld, chss, skl, furn, sector, wpn, eqp, callback, creature } from '../state';
import { DAY } from '../constants';
import { smove, inSector } from '../game/movement';
import { giveItem } from '../game/inventory';
import { giveWealth } from '../game/economy';
import { giveExp } from '../game/progression';
import { msg } from '../ui/messages';
import { reduce } from '../ui/inventory';
import { attachCallback, detachCallback } from '../systems/weather';

// ==========================================================================
// Furniture constructor + instances
// ==========================================================================

function Furniture(cfg) {
  this.name = '';
  this.desc = '';
  this.data = {};
  this.id = 0;
  this.removable = false;
  this.use = function () { };
  this.onGive = function () { };
  this.onSelect = function () { };
  this.onRemove = function () { };
  this.onDestroy = function () { }
  this.activate = function () { };
  this.deactivate = function () { };
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}

furniture.cat = new Furniture({ id: 2, name: 'Cat', desc: 'Your best feline friend', data: { age: DAY * 15, c: 0, p: 0, l1: 0, l2: 0, amount: 0, named: false, sex: false, name: 'Cat', mood: 1 }, v: 1 });
furniture.cat.use = function () {
  this.data.age += global.timescale;
  this.data.mood = this.data.mood > 1 ? 1 : this.data.mood + .002;
}

furniture.frplc = new Furniture({ id: 3, name: 'Fireplace', desc: 'Comfy fireplace. You can light it up for various useful means, or just to warm up', data: { fuel: 0, amount: 0 }, v: 3 });
furniture.frplc.use = function () {
  if (this.data.fuel > 0) this.data.fuel--
}

furniture.bed1 = new Furniture({ id: 4, name: 'Straw Bedding', desc: 'A "bed" made from several layers of straw placed onto each other. Extremely itchy and isn\'t much better from sleeping on a rock', data: { amount: 0 }, sq: .1, v: 1 });
furniture.bed1.onGive = function () {
  if (!home.bed || home.bed.sq < this.sq) home.bed = this;
}

furniture.bed2 = new Furniture({ id: 5, removable: true, name: 'Plain Bed', desc: 'Crude planks cobbled together to form a container for a matress or such. Not a whole lot in terms of sleeping place, but somewhat better than a hard cold floor', data: { amount: 0 }, sq: 1, v: 5 });
furniture.bed2.onGive = function () {
  if (!home.bed || home.bed.sq < this.sq) home.bed = this;
}
furniture.bed2.onRemove = function () {
  home.bed = furniture.bed1;
  giveItem(item.bed2, 1, true);
}

furniture.tbwr1 = new Furniture({ id: 6, removable: true, name: 'Wooden Tableware', desc: 'Cheap massproduced tableware carved from wood. Kind of a pain to wash' + dom.dseparator + '<span style="color:deeppink">Gluttony EXP gain +5%</span>', data: { amount: 0 }, sq: 1, v: 3 });
furniture.tbwr1.activate = function () { if (home.tbw.id === this.id) skl.glt.p += .05 };
furniture.tbwr1.deactivate = function () { if (home.tbw.id === this.id) skl.glt.p -= .05 };
furniture.tbwr1.onGive = function () {
  if (!home.tbw || home.tbw.sq < this.sq) home.tbw = this;
}
furniture.tbwr1.onRemove = function () {
  giveItem(item.tbwr1, 1, true);
}

furniture.tbwr2 = new Furniture({ id: 7, removable: true, name: 'Clay Tableware', desc: 'Tableware made from hardened clay. Easy to make and doesn\'t cost very much', data: { amount: 0 }, v: 9 });
furniture.tbwr2.onGive = function () {

}

furniture.tbwr3 = new Furniture({ id: 8, removable: true, name: 'Ceramic Tableware', desc: 'Quality and shiny ceramic tableware. Though it is commonly available and not expensive, some prefer to display it on the shelves for decorative purposes', data: { amount: 0 }, v: 21 });
furniture.tbwr3.onGive = function () {

}

furniture.wvbkt = new Furniture({ id: 9, removable: true, name: 'Straw Basket', desc: 'Small woven basket. For storing stuff in', data: { amount: 0 } });
furniture.wvbkt.onRemove = function () {
  giveItem(item.wvbkt, 1, true);
}

furniture.strgbx = new Furniture({ id: 10, name: 'Storage Box', desc: 'Huge container with a secure padlock. You can put your possessions inside to keep them safe.', data: { amount: 0 }, v: 2 });

furniture.bblkt = new Furniture({ id: 11, removable: true, name: 'Ragwork Blanket', desc: 'More like a long sheet of cloth folded trice and stitched in. Barely offers any warmth, but keeps you from getting frostbites if it\'s windy' + dom.dseparator + '<span style="color:deeppink">Sleep EXP gain +50%</span>', data: { amount: 0 }, sq: 1, v: 2 });
furniture.bblkt.activate = function () { if (home.blkt.id === this.id) skl.sleep.p += .5 };
furniture.bblkt.deactivate = function () { if (home.blkt.id === this.id) skl.sleep.p -= .5 };
furniture.bblkt.onGive = function () {
  if (!home.blkt || home.blkt.sq < this.sq) home.blkt = this;
}
furniture.bblkt.onRemove = function () {
  giveItem(item.bblkt, 1, true);
}

furniture.spillw = new Furniture({ id: 12, removable: true, name: 'Straw Pillow', desc: 'More like a healthy dose of dry grass in a sack. Uneven, hard, itchy, and probably bad for your neck. Despite that, it still passes as a basic tool of comfort' + dom.dseparator + '<span style="color:deeppink">Sleep EXP gain +30%</span>', data: { amount: 0 }, sq: 1, v: 3 });
furniture.spillw.activate = function () { if (home.pilw.id === this.id) skl.sleep.p += .3 };
furniture.spillw.deactivate = function () { if (home.pilw.id === this.id) skl.sleep.p -= .3 };
furniture.spillw.onGive = function () {
  if (!home.pilw || home.pilw.sq < this.sq) home.pilw = this;
}
furniture.spillw.onRemove = function () {
  giveItem(item.spillw, 1, true);
}

furniture.cyrn = new Furniture({ id: 13, removable: true, name: 'Yarn Ball', desc: 'Fluffy ball of yarn which is normally used as a material for knitting. Cats love these and often claim them as toys' + dom.dseparator + '<span style="color:deeppink">Patting EXP gain +15%</span><br><span style="color:springgreen">Passive Patting EXP +0.5</span>', data: { amount: 0 }, v: 3 });
furniture.cyrn.activate = function () { skl.pet.p += .15; you.mods.petxp += .25 };
furniture.cyrn.deactivate = function () { skl.pet.p -= .15; you.mods.petxp -= .25 };
furniture.cyrn.onRemove = function () {
  giveItem(item.cyrn, 1, true);
}

furniture.fwdpile = new Furniture({ id: 14, removable: true, name: 'Firewood Pile', data: { amount: 0, fuel: 5 }, v: 5 });
furniture.fwdpile.desc = function () {
  return 'Stockpile of firewood neatly packed together for easy storage' + dom.dseparator + '<span style="color:orange">Automatically supplies fireplace, but needs refueling</span><br>' + '<div style="color:yellow"><br>Supply: <br><span>0</span><span style="display:inline-table;width:130px;border:1px solid darkgrey;margin: 7px;background-color:orange"><span style="display:block;background-color:black;float:right;width:' + (100 - this.data.fuel / (this.data.amount * 5) * 100) + '%">　</span></span><span>' + 5 * this.data.amount + '</span></div>'
}
furniture.fwdpile.onRemove = function () {
  giveItem(item.fwdpile, 1, true);
}
furniture.fwdpile.onSelect = function () {
  let f = item.fwd1;
  if (f.amount === 0) { msg('No firewood!', 'orange'); return }
  if (this.data.fuel === this.data.amount * 5) { msg('Firewood pile is full', 'cyan'); return } else {
    let n = this.data.amount * 5 - this.data.fuel;
    if (f.amount < n) n = f.amount;
    this.data.fuel += n;
    reduce(f, n);
  }
}


furniture.bookgen = new Furniture({ id: 15, removable: true, name: 'Book', data: { amount: 0, p: 0 }, v: 0.1 });
furniture.bookgen.desc = function () { return 'Book which you\'ve already read. It doesn\'t contain any new useful information' + dom.dseparator + '<span style="color:deeppink">Literacy EXP gain +1%</span><br><br><small style="color:deeppink">Current:<span style="color:orange"> +' + Math.round(furniture.bookgen.data.p * 100) + '%</span></small>' }
furniture.bookgen.activate = function () { skl.rdg.p += this.data.p };
furniture.bookgen.deactivate = function () { skl.rdg.p -= this.data.p };
furniture.bookgen.onGive = function () { ; if (inSector(sector.home) && this.active) skl.rdg.p += .01; this.data.p += .01; }
furniture.bookgen.onRemove = function () {
  giveItem(item.bookgen, 1, true);
  if (inSector(sector.home) && this.active) skl.rdg.p -= .01;
  this.data.p -= .01
}

// ==========================================================================
// Quest constructor + instances
// ==========================================================================

function Quest(cfg) {
  this.name = 'dummy';
  this.desc = 'dummy';
  this.cond = 'dummy';
  this.tracker = function () { };
  this.fpending = function () { };
  this.init = function () { };
  this.check = function () { };
  this.id = 0;
  this.rwd = function () { };
  this.data = { started: false, done: false, pending: false, toup: false };
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}

quest.test = new Quest({ id: 1, name: 'test', desc: 'find 10' });
quest.test.init = function () { this.data.itm = item.rwmt1; this.data.started = true; };
quest.test.tracker = function () { if (this.data.itm.amount >= 10) this.data.pending = true; else { this.data.pending = false; this.data.toup = true }; };
quest.test.fpending = function () { msg('10 item found'); this.data.toup = false };
quest.test.rwd = function () { this.data.done = true; this.data.pending = false; msg('done'); };

quest.fwd1 = new Quest({ id: 2, name: 'Firewood Gathering', rar: 1, desc: 'Secure 10 bundles of firewood for hunter Yamato', loc: 'Western Woods, Hunter\'s Lodge' });
quest.fwd1.rwd = function () { you.karma++; giveWealth(100); giveItem(sld.bkl); smove(chss.frstn1b1, false); giveExp(15000, true, true, true) }
quest.fwd1.goals = function () {
  let c;
  if (item.fwd1.amount >= 10) c = 'lime';
  else if (item.fwd1.amount < 10 && item.fwd1.amount > 0) c = 'yellow';
  else if (item.fwd1.amount <= 0) c = 'red';
  let txt = 'Firewood collected: <span style="color: ' + c + '">' + item.fwd1.amount + '/10</span>';
  return [txt];
}
quest.fwd1.goalsf = function () {
  return ['Firewood collected: <span style="color:lime">10/10</span>'];
}

quest.hnt1 = new Quest({ id: 3, name: 'First Hunt', rar: 1, desc: 'Hunt for 10 peices of meat for hunter Yamato', loc: 'Western Woods, Hunter\'s Lodge' });
quest.hnt1.rwd = function () { you.karma++; giveWealth(130); giveItem(item.jrk1, 10); giveExp(12000, true, true, true) }
quest.hnt1.goals = function () {
  let c;
  if (item.rwmt1.amount >= 10) c = 'lime';
  else if (item.rwmt1.amount < 10 && item.rwmt1.amount > 0) c = 'yellow';
  else if (item.rwmt1.amount <= 0) c = 'red';
  let txt = 'Raw meat collected: <span style="color: ' + c + '">' + item.rwmt1.amount + '/10</span>';
  return [txt];
}
quest.hnt1.goalsf = function () {
  return ['Raw meat collected: <span style="color:lime">10/10</span>'];
}


quest.grds1 = new Quest({ id: 4, name: 'Guarding Duty', rar: 1, loc: 'Village Center, Marketplace Entry Gate', desc: 'You were tasked with guarding duty to watch over marketplace', repeatable: true });
quest.grds1.rwd = function () { this.data.t++; giveWealth(65); giveExp(3000, true, true, true); global.stat.jcom++ };
quest.grds1.goals = function () {
  return ['Guard the gate until 8PM (<span style="color:yellow">in progress</span>)']
}
quest.grds1.goalsf = function () {
  return ['Guard the gate until 8PM (<span style="color:lime">done!</span>)']
}


quest.lmfstkil1 = new Quest({ id: 5, name: 'Monster Eradication', rar: 1, loc: 'Western Woods, Hunter\'s Lodge', desc: 'Dangerous monsters have invaded the southern forest and terrorizing the villagers. Get rid of them!', data: { t: 0, mkilled: 0 } });
quest.lmfstkil1.init = function () { this.callback() }
quest.lmfstkil1.callback = function () {
  if (!quest.lmfstkil1.data.done) attachCallback(callback.onDeath, {
    f: function (victim, killer) {
      if (victim.id === creature.wolf1.id) quest.lmfstkil1.data.mkilled++;
      if (quest.lmfstkil1.data.mkilled && !quest.lmfstkil1.data.weird1 && quest.lmfstkil1.data.mkilled >= 35) { msg('You hear a piercing wail', 'red'); quest.lmfstkil1.data.weird1 = true; smove(chss.frstn3main) }
    },
    id: 1005,
    data: { q: true }
  })
}
quest.lmfstkil1.rwd = function () { this.data.t++; giveWealth(300); giveItem(wpn.gsprw); giveItem(eqp.nkgd); giveExp(18000, true, true, true); detachCallback(callback.onDeath, 1005); }
quest.lmfstkil1.goals = function () {
  let c;
  if (quest.lmfstkil1.data.mkilled >= 35) c = 'lime';
  else if (quest.lmfstkil1.data.mkilled < 35) c = 'yellow';
  let txt = 'Wolves killed: <span style="color: ' + c + '">' + quest.lmfstkil1.data.mkilled + '/35</span>';
  return [txt];
}
quest.lmfstkil1.goalsf = function () {
  return ['Wolves killed: <span style="color:lime">35/35</span>'];
}
