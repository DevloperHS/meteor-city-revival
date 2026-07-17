import { GRID_SIZE, BLOCK_SIZE } from './constants.js';

/** Building footprint positions — must match client grid placement logic. */
export function generateBuildingPositions(rng) {
  const positions = [];
  const halfGrid = GRID_SIZE / 2;

  for (let gx = -halfGrid; gx < halfGrid; gx++) {
    for (let gz = -halfGrid; gz < halfGrid; gz++) {
      if (rng.random() < 0.15) continue;

      const cx = gx * BLOCK_SIZE + BLOCK_SIZE / 2;
      const cz = gz * BLOCK_SIZE + BLOCK_SIZE / 2;

      const blockRoll = rng.random();
      if (blockRoll < 0.12) continue;

      const buildingsInBlock = blockRoll < 0.25 ? 1 : blockRoll < 0.55 ? 2 : blockRoll < 0.8 ? 4 : 3;
      const subPositions = [];

      if (buildingsInBlock === 1) {
        subPositions.push([cx, cz]);
      } else if (buildingsInBlock === 2) {
        subPositions.push([cx - 8, cz], [cx + 8, cz]);
      } else if (buildingsInBlock === 3) {
        subPositions.push([cx - 8, cz - 8], [cx + 8, cz - 8], [cx - 8, cz + 8]);
      } else {
        subPositions.push([cx - 8, cz - 8], [cx + 8, cz - 8], [cx - 8, cz + 8], [cx + 8, cz + 8]);
      }

      for (const [px, pz] of subPositions) {
        positions.push({ x: px, z: pz });
      }
    }
  }

  return positions;
}
