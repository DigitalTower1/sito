const vaultCards = Array.from(
    document.querySelectorAll(
      ".vault-card, .service-card, .team-card, .testimonial-card, .blog-card",
    ),
  ),
  overlay = document.getElementById("cardOverlay");
let activeCard = null;
const hasAudioContext =
  typeof window.AudioContext !== "undefined" ||
  typeof window.webkitAudioContext !== "undefined";
let audioContext = null;
function ensureAudioContext() {
  if (!hasAudioContext) return null;
  return (
    audioContext || (audioContext = new (window.AudioContext || window.webkitAudioContext)())
  );
}
function playFlipSound() {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime,
    osc = ctx.createOscillator(),
    gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(340, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}
function setGroupState(targetCard, muted) {
  const group = targetCard.dataset.vaultGroup;
  vaultCards.forEach((card) => {
    if (card === targetCard) return;
    card.classList.toggle("is-muted", muted && card.dataset.vaultGroup === group);
  });
}
function focusCard(card) {
  if (activeCard === card) {
    releaseCard();
    return;
  }
  vaultCards.forEach((c) => {
    c.classList.remove("flipped", "vault-card-active");
  });
  card.classList.add("flipped", "vault-card-active");
  setGroupState(card, !0);
  overlay.classList.add("active");
  document.body.classList.add("card-open");
  document.documentElement.classList.add("card-open");
  document.body.style.overflow = "hidden";
  activeCard = card;
  playFlipSound();
}
function releaseCard() {
  activeCard = null;
  vaultCards.forEach((c) => {
    c.classList.remove("flipped", "vault-card-active", "is-muted");
  });
  overlay.classList.remove("active");
  document.body.classList.remove("card-open");
  document.documentElement.classList.remove("card-open");
  document.body.style.overflow = "";
}
function attachCardListeners(card) {
  if (!card.getAttribute("onclick")) {
    card.addEventListener("click", (event) => {
      const innerLinks = card.querySelectorAll("a, button");
      for (const link of innerLinks) {
        if (link.contains(event.target)) {
          return;
        }
      }
      focusCard(card);
    });
  }
  if (!card.hasAttribute("tabindex")) {
    card.setAttribute("tabindex", "0");
  }
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      focusCard(card);
    }
  });
  card.addEventListener("mouseenter", () => {
    card.classList.add("is-hovered");
    setGroupState(card, !0);
    playFlipSound();
  });
  card.addEventListener("mouseleave", () => {
    card.classList.remove("is-hovered");
    if (!card.classList.contains("flipped")) {
      setGroupState(card, !1);
    }
  });
}
function initVaultCards() {
  if (!vaultCards.length) return;
  vaultCards.forEach((card) => {
    if (!card.dataset.vaultGroup) {
      card.dataset.vaultGroup = "global";
    }
    card.classList.add("vault-card");
    attachCardListeners(card);
  });
}
overlay &&
  overlay.addEventListener("click", () => {
    releaseCard();
  });
window.addEventListener("keyup", (event) => {
  "Escape" === event.key && activeCard && releaseCard();
});
window.addEventListener("scroll", () => {
  activeCard && releaseCard();
});
initVaultCards();
window.toggleCard = focusCard;
window.closeActiveCard = releaseCard;
