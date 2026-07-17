import { game, isLegitimateWin } from '../game/state.js';
import { submitWinVerification } from '../game/session.js';

let winOverlay = null;
let winTimeEl = null;
let winClicksEl = null;
let winGuardReady = false;
let verifyInFlight = false;

export function initWinGuard() {
  winOverlay = document.getElementById('win-overlay');
  winTimeEl = document.getElementById('win-time');
  winClicksEl = document.getElementById('win-clicks');
  if (!winOverlay) return;

  const observer = new MutationObserver(() => {
    enforceWinIntegrity();
  });
  observer.observe(winOverlay, { attributes: true, attributeFilter: ['class'] });
  if (winTimeEl) observer.observe(winTimeEl, { characterData: true, childList: true, subtree: true });
  if (winClicksEl) observer.observe(winClicksEl, { characterData: true, childList: true, subtree: true });

  winGuardReady = true;
  enforceWinIntegrity();
}

function hideWinOverlay() {
  if (winOverlay && !winOverlay.classList.contains('hidden')) {
    winOverlay.classList.add('hidden');
  }
}

export function enforceWinIntegrity() {
  if (!winGuardReady || !winOverlay) return;

  if (isLegitimateWin()) {
    winOverlay.classList.remove('hidden');
    if (winTimeEl) winTimeEl.textContent = game.elapsed.toFixed(1) + 's';
    if (winClicksEl) winClicksEl.textContent = String(game.clicks);
    return;
  }

  hideWinOverlay();
  if (game.won) game.won = false;
}

async function requestWinVerification() {
  if (verifyInFlight || game.pendingVerify || game.won) return;

  game.pendingVerify = true;
  verifyInFlight = true;

  try {
    const result = await submitWinVerification(game.clicks);
    if (result?.verified) {
      game.serverVerified = true;
      game.won = true;
    }
  } catch (err) {
    console.warn('Win verification failed', err);
  } finally {
    game.pendingVerify = false;
    verifyInFlight = false;
    enforceWinIntegrity();
  }
}

export function updateGameUI() {
  const hud = document.getElementById('game-hud');
  if (!hud) return;

  const pct = game.destructionPercent;
  const time = game.elapsed;
  const tStr = time.toFixed(1) + 's';
  const status = game.pendingVerify ? 'VERIFYING…' : `${pct}%`;

  hud.innerHTML = `
    <div class="hud-row"><span class="hud-label">CLICKS</span><span class="hud-val">${game.clicks}</span></div>
    <div class="hud-row"><span class="hud-label">TIME</span><span class="hud-val">${tStr}</span></div>
    <div class="hud-row"><span class="hud-label">DESTROYED</span><span class="hud-val">${status}</span></div>
    <div class="hud-bar"><div class="hud-bar-fill" style="width:${pct}%"></div></div>
  `;

  if (game.started && !game.won && !game.pendingVerify && pct >= 100) {
    requestWinVerification();
  }

  enforceWinIntegrity();
}
