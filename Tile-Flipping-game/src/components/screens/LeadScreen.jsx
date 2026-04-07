import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { SCREENS } from '../../constants/game';
import { submitToLMS } from '../../utils/api';
import styles from './LeadScreen.module.css';
import TermsModal from '../modals/TermsModal';

// Importing UI components
import Button from '../ui/Button';
import { FormInput, Checkbox } from '../ui/FormFields';

const LeadScreen = () => {
    const { navigate, setUser } = useGame();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        else if (!/^[A-Za-z\s]+$/.test(name.trim())) newErrors.name = 'Letters only';

        if (!/^[6-9]\d{9}$/.test(phone)) newErrors.phone = 'Invalid 10-digit number';

        if (!isTermsAccepted) newErrors.terms = 'Please accept terms';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const result = await submitToLMS({
                name: name.trim(),
                mobile_no: phone,
                summary_dtls: 'Tile Flipping Game - Post Game Lead'
            });

            if (result.success) {
                const responseData = result.data || result;
                if (responseData.leadNo || responseData.LeadNo) {
                    sessionStorage.setItem('tileFlippingLeadNo', responseData.leadNo || responseData.LeadNo);
                }
                sessionStorage.setItem('tileFlippingUserName', name.trim());

                // Update global state
                setUser({ name: name.trim(), phone: phone });

                navigate(SCREENS.SCORE);
            } else {
                setErrors({ submit: result.error || 'Submission failed' });
            }
        } catch (err) {
            setErrors({ submit: 'Something went wrong' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`screen ${styles.intro}`}>
            <div className={`screen-inner ${styles.inner}`}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className={styles.card}
                >
                    <div className={styles.header}>
                        <h2 className={styles.title}>
                            Enter Details
                        </h2>
                        <p className={styles.subtitle}>To see the results</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <FormInput
                            label="Your Name"
                            id="lead-name"
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                            placeholder="Full Name"
                            error={errors.name}
                        />

                        <FormInput
                            label="Mobile Number"
                            id="lead-phone"
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            error={errors.phone}
                        />

                        <Checkbox
                            id="lead-terms"
                            label='I agree and consent to the <span class="terms-link" style="color: #F97316; font-weight: 900; text-decoration: underline; cursor: pointer;">T&C and Privacy Policy</span>'
                            checked={isTermsAccepted}
                            onChange={setIsTermsAccepted}
                            onClickLabel={() => setIsTermsModalOpen(true)}
                        />

                        <Button
                            type="submit"
                            loading={isSubmitting}
                            className={styles.submitBtn}
                            fullWidth
                            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            See Results!
                        </Button>

                        {errors.submit && <p className="form-error" style={{ textAlign: 'center', marginTop: '1rem' }}>{errors.submit}</p>}
                        {errors.terms && !isTermsAccepted && <p className="form-error" style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '10px', color: '#EF4444', fontWeight: '900' }}>{errors.terms}</p>}
                    </form>
                </motion.div>
            </div>

            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </div>
    );
};

export default LeadScreen;
