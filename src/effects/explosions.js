import * as THREE from 'three';
import { scene } from '../core/setup.js';
import { trailVertexShader, trailFragmentShader, createParticleTexture } from './shaders.js';

export const EXPLOSION_COUNT = 500;
export const explosionGeo = new THREE.BufferGeometry();
export const expPositions = new Float32Array(EXPLOSION_COUNT * 3);
export const expColors = new Float32Array(EXPLOSION_COUNT * 3);
export const expSizes = new Float32Array(EXPLOSION_COUNT);
export const expAlphas = new Float32Array(EXPLOSION_COUNT);
export const expVelocities = [];

for (let i = 0; i < EXPLOSION_COUNT; i++) {
  expPositions[i * 3] = 0;
  expPositions[i * 3 + 1] = 0;
  expPositions[i * 3 + 2] = 0;
  expColors[i * 3] = 1;
  expColors[i * 3 + 1] = 0.6;
  expColors[i * 3 + 2] = 0.15;
  expSizes[i] = Math.random() * 4 + 2;
  expAlphas[i] = 0;
  expVelocities.push(new THREE.Vector3());
}

explosionGeo.setAttribute('position', new THREE.BufferAttribute(expPositions, 3));
explosionGeo.setAttribute('color', new THREE.BufferAttribute(expColors, 3));
explosionGeo.setAttribute('size', new THREE.BufferAttribute(expSizes, 1));
explosionGeo.setAttribute('alpha', new THREE.BufferAttribute(expAlphas, 1));

const explosionMat = new THREE.ShaderMaterial({
  uniforms: { pointTexture: { value: createParticleTexture() } },
  vertexShader: trailVertexShader,
  fragmentShader: trailFragmentShader,
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

export const explosion = new THREE.Points(explosionGeo, explosionMat);
scene.add(explosion);

// Debris chunks
export const debrisGroup = new THREE.Group();
scene.add(debrisGroup);
export const debrisChunks = [];

// Shockwave rings
const shockGeo = new THREE.RingGeometry(1, 1.5, 64);
export const shockMat = new THREE.MeshBasicMaterial({
  color: 0xffaa44,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
});
export const shockwave = new THREE.Mesh(shockGeo, shockMat);
shockwave.rotation.x = -Math.PI / 2;
scene.add(shockwave);

const shock2Geo = new THREE.RingGeometry(1, 2, 64);
export const shock2Mat = new THREE.MeshBasicMaterial({
  color: 0xff6610,
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
});
export const shockwave2 = new THREE.Mesh(shock2Geo, shock2Mat);
shockwave2.rotation.x = -Math.PI / 2;
scene.add(shockwave2);

// Smoke system
export const SMOKE_COUNT = 80;
export const smokeGeo = new THREE.BufferGeometry();
export const smokePositions = new Float32Array(SMOKE_COUNT * 3);
export const smokeColors = new Float32Array(SMOKE_COUNT * 3);
export const smokeSizes = new Float32Array(SMOKE_COUNT);
export const smokeAlphas = new Float32Array(SMOKE_COUNT);
export const smokeVelocities = [];

for (let i = 0; i < SMOKE_COUNT; i++) {
  smokePositions[i * 3] = 0;
  smokePositions[i * 3 + 1] = 0;
  smokePositions[i * 3 + 2] = 0;
  smokeColors[i * 3] = 0.3;
  smokeColors[i * 3 + 1] = 0.24;
  smokeColors[i * 3 + 2] = 0.2;
  smokeSizes[i] = Math.random() * 30 + 20;
  smokeAlphas[i] = 0;
  smokeVelocities.push(new THREE.Vector3());
}

smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
smokeGeo.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));
smokeGeo.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
smokeGeo.setAttribute('alpha', new THREE.BufferAttribute(smokeAlphas, 1));

function createSmokeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,0.8)');
  grd.addColorStop(0.5, 'rgba(255,255,255,0.3)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

const smokeMat = new THREE.ShaderMaterial({
  uniforms: { pointTexture: { value: createSmokeTexture() } },
  vertexShader: trailVertexShader,
  fragmentShader: trailFragmentShader,
  vertexColors: true,
  transparent: true,
  blending: THREE.NormalBlending,
  depthWrite: false,
});

export const smoke = new THREE.Points(smokeGeo, smokeMat);
scene.add(smoke);

