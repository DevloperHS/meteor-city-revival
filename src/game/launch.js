import { Sound } from '../audio/sound.js';
import { game } from './state.js';
import { meteors, MAX_METEORS, TRAIL_COUNT, meteorPool } from '../effects/meteors.js';
import { fireLight } from '../core/lighting.js';

export function launchMeteor(scale = 1) {
  Sound.init();

  // Start game timer on first click
  if (!game.started) {
    game.started = true;
    game.startTime = performance.now();
  }
  if (game.won) return;
  game.clicks++;

  // Find a free meteor from the pool
  let m = null;
  for (let i = 0; i < MAX_METEORS; i++) {
    meteorPool.idx = (meteorPool.idx + 1) % MAX_METEORS;
    if (!meteors[meteorPool.idx].active) { m = meteors[meteorPool.idx]; break; }
  }
  if (!m) { m = meteors[meteorPool.idx]; } // overwrite oldest if all busy

  m.active = true;
  m.scale = scale;
  m.group.scale.set(scale, scale, scale);

  const angle = Math.random() * Math.PI * 2;
  const dist = 300 + Math.random() * 200;
  m.pos.set(
    Math.cos(angle) * dist,
    400 + Math.random() * 100,
    Math.sin(angle) * dist
  );

  const targetX = (Math.random() - 0.5) * 60;
  const targetZ = (Math.random() - 0.5) * 60;

  m.vel.set(
    (targetX - m.pos.x) / 100,
    -4 - Math.random() * 2,
    (targetZ - m.pos.z) / 100
  );

  m.group.position.copy(m.pos);
  m.group.visible = true;
  fireLight.color.setHex(0xff6600);

  // Reset trail
  for (let i = 0; i < TRAIL_COUNT; i++) m.trailAlphas[i] = 0;
  m.trailGeo.attributes.alpha.needsUpdate = true;

  Sound.playMeteor();
}

