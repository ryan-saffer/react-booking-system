# Knowledge Base

The published how-to site for Fizz Kidz staff and franchisees. It currently covers selected party and gift-card processes plus tools such as Acuity, calendars, email signatures, and Sling.

This is an Astro + Starlight app. The useful bit is simple:

- Pages live in `src/content/docs`.
- Sidebar navigation lives in `astro.config.mjs`.
- Imported images live in `src/assets`; direct downloads live in `public`.

> **Not this folder:** root [`docs/`](../../docs/README.md) is an unpublished engineering notebook.

## Work On It

```bash
npm run docs
npm --workspace docs run check
npm run build --workspace docs
```

Write for someone trying to complete a task between customers: short steps, useful screenshots, no throat-clearing.

Netlify builds from the repository root using `apps/docs/netlify.toml`. Its ignore rule only watches `apps/docs`, so a root dependency or tooling change may require a manual build.
