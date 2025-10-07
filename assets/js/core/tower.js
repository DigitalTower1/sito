let scene;
let camera;
let renderer;
let towerGroup;
let windowMeshes = [];
const towerClock = new (window.THREE ? THREE.Clock : function () {})();
let towerSections = [];
const reusableVector = window.THREE ? new THREE.Vector3() : null;
const towerParams = {
  levels: 84,
  baseWidth: 14.8,
  topWidth: 5.6,
  floorHeight: 1.85,
};
const lerp = (a, b, t) => a + (b - a) * t;
function createCanvasTexture(drawFn) {
  const size = 128,
    canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  drawFn(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
function createFacadeTexture() {
  return createCanvasTexture((ctx, size) => {
    const baseGradient = ctx.createLinearGradient(0, 0, size, size);
    baseGradient.addColorStop(0, "#0f1724");
    baseGradient.addColorStop(0.5, "#152233");
    baseGradient.addColorStop(1, "#101a29");
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    for (let y = 0; y < size; y += 5) {
      ctx.fillRect(0, y, size, 1);
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let x = 0; x < size; x += 7) {
      ctx.fillRect(x, 0, 1, size);
    }

    ctx.strokeStyle = "rgba(255, 215, 0, 0.08)";
    ctx.lineWidth = 0.6;
    for (let d = -size; d < size; d += 12) {
      ctx.beginPath();
      ctx.moveTo(0, d + size * 0.25);
      ctx.lineTo(size, d + size * 0.6);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(74, 155, 142, 0.08)";
    ctx.lineWidth = 0.4;
    for (let d = -size; d < size; d += 16) {
      ctx.beginPath();
      ctx.moveTo(size, d + size * 0.2);
      ctx.lineTo(0, d + size * 0.65);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 120; i += 1) {
      const w = 1;
      const h = Math.random() * 6 + 2;
      ctx.fillRect(Math.random() * size, Math.random() * size, w, h);
    }
    ctx.globalAlpha = 0.14;
    for (let i = 0; i < 36; i += 1) {
      const width = Math.random() * 4 + 2;
      const height = Math.random() * 10 + 8;
      const x = Math.random() * size;
      const y = Math.random() * size;
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, "rgba(255, 183, 77, 0.25)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, width, height);
    }
    ctx.globalAlpha = 1;
  });
}
function createMetalTexture() {
  return createCanvasTexture((ctx, size) => {
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#28394a");
    gradient.addColorStop(0.5, "#1c2a39");
    gradient.addColorStop(1, "#344b62");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.fillRect(0, size * 0.45, size, size * 0.08);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(0, size * 0.7, size, size * 0.04);
  });
}
function createNeonTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(255,215,0,0.4)";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, size - 16, size - 16);
    ctx.strokeStyle = "rgba(255,107,53,0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, size - 40, size - 40);
  });
}
function init3DScene() {
  if (!window.THREE) return;
  const tower3DContainer = document.getElementById("tower3DContainer");
  if (!tower3DContainer) return;
  tower3DContainer.innerHTML = "";
  towerSections = Array.from(document.querySelectorAll("section"));
  windowMeshes = [];
  const sceneBackground = new THREE.Color(0x04070c);
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(sceneBackground, 90, 200);
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(10, 68, 140);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(0x000000, 0);
  tower3DContainer.appendChild(renderer.domElement);
  const ambientLight = new THREE.AmbientLight(0x1f2a3a, 1.2);
  scene.add(ambientLight);
  const warmLight = new THREE.PointLight(0xffc277, 1.4, 160, 2);
  warmLight.position.set(10, 28, 18);
  scene.add(warmLight);
  const coolLight = new THREE.PointLight(0x4a9b8e, 1, 140, 2);
  coolLight.position.set(-12, 18, -16);
  scene.add(coolLight);
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
  rimLight.position.set(0, 40, -40);
  scene.add(rimLight);
  towerGroup = new THREE.Group();
  towerGroup.userData = { halo: null, orbiters: [], panels: [], pods: [] };
  towerGroup.scale.setScalar(3.25);
  towerGroup.position.y = 3;
  scene.add(towerGroup);
  const facadeTexture = createFacadeTexture();
  facadeTexture.repeat.set(6.4, towerParams.levels * 1.05);
  const metalTexture = createMetalTexture();
  metalTexture.repeat.set(2, 6);
  const neonTexture = createNeonTexture();
  const mainMaterial = new THREE.MeshStandardMaterial({
    map: facadeTexture,
    color: 0x1b2737,
    roughness: 0.32,
    metalness: 0.65,
    emissive: new THREE.Color(0x0a1420),
    emissiveIntensity: 0.3,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x223547,
    roughness: 0.15,
    metalness: 0.9,
    transparent: true,
    opacity: 0.45,
    envMapIntensity: 1.4,
  });
  const detailMaterial = new THREE.MeshStandardMaterial({
    map: metalTexture,
    color: 0x253346,
    roughness: 0.4,
    metalness: 0.8,
    emissive: new THREE.Color(0x1a2c3c),
    emissiveIntensity: 0.25,
  });
  const { levels, baseWidth, topWidth, floorHeight } = towerParams;
  const totalHeight = levels * floorHeight;
  for (let level = 0; level < levels; level++) {
    const t = level / levels;
    const width = baseWidth - (baseWidth - topWidth) * Math.pow(t, 1.2);
    const depth = width * 0.94;
    const floorGeometry = new THREE.BoxGeometry(width, floorHeight, depth);
    const floor = new THREE.Mesh(floorGeometry, mainMaterial.clone());
    floor.material.map = facadeTexture.clone();
    floor.material.map.offset.y = t * 2;
    floor.position.y = level * floorHeight + floorHeight / 2;
    towerGroup.add(floor);
    const glassLayer = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.92, floorHeight * 0.9, depth * 0.92),
      glassMaterial.clone(),
    );
    glassLayer.position.y = floor.position.y;
    towerGroup.add(glassLayer);
    if (level % 4 === 0) {
      const core = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.62, floorHeight * 0.95, depth * 0.62),
        detailMaterial.clone(),
      );
      core.position.y = floor.position.y;
      towerGroup.add(core);
    }
    if (level % 3 === 0) {
      const brace = new THREE.Mesh(
        new THREE.BoxGeometry(width * 1.05, 0.12, depth * 1.05),
        detailMaterial.clone(),
      );
      brace.position.y = level * floorHeight + floorHeight;
      towerGroup.add(brace);
    }
  addWindowBand(width, depth, level * floorHeight + floorHeight / 2);
  }
  addVerticalFins(totalHeight, baseWidth, topWidth);
  addBaseTerraces(baseWidth);
  addLowerPlaza(baseWidth);
  addSkyGardens(totalHeight, baseWidth);
  addSkyBridges(totalHeight, baseWidth, topWidth);
  addLightSpines(totalHeight);
  addSkyDeck(totalHeight, topWidth);
  addHelipad(totalHeight, topWidth);
  addObservationPods(totalHeight, baseWidth);
  addMediaPanels(baseWidth, totalHeight);
  addAntennaArray(totalHeight, topWidth);
  addSupportBeams(totalHeight, baseWidth, topWidth);

  const crownMaterial = new THREE.MeshStandardMaterial({
    map: neonTexture,
    color: 0x2e3f55,
    emissive: new THREE.Color(0xffc95b),
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.9,
    metalness: 0.7,
    roughness: 0.2,
  });
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(topWidth * 1.4, topWidth * 1.8, 1.8, 32, 1, true),
    crownMaterial,
  );
  crown.position.y = totalHeight + 1.1;
  towerGroup.add(crown);
  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(topWidth * 0.9, 4.5, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffc95b,
      emissive: 0xffe9a3,
      emissiveIntensity: 1.1,
      metalness: 0.9,
      roughness: 0.15,
    }),
  );
  spire.position.y = totalHeight + 4.2;
  towerGroup.add(spire);
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(1.2, 2.2, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffe3a0,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.y = totalHeight + 2.6;
  towerGroup.add(halo);
  const aura = new THREE.Mesh(
    new THREE.CylinderGeometry(baseWidth * 1.45, baseWidth * 1.8, 2.2, 48, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x4a9b8e,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
  aura.position.y = 1.2;
  towerGroup.add(aura);
  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(baseWidth * 1.8, baseWidth * 2.4, 1.4, 48),
    new THREE.MeshStandardMaterial({
      color: 0x101a28,
      metalness: 0.5,
      roughness: 0.8,
    }),
  );
  podium.position.y = -0.7;
  towerGroup.add(podium);
  const orbiters = createOrbitingLights(totalHeight);
  orbiters.forEach((orb) => towerGroup.add(orb.mesh));
  towerGroup.userData.halo = halo;
  towerGroup.userData.orbiters = orbiters;
  animate3D();
}
function addWindowBand(width, depth, y) {
  const windowMaterialBase = new THREE.MeshStandardMaterial({
    color: 0xfff4c2,
    emissive: 0xfff4c2,
    emissiveIntensity: 0.6,
    metalness: 0.1,
    roughness: 0.2,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const windowGeometry = new THREE.PlaneGeometry(width * 0.14, 0.58);
  const sides = [
    { axis: "z", sign: depth / 2 + 0.001, rotation: 0 },
    { axis: "x", sign: width / 2 + 0.001, rotation: Math.PI / 2 },
    { axis: "z", sign: -depth / 2 - 0.001, rotation: Math.PI },
    { axis: "x", sign: -width / 2 - 0.001, rotation: -Math.PI / 2 },
  ];
  sides.forEach((side, sideIndex) => {
    const columns = side.axis === "z" ? 4 : 5;
    for (let i = 0; i < columns; i++) {
      const mesh = new THREE.Mesh(windowGeometry, windowMaterialBase.clone());
      const offset = (i - (columns - 1) / 2) * (side.axis === "z" ? width * 0.24 : depth * 0.32);
      mesh.position.y = y;
      if (side.axis === "z") {
        mesh.position.x = offset;
        mesh.position.z = side.sign;
      } else {
        mesh.position.z = offset;
        mesh.position.x = side.sign;
      }
      mesh.rotation.y = side.rotation;
      mesh.material.emissiveIntensity = 0.65 + Math.random() * 0.25;
      mesh.material.opacity = 0.55 + Math.random() * 0.3;
      towerGroup.add(mesh);
      windowMeshes.push({
        mesh,
        speed: 0.45 + Math.random() * 0.85,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0.4 + Math.random() * 0.35,
        baseIntensity: 0.6 + Math.random() * 0.25,
      });
    }
  });
}
function createOrbitingLights(totalHeight) {
  const orbiters = [];
  const colors = [0xffb347, 0x4a9b8e, 0xffe177];
  for (let i = 0; i < 3; i++) {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshBasicMaterial({
        color: colors[i],
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    );
    sphere.position.y = totalHeight * (0.25 + 0.25 * i);
    orbiters.push({
      mesh: sphere,
      radius: 4.5 + i * 1.2,
      speed: 0.3 + i * 0.12,
      offset: Math.random() * Math.PI * 2,
    });
  }
  return orbiters;
}
function addVerticalFins(totalHeight, baseWidth, topWidth) {
  const finMaterial = new THREE.MeshStandardMaterial({
    color: 0x182230,
    emissive: 0x1f2e42,
    emissiveIntensity: 0.18,
    metalness: 0.85,
    roughness: 0.35,
    transparent: true,
    opacity: 0.85,
  });
  for (let i = 0; i < 4; i += 1) {
    const ratio = 0.6 + i * 0.1;
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth * ratio * 0.14, totalHeight + 4, 0.12),
      finMaterial.clone(),
    );
    const angle = (Math.PI / 2) * i;
    const radiusBase = (baseWidth + topWidth) * 0.4;
    const radius = radiusBase + i * baseWidth * 0.06;
    fin.position.set(Math.cos(angle) * radius, totalHeight / 2, Math.sin(angle) * radius);
    fin.rotation.y = angle;
    towerGroup.add(fin);
  }

  const latticeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2b3a,
    emissive: 0x2e4b61,
    emissiveIntensity: 0.12,
    metalness: 0.7,
    roughness: 0.4,
    transparent: true,
    opacity: 0.7,
  });
  for (let tier = 0; tier < 3; tier += 1) {
    const lattice = new THREE.Mesh(
      new THREE.CylinderGeometry(
        (baseWidth * (0.95 - tier * 0.18) + topWidth * 0.5) / 1.0,
        (baseWidth * (0.9 - tier * 0.18) + topWidth * 0.45) / 1.0,
        0.2,
        48,
        1,
        true,
      ),
      latticeMaterial.clone(),
    );
    lattice.position.y = totalHeight * (0.32 + tier * 0.2);
    towerGroup.add(lattice);
  }
}

