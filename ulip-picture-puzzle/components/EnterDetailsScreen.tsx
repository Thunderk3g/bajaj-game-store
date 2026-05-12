import React, { useState } from 'react';
import { BLUE, GAME_NAME, ORANGE } from '../constants';
import { GameResult, PlayerInfo } from '../types';
import TCModal from './TCModal';
import { submitToLMS } from '../services/api';

interface Props {
  onSubmit: (info: PlayerInfo) => void;
  result: GameResult | null;
}

const EnterDetailsScreen: React.FC<Props> = ({ onSubmit, result }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showTc, setShowTc] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(): Promise<void> {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Please enter your name';
    if (!/^[6-9]\d{9}$/.test(mobile)) nextErrors.mobile = 'Enter a valid 10-digit mobile number';
    if (!agreed) nextErrors.agreed = 'Please accept the T&C to continue';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const finalScore = result ? Math.max(0, Math.min(100, result.rawScore)) : 0;
      const apiResult = await submitToLMS({
        name: name.trim(),
        mobile_no: mobile,
        score: finalScore,
        summary_dtls: 'ULIP Picture Puzzle - Post Game Lead',
      });
      if (apiResult.success) {
        const responseData = apiResult.data || apiResult;
        const ln = responseData.leadNo || responseData.LeadNo;
        if (ln) sessionStorage.setItem('ulipPicturePuzzleLeadNo', ln);
      }
    } catch (err) {
      console.error('API submission failed', err);
    } finally {
      onSubmit({ name: name.trim(), mobile });
    }
  }

  return (
    <div className="screen-scroll" style={{ background: 'linear-gradient(180deg, #05265f 0%, #06162f 100%)' }}>
      {showTc && <TCModal onClose={() => setShowTc(false)} />}
      <div className="min-h-screen px-6 py-8 flex flex-col justify-center">
        <div className="text-center mb-5">
          <div className="text-sm font-extrabold tracking-widest text-white mb-3">PUZZLE DONE</div>
          <h2 className="text-white text-2xl font-extrabold">Puzzle Complete!</h2>
          <p className="text-sm mt-1" style={{ color: '#b8d3ff' }}>
            Share your details to unlock your<br />
            <span className="font-bold text-white">{GAME_NAME} Score</span>
          </p>
        </div>

        <div className="bg-white rounded-[8px] p-5 shadow-2xl">
          <div className="mb-4">
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">YOUR NAME</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({});
              }}
              placeholder="Full Name"
              className="w-full rounded-[8px] px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none"
              style={{ border: `2px solid ${errors.name ? '#EF4444' : '#D8E0EE'}`, background: errors.name ? '#FFF5F5' : '#F8FAFF' }}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">MOBILE NUMBER</label>
            <input
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                setErrors({});
              }}
              placeholder="10-digit mobile number"
              className="w-full rounded-[8px] px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none"
              style={{ border: `2px solid ${errors.mobile ? '#EF4444' : '#D8E0EE'}`, background: errors.mobile ? '#FFF5F5' : '#F8FAFF' }}
            />
            {errors.mobile && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.mobile}</p>}
          </div>

          <div className="mb-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => {
                  setAgreed((v) => !v);
                  setErrors({});
                }}
                className="w-5 h-5 rounded mt-0.5 flex items-center justify-center flex-shrink-0"
                style={{ background: agreed ? BLUE : 'white', border: `2px solid ${agreed ? BLUE : '#CBD5E1'}` }}
              >
                {agreed && <span className="text-white text-xs font-bold">OK</span>}
              </button>
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree and consent to the{' '}
                <button className="font-bold underline" style={{ color: BLUE }} onClick={(e) => { e.preventDefault(); setShowTc(true); }}>
                  T&amp;C and Privacy Policy
                </button>
              </span>
            </label>
            {errors.agreed && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.agreed}</p>}
          </div>

          <button onClick={submit} className="w-full py-4 rounded-full text-white font-extrabold text-base btn-press" style={{ background: `linear-gradient(90deg, ${BLUE}, ${ORANGE})` }}>
            SEE RESULTS!
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterDetailsScreen;
