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
