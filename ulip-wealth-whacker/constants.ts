import { MoleType } from './types';

export interface MoleDef {
  emoji: string;
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

export let INTRO_TITLE = 'Score Rush';
export let INTRO_IMAGE = 'assets/intro-mole-rush-1.webp';
export let INTRO_TITLE_IMAGE = 'assets/score_rush_title.png';
export let HOW_TO_PLAY_ITEMS: HowToPlayItem[] = [
  { icon: 'tap', text: 'Tap good moles to grow your virtual portfolio before the clock runs out.' },
  { icon: 'avoid', text: 'Avoid crash and charge moles because they reduce your progress.' },
  { icon: 'bonus', text: 'Catch rare boost moles quickly for the biggest jump toward the target.' },
];

export let GAME_SECS = 60;
export let SPAWN_INTERVAL_MS = 1200;
export let MOLE_VISIBLE_MS = 1500;
export let MIN_SPAWN_MS = 700;
export let MIN_MOLE_VISIBLE_MS = 900;
export let RAMP_INTERVAL_SECS = 15;
export let GRID_SIZE = 9;

export let TARGET_PORTFOLIO = 8000;

export let MOLE_DEFS: Record<MoleType, MoleDef> = {
  investment: { emoji: '💰', icon: 'assets/Investment.png', label: 'Investment', value: 1000, color: '#22C55E', bad: false, weight: 15 },
  salary: { emoji: '💰', icon: 'assets/Investment.png', label: 'Salary', value: 1000, color: '#22C55E', bad: false, weight: 15 },
  savings: { emoji: '🏦', icon: 'assets/Savings.png', label: 'Savings', value: 800, color: '#3B82F6', bad: false, weight: 10 },
  rental: { emoji: '🏠', icon: 'assets/Rental.png', label: 'Rental', value: 500, color: '#EAB308', bad: false, weight: 10 },
  retirement: { emoji: '👴', icon: 'assets/Retirement.png', label: 'Retirement Fund', value: 300, color: '#A855F7', bad: false, weight: 5 },
  heart: { emoji: '❤️', icon: 'assets/Heart Dieses.png', label: 'Heart Disease', value: -1500, color: '#dd3333', bad: true, weight: 10 },
  death: { emoji: '⚠️', icon: 'assets/Death.png', label: 'Death', value: -2000, color: '#B91C1C', bad: true, weight: 5 },
  disability: { emoji: '💳', icon: 'assets/Disability.png', label: 'Disability', value: -500, color: '#F97316', bad: true, weight: 10 },
  cancer: { emoji: '☠️', icon: 'assets/Cancer.png', label: 'Critical Illness', value: -2500, color: '#a10e0e', bad: true, weight: 5 },
  hospitalization: { emoji: '🏥', icon: 'assets/Hospitalization.png', label: 'Hospitalization', value: -1000, color: '#7C3AED', bad: true, weight: 15 },
};

export let SCORE_MESSAGES: ScoreMessage[] = [
  {
    minScore: 80,
    title: 'Sharp Spotter',
    body: 'You caught high-value opportunities and kept penalties low. That is the discipline long-term investing rewards.',
  },
  {
    minScore: 60,
    title: 'Smart Mover',
    body: 'You balanced speed with judgement. Keep choosing growth chances while watching the drags on returns.',
  },
  {
    minScore: 40,
    title: 'Building Rhythm',
    body: 'You found some good chances, but a few penalties slowed the run. Better timing can change the outcome quickly.',
  },
  {
    minScore: 0,
    title: 'Practice Round',
    body: 'The game moves fast, just like choices around money can. Learning what to catch and what to avoid is the first win.',
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

  GAME_SECS = c.gameplay.sessionCapSeconds;
  SPAWN_INTERVAL_MS = c.gameplay.spawnIntervalMs;
  MOLE_VISIBLE_MS = c.gameplay.moleVisibleMs;
  MIN_SPAWN_MS = c.gameplay.minSpawnIntervalMs;
  MIN_MOLE_VISIBLE_MS = c.gameplay.minMoleVisibleMs;
  RAMP_INTERVAL_SECS = c.gameplay.difficultyRampIntervalSeconds;
  GRID_SIZE = c.gameplay.gridSize;

  TARGET_PORTFOLIO = c.scoring.targetPortfolio;

  const mv = c.scoring.moleValues;
  const mw = c.scoring.moleWeights;
  (Object.keys(MOLE_DEFS) as MoleType[]).forEach(t => {
    if (mv[t] !== undefined) MOLE_DEFS[t].value = mv[t];
    if (mw[t] !== undefined) MOLE_DEFS[t].weight = mw[t];
  });

  SCORING_BG_IMAGE = c.ui.scoringBgImage ?? '';

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
