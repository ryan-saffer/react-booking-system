# Fizz Kidz Documentation

This repository houses the official knowledge base for Fizz Kidz staff and franchisees. It consolidates service playbooks, operational policies, and the technology workflows that keep our parties, programs, and retail experiences running smoothly.

## About
- Provide a single source of truth for how each Fizz Kidz service operates, from in-store experiences to online booking.
- Explain the tools and integrations that underpin our offerings so teams can troubleshoot and train with confidence.
- Keep guidance actionable and franchise-ready by pairing procedures with context, screenshots, and links to internal systems.

## Project Structure
```
.
├── public/                # Static assets served as-is
├── src/
│   ├── assets/            # Images and media imported into content
│   ├── content/
│   │   └── docs/          # Markdown/MDX pages surfaced in the site
│   ├── content.config.ts  # Content collections and frontmatter schema
│   └── shifts.json        # Shared operational data examples
├── astro.config.mjs       # Astro + Starlight configuration
├── package.json           # Scripts and dependencies
└── tsconfig.json          # TypeScript configuration
```

## Getting Started
1. Install dependencies with `npm install`.
2. Run `npm run dev` and visit `http://localhost:4321` for a live preview.
3. Update or add docs under `src/content/docs/`, then reload the browser to confirm changes.

## Key Commands
- `npm run dev` — start the local development server with live reload.
- `npm run build` — create the production-ready static site in `dist/`.
- `npm run preview` — serve the built site locally to mimic deployment.
- `npm run astro -- check` — run Astro diagnostics to catch content or routing errors.

## Contributing
Review `AGENTS.md` for detailed contributor guidelines covering style, review expectations, and quality checks. Open pull requests with screenshots or terminal output when changes alter the user experience or build behavior.
