import React from 'react';
import { BLUE, PRIVACY_POLICY_URL, TC_TEXT } from '../constants';

interface Props {
  onClose: () => void;
}

const TCModal: React.FC<Props> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.78)' }}>
    <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-extrabold text-base" style={{ color: BLUE }}>Terms &amp; Conditions</h3>
        <button onClick={onClose} className="text-gray-400 text-2xl leading-none btn-press">&times;</button>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-3">{TC_TEXT}</p>
      <a href={PRIVACY_POLICY_URL || '#'} target="_blank" rel="noreferrer" className="text-xs underline font-semibold" style={{ color: BLUE }}>
        BALIC Privacy Policy
      </a>
      <button onClick={onClose} className="w-full py-3 rounded-full font-extrabold text-white text-sm btn-press mt-5" style={{ background: BLUE }}>
        I AGREE
      </button>
    </div>
  </div>
);

export default TCModal;
