import { effect, global, settings, dom, skl, timers, furn, furniture, item, flags, stats, combat, } from '../state';
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

function Effect(this: any, cfg: any) {
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
  this.use = function (_player: any, y: any, z: any) { };
  this.un = function (_player: any, x: any, y: any, z: any) { };
  this.mods = function (_player: any) { }
  this.onGive = function (_player: any) { };
  this.onRemove = function (_player: any, x: any) { };
  this.onClick = function (_player: any) { }
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}

// @ts-ignore: constructor function
effect.test1 = new Effect({ name: 'Beast killer', desc: 'Attacks against beast type creatures are 30% more effective', type: 1,
  use: function (player: any) {
    if (combat.current_m.type === 1) { player.str = Math.round(player.str * 1.3); }
  }
});

// @ts-ignore: constructor function
effect.bk1 = new Effect({ type: 1,
  use: function (player: any) {
    if (combat.current_m.type === 1) { player.dmlt += .2 }
  }
});

// @ts-ignore: constructor function
effect.strawp = new Effect({ type: 2,
  use: function (player: any) { player.satmax += 50; player.sat += 50 },
  un: function (player: any) { player.sat -= 50 },
  noGive: function () { msg('You feel ready for the future', 'ornage') }
});

// @ts-ignore: constructor function
effect.psn = new Effect({ id: 1, name: 'Poison', desc: 'Depletes health each second', type: 3, atype: 1, duration: 5, x: '毒', c: 'red', b: 'darkmagenta',
  onGive: function (player: any, x: any, y: any) {
    if (!this.active) { if (this.target.id === player.id) msg('You have been poisoned!', 'darkmagenta') }
    else {
      this.y = Math.ceil((this.y + y) / 2);
      this.duration += x * .7 << 0
    }
  },
  use: function (player: any, y: any, z: any) {
    this.duration--;
    var dmg = y || 1;
    this.power = y;
    if (this.target.id === player.id) {
      if (effect.psnwrd.active === false) {
        giveSkExp(skl.poisr, this.power * .1);
        dmg *= Math.ceil(1 - skl.poisr.use());
        giveSkExp(skl.painr, this.power * .05);
        stats.dmgrt += dmg;
        if (player.hp - dmg > 0) player.hp -= dmg;
        else { player.hp = 0; removeEff(this); this.duration = 5; player.onDeath(); combat.atkdfty = [2, 1] }
        dom.d5_1_1.update();
      }
    }
    else {
      if (this.target.hp - dmg > 0) this.target.hp -= dmg;
      else { this.target.hp = 0; removeEff(this, this.target); this.duration = 5; combat.atkdftm = [-1, -1, 1]; this.target.onDeath(player); stats.indkill++ }
      dom.d5_1_1m.update();
    }
    if (this.duration === 0) {
      removeEff(this, this.target); this.duration = 5;
    }
  }
});

// @ts-ignore: constructor function
effect.vnm = new Effect({ id: 2, name: 'Venom', desc: 'Depletes health each second', type: 3, atype: 1, duration: 15, x: '毒', c: 'blue', b: 'red',
  onGive: function (player: any, x: any, y: any) {
    if (!this.active) { if (this.target.id === player.id) msg('You have been badly poisoned!', 'darkmagenta') }
    else {
      this.y = Math.ceil((this.y + y) / 1.5);
      this.duration += x * .5 << 0
    }
  },
  use: function (player: any, y: any, z: any) {
    this.duration--;
    var dmg = y;
    this.power = y;
    if (this.target.id === player.id) {
      if (effect.psnwrd2.active === false) {
        giveSkExp(skl.poisr, this.power * .1);
        dmg *= Math.ceil(1 - (skl.poisr.use() * .3));
        giveSkExp(skl.painr, this.power * .2);
        stats.dmgrt += dmg;
        if (player.hp - dmg > 0) player.hp -= dmg;
        else { player.hp = 0; removeEff(this); this.duration = 5; player.onDeath(); combat.atkdfty = [2, 2] }
        dom.d5_1_1.update();
      }
    }
    else {
      if (this.target.hp - dmg > 0) this.target.hp -= dmg;
      else { this.target.hp = 0; removeEff(this, this.target); this.duration = 5; combat.atkdftm = [-1, -1, 1]; this.target.onDeath(player); stats.indkill++ }
      dom.d5_1_1m.update();
    }
    if (this.duration === 0) {
      removeEff(this, this.target); this.duration = 5;
    }
  }
});

