# Fizz Kidz Website

Public Fizz Kidz marketing website built with Astro, React, Tailwind CSS, and Storyblok. Netlify hosts the site and its scheduled build function.

## Development

Run commands from the monorepo root:

| Command                               | Purpose                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `vp install`                          | Install all workspace dependencies.                                          |
| `npm run website`                     | Start Astro at `http://localhost:4321`.                                      |
| `npm --workspace website run check`   | Run Astro diagnostics.                                                       |
| `npm run check`                       | Run the fast shared oxfmt, Oxlint, type-aware lint, and TypeScript 7 checks. |
| `npm run check:astro`                 | Run Astro diagnostics for both Netlify workspaces.                           |
| `npm run verify:full`                 | Run Astro diagnostics, shared fixes/checks, and tests.                       |
| `npm run build --workspace website`   | Run Astro diagnostics and create the Netlify production build.               |
| `npm --workspace website run preview` | Preview the production output locally.                                       |

The shared Vite+ configuration owns formatting and linting. Do not add a package-local Prettier or ESLint configuration. oxfmt and oxlint handle supported source/config files; `astro check` validates `.astro` files and generated Astro types.

## Environment

Local development expects `apps/website/.env`. The application currently reads:

- `STORYBLOK_TOKEN`
- `PUBLIC_UPLOADTHING_TOKEN`
- `NETLIFY_TOKEN`

Configure production and deploy-preview values in the existing Netlify site. Environment files remain untracked.

## Deployment

Netlify should use:

- Base directory: unset (repository root)
- Package directory: `apps/website`
- Build and publish settings: `apps/website/netlify.toml`

The `ignore` command in `netlify.toml` skips builds and deploy previews unless `apps/website` changed. Scheduled builds triggered by the Netlify build hook intentionally bypass this check.
