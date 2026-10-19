(function initHighlightToggles() {
  function createToggle(config) {
    const button = document.getElementById(config.buttonId);
    const heading = document.getElementById(config.headingId);
    const status = document.getElementById(config.statusId);
    const items = Array.from(document.querySelectorAll(config.itemSelector));
    if (!button || !heading || items.length === 0) return;

    let showAll = false;
    function update(announce) {
      items.forEach(function (item) {
        item.hidden = !showAll && item.dataset.highlight !== "true";
        item.classList.remove("is-last-visible");
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
    }
    button.addEventListener("click", function () { showAll = !showAll; update(true); });
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
