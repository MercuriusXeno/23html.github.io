import { effect, you, global, dom, skl, timers, furn, furniture, item } from '../state';
import { select } from '../utils';
import { random, rand, randf } from '../random';
import { findbyid } from '../utils';
import { giveSkExp, giveExp } from '../game/progression';
import { msg } from '../ui/messages';
import { giveEff, removeEff } from '../ui/effects';
import { update_d } from '../ui/stats';
import { rsort } from '../ui/inventory';

// ==========================================================================
// Effect constructor + instances
// ==========================================================================

function Effect(cfg) {
  this.name = 'dummy';
  this.desc = '';
  this.type = 0;
  // 1 - on attack; 2 - on stat refersh; 3 - on tick; 4 - decor? 5 - stat mod? 6 - tickstat
  this.x;
  this.c;
  this.b;
  this.y;
  this.z;
  this.target
  this.duration;
  this.timer_o;
  this.active = false;
  this.use = function (y, z) { };
  this.un = function (x, y, z) { };
  this.mods = function () { }
  this.onGive = function () { };
  this.onRemove = function (x) { };
  this.onClick = function () { }
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}

effect.test1 = new Effect({ name: 'Beast killer', desc: 'Attacks against beast type creatures are 30% more effective', type: 1 });
effect.test1.use = function () {
  if (global.current_m.type === 1) { you.str = Math.round(you.str * 1.3); }
}

effect.bk1 = new Effect({ type: 1 });
effect.bk1.use = function () {
  if (global.current_m.type === 1) { you.dmlt += .2 }
}

effect.strawp = new Effect({ type: 2 });
effect.strawp.use = function () { you.satmax += 50; you.sat += 50 }
effect.strawp.un = function () { you.sat -= 50 }
effect.strawp.noGive = function () { msg('You feel ready for the future', 'ornage') };

effect.psn = new Effect({ id: 1, name: 'Poison', desc: 'Depletes health each second', type: 3, atype: 1, duration: 5, x: '毒', c: 'red', b: 'darkmagenta' });
effect.psn.onGive = function (x, y) {
  if (!this.active) { if (this.target.id === you.id) msg('You have been poisoned!', 'darkmagenta') }
  else {
    this.y = Math.ceil((this.y + y) / 2);
    this.duration += x * .7 << 0
  }
}
effect.psn.use = function (y, z) {
  this.duration--;
  var dmg = y || 1;
  this.power = y;
  if (this.target.id === you.id) {
    if (effect.psnwrd.active === false) {
      giveSkExp(skl.poisr, this.power * .1);
      dmg *= Math.ceil(1 - skl.poisr.use());
      giveSkExp(skl.painr, this.power * .05);
      global.stat.dmgrt += dmg;
      if (you.hp - dmg > 0) you.hp -= dmg;
      else { you.hp = 0; removeEff(this); this.duration = 5; you.onDeath(); global.atkdfty = [2, 1] }
      dom.d5_1_1.update();
    }
  }
  else {
    if (this.target.hp - dmg > 0) this.target.hp -= dmg;
    else { this.target.hp = 0; removeEff(this, this.target); this.duration = 5; global.atkdftm = [-1, -1, 1]; this.target.onDeath(you); global.stat.indkill++ }
    dom.d5_1_1m.update();
  }
  if (this.duration === 0) {
    removeEff(this, this.target); this.duration = 5;
  }
}

effect.vnm = new Effect({ id: 2, name: 'Venom', desc: 'Depletes health each second', type: 3, atype: 1, duration: 15, x: '毒', c: 'blue', b: 'red' });
effect.vnm.onGive = function (x, y) {
  if (!this.active) { if (this.target.id === you.id) msg('You have been badly poisoned!', 'darkmagenta') }
  else {
    this.y = Math.ceil((this.y + y) / 1.5);
    this.duration += x * .5 << 0
  }
}
effect.vnm.use = function (y, z) {
  this.duration--;
  var dmg = y;
  this.power = y;
  if (this.target.id === you.id) {
    if (effect.psnwrd2.active === false) {
      giveSkExp(skl.poisr, this.power * .1);
      dmg *= Math.ceil(1 - (skl.poisr.use() * .3));
      giveSkExp(skl.painr, this.power * .2);
      global.stat.dmgrt += dmg;
      if (you.hp - dmg > 0) you.hp -= dmg;
      else { you.hp = 0; removeEff(this); this.duration = 5; you.onDeath(); global.atkdfty = [2, 2] }
      dom.d5_1_1.update();
    }
  }
  else {
    if (this.target.hp - dmg > 0) this.target.hp -= dmg;
    else { this.target.hp = 0; removeEff(this, this.target); this.duration = 5; global.atkdftm = [-1, -1, 1]; this.target.onDeath(you); global.stat.indkill++ }
    dom.d5_1_1m.update();
  }
  if (this.duration === 0) {
    removeEff(this, this.target); this.duration = 5;
  }
}

