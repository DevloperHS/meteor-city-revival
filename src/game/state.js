import { buildings } from '../world/city.js';

export const game = {
  clicks: 0,
  startTime: 0,
  started: false,
  won: false,
  totalBuildings: 0,
  // Powerups
  powerups: { charge: 0, infinity: 0 },
  // Charge mechanic
  charging: false,
  chargeStart: 0,
  chargeLevel: 0, // 0..1
  get destroyedCount() {
    return buildings.filter(b => b.userData.destroyed && b.userData.originalPos).length;
  },
  get destructionPercent() {
    if (this.totalBuildings === 0) return 0;
    return Math.round((this.destroyedCount / this.totalBuildings) * 100);
  },
  get elapsed() {
    if (!this.started) return 0;
    return (performance.now() - this.startTime) / 1000;
  },
};

// Initialize total building count now that `buildings` and `game` both exist
game.totalBuildings = buildings.filter(b => b.userData.originalPos).length;


export const state = {
  cameraShake: 0,
  cinematicMode: false,
  cinematicAngle: 0,
  time: 0,
  // Idle auto-orbit: gently rotates camera when user is inactive
  lastInteraction: performance.now(),
  idleAutoOrbit: false,
  idleAngle: 0,
};

