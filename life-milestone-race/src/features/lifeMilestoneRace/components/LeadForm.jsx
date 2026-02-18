import { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Send, User, Phone, Calendar, Clock, Loader2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { submitLead } from '../services/leadService';

const TIME_SLOTS = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/**
 * Lead capture form.
 */
const LeadForm = memo(function LeadForm({
    gameId,
    score,
    category,
    riskGaps,
    onSuccess,
}) {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        preferredDate: '',
        preferredSlot: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const validate = useCallback(() => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(formData.mobile)) {
            newErrors.mobile = 'Enter a valid 10-digit mobile number';
        }

        if (!formData.preferredDate) {
            newErrors.preferredDate = 'Select a date';
        }

        if (!formData.preferredSlot) {
            newErrors.preferredSlot = 'Select a time slot';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleChange = useCallback((field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setSubmitError('');
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            await submitLead({
                gameId,
                name: formData.name.trim(),
                mobile: formData.mobile.trim(),
                preferredDate: formData.preferredDate,
                preferredSlot: formData.preferredSlot,
                lifeProtectionScore: score,
                protectionCategory: category?.label || '',
                riskSummary: riskGaps,
            });
            onSuccess?.();
        } catch {
            setSubmitError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validate, gameId, score, category, riskGaps, onSuccess]);

    const today = new Date().toISOString().split('T')[0];

    return (
        <motion.form
            className="w-full flex flex-col gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            noValidate
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center space-y-1">
                <h2 className="race-subheading text-[1.375rem] text-blue-950">
                    Book Your Slot
                </h2>
                <p className="text-blue-900/60 text-[0.8125rem]">
                    A protection expert will call you at your preferred time
                </p>
            </motion.div>

            {/* Name */}
            <motion.div variants={itemVariants}>
                <label htmlFor="lead-name" className="block text-[0.8125rem] font-medium text-slate-600 mb-1.5">
                    Full Name
                </label>
                <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-race-muted" />
                    <input
                        id="lead-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter your name"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border text-slate-900 placeholder-slate-500 text-[0.9375rem] transition-colors focus:outline-none focus:ring-2 focus:ring-race-accent ${errors.name ? 'border-red-500' : 'border-white focus:border-race-accent'
                            }`}
                        autoComplete="name"
                    />
                </div>
                {errors.name && (
                    <p className="text-red-400 text-[0.75rem] mt-1">{errors.name}</p>
                )}
            </motion.div>

            {/* Mobile */}
            <motion.div variants={itemVariants}>
                <label htmlFor="lead-mobile" className="block text-[0.8125rem] font-medium text-slate-600 mb-1.5">
                    Mobile Number
                </label>
                <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-race-muted" />
                    <input
                        id="lead-mobile"
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border text-slate-900 placeholder-slate-500 text-[0.9375rem] transition-colors focus:outline-none focus:ring-2 focus:ring-race-accent ${errors.mobile ? 'border-red-500' : 'border-white focus:border-race-accent'
                            }`}
                        inputMode="numeric"
                        autoComplete="tel"
                    />
                </div>
                {errors.mobile && (
                    <p className="text-red-400 text-[0.75rem] mt-1">{errors.mobile}</p>
                )}
            </motion.div>

            {/* Date */}
            <motion.div variants={itemVariants}>
                <label htmlFor="lead-date" className="block text-[0.8125rem] font-medium text-slate-600 mb-1.5">
                    Preferred Date
                </label>
                <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-race-muted" />
                    <input
                        id="lead-date"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => handleChange('preferredDate', e.target.value)}
                        min={today}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border text-slate-900 text-[0.9375rem] transition-colors focus:outline-none focus:ring-2 focus:ring-race-accent [color-scheme:light] ${errors.preferredDate ? 'border-red-500' : 'border-white focus:border-race-accent'
                            }`}
                    />
                </div>
                {errors.preferredDate && (
                    <p className="text-red-400 text-[0.75rem] mt-1">{errors.preferredDate}</p>
                )}
            </motion.div>

            {/* Time Slot */}
            <motion.div variants={itemVariants}>
                <label className="block text-[0.8125rem] font-medium text-slate-600 mb-1.5">
                    <Clock size={14} className="inline mr-1" />
                    Preferred Time Slot
                </label>
                <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => (
                        <button
                            key={slot}
                            type="button"
                            onClick={() => handleChange('preferredSlot', slot)}
                            className={`px-3 py-2 rounded-lg text-[0.75rem] font-medium transition-all duration-200 ${formData.preferredSlot === slot
                                ? 'bg-race-accent text-white border border-race-accent'
                                : 'bg-white/60 text-slate-600 border border-white hover:border-race-accent/50'
                                }`}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
                {errors.preferredSlot && (
                    <p className="text-red-400 text-[0.75rem] mt-1">{errors.preferredSlot}</p>
                )}
            </motion.div>

            {/* Submit error */}
            {submitError && (
                <motion.div variants={itemVariants}>
                    <Card padding="sm" className="border-red-500/30 bg-red-500/10">
                        <p className="text-red-400 text-[0.8125rem] text-center">{submitError}</p>
                    </Card>
                </motion.div>
            )}

            {/* Submit */}
            <motion.div variants={itemVariants}>
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                    type="submit"
                    id="btn-submit-lead"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send size={18} />
                            Confirm Booking
                        </>
                    )}
                </Button>
            </motion.div>
        </motion.form>
    );
});

LeadForm.displayName = 'LeadForm';

LeadForm.propTypes = {
    gameId: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    category: PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.string,
    }),
    riskGaps: PropTypes.arrayOf(PropTypes.string),
    onSuccess: PropTypes.func,
};

export default LeadForm;
