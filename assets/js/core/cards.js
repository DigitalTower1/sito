(() => {
  const overlay = document.getElementById("cardOverlay");
  const vaultCards = Array.from(document.querySelectorAll(".vault-card"));
  const audio = window.uiSound || null;
  let activeCard = null;
  let unlockTimeout = null;

  function setActiveCardMetrics(card) {
    if (!card) {
      return;
    }
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const horizontalPadding = viewportWidth <= 640 ? 32 : viewportWidth <= 1024 ? 96 : 140;
    const verticalPadding = viewportHeight <= 720 ? 56 : 160;
    const width = Math.max(280, Math.min(viewportWidth - horizontalPadding, 780));
    const height = Math.max(340, Math.min(viewportHeight - verticalPadding, 840));
    card.style.setProperty("--vault-active-width", `${width}px`);
    card.style.setProperty("--vault-active-height", `${height}px`);
  }

  function dimGroup(target, dimmed) {
    const group = target.dataset.vaultGroup || "global";
    vaultCards.forEach((card) => {
      if (card === target) {
        return;
      }
      if ((card.dataset.vaultGroup || "global") === group) {
        card.classList.toggle("is-muted", dimmed);
      }
    });
  }

  function unlockCard(card) {
    card.classList.add("is-unlocked");
    if (unlockTimeout) {
      window.clearTimeout(unlockTimeout);
    }
    unlockTimeout = window.setTimeout(() => {
      unlockTimeout = null;
    }, 450);
  }

  function lockCard(card) {
    if (unlockTimeout) {
      window.clearTimeout(unlockTimeout);
      unlockTimeout = null;
    }
    window.setTimeout(() => {
      card.classList.remove("is-unlocked");
    }, 300);
  }

  function closeActiveCard() {
    if (!activeCard) {
      return;
    }
    activeCard.classList.remove("is-active");
    activeCard.setAttribute("aria-expanded", "false");
    activeCard.style.removeProperty("--vault-active-width");
    activeCard.style.removeProperty("--vault-active-height");
    lockCard(activeCard);
    dimGroup(activeCard, false);
    activeCard = null;
    if (overlay) {
      overlay.classList.remove("active");
    }
    document.body.classList.remove("card-open");
    document.documentElement.classList.remove("card-open");
    if (audio) {
      audio.play("card-close");
    }
  }

  function focusCard(card) {
    if (activeCard === card) {
      closeActiveCard();
      return;
    }
    if (activeCard) {
      closeActiveCard();
    }
    unlockCard(card);
    setActiveCardMetrics(card);
    card.classList.add("is-active");
    card.setAttribute("aria-expanded", "true");
    dimGroup(card, true);
    if (overlay) {
      overlay.classList.add("active");
    }
    document.body.classList.add("card-open");
    document.documentElement.classList.add("card-open");
    activeCard = card;
    const closeButton = card.querySelector(".vault-close");
    const contentFace = card.querySelector(".vault-face.vault-content");
    if (contentFace) {
      contentFace.scrollTop = 0;
    }
    if (closeButton) {
      try {
        closeButton.focus({ preventScroll: true });
      } catch (error) {
        closeButton.focus();
      }
    }
    if (audio) {
      audio.play("card-flip");
    }
  }

  function onCardClick(card, event) {
    const closeButton = event.target.closest(".vault-close");
    if (closeButton) {
      event.stopPropagation();
      closeActiveCard();
      return;
    }
    const link = event.target.closest("a");
    if (link) {
      return;
    }
    focusCard(card);
  }

  function bindCard(card) {
    if (!card.dataset.vaultGroup) {
      card.dataset.vaultGroup = "global";
    }
    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
    }
    card.setAttribute("aria-expanded", "false");

    let skipNextClick = false;

    card.addEventListener("click", (event) => {
      if (skipNextClick) {
        skipNextClick = false;
        return;
      }
      onCardClick(card, event);
    });

    card.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "touch") {
          skipNextClick = true;
          onCardClick(card, event);
        }
      },
      { passive: true },
    );

    card.addEventListener("mouseenter", () => {
      card.classList.add("is-hovered");
      dimGroup(card, true);
      if (audio) {
        audio.play("card-hover");
      }
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-hovered");
      if (!card.classList.contains("is-active")) {
        dimGroup(card, false);
      }
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        focusCard(card);
      }
    });
  }

  vaultCards.forEach(bindCard);

  if (overlay) {
    overlay.addEventListener("click", closeActiveCard);
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeActiveCard();
    }
  });

  window.addEventListener(
    "resize",
    () => {
      if (activeCard) {
        setActiveCardMetrics(activeCard);
      }
    },
    { passive: true },
  );

  window.addEventListener(
    "orientationchange",
    () => {
      if (activeCard) {
        setActiveCardMetrics(activeCard);
      }
    },
    { passive: true },
  );

  window.closeActiveCard = closeActiveCard;
})();
