import { game } from '../game/state.js';

// launchBtn is bound in events.js; hud reads it from DOM to avoid circular init
let launchBtn = null;
export function setLaunchBtn(btn) { launchBtn = btn; }

export function updateGameUI() {
  const hud = document.getElementById('game-hud');
  if (!hud) return;

  const pct = game.destructionPercent;
  const time = game.elapsed;
  const tStr = time.toFixed(1) + 's';

  hud.innerHTML = `
    <div class="hud-row"><span class="hud-label">CLICKS</span><span class="hud-val">${game.clicks}</span></div>
    <div class="hud-row"><span class="hud-label">TIME</span><span class="hud-val">${tStr}</span></div>
    <div class="hud-row"><span class="hud-label">DESTROYED</span><span class="hud-val">${pct}%</span></div>
    <div class="hud-bar"><div class="hud-bar-fill" style="width:${pct}%"></div></div>
  `;

  // Update powerup buttons
  const chargeBtn = document.getElementById('charge-btn');
  const infinityBtn = document.getElementById('infinity-btn');
  if (chargeBtn) {
    document.getElementById('charge-count').textContent = game.powerups.charge;
    chargeBtn.disabled = game.powerups.charge <= 0;
  }
  if (infinityBtn) {
    document.getElementById('infinity-count').textContent = game.powerups.infinity;
    infinityBtn.disabled = game.powerups.infinity <= 0;
  }

  // Update launch button text based on charge availability
  if (!game.charging) {
    if (launchBtn) {
      launchBtn.textContent = game.powerups.charge > 0
        ? `⚡ Hold to Charge (${game.powerups.charge})`
        : '🔥 Launch Meteor';
    }
  }

  // Update charge bar
  const chargeContainer = document.getElementById('charge-bar-container');
  const chargeFill = document.getElementById('charge-bar-fill');
  if (chargeContainer && chargeFill) {
    if (game.charging) {
      // Charge over 1.5 seconds
      const elapsed = (performance.now() - game.chargeStart) / 1500;
      game.chargeLevel = Math.min(1, elapsed);
      chargeContainer.classList.add('active');
      chargeFill.style.width = (game.chargeLevel * 100) + '%';
    } else {
      chargeContainer.classList.remove('active');
      chargeFill.style.width = '0%';
    }
  }

  // Win check: 100% destroyed at this instant
  if (game.started && !game.won && pct >= 100) {
    game.won = true;
    showWinScreen();
  }
}

export function showWinScreen() {
  const overlay = document.getElementById('win-overlay');
  if (!overlay) return;
  document.getElementById('win-time').textContent = game.elapsed.toFixed(1) + 's';
  document.getElementById('win-clicks').textContent = game.clicks;
  overlay.classList.remove('hidden');
}

