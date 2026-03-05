import React from 'react';

const GameLayout = ({ children, headerRight, footer, showTitle = true }) => {
    return (
        <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden text-white safe-area-inset">
            {/* Global Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue/10 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4">
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

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2">
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
