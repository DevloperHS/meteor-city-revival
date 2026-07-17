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

// Impact flare pool - visible bloom cloud scaled by meteor size
export const MAX_IMPACT_FLARES = 12;
export const impactFlares = [];

function createImpactFlare() {
  const group = new THREE.Group();

  const corona = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(corona);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xffee55,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(glow);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(core);

  group.visible = false;
  scene.add(group);

  return {
    group,
    core,
    glow,
    corona,
    coreMat: core.material,
    glowMat: glow.material,
    coronaMat: corona.material,
    active: false,
    age: 0,
    maxLife: 2.5,
    meteorScale: 1,
  };
}

for (let i = 0; i < MAX_IMPACT_FLARES; i++) {
  impactFlares.push(createImpactFlare());
}

export function spawnImpactFlare(pos, meteorScale) {
  let flare = impactFlares.find(f => !f.active);
  if (!flare) {
    flare = impactFlares.reduce((oldest, f) => (f.age > oldest.age ? f : oldest), impactFlares[0]);
  }

  const s = Math.max(0.5, meteorScale);
  flare.meteorScale = s;
  flare.maxLife = 2.2 + s * 0.9;
  flare.age = 0;
  flare.active = true;

  flare.group.position.set(pos.x, Math.max(8, pos.y), pos.z);
  flare.group.scale.setScalar(0.2 * s);
  flare.group.visible = true;

  flare.core.scale.setScalar(6 * s);
  flare.glow.scale.setScalar(14 * s);
  flare.corona.scale.setScalar(28 * s);

  flare.coreMat.opacity = 1;
  flare.glowMat.opacity = 0.9;
  flare.coronaMat.opacity = 0.55;
}

export function updateImpactFlares(dt) {
  for (const f of impactFlares) {
    if (!f.active) continue;

    f.age += dt;
    const t = f.age / f.maxLife;
    if (t >= 1) {
      f.active = false;
      f.group.visible = false;
      continue;
    }

    const s = f.meteorScale;
    // Fast bloom-out, then slow expansion (matches screenshot fireball feel)
    const burst = t < 0.12 ? t / 0.12 : 1;
    const expand = 0.25 + burst * 0.75 + t * 0.65;
    f.group.scale.setScalar(expand * s);

    const fade = (1 - t) * (1 - t);
    f.coreMat.opacity = fade;
    f.glowMat.opacity = fade * 0.9;
    f.coronaMat.opacity = fade * 0.55 * (0.92 + Math.sin(f.age * 14) * 0.08);

    // Warm shift as the flare cools
    const heat = 1 - t * 0.7;
    f.coreMat.color.setRGB(1, heat, heat * 0.35);
    f.glowMat.color.setRGB(1, 0.78 + heat * 0.2, heat * 0.2);
    f.coronaMat.color.setRGB(1, 0.55 + heat * 0.15, heat * 0.05);

    f.group.position.y += dt * (1.5 + s * 1.2);
    f.corona.rotation.y += dt * 0.6;
    f.glow.rotation.y -= dt * 0.8;
  }
}

export function clearImpactFlares() {
  for (const f of impactFlares) {
    f.active = false;
    f.group.visible = false;
  }
}

export function hasActiveImpactFlares() {
  return impactFlares.some(f => f.active);
}

