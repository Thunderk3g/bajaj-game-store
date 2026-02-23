import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Draggable pillar block — styled as a "Dark Blue Button with Glowing Orange Outline"
 * Matches the requested celebratory theme.
 */
const PillarBlock = memo(function PillarBlock({ pillar, count, disabled }) {
    const isEmpty = count === 0;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `block-${pillar.id}`,
        data: { pillarId: pillar.id },
        disabled: disabled || isEmpty,
    });

    // KEY FIX: when dragging, DON'T move the source element — let DragOverlay handle it.
    // The source stays in place (invisible placeholder), only the ghost overlay moves.
    // This eliminates the flicker caused by the element jumping when drag starts.
    const style = isDragging
        ? { opacity: 0, cursor: 'grabbing' }         // invisible placeholder
        : transform
            ? { transform: CSS.Translate.toString(transform), zIndex: 999 }
            : undefined;

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                flex: '1 1 0',
                minWidth: 0,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                padding: '0.5rem 0.1rem',

                // Theme Styles
                background: isEmpty ? '#0f172a' : '#1e3a5f', // Dark blue (faded if empty)
                border: isEmpty ? '1px solid #334155' : '1.5px solid #f97316', // Orange border
                borderRadius: '0.75rem',
                boxShadow: isEmpty ? 'none' : '0 0 8px rgba(249, 115, 22, 0.25)', // Subtle glow

                opacity: isEmpty ? 0.5 : isDragging ? 0 : 1,
                cursor: isEmpty ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
                // Only transition when NOT dragging — prevents flash on drag start/end
                transition: isDragging ? 'none' : 'opacity 0.15s ease, box-shadow 0.15s ease',
                userSelect: 'none',
                touchAction: 'none',
                // GPU-accelerate the element for smoother compositing
                willChange: isDragging ? 'auto' : 'transform',
            }}
            {...listeners}
            {...attributes}
            aria-label={`Drag ${pillar.label}, ${count} remaining`}
            aria-disabled={isEmpty}
            role="button"
            tabIndex={isEmpty ? -1 : 0}
        >
            {/* Count Badge - Orange on White text */}
            <div
                style={{
                    position: 'absolute',
                    top: '-0.35rem',
                    right: '-0.35rem',
                    minWidth: '1.1rem',
                    height: '1.1rem',
                    padding: '0 0.2rem',
                    borderRadius: '99px',
                    background: '#f97316',
                    color: '#ffffff',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #0d1b3e', // Match card bg
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    zIndex: 2,
                }}
            >
                {count}
            </div>

            {/* Emoji */}
            <span style={{ fontSize: 'clamp(1.4rem, 6vw, 1.8rem)', lineHeight: 1, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
                {pillar.emoji}
            </span>

            {/* Label - White text */}
            <span
                style={{
                    fontSize: 'clamp(0.5rem, 2vw, 0.6rem)',
                    fontWeight: 700,
                    color: '#e2e8f0', // Light gray/white
                    textAlign: 'center',
                    lineHeight: 1.1,
                    wordBreak: 'break-word',
                    width: '100%',
                    letterSpacing: '0.02em',
                }}
            >
                {pillar.label}
            </span>
        </div>
    );
});

PillarBlock.propTypes = {
    pillar: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        emoji: PropTypes.string.isRequired,
    }).isRequired,
    count: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
};

PillarBlock.defaultProps = { disabled: false };

export default PillarBlock;
