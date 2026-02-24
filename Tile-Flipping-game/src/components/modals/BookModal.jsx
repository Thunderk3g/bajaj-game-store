import { useState } from 'react';
import Modal from '../ui/Modal';
import { FormInput, Checkbox } from '../ui/FormFields';
import Button from '../ui/Button';
import { useGame } from '../../context/GameContext';
import { bookSlot } from '../../services/api';
import { SCREENS } from '../../constants/game';

function validate(name, phone, date, time, agreed) {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!name.trim()) errors.name = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(phone.trim())) errors.phone = 'Enter a valid 10-digit number';
    if (!date) errors.date = 'Please pick a date';
    else if (date < today) errors.date = 'Date must be today or later';
    if (!time) errors.time = 'Please pick a time';
    if (!agreed) errors.agreed = 'Please accept the terms to proceed';
    return errors;
}

export default function BookModal({ onClose, showToast }) {
    const { state, setBooking, navigate } = useGame();
    const { user } = state;

    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [agreed, setAgreed] = useState(true);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validate(name, phone, date, time, agreed);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        try {
            await bookSlot({ name, phone, preferredDate: date, preferredTime: time });
            setBooking({ preferredDate: date, preferredTime: time });
            navigate(SCREENS.THANK_YOU);
        } catch {
            showToast?.('Booking failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal closeOnOverlay onClose={onClose}>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

            <div style={{ textAlign: 'center', fontSize: 36, marginBottom: 8 }}>📅</div>
            <div className="modal-title">Book Your Free Slot</div>
            <div className="modal-subtitle">Schedule a free consultation with our expert advisor.</div>

            <form onSubmit={handleSubmit} noValidate>
                <FormInput id="book-name" label="Your Name" value={name}
                    onChange={(e) => setName(e.target.value)} error={errors.name} />
                <FormInput id="book-phone" label="Phone Number" type="tel" inputMode="numeric"
                    value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} maxLength={10} />
                <FormInput id="book-date" label="Preferred Date" type="date"
                    min={today} value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
                <FormInput id="book-time" label="Preferred Time" type="time"
                    value={time} onChange={(e) => setTime(e.target.value)} error={errors.time} />
                <Checkbox id="book-tc"
                    label='I agree to the <a href="#" onclick="event.preventDefault()">Terms and Conditions</a>.'
                    checked={agreed} onChange={setAgreed} />
                {errors.agreed && <div className="form-error">{errors.agreed}</div>}

                <div style={{ height: 8 }} />
                <Button type="submit" variant="secondary" fullWidth loading={loading} id="btn-book-submit">
                    {!loading && 'Confirm My Slot ✅'}
                </Button>
            </form>
        </Modal>
    );
}
