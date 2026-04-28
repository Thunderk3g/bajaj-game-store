// SlotBookingModal.jsx — books a callback slot via updateLeadNew (or submitToLMS fallback).
import React, { useMemo, useState } from 'react';
import { submitToLMS, updateLeadNew, LEAD_NO_KEY } from './api.js';

const TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];

function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function SlotBookingModal({ initialName, initialMobile, score, onConfirmed, onSkip }) {
  const [name, setName] = useState(initialName || sessionStorage.getItem('lastSubmittedName') || '');
  const [mobile, setMobile] = useState(initialMobile || sessionStorage.getItem('lastSubmittedPhone') || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [terms, setTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { minDate, maxDate } = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const max = new Date();
    max.setDate(max.getDate() + 14);
    return { minDate: formatLocalDate(tomorrow), maxDate: formatLocalDate(max) };
  }, []);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    else if (!/^[A-Za-z\s]+$/.test(name.trim())) errs.name = 'Letters only';
    if (!mobile) errs.mobile = 'Mobile is required';
    else if (!/^[6-9]\d{9}$/.test(mobile)) errs.mobile = 'Invalid mobile';
    if (!date) errs.date = 'Pick a date';
    if (!time) errs.time = 'Pick a slot';
    if (!terms) errs.terms = 'Please agree to T&C';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const leadNo = sessionStorage.getItem(LEAD_NO_KEY);
      const remarks = `Life Goals Bubble Shooter Slot Booking | Score: ${score ?? 0}`;
      if (leadNo) {
        await updateLeadNew(leadNo, { name: name.trim(), mobile, date, time, remarks });
      } else {
        // Fallback: post a fresh lead with appointment hints in summary.
        await submitToLMS({
          name: name.trim(),
          mobile,
          score,
          summaryDtls: `${remarks} | ${date} ${time}`,
        });
      }
      onConfirmed({ name: name.trim(), mobile, date, time });
    } catch (err) {
      console.error(err);
      onConfirmed({ name: name.trim(), mobile, date, time, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onSkip} aria-label="Close">×</button>
        <div className="modal-title">Book a slot</div>
        <div className="modal-subtitle">A Bajaj Life advisor will call you back</div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="field-label" htmlFor="sb-name">Your Name</label>
            <input
              id="sb-name"
              className={`field-input ${errors.name ? 'error' : ''}`}
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: '' }); }}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div>
            <label className="field-label" htmlFor="sb-mobile">Mobile</label>
            <input
              id="sb-mobile"
              className={`field-input ${errors.mobile ? 'error' : ''}`}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              value={mobile}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                setMobile(v);
                if (errors.mobile) setErrors({ ...errors, mobile: '' });
              }}
            />
            {errors.mobile && <div className="field-error">{errors.mobile}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="field-label" htmlFor="sb-date">Date</label>
              <input
                id="sb-date"
                className={`field-input ${errors.date ? 'error' : ''}`}
                type="date"
                min={minDate}
                max={maxDate}
                value={date}
                onChange={(e) => { setDate(e.target.value); if (errors.date) setErrors({ ...errors, date: '' }); }}
              />
              {errors.date && <div className="field-error">{errors.date}</div>}
            </div>
            <div>
              <label className="field-label" htmlFor="sb-time">Time</label>
              <select
                id="sb-time"
                className={`field-input ${errors.time ? 'error' : ''}`}
                value={time}
                onChange={(e) => { setTime(e.target.value); if (errors.time) setErrors({ ...errors, time: '' }); }}
              >
                <option value="">Select</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.time && <div className="field-error">{errors.time}</div>}
            </div>
          </div>

          <div className="checkbox-row">
            <div
              className={`checkbox-box ${terms ? 'checked' : ''}`}
              onClick={() => { setTerms(!terms); if (errors.terms) setErrors({ ...errors, terms: '' }); }}
              role="checkbox"
              aria-checked={terms}
              tabIndex={0}
            />
            <p className="checkbox-text">
              I agree to the{' '}
              <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer">
                T&C and Privacy Policy
              </a>
            </p>
          </div>
          {errors.terms && <div className="field-error" style={{ marginLeft: 28 }}>{errors.terms}</div>}

          <button type="submit" className="modal-cta" disabled={submitting}>
            {submitting ? <><span className="spinner" />Confirming…</> : 'Confirm booking'}
          </button>
          <button type="button" className="modal-secondary" onClick={onSkip}>
            Maybe later
          </button>
        </form>
      </div>
    </div>
  );
}
