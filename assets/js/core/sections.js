(() => {
  const sections = Array.from(document.querySelectorAll("section"));
  const scrollIndicators = Array.from(document.querySelectorAll(".scroll-indicator"));
  const mainNav = document.getElementById("mainNav");
  const heroSection = document.getElementById("hero");
  const contactSection = document.getElementById("contact");

  let ticking = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateNavState() {
    if (!mainNav) {
      return;
    }
    if (window.scrollY > 80) {
      mainNav.classList.add("scrolled");
    } else {
      mainNav.classList.remove("scrolled");
    }
  }

  function computeProgress() {
    const docHeight = Math.max(
      document.documentElement ? document.documentElement.scrollHeight : 0,
      document.body ? document.body.scrollHeight : 0,
      window.innerHeight,
      1,
    );
    const heroTop = heroSection ? heroSection.offsetTop : 0;
    const contactBottom = contactSection
      ? contactSection.offsetTop + contactSection.offsetHeight
      : docHeight;
    const range = Math.max(1, contactBottom - heroTop);
    const viewportCenter = window.scrollY + window.innerHeight * 0.5;
    const rawProgress = (viewportCenter - heroTop) / range;
    window.__towerScrollProgress = clamp(rawProgress, 0, 1);
  }

  function updateIndicators() {
    scrollIndicators.forEach((indicator) => {
      let section = indicator.closest("section");
      if (!section) {
        const sibling = indicator.previousElementSibling;
        if (sibling && sibling.tagName === "SECTION") {
          section = sibling;
        }
      }
      const isActive = section ? section.classList.contains("visible") : false;
      indicator.classList.toggle("is-visible", isActive);
    });
  }

  function updateSections() {
    const viewportHeight = window.innerHeight || 1;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const visibleHeight = Math.max(
        0,
        Math.min(viewportHeight, rect.top + rect.height) - Math.max(0, rect.top),
      );
      const ratio = visibleHeight / viewportHeight;
      if (ratio > 0.28) {
        section.classList.add("visible");
      } else {
        section.classList.remove("visible");
      }
    });
    updateIndicators();
    computeProgress();
  }

  function requestUpdate() {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(() => {
      updateSections();
      updateNavState();
      ticking = false;
    });
  }

  function handleResize() {
    updateSections();
    updateNavState();
  }

  function scrollToSection(id) {
    const section = document.getElementById(id);
    if (!section) {
      return;
    }
    const navHeight = mainNav ? mainNav.getBoundingClientRect().height : 0;
    const offset = section.getBoundingClientRect().top + window.pageYOffset - (navHeight + 40);
    window.scrollTo({ top: offset, behavior: "smooth" });
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
    window.__towerScrollProgress = 0;
    if (sections.length) {
      sections[0].classList.add("visible");
    }
    updateSections();
    updateNavState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
  }

  window.initSections = initSections;
  window.scrollToSection = scrollToSection;
  window.carouselNext = carouselNext;
  window.carouselPrev = carouselPrev;
})();
