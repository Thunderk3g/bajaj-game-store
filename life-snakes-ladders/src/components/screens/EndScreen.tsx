import React from 'react';
import { Trophy, Shield, AlertTriangle } from 'lucide-react';

interface EndScreenProps {
    hasShield: boolean;
    onCTA: () => void;
}

const T = {
    blue: '#0066B2',
    blueDark: '#004A80',
    blueLight: '#E8F1FB',
    orange: '#FF6600',
    orangeLight: '#FFF3EB',
    white: '#FFFFFF',
    text: '#1A2340',
    muted: '#64748B',
    border: '#DCE5F5',
    bgPage: '#F0F4FF',
    gold: '#F59E0B',
    goldLight: '#FFFBEB',
};

const EndScreen: React.FC<EndScreenProps> = ({ hasShield, onCTA }) => {
    return (
        <div style={{ width: '100%', height: '100%', background: T.bgPage, display: 'flex', flexDirection: 'column', overflow: 'auto', alignItems: 'stretch' }}>
            {/* Header band */}
            <div style={{ background: `linear-gradient(135deg, ${T.blue} 0%, ${T.blueDark} 100%)`, padding: '28px 24px 56px', color: '#fff', textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>Bajaj Allianz Life</p>
                <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, margin: 0 }}>You've reached Square 100!</p>
            </div>

            {/* Main card — pulled over the header */}
            <div style={{ margin: '-32px 16px 0', background: T.white, borderRadius: 22, boxShadow: '0 6px 32px rgba(0,102,178,0.12)', border: `1px solid ${T.border}`, padding: '28px 22px', textAlign: 'center' }}>
                {/* Icon */}
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 88, height: 88, borderRadius: '50%', marginBottom: 18, background: hasShield ? T.goldLight : T.orangeLight, position: 'relative' }}>
                    {hasShield ? (
                        <>
                            <Trophy size={46} color={T.gold} />
                            <div style={{ position: 'absolute', bottom: 0, right: 0, background: T.blueLight, borderRadius: '50%', padding: 4, border: `2px solid ${T.white}` }}>
                                <Shield size={18} color={T.blue} />
                            </div>
                        </>
                    ) : (
                        <AlertTriangle size={46} color={T.orange} />
                    )}
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 12px', lineHeight: 1.3 }}>
                    {hasShield ? 'You Finished Strong — Because You Planned.' : 'You Made It on Luck Alone.'}
                </h2>
                <p style={{ fontSize: 13, color: T.muted, margin: '0 0 24px', lineHeight: 1.65 }}>
                    {hasShield
                        ? "You can't avoid life's snakes. But with the right protection, they won't define your family's future."
                        : "In real life, you don't get unlimited retries. Most families fall behind because they lack protection."}
                </p>

                {/* Stat strip */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'Protection', value: hasShield ? 'Active ✅' : 'None ❌', accent: hasShield ? '#059669' : T.orange },
                        { label: 'Journey', value: 'Complete', accent: T.blue },
                    ].map(s => (
                        <div key={s.label} style={{ flex: 1, background: T.bgPage, borderRadius: 12, padding: '12px 8px', border: `1px solid ${T.border}` }}>
                            <p style={{ fontSize: 16, fontWeight: 800, color: s.accent, margin: '0 0 2px' }}>{s.value}</p>
                            <p style={{ fontSize: 10, color: T.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <button onClick={onCTA} style={{ width: '100%', padding: '15px 24px', background: `linear-gradient(135deg, ${T.orange} 0%, #FF8533 100%)`, color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,102,0,0.35)' }}>
                    {hasShield ? 'Speak to a Protection Expert' : 'Protect My Family Now'}
                </button>

                <p style={{ fontSize: 11, color: T.muted, marginTop: 14, lineHeight: 1.5 }}>
                    Real protection is better than luck. Get your term plan today.
                </p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px 0 16px', fontSize: 9, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.muted, opacity: 0.4 }}>
                Bajaj Allianz Life Insurance
            </div>
        </div>
    );
};

export default EndScreen;
