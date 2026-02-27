import React from 'react';
import { Shield, Zap, X } from 'lucide-react';

interface ModeSelectionModalProps {
    onClose: () => void;
    onSelect: (isProtected: boolean) => void;
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
};

const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({ onClose, onSelect }) => {
    return (
        /* Backdrop */
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(10,20,40,0.85)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
            }}
            onClick={onClose}
        >
            {/* Modal Container */}
            <div
                style={{
                    width: '100%', maxWidth: 400,
                    background: T.bgPage,
                    borderRadius: 24,
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    animation: 'zoomIn 0.3s cubic-bezier(0.32,0.72,0,1)',
                    position: 'relative',
                    display: 'flex', flexDirection: 'column',
                    maxHeight: '90vh'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(255,255,255,0.2)', border: 'none',
                        padding: 6, borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', color: '#fff', zIndex: 10
                    }}
                >
                    <X size={18} />
                </button>

                {/* Blue Header */}
                <div style={{ background: `linear-gradient(135deg, ${T.blue} 0%, ${T.blueDark} 100%)`, padding: '36px 24px 40px', color: '#fff', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.75, marginBottom: 12 }}>Bajaj Allianz Life</p>
                    <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.25, letterSpacing: '-0.02em', WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>Begin Your<br />Life Journey</h2>
                    <p style={{ fontSize: 13, opacity: 0.85, margin: 0, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>Life has milestones and risks. How do you want to start?</p>
                </div>

                {/* Cards Container */}
                <div style={{ padding: '0 20px 24px', marginTop: -24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

                    {/* Protected card */}
                    <div style={{ background: T.white, borderRadius: 20, padding: '24px 20px', boxShadow: '0 6px 24px rgba(0,102,178,0.15)', border: `2px solid ${T.blue}`, cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
                        onClick={() => onSelect(true)}
                        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                        onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ background: T.blueLight, borderRadius: 14, padding: 14, flexShrink: 0 }}>
                                <Shield size={28} color={T.blue} />
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 800, color: T.blue, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Recommended</p>
                                <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Start with Term Shield</h3>
                                <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5 }}>You begin protected. Snakes (life risks) won't send you back. Your family is covered.</p>
                            </div>
                        </div>
                        <button style={{ marginTop: 20, width: '100%', padding: '14px 20px', background: `linear-gradient(135deg, ${T.blue} 0%, #1A56DB 100%)`, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,102,178,0.30)', pointerEvents: 'none' }}>
                            YES — I Want Protection
                        </button>
                    </div>

                    {/* Unprotected card */}
                    <div style={{ background: T.white, borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: `1.5px solid ${T.border}`, cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => onSelect(false)}
                        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                        onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ background: '#FFF3EB', borderRadius: 14, padding: 14, flexShrink: 0 }}>
                                <Zap size={28} color={T.orange} />
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 800, color: T.orange, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Risk Mode</p>
                                <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Play Without Protection</h3>
                                <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5 }}>Face life unprotected. Snakes could send you far back — just like in real life.</p>
                            </div>
                        </div>
                        <button style={{ marginTop: 20, width: '100%', padding: '14px 20px', background: 'transparent', color: T.muted, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', pointerEvents: 'none' }}>
                            NO — Play Unprotected
                        </button>
                    </div>

                </div>

                <div style={{ textAlign: 'center', paddingBottom: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.muted, opacity: 0.5 }}>
                    Bajaj Allianz Life Insurance
                </div>
            </div>

            <style>{`
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
        </div>
    );
};

export default ModeSelectionModal;
