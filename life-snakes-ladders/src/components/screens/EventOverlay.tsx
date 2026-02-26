import React from 'react';
import { Shield, AlertTriangle, ArrowUpRight, Plus } from 'lucide-react';
import { Cell } from '../../features/GameLogic';

interface EventOverlayProps {
    event: Cell;
    isShielded: boolean;
    onContinue: () => void;
    onAddShield?: () => void;
}

const EventOverlay: React.FC<EventOverlayProps> = ({
    event,
    isShielded,
    onContinue,
    onAddShield
}) => {
    const isSnake = event.type === 'snake';
    const isProtected = isSnake && isShielded;

    return (
        <div className="lsl-absolute lsl-inset-0 lsl-z-50 lsl-flex lsl-items-center lsl-justify-center lsl-p-6">
            <div className="lsl-absolute lsl-inset-0 lsl-bg-black/80 lsl-backdrop-blur-sm" onClick={onContinue} />

            {/* Event Card */}
            <div className={`lsl-relative lsl-w-full lsl-max-w-xs lsl-p-6 lsl-rounded-3xl lsl-border lsl-text-center lsl-animate-in lsl-fade-in lsl-zoom-in lsl-duration-300 ${isProtected ? 'lsl-bg-shield-blue/20 lsl-border-shield-glow' :
                isSnake ? 'lsl-bg-snake-red/20 lsl-border-snake-red lsl-shake' :
                    'lsl-bg-ladder-gold/20 lsl-border-ladder-gold'
                }`}>

                <div className="lsl-mb-4 lsl-flex lsl-justify-center">
                    {isProtected ? (
                        <Shield className="lsl-w-16 lsl-h-16 lsl-text-shield-glow" />
                    ) : isSnake ? (
                        <div className="lsl-bg-snake-red lsl-p-4 lsl-rounded-2xl">
                            <AlertTriangle className="lsl-w-12 lsl-h-12 lsl-text-white" />
                        </div>
                    ) : (
                        <div className="lsl-bg-ladder-gold lsl-p-4 lsl-rounded-2xl">
                            <ArrowUpRight className="lsl-w-12 lsl-h-12 lsl-text-white" />
                        </div>
                    )}
                </div>

                <h3 className={`lsl-text-xl lsl-font-bold lsl-mb-2 ${isProtected ? 'lsl-text-shield-glow' :
                    isSnake ? 'lsl-text-white' :
                        'lsl-text-ladder-gold'
                    }`}>
                    {isProtected ? 'SHIELD SAVED YOU!' : event.label}
                </h3>

                <p className="lsl-text-sm lsl-text-white lsl-mb-6 lsl-leading-relaxed">
                    {isProtected ? event.shieldMsg : isSnake ? event.impactMsg : event.description}
                </p>

                {!isShielded && isSnake && onAddShield && (
                    <div className="lsl-bg-white/5 lsl-p-4 lsl-rounded-2xl lsl-mb-6 lsl-border lsl-border-white/10">
                        <p className="lsl-text-[10px] lsl-font-bold lsl-uppercase lsl-text-text-muted lsl-mb-2">Protection Offer</p>
                        <p className="lsl-text-[11px] lsl-text-white/80 lsl-mb-4">Want to add a Term Shield to protect your family from future setbacks?</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddShield(); }}
                            className="lsl-btn lsl-btn-primary lsl-w-full lsl-py-2 lsl-text-xs"
                        >
                            <Plus className="lsl-w-3 lsl-h-3" />
                            ADD TERM SHIELD
                        </button>
                    </div>
                )}

                <button
                    onClick={onContinue}
                    className={`lsl-btn lsl-w-full ${isProtected ? 'lsl-bg-shield-blue' :
                        isSnake ? 'lsl-bg-snake-red' :
                            'lsl-bg-ladder-gold'
                        } lsl-text-white`}
                >
                    {isSnake ? 'CONTINUE' : 'CLIMB UP!'}
                </button>
            </div>

            {isSnake && !isProtected && (
                <div className="lsl-absolute lsl-inset-0 lsl-pointer-events-none lsl-flash-red lsl-z-[-1]" />
            )}
        </div>
    );
};

export default EventOverlay;
