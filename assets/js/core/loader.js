(() => {
  const loaderText = document.getElementById("loaderText");
  const loaderBar = document.getElementById("loaderBar");
  const loader = document.getElementById("loader");
  const loaderProgress = document.getElementById("loaderProgress");
  const mainNav = document.getElementById("mainNav");
  const lightGlow1 = document.getElementById("lightGlow1");
  const lightGlow2 = document.getElementById("lightGlow2");

  const message = "Scaliamo insieme la torre del successo";

  function buildLoaderText() {
    if (!loaderText || !message) {
      return;
    }
    loaderText.innerHTML = "";
    [...message].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.setProperty("--i", String(index));
      span.style.animationDelay = `${index * 0.05}s`;
      loaderText.appendChild(span);
    });
  }

  function activateGlow() {
    if (lightGlow1) {
      lightGlow1.classList.add("active");
    }
    if (lightGlow2) {
      lightGlow2.classList.add("active");
    }
  }

  function startExperience() {
    if (typeof window.init3DScene === "function") {
      window.init3DScene();
    }
    if (typeof window.initSections === "function") {
      window.initSections();
    }
    if (typeof window.initParticles === "function") {
      window.initParticles();
    }
    window.setTimeout(activateGlow, 500);
  }

  function revealSite() {
    if (loader) {
      if (loaderProgress) {
        loaderProgress.textContent = "100%";
      }
      loader.classList.add("hidden");
    }
    window.setTimeout(() => {
      if (mainNav) {
        mainNav.classList.add("visible");
      }
      startExperience();
    }, 200);
  }

  function runLoader() {
    if (!loader || !loaderBar) {
      startExperience();
      return;
    }

    let progress = 0;
    const interval = window.setInterval(() => {
      progress = Math.min(100, progress + 3 + Math.random() * 7);
      loaderBar.style.width = `${progress}%`;
      if (loaderProgress) {
        loaderProgress.textContent = `${Math.round(progress)}%`;
      }

      if (progress >= 100) {
        window.clearInterval(interval);
        window.setTimeout(revealSite, 600);
      }
    }, 160);
  }

  function init() {
    buildLoaderText();
    runLoader();
  }

  window.addEventListener("load", init, { once: true });
})();
