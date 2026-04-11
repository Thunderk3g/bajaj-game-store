import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';
import TermsModal from './TermsModal';

const LeadCaptureScreen = ({ score, onSubmit, isSubmitting }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);
    const [errors, setErrors] = useState({});
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Name is required';
        else if (!/^[A-Za-z\s]+$/.test(name.trim())) errs.name = 'Letters only';

        if (!/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Invalid 10-digit number';

        if (!isTermsAccepted) errs.terms = 'Please agree to Terms and Conditions';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const result = await onSubmit({ name: name.trim(), phone });
        if (result && result.success) {
            // Screen transition handled by parent state update
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative bg-white shadow-2xl w-full max-w-[340px] p-8 border-[6px] border-[#00B4D8] rounded-[2rem]"
            >
                <div className="text-center mb-8">
                    <h2 className="text-[#005BAC] text-2xl font-black mb-1 tracking-tight uppercase">Enter Your Details</h2>
                    <p className="text-slate-500 font-bold text-lg">to reveal your score</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5 text-left">
                        <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest ml-1">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                            placeholder="Full Name"
                            className={`w-full px-4 py-3 border-4 ${errors.name ? 'border-red-400' : 'border-slate-100'} focus:border-[#00B4D8] focus:outline-none text-slate-800 font-bold text-base transition-all rounded-xl`}
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
                            className={`w-full px-4 py-3 border-4 ${errors.phone ? 'border-red-400' : 'border-slate-100'} focus:border-[#00B4D8] focus:outline-none text-slate-800 font-bold text-base transition-all rounded-xl`}
                        />
                        {errors.phone && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{errors.phone}</p>}
                    </div>

                    <div className="flex items-start gap-3 py-1 text-left">
                        <div
                            onClick={() => {
                                const newVal = !isTermsAccepted;
                                setIsTermsAccepted(newVal);
                                if (errors.terms && newVal) setErrors(prev => ({ ...prev, terms: null }));
                            }}
                            className={`mt-0.5 shrink-0 w-6 h-6 border-2 flex items-center justify-center rounded-md cursor-pointer transition-all ${isTermsAccepted ? 'bg-[#00B4D8] border-[#00B4D8]' : errors.terms ? 'bg-white border-red-500 ring-2 ring-red-100' : 'bg-white border-slate-300'}`}
                        >
                            {isTermsAccepted && <span className="text-white font-black text-xs">✓</span>}
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 leading-snug">
                            I agree and consent to the <span onClick={() => setIsTermsModalOpen(true)} className="text-[#00B4D8] underline font-black cursor-pointer hover:text-[#0077b6] transition-colors">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-xl text-lg tracking-widest disabled:opacity-50 text-white uppercase font-black transition-all duration-300 shadow-lg active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #0077b6 100%)' }}
                    >
                        {isSubmitting ? 'Loading...' : 'See Results!'}
                    </button>
                    {errors.terms && !isTermsAccepted && <p className="text-red-500 text-[10px] font-black uppercase text-center">{errors.terms}</p>}
                </form>
            </motion.div>

            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
        </motion.div>
    );
};

export default LeadCaptureScreen;
