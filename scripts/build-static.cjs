const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {
    calculateRuntimeVersion,
    versionRuntimeReferences,
} = require("./runtime-version.cjs");

const projectRoot = path.resolve(__dirname, "..");
const indexPath = path.join(projectRoot, "index.html");
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const dataFiles = [
    "organization.js",
    "profile.js",
    "news.js",
    "research.js",
    "competition.js",
    "education.js",
    "experience.js",
];

function loadHomepageData() {
    const context = vm.createContext({ window: {} });

    for (const fileName of dataFiles) {
        const filePath = path.join(projectRoot, "data", fileName);
        const source = fs.readFileSync(filePath, "utf8");
        vm.runInContext(source, context, { filename: filePath });
    }

    return context.window.HOMEPAGE_DATA;
}

function indentBlock(html, indentation) {
    const lines = html
        .replace(/^\s*\n/, "")
        .replace(/\n\s*$/, "")
        .split("\n");
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
    const minimumIndent = Math.min(
        ...nonEmptyLines.map((line) => line.match(/^\s*/)[0].length),
    );

    return lines
        .map((line) =>
            line.trim().length > 0
                ? indentation + line.slice(minimumIndent)
                : "",
        )
        .join("\n");
}

function replaceGeneratedBlock(document, sectionId, html) {
    const startMarker = `<!-- STATIC-CONTENT:${sectionId}:START -->`;
    const endMarker = `<!-- STATIC-CONTENT:${sectionId}:END -->`;
    const start = document.indexOf(startMarker);
    const end = document.indexOf(endMarker);

    if (start === -1 || end === -1 || end < start) {
        throw new Error(`Missing static-content markers for ${sectionId}.`);
    }

    const contentStart = start + startMarker.length;
    const generated = `\n${indentBlock(html, "      ")}\n      `;
    return document.slice(0, contentStart) + generated + document.slice(end);
}

function escapeAttribute(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function renderMetadata(profileData, version) {
    const metadata = profileData.metadata;
    const title = `${profileData.name} | ${profileData.chineseName}`;
    const imageUrl = new URL(profileData.avatar, metadata.siteUrl);
    imageUrl.searchParams.set("v", version);
    const email = profileData.links.find((link) =>
        link.url.startsWith("mailto:"),
    );
    const sameAs = profileData.links
        .map((link) => link.url)
        .filter((url) => /^https?:\/\//i.test(url));
    const person = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: profileData.name,
        alternateName: profileData.chineseName,
        url: metadata.siteUrl,
        image: imageUrl.href,
        ...(email ? { email: email.url } : {}),
        jobTitle: metadata.jobTitle,
        affiliation: {
            "@type": "CollegeOrUniversity",
            ...metadata.affiliation,
        },
        worksFor: {
            "@type": "Organization",
            ...metadata.worksFor,
        },
        hasOccupation: {
            "@type": "Occupation",
            name: metadata.occupation.name,
            occupationLocation: {
                "@type": "City",
                name: metadata.occupation.location,
            },
        },
        alumniOf: {
            "@type": "CollegeOrUniversity",
            ...metadata.alumniOf,
        },
        sameAs,
    };
    const structuredData = JSON.stringify(person, null, 2).replaceAll(
        "<",
        "\\u003c",
    );

    return `<meta name="author" content="${escapeAttribute(title)}">
<meta name="description" content="${escapeAttribute(metadata.description)}">
<title>${escapeAttribute(title)}</title>
<link rel="canonical" href="${escapeAttribute(metadata.siteUrl)}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${escapeAttribute(title)}">
<meta property="og:description" content="${escapeAttribute(metadata.description)}">
<meta property="og:url" content="${escapeAttribute(metadata.siteUrl)}">
<meta property="og:image" content="${escapeAttribute(imageUrl.href)}">
<meta property="og:image:width" content="${profileData.avatarWidth}">
<meta property="og:image:height" content="${profileData.avatarHeight}">
<meta property="og:image:alt" content="${escapeAttribute(profileData.avatarAlt)}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeAttribute(title)}">
<meta name="twitter:description" content="${escapeAttribute(metadata.description)}">
<meta name="twitter:image" content="${escapeAttribute(imageUrl.href)}">
<meta name="twitter:image:alt" content="${escapeAttribute(profileData.avatarAlt)}">
<script type="application/ld+json">
${structuredData}
</script>`;
}

function renderSitemap(siteUrl) {
    const homepageUrl = new URL(siteUrl).href;
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeAttribute(homepageUrl)}</loc>
  </url>
</urlset>
`;
}

function replaceMetadataBlock(document, html) {
    const startMarker = "<!-- STATIC-METADATA:START -->";
    const endMarker = "<!-- STATIC-METADATA:END -->";
    const start = document.indexOf(startMarker);
    const end = document.indexOf(endMarker);

    if (start === -1 || end === -1 || end < start) {
        throw new Error("Missing static metadata markers.");
    }

    const contentStart = start + startMarker.length;
    const generated = `\n${indentBlock(html, "  ")}\n  `;
    return document.slice(0, contentStart) + generated + document.slice(end);
}

function build() {
    const data = loadHomepageData();
    const renderers = require(path.join(projectRoot, "render-templates.js"));
    const currentVersion = calculateRuntimeVersion(projectRoot);
    renderers.setAssetVersion(currentVersion);
    const blocks = {
        about: renderers.profile(data.profile),
        news: renderers.news(data.news),
        research: renderers.research(data.research, { enhanced: false }),
        education: renderers.institutions(
            data.education,
            "Education",
            "education-list",
        ),
        experience: renderers.institutions(
            data.experience,
            "Experience",
            "experience-list",
        ),
        competitions: renderers.competitions(data.competitions, {
            enhanced: false,
        }),
    };

    const original = fs.readFileSync(indexPath, "utf8");
    const withMetadata = replaceMetadataBlock(
        original,
        renderMetadata(data.profile, currentVersion),
    );
    const withContent = Object.entries(blocks).reduce(
        (document, [sectionId, html]) =>
            replaceGeneratedBlock(document, sectionId, html),
        withMetadata,
    );
    const { document: generated, version } = versionRuntimeReferences(
        withContent,
        projectRoot,
    );
    const generatedSitemap = renderSitemap(data.profile.metadata.siteUrl);
    const originalSitemap = fs.existsSync(sitemapPath)
        ? fs.readFileSync(sitemapPath, "utf8")
        : "";

    if (process.argv.includes("--check")) {
        if (generated !== original || generatedSitemap !== originalSitemap) {
            console.error(
                "Generated site files are out of date. Run: node scripts/build-static.cjs",
            );
            process.exitCode = 1;
            return;
        }
        console.log(
            `index.html, sitemap.xml, and site version ${version} are up to date.`,
        );
        return;
    }

    if (generated === original && generatedSitemap === originalSitemap) {
        console.log("Generated site files are already up to date.");
        return;
    }

    if (generated !== original) fs.writeFileSync(indexPath, generated, "utf8");
    if (generatedSitemap !== originalSitemap) {
        fs.writeFileSync(sitemapPath, generatedSitemap, "utf8");
    }
    console.log(
        `Generated static homepage content and sitemap with site version ${version}.`,
    );
}

build();
