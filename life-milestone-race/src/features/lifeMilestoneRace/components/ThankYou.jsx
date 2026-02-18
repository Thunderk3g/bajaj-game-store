import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Final Thank You / Successful Submission screen.
 */
const ThankYou = memo(function ThankYou({ name }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center justify-center text-center p-6 space-y-8"
        >
            <div className="space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30"
                >
                    <span className="text-[2.5rem]">✅</span>
                </motion.div>

                <h1 className="race-heading text-[2.5rem] sm:text-[3rem] text-blue-950 tracking-widest leading-tight uppercase">
                    THANK YOU!
                </h1>

                {name && (
                    <h2 className="race-subheading text-[1.5rem] text-bajaj-blue uppercase tracking-wider">
                        {name}
                    </h2>
                )}

                <div className="h-px w-24 bg-white/20 mx-auto my-6" />

                <div className="space-y-3">
                    <p className="text-blue-900/90 text-[1.125rem] font-medium tracking-wide">
                        Thank you for sharing your details.
                    </p>
                    <p className="text-blue-900/60 text-[0.9375rem] font-normal leading-relaxed max-w-xs mx-auto">
                        Our Relationship Manager will reach out to you shortly to help secure your milestones.
                    </p>
                </div>
            </div>
        </motion.div>
    );
});

ThankYou.displayName = 'ThankYou';

ThankYou.propTypes = {
    name: PropTypes.string,
};

export default ThankYou;
