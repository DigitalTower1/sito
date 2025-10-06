(() => {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  function toggleBodyScroll(disabled) {
    document.body.style.overflow = disabled ? "hidden" : "";
  }

  function closeMobileMenu() {
    if (hamburger) {
      hamburger.classList.remove("active");
    }
    if (mobileMenu) {
      mobileMenu.classList.remove("active");
    }
    toggleBodyScroll(false);
  }

  function toggleMobileSubmenu(trigger) {
    trigger.classList.toggle("active");
    const submenu = trigger.nextElementSibling;
    if (submenu) {
      submenu.classList.toggle("active");
    }
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isActive = mobileMenu.classList.toggle("active");
      hamburger.classList.toggle("active", isActive);
      toggleBodyScroll(isActive);
    });
  }

  window.closeMobileMenu = closeMobileMenu;
  window.toggleMobileSubmenu = toggleMobileSubmenu;
})();
