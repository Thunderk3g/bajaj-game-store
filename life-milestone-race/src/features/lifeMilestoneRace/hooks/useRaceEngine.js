import { useState, useCallback, useMemo, useRef } from 'react';
import EVENTS from '../constants/eventsData';
import { LIFE_STAGES, INITIAL_SCORE, GAME_PHASES, DECISIONS, EVENTS_PER_STAGE } from '../constants/lifeStages';
import { calculateScore, getProtectionCategory, normalizeScore, generateRiskGaps } from '../utils/scoreCalculator';
import { isHighSeverity } from '../utils/severityImpact';

/**
 * Generate a simple UUID v4.
 * @returns {string}
 */
function generateGameId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Shuffle array using Fisher-Yates algorithm.
 * @param {Array} arr
 * @returns {Array}
 */
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Build the event queue for ONLY the selected stage.
 * Returns exactly EVENTS_PER_STAGE (5) events for that stage.
 * @param {string} stageId
 * @returns {Array}
 */
function buildEventQueue(stageId) {
    const stageEvents = EVENTS.filter((e) => e.stage === stageId);
    const shuffled = shuffleArray(stageEvents);
    // Ensure we only return exactly EVENTS_PER_STAGE
    return shuffled.slice(0, EVENTS_PER_STAGE);
}

/**
 * Core race engine hook.
 * Manages all game state, progression, scoring, and timeline tracking.
 *
 * KEY BEHAVIOUR:
 * - Only events from the selected stage are loaded (5 per stage).
 * - Score starts at 50, +10/-10 per decision.
 * - Selecting a new stage fully resets all state.
 */
