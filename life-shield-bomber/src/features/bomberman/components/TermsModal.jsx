import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-[#1e1b4b] rounded-[2.5rem] p-8 w-full max-w-[380px] shadow-[0_0_50px_rgba(59,130,246,0.5)] relative border-4 border-[#60a5fa] z-[501] overflow-hidden text-left"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-blue-300 flex-50 hover:text-[#60a5fa] transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-white text-2xl font-black tracking-tight uppercase italic leading-tight">
                                Terms & <span className="text-[#60a5fa]">Conditions</span>
                            </h2>
                        </div>

                        <div className="space-y-4 text-blue-100/80 text-[10px] font-medium leading-relaxed max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            <p>
                                I hereby authorize Bajaj Life Insurance Limited. to call me on the contact number made available by me on the website with a specific request to call back.
                            </p>
                            <p>
                                I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.
                            </p>
                            <p>
                                Please refer to Bajaj Life <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#60a5fa] underline font-bold">Privacy Policy</a>.
                            </p>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={onClose}
                                className="w-full h-14 bg-[#60a5fa] hover:bg-[#3b82f6] text-[#1e1b4b] font-black text-lg tracking-widest transition-all duration-300 shadow-lg rounded-2xl border-none uppercase italic"
                            >
                                I Agree
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TermsModal;