// @ts-ignore: constructor function
effect.psnwrd = new Effect({ id: 3, name: 'Poison block', desc: 'Weak poisons have no effect on you', type: 3, duration: 600, x: '＋', c: 'lime', b: 'darkmagenta',
  onGive: function (player: any) { msg('You feel safer', 'lime') },
  use: function (player: any) {
    if (--this.duration === 0) { removeEff(this); this.duration = 600; };
  }
});

// @ts-ignore: constructor function
effect.psnwrd2 = new Effect({ id: 4, name: 'Venom block', desc: 'Severe poisons have no effect on you', type: 3, duration: 600, x: '＋', c: 'lime', b: 'magenta',
  onGive: function (player: any) { msg('You feel much safer', 'lime') },
  use: function (player: any) {
    if (--this.duration === 0) { removeEff(this); this.duration = 600; };
  }
});

// @ts-ignore: constructor function
effect.imm = new Effect({ id: 5, name: 'Immortality', desc: 'Eternal life', type: 2, duration: 0, x: '￥', c: 'gold', b: 'navy',
  use: function (player: any) {
  }
});

// @ts-ignore: constructor function
effect.snch = new Effect({ id: 6, name: 'Sun blessing', desc: 'You are blessed by Sun', type: 2, eq: true, duration: -1, x: '☼', c: 'gold', b: 'blue',
  onGive: function (player: any) {
    if (flags.loadstate) {
      player.str += 5;
      player.sat += 100;
      player.spd += 1;
      player.hpmax += 100;
      player.satmax += 100
      player.int += 5;
      player.str_d += 5;
      player.agl_d += 5;
      player.agl += 5;
      player.int_d += 5;
      flags.snch = true;
    }
  },
  use: function (player: any) {
    if (flags.isday === true) {
      if (!flags.snch) {
        player.str += 5;
        player.sat += 100;
        player.spd += 1;
        player.hpmax += 100;
        player.satmax += 100
        player.int += 5;
        player.str_d += 5;
        player.agl_d += 5;
        player.agl += 5;
        player.int_d += 5;
        flags.snch = true;
      }
    }
    timers.snch = setInterval(function () {
      if (flags.isday === true) {
        if (!flags.snch) {
          player.str += 5;
          player.sat += 100;
          player.spd += 1;
          player.hpmax += 100;
          player.satmax += 100
          player.int += 5;
          player.str_d += 5;
          player.agl_d += 5;
          player.agl += 5;
          player.int_d += 5;
          flags.snch = true;
          update_d();
        }
      } else {
        if (flags.snch === true) {
          effect.snch.un(player);
          player.stat_r();
          update_d();
        }
      }
    }, 1000)
  },
  un: function (player: any) {
    clearInterval(timers.snch);
    if (flags.snch === true) { player.sat -= 100; flags.snch = false; }
  }
});


// @ts-ignore: constructor function
effect.mnch = new Effect({ id: 7, name: 'Moon blessing', desc: 'You are blessed by Moon', type: 2, eq: true, duration: -1, x: '☽', c: 'gold', b: 'purple',
  onGive: function (player: any) {
    if (flags.loadstate) {
      player.str += 5;
      player.sat += 100;
      player.spd += 1;
      player.hpmax += 100;
      player.satmax += 100
      player.int += 5;
      player.str_d += 5;
      player.agl_d += 5;
      player.agl += 5;
      player.int_d += 5;
      flags.mnch = true;
    }
  },
  use: function (player: any) {
    if (flags.isday === false) {
      if (!flags.mnch) {
        player.str += 5;
        player.sat += 100;
        player.spd += 1;
        player.hpmax += 100;
        player.satmax += 100
        player.int += 5;
        player.str_d += 5;
        player.agl_d += 5;
        player.agl += 5;
        player.int_d += 5;
        flags.mnch = true;
      }
    }
    timers.mnch = setInterval(function () {
      if (flags.isday === false) {
        if (!flags.mnch) {
          player.str += 5;
          player.sat += 100;
          player.spd += 1;
          player.hpmax += 100;
          player.satmax += 100
          player.int += 5;
          player.str_d += 5;
          player.agl_d += 5;
          player.agl += 5;
          player.int_d += 5;
          flags.mnch = true;
          update_d();
        }
      } else {
        if (flags.mnch === true) {
          effect.mnch.un(player);
          player.stat_r();
          update_d();
        }
      }
    }, 1000)
  },
  un: function (player: any) {
    clearInterval(timers.mnch);
    if (flags.mnch === true) { player.sat -= 100; flags.mnch = false; }
  }
});

