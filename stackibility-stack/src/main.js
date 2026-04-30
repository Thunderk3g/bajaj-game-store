// main.js – bootstrap

import './index.css';
import { GameManager } from './GameManager.js';

// Capture URL params from the gamification deep-link and stash them in
// sessionStorage so the LMS payload can include the user/game context.
const params = new URLSearchParams(window.location.search);
const storeParam = (key, storageKey) => {
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
// Mirror empMobile → emp_mobile so Call-now CTA finds it under the same
// snake_case key the other Bajaj games use.
const empMobile = sessionStorage.getItem('gamification_empMobile');
if (empMobile) sessionStorage.setItem('gamification_emp_mobile', empMobile);
if (params.toString()) {
    window.history.replaceState({}, document.title, window.location.pathname);
}

const canvas = document.getElementById('c');
const game = new GameManager(canvas);

function loop() {
    game.update();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
