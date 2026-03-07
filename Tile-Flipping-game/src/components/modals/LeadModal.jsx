import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { useGame, ACTION } from '../../context/GameContext';
import { useGameEngine } from '../../hooks/useGameEngine';
import { submitToLMS, updateLeadNew } from '../../utils/api';
import { SCREENS } from '../../constants/game';
import styles from './LeadModal.module.css';

export default function LeadModal({
    onClose,
    title = "Welcome!",
    subtitle = "Enter your details to start.",
    shouldSubmit = true,
    summaryDtls = "Lead from Welcome Screen",
    isBooking = false
}) {
    const { state, setUser, setBooking, navigate, dispatch } = useGame();
    const { user, booking } = state;
    const { initGame } = useGameEngine();

    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [preferredDate, setPreferredDate] = useState(booking.preferredDate || '');
    const [preferredTime, setPreferredTime] = useState(booking.preferredTime || '');
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [showTerms, setShowTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNameSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (phone.length !== 10) newErrors.phone = 'Enter valid 10-digit number';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Save user data
            setUser({ name, phone });
            if (isBooking) {
                setBooking({ preferredDate, preferredTime });
            }

            if (shouldSubmit) {
                // Submit to real API
                if (isBooking && user.leadNo) {
                    const payload = {
                        name,
                        mobile: phone,
                        date: preferredDate,
                        time: preferredTime,
                        remarks: `${summaryDtls} | Pref Date: ${preferredDate} | Pref Time: ${preferredTime}`
                    };
                    console.log("[LeadModal] Calling updateLeadNew with:", payload);
                    await updateLeadNew(user.leadNo, payload);
                    dispatch({ type: ACTION.MARK_SUBMITTED });

                    // Navigate to Thank You screen
                    navigate(SCREENS.THANK_YOU);
                } else {
                    const payload = {
                        name,
                        mobile_no: phone,
                        summary_dtls: summaryDtls
                    };
                    console.log("[LeadModal] Calling submitToLMS with:", payload);
                    const result = await submitToLMS(payload);
                    const responseData = result?.data || result;
                    if (result && result.success && (responseData.leadNo || responseData.LeadNo)) {
                        setUser({ name, phone, leadNo: responseData.leadNo || responseData.LeadNo });
                    }
                    dispatch({ type: ACTION.MARK_SUBMITTED });
                }
            }

            if (!isBooking) {
                console.log("[LeadModal] Starting game after lead submission...");
                initGame();
                navigate(SCREENS.GAME);
            }
        } catch (error) {
            console.error("[LeadModal] Submission Error:", error);
            // On intro, allow playing even if API fails
            if (!isBooking) {
                initGame();
                navigate(SCREENS.GAME);
            }
        } finally {
            setIsSubmitting(false);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.overlay}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.modal}
                >
                    <button
                        onClick={onClose}
                        className={styles.closeBtn}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className={styles.header}>
                        <div className={styles.iconWrapper}>
                            <span className={styles.iconEmoji}>👋</span>
                        </div>
                        <h2 className={styles.title}>{title}</h2>
                        <p className={styles.subtitle}>{subtitle}</p>
                    </div>

                    <form onSubmit={handleNameSubmit} className={styles.form}>
                        {/* Name Field */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="userName">
                                Your Name
                            </label>
                            <input
                                id="userName"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^[A-Za-z\s]*$/.test(val)) {
                                        setName(val);
                                        if (errors.name) setErrors({ ...errors, name: '' });
                                    }
                                }}
                                placeholder="Full Name"
                                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                                autoFocus
                            />
                            {errors.name && (
                                <p className={styles.errorText}>{errors.name}</p>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="phone">
                                Mobile Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                maxLength={10}
                                value={phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    if (val === '' || /^[6-9]/.test(val)) {
                                        setPhone(val);
                                        if (errors.phone) setErrors({ ...errors, phone: '' });
                                    }
                                }}
                                placeholder="9876543210"
                                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                            />
                            {errors.phone && (
                                <p className={styles.errorText}>{errors.phone}</p>
                            )}
                        </div>

                        {/* Preferred Date & Time (Conditional) */}
                        {isBooking && (
                            <div className={styles.bookingFields}>
                                <div className={styles.field}>
                                    <label className={styles.label} htmlFor="preferredDate">
                                        Preferred Date
                                    </label>
                                    <input
                                        id="preferredDate"
                                        type="date"
                                        value={preferredDate}
                                        onChange={(e) => setPreferredDate(e.target.value)}
                                        className={styles.input}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label} htmlFor="preferredTime">
                                        Preferred Time
                                    </label>
                                    <select
                                        id="preferredTime"
                                        value={preferredTime}
                                        onChange={(e) => setPreferredTime(e.target.value)}
                                        className={styles.input}
                                    >
                                        <option value="">Select Slot</option>
                                        <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                                        <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                                        <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                                        <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                                        <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                                        <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                                        <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                                        <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                                        <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                                        <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                                        <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                                        <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Terms Checkbox */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                            <div className={styles.termsRow}>
                                <div
                                    onClick={() => {
                                        setTermsAccepted(!termsAccepted);
                                        setErrors(prev => ({ ...prev, terms: null }));
                                    }}
                                    className={`${styles.customCheckboxBox} ${termsAccepted ? styles.customCheckboxBoxChecked : ''}`}
                                >
                                    {termsAccepted && <Check className={styles.customCheckboxIcon} strokeWidth={4} />}
                                </div>
                                <div className={styles.customCheckboxText}>
                                    I agree to the{' '}
                                    <button type="button" onClick={() => setShowTerms(true)} className={styles.termsLink}>
                                        Terms & Conditions
                                    </button>{' '}
                                    and allow Bajaj Life Insurance to contact me even if registered on DND.
                                </div>
                            </div>
                            {errors.terms && (
                                <p className={styles.errorText} style={{ marginLeft: '4px' }}>{errors.terms}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!name.trim() || phone.length !== 10 || (isBooking && (!preferredDate || !preferredTime)) || !termsAccepted || isSubmitting}
                            className={styles.submitBtn}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className={styles.spinner} />
                                    <span>{isBooking ? "Booking..." : "Starting..."}</span>
                                </>
                            ) : (
                                isBooking ? "Book a Slot" : "Let's Go!"
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Terms Popup Overlay */}
                <AnimatePresence>
                    {showTerms && (
                        <div className={styles.termsOverlay} onClick={() => setShowTerms(false)}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className={styles.termsModal}
                            >
                                <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-2">
                                    <h3 className="text-[#0066B2] text-xl font-black uppercase tracking-tight">
                                        Terms & Conditions
                                    </h3>
                                    <button
                                        onClick={() => setShowTerms(false)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-slate-600 font-bold text-xs min-[375px]:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-200">
                                    <p>I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.</p>
                                    <p>Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#0066B2] underline">BALIC Privacy Policy</a>.</p>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => { setShowTerms(false); setTermsAccepted(true); }}
                                        className="w-full mt-6 py-3 bg-[#0066B2] text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm uppercase tracking-wider"
                                    >
                                        I Agree
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}
