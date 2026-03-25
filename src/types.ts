// ==========================================================================
// Central type definitions for Proto23
// These type aliases describe current constructor shapes — stepping stones
// to real classes when constructors are converted later.
// ==========================================================================

// --- Shared sub-types ---

export interface Resistances {
  poison: number;
  burn: number;
  frost: number;
  paralize: number;
  blind: number;
  sleep: number;
  curse: number;
  death: number;
  bleed: number;
  ph: number;
  venom: number;
  fpoison: number;
  [key: string]: number; // for save/load iteration
}

export interface Mods {
  satiationBonus: number;
  satiationDrainRate: number;
  inflationRate: number;
  enemyMoneyDropRateEnhance: number;
  enemyMoneyDropRateTries: number;
  dodgeModifier: number;
  readingRate: number;
  critPower: number;
  critChanceFlat: number;
  wealthExtra: number;
  toSteal: number;
  luckDoubleTry: number;
  cookingFire: number;
  rainProtect: number;
  light: number;
  unarmedDamage: number;
  pettingExperience: number;
  stardustParticleSpawn: number;
  survivalInfo: number;
  runningEnergyCost: number;
  [key: string]: number; // for save/load iteration
}

export interface Drop {
  item: Item;
  chance?: number;
  c?: number;
  min?: number;
  max?: number;
  cond?: () => boolean;
}

export interface ItemData {
  dscv: boolean;
  uid?: number;
  time?: number;
  skey?: string;
  timep?: number;
  [key: string]: any; // TODO: remove index signature — items use varied data shapes
}

// --- Skill milestone ---

export interface SkillMilestone {
  lv: number;
  f: (player: Player) => void;
  g: boolean;
  p: string;
}

// --- Entity types ---

export interface Item {
  name: string;
  desc: string | (() => string);
  eff: Effect[];
  data: ItemData;
  amount: number;
  type: number;
  stype: number;
  rar: number;
  new: boolean;
  have: boolean;
  important: boolean;
  id?: number;
  val?: number;
  rot?: number | number[];
  cmax?: number;
  onGet: (player?: Player) => void;
  onChange?: (x?: any, y?: any) => any;
  use: (player?: Player) => void;
  [key: string]: any; // TODO: remove index signature — cfg spreads arbitrary properties
}

export interface Equipment {
  name: string;
  desc: string | (() => string);
  str: number;
  agl: number;
  int: number;
  spd: number;
  dp: number;
  dpmax: number;
  eff: Effect[];
  data: ItemData;
  cls: [number, number, number];
  aff: number[];
  atype: number;
  ctype: number;
  wtype: number;
  atkmode: number;
  rar: number;
  type: number;
  amount: number;
  stype: number;
  slot: number;
  id: number;
  important: boolean;
  new: boolean;
  cond: () => boolean;
  onGet: (player: Player) => void;
  oneq: (player: Player) => void;
  onuneq: (player: Player) => void;
  onDegrade?: (player: Player) => void;
  use: () => void;
  [key: string]: any; // TODO: remove index signature — cfg spreads arbitrary properties
}

export interface Effect {
  name: string;
  desc: string;
  type: number;
  id: number;
  x?: any;
  c?: string;
  b?: string;
  y?: any;
  z?: any;
  target?: Combatant;
  duration: number;
  timer_o: number;
  active: boolean;
  power?: number;
  atype?: number;
  noGive?: () => void;
  use: (player?: Player, y?: any, z?: any) => void;
  un: (player?: Player, x?: any, y?: any, z?: any) => void;
  mods: (player?: Player) => void;
  onGive: (player?: Player, x?: any, y?: any, z?: any) => void;
  onRemove: (player?: Player, x?: any) => void;
  onClick: (player?: Player) => void;
  [key: string]: any; // TODO: remove index signature
}

