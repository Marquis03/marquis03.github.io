(function exposeHomepageRenderers(root, factory) {
    const renderers = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = renderers;
    }

    if (root) {
        root.HOMEPAGE_RENDERERS = renderers;
    }
})(typeof window !== "undefined" ? window : null, function createRenderers() {
    function dateTime(value) {
        return String(value).replace(".", "-");
    }

    function profile(profileData) {
        return `
      <div>
        <h1 class="name">
          ${profileData.name}
          <span class="name-divider">/</span>
          <span class="chinese-name" lang="zh-CN">${profileData.chineseName}</span>
        </h1>
        ${profileData.bio.map((text) => `<p class="profile-intro">${text}</p>`).join("")}
        <div class="profile-links">
          ${profileData.links
              .map(
                  (link) => `
            <a class="profile-link" href="${link.url}">
              <img class="profile-link-icon" src="assets/icons/${link.icon}" alt="" aria-hidden="true">
              ${link.label}
            </a>
          `,
              )
              .join("")}
        </div>
      </div>
      <figure class="profile-portrait">
        <img class="avatar" src="${profileData.avatar}" alt="${profileData.avatarAlt}" width="1080" height="1080">
        <figcaption class="portrait-caption">${profileData.caption}</figcaption>
      </figure>
    `;
    }

    function newsItems(entries) {
        return entries
            .map(
                (item) => `
      <li data-reveal-item>
        <time datetime="${dateTime(item.date)}">${item.date}</time>
        <p>${item.content}</p>
      </li>
    `,
            )
            .join("");
    }

    function news(newsData) {
        const visibleEntries = newsData.entries.slice(0, newsData.visibleCount);
        const archivedEntries = newsData.entries.slice(newsData.visibleCount);

        return `
      <header class="section-heading" data-reveal-item>
        <h2 class="section-title">News</h2>
      </header>
      <ul class="news-list" id="news-list">${newsItems(visibleEntries)}</ul>
      <details class="news-archive" data-reveal-item${archivedEntries.length === 0 ? " hidden" : ""}>
        <summary id="news-more-label">More updates</summary>
        <ul class="news-list" id="news-more">${newsItems(archivedEntries)}</ul>
      </details>
    `;
    }

    function researchLinks(links) {
        return links
            .map(
                (link) => `
      <a class="link-with-icon" href="${link.url}">
        <img src="assets/icons/${link.icon}" alt="" aria-hidden="true">
        ${link.label}
      </a>
    `,
            )
            .join("");
    }

    function research(entries, options) {
        const enhanced = options && options.enhanced;
        const orderedResearch = entries
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date));

        const papers = orderedResearch
            .map(
                (paper) => `
      <article
        class="paper-row ${paper.highlight ? "highlight-paper" : ""}"
        data-highlight="${paper.highlight}"
        data-reveal-item
        ${enhanced && !paper.highlight ? "hidden" : ""}
      >
        <a class="paper-figure" href="${paper.image}" data-figure data-caption="${paper.title}">
          <img src="${paper.image}" alt="${paper.title}" loading="lazy">
        </a>
        <div>
          <h3 class="papertitle"><a href="${paper.url}">${paper.title}</a></h3>
          <p class="authors">${paper.authors}</p>
          <p class="venue-full">${paper.venue}</p>
          <div class="paper-links-group">${researchLinks(paper.links)}</div>
        </div>
      </article>
    `,
            )
            .join("");

        return `
      <header class="section-heading research-heading" data-reveal-item>
        <h2 class="section-title" id="research-heading">${enhanced ? "Highlight" : "All"} Research</h2>
        <button class="research-toggle" id="research-toggle" aria-controls="research-papers" hidden>All Research</button>
      </header>
      <p class="paper-meta-note" data-reveal-item>* Equal contribution &nbsp; † Corresponding author</p>
      <p class="sr-only" id="research-status" role="status" aria-live="polite"></p>
      <div id="research-papers">${papers}</div>
    `;
    }

    function competitionDetails(item) {
        return [
            item.result &&
                `<span><span aria-hidden="true">${item.medal || "🏅"}</span>${item.result}</span>`,
            item.rank &&
                `<span><span aria-hidden="true">📈</span>${item.rank}</span>`,
            item.bonus &&
                `<span><span aria-hidden="true">💰</span>${item.bonus}</span>`,
        ]
            .filter(Boolean)
            .join("");
    }

    function competitions(entries, options) {
        const enhanced = options && options.enhanced;
        const orderedCompetitions = entries
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date));

        const records = orderedCompetitions
            .map(
                (item) => `
      <article
        class="record-row competition-row ${item.highlight ? "highlight-paper" : ""}"
        data-highlight="${item.highlight}"
        data-reveal-item
        ${enhanced && !item.highlight ? "hidden" : ""}
      >
        <a class="record-logo" href="${item.url}" aria-label="${item.name}">
          <img src="assets/images/logos/${item.logo}" alt="" loading="lazy">
        </a>
        <div class="record-content">
          <div class="record-heading">
            <h3 class="record-title">
              <a href="${item.url}">${item.name}</a>
            </h3>
            <time class="record-date" datetime="${dateTime(item.date)}">${item.date}</time>
          </div>
          <div class="record-meta">
            <p class="record-details competition-details">${competitionDetails(item)}</p>
          </div>
        </div>
      </article>
    `,
            )
            .join("");

        return `
      <header class="section-heading research-heading" data-reveal-item>
        <h2 class="section-title" id="competition-heading">${enhanced ? "Highlight" : "All"} Competition</h2>
        <button class="research-toggle" id="competition-toggle" aria-controls="competition-list" hidden>All Competition</button>
      </header>
      <p class="sr-only" id="competition-status" role="status" aria-live="polite"></p>
      <div id="competition-list">${records}</div>
    `;
    }

    function periodMarkup(period) {
        const parts = period.split(" – ");
        const start = parts[0];
        const end = parts[1];
        const startMarkup = `<time datetime="${dateTime(start)}">${start}</time>`;

        if (!end) return startMarkup;
        const endMarkup =
            end === "Present"
                ? end
                : `<time datetime="${dateTime(end)}">${end}</time>`;
        return `${startMarkup} – ${endMarkup}`;
    }

    function institutionRows(entries) {
        return entries
            .map((item) => {
                const logo = item.url
                    ? `
          <a class="record-logo" href="${item.url}" aria-label="${item.institution}">
            <img src="assets/images/logos/${item.logo}" alt="" loading="lazy">
          </a>
        `
                    : `
          <div class="record-logo">
            <img src="assets/images/logos/${item.logo}" alt="${item.institution}" loading="lazy">
          </div>
        `;
                const name = item.url
                    ? `<a href="${item.url}">${item.institution}</a>`
                    : item.institution;

                return `
        <div class="record-row" data-reveal-item>
          ${logo}
          <div class="record-content">
            <div class="record-heading">
              <h3 class="record-title">${name}</h3>
              <p class="record-date">${periodMarkup(item.period)}</p>
            </div>
            <div class="record-meta">
              <p class="record-details">${item.detail}</p>
              <p class="record-location">${item.location}</p>
            </div>
          </div>
        </div>
      `;
            })
            .join("");
    }

    function institutions(entries, title, listId) {
        return `
      <header class="section-heading" data-reveal-item>
        <h2 class="section-title">${title}</h2>
      </header>
      <div id="${listId}">${institutionRows(entries)}</div>
    `;
    }

    return {
        competitions,
        institutions,
        news,
        profile,
        research,
    };
});
