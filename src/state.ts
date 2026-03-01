// ==========================================================================
// Namespace objects
// ==========================================================================
export var dom: any = new Object();
export var global: any = new Object();
export var listen: any = new Object();
export var w_manager: any = new Object();
export var creature: any = new Object();
export var offline: any = new Object();
export var effect: any = new Object();
export var callback: any = new Object();
export var effector: any = new Object();

// Item namespaces
export var wpn: any = new Object();
export var eqp: any = new Object();
export var acc: any = new Object();
export var sld: any = new Object();
export var item: any = new Object();
export var itemgroup = [item, wpn, eqp, sld, acc];
export var rcp: any = new Object();

// World namespaces
export var area: any = new Object();
export var sector: any = new Object();
export var sectors: any[] = [];

// Game system namespaces
export var timers: any = new Object();
export var chss: any = new Object();
export var ttl: any = new Object();
export var skl: any = new Object();
export var abl: any = new Object();
export var furniture: any = new Object();
export var vendor: any = new Object();
export var quest: any = new Object();
export var act: any = new Object();
export var test: any = new Object();
export var planner: any = new Object();
export var plans: any = [[], [], []];
export var check: any = new Object();
export var checksd: any[] = [];
export var container: any = new Object();
export var mastery: any = new Object();

// Grouped data registry export (consumers import this instead of individual vars)
export const data = {
  creature, item, wpn, eqp, acc, sld, rcp, skl, effect,
  area, sector, furniture, vendor, quest, act, abl,
  container, ttl, mastery
};

// Player and game state
export var inv: any[] = [];
export var furn: any[] = [];
export var qsts: any[] = [];
export var dar: any = [[], [], [], [], []];
export var you: any = new Object();
export var home: any = new Object();
// eqp.dummy is set in src/data/equipment.ts after Eqp constructor is defined
export var acts: any[] = [];

// Reassignable singletons
export var time: any;
export function setYou(v: any) { you = v; }
export function setTime(v: any) { time = v; }
export function setInv(v: any) { inv = v; }
export function setDar(v: any) { dar = v; }
export function setFurn(v: any) { furn = v; }
export function setQsts(v: any) { qsts = v; }
export function setActs(v: any) { acts = v; }
export function setSectors(v: any) { sectors = v; }
export function resetFlags(v?: any) { for (let k in flags) delete flags[k]; if (v) Object.assign(flags, v); }

// ==========================================================================
// Global state initialization
// ==========================================================================
let tempt = new Date();

// Core settings
global.home_loc = 111;
global.lst_sve = '?';
global.ver = 470;
global.sm = 1;
global.rm = 0;
global.bg_g = global.bg_r = global.bg_b = 255;
global.s_l = 0;
global.spnew = 0;
global.vsnew = 10;
global.uid = 1;
global.wdwidx = 0;
global.menuo = 0;
global.lastmsgc = 0;

// Arrays and data stores
global.sinv = [];
global.srcp = [];
global.drdata = {};
global.lw_op = 0;
global.zone_a_p = [];
global.rec_d = [];
global.e_e = [];
global.e_em = [];
global.titles = [];
global.titlese = [];
global.tstcr = [];

// Combat state
global.atkdftm = [-1, -1, -1];
global.atkdfty = [-1, -1];
global.atkdftydt = {};
global.current_m;
global.current_z;
global.current_l;
global.hit_a = 0;
global.hit_b = 0;
global.timescale = 1;
global.keytarget;
global.offline_evil_index = 1;

