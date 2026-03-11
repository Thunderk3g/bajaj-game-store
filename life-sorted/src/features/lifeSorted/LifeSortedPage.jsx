import React, { useState, useCallback, useMemo, useRef } from 'react';
import GameLayout from '../../components/layout/GameLayout';
import SplashScreen from './components/SplashScreen';
import GameScreen from './components/GameScreen';
import LevelReport from './components/LevelReport';
import FinalScreen from './components/FinalScreen';
import ThankYouScreen from './components/ThankYouScreen';
import ShockOverlay from './components/ShockOverlay';
import Toast from '../../components/ui/Toast';

import Modal from './components/Modal';
import { submitToLMS } from '../../services/api';
import { useLifeSortedEngine } from './hooks/useLifeSortedEngine';
import { useTimer } from './hooks/useTimer';
import { useShockSystem } from './hooks/useShockSystem';
import { useToastSystem } from './hooks/useToastSystem';
import { useScoreCalculator } from './hooks/useScoreCalculator';
import { LEVEL_CONFIGS } from './utils/levelConfigs';
import { MESSAGE_LIBRARY } from './constants/messageLibrary';
import { X, ShieldCheck, Loader2 } from 'lucide-react';

const LifeSortedPage = () => {
    const [gamePhase, setGamePhase] = useState('splash'); // splash | playing | shock | report | final | thanks
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const tubeRefs = useRef([]);

    // Lead Gen State
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isSubmittingLead, setIsSubmittingLead] = useState(false);
    const [leadData, setLeadData] = useState(null);
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [isTermsAccepted, setIsTermsAccepted] = useState(true);
    const [formErrors, setFormErrors] = useState({});
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    const { toast, showToast } = useToastSystem();
    const { stats, updateStats, getResults, resetStats } = useScoreCalculator();

    const handleLevelWin = useCallback(() => {
        // Logic handled by useEffect watching engine.isWon
    }, []);

    const {
        shockFired,
        isShockActive,
        triggerShock,
        resolveShock,
        resetShock
    } = useShockSystem(useCallback(() => {
        showToast(MESSAGE_LIBRARY.SHOCK_EVENT, 'warning');
    }, [showToast]));

    const engine = useLifeSortedEngine(
        currentLevelIndex,
        handleLevelWin,
        showToast,
        triggerShock,
        shockFired
    );

    const handleTubeClickWithAnimation = useCallback((index) => {
        if (engine.isWon || isShockActive) return;
        engine.handleTubeClick(index);
    }, [engine, isShockActive]);

    const handleTimeUp = useCallback(() => {
        showToast(MESSAGE_LIBRARY.TIME_UP, 'error');
        updateStats(engine.moves, engine.mistakes, engine.sortedCount);
        setGamePhase('report');
    }, [engine.moves, engine.mistakes, engine.sortedCount, updateStats, showToast]);

    const handleWarning = useCallback((time) => {
        if (time === 60 || time === 30 || time === 10) {
            showToast(`${time} seconds remaining!`, time <= 30 ? 'warning' : 'info');
        }
    }, [showToast]);

    const timer = useTimer(120, handleTimeUp, handleWarning);

    const validateLeadForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Please enter your name';
        else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) newErrors.name = 'Letters only';

        if (!formData.phone.trim()) newErrors.phone = 'Please enter your phone number';
        else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid 10-digit number (starts 6-9)';

        if (!isTermsAccepted) newErrors.terms = 'Please accept terms';

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        if (!validateLeadForm()) return;

        setIsSubmittingLead(true);
        const result = await submitToLMS({
            name: formData.name,
            mobile_no: formData.phone,
            summary_dtls: 'Life Sorted - Lead'
        });
        setIsSubmittingLead(false);

        if (result.success) {
            setIsLeadModalOpen(false);
            const data = { ...formData, leadNo: result.leadNo || (result.data && (result.data.leadNo || result.data.LeadNo)) };
            setLeadData(data);
            startGame(data);
        } else {
            setFormErrors({ submit: result.error || 'Connection error. Please try again.' });
        }
    };

    const startGame = (data) => {
        setGamePhase('playing');
        timer.start();
    };

    const onStartClick = () => {
        setIsLeadModalOpen(true);
    };

    const nextLevel = () => {
        if (currentLevelIndex < LEVEL_CONFIGS.length - 1) {
            setCurrentLevelIndex(prev => prev + 1);
            setGamePhase('playing');
            resetShock();
            timer.start(); // RESUME TIMER FOR NEXT LEVEL
        } else {
            setGamePhase('final');
        }
    };

    const restartLevel = () => {
        engine.reset(); // CORRECTLY RESET CURRENT LEVEL
        resetShock();
    };

    const onLevelComplete = () => {
        timer.stop();
        updateStats(engine.moves, engine.mistakes, engine.sortedCount);
        // 400ms delay before showing popup
        setTimeout(() => {
            setGamePhase('report');
        }, 400);
    };

    const handleReportDone = useCallback(() => {
        setGamePhase('final');
    }, []);

    React.useEffect(() => {
        // FIXED: Sync win check with levelLoaded to prevent skips. 
        // We only trigger level complete if the engine has actually loaded the current level.
        if (engine.isWon && gamePhase === 'playing' && engine.levelLoaded === currentLevelIndex) {
            onLevelComplete();
        }
    }, [engine.isWon, gamePhase, engine.levelLoaded, currentLevelIndex]);

    const activeCategories = useMemo(() => {
        return [...new Set(engine.tubes.flat().map(s => s.category))];
    }, [engine.tubes]);

    const handleRetry = useCallback(() => {
        setCurrentLevelIndex(0);
        resetShock();
        resetStats();
        timer.reset();
        // Use setTimeout to ensure state updates (especially currentLevelIndex) 
        // have settled before starting, so the engine re-initializes properly
        setTimeout(() => {
            engine.reset();
            setGamePhase('playing');
            timer.start();
        }, 50);
    }, [timer, resetShock, resetStats, engine]);

    return (
        <GameLayout
            showTitle={false}
            showHeader={gamePhase !== 'final'}
            variant={gamePhase === 'splash' ? 'welcome' : (gamePhase === 'playing' || gamePhase === 'final') ? 'gradient' : 'default'}
            mainClassName={
                gamePhase === 'splash' ? 'justify-end pb-[28%]' :
                    gamePhase === 'final' ? 'justify-start overflow-y-auto overflow-x-hidden w-full px-0 pt-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' :
                        'justify-center'
            }
            headerRight={null}
        >
            <Toast message={toast?.message} type={toast?.type} />

            {gamePhase === 'splash' && <SplashScreen onStart={onStartClick} />}

            {/* Lead Gen Modal */}
            <Modal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)}>
                <div className="bg-white rounded-[32px] p-8 w-full shadow-2xl relative overflow-hidden text-left translate-z-0">
                    <button
                        onClick={() => setIsLeadModalOpen(false)}
                        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-3xl font-black text-gray-800 text-center mb-1 tracking-tight">
                        Welcome!
                    </h2>
                    <p className="text-center text-gray-400 font-bold mb-8 italic">Enter your details to start</p>

                    <form onSubmit={handleLeadSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                    setFormData(prev => ({ ...prev, name: val }));
                                    if (!val.trim()) setFormErrors(prev => ({ ...prev, name: 'Please enter your name' }));
                                    else if (!/^[A-Za-z\s]+$/.test(val.trim())) setFormErrors(prev => ({ ...prev, name: 'Letters only' }));
                                    else setFormErrors(prev => ({ ...prev, name: null }));
                                }}
                                id="name"
                                name="name"
                                autoComplete="name"
                                placeholder="Your name"
                                className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-400 font-bold focus:outline-none focus:border-gold transition-all ${formErrors.name ? 'border-red-500' : 'border-slate-100'}`}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm font-black ml-2">{formErrors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setFormData(prev => ({ ...prev, phone: val }));
                                    if (!val.trim()) setFormErrors(prev => ({ ...prev, phone: 'Please enter your phone number' }));
                                    else if (!/^[6-9]\d{9}$/.test(val)) setFormErrors(prev => ({ ...prev, phone: 'Invalid 10-digit number' }));
                                    else setFormErrors(prev => ({ ...prev, phone: null }));
                                }}
                                id="phone"
                                name="phone"
                                autoComplete="tel"
                                placeholder="Mobile number"
                                className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 text-gray-800 placeholder:text-gray-400 font-bold focus:outline-none focus:border-gold transition-all ${formErrors.phone ? 'border-red-500' : 'border-slate-100'}`}
                            />
                            {formErrors.phone && <p className="text-red-500 text-sm font-black ml-2">{formErrors.phone}</p>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-start gap-3 cursor-pointer" onClick={() => {
                                setIsTermsAccepted(!isTermsAccepted);
                                setFormErrors(prev => ({ ...prev, terms: null }));
                            }}>
                                <div className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${isTermsAccepted ? 'bg-[#005faa] border-[#005faa]' : 'border-slate-300 bg-gray-50'}`}>
                                    {isTermsAccepted && <ShieldCheck className="w-5 h-5 text-white" />}
                                </div>
                                <div className="text-[11px] text-gray-700 font-medium leading-[1.3]">
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsTermsOpen(true);
                                        }}
                                        className="text-[#005faa] font-bold hover:underline"
                                    >
                                        Terms & Conditions
                                    </button>
                                    {' '}and allow Bajaj Life Insurance to contact me even if registered on DND.
                                </div>
                            </div>
                            {formErrors.terms && <p className="text-red-500 text-sm font-black ml-2">{formErrors.terms}</p>}
                        </div>

                        {formErrors.submit && (
                            <p className="text-red-500 text-sm font-black text-center">{formErrors.submit}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmittingLead}
                            className="w-full bg-gold text-black font-black text-xl py-4 rounded-2xl shadow-[0_4px_0_0_#b45309] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmittingLead ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : "LET'S GO!"}
                        </button>
                    </form>
                </div>
            </Modal>

            <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)}>
                <div className="bg-white rounded-[32px] p-8 w-full shadow-2xl relative text-left">
                    <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-2">
                        <h3 className="text-[#0066B2] text-xl font-black uppercase tracking-tight">
                            Terms &amp; Conditions
                        </h3>
                        <button
                            onClick={() => setIsTermsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-slate-600 font-bold text-xs min-[375px]:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 text-left">
                        <p>I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.</p>
                        <p>Please refer to <a href="https://www.bajajlifeinsurance.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#0066B2] underline">BALIC Privacy Policy</a>.</p>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => { setIsTermsOpen(false); setIsTermsAccepted(true); }}
                            className="w-full mt-6 py-3 bg-[#0066B2] text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm uppercase tracking-wider"
                        >
                            I Agree
                        </button>
                    </div>
                </div>
            </Modal>

            {(gamePhase === 'playing' || gamePhase === 'report') && (
                <>
                    <GameScreen
                        tubes={engine.tubes}
                        capacity={LEVEL_CONFIGS[currentLevelIndex].capacity}
                        selectedTube={engine.selectedTube}
                        onTubeClick={handleTubeClickWithAnimation}
                        timer={timer.timeLeft}
                        formatTime={timer.formatTime}
                        progress={timer.progress}
                        isUrgent={timer.isUrgent}
                        activeCategories={activeCategories}
                        moves={engine.moves}
                        currentLevel={currentLevelIndex + 1}
                        tubeRefs={tubeRefs}
                        newlySortedTubes={engine.newlySortedTubes}
                        sortedCount={engine.sortedCount}
                    />
                    <ShockOverlay isActive={isShockActive} onResolve={resolveShock} />
                </>
            )}

            {/* Level Report Popup Overlay */}
            <LevelReport
                tubes={engine.tubes}
                isWin={engine.isWon}
                capacity={LEVEL_CONFIGS[currentLevelIndex].capacity}
                onNext={handleReportDone}
                isVisible={gamePhase === 'report'}
            />

            {gamePhase === 'final' && (
                <FinalScreen
                    results={getResults()}
                    leadData={leadData}
                    onRetry={handleRetry}
                    onBookingSuccess={() => setGamePhase('thanks')}
                />
            )}

            {gamePhase === 'thanks' && (
                <ThankYouScreen
                    leadName={leadData?.name}
                    onRestart={handleRetry}
                />
            )}
        </GameLayout>
    );
};

export default LifeSortedPage;
