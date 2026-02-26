import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import App from './App';
import './index.css';

interface GameProps {
    campaignId?: string;
    leadEndpoint?: string;
    environment?: 'dev' | 'prod';
    onGameStart?: () => void;
    onLeadSubmitted?: (payload: any) => void;
    onSnakeTriggered?: (snake: string) => void;
    onShieldActivated?: (shield: string) => void;
    onGameCompleted?: (score: number) => void;
}

const roots = new Map<HTMLElement, Root>();

export const mount = (container: HTMLElement, props?: GameProps) => {
    if (roots.has(container)) {
        console.warn('[LifeSnakesLadders] Already mounted to this container');
        return;
    }

    const root = createRoot(container);
    root.render(React.createElement(App, props));
    roots.set(container, root);

    console.log('[LifeSnakesLadders] Game mounted', props);
};

export const unmount = (container: HTMLElement) => {
    const root = roots.get(container);
    if (root) {
        root.unmount();
        roots.delete(container);
        console.log('[LifeSnakesLadders] Game unmounted');
    }
};

// Also expose as window globals for non-federated loading fallback
(window as any).mountLifeSnakesLadders = mount;
(window as any).unmountLifeSnakesLadders = unmount;
