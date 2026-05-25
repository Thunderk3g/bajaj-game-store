import { ItemType } from './types';

import imgIntro from './src/assets/intro_bg.png';
import imgHero from './src/assets/hero_banana.png';
import imgCoin from './src/assets/coin.png';
import imgShield from './src/assets/shield.png';
import imgZapper from './src/assets/zapper.png';
import imgMissile from './src/assets/missile.png';
import imgSkyline from './src/assets/skyline.png';

import imgDeposits from './src/assets/deposits.png';
import imgSavings from './src/assets/savings.png';
import imgSalary from './src/assets/salary.png';
import imgRetirement from './src/assets/retirement.png';
import imgHospitalization from './src/assets/hospitalization.png';
import imgDisability from './src/assets/disability.png';
import imgCancer from './src/assets/cancer.png';
import imgAccident from './src/assets/accident.png';

export interface ItemDef {
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

export let INTRO_TITLE = 'Term Joyride';
export let INTRO_IMAGE: string = imgIntro;
export let INTRO_TITLE_IMAGE = '';
export let HERO_IMAGE: string = imgHero;
export let SHIELD_IMAGE: string = imgShield;
export let MISSILE_IMAGE: string = imgMissile;
export let ZAPPER_IMAGE: string = imgZapper;
export let COIN_IMAGE: string = imgCoin;
export let SKYLINE_IMAGE: string = imgSkyline;

export let HOW_TO_PLAY_ITEMS: HowToPlayItem[] = [
  { icon: 'tap', text: 'Tap & hold to activate jetpack and fly upwards. Release to fall.' },
  { icon: 'avoid', text: 'Dodge life risk zappers and missiles to protect your balance.' },
  { icon: 'bonus', text: 'Grab life shields and compound growth coins for a huge score boost.' },
];

export let GAME_SECS = 45; // 45 seconds sessions
export let TARGET_PORTFOLIO = 25000; // Target portfolio amount

export let ITEM_DEFS: Record<ItemType, ItemDef> = {
  deposits: { icon: imgDeposits, label: 'Deposits', value: 1500, color: '#06B6D4', bad: false, weight: 14, description: 'Direct growth fund deposits' },
  savings: { icon: imgSavings, label: 'Savings', value: 1000, color: '#22C55E', bad: false, weight: 14, description: 'Secure interest-bearing savings' },
  salary: { icon: imgSalary, label: 'Salary boost', value: 800, color: '#EAB308', bad: false, weight: 12, description: 'Regular tax-efficient salary returns' },
  retirement: { icon: imgRetirement, label: 'Retirement payout', value: 2000, color: '#A855F7', bad: false, weight: 10, description: 'Guaranteed maturity payouts' },
  hospitalization: { icon: imgHospitalization, label: 'Hospitalization bills', value: -1500, color: '#F97316', bad: true, weight: 4, description: 'Unforeseen medical expenses' },
  disability: { icon: imgDisability, label: 'Disability risk', value: -2000, color: '#D97706', bad: true, weight: 4, description: 'Loss of active income' },
  cancer: { icon: imgCancer, label: 'Critical illness', value: -3000, color: '#DC2626', bad: true, weight: 3, description: 'High cost medical treatments' },
  accident: { icon: imgAccident, label: 'Accident expense', value: -2500, color: '#991B1B', bad: true, weight: 3, description: 'Unplanned casualty losses' },
};

export let SCORE_MESSAGES: ScoreMessage[] = [
  {
    minScore: 80,
    title: 'Financial Superstar',
    body: "Incredible flight! You optimized protection with Life Shields and maximized growth. A balanced Bajaj term plan ensures your real-life future is just as secure!",
  },
  {
    minScore: 60,
    title: 'Wealth Builder',
    body: 'Superb balance! You secured key investments and dodged massive market risks. Let a Bajaj financial planner help you maintain this edge.',
  },
  {
    minScore: 40,
    title: 'Learning the Flight',
    body: "Great effort! You are getting the hang of balancing protection against risks. Combining term cover and capital growth is your ticket to a safe landing.",
  },
  {
    minScore: 0,
    title: 'Test Run Complete',
    body: "Every pilot starts here! Lesson learned: staying protected with a reliable Life Shield is crucial when navigating stormy skies.",
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

  INTRO_TITLE = c.copy.introTitle || INTRO_TITLE;
  INTRO_IMAGE = c.copy.introImage || INTRO_IMAGE;
  HOW_TO_PLAY_ITEMS = Array.isArray(c.copy.introHowToPlay)
    ? c.copy.introHowToPlay
    : HOW_TO_PLAY_ITEMS;

  GAME_SECS = c.gameplay.sessionCapSeconds || GAME_SECS;
  TARGET_PORTFOLIO = c.scoring.targetPortfolio || TARGET_PORTFOLIO;

  const mv = c.scoring.moleValues || {};
  const mw = c.scoring.moleWeights || {};
  (Object.keys(ITEM_DEFS) as ItemType[]).forEach(t => {
    if (mv[t] !== undefined) ITEM_DEFS[t].value = mv[t];
    if (mw[t] !== undefined) ITEM_DEFS[t].weight = mw[t];
  });

  SCORING_BG_IMAGE = c.ui.scoringBgImage ?? '';

  COMPANY_NAME = c.contact.companyName || COMPANY_NAME;
  CALL_NOW_NUMBER = c.contact.callNowNumber || CALL_NOW_NUMBER;
  BOOK_SLOT_TIMES = c.contact.bookSlotTimeSlots || [];
  PRIVACY_POLICY_URL = c.contact.privacyPolicyUrl || '';
  DISCLAIMER = String(c.contact.disclaimer || '').replace('{COMPANY}', COMPANY_NAME.toUpperCase());
  TC_TEXT = String(c.contact.tcText || '').replace('{COMPANY}', COMPANY_NAME);

  SCORING_TAGLINE = c.copy.scoringTagline || '';
  SCORING_CTA_LINE = c.copy.scoringCtaLine || '';
  THANK_YOU_BODY = c.copy.thankYouBody || '';
}