effect.psnwrd = new Effect({ id: 3, name: 'Poison block', desc: 'Weak poisons have no effect on you', type: 3, duration: 600, x: '＋', c: 'lime', b: 'darkmagenta' });
effect.psnwrd.onGive = function () { msg('You feel safer', 'lime') };
effect.psnwrd.use = function () {
  if (--this.duration === 0) { removeEff(this); this.duration = 600; };
}

effect.psnwrd2 = new Effect({ id: 4, name: 'Venom block', desc: 'Severe poisons have no effect on you', type: 3, duration: 600, x: '＋', c: 'lime', b: 'magenta' });
effect.psnwrd2.onGive = function () { msg('You feel much safer', 'lime') };
effect.psnwrd2.use = function () {
  if (--this.duration === 0) { removeEff(this); this.duration = 600; };
}

effect.imm = new Effect({ id: 5, name: 'Immortality', desc: 'Eternal life', type: 2, duration: 0, x: '￥', c: 'gold', b: 'navy' });
effect.imm.use = function () {
}

effect.snch = new Effect({ id: 6, name: 'Sun blessing', desc: 'You are blessed by Sun', type: 2, eq: true, duration: -1, x: '☼', c: 'gold', b: 'blue' });
effect.snch.onGive = function () {
  if (global.flags.loadstate) {
    you.str += 5;
    you.sat += 100;
    you.spd += 1;
    you.hpmax += 100;
    you.satmax += 100
    you.int += 5;
    you.str_d += 5;
    you.agl_d += 5;
    you.agl += 5;
    you.int_d += 5;
    global.flags.snch = true;
  }
};
effect.snch.use = function () {
  if (global.flags.isday === true) {
    if (!global.flags.snch) {
      you.str += 5;
      you.sat += 100;
      you.spd += 1;
      you.hpmax += 100;
      you.satmax += 100
      you.int += 5;
      you.str_d += 5;
      you.agl_d += 5;
      you.agl += 5;
      you.int_d += 5;
      global.flags.snch = true;
    }
  }
  timers.snch = setInterval(function () {
    if (global.flags.isday === true) {
      if (!global.flags.snch) {
        you.str += 5;
        you.sat += 100;
        you.spd += 1;
        you.hpmax += 100;
        you.satmax += 100
        you.int += 5;
        you.str_d += 5;
        you.agl_d += 5;
        you.agl += 5;
        you.int_d += 5;
        global.flags.snch = true;
        update_d();
      }
    } else {
      if (global.flags.snch === true) {
        effect.snch.un();
        you.stat_r();
        update_d();
      }
    }
  }, 1000)
}
effect.snch.un = function () {
  clearInterval(timers.snch);
  if (global.flags.snch === true) { you.sat -= 100; global.flags.snch = false; }
}


effect.mnch = new Effect({ id: 7, name: 'Moon blessing', desc: 'You are blessed by Moon', type: 2, eq: true, duration: -1, x: '☽', c: 'gold', b: 'purple' });
effect.mnch.onGive = function () {
  if (global.flags.loadstate) {
    you.str += 5;
    you.sat += 100;
    you.spd += 1;
    you.hpmax += 100;
    you.satmax += 100
    you.int += 5;
    you.str_d += 5;
    you.agl_d += 5;
    you.agl += 5;
    you.int_d += 5;
    global.flags.mnch = true;
  }
};
effect.mnch.use = function () {
  if (global.flags.isday === false) {
    if (!global.flags.mnch) {
      you.str += 5;
      you.sat += 100;
      you.spd += 1;
      you.hpmax += 100;
      you.satmax += 100
      you.int += 5;
      you.str_d += 5;
      you.agl_d += 5;
      you.agl += 5;
      you.int_d += 5;
      global.flags.mnch = true;
    }
  }
  timers.mnch = setInterval(function () {
    if (global.flags.isday === false) {
      if (!global.flags.mnch) {
        you.str += 5;
        you.sat += 100;
        you.spd += 1;
        you.hpmax += 100;
        you.satmax += 100
        you.int += 5;
        you.str_d += 5;
        you.agl_d += 5;
        you.agl += 5;
        you.int_d += 5;
        global.flags.mnch = true;
        update_d();
      }
    } else {
      if (global.flags.mnch === true) {
        effect.mnch.un();
        you.stat_r();
        update_d();
      }
    }
  }, 1000)
}
effect.mnch.un = function () {
  clearInterval(timers.mnch);
  if (global.flags.mnch === true) { you.sat -= 100; global.flags.mnch = false; }
}

