import { ItemType } from './types';

import imgIntro from './src/assets/introImage.webp';
import imgInvestment from './src/assets/Investment.png';
import imgSavings from './src/assets/Savings.png';
import imgRetirement from './src/assets/Retirement.png';
import imgRental from './src/assets/Rental.png';
import imgSalary from './src/assets/Salary.png';
import imgDeath from './src/assets/Death.png';
import imgDisability from './src/assets/Disability.png';
import imgCancer from './src/assets/Cancer.png';
import imgHeart from './src/assets/Heart.png';
import imgHospitalization from './src/assets/Hospitalization.png';

export interface ItemDef {
  emoji: string;
  icon: string;
  label: string;
  value: number;
  color: string;
  bad: boolean;
  weight: number;
  description: string;
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

export let INTRO_TITLE = 'Balance Blade';
export let INTRO_IMAGE: string = imgIntro;
export let INTRO_TITLE_IMAGE = '';
export let HOW_TO_PLAY_ITEMS: HowToPlayItem[] = [
  { icon: 'tap', text: 'Slice flying benefit tokens to grow your portfolio.' },
  { icon: 'avoid', text: 'Avoid red risk tokens — they slash your balance!' },
  { icon: 'bonus', text: 'Catch the rare golden Loyalty Bonus for a massive boost.' },
];

export let GAME_SECS = 60;
export let SPAWN_INTERVAL_MS = 1400;
export let MOLE_VISIBLE_MS = 2200;
export let MIN_SPAWN_MS = 750;
export let MIN_MOLE_VISIBLE_MS = 1500;
export let RAMP_INTERVAL_SECS = 15;
export let GRID_SIZE = 9;

export let TARGET_PORTFOLIO = 10000;

export let ITEM_DEFS: Record<ItemType, ItemDef> = {

  investment: { emoji: '🛡', icon: imgInvestment, label: 'Investment', value: 2500, color: '#22C55E', bad: false, weight: 14, description: 'Term protection for your family' },
  deposits: { emoji: '📈', icon: imgSavings, label: 'Deposits', value: 2000, color: '#06B6D4', bad: false, weight: 12, description: 'Market-linked fund returns' },
  salary: { emoji: '💰', icon: imgSalary, label: 'Salary', value: 800, color: '#EAB308', bad: false, weight: 12, description: '80C + 10(10D) deduction' },
  retirement: { emoji: '⭐', icon: imgRetirement, label: 'Retirement', value: 1500, color: '#A855F7', bad: false, weight: 10, description: 'Guaranteed payout at maturity' },
  rental: { emoji: '💎', icon: imgRental, label: 'Rental', value: 500, color: '#3B82F6', bad: false, weight: 10, description: 'Long-term wealth accumulation' },
  hospitalization: { emoji: '👑', icon: imgHospitalization, label: 'Hospitalization', value: -1500, color: '#F97316', bad: true, weight: 4, description: 'Rare bonus for loyal policyholders' },
  death: { emoji: '💣', icon: imgDeath, label: 'Death', value: -3000, color: '#DC2626', bad: true, weight: 10, description: 'Policy lapses — coverage lost!' },
  disability: { emoji: '🔥', icon: imgDisability, label: 'Disability', value: -2500, color: '#D97706', bad: true, weight: 14, description: 'Erodes real returns over time' },
  cancer: { emoji: '📉', icon: imgCancer, label: 'Cancer', value: -2500, color: '#991B1B', bad: true, weight: 10, description: 'ULIP fund value drops sharply' },
  heart: { emoji: '📉', icon: imgHeart, label: 'Heart', value: -1500, color: '#991B1B', bad: true, weight: 10, description: 'ULIP fund value drops sharply' },
};

export let SCORE_MESSAGES: ScoreMessage[] = [
  {
    minScore: 80,
    title: 'Wealth Protector',
    body: "You mastered both protection and growth! That's exactly what a balanced ULIP + Term plan delivers — your family stays covered while your wealth compounds.",
  },
  {
    minScore: 60,
    title: 'Smart Balancer',
    body: 'Good instincts! You caught most benefits and dodged major risks. A balanced plan gives you this edge in real life too.',
  },
  {
    minScore: 40,
    title: 'Learning the Balance',
    body: "You're on the right track. Combining ULIP growth with term protection is the smartest move for long-term security.",
  },
  {
    minScore: 0,
    title: 'First Swing',
    body: "Every expert starts here! The key insight: one balanced plan for protection + growth beats managing two plans separately.",
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
  MOLE_VISIBLE_MS = c.gameplay.moleVisibleMs ?? MOLE_VISIBLE_MS;
  MIN_SPAWN_MS = c.gameplay.minSpawnIntervalMs;
  MIN_MOLE_VISIBLE_MS = c.gameplay.minMoleVisibleMs ?? MIN_MOLE_VISIBLE_MS;
  RAMP_INTERVAL_SECS = c.gameplay.difficultyRampIntervalSeconds;
  GRID_SIZE = c.gameplay.gridSize;

  TARGET_PORTFOLIO = c.scoring.targetPortfolio;

  const mv = c.scoring.moleValues;
  const mw = c.scoring.moleWeights;
  (Object.keys(ITEM_DEFS) as ItemType[]).forEach(t => {
    if (mv[t] !== undefined) ITEM_DEFS[t].value = mv[t];
    if (mw[t] !== undefined) ITEM_DEFS[t].weight = mw[t];
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
