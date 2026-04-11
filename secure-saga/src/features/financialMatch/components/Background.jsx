/**
 * Background — Deep navy #0A1628 flat background with centered mandala watermark.
 * Pixel-perfect recreation: solid background, no gradient, faint mandala behind grid.
 */
import { memo } from 'react';
import mandalaImg from '../../assets/image/ui/mandala_watermark.png';

const Background = memo(function Background() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
            style={{ background: '#0A1628' }}
        >
            {/* Mandala watermark — centered behind the game grid area */}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%]"
                style={{
                    width: '320px',
                    height: '320px',
                    // TASK 7: explicitly faint 6% opacity
                    opacity: 0.06,
                }}
            >
                <img
                    src={mandalaImg}
                    alt=""
                    className="w-full h-full object-contain"
                    draggable={false}
                />
            </div>
        </div>
    );
});

export default Background;
