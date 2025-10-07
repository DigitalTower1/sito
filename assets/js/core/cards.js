(() => {
  const vaultCards = Array.from(document.querySelectorAll(".vault-card"));
  const overlay = document.getElementById("cardOverlay");
  if (!vaultCards.length) {
    return;
  }

  const audio = window.uiSound || null;
  let activeCard = null;

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

  function openCard(card) {
    if (activeCard && activeCard !== card) {
      closeCard(activeCard);
    }
    card.classList.add("is-active");
    card.classList.add("is-unlocked");
    card.classList.remove("is-muted");
    card.setAttribute("aria-expanded", "true");
    dimGroup(card, true);
    activeCard = card;
    if (overlay) {
      overlay.classList.add("active");
      overlay.removeAttribute("hidden");
    }
    document.body.classList.add("card-open");
    if (audio) {
      audio.play("card-flip");
    }
  }

  function closeCard(card) {
    card.classList.remove("is-active");
    card.classList.remove("is-hovered");
    card.classList.remove("is-unlocked");
    card.setAttribute("aria-expanded", "false");
    dimGroup(card, false);
    if (audio && activeCard === card) {
      audio.play("card-close");
    }
    if (activeCard === card) {
      activeCard = null;
    }
    if (!activeCard) {
      document.body.classList.remove("card-open");
      if (overlay) {
        overlay.classList.remove("active");
        overlay.setAttribute("hidden", "");
      }
    }
  }

  function toggleCard(card) {
    if (card.classList.contains("is-active")) {
      closeCard(card);
    } else {
      openCard(card);
    }
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
      if (event.target.closest("a")) {
        return;
      }
      toggleCard(card);
    });

    card.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "touch") {
          skipNextClick = true;
          if (!event.target.closest("a")) {
            toggleCard(card);
          }
        }
      },
      { passive: true },
    );

    card.addEventListener("mouseenter", () => {
      card.classList.add("is-hovered");
      if (!card.classList.contains("is-active")) {
        dimGroup(card, true);
      }
      if (audio && !card.classList.contains("is-active")) {
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
        toggleCard(card);
      } else if (event.key === "Escape" && card.classList.contains("is-active")) {
        event.stopPropagation();
        closeCard(card);
      }
    });
  }

  vaultCards.forEach(bindCard);

  document.addEventListener("click", (event) => {
    if (activeCard && !event.target.closest(".vault-card")) {
      closeCard(activeCard);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeCard) {
      closeCard(activeCard);
    }
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      if (activeCard) {
        closeCard(activeCard);
      }
    });
  }
})();
