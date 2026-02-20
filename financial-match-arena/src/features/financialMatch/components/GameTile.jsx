/**
 * GameTile — Performance-Optimized Tile Component
 * ══════════════════════════════════════════════════════════
 * OPTIMIZATIONS:
 * - Replaced Framer Motion with pure CSS transitions (GPU-accelerated)
 * - Replaced drag system with lightweight pointer event swipe detection
 * - Removed layoutId (expensive layout animation system)
 * - Uses transform: translate3d() for GPU compositing
 * - React.memo with custom comparator prevents unnecessary re-renders
 * - Tile only re-renders if position, type, selected, or exploding changes
 * ══════════════════════════════════════════════════════════
 */
import { memo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

// Tile Metadata — static, declared outside component
const TILE_STYLES = {
    GREEN: 'bg-tile-green',
    BLUE: 'bg-tile-blue',
    YELLOW: 'bg-tile-yellow',
    RED: 'bg-tile-red',
};

// Lightweight SVG icons — memoized outside render
const ICONS = {
    GREEN: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tile-icon w-[55%] h-[55%]">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="rgba(255,255,255,0.15)" />
            <circle cx="9" cy="7" r="4" fill="rgba(255,255,255,0.15)" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    BLUE: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tile-icon w-[50%] h-[50%]">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="rgba(255,255,255,0.15)" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    ),
    YELLOW: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tile-icon w-[55%] h-[55%]">
            <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" />
            <path d="M12 6v6l4 2" />
        </svg>
    ),
    RED: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tile-icon w-[50%] h-[50%]">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" fill="rgba(255,255,255,0.15)" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    ),
};

// Swipe detection threshold (px)
const SWIPE_THRESHOLD = 20;

const GameTile = memo(function GameTile({
    tile,
    isSelected,
    isExploding,
    onTap,
    onSwipe,
    cellSize,
}) {
    const pointerStart = useRef(null);

    const handlePointerDown = useCallback((e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handlePointerUp = useCallback((e) => {
        if (!pointerStart.current) return;
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx > SWIPE_THRESHOLD || absDy > SWIPE_THRESHOLD) {
            // It's a swipe
            let direction;
            if (absDx > absDy) {
                direction = dx > 0 ? 'RIGHT' : 'LEFT';
            } else {
                direction = dy > 0 ? 'DOWN' : 'UP';
            }
            onSwipe && onSwipe(tile.row, tile.col, direction);
        } else {
            // It's a tap
            onTap(tile.row, tile.col);
        }
        pointerStart.current = null;
    }, [tile.row, tile.col, onTap, onSwipe]);

    if (!tile || !tile.type) {
        return <div style={{ width: cellSize, height: cellSize }} />;
    }

    const bgClass = TILE_STYLES[tile.type] || TILE_STYLES.GREEN;

    return (
        <div
            className={`tile-perf ${bgClass} ${isSelected ? 'tile-selected' : ''} ${isExploding ? 'tile-exploding' : ''}`}
            style={{
                width: cellSize,
                height: cellSize,
                willChange: isExploding ? 'transform, opacity' : 'auto',
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { pointerStart.current = null; }}
        >
            {ICONS[tile.type]}
        </div>
    );
}, (prev, next) => {
    // Custom comparator: only re-render when meaningful props change
    return (
        prev.tile?.id === next.tile?.id &&
        prev.tile?.type === next.tile?.type &&
        prev.tile?.row === next.tile?.row &&
        prev.tile?.col === next.tile?.col &&
        prev.isSelected === next.isSelected &&
        prev.isExploding === next.isExploding &&
        prev.cellSize === next.cellSize
    );
});

GameTile.propTypes = {
    tile: PropTypes.object,
    isSelected: PropTypes.bool,
    isExploding: PropTypes.bool,
    onTap: PropTypes.func.isRequired,
    onSwipe: PropTypes.func,
    cellSize: PropTypes.number.isRequired,
};

export default GameTile;
