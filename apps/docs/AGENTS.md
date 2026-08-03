# Repository Guidelines

## Purpose & Audience

- Central knowledge base for Fizz Kidz staff and franchisees, covering every service, operational process, and the technology supporting them.
- Aim content at busy teams: document how-to steps, tooling context, and links to internal systems in one place.

## Project Structure & Module Organization

- Astro + Starlight site; edits belong under `src/` to leverage the build pipeline.
- Core documentation lives in `src/content/docs/`; each Markdown file becomes a route whose slug matches the filename.
- Shared imagery/downloads belong in `src/assets/` for imports or `public/` for direct serving.
- Update `src/content.config.ts` before adding new frontmatter fields or collections.

## Build, Test, and Development Commands

This app is a workspace in the Fizz Kidz Portal monorepo. Run these from the repository root:

- `vp install` installs or refreshes dependencies for every workspace.
- `npm run docs` starts the docs at `http://localhost:4321` with live reload.
- `npm run build --workspace docs` outputs the production bundle in `dist/` for deployment checks.
- `npm --workspace docs run preview` serves the built site locally to mirror hosting.
- `npm --workspace docs run check` runs Astro diagnostics for content and routing issues.
- `npm run check` runs the fast shared checks across supported files in every workspace.
- `npm run verify:full` runs both Astro checks, shared fixes/checks, and tests.

## Coding Style & Naming Conventions

- Formatting is owned by the monorepo's shared oxfmt config; run `vp check --fix` rather than a separate Prettier setup. Markdown and MDX keep two-space indentation because indentation is semantically significant there; TypeScript and config files follow the repository style (four-space, single quotes, no semicolons).
- Avoid trailing whitespace.
- Prefer descriptive, hyphenated doc filenames (`party-booking-flow.md`) and camelCase keys in data files like `src/shifts.json`.
- Keep headings sentence case and include concise frontmatter (`title`, `description`) defined in `content.config.ts`.
- Run `vp check --fix` from the repository root before committing.

## Testing & Quality Checks

- No automated tests yet; run `npm --workspace docs run check` and `npm --workspace docs run build` before every PR.
- Manually click through affected routes via `npm run docs` to verify copy, navigation, and embeds.
- Note any console warnings during validation and resolve or document them in the PR.

## Commit & Pull Request Guidelines

- Use imperative, present-tense commits (`Document party tech stack`); keep related edits together.
- Reference relevant tasks or tickets and summarize franchise-facing impact.
- PRs should outline changes, list affected pages, and attach screenshots or terminal output for UX or build updates.
- Tick off lint/build steps in the PR template and flag follow-up work for reviewers.

## Content Authoring Tips

- Start new pages by duplicating a similar doc in `src/content/docs/` and updating metadata for the new topic.
- Favor short, scannable sections; reuse approved Astro components sparingly.
- Store reusable schedules or inventories in JSON under `src/` and import instead of repeating data.
