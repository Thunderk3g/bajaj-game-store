import React, { useState } from 'react';
import { User, Phone, Calendar, ChevronRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import TermsModal from '../modals/TermsModal';

const LeadCaptureScreen: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', mobile: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.mobile && isTermsAccepted) {
            setIsSubmitting(true);
            setTimeout(() => {
                onSubmit(formData);
            }, 800);
        }
    };

    const inputStyle = (name: string): React.CSSProperties => ({
        width: '100%',
        backgroundColor: '#F9FAFB',
        border: `2px solid ${focused === name ? '#31CDEC' : '#F1F5F9'}`,
        borderRadius: '16px',
        padding: '14px 16px 14px 48px',
        fontSize: '15px',
        fontWeight: '700',
        color: '#1F2937',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
    });

    const iconStyle = (name: string): React.CSSProperties => ({
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: focused === name ? '#31CDEC' : '#94A3B8',
        transition: 'color 0.2s ease',
        pointerEvents: 'none',
    });

    return (
        <div style={{
            width: '100%',
            height: '100dvh',
            backgroundColor: '#0B1221',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '32px',
                padding: '32px 24px',
                width: '100%',
                maxWidth: '360px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '5px solid #31CDEC',
                position: 'relative',
                animation: 'fadeUp 0.5s ease-out',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: '#0B1221',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.02em',
                        textTransform: 'uppercase'
                    }}>Enter Details</h2>
                    <p style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#94A3B8',
                        margin: 0,
                    }}>To see the results</p>
                </div>

                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}>
                    {/* Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '800', color: '#4B5563', marginLeft: '4px' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={20} style={iconStyle('name')} />
                            <input
                                type="text"
                                required
                                placeholder="Enter your name"
                                value={formData.name}
                                onFocus={() => setFocused('name')}
                                onBlur={() => setFocused(null)}
                                onChange={e => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                style={inputStyle('name')}
                            />
                        </div>
                    </div>

                    {/* Mobile */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '800', color: '#4B5563', marginLeft: '4px' }}>Mobile Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={20} style={iconStyle('mobile')} />
                            <input
                                type="tel"
                                required
                                pattern="[0-9]{10}"
                                maxLength={10}
                                placeholder="10-digit mobile number"
                                value={formData.mobile}
                                onFocus={() => setFocused('mobile')}
                                onBlur={() => setFocused(null)}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                                style={inputStyle('mobile')}
                            />
                        </div>
                    </div>

                    {/* Terms */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                            padding: '4px',
                        }}
                    >
                        <div
                            onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                            style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                border: `2px solid ${isTermsAccepted ? '#31CDEC' : '#E2E8F0'}`,
                                backgroundColor: isTermsAccepted ? '#31CDEC' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                marginTop: '2px',
                                cursor: 'pointer',
                            }}
                        >
                            {isTermsAccepted && <CheckCircle2 size={16} color="white" />}
                        </div>
                        <p style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#64748B',
                            margin: 0,
                            lineHeight: '1.4',
                            textAlign: 'left'
                        }}>
                            I agree and consent to the <span onClick={() => setIsTermsModalOpen(true)} style={{ color: '#31CDEC', textDecoration: 'underline', cursor: 'pointer' }}>T&C and Privacy Policy</span>
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: '100%',
                            backgroundColor: '#31CDEC',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '16px',
                            fontSize: '18px',
                            fontWeight: '900',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(49, 205, 236, 0.3)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: isSubmitting ? 0.7 : 1,
                            marginTop: '8px',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        {isSubmitting ? 'LOADING...' : (
                            <>
                                SEE RESULTS! <ChevronRight size={20} strokeWidth={3} />
                            </>
                        )}
                    </button>
                    {!isTermsAccepted && <p style={{ color: '#EF4444', fontSize: '10px', fontWeight: '800', textAlign: 'center', margin: 0, textTransform: 'uppercase' }}>Please accept terms</p>}
                </form>
            </div>

            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
        </div>
    );
};

export default LeadCaptureScreen;
