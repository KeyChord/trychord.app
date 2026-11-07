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
- Edit the package browser in `src/routes/packages.tsx` and `src/styles/packages.css`. It uses the same curated catalog as Settings → Browse in the app. After regenerating the app's catalog, run `bun run packages:import` to refresh the checked-in `src/data/official-packages.json`. This import requires the sibling Chord repository; installation, development, and builds do not.
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

The site deploys as the **`chord-website` Cloudflare Worker** at **https://trychord.app**, with documentation under `/docs`. `wrangler.jsonc` defines the account, domain route, compatibility settings, and observability.

Pushing to `prod` deploys it. Changes land on `main`, and `.github/workflows/deploy.yaml` builds and deploys whatever commit `prod` points to. Each Worker version's message names its commit. To put `main` live:

```sh
jj bookmark set prod -r main && jj git push -b prod
```

The workflow reads `CLOUDFLARE_API_TOKEN` from the repository's `production` environment, which only `prod` can use. The token comes from Cloudflare's "Edit Cloudflare Workers" template, limited to the `leonsilicon` account and the `trychord.app` zone. To roll back, push an older commit to `prod` or run `bunx wrangler rollback <version>`.

To deploy from your machine instead:

```sh
bunx wrangler login
bun run deploy
```

`build` runs Vite on Bun by its file path, not as `bun --bun vite`. Given a package's command, `--bun` puts a `node` that is really Bun first on `PATH`, and prerendering starts `wrangler dev`, which answers every request with a 503 under Bun ([oven-sh/bun#39247](https://github.com/oven-sh/bun/issues/39247)). So prerendering needs Node to be installed.

`deploy` builds the app, prerenders its pages, and publishes the Worker and static assets. The `trychord.app/*` route sends the existing proxied domain to the Worker, with HTTPS provided by Cloudflare. Keep the apex DNS record proxied: the route uses it to receive requests.

Nitro uses the `cloudflare_module` preset and generates `.output/server/wrangler.json` plus `.wrangler/deploy/config.json`. Wrangler automatically follows this generated deployment configuration. The server entry, asset binding, and deployment paths come from Nitro; edit the root `wrangler.jsonc`, not the generated files.

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
