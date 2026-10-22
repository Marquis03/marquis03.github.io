# Jue Hou — Academic Homepage

Personal academic website for Jue Hou (侯爵).

Website: https://marquis03.github.io/

## Local preview

Open `index.html` directly in a browser. The website uses static HTML, CSS, and JavaScript, with local images, fonts, and icons. No installation or build step is required for local viewing.

The committed `index.html` also contains a generated static copy of the page content. This lets search crawlers and browsers without JavaScript read the homepage while preserving direct `file://` viewing.

The page includes:

- A biography and contact links.
- Selected research, with a switch to the complete publication list.
- Competition results, education, and experience.
- Responsive navigation and enlarged publication figures.

External paper, project, code, and profile links require an internet connection. The local page requires JavaScript but has no installation or build step.

## Editing

- `data/profile.js`: name, biography, avatar, and profile links.
- `data/news.js`: news entries and the number shown before folding.
- `data/research.js`: papers, authors, links, and highlighted status.
- `data/competitions.js`: competition results, ranks, awards, and bonuses.
- `data/education.js`: education history.
- `data/experience.js`: internships and work experience.
- `index.html`: page structure and section order only.
- `render-content.js`: converts the structured data into page markup.
- `render-templates.js`: shared markup templates used by both the browser and the static generator.
- `scripts/build-static.cjs`: regenerates the static content stored in `index.html`.
- `stylesheet.css`: layout, typography, colors, and responsive styles.
- `navigation.js`: section navigation.
- `interactions.js`: highlight toggles and figure preview.
- `assets/`: local fonts, icons, images, logos, and competition certificates.

The data files use plain JavaScript objects instead of fetched JSON so the site
continues to work when `index.html` is opened directly from the filesystem.

After editing a file in `data/`, regenerate the committed static HTML:

```powershell
node scripts/build-static.cjs
```

To verify that `index.html` matches the current data without changing files:

```powershell
node scripts/build-static.cjs --check
```

To verify generated sections and local asset links:

```powershell
node scripts/check-site.cjs
```

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` regenerates
`index.html`, assembles the static site, and deploys it to GitHub Pages whenever
the `main` branch is pushed. It can also be run manually from the Actions tab.

In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
