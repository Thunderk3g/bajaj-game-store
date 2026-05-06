export interface ScoreMessage {
  minScore: number;
  title: string;
  body: string;
}

export let GAME_NAME = 'ULIP Picture Puzzle';
export let PRODUCT = 'ULIP / Market-linked Savings Plans';
export let BLUE = '#003DA6';
export let ORANGE = '#F26522';
export let GREEN = '#28A745';

export let GAME_SECS = 90;
export let GRID_SIZE = 3;
export let TOTAL_TILES = 9;
export let MAX_MOVES = 45;
export let SHUFFLE_MOVES = 42;
export let IMAGE_PATH = './ulip-puzzle-art.png';

export let MAX_SCORE = 100;
export let PASSING_SCORE = 50;
export let POINTS_PER_CORRECT_TILE = 8;
export let PENALTY_PER_MOVE_OVER_PAR = 2;
export let TIME_BONUS = true;
export let TIME_BONUS_THRESHOLD_SECONDS = 60;
export let PAR_MOVES = 24;
export let SOLVED_BONUS = 20;
export let SCORE_MESSAGES: ScoreMessage[] = [];

export let MUSIC_ENABLED_BY_DEFAULT = true;
export let SFX_ENABLED_BY_DEFAULT = true;

export let INTRO_TITLE = 'ULIP Picture Puzzle';
export let INTRO_HOOK_LINE = '';
export let INTRO_HOW_TO_PLAY = '';
export let SCORING_TAGLINE = '';
export let SCORING_CTA_LINE = '';
export let THANK_YOU_BODY = '';

export let COMPANY_NAME = '';
export let CALL_NOW_NUMBER = '';
export let BOOK_SLOT_TIMES: string[] = [];
export let PRIVACY_POLICY_URL = '';
export let DISCLAIMER = '';
export let TC_TEXT = '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyConfig(c: Record<string, any>): void {
  GAME_NAME = c.meta.gameName;
  PRODUCT = c.meta.product;

  BLUE = c.ui.primaryColor;
  ORANGE = c.ui.accentColor;
  GREEN = c.ui.successColor;

  GAME_SECS = c.gameplay.sessionCapSeconds;
  GRID_SIZE = c.gameplay.gridSize;
  TOTAL_TILES = GRID_SIZE * GRID_SIZE;
  MAX_MOVES = c.gameplay.maxMoves;
  SHUFFLE_MOVES = c.gameplay.shuffleMoves;
  IMAGE_PATH = c.gameplay.imagePath;

  MAX_SCORE = c.scoring.maxScore;
  PASSING_SCORE = c.scoring.passingScore;
  POINTS_PER_CORRECT_TILE = c.scoring.pointsPerCorrectTile;
  PENALTY_PER_MOVE_OVER_PAR = c.scoring.penaltyPerMoveOverPar;
  TIME_BONUS = c.scoring.timeBonus;
  TIME_BONUS_THRESHOLD_SECONDS = c.scoring.timeBonusThresholdSeconds;
  PAR_MOVES = c.scoring.parMoves;
  SOLVED_BONUS = c.scoring.solvedBonus;
  SCORE_MESSAGES = c.scoring.messages;

  MUSIC_ENABLED_BY_DEFAULT = c.audio.musicEnabledByDefault;
  SFX_ENABLED_BY_DEFAULT = c.audio.sfxEnabledByDefault;

  INTRO_TITLE = c.copy.introTitle;
  INTRO_HOOK_LINE = c.copy.introHookLine;
  INTRO_HOW_TO_PLAY = c.copy.introHowToPlay;
  SCORING_TAGLINE = c.copy.scoringTagline;
  SCORING_CTA_LINE = c.copy.scoringCtaLine;
  THANK_YOU_BODY = c.copy.thankYouBody;

  COMPANY_NAME = c.contact.companyName;
  CALL_NOW_NUMBER = c.contact.callNowNumber;
  BOOK_SLOT_TIMES = c.contact.bookSlotTimeSlots;
  PRIVACY_POLICY_URL = c.contact.privacyPolicyUrl ?? '';
  DISCLAIMER = c.contact.disclaimer.replace('{COMPANY}', COMPANY_NAME);
  TC_TEXT = c.contact.tcText.replace('{COMPANY}', COMPANY_NAME);
}
