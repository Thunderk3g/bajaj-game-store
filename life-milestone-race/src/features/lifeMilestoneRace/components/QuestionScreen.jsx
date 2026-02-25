import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle, AlertCircle } from 'lucide-react';

// Image Assets
import FirstJobImg from '../../../assets/image/FirstJob.png';
import MarriageImg from '../../../assets/image/Marriage.png';
import ParenthoodImg from '../../../assets/image/ParentHood.png';
import MidCareerImg from '../../../assets/image/MidCareer.png';
import RetirementImg from '../../../assets/image/Approaching_Retirement.png';

// Impact Styles
const IMPACT_STYLES = {
    high: {
        label: 'HIGH IMPACT',
        bg: '#ea580c', // orange-600
        text: '#FFF',
        icon: AlertTriangle
    },
    medium: {
        label: 'MEDIUM IMPACT',
        bg: '#f97316', // orange-500/400
        text: '#FFF',
        icon: Shield
    }
};

const QuestionScreen = memo(function QuestionScreen({
    stageData,
    questionNumber,
    totalQuestions,
    currentEvent,
    timeLeft,
    timerProgress,
    onDecision
}) {
    // Stage Configuration
    const STAGE_CONFIG = useMemo(() => ({
        'first-job': {
            image: FirstJobImg,
            label: 'FIRST JOB',
            icon: '💼',
            posBtn: "I'M PROTECTED"
        },
        'marriage': {
            image: MarriageImg,
            label: 'MARRIAGE',
            icon: '💍',
            posBtn: "I'M PROTECTED"
        },
        'parenthood': {
            image: ParenthoodImg,
            label: 'PARENTHOOD',
            icon: '👨‍👩‍👧',
            posBtn: "I'M PROTECTED"
        },
        'mid-career': {
            image: MidCareerImg,
            label: 'MID-CAREER',
            icon: '📈',
            posBtn: "I'M PROTECTED"
        },
        'retirement': {
            image: RetirementImg,
            label: 'APPROACHING RETIREMENT',
            icon: '🏖️',
            posBtn: "I'M PROTECTED"
        },
    }), []);

    const config = STAGE_CONFIG[stageData?.id] || STAGE_CONFIG['first-job'];
    const StageImage = config.image;

    // Determine Impact Style
    const severity = currentEvent?.severity === 'high' ? 'high' : 'medium';
    const impact = IMPACT_STYLES[severity];

    // Progress
    const progressPercentage = Math.round(((questionNumber - 1) / totalQuestions) * 100);

    return (
        <div
            className="absolute inset-0 w-full h-full flex flex-col items-center px-5 pb-6 overflow-y-auto overflow-x-hidden font-sans custom-scrollbar"
            style={{
                background: "linear-gradient(180deg, rgb(0, 51, 102) 0%, rgb(0, 68, 129) 100%)",
                fontFamily: "Inter, sans-serif",
            }}
        >
            {/* ================= HEADER ================= */}
            <div className="w-full max-w-sm pt-4 text-center z-20 shrink-0">
                <h2 className="text-[1.4rem] font-extrabold text-white uppercase tracking-wider flex justify-center items-center gap-2 drop-shadow-sm leading-tight">
                    {config.label} <span className="text-[1.4rem]">{config.icon}</span>
                </h2>
                <p className="text-[0.6rem] text-blue-200 font-bold uppercase tracking-[0.2em] mt-0.5 opacity-90">
                    FINANCIAL RISK AHEAD
                </p>

                {/* Progress */}
                <div className="mt-3 w-full max-w-[280px] mx-auto">
                    <div className="flex justify-between text-[0.65rem] font-bold text-white mb-1 px-0.5 opacity-90">
                        <span>QUESTION {questionNumber}/{totalQuestions}</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <div className="h-[4px] bg-blue-900/30 rounded-full overflow-hidden border border-white/10">
                        <motion.div
                            className="h-full bg-orange-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>

            {/* ================= HERO IMAGE ================= */}
            {/* Using flex-1 and min-h-0 allows the image container to shrink if needed, preventing overflow */}
            <div className="flex-1 min-h-0 flex justify-center w-full z-10 pointer-events-none items-center -mt-4 mb-2">
                <motion.img
                    key={stageData?.id}
                    src={StageImage}
                    alt={config.label}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-full w-auto max-h-[350px] object-contain drop-shadow-xl"
                />
            </div>

            {/* ================= QUESTION CARD ================= */}
            <div className="relative w-full max-w-sm shrink-0 z-20 mb-2">
                <motion.div
                    key={currentEvent?.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-[1.5rem] px-6 pt-9 pb-10 shadow-lg text-center relative mx-1"
                >
                    {/* Impact Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div
                            className="text-white text-[0.6rem] font-extrabold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-widest"
                            style={{ backgroundColor: impact.bg }}
                        >
                            {impact.label}
                        </div>
                    </div>

                    {/* Question */}
                    <h3 className="text-[1.25rem] font-extrabold text-slate-900 mt-0.5 leading-tight">
                        {currentEvent?.title}
                    </h3>

                    <p className="text-[0.85rem] font-medium text-slate-600 mt-2.5 leading-relaxed px-1">
                        {currentEvent?.description}
                    </p>
                </motion.div>

                {/* ================= TIMER ================= */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30">
                    <div className="w-[66px] h-[66px] rounded-full bg-white p-[3px] shadow-lg">
                        <div className="w-full h-full rounded-full bg-orange-500 flex items-center justify-center shadow-inner relative overflow-hidden">
                            <span className="text-white text-[1.6rem] font-extrabold relative z-10 pt-0.5">
                                {timeLeft}
                            </span>
                            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                                <circle
                                    cx="29" cy="29" r="26"
                                    fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"
                                />
                                <circle
                                    cx="29" cy="29" r="26"
                                    fill="none" stroke="#fff" strokeWidth="3"
                                    strokeDasharray={2 * Math.PI * 26}
                                    strokeDashoffset={2 * Math.PI * 26 * (1 - timerProgress / 100)}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-linear"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= BUTTONS ================= */}
            <div className="w-full max-w-sm flex flex-col gap-3 z-30 pb-2 px-1 mt-8 shrink-0">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onDecision('protected')}
                    className="py-3.5 rounded-xl bg-[#e65100] text-white font-extrabold text-[1rem] shadow-md active:scale-95 transition flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{ background: 'linear-gradient(to right, #ea580c, #c2410c)' }}
                >
                    <CheckCircle size={18} strokeWidth={3} className="text-white/90" />
                    <span>I&apos;M PROTECTED</span>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onDecision('exposed')}
                    className="py-3.5 rounded-xl bg-[#004A80] text-white font-extrabold text-[1rem] shadow-md active:scale-95 transition flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{ background: 'linear-gradient(to right, #00509E, #003366)' }}
                >
                    <AlertCircle size={18} strokeWidth={3} className="text-white/90" />
                    <span>I&apos;M EXPOSED</span>
                </motion.button>
            </div>
        </div>
    );
});

QuestionScreen.displayName = 'QuestionScreen';

QuestionScreen.propTypes = {
    stageData: PropTypes.object,
    questionNumber: PropTypes.number,
    totalQuestions: PropTypes.number,
    currentEvent: PropTypes.object,
    timeLeft: PropTypes.number,
    timerProgress: PropTypes.number,
    onDecision: PropTypes.func
};

export default QuestionScreen;
