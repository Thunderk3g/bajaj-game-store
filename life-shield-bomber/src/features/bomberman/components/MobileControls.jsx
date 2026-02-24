/**
 * MobileControls — On-screen D-pad and bomb button for mobile.
 * Fixed: prevents double-fire from touchStart + mouseDown on mobile.
 */
import { memo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const MobileControls = memo(function MobileControls({ onMove, onBomb }) {
    const isTouchRef = useRef(false);

    const handleTouch = useCallback((direction) => (e) => {
        e.preventDefault();
        isTouchRef.current = true;
        onMove(direction);
    }, [onMove]);

    const handleMouse = useCallback((direction) => () => {
        if (isTouchRef.current) {
            isTouchRef.current = false;
            return;
        }
        onMove(direction);
    }, [onMove]);

    const handleBombTouch = useCallback((e) => {
        e.preventDefault();
        isTouchRef.current = true;
        onBomb();
    }, [onBomb]);

    const handleBombMouse = useCallback(() => {
        if (isTouchRef.current) {
            isTouchRef.current = false;
            return;
        }
        onBomb();
    }, [onBomb]);

    return (
        <div className="w-full flex items-center justify-between px-8 py-6 relative z-20 pb-10">
            {/* D-Pad */}
            <div className="relative w-[10rem] h-[10rem] bg-white/5 rounded-full border border-white/10 shadow-2xl overflow-hidden backdrop-blur-sm">
                {/* Visual Center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-full h-[0.0625rem] bg-white" />
                    <div className="h-full w-[0.0625rem] bg-white absolute" />
                </div>

                {/* Up */}
                <button
                    onTouchStart={handleTouch('UP')}
                    onMouseDown={handleMouse('UP')}
                    className="dpad-btn absolute top-2 left-1/2 -translate-x-1/2 shadow-lg"
                    aria-label="Move Up"
                >
                    <ChevronUp className="w-7 h-7" strokeWidth={3} />
                </button>

                {/* Down */}
                <button
                    onTouchStart={handleTouch('DOWN')}
                    onMouseDown={handleMouse('DOWN')}
                    className="dpad-btn absolute bottom-2 left-1/2 -translate-x-1/2 shadow-lg"
                    aria-label="Move Down"
                >
                    <ChevronDown className="w-7 h-7" strokeWidth={3} />
                </button>

                {/* Left */}
                <button
                    onTouchStart={handleTouch('LEFT')}
                    onMouseDown={handleMouse('LEFT')}
                    className="dpad-btn absolute left-2 top-1/2 -translate-y-1/2 shadow-lg"
                    aria-label="Move Left"
                >
                    <ChevronLeft className="w-7 h-7" strokeWidth={3} />
                </button>

                {/* Right */}
                <button
                    onTouchStart={handleTouch('RIGHT')}
                    onMouseDown={handleMouse('RIGHT')}
                    className="dpad-btn absolute right-2 top-1/2 -translate-y-1/2 shadow-lg"
                    aria-label="Move Right"
                >
                    <ChevronRight className="w-7 h-7" strokeWidth={3} />
                </button>

                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-bb-accent/40 blur-[2px] border border-white/20 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
            </div>

            {/* Bomb Button */}
            <div className="flex flex-col items-center gap-2">
                <button
                    onTouchStart={handleBombTouch}
                    onMouseDown={handleBombMouse}
                    className="bomb-btn w-[4.5rem] h-[4.5rem] flex items-center justify-center border-4 shadow-2xl active:translate-y-1 transition-all"
                    aria-label="Place Bomb"
                >
                    <span className="text-2xl drop-shadow-md">💣</span>
                </button>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Bomb</span>
            </div>
        </div>
    );
});

MobileControls.propTypes = {
    onMove: PropTypes.func.isRequired,
    onBomb: PropTypes.func.isRequired,
};

export default MobileControls;
