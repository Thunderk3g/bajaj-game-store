export type GameMode = 'single' | 'multiplayer';
export type SessionStatus = 'lobby' | 'running' | 'won' | 'lost';

export type TowerType =
  | 'savings'
  | 'emergency-fund'
  | 'health-insurance'
  | 'term-life'
  | 'investment';

export type EnemyType =
  | 'debt-bug'
  | 'inflation-cloud'
  | 'medical-emergency'
  | 'job-loss-wave'
  | 'critical-illness-boss';

export type GameEventType =
  | 'PLAYER_JOIN'
  | 'PLAYER_LEAVE'
  | 'PLACE_TOWER'
  | 'START_WAVE'
  | 'ENEMY_SPAWN'
  | 'ENEMY_DEFEATED'
  | 'CORE_DAMAGE'
  | 'RESOURCE_GAIN'
  | 'TOWER_DISABLED'
  | 'WAVE_CLEARED'
  | 'GAME_OVER';

export interface Point {
  x: number;
  y: number;
}

export interface BuildPad {
  id: string;
  position: Point;
  occupiedTowerId: string | null;
}

export interface TowerDefinition {
  type: TowerType;
  name: string;
  shortLabel: string;
  cost: number;
  damage: number;
  range: number;
  cooldown: number;
  color: string;
  description: string;
  purpose: string;
  incomeAmount?: number;
  incomeInterval?: number;
}

export interface EnemyDefinition {
  type: EnemyType;
  name: string;
  maxHealth: number;
  speed: number;
  reward: number;
  coreDamage: number;
  radius: number;
  color: string;
  description: string;
  medical?: boolean;
  boss?: boolean;
  disruptsTowers?: boolean;
}

export interface TowerState {
  id: string;
  type: TowerType;
  padId: string;
  position: Point;
  cooldownRemaining: number;
  incomeCooldownRemaining: number;
  disabledUntil: number;
  ownerId: string;
}

export interface EnemyState {
  id: string;
  type: EnemyType;
  position: Point;
  distance: number;
  health: number;
  maxHealth: number;
  speed: number;
  reward: number;
  radius: number;
  coreDamage: number;
  disruptCooldownRemaining: number;
}

export interface BeamEffect {
  id: string;
  from: Point;
  to: Point;
  color: string;
  ttl: number;
}

export interface PlayerPresence {
  id: string;
  name: string;
  connected: boolean;
  isHost: boolean;
}

export interface GameEvent {
  id: string;
  type: GameEventType;
  message: string;
  createdAt: number;
}

export interface GameSnapshot {
  roomId: string | null;
  mode: GameMode;
  status: SessionStatus;
  clock: number;
  coreHealth: number;
  coreMaxHealth: number;
  resources: number;
  waveNumber: number;
  totalWaves: number;
  currentWaveLabel: string;
  activeWave: boolean;
  canStartWave: boolean;
  nextWaveIn: number;
  towers: TowerState[];
  enemies: EnemyState[];
  buildPads: BuildPad[];
  players: PlayerPresence[];
  beams: BeamEffect[];
  eventFeed: GameEvent[];
}

export interface WaveEntry {
  type: EnemyType;
  count: number;
  spacing: number;
}

export interface WaveDefinition {
  id: number;
  label: string;
  bounty: number;
  entries: WaveEntry[];
}

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const CORE_POSITION: Point = { x: 770, y: 270 };
export const CORE_RADIUS = 46;
export const CORE_MAX_HEALTH = 20;
export const STARTING_RESOURCES = 150;
export const PASSIVE_INCOME_AMOUNT = 10;
export const PASSIVE_INCOME_INTERVAL = 3;
export const INTERMISSION_SECONDS = 10;
export const MAX_EVENT_FEED = 8;

export const PATH_POINTS: Point[] = [
  { x: -40, y: 90 },
  { x: 120, y: 90 },
  { x: 220, y: 140 },
  { x: 320, y: 220 },
  { x: 370, y: 330 },
  { x: 500, y: 420 },
  { x: 640, y: 390 },
  { x: 700, y: 330 },
  { x: 730, y: 280 },
  { x: 760, y: 270 },
];

export const BUILD_PADS: BuildPad[] = [
  { id: 'pad-1', position: { x: 178, y: 60 }, occupiedTowerId: null },
  { id: 'pad-2', position: { x: 278, y: 112 }, occupiedTowerId: null },
  { id: 'pad-3', position: { x: 360, y: 158 }, occupiedTowerId: null },
  { id: 'pad-4', position: { x: 430, y: 250 }, occupiedTowerId: null },
  { id: 'pad-5', position: { x: 382, y: 398 }, occupiedTowerId: null },
  { id: 'pad-6', position: { x: 525, y: 476 }, occupiedTowerId: null },
  { id: 'pad-7', position: { x: 672, y: 444 }, occupiedTowerId: null },
  { id: 'pad-8', position: { x: 752, y: 366 }, occupiedTowerId: null },
  { id: 'pad-9', position: { x: 814, y: 184 }, occupiedTowerId: null },
  { id: 'pad-10', position: { x: 662, y: 168 }, occupiedTowerId: null },
  { id: 'pad-11', position: { x: 574, y: 266 }, occupiedTowerId: null },
  { id: 'pad-12', position: { x: 618, y: 92 }, occupiedTowerId: null },
];