// Statistics (top-level export, formerly global.stat)
export var stats: any = {
  tick: 0,
  akills: 0,
  fooda: 0,
  foodb: 0,
  foodal: 0,
  foodt: 0,
  ftried: 0,
  moneyg: 0,
  die_p: 0,
  die_p_t: 0,
  ivtntdj: 0,
  athme: 0,
  athmec: 0,
  slvs: 0,
  lgtstk: 0,
  moneysp: 0,
  shppnt: 0,
  exptotl: 0,
  seed1: (Math.random() * 7e+7 << 7) % 7 & 7,
  igtttl: 0,
  msts: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  msks: [0, 0, 0, 0, 0, 0, 0],
  sttime: tempt.getFullYear() + '/' + (tempt.getMonth() + 1) + '/' + tempt.getDate() + ' ' + tempt.getHours() + ':' + (tempt.getMinutes() >= 10 ? tempt.getMinutes() : '0' + tempt.getMinutes()) + ':' + (tempt.getSeconds() > 10 ? tempt.getSeconds() : '0' + tempt.getSeconds()),
  buyt: 0,
  rdttl: 0,
  dsst: 0,
  thrt: 0,
  crftt: 0,
  deadt: 0,
  smovet: 0,
  timeslp: 0,
  misst: 0,
  dodgt: 0,
  potnst: 0,
  medst: 0,
  plst: 0,
  jcom: 0,
  qstc: 0,
  popt: 0,
  dsct: 0,
  bloodt: 0,
  rdgtttl: 0,
  cat_c: 0,
  dmgdt: 0,
  dmgrt: 0,
  onesht: 0,
  pts: 0,
  gsvs: 0,
  hbhbsld: 0,
  wsnburst: 50,
  wsnrest: 50,
  indkill: 0,
  coldnt: 0,
  lastver: global.ver
};

// Flags (top-level export, formerly global.flags)
export var flags: any = {
  btl: false,
  m_freeze: false,
  msd: false,
  m_blh: false,
  crti: false,
  to_pause: false,
  civil: true,
  sleepmode: false,
  loadstate: false,
  eshake: false,
  msgtm: false,
  grd_s: true,
  inside: true,
  israin: false,
  issnow: false,
  iscold: false,
  bstu: false,
  blken: false,
  rtcrutch: false,
  savestate: false,
  expatv: false,
  gameone: false,
  tmmode: 1,
  ssngaijin: true,
  rptbncgt: false
};

// Misc globals
global.spirits = 100;
global.bestiary = [{ a: false }];
global.shortcuts = [];
global.msgs_max = 36;
global.fps = 1;

// ==========================================================================
// Text / display constants
// ==========================================================================
export var gameText: any = {
  nt: ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'De', 'Un', 'DDe', 'TDe', 'QaDe', 'QiDe', 'Lc'],
  wecs: [
    ['grey', 'inherit'], ['white', 'inherit'], ['cyan', 'cyan'], ['lime', 'green'],
    ['yellow', 'red'], ['orange', 'orange'], ['purple', 'white']
  ],
  lunarp: [
    ['🌑', 'New Moon'], ['🌒', 'Waxing Crescent Moon'], ['🌓', 'First Quarter Moon'],
    ['🌔', 'Waxing Gibbous Moon'], ['🌕', 'Full Moon'], ['🌖', 'Waning Gibbous Moon'],
    ['🌗', 'Last Quarter Moon'], ['🌘', 'Waning Crescent Moon']
  ],
  eranks: [
    '???', '--G', '-G', 'G', 'G+', '-F', 'F', 'F+', '-E', 'E', 'E+',
    '-D', 'D', 'D+', '-C', 'C', 'C+', '-B', 'B', 'B+',
    '--A', '-A', 'A', 'A+', 'A++', '--S', '-S', 'S', 'S+', 'S++',
    '--SS', '-SS', 'SS', 'SS+', 'SS++', '--SSS', '-SSS', 'SSS', 'SSS+', 'SSS++'
  ]
};

// ==========================================================================
// DOM templates
// ==========================================================================
dom.dseparator = '<div class="divider">　</div>';
dom.coincopper = '<small style="color:rgb(255, 116, 63)">●</small>';
dom.coinsilver = '<small style="color:rgb(192, 192, 192)">●</small>';
dom.coingold = '<small style="color:rgb(255, 215, 0)">●</small>';
