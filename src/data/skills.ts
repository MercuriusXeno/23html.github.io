import { skl, you, dom, ttl, rcp, act } from '../state';
import type { Player } from '../types';
import { giveTitle, giveRcp, giveSkExp, giveAction } from '../game/progression';
import { recshop } from '../ui/shop';

// ==========================================================================
// Skill constructor + instances
// ==========================================================================

function Skill(this: any, cfg?: any) {
  this.name = '';
  this.desc = '';
  this.exp = 0;
  this.lvl = 0;
  this.type = 0;
  this.p = 1;
  this.sp;
  this.expnext = function (this: any) { return Math.round((50 + ((this.lvl + 1) ** Math.log(9 * this.lvl + 1)))) };
  this.expnext_t = this.expnext();
  ///(i*.12)
  this.onLevel = function (this: any, _player: Player) { };
  this.onGive = function (this: any, _player: Player, x: any) { };
  this.use = function (this: any, x: any, y: any) { };
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}

// @ts-ignore: constructor function
skl.fgt = new Skill({
  id: 101, type: 1, name: 'Fighting', desc: 'Ability to perform better in a fight' + dom.dseparator + '<small style="color:darkorange">Slightly increases overall attack power</small>', mlstn: [{ lv: 2, f: (player: Player) => { player.exp_t += 0.02; player.stat_r(); }, g: false, p: "EXP Gain +2%" },
  { lv: 5, f: (player: Player) => { player.stra += 1; player.stat_r(); giveTitle(ttl.cvl) }, g: false, p: "STR +1, New Title" },
  { lv: 8, f: (player: Player) => { player.exp_t += 0.02; player.stat_r() }, g: false, p: "EXP Gain +3%" },
  { lv: 10, f: (player: Player) => { player.exp_t += 0.05; player.mods.sbonus += 0.01; player.stat_r(); giveTitle(ttl.tcvl) }, g: false, p: "EXP Gain +5%, Energy Effectiveness +1%, New Title" },
  { lv: 11, f: function () { skl.unc.p += .1; skl.srdc.p += .1; skl.knfc.p += .1; skl.axc.p += .1; skl.plrmc.p += .1; skl.stfc.p += .1; skl.bwc.p += .1; skl.hmrc.p += .1; }, g: false, p: "All Masteries EXP Gain +10%" },
  { lv: 12, f: (player: Player) => { giveTitle(ttl.fgt); player.stra += 1; skl.war.p += .05; player.stat_r() }, g: false, p: "STR +1, War EXP Gain +5%, New Title" },
  { lv: 13, f: (player: Player) => { player.agla += 2; player.stat_r() }, g: false, p: "AGL +2" },
  { lv: 14, f: (player: Player) => { player.exp_t += 0.06; }, g: false, p: "EXP Gain +6%" },
  { lv: 15, f: (player: Player) => { player.exp_t += 0.08; skl.unc.p += .1; skl.srdc.p += .1; skl.knfc.p += .1; skl.axc.p += .1; skl.plrmc.p += .1; skl.stfc.p += .1; skl.bwc.p += .1; skl.hmrc.p += .1; giveTitle(ttl.rok) }, g: false, p: "EXP Gain +8%, All Masteries EXP Gain +10%, New Title" },
  ],
  use: function (this: any, x: any, y: any) { return you.str * (this.lvl * .02) }
});


