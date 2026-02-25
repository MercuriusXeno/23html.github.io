import { skl, you, dom, ttl, rcp } from '../state';
import { giveTitle, giveRcp } from '../main';

// ==========================================================================
// Skill constructor + instances
// ==========================================================================

function Skill(cfg) {
  this.name = '';
  this.desc = '';
  this.exp = 0;
  this.lvl = 0;
  this.type = 0;
  this.p = 1;
  this.sp;
  this.expnext = function () { return Math.round((50 + ((this.lvl + 1) ** Math.log(9 * this.lvl + 1)))) };
  this.expnext_t = this.expnext();
  ///(i*.12)
  this.onLevel = function () { };
  this.onGive = function (x) { };
  this.use = function (x, y) { };
  if (cfg) for (let k in cfg) this[k] = cfg[k];
}

skl.fgt = new Skill({
  id: 101, type: 1, name: 'Fighting', desc: 'Ability to perform better in a fight' + dom.dseparator + '<small style="color:darkorange">Slightly increases overall attack power</small>', mlstn: [{ lv: 2, f: () => { you.exp_t += 0.02; you.stat_r(); }, g: false, p: "EXP Gain +2%" },
  { lv: 5, f: () => { you.stra += 1; you.stat_r(); giveTitle(ttl.cvl) }, g: false, p: "STR +1, New Title" },
  { lv: 8, f: () => { you.exp_t += 0.02; you.stat_r() }, g: false, p: "EXP Gain +3%" },
  { lv: 10, f: () => { you.exp_t += 0.05; you.mods.sbonus += 0.01; you.stat_r(); giveTitle(ttl.tcvl) }, g: false, p: "EXP Gain +5%, Energy Effectiveness +1%, New Title" },
  { lv: 11, f: function () { skl.unc.p += .1; skl.srdc.p += .1; skl.knfc.p += .1; skl.axc.p += .1; skl.plrmc.p += .1; skl.stfc.p += .1; skl.bwc.p += .1; skl.hmrc.p += .1; }, g: false, p: "All Masteries EXP Gain +10%" },
  { lv: 12, f: () => { giveTitle(ttl.fgt); you.stra += 1; skl.war.p += .05; you.stat_r() }, g: false, p: "STR +1, War EXP Gain +5%, New Title" },
  { lv: 13, f: () => { you.agla += 2; you.stat_r() }, g: false, p: "AGL +2" },
  { lv: 14, f: () => { you.exp_t += 0.06; }, g: false, p: "EXP Gain +6%" },
  { lv: 15, f: () => { you.exp_t += 0.08; skl.unc.p += .1; skl.srdc.p += .1; skl.knfc.p += .1; skl.axc.p += .1; skl.plrmc.p += .1; skl.stfc.p += .1; skl.bwc.p += .1; skl.hmrc.p += .1; giveTitle(ttl.rok) }, g: false, p: "EXP Gain +8%, All Masteries EXP Gain +10%, New Title" },
  ]
});
skl.fgt.use = function (x, y) { return you.str * (this.lvl * .02) }


