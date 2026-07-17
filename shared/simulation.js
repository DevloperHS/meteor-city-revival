import { createRng } from './rng.js';
import { generateBuildingPositions } from './cityLayout.js';
import { regenDelaySeconds } from './regenDelay.js';
import {
  DESTROY_RADIUS,
  REGROW_SECONDS,
  MAX_IMPACTS,
  MAX_GAME_SECONDS,
} from './constants.js';

const R2 = DESTROY_RADIUS * DESTROY_RADIUS;

function isDestroyedAt(b, t) {
  return b.lastHitTime !== null && t < b.reviveAt;
}

/**
 * Replay impact log and confirm a legitimate 100% destruction win.
 * @param {number} sessionSeed
 * @param {Array<{t:number,x:number,z:number}>} impacts
 * @returns {{ valid: boolean, reason?: string }}
 */
export function verifyWinReplay(sessionSeed, impacts) {
  if (!Array.isArray(impacts) || impacts.length === 0) {
    return { valid: false, reason: 'no_impacts' };
  }
  if (impacts.length > MAX_IMPACTS) {
    return { valid: false, reason: 'too_many_impacts' };
  }

  const sorted = [...impacts].sort((a, b) => a.t - b.t);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].t < sorted[i - 1].t - 0.001) {
      return { valid: false, reason: 'invalid_timeline' };
    }
  }
  if (sorted.some((imp) => imp.t < 0 || imp.t > MAX_GAME_SECONDS)) {
    return { valid: false, reason: 'invalid_time' };
  }
  if (sorted.some((imp) => !Number.isFinite(imp.x) || !Number.isFinite(imp.z))) {
    return { valid: false, reason: 'invalid_coords' };
  }

  const layoutRng = createRng(sessionSeed);
  const positions = generateBuildingPositions(layoutRng);
  const total = positions.length;
  if (total === 0) return { valid: false, reason: 'empty_city' };

  const buildings = positions.map((p) => ({
    x: p.x,
    z: p.z,
    lastHitTime: null,
    reviveAt: 0,
  }));

  let impactIndex = 0;
  for (const imp of sorted) {
    for (let i = 0; i < buildings.length; i++) {
      const b = buildings[i];
      const dx = b.x - imp.x;
      const dz = b.z - imp.z;
      if (dx * dx + dz * dz < R2) {
        const delay = regenDelaySeconds(sessionSeed, i, impactIndex);
        b.lastHitTime = imp.t;
        b.reviveAt = imp.t + delay + REGROW_SECONDS;
      }
    }

    const destroyed = buildings.filter((b) => isDestroyedAt(b, imp.t)).length;
    if (destroyed >= total) {
      return { valid: true };
    }
    impactIndex++;
  }

  return { valid: false, reason: 'incomplete_destruction' };
}
