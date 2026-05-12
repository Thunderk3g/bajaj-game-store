import React, { useState } from 'react';
import { PlayerInfo, GameResult } from '../types';
import TCModal from './TCModal';
import { submitToLMS } from '../services/api';
import { TOTAL_BRICKS, COVERAGE_WEIGHT, LIVES_BONUS_MAX, MAX_LIVES } from '../constants';

const CYAN = '#22d3ee';
const CYAN_DARK = '#0891b2';

interface Props {
  onSubmit: (info: PlayerInfo) => void;
  result: GameResult | null;
}

const EnterDetailsScreen: React.FC<Props> = ({ onSubmit, result }) => {
  const [name,   setName]   = useState('');
  const [mobile, setMobile] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [showTC, setShowTC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())                  e.name   = 'Please enter your name';
    if (!/^[6-9]\d{9}$/.test(mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!agreed)                       e.agreed = 'Please accept the T&C to continue';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setIsSubmitting(true);
    try {
      let finalScore = 0;
      if (result) {
        const coverage = Math.round((result.bricksCleared / TOTAL_BRICKS) * 100);
        const livesBonus = Math.round((result.livesRemaining / MAX_LIVES) * LIVES_BONUS_MAX);
        finalScore = Math.min(100, Math.round(coverage * COVERAGE_WEIGHT + livesBonus));
      }

      const apiResult = await submitToLMS({
        name: name.trim(),
        mobile_no: mobile,
        score: finalScore,
        summary_dtls: 'Health Shield - Post Game Lead',
      });

      if (apiResult.success) {
        const responseData = apiResult.data || apiResult;
        const ln = responseData.leadNo || responseData.LeadNo;
        if (ln) sessionStorage.setItem('healthShieldLeadNo', ln);
      }
    } catch (err) {
      console.error('API submission failed', err);
    } finally {
      setIsSubmitting(false);
      onSubmit({ name: name.trim(), mobile });
    }
  }

  return (
    <div
      className="screen-scroll flex min-h-full items-center justify-center px-6 py-10"
      style={{ background: '#080d1a' }}
    >
      {showTC && <TCModal onClose={() => setShowTC(false)} />}

      <div
        className="w-full max-w-sm rounded-3xl bg-white p-8"
        style={{ border: `3px solid ${CYAN}` }}
      >
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900 mb-1">
          ENTER DETAILS
        </h2>
        <p className="text-center text-sm text-gray-400 mb-7">To see the results</p>

        <div className="mb-5">
          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">
            YOUR NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setErrors({}); }}
            placeholder="Full Name"
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none"
            style={{
              background: errors.name ? '#FFF5F5' : '#F1F5F9',
              border: `2px solid ${errors.name ? '#EF4444' : 'transparent'}`,
            }}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
        </div>

        <div className="mb-5">
          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">
            MOBILE NUMBER
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={mobile}
            onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors({}); }}
            placeholder="9876543210"
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none"
            style={{
              background: errors.mobile ? '#FFF5F5' : '#F1F5F9',
              border: `2px solid ${errors.mobile ? '#EF4444' : 'transparent'}`,
            }}
          />
          {errors.mobile && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.mobile}</p>}
        </div>

        <div className="mb-7">
          <label className="flex items-start gap-3 cursor-pointer">
            <div
              className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all"
              style={{
                background: agreed ? CYAN : 'white',
                border: `2px solid ${agreed ? CYAN : '#CBD5E1'}`,
              }}
              onClick={() => { setAgreed(a => !a); setErrors({}); }}
            >
              {agreed && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <span className="text-xs text-gray-500 leading-relaxed">
              I agree and consent to the{' '}
              <button
                type="button"
                className="font-bold underline"
                style={{ color: CYAN_DARK, display: 'inline' }}
                onClick={e => { e.preventDefault(); setShowTC(true); }}
              >
                T&amp;C and Privacy Policy
              </button>
            </span>
          </label>
          {errors.agreed && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.agreed}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-full font-extrabold text-white text-base tracking-widest btn-press disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${CYAN_DARK}, ${CYAN})` }}
        >
          {isSubmitting ? 'LOADING...' : 'SEE RESULTS!'}
        </button>
      </div>
    </div>
  );
};

export default EnterDetailsScreen;
