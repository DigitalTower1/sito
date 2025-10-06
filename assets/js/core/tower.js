let scene;
let camera;
let renderer;
let towerGroup;
let windowMeshes = [];
const towerClock = new (window.THREE ? THREE.Clock : function () {})();
let towerSections = [];
const towerParams = {
  levels: 42,
  baseWidth: 5.6,
  topWidth: 1.05,
  floorHeight: 1.65,
};
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

    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 120; i += 1) {
      const w = 1;
      const h = Math.random() * 6 + 2;
      ctx.fillRect(Math.random() * size, Math.random() * size, w, h);
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
  scene.fog = new THREE.Fog(sceneBackground, 80, 160);
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 14, 48);
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
  towerGroup.scale.setScalar(1.35);
  towerGroup.position.y = 1.6;
  scene.add(towerGroup);
  const facadeTexture = createFacadeTexture();
  facadeTexture.repeat.set(4, towerParams.levels * 0.8);
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
    const width = baseWidth - (baseWidth - topWidth) * Math.pow(t, 1.3);
    const depth = width * 0.68;
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
  addLightSpines(totalHeight);
  addSkyDeck(totalHeight, topWidth);
  addHelipad(totalHeight, topWidth);

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
  towerGroup.userData = { halo, orbiters };
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
  const easedProgress = Math.pow(scrollProgress, 0.9);
  const totalHeight = towerParams.levels * towerParams.floorHeight;
  const sectionCount = Math.max(1, (towerSections.length || 1) - 1);
  const sectionFloat = easedProgress * sectionCount;
  const progressSections = sectionCount > 0 ? Math.min(sectionFloat / sectionCount, 1) : easedProgress;
  const focusRatio = Math.min(1, 0.22 + progressSections * 0.78);
  const focusHeight = totalHeight * focusRatio;
  const orbitalRadius = 32 - easedProgress * 22;
  const baseAngle = easedProgress * Math.PI * 7.2 + Math.sin(elapsed * 0.22) * 0.08;
  const zoomZ = 54 - easedProgress * 34;
  const heightOffset = 8 + easedProgress * 18;
  const targetPosition = new THREE.Vector3(
    Math.sin(baseAngle) * orbitalRadius * 0.55,
    focusHeight + heightOffset,
    zoomZ + Math.sin(elapsed * 0.3) * 0.9,
  );
  camera.position.lerp(targetPosition, 0.07);
  const lookAtY = focusHeight + Math.sin(elapsed * 0.18) * 0.4;
  camera.lookAt(0, lookAtY, 0);
  const desiredRotation = easedProgress * Math.PI * 3.4;
  towerGroup.rotation.y += (desiredRotation - towerGroup.rotation.y) * 0.08;
  towerGroup.rotation.y += 0.0018 + Math.sin(elapsed * 0.18) * 0.0008;
  towerGroup.position.y = 1.6 + Math.sin(elapsed * 0.35) * 0.28 + easedProgress * 0.65;
  const { halo, orbiters } = towerGroup.userData;
  if (halo) {
    halo.rotation.z += 0.004;
    halo.material.opacity = 0.2 + easedProgress * 0.25 + Math.sin(elapsed * 1.5) * 0.06;
  }
  if (orbiters) {
    orbiters.forEach((orbiter) => {
      const angle = elapsed * orbiter.speed + orbiter.offset;
      const radiusBoost = 1 + focusRatio * 0.35;
      orbiter.mesh.position.x = Math.cos(angle) * orbiter.radius * radiusBoost;
      orbiter.mesh.position.z = Math.sin(angle) * orbiter.radius * radiusBoost;
      orbiter.mesh.position.y =
        totalHeight * (0.25 + orbiter.radius * 0.01) +
        Math.sin(elapsed * 0.6 + orbiter.offset) * 0.18;
    });
  }
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
