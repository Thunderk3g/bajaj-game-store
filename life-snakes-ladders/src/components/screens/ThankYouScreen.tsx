import React from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface ThankYouScreenProps {
    onReplay: () => void;
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
    success: '#059669',
    successLight: '#ECFDF5',
};

const ThankYouScreen: React.FC<ThankYouScreenProps> = ({ onReplay }) => {
    return (
        <div style={{ width: '100%', height: '100%', background: T.bgPage, display: 'flex', flexDirection: 'column', overflow: 'auto', alignItems: 'stretch' }}>
            {/* Blue header */}
            <div style={{ background: `linear-gradient(135deg, ${T.blue} 0%, ${T.blueDark} 100%)`, padding: '32px 24px 60px', color: '#fff', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.75, margin: 0 }}>Bajaj Allianz Life</p>
            </div>

            {/* Card pulled up */}
            <div style={{ margin: '-36px 16px 0', background: T.white, borderRadius: 22, boxShadow: '0 6px 32px rgba(0,102,178,0.12)', border: `1px solid ${T.border}`, padding: '32px 22px', textAlign: 'center' }}>
                {/* Checkmark icon */}
                <div style={{ display: 'inline-flex', width: 96, height: 96, borderRadius: '50%', background: T.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
                    <CheckCircle size={52} color={T.success} />
                </div>

                <h2 style={{ fontSize: 26, fontWeight: 900, color: T.text, margin: '0 0 12px' }}>Thank You!</h2>
                <p style={{ fontSize: 14, color: T.muted, margin: '0 0 28px', lineHeight: 1.65, maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }}>
                    Your family's path to protection has begun. Our expert will connect with you shortly.
                </p>

                {/* Info strip */}
                <div style={{ background: T.blueLight, borderRadius: 14, padding: '16px 18px', marginBottom: 28, textAlign: 'left' }}>
                    <p style={{ fontSize: 12, color: T.blue, fontWeight: 700, margin: '0 0 4px' }}>What happens next?</p>
                    <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
                        <li>Our agent will call within 24 hours</li>
                        <li>Get a personalised term plan quote</li>
                        <li>Zero commitment, 100% advisory</li>
                    </ul>
                </div>

                {/* Play again */}
                <button onClick={onReplay} style={{ width: '100%', padding: '14px 24px', background: 'transparent', color: T.blue, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', border: `2px solid ${T.blue}`, borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <RotateCcw size={16} />
                    Play Again
                </button>
            </div>

            <div style={{ textAlign: 'center', padding: '20px 0 16px', fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.muted, opacity: 0.4 }}>
                Bajaj Allianz Life Insurance
            </div>
        </div>
    );
};

export default ThankYouScreen;
