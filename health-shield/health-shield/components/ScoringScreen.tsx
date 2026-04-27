import React, { useState } from 'react';
import { GameResult } from '../types';
import { BLUE, ORANGE, GREEN, MAX_LIVES, TOTAL_BRICKS } from '../constants';
import BookSlotModal from './BookSlotModal';

interface Props {
  result: GameResult;
  playerName: string;
  playerMobile: string;
  leadNo: string | null;
  onPlayAgain: () => void;
}

function getMessage(score: number) {
  if (score >= 80) return { title: 'Outstanding Shield!',  body: 'You deflected every health crisis like a pro. You clearly understand the value of comprehensive coverage.' };
  if (score >= 60) return { title: 'Strong Coverage!',     body: 'Great effort! You blocked most health shocks. A few coverage gaps remain — a critical illness plan can fill them.' };
  if (score >= 40) return { title: 'Partial Shield',       body: 'Some risks broke through your defences. Consider a critical illness plan to strengthen your protection.' };
  return               { title: 'Shield Weakened',         body: 'Health risks broke through. This is a reminder — without coverage, one illness can derail your financial goals.' };
}

const ScoringScreen: React.FC<Props> = ({ result, playerName, playerMobile, leadNo, onPlayAgain }) => {
  const [showBook, setShowBook] = useState(false);
  const [booked,   setBooked]   = useState(false);

  const { bricksCleared, ballsLost, livesRemaining, timeSeconds } = result;

  const coverage   = Math.round((bricksCleared / TOTAL_BRICKS) * 100);
  const livesBonus = Math.round((livesRemaining / MAX_LIVES) * 20);
  const finalScore = Math.min(100, Math.round(coverage * 0.8 + livesBonus));

  const mm = String(Math.floor(timeSeconds / 60)).padStart(2, '0');
  const ss = String(timeSeconds % 60).padStart(2, '0');

  const scoreColor = finalScore >= 70 ? GREEN : finalScore >= 40 ? ORANGE : '#EF4444';
  const { title: greenTitle, body: greenBody } = getMessage(finalScore);

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
        <p className="text-blue-200 text-sm leading-relaxed mb-10 max-w-xs">
          Thank you for sharing your details. Our Relationship Manager will reach out to you shortly.
        </p>
        <button
          onClick={onPlayAgain}
          className="px-12 py-4 rounded-full font-extrabold text-white text-base btn-press"
          style={{ background: ORANGE, boxShadow: '0 6px 24px rgba(242,101,34,0.5)' }}
        >
          PLAY AGAIN
        </button>
        <p className="text-blue-300 text-xs font-semibold mt-10 opacity-60 tracking-widest">BAJAJ LIFE INSURANCE</p>
      </div>
    );
  }

  return (
    <div className="screen-scroll" style={{ background: '#EEF2FF' }}>
      {showBook && (
        <BookSlotModal
          name={playerName}
          mobile={playerMobile}
          leadNo={leadNo}
          onClose={() => setShowBook(false)}
          onBook={() => { setBooked(true); setShowBook(false); }}
        />
      )}

      {/* Header */}
      <div className="px-6 pt-7 pb-14" style={{ background: BLUE }}>
        <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">BAJAJ LIFE INSURANCE</p>
        <h2 className="text-white text-2xl font-extrabold mt-1">Hi {playerName}! 👋</h2>
        <p className="text-blue-200 text-sm mt-0.5">Here's your Health Shield Report</p>
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
      <div className="flex gap-2.5 px-4 mb-4">
        {[
          { label: 'TIME TAKEN', value: `${mm}:${ss}` },
          { label: 'BALLS LOST', value: ballsLost       },
          { label: 'COVERAGE',   value: `${coverage}%`  },
        ].map(s => (
          <div key={s.label} className="flex-1 bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">{s.label}</p>
            <p className="font-extrabold text-xl mt-0.5" style={{ color: BLUE }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Green zone */}
      <div className="mx-4 mb-3 rounded-2xl p-4 shadow-sm" style={{ background: '#ECFDF5', border: '1.5px solid #6EE7B7' }}>
        <p className="text-[10px] font-extrabold text-green-700 uppercase tracking-wider mb-2">✅ Your Health Shield</p>
        <p className="text-sm font-bold text-green-800 mb-1">{greenTitle}</p>
        <p className="text-xs text-green-700 leading-relaxed mb-3">{greenBody}</p>
        <div>
          <div className="flex justify-between text-xs font-bold text-green-700 mb-1">
            <span>Shield Strength</span><span>{coverage}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#A7F3D0' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${coverage}%`, background: GREEN }}></div>
          </div>
        </div>
      </div>

      {/* Red zone */}
      <div className="mx-4 mb-3 rounded-2xl p-4 shadow-sm" style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA' }}>
        <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider mb-2">🛡️ Protect What Matters</p>
        <p className="text-sm font-bold text-orange-800 mb-1">
          Protecting your health is even more powerful with a critical illness plan.
        </p>
        <p className="text-xs text-orange-700 mb-3">Connect with our relationship manager now!</p>
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
              navigator.share({ title: 'Health Shield Score', text: `I scored ${finalScore}/100 on Health Shield by Bajaj Life! Can you beat me?` });
            }
          }}
        >
          📤 Share Score
        </button>
        <a
          href="tel:+918005525252"
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
