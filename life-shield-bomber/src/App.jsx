import { Suspense, lazy } from 'react';
import './index.css';

const BombermanGamePage = lazy(() =>
    import('./features/bomberman/BombermanGamePage')
);

function App() {
    return (
        <div className="h-[100dvh] w-full bg-bb-deep overflow-hidden">
            <Suspense
                fallback={
                    <div className="h-[100dvh] w-full flex items-center justify-center bg-bb-deep">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-bb-accent border-t-transparent rounded-full animate-spin" />
                            <span className="text-white/40 text-[0.875rem] font-medium">Loading...</span>
                        </div>
                    </div>
                }
            >
                <BombermanGamePage />
            </Suspense>
        </div>
    );
}

export default App;