function addSupportBeams(totalHeight, baseWidth, topWidth) {
  const beamMaterial = new THREE.MeshStandardMaterial({
    color: 0x141f2c,
    metalness: 0.78,
    roughness: 0.42,
    emissive: new THREE.Color(0x213349),
    emissiveIntensity: 0.22,
  });
  const offsets = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ];
  offsets.forEach(([xSign, zSign]) => {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth * 0.24, totalHeight + 6.5, baseWidth * 0.24),
      beamMaterial.clone(),
    );
    const x = (baseWidth * 0.58) * xSign;
    const z = (baseWidth * 0.42) * zSign;
    beam.position.set(x, totalHeight / 2, z);
    towerGroup.add(beam);
  });

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d2a3c,
    metalness: 0.65,
    roughness: 0.45,
    transparent: true,
    opacity: 0.55,
  });
  for (let level = 1; level <= 6; level += 1) {
    const radius = baseWidth * (0.78 + level * 0.04);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, topWidth * 0.12, 18, 64),
      ringMaterial.clone(),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = (totalHeight / 7) * level;
    towerGroup.add(ring);
  }
}
function addBaseTerraces(baseWidth) {
  const terraceMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d1622,
    metalness: 0.55,
    roughness: 0.8,
  });
  for (let i = 0; i < 3; i += 1) {
    const terrace = new THREE.Mesh(
      new THREE.CylinderGeometry(
        baseWidth * (1.8 + i * 0.25),
        baseWidth * (2.1 + i * 0.25),
        0.4,
        48,
      ),
      terraceMaterial,
    );
    terrace.position.y = -1.2 - i * 0.45;
    towerGroup.add(terrace);
  }
}

