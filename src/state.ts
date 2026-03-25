import type { Dom, Global, Creature, Item, Equipment, Effect, Skill, Area, Sector, Recipe, Furniture as FurnitureType, Vendor, Action, Ability, Title, Mastery, Container, CombatState, Stats, Flags, Settings, GameText, Player, DataRegistry } from './types';

// ==========================================================================
// Namespace objects
// ==========================================================================
export var dom = new Object() as Dom;
export var global = new Object() as Global;
export var listen: any = new Object();
export var w_manager: any = new Object();
export var creature = new Object() as Record<string, Creature>;
export var offline: any = new Object();
export var effect = new Object() as Record<string, Effect>;
export var callback: any = new Object();
export var effector: any = new Object();

// Item namespaces
export var wpn = new Object() as Record<string, Equipment>;
export var eqp = new Object() as Record<string, Equipment>;
export var acc = new Object() as Record<string, Equipment>;
export var sld = new Object() as Record<string, Equipment>;
export var item = new Object() as Record<string, Item>;
export var itemgroup = [item, wpn, eqp, sld, acc];
export var rcp = new Object() as Record<string, Recipe>;

// World namespaces
export var area = new Object() as Record<string, Area> & { _ctor: new (cfg?: any) => Area };
export var sector = new Object() as Record<string, Sector>;
export var sectors: Sector[] = [];

// Game system namespaces
export var timers: any = new Object();
export var chss: any = new Object();
export var ttl = new Object() as Record<string, Title>;
export var skl = new Object() as Record<string, Skill>;
export var abl = new Object() as Record<string, Ability>;
export var furniture = new Object() as Record<string, FurnitureType>;
export var vendor = new Object() as Record<string, Vendor>;
export var quest: Record<string, any> = new Object();
export var act = new Object() as Record<string, Action>;
export var test: any = new Object();
export var planner: any = new Object();
export var plans: any = [[], [], []];
export var check: any = new Object();
export var checksd: any[] = [];
export var container = new Object() as Record<string, Container>;
export var mastery = new Object() as Record<string, Mastery>;

// Grouped data registry export (consumers import this instead of individual vars)
export const data: DataRegistry = {
  creature, item, wpn, eqp, acc, sld, rcp, skl, effect,
  area, sector, furniture, vendor, quest, act, abl,
  container, ttl, mastery
};

// Player and game state
export var inv: Item[] = [];
export var furn: FurnitureType[] = [];
export var qsts: any[] = [];
export var dar: Item[][] = [[], [], [], [], []];
export var you: Player = new Object() as Player;
export var home: any = new Object();
// eqp.dummy is set in src/data/equipment.ts after Eqp constructor is defined
export var acts: Action[] = [];

// Reassignable singletons
export var time: any;
export function setYou(v: Player) { you = v; }
export function setTime(v: any) { time = v; }
export function setInv(v: Item[]) { inv = v; }
export function setDar(v: Item[][]) { dar = v; }
export function setFurn(v: FurnitureType[]) { furn = v; }
export function setQsts(v: any) { qsts = v; }
export function setActs(v: Action[]) { acts = v; }
export function setSectors(v: Sector[]) { sectors = v; }
export function resetFlags(v?: Partial<Flags>) { for (let k in flags) delete (flags as any)[k]; if (v) Object.assign(flags, v); }

// ==========================================================================
// Global state initialization
// ==========================================================================
let tempt = new Date();

// Core settings
global.lst_sve = '?';
global.ver = 470;
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

// Combat state (ephemeral, not serialized)
export var combat: CombatState = {
  atkdftm: [-1, -1, -1],
  atkdfty: [-1, -1],
  atkdftydt: {},
  current_m: undefined as any, // set in area_init before combat
  current_z: undefined as any, // set to area.nwh in world.ts eval
  current_l: undefined as any, // set in smove
  hit_a: 0,
  hit_b: 0,
  keytarget: undefined,
};
global.offline_evil_index = 1;

// Statistics (top-level export, formerly global.stat)
export var stats: Stats = {
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
export var flags: Flags = {
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

// Settings (user-configurable, serialized in save)
export var settings: Settings = {
  sm: 1,
  rm: 0,
  msgs_max: 36,
  fps: 1,
  timescale: 1,
  home_loc: 111,
  bg_r: 255,
  bg_g: 255,
  bg_b: 255,
};

// ==========================================================================
// Text / display constants
// ==========================================================================
export var gameText: GameText = {
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
