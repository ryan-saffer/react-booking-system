# Website

The public face of Fizz Kidz. Mostly Astro pages, with React where interaction earns its keep.

Most copy lives directly in `src/pages` and `src/components`. Storyblok supplies current holiday-program content and hosts the images referenced by `src/data/storyblok-images.ts`.

## Less Static Than It Looks

- `src/pages/api/uploadthing.ts` handles uploads.
- Location pages load Google reviews.
- Instagram data uses Netlify credentials and storage.
- `netlify/functions/weekly-scheduled-build.ts` refreshes external content every week.

## Work On It

```bash
npm run website
npm --workspace website run check
npm run build --workspace website
npm --workspace website run preview
```

Local environment values live in `apps/website/.env`:

- `STORYBLOK_TOKEN`
- `PUBLIC_UPLOADTHING_TOKEN`
- `NETLIFY_TOKEN`

Production and preview values live in Netlify.

> **Deployment gotcha:** `netlify.toml` only watches `apps/website`. If a root dependency or toolchain change affects the site, trigger a manual build or include a website-directory change.

Netlify hosts the Astro output and `apps/website/netlify/functions`. Remote image optimization allows Storyblok and Instagram CDN hosts.