export interface Skill {
  name: string;
  bname?: string;
  desc: string | (() => string);
  id?: number;
  exp: number;
  lvl: number;
  type: number;
  p: number;
  sp?: number;
  expnext: () => number;
  expnext_t: number;
  onLevel: (player: Player) => void;
  onGive: (player: Player, x?: any) => void;
  use: (x?: any, y?: any) => any;
  mlstn?: SkillMilestone[];
  [key: string]: any; // TODO: remove index signature
}

export interface Combatant {
  name: string;
  id: number;
  type: number;
  lvl: number;
  hp: number;
  hp_base: number;
  hpmax: number;
  str: number;
  str_base: number;
  str_display: number;
  agl: number;
  agl_base: number;
  agl_display: number;
  int: number;
  int_base: number;
  int_display: number;
  spd: number;
  spd_base: number;
  spd_display?: number;
  str_bonus: number;
  agl_bonus: number;
  int_bonus: number;
  spd_bonus: number;
  hp_bonus: number;
  str_mult: number;
  int_mult: number;
  spd_mult: number;
  agl_mult: number;
  hp_mult: number;
  str_eff: number;
  int_eff: number;
  agl_eff: number;
  spd_eff: number;
  hp_eff: number;
  statPotential: number[];
  eqp: Equipment[];
  eff: Effect[];
  cls: [number, number, number];
  aff: number[];
  atype?: number;
  ctype?: number;
  res: Resistances;
  critChance: number;
  damageMultiplier: number;
  rnk: number;
  evasion: number;
  atkmode: number;
  alive: boolean;
  drop: Drop[];
  stat_r: () => void;
  onDeath: (killer?: Combatant) => void;
  battle_ai?: (x: any, y: any, z?: any) => any;
  [key: string]: any; // TODO: remove index signature
}

export interface Player extends Combatant {
  desc: string;
  title: Title;
  rank: () => number;
  exp: number;
  expnext: () => number;
  expnext_t: number;
  exp_t: number;
  efficiency: () => number;
  mods: Mods;
  ki: Record<string, any>;
  sat: number;
  satmax: number;
  sat_base: number;
  sat_bonus: number;
  sat_mult: number;
  sat_eff: number;
  wealth: number;
  luck: number;
  karma: number;
  skls: Skill[];
  maff: number[];
  caff: number[];
  combatMonsterAffinity: number[];
  combatClass: [number, number, number];
  onDeathE: () => void;
  ai: () => void;
}

export interface Creature extends Combatant {
  desc: string;
  exp: number;
  pts: number;
  data: { lstdmg: number; oneshot: boolean; [key: string]: any };
  sex?: number;
  [key: string]: any;
}

export interface Area {
  name: string;
  id: number;
  pop: { crt: Creature; lvlmin: number; lvlmax: number; c: number; cond?: () => boolean }[];
  size: number;
  drop: Drop[];
  sector?: Sector[];
  inside?: boolean;
  protected?: boolean;
  effectors?: any[];
  data?: Record<string, any>;
  scout?: any[];
  onEnd: () => void;
  onDeath: () => void;
  onEnter?: () => void;
  sl?: () => void;
  [key: string]: any; // TODO: remove index signature
}

export interface Sector {
  id: number;
  group: number[];
  data: Record<string, any>;
  active: boolean;
  inside?: boolean;
  ddata?: Record<string, any>;
  scout?: any[];
  effectors?: any[];
  onEnter: () => void;
  onLeave: () => void;
  onStay: (player: Player) => void;
  onMove: () => void;
  onScout: () => void;
  [key: string]: any; // TODO: remove index signature
}

export interface Recipe {
  name: string;
  id?: number;
  locked: boolean;
  allow: boolean;
  have: boolean;
  rec: { item: Item | Equipment; amount: number; return?: boolean; amount_max?: number; [key: string]: any }[];
  res: { item: Item | Equipment; amount: number; amount_max?: number }[];
  srec: ((() => boolean) | boolean)[] | (() => void);
  srece: boolean;
  srect: string[] | null;
  onmake: () => void;
  cmake?: () => void;
  type: number;
  [key: string]: any; // TODO: remove index signature
}

