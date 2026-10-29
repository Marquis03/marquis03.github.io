const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const indexPath = path.join(projectRoot, "index.html");
const stylesheetPath = path.join(projectRoot, "stylesheet.css");
const html = fs.readFileSync(indexPath, "utf8");
const stylesheet = fs.readFileSync(stylesheetPath, "utf8");
const errors = [];
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

function requireString(value, label) {
    if (typeof value !== "string" || value.trim() === "") {
        errors.push(`${label} must be a non-empty string`);
    }
}

function requirePositiveInteger(value, label) {
    if (!Number.isInteger(value) || value <= 0) {
        errors.push(`${label} must be a positive integer`);
    }
}

function requireBoolean(value, label) {
    if (typeof value !== "boolean") {
        errors.push(`${label} must be a boolean`);
    }
}

const monthPattern = /^\d{4}\.(0[1-9]|1[0-2])$/;
function requireMonth(value, label) {
    if (typeof value !== "string" || !monthPattern.test(value)) {
        errors.push(`${label} must use YYYY.MM format`);
    }
}

function requireDescending(entries, label) {
    for (let index = 1; index < entries.length; index += 1) {
        if (entries[index - 1].date.localeCompare(entries[index].date) < 0) {
            errors.push(`${label} must be sorted newest first`);
            return;
        }
    }
}

function validateInstitution(item, label, options = {}) {
    requireString(item.logo, `${label}.logo`);
    requirePositiveInteger(item.logoWidth, `${label}.logoWidth`);
    requirePositiveInteger(item.logoHeight, `${label}.logoHeight`);
    requireString(item.institution, `${label}.institution`);
    requireString(item.detail, `${label}.detail`);
    requireString(item.location, `${label}.location`);
    requireString(item.period, `${label}.period`);
    if (!/^\d{4}\.(0[1-9]|1[0-2]) – (Present|\d{4}\.(0[1-9]|1[0-2]))$/.test(item.period)) {
        errors.push(`${label}.period must use YYYY.MM – YYYY.MM or Present`);
    }
    if (item.url !== undefined) requireString(item.url, `${label}.url`);
    if (options.selected) requireBoolean(item.selected, `${label}.selected`);
}