function addLowerPlaza(baseWidth) {
  const plaza = new THREE.Mesh(
    new THREE.CylinderGeometry(baseWidth * 2.6, baseWidth * 2.6, 0.2, 64),
    new THREE.MeshStandardMaterial({
      color: 0x0b111a,
      metalness: 0.3,
      roughness: 0.85,
      emissive: 0x172434,
      emissiveIntensity: 0.12,
    }),
  );
  plaza.position.y = -2.2;
  towerGroup.add(plaza);
}

function addSkyGardens(totalHeight, baseWidth) {
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a3a2f,
    metalness: 0.4,
    roughness: 0.65,
    emissive: 0x245846,
    emissiveIntensity: 0.25,
  });
  for (let i = 0; i < 3; i += 1) {
    const height = totalHeight * (0.35 + i * 0.18);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(baseWidth * (1.1 - i * 0.12), 0.12, 24, 96),
      ringMaterial.clone(),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = height;
    towerGroup.add(ring);

    const foliage = new THREE.Mesh(
      new THREE.TorusGeometry(baseWidth * (1.08 - i * 0.12), 0.18, 16, 48),
      new THREE.MeshLambertMaterial({
        color: 0x1f6d4a,
        emissive: 0x1d8f5f,
        emissiveIntensity: 0.15,
      }),
    );
    foliage.rotation.x = Math.PI / 2;
    foliage.position.y = height + 0.12;
    towerGroup.add(foliage);
  }
}

