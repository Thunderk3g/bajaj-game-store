import React, { useState } from 'react';
import { X, Check, Loader2, Shield, User, Phone } from 'lucide-react';

interface LeadModalProps {
    onClose: () => void;
    onSubmit: (data: { name: string; mobile: string }) => void;
}

const T = {
    blue: '#0066B2',
    blueDark: '#004A80',
    blueLight: '#E8F1FB',
    orange: '#FF6600',
    white: '#FFFFFF',
    text: '#1A2340',
    muted: '#64748B',
    border: '#DCE5F5',
    bgPage: '#F0F4FF',
    error: '#DC2626',
    errorLight: '#FEF2F2',
};

const LeadModal: React.FC<LeadModalProps> = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
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
        onSubmit({ name: name.trim(), mobile });
    };

    const inputStyle = (hasError?: boolean): React.CSSProperties => ({
        width: '100%',
        padding: '12px 14px 12px 42px',
        background: hasError ? T.errorLight : T.bgPage,
        border: `1.5px solid ${hasError ? T.error : T.border}`,
        borderRadius: 12,
        fontSize: 14,
        color: T.text,
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    });

    const iconStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: 13,
        transform: 'translateY(-50%)',
        color: T.blue,
        opacity: 0.55,
        pointerEvents: 'none',
    };

    return (
        /* Backdrop */
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(10,20,40,0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                padding: '0 0 env(safe-area-inset-bottom, 0)',
            }}
            onClick={onClose}
        >
            {/* Modal sheet */}
            <div
                style={{
                    width: '100%', maxWidth: 480,
                    background: T.white,
                    borderRadius: '24px 24px 0 0',
                    overflow: 'hidden',
                    boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
                    animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Blue handle + header */}
                <div style={{ background: `linear-gradient(135deg, ${T.blue} 0%, ${T.blueDark} 100%)`, padding: '20px 20px 24px', color: '#fff', position: 'relative' }}>
                    {/* Drag handle */}
                    <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.35)', borderRadius: 99, margin: '0 auto 16px' }} />

                    {/* Close */}
                    <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', color: '#fff' }}>
                        <X size={18} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8, display: 'flex' }}>
                            <Shield size={20} color="#fff" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>One Quick Step!</h2>
                            <p style={{ fontSize: 12, opacity: 0.8, margin: '3px 0 0' }}>Tell us who's playing — it'll help us personalise your experience.</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div style={{ padding: '22px 20px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={15} style={iconStyle} />
                                <input
                                    type="text"
                                    placeholder="Your full name"
                                    value={name}
                                    autoFocus
                                    style={inputStyle(!!errors.name)}
                                    onChange={e => {
                                        const v = e.target.value;
                                        if (/^[A-Za-z\s]*$/.test(v)) { setName(v); if (errors.name) setErrors({ ...errors, name: '' }); }
                                    }}
                                />
                            </div>
                            {errors.name && <p style={{ fontSize: 11, color: T.error, margin: 0 }}>{errors.name}</p>}
                        </div>

                        {/* Mobile */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Mobile Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={15} style={iconStyle} />
                                <input
                                    type="tel"
                                    placeholder="10-digit mobile"
                                    value={mobile}
                                    maxLength={10}
                                    style={inputStyle(!!errors.mobile)}
                                    onChange={e => {
                                        const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        if (v === '' || /^[6-9]/.test(v)) { setMobile(v); if (errors.mobile) setErrors({ ...errors, mobile: '' }); }
                                    }}
                                />
                            </div>
                            {errors.mobile && <p style={{ fontSize: 11, color: T.error, margin: 0 }}>{errors.mobile}</p>}
                        </div>

                        {/* Terms */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div
                                onClick={() => setTermsAccepted(v => !v)}
                                style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${termsAccepted ? T.blue : T.border}`, background: termsAccepted ? T.blue : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1, transition: 'all 0.15s' }}
                            >
                                {termsAccepted && <Check size={12} color="#fff" strokeWidth={3} />}
                            </div>
                            <p style={{ fontSize: 11, color: T.muted, margin: 0, lineHeight: 1.55 }}>
                                I agree to the{' '}
                                <button type="button" onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: T.blue, fontWeight: 700, fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Terms & Conditions</button>
                                {' '}and acknowledge the Privacy Policy.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!name.trim() || mobile.length !== 10 || !termsAccepted || isSubmitting}
                            style={{
                                width: '100%',
                                padding: '15px 24px',
                                background: (!name.trim() || mobile.length !== 10 || !termsAccepted)
                                    ? '#CBD5E1'
                                    : `linear-gradient(135deg, ${T.orange} 0%, #FF8533 100%)`,
                                color: '#fff',
                                fontFamily: 'inherit',
                                fontSize: 15,
                                fontWeight: 800,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                border: 'none',
                                borderRadius: 14,
                                cursor: (!name.trim() || mobile.length !== 10 || !termsAccepted) ? 'not-allowed' : 'pointer',
                                boxShadow: (!name.trim() || mobile.length !== 10 || !termsAccepted) ? 'none' : '0 4px 20px rgba(255,102,0,0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'background 0.2s, box-shadow 0.2s',
                            }}
                        >
                            {isSubmitting
                                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><span>Starting…</span></>
                                : "LET'S PLAY →"}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 10, color: T.muted, marginTop: 12, opacity: 0.6 }}>
                        🔒 Secure · ✅ IRDAI Registered · Bajaj Allianz Life
                    </p>
                </div>
            </div>

            {/* Terms mini-overlay */}
            {showTerms && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                    onClick={() => setShowTerms(false)}>
                    <div style={{ background: T.white, borderRadius: 20, padding: 24, maxWidth: 340, width: '100%', maxHeight: '70vh', overflow: 'auto', position: 'relative' }}
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowTerms(false)} style={{ position: 'absolute', top: 12, right: 12, background: T.bgPage, border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, marginBottom: 12 }}>Terms & Conditions</h3>
                        <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.7 }}>Bajaj Allianz Life Insurance Co. Ltd. By participating, you consent to being contacted by our advisors regarding insurance products. Your data is protected under our Privacy Policy and applicable laws.</p>
                        <button onClick={() => { setShowTerms(false); setTermsAccepted(true); }} style={{ marginTop: 16, width: '100%', padding: '12px', background: T.blue, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>I Agree</button>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default LeadModal;
