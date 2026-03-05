import { useState, useCallback } from 'react';
import { submitLead } from '../services/leadService.js';
import { useNavigate } from 'react-router-dom';

const initialForm = {
    fullName: '',
    mobile: '',
    preferredDate: '',
    preferredTime: '',
};

const initialErrors = {
    fullName: '',
    mobile: '',
    preferredDate: '',
    preferredTime: '',
};

function validate(fields) {
    const errors = { ...initialErrors };
    let valid = true;

    if (!fields.fullName.trim() || fields.fullName.trim().length < 2) {
        errors.fullName = 'Please enter your full name (min 2 characters)';
        valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(fields.fullName.trim())) {
        errors.fullName = 'Name should contain only alphabets';
        valid = false;
    }

    if (!fields.mobile.trim()) {
        errors.mobile = 'Mobile number is required';
        valid = false;
    } else if (!/^[6-9]\d{9}$/.test(fields.mobile.trim())) {
        errors.mobile = 'Enter a valid 10-digit Indian mobile number';
        valid = false;
    }

    if (!fields.preferredDate) {
        errors.preferredDate = 'Please select a preferred date';
        valid = false;
    } else {
        // Prevent back-dated bookings (iOS Safari ignores HTML min attribute)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(fields.preferredDate + 'T00:00:00');
        if (selected < today) {
            errors.preferredDate = 'Please select today or a future date';
            valid = false;
        }
    }

    if (!fields.preferredTime) {
        errors.preferredTime = 'Please select a preferred time';
        valid = false;
    }

    return { errors, valid };
}

/**
 * Lead form state and submission logic.
 */
export function useLeadForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState(initialErrors);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear field error on change
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setApiError('');
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const { errors: newErrors, valid } = validate(form);
        setErrors(newErrors);
        if (!valid) return;

        setLoading(true);
        setApiError('');
        try {
            await submitLead(form);
            setSubmitted(true);
            setTimeout(() => {
                navigate('/thank-you', { replace: true });
            }, 800);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                'Something went wrong. Please try again.';
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    }, [form, navigate]);

    return { form, errors, loading, apiError, submitted, handleChange, handleSubmit };
}
