import React, { useState } from 'react';
import { Shield, User, Phone, Calendar, CheckCircle } from 'lucide-react';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
    bgPage: '#F0F4FF',
    bgCard: '#FFFFFF',
    blue: '#0066B2',
    blueDark: '#004A80',
    blueLight: '#E8F1FB',
    orange: '#FF6600',
    orangeLight: '#FFF3EB',
    text: '#1A2340',
    muted: '#64748B',
    border: '#DCE5F5',
    success: '#059669',
};

const FIELD_STYLE: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px 13px 44px',
    background: '#F8FAFF',
    border: `1.5px solid ${T.border}`,
    borderRadius: 12,
    fontSize: 14,
    color: T.text,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};

interface LeadCaptureScreenProps {
    onSubmit: (data: any) => void;
}

const LeadCaptureScreen: React.FC<LeadCaptureScreenProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', mobile: '', age: '', hasTermInsurance: '' });
    const [focused, setFocused] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.mobile && formData.age && formData.hasTermInsurance) {
            onSubmit(formData);
        }
    };

    const fieldStyle = (name: string): React.CSSProperties => ({
        ...FIELD_STYLE,
        borderColor: focused === name ? T.blue : T.border,
        boxShadow: focused === name ? `0 0 0 3px ${T.blueLight}` : 'none',
    });

    const fieldWrap: React.CSSProperties = { position: 'relative', display: 'flex', flexDirection: 'column', gap: 6 };
    const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em' };
    const iconStyle: React.CSSProperties = { position: 'absolute', bottom: 13, left: 14, color: T.blue, opacity: 0.6, pointerEvents: 'none' };

    return (
        <div style={{ width: '100%', height: '100%', background: T.bgPage, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${T.blue} 0%, ${T.blueDark} 100%)`, padding: '28px 24px 32px', color: '#fff', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8, display: 'flex' }}>
                        <Shield size={20} color="#fff" />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8 }}>Bajaj Allianz Life</span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.2 }}>Before You Play,<br />Tell Us About You</h2>
                <p style={{ fontSize: 13, opacity: 0.75, margin: 0, lineHeight: 1.5 }}>We'll personalise your experience and connect you with the right protection plan.</p>
            </div>

            {/* Form Card */}
            <div style={{ flex: 1, padding: '0 16px 24px', marginTop: -16 }}>
                <div style={{ background: T.bgCard, borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 24px rgba(0,102,178,0.10)', border: `1px solid ${T.border}` }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Name */}
                        <div style={fieldWrap}>
                            <label style={label}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={iconStyle} />
                                <input type="text" required placeholder="Enter your full name" value={formData.name}
                                    style={fieldStyle('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                        </div>

                        {/* Mobile */}
                        <div style={fieldWrap}>
                            <label style={label}>Mobile Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={16} style={iconStyle} />
                                <input type="tel" required pattern="[0-9]{10,}" placeholder="10-digit mobile number" value={formData.mobile}
                                    style={fieldStyle('mobile')} onFocus={() => setFocused('mobile')} onBlur={() => setFocused(null)}
                                    onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                            </div>
                        </div>

                        {/* Age */}
                        <div style={fieldWrap}>
                            <label style={label}>Age</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={iconStyle} />
                                <input type="number" required min="18" max="65" placeholder="Your age (18–65)" value={formData.age}
                                    style={fieldStyle('age')} onFocus={() => setFocused('age')} onBlur={() => setFocused(null)}
                                    onChange={e => setFormData({ ...formData, age: e.target.value })} />
                            </div>
                        </div>

                        {/* Coverage */}
                        <div style={fieldWrap}>
                            <label style={label}>Do you have Term Insurance?</label>
                            <div style={{ position: 'relative' }}>
                                <CheckCircle size={16} style={iconStyle} />
                                <select required value={formData.hasTermInsurance}
                                    style={{ ...fieldStyle('ins'), appearance: 'none' as any }}
                                    onFocus={() => setFocused('ins')} onBlur={() => setFocused(null)}
                                    onChange={e => setFormData({ ...formData, hasTermInsurance: e.target.value })}>
                                    <option value="" disabled>Select your status</option>
                                    <option value="yes">Yes, I am protected ✅</option>
                                    <option value="no">No, not yet</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" style={{
                            marginTop: 6,
                            width: '100%',
                            padding: '15px 24px',
                            background: `linear-gradient(135deg, ${T.orange} 0%, #FF8533 100%)`,
                            color: '#fff',
                            fontFamily: 'inherit',
                            fontSize: 15,
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            border: 'none',
                            borderRadius: 14,
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(255,102,0,0.35)',
                            transition: 'transform 0.12s',
                        }}>
                            LET'S PLAY →
                        </button>
                    </form>
                </div>

                {/* Trust badges */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 18, paddingBottom: 8 }}>
                    {['🔒 Secure', '✅ IRDAI Registered', '🏆 Trusted'].map(t => (
                        <span key={t} style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>{t}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LeadCaptureScreen;
