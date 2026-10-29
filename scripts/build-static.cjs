const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const indexPath = path.join(projectRoot, "index.html");
const dataFiles = [
    "profile.js",
    "news.js",
    "research.js",
    "competitions.js",
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

function renderMetadata(profileData) {
    const metadata = profileData.metadata;
    const title = `${profileData.name} | ${profileData.chineseName}`;
    const imageUrl = new URL(profileData.avatar, metadata.siteUrl).href;
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
        image: imageUrl,
        ...(email ? { email: email.url } : {}),
        jobTitle: metadata.jobTitle,
        affiliation: {
            "@type": "CollegeOrUniversity",
            ...metadata.affiliation,
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
<meta property="og:image" content="${escapeAttribute(imageUrl)}">
<meta property="og:image:width" content="${profileData.avatarWidth}">
<meta property="og:image:height" content="${profileData.avatarHeight}">
<meta property="og:image:alt" content="${escapeAttribute(profileData.avatarAlt)}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeAttribute(title)}">
<meta name="twitter:description" content="${escapeAttribute(metadata.description)}">
<meta name="twitter:image" content="${escapeAttribute(imageUrl)}">
<meta name="twitter:image:alt" content="${escapeAttribute(profileData.avatarAlt)}">
<script type="application/ld+json">
${structuredData}
</script>`;
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
    const blocks = {
        about: renderers.profile(data.profile),
        news: renderers.news(data.news),
        research: renderers.research(data.research, { enhanced: false }),
        education: renderers.institutions(
            data.education,
            "Education",
            "education-list",
            { filterable: true, enhanced: false },
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
        renderMetadata(data.profile),
    );
    const generated = Object.entries(blocks).reduce(
        (document, [sectionId, html]) =>
            replaceGeneratedBlock(document, sectionId, html),
        withMetadata,
    );

    if (process.argv.includes("--check")) {
        if (generated !== original) {
            console.error(
                "index.html is out of date. Run: node scripts/build-static.cjs",
            );
            process.exitCode = 1;
            return;
        }
        console.log("index.html static content is up to date.");
        return;
    }

    if (generated === original) {
        console.log("index.html static content is already up to date.");
        return;
    }

    fs.writeFileSync(indexPath, generated, "utf8");
    console.log("Generated static homepage content in index.html.");
}

build();