export interface Action {
  name: string;
  desc: string | (() => string);
  id: number;
  type: number;
  data: Record<string, any>;
  have: boolean;
  active: boolean;
  cond: (l?: any) => boolean;
  use: (player: Player) => void;
  activate: (player: Player) => void;
  deactivate: (player: Player) => void;
  [key: string]: any; // TODO: remove index signature
}

export interface Furniture {
  name: string;
  desc: string | (() => string);
  data: Record<string, any>;
  id: number;
  removable: boolean;
  v?: number;
  use: () => void;
  onGive: () => void;
  onSelect: () => void;
  onRemove: () => void;
  onDestroy: () => void;
  activate: (player: Player) => void;
  deactivate: (player: Player) => void;
  [key: string]: any; // TODO: remove index signature
}

export interface Title {
  name: string;
  id: number;
  desc: string;
  have: boolean;
  tget: boolean;
  rar: number;
  rars?: boolean;
  talent?: (player: Player) => void;
  onGet: (player: Player) => void;
  [key: string]: any; // TODO: remove index signature
}

export interface Vendor {
  name: string;
  items: { item: Item | Equipment; p: number; c: number; min: number; max: number; cond?: () => boolean }[];
  stock: any[];
  data: { time: number; rep: number; [key: string]: any };
  timeorig: number;
  restocked: boolean;
  infl?: number;
  dfl?: number;
  repsc?: number;
  extra: () => void;
  onRestock: () => void;
  onDayPass: () => void;
  [key: string]: any; // TODO: remove index signature
}

export interface Ability {
  name: string;
  id: number;
  atrg: string;
  btrg: string;
  cls?: number;
  aff?: number;
  affp: number;
  stt: number;
  f: (x: Combatant, y: Combatant, z?: any) => number;
  [key: string]: any; // TODO: remove index signature
}

export interface Mastery {
  id: number;
  name: string;
  desc: () => string;
  condd: () => string;
  icon?: [number, number];
  x: number;
  y: number;
  data: { lvl: number; [key: string]: any };
  limit: number;
  have: boolean;
  linkto?: Mastery[];
  linkfrom?: Mastery[];
  cond: () => boolean;
  onlevel: (player: Player) => void;
  [key: string]: any; // TODO: remove index signature
}

export interface Container {
  id: number;
  c: any[];
  [key: string]: any; // TODO: remove index signature
}

// --- State types ---

export interface GameText {
  readonly nt: readonly string[];
  readonly wecs: readonly string[][];
  readonly lunarp: readonly string[][];
  readonly eranks: readonly string[];
  // TODO: remove index signature — enumerate dynamic text properties (kntsct, mscbkatxt, vlg1, etc.)
  [key: string]: any;
}

export interface Settings {
  sortMode: number;
  recipeSortMode: number;
  msgs_max: number;
  fps: number;
  timescale: number;
  home_loc: number;
  bg_r: number;
  bg_g: number;
  bg_b: number;
}

export interface Flags {
  // Core flags (from initializer)
  btl: boolean;
  monsterFreeze: boolean;
  missed: boolean;
  monsterBattleHide: boolean;
  criticalHit: boolean;
  pauseNextBattle: boolean;
  civil: boolean;
  sleepmode: boolean;
  loadstate: boolean;
  effectShake: boolean;
  messageTime: boolean;
  guardStance: boolean;
  inside: boolean;
  israin: boolean;
  issnow: boolean;
  iscold: boolean;
  bestiaryUnlocked: boolean;
  blinkEnabled: boolean;
  renderTrunkCrutch: boolean;
  savestate: boolean;
  exportActive: boolean;
  gameone: boolean;
  timeMode: number;
  seasonGaijin: boolean;
  repeatableCrafting: boolean;
  // Dynamic game-progression flags
  [key: string]: boolean | number | undefined; // TODO: remove index signature — enumerate all ~80 game-progression flags
}

