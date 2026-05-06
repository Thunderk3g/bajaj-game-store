// All values are populated at runtime by App.tsx fetching /game.configuration.json.
// Defaults here are never used in practice — they exist only to satisfy TypeScript
// before applyConfig() fires.

export interface BrickDef     { label: string; icon: string; powerup: string; padMultiplier: number; speedMultiplier: number; color: string; glow: string; hits: number; pts: number; }
export interface ScoreMessage  { minScore: number; title: string; body: string; }
export interface HowToPlayItem { icon: string; text: string; }

// ── UI colours ────────────────────────────────────────────────────────────────
export let BLUE   = '#003DA6';
export let ORANGE = '#F26522';
export let GREEN  = '#27AE60';

// ── Gameplay ──────────────────────────────────────────────────────────────────
export let MAX_LIVES  = 2;
export let GAME_SECS  = 60;
export let COLS       = 3;
export let BASE_SPEED = 0.01; // fraction of canvas width, e.g. 0.08 → W * 0.08 px/frame

export let BRICK_DEFS: BrickDef[] = [];
export let ROWS         = 0;
export let TOTAL_BRICKS = 0;

// ── Scoring ───────────────────────────────────────────────────────────────────
export let SCORE_MESSAGES:    ScoreMessage[]   = [];
export let COVERAGE_WEIGHT    = 0.8;
export let LIVES_BONUS_MAX    = 20;
export let SCORE_COLOR_GREEN  = 70;
export let SCORE_COLOR_ORANGE = 40;

// ── Contact ───────────────────────────────────────────────────────────────────
export let COMPANY_NAME     = '';
export let CALL_NOW_NUMBER  = '';
export let BOOK_SLOT_TIMES: string[] = [];
export let PRIVACY_POLICY_URL = '';
export let DISCLAIMER       = '';
export let TC_TEXT          = '';

// ── Copy ──────────────────────────────────────────────────────────────────────
export let INTRO_HOW_TO_PLAY: HowToPlayItem[] = [];
export let SCORING_TAGLINE   = '';
export let SCORING_CTA_LINE  = '';
export let THANK_YOU_BODY    = '';

// ── Config loader — called once by App.tsx after fetching /game.configuration.json ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyConfig(c: Record<string, any>): void {
  BLUE   = c.ui.primaryColor;
  ORANGE = c.ui.accentColor;
  GREEN  = c.ui.successColor;

  MAX_LIVES  = c.gameplay.maxLives;
  GAME_SECS  = c.gameplay.sessionCapSeconds;
  COLS       = c.gameplay.cols;
  BASE_SPEED = c.gameplay.baseSpeed ?? 0.01;

  BRICK_DEFS    = c.gameplay.brickDefs;
  ROWS          = BRICK_DEFS.length;
  TOTAL_BRICKS  = ROWS * COLS;

  SCORE_MESSAGES     = c.scoring.messages;
  COVERAGE_WEIGHT    = c.scoring.coverageWeight;
  LIVES_BONUS_MAX    = c.scoring.livesBonusMax;
  SCORE_COLOR_GREEN  = c.scoring.colorThresholds.green;
  SCORE_COLOR_ORANGE = c.scoring.colorThresholds.orange;

  COMPANY_NAME      = c.contact.companyName;
  CALL_NOW_NUMBER   = c.contact.callNowNumber;
  BOOK_SLOT_TIMES   = c.contact.bookSlotTimeSlots;
  PRIVACY_POLICY_URL = c.contact.privacyPolicyUrl ?? '';
  DISCLAIMER        = c.contact.disclaimer;
  TC_TEXT           = c.contact.tcText;

  INTRO_HOW_TO_PLAY = c.copy.introHowToPlay;
  SCORING_TAGLINE   = c.copy.scoringTagline;
  SCORING_CTA_LINE  = c.copy.scoringCtaLine;
  THANK_YOU_BODY    = c.copy.thankYouBody;
}
