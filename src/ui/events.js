import { game, state } from '../game/state.js';
import { launchMeteor } from '../game/launch.js';
import { resetCity } from '../game/reset.js';
import { camera, renderer, composer, controls, fxaaPass, bloomPass, isMobile } from '../core/setup.js';

const launchBtn = document.getElementById('launch-btn');
launchBtn.addEventListener('click', () => {
  if (!game.won) launchMeteor();
});

document.getElementById('reset-btn').addEventListener('click', resetCity);
document.getElementById('view-btn').addEventListener('click', () => {
  state.cinematicMode = !state.cinematicMode;
  controls.enabled = !state.cinematicMode;
  document.getElementById('view-btn').textContent = state.cinematicMode
    ? (isMobile ? 'Exit' : 'Exit Cinematic')
    : (isMobile ? 'Cinematic' : 'Cinematic View');
});
document.getElementById('win-restart-btn').addEventListener('click', resetCity);

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  if (isMobile) {
    bloomPass.setSize(window.innerWidth / 2, window.innerHeight / 2);
  }
  fxaaPass.material.uniforms['resolution'].value.set(
    1 / window.innerWidth, 1 / window.innerHeight
  );
}
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
  setTimeout(handleResize, 100);
});

['mousedown', 'wheel', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, () => { state.lastInteraction = performance.now(); });
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!game.won) launchMeteor();
  }
  if (e.code === 'KeyR') resetCity();
  if (e.code === 'KeyC') {
    state.cinematicMode = !state.cinematicMode;
    controls.enabled = !state.cinematicMode;
    document.getElementById('view-btn').textContent = state.cinematicMode
      ? (isMobile ? 'Exit' : 'Exit Cinematic')
      : (isMobile ? 'Cinematic' : 'Cinematic View');
  }
});
