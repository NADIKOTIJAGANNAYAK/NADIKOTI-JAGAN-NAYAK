import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Complaint, WeatherData } from '../types';

export interface City3DCanvasHandle {
  setCameraPreset: (preset: 'overview' | 'coast' | 'ward12' | 'tour') => void;
  setLightingPreset: (preset: 'day' | 'sunset' | 'night') => void;
  toggleLayer: (layer: 'complaints' | 'fleet' | 'radar') => void;
  focusComplaint: (complaintId: string) => void;
}

interface City3DCanvasProps {
  complaints: Complaint[];
  weather: WeatherData;
  onSelectComplaint?: (complaint: Complaint) => void;
  selectedComplaintId?: string | null;
  className?: string;
}

// Pre-allocated scratch helpers for render loop (Zero GC)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _color = new THREE.Color();

// Procedural Canvas Texture Generator (Zero 404 dependencies)
function createGridRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle noise & texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 500; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Road lines
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 448, 448);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.setLineDash([16, 16]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Building Facade Windows Texture
function createBuildingTexture(color = '#38bdf8'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = color;
  for (let y = 16; y < 240; y += 32) {
    for (let x = 16; x < 240; x += 24) {
      if (Math.random() > 0.3) {
        ctx.fillRect(x, y, 14, 18);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const City3DCanvas = forwardRef<City3DCanvasHandle, City3DCanvasProps>(
  ({ complaints, weather, onSelectComplaint, selectedComplaintId, className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredComplaint, setHoveredComplaint] = useState<Complaint | null>(null);
    const [isTourActive, setIsTourActive] = useState(false);

    // Keep active state refs for continuous loop without re-triggering effects
    const stateRef = useRef({
      lighting: 'day' as 'day' | 'sunset' | 'night',
      layerComplaints: true,
      layerFleet: true,
      layerRadar: true,
      targetCamPos: new THREE.Vector3(45, 38, 55),
      targetCamLook: new THREE.Vector3(0, 2, 0),
      isTour: false,
      tourAngle: 0,
      selectedId: selectedComplaintId,
    });

    useEffect(() => {
      stateRef.current.selectedId = selectedComplaintId;
    }, [selectedComplaintId]);

    // Handle exposed to parent
    useImperativeHandle(ref, () => ({
      setCameraPreset: (preset) => {
        stateRef.current.isTour = false;
        setIsTourActive(false);
        if (preset === 'overview') {
          stateRef.current.targetCamPos.set(45, 38, 55);
          stateRef.current.targetCamLook.set(0, 2, 0);
        } else if (preset === 'coast') {
          stateRef.current.targetCamPos.set(15, 14, -35);
          stateRef.current.targetCamLook.set(-2, 4, 0);
        } else if (preset === 'ward12') {
          stateRef.current.targetCamPos.set(-18, 16, 22);
          stateRef.current.targetCamLook.set(-5, 3, 5);
        } else if (preset === 'tour') {
          stateRef.current.isTour = true;
          setIsTourActive(true);
        }
      },
      setLightingPreset: (preset) => {
        stateRef.current.lighting = preset;
      },
      toggleLayer: (layer) => {
        if (layer === 'complaints') {
          stateRef.current.layerComplaints = !stateRef.current.layerComplaints;
        } else if (layer === 'fleet') {
          stateRef.current.layerFleet = !stateRef.current.layerFleet;
        } else if (layer === 'radar') {
          stateRef.current.layerRadar = !stateRef.current.layerRadar;
        }
      },
      focusComplaint: (id) => {
        stateRef.current.isTour = false;
        setIsTourActive(false);
        const match = complaints.find((c) => c.id === id);
        if (match) {
          const mapX = ((match.lng - 83.2185) * 1200) || 0;
          const mapZ = (-(match.lat - 17.6868) * 1200) || 0;
          stateRef.current.targetCamPos.set(mapX + 8, 12, mapZ + 12);
          stateRef.current.targetCamLook.set(mapX, 2, mapZ);
        }
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // 1. Detect Software WebGL from GPU renderer string
      const isSoftwareGl = (() => {
        try {
          const testCanvas = document.createElement('canvas');
          const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
          if (!gl) return true;
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
          const gpu = String(gl.getParameter(param));
          gl.getExtension('WEBGL_lose_context')?.loseContext();
          return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
        } catch {
          return true;
        }
      })();

      // 2. Setup Scene, Camera, Renderer
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 500;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#090d16');
      scene.fog = new THREE.FogExp2('#090d16', 0.008);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
      camera.position.set(45, 38, 55);

      const renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2.05; // Do not go under the ground
      controls.minDistance = 6;
      controls.maxDistance = 120;
      controls.target.set(0, 2, 0);

      // 3. Studio PBR Environment Reflection via PMREMGenerator
      try {
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        pmrem.dispose();
      } catch (e) {
        console.warn('PMREM RoomEnvironment fallback:', e);
      }

      // 4. Lighting Rig (Warm Directional Key + Cool Sky Fill)
      const hemiLight = new THREE.HemisphereLight('#7dd3fc', '#0284c7', 0.65);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight('#fff7ed', 1.8);
      dirLight.position.set(30, 45, 25);
      dirLight.castShadow = !isSoftwareGl;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 120;
      dirLight.shadow.camera.left = -40;
      dirLight.shadow.camera.right = 40;
      dirLight.shadow.camera.top = 40;
      dirLight.shadow.camera.bottom = -40;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
      scene.add(dirLight);

      const coastalGlowLight = new THREE.PointLight('#38bdf8', 2.0, 60);
      coastalGlowLight.position.set(-15, 6, -15);
      scene.add(coastalGlowLight);

      // 5. Shared Procedural Textures & Materials
      const roadTexture = createGridRoadTexture();
      const buildingTextureA = createBuildingTexture('#38bdf8');
      const buildingTextureB = createBuildingTexture('#f59e0b');

      // Shared ground terrain
      const terrainGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
      terrainGeo.rotateX(-Math.PI / 2);

      const terrainMat = new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.85,
        metalness: 0.1,
        map: roadTexture,
      });
      const terrain = new THREE.Mesh(terrainGeo, terrainMat);
      terrain.receiveShadow = !isSoftwareGl;
      terrain.position.y = 0;
      scene.add(terrain);

      // Bay of Bengal Ocean Water Surface (Translucent with animated wave flow)
      const oceanGeo = new THREE.PlaneGeometry(160, 70, 24, 24);
      oceanGeo.rotateX(-Math.PI / 2);
      const oceanMat = new THREE.MeshPhysicalMaterial({
        color: '#0369a1',
        metalness: 0.2,
        roughness: 0.1,
        transmission: isSoftwareGl ? 0 : 0.6,
        transparent: true,
        opacity: 0.85,
        ior: 1.333,
      });
      const ocean = new THREE.Mesh(oceanGeo, oceanMat);
      ocean.position.set(0, 0.2, -45);
      scene.add(ocean);

      // Dolphin's Nose Coastal Headland (Elevated ridge)
      const hillGeo = new THREE.ConeGeometry(18, 14, 8);
      hillGeo.translate(0, 7, 0);
      const hillMat = new THREE.MeshStandardMaterial({
        color: '#064e3b',
        roughness: 0.9,
        metalness: 0.05,
        flatShading: true,
      });
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.position.set(-45, 0, -28);
      hill.scale.set(1.4, 0.9, 2.2);
      hill.castShadow = !isSoftwareGl;
      hill.receiveShadow = !isSoftwareGl;
      scene.add(hill);

      // 6. COMPOSITE PROCEDURAL MODELS (3-12 parts per object, strictly per Three.js guidelines)

      // Subject 1: GVMC Smart City Command Headquarters (8-part composite model)
      const gvmcTowerGroup = new THREE.Group();
      gvmcTowerGroup.position.set(0, 0, 0);

      // Part 1: Base podium steps
      const gvmcBaseGeo = new THREE.BoxGeometry(14, 1.2, 14);
      const gvmcBaseMat = new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.6,
        metalness: 0.3,
      });
      const gvmcBase = new THREE.Mesh(gvmcBaseGeo, gvmcBaseMat);
      gvmcBase.position.y = 0.6;
      gvmcBase.receiveShadow = !isSoftwareGl;
      gvmcTowerGroup.add(gvmcBase);

      // Part 2: Main primary tower silhouette
      const gvmcMainTowerGeo = new THREE.BoxGeometry(8, 22, 8);
      const gvmcMainTowerMat = new THREE.MeshStandardMaterial({
        color: '#0284c7',
        roughness: 0.2,
        metalness: 0.85,
        map: buildingTextureA,
      });
      const gvmcMainTower = new THREE.Mesh(gvmcMainTowerGeo, gvmcMainTowerMat);
      gvmcMainTower.position.y = 12.2;
      gvmcMainTower.castShadow = !isSoftwareGl;
      gvmcTowerGroup.add(gvmcMainTower);

      // Part 3: Mid-tier sky garden ledge
      const gvmcLedgeGeo = new THREE.BoxGeometry(9.5, 0.8, 9.5);
      const gvmcLedgeMat = new THREE.MeshStandardMaterial({
        color: '#10b981',
        roughness: 0.5,
        metalness: 0.2,
      });
      const gvmcLedge = new THREE.Mesh(gvmcLedgeGeo, gvmcLedgeMat);
      gvmcLedge.position.y = 15;
      gvmcTowerGroup.add(gvmcLedge);

      // Part 4: Upper executive council rotunda
      const gvmcRotundaGeo = new THREE.CylinderGeometry(3.5, 3.8, 5, 16);
      const gvmcRotundaMat = new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        roughness: 0.15,
        metalness: 0.9,
      });
      const gvmcRotunda = new THREE.Mesh(gvmcRotundaGeo, gvmcRotundaMat);
      gvmcRotunda.position.y = 25.5;
      gvmcRotunda.castShadow = !isSoftwareGl;
      gvmcTowerGroup.add(gvmcRotunda);

      // Part 5: Antenna mast / Spire
      const gvmcSpireGeo = new THREE.CylinderGeometry(0.15, 0.4, 7, 8);
      const gvmcSpireMat = new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        metalness: 0.95,
        roughness: 0.1,
      });
      const gvmcSpire = new THREE.Mesh(gvmcSpireGeo, gvmcSpireMat);
      gvmcSpire.position.y = 31.5;
      gvmcTowerGroup.add(gvmcSpire);

      // Part 6: Glowing Civic Beacon Sphere on peak
      const gvmcBeaconGeo = new THREE.SphereGeometry(0.7, 16, 16);
      const gvmcBeaconMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
      const gvmcBeacon = new THREE.Mesh(gvmcBeaconGeo, gvmcBeaconMat);
      gvmcBeacon.position.y = 35;
      gvmcTowerGroup.add(gvmcBeacon);

      // Part 7: Holographic status ring
      const gvmcRingGeo = new THREE.TorusGeometry(5.2, 0.12, 8, 32);
      gvmcRingGeo.rotateX(Math.PI / 2);
      const gvmcRingMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', wireframe: true });
      const gvmcRing = new THREE.Mesh(gvmcRingGeo, gvmcRingMat);
      gvmcRing.position.y = 25.5;
      gvmcTowerGroup.add(gvmcRing);

      // Part 8: Soft radial contact shadow plane
      const gvmcShadowGeo = new THREE.PlaneGeometry(18, 18);
      gvmcShadowGeo.rotateX(-Math.PI / 2);
      const gvmcShadowMat = new THREE.MeshBasicMaterial({
        color: '#020617',
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      });
      const gvmcShadow = new THREE.Mesh(gvmcShadowGeo, gvmcShadowMat);
      gvmcShadow.position.y = 0.02;
      gvmcTowerGroup.add(gvmcShadow);

      scene.add(gvmcTowerGroup);

      // Subject 2: Coastal Cyclone Early Warning Radar (7-part composite model)
      const radarGroup = new THREE.Group();
      radarGroup.position.set(-25, 0, -18);

      // Part 1: Radar tower lattice base (truncated pyramid)
      const radarBaseGeo = new THREE.CylinderGeometry(2, 4, 12, 4);
      const radarBaseMat = new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.8,
        roughness: 0.3,
        wireframe: false,
      });
      const radarBase = new THREE.Mesh(radarBaseGeo, radarBaseMat);
      radarBase.position.y = 6;
      radarBase.castShadow = !isSoftwareGl;
      radarGroup.add(radarBase);

      // Part 2: Platform deck
      const radarDeckGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.6, 16);
      const radarDeckMat = new THREE.MeshStandardMaterial({
        color: '#334155',
        metalness: 0.7,
        roughness: 0.4,
      });
      const radarDeck = new THREE.Mesh(radarDeckGeo, radarDeckMat);
      radarDeck.position.y = 12.3;
      radarGroup.add(radarDeck);

      // Part 3: Equipment cabin
      const radarCabinGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
      const radarCabinMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3 });
      const radarCabin = new THREE.Mesh(radarCabinGeo, radarCabinMat);
      radarCabin.position.y = 13.8;
      radarGroup.add(radarCabin);

      // Part 4 & 5: Rotating Radar Dish & Feed Horn (in separate sub-group for animation)
      const radarDishRotator = new THREE.Group();
      radarDishRotator.position.set(0, 15.5, 0);

      const dishGeo = new THREE.SphereGeometry(2.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      dishGeo.rotateX(Math.PI / 4);
      const dishMat = new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        metalness: 0.9,
        roughness: 0.2,
        side: THREE.DoubleSide,
      });
      const radarDish = new THREE.Mesh(dishGeo, dishMat);
      radarDishRotator.add(radarDish);

      const hornGeo = new THREE.CylinderGeometry(0.08, 0.08, 2);
      hornGeo.rotateX(Math.PI / 4);
      const hornMat = new THREE.MeshStandardMaterial({ color: '#ef4444', metalness: 0.9 });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.position.set(0, 0.8, 0.8);
      radarDishRotator.add(horn);

      radarGroup.add(radarDishRotator);

      // Part 6: Radar Telemetry Pulse Cone (Holographic sweep)
      const pulseGeo = new THREE.RingGeometry(1, 16, 32);
      pulseGeo.rotateX(-Math.PI / 2);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: '#06b6d4',
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const radarPulse = new THREE.Mesh(pulseGeo, pulseMat);
      radarPulse.position.y = 0.1;
      radarGroup.add(radarPulse);

      // Part 7: Contact shadow
      const radarShadow = new THREE.Mesh(
        new THREE.CircleGeometry(4.5, 16).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.5 })
      );
      radarShadow.position.y = 0.02;
      radarGroup.add(radarShadow);

      scene.add(radarGroup);

      // Subject 3: Municipal Patrol Inspection Fleet (Moving vehicle with 7 parts)
      const fleetTruck = new THREE.Group();
      fleetTruck.position.set(12, 0, 10);

      // Part 1: Chassis
      const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.6, 2.2),
        new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9, roughness: 0.2 })
      );
      chassis.position.y = 0.6;
      fleetTruck.add(chassis);

      // Part 2: Truck cab with windshield
      const cab = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.4, 2.0),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.5, roughness: 0.3 })
      );
      cab.position.set(1.1, 1.5, 0);
      cab.castShadow = !isSoftwareGl;
      fleetTruck.add(cab);

      // Part 3: Cargo bed
      const bed = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.8, 2.0),
        new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.6, roughness: 0.4 })
      );
      bed.position.set(-0.9, 1.2, 0);
      fleetTruck.add(bed);

      // Part 4: 4 Wheels (using InstancedMesh or grouped cylinders)
      const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelMat = new THREE.MeshStandardMaterial({ color: '#020617', roughness: 0.9 });
      const wheelPositions = [
        [1.2, 0.45, 1.1],
        [1.2, 0.45, -1.1],
        [-1.0, 0.45, 1.1],
        [-1.0, 0.45, -1.1],
      ];
      wheelPositions.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, wy, wz);
        fleetTruck.add(wheel);
      });

      // Part 5: Hydraulic Crane Boom / Lift arm
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 2.8),
        new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9 })
      );
      arm.position.set(-0.8, 2.4, 0);
      arm.rotation.z = Math.PI / 4;
      fleetTruck.add(arm);

      // Part 6: Flashing warning bar on cab roof
      const flasher = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.25, 1.2),
        new THREE.MeshBasicMaterial({ color: '#f97316' })
      );
      flasher.position.set(1.1, 2.3, 0);
      fleetTruck.add(flasher);

      // Part 7: Ground shadow
      const truckShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 3).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.5 })
      );
      truckShadow.position.y = 0.02;
      fleetTruck.add(truckShadow);

      scene.add(fleetTruck);

      // 7. InstancedMesh: City Blocks & Infrastructure Clusters (Visakhapatnam wards)
      const buildingCount = 28;
      const bldgGeo = new THREE.BoxGeometry(1, 1, 1);
      bldgGeo.translate(0, 0.5, 0); // bottom pivot
      const bldgMat = new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.35,
        metalness: 0.65,
        map: buildingTextureB,
      });
      const bldgInstanced = new THREE.InstancedMesh(bldgGeo, bldgMat, buildingCount);
      bldgInstanced.castShadow = !isSoftwareGl;
      bldgInstanced.receiveShadow = !isSoftwareGl;

      // Seed building positions along the coastal grid
      let bIdx = 0;
      for (let bx = -35; bx <= 35; bx += 14) {
        for (let bz = -10; bz <= 35; bz += 12) {
          if (Math.hypot(bx, bz) < 10) continue; // skip center where GVMC HQ is
          const bHeight = 4 + (Math.sin(bx * 0.3 + bz * 0.2) + 1) * 6;
          _vec3A.set(bx + Math.sin(bz) * 2, 0, bz);
          _quat.set(0, 0, 0, 1);
          _vec3B.set(4.5 + Math.random() * 2, bHeight, 4.5 + Math.random() * 2);
          _mat4.compose(_vec3A, _quat, _vec3B);
          bldgInstanced.setMatrixAt(bIdx, _mat4);

          // Subtle variation in tint
          _color.setHSL(0.58 + Math.random() * 0.08, 0.4, 0.25 + Math.random() * 0.15);
          bldgInstanced.setColorAt(bIdx, _color);

          bIdx++;
          if (bIdx >= buildingCount) break;
        }
        if (bIdx >= buildingCount) break;
      }
      bldgInstanced.instanceMatrix.needsUpdate = true;
      if (bldgInstanced.instanceColor) bldgInstanced.instanceColor.needsUpdate = true;
      scene.add(bldgInstanced);

      // 8. Instanced Foliage & Coastal Palms
      const treeCount = 40;
      const treeTrunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 3, 6);
      treeTrunkGeo.translate(0, 1.5, 0);
      const treeTopGeo = new THREE.ConeGeometry(1.6, 3.5, 6);
      treeTopGeo.translate(0, 4.2, 0);

      const treeMat = new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.8 });
      const treeInstanced = new THREE.InstancedMesh(treeTopGeo, treeMat, treeCount);
      for (let t = 0; t < treeCount; t++) {
        const tx = (Math.random() - 0.5) * 80;
        const tz = (Math.random() - 0.5) * 70 + 5;
        const s = 0.8 + Math.random() * 0.5;
        _vec3A.set(tx, 0, tz);
        _quat.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, Math.random() * Math.PI * 2);
        _vec3B.set(s, s, s);
        _mat4.compose(_vec3A, _quat, _vec3B);
        treeInstanced.setMatrixAt(t, _mat4);
      }
      treeInstanced.instanceMatrix.needsUpdate = true;
      scene.add(treeInstanced);

      // 9. Interactive 3D Civic Hotspot Beacons (Mapped to Complaints)
      const hotspotPinsGroup = new THREE.Group();
      const complaintMeshMap = new Map<string, THREE.Object3D>();

      complaints.slice(0, 16).forEach((c, idx) => {
        // Project lat/lng offset relative to center of Vizag
        const mapX = ((c.lng - 83.2185) * 1200) || ((idx % 4 - 1.5) * 16);
        const mapZ = (-(c.lat - 17.6868) * 1200) || ((Math.floor(idx / 4) - 1.5) * 16);

        const pinGroup = new THREE.Group();
        pinGroup.position.set(mapX, 0, mapZ);

        // Status color
        const isResolved = c.status === 'resolved' || c.status === 'verified_closed';
        const isCritical = c.priority === 'critical' || c.status === 'in_progress';
        const pinColor = isResolved ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b';

        // Ground Target Ring
        const targetRing = new THREE.Mesh(
          new THREE.RingGeometry(1.2, 1.6, 24).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: pinColor, side: THREE.DoubleSide })
        );
        targetRing.position.y = 0.05;
        pinGroup.add(targetRing);

        // Pillar Stem
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 4.5, 8),
          new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.9, roughness: 0.1 })
        );
        stem.position.y = 2.25;
        pinGroup.add(stem);

        // Beacon Diamond / Octahedron
        const diamond = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.0, 0),
          new THREE.MeshStandardMaterial({
            color: pinColor,
            emissive: pinColor,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.8,
          })
        );
        diamond.position.y = 5.2;
        diamond.userData = { complaintId: c.id, complaint: c };
        pinGroup.add(diamond);

        // Halo Ring
        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(1.5, 0.08, 8, 24).rotateX(Math.PI / 2),
          new THREE.MeshBasicMaterial({ color: pinColor, wireframe: true })
        );
        halo.position.y = 5.2;
        pinGroup.add(halo);

        hotspotPinsGroup.add(pinGroup);
        complaintMeshMap.set(c.id, pinGroup);
      });

      scene.add(hotspotPinsGroup);

      // 10. Raycasting for Mouse Hover & Selection on 3D Beacons
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const onPointerMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(hotspotPinsGroup.children, true);
        const hit = intersects.find((i) => i.object.userData?.complaint);

        if (hit) {
          container.style.cursor = 'pointer';
          setHoveredComplaint(hit.object.userData.complaint);
        } else {
          container.style.cursor = 'default';
          setHoveredComplaint(null);
        }
      };

      const onClick = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(hotspotPinsGroup.children, true);
        const hit = intersects.find((i) => i.object.userData?.complaint);

        if (hit && onSelectComplaint) {
          const comp = hit.object.userData.complaint as Complaint;
          onSelectComplaint(comp);
          stateRef.current.selectedId = comp.id;
          stateRef.current.targetCamPos.set(hit.point.x + 8, hit.point.y + 6, hit.point.z + 8);
          stateRef.current.targetCamLook.set(hit.point.x, hit.point.y, hit.point.z);
        }
      };

      container.addEventListener('mousemove', onPointerMove);
      container.addEventListener('click', onClick);

      // 11. Resize Observer
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // 12. Main 60fps Animation Loop with software WebGL guard & exponential damping
      let frameId = 0;
      let clock = new THREE.Clock();

      function afterDraw(cb: () => void) {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 60);
          }
        };
        frameId = window.setTimeout(poll, 5);
      }

      function animate() {
        const delta = Math.min(0.1, clock.getDelta());
        const time = clock.getElapsedTime();

        // 1. Rotate radar dish and beacon rings
        radarDishRotator.rotation.y += 1.8 * delta;
        gvmcRing.rotation.z += 0.4 * delta;
        radarPulse.scale.setScalar(1 + (Math.sin(time * 2) * 0.15));

        // 2. Patrol Fleet truck movement along coastal loop
        if (stateRef.current.layerFleet) {
          fleetTruck.visible = true;
          const truckAngle = time * 0.4;
          const tx = Math.sin(truckAngle) * 28;
          const tz = Math.cos(truckAngle) * 18 + 8;
          fleetTruck.position.set(tx, 0, tz);
          fleetTruck.rotation.y = truckAngle + Math.PI / 2;
        } else {
          fleetTruck.visible = false;
        }

        // 3. Layer Visibility
        hotspotPinsGroup.visible = stateRef.current.layerComplaints;
        radarGroup.visible = stateRef.current.layerRadar;

        // 4. Incident Pin Hover Float & Pulse
        hotspotPinsGroup.children.forEach((p, idx) => {
          const diamond = p.children.find((c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.OctahedronGeometry);
          if (diamond) {
            diamond.rotation.y += 1.5 * delta;
            diamond.position.y = 5.2 + Math.sin(time * 3 + idx) * 0.3;
          }
        });

        // 5. Environmental Lighting Transitions
        if (stateRef.current.lighting === 'sunset') {
          dirLight.color.set('#fb923c');
          dirLight.intensity = 1.6;
          hemiLight.color.set('#f472b6');
          hemiLight.groundColor.set('#431407');
          scene.background = _color.set('#1a0d24');
          if (scene.fog) scene.fog.color = _color.set('#1a0d24');
        } else if (stateRef.current.lighting === 'night') {
          dirLight.color.set('#38bdf8');
          dirLight.intensity = 0.4;
          hemiLight.color.set('#1e1b4b');
          hemiLight.groundColor.set('#020617');
          scene.background = _color.set('#030712');
          if (scene.fog) scene.fog.color = _color.set('#030712');
        } else {
          dirLight.color.set('#fff7ed');
          dirLight.intensity = 1.8;
          hemiLight.color.set('#7dd3fc');
          hemiLight.groundColor.set('#0284c7');
          scene.background = _color.set('#090d16');
          if (scene.fog) scene.fog.color = _color.set('#090d16');
        }

        // 6. Camera Damped Transitions & Cinematic Tour
        if (stateRef.current.isTour) {
          stateRef.current.tourAngle += 0.25 * delta;
          const tRadius = 52;
          const tx = Math.sin(stateRef.current.tourAngle) * tRadius;
          const tz = Math.cos(stateRef.current.tourAngle) * tRadius;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 2, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, 28, 2, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, tz, 2, delta);
          controls.target.x = THREE.MathUtils.damp(controls.target.x, 0, 2, delta);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, 4, 2, delta);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, 0, 2, delta);
        } else {
          // Smooth glide toward target preset
          camera.position.x = THREE.MathUtils.damp(camera.position.x, stateRef.current.targetCamPos.x, 3, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, stateRef.current.targetCamPos.y, 3, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, stateRef.current.targetCamPos.z, 3, delta);
          controls.target.x = THREE.MathUtils.damp(controls.target.x, stateRef.current.targetCamLook.x, 3, delta);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, stateRef.current.targetCamLook.y, 3, delta);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, stateRef.current.targetCamLook.z, 3, delta);
        }

        controls.update();
        renderer.render(scene, camera);

        if (isSoftwareGl) {
          afterDraw(animate);
        } else {
          frameId = requestAnimationFrame(animate);
        }
      }

      animate();

      // Cleanup
      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        resizeObserver.disconnect();
        container.removeEventListener('mousemove', onPointerMove);
        container.removeEventListener('click', onClick);

        // Resource disposal
        terrainGeo.dispose();
        terrainMat.dispose();
        oceanGeo.dispose();
        oceanMat.dispose();
        roadTexture.dispose();
        buildingTextureA.dispose();
        buildingTextureB.dispose();
        bldgGeo.dispose();
        bldgMat.dispose();
        bldgInstanced.dispose();
        treeTrunkGeo.dispose();
        treeTopGeo.dispose();
        treeMat.dispose();
        treeInstanced.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }, [complaints]);

    return (
      <div className={`relative w-full h-full min-h-[460px] overflow-hidden select-none ${className}`}>
        {/* WebGL Canvas Mount Container */}
        <div ref={containerRef} className="w-full h-full min-h-[460px] cursor-grab active:cursor-grabbing" />

        {/* 3D Incident Hover Card (Solid surface over WebGL) */}
        {hoveredComplaint && (
          <div className="absolute top-4 left-4 z-20 max-w-xs p-3.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl pointer-events-none animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
              <span className="text-cyan-400 font-mono">{hoveredComplaint.id}</span>
              <span className={`px-2 py-0.5 rounded-full border ${
                hoveredComplaint.status === 'resolved' || hoveredComplaint.status === 'verified_closed'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border-amber-700'
              }`}>
                {hoveredComplaint.status}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white line-clamp-1">
              {hoveredComplaint.title}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
              {hoveredComplaint.address}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>{hoveredComplaint.ward}</span>
              <span className="text-sky-400 font-semibold">Click 3D beacon to view</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);
