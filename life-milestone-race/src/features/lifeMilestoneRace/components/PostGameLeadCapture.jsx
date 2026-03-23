import { useState } from 'react';
import { motion } from 'framer-motion';
import { submitToLMS } from '../../../utils/api';

const PostGameLeadCapture = ({ onSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                summary_dtls: 'Life Milestone Race - Post Game Lead'
            });

            if (result.success) {
                const responseData = result.data || result;
                if (responseData.leadNo || responseData.LeadNo) {
                    sessionStorage.setItem('lifeMilestoneRaceLeadNo', responseData.leadNo || responseData.LeadNo);
                }
                onSuccess(name.trim(), phone);
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-[340px] shadow-2xl relative border-[5px] border-[#0066B2]"
            >
                <div className="text-center mb-8">
                    <h2 className="text-[#0066B2] text-2xl font-black mb-1 tracking-tight uppercase leading-tight text-left">
                        Enter Your Details
                    </h2>
                    <p className="text-slate-500 font-bold text-lg text-left">to reveal your score</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-1.5">
                        <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest ml-1">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                            placeholder="Full Name"
                            className={`w-full bg-gray-50 border-4 rounded-xl px-5 py-3 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500' : 'border-slate-100 focus:border-[#0066B2]'}`}
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest ml-1">Mobile Number</label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className={`w-full bg-gray-50 border-4 rounded-xl px-5 py-3 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-slate-100 focus:border-[#0066B2]'}`}
                        />
                        {errors.phone && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.phone}</p>}
                    </div>

                    <div className="flex items-start gap-3 py-1">
                        <div
                            onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                            className={`mt-0.5 shrink-0 w-6 h-6 border-2 flex items-center justify-center rounded-md cursor-pointer transition-all ${isTermsAccepted ? 'bg-[#0066B2] border-[#0066B2]' : 'bg-white border-slate-300'}`}
                        >
                            {isTermsAccepted && <span className="text-white font-black text-xs">✓</span>}
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 leading-snug">
                            I agree and consent to the <span className="text-[#0066B2] underline font-black">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-xl text-lg tracking-widest disabled:opacity-50 text-white uppercase font-black transition-all duration-300 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #0066B2 0%, #004c85 100%)' }}
                    >
                        {isSubmitting ? 'Reveal Results...' : 'Reveal Score!'}
                    </button>

                    {errors.submit && <p className="text-red-500 text-sm font-black text-center mt-2">{errors.submit}</p>}
                </form>
            </motion.div>
        </motion.div>
    );
};

export default PostGameLeadCapture;
