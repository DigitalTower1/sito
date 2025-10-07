(() => {
  const articleContainer = document.getElementById("blogArticles");
  if (!articleContainer) {
    return;
  }

  const searchInput = document.getElementById("blogSearch");
  const categorySelect = document.getElementById("blogCategory");
  const tagButtons = Array.from(document.querySelectorAll(".blog-tag"));
  const resetButton = document.getElementById("blogReset");
  const emptyState = document.getElementById("blogEmpty");
  const articles = Array.from(articleContainer.querySelectorAll("[data-article]"));

  const activeTags = new Set();

  function normalise(text) {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function matchesFilters(article) {
    const category = categorySelect ? categorySelect.value : "all";
    const query = searchInput ? normalise(searchInput.value.trim()) : "";
    const articleCategory = article.dataset.category || "all";
    const tags = (article.dataset.tags || "")
      .split(",")
      .map((tag) => normalise(tag.trim()))
      .filter(Boolean);
    const searchable = normalise(article.dataset.search || article.textContent || "");

    const categoryMatch = category === "all" || articleCategory === category;
    const tagsMatch =
      !activeTags.size || Array.from(activeTags).every((tag) => tags.includes(tag));
    const searchMatch = !query || searchable.includes(query);

    return categoryMatch && tagsMatch && searchMatch;
  }

  function updateArticles() {
    let visibleCount = 0;
    articles.forEach((article) => {
      const isVisible = matchesFilters(article);
      article.classList.toggle("is-hidden", !isVisible);
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  tagButtons.forEach((button) => {
    const tagValue = normalise(button.dataset.tag || "");
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      if (!tagValue) {
        return;
      }
      const isActive = button.getAttribute("aria-pressed") === "true";
      if (isActive) {
        button.setAttribute("aria-pressed", "false");
        activeTags.delete(tagValue);
      } else {
        button.setAttribute("aria-pressed", "true");
        activeTags.add(tagValue);
      }
      updateArticles();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      updateArticles();
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      updateArticles();
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      activeTags.clear();
      tagButtons.forEach((button) => {
        button.setAttribute("aria-pressed", "false");
      });
      if (searchInput) {
        searchInput.value = "";
      }
      if (categorySelect) {
        categorySelect.value = "all";
      }
      updateArticles();
    });
  }

  updateArticles();
})();
