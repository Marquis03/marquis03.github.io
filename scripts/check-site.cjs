const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const indexPath = path.join(projectRoot, "index.html");
const stylesheetPath = path.join(projectRoot, "stylesheet.css");
const html = fs.readFileSync(indexPath, "utf8");
const stylesheet = fs.readFileSync(stylesheetPath, "utf8");

const references = [
    ...Array.from(html.matchAll(/(?:href|src)="([^"]+)"/g), (match) =>
        match[1],
    ),
    ...Array.from(stylesheet.matchAll(/url\(["']?([^"')]+)["']?\)/g), (match) =>
        match[1],
    ),
];

const localReferences = references.filter(
    (reference) =>
        reference &&
        !reference.startsWith("#") &&
        !reference.startsWith("//") &&
        !/^[a-z][a-z0-9+.-]*:/i.test(reference),
);

const missing = [];
for (const reference of new Set(localReferences)) {
    const cleanReference = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    const filePath = path.resolve(projectRoot, cleanReference);
    const insideProject =
        filePath === projectRoot || filePath.startsWith(projectRoot + path.sep);

    if (!insideProject || !fs.existsSync(filePath)) {
        missing.push(reference);
    }
}

const generatedSections = [
    "about",
    "news",
    "research",
    "education",
    "experience",
    "competitions",
];
for (const sectionId of generatedSections) {
    const startMarker = `<!-- STATIC-CONTENT:${sectionId}:START -->`;
    const endMarker = `<!-- STATIC-CONTENT:${sectionId}:END -->`;
    const content = html.split(startMarker)[1]?.split(endMarker)[0]?.trim();
    if (!content) missing.push(`generated content for ${sectionId}`);
}

if (missing.length > 0) {
    console.error("Site validation failed. Missing:");
    for (const reference of missing) console.error(`- ${reference}`);
    process.exitCode = 1;
} else {
    console.log(
        `Site validation passed (${new Set(localReferences).size} local references).`,
    );
}
