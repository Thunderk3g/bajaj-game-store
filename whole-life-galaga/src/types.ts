export enum Screen {
  Splash = "splash",
  Intro = "intro",
  Instructions = "instructions",
  Game = "game",
  EnterDetails = "enterDetails",
  Scoring = "scoring",
  BookSlot = "bookSlot",
  ThankYou = "thankYou"
}

export interface Lead {
  name: string;
  phone: string;
}

export interface GameResult {
  score: number;
  coveragePercent: number;
  savingsBuilt: number;
  enemiesDestroyed: number;
  powerUpsCollected: number;
  timeElapsed: number;
}

export interface GameConfig {
  meta: {
    gameId: string;
    gameName: string;
    version: string;
    product: string;
    port: number;
  };
  gameplay: {
    sessionCapSeconds: number;
    maxRounds: number | null;
    difficultyRampEnabled: boolean;
    difficultyRampIntervalSeconds: number;
  };
  scoring: {
    maxScore: number;
    passingScore: number;
    pointsPerHit: number;
    penaltyPerMiss: number;
    timeBonus: boolean;
    timeBonusThresholdSeconds: number;
  };
  audio: {
    musicEnabledByDefault: boolean;
    sfxEnabledByDefault: boolean;
  };
  copy: {
    introTitle: string;
    introHookLine: string;
    introHowToPlay: string;
    scoringTagline: string;
    scoringCtaLine: string;
    thankYouBody: string;
  };
  contact: {
    callNowNumber: string;
    bookSlotTimeSlots: string[];
    privacyPolicyUrl: string;
  };
  ui: {
    primaryColor: string;
    accentColor: string;
    successColor: string;
    fontFamily: string;
  };
}

export type EnemyKind = "risk" | "health" | "death" | "emergency";
export type PowerUpKind = "savings" | "coverage";

export interface GameObject {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: EnemyKind | PowerUpKind;
  size: number;
}

export interface GameStats {
  score: number;
  coveragePercent: number;
  savingsBuilt: number;
  enemiesDestroyed: number;
  powerUpsCollected: number;
  lastShot: number;
  lastEnemySpawn: number;
  lastPowerupSpawn: number;
}