function addSkyBridges(totalHeight, baseWidth, topWidth) {
  const torusMaterialBase = new THREE.MeshStandardMaterial({
    color: 0x1d2a39,
    metalness: 0.85,
    roughness: 0.32,
    emissive: new THREE.Color(0x30445c),
    emissiveIntensity: 0.22,
  });
  const glowMaterialBase = new THREE.MeshBasicMaterial({
    color: 0xffd27f,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
  });
  const tiers = [0.28, 0.46, 0.64, 0.82];
  tiers.forEach((ratio, index) => {
    const height = totalHeight * ratio + 1.2 + index * 0.3;
    const radius = (baseWidth + topWidth) * (0.6 + index * 0.09);
    const walkway = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.14 + index * 0.03, 24, 72),
      torusMaterialBase.clone(),
    );
    walkway.material.emissiveIntensity += index * 0.05;
    walkway.rotation.x = Math.PI / 2;
    walkway.position.y = height;
    towerGroup.add(walkway);

    const glow = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.35, 0.05, 16, 96),
      glowMaterialBase.clone(),
    );
    glow.rotation.x = Math.PI / 2;
    glow.position.y = height + 0.12;
    glow.material.opacity = 0.2 + index * 0.04;
    towerGroup.add(glow);

    const strutMaterial = new THREE.MeshStandardMaterial({
      color: 0x243344,
      metalness: 0.82,
      roughness: 0.38,
      emissive: new THREE.Color(0x32485e),
      emissiveIntensity: 0.18,
    });
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, totalHeight * 0.08, 12, 1, true),
        strutMaterial.clone(),
      );
      strut.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      );
      strut.rotation.z = Math.PI / 2;
      strut.rotation.y = angle;
      towerGroup.add(strut);
    }
  });
}

