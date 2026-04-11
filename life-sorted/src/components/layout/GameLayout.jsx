import React from 'react';
import lsBg from '../../assets/ls-bg.png';

const GameLayout = ({ children, headerRight, footer, showTitle = true, showHeader = true, variant = 'default', mainClassName = '' }) => {
    const renderBackground = () => {
        if (variant === 'welcome') {
            return (
                <div className="fixed inset-0 z-0 bg-black">
                    <img
                        src={lsBg}
                        alt="Background"
                        className="w-full h-full object-fill"
                    />
                </div>
            );
        }

        if (variant === 'black') {
            return <div className="fixed inset-0 z-0 bg-black" />;
        }

        if (variant === 'gradient') {
            return (
                <div
                    className="fixed inset-0 z-0 bg-[#0f172a]"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 15% 50%, rgba(30, 58, 138, 0.4), transparent 50%),
                            radial-gradient(circle at 85% 30%, rgba(245, 158, 11, 0.15), transparent 50%)
                        `
                    }}
                />
            );
        }

        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#050505]">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal/5 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] bg-gold/5 blur-[160px] rounded-full" />
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[40%] bg-blue/5 blur-[120px] rounded-full opacity-50" />
            </div>
        );
    };

    return (
        <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden text-white safe-area-inset">
            {/* Global Background Elements */}
            {renderBackground()}

            {/* Header */}
            {showHeader && (
                <header className="relative z-10 flex items-center justify-between px-6 py-4 min-h-[60px]">
                    {showTitle ? (
                        <div className="flex flex-col">
                            <h1 className="text-xl font-heading font-bold leading-tight">Life Sorted</h1>
                            <span className="text-[0.65rem] uppercase tracking-widest text-teal font-bold">Financial Awareness</span>
                        </div>
                    ) : <div />}
                    <div>
                        {headerRight}
                    </div>
                </header>
            )}

            {/* Main Content */}
            <main className={`relative z-10 flex-1 flex flex-col items-center px-4 py-2 ${mainClassName || 'justify-center'}`}>
                {children}
            </main>

            {/* Footer */}
            {footer && (
                <footer className="relative z-10 px-6 py-8">
                    {footer}
                </footer>
            )}
        </div>
    );
};

export default GameLayout;
