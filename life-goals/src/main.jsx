import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { decryptToken } from './utils/crypto'
console.log('UAT DEPLOYMENT DATE: 11th Feb 2026 , 16:48');

// ── Decrypt gamification token, store payload in sessionStorage & clean URL ──
(() => {
    const params = new URLSearchParams(window.location.search);

    // Store basic query params as fallback (userId, gameId, etc.)
    const basicKeys = ['userId', 'gameId', 'empName', 'empMobile', 'location', 'zone'];
    let hasParams = false;
    basicKeys.forEach(key => {
        const val = params.get(key);
        if (val) {
            sessionStorage.setItem(`gamification_${key}`, val);
            hasParams = true;
        }
    });

    // Decrypt the AES token and store the full payload
    const token = params.get('token');
    if (token) {
            hasParams = true;
            if (token !== 'GUEST_SESSION') {
                sessionStorage.setItem('gamification_rawToken', token);
                const payload = decryptToken(token);
                if (payload) {
                    ['game_id', 'emp_id', 'emp_name', 'emp_mobile', 'location', 'zone'].forEach(k => { if (payload[k] != null) sessionStorage.setItem(`gamification_${k}`, String(payload[k])); });
                    sessionStorage.setItem('gamification_referral', payload.referral || 'N');
                }
            }
        }
        if (hasParams) {
        window.history.replaceState({}, '', window.location.pathname);
    }
})();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
