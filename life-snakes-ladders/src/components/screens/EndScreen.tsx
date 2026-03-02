import { Trophy, Shield, AlertTriangle, Share2 } from 'lucide-react';

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
        <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(to bottom, #192b5e 0%, #11204a 100%)',
            display: 'flex', flexDirection: 'column',
            overflowX: 'hidden', overflowY: 'auto',
            alignItems: 'center', padding: '24px 20px 40px',
            color: T.white, position: 'relative'
        }}>
            {/* Top Right Share Icon */}
            <button style={{
                position: 'absolute', top: 20, right: 20,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.white, cursor: 'pointer', zIndex: 10
            }}>
                <Share2 size={16} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24, marginTop: 8 }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#FF7B00', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                    Bajaj Allianz Life
                </p>
                <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                    "{hasShield ? 'You Finished Strong — Because You Planned.' : 'You Made It on Luck Alone.'}"
                </h1>
            </div>

            {/* Circular Graphic (resembling the score ring) */}
            <div style={{
                width: 140, height: 140,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                border: '8px solid rgba(255,123,0,0.15)',
                borderRightColor: '#FF7B00', // Creating a ring effect
                borderBottomColor: '#FF7B00',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px', position: 'relative',
                transform: 'rotate(-45deg)', // Rotate the ring so the orange is on bottom right
            }}>
                <div style={{ transform: 'rotate(45deg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {hasShield ? (
                        <Trophy size={54} color={T.white} />
                    ) : (
                        <AlertTriangle size={54} color="#FF7B00" />
                    )}
                </div>
            </div>

            {/* Stat strip (dark translucent boxes) */}
            <div style={{ display: 'flex', gap: 12, width: '100%', marginBottom: 28, maxWidth: 400 }}>
                {[
                    { label: 'Protection', value: hasShield ? 'Active ✅' : 'None ❌' },
                    { label: 'Journey', value: 'Complete' },
                ].map(s => (
                    <div key={s.label} style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        padding: '16px 10px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: 18, fontWeight: 900, color: T.white, margin: '0 0 4px' }}>{s.value}</p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Message Paragraph */}
            <p style={{ fontSize: 14, color: T.white, margin: '0 0 24px', lineHeight: 1.5, textAlign: 'center', maxWidth: 400, fontWeight: 600 }}>
                {hasShield
                    ? "You can't avoid life's snakes. But with the right protection, they won't define your family's future."
                    : "In real life, you don't get unlimited retries. Most families fall behind because they lack protection."}
            </p>

            {/* Buttons Area */}
            <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* New Share Button replacing original CTA */}
                <button onClick={onCTA} style={{
                    width: '100%', padding: '15px 24px',
                    background: 'linear-gradient(135deg, #FF6600 0%, #E65C00 100%)',
                    color: '#fff', fontSize: 16, fontWeight: 800,
                    borderRadius: '999px', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(255,102,0,0.3)',
                }}>
                    Share
                </button>

                {/* Subtext */}
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', margin: '4px 0 8px', lineHeight: 1.5 }}>
                    Real protection is better than luck. Get your term plan today.
                    <br />Connect with our relationship manager now!
                </p>

                {/* Call Now Button */}
                <button style={{
                    width: '100%', padding: '15px 24px',
                    background: '#b8c2d1', // silver/light gray
                    color: '#1A2340', fontSize: 16, fontWeight: 800,
                    borderRadius: '999px', border: 'none', cursor: 'pointer',
                }}>
                    Call Now
                </button>

                {/* Book a Slot Button */}
                <button style={{
                    width: '100%', padding: '15px 24px',
                    background: '#1942b3', // dark blue
                    color: '#fff', fontSize: 15, fontWeight: 800,
                    borderRadius: '999px', border: 'none', cursor: 'pointer',
                }}>
                    Book a Slot
                </button>

                {/* Play Again text link */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <button style={{
                        background: 'none', border: 'none', color: '#fff',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        textDecoration: 'none'
                    }}>
                        Play Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EndScreen;
