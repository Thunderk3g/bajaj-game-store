import React, { useState } from 'react';
import { updateLeadNew, LmsResponse } from '../utils/api';

interface Props {
  leadNo: string | null;
  name: string;
  mobile: string;
  onComplete: () => void;
  onSkip: () => void;
  remarks?: string;
}

const TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];

const minDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const maxDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
};

const SlotBooking: React.FC<Props> = ({
  leadNo,
  name,
  mobile,
  onComplete,
  onSkip,
  remarks,
}) => {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBook = async () => {
    setError('');
    if (!date) {
      setError('Please select a date');
      return;
    }
    if (!timeSlot) {
      setError('Please select a time slot');
      return;
    }

    setSubmitting(true);
    try {
      const result: LmsResponse = leadNo
        ? await updateLeadNew(leadNo, {
            name,
            mobile,
            date,
            time: timeSlot,
            remarks: remarks || 'Slot Booking via Game',
          })
        : { success: true };

      if (result.success) {
        onComplete();
      } else {
        setError(result.error || 'Could not book your slot. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
        <div className="text-center mb-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Book a Callback Slot</h2>
          <p className="text-sm text-slate-500 mt-1">
            Pick a convenient time for our advisor to reach you.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              value={date}
              min={minDate()}
              max={maxDate()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Preferred Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`text-[11px] py-2 rounded-lg border transition-all font-medium ${
                    timeSlot === slot
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-medium bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handleBook}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-60"
          >
            {submitting ? 'Booking…' : 'Confirm Slot'}
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            className="w-full text-slate-500 text-xs font-medium hover:text-slate-700"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotBooking;
