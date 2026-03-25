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
global.lastSave = '?';
global.ver = 470;
global.speedLevel = 0;
global.unusedNewItemBlinkCounter = 0;
global.newItemBlinkCountdown = 10;
global.uid = 1;
global.windowIndex = 0;
global.menuOpen = 0;
global.lastMessageCount = 0;

// Arrays and data stores
global.slottedInventory = [];
global.sortedRecipes = [];
global.dropData = {};
global.lastWindowOpen = 0;
global.zoneAreaProfile = [];
global.recipesDiscovered = [];
global.effects = [];
global.enemyEffects = [];
global.titles = [];
global.titlesEarned = [];
global.testCorc = [];

// Combat state (ephemeral, not serialized)
export var combat: CombatState = {
  attackDamageFromMonster: [-1, -1, -1],
  attackDamageFromYou: [-1, -1],
  attackDamageFromYouDamageType: {},
  currentMonster: undefined as any, // set in area_init before combat
  currentZone: undefined as any, // set to area.nwh in world.ts eval
  currentLocation: undefined as any, // set in smove
  hitAccuracy: 0,
  hitBlock: 0,
  keyTarget: undefined,
};
global.offlineEvilIndex = 1;

// Statistics (top-level export, formerly global.stat)
export var stats: Stats = {
  tick: 0,
  allKills: 0,
  foodAttempts: 0,
  foodBenefit: 0,
  foodAlcohol: 0,
  foodTotal: 0,
  foodTried: 0,
  moneyGained: 0,
  deathsInCombat: 0,
  deathsInCombatTotal: 0,
  itemsReturnedToDojo: 0,
  atHomeTime: 0,
  atHomeCounter: 0,
  skillLevelsGained: 0,
  lightningStrikes: 0,
  moneySpent: 0,
  shopPoints: 0,
  expTotal: 0,
  seed1: (Math.random() * 7e+7 << 7) % 7 & 7,
  itemsPickedUp: 0,
  masteryStatuses: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  masterySkillKills: [0, 0, 0, 0, 0, 0, 0],
  startTime: tempt.getFullYear() + '/' + (tempt.getMonth() + 1) + '/' + tempt.getDate() + ' ' + tempt.getHours() + ':' + (tempt.getMinutes() >= 10 ? tempt.getMinutes() : '0' + tempt.getMinutes()) + ':' + (tempt.getSeconds() > 10 ? tempt.getSeconds() : '0' + tempt.getSeconds()),
  buyTotal: 0,
  readTotal: 0,
  disassembleTotal: 0,
  thrownTotal: 0,
  craftTotal: 0,
  deathTotal: 0,
  sectorMoveTotal: 0,
  timeSlept: 0,
  missesTotal: 0,
  dodgesTotal: 0,
  potionsTotal: 0,
  medicineTotal: 0,
  pillsTaken: 0,
  jobsCompleted: 0,
  questsCompleted: 0,
  descriptionViews: 0,
  discoveryTotal: 0,
  bloodthirst: 0,
  readingTimeTotal: 0,
  catCount: 0,
  damageDealtTotal: 0,
  damageReceivedTotal: 0,
  oneShotKills: 0,
  pts: 0,
  gameSaves: 0,
  herbalistHerbsSold: 0,
  weaponBurstCount: 50,
  weaponRestCount: 50,
  indirectKills: 0,
  coldDamageTaken: 0,
  lastVersion: global.ver
};

// Flags (top-level export, formerly global.flags)
export var flags: Flags = {
  btl: false,
  monsterFreeze: false,
  missed: false,
  monsterBattleHide: false,
  criticalHit: false,
  pauseNextBattle: false,
  civil: true,
  sleepmode: false,
  loadstate: false,
  effectShake: false,
  messageTime: false,
  guardStance: true,
  inside: true,
  israin: false,
  issnow: false,
  iscold: false,
  bestiaryUnlocked: false,
  blinkEnabled: false,
  renderTrunkCrutch: false,
  savestate: false,
  exportActive: false,
  gameone: false,
  timeMode: 1,
  seasonGaijin: true,
  repeatableCrafting: false
};

// Misc globals
global.spirits = 100;
global.bestiary = [{ a: false }];
global.shortcuts = [];

// Settings (user-configurable, serialized in save)
export var settings: Settings = {
  sortMode: 1,
  recipeSortMode: 0,
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
