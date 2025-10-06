const text = "SCALIAMO INSIEME LA TORRE DEL SUCCESSO",
  loaderText = document.getElementById("loaderText");
text.split("").forEach((c, i) => {
  const s = document.createElement("span");
  s.textContent = c === " " ? "\u00A0" : c;
  s.style.setProperty("--i", i);
  s.style.animationDelay = `${i * 0.05}s`;
  loaderText.appendChild(s);
});

let progress = 0,
  isScrolling = !1,
  hasScrolled = !1;
const loaderBar = document.getElementById("loaderBar"),
  loader = document.getElementById("loader"),
  mainNav = document.getElementById("mainNav"),
  tower3DContainer = document.getElementById("tower3DContainer"),
  progressBar = document.getElementById("progressBar"),
  progressBarContainer = document.getElementById("progressBarContainer"),
  lightGlow1 = document.getElementById("lightGlow1"),
  lightGlow2 = document.getElementById("lightGlow2"),
  cardOverlay = document.getElementById("cardOverlay");

const loadInt = setInterval(() => {
  ((progress += 8 * Math.random()),
    progress > 100 && (progress = 100),
    (loaderBar.style.width = progress + "%"),
    100 === progress &&
      (clearInterval(loadInt),
      setTimeout(() => {
        (loader.classList.add("hidden"),
          setTimeout(() => {
            (mainNav.classList.add("visible"),
              init3DScene(),
              initSections(),
              initParticles(),
              setTimeout(() => {
                (lightGlow1.classList.add("active"),
                  lightGlow2.classList.add("active"));
              }, 500));
          }, 200));
      }, 600)));
}, 160);
