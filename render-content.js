(function renderHomepage() {
    const data = window.HOMEPAGE_DATA || {};

    function byId(id) {
        return document.getElementById(id);
    }

    function dateTime(value) {
        return String(value).replace(".", "-");
    }

    function hideSection(sectionId) {
        const section = byId(sectionId);
        if (section) {
            section.hidden = true;
            section.removeAttribute("data-nav-section");
        }

        const navLink = document.querySelector(
            '.section-nav__link[href="#' + sectionId + '"]',
        );
        if (navLink && navLink.parentElement)
            navLink.parentElement.hidden = true;
    }

    function renderSafely(sectionId, dataKey, render) {
        const sectionData = data[dataKey];
        if (sectionData === undefined || sectionData === null) {
            console.warn("Missing homepage data:", dataKey);
            hideSection(sectionId);
            return;
        }

        try {
            render(sectionData);
        } catch (error) {
            console.error(
                "Failed to render homepage section:",
                sectionId,
                error,
            );
            hideSection(sectionId);
        }
    }

    function configureLinkTargets() {
        document.querySelectorAll("a[href]").forEach((link) => {
            const href = link.getAttribute("href").trim();
            const staysInCurrentContext =
                !href ||
                href.startsWith("#") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:");

            if (staysInCurrentContext) return;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        });
    }

    function renderProfile(profile) {
        byId("about").innerHTML = `
      <div>
        <h1 class="name">
          ${profile.name}
          <span class="name-divider">/</span>
          <span class="chinese-name" lang="zh-CN">${profile.chineseName}</span>
        </h1>
        ${profile.bio.map((text) => `<p class="profile-intro">${text}</p>`).join("")}
        <div class="profile-links">
          ${profile.links
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
        <img class="avatar" src="${profile.avatar}" alt="${profile.avatarAlt}" width="1080" height="1080">
        <figcaption class="portrait-caption">${profile.caption}</figcaption>
      </figure>
    `;
    }

    function newsItems(entries) {
        return entries
            .map(
                (item) => `
      <li>
        <time datetime="${dateTime(item.date)}">${item.date}</time>
        <p>${item.content}</p>
      </li>
    `,
            )
            .join("");
    }

    function renderNews(news) {
        const visibleEntries = news.entries.slice(0, news.visibleCount);
        const archivedEntries = news.entries.slice(news.visibleCount);
        const archive = document.querySelector(".news-archive");

        byId("news-list").innerHTML = newsItems(visibleEntries);
        byId("news-more").innerHTML = newsItems(archivedEntries);
        byId("news-more-label").textContent = "More updates";
        archive.hidden = archivedEntries.length === 0;
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

    function renderResearch(entries) {
        const orderedResearch = entries
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date));

        byId("research-papers").innerHTML = orderedResearch
            .map(
                (paper) => `
      <article
        class="paper-row ${paper.highlight ? "highlight-paper" : ""}"
        data-highlight="${paper.highlight}"
        ${paper.highlight ? "" : "hidden"}
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

    function renderCompetitions(entries) {
        const orderedCompetitions = entries
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date));

        byId("competition-list").innerHTML = orderedCompetitions
            .map(
                (item) => `
      <article
        class="record-row competition-row ${item.highlight ? "highlight-paper" : ""}"
        data-highlight="${item.highlight}"
        ${item.highlight ? "" : "hidden"}
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

    function renderInstitutions(entries, listId) {
        byId(listId).innerHTML = entries
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
        <div class="record-row">
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

    renderSafely("about", "profile", renderProfile);
    renderSafely("news", "news", renderNews);
    renderSafely("research", "research", renderResearch);
    renderSafely("competitions", "competitions", renderCompetitions);
    renderSafely("education", "education", (entries) =>
        renderInstitutions(entries, "education-list"),
    );
    renderSafely("experience", "experience", (entries) =>
        renderInstitutions(entries, "experience-list"),
    );
    configureLinkTargets();
})();
