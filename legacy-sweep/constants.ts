import { BenefitType } from './types';

import imgIntro from './src/assets/introImage.webp';
import imgFamilyShield   from './src/assets/family_shield.png';
import imgSavingsVault   from './src/assets/savings_vault.png';
import imgRetirementFund from './src/assets/retirement_fund.png';
import imgLifeBonus      from './src/assets/life_bonus.png';
import imgCoverageKey    from './src/assets/coverage_key.png';
import imgUncoveredRisk  from './src/assets/uncovered_risk.png';

export interface BenefitDef {
  icon: string;
  label: string;
  color: string;
  points: number;
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

export let BLUE   = '#1a2744';
export let ORANGE = '#D4A017';
export let GREEN  = '#22C55E';

export let INTRO_TITLE       = 'Legacy Sweep';
export let INTRO_IMAGE: string = imgIntro;
export let INTRO_TITLE_IMAGE = '';
export let HOW_TO_PLAY_ITEMS: HowToPlayItem[] = [
  { icon: 'tap',   text: 'Tap cells to reveal whole life insurance benefits hidden beneath the surface.' },
  { icon: 'avoid', text: 'Avoid uncovered risk cells — hitting one ends your sweep immediately.' },
  { icon: 'bonus', text: 'Long-press (or toggle Flag mode) to mark suspected risk cells safely.' },
];

export let GRID_ROWS       = 7;
export let GRID_COLS       = 5;
export let MINE_COUNT      = 7;
export let POINTS_PER_CELL = 100;
export let WIN_BONUS       = 500;
export let MINE_PENALTY    = 0;

export let BENEFIT_DEFS: Record<BenefitType, BenefitDef> = {
  family_shield:   { icon: imgFamilyShield,   label: 'Family Protection', color: '#3B82F6', points: 100 },
  savings_vault:   { icon: imgSavingsVault,   label: 'Savings Growth',    color: '#22C55E', points: 100 },
  retirement_fund: { icon: imgRetirementFund, label: 'Retirement Fund',   color: '#A855F7', points: 100 },
  life_bonus:      { icon: imgLifeBonus,      label: 'Maturity Bonus',    color: '#F59E0B', points: 100 },
  coverage_key:    { icon: imgCoverageKey,    label: 'Life Coverage',     color: '#EC4899', points: 100 },
};

export const MINE_DEF = {
  icon:  imgUncoveredRisk,
  label: 'Uncovered Risk',
  color: '#EF4444',
};

export let SCORE_MESSAGES: ScoreMessage[] = [
  {
    minScore: 90,
    title: 'Fully Covered',
    body: 'You swept the entire field without a single risk. Whole life means your family is always protected — for life.',
  },
  {
    minScore: 70,
    title: 'Well Protected',
    body: 'Strong sweep! Most benefits are in reach. Whole life coverage fills the gaps that term plans leave behind.',
  },
  {
    minScore: 50,
    title: 'Partially Secured',
    body: 'A decent start, but uncovered risks remain. Whole life insurance ensures zero gaps in your lifetime protection.',
  },
  {
    minScore: 0,
    title: 'Risk Detected',
    body: 'Uncovered risks can strike at any time. Whole life insurance covers you up to 99 years — so your family never faces uncertainty.',
  },
];

export let COMPANY_NAME      = 'Bajaj Life Insurance';
export let CALL_NOW_NUMBER   = '02261241800';
export let BOOK_SLOT_TIMES: string[] = [];
export let PRIVACY_POLICY_URL = '';
export let DISCLAIMER         = '';
export let TC_TEXT            = '';

export let SCORING_TAGLINE  = 'Your whole life, fully covered.';
export let SCORING_CTA_LINE = 'Discover lifetime protection with Bajaj Life Insurance.';
export let THANK_YOU_BODY   = 'A Bajaj Life advisor will connect with you to show how a Whole Life plan secures your family forever.';
export let SCORING_BG_IMAGE = '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyConfig(c: Record<string, any>): void {
  BLUE   = c.ui?.primaryColor  ?? BLUE;
  ORANGE = c.ui?.accentColor   ?? ORANGE;
  GREEN  = c.ui?.successColor  ?? GREEN;
  SCORING_BG_IMAGE = c.ui?.scoringBgImage ?? SCORING_BG_IMAGE;

  INTRO_TITLE      = c.copy?.introTitle ?? INTRO_TITLE;
  INTRO_IMAGE      = c.copy?.introImage ?? INTRO_IMAGE;
  HOW_TO_PLAY_ITEMS = Array.isArray(c.copy?.introHowToPlay)
    ? c.copy.introHowToPlay
    : HOW_TO_PLAY_ITEMS;

  GRID_ROWS       = c.gameplay?.gridRows       ?? GRID_ROWS;
  GRID_COLS       = c.gameplay?.gridCols       ?? GRID_COLS;
  MINE_COUNT      = c.gameplay?.mineCount      ?? MINE_COUNT;
  POINTS_PER_CELL = c.scoring?.pointsPerCell   ?? POINTS_PER_CELL;
  WIN_BONUS       = c.scoring?.winBonus        ?? WIN_BONUS;
  MINE_PENALTY    = c.scoring?.minePenalty     ?? MINE_PENALTY;

  COMPANY_NAME       = c.contact?.companyName        ?? COMPANY_NAME;
  CALL_NOW_NUMBER    = c.contact?.callNowNumber       ?? CALL_NOW_NUMBER;
  BOOK_SLOT_TIMES    = c.contact?.bookSlotTimeSlots   ?? BOOK_SLOT_TIMES;
  PRIVACY_POLICY_URL = c.contact?.privacyPolicyUrl    ?? PRIVACY_POLICY_URL;
  DISCLAIMER         = String(c.contact?.disclaimer   ?? DISCLAIMER).replace('{COMPANY}', COMPANY_NAME.toUpperCase());
  TC_TEXT            = String(c.contact?.tcText        ?? TC_TEXT).replace('{COMPANY}', COMPANY_NAME);

  SCORING_TAGLINE  = c.copy?.scoringTagline  ?? SCORING_TAGLINE;
  SCORING_CTA_LINE = c.copy?.scoringCtaLine  ?? SCORING_CTA_LINE;
  THANK_YOU_BODY   = c.copy?.thankYouBody    ?? THANK_YOU_BODY;
}
