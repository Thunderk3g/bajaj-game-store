import React from 'react';
import { BLUE } from '../constants';

interface Props {
  onClose: () => void;
}

const TCModal: React.FC<Props> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.78)' }}
  >
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto pop">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-extrabold text-base" style={{ color: BLUE }}>Terms &amp; Conditions</h3>
        <button onClick={onClose} className="text-gray-400 text-2xl leading-none btn-press">&times;</button>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed mb-5">
        I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made
        available by me on the website with a specific request to call back. I further declare
        that, irrespective of my contact number being registered on National Customer Preference
        Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or
        WhatsApp sent in response to my request shall not be construed as an Unsolicited
        Commercial Communication even though the contact number may be registered on DNC.
        I agree and consent to the{' '}
        <a href="#" className="underline font-semibold" style={{ color: BLUE }}>Privacy Policy</a>.
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
