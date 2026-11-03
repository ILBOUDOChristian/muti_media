import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, Sunset, Moon, MapPin, Sparkles, BookOpen, Crown } from 'lucide-react';

const REGION_COLORS = {
  'Sahel': '#efc44b',
  'Nord': '#d95d45',
  'Centre-Nord': '#a855d6',
  'Plateau-Central': '#7456d9',
  'Centre-Ouest': '#e67a1f',
  'Centre-Sud': '#2e9d7d',
  'Centre': '#ef5b9a',
  'Centre-Est': '#b49c2e',
  'Est': '#d93434',
  'Boucle du Mouhoun': '#3e9f46',
  'Cascades': '#25b7a7',
  'Haut-Bassins': '#3d91d9',
  'Hauts-Bassins': '#3d91d9',
  'Sud-Ouest': '#6d8f32',
};

// Coordonnées géographiques de référence pour la projection Three.js
const cLon = -1.55;
const cLat = 12.26;
const scale = 0.85;

export default function Interactive3DMap({
  onSelectStoryRegion,
  onSelectStoryId,
  activeRegionName,
  activeStoryId,
  activeStoryType,
  onFilterChange,
}) {
  const containerRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [sceneLook, setSceneLook] = useState('dusk');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'contes' | 'legendes'
  const [regionTransition, setRegionTransition] = useState(null);
  const sceneRefs = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    // ── SCÈNE ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#2b1c14');
    scene.fog = new THREE.FogExp2('#2b1c14', 0.038);

    // ── CAMÉRA ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 80);
    camera.position.set(0, 6.8, 8.2);
    camera.lookAt(0, 0.5, 0);

    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // ── RENDERER ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── LUMIÈRES PBR ──────────────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight('#ffb066', 3.2);
    sunLight.position.set(-5, 8.5, 5.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight('#7899c4', '#5a3422', 0.95);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight('#ffd199', 0.75);
    rimLight.position.set(5, 4.5, -5);
    scene.add(rimLight);

    // Feu de camp sacré (lumière chaude scintillante)
    const campfireLight = new THREE.PointLight('#ff6a1a', 3.0, 4.0);
    campfireLight.position.set(0.4, 0.45, 0.1);
    mapGroup.add(campfireLight);

    // Lumière mystique pour les sanctuaires d'eau sacrée (Dafra & Bazoulé)
    const sacredWaterLight = new THREE.PointLight('#42c5b8', 1.8, 3.2);
    sacredWaterLight.position.set(-1.45, 0.4, 0.35);
    mapGroup.add(sacredWaterLight);

    sceneRefs.current = {
      scene,
      sunLight,
      hemiLight,
      rimLight,
      campfireLight,
      sacredWaterLight,
      interactiveLandmarks: [],
      animatedObjects: [],
    };

    // ── MATÉRIAUX CULTURÈS ET ÉLÉMENTS DU RELIEF ─────────────────────────────
    const latMat = new THREE.MeshStandardMaterial({ color: '#9e492c', roughness: 0.88, metalness: 0.04, flatShading: true });
    const borderMat = new THREE.LineBasicMaterial({ color: '#ffd899', transparent: true, opacity: 0.7 });
    const bancoMat = new THREE.MeshStandardMaterial({ color: '#b4603d', roughness: 0.86, flatShading: true });
    const thatchMat = new THREE.MeshStandardMaterial({ color: '#c29b61', roughness: 0.95, flatShading: true });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#3d2518', roughness: 0.9 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#26502f', roughness: 0.85, flatShading: true });
    const goldBronzeMat = new THREE.MeshStandardMaterial({ color: '#e8aa36', roughness: 0.38, metalness: 0.65 });
    const waterMat = new THREE.MeshStandardMaterial({ color: '#1a5f6e', roughness: 0.15, metalness: 0.6, transparent: true, opacity: 0.92 });
    const basaltRockMat = new THREE.MeshStandardMaterial({ color: '#2b231d', roughness: 0.92, flatShading: true });
    const sandstoneDomeMat = new THREE.MeshStandardMaterial({ color: '#af5832', roughness: 0.88, flatShading: true });
    const crocSkinMat = new THREE.MeshStandardMaterial({ color: '#445632', roughness: 0.85, flatShading: true });
    const silureMat = new THREE.MeshStandardMaterial({ color: '#161a1d', roughness: 0.3, metalness: 0.4 });

    // ── CHARGEMENT DU RELIEF GEOJSON ──────────────────────────────────────────
    const regionMeshes = new Map();
    const regionCenters = new Map();

    fetch('/geojson/regions.geojson')
      .then((r) => r.json())
      .then((geoData) => {
        geoData.features.forEach((feature, idx) => {
          const name = feature.properties?.NAME_1 || `Région ${idx}`;
          const coords = feature.geometry.coordinates;

          const parseShape = (poly) => {
            const s = new THREE.Shape();
            poly[0].forEach(([lon, lat], i) => {
              const x = (lon - cLon) * scale;
              const y = (lat - cLat) * scale;
              i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
            });
            return s;
          };

          const shapes = [];
          if (feature.geometry.type === 'Polygon') shapes.push(parseShape(coords));
          else if (feature.geometry.type === 'MultiPolygon') coords.forEach((p) => shapes.push(parseShape(p)));

          shapes.forEach((shape) => {
            const isHighland = name.includes('Cascades') || name.includes('Sud-Ouest');
            const geom = new THREE.ExtrudeGeometry(shape, {
              depth: 0.14 + (isHighland ? 0.08 : 0.02),
              bevelEnabled: true,
              bevelSegments: 1,
              bevelSize: 0.014,
              bevelThickness: 0.014,
            });
            geom.rotateX(-Math.PI / 2);
            const mesh = new THREE.Mesh(geom, latMat.clone());
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { regionName: name, isRegion: true };
            mesh.userData.baseColor = REGION_COLORS[name] || '#9e492c';
            const line = new THREE.LineSegments(new THREE.EdgesGeometry(geom, 25), borderMat);
            mesh.add(line);
            mapGroup.add(mesh);
            regionMeshes.set(name, mesh);
          });

          // Calcul du centre représentatif de la région
          const rings = feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates[0]]
            : feature.geometry.coordinates.map((p) => p[0]);
          const ring = rings.reduce((longest, current) => (current.length > longest.length ? current : longest), []);
          if (ring.length) {
            const center = ring.reduce((sum, [lon, lat]) => ({ lon: sum.lon + lon, lat: sum.lat + lat }), { lon: 0, lat: 0 });
            const targetLon = center.lon / ring.length;
            const targetLat = center.lat / ring.length;
            regionCenters.set(name, new THREE.Vector3((targetLon - cLon) * scale, 0.17, -(targetLat - cLat) * scale));
          }
        });

        sceneRefs.current.regionCenters = regionCenters;

        // Socle monumental du plateau burkinabè
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(3.55, 3.75, 0.22, 54),
          new THREE.MeshStandardMaterial({ color: '#201210', roughness: 0.92 })
        );
        base.position.y = -0.15;
        mapGroup.add(base);
      })
      .catch((err) => console.error('Erreur GeoJSON:', err));

    // ── REPRÉSENTATION 3D DES CONTES : DIORAMA DU VILLAGE ET ARBRE À PALABRES ─
    const villageGroup = new THREE.Group();
    villageGroup.position.set(0.05, 0.17, -0.15);
    mapGroup.add(villageGroup);
    sceneRefs.current.villageGroup = villageGroup;

    // Helper : Case ronde banco + toit en chaume
    const makeHut = (x, z, r = 0.22, wallH = 0.26, roofH = 0.32) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, wallH, 16), bancoMat);
      wall.position.y = wallH / 2;
      wall.castShadow = true;
      wall.receiveShadow = true;
      g.add(wall);
      const door = new THREE.Mesh(new THREE.BoxGeometry(r * 0.5, wallH * 0.65, r * 0.25), woodMat);
      door.position.set(0, wallH * 0.33, r);
      g.add(door);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.45, roofH, 16), thatchMat);
      roof.position.y = wallH + roofH / 2;
      roof.castShadow = true;
      g.add(roof);
      return g;
    };

    // Helper : Grenier à mil sur pilotis
    const makeGranary = (x, z) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6), woodMat);
        leg.position.set(Math.cos(a) * 0.09, 0.09, Math.sin(a) * 0.09);
        leg.castShadow = true;
        g.add(leg);
      }
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.10, 0.24, 10), bancoMat);
      body.position.y = 0.28;
      body.castShadow = true;
      g.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.22, 10), thatchMat);
      roof.position.y = 0.46;
      roof.castShadow = true;
      g.add(roof);
      return g;
    };

    // Helper : Grand Baobab à palabres
    const makeBaobab = (x, z, s = 1.0) => {
      const b = new THREE.Group();
      b.position.set(x, 0, z);
      b.scale.set(s, s, s);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.30, 0.85, 12),
        new THREE.MeshStandardMaterial({ color: '#3d2518', roughness: 0.9, flatShading: true })
      );
      trunk.position.y = 0.425;
      trunk.castShadow = true;
      b.add(trunk);
      [
        { x: 0, y: 0.98, z: 0, rad: 0.44 },
        { x: 0.22, y: 0.88, z: 0.15, rad: 0.32 },
        { x: -0.20, y: 0.84, z: -0.12, rad: 0.35 },
        { x: -0.14, y: 0.92, z: 0.18, rad: 0.28 },
        { x: 0.18, y: 0.94, z: -0.16, rad: 0.26 },
      ].forEach((c) => {
        const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(c.rad, 1), canopyMat);
        leaf.position.set(c.x, c.y, c.z);
        leaf.castShadow = true;
        b.add(leaf);
      });
      const bench = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.045, 6, 20), bancoMat);
      bench.rotation.x = Math.PI / 2;
      bench.position.y = 0.048;
      b.add(bench);
      return b;
    };

    // Concession centrale & cases
    villageGroup.add(makeBaobab(0, 0, 1.0));
    villageGroup.add(makeHut(-0.55, 0.35, 0.22, 0.25, 0.30));
    villageGroup.add(makeHut(-0.75, -0.12, 0.19, 0.22, 0.27));
    villageGroup.add(makeHut(-0.45, -0.55, 0.20, 0.24, 0.28));
    villageGroup.add(makeHut(0.55, -0.40, 0.22, 0.25, 0.30));
    villageGroup.add(makeGranary(-0.25, 0.55));
    villageGroup.add(makeGranary(0.28, 0.52));

    // Puits communautaire
    const well = new THREE.Group();
    well.position.set(-0.08, 0, 0.45);
    const wellRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.13, 14, 1, true),
      new THREE.MeshStandardMaterial({ color: '#5e4a3a', roughness: 0.9 })
    );
    wellRim.position.y = 0.065;
    well.add(wellRim);
    const wellWater = new THREE.Mesh(new THREE.CircleGeometry(0.12, 14), waterMat);
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.y = 0.045;
    well.add(wellWater);
    villageGroup.add(well);

    // Feu de camp (pierres + braises)
    const fire = new THREE.Group();
    fire.position.set(0.35, 0, 0.25);
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 0), basaltRockMat);
      rock.position.set(Math.cos(a) * 0.09, 0.03, Math.sin(a) * 0.09);
      fire.add(rock);
    }
    const embers = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.025, 10),
      new THREE.MeshBasicMaterial({ color: '#ff4400' })
    );
    embers.position.y = 0.015;
    fire.add(embers);
    villageGroup.add(fire);

    // Sentier reliant les concessions
    const waypoints = [
      new THREE.Vector3(-0.55, 0.02, 0.35),
      new THREE.Vector3(-0.75, 0.02, -0.12),
      new THREE.Vector3(-0.45, 0.02, -0.55),
      new THREE.Vector3(0.0, 0.02, -0.65),
      new THREE.Vector3(0.55, 0.02, -0.40),
      new THREE.Vector3(0.35, 0.02, 0.45),
      new THREE.Vector3(-0.08, 0.02, 0.45),
    ];
    const patrolCurve = new THREE.CatmullRomCurve3(waypoints, true, 'catmullrom', 0.5);
    const trailGeom = new THREE.BufferGeometry().setFromPoints(patrolCurve.getPoints(80));
    villageGroup.add(new THREE.Line(trailGeom, new THREE.LineBasicMaterial({ color: '#e8be8e', transparent: true, opacity: 0.65 })));

    // Personnage conteur
    const walker = new THREE.Group();
    const robeMat = new THREE.MeshStandardMaterial({ color: '#1e3068', roughness: 0.87 });
    const skinMat = new THREE.MeshStandardMaterial({ color: '#3a2018', roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 0.20, 10), robeMat);
    body.position.y = 0.10;
    body.castShadow = true;
    walker.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), skinMat);
    head.position.y = 0.23;
    walker.add(head);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.045, 12), thatchMat);
    hat.position.y = 0.27;
    walker.add(hat);
    villageGroup.add(walker);

    // Sonsannin le lièvre rusé
    const hare = new THREE.Group();
    const hareMat = new THREE.MeshStandardMaterial({ color: '#c08040', roughness: 0.85 });
    const hareBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.08, 4, 8), hareMat);
    hareBody.rotation.z = Math.PI / 2;
    hareBody.position.y = 0.06;
    hare.add(hareBody);
    const hareHead = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), hareMat);
    hareHead.position.set(0.08, 0.09, 0);
    hare.add(hareHead);
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.011, 0.075, 6), hareMat);
    [-1, 1].forEach((side) => {
      const e = ear.clone();
      e.position.set(0.065, 0.15, side * 0.018);
      hare.add(e);
    });
    villageGroup.add(hare);

    sceneRefs.current.patrolCurve = patrolCurve;
    sceneRefs.current.hare = hare;
    sceneRefs.current.walker = walker;

    // ── MONUMENTS ET SANCTUAIRES DES LÉGENDES (3dviz-pro-max) ─────────────────
    const landmarksGroup = new THREE.Group();
    mapGroup.add(landmarksGroup);
    sceneRefs.current.landmarksGroup = landmarksGroup;

    // Helper : Créer une balise totem 3D flottante interactive
    const createLandmarkBeacon = (x, y, z, id, title, type, regionName, iconType) => {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(x, y, z);
      beaconGroup.userData = {
        landmarkId: id,
        landmarkName: title,
        landmarkType: type,
        regionName: regionName,
        isLandmark: true,
      };

      // Gemme flottante animée (octaèdre)
      const gemColor = type === 'Légende' ? '#f5b025' : '#e65c34';
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.07, 0),
        new THREE.MeshStandardMaterial({ color: gemColor, roughness: 0.2, metalness: 0.8, emissive: gemColor, emissiveIntensity: 0.35 })
      );
      gem.position.y = 0.52;
      gem.userData = beaconGroup.userData;
      beaconGroup.add(gem);

      // Anneau de rayonnement subtil
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.10, 0.14, 20),
        new THREE.MeshBasicMaterial({ color: gemColor, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      beaconGroup.add(ring);

      landmarksGroup.add(beaconGroup);
      sceneRefs.current.interactiveLandmarks.push(beaconGroup);
      sceneRefs.current.animatedObjects.push({ gem, ring, basePosY: 0.52 });
      return beaconGroup;
    };

    // 1. LÉGENDE DE YENNENGA & L'ÉTALON OUÉDRAOGO (Centre / Plateau-Central)
    const yennengaMonument = new THREE.Group();
    yennengaMonument.position.set(0.12, 0.17, -0.18);
    // Socle sculpté en pierre de latérite taillée
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.38), latMat);
    pedestal.position.y = 0.035;
    pedestal.castShadow = true;
    yennengaMonument.add(pedestal);

    // L'Étalon Ouédraogo (posture cabrée fière et royale)
    const horseGroup = new THREE.Group();
    horseGroup.position.set(0, 0.07, 0);
    // Torso cabré orienté à 35°
    const horseTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.18, 6, 10), goldBronzeMat);
    horseTorso.rotation.x = -Math.PI / 4.5;
    horseTorso.position.set(0, 0.16, 0);
    horseTorso.castShadow = true;
    horseGroup.add(horseTorso);

    // Encolure et tête de l'étalon
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.14, 8), goldBronzeMat);
    neck.position.set(0, 0.28, 0.08);
    neck.rotation.x = Math.PI / 5;
    horseGroup.add(neck);
    const horseHead = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.10, 8), goldBronzeMat);
    horseHead.position.set(0, 0.34, 0.14);
    horseHead.rotation.x = Math.PI / 2.2;
    horseGroup.add(horseHead);

    // Membres postérieurs ancrés
    [-0.05, 0.05].forEach((offset) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.16, 6), goldBronzeMat);
      leg.position.set(offset, 0.08, -0.06);
      horseGroup.add(leg);
    });
    // Membres antérieurs cabrés dans les airs
    [-0.045, 0.045].forEach((offset, idx) => {
      const foreleg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.016, 0.14, 6), goldBronzeMat);
      foreleg.position.set(offset, 0.24, 0.08 + idx * 0.02);
      foreleg.rotation.x = -Math.PI / 3;
      horseGroup.add(foreleg);
    });

    // Princesse Yennenga (silhouette amazone avec arc et cape)
    const yennengaFigure = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.04, 0.14, 8), latMat);
    yennengaFigure.position.set(0, 0.26, -0.01);
    horseGroup.add(yennengaFigure);
    // Lance / Arc doré royal pointé vers l'avant
    const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.30, 6), goldBronzeMat);
    spear.position.set(0.06, 0.34, 0.05);
    spear.rotation.x = -Math.PI / 3.8;
    horseGroup.add(spear);

    yennengaMonument.add(horseGroup);
    landmarksGroup.add(yennengaMonument);
    createLandmarkBeacon(0.12, 0.17, -0.18, 'legende-yennenga', 'L’Épopée de Yennenga', 'Légende', 'Centre', 'horse');

    // 2. SANCTUAIRE DES SILURES SACRÉS DE DAFRA (Haut-Bassins / Bobo-Dioulasso)
    const dafraSanctuary = new THREE.Group();
    dafraSanctuary.position.set(-1.45, 0.17, 0.35);
    // Gorge rocheuse (parois de basalte)
    [-0.22, 0.22].forEach((xOff) => {
      const rockWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.45), basaltRockMat);
      rockWall.position.set(xOff, 0.10, 0);
      rockWall.castShadow = true;
      dafraSanctuary.add(rockWall);
    });
    // Bassin d'eau sacrée du marigot Houet
    const dafraPool = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16), waterMat);
    dafraPool.position.y = 0.015;
    dafraSanctuary.add(dafraPool);

    // Silures sacrés animés (qui nagent doucement dans l'eau sacrée)
    const silureFishGroup = new THREE.Group();
    dafraSanctuary.add(silureFishGroup);
    const silures = [0, Math.PI].map((phase) => {
      const fish = new THREE.Group();
      const fishBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.07, 4, 8), silureMat);
      fishBody.rotation.z = Math.PI / 2;
      fish.add(fishBody);
      // Barbillons (moustaches caractéristiques du silure)
      [-0.01, 0.01].forEach((yOff) => {
        const barbel = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.04, 4), goldBronzeMat);
        barbel.rotation.z = Math.PI / 3;
        barbel.position.set(0.045, yOff, 0);
        fish.add(barbel);
      });
      fish.position.y = 0.03;
      silureFishGroup.add(fish);
      return { fish, phase };
    });
    sceneRefs.current.dafraSilures = silures;

    landmarksGroup.add(dafraSanctuary);
    createLandmarkBeacon(-1.45, 0.17, 0.35, 'legende-dafra', 'Les Silures Sacrés de Dafra', 'Légende', 'Haut-Bassins', 'fish');

    // 3. LA MARE AUX CROCODILES SACRÉS DE BAZOULÉ (Centre-Ouest)
    const bazouleSanctuary = new THREE.Group();
    bazouleSanctuary.position.set(-0.65, 0.17, -0.08);
    // Berges en argile et mare d'eau
    const pondBank = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.30, 0.03, 16), latMat);
    pondBank.position.y = 0.015;
    bazouleSanctuary.add(pondBank);
    const pondWater = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), waterMat);
    pondWater.rotation.x = -Math.PI / 2;
    pondWater.position.y = 0.032;
    bazouleSanctuary.add(pondWater);

    // Crocodile sacré du Nil reposant en confiance sur la berge
    const croc = new THREE.Group();
    croc.position.set(0.06, 0.04, 0.04);
    const crocTorso = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.032, 0.07), crocSkinMat);
    crocTorso.castShadow = true;
    croc.add(crocTorso);
    // Museau aplati et allongé
    const crocSnout = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 6), crocSkinMat);
    crocSnout.rotation.z = -Math.PI / 2;
    crocSnout.position.set(0.12, 0, 0);
    croc.add(crocSnout);
    // Queue fuselée
    const crocTail = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.12, 6), crocSkinMat);
    crocTail.rotation.z = Math.PI / 2;
    crocTail.position.set(-0.13, 0, 0);
    croc.add(crocTail);
    // Crêtes dorsales osseuses
    for (let c = -0.06; c <= 0.06; c += 0.03) {
      const ridge = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.014, 4), basaltRockMat);
      ridge.position.set(c, 0.022, 0);
      croc.add(ridge);
    }
    bazouleSanctuary.add(croc);
    landmarksGroup.add(bazouleSanctuary);
    createLandmarkBeacon(-0.65, 0.17, -0.08, 'legende-crocodiles-bazoule', 'Crocodiles Sacrés de Bazoulé', 'Légende', 'Centre-Ouest', 'croc');

    // 4. LES DÔMES DE FABÉDOUGOU & CHUTES DE KARFIGUÉLA (Cascades / Banfora)
    const fabedougouSite = new THREE.Group();
    fabedougouSite.position.set(-1.55, 0.22, 0.82);
    // Dômes géologiques en strates empilées (structure typique en galettes de grès)
    const makeSandstoneDome = (dx, dz, baseR, tiers) => {
      const dome = new THREE.Group();
      dome.position.set(dx, 0, dz);
      for (let t = 0; t < tiers; t++) {
        const r = baseR * (1 - t * 0.16);
        const layer = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r, 0.06, 12), sandstoneDomeMat);
        layer.position.y = 0.03 + t * 0.055;
        layer.castShadow = true;
        dome.add(layer);
      }
      return dome;
    };
    fabedougouSite.add(makeSandstoneDome(0, 0, 0.20, 5));
    fabedougouSite.add(makeSandstoneDome(0.20, -0.12, 0.14, 4));
    fabedougouSite.add(makeSandstoneDome(-0.16, 0.10, 0.15, 4));

    // Voile des cascades de Karfiguéla descendant en gradins
    const waterfall = new THREE.Mesh(
      new THREE.PlaneGeometry(0.09, 0.24),
      new THREE.MeshStandardMaterial({ color: '#73ded4', roughness: 0.1, transparent: true, opacity: 0.85, emissive: '#258f83', emissiveIntensity: 0.35 })
    );
    waterfall.rotation.y = Math.PI / 4;
    waterfall.position.set(0.12, 0.14, 0.10);
    fabedougouSite.add(waterfall);

    landmarksGroup.add(fabedougouSite);
    createLandmarkBeacon(-1.55, 0.22, 0.82, 'legende-fabedougou-cascades', 'Dômes & Chutes de Karfiguéla', 'Légende', 'Cascades', 'mountain');

    // ── GESTION DES INTERACTIONS SOURIS & RAYCASTING ──────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let targetRotY = -0.12, targetRotX = 0.16;
    let downPos = { x: 0, y: 0 };

    const onPointerDown = (e) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      downPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (isDragging) {
        targetRotY += (e.clientX - prevX) * 0.007;
        targetRotX = Math.max(-0.2, Math.min(0.55, targetRotX + (e.clientY - prevY) * 0.005));
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onPointerUp = (e) => {
      if (isDragging && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) < 6) {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(mapGroup.children, true);
        if (hits.length > 0) {
          let hitObj = hits[0].object;
          // Vérifier si un monument ou beacon a été touché en premier
          let landmarkHit = hitObj;
          while (landmarkHit && !landmarkHit.userData?.isLandmark && landmarkHit.parent) {
            landmarkHit = landmarkHit.parent;
          }
          if (landmarkHit?.userData?.landmarkId) {
            const lData = landmarkHit.userData;
            setSelectedRegion(lData.regionName);
            sceneRefs.current.selectedRegionName = lData.regionName;
            onSelectStoryId?.(lData.landmarkId);
            onSelectStoryRegion?.({ localityRegion: lData.regionName });
            isDragging = false;
            return;
          }

          // Sinon, vérifier si une région a été touchée
          let regionHit = hitObj;
          while (regionHit && !regionHit.userData?.regionName && regionHit.parent) {
            regionHit = regionHit.parent;
          }
          if (regionHit?.userData?.regionName) {
            const rName = regionHit.userData.regionName;
            setSelectedRegion(rName);
            sceneRefs.current.selectedRegionName = rName;
            onSelectStoryRegion?.({ localityRegion: rName });
          }
        }
      }
      isDragging = false;
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ── BOUCLE DE RENDU ET D'ANIMATION ────────────────────────────────────────
    let animId;
    const t0 = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (performance.now() - t0) / 1000;

      // Rotation douce d'orbite
      mapGroup.rotation.y += (targetRotY - mapGroup.rotation.y) * 0.07;
      mapGroup.rotation.x += (targetRotX - mapGroup.rotation.x) * 0.07;
      if (!isDragging) targetRotY += 0.0006;

      // Déplacement du village traditionnel vers la région active
      if (sceneRefs.current.villageTarget && sceneRefs.current.villageGroup) {
        const targetScale = sceneRefs.current.villageTargetScale || 1;
        sceneRefs.current.villageGroup.position.x = sceneRefs.current.villageTarget.x;
        sceneRefs.current.villageGroup.position.z = sceneRefs.current.villageTarget.z;
        const transitionStart = sceneRefs.current.transitionStart || 0;
        const elapsed = performance.now() - transitionStart;
        if (elapsed >= 0 && elapsed < 950) {
          const progress = elapsed / 950;
          const lift = Math.sin(progress * Math.PI);
          sceneRefs.current.villageGroup.position.y = 0.17 + lift * 0.45;
          sceneRefs.current.villageGroup.scale.setScalar(targetScale * (1 + lift * 0.14));
          campfireLight.intensity = 3 + lift * 4;
        } else {
          sceneRefs.current.villageGroup.position.y = 0.17;
          sceneRefs.current.villageGroup.scale.setScalar(targetScale);
        }
      }

      // Animation des Silures sacrés de Dafra (nage circulaire dans la source)
      if (sceneRefs.current.dafraSilures) {
        sceneRefs.current.dafraSilures.forEach(({ fish, phase }) => {
          const angle = t * 0.75 + phase;
          const radius = 0.13;
          fish.position.x = Math.cos(angle) * radius;
          fish.position.z = Math.sin(angle) * radius;
          fish.rotation.y = -angle + Math.PI / 2;
        });
      }

      // Animation des totems légendaires (lévitation et pulsation douce)
      sceneRefs.current.animatedObjects.forEach(({ gem, ring, basePosY }) => {
        gem.position.y = basePosY + Math.sin(t * 2.4) * 0.035;
        gem.rotation.y += 0.025;
        const scaleVal = 1 + Math.sin(t * 3.0) * 0.18;
        ring.scale.set(scaleVal, scaleVal, 1);
      });

      // Détection survol (raycasting)
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(mapGroup.children, true);
      let foundHover = null;
      if (hits.length > 0) {
        let hitObj = hits[0].object;
        let lHit = hitObj;
        while (lHit && !lHit.userData?.isLandmark && lHit.parent) lHit = lHit.parent;
        if (lHit?.userData?.landmarkId) {
          foundHover = {
            type: 'landmark',
            id: lHit.userData.landmarkId,
            name: lHit.userData.landmarkName,
            kind: lHit.userData.landmarkType,
            region: lHit.userData.regionName,
          };
        } else {
          let rHit = hitObj;
          while (rHit && !rHit.userData?.regionName && rHit.parent) rHit = rHit.parent;
          if (rHit?.userData?.regionName) {
            foundHover = {
              type: 'region',
              name: rHit.userData.regionName,
            };
          }
        }
      }
      setHoveredTarget(foundHover);

      // Surbrillance des régions
      const activeName = sceneRefs.current.activeRegionName;
      const selectedName = sceneRefs.current.selectedRegionName;
      regionMeshes.forEach((mesh, rName) => {
        const isHovered = (foundHover?.type === 'region' && foundHover?.name === rName) || (foundHover?.region === rName);
        const isActive = isHovered || selectedName === rName || activeName === rName;
        mesh.material.color.set(isActive ? (REGION_COLORS[rName] || '#c25832') : mesh.userData.baseColor);
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, isActive ? 0.08 : 0, 0.18);
      });

      // Animation des personnages sur la courbe de patrouille
      if (sceneRefs.current.patrolCurve) {
        const curve = sceneRefs.current.patrolCurve;
        const tH = (t * 0.08) % 1;
        const pH = curve.getPointAt(tH);
        const nH = curve.getPointAt((tH + 0.025) % 1);
        sceneRefs.current.hare.position.set(pH.x, pH.y + Math.abs(Math.sin(t * 10)) * 0.055, pH.z);
        sceneRefs.current.hare.lookAt(new THREE.Vector3(nH.x, sceneRefs.current.hare.position.y, nH.z));

        const tW = (t * 0.035 + 0.5) % 1;
        const pW = curve.getPointAt(tW);
        const nW = curve.getPointAt((tW + 0.02) % 1);
        sceneRefs.current.walker.position.set(pW.x, pW.y + Math.sin(t * 4.5) * 0.012, pW.z);
        sceneRefs.current.walker.lookAt(new THREE.Vector3(nW.x, sceneRefs.current.walker.position.y, nW.z));
      }

      // Scintillement du feu de camp
      campfireLight.intensity = 3.0 + Math.sin(t * 11.3) * 0.7 + Math.cos(t * 7.1) * 0.5;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Déplacement du village lors du changement de région active
  useEffect(() => {
    const target = sceneRefs.current.regionCenters?.get(activeRegionName);
    sceneRefs.current.activeRegionName = activeRegionName;
    if (target) {
      sceneRefs.current.villageTarget = target.clone();
      sceneRefs.current.villageTargetScale = 0.85;
      sceneRefs.current.transitionStart = performance.now();
      setRegionTransition({ name: activeRegionName, key: Date.now() });
    }
  }, [activeRegionName]);

  // Filtrage 3D des monuments (Tous / Contes / Légendes)
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    const landmarks = sceneRefs.current.interactiveLandmarks || [];
    landmarks.forEach((beacon) => {
      const type = beacon.userData?.landmarkType;
      if (filter === 'all') {
        beacon.visible = true;
      } else if (filter === 'legendes') {
        beacon.visible = type === 'Légende';
      } else if (filter === 'contes') {
        beacon.visible = type === 'Conte';
      }
    });
    // Notifier le parent pour filtrer aussi la collection de récits
    if (onFilterChange) onFilterChange(filter);
  };

  // Ambiances d'éclairage
  const applyLook = (look) => {
    setSceneLook(look);
    const { scene, sunLight, hemiLight, rimLight, campfireLight, sacredWaterLight } = sceneRefs.current;
    if (!scene) return;
    if (look === 'day') {
      scene.background.set('#324860');
      scene.fog.color.set('#324860');
      sunLight.color.set('#fff3d6');
      sunLight.intensity = 4.2;
      hemiLight.color.set('#9bc0e8');
      hemiLight.groundColor.set('#6a4530');
      rimLight.intensity = 0.5;
      if (campfireLight) campfireLight.intensity = 0.4;
      if (sacredWaterLight) sacredWaterLight.intensity = 0.8;
    } else if (look === 'night') {
      scene.background.set('#0e090d');
      scene.fog.color.set('#0e090d');
      sunLight.color.set('#5075a6');
      sunLight.intensity = 0.55;
      hemiLight.color.set('#253050');
      hemiLight.groundColor.set('#160d11');
      rimLight.color.set('#ff9e42');
      rimLight.intensity = 1.1;
      if (campfireLight) campfireLight.intensity = 4.8;
      if (sacredWaterLight) sacredWaterLight.intensity = 3.2;
    } else {
      // dusk
      scene.background.set('#2b1c14');
      scene.fog.color.set('#2b1c14');
      sunLight.color.set('#ffb066');
      sunLight.intensity = 3.2;
      hemiLight.color.set('#7899c4');
      hemiLight.groundColor.set('#5a3422');
      rimLight.intensity = 0.75;
      if (campfireLight) campfireLight.intensity = 3.5;
      if (sacredWaterLight) sacredWaterLight.intensity = 1.8;
    }
  };

  const currentDisplayRegion = hoveredTarget?.region || (hoveredTarget?.type === 'region' ? hoveredTarget.name : null) || selectedRegion || activeRegionName;

  return (
    <div
      className="three-scene-wrapper"
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: '480px' }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {regionTransition && (
        <div key={regionTransition.key} className="region-travel-notice" aria-live="polite">
          <MapPin size={15} aria-hidden="true" />
          <span>Voyage vers {regionTransition.name}</span>
        </div>
      )}

      {/* Barre supérieure : Filtres Contes/Légendes et Éclairages */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 4,
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Filtre 3D des repères culturels */}
        <div style={{ display: 'flex', gap: '4px', pointerEvents: 'auto', background: 'rgba(22,14,10,0.85)', padding: '3px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>
          {[
            { key: 'all', label: 'Tout explorer', Icon: Sparkles },
            { key: 'legendes', label: 'Légendes', Icon: Crown },
            { key: 'contes', label: 'Contes', Icon: BookOpen },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleFilterChange(key)}
              aria-pressed={activeFilter === key}
              style={{
                background: activeFilter === key ? '#983e22' : 'transparent',
                color: activeFilter === key ? '#fff' : '#dcd2c4',
                border: 'none',
                padding: '4px 9px',
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Icon size={12} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        {/* Boutons d'ambiance lumière */}
        <div style={{ display: 'flex', gap: '5px', pointerEvents: 'auto' }}>
          {[
            { key: 'dusk', Icon: Sunset, label: 'Crépuscule' },
            { key: 'day', Icon: Sun, label: 'Jour' },
            { key: 'night', Icon: Moon, label: 'Nuit' },
          ].map(({ key, Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => applyLook(key)}
              aria-pressed={sceneLook === key}
              style={{
                background: sceneLook === key ? '#983e22' : 'rgba(22,14,10,0.88)',
                color: '#fff',
                border: `1px solid ${sceneLook === key ? '#ffd899' : 'rgba(255,255,255,0.18)'}`,
                padding: '5px 11px',
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Icon size={13} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Infobulle interactive en bas à gauche */}
      {hoveredTarget?.type === 'landmark' ? (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            maxWidth: '320px',
            background: 'rgba(22, 14, 10, 0.96)',
            backdropFilter: 'blur(10px)',
            padding: '12px 16px',
            borderRadius: '4px',
            border: `1px solid ${hoveredTarget.kind === 'Légende' ? '#f5b025' : '#e65c34'}`,
            color: '#f8f4ec',
            zIndex: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
                color: hoveredTarget.kind === 'Légende' ? '#ffd166' : '#ff8552',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {hoveredTarget.kind === 'Légende' ? <Crown size={12} /> : <BookOpen size={12} />}
              {hoveredTarget.kind} · {hoveredTarget.region}
            </span>
            <span style={{ fontSize: '12px', color: '#dda047' }}>Cliquer pour écouter</span>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: '15px', fontFamily: "'Playfair Display', serif", color: '#fff', fontWeight: 700 }}>
            {hoveredTarget.name}
          </p>
        </div>
      ) : currentDisplayRegion ? (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            maxWidth: '280px',
            background: 'rgba(22, 14, 10, 0.96)',
            backdropFilter: 'blur(10px)',
            padding: '11px 16px',
            borderRadius: '4px',
            border: '1px solid #dda047',
            color: '#f8f4ec',
            zIndex: 4,
          }}
        >
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ffb46b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#ffb46b" aria-hidden="true" /> Territoire sélectionné
          </div>
          <p style={{ margin: '0', fontSize: '15px', fontFamily: "'Playfair Display', serif", color: '#fff', fontWeight: 700 }}>
            {currentDisplayRegion}
          </p>
        </div>
      ) : null}
    </div>
  );
}
