import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#001e3a]/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-[#003366] rounded-[3rem] p-8 w-full max-w-[400px] shadow-[0_0_60px_rgba(251,191,36,0.2)] relative border-[3px] border-[#fbbf24] z-[3001] overflow-hidden"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-blue-200/50 hover:text-[#fbbf24] transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-[#fbbf24] text-2xl font-black tracking-tight uppercase italic leading-tight">
                                Terms & Conditions
                            </h2>
                        </div>

                        <div className="space-y-4 text-blue-100 text-[10px] font-medium leading-relaxed max-h-[350px] overflow-y-auto pr-2 custom-scrollbar text-left opacity-90">
                            <p>
                                I hereby authorize Bajaj Life Insurance Limited. to call me on the contact number made available by me on the website with a specific request to call back.
                            </p>
                            <p>
                                I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.
                            </p>
                            <p>
                                Please refer to Bajaj Life <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#fbbf24] underline font-bold">Privacy Policy</a>.
                            </p>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={onClose}
                                className="w-full h-14 bg-[#fbbf24] hover:bg-[#fcd34d] text-[#003366] font-black text-lg tracking-[0.1em] transition-all duration-300 shadow-lg rounded-2xl border-none uppercase italic"
                            >
                                I AGREE
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TermsModal;
