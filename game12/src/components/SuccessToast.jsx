import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const SuccessToast = ({ message, onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
            >
                <div className="bg-green-50 border-2 border-green-500 shadow-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <p className="text-green-800 font-medium text-sm flex-1">{message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SuccessToast;