export function useRaceEngine() {
    const [gameId, setGameId] = useState('');
    const [phase, setPhase] = useState(GAME_PHASES.INTRO);
    const [score, setScore] = useState(INITIAL_SCORE);
    const [selectedStage, setSelectedStage] = useState(null);
    const [eventQueue, setEventQueue] = useState([]);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [timeline, setTimeline] = useState([]);
    const [lastFeedback, setLastFeedback] = useState(null);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');

    const consecutiveExposedHighRef = useRef(0);

    // ── Derived State ──
    const currentEvent = useMemo(() => {
        return eventQueue[currentEventIndex] ?? null;
    }, [eventQueue, currentEventIndex]);

    const isLastEvent = useMemo(() => {
        return currentEventIndex >= eventQueue.length - 1;
    }, [currentEventIndex, eventQueue.length]);

    const protectionCategory = useMemo(() => {
        return getProtectionCategory(score);
    }, [score]);

    const finalScore = useMemo(() => {
        return normalizeScore(score);
    }, [score]);

    const riskGaps = useMemo(() => {
        return generateRiskGaps(timeline);
    }, [timeline]);

    /**
     * Progress percent based on EVENTS_PER_STAGE (5), not total events.
     */
    const progressPercent = useMemo(() => {
        if (eventQueue.length === 0) return 0;
        return Math.round(((currentEventIndex + 1) / eventQueue.length) * 100);
    }, [currentEventIndex, eventQueue.length]);

    /**
     * Resolved stage metadata for the currently selected stage.
     */
    const selectedStageData = useMemo(() => {
        if (!selectedStage) return null;
        return LIFE_STAGES.find((s) => s.id === selectedStage) ?? null;
    }, [selectedStage]);

    // ── Actions ──

    const startGame = useCallback((name, phone) => {
        if (name) setUserName(name);
        if (phone) setUserPhone(phone);
        setPhase(GAME_PHASES.STAGE_SELECTION);
    }, []);

    /**
     * Select a stage: resets ALL state, loads only that stage's 5 events.
     */
    const selectStage = useCallback((stageId) => {
        const id = generateGameId();
        const queue = buildEventQueue(stageId);

        setGameId(id);
        setSelectedStage(stageId);
        setEventQueue(queue);
        setCurrentEventIndex(0);
        setScore(INITIAL_SCORE);
        setTimeline([]);
        setLastFeedback(null);
        consecutiveExposedHighRef.current = 0;
        setPhase(GAME_PHASES.RACING);
        setIsTimerActive(true);
    }, []);

    const makeDecision = useCallback((decision) => {
        if (!currentEvent) return;

        setIsTimerActive(false);

        const isExposed = decision === DECISIONS.EXPOSED;
        const impact = isExposed ? currentEvent.impactExposed : currentEvent.impactProtected;
        const isExposedHigh = isExposed && isHighSeverity(currentEvent.severity);

        // Track consecutive exposed high severity
        if (isExposedHigh) {
            consecutiveExposedHighRef.current += 1;
        } else {
            consecutiveExposedHighRef.current = 0;
        }

        const { newScore, appliedDelta } = calculateScore(
            score,
            impact,
            isExposedHigh,
            consecutiveExposedHighRef.current,
        );

        const stage = LIFE_STAGES.find((s) => s.id === currentEvent.stage);

        const timelineEntry = {
            eventId: currentEvent.id,
            stage: stage?.label ?? currentEvent.stage,
            stageId: currentEvent.stage,
            title: currentEvent.title,
            severity: currentEvent.severity,
            decision,
            scoreDelta: appliedDelta,
            scoreAfter: newScore,
        };

        setScore(newScore);
        setTimeline((prev) => [...prev, timelineEntry]);
        setLastFeedback({
            decision,
            delta: appliedDelta,
            severity: currentEvent.severity,
            title: currentEvent.title,
        });
        setPhase(GAME_PHASES.EVENT_FEEDBACK);
    }, [currentEvent, score]);

    const handleTimerExpire = useCallback(() => {
        makeDecision(DECISIONS.EXPOSED);
    }, [makeDecision]);

    const advanceToNextEvent = useCallback(() => {
        if (isLastEvent) {
            setIsTimerActive(false);
            setPhase(GAME_PHASES.FINISH);
            return;
        }

        setCurrentEventIndex((prev) => prev + 1);
        setLastFeedback(null);
        setPhase(GAME_PHASES.RACING);
        setIsTimerActive(true);
    }, [isLastEvent]);

    const showScoreReveal = useCallback(() => {
        setPhase(GAME_PHASES.SCORE_REVEAL);
    }, []);

    const showTimeline = useCallback(() => {
        setPhase(GAME_PHASES.TIMELINE);
    }, []);

    const showConversion = useCallback(() => {
        setPhase(GAME_PHASES.CONVERSION);
    }, []);

    const showLeadForm = useCallback(() => {
        setPhase(GAME_PHASES.LEAD_FORM);
    }, []);

    const showThankYou = useCallback((name) => {
        if (name) setUserName(name);
        setPhase(GAME_PHASES.THANK_YOU);
    }, []);

    const restartGame = useCallback(() => {
        setGameId('');
        setPhase(GAME_PHASES.INTRO);
        setScore(INITIAL_SCORE);
        setSelectedStage(null);
        setEventQueue([]);
        setCurrentEventIndex(0);
        setTimeline([]);
        setLastFeedback(null);
        setIsTimerActive(false);
        setUserName('');
        consecutiveExposedHighRef.current = 0;
    }, []);

    return {
        // State
        gameId,
        phase,
        score,
        selectedStage,
        selectedStageData,
        currentEvent,
        currentEventIndex,
        eventQueue,
        timeline,
        lastFeedback,
        isTimerActive,
        isLastEvent,
        protectionCategory,
        finalScore,
        riskGaps,
        progressPercent,
        userName,
        userPhone,

        // Actions
        startGame,
        selectStage,
        makeDecision,
        handleTimerExpire,
        advanceToNextEvent,
        showScoreReveal,
        showTimeline,
        showConversion,
        showLeadForm,
        showThankYou,
        restartGame,
    };
}

export default useRaceEngine;
