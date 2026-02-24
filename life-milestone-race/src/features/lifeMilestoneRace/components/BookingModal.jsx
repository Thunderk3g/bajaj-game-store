import { memo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Calendar, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { submitLead } from '../services/leadService';

const TIME_SLOTS = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
];

const BookingModal = memo(function BookingModal({
    isOpen,
    onClose,
    gameId,
    score,
    category,
    riskGaps,
    initialName,
    initialMobile
}) {
    const [formData, setFormData] = useState({
        name: initialName || '',
        mobile: initialMobile || '',
        preferredDate: '',
        preferredSlot: '',
        consent: true
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                name: initialName || prev.name,
                mobile: initialMobile || prev.mobile
            }));
            setIsSuccess(false);
            setSubmitError('');
            setErrors({});
        }
    }, [isOpen, initialName, initialMobile]);

    const validate = useCallback(() => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';

        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(formData.mobile)) newErrors.mobile = 'Enter a valid 10-digit mobile number';

        if (!formData.preferredDate) newErrors.preferredDate = 'Select a date';
        if (!formData.preferredSlot) newErrors.preferredSlot = 'Select a time slot';
        if (!formData.consent) newErrors.consent = 'Required';

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
            setIsSuccess(true);
        } catch {
            setSubmitError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validate, gameId, score, category, riskGaps]);

    const today = new Date().toISOString().split('T')[0];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative max-h-[90vh] flex flex-col"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-3 top-3 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10 text-slate-500"
                            >
                                <X size={20} />
                            </button>

                            {isSuccess ? (
                                <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 flex-1">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                        <CheckCircle2 size={40} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-2">Booking Confirmed!</h3>
                                        <p className="text-slate-500">
                                            Our relationship manager will contact you shortly at your preferred time.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={onClose}
                                        className="w-full bg-slate-900 text-white"
                                    >
                                        Close
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-slate-50 p-5 border-b border-slate-100">
                                        <h3 className="text-lg font-black text-slate-800">Book a Callback</h3>
                                        <p className="text-slate-500 text-xs mt-1">
                                            Secure your future with expert guidance
                                        </p>
                                    </div>

                                    <div className="p-5 overflow-y-auto custom-scrollbar">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {/* Name */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Name</label>
                                                <div className="relative">
                                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => handleChange('name', e.target.value)}
                                                        placeholder="Enter your name"
                                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                                                    />
                                                </div>
                                                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                            </div>

                                            {/* Mobile */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Number</label>
                                                <div className="relative">
                                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="tel"
                                                        value={formData.mobile}
                                                        onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                        placeholder="10-digit number"
                                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.mobile ? 'border-red-500' : 'border-slate-200'}`}
                                                    />
                                                </div>
                                                {errors.mobile && <p className="text-red-500 text-xs">{errors.mobile}</p>}
                                            </div>

                                            {/* Date */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preferred Date</label>
                                                <div className="relative">
                                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        min={today}
                                                        value={formData.preferredDate}
                                                        onChange={(e) => handleChange('preferredDate', e.target.value)}
                                                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.preferredDate ? 'border-red-500' : 'border-slate-200'}`}
                                                    />
                                                </div>
                                                {errors.preferredDate && <p className="text-red-500 text-xs">{errors.preferredDate}</p>}
                                            </div>

                                            {/* Time Slot */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Time Slot</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {TIME_SLOTS.map((slot) => (
                                                        <button
                                                            key={slot}
                                                            type="button"
                                                            onClick={() => handleChange('preferredSlot', slot)}
                                                            className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${formData.preferredSlot === slot
                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                                {errors.preferredSlot && <p className="text-red-500 text-xs">{errors.preferredSlot}</p>}
                                            </div>

                                            {/* Terms Checkbox — pre-checked by default */}
                                            <div className="flex items-start space-x-2 pt-1 text-left">
                                                <div className="relative flex items-center shrink-0">
                                                    <input
                                                        id="modal-booking-terms"
                                                        type="checkbox"
                                                        checked={formData.consent}
                                                        onChange={(e) => handleChange('consent', e.target.checked)}
                                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border-2 border-slate-300 bg-slate-50 transition-all checked:border-[#0066B2] checked:bg-[#0066B2] hover:border-[#0066B2]"
                                                    />
                                                    <Check className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={4} />
                                                </div>
                                                <label htmlFor="modal-booking-terms" className="text-[10px] sm:text-xs font-semibold text-slate-500 leading-tight select-none">
                                                    I agree to the <span className="text-[#0066B2] font-bold">Terms & Conditions</span> and Acknowledge the Privacy Policy.
                                                </label>
                                            </div>
                                            {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}

                                            {/* Error Message */}
                                            {submitError && (
                                                <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">{submitError}</p>
                                            )}

                                            {/* Submit Button */}
                                            <Button
                                                variant="primary"
                                                size="lg"
                                                className="w-full mt-2"
                                                disabled={isSubmitting || !formData.consent}
                                                type="submit"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin mr-2" />
                                                        Processing...
                                                    </>
                                                ) : 'Confirm Booking'}
                                            </Button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
});

BookingModal.displayName = 'BookingModal';

BookingModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    gameId: PropTypes.string,
    score: PropTypes.number,
    category: PropTypes.object,
    riskGaps: PropTypes.array,
    initialName: PropTypes.string,
    initialMobile: PropTypes.string
};

export default BookingModal;
