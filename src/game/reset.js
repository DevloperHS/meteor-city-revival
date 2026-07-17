import { meteors, TRAIL_COUNT } from '../effects/meteors.js';
import { state, game } from './state.js';
import { buildings } from '../world/city.js';
import {
  debrisGroup, debrisChunks,
  EXPLOSION_COUNT, expAlphas, explosionGeo,
  SMOKE_COUNT, smokeAlphas, smokeGeo,
  shockMat, shock2Mat,
  clearImpactFlares,
} from '../effects/explosions.js';
import { fireLight, ambientFireLight, meteorLight } from '../core/lighting.js';
import { clearPowerups } from './powerups.js';

export function resetCity() {
  // Reset all meteors
  meteors.forEach(m => {
    m.active = false;
    m.group.visible = false;
    for (let i = 0; i < TRAIL_COUNT; i++) m.trailAlphas[i] = 0;
    if (m.trailGeo) m.trailGeo.attributes.alpha.needsUpdate = true;
  });

  state.cameraShake = 0;

  buildings.forEach((building) => {
    if (building.userData.originalPos) {
      building.position.copy(building.userData.originalPos);
      building.rotation.set(0, 0, 0);
      building.scale.set(1, 1, 1);
      building.userData.destroyed = false;
      building.userData.regenerating = false;
      building.userData.regenProgress = 0;
      building.userData.velocity.set(0, 0, 0);
      building.userData.angularVelocity.set(0, 0, 0);
      // Restore window lights
      if (building.material && building.material.emissiveIntensity !== undefined && building.userData.baseEmissive !== undefined) {
        building.material.emissiveIntensity = building.userData.baseEmissive;
      }
    }
  });

  while (debrisGroup.children.length > 0) {
    const chunk = debrisGroup.children[0];
    debrisGroup.remove(chunk);
    chunk.geometry.dispose();
  }
  debrisChunks.length = 0;

  for (let i = 0; i < EXPLOSION_COUNT; i++) expAlphas[i] = 0;
  for (let i = 0; i < SMOKE_COUNT; i++) smokeAlphas[i] = 0;

  explosionGeo.attributes.alpha.needsUpdate = true;
  smokeGeo.attributes.alpha.needsUpdate = true;

  shockMat.opacity = 0;
  shock2Mat.opacity = 0;

  fireLight.intensity = 0;
  ambientFireLight.intensity = 0;
  meteorLight.intensity = 0;
  clearImpactFlares();

  // Reset game
  game.clicks = 0;
  game.started = false;
  game.won = false;
  game.startTime = 0;
  game.totalBuildings = buildings.filter(b => b.userData.originalPos).length;
  game.powerups.charge = 0;
  game.powerups.infinity = 0;
  game.charging = false;
  game.chargeLevel = 0;
  clearPowerups();
  document.getElementById('win-overlay').classList.add('hidden');
  document.getElementById('launch-btn').textContent = '🔥 Launch Meteor';
}

