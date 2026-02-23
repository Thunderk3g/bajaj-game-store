import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core';
import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useGame } from '../context/GameContext.jsx';
import { PILLAR_MAP } from '../../../constants/game.js';

/**
 * Ghost block shown while dragging.
 */
function DragGhost({ pillar }) {
    if (!pillar) return null;
    return (
        <div
            style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: '0.75rem',
                border: '2px solid #f97316',
                background: '#1e3a5f',
                boxShadow: '0 0 20px rgba(249, 115, 22, 0.7), 0 8px 24px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                transform: 'scale(1.12)',
                opacity: 1,
                cursor: 'grabbing',
                pointerEvents: 'none',
                // GPU compositing — prevents flicker on the ghost itself
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
            }}
        >
            <span style={{ fontSize: '1.6rem', lineHeight: 1, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
                {pillar.emoji}
            </span>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.1 }}>
                {pillar.shortLabel}
            </span>
        </div>
    );
}

DragGhost.propTypes = {
    pillar: PropTypes.object,
};

DragGhost.defaultProps = {
    pillar: null,
};

/**
 * DnD context wrapper that wires drag events to game state.
 */
const DndGameContext = memo(function DndGameContext({ children }) {
    const { state, setDragged, clearDragged, dropOnCell } = useGame();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,   // require 8px of movement before drag starts
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = useCallback((event) => {
        const { active } = event;
        const pillarId = active.data.current?.pillarId;
        if (pillarId) {
            setDragged({ pillarId, activeId: active.id });
        }
    }, [setDragged]);

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        const pillarId = active.data.current?.pillarId;

        if (over && pillarId) {
            const { row, col } = over.data.current;
            dropOnCell(row, col, pillarId);
        } else {
            clearDragged();
        }
    }, [dropOnCell, clearDragged]);

    const handleDragCancel = useCallback(() => {
        clearDragged();
    }, [clearDragged]);

    const activePillar = state.draggedItem?.pillarId
        ? PILLAR_MAP[state.draggedItem.pillarId]
        : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            {children}
            <DragOverlay
                dropAnimation={{
                    duration: 180,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}
            >
                {activePillar ? <DragGhost pillar={activePillar} /> : null}
            </DragOverlay>
        </DndContext>
    );
});

export default DndGameContext;
