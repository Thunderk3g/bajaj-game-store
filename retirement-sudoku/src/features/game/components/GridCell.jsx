import { useDroppable } from '@dnd-kit/core';
import { memo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { PILLAR_MAP } from '../../../constants/game.js';

// Pillar visual styles — colored borders, white backgrounds
const PILLAR_CELL_STYLE = {
    pension: { border: '#3b82f6' }, // Blue
    rental: { border: '#10b981' }, // Green
    savings: { border: '#fbbf24' }, // Yellow/Gold
    medical: { border: '#ef4444' }, // Red
    leisure: { border: '#a855f7' }, // Purple
};

/**
 * A single droppable cell — Dark Celebratory Theme Update.
 * - Empty: White bg, gray border.
 * - Filled/Prefilled: White bg, Colored border (based on type).
 * - Celebration Row (Row 2 / Index 1): Glowing aura & particle effect.
 */
const GridCell = memo(function GridCell({
    row,
    col,
    value,
    isPrefilled,
    isConflict,
    draggedPillarId,
    isDropValid,
    onClearCell,
}) {
    const lastClickTime = useRef(0);
    const cellKey = `cell-${row}-${col}`;
    const isCelebrationRow = row === 1; // Row 2 is index 1

    const { isOver, setNodeRef } = useDroppable({
        id: cellKey,
        data: { row, col },
        disabled: isPrefilled,
    });

    const pillar = value ? PILLAR_MAP[value] : null;
    const styleDef = value ? PILLAR_CELL_STYLE[value] : null;

    const handleCellClick = useCallback(() => {
        if (isPrefilled || !value) return;

        const now = Date.now();
        const DOUBLE_CLICK_DELAY = 300;

        if (now - lastClickTime.current < DOUBLE_CLICK_DELAY) {
            // It's a double click/tap
            onClearCell(row, col);
            lastClickTime.current = 0; // Reset
        } else {
            lastClickTime.current = now;
        }
    }, [isPrefilled, value, row, col, onClearCell]);

    const handleDoubleClick = useCallback(() => {
        if (!isPrefilled && value) onClearCell(row, col);
    }, [isPrefilled, value, row, col, onClearCell]);

    const handleKeyDown = useCallback((e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && !isPrefilled && value) {
            onClearCell(row, col);
        }
    }, [isPrefilled, value, row, col, onClearCell]);

    const isHovered = isOver && draggedPillarId;
    const showValid = isHovered && isDropValid;
    const showInvalid = isHovered && !isDropValid;

    // --- Compute Styles ---
    let bgColor = '#ffffff';
    let border = '1.5px solid #cbd5e1'; // Light gray default
    let boxShadow = 'none';
    let scale = 'scale(1)';
    let zIndex = 1;
    let iconFilter = 'none';

    // Filled / Prefilled State
    if (value && styleDef) {
        bgColor = '#ffffff';
        border = `2.5px solid ${styleDef.border}`;
    }

    // Celebration Row Effect (Row 2) - "entire row should be highlighted with a bright, glowing orange aura"
    if (isCelebrationRow) {
        // Continuous orange glow
        boxShadow = '0 0 15px rgba(249, 115, 22, 0.5), inset 0 0 10px rgba(249, 115, 22, 0.1)';
        border = value ? border : '2px solid rgba(249, 115, 22, 0.6)'; // Orange border even if empty? Prompt implies whole row glow.
        zIndex = 5;
        iconFilter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) brightness(1.2)'; // "Brightly lit icons"
    }

    // Conflict overrides
    if (isConflict && !isPrefilled) {
        bgColor = '#fee2e2';
        border = '2.5px solid #ef4444';
        boxShadow = '0 0 0 3px rgba(239,68,68,0.4)';
        zIndex = 10;
    }

    // Drag Over
    if (showValid) {
        bgColor = '#f0fdf4';
        border = '2.5px solid #10b981'; // Green
        boxShadow = '0 0 0 4px rgba(16,185,129,0.4)';
        scale = 'scale(1.08)';
        zIndex = 20;
    }
    if (showInvalid) {
        bgColor = '#fef2f2';
        border = '2.5px solid #ef4444'; // Red
        scale = 'scale(0.95)';
    }

    return (
        <div
            ref={setNodeRef}
            id={cellKey}
            onClick={handleCellClick}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            tabIndex={isPrefilled ? -1 : 0}
            role="gridcell"
            aria-label={`Cell ${row + 1},${col + 1}`}
            style={{
                background: bgColor,
                border,
                boxShadow,
                transform: scale,
                textShadow: 'none',
                zIndex,
                borderRadius: '0.75rem',
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isPrefilled ? 'default' : value ? 'pointer' : 'default',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                overflow: 'visible', // Allow glow/shadow to spill
                userSelect: 'none',
            }}
        >
            {/* Celebration Particles (Row 2 only) */}
            {isCelebrationRow && (
                <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                    <div className="absolute w-full h-full bg-orange-500/10 animate-pulse" />
                </div>
            )}

            {pillar && (
                <>
                    <span
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                            lineHeight: 1,
                            pointerEvents: 'none',
                            filter: iconFilter,
                            color: pillar.id === 'savings' ? '#000000' : undefined,
                        }}
                    >
                        {pillar.emoji}
                    </span>

                    {/* Lock badge */}
                    {isPrefilled && (
                        <div
                            className="absolute top-1 right-1 text-[0.65rem] opacity-70 z-10 leading-none drop-shadow-sm"
                            title="Locked"
                        >
                            🔒
                        </div>
                    )}
                </>
            )}
        </div>
    );
});

GridCell.propTypes = {
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    value: PropTypes.string,
    isPrefilled: PropTypes.bool.isRequired,
    isConflict: PropTypes.bool.isRequired,
    draggedPillarId: PropTypes.string,
    isDropValid: PropTypes.bool.isRequired,
    onClearCell: PropTypes.func.isRequired,
};

GridCell.defaultProps = {
    value: null,
    draggedPillarId: null,
};

export default GridCell;
