import { EnemyType, HowToPlayItem } from './types';

export interface EnemyDef {
  icon: string;
  label: string;
  baseSpeed: number;
  hp: number;
  damage: number;
  points: number;
  color: string;
  radius: number;
  weight: number;
  minWave: number;
}

export interface ScoreMessage {
  minScore: number;
  title: string;
  body: string;
}

export let BLUE = '#003DA6';
export let ORANGE = '#F26522';
export let GREEN = '#28A745';

export let GAME_SECS = 60;
export let PLAYER_SPEED = 180;
export let BULLET_SPEED = 310;
export let FIRE_RATE_MS = 620;
export let PLAYER_MAX_HP = 5;
export let ENEMY_SPAWN_INTERVAL = 1650;
export let MIN_ENEMY_SPAWN_INTERVAL = 760;
export let RAMP_INTERVAL_SECS = 15;
export let KILL_TARGET = 26;
export let POWER_UP_SPAWN_INTERVAL_MS = 9000;
export let POWER_UP_DURATION_MS = 7000;
export let FIRE_RATE_BOOST_MULTIPLIER = 0.55;
export let DIAGONAL_FIRE_ANGLE_DEGREES = 32;

export const PLAYER_RADIUS = 20;
export const BULLET_RADIUS = 5;

export const ENEMY_DEFS: Record<EnemyType, EnemyDef> = {
  emi: { icon: 'EMI', label: 'EMI Overdue', baseSpeed: 50, hp: 2, damage: 1, points: 10, color: '#EF4444', radius: 22, weight: 35, minWave: 1 },
  credit_card: { icon: 'CARD', label: 'Credit Debt', baseSpeed: 72, hp: 1, damage: 1, points: 15, color: '#F97316', radius: 20, weight: 30, minWave: 1 },
  tax_notice: { icon: 'TAX', label: 'Tax Notice', baseSpeed: 42, hp: 3, damage: 1, points: 20, color: '#8B5CF6', radius: 24, weight: 20, minWave: 1 },
  market_crash: { icon: 'DROP', label: 'Market Crash', baseSpeed: 92, hp: 1, damage: 2, points: 20, color: '#DC2626', radius: 18, weight: 12, minWave: 1 },
  loan_shark: { icon: 'LOAN', label: 'Loan Trap', baseSpeed: 76, hp: 3, damage: 2, points: 30, color: '#FF4757', radius: 26, weight: 8, minWave: 2 },
  coverage_gap: { icon: 'GAP', label: 'Coverage Gap', baseSpeed: 38, hp: 4, damage: 1, points: 25, color: '#F59E0B', radius: 25, weight: 5, minWave: 3 },
};

export const SCORE_MESSAGES: ScoreMessage[] = [
  { minScore: 80, title: 'Financial Guardian', body: 'You kept the shield strong and neutralised most threats. The same discipline helps families plan for debts, income gaps, and long-term protection.' },
  { minScore: 60, title: 'Debt Defender', body: 'You handled pressure well. A structured protection plan can help your family face real-world liabilities with similar confidence.' },
  { minScore: 40, title: 'Still Standing', body: 'You survived the arena, but a few threats got through. Reviewing cover against loans and responsibilities can strengthen your real defence.' },
  { minScore: 0, title: 'Threats Broke Through', body: 'EMIs, credit dues, and sudden income shocks can pile up quickly. Protection planning helps keep loved ones from carrying that burden alone.' },
];

export let COMPANY_NAME = 'Bajaj Life Insurance';
export let CALL_NOW_NUMBER = '02261241800';
export let BOOK_SLOT_TIMES: string[] = [];
export let PRIVACY_POLICY_URL = '';
export let DISCLAIMER = '';
export let TC_TEXT = '';

