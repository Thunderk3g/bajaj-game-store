import { memo, useCallback } from 'react';
import styles from './Tile.module.css';

/**
 * Single memory tile.
 * memo prevents re-render if tile state hasn't changed.
 */
const Tile = memo(function Tile({ tile, index, onClick, locked }) {
    const { isFlipped, isMatched, emoji, label, color } = tile;

    const handleClick = useCallback(() => {
        if (!locked && !isFlipped && !isMatched) {
            onClick(index);
        }
    }, [locked, isFlipped, isMatched, onClick, index]);

    const handleKey = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    const cls = [
        styles.tile,
        isFlipped && styles.flipped,
        isMatched && styles.matched,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={cls}
            onClick={handleClick}
            onKeyDown={handleKey}
            role="button"
            tabIndex={isMatched ? -1 : 0}
            aria-label={isMatched ? `Matched: ${label}` : isFlipped ? label : 'Hidden tile'}
            aria-pressed={isFlipped}
            data-testid={`tile-${index}`}
        >
            {/* Back face */}
            <div className={`${styles.face} ${styles.back}`} aria-hidden="true" />
            {/* Front face */}
            <div
                className={`${styles.face} ${styles.front}`}
                style={{ backgroundColor: color }}
                aria-hidden="true"
            >
                <span className={styles.emoji}>{emoji}</span>
            </div>
        </div>
    );
});

export default Tile;
