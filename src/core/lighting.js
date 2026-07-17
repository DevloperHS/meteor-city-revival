import * as THREE from 'three';
import { scene, isMobile } from './setup.js';

export const hemiLight = new THREE.HemisphereLight(0x4a5a8a, 0x2a1a14, 0.5);
scene.add(hemiLight);

// Cool moonlight - primary directional light, casts soft shadows
export const sunLight = new THREE.DirectionalLight(0x9ab4e8, 0.7);
sunLight.position.set(-200, 300, -100);
sunLight.castShadow = true;
// Shadow map size is the single biggest shadow cost - quarter it on mobile.
const shadowMapSize = isMobile ? 1024 : 2048;
sunLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 800;
sunLight.shadow.camera.left = -400;
sunLight.shadow.camera.right = 400;
sunLight.shadow.camera.top = 400;
sunLight.shadow.camera.bottom = -400;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// Cool fill from opposite side - subtle blue bounce
export const fillLight = new THREE.DirectionalLight(0x3a4a7a, 0.3);
fillLight.position.set(200, 200, 100);
scene.add(fillLight);

// Warm city-glow ambient - simulates light pollution from lit windows.
// Brighter so the city feels illuminated by its own lights.
export const cityGlowLight = new THREE.PointLight(0xff8844, 1.2, 700, 1.0);
cityGlowLight.position.set(0, 40, 0);
scene.add(cityGlowLight);

// Secondary warm glow - spreads the city-light feel across the ground
export const cityGlowLight2 = new THREE.PointLight(0xffaa55, 0.6, 500, 1.2);
cityGlowLight2.position.set(0, 15, 0);
scene.add(cityGlowLight2);

// Fire light (will follow meteor / explosion)
export const fireLight = new THREE.PointLight(0xff5520, 0, 500, 1.5);
scene.add(fireLight);

export const ambientFireLight = new THREE.PointLight(0xff6600, 0, 700, 1.0);
ambientFireLight.position.set(0, 50, 0);
scene.add(ambientFireLight);

// Moon - a glowing sphere placed far away in the sky
const moonGeo = new THREE.SphereGeometry(40, 32, 32);
const moonMat = new THREE.MeshBasicMaterial({
  color: 0xf0eedd,
  transparent: true,
  opacity: 0.95,
});
export const moon = new THREE.Mesh(moonGeo, moonMat);
moon.position.set(-600, 450, -800);
scene.add(moon);

// Moon halo - soft additive glow around the moon
const moonHaloGeo = new THREE.SphereGeometry(70, 32, 32);
const moonHaloMat = new THREE.MeshBasicMaterial({
  color: 0x8899bb,
  transparent: true,
  opacity: 0.15,
  blending: THREE.AdditiveBlending,
});
export const moonHalo = new THREE.Mesh(moonHaloGeo, moonHaloMat);
moonHalo.position.copy(moon.position);
scene.add(moonHalo);

