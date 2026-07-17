import { hashSeed } from './rng.js';

/** Deterministic regen delay (5–9s) — identical on client and server. */
export function regenDelaySeconds(sessionSeed, buildingIndex, impactIndex) {
  const h = hashSeed(sessionSeed, buildingIndex, impactIndex);
  return 5 + (h % 4000) / 1000;
}