skl.unc = new Skill({
  id: 102, type: 1, name: 'Unarmed M', bname: 'Unarmed Mastery', desc: 'Mastery of unarmed combat' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when fighting unarmed</small>', mlstn: [{ lv: 2, f: () => { you.stra += 1; you.stat_r(); }, g: false, p: "STR +1" },
  { lv: 5, f: () => { you.agla += 1; you.stat_r(); giveTitle(ttl.pbg) }, g: false, p: "AGL +1, New Title" },
  { lv: 8, f: () => { you.exp_t += 0.01; you.stat_r() }, g: false, p: "EXP Gain +1%" },
  { lv: 10, f: () => { you.exp_t += 0.05; you.mods.sbonus += 0.02; you.stat_r(); giveTitle(ttl.bll) }, g: false, p: "EXP Gain +5%, Energy Effectiveness +2%, New Title" },
  { lv: 11, f: () => { skl.fgt.p += .03; you.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ]
});
skl.unc.use = function (x, y) { you.str += you.str / 100 * (this.lvl * 6); }
skl.srdc = new Skill({
  id: 103, type: 1, name: 'Sword M', bname: 'Sword Mastery', desc: 'Ability to fight using swords' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a sword</small>', mlstn: [{ lv: 1, f: () => { you.stra += 1; you.stat_r(); }, g: false, p: "STR +1" },
  { lv: 3, f: () => { you.agla += 1; you.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 5, f: () => { you.stra += 1; you.agla += 1; you.stat_r(); giveTitle(ttl.srd1) }, g: false, p: "STR +1, AGL +1, New Title" },
  { lv: 8, f: () => { you.exp_t += 0.03; you.stat_r() }, g: false, p: "EXP Gain +3%" },
  { lv: 10, f: () => { you.exp_t += 0.05; you.mods.sbonus += 0.01; you.stat_r(); giveTitle(ttl.srd2) }, g: false, p: "EXP Gain +5%, Energy Effectiveness +1%, New Title" },
  { lv: 11, f: () => { skl.fgt.p += .03; you.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ]
});
skl.srdc.use = function (x, y) { you.str += you.str / 100 * (this.lvl * 5); }

skl.knfc = new Skill({
  id: 104, type: 1, name: 'Knife M', bname: 'Knife Mastery', desc: 'Ability to fight using knives and daggers' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a knife</small>', mlstn: [{ lv: 2, f: () => { you.agla += 1; you.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 3, f: () => { you.exp_t += 0.01; you.agla += 2; you.stat_r(); }, g: false, p: "AGL +2, EXP Gain +1%" },
  { lv: 5, f: () => { you.stra += 1; you.stat_r(); giveTitle(ttl.plm) }, g: false, p: "STR +1, New Title" },
  { lv: 8, f: () => { you.stra += 1; you.agla += 1; you.exp_t += 0.02; }, g: false, p: "AGL +1, STR +1, EXP Gain +2%" },
  { lv: 10, f: () => { you.mods.cpwr += .1; giveTitle(ttl.knf) }, g: false, p: "Critical Damage +10%, New Title" },
  { lv: 11, f: () => { skl.fgt.p += .03; you.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ]
});
skl.knfc.use = function (x, y) { you.str += you.str / 100 * (this.lvl * 5); }

skl.axc = new Skill({
  id: 105, type: 1, name: 'Axe M', bname: 'Axe Mastery', desc: 'Ability to fight using axes' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding an axe</small>', mlstn: [{ lv: 2, f: () => { you.stra += 1; you.stat_r(); }, g: false, p: "STR +1" },
  { lv: 3, f: () => { you.exp_t += 0.02; you.stra += 1; you.stat_r(); }, g: false, p: "STR +1, EXP Gain +2%" },
  { lv: 5, f: () => { you.hpa += 30; you.ccls[2] += 1; you.stat_r(); giveTitle(ttl.axc1) }, g: false, p: "HP +30, Blunt DEF +1, New Title" },
  { lv: 8, f: () => { you.stra += 1; you.agla += 1; you.exp_t += 0.02; you.stat_r() }, g: false, p: "AGL +1, STR +1, EXP Gain +2%" },
  { lv: 10, f: () => { you.mods.sbonus += 0.02; you.stat_p[1] += .05; giveTitle(ttl.axc2) }, g: false, p: "Energy Effectiveness +2%, STR training Potential +5%, New Title" },
  { lv: 11, f: () => { skl.fgt.p += .03; you.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ]
});
skl.axc.use = function (x, y) { you.str += you.str / 100 * (this.lvl * 5); }

skl.plrmc = new Skill({
  id: 106, type: 1, name: 'Polearm M', bname: 'Polearm Mastery', desc: 'Ability to fight using polearms and lances' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a spear/polearm</small>', mlstn: [{ lv: 2, f: () => { you.agla += 1; you.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 3, f: () => { you.exp_t += 0.01; you.agla += 1; you.stat_r(); }, g: false, p: "AGL +1, EXP Gain +1%" },
  { lv: 5, f: () => { you.stra += 1; you.ccls[1] += 1; you.stat_r(); giveTitle(ttl.lnc1) }, g: false, p: "STR +1, Pierce DEF +1, New Title" },
  { lv: 8, f: () => { you.stra += 2; you.exp_t += 0.03; you.stat_r() }, g: false, p: "STR +2, EXP Gain +3%" },
  { lv: 10, f: () => { you.res.ph += .01; giveTitle(ttl.lnc2) }, g: false, p: "Physical Resistance +1%, New Title" },
  { lv: 11, f: () => { skl.fgt.p += .03; you.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ]
});
skl.plrmc.use = function (x, y) { you.str += you.str / 100 * (this.lvl * 5); }


skl.hmrc = new Skill({
  id: 107, type: 1, name: 'Hammer M', bname: 'Hammer Mastery', desc: 'Ability to fight using blunt weaponry' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a club/hammer</small>', mlstn: [{ lv: 2, f: () => { you.exp_t += 0.01; you.agla += 1; you.stat_r(); }, g: false, p: "AGL +1, EXP Gain +1%" },
  { lv: 4, f: () => { you.stra += 1; you.stat_r(); }, g: false, p: "STR +1" },
  { lv: 5, f: () => { you.stra += 1; you.stat_r(); giveTitle(ttl.stk) }, g: false, p: "STR +1, New Title" },
  { lv: 8, f: () => { you.stra += 1; you.exp_t += 0.03; you.stat_r() }, g: false, p: "STR +1, EXP Gain +3%" },
  { lv: 10, f: () => { you.stra += 3; you.exp_t += 0.03; you.stat_r(); giveTitle(ttl.hmr2) }, g: false, p: "STR +3, EXP Gain +3%, New Title" },
  { lv: 11, f: () => { skl.fgt.p += .03; you.stat_r(); }, g: false, p: "Fighting EXP Gain +3%" },
  ]
});
skl.hmrc.use = function (x, y) { you.str += you.str / 100 * (this.lvl * 5); }

skl.stfc = new Skill({ id: 108, type: 1, name: 'Staff M', bname: 'Staff Mastery', desc: 'Ability to fight using staves and wands' });
skl.stfc.use = function (x, y) { you.int += you.int / 100 * (this.lvl * 5); }

skl.shdc = new Skill({
  id: 109, type: 1, name: 'Shield M', bname: 'Shield Mastery', desc: 'Ability to use shields better', mlstn: [{ lv: 2, f: () => { you.exp_t += 0.03; skl.painr.p += .01; you.stat_r(); }, g: false, p: "EXP Gain +3%, Pain Resistance EXP Gain +1%" },
  { lv: 4, f: () => { you.hpa += 12; skl.painr.p += .02; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +12, Pain Resistance EXP Gain +2%" },
  { lv: 5, f: () => { you.stra += 1; you.stat_r(); giveTitle(ttl.sld1); skl.painr.p += .07 }, g: false, p: "STR +1, Pain Resistance EXP Gain +7%, New Title" },
  { lv: 8, f: () => { you.agla += 2; you.exp_t += 0.05; you.stat_r() }, g: false, p: "AGL +2, EXP Gain +5%" },
  { lv: 10, f: () => { you.hpa += 30; you.stra += 2; you.agla += 2; you.exp_t += 0.05; you.stat_r(); giveTitle(ttl.sld2) }, g: false, p: "HP +30, STR +2, AGL +2, New Title" },
  { lv: 11, f: () => { skl.fgt.p += .08; you.stat_r(); }, g: false, p: "Fighting EXP Gain +8%" },
  ]
});
skl.shdc.use = function (x, y) { giveSkExp(this, x || 1); you.str += you.str / 100 * (this.lvl * 5); you.int += you.int / 100 * (this.lvl * 3); }

skl.sleep = new Skill({
  id: 110, type: 4, name: 'Sleeping', desc: 'The rest of Body' + dom.dseparator + '<small style="color:darkorange">Increases health gain during sleep</small>', mlstn: [{ lv: 2, f: () => { you.hpa += 2; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +2" },
  { lv: 4, f: () => { you.hpa += 5; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +5" },
  { lv: 5, f: () => { skl.ptnc.p += .05; giveTitle(ttl.slp1); you.hpa += 10; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +10, Patience EXP Gain +5%, New Title" },
  { lv: 6, f: () => { you.hpa += 12; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +12" },
  { lv: 7, f: () => { you.hpa += 15; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +15" },
  { lv: 8, f: () => { you.hpa += 20; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +20" },
  { lv: 9, f: () => { skl.ptnc.p += .1; you.hpa += 25; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "Patience EXP Gain +10%, HP +25" },
  { lv: 10, f: () => { giveTitle(ttl.slp2); skl.dth.p += .1; you.hpa += 30; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +30, Death EXP Gain +10%, New Title" },
  { lv: 11, f: () => { you.hpa += 35; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +35" },
  { lv: 12, f: () => { you.hpa += 50; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +50" },
  ]
});
skl.sleep.use = function (x, y) { giveSkExp(this, x.sq || 1); return 5 * this.lvl * x.sq }

skl.seye = new Skill({
  id: 111, type: 3, name: 'Sharp Eye', desc: 'Ability to notice weak points' + dom.dseparator + '<small style="color:darkorange">Slightly increases critical probability</small>', mlstn: [{ lv: 1, f: () => { you.agla += 1; you.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 3, f: () => { giveTitle(ttl.seye1); you.stra += 1; you.exp_t += 0.04; you.stat_r() }, g: false, p: "STR +1, EXP Gain +4%, New Title" },
  { lv: 4, f: () => { skl.scout.p += .05; you.mods.cpwr += .02; you.exp_t += 0.06; }, g: false, p: "Perception EXP Gain +5%, Critical Damage +2%, EXP Gain +6%" },
  { lv: 5, f: () => { skl.unc.p += .05; skl.fgt.p += .05; skl.srdc.p += .05; skl.knfc.p += .05; skl.axc.p += .05; skl.plrmc.p += .05; skl.stfc.p += .05; skl.bwc.p += .05; skl.hmrc.p += .05; you.stat_r(); giveTitle(ttl.seye2); }, g: false, p: "All Masteries EXP Gain +5%, Fighting EXP Gain +5%, New Title" },
  { lv: 6, f: () => { skl.evas.p += .08; you.mods.cpwr += .08; skl.war.p += .07; }, g: false, p: "Evasion EXP Gain +8%, Critical Damage +8%, War EXP Gain +7%" },
  { lv: 7, f: () => { skl.scout.p += .1; you.mods.sbonus += 0.01; you.stra += 2; you.stat_r() }, g: false, p: "EXP Gain +7%, STR +2, Perception EXP Gain +10%, Energy Effectiveness +1%" },
  { lv: 8, f: () => { you.aff[0] += 5; giveTitle(ttl.seye3) }, g: false, p: "Physical ATK +5, New Title" },
  ]
});
skl.seye.use = function (x, y) { return this.lvl * 0.003 }

skl.pet = new Skill({
  id: 112, type: 10, name: 'Patting', desc: 'Mastery of petting animals' + dom.dseparator + '<small style="color:darkorange">Makes animals love you</small>', mlstn: [{ lv: 2, f: () => { you.luck += 1; you.stat_r(); }, g: false, p: "LUCK +1" },
  { lv: 4, f: () => { you.agla += 1; you.stat_r(); }, g: false, p: "AGL +1" },
  { lv: 5, f: () => { you.agla += 1; you.mods.sbonus += 0.01; you.stat_r(); giveTitle(ttl.pet1) }, g: false, p: "Energy Effectiveness +1%, New Title" },
  { lv: 6, f: () => { you.hpa += 33; you.stat_r(); dom.d5_1_1.update() }, g: false, p: "HP +33" },
  { lv: 7, f: () => { you.agla += 2; you.stat_r(); }, g: false, p: "AGL +2" },
  { lv: 8, f: () => { you.exp_t += 0.1; you.cmaff[1] += 3; you.stat_r(); giveTitle(ttl.pet2) }, g: false, p: "EXP Gain +10%, Beast Class DEF +3, New Title" },
  { lv: 9, f: () => { skl.unc.p += .1; }, g: false, p: "Unarmed Mastery EXP gain +10%" },
  { lv: 10, f: () => { you.inta += 3; giveTitle(ttl.pet3) }, g: false, p: "INT +3, New Title" },
  ]
});
skl.pet.use = function (x, y) { giveSkExp(this, x || 1); }

skl.walk = new Skill({
  id: 113, type: 4, name: 'Walking', desc: 'Ability to walk', mlstn: [{ lv: 1, f: () => { you.agla += 1; you.stat_r(); giveAction(act.demo) }, g: false, p: "AGL +1" },
  { lv: 3, f: () => { giveTitle(ttl.wlk); you.hpa += 5; you.stat_r() }, g: false, p: "HP +5, New Title" },
  { lv: 4, f: () => { you.hpa += 8; you.sata += 6; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +8, SAT +6" },
  { lv: 5, f: () => { giveTitle(ttl.jgg); you.hpa += 10; you.sata += 8; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +10, SAT +8, New Title" },
  { lv: 6, f: () => { you.exp_t += 0.03; you.hpa += 12; you.stat_r(); you.stat_p[0] += .03; dom.d5_3_1.update() }, g: false, p: "HP +12, EXP Gain +3%, HP Training Potential +3%" },
  { lv: 7, f: () => { skl.tghs.p += .1; you.exp_t += 0.03; you.sata += 10; you.stat_r(); you.stra += 1; you.stat_p[1] += .03; dom.d5_3_1.update() }, g: false, p: "Toughness EXP Gain +10%, STR +1, SAT +10, EXP Gain +3%, STR Training Potential +3%" },
  { lv: 8, f: () => { skl.evas.p += .05; you.exp_t += 0.03; you.hpa += 15; you.stat_r(); you.agla += 2; you.stat_p[2] += .03; dom.d5_3_1.update() }, g: false, p: "Evasion EXP Gain +5%, HP +15, AGL +2, EXP Gain +3%, AGL Training Potential +3%" },
  { lv: 9, f: () => { you.exp_t += 0.06; you.hpa += 8; you.sata += 8; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +8, SAT +8, EXP Gain +6%" },
  { lv: 10, f: () => { giveTitle(ttl.rnr); you.spda += 1; you.hpa += 10; you.sata += 10; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "HP +10, SAT 10, SPD +1, New Title" },
  ]
});
skl.walk.use = function (x, y) { giveSkExp(this, .5); }

skl.dice = new Skill({
  id: 114, type: 10, name: 'Gambling', desc: 'Skill of chances', mlstn: [{ lv: 1, f: () => { you.luck += 1; you.stat_r(); }, g: false, p: "LUCK +1" },
  { lv: 3, f: () => { you.agla += 2; you.stat_r(); }, g: false, p: "AGL +2" },
    //{lv:10,f:()=>{you.spda+=1;you.stat_r();},g:false,p:"SPD +1"},
  ]
});
skl.dice.use = function (x, y) { giveSkExp(this, x || 1); }

skl.glt = new Skill({
  id: 115, type: 4, name: 'Gluttony', desc: 'Mastery of eating', mlstn: [{ lv: 1, f: function () { you.sata += 5; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +5" },
  { lv: 2, f: () => { you.sata += 5; you.hpa += 5; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +5, HP +5" },
  { lv: 3, f: () => { giveTitle(ttl.eat1); you.sata += 10; you.hpa += 5; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +5, New Title" },
  { lv: 4, f: () => { skl.fdpnr.p += .05; you.sata += 10; you.hpa += 5; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +5, Survival EXP Gain +5%" },
  { lv: 5, f: () => { you.sata += 10; you.hpa += 10; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +10" },
  { lv: 6, f: () => { you.sata += 10; you.hpa += 15; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +15" },
  { lv: 7, f: () => { giveTitle(ttl.eat2); you.sata += 10; you.hpa += 20; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +10, HP +20, New Title" },
  { lv: 8, f: () => { you.sata += 15; you.hpa += 25; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +15, HP +25" },
  { lv: 9, f: () => { skl.fdpnr.p += .15; you.sata += 15; you.hpa += 35; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +15, HP +35, Survival EXP Gain +15%" },
  { lv: 10, f: () => { you.eqp_t += .13; giveTitle(ttl.eat3); you.sata += 20; you.hpa += 40; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "EXP Gain +13%, SAT +20, HP +40, New Title" },
  { lv: 11, f: () => { you.sata += 25; you.hpa += 50; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +25, HP +50" },
  { lv: 12, f: () => { you.sata += 25; you.hpa += 60; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +25, HP +60" },
  { lv: 13, f: () => { you.sata += 25; you.hpa += 70; you.stat_r(); dom.d5_3_1.update() }, g: false, p: "SAT +25, HP +70" },]
});
skl.glt.use = function (x, y) { giveSkExp(this, x || 1); return this.lvl || 1 }

skl.rdg = new Skill({
  id: 116, type: 4, name: 'Literacy', desc: 'Understanding of meaning behind texts' + dom.dseparator + '<small style="color:darkorange">Improves reading speed</small>', mlstn: [{ lv: 2, f: () => { you.inta += 1; you.stat_r(); }, g: false, p: "INT +1" },
  { lv: 3, f: () => { giveTitle(ttl.ilt); you.exp_t += 0.02; you.stat_r(); }, g: false, p: "EXP Gain +2%, New Title" },
  { lv: 4, f: () => { you.exp_t += 0.02; you.inta += 1; you.stat_r(); }, g: false, p: "INT +1, EXP Gain +2%" },
  { lv: 5, f: () => { giveTitle(ttl.und); you.inta += 1; you.exp_t += 0.03; you.stat_r(); }, g: false, p: "EXP Gain +3%, INT +1, New Title" },
  ]
});
skl.rdg.use = function (x, y) { return this.lvl }

skl.cook = new Skill({
  id: 117, type: 5, name: 'Cooking', desc: 'The art of Cooking' + dom.dseparator + '<small style="color:darkorange">Reduces chances to cook a failed product</small>', mlstn: [{ lv: 1, f: () => { you.inta += 1; you.agla += 1; giveRcp(rcp.rsmt); giveRcp(rcp.segg); you.stat_r(); }, g: false, p: "INT +1, AGL +1" },
  { lv: 2, f: () => { giveTitle(ttl.coo1); giveRcp(rcp.bcrc); giveRcp(rcp.bcrrt); you.exp_t += 0.05; you.stra += 1; you.stat_r(); }, g: false, p: "STR +1, EXP Gain +5%, New Title" },
    //              {lv:3,f:()=>{you.exp_t+=0.02;you.inta+=1;you.stat_r();},g:false,p:"INT +1, EXP Gain +2%"},
    //              {lv:4,f:()=>{giveTitle(ttl.cck);you.inta+=1;you.exp_t+=0.03;you.stat_r();},g:false,p:"EXP Gain +3%, INT +1, New Title"},
  ]
});
skl.cook.use = function (x, y) { giveSkExp(this, x || 1); return this.lvl || 1 }

skl.mdt = new Skill({ id: 118, type: 4, name: 'Meditation', desc: 'The rest of Mind' });
skl.mdt.use = function (x, y) { return this.lvl }

skl.crft = new Skill({ id: 119, type: 5, name: 'Crafting', desc: 'The art of Creation' + dom.dseparator + '<small style="color:darkorange">Makes autocrafting faster</small>' });
skl.crft.use = function (x, y) { giveSkExp(this, x || 1); return this.lvl || 1 }

skl.alch = new Skill({ id: 120, type: 5, name: 'Alchemy', desc: 'Knowledge of medicine and alchemical transmutation', mlstn: [{ lv: 1, f: () => { you.inta += 1; giveRcp(rcp.hptn1) }, g: false, p: "INT +1" }] });
skl.alch.use = function (x, y) { giveSkExp(this, x || 1); return this.lvl || 1 }

skl.thr = new Skill({ id: 121, type: 2, name: 'Throwing', desc: 'Mastery of throwing' + dom.dseparator + '<small style="color:darkorange">Decreases waiting time between throws<br>Slightly increases throwing damage</small>' });
skl.thr.use = function (x, y) { return { a: this.lvl / 10, b: this.lvl * 5 } }

skl.bwc = new Skill({ id: 122, type: 1, name: 'Ranged M', bname: 'Ranged Mastery', desc: 'Ability to utilize bows and crossbows in combat' });
skl.bwc.use = function (x, y) { you.str += you.str / 100 * (this.lvl * 5); }

skl.ntst = new Skill({ id: 123, type: 3, name: 'Nightsight', desc: 'Ability to see better in the darkness' + dom.dseparator + '<small style="color:darkorange">Mitigates hit penalty while fighting in darkness</small>' });
skl.ntst.use = function (x, y) { giveSkExp(this, x || 1) }

skl.evas = new Skill({ id: 124, type: 3, name: 'Evasion', desc: 'Ability to dodge attacks' });
skl.evas.use = function (x, y) { giveSkExp(this, x || 1) }

skl.gred = new Skill({ id: 125, type: 4, name: 'Greed', desc: 'The power of possessions' });
skl.gred.use = function (x, y) { return true }

skl.dngs = new Skill({
  id: 126, type: 3, name: 'Danger Sense', desc: 'Ability to detect and avoid danger' + dom.dseparator + '<small style="color:darkorange">Slightly decreases critical damage received</small>', mlstn: [{ lv: 1, f: () => { you.exp_t += 0.03 }, g: false, p: "EXP Gain +3%" },
  { lv: 2, f: () => { you.agla += 1; you.stat_r(); skl.painr.p += .03 }, g: false, p: "AGL +1, Pain Resistance EXP Gain +3%" },
  { lv: 3, f: () => { giveTitle(ttl.dngs1); skl.fgt.p += .1; }, g: false, p: "Fighting EXP Gain +10%, New Title" },
  { lv: 4, f: () => { skl.evas.p += .1; you.exp_t += 0.05; you.stra += 1; you.stat_r(); }, g: false, p: "EXP Gain +5%, Evasion EXP Gain +10%, STR +1" },
  { lv: 5, f: () => { giveTitle(ttl.dngs2); skl.seye.p += .1; you.mods.sbonus += 0.01; you.agla += 2; you.stat_r(); }, g: false, p: "AGL +2, Energy Effectiveness +1%, Sharp Eye EXP Gain +10%, New Title" },
  ]
});
skl.dngs.use = function (x, y) { return this.lvl }

skl.painr = new Skill({
  id: 127, type: 6, name: 'Pain Resistance', sp: '.66em', desc: 'Ability to tolerate physical harm' + dom.dseparator + '<small style="color:darkorange">Slightly decreases damage received</small>', mlstn: [{ lv: 1, f: () => { you.exp_t += 0.01 }, g: false, p: "EXP Gain +1%" },
  { lv: 3, f: () => { you.exp_t += 0.02; you.agla += 1; you.stat_r(); }, g: false, p: "EXP Gain +2%, AGL +1" },
  { lv: 5, f: () => { giveTitle(ttl.rspn1); you.stra += 1; you.exp_t += 0.05; you.stat_r(); }, g: false, p: "EXP Gain +5%, STR +1, New Title" },
  { lv: 6, f: () => { skl.dngs.p += .1; you.stat_r(); }, g: false, p: "Danger Sense EXP Gain +10%" },
  ]
});
skl.painr.use = function (x, y) { return this.lvl * .004 }

skl.poisr = new Skill({ id: 128, type: 6, name: 'Poison Resistance', sp: '0.66em', desc: 'Ability to tolerate harmful poisons' + dom.dseparator + '<small style="color:darkorange">Increases probability to avoid being poisoned</small>' });
skl.poisr.use = function (x, y) { return this.lvl * .01 }

skl.fdpnr = new Skill({
  id: 129, type: 4, name: 'Survival', desc: 'Ability to safely digest dangerous food' + dom.dseparator + '<small style="color:darkorange">Reduces energy loss from food poisoning</small>', mlstn: [{ lv: 1, f: () => { you.exp_t += 0.03 }, g: false, p: "EXP Gain +3%" },
  { lv: 2, f: () => { you.sata += 15; you.hpa += 30; skl.glt.p += .05; dom.d5_3_1.update(); you.stat_r(); }, g: false, p: "SAT +15, HP +30, Gluttony EXP Gain +5%" },
  { lv: 3, f: () => { giveTitle(ttl.rfpn1); skl.drka.p += .1;; you.exp_t += 0.05; you.stra += 1; you.stat_r(); }, g: false, p: "EXP Gain +5%, STR +1, Drinking EXP Gain +10%, New Title" },
  { lv: 5, f: () => { giveTitle(ttl.rfpn2); you.exp_t += 0.07; skl.painr.p += .1; skl.glt.p += .1; }, g: false, p: "EXP Gain +7%, Pain Resistance EXP Gain +10%, Gluttony EXP Gain +10%, New Title" },
  { lv: 6, f: () => { skl.rtr.p += .15; you.stra += 2; you.stat_r(); }, g: false, p: "Elusion EXP Gain +15%, STR +2, HP +100" },
  { lv: 7, f: () => { you.exp_t += 0.1; you.stra += 1; skl.poisr.p += .1; skl.glt.p += .15; you.stat_r(); }, g: false, p: "EXP Gain +10%, STR +1, Poison Resistance EXP Gain +10%, Gluttony EXP Gain +15%," },
  { lv: 8, f: () => { giveTitle(ttl.rfpn3); you.res.ph -= .01; skl.poisr.p += .2; skl.painr.p += .2 }, g: false, p: "Damage Reduction +1%, Pain Resistance EXP Gain +20%, Poison Resistance EXP Gain +20%, New Title" },
  ]
});
skl.fdpnr.use = function (x, y) { return this.lvl * .05 }

skl.war = new Skill({ id: 130, type: 3, name: 'War', desc: 'Mastery of destruction and military tactics' + dom.dseparator + '<small style="color:darkorange">Slightly increases crit damage</small>' });
skl.war.use = function (x, y) { return this.lvl * .005 }

skl.stel = new Skill({ id: 131, type: 3, name: 'Stealing', desc: 'Ability to pilfer' });
skl.stel.use = function (x, y) { return this.lvl * .05 }

skl.dth = new Skill({
  id: 132, type: 4, name: 'Death', desc: 'Ability to cling to your fate' + dom.dseparator + '<small style="color:darkorange">Reduces energy loss on death</small>', mlstn: [{ lv: 1, f: () => { you.hpa += 20; you.stat_r() }, g: false, p: "HP +20" },
  { lv: 3, f: () => { you.exp_t += .03; skl.painr.p += .05; giveTitle(ttl.dth1); you.stat_r() }, g: false, p: "EXP Gain +3%, Pain Resistance EXP Gain +5%, New Title" },
  { lv: 5, f: () => { you.eqp_t += .05; skl.tghs.p += .1; you.stat_r() }, g: false, p: "EXP Gain +5%, Toughness EXP Gain +10%" },
  { lv: 7, f: () => { skl.dngs.p += .15; you.stra += 2; giveTitle(ttl.dth2); you.stat_r() }, g: false, p: "STR +2, Danger Sense EXP Gain +15%, New Title" },
  { lv: 9, f: () => { skl.painr.p += .1; you.sata += 15;; you.stat_r() }, g: false, p: "SAT +15, Pain Resistance EXP Gain +10%, New Title" },
  { lv: 10, f: () => { skl.fdpnr.p += .1; skl.dngs.p += .15; you.stra += 2; giveTitle(ttl.dth3); you.stat_r() }, g: false, p: "Survival EXP Gain +10%, , New Title" },
  ]
});
skl.dth.use = function (x, y) { return this.lvl * .1 }

skl.rtr = new Skill({ id: 133, type: 3, name: 'Elusion', desc: 'Ability to escape danger' });
skl.rtr.use = function (x, y) { return this.lvl }

skl.fmn = new Skill({
  id: 134, type: 4, name: 'Famine', desc: 'Ability to go by without any sustenance' + dom.dseparator + '<small style="color:darkorange">Increases lower energy effectiveness bonus</small>', mlstn: [{ lv: 1, f: () => { you.exp_t += 0.01 }, g: false, p: "EXP Gain +1%" },
  { lv: 3, f: () => { you.sata += 5; you.hpa += 5; skl.glt.p += .03; giveTitle(ttl.fmn1); dom.d5_3_1.update(); you.stat_r(); }, g: false, p: "SAT +5, HP +5, Gluttony EXP Gain +3%, New Title" },
  { lv: 5, f: () => { you.stra++; skl.tghs.p += .03; dom.d5_3_1.update(); you.stat_r(); }, g: false, p: "STR +1, Toughness EXP Gain +3%" },
  { lv: 7, f: () => { you.agla += 2; skl.fdpnr.p += .15; you.hpa += 15; giveTitle(ttl.fmn2); dom.d5_3_1.update(); you.stat_r(); }, g: false, p: "AGL +2, HP +15, Survival EXP Gain +15%, New Title" },
  { lv: 9, f: () => { you.sata += 10; skl.glt.p += .07; skl.dth.p += .05; dom.d5_3_1.update(); you.stat_r(); }, g: false, p: "SAT +10, Death EXP Gain +5%, Gluttony EXP Gain +7%" },
  { lv: 10, f: () => { giveTitle(ttl.fmn3); dom.d5_3_1.update(); you.stat_r(); }, g: false, p: ", New Title" },
  ]
});
skl.fmn.use = function (x, y) { return this.lvl * .01 }

skl.abw = new Skill({ id: 135, type: 7, name: 'Water Absorption', sp: '0.66em', desc: 'Ability to absorb Water Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Reduces energy loss when wet<br>Provides minor protection from water-based attacks</small>' });
skl.abw.use = function (x, y) { return this.lvl }
skl.abw.onLevel = function () { you.cmaff[3] += Math.ceil(this.lvl / 3 + 1) }
skl.abw.onGive = function (x) { if (!you.ki['w']) you.ki['w'] = x; else you.ki['w'] += x }

skl.abf = new Skill({ id: 136, type: 7, name: 'Fire Absorption', sp: '0.66em', desc: 'Ability to absorb Fire Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from fire-based attacks</small>' });
skl.abf.use = function (x, y) { return this.lvl }
skl.abf.onLevel = function () { you.cmaff[4] += Math.ceil(this.lvl / 3 + 1) }
skl.abf.onGive = function (x) { if (!you.ki['f']) you.ki['f'] = x; else you.ki['f'] += x }

skl.aba = new Skill({ id: 137, type: 7, name: 'Air Absorption', sp: '0.66em', desc: 'Ability to absorb Air Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from air-based attacks</small>' });
skl.aba.use = function (x, y) { return this.lvl }
skl.aba.onLevel = function () { you.cmaff[1] += Math.ceil(this.lvl / 3 + 1) }
skl.aba.onGive = function (x) { if (!you.ki['a']) you.ki['a'] = x; else you.ki['a'] += x }

skl.abe = new Skill({ id: 138, type: 7, name: 'Earth Absorption', sp: '0.66em', desc: 'Ability to absorb Earth Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from earth-based attacks</small>' });
skl.abe.use = function (x, y) { return this.lvl }
skl.abe.onLevel = function () { you.cmaff[2] += Math.ceil(this.lvl / 3 + 1) }
skl.abe.onGive = function (x) { if (!you.ki['e']) you.ki['e'] = x; else you.ki['e'] += x }

skl.abl = new Skill({ id: 139, type: 7, name: 'Light Absorption', sp: '0.66em', desc: 'Ability to absorb Holy Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from holy attacks</small>' });
skl.abl.use = function (x, y) { return this.lvl }
skl.abl.onLevel = function () { you.cmaff[5] += Math.ceil(this.lvl / 3 + 1) }
skl.abl.onGive = function (x) { if (!you.ki['l']) you.ki['l'] = x; else you.ki['l'] += x }

skl.abd = new Skill({ id: 140, type: 7, name: 'Dark Absorption', sp: '0.66em', desc: 'Ability to absorb Dark Ki and assimilate it within your body' + dom.dseparator + '<small style="color:darkorange">Provides minor protection from Dark attacks</small>' });
skl.abd.use = function (x, y) { return this.lvl }
skl.abd.onLevel = function () { you.cmaff[6] += Math.ceil(this.lvl / 3 + 1) }
skl.abd.onGive = function (x) { if (!you.ki['d']) you.ki['d'] = x; else you.ki['d'] += x }

skl.hvt = new Skill({ id: 141, type: 8, name: 'Foraging', desc: 'Ability to harvest gifts of Nature' });
skl.hvt.use = function (x, y) { return this.lvl }

skl.glg = new Skill({ id: 142, type: 8, name: 'Geology', desc: 'Knowledge and ability to identify precious minerals' });
skl.glg.use = function (x, y) { return this.lvl }

skl.mng = new Skill({ id: 143, type: 8, name: 'Mining', desc: 'Ability to extract materials from stones and mountains' });
skl.mng.use = function (x, y) { return this.lvl }

skl.mntnc = new Skill({ id: 144, type: 9, name: 'Maintanence', desc: 'Ability to repair damaged equipment' });
skl.mntnc.use = function (x, y) { return this.lvl }

skl.rccln = new Skill({ id: 145, type: 9, name: 'Temperance', desc: 'Ability to resist temptation of worldly possessions' });
skl.rccln.use = function (x, y) { return this.lvl }

skl.bledr = new Skill({ id: 146, type: 6, name: 'Bleeding Resistance', sp: '0.66em', desc: 'Ability to keep going with blood loss' + dom.dseparator + '<small style="color:darkorange">Wounds bleed less</small>' });
skl.bledr.use = function (x, y) { return this.lvl * .01 }

skl.twoh = new Skill({ id: 147, type: 1, name: 'Two Handed M', bname: 'Two Handed Mastery', desc: 'Ability to fight using heavy two handed weapons' + dom.dseparator + '<small style="color:darkorange">Slightly increases attack power when holding a two handed weapon</small>' });
skl.twoh.use = function (x, y) { giveSkExp(this, 1); return you.str * (this.lvl * .0125) }

skl.trad = new Skill({ id: 148, type: 3, name: 'Trading', desc: 'Ability to exchange wealth for goods and services' + dom.dseparator + '<small style="color:darkorange">Slightly shifts shop prices in your favour</small>' });
skl.trad.use = function (x, y) { return this.lvl * .005 }
skl.trad.onLevel = function () { recshop() }

skl.swm = new Skill({ id: 149, type: 3, name: 'Swimming', desc: 'Ability to dive and traverse waters' });
skl.swm.use = function (x, y) { return this.lvl }

skl.dssmb = new Skill({ id: 150, type: 3, name: 'Disassembly', desc: 'Ability to deconstruct goods into raw spare parts' + dom.dseparator + '<small style="color:darkorange">Increases yield from deconstructed items</small>' });
skl.dssmb.use = function (x, y) { return this.lvl }

skl.tghs = new Skill({ id: 151, type: 2, name: 'Toughness', desc: 'Durability of one\'s body' + dom.dseparator + '<small style="color:darkorange">Slightly improves physical defence</small>' });
skl.tghs.use = function (x, y) { return this.lvl }
skl.tghs.onLevel = function () { you.cmaff[0] += Math.ceil(this.lvl / 3 + 1) }

skl.drka = new Skill({ id: 152, type: 4, name: 'Drinking', desc: 'Ability to tolerate and enjoy alcoholic beverages' });
skl.drka.use = function (x, y) { return this.lvl }

skl.tpgrf = new Skill({ id: 153, type: 4, name: 'Topography', desc: 'Knowledge of land surfaces' });
skl.tpgrf.use = function (x, y) { return this.lvl }

skl.ptnc = new Skill({ id: 154, type: 4, name: 'Patience', desc: 'Ability to endure forms of suffering without complaint' });
skl.ptnc.use = function (x, y) { return this.lvl }

skl.scout = new Skill({ id: 155, type: 4, name: 'Perception', desc: 'Ability to see the unseen and better understand your surroundings' });
skl.scout.use = function (x, y) { return this.lvl }

skl.jdg = new Skill({ id: 156, type: 4, name: 'Judgement', desc: 'Ability to evaluate your choices' });
skl.jdg.use = function (x, y) { return this.lvl }

skl.tlrng = new Skill({ id: 157, type: 5, name: 'Tailoring', desc: 'Abillity to sew and create produce out of cloth' });
skl.tlrng.use = function (x, y) { giveSkExp(this, x || 1); return this.lvl || 1 }

skl.crptr = new Skill({ id: 158, type: 6, name: 'Corruption Resistance', sp: '.66em', desc: 'Ability to resist the corruption of flesh' + dom.dseparator + '<small style="color:darkorange">Mitigates corruption and fei damage</small>' });

skl.hst = new Skill({ id: 159 });
skl.hvt.type = 8;
skl.hst.name = 'Harvesting';
skl.hst.desc = 'Ability to find and collect usable materials from the surroundings' + dom.dseparator + '<small style="color:darkorange">Increases chances of obtaining area loot</small>';
skl.hst.use = function (x, y) { return this.lvl }

skl.coldr = new Skill({ id: 160, type: 6, name: 'Cold Resistance', sp: '.66em', desc: 'Ability to tolerate harsh and cold temperatures' + dom.dseparator + '<small style="color:darkorange">Slightly decreases energy loss when cold</small>' });
