import imgIntro from './src/assets/introImage.png';

export interface ScoreMessage {
  minScore: number;
  title: string;
  body: string;
}

export interface HowToPlayItem {
  icon: string;
  text: string;
}

export let BLUE = '#0A1628';
export let ORANGE = '#FFD700';
export let GREEN = '#00CFFF';

export let INTRO_TITLE = 'Guardian Strike';
export let INTRO_IMAGE: string = imgIntro;
export let INTRO_TITLE_IMAGE = '';
export let HOW_TO_PLAY_ITEMS: HowToPlayItem[] = [
  { icon: 'move', text: 'Drag or use arrow keys to move your Guardian Shield ship.' },
  { icon: 'shoot', text: 'Your ship auto-fires — eliminate all life threats before they reach you.' },
  { icon: 'shield', text: 'Collect golden shield power-ups for temporary full protection.' },
];

export let TOTAL_WAVES = 3;
export let TARGET_PORTFOLIO = 9000;

export let SCORE_MESSAGES: ScoreMessage[] = [
  {
    minScore: 80,
    title: 'Supreme Guardian',
    body: 'You neutralised every threat and protected your family completely. Term life cover works exactly like that — full protection when it matters most.',
  },
  {
    minScore: 60,
    title: 'Skilled Defender',
    body: 'Strong performance. A few threats slipped through, just as financial gaps can. Term cover closes those gaps affordably.',
  },
  {
    minScore: 40,
    title: 'Rising Protector',
    body: 'You faced the threats but took some hits. The right term plan gives your family a safety net even in the toughest times.',
  },
  {
    minScore: 0,
    title: 'Family Needs Shield',
    body: 'Threats overwhelmed your defences this round. Term life insurance is the low-cost, high-coverage shield your family deserves.',
  },
];

export let COMPANY_NAME = 'Bajaj Life Insurance';
export let CALL_NOW_NUMBER = '02261241800';
export let BOOK_SLOT_TIMES: string[] = [];
export let PRIVACY_POLICY_URL = '';
export let DISCLAIMER = '';
export let TC_TEXT = '';

export let SCORING_TAGLINE = 'Low cost, high coverage — pure protection for the people you love.';
export let SCORING_CTA_LINE = 'Talk to our advisor about the right Term plan for your family!';
export let THANK_YOU_BODY = 'Thank you for sharing your details. Our Relationship Manager will reach out to you shortly.';
export let SCORING_BG_IMAGE = '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyConfig(c: Record<string, any>): void {
  if (c.ui) {
    BLUE   = c.ui.primaryColor  || BLUE;
    ORANGE = c.ui.accentColor   || ORANGE;
    GREEN  = c.ui.successColor  || GREEN;
    SCORING_BG_IMAGE = c.ui.scoringBgImage || INTRO_IMAGE;
  }

  if (c.copy) {
    INTRO_TITLE      = c.copy.introTitle    || INTRO_TITLE;
    INTRO_IMAGE      = c.copy.introImage    || INTRO_IMAGE;
    SCORING_TAGLINE  = c.copy.scoringTagline  || SCORING_TAGLINE;
    SCORING_CTA_LINE = c.copy.scoringCtaLine  || SCORING_CTA_LINE;
    THANK_YOU_BODY   = c.copy.thankYouBody    || THANK_YOU_BODY;
  }

  if (c.gameplay) {
    TARGET_PORTFOLIO = c.gameplay.targetPortfolio || TARGET_PORTFOLIO;
    TOTAL_WAVES      = c.gameplay.totalWaves      || TOTAL_WAVES;
  }

  if (c.contact) {
    COMPANY_NAME       = c.contact.companyName       || COMPANY_NAME;
    CALL_NOW_NUMBER    = c.contact.callNowNumber      || CALL_NOW_NUMBER;
    BOOK_SLOT_TIMES    = c.contact.bookSlotTimeSlots  || BOOK_SLOT_TIMES;
    PRIVACY_POLICY_URL = c.contact.privacyPolicyUrl   || '';
    DISCLAIMER         = String(c.contact.disclaimer  || '').replace('{COMPANY}', COMPANY_NAME.toUpperCase());
    TC_TEXT            = String(c.contact.tcText       || '').replace('{COMPANY}', COMPANY_NAME);
  }
}
