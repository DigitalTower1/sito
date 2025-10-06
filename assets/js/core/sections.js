(() => {
  const sections = Array.from(document.querySelectorAll("section"));
  const scrollIndicators = Array.from(document.querySelectorAll(".scroll-indicator"));
  const indicatorCooldown = new WeakMap();
  const mainNav = document.getElementById("mainNav");
  const progressBar = document.getElementById("progressBar");
  const progressBarContainer = document.getElementById("progressBarContainer");

  let lastSection = null;
  let hasScrolled = false;
  let isScrolling = false;

  function updateProgressBar() {
    if (!progressBar || !progressBarContainer) {
      return;
    }

    const scrollY = window.scrollY;
    const footer = document.querySelector("footer");

    if (!hasScrolled && scrollY > 50) {
      hasScrolled = true;
      progressBarContainer.classList.add("visible");
    }

    if (!hasScrolled) {
      return;
    }

    const navHeight = mainNav ? mainNav.getBoundingClientRect().height : 0;
    const footerTop = footer
      ? footer.getBoundingClientRect().top + scrollY
      : document.documentElement.scrollHeight;

    const maxHeight = Math.max(0, footerTop - navHeight - 80);
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.max(0, Math.min(1, scrollY / docHeight)) : 0;
    const progressHeight = Math.min(maxHeight, scrollPercent * maxHeight);

    progressBar.style.height = `${progressHeight}px`;

    let currentSection = null;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      if (center > 0 && center < window.innerHeight) {
        currentSection = section;
      }
    });

    if (currentSection && currentSection !== lastSection) {
      lastSection = currentSection;
      progressBar.classList.add("scroll-glow");
      window.setTimeout(() => {
        progressBar.classList.remove("scroll-glow");
      }, 800);
    }

    if (progressHeight <= 0) {
      return;
    }

    const barRect = progressBar.getBoundingClientRect();
    const tipY = barRect.bottom;

    scrollIndicators.forEach((indicator) => {
      const rect = indicator.getBoundingClientRect();
      const indicatorMid = rect.top + rect.height / 2;

      if (indicatorMid < 0 || indicatorMid > window.innerHeight) {
        return;
      }
      if (Math.abs(indicatorMid - tipY) > 36) {
        return;
      }

      const now = performance.now();
      const lastTrigger = indicatorCooldown.get(indicator) || 0;
      if (now - lastTrigger < 900) {
        return;
      }

      indicatorCooldown.set(indicator, now);
      indicator.classList.add("pulse");
      progressBar.classList.add("scroll-contact", "scroll-glow");

      window.setTimeout(() => {
        indicator.classList.remove("pulse");
      }, 900);
      window.setTimeout(() => {
        progressBar.classList.remove("scroll-contact");
      }, 450);
      window.setTimeout(() => {
        progressBar.classList.remove("scroll-glow");
      }, 750);
    });
  }

  function updateSections() {
    updateProgressBar();
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const visibleHeight = Math.max(
        0,
        Math.min(window.innerHeight, rect.top + rect.height) - Math.max(0, rect.top),
      );
      const visibleRatio = visibleHeight / window.innerHeight;
      if (visibleRatio > 0.3) {
        section.classList.add("visible");
      } else {
        section.classList.remove("visible");
      }
    });
  }

  function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
      const offset = section.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
    if (typeof window.closeMobileMenu === "function") {
      window.closeMobileMenu();
    }
  }

  function carouselNext(id) {
    const slider = document.getElementById(id);
    if (!slider) {
      return;
    }
    const card = slider.querySelector(
      ".vault-card, .testimonial-card, .blog-card, .team-card",
    );
    if (card) {
      slider.scrollBy({ left: card.offsetWidth + 32, behavior: "smooth" });
    }
  }

  function carouselPrev(id) {
    const slider = document.getElementById(id);
    if (!slider) {
      return;
    }
    const card = slider.querySelector(
      ".vault-card, .testimonial-card, .blog-card, .team-card",
    );
    if (card) {
      slider.scrollBy({ left: -(card.offsetWidth + 32), behavior: "smooth" });
    }
  }

  function initSections() {
    if (sections[0]) {
      sections[0].classList.add("visible");
    }
    updateSections();
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          updateSections();
          isScrolling = false;
        });
        isScrolling = true;
      }

      if (mainNav) {
        if (window.scrollY > 80) {
          mainNav.classList.add("scrolled");
        } else {
          mainNav.classList.remove("scrolled");
        }
      }
    },
    { passive: true },
  );

  window.addEventListener(
    "resize",
    () => {
      updateSections();
    },
    { passive: true },
  );

  window.initSections = initSections;
  window.scrollToSection = scrollToSection;
  window.carouselNext = carouselNext;
  window.carouselPrev = carouselPrev;
})();
