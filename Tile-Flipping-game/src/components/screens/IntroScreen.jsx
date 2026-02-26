import { useState } from 'react';
import Button from '../ui/Button';
import LeadModal from '../modals/LeadModal';
import styles from './IntroScreen.module.css';

export default function IntroScreen() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className={`screen ${styles.intro}`}>
                <div className={`screen-inner ${styles.inner}`}>
                    {/* Simplified Intro - background handled in CSS */}
                    <div className={styles.centeredContent}>
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


