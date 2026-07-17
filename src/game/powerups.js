import * as THREE from 'three';
import { scene } from '../core/setup.js';
import { game, state } from './state.js';
import { Sound } from '../audio/sound.js';
import { flashMessage } from '../ui/flash.js';
import { launchMeteor } from './launch.js';

export const powerupGroup = new THREE.Group();
scene.add(powerupGroup);
export const powerups = []; // { mesh, type, pos, vel, life, collected }

export const POWERUP_COLORS = {
  charge: 0x44aaff,
  infinity: 0xff44ff,
};

export function maybeDropPowerup(impactPos, meteorScale) {
  // Per-impact drop rates (independent rolls)
  const infinityChance = 0.000001 / 100; // 0.000001%
  const chargeChance = 0.001 / 100;      // 0.001%

  let type = null;
  if (Math.random() < infinityChance) {
    type = 'infinity';
  } else if (Math.random() < chargeChance) {
    type = 'charge';
  }
  if (!type) return;

  const geo = new THREE.IcosahedronGeometry(3, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: POWERUP_COLORS[type],
    emissive: POWERUP_COLORS[type],
    emissiveIntensity: 3,
    roughness: 0.2,
    metalness: 0.8,
  });
  const orb = new THREE.Mesh(geo, mat);
  orb.position.set(impactPos.x, 10, impactPos.z);

  // Glow halo
  const haloGeo = new THREE.IcosahedronGeometry(5, 1);
  const haloMat = new THREE.MeshBasicMaterial({
    color: POWERUP_COLORS[type],
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  orb.add(halo);

  powerupGroup.add(orb);
  powerups.push({
    mesh: orb,
    halo,
    haloMat,
    type,
    pos: orb.position,
    vel: new THREE.Vector3((Math.random() - 0.5) * 2, 8 + Math.random() * 4, (Math.random() - 0.5) * 2),
    life: 6.0,
    collected: false,
  });
}

export function clearPowerups() {
  while (powerupGroup.children.length > 0) {
    const c = powerupGroup.children[0];
    powerupGroup.remove(c);
    if (c.geometry) c.geometry.dispose();
  }
  powerups.length = 0;
}

export function updatePowerups(dt) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    if (p.collected) continue;

    // Float up and drift
    p.pos.add(p.vel);
    p.vel.y -= 0.05; // gentle arc
    p.vel.multiplyScalar(0.99);
    p.mesh.rotation.x += dt * 2;
    p.mesh.rotation.y += dt * 3;
    p.haloMat.opacity = 0.3 + Math.sin(state.time * 6) * 0.15;

    p.life -= dt;

    // Auto-collect when it rises above 40 units, or after lifetime
    if (p.pos.y > 40 || p.life <= 0) {
      collectPowerup(p);
      // Remove orb
      powerupGroup.remove(p.mesh);
      p.mesh.geometry.dispose();
      powerups.splice(i, 1);
    }
  }
}

export function collectPowerup(p) {
  if (p.type === 'charge') {
    game.powerups.charge++;
    flashMessage('⚡ CHARGE POWERUP! Hold Launch to charge bigger meteors', POWERUP_COLORS.charge);
  } else if (p.type === 'infinity') {
    game.powerups.infinity++;
    flashMessage('∞ INFINITY POWERUP! Press to unleash 5 mega meteors', POWERUP_COLORS.infinity);
  }
  Sound.playPowerup();
}

export function activateInfinity() {
  if (game.powerups.infinity <= 0 || game.won) return;
  game.powerups.infinity--;
  // Launch 5 huge meteors with staggered timing
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      if (!game.won) launchMeteor(3.5);
    }, i * 200);
  }
  flashMessage('∞ INFINITY ACTIVATED!', POWERUP_COLORS.infinity);
}