function addLightSpines(totalHeight) {
  const spineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd27f,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
  });
  for (let i = 0; i < 6; i += 1) {
    const spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, totalHeight + 5, 0.12),
      spineMaterial.clone(),
    );
    const angle = (Math.PI / 3) * i;
    const radius = 1.6 + Math.sin(i * 1.2) * 0.3;
    spine.position.set(Math.cos(angle) * radius, totalHeight / 2, Math.sin(angle) * radius);
    towerGroup.add(spine);
  }
}
function addSkyDeck(totalHeight, topWidth) {
  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x23364d,
    metalness: 0.65,
    roughness: 0.35,
    emissive: 0x3f6c7a,
    emissiveIntensity: 0.25,
  });
  const deck = new THREE.Mesh(
    new THREE.RingGeometry(topWidth * 1.4, topWidth * 2.1, 64, 1),
    deckMaterial,
  );
  deck.rotation.x = Math.PI / 2;
  deck.position.y = totalHeight + 0.6;
  towerGroup.add(deck);

  const lightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd27f,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const lightRing = new THREE.Mesh(
    new THREE.RingGeometry(topWidth * 1.55, topWidth * 1.75, 64, 1),
    lightMaterial,
  );
  lightRing.rotation.x = Math.PI / 2;
  lightRing.position.y = deck.position.y + 0.15;
  towerGroup.add(lightRing);
}

