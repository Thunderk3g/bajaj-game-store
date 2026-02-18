import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield } from 'lucide-react';

const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
        opacity: 0,
        y: -30,
        scale: 0.95,
        transition: { duration: 0.3, ease: 'easeIn' },
    },
};

/**
 * Impact badge styling — High Impact is orange, Medium Impact is blue.
 */
const IMPACT_STYLES = {
    high: {
        label: 'High Impact',
        bg: '#FF8C00',
        text: '#fff',
        glow: 'rgba(255, 140, 0, 0.4)',
        Icon: AlertTriangle,
    },
    medium: {
        label: 'Medium Impact',
        bg: 'rgba(0, 102, 178, 0.15)',
        text: '#0066B2',
        glow: 'none',
        Icon: Shield,
    },
    moderate: {
        label: 'Medium Impact',
        bg: 'rgba(0, 102, 178, 0.15)',
        text: '#0066B2',
        glow: 'none',
        Icon: Shield,
    },
};

/**
 * Hero-style event card — dramatic, game challenge feel.
 * Slightly lighter blue bg, 24px corners, soft shadow, big centered text.
 * Contains: Impact Tag, Event Title, Short Description.
 */
const EventCard = memo(function EventCard({ event }) {
    if (!event) return null;

    const impact = IMPACT_STYLES[event.severity] || IMPACT_STYLES.medium;
    const ImpactIcon = impact.Icon;

    return (
        <motion.div
            key={event.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
        >
            <div
                className="w-full text-center space-y-5"
                style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '24px',
                    border: '3px solid #FFFFFF',
                    padding: '2rem 1.5rem',
                    boxShadow: '0 8px 32px rgba(0, 102, 178, 0.15), 0 4px 12px rgba(0, 102, 178, 0.1)',
                }}
            >
                {/* Impact tag — orange badge for High, blue for Medium */}
                <div className="flex justify-center">
                    <span
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[0.8125rem] font-black uppercase tracking-wider"
                        style={{
                            backgroundColor: impact.bg,
                            color: impact.text,
                            boxShadow: impact.glow !== 'none' ? `0 0 12px ${impact.glow}` : undefined,
                        }}
                    >
                        <ImpactIcon size={14} />
                        {impact.label}
                    </span>
                </div>

                {/* Event title — large, bold, centered */}
                <h3
                    className="font-black text-blue-950 leading-tight"
                    style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}
                >
                    {event.title}
                </h3>

                {/* Description — 18px minimum */}
                <p
                    className="text-blue-900/70 leading-relaxed max-w-xs mx-auto"
                    style={{ fontSize: '1.0625rem' }}
                >
                    {event.description}
                </p>
            </div>
        </motion.div >
    );
});

EventCard.displayName = 'EventCard';

EventCard.propTypes = {
    event: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        severity: PropTypes.oneOf(['high', 'medium', 'moderate']).isRequired,
        stage: PropTypes.string.isRequired,
    }),
};

export default EventCard;
