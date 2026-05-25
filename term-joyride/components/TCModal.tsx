import React from 'react';
import { TC_TEXT, PRIVACY_POLICY_URL } from '../constants';

const BLUE = '#003DA6';

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
      style={{ border: `3px solid ${BLUE}` }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-extrabold text-base" style={{ color: BLUE }}>Terms &amp; Conditions</h3>
        <button onClick={onClose} className="text-gray-400 text-2xl leading-none btn-press">&times;</button>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-5">
        {TC_TEXT || 'I authorize Bajaj Allianz Life Insurance Co. Ltd. to contact me through Call/SMS/Email/WhatsApp in relation to financial planning advice.'}{' '}
        <a
          href={PRIVACY_POLICY_URL || '#'}
          target={PRIVACY_POLICY_URL ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="underline font-semibold"
          style={{ color: BLUE }}
        >
          Privacy Policy
        </a>.
      </p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-full font-extrabold text-white text-sm btn-press"
        style={{ background: BLUE }}
      >
        I AGREE
      </button>
    </div>
  </div>
);

export default TCModal;
