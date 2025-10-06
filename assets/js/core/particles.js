const canvas = document.getElementById("particleCanvas"),
  ctx = canvas.getContext("2d");
function initCanvas() {
  ((canvas.width = window.innerWidth), (canvas.height = window.innerHeight));
}
let particles = [],
  mouse = { x: -999, y: -999 };
function initParticles() {
  (initCanvas(), (particles = []));
  const count = window.innerWidth < 768 ? 40 : 70;
  for (let i = 0; i < count; i++) particles.push(new Particle());
  animateParticles();
}
class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    ((this.x = Math.random() * canvas.width),
      (this.y = Math.random() * canvas.height),
      (this.size = Math.random() * 2 + 1),
      (this.speedX = (Math.random() - 0.5) * 0.3),
      (this.speedY = (Math.random() - 0.5) * 0.3),
      (this.opacity = Math.random() * 0.4 + 0.3),
      (this.baseX = this.x),
      (this.baseY = this.y),
      (this.color = Math.random() > 0.5 ? "212,175,55" : "255,107,53"));
  }
  update() {
    const dx = mouse.x - this.x,
      dy = mouse.y - this.y,
      dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      const force = (100 - dist) / 100,
        angle = Math.atan2(dy, dx);
      ((this.x -= Math.cos(angle) * force * 3),
        (this.y -= Math.sin(angle) * force * 3));
    } else
      ((this.x += (this.baseX - this.x) * 0.03),
        (this.y += (this.baseY - this.y) * 0.03));
    ((this.baseX += this.speedX),
      (this.baseY += this.speedY),
      (this.baseX < 0 || this.baseX > canvas.width) && (this.speedX *= -1),
      (this.baseY < 0 || this.baseY > canvas.height) && (this.speedY *= -1));
  }
  draw() {
    ((ctx.fillStyle = `rgba(${this.color},${this.opacity})`),
      (ctx.shadowBlur = 8),
      (ctx.shadowColor = `rgba(${this.color},0.8)`),
      ctx.beginPath(),
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI),
      ctx.fill());
  }
}
function animateParticles() {
  (ctx.clearRect(0, 0, canvas.width, canvas.height),
    particles.forEach((p) => {
      (p.update(), p.draw());
    }),
    requestAnimationFrame(animateParticles));
}
(document.addEventListener(
  "mousemove",
  (e) => {
    ((mouse.x = e.clientX), (mouse.y = e.clientY));
  },
  { passive: !0 },
),
  window.addEventListener(
    "resize",
    () => {
      (initCanvas(), particles.forEach((p) => p.reset()));
    },
    { passive: !0 },
  ));
