# Jue Hou — Academic Homepage

Personal academic website for Jue Hou (侯爵).

Website: https://marquis03.github.io/

## Local preview

Open `index.html` directly in a browser. The website uses static HTML, CSS, and JavaScript, with local images, fonts, and icons. No installation or build step is required for local viewing.

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
- `stylesheet.css`: layout, typography, colors, and responsive styles.
- `navigation.js`: section navigation.
- `interactions.js`: highlight toggles and figure preview.
- `assets/`: local fonts, icons, images, logos, and competition certificates.

The data files use plain JavaScript objects instead of fetched JSON so the site
continues to work when `index.html` is opened directly from the filesystem.

## Deployment

Serve or publish the directory as a static website. No build command is required.