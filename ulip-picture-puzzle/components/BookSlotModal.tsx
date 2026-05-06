import React, { useState } from 'react';
import { BLUE, BOOK_SLOT_TIMES } from '../constants';
import TCModal from './TCModal';

interface Props {
  name: string;
  mobile: string;
  onClose: () => void;
  onBook: () => void;
}

const BookSlotModal: React.FC<Props> = ({ name, mobile, onClose, onBook }) => {
  const [bookingName, setBookingName] = useState(name);
  const [bookingMobile, setBookingMobile] = useState(mobile);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showTc, setShowTc] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toISOString().split('T')[0];

  function submit(): void {
    const nextErrors: Record<string, string> = {};
    if (!bookingName.trim()) nextErrors.name = 'Required';
    if (!/^[6-9]\d{9}$/.test(bookingMobile)) nextErrors.mobile = 'Invalid mobile';
    if (!date) nextErrors.date = 'Required';
    if (!time) nextErrors.time = 'Required';
    if (!agreed) nextErrors.agreed = 'Please accept T&C';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onBook();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.72)' }}>
      {showTc && <TCModal onClose={() => setShowTc(false)} />}
      <div className="bg-white w-full max-w-sm rounded-t-[8px] max-h-[92vh] overflow-y-auto pop">
        <div className="px-6 pt-5 pb-7">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-extrabold text-xl" style={{ color: BLUE }}>Book a Slot</h3>
              <p className="text-gray-500 text-xs mt-0.5">Our agent will help you secure your future.</p>
            </div>
            <button onClick={onClose} className="text-gray-300 text-3xl leading-none btn-press">&times;</button>
          </div>

          <div className="mb-3">
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">YOUR NAME</label>
            <input
              type="text"
              value={bookingName}
              onChange={(e) => { setBookingName(e.target.value); setErrors({}); }}
              className="w-full rounded-[8px] px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none"
              style={{ border: `2px solid ${errors.name ? '#EF4444' : '#E2E8F0'}`, background: '#F8FAFF' }}
            />
            {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">MOBILE NUMBER</label>
            <input
              type="tel"
              inputMode="numeric"
              value={bookingMobile}
              onChange={(e) => { setBookingMobile(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors({}); }}
              className="w-full rounded-[8px] px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none"
              style={{ border: `2px solid ${errors.mobile ? '#EF4444' : '#E2E8F0'}`, background: '#F8FAFF' }}
            />
            {errors.mobile && <p className="text-red-500 text-xs mt-0.5">{errors.mobile}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">PREFERRED DATE</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => { setDate(e.target.value); setErrors({}); }}
              className="w-full rounded-[8px] px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none"
              style={{ border: `2px solid ${errors.date ? '#EF4444' : '#E2E8F0'}`, background: '#F8FAFF' }}
            />
            {errors.date && <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">PREFERRED TIME</label>
            <select
              value={time}
              onChange={(e) => { setTime(e.target.value); setErrors({}); }}
              className="w-full rounded-[8px] px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none bg-white"
              style={{ border: `2px solid ${errors.time ? '#EF4444' : '#E2E8F0'}` }}
            >
              <option value="">Select Slot</option>
              {BOOK_SLOT_TIMES.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
            {errors.time && <p className="text-red-500 text-xs mt-0.5">{errors.time}</p>}
          </div>

          <div className="mb-5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <button
                type="button"
                onClick={() => { setAgreed((v) => !v); setErrors({}); }}
                className="w-5 h-5 rounded mt-0.5 flex items-center justify-center flex-shrink-0"
                style={{ background: agreed ? BLUE : 'white', border: `2px solid ${agreed ? BLUE : '#CBD5E1'}` }}
              >
                {agreed && <span className="text-white text-xs font-bold">OK</span>}
              </button>
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree and consent to the{' '}
                <button className="underline font-bold" style={{ color: BLUE }} onClick={(e) => { e.preventDefault(); setShowTc(true); }}>
                  T&amp;C and Privacy Policy
                </button>
              </span>
            </label>
            {errors.agreed && <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>}
          </div>

          <button onClick={submit} className="w-full py-3.5 rounded-full text-white font-extrabold text-sm btn-press" style={{ background: BLUE }}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookSlotModal;