effect.fpn = new Effect({ id: 8, name: 'Food poisoning', desc: 'From eating something bad', type: 3, duration: 30, x: '«', c: 'lime', b: 'grey' });
effect.fpn.onGive = function () { msg(select(['You feel bad inside', 'Your stomach bothers you']), 'green') };
effect.fpn.use = function (y, z) {
  if (you.sat > 0) giveSkExp(skl.fdpnr, 1); giveSkExp(skl.painr, 1);
  this.duration--;
  let dmg = randf(1, 3) * (1 - skl.fdpnr.use());
  if (you.sat > 0) you.sat - dmg >= 0 ? you.sat -= dmg : you.sat = 0;
  dom.d5_1_1.update();
  if (this.duration === 0) { removeEff(this); this.duration = 30; }
}

effect.wet = new Effect({ id: 9, name: 'Wet', desc: 'You\'re drenched in water', type: 3, duration: 5, x: '雨', c: 'cyan', b: 'blue' });
effect.wet.onGive = function () { if (this.target.id === you.id) { msg('Your clothes get soaked', 'cyan', null, null, 'blue'); global.flags.iswet = true } };
effect.wet.onRemove = function () { msg('You dry up', 'orange'); global.flags.iswet = false };
effect.wet.use = function () {
  if (global.flags.inside === false && global.flags.israin === true && !you.mods.rnprtk) this.duration += 6;
  if (this.target.id === you.id) {
    if (you.sat > 0) giveSkExp(skl.abw, .05);
    effect.fplc.active === true ? this.duration -= 15 : this.duration--;
  }
  else this.duration--;
  if (this.duration > 600) this.duration = 600;
  if (this.duration <= 0) { removeEff(this, this.target); this.duration = 5; };
}

effect.fplc = new Effect({ id: 10, save: false, name: 'Fireplace Aura', desc: 'You\'re feeling the warmth of the fireplace', type: 3, duration: 2, x: '火', c: 'yellow', b: 'crimson' });
effect.fplc.onGive = function () { you.mods.ckfre += 1; };
effect.fplc.use = function () {
  var fire = findbyid(furn, furniture.frplc.id);
  this.duration = fire.data.fuel;
  giveSkExp(skl.abf, .2);
  if (this.duration === 0) {
    removeEff(this); this.duration = 2;
    rsort(global.rm);
  }
}
effect.fplc.onRemove = function () { you.mods.ckfre -= 1; };

effect.cdlt = new Effect({ id: 11, name: 'Candlelight', desc: 'You\'re carrying a candle. The surroundings are lit up', type: 3, duration: 360, x: '❛', c: 'gold', b: '#440205' });
effect.cdlt.use = function () {
  if (--this.duration === 0) { removeEff(this); this.duration = 360; }
}
effect.cdlt.onGive = function () { you.mods.light += 1; };
effect.cdlt.onRemove = function () { you.mods.light -= 1; };


effect.tst2 = new Effect({ id: 12, name: 'STR+', desc: 'STR+', type: 2, duration: 0, x: 'X', c: 'RED', b: 'WHITE' });
effect.tst2.use = function () {
  you.str *= .5;
  you.str_d *= .5
}

effect.slep = new Effect({ id: 13, name: 'Sleep', desc: 'You are fast asleep', type: 4, duration: -1, x: 'z', c: 'white', b: 'dimgray' });
effect.slep.use = function () {
}

