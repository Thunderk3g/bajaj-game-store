// All values are populated at runtime by App.tsx fetching /game.configuration.json.
// Defaults exist only to satisfy TypeScript before applyConfig() runs.
const getAssetUrl = (path: string) => `./${path}`;

export interface BrickDef {
  label: string;
  icon: string;
  powerup: string;
  padMultiplier: number;
  speedMultiplier: number;
  color: string;
  glow: string;
  hits: number;
  pts: number;
}

export interface ScoreMessage {
  minScore: number;
  title: string;
  body: string;
}

export interface HowToPlayItem {
  icon: string;
  text: string;
}

export let BLUE = '#003DA6';
export let ORANGE = '#F26522';
export let GREEN = '#27AE60';

export let MAX_LIVES = 2;
export let GAME_SECS = 60;
export let COLS = 3;
export let BASE_SPEED = 0.01;

export let BRICK_DEFS: BrickDef[] = [
  { label: 'Salary', icon: getAssetUrl('brick_spritesheet/Savings.png'), powerup: 'paddle_grow', padMultiplier: 0.1, speedMultiplier: 0, color: '#23e76c', glow: '#8dffb2', hits: 1, pts: 1000 },
  { label: 'Investment', icon: getAssetUrl('brick_spritesheet/Investment.png'), powerup: 'bomb', padMultiplier: 0, speedMultiplier: 0, color: '#10ffa3', glow: '#80ffce', hits: 1, pts: 2500 },
  { label: 'Rental', icon: getAssetUrl('brick_spritesheet/Rental.png'), powerup: 'paddle_grow', padMultiplier: 0.1, speedMultiplier: 0, color: '#bf5af2', glow: '#e0b0ff', hits: 1, pts: 2000 },
  { label: 'Retirement', icon: getAssetUrl('brick_spritesheet/Retirement.png'), powerup: 'paddle_grow', padMultiplier: 0.2, speedMultiplier: 0, color: '#4f4dc7', glow: '#9c5cc7', hits: 1, pts: 3000 },
  { label: 'Deposits', icon: getAssetUrl('brick_spritesheet/Deposits.png'), powerup: 'paddle_grow', padMultiplier: 0.1, speedMultiplier: 0, color: '#bf5af2', glow: '#e0b0ff', hits: 1, pts: 1500 },
  { label: 'Death', icon: getAssetUrl('brick_spritesheet/Death.png'), powerup: 'paddle_shrink', padMultiplier: -0.2, speedMultiplier: 0, color: '#ff2d78', glow: '#ff80b4', hits: 1, pts: -3000 },
  { label: 'Cancer', icon: getAssetUrl('brick_spritesheet/Cancer.png'), powerup: 'paddle_shrink', padMultiplier: -0.1, speedMultiplier: 0, color: '#ff7a18', glow: '#ffb366', hits: 1, pts: -2500 },
  { label: 'Disability', icon: getAssetUrl('brick_spritesheet/Disability.png'), powerup: 'speed_up', padMultiplier: 0, speedMultiplier: 0.06, color: '#ff9900', glow: '#fff176', hits: 1, pts: -1500 },
  { label: 'Hospitalization', icon: getAssetUrl('brick_spritesheet/Hospitalization.png'), powerup: 'speed_up', padMultiplier: 0, speedMultiplier: 0.07, color: '#ffef0a', glow: '#ffd280', hits: 1, pts: -500 },
  { label: 'Heart Disease', icon: getAssetUrl('brick_spritesheet/Heart.png'), powerup: 'speed_up', padMultiplier: 0, speedMultiplier: 0.07, color: '#ff9f0a', glow: '#ffd280', hits: 1, pts: -1000 }, 
];
export let ROWS = COLS;
export let TOTAL_BRICKS = ROWS * COLS;

export let SCORE_MESSAGES: ScoreMessage[] = [];
export let COVERAGE_WEIGHT = 0.8;
export let LIVES_BONUS_MAX = 20;
export let SCORE_COLOR_GREEN = 70;
export let SCORE_COLOR_ORANGE = 40;

export let COMPANY_NAME = '';
export let CALL_NOW_NUMBER = '';
export let BOOK_SLOT_TIMES: string[] = [];
export let PRIVACY_POLICY_URL = '';
export let DISCLAIMER = '';
export let TC_TEXT = '';

export let INTRO_HOW_TO_PLAY: HowToPlayItem[] = [];
export let INTRO_TITLE = '';
export let SCORING_TAGLINE = '';
export let SCORING_CTA_LINE = '';
export let THANK_YOU_BODY = '';
export let SCORING_BG_IMAGE = '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyConfig(c: Record<string, any>): void {
  BLUE = c.ui.primaryColor;
  ORANGE = c.ui.accentColor;
  GREEN = c.ui.successColor;

  MAX_LIVES = c.gameplay.maxLives;
  GAME_SECS = c.gameplay.sessionCapSeconds;
  COLS = c.gameplay.cols;
  BASE_SPEED = c.gameplay.baseSpeed ?? 0.01;

  ROWS = c.gameplay.cols;
  TOTAL_BRICKS = ROWS * COLS;

  SCORE_MESSAGES = c.scoring.messages;
  COVERAGE_WEIGHT = c.scoring.coverageWeight;
  LIVES_BONUS_MAX = c.scoring.livesBonusMax;
  SCORE_COLOR_GREEN = c.scoring.colorThresholds.green;
  SCORE_COLOR_ORANGE = c.scoring.colorThresholds.orange;

  SCORING_BG_IMAGE = c.ui.scoringBgImage ?? '';

  COMPANY_NAME = c.contact.companyName;
  CALL_NOW_NUMBER = c.contact.callNowNumber;
  BOOK_SLOT_TIMES = c.contact.bookSlotTimeSlots;
  PRIVACY_POLICY_URL = c.contact.privacyPolicyUrl ?? '';
  DISCLAIMER = c.contact.disclaimer;
  TC_TEXT = c.contact.tcText;

  INTRO_HOW_TO_PLAY = c.copy.introHowToPlay;
  INTRO_TITLE = c.copy.introTitle;
  SCORING_TAGLINE = c.copy.scoringTagline;
  SCORING_CTA_LINE = c.copy.scoringCtaLine;
  THANK_YOU_BODY = c.copy.thankYouBody;
}
