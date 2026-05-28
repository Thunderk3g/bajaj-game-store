import { introImage } from './src/assets';

export interface ScoreMessage {
  minScore: number;
  title: string;
  body: string;
}

export interface SudokuLevel {
  name: string;
  clues: number;
  score: number;
  hintPenalty: number;
  mistakePenalty: number;
}

export let BLUE = '#003DA6';
export let ORANGE = '#F26522';
export let GREEN = '#28A745';

export let INTRO_TITLE = 'Guardian Grid';
export let INTRO_IMAGE = introImage;

export let GAME_SECS = 150;
export let GRID_SIZE = 4;
export let BOX_SIZE = 2;
export let MAX_HINTS = 3;
export let COMPLETE_BONUS = 400;
export let TIME_BONUS_PER_SECOND = 4;
export let CELL_SCORE = 35;
export let LEVELS: SudokuLevel[] = [
  { name: 'Level 1', clues: 8, score: 300, hintPenalty: 60, mistakePenalty: 45 },
  { name: 'Level 2', clues: 6, score: 450, hintPenalty: 80, mistakePenalty: 65 },
  { name: 'Level 3', clues: 5, score: 650, hintPenalty: 100, mistakePenalty: 85 },
];

export let SCORE_MESSAGES: ScoreMessage[] = [
  {
    minScore: 80,
    title: 'Protection Pro',
    body: 'You balanced speed and accuracy, just like choosing simple high-cover protection before responsibilities grow.',
  },
  {
    minScore: 60,
    title: 'Grid Guardian',
    body: 'You kept the family shield mostly intact. A few careful choices can make protection planning even stronger.',
  },
  {
    minScore: 40,
    title: 'Cover Builder',
    body: 'You found the pattern. Term cover is about straightforward protection, low cost, and enough sum assured.',
  },
  {
    minScore: 0,
    title: 'Practice Round',
    body: 'The grid can be solved with focus. Protection planning works the same way: simple rules, clear cover, no confusion.',
  },
];

export let COMPANY_NAME = 'Bajaj Life Insurance';
export let CALL_NOW_NUMBER = '02261241800';
export let BOOK_SLOT_TIMES: string[] = [];
export let PRIVACY_POLICY_URL = '';
export let DISCLAIMER = '';
export let TC_TEXT = '';

export let SCORING_TAGLINE = '';
export let SCORING_CTA_LINE = '';
export let THANK_YOU_BODY = '';
export let SCORING_BG_IMAGE = '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyConfig(c: Record<string, any>): void {
  BLUE = c.ui.primaryColor;
  ORANGE = c.ui.accentColor;
  GREEN = c.ui.successColor;

  INTRO_TITLE = c.copy.introTitle;
  INTRO_IMAGE = c.copy.introImage && !c.copy.introImage.startsWith('src/assets/') ? c.copy.introImage : INTRO_IMAGE;

  GAME_SECS = c.gameplay.sessionCapSeconds;
  GRID_SIZE = c.gameplay.gridSize;
  BOX_SIZE = c.gameplay.boxSize;
  MAX_HINTS = c.gameplay.maxHints;
  LEVELS = Array.isArray(c.gameplay.levels) ? c.gameplay.levels : LEVELS;
  COMPLETE_BONUS = c.scoring.completeBonus;
  TIME_BONUS_PER_SECOND = c.scoring.timeBonusPerSecond;
  CELL_SCORE = c.scoring.cellScore;

  SCORING_BG_IMAGE = c.ui.scoringBgImage && !c.ui.scoringBgImage.startsWith('src/assets/') ? c.ui.scoringBgImage : INTRO_IMAGE;

  COMPANY_NAME = c.contact.companyName || COMPANY_NAME;
  CALL_NOW_NUMBER = c.contact.callNowNumber;
  BOOK_SLOT_TIMES = c.contact.bookSlotTimeSlots;
  PRIVACY_POLICY_URL = c.contact.privacyPolicyUrl || '';
  DISCLAIMER = String(c.contact.disclaimer || '').replace('{COMPANY}', COMPANY_NAME.toUpperCase());
  TC_TEXT = String(c.contact.tcText || '').replace('{COMPANY}', COMPANY_NAME);

  SCORING_TAGLINE = c.copy.scoringTagline;
  SCORING_CTA_LINE = c.copy.scoringCtaLine;
  THANK_YOU_BODY = c.copy.thankYouBody;
}
