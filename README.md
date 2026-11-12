# Zodiac Engine documentation

React + TypeScript + Vite documentation site, with light and dark themes.
The content, page titles, table of contents and search index are derived from
the Markdown files in `docs/`. There is no content API or database.

## Development

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/zodiac-engine-docs/`. The theme follows the system
preference on first visit and remembers a manually selected theme. Search is
available from the header or with Ctrl/Cmd+K.

```sh
npm test
npm run build
npm run preview
```

For browser checks, install Chromium once with `npx playwright install chromium`,
then run `npm run test:e2e`.

## Content

- Add or edit Markdown under `docs/`; pages and search entries are discovered
  automatically, including nested design documents.
- `docs/index.md` supplies the home page through validated YAML frontmatter
  (hero, version, calls to action, cards), followed by ordinary Markdown.
- `docs/project/releases.md` supplies an editorial release page: hero, highlights,
  illustrated feature sections, navigation and calls to action live in validated
  YAML frontmatter; the changelog remains ordinary Markdown. Illustrations are
  explanatory diagrams, not engine screenshots. Existing changelog anchors,
  including `#zengine-100`, remain available.
- Relative `.md` links are resolved against their source file, including heading
  anchors. Markdown tables, task lists, highlighted code, Mermaid diagrams,
  safe inline HTML, and existing Material admonitions are supported.
- Category ordering and navigation labels live in `src/navigation.ts`.
- Files in `public/` are served unchanged. Hero artwork is cropped from the two
  supplied theme mockups, without their interface text.

The original documentation was imported from
[`RendererEngine`, commit `47fa940`](https://github.com/JeanPhilippeKernel/RendererEngine/tree/47fa9402d83d1c1de568826ac9ac2d0bf7387a97/docs).
This repository now owns a local Markdown snapshot: upstream updates do not
replace it automatically. Edit links still point to the original engine
documentation. Import any future upstream content changes deliberately, keeping
the React home page frontmatter.

Tetragrama's home cards and the `Editor` section have been removed. The three
`docs/editor/` pages are no longer published or indexed; references to the editor
inside other technical and historical documents are retained.

## GitHub Pages

The build emits `dist/`, a sitemap, a 404 entry, and HTML entry points at every
document's existing directory URL, so direct links and reloads work on static
hosting. Legacy URLs for the editor-grid, gizmo, and thumbnail proposals also
remain available after their move into completed designs. Vite's default base is `/zodiac-engine-docs/`; set `VITE_BASE_PATH=/` for
root hosting, or set another directory base with leading and trailing slashes.

In repository **Settings → Pages**, select **GitHub Actions** as the source.
`.github/workflows/deploy.yml` builds and deploys pushes to `gh-pages`. Serve only
`dist/`, not the source branch. Any upstream workflow that previously force-pushed
MkDocs output into this repository must be disabled or retargeted before deploying
this replacement; otherwise it will overwrite the React project.
