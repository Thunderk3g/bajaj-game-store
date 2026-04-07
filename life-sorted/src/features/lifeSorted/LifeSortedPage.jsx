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
    const [gamePhase, setGamePhase] = useState('splash'); // splash | playing | shock | report | lead_capture | final | thanks
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
            score: stats.sortedTotal,
            summary_dtls: 'Life Sorted - Post Game Lead'
        });
        setIsSubmittingLead(false);

        if (result.success) {
            const data = { ...formData, leadNo: result.leadNo || (result.data && (result.data.leadNo || result.data.LeadNo)) };
            setLeadData(data);
            setGamePhase('final');
        } else {
            setFormErrors({ submit: result.error || 'Connection error. Please try again.' });
        }
    };

    const startGame = (data) => {
        setGamePhase('playing');
        timer.start();
    };

    const onStartClick = () => {
        // Lead popup disabled — start game directly
        startGame();
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
        setGamePhase('lead_capture');
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

            {gamePhase === 'lead_capture' && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-[340px] shadow-2xl relative border-[5px] border-[#00B4D8] animate-in zoom-in-95">
                        <div className="text-center mb-8">
                            <h2 className="text-[#005BAC] text-2xl font-black mb-1 tracking-tight uppercase">Enter Details</h2>
                            <p className="text-slate-500 font-bold text-lg text-center">To see the results</p>
                        </div>

                        <form onSubmit={handleLeadSubmit} className="space-y-6">
                            <div className="space-y-1.5 text-left">
                                <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest ml-1">Your Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
                                    placeholder="Full Name"
                                    className={`w-full bg-gray-50 border-4 rounded-xl px-5 py-3 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${formErrors.name ? 'border-red-500' : 'border-slate-100 focus:border-[#00B4D8]'}`}
                                />
                                {formErrors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{formErrors.name}</p>}
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest ml-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                                    placeholder="9876543210"
                                    className={`w-full bg-gray-50 border-4 rounded-xl px-5 py-3 text-gray-800 placeholder:text-gray-300 font-bold focus:outline-none transition-all ${formErrors.phone ? 'border-red-500' : 'border-slate-100 focus:border-[#00B4D8]'}`}
                                />
                                {formErrors.phone && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1">{formErrors.phone}</p>}
                            </div>

                            <div className="flex items-start gap-3 py-1">
                                <div className="mt-0.5 shrink-0 w-6 h-6 bg-[#00B4D8] border-2 border-[#00B4D8] flex items-center justify-center rounded-md">
                                    <span className="text-white font-black text-xs">✓</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-600 leading-snug text-left">
                                    I agree and consent to the <span onClick={() => setIsTermsOpen(true)} className="text-[#00B4D8] underline font-black cursor-pointer hover:text-[#0077b6] transition-colors">T&C and Privacy Policy</span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmittingLead}
                                className="w-full py-4 rounded-xl text-lg tracking-widest disabled:opacity-50 text-white uppercase font-black transition-all duration-300 shadow-lg active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #0077b6 100%)' }}
                            >
                                {isSubmittingLead ? 'Loading...' : 'See Results!'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)}>
                <div className="bg-white rounded-[32px] p-8 w-full shadow-2xl relative text-left border-[5px] border-[#00B4D8]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[#005BAC] text-2xl font-black uppercase tracking-tight leading-tight">
                            Terms & Conditions
                        </h3>
                        <button
                            onClick={() => setIsTermsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2 text-slate-600 font-medium text-xs leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 text-left">
                        <p>I hereby authorize Bajaj Life Insurance Limited to call me on the contact number made available by me on the website with a specific request to call back. I further declare that, irrespective of my contact number being registered on National Customer Preference Register (NCPR) or on National Do Not Call Registry (NDNC), any call made, SMS or WhatsApp sent in response to my request shall not be construed as an Unsolicited Commercial Communication even though the content of the call may be for the purposes of explaining various insurance products and services or solicitation and procurement of insurance business.</p>
                        <p>Please refer to <a href="https://www.bajajallianzlife.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-[#00B4D8] underline font-bold">Privacy Policy</a>.</p>
                    </div>
                    <div className="mt-8">
                        <button
                            onClick={() => { setIsTermsOpen(false); setIsTermsAccepted(true); }}
                            className="w-full py-4 rounded-xl text-lg tracking-widest text-white uppercase font-black transition-all duration-300 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #0077b6 100%)' }}
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
