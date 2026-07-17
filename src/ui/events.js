import { game, state } from '../game/state.js';
import { launchMeteor } from '../game/launch.js';
import { resetCity } from '../game/reset.js';
import { activateInfinity, POWERUP_COLORS } from '../game/powerups.js';
import { flashMessage } from './flash.js';
import { setLaunchBtn } from './hud.js';
import { camera, renderer, composer, controls, fxaaPass, bloomPass, isMobile } from '../core/setup.js';

const launchBtn = document.getElementById('launch-btn');
setLaunchBtn(launchBtn);

// Hold-to-charge: only available if user has charge powerups.
// Pointer Events (not mouse events) so this works identically for touch,
// mouse and pen with a single listener set - no separate touchstart/
// touchend handlers and no reliance on the ~300ms synthetic-mouse-event
// fallback mobile browsers use for touch.
launchBtn.addEventListener('pointerdown', (e) => {
  launchBtn.setPointerCapture(e.pointerId);
  if (game.powerups.charge > 0 && !game.won) {
    game.charging = true;
    game.chargeStart = performance.now();
    game.chargeLevel = 0;
  }
});

launchBtn.addEventListener('pointerup', () => {
  if (game.charging) {
    const level = game.chargeLevel;
    game.charging = false;
    game.chargeLevel = 0;
    // Consume a charge powerup, launch scaled meteor
    if (level > 0.1) {
      game.powerups.charge--;
      const scale = 1 + level * 2.5; // up to ~3.5x at full charge
      launchMeteor(scale);
      flashMessage(`⚡ Charged Meteor! (${scale.toFixed(1)}x)`, POWERUP_COLORS.charge);
    }
    launchBtn.textContent = game.powerups.charge > 0
      ? `⚡ Hold to Charge (${game.powerups.charge})`
      : '🔥 Launch Meteor';
  } else if (game.powerups.charge <= 0 && !game.won) {
    // No charge powerup held - plain tap/click launches immediately
    launchMeteor(1);
  }
});

// pointercancel fires instead of pointerup when a touch is interrupted
// (e.g. the finger drags off the button) - treat like mouseleave, cancel
// without launching.
['pointerleave', 'pointercancel'].forEach(evt => {
  launchBtn.addEventListener(evt, () => {
    if (game.charging) {
      game.charging = false;
      game.chargeLevel = 0;
    }
  });
});

document.getElementById('reset-btn').addEventListener('click', resetCity);
document.getElementById('view-btn').addEventListener('click', () => {
  state.cinematicMode = !state.cinematicMode;
  controls.enabled = !state.cinematicMode;
  document.getElementById('view-btn').textContent = state.cinematicMode ? 'Exit Cinematic' : 'Cinematic View';
});
document.getElementById('win-restart-btn').addEventListener('click', resetCity);

// Infinity powerup button
const infinityBtn = document.getElementById('infinity-btn');
if (infinityBtn) {
  infinityBtn.addEventListener('click', activateInfinity);
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  // composer.setSize() hands the bloom pass the full window size - reapply
  // the mobile half-resolution bloom target so it doesn't snap back to full
  // res (and full cost) on orientation change / resize.
  if (isMobile) {
    bloomPass.setSize(window.innerWidth / 2, window.innerHeight / 2);
  }
  fxaaPass.material.uniforms['resolution'].value.set(
    1 / window.innerWidth, 1 / window.innerHeight
  );
}
window.addEventListener('resize', handleResize);
// iOS/Android don't always fire `resize` promptly on rotation - the viewport
// dimensions settle a beat after the event, so re-check next frame.
window.addEventListener('orientationchange', () => {
  setTimeout(handleResize, 100);
});

// Track user interaction to pause idle auto-orbit
['mousedown', 'wheel', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, () => { state.lastInteraction = performance.now(); });
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (game.powerups.charge > 0 && !game.won) {
      game.charging = true;
      game.chargeStart = performance.now();
      game.chargeLevel = 0;
    } else if (!game.won) {
      launchMeteor(1);
    }
  }
  if (e.code === 'KeyI') activateInfinity();
  if (e.code === 'KeyR') resetCity();
  if (e.code === 'KeyC') {
    state.cinematicMode = !state.cinematicMode;
    controls.enabled = !state.cinematicMode;
    document.getElementById('view-btn').textContent = state.cinematicMode ? 'Exit Cinematic' : 'Cinematic View';
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'Space' && game.charging) {
    const level = game.chargeLevel;
    game.charging = false;
    game.chargeLevel = 0;
    if (level > 0.1) {
      game.powerups.charge--;
      const scale = 1 + level * 2.5;
      launchMeteor(scale);
      flashMessage(`⚡ Charged Meteor! (${scale.toFixed(1)}x)`, POWERUP_COLORS.charge);
    }
    launchBtn.textContent = game.powerups.charge > 0
      ? `⚡ Hold to Charge (${game.powerups.charge})`
      : '🔥 Launch Meteor';
  }
});

