import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, ChevronRight } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getSeverityLabel } from '../utils/severityImpact';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/**
 * Timeline summary showing all decisions made during the race.
 */
const TimelineSummary = memo(function TimelineSummary({ timeline, onContinue }) {
    const protectedCount = timeline.filter((e) => e.decision === 'protected').length;
    const exposedCount = timeline.filter((e) => e.decision === 'exposed').length;

    return (
        <motion.div
            className="w-full flex flex-col gap-5 max-h-[85dvh] overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center space-y-2">
                <h2 className="race-subheading text-[1.5rem] text-blue-950">
                    Your Life Journey
                </h2>
                <div className="flex justify-center gap-4">
                    <span className="inline-flex items-center gap-1 text-[0.8125rem] text-race-success">
                        <Shield size={14} /> {protectedCount} Protected
                    </span>
                    <span className="inline-flex items-center gap-1 text-[0.8125rem] text-race-danger">
                        <AlertCircle size={14} /> {exposedCount} Exposed
                    </span>
                </div>
            </motion.div>

            {/* Timeline entries */}
            <div className="relative space-y-3 pl-8">
                {/* Vertical connector line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-race-accent/40 via-race-border to-race-accent/40" />

                {timeline.map((entry, index) => {
                    const isProtected = entry.decision === 'protected';
                    return (
                        <motion.div
                            key={`${entry.eventId}-${index}`}
                            variants={itemVariants}
                            className="relative"
                        >
                            {/* Timeline dot */}
                            <div
                                className={`absolute -left-5 top-4 w-3 h-3 rounded-full border-2 ${isProtected
                                    ? 'bg-race-success border-race-success'
                                    : 'bg-race-danger border-race-danger'
                                    }`}
                            />

                            <Card padding="sm" className="ml-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[0.75rem] text-blue-900/60 font-medium">
                                                {entry.stage}
                                            </span>
                                            <span className={`severity-badge severity-${entry.severity}`}>
                                                {getSeverityLabel(entry.severity)}
                                            </span>
                                        </div>
                                        <p className="text-[0.875rem] font-medium text-blue-950 mt-1">
                                            {entry.title}
                                        </p>
                                    </div>

                                    {/* Decision indicator */}
                                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                        <span
                                            className={`inline-flex items-center gap-1 text-[0.6875rem] font-semibold rounded-full px-2 py-0.5 ${isProtected
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                                }`}
                                        >
                                            {isProtected ? (
                                                <>
                                                    <Shield size={10} /> Safe
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle size={10} /> Exposed
                                                </>
                                            )}
                                        </span>
                                        <span
                                            className={`text-[0.75rem] font-bold ${entry.scoreDelta >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}
                                        >
                                            {entry.scoreDelta > 0 ? '+' : ''}
                                            {entry.scoreDelta}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Continue */}
            <motion.div variants={itemVariants} className="pt-2">
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={onContinue}
                    id="btn-timeline-continue"
                >
                    See Your Protection Plan
                    <ChevronRight size={20} />
                </Button>
            </motion.div>
        </motion.div>
    );
});

TimelineSummary.displayName = 'TimelineSummary';

TimelineSummary.propTypes = {
    timeline: PropTypes.arrayOf(
        PropTypes.shape({
            eventId: PropTypes.string.isRequired,
            stage: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            severity: PropTypes.string.isRequired,
            decision: PropTypes.string.isRequired,
            scoreDelta: PropTypes.number.isRequired,
        }),
    ).isRequired,
    onContinue: PropTypes.func.isRequired,
};

export default TimelineSummary;
