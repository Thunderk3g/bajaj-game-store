import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { submitToLMS, updateLeadNew } from '../utils/api';

export default function BookingModal({ isOpen, onClose, onSubmit, initialName, initialMobile, leadNo, score }) {
    const [formData, setFormData] = useState({ name: initialName || '', mobile: initialMobile || '', date: '', time: '' });
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (field, val) => {
        setFormData(p => ({ ...p, [field]: val }));
        if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
    };

    const validate = () => {
        const errs = {};

        // 1. Name Validation: Letters and spaces only
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!formData.name.trim()) {
            errs.name = "Name is required";
        } else if (!nameRegex.test(formData.name.trim())) {
            errs.name = "Name must contain only letters (no numbers or special characters)";
        }

        // 2. Mobile Validation: Exact 10 digits
        if (!/^\d{10}$/.test(formData.mobile)) {
            errs.mobile = "Please enter a valid 10-digit mobile number";
        }

        // 3. Date Validation: Required
        if (!formData.date) {
            errs.date = "Preferred Date is required";
        } else {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                errs.date = "Date cannot be in the past";
            }
        }

        // 4. Time Validation
        if (!formData.time) errs.time = "Preferred Time is required";

        // 5. Terms Validation
        if (!termsAccepted) {
            errs.terms = "Please accept the terms";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        try {
            let result;
            if (leadNo) {
                const payload = {
                    firstName: formData.name.trim(),
                    mobile: formData.mobile,
                    date: formData.date,
                    time: formData.time,
                    remarks: `Retirement Game Slot Booking | Score: ${score}`
                };
                result = await updateLeadNew(leadNo, payload);
            } else {
                const payload = {
                    name: formData.name.trim(),
                    mobile_no: formData.mobile,
                    param4: formData.date,
                    param19: formData.time,
                    score: score || null,
                    summary_dtls: "Retirement Game Slot Booking",
                    p_data_source: "RETIREMENT_GAME_BOOKING"
                };
                result = await submitToLMS(payload);
            }

            if (result.success) {
                if (onSubmit) onSubmit(formData);
                onClose();
            } else {
                alert("Submission failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white p-6 w-full max-w-sm shadow-2xl relative border-4 border-white/50 z-10 rounded-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors bg-slate-100 p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex justify-center mb-2 text-[#FF8C00]">
                            <Calendar className="w-8 h-8" />
                        </div>

                        <h2 className="text-[#0066B2] font-black text-center mb-6 text-sm sm:text-base uppercase tracking-tight pt-1">
                            Book a convenient slot
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (/^[A-Za-z\s]*$/.test(val)) {
                                            updateField('name', val);
                                        }
                                    }}
                                    className="w-full bg-slate-50 h-11 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-200 text-sm font-bold px-4 transition-colors rounded-lg"
                                    placeholder="Full Name"
                                />
                                {errors.name && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.name}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={e => {
                                        const rawVal = e.target.value;
                                        if (rawVal.length < formData.mobile.length) {
                                            updateField('mobile', rawVal);
                                            return;
                                        }

                                        const val = rawVal.replace(/\D/g, '').slice(0, 10);
                                        if (val === '') {
                                            updateField('mobile', '');
                                        } else {
                                            if (['6', '7', '8', '9'].includes(val[0])) {
                                                updateField('mobile', val);
                                            }
                                        }
                                    }}
                                    className="w-full bg-slate-50 h-11 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-200 text-sm font-bold px-4 transition-colors rounded-lg"
                                    placeholder="9876543210"
                                />
                                {errors.mobile && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.mobile}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Date</label>
                                    <input
                                        type="date"
                                        min={todayStr}
                                        value={formData.date}
                                        onChange={e => updateField('date', e.target.value)}
                                        className="w-full bg-slate-50 h-11 border-2 border-slate-100 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-blue-200 text-xs font-bold px-4 transition-colors rounded-lg"
                                    />
                                    {errors.date && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.date}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Time</label>
                                    <select
                                        value={formData.time}
                                        onChange={e => updateField('time', e.target.value)}
                                        className="w-full bg-slate-50 h-11 border-2 border-slate-100 text-slate-800 focus:outline-none focus:border-blue-200 text-xs font-bold px-4 appearance-none transition-colors rounded-lg"
                                    >
                                        <option value="">Select Slot</option>
                                        {[...Array(12)].map((_, i) => {
                                            const start = 9 + i;
                                            const end = start + 1;
                                            const formatTime = (h) => {
                                                const amp = h >= 12 ? 'PM' : 'AM';
                                                const hour = h > 12 ? h - 12 : h;
                                                return `${hour}:00 ${amp}`;
                                            };
                                            const label = `${formatTime(start)} - ${formatTime(end)}`;
                                            return <option key={start} value={label}>{label}</option>;
                                        })}
                                    </select>
                                    {errors.time && <span className="text-[10px] text-red-500 ml-1 font-black uppercase tracking-wider">{errors.time}</span>}
                                </div>
                            </div>

                            <div className="flex items-start bg-slate-50 p-3 rounded-lg border-2 border-slate-100 gap-3">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => {
                                            setTermsAccepted(e.target.checked);
                                            if (errors.terms) setErrors(p => ({ ...p, terms: null }));
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-[#0066B2] focus:ring-[#0066B2] cursor-pointer"
                                    />
                                </div>
                                <label className="text-[10px] sm:text-xs text-slate-500 leading-tight">
                                    I authorize Bajaj Life Insurance to contact me for this request, overriding DND registry.
                                </label>
                            </div>
                            {errors.terms && <div className="text-[10px] text-red-500 font-black uppercase tracking-wider text-center">{errors.terms}</div>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#FF8C00] hover:bg-[#FF7000] text-white font-black py-4 shadow-[0_6px_0_#993D00] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest text-sm mt-2 border-2 border-white/20 rounded-xl"
                            >
                                {isSubmitting ? 'Confirming...' : 'Book a Slot'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
