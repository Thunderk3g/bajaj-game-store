import React, { useMemo, useState } from 'react';
import {
  BLUE,
  CALL_NOW_NUMBER,
  COMPANY_NAME,
  DISCLAIMER,
  GREEN,
  ORANGE,
  PASSING_SCORE,
  SCORING_CTA_LINE,
  SCORING_TAGLINE,
  SCORE_MESSAGES
} from '../constants';
import { GameResult, PlayerInfo } from '../types';
import BookSlotModal from './BookSlotModal';
import { buildShareUrl } from '../utils/crypto';
import { shortenUrl } from '../utils/shortener';

interface Props {
  result: GameResult;
  player: PlayerInfo;
  onBookComplete: () => void;
  onPlayAgain: () => void;
}

function messageFor(score: number) {
  return SCORE_MESSAGES.find((item) => score >= item.minScore) ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1];
}

const ScoringScreen: React.FC<Props> = ({ result, player, onBookComplete, onPlayAgain }) => {
  const [showBook, setShowBook] = useState(false);
  const finalScore = Math.max(0, Math.min(100, result.rawScore));
  const mm = String(Math.floor(result.timeSeconds / 60)).padStart(2, '0');
  const ss = String(result.timeSeconds % 60).padStart(2, '0');
  const scoreMessage = useMemo(() => messageFor(finalScore), [finalScore]);

  const handleShare = async () => {
    try {
      const rawUrl = buildShareUrl() || window.location.href;
      const shareUrl = await shortenUrl(rawUrl) || rawUrl;
      const shareData = {
        title: 'ULIP Picture Puzzle',
        text: `Hi, I scored ${finalScore}... Try it: ${shareUrl}`,
        url: shareUrl,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (err) {
      console.error('[Share] failed', err);
    }
  };

  return (
    <div className="screen-scroll" style={{ background: 'linear-gradient(180deg, #f7faff 0%, #e5efff 46%, #fff 100%)' }}>
      {showBook && (
        <BookSlotModal
          name={player.name}
          mobile={player.mobile}
          result={result}
          onClose={() => setShowBook(false)}
          onBook={() => {
            setShowBook(false);
            onBookComplete();
          }}
        />
      )}

      <div className="px-5 pt-6 pb-28">
        <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: BLUE }}>{COMPANY_NAME}</p>
        <h2 className="text-2xl font-extrabold mt-1" style={{ color: '#071b3c' }}>Hi {player.name}!</h2>
        <p className="text-sm font-semibold mt-1" style={{ color: '#45627f' }}>
          {finalScore >= PASSING_SCORE ? 'You connected protection and growth well.' : 'Your ULIP picture is still taking shape.'}
        </p>

        <div className="flex justify-center my-5">
          <div
            className="rounded-full flex flex-col items-center justify-center shadow-xl"
            style={{ width: 126, height: 126, background: 'white', border: `7px solid ${finalScore >= PASSING_SCORE ? GREEN : ORANGE}` }}
          >
            <span className="text-4xl font-extrabold leading-none" style={{ color: finalScore >= PASSING_SCORE ? GREEN : ORANGE }}>{finalScore}</span>
            <span className="text-sm font-extrabold text-gray-400">/ 100</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            ['TIME TAKEN', `${mm}:${ss}`],
            ['MOVES USED', String(result.movesUsed)],
            ['TILES ALIGNED', `${result.correctTiles}/${result.totalTiles}`]
          ].map(([label, value]) => (
            <div key={label} className="bg-white rounded-[8px] p-3 text-center shadow-sm">
              <p className="text-[9px] font-extrabold uppercase tracking-wide text-gray-400">{label}</p>
              <p className="text-lg font-extrabold mt-1" style={{ color: BLUE }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[8px] p-4 mb-3" style={{ background: '#eefaf0', border: `1.5px solid ${GREEN}55` }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: GREEN }}>Green Zone</p>
          <h3 className="font-extrabold text-base mb-1" style={{ color: '#123d1e' }}>{scoreMessage.title}</h3>
          <p className="text-xs leading-relaxed font-semibold" style={{ color: '#2f6b3e' }}>{scoreMessage.body}</p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {['Life cover', 'Equity/Debt/Balanced', 'Fund value'].map((label) => (
              <div key={label} className="rounded-[8px] bg-white px-2 py-2 text-center text-[10px] font-extrabold" style={{ color: GREEN }}>{label}</div>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] p-4 mb-4" style={{ background: '#fff3ed', border: `1.5px solid ${ORANGE}55` }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: ORANGE }}>ULIP Reminder</p>
          <p className="text-sm font-extrabold mb-1" style={{ color: '#7a2f0e' }}>{SCORING_TAGLINE}</p>
          <p className="text-xs font-bold mb-3" style={{ color: '#9b4a24' }}>{SCORING_CTA_LINE}</p>
          <p className="text-[9px] leading-relaxed font-semibold" style={{ color: '#9d725f' }}>{DISCLAIMER}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            className="py-3.5 rounded-full text-white font-extrabold text-sm btn-press"
            style={{ background: '#25D366' }}
            onClick={handleShare}
          >
            Share
          </button>
          <a href={`tel:${CALL_NOW_NUMBER}`} className="py-3.5 rounded-full text-white text-center font-extrabold text-sm btn-press" style={{ background: ORANGE }}>
            Call Now
          </a>
          <button onClick={() => setShowBook(true)} className="col-span-2 py-3.5 rounded-full text-white font-extrabold text-sm btn-press" style={{ background: BLUE }}>
            Book a Slot
          </button>
          <button onClick={onPlayAgain} className="col-span-2 py-3.5 rounded-full font-extrabold text-sm btn-press" style={{ color: BLUE, border: `2px solid ${BLUE}`, background: 'white' }}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoringScreen;
