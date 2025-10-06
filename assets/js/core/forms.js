(() => {
  const contactForm = document.getElementById("contactForm");

  function showConfirmation(submitButton, originalText) {
    const modal = document.createElement("div");
    modal.style.cssText = [
      "position:fixed",
      "top:50%",
      "left:50%",
      "transform:translate(-50%,-50%)",
      "background:linear-gradient(135deg,rgba(13,27,42,0.98),rgba(10,14,20,1))",
      "border:2px solid var(--orange)",
      "padding:2.5rem",
      "border-radius:10px",
      "text-align:center",
      "z-index:10000",
      "box-shadow:0 20px 60px rgba(0,0,0,0.9),0 0 40px rgba(255,107,53,0.5)",
    ].join(";");

    modal.innerHTML = [
      '<h3 style="color:var(--gold);margin-bottom:1rem;font-size:1.5rem;text-shadow:0 0 20px rgba(255,107,53,0.6)">Grazie!</h3>',
      '<p style="color:var(--white);margin-bottom:1.5rem">Ti contatteremo presto.</p>',
      '<button type="button" style="background:linear-gradient(135deg,var(--orange),var(--gold));color:#000;border:none;padding:0.8rem 1.5rem;border-radius:4px;cursor:pointer;font-weight:bold;box-shadow:0 4px 15px rgba(255,107,53,0.5)">OK</button>',
    ].join("");

    const dismissButton = modal.querySelector("button");
    dismissButton?.addEventListener("click", () => {
      modal.remove();
    });

    document.body.appendChild(modal);

    window.setTimeout(() => {
      if (modal.parentElement) {
        modal.remove();
      }
    }, 3000);

    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector(".form-submit");
      if (!submitButton) {
        return;
      }

      const originalText = submitButton.textContent || "Invia";
      submitButton.textContent = "Invio...";
      submitButton.disabled = true;

      window.setTimeout(() => {
        contactForm.reset();
        showConfirmation(submitButton, originalText);
      }, 1500);
    });
  }
})();
