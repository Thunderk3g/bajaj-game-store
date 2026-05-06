import React, { useState } from 'react';
import { GameResult } from '../types';
import {
  BLUE, ORANGE, GREEN,
  SCORE_MESSAGES, TARGET_PORTFOLIO,
  CALL_NOW_NUMBER,
  SCORING_TAGLINE, SCORING_CTA_LINE, THANK_YOU_BODY,
} from '../constants';
import BookSlotModal from './BookSlotModal';

interface Props {
  result: GameResult;
  playerName: string;
  playerMobile: string;
  onPlayAgain: () => void;
}

const ScoringScreen: React.FC<Props> = ({ result, playerName, playerMobile, onPlayAgain }) => {
  const [showBook, setShowBook] = useState(false);
  const [booked,   setBooked]   = useState(false);

  const { portfolio, molesSeen, molesWhacked, goodWhacks, badWhacks, timeSeconds } = result;
  const finalScore   = Math.min(100, Math.max(0, Math.round((portfolio / TARGET_PORTFOLIO) * 100)));
  const accuracy     = molesSeen > 0 ? Math.round((molesWhacked / molesSeen) * 100) : 0;
  const mm           = String(Math.floor(timeSeconds / 60)).padStart(2, '0');
  const ss           = String(timeSeconds % 60).padStart(2, '0');
  const scoreColor   = finalScore >= 70 ? GREEN : finalScore >= 40 ? ORANGE : '#EF4444';
  const msg          = SCORE_MESSAGES.find(m => finalScore >= m.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];

  if (booked) {
    return (
      <div
        className="screen-scroll flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center"
        style={{ background: BLUE }}
      >
        <div className="text-7xl mb-5 pop">🎉</div>
        <h2 className="text-white text-4xl font-extrabold pop">THANK YOU!</h2>
        <h3 className="font-extrabold text-2xl mt-2 mb-5 pop" style={{ color: ORANGE }}>
          {playerName.toUpperCase()}
        </h3>
        <p className="text-blue-200 text-sm leading-relaxed mb-10 max-w-xs">{THANK_YOU_BODY}</p>
        <button
          onClick={onPlayAgain}
          className="px-12 py-4 rounded-full font-extrabold text-white text-base btn-press"
          style={{ background: ORANGE, boxShadow: '0 6px 24px rgba(242,101,34,0.5)' }}
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="screen-scroll" style={{ background: '#EEF2FF' }}>
      {showBook && (
        <BookSlotModal
          name={playerName}
          mobile={playerMobile}
          onClose={() => setShowBook(false)}
          onBook={() => { setBooked(true); setShowBook(false); }}
        />
      )}

      {/* Header */}
      <div className="px-6 pt-7 pb-14" style={{ background: BLUE }}>
        <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">BAJAJ LIFE INSURANCE</p>
        <h2 className="text-white text-2xl font-extrabold mt-1">Hi {playerName}! 👋</h2>
        <p className="text-blue-200 text-sm mt-0.5">Here's your ULIP Portfolio Report</p>
      </div>

      {/* Score badge */}
      <div className="flex justify-center -mt-10 mb-4">
        <div
          className="bg-white shadow-xl rounded-full flex flex-col items-center justify-center pop"
          style={{ width: 118, height: 118, border: `5px solid ${scoreColor}` }}
        >
          <span className="font-extrabold text-4xl leading-none" style={{ color: scoreColor }}>{finalScore}</span>
          <span className="text-gray-400 text-xs font-bold">/ 100</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2 px-4 mb-4">
        {[
          { label: 'TIME TAKEN',  value: `${mm}:${ss}` },
          { label: 'FUND HITS',   value: goodWhacks     },
          { label: 'PORTFOLIO',   value: `₹${portfolio.toLocaleString('en-IN')}` },
        ].map(s => (
          <div key={s.label} className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-gray-400 text-[8px] font-bold uppercase tracking-wider">{s.label}</p>
            <p className="font-extrabold text-base mt-0.5 leading-tight" style={{ color: BLUE }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Green zone */}
      <div className="mx-4 mb-3 rounded-2xl p-4 shadow-sm" style={{ background: '#ECFDF5', border: '1.5px solid #6EE7B7' }}>
        <p className="text-[10px] font-extrabold text-green-700 uppercase tracking-wider mb-2">📈 Your ULIP Performance</p>
        <p className="text-sm font-bold text-green-800 mb-1">{msg.title}</p>
        <p className="text-xs text-green-700 leading-relaxed mb-3">{msg.body}</p>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Opportunities', val: molesSeen    },
            { label: 'Captured',      val: molesWhacked },
            { label: 'Accuracy',      val: `${accuracy}%` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-2 text-center">
              <p className="font-extrabold text-base" style={{ color: GREEN }}>{s.val}</p>
              <p className="text-green-600 text-[9px] font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-green-700 mb-1">
            <span>Portfolio Growth</span>
            <span>₹{portfolio.toLocaleString('en-IN')} / ₹{TARGET_PORTFOLIO.toLocaleString('en-IN')}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#A7F3D0' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((portfolio / TARGET_PORTFOLIO) * 100))}%`, background: GREEN }}
            />
          </div>
        </div>

        {badWhacks > 0 && (
          <p className="text-green-600 text-[10px] mt-2 font-semibold">
            ⚠️ {badWhacks} bad mole{badWhacks > 1 ? 's' : ''} hit — in a real ULIP, fund charges and market crashes can erode your returns. Stay informed!
          </p>
        )}
      </div>

      {/* Red zone */}
      <div className="mx-4 mb-3 rounded-2xl p-4 shadow-sm" style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA' }}>
        <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider mb-2">💰 Grow Your Real Wealth</p>
        <p className="text-sm font-bold text-orange-800 mb-1">{SCORING_TAGLINE}</p>
        <p className="text-xs text-orange-700 mb-3">{SCORING_CTA_LINE}</p>
        <p className="text-[9px] text-orange-500 leading-relaxed">
          DISCLAIMER: THE RESULTS SHOWN IN THIS GAME ARE INDICATIVE AND BASED SOLELY ON THE
          INFORMATION PROVIDED BY THE PARTICIPANT. THEY ARE INTENDED FOR ENGAGEMENT AND AWARENESS
          PURPOSES ONLY AND DO NOT CONSTITUTE FINANCIAL ADVICE OR A RECOMMENDATION TO PURCHASE ANY
          LIFE INSURANCE PRODUCT. PARTICIPANTS SHOULD SEEK INDEPENDENT PROFESSIONAL ADVICE BEFORE
          MAKING ANY FINANCIAL OR INSURANCE DECISIONS. WHILE DUE CARE HAS BEEN TAKEN IN DESIGNING
          THE GAME, BAJAJ LIFE INSURANCE LTD. ASSUMES NO LIABILITY FOR ITS OUTCOMES.
        </p>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-10 grid grid-cols-2 gap-3 mt-1">
        <button
          className="py-3.5 rounded-2xl font-bold text-sm text-white btn-press"
          style={{ background: '#25D366' }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'ULIP Wealth Whacker Score',
                text: `I grew my virtual ULIP portfolio to ₹${portfolio.toLocaleString('en-IN')} (${finalScore}/100) on ULIP Wealth Whacker by Bajaj Life! Can you beat me?`,
              });
            }
          }}
        >
          📤 Share Score
        </button>
        <a
          href={`tel:${CALL_NOW_NUMBER}`}
          className="py-3.5 rounded-2xl font-bold text-sm text-white text-center flex items-center justify-center btn-press"
          style={{ background: '#EF4444' }}
        >
          📞 Call Now
        </a>
        <button
          onClick={() => setShowBook(true)}
          className="col-span-2 py-3.5 rounded-2xl font-extrabold text-white text-sm btn-press"
          style={{ background: BLUE, boxShadow: `0 4px 16px rgba(0,61,166,0.35)` }}
        >
          📅 Book a Slot with Our Expert
        </button>
        <button
          onClick={onPlayAgain}
          className="col-span-2 py-3.5 rounded-2xl font-bold text-sm btn-press"
          style={{ background: 'white', color: BLUE, border: `2px solid ${BLUE}` }}
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
};

export default ScoringScreen;
