import React from 'react';
import { BLUE, COMPANY_NAME, PRIVACY_POLICY_URL, TC_TEXT } from '../constants';

interface Props {
  onClose: () => void;
}

const TCModal: React.FC<Props> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.72)' }}>
    <div className="bg-white rounded-[8px] p-5 w-full max-w-sm max-h-[82vh] overflow-y-auto pop">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-lg" style={{ color: BLUE }}>Terms &amp; Conditions</h3>
        <button onClick={onClose} className="text-gray-400 text-3xl leading-none btn-press">&times;</button>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-4">
        {TC_TEXT}{' '}
        I agree and consent to the{' '}
        <a
          href={PRIVACY_POLICY_URL || '#'}
          target={PRIVACY_POLICY_URL ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="font-bold underline"
          style={{ color: BLUE }}
        >
          Privacy Policy
        </a>{' '}
        of {COMPANY_NAME}.
      </p>
      <button onClick={onClose} className="w-full py-3 rounded-full text-white font-extrabold btn-press" style={{ background: BLUE }}>
        I AGREE
      </button>
    </div>
  </div>
);

export default TCModal;
