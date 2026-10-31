import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, Sunset, Moon, Compass, MapPin } from 'lucide-react';

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
  'Hauts-Bassins': '#3d91d9',
  'Sud-Ouest': '#6d8f32',
};

export default function Interactive3DMap({ onSelectStoryRegion, activeRegionName }) {
  const containerRef = useRef(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [sceneLook, setSceneLook] = useState('dusk');
  const [regionTransition, setRegionTransition] = useState(null);
  const sceneRefs = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    // ── SCENE ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#2b1c14');
    scene.fog = new THREE.FogExp2('#2b1c14', 0.038);

    // ── CAMERA ────────────────────────────────────────────────────────────────
    // Positionnée pour voir à la fois le relief régional ET le village en bas
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 80);
    camera.position.set(0, 6.5, 8.0);
    camera.lookAt(0, 0.5, 0);

    // Créé avant les lumières et les objets du village qui lui sont attachés.
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // ── RENDERER ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── LUMIÈRES ──────────────────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight('#ffb066', 3.0);
    sunLight.position.set(-5, 8, 5);
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

    const hemiLight = new THREE.HemisphereLight('#7899c4', '#5a3422', 0.9);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight('#ffd199', 0.7);
    rimLight.position.set(5, 4, -5);
    scene.add(rimLight);

    // Feu de camp : lumière chaude animée centrée sur la concession du village
    const campfireLight = new THREE.PointLight('#ff6a1a', 2.8, 3.5);
    campfireLight.position.set(0.4, 0.45, 0.1);
    mapGroup.add(campfireLight);

    sceneRefs.current = { scene, sunLight, hemiLight, rimLight, campfireLight };

    // ── MATÉRIAUX ─────────────────────────────────────────────────────────────
    const latMat = new THREE.MeshStandardMaterial({ color: '#9e492c', roughness: 0.88, metalness: 0.04, flatShading: true });
    const borderMat = new THREE.LineBasicMaterial({ color: '#ffd899', transparent: true, opacity: 0.7 });
    const bancoMat = new THREE.MeshStandardMaterial({ color: '#b4603d', roughness: 0.86, flatShading: true });
    const thatchMat = new THREE.MeshStandardMaterial({ color: '#c29b61', roughness: 0.95, flatShading: true });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#3d2518', roughness: 0.9 });
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#26502f', roughness: 0.85, flatShading: true });
    const groundMat = new THREE.MeshStandardMaterial({ color: '#7a3e22', roughness: 0.95 });

    // ── GROUPE CARTE RÉGIONALE (plateau relief du Burkina Faso) ───────────────
    const regionMeshes = new Map();
    const territoryPolygons = [];
    const cLon = -1.55, cLat = 12.26, scale = 0.85;

    const pointInPolygon = (x, y, polygon) => {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        const intersects = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / ((yj - yi) || Number.EPSILON) + xi);
        if (intersects) inside = !inside;
      }
      return inside;
    };

    const constrainVillageToTerritory = () => {
      if (!territoryPolygons.length) return;
      villageGroup.children.forEach((object) => {
        if (!object.position) return;
        const worldX = villageGroup.position.x + object.position.x;
        const worldZ = villageGroup.position.z + object.position.z;
        const mapLon = worldX / scale + cLon;
        const mapLat = cLat - worldZ / scale;
        const inside = territoryPolygons.some((polygon) => pointInPolygon(mapLon, mapLat, polygon));
        object.visible = inside;
      });
    };

    fetch('/geojson/regions.geojson')
      .then(r => r.json())
      .then(geoData => {
        const regionCenters = new Map();
        geoData.features.forEach((feature, idx) => {
          const name = feature.properties?.NAME_1 || `Région ${idx}`;
          const coords = feature.geometry.coordinates;

          if (feature.geometry.type === 'Polygon') {
            territoryPolygons.push(coords[0]);
          } else if (feature.geometry.type === 'MultiPolygon') {
            coords.forEach((polygon) => territoryPolygons.push(polygon[0]));
          }

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
          else if (feature.geometry.type === 'MultiPolygon') coords.forEach(p => shapes.push(parseShape(p)));

          shapes.forEach(shape => {
            const geom = new THREE.ExtrudeGeometry(shape, {
              depth: 0.14 + (name.includes('Cascades') || name.includes('Sud-Ouest') ? 0.07 : 0.02),
              bevelEnabled: true, bevelSegments: 1, bevelSize: 0.014, bevelThickness: 0.014,
            });
            geom.rotateX(-Math.PI / 2);
            const mesh = new THREE.Mesh(geom, latMat.clone());
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { regionName: name };
            mesh.userData.baseColor = REGION_COLORS[name] || '#9e492c';
            const line = new THREE.LineSegments(new THREE.EdgesGeometry(geom, 25), borderMat);
            mesh.add(line);
            mapGroup.add(mesh);
            regionMeshes.set(name, mesh);
          });

          const rings = feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates[0]]
            : feature.geometry.coordinates.map((polygon) => polygon[0]);
          const ring = rings.reduce((longest, current) =>
            current.length > longest.length ? current : longest, []);
          if (ring.length) {
            const center = ring.reduce((sum, [lon, lat]) => ({
              lon: sum.lon + lon,
              lat: sum.lat + lat,
            }), { lon: 0, lat: 0 });
            let targetLon = center.lon / ring.length;
            let targetLat = center.lat / ring.length;

            if (!pointInPolygon(targetLon, targetLat, ring)) {
              let nearest = ring[0];
              let nearestDistance = Infinity;
              ring.forEach(([lon, lat]) => {
                const distance = Math.hypot(lon - targetLon, lat - targetLat);
                if (distance < nearestDistance) {
                  nearestDistance = distance;
                  nearest = [lon, lat];
                }
              });
              [targetLon, targetLat] = nearest;
            }

            const longitudes = ring.map(([lon]) => lon);
            const latitudes = ring.map(([, lat]) => lat);
            const regionWidth = Math.max(...longitudes) - Math.min(...longitudes);
            const regionHeight = Math.max(...latitudes) - Math.min(...latitudes);
            const villageScale = THREE.MathUtils.clamp(Math.min(regionWidth, regionHeight) / 1.15, 0.45, 1);

            regionCenters.set(name, new THREE.Vector3(
              (targetLon - cLon) * scale,
              0.17,
              -(targetLat - cLat) * scale
            ));
            regionCenters.get(name).userData = { villageScale };
          }
        });
        sceneRefs.current.regionCenters = regionCenters;
        const initialTarget = regionCenters.get(activeRegionName);
        if (initialTarget) {
          sceneRefs.current.villageTarget = initialTarget.clone();
          sceneRefs.current.villageTargetScale = initialTarget.userData?.villageScale || 1;
          villageGroup.position.copy(initialTarget);
          villageGroup.scale.setScalar(sceneRefs.current.villageTargetScale);
        }

        // Socle du plateau
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(3.5, 3.7, 0.22, 48),
          new THREE.MeshStandardMaterial({ color: '#201210', roughness: 0.92 })
        );
        base.position.y = -0.15;
        mapGroup.add(base);
        constrainVillageToTerritory();
      })
      .catch(err => console.error('Erreur GeoJSON:', err));

    // ── VILLAGE BURKINABÈ DIRECTEMENT IMPLANTÉ SUR LA CARTE ────────────────
    // Le village (concessions, baobabs, greniers, puits, personnages) est intégré
    // directement sur la surface du plateau géographique (dans mapGroup),
    // ce qui donne une lecture naturelle, unifiée et sans ambiguïté spatiale.
    const villageGroup = new THREE.Group();
    // Positionné au niveau de la région Centre/Plateau Central (x: 0, z: -0.15)
    // surélevé de y: 0.17 pour reposer exactement sur le relief de la carte
    villageGroup.position.set(0.05, 0.17, -0.15);
    mapGroup.add(villageGroup);
    sceneRefs.current.villageGroup = villageGroup;

    // ─── Helper : case ronde banco + toit conique ───────────────────────────
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

    // ─── Helper : grenier à mil sur pilotis ────────────────────────────────
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

    // ─── Helper : Arbre baobab ──────────────────────────────────────────────
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
      ].forEach(c => {
        const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(c.rad, 1), canopyMat);
        leaf.position.set(c.x, c.y, c.z);
        leaf.castShadow = true;
        b.add(leaf);
      });

      // Banc circulaire en banco
      const bench = new THREE.Mesh(
        new THREE.TorusGeometry(0.50, 0.045, 6, 20),
        bancoMat
      );
      bench.rotation.x = Math.PI / 2;
      bench.position.y = 0.048;
      b.add(bench);
      return b;
    };

    // 1. Concession principale (cœur culturel Mooré - Centre)
    villageGroup.add(makeBaobab(0, 0, 1.0));
    villageGroup.add(makeHut(-0.55, 0.35, 0.22, 0.25, 0.30));
    villageGroup.add(makeHut(-0.75, -0.12, 0.19, 0.22, 0.27));
    villageGroup.add(makeHut(-0.45, -0.55, 0.20, 0.24, 0.28));
    villageGroup.add(makeHut(0.55, -0.40, 0.22, 0.25, 0.30));
    villageGroup.add(makeHut(0.70, 0.25, 0.18, 0.22, 0.26));
    villageGroup.add(makeGranary(-0.25, 0.55));
    villageGroup.add(makeGranary(0.28, 0.52));

    // 2. Concession Ouest (Hauts-Bassins / Bobo)
    villageGroup.add(makeBaobab(-1.45, 0.35, 0.82));
    villageGroup.add(makeHut(-1.85, 0.45, 0.18, 0.22, 0.26));
    villageGroup.add(makeHut(-1.70, 0.15, 0.16, 0.20, 0.24));
    villageGroup.add(makeGranary(-1.35, 0.65));

    // 3. Concession Sud-Est (Centre-Est / Bissa)
    villageGroup.add(makeBaobab(0.95, -0.25, 0.75));
    villageGroup.add(makeHut(1.25, -0.15, 0.18, 0.22, 0.26));
    villageGroup.add(makeHut(1.15, -0.55, 0.17, 0.21, 0.25));

    // 4. Arbre repère Nord (Sahel)
    villageGroup.add(makeBaobab(-0.15, 1.35, 0.70));
    villageGroup.add(makeHut(0.18, 1.45, 0.17, 0.21, 0.25));

    // ─── Puits communautaire ────────────────────────────────────────────────
    const well = new THREE.Group();
    well.position.set(-0.08, 0, 0.45);
    const wellRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.13, 14, 1, true),
      new THREE.MeshStandardMaterial({ color: '#5e4a3a', roughness: 0.9 })
    );
    wellRim.position.y = 0.065;
    well.add(wellRim);
    const wellWater = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 14),
      new THREE.MeshStandardMaterial({ color: '#2a5d6b', roughness: 0.2, metalness: 0.6 })
    );
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.y = 0.045;
    well.add(wellWater);
    villageGroup.add(well);

    // ─── Feu de camp (pierres + braises) ────────────────────────────────────
    const fire = new THREE.Group();
    fire.position.set(0.35, 0, 0.25);
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.04, 0),
        new THREE.MeshStandardMaterial({ color: '#3d3430', roughness: 0.95 })
      );
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

    // ─── Sentier sinueux (boucle reliant les concessions) ────────────────────
    const waypoints = [
      new THREE.Vector3(-0.55, 0.02, 0.35),
      new THREE.Vector3(-0.75, 0.02, -0.12),
      new THREE.Vector3(-0.45, 0.02, -0.55),
      new THREE.Vector3(0.0, 0.02, -0.65),
      new THREE.Vector3(0.55, 0.02, -0.40),
      new THREE.Vector3(0.70, 0.02, 0.25),
      new THREE.Vector3(0.35, 0.02, 0.45),
      new THREE.Vector3(-0.08, 0.02, 0.45),
    ];
    const patrolCurve = new THREE.CatmullRomCurve3(waypoints, true, 'catmullrom', 0.5);

    // Tracé du sentier en terre battue
    const trailGeom = new THREE.BufferGeometry().setFromPoints(patrolCurve.getPoints(90));
    villageGroup.add(new THREE.Line(trailGeom, new THREE.LineBasicMaterial({ color: '#e8be8e', transparent: true, opacity: 0.65 })));

    // ─── Sonsannin le lièvre rusé ────────────────────────────────────────────
    const hareMat = new THREE.MeshStandardMaterial({ color: '#c08040', roughness: 0.85 });
    const hare = new THREE.Group();
    const hareBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.08, 4, 8), hareMat);
    hareBody.rotation.z = Math.PI / 2;
    hareBody.position.y = 0.06;
    hare.add(hareBody);
    const hareHead = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), hareMat);
    hareHead.position.set(0.08, 0.09, 0);
    hare.add(hareHead);
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.011, 0.075, 6), hareMat);
    [-1, 1].forEach(side => {
      const e = ear.clone();
      e.position.set(0.065, 0.15, side * 0.018);
      hare.add(e);
    });
    villageGroup.add(hare);

    // ─── Conteur en Faso Dan Fani (tenu traditionnel indigo) ────────────────
    const robeMat = new THREE.MeshStandardMaterial({ color: '#1e3068', roughness: 0.87 });
    const skinMat = new THREE.MeshStandardMaterial({ color: '#3a2018', roughness: 0.9 });
    const walker = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 0.20, 10), robeMat);
    body.position.y = 0.10;
    body.castShadow = true;
    walker.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), skinMat);
    head.position.y = 0.23;
    head.castShadow = true;
    walker.add(head);
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.045, 12), thatchMat);
    hat.position.y = 0.27;
    walker.add(hat);
    villageGroup.add(walker);

    sceneRefs.current.patrolCurve = patrolCurve;
    sceneRefs.current.hare = hare;
    sceneRefs.current.walker = walker;

    // ── INTERACTION SOURIS ────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let isDragging = false;
    let prevX = 0, prevY = 0;
    let targetRotY = -0.12, targetRotX = 0.16;
    let downPos = { x: 0, y: 0 };

    const onPointerDown = (e) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; downPos = { x: e.clientX, y: e.clientY }; };
    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (isDragging) {
        targetRotY += (e.clientX - prevX) * 0.007;
        targetRotX = Math.max(-0.2, Math.min(0.55, targetRotX + (e.clientY - prevY) * 0.005));
        prevX = e.clientX; prevY = e.clientY;
      }
    };
    const onPointerUp = (e) => {
      if (isDragging && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) < 6) {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(mapGroup.children, true);
        if (hits.length > 0) {
          let h = hits[0].object;
          while (h && !h.userData?.regionName && h.parent) h = h.parent;
          if (h?.userData?.regionName) {
            setSelectedRegion(h.userData.regionName);
            sceneRefs.current.selectedRegionName = h.userData.regionName;
            onSelectStoryRegion?.({ localityRegion: h.userData.regionName });
          }
        }
      }
      isDragging = false;
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ── BOUCLE D'ANIMATION ────────────────────────────────────────────────────
    let animId;
    const t0 = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (performance.now() - t0) / 1000;

      // Rotation lente du plateau carte
      mapGroup.rotation.y += (targetRotY - mapGroup.rotation.y) * 0.07;
      mapGroup.rotation.x += (targetRotX - mapGroup.rotation.x) * 0.07;
      if (!isDragging) targetRotY += 0.0007;

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

      // Détection survol régions
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(mapGroup.children, true);
      let foundHover = null;
      if (hits.length > 0) {
        let h = hits[0].object;
        while (h && !h.userData?.regionName && h.parent) h = h.parent;
        if (h?.userData?.regionName) foundHover = h.userData.regionName;
      }
      setHoveredRegion(foundHover);
      regionMeshes.forEach((mesh, rName) => {
        const activeName = sceneRefs.current.activeRegionName;
        const selectedName = sceneRefs.current.selectedRegionName;
        const active = foundHover === rName || selectedName === rName || activeName === rName;
        mesh.material.color.set(active ? (REGION_COLORS[rName] || '#c25832') : mesh.userData.baseColor);
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, active ? 0.08 : 0, 0.18);
      });

      // Animation personnages sur la courbe de patrouille
      if (sceneRefs.current.patrolCurve) {
        const curve = sceneRefs.current.patrolCurve;

        // Lièvre : bondissant, rapide
        const tH = (t * 0.08) % 1;
        const pH = curve.getPointAt(tH);
        const nH = curve.getPointAt((tH + 0.025) % 1);
        sceneRefs.current.hare.position.set(pH.x, pH.y + Math.abs(Math.sin(t * 10)) * 0.055, pH.z);
        sceneRefs.current.hare.lookAt(new THREE.Vector3(nH.x, sceneRefs.current.hare.position.y, nH.z));

        // Conteur : marche lente, dignement
        const tW = (t * 0.035 + 0.5) % 1;
        const pW = curve.getPointAt(tW);
        const nW = curve.getPointAt((tW + 0.02) % 1);
        sceneRefs.current.walker.position.set(pW.x, pW.y + Math.sin(t * 4.5) * 0.012, pW.z);
        sceneRefs.current.walker.lookAt(new THREE.Vector3(nW.x, sceneRefs.current.walker.position.y, nW.z));
      }

      // Scintillement feu de camp
      campfireLight.intensity = 3.0 + Math.sin(t * 11.3) * 0.7 + Math.cos(t * 7.1) * 0.5;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
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

  useEffect(() => {
    const target = sceneRefs.current.regionCenters?.get(activeRegionName);
    sceneRefs.current.activeRegionName = activeRegionName;
    if (target) {
      sceneRefs.current.villageTarget = target.clone();
      sceneRefs.current.villageTargetScale = target.userData?.villageScale || 1;
      sceneRefs.current.transitionStart = performance.now();
      setRegionTransition({ name: activeRegionName, key: Date.now() });
    }
  }, [activeRegionName]);

  // Ambiances lumière
  const applyLook = (look) => {
    setSceneLook(look);
    const { scene, sunLight, hemiLight, rimLight, campfireLight } = sceneRefs.current;
    if (!scene) return;
    if (look === 'day') {
      scene.background.set('#324860');
      scene.fog.color.set('#324860');
      sunLight.color.set('#fff3d6'); sunLight.intensity = 4.2;
      hemiLight.color.set('#9bc0e8'); hemiLight.groundColor.set('#6a4530');
      rimLight.intensity = 0.5;
      if (campfireLight) campfireLight.intensity = 0.3;
    } else if (look === 'night') {
      scene.background.set('#0e090d');
      scene.fog.color.set('#0e090d');
      sunLight.color.set('#5075a6'); sunLight.intensity = 0.55;
      hemiLight.color.set('#253050'); hemiLight.groundColor.set('#160d11');
      rimLight.color.set('#ff9e42'); rimLight.intensity = 1.1;
      if (campfireLight) campfireLight.intensity = 4.5;
    } else { // dusk
      scene.background.set('#2b1c14');
      scene.fog.color.set('#2b1c14');
      sunLight.color.set('#ffb066'); sunLight.intensity = 3.0;
      hemiLight.color.set('#7899c4'); hemiLight.groundColor.set('#5a3422');
      rimLight.intensity = 0.7;
      if (campfireLight) campfireLight.intensity = 3.5;
    }
  };

  const currentDisplay = hoveredRegion || selectedRegion || activeRegionName;

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

      {/* HUD supérieur — ambiance lumière uniquement (boutons POV supprimés) */}
      <div style={{
        position: 'absolute', top: 12, left: 14, right: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        pointerEvents: 'none', zIndex: 4, flexWrap: 'wrap', gap: '8px'
      }}>
        <div style={{
          background: 'rgba(22, 14, 10, 0.92)', backdropFilter: 'blur(8px)',
          padding: '6px 14px', borderRadius: '4px', border: '1px solid rgba(221,160,71,0.4)',
          color: '#f8f4ec', fontSize: '12px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Compass size={15} color="#ff7b47" aria-hidden="true" />
          <span>Burkina Faso · Village vivant</span>
        </div>

        {/* Boutons lumière */}
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
                color: '#fff', border: `1px solid ${sceneLook === key ? '#ffd899' : 'rgba(255,255,255,0.18)'}`,
                padding: '5px 11px', borderRadius: '3px', fontSize: '11px',
                cursor: 'pointer', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '5px',
              }}
            >
              <Icon size={13} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Infobulle région */}
      {currentDisplay && (
        <div style={{
          position: 'absolute', bottom: 12, left: 14, maxWidth: '270px',
          background: 'rgba(22, 14, 10, 0.96)', backdropFilter: 'blur(10px)',
          padding: '11px 16px', borderRadius: '4px', border: '1px solid #dda047',
          color: '#f8f4ec', zIndex: 4,
        }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ffb46b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#ffb46b" aria-hidden="true" /> Région sélectionnée
          </div>
          <h4 style={{ margin: '0', fontSize: '15px', fontFamily: "'Playfair Display', serif", color: '#fff' }}>
            {currentDisplay}
          </h4>
        </div>
      )}
    </div>
  );
}
