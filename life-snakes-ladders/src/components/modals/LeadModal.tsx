import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

interface LeadModalProps {
    onClose: () => void;
    onSubmit: (data: { name: string; mobile: string; preferredTime?: string; preferredDate?: string }) => void;
    isBooking?: boolean;
    defaultValues?: { name?: string; mobile?: string };
}

const T = {
    blue: '#0066B2',
    blueSoft: '#84B1D6',
    white: '#FFFFFF',
    textBold: '#1E293B',
    text: '#334155',
    muted: '#64748B',
    border: '#E2E8F0',
    error: '#DC2626',
    errorLight: '#FEF2F2',
};

const LeadModal: React.FC<LeadModalProps> = ({ onClose, onSubmit, isBooking = false, defaultValues }) => {
    const [name, setName] = useState(defaultValues?.name || '');
    const [mobile, setMobile] = useState(defaultValues?.mobile || '');
    const [preferredTime, setPreferredTime] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const validate = () => {
        const e: typeof errors = {};
        if (!name.trim()) e.name = 'Name is required';
        if (mobile.length !== 10) e.mobile = 'Enter a valid 10-digit number';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        // Small delay for UX feel
        await new Promise(r => setTimeout(r, 400));
        setIsSubmitting(false);
        onSubmit({ name: name.trim(), mobile, preferredTime: isBooking ? preferredTime : undefined, preferredDate: isBooking ? preferredDate : undefined });
    };

    const inputStyle = (hasError?: boolean): React.CSSProperties => ({
        width: '100%',
        padding: '14px 16px',
        background: hasError ? T.errorLight : T.white,
        border: `1.5px solid ${hasError ? T.error : T.border}`,
        borderRadius: 8,
        fontSize: 15,
        color: T.text,
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    });

    return (
        /* Backdrop */
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(10,20,40,0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
            }}
            onClick={onClose}
        >
            {/* Modal sheet */}
            <div
                style={{
                    width: '100%', maxWidth: 360,
                    background: T.white,
                    borderRadius: 16,
                    border: `4px solid ${T.blue}`,
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    animation: 'zoomIn 0.3s cubic-bezier(0.32,0.72,0,1)',
                    position: 'relative',
                    padding: '32px 24px 24px',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'transparent', border: 'none',
                        padding: 4, cursor: 'pointer', display: 'flex',
                        color: '#94A3B8'
                    }}
                >
                    <X size={20} />
                </button>

                {/* Avatar Icon */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <div style={{
                        width: 72, height: 72,
                        background: T.blue,
                        borderRadius: '50%',
                        border: '4px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    }}>
                        👋
                    </div>
                </div>

                {/* Header Text */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 26, fontWeight: 900, color: T.blue, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                        {isBooking ? 'Book a Slot' : 'Welcome!'}
                    </h2>
                    <p style={{ fontSize: 16, color: T.muted, margin: 0, fontWeight: 500 }}>
                        {isBooking ? 'Select a time for our advisor to connect with you.' : 'Enter your details to start.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 800, color: T.textBold, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Your Name
                        </label>
                        <div>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                style={inputStyle(!!errors.name)}
                                onChange={e => {
                                    const v = e.target.value;
                                    if (/^[A-Za-z\s]*$/.test(v)) { setName(v); if (errors.name) setErrors({ ...errors, name: '' }); }
                                }}
                            />
                        </div>
                        {errors.name && <p style={{ fontSize: 12, color: T.error, margin: 0 }}>{errors.name}</p>}
                    </div>

                    {/* Mobile */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 800, color: T.textBold, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Mobile Number
                        </label>
                        <div>
                            <input
                                type="tel"
                                placeholder="9876543210"
                                value={mobile}
                                maxLength={10}
                                style={inputStyle(!!errors.mobile)}
                                onChange={e => {
                                    const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    if (v === '' || /^[6-9]/.test(v)) { setMobile(v); if (errors.mobile) setErrors({ ...errors, mobile: '' }); }
                                }}
                            />
                        </div>
                        {errors.mobile && <p style={{ fontSize: 12, color: T.error, margin: 0 }}>{errors.mobile}</p>}
                    </div>

                    {/* Preferred Date (Booking mode only) */}
                    {isBooking && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 800, color: T.textBold, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Preferred Date
                            </label>
                            <div>
                                <input
                                    type="date"
                                    value={preferredDate}
                                    style={inputStyle(false)}
                                    // Set min date to today
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setPreferredDate(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Preferred Time (Booking mode only) */}
                    {isBooking && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 800, color: T.textBold, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Preferred Time Slot
                            </label>
                            <div>
                                <select
                                    value={preferredTime}
                                    onChange={(e) => setPreferredTime(e.target.value)}
                                    style={inputStyle(false)}
                                >
                                    <option value="">Select Slot</option>
                                    <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                                    <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                                    <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                                    <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                                    <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                                    <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                                    <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Terms */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div
                                onClick={() => {
                                    setTermsAccepted(!termsAccepted);
                                    setErrors(prev => ({ ...prev, terms: undefined }));
                                }}
                                style={{
                                    width: 20, height: 20, borderRadius: 4,
                                    background: termsAccepted ? T.blue : T.white,
                                    border: `2px solid ${termsAccepted ? T.blue : T.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0, marginTop: 2,
                                    transition: 'all 0.15s'
                                }}
                            >
                                {termsAccepted && <Check size={14} color="#fff" strokeWidth={3} />}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.5, textAlign: 'left' }}>
                                I agree to the{' '}
                                <button type="button" onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: T.blue, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                                    Terms & Conditions
                                </button>{' '}
                                and allow Bajaj Life Insurance to contact me even if registered on DND.
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!name.trim() || mobile.length !== 10 || !termsAccepted || isSubmitting || (isBooking && (!preferredTime || !preferredDate))}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: (!name.trim() || mobile.length !== 10 || !termsAccepted || isSubmitting || (isBooking && (!preferredTime || !preferredDate))) ? T.blueSoft : T.blue,
                            opacity: (!name.trim() || mobile.length !== 10 || !termsAccepted || isSubmitting || (isBooking && (!preferredTime || !preferredDate))) ? 0.6 : 1,
                            color: '#fff',
                            fontFamily: 'inherit',
                            fontSize: 16,
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: 12,
                            cursor: (!name.trim() || mobile.length !== 10 || !termsAccepted || (isBooking && (!preferredTime || !preferredDate))) ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'background 0.2s, opacity 0.2s',
                            marginTop: 8,
                        }}
                    >
                        {isSubmitting
                            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><span>{isBooking ? 'Submitting...' : 'Starting…'}</span></>
                            : (isBooking ? "Confirm Booking" : "Let's Go!")}
                    </button>
                </form>
            </div>

            {/* Terms mini-overlay */}
            {showTerms && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                    onClick={() => setShowTerms(false)}>
                    <div style={{ background: T.white, borderRadius: 20, padding: 24, maxWidth: 360, width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${T.border}`, paddingBottom: 12, marginBottom: 16 }}>
                            <h3 style={{ fontSize: 20, fontWeight: 900, color: T.blue, margin: 0, textTransform: 'uppercase' }}>Terms & Conditions</h3>
                            <button onClick={() => setShowTerms(false)} style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', color: T.muted }}><X size={24} /></button>
                        </div>
                        <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5, overflowY: 'auto', fontWeight: 700 }}>
                            <p style={{ marginBottom: 12 }}>I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.</p>
                            <p>Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" style={{ color: T.blue, textDecoration: 'underline' }}>BALIC Privacy Policy</a>.</p>
                        </div>
                        <button onClick={() => { setShowTerms(false); setTermsAccepted(true); }} style={{ marginTop: 24, width: '100%', padding: '14px', background: T.blue, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>I Agree</button>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default LeadModal;
