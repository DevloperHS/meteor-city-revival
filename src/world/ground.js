import * as THREE from 'three';
import { scene } from '../core/setup.js';
import { groundTexture } from './textures.js';

const groundGeo = new THREE.PlaneGeometry(2000, 2000, 64, 64);
// Gentle procedural noise displacement - keeps city area flat, edges roll
const gPos = groundGeo.attributes.position;
for (let i = 0; i < gPos.count; i++) {
  const x = gPos.getX(i);
  const y = gPos.getY(i);
  const dist = Math.sqrt(x * x + y * y);
  // Only displace far from center so buildings sit flat
  if (dist > 420) {
    const h = (Math.sin(x * 0.01) + Math.cos(y * 0.012)) * 2 * Math.min(1, (dist - 420) / 200);
    gPos.setZ(i, h);
  }
}
groundGeo.computeVertexNormals();

const groundMat = new THREE.MeshStandardMaterial({
  map: groundTexture,
  roughness: 0.85,
  metalness: 0.1,
  color: 0x3a3a44,
});
export const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

