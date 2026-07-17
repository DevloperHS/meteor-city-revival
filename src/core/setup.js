import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { createSkyTexture } from '../world/textures.js';

// Coarse-pointer / narrow-viewport devices (phones, tablets) get a lighter
// render pipeline below - shadows, AA and bloom are the biggest GPU costs.
export const isMobile = window.matchMedia('(pointer: coarse)').matches
  || navigator.maxTouchPoints > 1
  || window.innerWidth < 800;

export const scene = new THREE.Scene();
// Deep night fog - cool blue with slight city-glow warmth near ground.
// Exponential fog gives realistic atmospheric perspective at distance.
scene.fog = new THREE.FogExp2(0x0a0e1a, 0.0018);
scene.background = createSkyTexture();

export const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 5000);
camera.position.set(260, 160, 380);
camera.lookAt(0, 40, 0);

// Native MSAA is redundant with the FXAA pass below and doubles fragment
// cost, so it's skipped on mobile where that cost hurts most.
export const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.shadowMap.enabled = true;
// Soft (PCF) shadows are far more expensive per-fragment than basic PCF -
// use the cheaper filter on mobile GPUs.
renderer.shadowMap.type = isMobile ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
// ACES filmic tone mapping gives a cinematic, film-like response curve
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 30;
controls.maxDistance = 1200;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 40, 0);


export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// Bloom - tuned for night: lower threshold makes window lights, fire, and
// the meteor glow brightly while keeping dark areas deep.
// On mobile the bloom mip chain is built at half resolution - it's a blurred
// glow effect, so the softer detail is invisible while the fill-rate saving
// is large.
const bloomRes = isMobile
  ? new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2)
  : new THREE.Vector2(window.innerWidth, window.innerHeight);
export const bloomPass = new UnrealBloomPass(
  bloomRes,
  0.9,   // strength - strong glow on emissive elements
  0.6,   // radius - medium spread
  0.60   // threshold - only bright elements bloom
);
composer.addPass(bloomPass);

export const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.material.uniforms['resolution'].value.set(
  1 / window.innerWidth, 1 / window.innerHeight
);
composer.addPass(fxaaPass);