effect.bled = new Effect({ id: 14, name: 'Bleeding', desc: 'Depletes health each second', type: 3, atype: 1, duration: 5, x: '血', c: 'red', b: 'darkred' });
effect.bled.onGive = function (x, y) {
  if (!this.active) { if (this.target.id === you.id) msg('You\'re losing blood!', 'red') }
  else {
    this.y = Math.ceil(this.y + y * .2 + 1);
    this.duration += x * .9 << 0
  }
}
effect.bled.use = function (y, z) {
  this.duration--;
  this.power = y;
  let dmg = this.power;
  dmg = Math.ceil(rand(dmg * .6, dmg * 1.4));
  if (this.target.id === you.id) {
    giveSkExp(skl.bledr, this.power * .1);
    dmg *= Math.ceil(1 - skl.bledr.use());
    global.stat.dmgrt += dmg;
    if (you.hp - dmg > 0) you.hp -= dmg;
    else { you.hp = 0; removeEff(this); this.duration = 5; you.onDeath(); global.atkdfty = [2, 3] }
    dom.d5_1_1.update();
  }
  else { if (this.target.hp - dmg > 0) this.target.hp -= dmg; else { this.target.hp = 0; removeEff(this, this.target); this.duration = 5; this.target.onDeath(you); global.stat.indkill++ } }
  if (this.duration === 0) { removeEff(this, this.target); this.duration = 5; };
}
effect.bled.onClick = function () {
  return;
  let it;
  if (item.bdgh.have) item.bdgh.use();
}

effect.tarnish = new Effect({ id: 15, name: 'Tarnished', desc: 'Equipment usability -30%', type: 4, duration: -1, x: '≠', c: 'purple', b: 'grey' });
effect.tarnish.onGive = function () { msg('Your equipment cracks', 'purple') };
effect.tarnish.use = function (y, z) {
}

effect.prostasia = new Effect({ id: 16, name: 'Prostasía', desc: 'Equipment usability +30%', type: 4, duration: -1, x: '≒', c: 'midnightblue', b: 'skyblue' });
effect.prostasia.onGive = function () { msg('You feel secure', 'skyblue') };
effect.prostasia.use = function (y, z) {
}

effect.incsk = new Effect({ id: 17, name: 'Incense Aroma', desc: 'Your senses are enhanced', type: 3, duration: 600, x: 'Í', c: 'gold', b: '#440205' });
effect.incsk.use = function () {
  if (--this.duration === 0) { removeEff(this); this.duration = 600; }
}

effect.run = new Effect({ id: 18, name: 'Running', desc: 'You\'re jogging', type: 4, duration: -1, x: '走', c: 'black', b: 'skyblue' });

effect.drunk = new Effect({ id: 19, name: 'Inebriated', desc: 'You\'re feeling drunk from alcohol', type: 5, duration: 15, x: '酒', c: 'darkred', b: 'orange' });
effect.drunk.use = function () {
  if (--this.duration === 0) removeEff(this);
}
effect.drunk.mods = function () { you.agle /= 1 + (.4 - skl.drka.lvl * .03); you.stre *= 1 + (.2 + skl.drka.lvl * .02); you.inte /= 1 + (.5 - skl.drka.lvl * .04) }
effect.drunk.onGive = function () { msg('You\'re feeling tipsy', 'chocolate') };
effect.drunk.onRemove = function () { msg('You sober up', 'orange') };

effect.virus = new Effect({ id: 20, name: 'Virus', desc: 'You are contaminated', type: 5, duration: -1, x: '⁑', c: 'black', b: 'lightgrey' });
effect.virus.use = function () {
}
effect.virus.mods = function () { you.agle /= 1.1; you.stre /= 1.1; you.sat -= 70; you.sata -= 70 }
effect.virus.onGive = function () { msg('You feel bad', 'grey') };
effect.virus.onRemove = function () { msg('You feel better', 'orange') };

effect.scout = new Effect({ id: 21, name: 'Investigating', desc: 'You\'re exploring your surroundings', type: 4, duration: -1, x: 'ǔ', c: 'aquamarine', b: 'teal' });

effect.invgrt = new Effect({ id: 22, name: 'Invigorate', desc: 'Your joints feel flexible', type: 3, duration: -1, x: 'ℐ', c: 'yellowgreen', b: 'darkgreen' });
effect.invgrt.onGive = function () { if (!this.active) { msg(this.target.id === you.id ? 'You become nimble' : (this.target.name + ' becomes nimble'), 'green'); this.target.aglm += .3 } }
effect.invgrt.onRemove = function () { this.target.aglm -= .3 }
effect.invgrt.use = function () {
  if (--this.duration === 0) {
    removeEff(this); this.duration = 5;
  };
}

