import { MoleType as ItemType } from './types';

// ** Asset Import Section **
import imgIntro from './src/assets/introImage.png';

export interface ItemDef {
  icon: string;
  label: string;
  value: number;
  color: string;
  bad: boolean;
  weight: number;
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
export let GREEN = '#28A745';

export let INTRO_TITLE = 'Picture Puzzle';
export let INTRO_IMAGE: string = imgIntro;
export let INTRO_TITLE_IMAGE = '';
export let HOW_TO_PLAY_ITEMS: HowToPlayItem[] = [
  { icon: 'tap', text: 'Tap a tile to select it, then tap another tile to swap their positions.' },
  { icon: 'tap', text: 'Rearrange all 9 tiles to recreate the target picture shown at the bottom.' },
  { icon: 'tap', text: 'Solve as many puzzles as you can before time runs out. Fewer swaps = more points!' },
];

export let GAME_SECS = 60;
export let GRID_SIZE = 9;
export let TARGET_PORTFOLIO = 2000; // For puzzle game: 4 puzzles * 500 points each

// ** Game Item Definitions (for compatibility)
export let GAME_ITEM_DEFS: Record<ItemType, ItemDef> = {
  investment:      { icon: '', label: 'Investment',      value:  1000, color: '#22C55E', bad: false, weight: 15 },
  salary:          { icon: '', label: 'Salary',          value:  1000, color: '#22C55E', bad: false, weight: 15 },
  savings:         { icon: '', label: 'Savings',         value:   800, color: '#49f4b8', bad: false, weight: 10 },
  rental:          { icon: '', label: 'Rental',          value:   500, color: '#77cc00', bad: false, weight: 10 },
  retirement:      { icon: '', label: 'Retirement Fund', value:   300, color: '#43f146', bad: false, weight: 5 },
  heart:           { icon: '', label: 'Heart Disease',   value: -1500, color: '#dd3333', bad: true,  weight: 10 },
  death:           { icon: '', label: 'Death',           value: -2000, color: '#B91C1C', bad: true,  weight: 5 },
  disability:      { icon: '', label: 'Disability',      value:  -500, color: '#F97316', bad: true,  weight: 10 },
  cancer:          { icon: '', label: 'Critical Illness', value: -2500, color: '#a10e0e', bad: true, weight: 5 },
  hospitalization: { icon: '', label: 'Hospitalization', value: -1000, color: '#f57f31', bad: true,  weight: 15 },
};

// ** CTA Tagline **
export let SCORE_MESSAGES: ScoreMessage[] = [
  {
    minScore: 80,
    title: 'Master Matcher',
    body: 'You matched puzzles with exceptional accuracy! Your sharp observation skills are impressive.',
  },
  {
    minScore: 60,
    title: 'Skilled Solver',
    body: 'You found the puzzle pieces with good timing. Keep practicing to perfect your matching speed!',
  },
  {
    minScore: 40,
    title: 'Puzzle Learner',
    body: 'You solved some puzzles correctly. With more practice, you\'ll match them even faster.',
  },
  {
    minScore: 0,
    title: 'Getting Started',
    body: 'Puzzle matching takes focus. Every attempt helps you improve. Try again and beat your score!',
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
  INTRO_IMAGE = c.copy.introImage || INTRO_IMAGE;
  HOW_TO_PLAY_ITEMS = Array.isArray(c.copy.introHowToPlay)
    ? c.copy.introHowToPlay
    : [{ icon: 'tap', text: String(c.copy.introHowToPlay || '') }];

  GAME_SECS = c.gameplay.sessionCapSeconds ?? GAME_SECS;
  GRID_SIZE = c.gameplay.gridSize ?? GRID_SIZE;

  TARGET_PORTFOLIO = c.scoring.targetPortfolio ?? c.scoring.maxScore ?? TARGET_PORTFOLIO;

  const mv = c.scoring.moleValues;
  const mw = c.scoring.moleWeights;
  if (mv && mw) {
    (Object.keys(GAME_ITEM_DEFS) as ItemType[]).forEach(t => {
      if (mv[t] !== undefined) GAME_ITEM_DEFS[t].value = mv[t];
      if (mw[t] !== undefined) GAME_ITEM_DEFS[t].weight = mw[t];
    });
  }

  SCORING_BG_IMAGE = c.ui.scoringBgImage || INTRO_IMAGE;

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