// @ts-ignore: constructor function
skl.unc = new Skill({
  id: 102, type: 1, name: 'Unarmed M', bname: 'Unarmed Mastery', desc: 'Mastery of unarmed combat' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when fighting unarmed</small>', mlstn: [{ lv: 2, f: (player: Player) => { player.stra += 1; player.stat_r(); }, g: false, p: "STR +1" },
  { lv: 5, f: (player: Player) => { player.agla += 1; player.stat_r(); giveTitle(ttl.pbg) }, g: false, p: "AGL +1, New Title" },
  { lv: 8, f: (player: Player) => { player.exp_t += 0.01; player.stat_r() }, g: false, p: "EXP Gain +1%" },
  { lv: 10, f: (player: Player) => { player.exp_t += 0.05; player.mods.sbonus += 0.02; player.stat_r(); giveTitle(ttl.bll) }, g: false, p: "EXP Gain +5%, Energy Effectiveness +2%, New Title" },
  { lv: 11, f: (player: Player) => { skl.fgt.p += .03; player.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ],
  use: function (this: any, x: any, y: any) { you.str += you.str / 100 * (this.lvl * 6); }
});
// @ts-ignore: constructor function
skl.srdc = new Skill({
  id: 103, type: 1, name: 'Sword M', bname: 'Sword Mastery', desc: 'Ability to fight using swords' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a sword</small>', mlstn: [{ lv: 1, f: (player: Player) => { player.stra += 1; player.stat_r(); }, g: false, p: "STR +1" },
  { lv: 3, f: (player: Player) => { player.agla += 1; player.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 5, f: (player: Player) => { player.stra += 1; player.agla += 1; player.stat_r(); giveTitle(ttl.srd1) }, g: false, p: "STR +1, AGL +1, New Title" },
  { lv: 8, f: (player: Player) => { player.exp_t += 0.03; player.stat_r() }, g: false, p: "EXP Gain +3%" },
  { lv: 10, f: (player: Player) => { player.exp_t += 0.05; player.mods.sbonus += 0.01; player.stat_r(); giveTitle(ttl.srd2) }, g: false, p: "EXP Gain +5%, Energy Effectiveness +1%, New Title" },
  { lv: 11, f: (player: Player) => { skl.fgt.p += .03; player.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ],
  use: function (this: any, x: any, y: any) { you.str += you.str / 100 * (this.lvl * 5); }
});

// @ts-ignore: constructor function
skl.knfc = new Skill({
  id: 104, type: 1, name: 'Knife M', bname: 'Knife Mastery', desc: 'Ability to fight using knives and daggers' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a knife</small>', mlstn: [{ lv: 2, f: (player: Player) => { player.agla += 1; player.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 3, f: (player: Player) => { player.exp_t += 0.01; player.agla += 2; player.stat_r(); }, g: false, p: "AGL +2, EXP Gain +1%" },
  { lv: 5, f: (player: Player) => { player.stra += 1; player.stat_r(); giveTitle(ttl.plm) }, g: false, p: "STR +1, New Title" },
  { lv: 8, f: (player: Player) => { player.stra += 1; player.agla += 1; player.exp_t += 0.02; }, g: false, p: "AGL +1, STR +1, EXP Gain +2%" },
  { lv: 10, f: (player: Player) => { player.mods.cpwr += .1; giveTitle(ttl.knf) }, g: false, p: "Critical Damage +10%, New Title" },
  { lv: 11, f: (player: Player) => { skl.fgt.p += .03; player.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ],
  use: function (this: any, x: any, y: any) { you.str += you.str / 100 * (this.lvl * 5); }
});

// @ts-ignore: constructor function
skl.axc = new Skill({
  id: 105, type: 1, name: 'Axe M', bname: 'Axe Mastery', desc: 'Ability to fight using axes' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding an axe</small>', mlstn: [{ lv: 2, f: (player: Player) => { player.stra += 1; player.stat_r(); }, g: false, p: "STR +1" },
  { lv: 3, f: (player: Player) => { player.exp_t += 0.02; player.stra += 1; player.stat_r(); }, g: false, p: "STR +1, EXP Gain +2%" },
  { lv: 5, f: (player: Player) => { player.hpa += 30; player.ccls[2] += 1; player.stat_r(); giveTitle(ttl.axc1) }, g: false, p: "HP +30, Blunt DEF +1, New Title" },
  { lv: 8, f: (player: Player) => { player.stra += 1; player.agla += 1; player.exp_t += 0.02; player.stat_r() }, g: false, p: "AGL +1, STR +1, EXP Gain +2%" },
  { lv: 10, f: (player: Player) => { player.mods.sbonus += 0.02; player.stat_p[1] += .05; giveTitle(ttl.axc2) }, g: false, p: "Energy Effectiveness +2%, STR training Potential +5%, New Title" },
  { lv: 11, f: (player: Player) => { skl.fgt.p += .03; player.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ],
  use: function (this: any, x: any, y: any) { you.str += you.str / 100 * (this.lvl * 5); }
});

// @ts-ignore: constructor function
skl.plrmc = new Skill({
  id: 106, type: 1, name: 'Polearm M', bname: 'Polearm Mastery', desc: 'Ability to fight using polearms and lances' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a spear/polearm</small>', mlstn: [{ lv: 2, f: (player: Player) => { player.agla += 1; player.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 3, f: (player: Player) => { player.exp_t += 0.01; player.agla += 1; player.stat_r(); }, g: false, p: "AGL +1, EXP Gain +1%" },
  { lv: 5, f: (player: Player) => { player.stra += 1; player.ccls[1] += 1; player.stat_r(); giveTitle(ttl.lnc1) }, g: false, p: "STR +1, Pierce DEF +1, New Title" },
  { lv: 8, f: (player: Player) => { player.stra += 2; player.exp_t += 0.03; player.stat_r() }, g: false, p: "STR +2, EXP Gain +3%" },
  { lv: 10, f: (player: Player) => { player.res.ph += .01; giveTitle(ttl.lnc2) }, g: false, p: "Physical Resistance +1%, New Title" },
  { lv: 11, f: (player: Player) => { skl.fgt.p += .03; player.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ],
  use: function (this: any, x: any, y: any) { you.str += you.str / 100 * (this.lvl * 5); }
});


// @ts-ignore: constructor function
skl.hmrc = new Skill({
  id: 107, type: 1, name: 'Hammer M', bname: 'Hammer Mastery', desc: 'Ability to fight using blunt weaponry' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a club/hammer</small>', mlstn: [{ lv: 2, f: (player: Player) => { player.exp_t += 0.01; player.agla += 1; player.stat_r(); }, g: false, p: "AGL +1, EXP Gain +1%" },
  { lv: 4, f: (player: Player) => { player.stra += 1; player.stat_r(); }, g: false, p: "STR +1" },
  { lv: 5, f: (player: Player) => { player.stra += 1; player.stat_r(); giveTitle(ttl.stk) }, g: false, p: "STR +1, New Title" },
  { lv: 8, f: (player: Player) => { player.stra += 1; player.exp_t += 0.03; player.stat_r() }, g: false, p: "STR +1, EXP Gain +3%" },
  { lv: 10, f: (player: Player) => { player.stra += 3; player.exp_t += 0.03; player.stat_r(); giveTitle(ttl.hmr2) }, g: false, p: "STR +3, EXP Gain +3%, New Title" },
  { lv: 11, f: (player: Player) => { skl.fgt.p += .03; player.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ],
  use: function (this: any, x: any, y: any) { you.str += you.str / 100 * (this.lvl * 5); }
});

// @ts-ignore: constructor function
skl.stfc = new Skill({
  id: 108, type: 1, name: 'Staff M', bname: 'Staff Mastery', desc: 'Ability to fight using staves and wands',
  use: function (this: any, x: any, y: any) { you.int += you.int / 100 * (this.lvl * 5); }
});

// @ts-ignore: constructor function
skl.shdc = new Skill({
  id: 109, type: 1, name: 'Shield M', bname: 'Shield Mastery', desc: 'Ability to use shields better', mlstn: [{ lv: 2, f: (player: Player) => { player.exp_t += 0.03; skl.painr.p += .01; player.stat_r(); }, g: false, p: "EXP Gain +3%, Pain Resistance EXP Gain +1%" },
  { lv: 4, f: (player: Player) => { player.hpa += 12; skl.painr.p += .02; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +12, Pain Resistance EXP Gain +2%" },
  { lv: 5, f: (player: Player) => { player.stra += 1; player.stat_r(); giveTitle(ttl.sld1); skl.painr.p += .07 }, g: false, p: "STR +1, Pain Resistance EXP Gain +7%, New Title" },
  { lv: 8, f: (player: Player) => { player.agla += 2; player.exp_t += 0.05; player.stat_r() }, g: false, p: "AGL +2, EXP Gain +5%" },
  { lv: 10, f: (player: Player) => { player.hpa += 30; player.stra += 2; player.agla += 2; player.exp_t += 0.05; player.stat_r(); giveTitle(ttl.sld2) }, g: false, p: "HP +30, STR +2, AGL +2, New Title" },
  { lv: 11, f: (player: Player) => { skl.fgt.p += .08; player.stat_r(); }, g: false, p: "Fighting EXP Gain +8%" },
  ],
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1); you.str += you.str / 100 * (this.lvl * 5); you.int += you.int / 100 * (this.lvl * 3); }
});

// @ts-ignore: constructor function
skl.sleep = new Skill({
  id: 110, type: 4, name: 'Sleeping', desc: 'The rest of Body' + dom.dseparator + '<small style="color:darkorange">Increases health gain during sleep</small>', mlstn: [{ lv: 2, f: (player: Player) => { player.hpa += 2; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +2" },
  { lv: 4, f: (player: Player) => { player.hpa += 5; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +5" },
  { lv: 5, f: (player: Player) => { skl.ptnc.p += .05; giveTitle(ttl.slp1); player.hpa += 10; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +10, Patience EXP Gain +5%, New Title" },
  { lv: 6, f: (player: Player) => { player.hpa += 12; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +12" },
  { lv: 7, f: (player: Player) => { player.hpa += 15; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +15" },
  { lv: 8, f: (player: Player) => { player.hpa += 20; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +20" },
  { lv: 9, f: (player: Player) => { skl.ptnc.p += .1; player.hpa += 25; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "Patience EXP Gain +10%, HP +25" },
  { lv: 10, f: (player: Player) => { giveTitle(ttl.slp2); skl.dth.p += .1; player.hpa += 30; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +30, Death EXP Gain +10%, New Title" },
  { lv: 11, f: (player: Player) => { player.hpa += 35; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +35" },
  { lv: 12, f: (player: Player) => { player.hpa += 50; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +50" },
  ],
  use: function (this: any, x: any, y: any) { giveSkExp(this, x.sq || 1); return 5 * this.lvl * x.sq }
});

// @ts-ignore: constructor function
skl.seye = new Skill({
  id: 111, type: 3, name: 'Sharp Eye', desc: 'Ability to notice weak points' + dom.dseparator + '<small style="color:darkorange">Slightly increases critical probability</small>', mlstn: [{ lv: 1, f: (player: Player) => { player.agla += 1; player.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 3, f: (player: Player) => { giveTitle(ttl.seye1); player.stra += 1; player.exp_t += 0.04; player.stat_r() }, g: false, p: "STR +1, EXP Gain +4%, New Title" },
  { lv: 4, f: (player: Player) => { skl.scout.p += .05; player.mods.cpwr += .02; player.exp_t += 0.06; }, g: false, p: "Perception EXP Gain +5%, Critical Damage +2%, EXP Gain +6%" },
  { lv: 5, f: (player: Player) => { skl.unc.p += .05; skl.fgt.p += .05; skl.srdc.p += .05; skl.knfc.p += .05; skl.axc.p += .05; skl.plrmc.p += .05; skl.stfc.p += .05; skl.bwc.p += .05; skl.hmrc.p += .05; player.stat_r(); giveTitle(ttl.seye2); }, g: false, p: "All Masteries EXP Gain +5%, Fighting EXP Gain +5%, New Title" },
  { lv: 6, f: (player: Player) => { skl.evas.p += .08; player.mods.cpwr += .08; skl.war.p += .07; }, g: false, p: "Evasion EXP Gain +8%, Critical Damage +8%, War EXP Gain +7%" },
  { lv: 7, f: (player: Player) => { skl.scout.p += .1; player.mods.sbonus += 0.01; player.stra += 2; player.stat_r() }, g: false, p: "EXP Gain +7%, STR +2, Perception EXP Gain +10%, Energy Effectiveness +1%" },
  { lv: 8, f: (player: Player) => { player.aff[0] += 5; giveTitle(ttl.seye3) }, g: false, p: "Physical ATK +5, New Title" },
  ],
  use: function (this: any, x: any, y: any) { return this.lvl * 0.003 }
});

// @ts-ignore: constructor function
skl.pet = new Skill({
  id: 112, type: 10, name: 'Patting', desc: 'Mastery of petting animals' + dom.dseparator + '<small style="color:darkorange">Makes animals love you</small>', mlstn: [{ lv: 2, f: (player: Player) => { player.luck += 1; player.stat_r(); }, g: false, p: "LUCK +1" },
  { lv: 4, f: (player: Player) => { player.agla += 1; player.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 5, f: (player: Player) => { player.agla += 1; player.mods.sbonus += 0.01; player.stat_r(); giveTitle(ttl.pet1) }, g: false, p: "Energy Effectiveness +1%, New Title" },
  { lv: 6, f: (player: Player) => { player.hpa += 33; player.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +33" },
  { lv: 7, f: (player: Player) => { player.agla += 2; player.stat_r(); }, g: false, p: "AGL +2" },
  { lv: 8, f: (player: Player) => { player.exp_t += 0.1; player.cmaff[1] += 3; player.stat_r(); giveTitle(ttl.pet2) }, g: false, p: "EXP Gain +10%, Beast Class DEF +3, New Title" },
  { lv: 9, f: () => { skl.unc.p += .1; }, g: false, p: "Unarmed Mastery EXP gain +10%" },
  { lv: 10, f: (player: Player) => { player.inta += 3; giveTitle(ttl.pet3) }, g: false, p: "INT +3, New Title" },
  ],
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1); }
});

// @ts-ignore: constructor function
skl.walk = new Skill({
  id: 113, type: 4, name: 'Walking', desc: 'Ability to walk', mlstn: [{ lv: 1, f: (player: Player) => { player.agla += 1; player.stat_r(); giveAction(act.demo) }, g: false, p: "AGL +1" },
  { lv: 3, f: (player: Player) => { giveTitle(ttl.wlk); player.hpa += 5; player.stat_r() }, g: false, p: "HP +5, New Title" },
  { lv: 4, f: (player: Player) => { player.hpa += 8; player.sata += 6; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +8, SAT +6" },
  { lv: 5, f: (player: Player) => { giveTitle(ttl.jgg); player.hpa += 10; player.sata += 8; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +10, SAT +8, New Title" },
  { lv: 6, f: (player: Player) => { player.exp_t += 0.03; player.hpa += 12; player.stat_r(); player.stat_p[0] += .03; dom.d5_3_1.update() }, g: false, p: "HP +12, EXP Gain +3%, HP Training Potential +3%" },
  { lv: 7, f: (player: Player) => { skl.tghs.p += .1; player.exp_t += 0.03; player.sata += 10; player.stat_r(); player.stra += 1; player.stat_p[1] += .03; dom.d5_3_1.update() }, g: false, p: "Toughness EXP Gain +10%, STR +1, SAT +10, EXP Gain +3%, STR Training Potential +3%" },
  { lv: 8, f: (player: Player) => { skl.evas.p += .05; player.exp_t += 0.03; player.hpa += 15; player.stat_r(); player.agla += 2; player.stat_p[2] += .03; dom.d5_3_1.update() }, g: false, p: "Evasion EXP Gain +5%, HP +15, AGL +2, EXP Gain +3%, AGL Training Potential +3%" },
  { lv: 9, f: (player: Player) => { player.exp_t += 0.06; player.hpa += 8; player.sata += 8; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +8, SAT +8, EXP Gain +6%" },
  { lv: 10, f: (player: Player) => { giveTitle(ttl.rnr); player.spda += 1; player.hpa += 10; player.sata += 10; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +10, SAT 10, SPD +1, New Title" },
  ],
  use: function (this: any, x: any, y: any) { giveSkExp(this, .5); }
});

// @ts-ignore: constructor function
skl.dice = new Skill({
  id: 114, type: 10, name: 'Gambling', desc: 'Skill of chances', mlstn: [{ lv: 1, f: (player: Player) => { player.luck += 1; player.stat_r(); }, g: false, p: "LUCK +1" },
  { lv: 3, f: (player: Player) => { player.agla += 2; player.stat_r(); }, g: false, p: "AGL +2" },
    //{lv:10,f:()=>{you.spda+=1;you.stat_r();},g:false,p:"SPD +1"},
  ],
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1); }
});

// @ts-ignore: constructor function
skl.glt = new Skill({
  id: 115, type: 4, name: 'Gluttony', desc: 'Mastery of eating', mlstn: [{ lv: 1, f: function (player: Player) { player.sata += 5; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +5" },
  { lv: 2, f: (player: Player) => { player.sata += 5; player.hpa += 5; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +5, HP +5" },
  { lv: 3, f: (player: Player) => { giveTitle(ttl.eat1); player.sata += 10; player.hpa += 5; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +5, New Title" },
  { lv: 4, f: (player: Player) => { skl.fdpnr.p += .05; player.sata += 10; player.hpa += 5; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +5, Survival EXP Gain +5%" },
  { lv: 5, f: (player: Player) => { player.sata += 10; player.hpa += 10; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +10" },
  { lv: 6, f: (player: Player) => { player.sata += 10; player.hpa += 15; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +15" },
  { lv: 7, f: (player: Player) => { giveTitle(ttl.eat2); player.sata += 10; player.hpa += 20; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +20, New Title" },
  { lv: 8, f: (player: Player) => { player.sata += 15; player.hpa += 25; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +15, HP +25" },
  { lv: 9, f: (player: Player) => { skl.fdpnr.p += .15; player.sata += 15; player.hpa += 35; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +15, HP +35, Survival EXP Gain +15%" },
  { lv: 10, f: (player: Player) => { player.eqp_t += .13; giveTitle(ttl.eat3); player.sata += 20; player.hpa += 40; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "EXP Gain +13%, SAT +20, HP +40, New Title" },
  { lv: 11, f: (player: Player) => { player.sata += 25; player.hpa += 50; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +25, HP +50" },
  { lv: 12, f: (player: Player) => { player.sata += 25; player.hpa += 60; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +25, HP +60" },
  { lv: 13, f: (player: Player) => { player.sata += 25; player.hpa += 70; player.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +25, HP +70" },],
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1); return this.lvl || 1 }
});

// @ts-ignore: constructor function
skl.rdg = new Skill({
  id: 116, type: 4, name: 'Literacy', desc: 'Understanding of meaning behind texts' + dom.dseparator + '<small style="color:darkorange">Improves reading speed</small>', mlstn: [{ lv: 2, f: (player: Player) => { player.inta += 1; player.stat_r(); }, g: false, p: "INT +1" },
  { lv: 3, f: (player: Player) => { giveTitle(ttl.ilt); player.exp_t += 0.02; player.stat_r(); }, g: false, p: "EXP Gain +2%, New Title" },
  { lv: 4, f: (player: Player) => { player.exp_t += 0.02; player.inta += 1; player.stat_r(); }, g: false, p: "INT +1, EXP Gain +2%" },
  { lv: 5, f: (player: Player) => { giveTitle(ttl.und); player.inta += 1; player.exp_t += 0.03; player.stat_r(); }, g: false, p: "EXP Gain +3%, INT +1, New Title" },
  ],
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.cook = new Skill({
  id: 117, type: 5, name: 'Cooking', desc: 'The art of Cooking' + dom.dseparator + '<small style="color:darkorange">Reduces chances to cook a failed product</small>', mlstn: [{ lv: 1, f: (player: Player) => { player.inta += 1; player.agla += 1; giveRcp(rcp.rsmt); giveRcp(rcp.segg); player.stat_r(); }, g: false, p: "INT +1, AGL +1" },
  { lv: 2, f: (player: Player) => { giveTitle(ttl.coo1); giveRcp(rcp.bcrc); giveRcp(rcp.bcrrt); player.exp_t += 0.05; player.stra += 1; player.stat_r(); }, g: false, p: "STR +1, EXP Gain +5%, New Title" },
    //              {lv:3,f:()=>{you.exp_t+=0.02;you.inta+=1;you.stat_r();},g:false,p:"INT +1, EXP Gain +2%"},
    //              {lv:4,f:()=>{giveTitle(ttl.cck);you.inta+=1;you.exp_t+=0.03;you.stat_r();},g:false,p:"EXP Gain +3%, INT +1, New Title"},
  ],
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1); return this.lvl || 1 }
});

// @ts-ignore: constructor function
skl.mdt = new Skill({
  id: 118, type: 4, name: 'Meditation', desc: 'The rest of Mind',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.crft = new Skill({
  id: 119, type: 5, name: 'Crafting', desc: 'The art of Creation' + dom.dseparator + '<small style="color:darkorange">Makes autocrafting faster</small>',
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1); return this.lvl || 1 }
});

// @ts-ignore: constructor function
skl.alch = new Skill({
  id: 120, type: 5, name: 'Alchemy', desc: 'Knowledge of medicine and alchemical transmutation', mlstn: [{ lv: 1, f: (player: Player) => { player.inta += 1; giveRcp(rcp.hptn1) }, g: false, p: "INT +1" }],
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1); return this.lvl || 1 }
});

// @ts-ignore: constructor function
skl.thr = new Skill({
  id: 121, type: 2, name: 'Throwing', desc: 'Mastery of throwing' + dom.dseparator + '<small style="color:darkorange">Decreases waiting time between throws<br>Slightly increases throwing damage</small>',
  use: function (this: any, x: any, y: any) { return { a: this.lvl / 10, b: this.lvl * 5 } }
});

// @ts-ignore: constructor function
skl.bwc = new Skill({
  id: 122, type: 1, name: 'Ranged M', bname: 'Ranged Mastery', desc: 'Ability to utilize bows and crossbows in combat',
  use: function (this: any, x: any, y: any) { you.str += you.str / 100 * (this.lvl * 5); }
});

// @ts-ignore: constructor function
skl.ntst = new Skill({
  id: 123, type: 3, name: 'Nightsight', desc: 'Ability to see better in the darkness' + dom.dseparator + '<small style="color:darkorange">Mitigates hit penalty while fighting in darkness</small>',
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1) }
});

// @ts-ignore: constructor function
skl.evas = new Skill({
  id: 124, type: 3, name: 'Evasion', desc: 'Ability to dodge attacks',
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1) }
});

// @ts-ignore: constructor function
skl.gred = new Skill({
  id: 125, type: 4, name: 'Greed', desc: 'The power of possessions',
  use: function (this: any, x: any, y: any) { return true }
});

// @ts-ignore: constructor function
skl.dngs = new Skill({
  id: 126, type: 3, name: 'Danger Sense', desc: 'Ability to detect and avoid danger' + dom.dseparator + '<small style="color:darkorange">Slightly decreases critical damage received</small>', mlstn: [{ lv: 1, f: (player: Player) => { player.exp_t += 0.03 }, g: false, p: "EXP Gain +3%" },
  { lv: 2, f: (player: Player) => { player.agla += 1; player.stat_r(); skl.painr.p += .03 }, g: false, p: "AGL +1, Pain Resistance EXP Gain +3%" },
  { lv: 3, f: () => { giveTitle(ttl.dngs1); skl.fgt.p += .1; }, g: false, p: "Fighting EXP Gain +10%, New Title" },
  { lv: 4, f: (player: Player) => { skl.evas.p += .1; player.exp_t += 0.05; player.stra += 1; player.stat_r(); }, g: false, p: "EXP Gain +5%, Evasion EXP Gain +10%, STR +1" },
  { lv: 5, f: (player: Player) => { giveTitle(ttl.dngs2); skl.seye.p += .1; player.mods.sbonus += 0.01; player.agla += 2; player.stat_r(); }, g: false, p: "AGL +2, Energy Effectiveness +1%, Sharp Eye EXP Gain +10%, New Title" },
  ],
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.painr = new Skill({
  id: 127, type: 6, name: 'Pain Resistance', sp: '.66em', desc: 'Ability to tolerate physical harm' + dom.dseparator + '<small style="color:darkorange">Slightly decreases damage received</small>', mlstn: [{ lv: 1, f: (player: Player) => { player.exp_t += 0.01 }, g: false, p: "EXP Gain +1%" },
  { lv: 3, f: (player: Player) => { player.exp_t += 0.02; player.agla += 1; player.stat_r(); }, g: false, p: "EXP Gain +2%, AGL +1" },
  { lv: 5, f: (player: Player) => { giveTitle(ttl.rspn1); player.stra += 1; player.exp_t += 0.05; player.stat_r(); }, g: false, p: "EXP Gain +5%, STR +1, New Title" },
  { lv: 6, f: (player: Player) => { skl.dngs.p += .1; player.stat_r(); }, g: false, p: "Danger Sense EXP Gain +10%" },
  ],
  use: function (this: any, x: any, y: any) { return this.lvl * .004 }
});

// @ts-ignore: constructor function
skl.poisr = new Skill({
  id: 128, type: 6, name: 'Poison Resistance', sp: '0.66em', desc: 'Ability to tolerate harmful poisons' + dom.dseparator + '<small style="color:darkorange">Increases probability to avoid being poisoned</small>',
  use: function (this: any, x: any, y: any) { return this.lvl * .01 }
});

// @ts-ignore: constructor function
skl.fdpnr = new Skill({
  id: 129, type: 4, name: 'Survival', desc: 'Ability to safely digest dangerous food' + dom.dseparator + '<small style="color:darkorange">Reduces energy loss from food poisoning</small>', mlstn: [{ lv: 1, f: (player: Player) => { player.exp_t += 0.03 }, g: false, p: "EXP Gain +3%" },
  { lv: 2, f: (player: Player) => { player.sata += 15; player.hpa += 30; skl.glt.p += .05; dom.d5_3_1.update(); player.stat_r(); }, g: false, p: "SAT +15, HP +30, Gluttony EXP Gain +5%" },
  { lv: 3, f: (player: Player) => { giveTitle(ttl.rfpn1); skl.drka.p += .1;; player.exp_t += 0.05; player.stra += 1; player.stat_r(); }, g: false, p: "EXP Gain +5%, STR +1, Drinking EXP Gain +10%, New Title" },
  { lv: 5, f: (player: Player) => { giveTitle(ttl.rfpn2); player.exp_t += 0.07; skl.painr.p += .1; skl.glt.p += .1; }, g: false, p: "EXP Gain +7%, Pain Resistance EXP Gain +10%, Gluttony EXP Gain +10%, New Title" },
  { lv: 6, f: (player: Player) => { skl.rtr.p += .15; player.stra += 2; player.stat_r(); }, g: false, p: "Elusion EXP Gain +15%, STR +2, HP +100" },
  { lv: 7, f: (player: Player) => { player.exp_t += 0.1; player.stra += 1; skl.poisr.p += .1; skl.glt.p += .15; player.stat_r(); }, g: false, p: "EXP Gain +10%, STR +1, Poison Resistance EXP Gain +10%, Gluttony EXP Gain +15%," },
  { lv: 8, f: (player: Player) => { giveTitle(ttl.rfpn3); player.res.ph -= .01; skl.poisr.p += .2; skl.painr.p += .2 }, g: false, p: "Damage Reduction +1%, Pain Resistance EXP Gain +20%, Poison Resistance EXP Gain +20%, New Title" },
  ],
  use: function (this: any, x: any, y: any) { return this.lvl * .05 }
});

// @ts-ignore: constructor function
skl.war = new Skill({
  id: 130, type: 3, name: 'War', desc: 'Mastery of destruction and military tactics' + dom.dseparator + '<small style="color:darkorange">Slightly increases crit damage</small>',
  use: function (this: any, x: any, y: any) { return this.lvl * .005 }
});

// @ts-ignore: constructor function
skl.stel = new Skill({
  id: 131, type: 3, name: 'Stealing', desc: 'Ability to pilfer',
  use: function (this: any, x: any, y: any) { return this.lvl * .05 }
});

// @ts-ignore: constructor function
skl.dth = new Skill({
  id: 132, type: 4, name: 'Death', desc: 'Ability to cling to your fate' + dom.dseparator + '<small style="color:darkorange">Reduces energy loss on death</small>', mlstn: [{ lv: 1, f: (player: Player) => { player.hpa += 20; player.stat_r() }, g: false, p: "HP +20" },
  { lv: 3, f: (player: Player) => { player.exp_t += .03; skl.painr.p += .05; giveTitle(ttl.dth1); player.stat_r() }, g: false, p: "EXP Gain +3%, Pain Resistance EXP Gain +5%, New Title" },
  { lv: 5, f: (player: Player) => { player.eqp_t += .05; skl.tghs.p += .1; player.stat_r() }, g: false, p: "EXP Gain +5%, Toughness EXP Gain +10%" },
  { lv: 7, f: (player: Player) => { skl.dngs.p += .15; player.stra += 2; giveTitle(ttl.dth2); player.stat_r() }, g: false, p: "STR +2, Danger Sense EXP Gain +15%, New Title" },
  { lv: 9, f: (player: Player) => { skl.painr.p += .1; player.sata += 15;; player.stat_r() }, g: false, p: "SAT +15, Pain Resistance EXP Gain +10%, New Title" },
  { lv: 10, f: (player: Player) => { skl.fdpnr.p += .1; skl.dngs.p += .15; player.stra += 2; giveTitle(ttl.dth3); player.stat_r() }, g: false, p: "Survival EXP Gain +10%, , New Title" },
  ],
  use: function (this: any, x: any, y: any) { return this.lvl * .1 }
});

// @ts-ignore: constructor function
skl.rtr = new Skill({
  id: 133, type: 3, name: 'Elusion', desc: 'Ability to escape danger',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.fmn = new Skill({
  id: 134, type: 4, name: 'Famine', desc: 'Ability to go by without any sustenance' + dom.dseparator + '<small style="color:darkorange">Increases lower energy effectiveness bonus</small>', mlstn: [{ lv: 1, f: (player: Player) => { player.exp_t += 0.01 }, g: false, p: "EXP Gain +1%" },
  { lv: 3, f: (player: Player) => { player.sata += 5; player.hpa += 5; skl.glt.p += .03; giveTitle(ttl.fmn1); dom.d5_3_1.update(); player.stat_r(); }, g: false, p: "SAT +5, HP +5, Gluttony EXP Gain +3%, New Title" },
  { lv: 5, f: (player: Player) => { player.stra++; skl.tghs.p += .03; dom.d5_3_1.update(); player.stat_r(); }, g: false, p: "STR +1, Toughness EXP Gain +3%" },
  { lv: 7, f: (player: Player) => { player.agla += 2; skl.fdpnr.p += .15; player.hpa += 15; giveTitle(ttl.fmn2); dom.d5_3_1.update(); player.stat_r(); }, g: false, p: "AGL +2, HP +15, Survival EXP Gain +15%, New Title" },
  { lv: 9, f: (player: Player) => { player.sata += 10; skl.glt.p += .07; skl.dth.p += .05; dom.d5_3_1.update(); player.stat_r(); }, g: false, p: "SAT +10, Death EXP Gain +5%, Gluttony EXP Gain +7%" },
  { lv: 10, f: (player: Player) => { giveTitle(ttl.fmn3); dom.d5_3_1.update(); player.stat_r(); }, g: false, p: ", New Title" },
  ],
  use: function (this: any, x: any, y: any) { return this.lvl * .01 }
});

// @ts-ignore: constructor function
skl.abw = new Skill({
  id: 135, type: 7, name: 'Water Absorption', sp: '0.66em', desc: 'Ability to absorb Water Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Reduces energy loss when wet<br>Provides minor protection from water-based attacks</small>',
  use: function (this: any, x: any, y: any) { return this.lvl },
  onLevel: function (this: any, player: Player) { player.cmaff[3] += Math.ceil(this.lvl / 3 + 1) },
  onGive: function (this: any, player: Player, x: any) { if (!player.ki['w']) player.ki['w'] = x; else player.ki['w'] += x }
});

// @ts-ignore: constructor function
skl.abf = new Skill({
  id: 136, type: 7, name: 'Fire Absorption', sp: '0.66em', desc: 'Ability to absorb Fire Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from fire-based attacks</small>',
  use: function (this: any, x: any, y: any) { return this.lvl },
  onLevel: function (this: any, player: Player) { player.cmaff[4] += Math.ceil(this.lvl / 3 + 1) },
  onGive: function (this: any, player: Player, x: any) { if (!player.ki['f']) player.ki['f'] = x; else player.ki['f'] += x }
});

// @ts-ignore: constructor function
skl.aba = new Skill({
  id: 137, type: 7, name: 'Air Absorption', sp: '0.66em', desc: 'Ability to absorb Air Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from air-based attacks</small>',
  use: function (this: any, x: any, y: any) { return this.lvl },
  onLevel: function (this: any, player: Player) { player.cmaff[1] += Math.ceil(this.lvl / 3 + 1) },
  onGive: function (this: any, player: Player, x: any) { if (!player.ki['a']) player.ki['a'] = x; else player.ki['a'] += x }
});

// @ts-ignore: constructor function
skl.abe = new Skill({
  id: 138, type: 7, name: 'Earth Absorption', sp: '0.66em', desc: 'Ability to absorb Earth Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from earth-based attacks</small>',
  use: function (this: any, x: any, y: any) { return this.lvl },
  onLevel: function (this: any, player: Player) { player.cmaff[2] += Math.ceil(this.lvl / 3 + 1) },
  onGive: function (this: any, player: Player, x: any) { if (!player.ki['e']) player.ki['e'] = x; else player.ki['e'] += x }
});

// @ts-ignore: constructor function
skl.abl = new Skill({
  id: 139, type: 7, name: 'Light Absorption', sp: '0.66em', desc: 'Ability to absorb Holy Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from holy attacks</small>',
  use: function (this: any, x: any, y: any) { return this.lvl },
  onLevel: function (this: any, player: Player) { player.cmaff[5] += Math.ceil(this.lvl / 3 + 1) },
  onGive: function (this: any, player: Player, x: any) { if (!player.ki['l']) player.ki['l'] = x; else player.ki['l'] += x }
});

// @ts-ignore: constructor function
skl.abd = new Skill({
  id: 140, type: 7, name: 'Dark Absorption', sp: '0.66em', desc: 'Ability to absorb Dark Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from Dark attacks</small>',
  use: function (this: any, x: any, y: any) { return this.lvl },
  onLevel: function (this: any, player: Player) { player.cmaff[6] += Math.ceil(this.lvl / 3 + 1) },
  onGive: function (this: any, player: Player, x: any) { if (!player.ki['d']) player.ki['d'] = x; else player.ki['d'] += x }
});

// @ts-ignore: constructor function
skl.hvt = new Skill({
  id: 141, type: 8, name: 'Foraging', desc: 'Ability to harvest gifts of Nature',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.glg = new Skill({
  id: 142, type: 8, name: 'Geology', desc: 'Knowledge and ability to identify precious minerals',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.mng = new Skill({
  id: 143, type: 8, name: 'Mining', desc: 'Ability to extract materials from stones and mountains',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.mntnc = new Skill({
  id: 144, type: 9, name: 'Maintanence', desc: 'Ability to repair damaged equipment',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.rccln = new Skill({
  id: 145, type: 9, name: 'Temperance', desc: 'Ability to resist temptation of worldly possessions',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.bledr = new Skill({
  id: 146, type: 6, name: 'Bleeding Resistance', sp: '0.66em', desc: 'Ability to keep going with blood loss' + dom.dseparator + '<small style="color:darkorange">Wounds bleed less</small>',
  use: function (this: any, x: any, y: any) { return this.lvl * .01 }
});

// @ts-ignore: constructor function
skl.twoh = new Skill({
  id: 147, type: 1, name: 'Two Handed M', bname: 'Two Handed Mastery', desc: 'Ability to fight using heavy two handed weapons' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a two handed weapon</small>',
  use: function (this: any, x: any, y: any) { giveSkExp(this, 1); return you.str * (this.lvl * .0125) }
});

// @ts-ignore: constructor function
skl.trad = new Skill({
  id: 148, type: 3, name: 'Trading', desc: 'Ability to exchange wealth for goods and services' + dom.dseparator + '<small style="color:darkorange">Slightly shifts shop prices in your favour</small>',
  use: function (this: any, x: any, y: any) { return this.lvl * .005 },
  onLevel: function (this: any) { recshop() }
});

// @ts-ignore: constructor function
skl.swm = new Skill({
  id: 149, type: 3, name: 'Swimming', desc: 'Ability to dive and traverse waters',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.dssmb = new Skill({
  id: 150, type: 3, name: 'Disassembly', desc: 'Ability to deconstruct goods into raw spare parts' + dom.dseparator + '<small style="color:darkorange">Increases yield from deconstructed items</small>',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.tghs = new Skill({
  id: 151, type: 2, name: 'Toughness', desc: 'Durability of one\'s body' + dom.dseparator + '<small style="color:darkorange">Slightly improves physical defence</small>',
  use: function (this: any, x: any, y: any) { return this.lvl },
  onLevel: function (this: any, player: Player) { player.cmaff[0] += Math.ceil(this.lvl / 3 + 1) }
});

// @ts-ignore: constructor function
skl.drka = new Skill({
  id: 152, type: 4, name: 'Drinking', desc: 'Ability to tolerate and enjoy alcoholic beverages',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.tpgrf = new Skill({
  id: 153, type: 4, name: 'Topography', desc: 'Knowledge of land surfaces',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.ptnc = new Skill({
  id: 154, type: 4, name: 'Patience', desc: 'Ability to endure forms of suffering without complaint',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.scout = new Skill({
  id: 155, type: 4, name: 'Perception', desc: 'Ability to see the unseen and better understand your surroundings',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.jdg = new Skill({
  id: 156, type: 4, name: 'Judgement', desc: 'Ability to evaluate your choices',
  use: function (this: any, x: any, y: any) { return this.lvl }
});

// @ts-ignore: constructor function
skl.tlrng = new Skill({
  id: 157, type: 5, name: 'Tailoring', desc: 'Abillity to sew and create produce out of cloth',
  use: function (this: any, x: any, y: any) { giveSkExp(this, x || 1); return this.lvl || 1 }
});

// @ts-ignore: constructor function
skl.crptr = new Skill({ id: 158, type: 6, name: 'Corruption Resistance', sp: '.66em', desc: 'Ability to resist the corruption of flesh' + dom.dseparator + '<small style="color:darkorange">Mitigates corruption and fei damage</small>' });

// @ts-ignore: constructor function
skl.hst = new Skill({
  id: 159,
  name: 'Harvesting',
  desc: 'Ability to find and collect usable materials from the surroundings' + dom.dseparator + '<small style="color:darkorange">Increases chances of obtaining area loot</small>',
  use: function (this: any, x: any, y: any) { return this.lvl }
});
skl.hvt.type = 8;

// @ts-ignore: constructor function
skl.coldr = new Skill({ id: 160, type: 6, name: 'Cold Resistance', sp: '.66em', desc: 'Ability to tolerate harsh and cold temperatures' + dom.dseparator + '<small style="color:darkorange">Slightly decreases energy loss when cold</small>' });
