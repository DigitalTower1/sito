let windowMeshes = [];
const towerClock = new (window.THREE ? THREE.Clock : function () {})();
let towerSections = [];
const towerParams = {
  levels: 28,
  baseWidth: 3.8,
  topWidth: 0.65,
  floorHeight: 1.6,
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
    ctx.fillStyle = "#1a2433";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < size; i += 8) {
      ctx.fillRect(0, i, size, 2);
    }
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let j = 0; j < size; j += 6) {
      ctx.fillRect(j, 0, 2, size);
    }
  });
}
function createMetalTexture() {
  return createCanvasTexture((ctx, size) => {
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#273548");
    gradient.addColorStop(0.5, "#1b2838");
    gradient.addColorStop(1, "#31445c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(0, size * 0.45, size, size * 0.1);
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
  renderer = new THREE.WebGLRenderer({ alpha: !0, antialias: !0 });
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
  const windowGeometry = new THREE.PlaneGeometry(width * 0.16, 0.6);
  const sides = [
    { axis: "z", sign: depth / 2 + 0.001, rotation: 0 },
    { axis: "x", sign: width / 2 + 0.001, rotation: Math.PI / 2 },
    { axis: "z", sign: -depth / 2 - 0.001, rotation: Math.PI },
    { axis: "x", sign: -width / 2 - 0.001, rotation: -Math.PI / 2 },
  ];
  sides.forEach((side, sideIndex) => {
    const columns = side.axis === "z" ? 3 : 4;
    for (let i = 0; i < columns; i++) {
      const mesh = new THREE.Mesh(windowGeometry, windowMaterialBase.clone());
      const offset = (i - (columns - 1) / 2) * (side.axis === "z" ? width * 0.28 : depth * 0.36);
      mesh.position.y = y;
      if (side.axis === "z") {
        mesh.position.x = offset;
        mesh.position.z = side.sign;
      } else {
        mesh.position.z = offset;
        mesh.position.x = side.sign;
      }
      mesh.rotation.y = side.rotation;
      mesh.material.emissiveIntensity = 0.6 + Math.random() * 0.2;
      mesh.material.opacity = 0.6 + Math.random() * 0.25;
      towerGroup.add(mesh);
      windowMeshes.push({
        mesh,
        speed: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0.35 + Math.random() * 0.3,
        baseIntensity: 0.55 + Math.random() * 0.2,
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
function animate3D() {
  requestAnimationFrame(animate3D);
  const elapsed = towerClock.getElapsedTime ? towerClock.getElapsedTime() : 0;
  const scrollY = window.scrollY;
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const scrollProgress = Math.min(scrollY / maxScroll, 1);
  const totalHeight = towerParams.levels * towerParams.floorHeight;
  const sectionCount = towerSections.length || 1;
  const sectionSize = (totalHeight + 18) / sectionCount;
  const sectionFloat = scrollProgress * sectionCount;
  const sectionIndex = Math.min(sectionCount - 1, Math.floor(sectionFloat));
  const sectionLocal = sectionFloat - sectionIndex;
  const focusHeight = 6 + sectionIndex * sectionSize + sectionLocal * sectionSize;
  const radius = 20 - scrollProgress * 11;
  const angle = scrollProgress * Math.PI * 7 + sectionIndex * 0.4;
  const targetPosition = new THREE.Vector3(
    Math.sin(angle) * radius * 0.45,
    focusHeight,
    (34 - scrollProgress * 20) + Math.sin(elapsed * 0.3) * 0.6,
  );
  camera.position.lerp(targetPosition, 0.08);
  camera.lookAt(0, focusHeight - 3.5, 0);
  const subtleRotate = 0.002 + scrollProgress * 0.004;
  towerGroup.rotation.y += subtleRotate;
  towerGroup.position.y = Math.sin(elapsed * 0.4) * 0.1;
  const { halo, orbiters } = towerGroup.userData;
  if (halo) {
    halo.rotation.z += 0.004;
    halo.material.opacity = 0.25 + Math.sin(elapsed * 1.5) * 0.08;
  }
  if (orbiters) {
    orbiters.forEach((orbiter) => {
      const angle = elapsed * orbiter.speed + orbiter.offset;
      orbiter.mesh.position.x = Math.cos(angle) * orbiter.radius;
      orbiter.mesh.position.z = Math.sin(angle) * orbiter.radius;
      orbiter.mesh.position.y += Math.sin(elapsed * 0.6 + orbiter.offset) * 0.01;
    });
  }
  windowMeshes.forEach((data) => {
    const intensity = data.baseIntensity + data.amplitude * Math.sin(elapsed * data.speed + data.phase);
    data.mesh.material.emissiveIntensity = intensity;
    data.mesh.material.opacity = 0.55 + 0.25 * Math.sin(elapsed * data.speed * 1.4 + data.phase * 1.3);
  });
  renderer.render(scene, camera);
}
window.addEventListener(
  "resize",
  () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
function init3DScene() {
  if (!window.THREE) return;
  ((scene = new THREE.Scene()),
    (camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1e3,
    )),
    camera.position.set(0, 8, 45),
    (renderer = new THREE.WebGLRenderer({ alpha: !0, antialias: !0 })),
    renderer.setSize(window.innerWidth, window.innerHeight),
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)),
    tower3DContainer.appendChild(renderer.domElement));
  const ambientLight = new THREE.AmbientLight(16777215, 0.5);
  scene.add(ambientLight);
  const pointLight1 = new THREE.PointLight(14329087, 1.2, 80);
  (pointLight1.position.set(5, 25, 10), scene.add(pointLight1));
  const pointLight2 = new THREE.PointLight(16766773, 0.8, 60);
  (pointLight2.position.set(-5, 15, 5), scene.add(pointLight2));
  towerGroup = new THREE.Group();
  const levels = 25,
    baseWidth = 3.5,
    topWidth = 0.6;
  for (let i = 0; i < levels; i++) {
    const t = i / levels,
      width = baseWidth - (baseWidth - topWidth) * t,
      height = 1.8,
      depth = width * 0.7,
      floorGeometry = new THREE.BoxGeometry(width, height, depth),
      material = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 14329087 : 16766773,
        transparent: !0,
        opacity: 0.75,
        shininess: 120,
        emissive: i % 3 === 0 ? 14329087 : 0,
        emissiveIntensity: 0.4,
      }),
      floor = new THREE.Mesh(floorGeometry, material);
    ((floor.position.y = i * 2), towerGroup.add(floor));
    if (i % 2 === 0) {
      const windowGeometry = new THREE.BoxGeometry(
          width * 0.15,
          0.6,
          depth * 1.01,
        ),
        windowMaterial = new THREE.MeshBasicMaterial({
          color: 16776960,
          transparent: !0,
          opacity: 0.9,
          emissive: 16776960,
          emissiveIntensity: 1,
        }),
        positions = [-0.3, 0, 0.3];
      positions.forEach((x) => {
        const win = new THREE.Mesh(windowGeometry, windowMaterial);
        (win.position.set(x * width, i * 2, 0), towerGroup.add(win));
      });
    }
  }
  const spireGeometry = new THREE.ConeGeometry(topWidth, 4, 8),
    spireMaterial = new THREE.MeshPhongMaterial({
      color: 16766773,
      emissive: 16766773,
      emissiveIntensity: 0.8,
      shininess: 150,
    }),
    spire = new THREE.Mesh(spireGeometry, spireMaterial);
  ((spire.position.y = levels * 2 + 2), towerGroup.add(spire));
  const topGlowGeometry = new THREE.SphereGeometry(0.6, 16, 16),
    topGlowMaterial = new THREE.MeshBasicMaterial({
      color: 16766773,
      transparent: !0,
      opacity: 0.7,
    }),
    topGlow = new THREE.Mesh(topGlowGeometry, topGlowMaterial);
  ((topGlow.position.y = levels * 2 + 4),
    towerGroup.add(topGlow),
    scene.add(towerGroup),
    animate3D());
}

function animate3D() {
  requestAnimationFrame(animate3D);
  const scrollY = window.scrollY,
    maxScroll = document.documentElement.scrollHeight - window.innerHeight,
    scrollProgress = Math.min(scrollY / maxScroll, 1);
  const startY = 8,
    endY = 52,
    startZ = 45,
    endZ = 8,
    targetY = startY + (endY - startY) * Math.pow(scrollProgress, 1.2),
    targetZ = startZ + (endZ - startZ) * Math.pow(scrollProgress, 0.8),
    targetRotation = scrollProgress * Math.PI * 6;
  ((camera.position.y += (targetY - camera.position.y) * 0.1),
    (camera.position.z += (targetZ - camera.position.z) * 0.1));
  const angle = targetRotation,
    radius = 18 - scrollProgress * 10;
  ((camera.position.x = Math.sin(angle) * radius * 0.4),
    camera.lookAt(0, targetY - 5, 0),
    towerGroup && (towerGroup.rotation.y += 0.002),
    renderer.render(scene, camera));
}

window.addEventListener(
  "resize",
  () => {
    camera &&
      renderer &&
      ((camera.aspect = window.innerWidth / window.innerHeight),
      camera.updateProjectionMatrix(),
      renderer.setSize(window.innerWidth, window.innerHeight));
  },
  { passive: !0 },
);
