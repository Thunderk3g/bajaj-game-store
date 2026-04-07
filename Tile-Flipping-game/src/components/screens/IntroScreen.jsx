import Button from '../ui/Button';
import { useGame } from '../../context/GameContext';
import { useGameEngine } from '../../hooks/useGameEngine';
import { SCREENS } from '../../constants/game';
import styles from './IntroScreen.module.css';

export default function IntroScreen() {
    const { initGame } = useGameEngine();
    const { navigate } = useGame();

    const handleStartClick = () => {
        // Lead popup disabled — start game directly
        initGame();
        navigate(SCREENS.GAME);
    };

    return (
        <div className={`screen ${styles.intro}`}>
            <div className={`screen-inner ${styles.inner}`}>
                <div className={styles.centeredContent}>
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleStartClick}
                        id="btn-start-now"
                        className={styles.btnStartNow}
                    >
                        &nbsp; Start Now
                    </Button>
                </div>
            </div>
        </div>
    );
}
