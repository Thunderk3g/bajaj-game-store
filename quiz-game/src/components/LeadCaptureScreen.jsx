import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import TermsModal from './TermsModal';
import gstBackground from '../assets/gst_background.png';

const LeadCaptureScreen = () => {
    const { onLeadSubmit, isTermsAccepted, setIsTermsAccepted } = useQuiz();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
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
        const result = await onLeadSubmit(name, phone);
        setIsSubmitting(false);

        if (!result.success) {
            setErrors({ submit: result.error || 'Something went wrong' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#005EB8]"
        >
            {/* Background Image with Overlay - Same as QuestionScreen */}
            <div className="absolute inset-0 z-0">
                <img
                    src={gstBackground}
                    alt=""
                    className="w-full h-full object-cover opacity-30 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#005EB8]/80 via-transparent to-[#005EB8]/90" />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-[340px] shadow-2xl relative border-[5px] border-[#005BAC]/50"
            >
                <div className="text-center mb-8">
                    <h2 className="text-[#005BAC] text-2xl font-black mb-1 tracking-tight uppercase leading-tight">
                        Enter Details
                    </h2>
                    <p className="text-slate-500 font-bold text-lg text-center">To see the results</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5 text-left">
                        <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest ml-1">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                            placeholder="Full Name"
                            className={`w-full bg-gray-50 border-4 rounded-xl px-5 py-3 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${errors.name ? 'border-red-500' : 'border-slate-50 focus:border-[#005BAC]/30'}`}
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest ml-1">Mobile Number</label>
                        <input
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className={`w-full bg-gray-50 border-4 rounded-xl px-5 py-3 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-slate-50 focus:border-[#005BAC]/30'}`}
                        />
                        {errors.phone && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.phone}</p>}
                    </div>

                    <div className="flex items-start gap-3 py-1">
                        <div
                            onClick={() => setIsTermsAccepted(!isTermsAccepted)}
                            className={`mt-0.5 shrink-0 w-6 h-6 border-2 flex items-center justify-center rounded-md cursor-pointer transition-all ${isTermsAccepted ? 'bg-[#005BAC] border-[#005BAC]' : 'bg-white border-slate-300'}`}
                        >
                            {isTermsAccepted && <span className="text-white font-black text-xs">✓</span>}
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 leading-snug text-left">
                            I agree and consent to the <span onClick={() => setIsTermsModalOpen(true)} className="text-[#005BAC] underline font-black cursor-pointer hover:text-[#004c85] transition-colors">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-xl text-lg tracking-widest disabled:opacity-50 text-white uppercase font-black transition-all duration-300 shadow-lg active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg, #005BAC 0%, #004c85 100%)' }}
                    >
                        {isSubmitting ? 'Loading...' : 'See Results!'}
                    </button>

                    {errors.submit && <p className="text-red-500 text-sm font-black text-center mt-2">{errors.submit}</p>}
                    {errors.terms && !isTermsAccepted && <p className="text-red-500 text-[10px] font-black uppercase text-center">{errors.terms}</p>}
                </form>
            </motion.div>

            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </motion.div>
    );
};

export default LeadCaptureScreen;
