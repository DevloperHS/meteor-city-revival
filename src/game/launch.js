import { Sound } from '../audio/sound.js';
import { game } from './state.js';
import { meteors, MAX_METEORS, TRAIL_COUNT, meteorPool } from '../effects/meteors.js';
import { meteorLight } from '../core/lighting.js';
import { GRID_SIZE, BLOCK_SIZE } from '../../shared/constants.js';

const CITY_HALF = (GRID_SIZE / 2) * BLOCK_SIZE - BLOCK_SIZE * 0.15;

export function launchMeteor() {
  Sound.init();

  if (!game.started) {
    game.started = true;
    game.startTime = performance.now();
  }
  if (game.won) return;
  game.clicks++;

  let m = null;
  for (let i = 0; i < MAX_METEORS; i++) {
    meteorPool.idx = (meteorPool.idx + 1) % MAX_METEORS;
    if (!meteors[meteorPool.idx].active) { m = meteors[meteorPool.idx]; break; }
  }
  if (!m) { m = meteors[meteorPool.idx]; }

  m.active = true;
  m.scale = 1;
  m.group.scale.set(1, 1, 1);

  const angle = Math.random() * Math.PI * 2;
  const dist = 300 + Math.random() * 200;
  m.pos.set(
    Math.cos(angle) * dist,
    400 + Math.random() * 100,
    Math.sin(angle) * dist
  );

  const targetX = (Math.random() - 0.5) * 2 * CITY_HALF;
  const targetZ = (Math.random() - 0.5) * 2 * CITY_HALF;

  m.vel.set(
    (targetX - m.pos.x) / 100,
    -4 - Math.random() * 2,
    (targetZ - m.pos.z) / 100
  );

  m.group.position.copy(m.pos);
  m.group.visible = true;
  meteorLight.color.setHex(0xff6600);

  for (let i = 0; i < TRAIL_COUNT; i++) m.trailAlphas[i] = 0;
  m.trailGeo.attributes.alpha.needsUpdate = true;

  Sound.playMeteor();
}
