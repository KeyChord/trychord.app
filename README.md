# Chord website

A standalone documentation app built with TanStack Start, Fumadocs, MDX, Tailwind CSS, and Bun. Scaffolded with the official `create-fumadocs-app` TanStack Start template. It installs and deploys independently of the Chord application and sibling packages.

## Development

Run these commands from `KeyChord/website` with Bun installed:

```sh
bun install --frozen-lockfile
bun run dev
```

Open the URL Vite prints. The default port is 3000; Vite selects another port if it is busy. The landing page is at `/`, the official package catalog is at `/packages`, and the documentation is at `/docs`.

```sh
bun run types:check
bun run build
bun run start
```

`start` and `preview` run the production build in Cloudflare's local Workers runtime through Wrangler, on port 8787 by default. Use `bun run preview --port 4321` to choose another port. The Vite scripts use Bun for local development and builds; deployed requests run on Cloudflare Workers.

## Content and navigation

- Add MDX pages under `content/docs`, with `title` and `description` frontmatter.
- Order pages and folders with the adjacent `meta.json` files.
- Edit site styles in `src/styles/app.css`.
- Edit the landing page in `src/components/lp/`; `src/routes/index.tsx` only mounts it. Its layout and interactions follow [homerow.app](https://www.homerow.app/). The page is styled with Tailwind v3 class names from a fixed, pre-compiled stylesheet scoped under `.lp` in `src/styles/landing.css`, and `app.css` excludes the folder from the site's Tailwind v4 scan. Use only utilities that already exist in that stylesheet, and write anything else as plain CSS at the end of the file. The carousel's animated scenes are in `scenes.tsx`, the chords you can try on the page are defined in `home.tsx`, and the hero's guided first chord is in `tutorial.tsx`.
- Edit site navigation in `src/lib/layout.shared.tsx` and app/GitHub information in `src/lib/shared.ts`.
- Edit the package browser in `src/routes/packages.tsx` and `src/styles/packages.css`. The `/api/packages` Worker route reads the `@keychord` directory of the public `KeyChord/chords` repository and caches the package names for five minutes. The icon grid loads the catalog at runtime and reads a package’s description from its manifest when opened. See `src/data/package-artwork.json` for icon and label overrides.
- `.source/` and `src/routeTree.gen.ts` are generated. Do not edit them by hand.

Fumadocs provides full-text search at `/api/search`, per-page Markdown at `/docs/index.md` and `/docs/<slug>.md`, `/llms.txt`, `/llms-full.txt`, and dynamic OG images at `/og/docs/<slug>/image.webp` (or `/og/docs/image.webp` for the introduction).

Documentation navigation resolves bundled Fumadocs frontmatter locally and downloads only the selected MDX content. Visible links preload their pages, and loaded pages are reused between navigations because documentation only changes on deployment. Keep this loader client-safe; a server function for page metadata adds an unnecessary round trip to every uncached navigation. Pending navigation shows a progress bar and documentation placeholder immediately.

## Existing manuals

Five existing Markdown documents are copied in full, with only frontmatter and local link adjustments:

| Original in `KeyChord/`          | Website page                                        |
| -------------------------------- | --------------------------------------------------- |
| `Chord/readme.md`                | `content/docs/reference/chord-manual.mdx`           |
| `Chord/scripting.md`             | `content/docs/developers/scripting.mdx`             |
| `create-chord-package/readme.md` | `content/docs/developers/create-package.mdx`        |
| `config/readme.md`               | `content/docs/developers/package-configuration.mdx` |
| `chords/readme.md`               | `content/docs/reference/chord-packages.mdx`         |

When those originals change, run `bun run docs:import` from this directory to refresh the copies. This command requires the sibling repositories and overwrites the five imported pages. Edit their originals first. Installation, development, and production builds use the checked-in MDX files and do not need sibling repositories.

## Deployment

Changes land on `main`. Push to `staging` to deploy `chord-website-staging` at **https://staging.trychord.app**, or to `prod` to deploy `chord-website` at **https://trychord.app**. The staging site links to the desktop beta downloads. The desktop release workflow redeploys the matching site after publishing.

Each Worker version's message names its commit. To promote `main` to staging:

```sh
jj bookmark set staging -r main && jj git push -b staging
```

To promote a tested staging commit to production:

```sh
jj bookmark set prod -r staging && jj git push -b prod
```

The workflow reads `CLOUDFLARE_API_TOKEN` from the GitHub environment for the deploy. The `staging` environment allows the `staging` branch and the `production` environment allows `prod`. To roll back a deployment, select the corresponding Worker and version in Cloudflare.

To deploy from your machine instead:

```sh
bunx wrangler login
VITE_CHORD_CHANNEL=staging bun run deploy
```

`build` runs Vite on Bun by its file path, not as `bun --bun vite`. Given a package's command, `--bun` puts a `node` that is really Bun first on `PATH`, and prerendering starts `wrangler dev`, which answers every request with a 503 under Bun ([oven-sh/bun#39247](https://github.com/oven-sh/bun/issues/39247)). So prerendering needs Node to be installed.

`deploy` builds the app, prerenders its pages, and publishes the Worker and static assets. The production build uses the existing `trychord.app/*` route. The staging build uses a Cloudflare Custom Domain at `staging.trychord.app`.

Nitro uses the `cloudflare_module` preset and generates `.output/server/wrangler.json` plus `.wrangler/deploy/config.json`. Shared Worker settings come from `wrangler.jsonc` and `vite.config.ts` selects the deployment target at build time. Wrangler follows the generated configuration.

Pages, fonts, and client bundles are served as Cloudflare assets. Requests to `/docs` and `/docs/*` pass through the Worker first so Markdown content negotiation still works. Search, Markdown exports, and the LLM endpoints run on Workers. OG images use Takumi's WebAssembly backend, with no native add-ons in the deployment.

Useful checks after configuration changes:

```sh
bun run build
bun run cf:types
bun run types:check
bunx wrangler deploy --dry-run
bun run preview
```

Worker types are generated in `worker-configuration.d.ts`. Local Wrangler state, generated build files, and local secrets are ignored by Git. No application secrets or storage bindings are needed.

For Cloudflare Workers Builds, use `website` as the project root when connecting the parent workspace, `bun run build` as the build command, and `bunx wrangler deploy` as the deploy command. When this directory is its own repository, use the repository root instead.
