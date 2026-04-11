import { useState } from 'react';
import Modal from '../ui/Modal';
import { FormInput, Checkbox } from '../ui/FormFields';
import Button from '../ui/Button';
import { useGame } from '../../context/GameContext';
import { submitToLMS, updateLeadNew } from '../../utils/api';
import { SCREENS } from '../../constants/game';

function validate(name, phone, date, time, agreed) {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!name.trim()) errors.name = 'Name is required';
    if (!/^[6-9]\d{9}$/.test(phone.trim())) errors.phone = 'Enter a valid 10-digit number';
    if (!date) errors.date = 'Please pick a date';
    else if (date < today) errors.date = 'Date must be today or later';
    if (!time) errors.time = 'Please pick a time';
    if (!agreed) errors.agreed = 'Please agree to Terms and Conditions';
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
            const leadNo = user.leadNo;
            if (leadNo) {
                await updateLeadNew(leadNo, {
                    firstName: name,
                    mobile: phone,
                    date: date,
                    time: time,
                    remarks: `Tile Flipping Game Slot Booking`
                });
            } else {
                await submitToLMS({
                    name: name,
                    mobile_no: phone,
                    param4: date,
                    param19: time,
                    summary_dtls: 'Tile Flipping Game - Slot Booking',
                    p_data_source: 'TILE_FLIPPING_BOOKING',
                });
            }
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
                <FormInput
                    id="book-date"
                    label="Preferred Date"
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    error={errors.date}
                />
                <FormInput id="book-time" label="Preferred Time" type="time"
                    value={time} onChange={(e) => {
                        const newTime = e.target.value;
                        const t = new Date();
                        const isToday = date === today;
                        if (isToday) {
                            const [h, m] = newTime.split(':').map(Number);
                            if (h < t.getHours() || (h === t.getHours() && m <= t.getMinutes())) {
                                setErrors(prev => ({ ...prev, time: 'Please select a future time for today' }));
                            } else {
                                setErrors(prev => ({ ...prev, time: null }));
                            }
                        }
                        setTime(newTime);
                    }} error={errors.time} />
                <Checkbox id="book-tc"
                    label='I agree and consent to the <a href="#" class="terms-link" onclick="event.preventDefault()">T&C and Privacy Policy</a>.'
                    checked={agreed} onChange={setAgreed} error={errors.agreed} />
                {errors.agreed && <div className="form-error" style={{ marginTop: '-12px', marginLeft: '32px' }}>{errors.agreed}</div>}

                <div style={{ height: 8 }} />
                <Button type="submit" variant="secondary" fullWidth loading={loading} id="btn-book-submit">
                    {!loading && 'Confirm Booking'}
                </Button>
            </form>
        </Modal>
    );
}
