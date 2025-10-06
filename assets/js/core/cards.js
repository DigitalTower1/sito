function toggleVault(card) {
  const isOpen = card.classList.contains("flipped"),
    allCards = document.querySelectorAll(
      ".vault-card, .service-card, .team-card, .testimonial-card, .blog-card",
    );
  if (isOpen) {
    (card.classList.remove("flipped"),
      cardOverlay.classList.remove("active"),
      document
        .querySelector(".slider-wrapper")
        .parentElement.classList.remove("cards-dimmed"),
      (document.body.style.overflow = ""));
  } else {
    (allCards.forEach((c) => c.classList.remove("flipped")),
      card.classList.add("flipped"),
      cardOverlay.classList.add("active"),
      card
        .closest(".slider-wrapper")
        .parentElement.classList.add("cards-dimmed"),
      (document.body.style.overflow = "hidden"));
  }
}

function toggleCard(card) {
  toggleVault(card);
}

cardOverlay.addEventListener("click", () => {
  (document
    .querySelectorAll(
      ".vault-card, .service-card, .team-card, .testimonial-card, .blog-card",
    )
    .forEach((c) => c.classList.remove("flipped")),
    cardOverlay.classList.remove("active"),
    document
      .querySelectorAll(".slider-container")
      .forEach((c) => c.classList.remove("cards-dimmed")),
    (document.body.style.overflow = ""));
});
