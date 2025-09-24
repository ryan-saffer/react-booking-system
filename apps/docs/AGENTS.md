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
- `npm install` installs or refreshes dependencies.
- `npm run dev` starts the docs at `http://localhost:4321` with live reload.
- `npm run build` outputs the production bundle in `dist/` for deployment checks.
- `npm run preview` serves the built site locally to mirror hosting.
- `npm run astro -- check` runs Astro diagnostics for content and routing issues.

## Coding Style & Naming Conventions
- Use two-space indentation across Markdown, Astro, and TypeScript; avoid trailing whitespace.
- Prefer descriptive, hyphenated doc filenames (`party-booking-flow.md`) and camelCase keys in data files like `src/shifts.json`.
- Keep headings sentence case and include concise frontmatter (`title`, `description`) defined in `content.config.ts`.
- Run an editor formatter compatible with Astro/Prettier defaults before committing.

## Testing & Quality Checks
- No automated tests yet; run `npm run astro -- check` and `npm run build` before every PR.
- Manually click through affected routes via `npm run dev` to verify copy, navigation, and embeds.
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
