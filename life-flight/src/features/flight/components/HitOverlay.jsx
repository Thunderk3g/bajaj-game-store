import React from 'react';

export default function HitOverlay({ hurdle, livesLeft, onRetry }) {
    return (
        <>
            {/* Red tint overlay */}
            <div
                className="absolute inset-0 z-30 pointer-events-none"
                style={{ background: 'rgba(230,57,70,0.15)' }}
            />

            {/* Card - Centered in middle */}
            <div className="absolute inset-0 z-40 flex items-center justify-center px-5">
                <div
                    className="w-full max-w-sm slide-up"
                    style={{
                        background: '#ffffff',
                        borderRadius: 20,
                        padding: '24px 20px',
                        boxShadow: '0 -4px 40px rgba(230,57,70,0.25), 0 20px 60px rgba(0,0,0,0.4)',
                    }}
                >
                    {/* Hurdle hit banner */}
                    <div
                        className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
                        style={{
                            background: hurdle ? hurdle.color + '18' : '#E6394618',
                            border: `1.5px solid ${hurdle ? hurdle.color : '#E63946'}44`,
                        }}
                    >
                        <span style={{ fontSize: 28 }}>💥</span>
                        <div>
                            <p className="font-black" style={{ fontSize: 16, color: hurdle?.color || '#E63946' }}>
                                You hit {hurdle?.name || 'a Hurdle'}
                            </p>
                            <p className="font-semibold" style={{ fontSize: 12, color: '#6B7280' }}>
                                {hurdle?.cost || ''}
                            </p>
                        </div>
                    </div>

                    {/* Hit message */}
                    <p className="mb-5 leading-relaxed" style={{ fontSize: 14, color: '#374151' }}>
                        {hurdle?.hitMessage || 'A financial hurdle hit your family hard.'}
                    </p>

                    {/* Lives remaining */}
                    <div className="flex items-center gap-2 mb-5">
                        <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Lives left:</span>
                        <div className="flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <span key={i} style={{ fontSize: 18 }}>
                                    {i < livesLeft ? '❤️' : '🖤'}
                                </span>
                            ))}
                        </div>
                        {livesLeft === 1 && (
                            <span className="ml-1 font-semibold" style={{ fontSize: 12, color: '#E63946' }}>
                                Last chance!
                            </span>
                        )}
                    </div>

                    {/* Retry button */}
                    <button
                        onClick={onRetry}
                        className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
                        style={{
                            fontSize: 16,
                            background: 'linear-gradient(135deg, #023E8A 0%, #0096C7 100%)',
                            boxShadow: '0 6px 20px rgba(2,62,138,0.35)',
                        }}
                    >
                         Keep Flying
                    </button>

                    {/* Reassurance nudge */}
                    <p className="text-center mt-3" style={{ fontSize: 12, color: '#9CA3AF' }}>
                        Insurance could have absorbed this blow. 
                    </p>
                </div>
            </div>
        </>
    );
}
