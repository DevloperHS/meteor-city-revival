import * as THREE from 'three';
import { scene } from '../core/setup.js';
import { trailVertexShader, trailFragmentShader, createParticleTexture } from './shaders.js';

export const TRAIL_COUNT = 300;
export const MAX_METEORS = 12;
export const meteors = [];
export const meteorPool = { idx: 0 };

export function createMeteorMesh() {
  const group = new THREE.Group();

  // Hot core - bright emissive sphere
  const coreGeo = new THREE.IcosahedronGeometry(4, 3);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffeecc,
    emissive: 0xff6620,
    emissiveIntensity: 5,
    roughness: 0.2,
    metalness: 0.9,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Inner glow - fiery orange halo
  const glowGeo = new THREE.IcosahedronGeometry(5.5, 2);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff8833,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  group.add(glow);

  // Outer corona - large soft glow for atmospheric entry feel
  const coronaGeo = new THREE.IcosahedronGeometry(8, 2);
  const coronaMat = new THREE.MeshBasicMaterial({
    color: 0xffaa55,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
  });
  const corona = new THREE.Mesh(coronaGeo, coronaMat);
  group.add(corona);

  group.visible = false;
  scene.add(group);

  return {
    group,
    core,
    glow,
    glowMat,
    corona,
    coronaMat,
    active: false,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    scale: 1,        // visual + damage multiplier
    trailIndex: 0,
    trailAlphas: new Float32Array(TRAIL_COUNT),
    trailPositions: new Float32Array(TRAIL_COUNT * 3),
    trailSizes: new Float32Array(TRAIL_COUNT),
    trailGeo: null,
    trailMesh: null,
  };
}

export function setupMeteorTrail(m) {
  const tGeo = new THREE.BufferGeometry();
  tGeo.setAttribute('position', new THREE.BufferAttribute(m.trailPositions, 3));
  tGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(TRAIL_COUNT * 3).fill(1), 3));
  tGeo.setAttribute('size', new THREE.BufferAttribute(m.trailSizes, 1));
  tGeo.setAttribute('alpha', new THREE.BufferAttribute(m.trailAlphas, 1));
  const tMat = new THREE.ShaderMaterial({
    uniforms: { pointTexture: { value: createParticleTexture() } },
    vertexShader: trailVertexShader,
    fragmentShader: trailFragmentShader,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const tMesh = new THREE.Points(tGeo, tMat);
  scene.add(tMesh);
  m.trailGeo = tGeo;
  m.trailMesh = tMesh;
}


for (let i = 0; i < MAX_METEORS; i++) {
  const m = createMeteorMesh();
  setupMeteorTrail(m);
  meteors.push(m);
}


