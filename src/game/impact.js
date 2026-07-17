import * as THREE from 'three';
import { state } from './state.js';
import { buildings } from '../world/city.js';
import {
  EXPLOSION_COUNT, expPositions, expVelocities, expColors, expAlphas, expSizes, explosionGeo,
  SMOKE_COUNT, smokePositions, smokeVelocities, smokeAlphas, smokeSizes, smokeGeo,
  shockwave, shockMat, shockwave2, shock2Mat,
  debrisGroup, debrisChunks,
  spawnImpactFlare,
} from '../effects/explosions.js';
import { fireLight, ambientFireLight } from '../core/lighting.js';
import { Sound } from '../audio/sound.js';
import { game } from './state.js';
import { getSessionSeed, getImpactCount, recordImpact } from './session.js';
import { regenDelaySeconds } from '../../shared/regenDelay.js';
import { DESTROY_RADIUS } from '../../shared/constants.js';

export function triggerImpact(m) {
  const scale = m.scale || 1;
  state.cameraShake = Math.max(state.cameraShake, 30 * scale);

  const impactPos = m.group.position.clone();
  m.active = false;
  m.group.visible = false;
  m.group.scale.set(1, 1, 1);

  for (let i = 0; i < EXPLOSION_COUNT; i++) {
    expPositions[i * 3] = impactPos.x;
    expPositions[i * 3 + 1] = impactPos.y;
    expPositions[i * 3 + 2] = impactPos.z;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = (2 + Math.random() * 15) * scale;
    expVelocities[i].set(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.abs(Math.cos(phi)) * speed + Math.random() * 5,
      Math.sin(phi) * Math.sin(theta) * speed
    );

    const t = Math.random();
    expColors[i * 3] = 1;
    expColors[i * 3 + 1] = 0.4 + t * 0.5;
    expColors[i * 3 + 2] = 0.1 + t * 0.2;
    expAlphas[i] = 1;
    expSizes[i] = (Math.random() * 4 + 2) * scale;
  }
  explosionGeo.attributes.position.needsUpdate = true;
  explosionGeo.attributes.color.needsUpdate = true;
  explosionGeo.attributes.alpha.needsUpdate = true;

  for (let i = 0; i < SMOKE_COUNT; i++) {
    smokePositions[i * 3] = impactPos.x + (Math.random() - 0.5) * 20 * scale;
    smokePositions[i * 3 + 1] = impactPos.y + Math.random() * 10;
    smokePositions[i * 3 + 2] = impactPos.z + (Math.random() - 0.5) * 20 * scale;

    const theta = Math.random() * Math.PI * 2;
    const speed = (0.5 + Math.random() * 3) * scale;
    smokeVelocities[i].set(
      Math.cos(theta) * speed,
      (1 + Math.random() * 3) * scale,
      Math.sin(theta) * speed
    );
    smokeAlphas[i] = 0.6 + Math.random() * 0.3;
    smokeSizes[i] = (Math.random() * 30 + 20) * scale;
  }
  smokeGeo.attributes.position.needsUpdate = true;
  smokeGeo.attributes.alpha.needsUpdate = true;

  shockwave.position.set(impactPos.x, 0.5, impactPos.z);
  shockwave.scale.set(1, 1, 1);
  shockMat.opacity = 0.9;

  shockwave2.position.set(impactPos.x, 0.5, impactPos.z);
  shockwave2.scale.set(1, 1, 1);
  shock2Mat.opacity = 0.6;

  const destroyRadius = DESTROY_RADIUS;
  const sessionSeed = getSessionSeed();
  const impactIndex = getImpactCount();

  buildings.forEach((building) => {
    if (!building.userData.destroyed && building.userData.originalPos) {
      const dx = building.position.x - impactPos.x;
      const dz = building.position.z - impactPos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < destroyRadius) {
        const force = (1 - dist / destroyRadius) * 2 * scale;
        building.userData.destroyed = true;
        building.userData.regenerating = false;
        building.userData.regenProgress = 0;
        if (building.userData.layoutIndex !== undefined && sessionSeed != null) {
          building.userData.regenDelay = regenDelaySeconds(
            sessionSeed,
            building.userData.layoutIndex,
            impactIndex,
          );
        } else {
          building.userData.regenDelay = 5 + Math.random() * 4;
        }

        const dir = new THREE.Vector3(dx, 0, dz).normalize();
        building.userData.velocity.copy(dir).multiplyScalar(force * 5);
        building.userData.velocity.y = Math.random() * 3 * force;

        building.userData.angularVelocity.set(
          (Math.random() - 0.5) * 0.1 * force,
          (Math.random() - 0.5) * 0.05 * force,
          (Math.random() - 0.5) * 0.1 * force
        );
      }
    }
  });

  const debrisCount = Math.floor(30 * scale);
  for (let i = 0; i < debrisCount; i++) {
    const size = (1 + Math.random() * 3) * Math.min(scale, 2);
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.9,
      metalness: 0.1,
      emissive: 0x220000,
    });
    const chunk = new THREE.Mesh(geo, mat);
    chunk.position.copy(impactPos);
    chunk.position.y = 5;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.4;
    const speed = 5 + Math.random() * 20;
    chunk.userData = {
      vel: new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi) * speed,
        Math.sin(phi) * speed + 10,
        Math.sin(theta) * Math.cos(phi) * speed
      ),
      angVel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ),
      life: 1.0,
    };
    chunk.castShadow = true;
    debrisGroup.add(chunk);
    debrisChunks.push(chunk);
  }

  fireLight.position.copy(impactPos);
  fireLight.intensity = 30 * scale;
  ambientFireLight.position.copy(impactPos);
  ambientFireLight.position.y += 20 * scale;
  ambientFireLight.intensity = 8 * scale;

  spawnImpactFlare(impactPos, scale);

  if (sessionSeed != null) {
    recordImpact({ t: game.elapsed, x: impactPos.x, z: impactPos.z });
  }

  Sound.playImpact();
}

