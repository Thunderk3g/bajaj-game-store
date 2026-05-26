import imgIntro from './src/assets/introImage.png';

export interface ScoreMessage {
  minScore: number;
  title: string;
  body: string;
}

export let BLUE   = '#1B4FD8';
export let ORANGE = '#F97316';
export let GREEN  = '#22C55E';

export let INTRO_TITLE       = 'Future Sprint';
export let INTRO_IMAGE: string = imgIntro;
export let INTRO_TITLE_IMAGE = '';

export let TARGET_DISTANCE   = 2000;
export let INITIAL_SPEED     = 220;
export let MAX_SPEED         = 430;
export let SPEED_RAMP_SECS   = 45;
export let PLAYER_LIVES      = 3;

export let TARGET_PORTFOLIO  = 100;

export let SCORE_MESSAGES: ScoreMessage[] = [
  { minScore: 80, title: 'Future Guardian',  body: "You protected your child's future at every hurdle! Child plans work exactly like this — steady savings plus life cover so your child's dreams are never interrupted." },
  { minScore: 55, title: 'Steady Planner',   body: "Good progress! A few stumbles, but the journey continued. Starting a child plan early means even small savings compound into life-changing futures." },
  { minScore: 30, title: 'First Steps',      body: "Every journey starts with a single step. A child plan secures your child's future — even if life throws unexpected obstacles your way." },
  { minScore: 0,  title: 'Keep Running',     body: "Don't give up! Just like financial planning, the key is to keep going. A child plan ensures your family stays protected no matter what." },
];

export let COMPANY_NAME      = 'Bajaj Life Insurance';
export let CALL_NOW_NUMBER   = '02261241800';
export let BOOK_SLOT_TIMES: string[] = [];
export let PRIVACY_POLICY_URL = '';
export let DISCLAIMER        = '';
export let TC_TEXT           = '';

export let SCORING_TAGLINE   = "Secure your child's milestones — education, marriage, and beyond.";
export let SCORING_CTA_LINE  = 'Talk to our advisor about the right Child Plan for your family!';
export let THANK_YOU_BODY    = 'Our Relationship Manager will reach out to you shortly.';
export let SCORING_BG_IMAGE  = '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyConfig(c: Record<string, any>): void {
  if (c.ui) {
    BLUE   = c.ui.primaryColor   || BLUE;
    ORANGE = c.ui.accentColor    || ORANGE;
    GREEN  = c.ui.successColor   || GREEN;
    if (c.ui.scoringBgImage) SCORING_BG_IMAGE = c.ui.scoringBgImage;
  }
  if (c.copy) {
    INTRO_TITLE      = c.copy.introTitle      || INTRO_TITLE;
    INTRO_IMAGE      = c.copy.introImage      || INTRO_IMAGE;
    SCORING_TAGLINE  = c.copy.scoringTagline  || SCORING_TAGLINE;
    SCORING_CTA_LINE = c.copy.scoringCtaLine  || SCORING_CTA_LINE;
    THANK_YOU_BODY   = c.copy.thankYouBody    || THANK_YOU_BODY;
  }
  if (c.gameplay) {
    TARGET_DISTANCE = c.gameplay.targetDistance || TARGET_DISTANCE;
    INITIAL_SPEED   = c.gameplay.initialSpeed   || INITIAL_SPEED;
    MAX_SPEED       = c.gameplay.maxSpeed       || MAX_SPEED;
    SPEED_RAMP_SECS = c.gameplay.speedRampSecs  || SPEED_RAMP_SECS;
    PLAYER_LIVES    = c.gameplay.lives          || PLAYER_LIVES;
  }
  if (c.contact) {
    COMPANY_NAME       = c.contact.companyName       || COMPANY_NAME;
    CALL_NOW_NUMBER    = c.contact.callNowNumber      || CALL_NOW_NUMBER;
    BOOK_SLOT_TIMES    = c.contact.bookSlotTimeSlots  || BOOK_SLOT_TIMES;
    PRIVACY_POLICY_URL = c.contact.privacyPolicyUrl   || PRIVACY_POLICY_URL;
    DISCLAIMER = String(c.contact.disclaimer || '').replace('{COMPANY}', COMPANY_NAME.toUpperCase());
    TC_TEXT    = String(c.contact.tcText     || '').replace('{COMPANY}', COMPANY_NAME);
  }
}