// @ts-ignore: constructor function
effect.fpn = new Effect({ id: 8, name: 'Food poisoning', desc: 'From eating something bad', type: 3, duration: 30, x: '«', c: 'lime', b: 'grey',
  onGive: function (player: any) { msg(select(['You feel bad inside', 'Your stomach bothers you']), 'green') },
  use: function (player: any, y: any, z: any) {
    if (player.sat > 0) giveSkExp(skl.fdpnr, 1); giveSkExp(skl.painr, 1);
    this.duration--;
    let dmg = randf(1, 3) * (1 - skl.fdpnr.use());
    if (player.sat > 0) player.sat - dmg >= 0 ? player.sat -= dmg : player.sat = 0;
    dom.d5_1_1.update();
    if (this.duration === 0) { removeEff(this); this.duration = 30; }
  }
});

// @ts-ignore: constructor function
effect.wet = new Effect({ id: 9, name: 'Wet', desc: 'You\'re drenched in water', type: 3, duration: 5, x: '雨', c: 'cyan', b: 'blue',
  onGive: function (player: any) { if (this.target.id === player.id) { msg('Your clothes get soaked', 'cyan', null, null, 'blue'); flags.iswet = true } },
  onRemove: function (player: any) { msg('You dry up', 'orange'); flags.iswet = false },
  use: function (player: any) {
    if (flags.inside === false && flags.israin === true && !player.mods.rnprtk) this.duration += 6;
    if (this.target.id === player.id) {
      if (player.sat > 0) giveSkExp(skl.abw, .05);
      effect.fplc.active === true ? this.duration -= 15 : this.duration--;
    }
    else this.duration--;
    if (this.duration > 600) this.duration = 600;
    if (this.duration <= 0) { removeEff(this, this.target); this.duration = 5; };
  }
});

// @ts-ignore: constructor function
effect.fplc = new Effect({ id: 10, save: false, name: 'Fireplace Aura', desc: 'You\'re feeling the warmth of the fireplace', type: 3, duration: 2, x: '火', c: 'yellow', b: 'crimson',
  onGive: function (player: any) { player.mods.ckfre += 1; },
  use: function (player: any) {
    var fire = findbyid(furn, furniture.frplc.id);
    this.duration = fire.data.fuel;
    giveSkExp(skl.abf, .2);
    if (this.duration === 0) {
      removeEff(this); this.duration = 2;
      rsort(settings.rm);
    }
  },
  onRemove: function (player: any) { player.mods.ckfre -= 1; }
});

// @ts-ignore: constructor function
effect.cdlt = new Effect({ id: 11, name: 'Candlelight', desc: 'You\'re carrying a candle. The surroundings are lit up', type: 3, duration: 360, x: '❛', c: 'gold', b: '#440205',
  use: function (player: any) {
    if (--this.duration === 0) { removeEff(this); this.duration = 360; }
  },
  onGive: function (player: any) { player.mods.light += 1; },
  onRemove: function (player: any) { player.mods.light -= 1; }
});


// @ts-ignore: constructor function
effect.tst2 = new Effect({ id: 12, name: 'STR+', desc: 'STR+', type: 2, duration: 0, x: 'X', c: 'RED', b: 'WHITE',
  use: function (player: any) {
    player.str *= .5;
    player.str_d *= .5
  }
});

// @ts-ignore: constructor function
effect.slep = new Effect({ id: 13, name: 'Sleep', desc: 'You are fast asleep', type: 4, duration: -1, x: 'z', c: 'white', b: 'dimgray',
  use: function (player: any) {
  }
});

// @ts-ignore: constructor function
effect.bled = new Effect({ id: 14, name: 'Bleeding', desc: 'Depletes health each second', type: 3, atype: 1, duration: 5, x: '血', c: 'red', b: 'darkred',
  onGive: function (player: any, x: any, y: any) {
    if (!this.active) { if (this.target.id === player.id) msg('You\'re losing blood!', 'red') }
    else {
      this.y = Math.ceil(this.y + y * .2 + 1);
      this.duration += x * .9 << 0
    }
  },
  use: function (player: any, y: any, z: any) {
    this.duration--;
    this.power = y;
    let dmg = this.power;
    dmg = Math.ceil(rand(dmg * .6, dmg * 1.4));
    if (this.target.id === player.id) {
      giveSkExp(skl.bledr, this.power * .1);
      dmg *= Math.ceil(1 - skl.bledr.use());
      stats.dmgrt += dmg;
      if (player.hp - dmg > 0) player.hp -= dmg;
      else { player.hp = 0; removeEff(this); this.duration = 5; player.onDeath(); combat.atkdfty = [2, 3] }
      dom.d5_1_1.update();
    }
    else { if (this.target.hp - dmg > 0) this.target.hp -= dmg; else { this.target.hp = 0; removeEff(this, this.target); this.duration = 5; this.target.onDeath(player); stats.indkill++ } }
    if (this.duration === 0) { removeEff(this, this.target); this.duration = 5; };
  },
  onClick: function (player: any) {
    return;
    let it;
    if (item.bdgh.have) item.bdgh.use();
  }
});

