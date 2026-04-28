// LeadCaptureModal.jsx — collects name + mobile and posts to LMS.
import React, { useState } from 'react';
import { submitToLMS, extractLeadNo, LEAD_NO_KEY } from './api.js';

const NAME_RE = /^[A-Za-z\s]+$/;
// Indian mobile pattern (10 digits, starts 6-9) — matches the validation other games use.
const MOBILE_RE = /^[6-9]\d{9}$/;

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
      <div className="modal-card">
        {onSkip && (
          <button className="modal-close" onClick={onSkip} aria-label="Close">×</button>
        )}
        <div className="modal-title">Enter your details</div>
        <div className="modal-subtitle">to reveal your full results</div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field-label" htmlFor="lbs-name">Your Name</label>
            <input
              id="lbs-name"
              className={`field-input ${errors.name ? 'error' : ''}`}
              type="text"
              autoFocus
              placeholder="Full Name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({ ...errors, name: '' }); }}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div>
            <label className="field-label" htmlFor="lbs-mobile">Mobile Number</label>
            <input
              id="lbs-mobile"
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
            {submitting ? <><span className="spinner" />Loading…</> : 'See Results'}
          </button>
          {onSkip && (
            <button type="button" className="modal-secondary" onClick={onSkip}>
              Skip for now
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
