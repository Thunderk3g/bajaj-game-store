import { memo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { useGame } from '../features/game/context/GameContext.jsx';
import { submitToLMS } from '../utils/api';
import coverImage from '../assets/images/Cover-Image.png';

/**
 * Full-screen cover intro page.
 * Clicking "Start" opens the lead-capture popup.
 * On successful form submit → startGame() + navigate to /game.
 */
const IntroPage = memo(function IntroPage() {
    const { startGame } = useGame();
    const navigate = useNavigate();

    // ── Lead-capture form state ──────────────────────────────────────────────
    const [showNamePopup, setShowNamePopup] = useState(false);
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [showTerms, setShowTerms] = useState(false);
    const phoneInputRef = useRef(null);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSubmittedPhone, setLastSubmittedPhone] = useState(
        () => sessionStorage.getItem('lastSubmittedPhone') || null
    );

    // Toast
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (lastSubmittedPhone) {
            sessionStorage.setItem('lastSubmittedPhone', lastSubmittedPhone);
        }
    }, [lastSubmittedPhone]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    const showToastMessage = (message, type = 'error') =>
        setToast({ message, type });

    // ── Validation ───────────────────────────────────────────────────────────
    const validateField = (field, value) => {
        let errorMsg = '';
        if (field === 'name') {
            if (!value.trim()) errorMsg = 'Please enter your name';
            else if (!/^[A-Za-z\s]+$/.test(value.trim()))
                errorMsg = 'Name must contain only letters.';
        } else if (field === 'phone') {
            if (!value) errorMsg = 'Please enter mobile number';
            else if (!/^\d{10}$/.test(value))
                errorMsg = 'Enter a valid 10-digit mobile number';
        }
        if (errorMsg) {
            setErrors(prev => ({ ...prev, [field]: errorMsg }));
            return false;
        }
        setErrors(prev => ({ ...prev, [field]: '' }));
        return true;
    };

    const validateForm = () =>
        validateField('name', userName) & validateField('phone', phone); // bitwise keeps both running

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleNameSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm() || !termsAccepted) return;

        if (lastSubmittedPhone === phone) {
            showToastMessage('You have already registered.', 'info');
            sessionStorage.setItem('sudokuUserName', userName.trim());
            sessionStorage.setItem('lastSubmittedPhone', phone);
            setTimeout(() => { startGame(); navigate('/game'); }, 1000);
            return;
        }

        setIsSubmitting(true);
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const result = await submitToLMS({
                name: userName.trim(),
                mobile_no: phone,
                param4: tomorrow.toISOString().split('T')[0],
                param19: '09:00 AM',
                summary_dtls: 'Game Lead Generator',
                p_data_source: 'RETIREMENT_SUDOKU_LEAD',
            });

            if (result.success) {
                setLastSubmittedPhone(phone);
                sessionStorage.setItem('sudokuUserName', userName.trim());
                sessionStorage.setItem('lastSubmittedPhone', phone);
                const responseData = result.data || result;
                if (responseData.leadNo || responseData.LeadNo) {
                    sessionStorage.setItem('sudokuLeadNo', responseData.leadNo || responseData.LeadNo);
                }
                startGame();
                navigate('/game');
            } else {
                showToastMessage('Submission failed. Please try again.');
            }
        } catch (err) {
            console.error(err);
            showToastMessage('Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        /*
         * Full-screen container – the cover image fills 100dvh.
         * The Start button is pinned to the bottom via absolute positioning.
         */
        <div
            style={{
                minHeight: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0d1b3e',
            }}
        >
            <div
                className="relative w-full overflow-hidden"
                style={{
                    height: '100dvh',
                    maxWidth: '430px',
                    width: '100%',
                }}
            >
                {/* Cover Image */}
                <img
                    src={coverImage}
                    alt="Retirement Sudoku"
                    draggable={false}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                />


                {/* ── Bottom CTA area ── */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        paddingBottom: 'max(env(safe-area-inset-bottom), 32px)',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        paddingTop: '48px',
                        /* subtle gradient so button is readable over any image */
                        background:
                            'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
                    }}
                >
                    <button
                        id="intro-start-btn"
                        onClick={() => setShowNamePopup(true)}
                        style={{
                            width: '100%',
                            maxWidth: '320px',
                            padding: '16px 0',
                            borderRadius: '16px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            color: '#ffffff',
                            background: 'linear-gradient(135deg, #0066B2 0%, #3B82F6 100%)',
                            boxShadow:
                                '0 4px 24px rgba(0, 102, 178, 0.55), 0 1px 0 rgba(255,255,255,0.15) inset',
                            transition: 'transform 150ms ease, box-shadow 150ms ease',
                        }}
                        onPointerDown={e =>
                            (e.currentTarget.style.transform = 'scale(0.97)')
                        }
                        onPointerUp={e =>
                            (e.currentTarget.style.transform = 'scale(1)')
                        }
                        onPointerLeave={e =>
                            (e.currentTarget.style.transform = 'scale(1)')
                        }
                    >
                        Start
                    </button>
                </div>

                {/* ══════════════════════════════════════════════════════════
                Lead-capture popup
            ══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {showNamePopup && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
                            onClick={() => setShowNamePopup(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                onClick={e => e.stopPropagation()}
                                className="relative bg-white shadow-2xl w-full max-w-[320px] min-[375px]:max-w-[340px] p-5 min-[375px]:p-6 border-[4px] sm:border-[6px] border-[#0066B2] rounded-2xl"
                            >
                                {/* Close */}
                                <button
                                    onClick={() => setShowNamePopup(false)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5 min-[375px]:w-6 min-[375px]:h-6" />
                                </button>

                                {/* Header */}
                                <div className="text-center mb-4 min-[375px]:mb-6">
                                    <div className="w-14 h-14 min-[375px]:w-16 min-[375px]:h-16 sm:w-20 sm:h-20 bg-[#0066B2] flex items-center justify-center mx-auto mb-3 min-[375px]:mb-4 shadow-xl border-4 border-white rounded-full">
                                        <span className="text-2xl min-[375px]:text-3xl sm:text-4xl">👋</span>
                                    </div>
                                    <h2 className="text-[#0066B2] text-lg min-[375px]:text-xl sm:text-2xl font-black mb-1">
                                        Welcome!
                                    </h2>
                                    <p className="text-slate-500 font-bold text-xs min-[375px]:text-sm sm:text-base">
                                        Enter your details to start.
                                    </p>
                                </div>

                                <form onSubmit={handleNameSubmit} className="space-y-3 min-[375px]:space-y-4">
                                    {/* Name */}
                                    <div className="space-y-1 min-[375px]:space-y-1.5 text-left">
                                        <label
                                            className="block text-slate-700 text-[9px] min-[375px]:text-[10px] sm:text-xs font-black uppercase tracking-widest ml-1"
                                            htmlFor="userName"
                                        >
                                            Your Name
                                        </label>
                                        <input
                                            id="userName"
                                            type="text"
                                            value={userName}
                                            onChange={e => {
                                                setUserName(e.target.value);
                                                if (/^[A-Za-z\s]*$/.test(e.target.value))
                                                    setErrors(prev => ({ ...prev, name: '' }));
                                            }}
                                            onBlur={e => validateField('name', e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (validateField('name', userName))
                                                        phoneInputRef.current?.focus();
                                                }
                                            }}
                                            placeholder="Full Name"
                                            autoFocus
                                            className={`w-full px-3 py-2.5 min-[375px]:px-4 min-[375px]:py-3 sm:py-3.5 border-4 ${errors.name
                                                ? 'border-red-400 focus:border-red-500 bg-red-50'
                                                : 'border-slate-100 focus:border-[#0066B2]'
                                                } focus:outline-none focus:ring-4 focus:ring-[#0066B2]/10 text-slate-800 font-bold text-sm min-[375px]:text-base sm:text-lg transition-all rounded-lg`}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-[9px] min-[375px]:text-[10px] font-black uppercase tracking-wider ml-1">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1 min-[375px]:space-y-1.5 text-left">
                                        <label
                                            className="block text-slate-700 text-[9px] min-[375px]:text-[10px] sm:text-xs font-black uppercase tracking-widest ml-1"
                                            htmlFor="phone"
                                        >
                                            Mobile Number
                                        </label>
                                        <input
                                            ref={phoneInputRef}
                                            id="phone"
                                            type="tel"
                                            maxLength={10}
                                            value={phone}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setPhone(val);
                                                setErrors(prev => ({ ...prev, phone: '' }));
                                            }}
                                            onBlur={e => validateField('phone', e.target.value)}
                                            placeholder="9876543210"
                                            className={`w-full px-3 py-2.5 min-[375px]:px-4 min-[375px]:py-3 sm:py-3.5 border-4 ${errors.phone
                                                ? 'border-red-400 focus:border-red-500 bg-red-50'
                                                : 'border-slate-100 focus:border-[#0066B2]'
                                                } focus:outline-none focus:ring-4 focus:ring-[#0066B2]/10 text-slate-800 font-bold text-sm min-[375px]:text-base sm:text-lg transition-all rounded-lg`}
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-[9px] min-[375px]:text-[10px] font-black uppercase tracking-wider ml-1">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Terms */}
                                    <div className="space-y-2 py-1">
                                        <div className="flex items-start gap-3">
                                            <div
                                                onClick={() => {
                                                    setTermsAccepted(!termsAccepted);
                                                    setErrors(prev => ({ ...prev, terms: null }));
                                                }}
                                                className={`mt-0.5 shrink-0 w-5 h-5 min-[375px]:w-6 min-[375px]:h-6 border-2 flex items-center justify-center cursor-pointer transition-all ${termsAccepted ? 'bg-[#0066B2] border-[#0066B2]' : 'bg-white border-slate-300'}`}
                                            >
                                                {termsAccepted && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                                            </div>
                                            <div className="text-[10px] min-[375px]:text-xs font-bold text-slate-600 leading-tight text-left">
                                                I agree to the{' '}
                                                <button type="button" onClick={() => setShowTerms(true)} className="text-[#0066B2] underline cursor-pointer hover:text-[#004C85]">
                                                    Terms & Conditions
                                                </button>{' '}
                                                and allow Bajaj Life Insurance to contact me even if registered on DND.
                                            </div>
                                        </div>
                                        {errors.terms && (
                                            <p className="text-red-500 text-[9px] min-[375px]:text-[10px] font-black uppercase tracking-wider ml-1 text-left">{errors.terms}</p>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={
                                            !userName.trim() ||
                                            phone.length !== 10 ||
                                            !termsAccepted ||
                                            isSubmitting
                                        }
                                        className="w-full py-2.5 min-[375px]:py-3 sm:py-4 rounded-xl text-sm sm:text-lg tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-white uppercase font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                        style={{
                                            background: 'linear-gradient(135deg, #0066B2 0%, #3B82F6 100%)',
                                            boxShadow: '0 4px 15px rgba(0, 102, 178, 0.3)',
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Starting...</span>
                                            </>
                                        ) : (
                                            "Let's Go!"
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ══════════════════════════════════════════════════════════
                Terms & Conditions popup
            ══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {showTerms && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md"
                            onClick={() => setShowTerms(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border-4 border-[#0066B2] relative text-left"
                            >
                                <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-2">
                                    <h3 className="text-[#0066B2] text-xl font-black uppercase tracking-tight">
                                        Terms & Conditions
                                    </h3>
                                    <button
                                        onClick={() => setShowTerms(false)}
                                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-slate-600 font-bold text-xs min-[375px]:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 text-left">
                                    <p>I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.</p>
                                    <p>Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#0066B2] underline">BALIC Privacy Policy</a>.</p>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => { setShowTerms(false); setTermsAccepted(true); }}
                                        className="w-full mt-6 py-3 bg-[#0066B2] text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm uppercase tracking-wider"
                                    >
                                        I Agree
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ══════════════════════════════════════════════════════════
                Toast notification
            ══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500' : 'bg-blue-600'
                                } text-white`}
                        >
                            {toast.type === 'error' ? (
                                <X size={20} className="stroke-[3]" />
                            ) : (
                                <Check size={20} className="stroke-[3]" />
                            )}
                            <span className="font-bold text-sm">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

export default IntroPage;
