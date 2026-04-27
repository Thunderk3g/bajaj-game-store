export const BLUE   = '#003DA6';
export const ORANGE = '#F26522';
export const GREEN  = '#27AE60';

export const MAX_LIVES = 2;
export const GAME_SECS = 120;
export const COLS      = 3;

export interface BrickDef {
  label: string;
  color: string;
  glow: string;
  hits: number;
  pts: number;
}

export const BRICK_DEFS: BrickDef[] = [
  { label: 'Total\nShield',     color: '#F59E0B', glow: '#FDE68A', hits: 1, pts: 30 },
  { label: 'Cancer\nCare',      color: '#EF4444', glow: '#FCA5A5', hits: 1, pts: 25 },
  { label: 'Critical\nIllness', color: '#F97316', glow: '#FED7AA', hits: 1, pts: 20 },
  { label: 'Surgery',           color: '#8B5CF6', glow: '#C4B5FD', hits: 1, pts: 15 },
  { label: 'Hospital',          color: '#3B82F6', glow: '#BFDBFE', hits: 1, pts: 10 },
  { label: 'Emergency',         color: '#10B981', glow: '#A7F3D0', hits: 1, pts:  5 },
];

export const ROWS         = BRICK_DEFS.length;
export const TOTAL_BRICKS = ROWS * COLS;
