import { useState } from 'react';
import Button from '../ui/Button';
import LeadModal from '../modals/LeadModal';
import styles from './IntroScreen.module.css';
import youImg from '../../assets/You.png';
import agentImg from '../../assets/agent.png';

export default function IntroScreen() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className={`screen ${styles.intro}`}>
                <div className={`screen-inner ${styles.inner}`}>

                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.badge}>
                            <span className={styles.badgeDot} />
                            Life Insurance Game
                        </div>
                        <h1 className={styles.title}>
                            Match for a<br />
                            <span>Secure Future</span>
                        </h1>
                        <p className={styles.subtitle}>Flip tiles, find pairs, protect your future 🛡️</p>
                    </div>

                    {/* Hero illustration */}
                    <div className={styles.hero} aria-hidden="true">
                        <div className={styles.heroStage}>
                            {/* Floating stars */}
                            <span className={`${styles.star} ${styles.star1}`}>✨</span>
                            <span className={`${styles.star} ${styles.star2}`}>⭐</span>
                            <span className={`${styles.star} ${styles.star3}`}>🌟</span>

                            {/* Left character */}
                            <div className={styles.character}>
                                <div className={styles.charImageContainer}>
                                    <img
                                        src={youImg}
                                        className={`${styles.charImage} ${styles.charImageLeft}`}

                                    />
                                </div>
                                <span className={styles.charLabel}>You</span>
                            </div>

                            {/* Mini board */}
                            <div className={styles.miniBoard}>
                                {[null, '❤️‍🩹', null, '❤️‍🩹', null, null, null, null, null].map((e, i) => (
                                    <div key={i} className={`${styles.miniTile} ${e ? styles.miniTileFlipped : ''}`}>
                                        {e && <span style={{ fontSize: 16 }}>{e}</span>}
                                    </div>
                                ))}
                            </div>

                            {/* Right character */}
                            <div className={styles.character}>
                                <div className={styles.charImageContainer}>
                                    <img
                                        src={agentImg}
                                        className={`${styles.charImage} ${styles.charImageRight}`}

                                    />
                                </div>
                                <span className={styles.charLabel}>Agent</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className={styles.bottom}>
                        <div className={styles.chips}>
                            <div className={styles.chip}><span>⏱</span> 2 Min</div>
                            <div className={styles.chip}><span>🎴</span> 16 Tiles</div>
                            <div className={styles.chip}><span>🧠</span> 8 Pairs</div>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={() => setShowModal(true)}
                            id="btn-start-now"
                            className={styles.btnStartNow}
                        >
                            &nbsp; Start Now
                        </Button>
                    </div>

                </div>
            </div>

            {showModal && <LeadModal shouldSubmit={true} onClose={() => setShowModal(false)} />}
        </>
    );
}


