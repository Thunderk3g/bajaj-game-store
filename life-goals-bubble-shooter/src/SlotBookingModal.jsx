// SlotBookingModal.jsx — books a callback slot via updateLeadNew (or submitToLMS fallback).
// Restyled to match the stackibility-stack .ls-card form pattern.
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

function CalendarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="rgba(255,255,255,0.18)" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
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

  const firstError = errors.name || errors.mobile || errors.date || errors.time || errors.terms || '';

  return (
    <div className="modal-overlay">
      <div className="ls-card" style={{ position: 'relative' }}>
        <div className="ls-card-icon" aria-hidden="true">
          <CalendarIcon />
        </div>
        <div className="ls-card-title">Book a slot</div>
        <div className="ls-card-sub">A Bajaj Life advisor will call you back</div>

        <form className="ls-form" onSubmit={onSubmit} noValidate>
          <label className="ls-field">
            <span className="ls-field-label">Full Name</span>
            <input
              className="ls-input"
              type="text"
              placeholder="e.g. Priya Sharma"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
            />
          </label>

          <label className="ls-field">
            <span className="ls-field-label">Mobile Number</span>
            <div className="ls-mobile-row">
              <span className="ls-mobile-prefix">+91</span>
              <input
                className="ls-input ls-input-mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                autoComplete="tel-national"
                value={mobile}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobile(v);
                  if (errors.mobile) setErrors({ ...errors, mobile: '' });
                }}
              />
            </div>
          </label>

          <label className="ls-field">
            <span className="ls-field-label">Date</span>
            <input
              className="ls-input"
              type="date"
              min={minDate}
              max={maxDate}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors({ ...errors, date: '' });
              }}
            />
          </label>

          <div className="ls-field">
            <span className="ls-field-label">Time Slot</span>
            <div className="ls-slot-grid">
              {TIME_SLOTS.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`ls-slot-pill${time === t ? ' selected' : ''}`}
                  onClick={() => {
                    setTime(t);
                    if (errors.time) setErrors({ ...errors, time: '' });
                  }}
                >
                  {t.replace(' - ', ' – ')}
                </button>
              ))}
            </div>
          </div>

          <label className="ls-tc">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked);
                if (errors.terms) setErrors({ ...errors, terms: '' });
              }}
            />
            <span>
              I agree to the{' '}
              <a
                href="https://www.bajajallianzlife.com/privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#FFD37A', textDecoration: 'underline' }}
              >
                T&amp;C and Privacy Policy
              </a>
              .
            </span>
          </label>

          <div className="ls-error">{firstError}</div>

          <button
            type="submit"
            className="ls-btn ls-btn-primary ls-form-cta"
            disabled={submitting}
          >
            {submitting ? 'Confirming…' : 'Confirm booking'}
          </button>

          <button type="button" className="ls-text-btn" onClick={onSkip}>
            Maybe later
          </button>
        </form>
      </div>
    </div>
  );
}
