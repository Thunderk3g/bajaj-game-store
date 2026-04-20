import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const params = new URLSearchParams(window.location.search);
const storeParam = (key: string, storageKey: string) => {
  const v = params.get(key);
  if (v) sessionStorage.setItem(storageKey, v);
};
storeParam('userId', 'gamification_userId');
storeParam('gameId', 'gamification_gameId');
storeParam('empName', 'gamification_empName');
storeParam('empMobile', 'gamification_empMobile');
storeParam('location', 'gamification_location');
storeParam('zone', 'gamification_zone');
storeParam('token', 'gamification_token');

if (params.toString()) {
  window.history.replaceState({}, document.title, window.location.pathname);
}

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
