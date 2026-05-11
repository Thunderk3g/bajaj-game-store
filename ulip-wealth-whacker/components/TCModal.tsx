import React from 'react';
import { TC_TEXT, PRIVACY_POLICY_URL } from '../constants';

const CYAN = '#22d3ee';
const CYAN_DARK = '#0891b2';

interface Props {
  onClose: () => void;
}

const TCModal: React.FC<Props> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(8,13,26,0.85)' }}
  >
    <div
      className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto"
      style={{ border: `3px solid ${CYAN}` }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-extrabold text-base" style={{ color: CYAN_DARK }}>Terms &amp; Conditions</h3>
        <button onClick={onClose} className="text-gray-400 text-2xl leading-none btn-press">&times;</button>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-5">
        {TC_TEXT}{' '}
        <a
          href={PRIVACY_POLICY_URL || '#'}
          target={PRIVACY_POLICY_URL ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="underline font-semibold"
          style={{ color: CYAN_DARK }}
        >
          Privacy Policy
        </a>.
      </p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-full font-extrabold text-white text-sm btn-press"
        style={{ background: `linear-gradient(135deg, ${CYAN_DARK}, ${CYAN})` }}
      >
        I AGREE
      </button>
    </div>
  </div>
);

export default TCModal;
