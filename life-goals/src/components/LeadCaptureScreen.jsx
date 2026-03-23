import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

const LeadCaptureScreen = ({ score, onSubmit, isSubmitting }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!name.trim()) errs.name = 'Name is required';
        else if (!/^[A-Za-z\s]+$/.test(name.trim())) errs.name = 'Invalid name';

        if (!/^[6-9]\d{9}$/.test(phone)) errs.phone = 'Invalid 10-digit number';

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
                            onChange={(e) => setName(e.target.value)}
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

                    <div className="flex items-start gap-3 py-1">
                        <div className="mt-0.5 shrink-0 w-6 h-6 bg-[#00B4D8] border-2 border-[#00B4D8] flex items-center justify-center rounded-md">
                            <span className="text-white font-black text-xs">✓</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 leading-snug text-left">
                            I agree and consent to the <span className="text-[#00B4D8] underline font-black">T&C and Privacy Policy</span>
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-xl text-lg tracking-widest disabled:opacity-50 text-white uppercase font-black transition-all duration-300 shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #0077b6 100%)' }}
                    >
                        {isSubmitting ? 'Loading...' : 'See Results!'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default LeadCaptureScreen;
