/**
 * PlayerCharacter — Premium Knight Character.
 * Fully detailed silhouette based on the requested knight design:
 * Silver armor, royal blue tabard, and a massive protective shield.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';

const PlayerCharacter = memo(function PlayerCharacter({ isDamaged }) {
    return (
        <div className={`relative w-full h-full flex items-center justify-center player-character-container ${isDamaged ? 'animate-pulse opacity-70' : ''}`}>
            {/* Subtle grounding shadow */}
            <div className="absolute bottom-1 w-7 h-2 bg-black/40 blur-[4px] rounded-full scale-x-110" />

            <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-2xl animate-knight-hero-float scale-[1.3]"
            >
                {/* Character Group */}
                <g>
                    {/* Legs & Metallic Sabatons */}
                    <path d="M15 32L14 36H18L19 32H15Z" fill="#94A3B8" /> {/* Left foot */}
                    <path d="M23 32L24 36H20L21 32H23Z" fill="#94A3B8" /> {/* Right foot */}
                    <path d="M16 26V32L19 32V26H16Z" fill="#64748B" /> {/* Lower left leg */}
                    <path d="M21 26V32L24 32V26H21Z" fill="#64748B" /> {/* Lower right leg */}

                    {/* Blue & White Surcoat / Tabard */}
                    <path d="M14 16H26V28L20 31L14 28V16Z" fill="#1D4ED8" /> {/* Main blue tabard */}
                    <path d="M17 16H23V28L20 30L17 28V16Z" fill="white" />  {/* White center stripe */}

                    {/* Metallic Armor - Torso & Shoulders */}
                    <path d="M14 15V19C14 19 12 18 11 16L12 13L15 13L14 15Z" fill="#CBD5E1" /> {/* Left Pauldron */}
                    <path d="M26 15V19C26 19 28 18 29 16L28 13L25 13L26 15Z" fill="#CBD5E1" /> {/* Right Pauldron */}

                    {/* Arms */}
                    <path d="M14 16L12 25L14 26L16 19" fill="#94A3B8" /> {/* Left armored arm */}
                    <path d="M26 16L28 25L26 26L24 19" fill="#94A3B8" /> {/* Right armored arm */}

                    {/* Head - Knight with Brown Hair (simplified) */}
                    <circle cx="20" cy="9" r="3.5" fill="#FDE68A" /> {/* Face */}
                    <path d="M16.5 7.5C16.5 6 18 5 20 5C22 5 23.5 6 23.5 7.5V10H16.5V7.5Z" fill="#78350F" /> {/* Brown Hair */}

                    {/* Large Detailed Shield (Left Arm) */}
                    <g transform="translate(-1, 0)">
                        <defs>
                            <linearGradient id="shieldGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FBDB8A" />
                                <stop offset="100%" stopColor="#B45309" />
                            </linearGradient>
                        </defs>
                        {/* Shield Base (Heater Shape) */}
                        <path
                            d="M2 15V24C2 29 6 34 10 36L11 37L12 36C16 34 20 29 20 24V15H2Z"
                            fill="#E2E8F0"
                            stroke="url(#shieldGoldGrad)"
                            strokeWidth="1.2"
                        />
                        {/* Shield Inlay (Blue Heart/Shield Theme) */}
                        <path
                            d="M5 18V23C5 26 8 29 11 31C14 29 17 26 17 23V18H5Z"
                            fill="#3B82F6"
                        />
                        <path
                            d="M8 21L11 24L14 21"
                            stroke="white"
                            strokeWidth="1"
                            strokeLinecap="round"
                        />
                    </g>

                    {/* Sword (Right Side - Low Profile) */}
                    <path d="M28 18L34 28L32 29L27 19" fill="#94A3B8" /> {/* Sword tilt */}
                    <path d="M27 19L29 17L31 19" fill="#B45309" /> {/* Hilt */}
                </g>
            </svg>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes knight-hero-float {
                    0%, 100% { transform: translateY(-2px); }
                    50% { transform: translateY(1px); }
                }
                .animate-knight-hero-float { 
                    animation: knight-hero-float 3s ease-in-out infinite;
                }
            `}} />
        </div>
    );
});

PlayerCharacter.propTypes = {
    isDamaged: PropTypes.bool
};

export default PlayerCharacter;
