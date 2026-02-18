import { useState, useCallback, useMemo } from 'react';
import { JOURNEY_STEPS, STEPS_DATA } from '../constants/journeySteps';

export const useRetirementJourney = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 for Intro
    const [selections, setSelections] = useState({});
    const [isFinished, setIsFinished] = useState(false);

    const currentStep = useMemo(() => {
        if (currentStepIndex === -1) return { id: JOURNEY_STEPS.INTRO };
        if (currentStepIndex >= STEPS_DATA.length) return { id: JOURNEY_STEPS.RESULTS };
        return STEPS_DATA[currentStepIndex];
    }, [currentStepIndex]);

    const goToNextStep = useCallback(() => {
        if (currentStepIndex < STEPS_DATA.length) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    }, [currentStepIndex]);

    const goToPrevStep = useCallback(() => {
        if (currentStepIndex > -1) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    const handleSelection = useCallback((stepId, value) => {
        setSelections(prev => ({
            ...prev,
            [stepId]: value
        }));
    }, []);

    const calculateScoreValues = useCallback(() => {
        const scores = {
            scoreA: 0,
            scoreB: 0,
            scoreC: 0,
            scoreD: 0,
            scoreE: 0,
            totalScore: 0
        };

        // Level A: Time to Retirement (Single Choice)
        const scenario = selections[JOURNEY_STEPS.SCENARIO];
        if (scenario) {
            const option = STEPS_DATA[0].options.find(o => o.id === scenario);
            scores.scoreA = option?.points || 0;
        }

        // Level B: Lifestyle Load (Single Choice)
        const lifestyle = selections[JOURNEY_STEPS.LIFESTYLE];
        if (lifestyle) {
            const option = STEPS_DATA[1].options.find(o => o.id === lifestyle);
            scores.scoreB = option?.points || 0;
        }

        // Level C: Expense Protection (Multi-select, capped at 15)
        const essentials = selections[JOURNEY_STEPS.ESSENTIALS] || [];
        const step3Points = essentials.reduce((sum, id) => {
            const option = STEPS_DATA[2].options.find(o => o.id === id);
            return sum + (option?.points || 0);
        }, 0);
        scores.scoreC = Math.min(15, step3Points);

        // Level D: Investment Strength (Multi-select + Diversification Bonus, capped at 25)
        const engine = selections[JOURNEY_STEPS.ENGINE] || [];
        let engineTotal = engine.reduce((sum, id) => {
            const option = STEPS_DATA[3].options.find(o => o.id === id);
            return sum + (option?.points || 0);
        }, 0);

        if (engine.length === 3) {
            engineTotal += 2; // Diversification bonus
        }
        scores.scoreD = Math.min(25, engineTotal);

        // Level E: Inflation & Shock Readiness (Average of 3 scenarios, rounded)
        const surprises = selections[JOURNEY_STEPS.SURPRISES] || {};
        const shockScores = [];
        Object.entries(surprises).forEach(([catId, optionId]) => {
            const category = STEPS_DATA[4].categories.find(c => c.id === catId);
            const option = category?.options.find(o => o.id === optionId);
            if (option) {
                shockScores.push(option.points);
            }
        });

        if (shockScores.length > 0) {
            const avg = shockScores.reduce((a, b) => a + b, 0) / shockScores.length;
            scores.scoreE = Math.round(avg);
        } else {
            scores.scoreE = 0;
        }

        scores.totalScore = Math.min(100, scores.scoreA + scores.scoreB + scores.scoreC + scores.scoreD + scores.scoreE);
        return scores;
    }, [selections]);

    const scoreData = useMemo(() => calculateScoreValues(), [calculateScoreValues]);

    const insights = useMemo(() => {
        const list = [];
        const { scoreA, scoreB, scoreD, scoreE } = scoreData;

        // Insight 1: Time to Retirement
        if (scoreA === 20) {
            list.push({ label: "⏰ Time Advantage", text: "30+ years to grow retirement savings exponentially" });
        } else if (scoreA >= 15) {
            list.push({ label: "⏰ Strong Timeline", text: "Good opportunity for wealth accumulation" });
        }

        // Insight 2: Lifestyle
        if (scoreB === 25) {
            list.push({ label: "💰 Sustainable Lifestyle", text: "Modest retirement vision is financially achievable" });
        } else if (scoreB === 20) {
            list.push({ label: "💰 Balanced Approach", text: "Your comfortable lifestyle is well-balanced" });
        } else if (scoreB === 14) {
            list.push({ label: "💰 Premium Challenge", text: "Premium lifestyle requires careful financial planning" });
        }

        // Insight 3: Investments
        if (scoreD >= 23) {
            list.push({ label: "📊 Diversified Portfolio", text: "Combined safety, growth & income generation" });
        } else if (scoreD === 0) {
            list.push({ label: "📊 Investment Gap", text: "Consider developing a diversified investment strategy" });
        }

        // Insight 4: Shock Readiness
        if (scoreE >= 13) {
            list.push({ label: "🛡️ Shock Ready", text: "Strong resilience demonstrated against challenges" });
        }

        return list.slice(0, 3);
    }, [scoreData]);

    return {
        currentStep,
        currentStepIndex,
        totalSteps: STEPS_DATA.length,
        selections,
        score: scoreData.totalScore,
        scoreBreakdown: scoreData,
        insights,
        isFinished,
        actions: {
            goToNextStep,
            goToPrevStep,
            handleSelection,
            reset: () => {
                setCurrentStepIndex(-1);
                setSelections({});
                setIsFinished(false);
            }
        }
    };
};

