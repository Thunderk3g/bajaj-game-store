import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Layout wrapper for the race simulation.
 * Provides consistent container sizing and background.
 */
const RaceLayout = memo(function RaceLayout({ children, className = '', fullScreen = false }) {
    return (
        <div className={`race-container ${className}`}>
            {/* Ambient background particles - only show when not fullScreen */}
            {!fullScreen && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="absolute top-[10%] left-[15%] w-[20rem] h-[20rem] bg-bajaj-blue/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-[15%] right-[10%] w-[25rem] h-[25rem] bg-bajaj-orange/5 rounded-full blur-3xl" />
                    <div className="absolute top-[50%] left-[60%] w-[15rem] h-[15rem] bg-race-accent/5 rounded-full blur-3xl" />
                </div>
            )}

            {/* Content Container — Expanded to fill entire screen to prevent background gaps */}
            <div
                className={`relative z-10 w-full min-h-[100dvh] flex flex-col ${fullScreen
                    ? ''
                    : 'items-center justify-center'
                    }`}
            >
                {children}
            </div>
        </div>
    );
});

RaceLayout.displayName = 'RaceLayout';

RaceLayout.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    fullScreen: PropTypes.bool,
};

export default RaceLayout;
