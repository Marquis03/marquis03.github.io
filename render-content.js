(function renderHomepage() {
    const data = window.HOMEPAGE_DATA || {};
    const renderers = window.HOMEPAGE_RENDERERS;

    if (!renderers) {
        console.error("Homepage render templates are unavailable.");
        return;
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function renderSafely(sectionId, dataKey, render) {
        const section = byId(sectionId);
        const sectionData = data[dataKey];
        if (!section || sectionData === undefined || sectionData === null) {
            console.warn("Missing homepage data:", dataKey);
            return;
        }

        try {
            section.innerHTML = render(sectionData);
        } catch (error) {
            console.error("Failed to render homepage section:", sectionId, error);
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

    renderSafely("about", "profile", renderers.profile);
    renderSafely("news", "news", renderers.news);
    renderSafely("research", "research", (entries) =>
        renderers.research(entries, { enhanced: true }),
    );
    renderSafely("competition", "competitions", (entries) =>
        renderers.competitions(entries, { enhanced: true }),
    );
    renderSafely("education", "education", (entries) =>
        renderers.institutions(entries, "Education", "education-list", {
            filterable: true,
            enhanced: true,
        }),
    );
    renderSafely("experience", "experience", (entries) =>
        renderers.institutions(entries, "Experience", "experience-list"),
    );
    configureLinkTargets();
})();
