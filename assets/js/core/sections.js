const sections = Array.from(document.querySelectorAll("section"));
const scrollIndicators = Array.from(
  document.querySelectorAll(".scroll-indicator"),
);
const indicatorCooldown = new WeakMap();
function initSections() {
  (sections[0] && sections[0].classList.add("visible"), updateSections());
}

let lastSection = null;
function updateProgressBar() {
  const scrollY = window.scrollY,
    footer = document.querySelector("footer");
  if (!hasScrolled && scrollY > 50) {
    ((hasScrolled = !0), progressBarContainer.classList.add("visible"));
  }
  if (!hasScrolled) return;
  const navHeight = mainNav.getBoundingClientRect().height,
    footerTop = footer
      ? footer.getBoundingClientRect().top + scrollY
      : document.documentElement.scrollHeight,
    maxHeight = Math.max(0, footerTop - navHeight - 80),
    docHeight = document.documentElement.scrollHeight - window.innerHeight,
    scrollPercent = docHeight > 0 ? Math.max(0, Math.min(1, scrollY / docHeight)) : 0;
  const progressHeight = Math.min(maxHeight, scrollPercent * maxHeight);
  progressBar.style.height = `${progressHeight}px`;
    maxHeight = footerTop - navHeight - 80,
    docHeight = document.documentElement.scrollHeight - window.innerHeight,
    scrollPercent = Math.max(0, Math.min(1, scrollY / docHeight));
  progressBar.style.height = `${scrollPercent * maxHeight}px`;
  let currentSection = null;
  sections.forEach((s) => {
    const rect = s.getBoundingClientRect(),
      center = rect.top + rect.height * 0.5;
    center > 0 && center < window.innerHeight && (currentSection = s);
  });
  if (currentSection && currentSection !== lastSection) {
    ((lastSection = currentSection),
      progressBar.classList.add("scroll-glow"),
      setTimeout(() => {
        progressBar.classList.remove("scroll-glow");
      }, 800));
  }
  if (progressHeight > 0) {
    const barRect = progressBar.getBoundingClientRect();
    const tipY = barRect.bottom;
    scrollIndicators.forEach((indicator) => {
      const rect = indicator.getBoundingClientRect();
      const indicatorMid = rect.top + rect.height / 2;
      if (indicatorMid < 0 || indicatorMid > window.innerHeight) return;
      if (Math.abs(indicatorMid - tipY) > 36) return;
      const now = performance.now();
      const last = indicatorCooldown.get(indicator) || 0;
      if (now - last < 900) return;
      indicatorCooldown.set(indicator, now);
      indicator.classList.add("pulse");
      progressBar.classList.add("scroll-contact");
      progressBar.classList.add("scroll-glow");
      setTimeout(() => {
        indicator.classList.remove("pulse");
      }, 900);
      setTimeout(() => {
        progressBar.classList.remove("scroll-contact");
      }, 450);
      setTimeout(() => {
        progressBar.classList.remove("scroll-glow");
      }, 750);
    });
  }
      progressBar.classList.add("section-pulse"),
      setTimeout(() => {
        progressBar.classList.remove("section-pulse");
      }, 800));
  }
}

function updateSections() {
  (updateProgressBar(),
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect(),
        visibleHeight = Math.max(
          0,
          Math.min(window.innerHeight, rect.top + rect.height) -
            Math.max(0, rect.top),
        ),
        visibleRatio = visibleHeight / window.innerHeight;
      visibleRatio > 0.3
        ? section.classList.add("visible")
        : section.classList.remove("visible");
    }));
}

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) {
    const offset =
      section.getBoundingClientRect().top + window.pageYOffset - 100;
    window.scrollTo({ top: offset, behavior: "smooth" });
  }
  closeMobileMenu();
}

function carouselNext(id) {
  const slider = document.getElementById(id);
  if (slider) {
    const card = slider.querySelector(
      ".vault-card, .testimonial-card, .blog-card, .team-card",
    );
    card &&
      slider.scrollBy({ left: card.offsetWidth + 32, behavior: "smooth" });
  }
}

function carouselPrev(id) {
  const slider = document.getElementById(id);
  if (slider) {
    const card = slider.querySelector(
      ".vault-card, .testimonial-card, .blog-card, .team-card",
    );
    card &&
      slider.scrollBy({ left: -(card.offsetWidth + 32), behavior: "smooth" });
  }
}

(window.addEventListener(
  "scroll",
  () => {
    (isScrolling ||
      (window.requestAnimationFrame(() => {
        (updateSections(), (isScrolling = !1));
      }),
      (isScrolling = !0)),
      window.scrollY > 80
        ? mainNav.classList.add("scrolled")
        : mainNav.classList.remove("scrolled"));
  },
  { passive: !0 },
),
  window.addEventListener(
    "resize",
    () => {
      updateSections();
    },
    { passive: !0 },
  ));
