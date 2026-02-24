import { memo } from 'react';
import Tile from './Tile';
import styles from './GameBoard.module.css';

/**
 * Renders the 4×4 tile grid.
 * Wrapped in memo to avoid re-render when parent re-renders for unrelated state.
 */
const GameBoard = memo(function GameBoard({ tiles, onTileClick, locked }) {
    return (
        <div
            className={styles.board}
            role="grid"
            aria-label="Memory tile game board"
        >
            {tiles.map((tile, index) => (
                <Tile
                    key={tile.id}
                    tile={tile}
                    index={index}
                    onClick={onTileClick}
                    locked={locked}
                />
            ))}
        </div>
    );
});

export default GameBoard;
