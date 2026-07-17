import './styles.css';

// Side-effect imports: construct scene graph
import './core/setup.js';
import './core/lighting.js';
import './world/ground.js';
import './world/city.js';
import './effects/meteors.js';
import './effects/explosions.js';
import './world/stars.js';

import { Sound } from './audio/sound.js';
import { state } from './game/state.js';
import { animate } from './loop/animate.js';
import { isMobile } from './core/setup.js';
import './ui/events.js';

setTimeout(() => {
  document.getElementById('loading').classList.add('hidden');
}, 1000);

if (isMobile) {
  document.getElementById('intro-hint').textContent =
    'Drag to orbit · Pinch to zoom · Tap Launch Meteor';
}

// Intro screen - Start button hides overlay and primes audio
document.getElementById('start-btn').addEventListener('click', () => {
  Sound.init();
  document.getElementById('intro-screen').classList.add('hidden');
  state.lastInteraction = performance.now();
});

animate();

