import React, { useState } from 'react';
import { ChevronLeft, User, Phone, Clock, CheckCircle } from 'lucide-react';
import { submitToLMS } from '../../services/api';

const LeadCaptureForm = ({ score, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) errs.name = 'Invalid name';

        if (!/^[6-9]\d{9}$/.test(formData.mobile)) errs.mobile = 'Invalid 10-digit number';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const result = await submitToLMS({
                name: formData.name,
                mobile_no: formData.mobile,
                score: score,
                summary_dtls: 'Snake Life - Post Game Lead',
            });
            if (result.success) {
                onSuccess({
                    name: formData.name,
                    phone: formData.mobile
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center p-6 bg-[#0B1221] animate-fade-in relative z-[100]">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-[340px] shadow-2xl relative border-[5px] border-[#31CDEC] transition-all transform scale-100 translate-y-[-20px]">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-[#0B1221] leading-tight tracking-tight mb-2">
                        Enter Your Details
                    </h2>
                    <p className="text-gray-400 font-bold text-sm">
                        to reveal your score
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Full Name"
                            className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500' : 'border-slate-100 focus:border-[#31CDEC]'}`}
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-black ml-2">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                            Mobile Number
                        </label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                            placeholder="9876543210"
                            className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${errors.mobile ? 'border-red-500' : 'border-slate-100 focus:border-[#31CDEC]'}`}
                        />
                        {errors.mobile && <p className="text-red-500 text-[10px] font-black ml-2">{errors.mobile}</p>}
                    </div>

                    <div className="flex items-start gap-3 py-1">
                        <div className="mt-0.5 shrink-0 w-6 h-6 bg-[#31CDEC] border-2 border-[#31CDEC] flex items-center justify-center rounded-md">
                            <span className="text-white font-black text-xs">✓</span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 leading-snug text-left">
                            I agree and consent to the <span className="text-[#31CDEC] underline font-black">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#31CDEC] text-white font-black text-lg py-4 rounded-2xl shadow-xl active:translate-y-[2px] transition-all disabled:opacity-50 tracking-widest"
                    >
                        {isSubmitting ? 'LOADING...' : 'SEE RESULTS!'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LeadCaptureForm;