effect.fei1 = new Effect({ id: 23, name: 'Fei poisoning', desc: 'Fei impurities attack your flesh', type: 3, duration: 60, x: '⇔', c: 'magenta', b: '#520090' });
effect.fei1.onGive = function (x, y) {
  if (!this.active) { msg('Your body is fighting against the impurities', 'darkmagenta', null, null, 'grey'); this.power = y }
  else { this.power += y; this.duration += 30 }
}
effect.fei1.use = function (y) {
  this.duration--;
  giveSkExp(skl.crptr, 1);
  giveSkExp(skl.painr, this.power);
  let dmg = (this.power * 5 * (1 - skl.crptr.lvl * .05)) << 0;
  global.stat.dmgrt += dmg;
  if (you.hp - dmg > 0) you.hp -= dmg;
  else { you.hp = 0; removeEff(this); you.onDeath(); global.atkdfty = [2, 4]; msg("You fail to purify the pill", 'darkgrey') }
  dom.d5_1_1.update();
  if (this.duration === 0) { removeEff(this, this.target); this.duration = 5; msg("You have successfully purified the pill!", 'lime'); giveExp(this.power * 5000 + (this.power > 1 ? (this.power * .15 * 5000) : 0), true, true, true) }
}

effect.cold = new Effect({ id: 24, name: 'Cold', desc: 'You\'re freezing', type: 5, duration: 5, x: '冷', c: '#88a', b: '#eef' });
effect.cold.mods = function () { you.agle /= 1.1; you.stre /= 1.1; you.hpe /= 1.1; you.sate /= 1.05 }
effect.cold.onGive = function () { if (this.target.id === you.id) msg('You feel colder', 'blue', null, null, 'cyan'); };
effect.cold.onRemove = function () { if (this.target.id === you.id) msg('You\'re warming up', 'orange'); };
effect.cold.use = function () {
  if (this.target.id === you.id) {
    giveSkExp(skl.abw, .01);
    giveSkExp(skl.coldr, .01);
    effect.fplc.active === true ? this.duration -= 15 : this.duration--;
    effect.wet.active ? global.stat.coldnt += 6 : global.stat.coldnt += 2;
    if (effect.fbite.active) effect.fbite.duration += 5;
    else if (global.stat.coldnt >= 460) giveEff(you, effect.fbite, 20);
    if (global.stat.coldnt > 0) global.stat.coldnt--
  }
  else this.duration--;
  if (this.duration > 600) this.duration = 600;
  if (this.duration <= 0) { removeEff(this, this.target); this.duration = 5; };
}

effect.smoke = new Effect({ id: 25, name: 'Smoke', desc: 'Thick smoke abstructs your lungs', type: 3, duration: 5, x: '煙', c: 'grey', b: 'lightgrey' });
effect.smoke.onGive = function () { if (this.target.id === you.id) { msg('You breathe heavily', 'grey') } };
effect.smoke.onRemove = function () { msg('Your lungs feel lighter', 'orange') };
effect.smoke.use = function () {
  if (this.target.id === you.id) {
    if (random() < .1) {
      msg(select(['*Cough..*', '*Hack..*', '*Cough-cough..*', '*Khe..*'], 'grey'));
      giveSkExp(skl.painr, rand(0.5, 5));
      if (you.hp > 50) you.hp -= (rand(5, 35) + you.hp * (rand(.01, .05)));
      dom.d5_1_1.update();
    }
  }
  this.duration--;
  if (this.duration <= 0) { removeEff(this, this.target); this.duration = 5; }
}

effect.fbite = new Effect({ id: 26, name: 'Hypothermia', desc: 'Your limbs are suffering from frostbites', type: 5, duration: 5, x: '凍', c: 'red', b: '#aaf' });
effect.fbite.mods = function () { you.agle /= 1.15; you.stre /= 1.2; you.hpe /= 1.2; you.sate /= 1.1 }
effect.fbite.onGive = function () { if (this.target.id === you.id) msg('Sharp pain stings you', 'red', null, null, 'cyan') };
effect.fbite.onRemove = function () { if (this.target.id === you.id) { msg('You aren\'t freezing anymore', 'orange'); global.stat.coldnt = 0 } };
effect.fbite.use = function () {
  if (this.target.id === you.id) {
    giveSkExp(skl.coldr, .05);
    effect.fplc.active === true ? this.duration -= 5 : this.duration--;
    if (random() < .3) {
      giveSkExp(skl.painr, rand(0.2, 1));
      if (you.hp > 50) you.hp -= (rand(5, 20));
      dom.d5_1_1.update();
    }
  }
  else this.duration--;
  if (this.duration > 900) this.duration = 900;
  if (this.duration <= 0) { removeEff(this, this.target); this.duration = 5; };
}