export let INTRO_TITLE = 'Debt Defender';
export let INTRO_HOOK = '';
export let INTRO_EYEBROW = 'Bajaj Life Insurance';
export let INTRO_CTA = 'PLAY';
export let HOW_TO_TITLE = 'How to Play';
export let HOW_TO_SUBTITLE = '';
export let HOW_TO_START_CTA = 'START';
export let HOW_TO_PLAY_ITEMS: HowToPlayItem[] = [];
export let GREEN_ZONE_TITLE = 'Your Defence Report';
export let RED_ZONE_TITLE = 'Protect Your Real Future';
export let SCORING_HEADER = 'Financial Defence Report';
export let SCORING_TAGLINE = '';
export let SCORING_CTA_LINE = '';
export let SHARE_TEXT = '';
export let BOOK_SLOT_TITLE = 'Book a Slot';
export let BOOK_SLOT_SUBLINE = 'Our agent will help you secure your future.';
export let THANK_YOU_TITLE = 'THANK YOU!';
export let THANK_YOU_BODY = '';
export let PLAY_AGAIN_CTA = 'PLAY AGAIN';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyConfig(c: Record<string, any>): void {
  BLUE = c.ui.primaryColor;
  ORANGE = c.ui.accentColor;
  GREEN = c.ui.successColor;

  GAME_SECS = c.gameplay.sessionCapSeconds;
  PLAYER_SPEED = c.gameplay.playerSpeed;
  BULLET_SPEED = c.gameplay.bulletSpeed;
  FIRE_RATE_MS = c.gameplay.fireRateMs;
  PLAYER_MAX_HP = c.gameplay.playerMaxHealth;
  ENEMY_SPAWN_INTERVAL = c.gameplay.enemySpawnIntervalMs;
  MIN_ENEMY_SPAWN_INTERVAL = c.gameplay.minEnemySpawnIntervalMs;
  RAMP_INTERVAL_SECS = c.gameplay.difficultyRampIntervalSeconds;
  KILL_TARGET = c.scoring.killTargetForMaxScore;
  POWER_UP_SPAWN_INTERVAL_MS = c.gameplay.powerUpSpawnIntervalMs;
  POWER_UP_DURATION_MS = c.gameplay.powerUpDurationMs;
  FIRE_RATE_BOOST_MULTIPLIER = c.gameplay.fireRateBoostMultiplier;
  DIAGONAL_FIRE_ANGLE_DEGREES = c.gameplay.diagonalFireAngleDegrees;

  COMPANY_NAME = c.contact.companyName;
  CALL_NOW_NUMBER = c.contact.callNowNumber;
  BOOK_SLOT_TIMES = c.contact.bookSlotTimeSlots;
  PRIVACY_POLICY_URL = c.contact.privacyPolicyUrl;
  DISCLAIMER = c.contact.disclaimer.replace('{COMPANY}', c.contact.companyName);
  TC_TEXT = c.contact.tcText.replace('{COMPANY}', c.contact.companyName);

  INTRO_TITLE = c.copy.introTitle;
  INTRO_HOOK = c.copy.introHookLine;
  INTRO_EYEBROW = c.copy.introEyebrow;
  INTRO_CTA = c.copy.introCta;
  HOW_TO_TITLE = c.copy.howToTitle;
  HOW_TO_SUBTITLE = c.copy.howToSubtitle;
  HOW_TO_START_CTA = c.copy.howToStartCta;
  HOW_TO_PLAY_ITEMS = c.copy.introHowToPlay;
  GREEN_ZONE_TITLE = c.copy.greenZoneTitle;
  RED_ZONE_TITLE = c.copy.redZoneTitle;
  SCORING_HEADER = c.copy.scoringHeader;
  SCORING_TAGLINE = c.copy.scoringTagline;
  SCORING_CTA_LINE = c.copy.scoringCtaLine;
  SHARE_TEXT = c.copy.shareText;
  BOOK_SLOT_TITLE = c.copy.bookSlotTitle;
  BOOK_SLOT_SUBLINE = c.copy.bookSlotSubline;
  THANK_YOU_TITLE = c.copy.thankYouTitle;
  THANK_YOU_BODY = c.copy.thankYouBody;
  PLAY_AGAIN_CTA = c.copy.playAgainCta;
}
