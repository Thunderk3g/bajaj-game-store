// LeadCaptureModal.jsx — collects name + mobile and posts to LMS.
// Restyled to match the stackibility-stack .ls-card form pattern.
import React, { useState } from 'react';
import { submitToLMS, extractLeadNo, LEAD_NO_KEY } from './api.js';

const NAME_RE = /^[A-Za-z\s]+$/;
// Indian mobile pattern (10 digits, starts 6-9) — matches the validation other games use.
const MOBILE_RE = /^[6-9]\d{9}$/;

function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" fill="rgba(255,255,255,0.18)" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function LeadCaptureModal({ score, onSubmitted, onSkip }) {
  const [name, setName] = useState(sessionStorage.getItem('lastSubmittedName') || '');
  const [mobile, setMobile] = useState(sessionStorage.getItem('lastSubmittedPhone') || '');
  const [terms, setTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Please enter your name';
    else if (!NAME_RE.test(name.trim())) errs.name = 'Letters only';
    if (!mobile) errs.mobile = 'Mobile is required';
    else if (!MOBILE_RE.test(mobile)) errs.mobile = 'Enter a valid 10-digit number';
    if (!terms) errs.terms = 'Please agree to T&C';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await submitToLMS({
        name: name.trim(),
        mobile,
        score,
        summaryDtls: 'Life Goals Bubble Shooter Lead',
      });
      const leadNo = extractLeadNo(result);
      if (leadNo) sessionStorage.setItem(LEAD_NO_KEY, leadNo);
      sessionStorage.setItem('lastSubmittedName', name.trim());
      sessionStorage.setItem('lastSubmittedPhone', mobile);
      onSubmitted({ name: name.trim(), mobile, leadNo });
    } catch (err) {
      console.error(err);
      onSubmitted({ name: name.trim(), mobile, leadNo: null });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="ls-card" style={{ position: 'relative' }}>
        <div className="ls-card-icon" aria-hidden="true">
          <ShieldIcon />
        </div>
        <div className="ls-card-title">Enter your details</div>
        <div className="ls-card-sub">to reveal your full results</div>

        <form className="ls-form" onSubmit={onSubmit} noValidate>
          <label className="ls-field">
            <span className="ls-field-label">Full Name</span>
            <input
              className="ls-input"
              type="text"
              autoFocus
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

          <div className="ls-error">
            {errors.name || errors.mobile || errors.terms || ''}
          </div>

          <button
            type="submit"
            className="ls-btn ls-btn-primary ls-form-cta"
            disabled={submitting}
          >
            {submitting ? 'Loading…' : 'See Results'}
          </button>

          {onSkip && (
            <button type="button" className="ls-text-btn" onClick={onSkip}>
              Skip for now
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
