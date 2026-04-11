import React from 'react';

interface ThankYouScreenProps {
    onReplay: () => void;
    playerName?: string;
}

const T = {
    bgPage: '#004282',
    orange: '#fa8a00',
    white: '#FFFFFF',
};

const ThankYouScreen: React.FC<ThankYouScreenProps> = ({ onReplay, playerName }) => {
    return (
        <div style={{
            width: '100%', height: '100dvh',
            background: T.bgPage,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            padding: '24px 20px', color: T.white,
            position: 'relative',
        }}>
            <h1 style={{
                fontSize: 'clamp(32px, 6vh, 42px)',
                fontWeight: 900,
                fontStyle: 'italic',
                color: T.white,
                margin: '0 0 clamp(16px, 3vh, 24px)',
                textAlign: 'center',
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                Thank You {playerName ? playerName.split(' ')[0] : ''}
            </h1>

            <p style={{
                fontSize: 'clamp(15px, 2.8vh, 18px)',
                fontWeight: 800,
                color: T.white,
                margin: '0 0 8px',
                textAlign: 'center'
            }}>
                Your family's path to protection has begun
            </p>

            <p style={{
                fontSize: 'clamp(14px, 2.5vh, 16px)',
                fontWeight: 500,
                color: T.white,
                margin: '0 0 32px',
                textAlign: 'center',
                lineHeight: 1.4,
                opacity: 0.95
            }}>
                Our expert will connect with you shortly
            </p>

            {/* What happens next? */}
            <div style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 'clamp(16px, 3.5vh, 20px) 24px',
                marginBottom: 'clamp(24px, 5vh, 40px)',
                width: '100%',
                maxWidth: 320
            }}>
                <p style={{ fontSize: 'clamp(11px, 2.2vh, 13px)', color: '#FFDE59', fontWeight: 800, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    What happens next?
                </p>
                <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: 'clamp(12px, 2.4vh, 14px)', color: '#fff', lineHeight: 1.8, opacity: 0.9 }}>
                    <li>Our agent will call within 24 hours</li>
                    <li>Get a personalised term plan quote</li>
                    <li>Zero commitment, 100% advisory</li>
                </ul>
            </div>

            <button onClick={onReplay} style={{
                width: '100%', maxWidth: 220,
                padding: 'clamp(14px, 2.8vh, 16px) 24px',
                background: T.orange,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 'clamp(14px, 2.6vh, 16px)',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}>
                Play Again
            </button>

        </div>
    );
};

export default ThankYouScreen;
