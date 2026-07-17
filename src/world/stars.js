import * as THREE from 'three';
import { scene } from '../core/setup.js';

const starGeo = new THREE.BufferGeometry();
const STAR_COUNT = 1500;
const starPositions = new Float32Array(STAR_COUNT * 3);
const starColors = new Float32Array(STAR_COUNT * 3);
const starSizes = new Float32Array(STAR_COUNT);

for (let i = 0; i < STAR_COUNT; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random());
  const r = 1500 + Math.random() * 500;
  starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = r * Math.cos(phi) * 0.5 + 200;
  starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

  // Varied star colors - white, blue-white, warm yellow
  const colorType = Math.random();
  const c = 0.6 + Math.random() * 0.4;
  if (colorType < 0.6) {
    // White stars
    starColors[i * 3] = c;
    starColors[i * 3 + 1] = c;
    starColors[i * 3 + 2] = c;
  } else if (colorType < 0.85) {
    // Blue-white stars
    starColors[i * 3] = c * 0.8;
    starColors[i * 3 + 1] = c * 0.9;
    starColors[i * 3 + 2] = c;
  } else {
    // Warm yellow stars
    starColors[i * 3] = c;
    starColors[i * 3 + 1] = c * 0.85;
    starColors[i * 3 + 2] = c * 0.6;
  }
  // A few bright stars
  starSizes[i] = Math.random() < 0.05 ? Math.random() * 3 + 2 : Math.random() * 1.5 + 0.3;
}

starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

export const starMat = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 } },
  vertexShader: `
    attribute float size;
    varying vec3 vColor;
    uniform float time;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float twinkle = 0.7 + 0.3 * sin(time * 2.0 + position.x * 0.01);
      gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main() {
      vec2 c = gl_PointCoord - vec2(0.5);
      float d = length(c);
      if (d > 0.5) discard;
      float a = smoothstep(0.5, 0.0, d);
      gl_FragColor = vec4(vColor, a);
    }
  `,
  vertexColors: true,
  transparent: true,
  depthWrite: false,
});

export const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

