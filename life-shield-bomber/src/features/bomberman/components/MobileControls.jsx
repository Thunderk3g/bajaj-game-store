/**
 * MobileControls — Analog joystick (drag-based like Mini Militia) + Shield button.
 * The joystick fires continuous movement while dragging.
 * Shield button is blue themed with cooldown radial indicator.
 */
import { memo, useRef, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Shield } from 'lucide-react';

const JOYSTICK_RADIUS = 50; // Max drag distance in px
const DEAD_ZONE = 12; // Minimum drag to register
const MOVE_INTERVAL = 250; // ms between repeated moves while held (increased to slow down movement)

const MobileControls = memo(function MobileControls({ onMove, onAction, getCooldownProgress }) {
    const joystickRef = useRef(null);
    const knobRef = useRef(null);
    const isTouchingRef = useRef(false);
    const originRef = useRef({ x: 0, y: 0 });
    const currentDirRef = useRef(null);
    const moveIntervalRef = useRef(null);
    const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
    const [isActive, setIsActive] = useState(false);
    const [cooldown, setCooldown] = useState(1);

    // Smooth cooldown updates
    useEffect(() => {
        let frame;
        const updateCooldown = () => {
            if (getCooldownProgress) {
                setCooldown(getCooldownProgress());
            }
            frame = requestAnimationFrame(updateCooldown);
        };
        frame = requestAnimationFrame(updateCooldown);
        return () => cancelAnimationFrame(frame);
    }, [getCooldownProgress]);

    const getDirection = useCallback((dx, dy) => {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < DEAD_ZONE) return null;

        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // -45 to 45 = RIGHT, 45 to 135 = DOWN, 135/-135 = LEFT, -135 to -45 = UP
        if (angle >= -45 && angle < 45) return 'RIGHT';
        if (angle >= 45 && angle < 135) return 'DOWN';
        if (angle >= -135 && angle < -45) return 'UP';
        return 'LEFT';
    }, []);

    const startContinuousMove = useCallback((direction) => {
        if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
        currentDirRef.current = direction;
        onMove(direction); // Fire immediately
        moveIntervalRef.current = setInterval(() => {
            if (currentDirRef.current) {
                onMove(currentDirRef.current);
            }
        }, MOVE_INTERVAL);
    }, [onMove]);

    const stopContinuousMove = useCallback(() => {
        currentDirRef.current = null;
        if (moveIntervalRef.current) {
            clearInterval(moveIntervalRef.current);
            moveIntervalRef.current = null;
        }
    }, []);

    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        isTouchingRef.current = true;
        setIsActive(true);

        const rect = joystickRef.current.getBoundingClientRect();
        originRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }, []);

    const handlePointerMove = useCallback((e) => {
        if (!isTouchingRef.current) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let dx = clientX - originRef.current.x;
        let dy = clientY - originRef.current.y;

        // Clamp to joystick radius
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > JOYSTICK_RADIUS) {
            dx = (dx / dist) * JOYSTICK_RADIUS;
            dy = (dy / dist) * JOYSTICK_RADIUS;
        }

        setKnobPos({ x: dx, y: dy });

        const dir = getDirection(dx, dy);
        if (dir && dir !== currentDirRef.current) {
            startContinuousMove(dir);
        } else if (!dir) {
            stopContinuousMove();
        }
    }, [getDirection, startContinuousMove, stopContinuousMove]);

    const handlePointerUp = useCallback(() => {
        isTouchingRef.current = false;
        setIsActive(false);
        setKnobPos({ x: 0, y: 0 });
        stopContinuousMove();
    }, [stopContinuousMove]);

    // Attach global pointer events for smooth dragging outside the joystick area
    useEffect(() => {
        const onMove = (e) => handlePointerMove(e);
        const onUp = () => handlePointerUp();

        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        return () => {
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
        };
    }, [handlePointerMove, handlePointerUp]);

    const handleShieldTouch = useCallback((e) => {
        e.preventDefault();
        onAction();
    }, [onAction]);

    const handleShieldMouse = useCallback(() => {
        onAction();
    }, [onAction]);

    return (
        <div className="w-full flex items-center justify-between px-6 py-4 relative z-20 pb-8">
            {/* Analog Joystick */}
            <div
                ref={joystickRef}
                className="relative flex items-center justify-center touch-none select-none"
                style={{ width: '9rem', height: '9rem' }}
                onTouchStart={handlePointerDown}
                onMouseDown={handlePointerDown}
            >
                {/* Outer ring */}
                <div
                    className="absolute rounded-full border border-white/15"
                    style={{
                        width: '100%',
                        height: '100%',
                        background: isActive
                            ? 'radial-gradient(circle, rgba(30,94,255,0.08) 0%, rgba(30,94,255,0.02) 100%)'
                            : 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 100%)',
                        transition: 'background 0.2s',
                    }}
                />

                {/* Direction indicators */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                    <div className="w-[80%] h-[1px] bg-white" />
                    <div className="h-[80%] w-[1px] bg-white absolute" />
                </div>

                {/* Knob */}
                <div
                    ref={knobRef}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: '3.2rem',
                        height: '3.2rem',
                        transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
                        background: isActive
                            ? 'radial-gradient(circle, rgba(30,94,255,0.7) 0%, rgba(30,94,255,0.3) 100%)'
                            : 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
                        border: isActive ? '2px solid rgba(59,130,246,0.6)' : '2px solid rgba(255,255,255,0.15)',
                        boxShadow: isActive
                            ? '0 0 20px rgba(30,94,255,0.4), inset 0 0 10px rgba(30,94,255,0.2)'
                            : '0 0 8px rgba(0,0,0,0.3)',
                        transition: isTouchingRef.current ? 'none' : 'transform 0.15s ease-out, background 0.2s, border 0.2s',
                    }}
                />
            </div>

            {/* Shield Button */}
            <div className="flex flex-col items-center gap-2">
                <button
                    onTouchStart={handleShieldTouch}
                    onMouseDown={handleShieldMouse}
                    className="relative w-[4.5rem] h-[4.5rem] flex items-center justify-center rounded-full overflow-hidden transition-transform active:scale-95"
                    aria-label="Throw Shield"
                    style={{
                        background: cooldown >= 1
                            ? 'linear-gradient(135deg, rgba(30,94,255,0.5) 0%, rgba(59,130,246,0.3) 100%)'
                            : 'rgba(30,94,255,0.15)',
                        border: cooldown >= 1
                            ? '3px solid rgba(59,130,246,0.9)'
                            : '3px solid rgba(59,130,246,0.3)',
                        boxShadow: cooldown >= 1
                            ? '0 0 20px rgba(30,94,255,0.5), inset 0 0 15px rgba(30,94,255,0.2)'
                            : 'none',
                    }}
                >
                    {/* Cooldown fill from bottom */}
                    <div
                        className="absolute bottom-0 left-0 w-full"
                        style={{
                            height: `${(1 - cooldown) * 100}%`,
                            background: 'rgba(30,94,255,0.15)',
                            backdropFilter: 'blur(4px)',
                        }}
                    />
                    <Shield
                        className={`z-10 ${cooldown >= 1 ? 'text-blue-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'text-blue-400/40'}`}
                        style={{ width: '2rem', height: '2rem' }}
                        strokeWidth={2.5}
                    />
                </button>
                <span className="text-[10px] font-bold text-blue-300/60 uppercase tracking-widest">Shield</span>
            </div>
        </div>
    );
});

MobileControls.propTypes = {
    onMove: PropTypes.func.isRequired,
    onAction: PropTypes.func.isRequired,
    getCooldownProgress: PropTypes.func,
};

export default MobileControls;