export interface Stats {
  tick: number;
  allKills: number;
  foodAttempts: number;
  foodBenefit: number;
  foodAlcohol: number;
  foodTotal: number;
  foodTried: number;
  moneyGained: number;
  deathsInCombat: number;
  deathsInCombatTotal: number;
  itemsReturnedToDojo: number;
  atHomeTime: number;
  atHomeCounter: number;
  skillLevelsGained: number;
  lightningStrikes: number;
  moneySpent: number;
  shopPoints: number;
  expTotal: number;
  seed1: number;
  itemsPickedUp: number;
  masteryStatuses: [number, number][];
  masterySkillKills: number[];
  startTime: string | number;
  buyTotal: number;
  readTotal: number;
  disassembleTotal: number;
  thrownTotal: number;
  craftTotal: number;
  deathTotal: number;
  sectorMoveTotal: number;
  timeSlept: number;
  missesTotal: number;
  dodgesTotal: number;
  potionsTotal: number;
  medicineTotal: number;
  pillsTaken: number;
  jobsCompleted: number;
  questsCompleted: number;
  descriptionViews: number;
  discoveryTotal: number;
  bloodthirst: number;
  readingTimeTotal: number;
  catCount: number;
  damageDealtTotal: number;
  damageReceivedTotal: number;
  oneShotKills: number;
  pts: number;
  gameSaves: number;
  herbalistHerbsSold: number;
  weaponBurstCount: number;
  weaponRestCount: number;
  indirectKills: number;
  coldDamageTaken: number;
  lastVersion: number;
  [key: string]: any; // TODO: remove index signature — some stats set dynamically (mndrgnu)
}

export interface CombatState {
  attackDamageFromMonster: any[];
  attackDamageFromYou: any[];
  attackDamageFromYouDamageType: Record<string, any>;
  currentMonster: Creature; // initialized in area_init before any combat access
  currentZone: Area; // initialized to area.nwh at eval time
  currentLocation: Area; // initialized in smove before any access
  hitAccuracy: number;
  hitBlock: number;
  keyTarget: Combatant | undefined;
}

export interface Dom {
  dseparator: string;
  coincopper: string;
  coinsilver: string;
  coingold: string;
  // TODO: remove index signature — dom gets 150+ properties assigned in main.ts
  [key: string]: any;
}

export interface Global {
  lastSave: string;
  ver: number;
  speedLevel: number;
  unusedNewItemBlinkCounter: number;
  newItemBlinkCountdown: number;
  uid: number;
  windowIndex: number;
  menuOpen: number;
  lastMessageCount: number;
  slottedInventory: any[];
  sortedRecipes: any[];
  dropData: Record<string, any>;
  lastWindowOpen: number;
  zoneAreaProfile: any[];
  recipesDiscovered: any[];
  effects: any[];
  enemyEffects: any[];
  titles: any[];
  titlesEarned: any[];
  testCorc: any[];
  offlineEvilIndex: number;
  spirits: number;
  bestiary: any[];
  shortcuts: any[];
  // TODO: remove index signature — enumerate remaining ~40 properties from main.ts
  [key: string]: any;
}

// --- Registry map type ---

export interface DataRegistry {
  creature: Record<string, Creature>;
  item: Record<string, Item>;
  wpn: Record<string, Equipment>;
  eqp: Record<string, Equipment>;
  acc: Record<string, Equipment>;
  sld: Record<string, Equipment>;
  rcp: Record<string, Recipe>;
  skl: Record<string, Skill>;
  effect: Record<string, Effect>;
  area: Record<string, Area> & { _ctor: new (cfg?: any) => Area };
  sector: Record<string, Sector>;
  furniture: Record<string, Furniture>;
  vendor: Record<string, Vendor>;
  quest: Record<string, any>;
  act: Record<string, Action>;
  abl: Record<string, Ability>;
  container: Record<string, Container>;
  ttl: Record<string, Title>;
  mastery: Record<string, Mastery>;
}
