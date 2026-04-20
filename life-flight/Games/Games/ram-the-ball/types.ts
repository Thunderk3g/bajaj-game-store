
export enum GameState {
  INTRO = 'INTRO',
  PLAYING = 'PLAYING',
  SUMMARY = 'SUMMARY',
  FORM = 'FORM',
  SUCCESS = 'SUCCESS'
}

export interface LeadData {
  fullName: string;
  mobile: string;
}

export interface Vector {
  x: number;
  y: number;
}

export interface GameObject {
  id: number;
  pos: Vector;
  vel: Vector;
  radius: number;
  label?: string;
  type: 'RISK' | 'SHIELD';
}
