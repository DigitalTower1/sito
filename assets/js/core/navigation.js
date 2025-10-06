const hamburger = document.getElementById("hamburger"),
  mobileMenu = document.getElementById("mobileMenu");
function closeMobileMenu() {
  (hamburger?.classList.remove("active"),
    mobileMenu?.classList.remove("active"),
    (document.body.style.overflow = ""));
}
function toggleMobileSubmenu(el) {
  el.classList.toggle("active");
  const submenu = el.nextElementSibling;
  submenu && submenu.classList.toggle("active");
}
hamburger?.addEventListener("click", () => {
  (hamburger.classList.toggle("active"),
    mobileMenu.classList.toggle("active"),
    (document.body.style.overflow = mobileMenu.classList.contains("active")
      ? "hidden"
      : ""));
});
