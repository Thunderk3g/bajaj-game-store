import React, { useState } from 'react';
import { GameResult } from '../types';
import {
  BLUE,
  CALL_NOW_NUMBER,
  DISCLAIMER,
  GREEN,
  GREEN_ZONE_TITLE,
  KILL_TARGET,
  ORANGE,
  PLAYER_MAX_HP,
  RED_ZONE_TITLE,
  SCORE_MESSAGES,
  SCORING_CTA_LINE,
  SCORING_HEADER,
  SCORING_TAGLINE,
  SHARE_TEXT,
} from '../constants';
import BookSlotModal from './BookSlotModal';

interface Props {
  result: GameResult;
  playerName: string;
  playerMobile: string;
  onBookComplete: () => void;
  onPlayAgain: () => void;
}

const ScoringScreen: React.FC<Props> = ({ result, playerName, playerMobile, onBookComplete, onPlayAgain }) => {
  const [showBook, setShowBook] = useState(false);

  const { killCount, healthRemaining, timeSurvivedSeconds, rawScore } = result;
  const maxHp = result.maxHealth || PLAYER_MAX_HP;
  const finalScore = Math.min(100, Math.max(0, rawScore));
  const scoreColor = finalScore >= 70 ? GREEN : finalScore >= 40 ? ORANGE : '#EF4444';
  const msg = SCORE_MESSAGES.find((m) => finalScore >= m.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
  const mm = String(Math.floor(timeSurvivedSeconds / 60)).padStart(2, '0');
  const ss = String(timeSurvivedSeconds % 60).padStart(2, '0');
  const killPct = Math.min(100, Math.round((killCount / KILL_TARGET) * 100));
  const healthPct = Math.max(0, Math.round((healthRemaining / maxHp) * 100));

  function handleShare() {
    const text = SHARE_TEXT.replace('{score}', String(finalScore));
    if (navigator.share) {
      navigator.share({ title: 'Debt Defender Score', text });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }

  return (
    <div className="screen-scroll" style={{ background: '#EEF2FF' }}>
      {showBook && (
        <BookSlotModal
          name={playerName}
          mobile={playerMobile}
          onClose={() => setShowBook(false)}
          onBook={() => {
            setShowBook(false);
            onBookComplete();
          }}
        />
      )}

      <div className="px-6 pt-7 pb-14" style={{ background: 'linear-gradient(135deg, #003DA6, #172554)' }}>
        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.2em]">Bajaj Life Insurance</p>
        <h2 className="text-white text-2xl font-extrabold mt-1">Hi {playerName}!</h2>
        <p className="text-blue-100 text-sm mt-0.5">{SCORING_HEADER}</p>
      </div>

      <div className="flex justify-center -mt-10 mb-4">
        <div className="bg-white shadow-xl rounded-full flex flex-col items-center justify-center" style={{ width: 118, height: 118, border: `5px solid ${scoreColor}` }}>
          <span className="font-extrabold text-4xl leading-none" style={{ color: scoreColor }}>{finalScore}</span>
          <span className="text-gray-400 text-xs font-bold">/ 100</span>
        </div>
      </div>

      <div className="flex gap-2 px-4 mb-4">
        {[
          { label: 'TIME TAKEN', value: `${mm}:${ss}` },
          { label: 'THREATS DOWN', value: killCount },
          { label: 'HEALTH LEFT', value: `${healthRemaining}/${maxHp}` },
        ].map((s) => (
          <div key={s.label} className="flex-1 bg-white rounded-lg p-3 text-center shadow-sm">
            <p className="text-gray-400 text-[8px] font-bold uppercase tracking-wider">{s.label}</p>
            <p className="font-extrabold text-sm mt-0.5 leading-tight" style={{ color: BLUE }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mx-4 mb-3 rounded-lg p-4 shadow-sm" style={{ background: '#ECFDF5', border: '1.5px solid #6EE7B7' }}>
        <p className="text-[10px] font-extrabold text-green-700 uppercase tracking-wider mb-2">{GREEN_ZONE_TITLE}</p>
        <p className="text-sm font-bold text-green-800 mb-1">{msg.title}</p>
        <p className="text-xs text-green-700 leading-relaxed mb-3">{msg.body}</p>

        <div className="mb-3">
          <div className="flex justify-between text-xs font-bold text-green-700 mb-1">
            <span>Threats Neutralised</span>
            <span>{killCount} / {KILL_TARGET}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#A7F3D0' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${killPct}%`, background: GREEN }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-green-700 mb-1">
            <span>Health Remaining</span>
            <span>{healthPct}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#A7F3D0' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${healthPct}%`, background: healthRemaining > 2 ? GREEN : healthRemaining > 1 ? ORANGE : '#EF4444' }} />
          </div>
        </div>
      </div>

      <div className="mx-4 mb-3 rounded-lg p-4 shadow-sm" style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA' }}>
        <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider mb-2">{RED_ZONE_TITLE}</p>
        <p className="text-sm font-bold text-orange-800 mb-1">{SCORING_TAGLINE}</p>
        <p className="text-xs text-orange-700 mb-3">{SCORING_CTA_LINE}</p>
        <p className="text-[9px] text-orange-500 leading-relaxed">DISCLAIMER: {DISCLAIMER}</p>
      </div>

      <div className="px-4 pb-10 grid grid-cols-2 gap-3 mt-1">
        <button className="py-3.5 rounded-lg font-bold text-sm text-white btn-press" style={{ background: '#25D366' }} onClick={handleShare}>
          Share
        </button>
        <a href={`tel:${CALL_NOW_NUMBER}`} className="py-3.5 rounded-lg font-bold text-sm text-white text-center flex items-center justify-center btn-press" style={{ background: '#EF4444' }}>
          Call Now
        </a>
        <button onClick={() => setShowBook(true)} className="col-span-2 py-3.5 rounded-lg font-extrabold text-white text-sm btn-press" style={{ background: BLUE, boxShadow: `0 4px 16px rgba(0,61,166,0.35)` }}>
          Book a Slot
        </button>
        <button onClick={onPlayAgain} className="col-span-2 py-3.5 rounded-lg font-bold text-sm btn-press" style={{ background: 'white', color: BLUE, border: `2px solid ${BLUE}` }}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default ScoringScreen;