function validateData(data) {
    const profile = data.profile;
    requireString(profile.name, "profile.name");
    requireString(profile.chineseName, "profile.chineseName");
    requireString(profile.avatar, "profile.avatar");
    requireString(profile.avatarAlt, "profile.avatarAlt");
    requirePositiveInteger(profile.avatarWidth, "profile.avatarWidth");
    requirePositiveInteger(profile.avatarHeight, "profile.avatarHeight");
    requireString(profile.metadata?.siteUrl, "profile.metadata.siteUrl");
    requireString(profile.metadata?.description, "profile.metadata.description");
    requireString(profile.metadata?.jobTitle, "profile.metadata.jobTitle");
    requireString(profile.metadata?.affiliation?.name, "profile.metadata.affiliation.name");
    requireString(profile.metadata?.affiliation?.url, "profile.metadata.affiliation.url");
    requireString(profile.metadata?.alumniOf?.name, "profile.metadata.alumniOf.name");
    requireString(profile.metadata?.alumniOf?.url, "profile.metadata.alumniOf.url");
    if (!Array.isArray(profile.bio) || profile.bio.length === 0) {
        errors.push("profile.bio must contain at least one paragraph");
    }
    if (!Array.isArray(profile.links) || profile.links.length === 0) {
        errors.push("profile.links must contain at least one link");
    }

    const news = data.news;
    if (!Number.isInteger(news.visibleCount) || news.visibleCount < 0 || news.visibleCount > news.entries.length) {
        errors.push("news.visibleCount must fit within news.entries");
    }
    news.entries.forEach((item, index) => {
        requireMonth(item.date, `news.entries[${index}].date`);
        requireString(item.content, `news.entries[${index}].content`);
    });
    requireDescending(news.entries, "news.entries");

    data.research.forEach((paper, index) => {
        const label = `research[${index}]`;
        requireString(paper.image, `${label}.image`);
        requirePositiveInteger(paper.imageWidth, `${label}.imageWidth`);
        requirePositiveInteger(paper.imageHeight, `${label}.imageHeight`);
        requireString(paper.title, `${label}.title`);
        requireString(paper.url, `${label}.url`);
        requireString(paper.authors, `${label}.authors`);
        requireString(paper.venue, `${label}.venue`);
        requireBoolean(paper.selected, `${label}.selected`);
        if (!Array.isArray(paper.links) || paper.links.length === 0) {
            errors.push(`${label}.links must contain at least one link`);
        } else {
            paper.links.forEach((link, linkIndex) => {
                requireString(link.label, `${label}.links[${linkIndex}].label`);
                requireString(link.url, `${label}.links[${linkIndex}].url`);
                requireString(link.icon, `${label}.links[${linkIndex}].icon`);
            });
        }
    });

    data.competitions.forEach((item, index) => {
        const label = `competitions[${index}]`;
        requireString(item.logo, `${label}.logo`);
        requirePositiveInteger(item.logoWidth, `${label}.logoWidth`);
        requirePositiveInteger(item.logoHeight, `${label}.logoHeight`);
        requireString(item.name, `${label}.name`);
        requireString(item.url, `${label}.url`);
        requireString(item.result, `${label}.result`);
        requireMonth(item.date, `${label}.date`);
        requireBoolean(item.selected, `${label}.selected`);
    });
    requireDescending(data.competitions, "competitions");

    data.education.forEach((item, index) =>
        validateInstitution(item, `education[${index}]`, { selected: true }),
    );
    data.experience.forEach((item, index) =>
        validateInstitution(item, `experience[${index}]`),
    );
}

const references = [
    ...Array.from(html.matchAll(/(?:href|src)="([^"]+)"/g), (match) => match[1]),
    ...Array.from(stylesheet.matchAll(/url\(["']?([^"')]+)["']?\)/g), (match) => match[1]),
];

const localReferences = references.filter(
    (reference) =>
        reference &&
        !reference.startsWith("#") &&
        !reference.startsWith("//") &&
        !/^[a-z][a-z0-9+.-]*:/i.test(reference),
);

for (const reference of new Set(localReferences)) {
    const cleanReference = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    const filePath = path.resolve(projectRoot, cleanReference);
    const insideProject = filePath === projectRoot || filePath.startsWith(projectRoot + path.sep);
    if (!insideProject || !fs.existsSync(filePath)) {
        errors.push(`missing local reference: ${reference}`);
    }
}

const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
for (const id of duplicateIds) errors.push(`duplicate HTML id: ${id}`);

const idSet = new Set(ids);
const hashTargets = Array.from(html.matchAll(/href="#([^"]+)"/g), (match) => match[1]);
for (const target of new Set(hashTargets)) {
    if (!idSet.has(target)) errors.push(`missing hash target: #${target}`);
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
    if (!content) errors.push(`missing generated content for ${sectionId}`);
}

const metadataContent = html
    .split("<!-- STATIC-METADATA:START -->")[1]
    ?.split("<!-- STATIC-METADATA:END -->")[0]
    ?.trim();
if (!metadataContent) errors.push("missing generated metadata");

const structuredData = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!structuredData) {
    errors.push("missing JSON-LD metadata");
} else {
    try {
        JSON.parse(structuredData[1]);
    } catch (error) {
        errors.push(`invalid JSON-LD metadata: ${error.message}`);
    }
}

try {
    validateData(loadHomepageData());
} catch (error) {
    errors.push(`unable to load homepage data: ${error.message}`);
}

if (errors.length > 0) {
    console.error("Site validation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
} else {
    console.log(
        `Site validation passed (${new Set(localReferences).size} local references, ${ids.length} unique IDs, data schema valid).`,
    );
}
