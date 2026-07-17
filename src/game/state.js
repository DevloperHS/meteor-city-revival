import { buildings } from '../world/city.js';

let won = false;
let serverVerified = false;
let pendingVerify = false;

export const game = {
  clicks: 0,
  startTime: 0,
  started: false,
  totalBuildings: 0,
  get won() {
    return won;
  },
  set won(value) {
    if (value === true && this.destructionPercent < 100) return;
    won = value;
    if (!value) serverVerified = false;
  },
  get serverVerified() {
    return serverVerified;
  },
  set serverVerified(value) {
    serverVerified = value;
  },
  get pendingVerify() {
    return pendingVerify;
  },
  set pendingVerify(value) {
    pendingVerify = value;
  },
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

export function isLegitimateWin() {
  return game.started && game.destructionPercent >= 100 && won && serverVerified;
}

export function resetWinState() {
  won = false;
  serverVerified = false;
  pendingVerify = false;
}

export const state = {
  cameraShake: 0,
  cinematicMode: false,
  cinematicAngle: 0,
  time: 0,
  lastInteraction: performance.now(),
  idleAutoOrbit: false,
  idleAngle: 0,
};
