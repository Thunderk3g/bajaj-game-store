import React, { useState } from 'react';
import { buildShareUrl } from '../../utils/crypto';
import { shortenUrl } from '../../utils/shortener';
import { Trophy, Shield, AlertTriangle, Share2, X } from 'lucide-react';
import LeadModal from '../modals/LeadModal';

const gameThumbnail = './assets/s&l intro-bg.png';
interface EndScreenProps {
    hasShield: boolean;
    playerName?: string;
    playerMobile?: string;
    onCTA: () => void;
    onPlayAgain?: () => void;
    onBookingSubmit?: (data: any) => void;
    stats?: { snakesLanded: string[]; snakesAvoided: string[]; laddersClimbed: string[]; };
    totalShieldsUsed?: number;
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

const EndScreen: React.FC<EndScreenProps> = ({ hasShield, playerName, playerMobile, onCTA, onPlayAgain, onBookingSubmit, stats, totalShieldsUsed = 0 }) => {
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    const handleShare = async () => {
        const rawUrl = buildShareUrl() || ((typeof window !== 'undefined')
            ? new URL((import.meta as any).env.BASE_URL || './', window.location.href).href
            : '/');

        const shareUrl = await shortenUrl(rawUrl);

        const senderName = (typeof playerName !== 'undefined' ? playerName : '') || '';
        const signature = senderName ? `\n\nBest Regards,\n${senderName}` : '';
        const shareText = `Hi,\nI used ${Math.round(totalShieldsUsed)} shields to avoid snakes in this life Snakes & Ladders challenge.\nIt really shows how protection helps in life's ups and downs — try it here: ${shareUrl}${signature}`.trim();

        const shareData = {
            title: 'Life Snakes and Ladders',
            text: shareText,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                const sharePayload: any = {
                    title: shareData.title,
                    text: shareData.text
                };
                try {
                    const res = await fetch(gameThumbnail);
                    const blob = await res.blob();
                    const file = new File([blob], 'game-thumbnail.png', { type: blob.type });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        sharePayload.files = [file];
                    }
                } catch (e) {
                    // Share without image if fetch fails
                }
                await navigator.share(sharePayload);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback
            try {
                await navigator.clipboard.writeText(shareData.url);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '100dvh', /* Changed to 100dvh */
            background: 'linear-gradient(to bottom, #192b5e 0%, #11204a 100%)',
            display: 'flex', flexDirection: 'column',
            overflowX: 'hidden', overflowY: 'auto',
            alignItems: 'center', padding: 'clamp(16px, 3vh, 24px) 20px clamp(24px, 5vh, 40px)',
            color: T.white, position: 'relative'
        }}>
            {/* Top Right Share Icon */}
            <button onClick={handleShare} style={{
                position: 'absolute', top: 'max(16px, env(safe-area-inset-top))', right: 20,
                width: 'clamp(32px, 5vh, 36px)', height: 'clamp(32px, 5vh, 36px)', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.white, cursor: 'pointer', zIndex: 10
            }}>
                <Share2 size={16} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(12px, 3vh, 24px)', marginTop: 'clamp(4px, 1vh, 8px)' }}>
                <p style={{ fontSize: 'clamp(14px, 2.5vh, 16px)', fontWeight: 900, color: '#FF7B00', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                    Hi {playerName || 'Username'}
                </p>
                <h1 style={{ fontSize: 'clamp(18px, 3.5vh, 22px)', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                    {hasShield ? 'You Finished Strong — Because You Were Protected' : 'You Made It, But Luck Won\'t Always Help'}
                </h1>
            </div>

            {/* Icon Graphic */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto clamp(16px, 4vh, 28px)'
            }}>
                {hasShield ? (
                    <Trophy size={64} color={T.white} style={{ width: 'clamp(48px, 8vh, 64px)', height: 'clamp(48px, 8vh, 64px)' }} />
                ) : (
                    <AlertTriangle size={64} color="#FF7B00" style={{ width: 'clamp(48px, 8vh, 64px)', height: 'clamp(48px, 8vh, 64px)' }} />
                )}
            </div>

            {/* Message Paragraph */}
            <p style={{ fontSize: 'clamp(12px, 2.2vh, 14px)', color: T.white, margin: '0 0 clamp(16px, 3.5vh, 24px)', lineHeight: 1.5, textAlign: 'center', maxWidth: 400, fontWeight: 600 }}>
                {hasShield
                    ? "Risks are part of life - Protection keeps your family future secure"
                    : "Luck may save you in a game, but real life needs protection"}
            </p>

            {/* Stats Button */}
            {stats && (
                <button
                    onClick={() => setIsStatsOpen(true)}
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        padding: 'clamp(12px, 2.5vh, 16px)',
                        marginBottom: 'clamp(16px, 3vh, 24px)',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: T.white,
                        fontSize: 'clamp(13px, 2.5vh, 15px)',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    <span>View Your Game Stats</span>
                    <span>📊</span>
                </button>
            )}

            {/* Stats Modal */}
            {isStatsOpen && stats && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: 400,
                        background: '#1a2342', // Match board dark theme
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '24px',
                        position: 'relative',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <button
                            onClick={() => setIsStatsOpen(false)}
                            style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '50%',
                                padding: '8px',
                                cursor: 'pointer',
                                color: T.white
                            }}
                        >
                            <X size={20} />
                        </button>

                        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 20, textAlign: 'center' }}>Game Recap</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Snakes Avoided */}
                            <div style={{ background: 'rgba(56, 189, 248, 0.08)', borderRadius: 12, borderLeft: '4px solid #38BDF8', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: stats.snakesAvoided.length > 0 ? 12 : 0 }}>
                                    <span style={{ color: '#E0F2FE', fontSize: 16, fontWeight: 700 }}>🛡️ Snakes Avoided</span>
                                    <span style={{ color: '#bae6fd', fontSize: 20, fontWeight: 800 }}>{stats.snakesAvoided.length}</span>
                                </div>
                                {stats.snakesAvoided.length > 0 && (
                                    <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'disc' }}>
                                        {stats.snakesAvoided.map((name, i) => (
                                            <li key={i} style={{ color: '#bae6fd', fontSize: 13, lineHeight: 1.6, fontWeight: 500 }}>{name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Snakes Bitten */}
                            <div style={{ background: 'rgba(239, 68, 68, 0.08)', borderRadius: 12, borderLeft: '4px solid #EF4444', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: stats.snakesLanded.length > 0 ? 12 : 0 }}>
                                    <span style={{ color: '#FEE2E2', fontSize: 16, fontWeight: 700 }}>🐍 Snakes Bitten</span>
                                    <span style={{ color: '#fca5a5', fontSize: 20, fontWeight: 800 }}>{stats.snakesLanded.length}</span>
                                </div>
                                {stats.snakesLanded.length > 0 && (
                                    <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'disc' }}>
                                        {stats.snakesLanded.map((name, i) => (
                                            <li key={i} style={{ color: '#fca5a5', fontSize: 13, lineHeight: 1.6, fontWeight: 500 }}>{name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Ladders Climbed */}
                            <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderRadius: 12, borderLeft: '4px solid #F59E0B', padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: stats.laddersClimbed.length > 0 ? 12 : 0 }}>
                                    <span style={{ color: '#FEF3C7', fontSize: 16, fontWeight: 700 }}>🪜 Ladders Climbed</span>
                                    <span style={{ color: '#fde68a', fontSize: 20, fontWeight: 800 }}>{stats.laddersClimbed.length}</span>
                                </div>
                                {stats.laddersClimbed.length > 0 && (
                                    <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'disc' }}>
                                        {stats.laddersClimbed.map((name, i) => (
                                            <li key={i} style={{ color: '#fde68a', fontSize: 13, lineHeight: 1.6, fontWeight: 500 }}>{name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsStatsOpen(false)}
                            style={{
                                width: '100%',
                                marginTop: 24,
                                padding: '14px',
                                background: 'linear-gradient(to right, #0066B2, #1A56DB)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontWeight: 800,
                                cursor: 'pointer'
                            }}
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            )}

            {/* Buttons Area */}
            <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 2vh, 12px)' }}>
                {/* New Share Button replacing original CTA */}
                <button onClick={handleShare} style={{
                    width: '50%', maxWidth: '280px', margin: '0 auto', padding: 'clamp(12px, 2.2vh, 15px) 24px',
                    background: 'linear-gradient(135deg, #FF6600 0%, #E65C00 100%)',
                    color: '#fff', fontSize: 'clamp(14px, 2.5vh, 16px)', fontWeight: 800,
                    borderRadius: '999px', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(255,102,0,0.3)',
                }}>
                    Share
                </button>

                {/* Subtext */}
                <p style={{ fontSize: 'clamp(13px, 2.4vh, 15px)', color: T.white, textAlign: 'center', margin: '4px 0 8px', lineHeight: 1.5, fontWeight: 600 }}>
                    {hasShield
                        ? "Just like in the game, the right protection can shield your family from life's uncertainties"
                        : "Don't leave your family's future to luck - secure it with the right life cover"}
                </p>

                {/* Call Now Button */}
                <button onClick={() => window.location.href = 'tel:18001234567'} style={{
                    width: '100%', padding: 'clamp(12px, 2.5vh, 15px) 24px',
                    background: '#22c55e', // green
                    color: '#ffffff', fontSize: 'clamp(14px, 2.5vh, 16px)', fontWeight: 800,
                    borderRadius: '999px', border: 'none', cursor: 'pointer',
                }}>
                    Call Now
                </button>

                {/* Book a Slot Button */}
                <button onClick={() => setShowBookingModal(true)} style={{
                    width: '100%', padding: 'clamp(12px, 2.5vh, 15px) 24px',
                    background: '#1942b3', // dark blue
                    color: '#fff', fontSize: 'clamp(13px, 2.5vh, 15px)', fontWeight: 800,
                    borderRadius: '999px', border: 'none', cursor: 'pointer',
                }}>
                    Book a Slot
                </button>

                {/* Play Again text link */}
                <div style={{ textAlign: 'center', marginTop: 'clamp(12px, 3vh, 24px)' }}>
                    <button onClick={onPlayAgain} style={{
                        background: 'none', border: 'none', color: '#fff',
                        fontSize: 'clamp(12px, 2.2vh, 14px)', fontWeight: 700, cursor: 'pointer',
                        textDecoration: 'none'
                    }}>
                        Play Again
                    </button>
                </div>

                {/* Disclaimer */}
                <div style={{ width: '100%', padding: '0 8px', opacity: 0.4, marginTop: 'clamp(8px, 2vh, 16px)' }}>
                    <p style={{ fontSize: 'clamp(7px, 1.2vh, 8px)', color: '#fff', textAlign: 'center', fontWeight: 700, maxWidth: 380, margin: '0 auto', lineHeight: 1.4, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                        <span style={{ opacity: 0.6, textDecoration: 'underline', marginRight: 4 }}>Disclaimer:</span> The results shown in this game are indicative and based solely on the information provided by the participant. They are intended for engagement and awareness purposes only and do not constitute financial advice or a recommendation to purchase any life insurance product. Participants should seek independent professional advice before making any financial or insurance decisions. While due care has been taken in designing the game, Bajaj Life Insurance Ltd. assumes no liability for its outcomes.
                    </p>
                </div>
            </div>

            {showBookingModal && (
                <LeadModal
                    isBooking
                    defaultValues={{ name: playerName, mobile: playerMobile }}
                    onClose={() => setShowBookingModal(false)}
                    onSubmit={(data) => {
                        console.log("Booking submitted with data:", data);
                        setShowBookingModal(false);
                        if (onBookingSubmit) {
                            onBookingSubmit(data);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default EndScreen;
