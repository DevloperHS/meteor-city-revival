import * as THREE from 'three';
import { scene } from '../core/setup.js';
import { buildingTextures, emissiveTextures } from './textures.js';
import { createRng } from '../../shared/rng.js';
import { generateBuildingPositions } from '../../shared/cityLayout.js';
import { GRID_SIZE, BLOCK_SIZE } from '../../shared/constants.js';

export { GRID_SIZE, BLOCK_SIZE };

export const cityGroup = new THREE.Group();
scene.add(cityGroup);

export const buildings = [];

export function generateCity(sessionSeed) {
  while (cityGroup.children.length > 0) {
    const child = cityGroup.children[0];
    cityGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
  }
  buildings.length = 0;

  const layoutRng = createRng(sessionSeed);
  const positions = generateBuildingPositions(layoutRng);
  const visualRng = createRng(sessionSeed ^ 0x9e3779b9);
  const rand = () => visualRng.random();

  for (let layoutIndex = 0; layoutIndex < positions.length; layoutIndex++) {
    const { x: px, z: pz } = positions[layoutIndex];
        const distFromCenter = Math.sqrt(px * px + pz * pz);
        const heightBoost = Math.max(0.3, 1 - distFromCenter / 300);

        // Varied footprints: mix of low-rises, mid-rises, skyscrapers,
        // cylindrical towers, and wide complexes for visual diversity
        const buildingType = rand();
        let width, depth, height, isCylinder = false;
        if (buildingType < 0.15) {
          // Low-rise - short and wide
          width = 12 + rand() * 10;
          depth = 12 + rand() * 10;
          height = (12 + rand() * 16) * heightBoost;
        } else if (buildingType < 0.35) {
          // Low-rise wide complex
          width = 14 + rand() * 8;
          depth = 10 + rand() * 6;
          height = (10 + rand() * 12) * heightBoost;
        } else if (buildingType < 0.7) {
          // Mid-rise
          width = 8 + rand() * 10;
          depth = 8 + rand() * 10;
          height = (25 + rand() * 40) * heightBoost;
        } else if (buildingType < 0.85) {
          // Tall skyscraper
          width = 7 + rand() * 8;
          depth = 7 + rand() * 8;
          height = (60 + rand() * 60) * heightBoost;
        } else {
          // Cylindrical tower
          width = 8 + rand() * 6;
          depth = width;
          height = (50 + rand() * 70) * heightBoost;
          isCylinder = true;
        }
        const finalHeight = Math.max(10, height);

        const texIndex = Math.floor(rand() * buildingTextures.length);
        const tex = buildingTextures[texIndex].clone();
        tex.needsUpdate = true;
        tex.repeat.set(
          Math.max(1, Math.round(width / 6)),
          Math.max(1, Math.round(finalHeight / 10))
        );

        const emTex = emissiveTextures[texIndex].clone();
        emTex.needsUpdate = true;
        emTex.repeat.copy(tex.repeat);

        // Geometry: cylinder for round towers, box for everything else.
        // Both keep userData.height/width/depth so destruction physics work.
        const geo = isCylinder
          ? new THREE.CylinderGeometry(width / 2, width / 2, finalHeight, 16)
          : new THREE.BoxGeometry(width, finalHeight, depth);
        // Material varies roughness/metalness by type for visual variety
        const isGlass = texIndex === 1;
        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          emissiveMap: emTex,
          emissive: 0xffcc88,
          emissiveIntensity: 1.6,
          roughness: isGlass ? 0.35 : 0.7 + rand() * 0.15,
          metalness: isGlass ? 0.6 : 0.15 + rand() * 0.15,
        });

        const building = new THREE.Mesh(geo, mat);
        building.position.set(px, finalHeight / 2, pz);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData = {
          originalPos: building.position.clone(),
          layoutIndex,
          height: finalHeight,
          width: width,
          depth: depth,
          destroyed: false,
          regenerating: false,
          regenProgress: 0,
          velocity: new THREE.Vector3(),
          angularVelocity: new THREE.Vector3(),
          // Window flicker data - random phase for ambient animation
          flickerPhase: rand() * Math.PI * 2,
          flickerSpeed: 0.5 + rand() * 2,
          flickerIdx: Math.floor(rand() * 6),
          baseEmissive: 1.6,
        };

        // Add roof detail for taller buildings - varied styles
        if (finalHeight > 40 && rand() < 0.6) {
          const roofStyle = rand();
          if (roofStyle < 0.4 && !isCylinder) {
            // Stepped setback - a narrower box on top
            const roofW = width * (0.6 + rand() * 0.2);
            const roofD = depth * (0.6 + rand() * 0.2);
            const roofH = 8 + rand() * 12;
            const roofGeo = new THREE.BoxGeometry(roofW, roofH, roofD);
            const roofMat = new THREE.MeshStandardMaterial({
              color: 0x1a1a22,
              roughness: 0.8,
              metalness: 0.2,
            });
            const roofDetail = new THREE.Mesh(roofGeo, roofMat);
            roofDetail.position.set(0, finalHeight / 2 + roofH / 2, 0);
            roofDetail.castShadow = true;
            roofDetail.receiveShadow = true;
            building.add(roofDetail);
            // Second setback on very tall buildings
            if (finalHeight > 80 && rand() < 0.5) {
              const r2W = roofW * 0.7;
              const r2D = roofD * 0.7;
              const r2H = 6 + rand() * 8;
              const r2Geo = new THREE.BoxGeometry(r2W, r2H, r2D);
              const r2Detail = new THREE.Mesh(r2Geo, roofMat);
              r2Detail.position.set(0, finalHeight / 2 + roofH + r2H / 2, 0);
              r2Detail.castShadow = true;
              building.add(r2Detail);
            }
          } else if (roofStyle < 0.7) {
            // Small utility box / penthouse
            const roofW = width * (0.3 + rand() * 0.3);
            const roofD = depth * (0.3 + rand() * 0.3);
            const roofH = 3 + rand() * 6;
            const roofGeo = new THREE.BoxGeometry(roofW, roofH, roofD);
            const roofMat = new THREE.MeshStandardMaterial({
              color: 0x1a1a22,
              roughness: 0.8,
              metalness: 0.2,
            });
            const roofDetail = new THREE.Mesh(roofGeo, roofMat);
            roofDetail.position.set(
              (rand() - 0.5) * width * 0.2,
              finalHeight / 2 + roofH / 2,
              (rand() - 0.5) * depth * 0.2
            );
            roofDetail.castShadow = true;
            roofDetail.receiveShadow = true;
            building.add(roofDetail);
          } else {
            // Antenna / spire on tall buildings
            const spireH = 8 + rand() * 16;
            const spireGeo = new THREE.CylinderGeometry(0.3, 0.8, spireH, 6);
            const spireMat = new THREE.MeshStandardMaterial({
              color: 0x2a2a32,
              roughness: 0.5,
              metalness: 0.7,
            });
            const spire = new THREE.Mesh(spireGeo, spireMat);
            spire.position.set(0, finalHeight / 2 + spireH / 2, 0);
            spire.castShadow = true;
            building.add(spire);
            // Red beacon light at top
            const beaconGeo = new THREE.SphereGeometry(0.6, 8, 8);
            const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.set(0, finalHeight / 2 + spireH, 0);
            building.add(beacon);
          }
        }

    cityGroup.add(building);
    buildings.push(building);
  }

  // Parks & green areas - more clusters across the larger city
  for (let i = 0; i < 20; i++) {
    const px = (rand() - 0.5) * GRID_SIZE * BLOCK_SIZE;
    const pz = (rand() - 0.5) * GRID_SIZE * BLOCK_SIZE;
    // Tree cluster
    for (let j = 0; j < 3 + rand() * 4; j++) {
      const tx = px + (rand() - 0.5) * 20;
      const tz = pz + (rand() - 0.5) * 20;
      const treeH = 8 + rand() * 10;
      const treeGeo = new THREE.ConeGeometry(2.5 + rand() * 2, treeH, 6);
      const treeMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a1e,
        roughness: 0.95,
        metalness: 0.0,
      });
      const tree = new THREE.Mesh(treeGeo, treeMat);
      tree.position.set(tx, treeH / 2, tz);
      tree.castShadow = true;
      cityGroup.add(tree);
      buildings.push(tree);
    }
  }
}

