import { MoleType } from './types';

export interface MoleDef {
  emoji: string;
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

// ── UI colours ────────────────────────────────────────────────────────────────
export let BLUE   = '#003DA6';
export let ORANGE = '#F26522';
export let GREEN  = '#28A745';

// ── Gameplay ──────────────────────────────────────────────────────────────────
export let GAME_SECS            = 60;
export let SPAWN_INTERVAL_MS    = 1200;
export let MOLE_VISIBLE_MS      = 1500;
export let MIN_SPAWN_MS         = 700;
export let MIN_MOLE_VISIBLE_MS  = 900;
export let RAMP_INTERVAL_SECS   = 15;
export let GRID_SIZE            = 9;

// ── Scoring ───────────────────────────────────────────────────────────────────
export let TARGET_PORTFOLIO = 8000;

export let MOLE_DEFS: Record<MoleType, MoleDef> = {
  equity:   { emoji: '💹', label: 'Equity Fund',   value: 500,  color: '#22C55E', bad: false, weight: 35 },
  debt:     { emoji: '🏦', label: 'Debt Fund',     value: 300,  color: '#3B82F6', bad: false, weight: 30 },
  balanced: { emoji: '⚖️', label: 'Balanced',      value: 400,  color: '#EAB308', bad: false, weight: 20 },
  bullrun:  { emoji: '🚀', label: 'Bull Run!',     value: 1000, color: '#A855F7', bad: false, weight: 5  },
  crash:    { emoji: '💥', label: 'Market Crash',  value: -300, color: '#EF4444', bad: true,  weight: 5  },
  charges:  { emoji: '💸', label: 'Fund Charges',  value: -200, color: '#F97316', bad: true,  weight: 5  },
};

export let SCORE_MESSAGES: ScoreMessage[] = [
  { minScore: 80, title: 'ULIP Maestro!',         body: 'Outstanding! You have a natural instinct for market-linked investments. Your virtual portfolio is thriving — imagine what a real ULIP could do!' },
  { minScore: 60, title: 'Smart Investor!',        body: 'Well played! You know how to spot good investment opportunities and dodge hidden charges. A ULIP plan could accelerate your real wealth journey.' },
  { minScore: 40, title: 'Learning the Markets!',  body: 'Good effort! Markets can be tricky, but every expert started somewhere. A Bajaj Life ULIP advisor can help you navigate the real opportunities.' },
  { minScore: 0,  title: 'Markets Are Complex!',   body: 'Don\'t worry — that\'s exactly why ULIP has professional fund managers working for you. Let our experts turn market opportunities into your wealth.' },
];

// ── Contact ───────────────────────────────────────────────────────────────────
export let CALL_NOW_NUMBER  = '';
export let BOOK_SLOT_TIMES: string[] = [];

// ── Copy ──────────────────────────────────────────────────────────────────────
export let SCORING_TAGLINE  = '';
export let SCORING_CTA_LINE = '';
export let THANK_YOU_BODY   = '';

// ── Config loader ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyConfig(c: Record<string, any>): void {
  BLUE   = c.ui.primaryColor;
  ORANGE = c.ui.accentColor;
  GREEN  = c.ui.successColor;

  GAME_SECS           = c.gameplay.sessionCapSeconds;
  SPAWN_INTERVAL_MS   = c.gameplay.spawnIntervalMs;
  MOLE_VISIBLE_MS     = c.gameplay.moleVisibleMs;
  MIN_SPAWN_MS        = c.gameplay.minSpawnIntervalMs;
  MIN_MOLE_VISIBLE_MS = c.gameplay.minMoleVisibleMs;
  RAMP_INTERVAL_SECS  = c.gameplay.difficultyRampIntervalSeconds;
  GRID_SIZE           = c.gameplay.gridSize;

  TARGET_PORTFOLIO = c.scoring.targetPortfolio;

  const mv = c.scoring.moleValues;
  const mw = c.scoring.moleWeights;
  (Object.keys(MOLE_DEFS) as MoleType[]).forEach(t => {
    if (mv[t] !== undefined) MOLE_DEFS[t].value  = mv[t];
    if (mw[t] !== undefined) MOLE_DEFS[t].weight = mw[t];
  });

  CALL_NOW_NUMBER = c.contact.callNowNumber;
  BOOK_SLOT_TIMES = c.contact.bookSlotTimeSlots;

  SCORING_TAGLINE  = c.copy.scoringTagline;
  SCORING_CTA_LINE = c.copy.scoringCtaLine;
  THANK_YOU_BODY   = c.copy.thankYouBody;
}
