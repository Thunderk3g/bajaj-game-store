import React, { lazy, Suspense } from 'react';
import { useRetirementJourney } from './hooks/useRetirementJourney';
import { JOURNEY_STEPS } from './constants/journeySteps';
import { Progress } from './components/ui/Progress';
import { Button } from './components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils/cn';

// Lazy load step components from the central components directory
const Intro = lazy(() => import('./components/Intro'));
const StepScenario = lazy(() => import('./components/StepScenario'));
const StepLifestyle = lazy(() => import('./components/StepLifestyle'));
const StepEssentials = lazy(() => import('./components/StepEssentials'));
const StepEngine = lazy(() => import('./components/StepEngine'));
const StepSurprises = lazy(() => import('./components/StepSurprises'));
const Results = lazy(() => import('./components/Results'));

const App = () => {
    const { currentStep, currentStepIndex, totalSteps, actions, selections, score, insights, scoreBreakdown, userInfo } = useRetirementJourney();

    const renderStep = () => {
        switch (currentStep.id) {
            case JOURNEY_STEPS.INTRO:
                return <Intro onStart={actions.goToNextStep} setUserInfo={actions.setUserInfo} userInfo={userInfo} />;
            case JOURNEY_STEPS.SCENARIO:
                return <StepScenario step={currentStep} selections={selections} onSelect={actions.handleSelection} />;
            case JOURNEY_STEPS.LIFESTYLE:
                return <StepLifestyle step={currentStep} selections={selections} onSelect={actions.handleSelection} />;
            case JOURNEY_STEPS.ESSENTIALS:
                return <StepEssentials step={currentStep} selections={selections} onSelect={actions.handleSelection} />;
            case JOURNEY_STEPS.ENGINE:
                return <StepEngine step={currentStep} selections={selections} onSelect={actions.handleSelection} />;
            case JOURNEY_STEPS.SURPRISES:
                return <StepSurprises step={currentStep} selections={selections} onSelect={actions.handleSelection} />;
            case JOURNEY_STEPS.RESULTS:
                return <Results score={score} selections={selections} onReset={actions.reset} insights={insights} scoreBreakdown={scoreBreakdown} userInfo={userInfo} />;
            default:
                return null;
        }
    };


    const isIntro = currentStep.id === JOURNEY_STEPS.INTRO;
    const isResults = currentStep.id === JOURNEY_STEPS.RESULTS;
    const progress = isIntro ? 0 : isResults ? 100 : ((currentStepIndex + 1) / totalSteps) * 100;

    return (
        <div
            className={cn(
                "h-screen flex flex-col w-full overflow-hidden"
            )}
            style={
                isIntro ? {} :
                    isResults ? {
                        background: 'linear-gradient(180deg, #0047AB 0%, #0066B2 100%)',
                        backgroundAttachment: 'fixed'
                    } : {
                        backgroundImage: `url('./assets/bg-image.png')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'fixed'
                    }
            }
        >
            {/* Main Content */}
            <main className={cn(
                "flex-1 flex flex-col w-full mx-auto",
                isIntro ? "p-0 max-w-none" : "max-w-[48rem] px-6",
                isResults ? "pt-[3.4rem] pb-0" : (isIntro ? "" : "py-12")
            )}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 flex flex-col"
                    >
                        <Suspense fallback={
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
                            </div>
                        }>
                            {renderStep()}
                        </Suspense>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            {!isIntro && !isResults && (
                <footer className="sticky bottom-0 p-6">
                    <div className="max-w-[48rem] mx-auto flex gap-4">
                        <Button
                            variant="outline"
                            onClick={actions.goToPrevStep}
                            className="flex-1 h-[3.5rem] border-primary-500 text-primary-500 hover:bg-primary-50"
                        >
                            BACK
                        </Button>
                        <Button
                            onClick={actions.goToNextStep}
                            className="flex-[2] h-[3.5rem] bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                            disabled={
                                (currentStep.id === JOURNEY_STEPS.SCENARIO || currentStep.id === JOURNEY_STEPS.LIFESTYLE)
                                    ? !selections[currentStep.id]
                                    : false
                            }

                        >
                            NEXT
                        </Button>
                    </div>
                </footer>
            )}
        </div>
    );
};



export default App;
