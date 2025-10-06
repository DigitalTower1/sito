(() => {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const audio = window.uiSound || null;

  function toggleBodyScroll(disabled) {
    document.body.style.overflow = disabled ? "hidden" : "";
  }

  function closeMobileMenu() {
    const wasActive = mobileMenu && mobileMenu.classList.contains("active");
    if (hamburger) {
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
    if (mobileMenu) {
      mobileMenu.classList.remove("active");
    }
    toggleBodyScroll(false);
    if (audio && wasActive) {
      audio.play("menu-close");
    }
  }

  function toggleMobileSubmenu(trigger) {
    trigger.classList.toggle("active");
    const submenu = trigger.nextElementSibling;
    if (submenu) {
      submenu.classList.toggle("active");
    }
  }

  function handleOutsideClick(event) {
    if (!mobileMenu || !hamburger) {
      return;
    }
    if (!mobileMenu.classList.contains("active")) {
      return;
    }
    if (mobileMenu.contains(event.target) || hamburger.contains(event.target)) {
      return;
    }
    closeMobileMenu();
  }

  if (hamburger && mobileMenu) {
    hamburger.setAttribute("role", "button");
    hamburger.setAttribute("tabindex", "0");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.addEventListener("click", () => {
      const isActive = mobileMenu.classList.toggle("active");
      hamburger.classList.toggle("active", isActive);
      hamburger.setAttribute("aria-expanded", isActive ? "true" : "false");
      toggleBodyScroll(isActive);
      if (audio) {
        audio.play(isActive ? "menu-open" : "menu-close");
      }
    });
    hamburger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        hamburger.click();
      }
    });
    document.addEventListener("click", handleOutsideClick, true);
    document.addEventListener("touchstart", handleOutsideClick, {
      passive: true,
      capture: true,
    });
  }

  window.closeMobileMenu = closeMobileMenu;
  window.toggleMobileSubmenu = toggleMobileSubmenu;
})();
