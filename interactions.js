(function initSelectionToggles() {
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
        const shouldHide = !showAll && item.dataset.selected !== "true";
        item.hidden = shouldHide;
        item.classList.remove("is-last-visible", "filter-item-enter");
        item.style.removeProperty("--filter-enter-delay");
        if (announce && showAll && wasHidden && !shouldHide && !reducedMotion.matches) {
          enteringItems.push(item);
        }
      });
      const visibleItems = items.filter(function (item) { return !item.hidden; });
      if (visibleItems.length) visibleItems[visibleItems.length - 1].classList.add("is-last-visible");
      heading.textContent = showAll ? "All " + config.label : config.label;
      button.textContent = showAll ? "Show selected" : "View all";
      button.setAttribute("aria-label", (showAll ? "Show selected " : "View all ") + config.label.toLowerCase());
      button.setAttribute("aria-expanded", String(showAll));
      if (announce && status) {
        const count = visibleItems.length;
        status.textContent = showAll
          ? "Showing all " + count + " " + config.itemLabel + "."
          : "Showing " + count + " selected " + config.itemLabel + ".";
      }
      enteringItems.forEach(function (item, index) {
        item.style.setProperty("--filter-enter-delay", Math.min(index * 25, 125) + "ms");
        item.classList.add("filter-item-enter");
      });
    }
    button.addEventListener("click", function () {
      const headingTop = heading.getBoundingClientRect().top;
      showAll = !showAll;
      update(true);
      window.requestAnimationFrame(function preserveTogglePosition() {
        const offset = heading.getBoundingClientRect().top - headingTop;
        if (Math.abs(offset) > 1) window.scrollBy(0, offset);
      });
    });
    update(false);
    button.hidden = false;
  }

  createToggle({ buttonId: "research-toggle", headingId: "research-heading", statusId: "research-status", itemSelector: "#research-papers .paper-row", label: "Research", itemLabel: "research items" });
  createToggle({ buttonId: "competition-toggle", headingId: "competition-heading", statusId: "competition-status", itemSelector: "#competition-list .competition-row", label: "Competition", itemLabel: "competition entries" });
  createToggle({ buttonId: "education-list-toggle", headingId: "education-list-heading", statusId: "education-list-status", itemSelector: "#education-list .record-row", label: "Education", itemLabel: "education entries" });
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
      image.alt = link.dataset.caption;
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
