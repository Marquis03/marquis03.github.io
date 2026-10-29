const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const runtimeFiles = [
    "data/organizations.js",
    "data/profile.js",
    "data/news.js",
    "data/research.js",
    "data/competitions.js",
    "data/education.js",
    "data/experience.js",
    "render-templates.js",
    "render-content.js",
    "navigation.js",
    "interactions.js",
];

function calculateRuntimeVersion(projectRoot) {
    const hash = crypto.createHash("sha256");

    for (const relativePath of runtimeFiles) {
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

    return { document, version };
}

module.exports = {
    calculateRuntimeVersion,
    runtimeFiles,
    versionRuntimeReferences,
};
