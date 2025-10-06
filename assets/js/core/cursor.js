if (window.innerWidth > 1024) {
  const cursor = document.querySelector(".cursor"),
    follower = document.querySelector(".cursor-follower");
  let mouseX = -50,
    mouseY = -50,
    cursorX = -50,
    cursorY = -50,
    followerX = -50,
    followerY = -50,
    raf;
  document.addEventListener(
    "mousemove",
    (e) => {
      ((mouseX = e.clientX),
        (mouseY = e.clientY),
        raf || (raf = requestAnimationFrame(updateCursor)));
    },
    { passive: !0 },
  );
  function updateCursor() {
    ((cursorX += (mouseX - cursorX) * 0.12),
      (cursorY += (mouseY - cursorY) * 0.12),
      (followerX += (mouseX - followerX) * 0.06),
      (followerY += (mouseY - followerY) * 0.06),
      (cursor.style.transform = `translate(${cursorX - 6}px,${cursorY - 6}px)`),
      (follower.style.transform = `translate(${followerX - 25}px,${followerY - 25}px)`),
      (raf = requestAnimationFrame(updateCursor)));
  }
  (updateCursor(),
    document
      .querySelectorAll(
        "a, button, .vault-card, .cta-button, .form-submit, .service-card, .team-card, .testimonial-card, .blog-card, .carousel-arrow",
      )
      .forEach((el) => {
        (el.addEventListener("mouseenter", () => {
          ((cursor.style.transform += " scale(2.2)"),
            (follower.style.transform += " scale(1.8)"));
        }),
          el.addEventListener("mouseleave", () => {
            ((cursor.style.transform = cursor.style.transform.replace(
              " scale(2.2)",
              "",
            )),
              (follower.style.transform = follower.style.transform.replace(
                " scale(1.8)",
                "",
              )));
          }));
      }));
}