function addHelipad(totalHeight, topWidth) {
  const pad = new THREE.Mesh(
    new THREE.CircleGeometry(topWidth * 1.45, 48),
    new THREE.MeshStandardMaterial({
      color: 0x0e1723,
      roughness: 0.6,
      metalness: 0.35,
    }),
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = totalHeight + 1.4;
  towerGroup.add(pad);

  const hMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd27f,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const hShape = new THREE.Shape();
  const size = topWidth * 0.75;
  const thickness = size * 0.18;
  hShape.moveTo(-size / 2, -size);
  hShape.lineTo(-size / 2 + thickness, -size);
  hShape.lineTo(-size / 2 + thickness, -thickness);
  hShape.lineTo(size / 2 - thickness, -thickness);
  hShape.lineTo(size / 2 - thickness, -size);
  hShape.lineTo(size / 2, -size);
  hShape.lineTo(size / 2, size);
  hShape.lineTo(size / 2 - thickness, size);
  hShape.lineTo(size / 2 - thickness, thickness);
  hShape.lineTo(-size / 2 + thickness, thickness);
  hShape.lineTo(-size / 2 + thickness, size);
  hShape.lineTo(-size / 2, size);
  const hGeometry = new THREE.ShapeGeometry(hShape);
  const helipad = new THREE.Mesh(hGeometry, hMaterial);
  helipad.rotation.x = -Math.PI / 2;
  helipad.position.y = pad.position.y + 0.02;
  towerGroup.add(helipad);
}

function addObservationPods(totalHeight, baseWidth) {
  const podBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a2736,
    roughness: 0.4,
    metalness: 0.8,
    emissive: new THREE.Color(0x142433),
    emissiveIntensity: 0.35,
  });
  const podGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a6c88,
    transparent: true,
    opacity: 0.6,
    roughness: 0.2,
    metalness: 0.5,
    emissive: new THREE.Color(0x54a7c7),
    emissiveIntensity: 0.4,
  });
  const radii = [baseWidth * 1.65, baseWidth * 1.45, baseWidth * 1.25];
  const heights = [totalHeight * 0.32, totalHeight * 0.54, totalHeight * 0.74];
  heights.forEach((height, index) => {
    const radius = radii[index];
    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * Math.PI * 2 + index * 0.4;
      const podGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(baseWidth * 0.18, baseWidth * 0.22, 1.6, 24, 1, true),
        podBodyMaterial.clone(),
      );
      body.rotation.z = Math.PI / 2;
      body.rotation.y = Math.PI / 2;
      body.position.set(0, 0, 0);
      podGroup.add(body);
      const glass = new THREE.Mesh(
        new THREE.SphereGeometry(baseWidth * 0.28, 24, 16, 0, Math.PI),
        podGlassMaterial.clone(),
      );
      glass.rotation.x = Math.PI / 2;
      glass.position.set(baseWidth * 0.22, 0, 0);
      podGroup.add(glass);
      podGroup.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      podGroup.lookAt(0, height, 0);
      podGroup.userData = { radius, baseHeight: height, angleOffset: angle };
      towerGroup.add(podGroup);
      if (towerGroup.userData && Array.isArray(towerGroup.userData.pods)) {
        towerGroup.userData.pods.push(podGroup);
      }
    }
  });
}

function createBillboardTexture() {
  return createCanvasTexture((ctx, size) => {
    ctx.fillStyle = "#04070c";
    ctx.fillRect(0, 0, size, size);
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "rgba(255, 140, 0, 0.5)");
    gradient.addColorStop(0.5, "rgba(74, 155, 142, 0.4)");
    gradient.addColorStop(1, "rgba(255, 215, 0, 0.35)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, size * 0.1, size, size * 0.8);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    for (let i = 0; i < 8; i += 1) {
      const y = size * (0.18 + 0.08 * i);
      ctx.fillRect(size * 0.1, y, size * 0.8, size * 0.015);
    }
    ctx.globalAlpha = 1;
  });
}

