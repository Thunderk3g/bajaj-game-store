import React from 'react';
import { Shield, Zap } from 'lucide-react';

interface ShieldChoiceScreenProps {
    onChoice: (protectedMode: boolean) => void;
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

const ShieldChoiceScreen: React.FC<ShieldChoiceScreenProps> = ({ onChoice }) => {
    return (
        <div style={{ width: '100%', height: '100%', background: T.bgPage, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            {/* Blue Header */}
            <div style={{ background: `linear-gradient(135deg, ${T.blue} 0%, ${T.blueDark} 100%)`, padding: '32px 24px 48px', color: '#fff', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.75, marginBottom: 12 }}>Bajaj Allianz Life</p>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.25 }}>Begin Your<br />Life Journey</h2>
                <p style={{ fontSize: 13, opacity: 0.75, margin: 0, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>Life has milestones and risks. How do you want to start?</p>
            </div>

            {/* Cards stack — pulled up */}
            <div style={{ flex: 1, padding: '0 16px 32px', marginTop: -20, display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Protected card */}
                <div style={{ background: T.white, borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 24px rgba(0,102,178,0.12)', border: `2px solid ${T.blue}`, cursor: 'pointer' }}
                    onClick={() => onChoice(true)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ background: T.blueLight, borderRadius: 14, padding: 14, flexShrink: 0 }}>
                            <Shield size={28} color={T.blue} />
                        </div>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: T.blue, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Recommended</p>
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: '0 0 6px' }}>Start with Term Shield</h3>
                            <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.55 }}>You begin protected. Snakes (life risks) won't send you back. Your family is covered.</p>
                        </div>
                    </div>
                    <button style={{ marginTop: 18, width: '100%', padding: '13px 20px', background: `linear-gradient(135deg, ${T.blue} 0%, #1A56DB 100%)`, color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,102,178,0.30)' }}>
                        YES — I Want Protection
                    </button>
                </div>

                {/* Unprotected card */}
                <div style={{ background: T.white, borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: `1.5px solid ${T.border}`, cursor: 'pointer' }}
                    onClick={() => onChoice(false)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ background: '#FFF3EB', borderRadius: 14, padding: 14, flexShrink: 0 }}>
                            <Zap size={28} color={T.orange} />
                        </div>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: T.orange, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Risk Mode</p>
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: '0 0 6px' }}>Play Without Protection</h3>
                            <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.55 }}>Face life unprotected. Snakes could send you far back — just like in real life.</p>
                        </div>
                    </div>
                    <button style={{ marginTop: 18, width: '100%', padding: '13px 20px', background: 'transparent', color: T.muted, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: `1.5px solid ${T.border}`, borderRadius: 12, cursor: 'pointer' }}>
                        NO — Play Unprotected
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center', paddingBottom: 16, fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.muted, opacity: 0.4 }}>
                Bajaj Allianz Life Insurance
            </div>
        </div>
    );
};

export default ShieldChoiceScreen;
