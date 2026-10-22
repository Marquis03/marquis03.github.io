(function initHighlightToggles() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function createToggle(config) {
    const button = document.getElementById(config.buttonId);
    const heading = document.getElementById(config.headingId);
    const status = document.getElementById(config.statusId);
    const items = Array.from(document.querySelectorAll(config.itemSelector));
    if (!button || !heading || items.length === 0) return;

    let showAll = false;
    function update(announce) {
      const enteringItems = [];
      items.forEach(function (item) {
        const wasHidden = item.hidden;
        const shouldHide = !showAll && item.dataset.highlight !== "true";
        item.hidden = shouldHide;
        item.classList.remove("is-last-visible", "filter-item-enter");
        item.style.removeProperty("--filter-enter-delay");
        if (announce && showAll && wasHidden && !shouldHide && !reducedMotion.matches) {
          enteringItems.push(item);
        }
      });
      const visibleItems = items.filter(function (item) { return !item.hidden; });
      if (visibleItems.length) visibleItems[visibleItems.length - 1].classList.add("is-last-visible");
      heading.textContent = showAll ? "All " + config.label : "Highlight " + config.label;
      button.textContent = showAll ? "Highlight " + config.label : "All " + config.label;
      button.setAttribute("aria-expanded", String(showAll));
      if (announce && status) {
        const count = visibleItems.length;
        status.textContent = "Showing " + count + (showAll ? " total " : " highlighted ") + config.label.toLowerCase() + ".";
      }
      enteringItems.forEach(function (item, index) {
        item.style.setProperty("--filter-enter-delay", Math.min(index * 25, 125) + "ms");
        item.classList.add("filter-item-enter");
      });
    }
    button.addEventListener("click", function () {
      showAll = !showAll;
      update(true);
    });
    update(false);
    button.hidden = false;
  }

  createToggle({ buttonId: "research-toggle", headingId: "research-heading", statusId: "research-status", itemSelector: "#research-papers .paper-row", label: "Research" });
  createToggle({ buttonId: "competition-toggle", headingId: "competition-heading", statusId: "competition-status", itemSelector: "#competition-list .competition-row", label: "Competition" });
})();

(function initFigurePreview() {
  const dialog = document.getElementById("figure-dialog");
  const image = document.getElementById("figure-image");
  const caption = document.getElementById("figure-caption");
  if (!dialog || typeof dialog.showModal !== "function") return;

  let trigger = null;
  document.querySelectorAll("a[data-figure]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      image.src = link.href;
      image.alt = link.querySelector("img").alt;
      caption.textContent = link.dataset.caption;
      dialog.showModal();
    });
  });

  dialog.addEventListener("click", function (event) {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", function () {
    if (trigger) trigger.focus({ preventScroll: true });
  });
})();

(function initScrollReveal() {
  const items = Array.from(document.querySelectorAll("[data-reveal] [data-reveal-item]"))
    .filter(function (item) { return !item.hidden && item.getClientRects().length > 0; });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (items.length === 0 || reducedMotion.matches || !window.IntersectionObserver) return;

  const initialItems = [];
  const scrollItems = [];

  items.forEach(function (item) {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      initialItems.push(item);
    } else {
      item.classList.add("reveal-pending");
      scrollItems.push(item);
    }
  });

  initialItems.forEach(function (item, index) {
    item.style.setProperty("--reveal-delay", Math.min(140 + index * 40, 300) + "ms");
    item.classList.add("reveal-initial");
    item.addEventListener("animationend", function finishInitialReveal(event) {
      if (event.target !== item || event.animationName !== "reveal-item-enter") return;
      item.classList.remove("reveal-initial");
      item.style.removeProperty("--reveal-delay");
      item.removeEventListener("animationend", finishInitialReveal);
    });
  });

  const observer = new IntersectionObserver(function (entries) {
    const entering = entries
      .filter(function (entry) { return entry.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });

    entering.forEach(function (entry, index) {
      entry.target.style.setProperty("--reveal-delay", Math.min(index * 35, 105) + "ms");
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.02,
    rootMargin: "0px 0px -2% 0px"
  });

  scrollItems.forEach(function (item) {
    observer.observe(item);
  });

  reducedMotion.addEventListener("change", function (event) {
    if (!event.matches) return;
    observer.disconnect();
    items.forEach(function (item) {
      item.classList.remove("reveal-pending", "reveal-initial");
      item.style.removeProperty("--reveal-delay");
    });
  });
})();
