import * as THREE from 'three';
import { composer, camera, controls } from '../core/setup.js';
import { fireLight, ambientFireLight, meteorLight } from '../core/lighting.js';
import { meteors, TRAIL_COUNT } from '../effects/meteors.js';
import {
  EXPLOSION_COUNT, expAlphas, expPositions, expVelocities, expSizes, expColors, explosionGeo,
  SMOKE_COUNT, smokeAlphas, smokePositions, smokeVelocities, smokeSizes, smokeGeo,
  shockwave, shockMat, shockwave2, shock2Mat,
  debrisGroup, debrisChunks,
  updateImpactFlares, hasActiveImpactFlares,
} from '../effects/explosions.js';
import { starMat } from '../world/stars.js';
import { buildings } from '../world/city.js';
import { game, state } from '../game/state.js';
import { triggerImpact } from '../game/impact.js';
import { updateGameUI } from '../ui/hud.js';

const clock = new THREE.Clock();
let frameCount = 0;
let fpsTime = 0;

export function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.033);
  state.time += dt;
  frameCount++;
  fpsTime += dt;

  starMat.uniforms.time.value = state.time;

  // ===== Meteor movement (all active meteors) =====
  meteors.forEach(m => {
    if (!m.active) return;

    m.pos.add(m.vel);
    m.vel.y -= 0.05;
    m.group.position.copy(m.pos);

    m.core.rotation.x += 0.02;
    m.core.rotation.y += 0.03;
    m.glow.rotation.x -= 0.01;
    m.glow.rotation.y -= 0.02;
    m.glowMat.opacity = 0.5 + Math.sin(state.time * 10) * 0.15;
    // Corona pulsates - intensifies with speed for atmospheric entry feel
    const speed = m.vel.length();
    m.corona.rotation.y += 0.015;
    m.coronaMat.opacity = 0.2 + Math.sin(state.time * 8) * 0.08 + Math.min(0.15, speed * 0.02);

    // In-flight light follows active meteors (impact uses fireLight separately)
    meteorLight.position.copy(m.pos);
    meteorLight.intensity = (6 + Math.sin(state.time * 15) * 2) * m.scale;

    // Trail - size scales with meteor scale for bigger meteors
    const idx = m.trailIndex % TRAIL_COUNT;
    m.trailPositions[idx * 3] = m.pos.x;
    m.trailPositions[idx * 3 + 1] = m.pos.y;
    m.trailPositions[idx * 3 + 2] = m.pos.z;
    m.trailAlphas[idx] = 1;
    m.trailSizes[idx] = (Math.random() * 4 + 2) * m.scale;
    m.trailIndex++;

    for (let i = 0; i < TRAIL_COUNT; i++) {
      if (m.trailAlphas[i] > 0) {
        m.trailAlphas[i] -= 0.015;
        m.trailSizes[i] += 0.1;
      }
    }
    m.trailGeo.attributes.position.needsUpdate = true;
    m.trailGeo.attributes.alpha.needsUpdate = true;
    m.trailGeo.attributes.size.needsUpdate = true;

    if (m.pos.y <= 5) {
      triggerImpact(m);
    }
  });

  // Dim meteor light when none are active
  if (!meteors.some(m => m.active)) {
    meteorLight.intensity = Math.max(0, meteorLight.intensity - dt * 12);
  }

  // ===== Explosion & smoke particles (always update if any alive) =====
  let anyExpAlive = false;
  for (let i = 0; i < EXPLOSION_COUNT; i++) {
    if (expAlphas[i] > 0) {
      anyExpAlive = true;
      expPositions[i * 3] += expVelocities[i].x;
      expPositions[i * 3 + 1] += expVelocities[i].y;
      expPositions[i * 3 + 2] += expVelocities[i].z;
      expVelocities[i].y -= 0.3;
      expVelocities[i].multiplyScalar(0.98);
      expAlphas[i] -= 0.008;
      expSizes[i] += 0.15;
      expColors[i * 3 + 1] *= 0.99;
      expColors[i * 3 + 2] *= 0.98;
    }
  }
  if (anyExpAlive) {
    explosionGeo.attributes.position.needsUpdate = true;
    explosionGeo.attributes.alpha.needsUpdate = true;
    explosionGeo.attributes.size.needsUpdate = true;
    explosionGeo.attributes.color.needsUpdate = true;
  }

  let anySmokeAlive = false;
  for (let i = 0; i < SMOKE_COUNT; i++) {
    if (smokeAlphas[i] > 0) {
      anySmokeAlive = true;
      smokePositions[i * 3] += smokeVelocities[i].x;
      smokePositions[i * 3 + 1] += smokeVelocities[i].y;
      smokePositions[i * 3 + 2] += smokeVelocities[i].z;
      smokeVelocities[i].multiplyScalar(0.99);
      smokeVelocities[i].y += 0.05;
      smokeSizes[i] += 0.3;
      smokeAlphas[i] -= 0.002;
    }
  }
  if (anySmokeAlive) {
    smokeGeo.attributes.position.needsUpdate = true;
    smokeGeo.attributes.alpha.needsUpdate = true;
    smokeGeo.attributes.size.needsUpdate = true;
  }

  // Shockwaves (fade out)
  if (shockMat.opacity > 0 || shock2Mat.opacity > 0) {
    const swT = state.time;
    shockwave.scale.multiplyScalar(1 + dt * 2);
    shockMat.opacity = Math.max(0, shockMat.opacity - dt * 0.4);
    shockwave2.scale.multiplyScalar(1 + dt * 1.5);
    shock2Mat.opacity = Math.max(0, shock2Mat.opacity - dt * 0.25);
  }

  // Impact flare clouds + fire light fade
  updateImpactFlares(dt);

  if (fireLight.intensity > 0) {
    const fadeRate = hasActiveImpactFlares() ? 2.5 : 8;
    fireLight.intensity = Math.max(0, fireLight.intensity - dt * fadeRate);
    ambientFireLight.intensity = Math.max(0, ambientFireLight.intensity - dt * (fadeRate * 0.35));
  }

  state.cameraShake = Math.max(0, state.cameraShake - dt * 60);

  // ===== Building destruction physics + regeneration + window flicker =====
  buildings.forEach((building) => {
    if (!building.userData.originalPos) return;

    // Subtle window flicker on intact buildings - throttled for performance.
    // Only update a subset of buildings each frame (round-robin via frameCount)
    // to avoid per-frame material writes on hundreds of buildings.
    if (!building.userData.destroyed && building.material && building.material.emissiveIntensity !== undefined) {
      if (building.userData.flickerPhase !== undefined && (frameCount + building.userData.flickerIdx) % 6 === 0) {
        // Gentle smooth sine flicker - no random dropout (caused black flashes)
        const flicker = 0.92 + 0.08 * Math.sin(state.time * building.userData.flickerSpeed + building.userData.flickerPhase);
        building.material.emissiveIntensity = building.userData.baseEmissive * flicker;
      }
    }

    if (building.userData.destroyed && !building.userData.regenerating) {
      // Dim windows as building is destroyed - lights go out
      if (building.material && building.material.emissiveIntensity !== undefined) {
        building.material.emissiveIntensity = Math.max(0, building.material.emissiveIntensity - dt * 3);
      }
      // Physics for falling/tumbling
      building.userData.velocity.y -= 0.3;
      building.position.add(building.userData.velocity);
      building.rotation.x += building.userData.angularVelocity.x;
      building.rotation.y += building.userData.angularVelocity.y;
      building.rotation.z += building.userData.angularVelocity.z;
      building.userData.velocity.multiplyScalar(0.99);

      if (building.position.y < building.userData.height / 2) {
        building.position.y = building.userData.height / 2;
        building.userData.velocity.y *= -0.3;
        building.userData.velocity.x *= 0.8;
        building.userData.velocity.z *= 0.8;
        building.userData.angularVelocity.multiplyScalar(0.7);
      }

      // Start regeneration after delay
      building.userData.regenDelay -= dt;
      if (building.userData.regenDelay <= 0) {
        building.userData.regenerating = true;
        building.userData.regenProgress = 0;
        // Snap back to original position, scale from 0
        building.position.copy(building.userData.originalPos);
        building.rotation.set(0, 0, 0);
        building.userData.velocity.set(0, 0, 0);
        building.userData.angularVelocity.set(0, 0, 0);
        building.scale.set(0.01, 0.01, 0.01);
      }
    } else if (building.userData.regenerating) {
      // Grow back from ground
      building.userData.regenProgress += dt * 0.45; // ~2.2 seconds to regrow
      const p = Math.min(1, building.userData.regenProgress);
      // Ease-out
      const s = 1 - Math.pow(1 - p, 3);
      building.scale.set(s, s, s);
      if (p >= 1) {
        building.userData.regenerating = false;
        building.userData.destroyed = false;
        building.scale.set(1, 1, 1);
        // Restore window lights when building regenerates
        if (building.material && building.material.emissiveIntensity !== undefined) {
          building.material.emissiveIntensity = building.userData.baseEmissive;
        }
      }
    }
  });

  // ===== Debris physics =====
  for (let i = debrisChunks.length - 1; i >= 0; i--) {
    const chunk = debrisChunks[i];
    chunk.userData.vel.y -= 0.4;
    chunk.position.add(chunk.userData.vel);
    chunk.rotation.x += chunk.userData.angVel.x;
    chunk.rotation.y += chunk.userData.angVel.y;
    chunk.rotation.z += chunk.userData.angVel.z;

    if (chunk.position.y < 1) {
      chunk.position.y = 1;
      chunk.userData.vel.y *= -0.4;
      chunk.userData.vel.x *= 0.7;
      chunk.userData.vel.z *= 0.7;
      chunk.userData.angVel.multiplyScalar(0.6);
    }

    chunk.userData.life -= 0.005;
    if (chunk.userData.life <= 0) {
      debrisGroup.remove(chunk);
      chunk.geometry.dispose();
      debrisChunks.splice(i, 1);
    }
  }

  // ===== Camera shake - smoothed, decays over time =====
  if (state.cameraShake > 0) {
    const shake = state.cameraShake * 0.3;
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;
    camera.position.z += (Math.random() - 0.5) * shake;
  }

  // ===== Cinematic mode / idle auto-orbit =====
  // Detect idle: if no interaction for 8 seconds, begin gentle auto-orbit
  const idleTime = (performance.now() - state.lastInteraction) / 1000;
  state.idleAutoOrbit = idleTime > 8 && !state.cinematicMode;

  if (state.cinematicMode) {
    state.cinematicAngle += dt * 0.1;
    const radius = 250;
    const height = 80 + Math.sin(state.cinematicAngle) * 30;
    camera.position.x = Math.cos(state.cinematicAngle) * radius;
    camera.position.z = Math.sin(state.cinematicAngle) * radius;
    camera.position.y = height;
    camera.lookAt(0, 40, 0);
  } else if (state.idleAutoOrbit) {
    // Gentle slow pan around the city - lerp for smoothness
    state.idleAngle += dt * 0.04;
    const radius = 320;
    const targetX = Math.cos(state.idleAngle) * radius;
    const targetZ = Math.sin(state.idleAngle) * radius;
    const targetY = 130 + Math.sin(state.idleAngle * 0.7) * 20;
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.z += (targetZ - camera.position.z) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.lookAt(0, 40, 0);
  } else {
    controls.update();
  }

  // ===== Game state & UI =====
  updateGameUI();

  // ===== FPS counter =====
  if (fpsTime >= 1) {
    const fps = Math.round(frameCount / fpsTime);
    const buildingCount = game.totalBuildings;
    const destroyedCount = game.destroyedCount;
    document.getElementById('stats').innerHTML = `
      FPS: ${fps}<br>
      Buildings: ${buildingCount}<br>
      Destroyed: ${destroyedCount}<br>
      Debris: ${debrisChunks.length}
    `;
    frameCount = 0;
    fpsTime = 0;
  }

  composer.render();
}