// @ts-ignore: constructor function
effect.tarnish = new Effect({ id: 15, name: 'Tarnished', desc: 'Equipment usability -30%', type: 4, duration: -1, x: '≠', c: 'purple', b: 'grey',
  onGive: function (player: any) { msg('Your equipment cracks', 'purple') },
  use: function (player: any, y: any, z: any) {
  }
});

// @ts-ignore: constructor function
effect.prostasia = new Effect({ id: 16, name: 'Prostasía', desc: 'Equipment usability +30%', type: 4, duration: -1, x: '≒', c: 'midnightblue', b: 'skyblue',
  onGive: function (player: any) { msg('You feel secure', 'skyblue') },
  use: function (player: any, y: any, z: any) {
  }
});

// @ts-ignore: constructor function
effect.incsk = new Effect({ id: 17, name: 'Incense Aroma', desc: 'Your senses are enhanced', type: 3, duration: 600, x: 'Í', c: 'gold', b: '#440205',
  use: function (player: any) {
    if (--this.duration === 0) { removeEff(this); this.duration = 600; }
  }
});

// @ts-ignore: constructor function
effect.run = new Effect({ id: 18, name: 'Running', desc: 'You\'re jogging', type: 4, duration: -1, x: '走', c: 'black', b: 'skyblue' });

// @ts-ignore: constructor function
effect.drunk = new Effect({ id: 19, name: 'Inebriated', desc: 'You\'re feeling drunk from alcohol', type: 5, duration: 15, x: '酒', c: 'darkred', b: 'orange',
  use: function (player: any) {
    if (--this.duration === 0) removeEff(this);
  },
  mods: function (player: any) { player.agle /= 1 + (.4 - skl.drka.lvl * .03); player.stre *= 1 + (.2 + skl.drka.lvl * .02); player.inte /= 1 + (.5 - skl.drka.lvl * .04) },
  onGive: function (player: any) { msg('You\'re feeling tipsy', 'chocolate') },
  onRemove: function (player: any) { msg('You sober up', 'orange') }
});

// @ts-ignore: constructor function
effect.virus = new Effect({ id: 20, name: 'Virus', desc: 'You are contaminated', type: 5, duration: -1, x: '⁑', c: 'black', b: 'lightgrey',
  use: function (player: any) {
  },
  mods: function (player: any) { player.agle /= 1.1; player.stre /= 1.1; player.sat -= 70; player.sata -= 70 },
  onGive: function (player: any) { msg('You feel bad', 'grey') },
  onRemove: function (player: any) { msg('You feel better', 'orange') }
});

// @ts-ignore: constructor function
effect.scout = new Effect({ id: 21, name: 'Investigating', desc: 'You\'re exploring your surroundings', type: 4, duration: -1, x: 'ǔ', c: 'aquamarine', b: 'teal' });

// @ts-ignore: constructor function
effect.invgrt = new Effect({ id: 22, name: 'Invigorate', desc: 'Your joints feel flexible', type: 3, duration: -1, x: 'ℐ', c: 'yellowgreen', b: 'darkgreen',
  onGive: function (player: any) { if (!this.active) { msg(this.target.id === player.id ? 'You become nimble' : (this.target.name + ' becomes nimble'), 'green'); this.target.aglm += .3 } },
  onRemove: function (player: any) { this.target.aglm -= .3 },
  use: function (player: any) {
    if (--this.duration === 0) {
      removeEff(this); this.duration = 5;
    };
  }
});

