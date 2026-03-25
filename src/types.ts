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
  sbonus: number;
  sdrate: number;
  infsrate: number;
  enmondren: number;
  enmondrts: number;
  ddgmod: number;
  rdgrt: number;
  cpwr: number;
  crflt: number;
  wthexrt: number;
  tstl: number;
  lkdbt: number;
  ckfre: number;
  rnprtk: number;
  light: number;
  undc: number;
  petxp: number;
  stdstps: number;
  survinf: number;
  runerg: number;
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
  hp_r: number;
  hpmax: number;
  str: number;
  str_r: number;
  str_d: number;
  agl: number;
  agl_r: number;
  agl_d: number;
  int: number;
  int_r: number;
  int_d: number;
  spd: number;
  spd_r: number;
  spd_d?: number;
  stra: number;
  agla: number;
  inta: number;
  spda: number;
  hpa: number;
  strm: number;
  intm: number;
  spdm: number;
  aglm: number;
  hpm: number;
  stre: number;
  inte: number;
  agle: number;
  spde: number;
  hpe: number;
  stat_p: number[];
  eqp: Equipment[];
  eff: Effect[];
  cls: [number, number, number];
  aff: number[];
  atype?: number;
  ctype?: number;
  res: Resistances;
  crt: number;
  dmlt: number;
  rnk: number;
  eva: number;
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
  sat_r: number;
  sata: number;
  satm: number;
  sate: number;
  wealth: number;
  luck: number;
  karma: number;
  skls: Skill[];
  maff: number[];
  caff: number[];
  cmaff: number[];
  ccls: [number, number, number];
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
  sm: number;
  rm: number;
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
  m_freeze: boolean;
  msd: boolean;
  m_blh: boolean;
  crti: boolean;
  to_pause: boolean;
  civil: boolean;
  sleepmode: boolean;
  loadstate: boolean;
  eshake: boolean;
  msgtm: boolean;
  grd_s: boolean;
  inside: boolean;
  israin: boolean;
  issnow: boolean;
  iscold: boolean;
  bstu: boolean;
  blken: boolean;
  rtcrutch: boolean;
  savestate: boolean;
  expatv: boolean;
  gameone: boolean;
  tmmode: number;
  ssngaijin: boolean;
  rptbncgt: boolean;
  // Dynamic game-progression flags
  [key: string]: boolean | number | undefined; // TODO: remove index signature — enumerate all ~80 game-progression flags
}

export interface Stats {
  tick: number;
  akills: number;
  fooda: number;
  foodb: number;
  foodal: number;
  foodt: number;
  ftried: number;
  moneyg: number;
  die_p: number;
  die_p_t: number;
  ivtntdj: number;
  athme: number;
  athmec: number;
  slvs: number;
  lgtstk: number;
  moneysp: number;
  shppnt: number;
  exptotl: number;
  seed1: number;
  igtttl: number;
  msts: [number, number][];
  msks: number[];
  sttime: string | number;
  buyt: number;
  rdttl: number;
  dsst: number;
  thrt: number;
  crftt: number;
  deadt: number;
  smovet: number;
  timeslp: number;
  misst: number;
  dodgt: number;
  potnst: number;
  medst: number;
  plst: number;
  jcom: number;
  qstc: number;
  popt: number;
  dsct: number;
  bloodt: number;
  rdgtttl: number;
  cat_c: number;
  dmgdt: number;
  dmgrt: number;
  onesht: number;
  pts: number;
  gsvs: number;
  hbhbsld: number;
  wsnburst: number;
  wsnrest: number;
  indkill: number;
  coldnt: number;
  lastver: number;
  [key: string]: any; // TODO: remove index signature — some stats set dynamically (mndrgnu)
}

export interface CombatState {
  atkdftm: any[];
  atkdfty: any[];
  atkdftydt: Record<string, any>;
  current_m: Creature; // initialized in area_init before any combat access
  current_z: Area; // initialized to area.nwh at eval time
  current_l: Area; // initialized in smove before any access
  hit_a: number;
  hit_b: number;
  keytarget: Combatant | undefined;
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
  lst_sve: string;
  ver: number;
  s_l: number;
  spnew: number;
  vsnew: number;
  uid: number;
  wdwidx: number;
  menuo: number;
  lastmsgc: number;
  sinv: any[];
  srcp: any[];
  drdata: Record<string, any>;
  lw_op: number;
  zone_a_p: any[];
  rec_d: any[];
  e_e: any[];
  e_em: any[];
  titles: any[];
  titlese: any[];
  tstcr: any[];
  offline_evil_index: number;
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
