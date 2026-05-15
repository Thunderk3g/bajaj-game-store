import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { incrementPlayCount } from './services/playCount'

// Add Google Fonts
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;900&family=Inter:wght@400;600;700;800&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Initialize session data from URL if present
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const gameId = urlParams.get('gameId');
const referral = urlParams.get('referral');

if (userId) sessionStorage.setItem('gamification_userId', userId);
if (gameId) sessionStorage.setItem('gamification_gameId', gameId);
if (referral) sessionStorage.setItem('gamification_referral', referral);

incrementPlayCount();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