// @ts-ignore: constructor function
effect.fei1 = new Effect({ id: 23, name: 'Fei poisoning', desc: 'Fei impurities attack your flesh', type: 3, duration: 60, x: '⇔', c: 'magenta', b: '#520090',
  onGive: function (player: any, x: any, y: any) {
    if (!this.active) { msg('Your body is fighting against the impurities', 'darkmagenta', null, null, 'grey'); this.power = y }
    else { this.power += y; this.duration += 30 }
  },
  use: function (player: any, y: any) {
    this.duration--;
    giveSkExp(skl.crptr, 1);
    giveSkExp(skl.painr, this.power);
    let dmg = (this.power * 5 * (1 - skl.crptr.lvl * .05)) << 0;
    stats.dmgrt += dmg;
    if (player.hp - dmg > 0) player.hp -= dmg;
    else { player.hp = 0; removeEff(this); player.onDeath(); combat.atkdfty = [2, 4]; msg("You fail to purify the pill", 'darkgrey') }
    dom.d5_1_1.update();
    if (this.duration === 0) { removeEff(this, this.target); this.duration = 5; msg("You have successfully purified the pill!", 'lime'); giveExp(this.power * 5000 + (this.power > 1 ? (this.power * .15 * 5000) : 0), true, true, true) }
  }
});

// @ts-ignore: constructor function
effect.cold = new Effect({ id: 24, name: 'Cold', desc: 'You\'re freezing', type: 5, duration: 5, x: '冷', c: '#88a', b: '#eef',
  mods: function (player: any) { player.agle /= 1.1; player.stre /= 1.1; player.hpe /= 1.1; player.sate /= 1.05 },
  onGive: function (player: any) { if (this.target.id === player.id) msg('You feel colder', 'blue', null, null, 'cyan'); },
  onRemove: function (player: any) { if (this.target.id === player.id) msg('You\'re warming up', 'orange'); },
  use: function (player: any) {
    if (this.target.id === player.id) {
      giveSkExp(skl.abw, .01);
      giveSkExp(skl.coldr, .01);
      effect.fplc.active === true ? this.duration -= 15 : this.duration--;
      effect.wet.active ? stats.coldnt += 6 : stats.coldnt += 2;
      if (effect.fbite.active) effect.fbite.duration += 5;
      else if (stats.coldnt >= 460) giveEff(player, effect.fbite, 20);
      if (stats.coldnt > 0) stats.coldnt--
    }
    else this.duration--;
    if (this.duration > 600) this.duration = 600;
    if (this.duration <= 0) { removeEff(this, this.target); this.duration = 5; };
  }
});

// @ts-ignore: constructor function
effect.smoke = new Effect({ id: 25, name: 'Smoke', desc: 'Thick smoke abstructs your lungs', type: 3, duration: 5, x: '煙', c: 'grey', b: 'lightgrey',
  onGive: function (player: any) { if (this.target.id === player.id) { msg('You breathe heavily', 'grey') } },
  onRemove: function (player: any) { msg('Your lungs feel lighter', 'orange') },
  use: function (player: any) {
    if (this.target.id === player.id) {
      if (random() < .1) {
        msg(select(['*Cough..*', '*Hack..*', '*Cough-cough..*', '*Khe..*']), 'grey');
        giveSkExp(skl.painr, rand(0.5, 5));
        if (player.hp > 50) player.hp -= (rand(5, 35) + player.hp * (rand(.01, .05)));
        dom.d5_1_1.update();
      }
    }
    this.duration--;
    if (this.duration <= 0) { removeEff(this, this.target); this.duration = 5; }
  }
});

// @ts-ignore: constructor function
effect.fbite = new Effect({ id: 26, name: 'Hypothermia', desc: 'Your limbs are suffering from frostbites', type: 5, duration: 5, x: '凍', c: 'red', b: '#aaf',
  mods: function (player: any) { player.agle /= 1.15; player.stre /= 1.2; player.hpe /= 1.2; player.sate /= 1.1 },
  onGive: function (player: any) { if (this.target.id === player.id) msg('Sharp pain stings you', 'red', null, null, 'cyan') },
  onRemove: function (player: any) { if (this.target.id === player.id) { msg('You aren\'t freezing anymore', 'orange'); stats.coldnt = 0 } },
  use: function (player: any) {
    if (this.target.id === player.id) {
      giveSkExp(skl.coldr, .05);
      effect.fplc.active === true ? this.duration -= 5 : this.duration--;
      if (random() < .3) {
        giveSkExp(skl.painr, rand(0.2, 1));
        if (player.hp > 50) player.hp -= (rand(5, 20));
        dom.d5_1_1.update();
      }
    }
    else this.duration--;
    if (this.duration > 900) this.duration = 900;
    if (this.duration <= 0) { removeEff(this, this.target); this.duration = 5; };
  }
});
