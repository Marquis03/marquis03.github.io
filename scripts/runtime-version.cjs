const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const runtimeFiles = [
    "data/organization.js",
    "data/profile.js",
    "data/news.js",
    "data/research.js",
    "data/competition.js",
    "data/education.js",
    "data/experience.js",
    "render-templates.js",
    "render-content.js",
    "navigation.js",
    "interactions.js",
];

const versionedEntryFiles = [...runtimeFiles, "stylesheet.css"];

function listFilesRecursively(directory) {
    if (!fs.existsSync(directory)) return [];

    return fs
        .readdirSync(directory, { withFileTypes: true })
        .flatMap((entry) => {
            const entryPath = path.join(directory, entry.name);
            return entry.isDirectory()
                ? listFilesRecursively(entryPath)
                : [entryPath];
        })
        .sort((left, right) => left.localeCompare(right));
}

function versionSourceFiles(projectRoot) {
    const assetFiles = listFilesRecursively(path.join(projectRoot, "assets"))
        .map((filePath) => path.relative(projectRoot, filePath).replaceAll(path.sep, "/"));
    return [...versionedEntryFiles, ...assetFiles];
}

function calculateRuntimeVersion(projectRoot) {
    const hash = crypto.createHash("sha256");

    for (const relativePath of versionSourceFiles(projectRoot)) {
        hash.update(relativePath);
        hash.update("\0");
        hash.update(fs.readFileSync(path.join(projectRoot, relativePath)));
        hash.update("\0");
    }

    return hash.digest("hex").slice(0, 12);
}

function versionRuntimeReferences(document, projectRoot) {
    const version = calculateRuntimeVersion(projectRoot);

    for (const relativePath of runtimeFiles) {
        const escapedPath = relativePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp(
            `(\\bsrc=")${escapedPath}(?:\\?v=[^"]*)?(")`,
            "g",
        );
        let replacements = 0;

        document = document.replace(pattern, (_match, prefix, suffix) => {
            replacements += 1;
            return `${prefix}${relativePath}?v=${version}${suffix}`;
        });

        if (replacements !== 1) {
            throw new Error(
                `Expected one runtime script reference for ${relativePath}, found ${replacements}.`,
            );
        }
    }

    document = document.replace(
        /(\bhref=")stylesheet\.css(?:\?v=[^"]*)?(")/g,
        `$1stylesheet.css?v=${version}$2`,
    );

    document = document.replace(
        /(\b(?:href|src)=")(assets\/[^"?#]+)(?:\?v=[^"#]*)?(")/g,
        `$1$2?v=${version}$3`,
    );

    return { document, version };
}

module.exports = {
    calculateRuntimeVersion,
    runtimeFiles,
    versionedEntryFiles,
    versionRuntimeReferences,
};
