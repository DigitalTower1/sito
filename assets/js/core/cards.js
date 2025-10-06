(() => {
  const overlay = document.getElementById("cardOverlay");
  const vaultCards = Array.from(
    document.querySelectorAll(
      ".vault-card, .service-card, .team-card, .testimonial-card, .blog-card",
    ),
  );

  const audio = window.uiSound || null;
  let activeCard = null;

  function setGroupState(targetCard, muted) {
    const group = targetCard.dataset.vaultGroup || "global";
    vaultCards.forEach((card) => {
      if (card === targetCard) {
        return;
      }
      const shouldMute = muted && card.dataset.vaultGroup === group;
      card.classList.toggle("is-muted", shouldMute);
    });
  }

  function releaseCard() {
    activeCard = null;
    vaultCards.forEach((card) => {
      card.classList.remove("flipped", "vault-card-active", "is-muted");
    });
    if (overlay) {
      overlay.classList.remove("active");
    }
    document.body.classList.remove("card-open");
    document.documentElement.classList.remove("card-open");
    document.body.style.overflow = "";
    if (audio) {
      audio.play("card-close");
    }
  }

  function focusCard(card) {
    if (activeCard === card) {
      releaseCard();
      return;
    }

    vaultCards.forEach((item) => {
      item.classList.remove("flipped", "vault-card-active");
    });

    card.classList.add("flipped", "vault-card-active");
    setGroupState(card, true);

    if (overlay) {
      overlay.classList.add("active");
    }
    document.body.classList.add("card-open");
    document.documentElement.classList.add("card-open");
    document.body.style.overflow = "hidden";

    activeCard = card;
    if (audio) {
      audio.play("card-flip");
    }
  }

  function attachCardListeners(card) {
    if (!card.dataset.vaultGroup) {
      card.dataset.vaultGroup = "global";
    }

    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
    }

    card.addEventListener("click", (event) => {
      if (card.dataset.touchActivated === "true") {
        card.dataset.touchActivated = "false";
        return;
      }
      const interactiveChildren = card.querySelectorAll("a, button");
      for (const child of interactiveChildren) {
        if (child.contains(event.target)) {
          return;
        }
      }
      focusCard(card);
    });

    card.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "touch") {
          const interactiveChildren = card.querySelectorAll("a, button");
          for (const child of interactiveChildren) {
            if (child.contains(event.target)) {
              return;
            }
          }
          card.dataset.touchActivated = "true";
          focusCard(card);
        }
      },
      { passive: true },
    );

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        focusCard(card);
      }
    });

    card.addEventListener("mouseenter", () => {
      card.classList.add("is-hovered");
      setGroupState(card, true);
      if (audio) {
        audio.play("card-hover");
      }
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-hovered");
      if (!card.classList.contains("flipped")) {
        setGroupState(card, false);
      }
    });
  }

  function initVaultCards() {
    if (!vaultCards.length) {
      return;
    }

    vaultCards.forEach((card) => {
      card.classList.add("vault-card");
      attachCardListeners(card);
    });
  }

  if (overlay) {
    overlay.addEventListener("click", releaseCard);
  }

  window.addEventListener("keyup", (event) => {
    if (event.key === "Escape" && activeCard) {
      releaseCard();
    }
  });

  window.addEventListener("scroll", () => {
    if (activeCard) {
      releaseCard();
    }
  });

  initVaultCards();

  window.toggleCard = focusCard;
  window.closeActiveCard = releaseCard;
})();