export const TOWER_DEFINITIONS: Record<TowerType, TowerDefinition> = {
  savings: {
    type: 'savings',
    name: 'Savings Tower',
    shortLabel: 'ST',
    cost: 45,
    damage: 11,
    range: 112,
    cooldown: 0.75,
    color: '#f59e0b',
    description: 'Cheap and steady shots for early control.',
    purpose: 'Use it to stabilize the first waves and fill open pads quickly.',
  },
  'emergency-fund': {
    type: 'emergency-fund',
    name: 'Emergency Fund Tower',
    shortLabel: 'EF',
    cost: 70,
    damage: 15,
    range: 118,
    cooldown: 0.45,
    color: '#10b981',
    description: 'Fast response tower that chips down crowds.',
    purpose: 'Best all-rounder for keeping Debt Bugs and Job Loss waves in check.',
  },
  'health-insurance': {
    type: 'health-insurance',
    name: 'Health Insurance Tower',
    shortLabel: 'HI',
    cost: 95,
    damage: 17,
    range: 126,
    cooldown: 0.7,
    color: '#06b6d4',
    description: 'Specialist tower that doubles down on medical threats.',
    purpose: 'Place near the late path to stop Medical Emergency units before they stack.',
  },
  'term-life': {
    type: 'term-life',
    name: 'Term Life Tower',
    shortLabel: 'TL',
    cost: 135,
    damage: 42,
    range: 142,
    cooldown: 1.2,
    color: '#ef4444',
    description: 'Heavy hitter built to punch through elite threats.',
    purpose: 'Reserve this for the boss lane and high-value final approach pads.',
  },
  investment: {
    type: 'investment',
    name: 'Investment Tower',
    shortLabel: 'IV',
    cost: 85,
    damage: 0,
    range: 0,
    cooldown: 0,
    color: '#8b5cf6',
    description: 'Does not attack. Generates shared resources over time.',
    purpose: 'Build one or two early to keep the whole team funded.',
    incomeAmount: 18,
    incomeInterval: 4,
  },
};

export const TOWER_ORDER: TowerType[] = [
  'savings',
  'emergency-fund',
  'health-insurance',
  'term-life',
  'investment',
];

export const ENEMY_DEFINITIONS: Record<EnemyType, EnemyDefinition> = {
  'debt-bug': {
    type: 'debt-bug',
    name: 'Debt Bug',
    maxHealth: 34,
    speed: 78,
    reward: 13,
    coreDamage: 1,
    radius: 12,
    color: '#f97316',
    description: 'Weak but frequent nuisance enemy.',
  },
  'inflation-cloud': {
    type: 'inflation-cloud',
    name: 'Inflation Cloud',
    maxHealth: 90,
    speed: 42,
    reward: 22,
    coreDamage: 1,
    radius: 16,
    color: '#94a3b8',
    description: 'Slow tank that temporarily disables nearby towers.',
    disruptsTowers: true,
  },
  'medical-emergency': {
    type: 'medical-emergency',
    name: 'Medical Emergency',
    maxHealth: 78,
    speed: 58,
    reward: 24,
    coreDamage: 1,
    radius: 14,
    color: '#22c55e',
    description: 'Mid-tier medical threat with strong survivability.',
    medical: true,
  },
  'job-loss-wave': {
    type: 'job-loss-wave',
    name: 'Job Loss Wave',
    maxHealth: 48,
    speed: 96,
    reward: 16,
    coreDamage: 1,
    radius: 11,
    color: '#3b82f6',
    description: 'Fast enemies that punish weak lane coverage.',
  },
  'critical-illness-boss': {
    type: 'critical-illness-boss',
    name: 'Critical Illness Boss',
    maxHealth: 360,
    speed: 34,
    reward: 110,
    coreDamage: 3,
    radius: 22,
    color: '#dc2626',
    description: 'Boss unit that requires focused fire and Term Life support.',
    medical: true,
    boss: true,
  },
};

export const WAVE_DEFINITIONS: WaveDefinition[] = [
  {
    id: 1,
    label: 'Rising Bills',
    bounty: 35,
    entries: [
      { type: 'debt-bug', count: 8, spacing: 0.7 },
      { type: 'job-loss-wave', count: 2, spacing: 1.1 },
    ],
  },
  {
    id: 2,
    label: 'Expense Shock',
    bounty: 45,
    entries: [
      { type: 'debt-bug', count: 6, spacing: 0.65 },
      { type: 'medical-emergency', count: 3, spacing: 1.2 },
      { type: 'job-loss-wave', count: 4, spacing: 0.85 },
    ],
  },
  {
    id: 3,
    label: 'Pressure Build-Up',
    bounty: 50,
    entries: [
      { type: 'inflation-cloud', count: 2, spacing: 1.8 },
      { type: 'debt-bug', count: 8, spacing: 0.55 },
      { type: 'medical-emergency', count: 3, spacing: 1.1 },
    ],
  },
  {
    id: 4,
    label: 'Income Squeeze',
    bounty: 60,
    entries: [
      { type: 'job-loss-wave', count: 8, spacing: 0.6 },
      { type: 'inflation-cloud', count: 2, spacing: 1.6 },
      { type: 'medical-emergency', count: 4, spacing: 1 },
    ],
  },
  {
    id: 5,
    label: 'Family Risk Spiral',
    bounty: 70,
    entries: [
      { type: 'debt-bug', count: 6, spacing: 0.55 },
      { type: 'job-loss-wave', count: 5, spacing: 0.7 },
      { type: 'inflation-cloud', count: 3, spacing: 1.5 },
      { type: 'medical-emergency', count: 5, spacing: 0.95 },
    ],
  },
  {
    id: 6,
    label: 'Critical Illness Assault',
    bounty: 100,
    entries: [
      { type: 'debt-bug', count: 6, spacing: 0.45 },
      { type: 'medical-emergency', count: 4, spacing: 0.8 },
      { type: 'job-loss-wave', count: 6, spacing: 0.55 },
      { type: 'critical-illness-boss', count: 1, spacing: 2.5 },
    ],
  },
];
