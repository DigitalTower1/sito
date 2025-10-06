(() => {
  if (window.innerWidth <= 1024) {
    return;
  }

  const cursor = document.querySelector(".cursor");
  const follower = document.querySelector(".cursor-follower");

  if (!cursor || !follower) {
    return;
  }

  let mouseX = -50;
  let mouseY = -50;
  let cursorX = -50;
  let cursorY = -50;
  let followerX = -50;
  let followerY = -50;
  let cursorScale = 1;
  let followerScale = 1;
  let rafId = 0;

  function applyTransforms() {
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate3d(-50%, -50%, 0) scale(${cursorScale})`;
    follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate3d(-50%, -50%, 0) scale(${followerScale})`;
  }

  function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.12;
    cursorY += (mouseY - cursorY) * 0.12;
    followerX += (mouseX - followerX) * 0.06;
    followerY += (mouseY - followerY) * 0.06;

    applyTransforms();
    rafId = window.requestAnimationFrame(updateCursor);
  }

  function enlarge() {
    cursorScale = 2.2;
    followerScale = 1.8;
  }

  function resetScale() {
    cursorScale = 1;
    followerScale = 1;
  }

  document.addEventListener(
    "mousemove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateCursor);
      }
    },
    { passive: true },
  );

  const interactiveSelectors =
    "a, button, .vault-card, .cta-button, .form-submit, .service-card, .team-card, .testimonial-card, .blog-card, .carousel-arrow";

  document.querySelectorAll(interactiveSelectors).forEach((element) => {
    element.addEventListener("mouseenter", () => {
      enlarge();
      applyTransforms();
    });
    element.addEventListener("mouseleave", () => {
      resetScale();
      applyTransforms();
    });
  });

  applyTransforms();
  updateCursor();
})();
