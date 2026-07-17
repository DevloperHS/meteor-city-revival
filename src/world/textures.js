import * as THREE from 'three';

export function createSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0.0, '#05060d');   // zenith - near-black blue
  grd.addColorStop(0.45, '#0a1020');  // upper sky - deep navy
  grd.addColorStop(0.75, '#1a1830');  // mid sky - dusky purple-blue
  grd.addColorStop(0.92, '#3a2a28');  // horizon haze - warm brown
  grd.addColorStop(1.0, '#5a3a28');   // city glow - warm orange-brown
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 16, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBuildingTexture(variant) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base wall color varies by material variant
  const tones = [
    { top: '#2a2e36', bot: '#1a1e26' }, // concrete - cool grey
    { top: '#1e2632', bot: '#121820' }, // glass tower - dark blue-grey
    { top: '#2e2422', bot: '#1e1816' }, // brick - warm dark brown
    { top: '#26262e', bot: '#16161e' }, // dark stone - neutral
  ];
  const tone = tones[variant % tones.length];

  const grd = ctx.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, tone.top);
  grd.addColorStop(1, tone.bot);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 256, 512);

  // Window grid - fewer lit at night, varied warmth
  const winRows = 16;
  const winCols = 6;
  const winW = 256 / winCols;
  const winH = 512 / winRows;

  for (let r = 0; r < winRows; r++) {
    for (let c = 0; c < winCols; c++) {
      const lit = Math.random() < 0.5;
      const x = c * winW + winW * 0.2;
      const y = r * winH + winH * 0.2;
      const w = winW * 0.6;
      const h = winH * 0.6;

      if (lit) {
        const warmth = Math.random();
        const r2 = Math.floor(210 + warmth * 45);
        const g2 = Math.floor(170 + warmth * 60);
        const b2 = Math.floor(80 + warmth * 50);
        ctx.fillStyle = `rgb(${r2},${g2},${b2})`;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
      } else {
        // Unlit windows - very dark, slight blue reflection
        ctx.fillStyle = '#0a0c12';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(x, y, w, h);

      // Window frame
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(10,10,16,0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }
  }

  // Subtle vertical mullions for glass-tower variant
  if (variant === 1) {
    ctx.strokeStyle = 'rgba(60,70,90,0.3)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= winCols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * winW, 0);
      ctx.lineTo(c * winW, 512);
      ctx.stroke();
    }
  }

  // Noise overlay for material texture
  const imgData = ctx.getImageData(0, 0, 256, 512);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    imgData.data[i] += n;
    imgData.data[i + 1] += n;
    imgData.data[i + 2] += n;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createGroundTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark night asphalt
  ctx.fillStyle = '#15151a';
  ctx.fillRect(0, 0, 512, 512);

  // Road grid - slightly lighter than surrounding ground
  ctx.strokeStyle = '#202028';
  ctx.lineWidth = 44;
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();

  // Road surface - subtle gradient for wet/asphalt sheen
  const roadGrd = ctx.createLinearGradient(234, 0, 278, 0);
  roadGrd.addColorStop(0, 'rgba(30,30,38,0)');
  roadGrd.addColorStop(0.5, 'rgba(40,42,52,0.4)');
  roadGrd.addColorStop(1, 'rgba(30,30,38,0)');
  ctx.fillStyle = roadGrd;
  ctx.fillRect(234, 0, 44, 512);
  ctx.fillRect(0, 234, 512, 44);

  // Lane markings - dim yellow dashes
  ctx.strokeStyle = 'rgba(200,170,70,0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([18, 22]);
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();
  ctx.setLineDash([]);

  // Sidewalk edges - subtle lighter lines along roads
  ctx.strokeStyle = 'rgba(50,50,58,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(236, 0); ctx.lineTo(236, 512);
  ctx.moveTo(276, 0); ctx.lineTo(276, 512);
  ctx.moveTo(0, 236); ctx.lineTo(512, 236);
  ctx.moveTo(0, 276); ctx.lineTo(512, 276);
  ctx.stroke();

  // Noise for asphalt texture
  const imgData = ctx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    imgData.data[i] += n;
    imgData.data[i + 1] += n;
    imgData.data[i + 2] += n;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createEmissiveTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 256, 512);

  const winRows = 16;
  const winCols = 6;
  const winW = 256 / winCols;
  const winH = 512 / winRows;

  for (let r = 0; r < winRows; r++) {
    for (let c = 0; c < winCols; c++) {
      if (Math.random() < 0.5) {
        const x = c * winW + winW * 0.2;
        const y = r * winH + winH * 0.2;
        const w = winW * 0.6;
        const h = winH * 0.6;
        const warmth = Math.random();
        // Warm emissive - sodium/warm LED night lighting, brighter
        ctx.fillStyle = `rgb(${255},${210 + warmth*45},${120+warmth*60})`;
        ctx.fillRect(x, y, w, h);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Pre-create texture variants - one per material type
export const buildingTextures = [];
export const emissiveTextures = [];
for (let i = 0; i < 4; i++) {
  buildingTextures.push(createBuildingTexture(i));
  emissiveTextures.push(createEmissiveTexture());
}
export const groundTexture = createGroundTexture();

