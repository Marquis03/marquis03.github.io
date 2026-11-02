(function exposeHomepageRenderers(root, factory) {
    const renderers = factory(root);

    if (typeof module === "object" && module.exports) {
        module.exports = renderers;
    }

    if (root) {
        root.HOMEPAGE_RENDERERS = renderers;
    }
})(typeof window !== "undefined" ? window : null, function createRenderers(root) {
    let assetVersion = "";

    if (root && root.document && root.document.currentScript) {
        try {
            assetVersion = new URL(root.document.currentScript.src).searchParams.get("v") || "";
        } catch (_) {
            assetVersion = "";
        }
    }

    function setAssetVersion(value) {
        assetVersion = String(value || "");
    }

    function escapeText(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function escapeAttribute(value) {
        return escapeText(value);
    }

    function assetUrl(value) {
        const url = String(value);
        if (!assetVersion || !url.startsWith("assets/")) return url;
        return `${url.split("?", 1)[0]}?v=${encodeURIComponent(assetVersion)}`;
    }

    function assetAttribute(value) {
        return escapeAttribute(assetUrl(value));
    }

    // Rich HTML fields are authored in data files. Only their local asset URLs
    // are rewritten here; all other values use the escaping helpers above.
    function trustedHtml(value) {
        return String(value).replace(
            /(\b(?:href|src)=")(assets\/[^"?#]+)(?:\?v=[^"#]*)?(")/g,
            (_match, prefix, url, suffix) =>
                `${prefix}${assetAttribute(url)}${suffix}`,
        );
    }

    function dateTime(value) {
        return escapeAttribute(String(value).replace(".", "-"));
    }

    function profile(profileData) {
        return `
      <div>
        <h1 class="name">
          ${escapeText(profileData.name)}
          <span class="name-divider">/</span>
          <span class="chinese-name" lang="zh-CN">${escapeText(profileData.chineseName)}</span>
        </h1>
        ${profileData.bio.map((text) => `<p class="profile-intro">${trustedHtml(text)}</p>`).join("")}
        <div class="profile-links">
          ${profileData.links
              .map(
                  (link) => `
            <a class="profile-link" href="${assetAttribute(link.url)}">
              <img class="profile-link-icon" src="${assetAttribute(`assets/icons/${link.icon}`)}" alt="" aria-hidden="true">
              ${escapeText(link.label)}
            </a>
          `,
              )
              .join("")}
        </div>
      </div>
      <figure class="profile-portrait">
        <img class="avatar" src="${assetAttribute(profileData.avatar)}" alt="${escapeAttribute(profileData.avatarAlt)}" width="${profileData.avatarWidth}" height="${profileData.avatarHeight}" fetchpriority="high">
        <figcaption class="portrait-caption">${trustedHtml(profileData.caption)}</figcaption>
      </figure>
    `;
    }

    function newsItems(entries) {
        return entries
            .map(
                (item) => `
      <li data-reveal-item>
        <time datetime="${dateTime(item.date)}">${escapeText(item.date)}</time>
        <p>${trustedHtml(item.content)}</p>
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
      <a class="link-with-icon" href="${assetAttribute(link.url)}">
        <img src="${assetAttribute(`assets/icons/${link.icon}`)}" alt="" aria-hidden="true">
        ${escapeText(link.label)}
      </a>
    `,
            )
            .join("");
    }

    function research(entries, options) {
        const enhanced = options && options.enhanced;
        const papers = entries
            .map(
                (paper) => `
      <article
        class="paper-row"
        data-selected="${paper.selected}"
        data-reveal-item
        ${enhanced && !paper.selected ? "hidden" : ""}
      >
        <a class="paper-figure" href="${assetAttribute(paper.image)}" data-figure data-caption="${escapeAttribute(paper.title)}" aria-label="Preview figure for ${escapeAttribute(paper.title)}">
          <img src="${assetAttribute(paper.image)}" alt="" aria-hidden="true" width="${paper.imageWidth}" height="${paper.imageHeight}" decoding="async">
        </a>
        <div>
          <h3 class="papertitle"><a href="${assetAttribute(paper.url)}">${escapeText(paper.title)}</a></h3>
          <p class="authors">${trustedHtml(paper.authors)}</p>
          <p class="venue-full">${escapeText(paper.venue)}</p>
          <div class="paper-links-group">${researchLinks(paper.links)}</div>
        </div>
      </article>
    `,
            )
            .join("");

        return `
      <header class="section-heading research-heading" data-reveal-item>
        <h2 class="section-title" id="research-heading">${enhanced ? "Research" : "All Research"}</h2>
        <button class="research-toggle" id="research-toggle" type="button" aria-controls="research-papers" hidden>View all</button>
      </header>
      <p class="paper-meta-note" data-reveal-item>* Equal contribution &nbsp; † Corresponding author</p>
      <p class="sr-only" id="research-status" role="status" aria-live="polite"></p>
      <div id="research-papers">${papers}</div>
    `;
    }

    function competitionDetails(item) {
        return [
            item.result &&
                `<span><span aria-hidden="true">${escapeText(item.medal || "🏅")}</span>${escapeText(item.result)}</span>`,
            item.rank &&
                `<span><span aria-hidden="true">📈</span>${escapeText(item.rank)}</span>`,
            item.bonus &&
                `<span><span aria-hidden="true">💰</span>${escapeText(item.bonus)}</span>`,
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
        class="record-row competition-row"
        data-selected="${item.selected}"
        data-reveal-item
        ${enhanced && !item.selected ? "hidden" : ""}
      >
        <a class="record-logo" href="${assetAttribute(item.url)}" aria-label="${escapeAttribute(item.name)}">
          <img src="${assetAttribute(`assets/images/logos/${item.logo}`)}" alt="" width="${item.logoWidth}" height="${item.logoHeight}" decoding="async">
        </a>
        <div class="record-content">
          <div class="record-heading">
            <h3 class="record-title">
              <a href="${assetAttribute(item.url)}">${escapeText(item.name)}</a>
            </h3>
            <time class="record-date" datetime="${dateTime(item.date)}">${escapeText(item.date)}</time>
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
        <h2 class="section-title" id="competition-heading">${enhanced ? "Competition" : "All Competition"}</h2>
        <button class="research-toggle" id="competition-toggle" type="button" aria-controls="competition-list" hidden>View all</button>
      </header>
      <p class="sr-only" id="competition-status" role="status" aria-live="polite"></p>
      <div id="competition-list">${records}</div>
    `;
    }

    function periodMarkup(period) {
        const parts = period.split(" – ");
        const start = parts[0];
        const end = parts[1];
        const startMarkup = `<time datetime="${dateTime(start)}">${escapeText(start)}</time>`;

        if (!end) return startMarkup;
        const endMarkup =
            end === "Present"
                ? escapeText(end)
                : `<time datetime="${dateTime(end)}">${escapeText(end)}</time>`;
        return `${startMarkup} – ${endMarkup}`;
    }

    function institutionRows(entries) {
        return entries
            .map((item) => {
                const logo = item.url
                    ? `
          <a class="record-logo" href="${assetAttribute(item.url)}" aria-label="${escapeAttribute(item.institution)}">
            <img src="${assetAttribute(`assets/images/logos/${item.logo}`)}" alt="" width="${item.logoWidth}" height="${item.logoHeight}" decoding="async">
          </a>
        `
                    : `
          <div class="record-logo">
            <img src="${assetAttribute(`assets/images/logos/${item.logo}`)}" alt="${escapeAttribute(item.institution)}" width="${item.logoWidth}" height="${item.logoHeight}" decoding="async">
          </div>
        `;
                const name = item.url
                    ? `<a href="${assetAttribute(item.url)}">${escapeText(item.institution)}</a>`
                    : escapeText(item.institution);

                return `
        <div
          class="record-row"
          data-reveal-item
        >
          ${logo}
          <div class="record-content">
            <div class="record-heading">
              <h3 class="record-title">${name}</h3>
              <p class="record-date">${periodMarkup(item.period)}</p>
            </div>
            <div class="record-meta">
              <p class="record-details">${escapeText(item.detail)}</p>
              <p class="record-location">${escapeText(item.location)}</p>
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
        <h2 class="section-title">${escapeText(title)}</h2>
      </header>
      <div id="${escapeAttribute(listId)}">${institutionRows(entries)}</div>
    `;
    }

    return {
        competitions,
        institutions,
        news,
        profile,
        research,
        setAssetVersion,
    };
});
