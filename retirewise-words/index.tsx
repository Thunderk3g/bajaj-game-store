import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

(() => {
  const params = new URLSearchParams(window.location.search);
  const keys = ['userId', 'gameId', 'empName', 'empMobile', 'location', 'zone', 'token'];
  let hasParams = false;
  keys.forEach((key) => {
    const v = params.get(key);
    if (v) {
      sessionStorage.setItem(`gamification_${key}`, v);
      hasParams = true;
    }
  });
  if (hasParams) {
    window.history.replaceState({}, '', window.location.pathname);
  }
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
