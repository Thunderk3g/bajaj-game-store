import React, { useState } from 'react';
import { PlayerInfo } from '../types';
import { BLUE } from '../constants';
import TCModal from './TCModal';

interface Props {
  onSubmit: (info: PlayerInfo) => void;
}

const EnterDetailsScreen: React.FC<Props> = ({ onSubmit }) => {
  const [name,   setName]   = useState('');
  const [mobile, setMobile] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showTC, setShowTC] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())                  e.name   = 'Please enter your name';
    if (!/^[6-9]\d{9}$/.test(mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!agreed)                       e.agreed = 'Please accept the T&C to continue';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit({ name: name.trim(), mobile });
  }

  return (
    <div className="screen-scroll" style={{ background: 'linear-gradient(170deg, #0d0024, #1a0040)' }}>
      {showTC && <TCModal onClose={() => setShowTC(false)} />}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center px-6 pt-8 pb-10 min-h-screen">

        <div className="text-center mb-6 pop">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="text-white text-2xl font-extrabold">Game Complete!</h2>
          <p className="text-sm mt-1" style={{ color: '#d8b4fe' }}>
            Share your details to unlock your<br />
            <span className="font-bold text-white">Health Shield Score</span>
          </p>
        </div>

        <div className="w-full bg-white rounded-3xl p-6 shadow-2xl pop">

          <div className="mb-4">
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
              YOUR NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors({}); }}
              placeholder="Full Name"
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none transition-colors"
              style={{ border: `2px solid ${errors.name ? '#EF4444' : '#E2E8F0'}`, background: errors.name ? '#FFF5F5' : '#F8FAFF' }}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
              MOBILE NUMBER
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={e => { setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors({}); }}
              placeholder="10-digit mobile number"
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none transition-colors"
              style={{ border: `2px solid ${errors.mobile ? '#EF4444' : '#E2E8F0'}`, background: errors.mobile ? '#FFF5F5' : '#F8FAFF' }}
            />
            {errors.mobile && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.mobile}</p>}
          </div>

          <div className="mb-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 flex-shrink-0">
                <input type="checkbox" className="sr-only" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErrors({}); }} />
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                  style={{ background: agreed ? BLUE : 'white', border: `2px solid ${agreed ? BLUE : '#CBD5E1'}` }}
                  onClick={() => { setAgreed(a => !a); setErrors({}); }}
                >
                  {agreed && <span className="text-white text-xs font-bold">✓</span>}
                </div>
              </div>
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree and consent to the{' '}
                <button className="font-bold underline btn-press" style={{ color: BLUE }}
                  onClick={e => { e.preventDefault(); setShowTC(true); }}>
                  T&amp;C and Privacy Policy
                </button>
              </span>
            </label>
            {errors.agreed && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.agreed}</p>}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-base tracking-wide btn-press"
            style={{ background: BLUE, boxShadow: `0 4px 16px rgba(0,61,166,0.4)` }}
          >
            SEE RESULTS! 🎯
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterDetailsScreen;