function addMediaPanels(baseWidth, totalHeight) {
  const panelTexture = createBillboardTexture();
  const panelMaterial = new THREE.MeshBasicMaterial({
    map: panelTexture,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const panelGeometry = new THREE.PlaneGeometry(baseWidth * 1.9, baseWidth * 0.7);
  const heights = [totalHeight * 0.12, totalHeight * 0.22];
  heights.forEach((height, index) => {
    const count = 3 + index;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + index * 0.3;
      const radius = baseWidth * 1.4;
      const panel = new THREE.Mesh(panelGeometry, panelMaterial.clone());
      panel.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      panel.lookAt(0, height, 0);
      panel.userData = { angleOffset: angle, radius, height };
      towerGroup.add(panel);
      if (towerGroup.userData && Array.isArray(towerGroup.userData.panels)) {
        towerGroup.userData.panels.push(panel);
      }
    }
  });
}

function addAntennaArray(totalHeight, topWidth) {
  const mastMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.9,
    emissive: new THREE.Color(0xffe7a3),
    emissiveIntensity: 0.7,
  });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(topWidth * 0.08, topWidth * 0.12, 5, 32), mastMaterial);
  mast.position.y = totalHeight + 3.2;
  towerGroup.add(mast);

  const beaconMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff1b0,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(topWidth * 0.25, 24, 18), beaconMaterial);
  beacon.position.y = mast.position.y + 2.6;
  towerGroup.add(beacon);
}
function animate3D() {
  requestAnimationFrame(animate3D);
  const elapsed = towerClock.getElapsedTime ? towerClock.getElapsedTime() : 0;
  const scrollY = window.scrollY;
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const scrollProgress =
    typeof window.__towerScrollProgress === "number"
      ? window.__towerScrollProgress
      : Math.min(scrollY / maxScroll, 1);
  const easedProgress = Math.pow(scrollProgress, 0.92);
  const totalHeight = towerParams.levels * towerParams.floorHeight;
  const scaleFactor = towerGroup ? towerGroup.scale.y : 1;
  const scaledHeight = totalHeight * scaleFactor;
  const focusY = lerp(scaledHeight * 0.35, scaledHeight + 48, easedProgress);
  const targetX = lerp(10, 2.5, easedProgress);
  const targetY = lerp(72, scaledHeight + 128, easedProgress);
  const targetZ = lerp(140, 78, easedProgress);
  if (reusableVector) {
    reusableVector.set(targetX, targetY, targetZ);
    camera.position.lerp(reusableVector, 0.08);
  } else {
    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.08);
  }
  camera.lookAt(0, focusY, 0);
  if (towerGroup) {
    const rotationTarget = lerp(0.18, 0.06, easedProgress);
    towerGroup.rotation.y += (rotationTarget - towerGroup.rotation.y) * 0.08;
    towerGroup.position.y = lerp(3, 6, easedProgress);
  }
  const desiredFov = lerp(44, 32, easedProgress);
  if (typeof camera.fov === "number") {
    camera.fov += (desiredFov - camera.fov) * 0.08;
    camera.updateProjectionMatrix();
  }
  const { halo, orbiters, panels = [], pods = [] } = towerGroup.userData || {};
  if (halo) {
    halo.rotation.z = 0;
    halo.material.opacity = 0.28 + easedProgress * 0.32;
  }
  if (orbiters) {
    orbiters.forEach((orbiter) => {
      const baseAngle = orbiter.offset || 0;
      const radius = orbiter.radius || 5;
      const baseHeight = totalHeight * (0.22 + orbiter.radius * 0.01);
      orbiter.mesh.position.x = Math.cos(baseAngle) * radius;
      orbiter.mesh.position.z = Math.sin(baseAngle) * radius;
      orbiter.mesh.position.y = baseHeight;
    });
  }
  panels.forEach((panel) => {
    const data = panel.userData || {};
    const baseAngle = data.angleOffset || 0;
    const radius = data.radius || 1;
    const height = data.height || panel.position.y;
    panel.position.x = Math.cos(baseAngle) * radius;
    panel.position.z = Math.sin(baseAngle) * radius;
    panel.position.y = height;
    if (reusableVector) {
      reusableVector.set(0, height, 0);
      panel.lookAt(reusableVector);
    } else {
      panel.lookAt(new THREE.Vector3(0, height, 0));
    }
  });
  pods.forEach((pod) => {
    const data = pod.userData || {};
    const radius = data.radius || 1;
    const baseHeight = data.baseHeight || pod.position.y;
    const baseAngle = data.angleOffset || 0;
    pod.position.x = Math.cos(baseAngle) * radius;
    pod.position.y = baseHeight;
    pod.position.z = Math.sin(baseAngle) * radius;
    pod.lookAt(0, baseHeight, 0);
  });
  windowMeshes.forEach((data) => {
    const intensity =
      data.baseIntensity +
      data.amplitude * Math.sin(elapsed * data.speed + data.phase + easedProgress * 6.2);
    data.mesh.material.emissiveIntensity = intensity;
    data.mesh.material.opacity =
      0.55 +
      0.25 *
        Math.sin(elapsed * data.speed * 1.4 + data.phase * 1.3 + easedProgress * 4.5);
  });
  renderer.render(scene, camera);
}
window.addEventListener("resize", () => {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.init3DScene = init3DScene;
