import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { decryptToken } from './utils/crypto'

  // ── Decrypt gamification token, store payload in sessionStorage & clean URL ──
  ; (() => {
    const params = new URLSearchParams(window.location.search);
    const basicKeys = ['userId', 'gameId', 'empName', 'empMobile', 'location', 'zone'];
    let hasParams = false;
    basicKeys.forEach(key => { const v = params.get(key); if (v) { sessionStorage.setItem(`gamification_${key}`, v); hasParams = true; } });
    // Normalize: URL param empMobile → also write to snake_case key used by components
    const urlEmpMobile = sessionStorage.getItem('gamification_empMobile');
    if (urlEmpMobile) sessionStorage.setItem('gamification_emp_mobile', urlEmpMobile);
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
    if (hasParams) window.history.replaceState({}, '', window.location.pathname);
  })();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
