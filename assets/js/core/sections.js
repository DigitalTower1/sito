const sections = Array.from(document.querySelectorAll("section"));
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
