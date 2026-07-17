import './styles.css';

// Side-effect imports: construct scene graph
import './core/setup.js';
import './core/lighting.js';
import './world/ground.js';
import './effects/meteors.js';
import './effects/explosions.js';
import './world/stars.js';

import { Sound } from './audio/sound.js';
import { state, game, resetWinState } from './game/state.js';
import { animate } from './loop/animate.js';
import { isMobile } from './core/setup.js';
import { initWinGuard } from './ui/hud.js';
import { generateCity, buildings } from './world/city.js';
import { startSession, clearSessionImpacts } from './game/session.js';
import './ui/events.js';

const PREVIEW_SEED = 12345;

generateCity(PREVIEW_SEED);
game.totalBuildings = buildings.filter(b => b.userData.originalPos).length;

setTimeout(() => {
  document.getElementById('loading').classList.add('hidden');
}, 1000);

if (isMobile) {
  document.getElementById('intro-hint').textContent =
    'Drag to orbit · Pinch to zoom · Tap Launch Meteor';
  document.getElementById('launch-btn').textContent = '🔥 Launch';
  document.getElementById('view-btn').textContent = 'Cinematic';
}

function waitForPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', async () => {
  Sound.init();
  startBtn.disabled = true;
  const prevLabel = startBtn.textContent;
  startBtn.textContent = 'Starting…';

  try {
    const session = await startSession();
    startBtn.textContent = 'Building city…';
    await waitForPaint();
    generateCity(session.seed);
    game.totalBuildings = buildings.filter(b => b.userData.originalPos).length;
    clearSessionImpacts();
    resetWinState();
    document.getElementById('intro-screen').classList.add('hidden');
    state.lastInteraction = performance.now();
  } catch (err) {
    console.error(err);
    startBtn.textContent = 'Retry';
    startBtn.disabled = false;
    return;
  }

  startBtn.textContent = prevLabel;
  startBtn.disabled = false;
});

initWinGuard();
animate();
