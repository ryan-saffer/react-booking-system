# Website

The public face of Fizz Kidz. Mostly Astro pages, with React where interaction earns its keep.

Most copy lives directly in `src/pages` and `src/components`. Storyblok supplies current holiday-program content and hosts the images referenced by `src/data/storyblok-images.ts`.

Website forms use the Zod schemas, inferred payload types, and select options exported from `@fizz-kidz/core` in `packages/core/src/website/website-forms.ts`. Submit active forms through `src/utils/website-forms.ts`; it dynamically imports the vanilla tRPC client on first submission, keeping tRPC out of the initial island bundle while preserving end-to-end input, output, and error typing.

## Less Static Than It Looks

- `src/pages/api/uploadthing.ts` handles uploads.
- Location pages load Google reviews.
- Instagram data uses Netlify credentials and storage.
- `netlify/functions/weekly-scheduled-build.ts` refreshes external content every week.

## Work On It

```bash
npm run website
npm run website:local
npm run website:prod
npm --workspace website run check
npm run build --workspace website
npm --workspace website run build:dev
npm --workspace website run preview
```

`npm run website` sends API requests to `https://dev.fizzkidz.com.au`; `npm run website:local` sends them to the development Functions emulator on port `5001`; and `npm run website:prod` sends them to `https://bookings.fizzkidz.com.au`. Start `npm run server` or `npm run portal:local` alongside `website:local` so the emulator is available.

Local environment values live in `apps/website/.env`:

- `STORYBLOK_TOKEN`
- `PUBLIC_UPLOADTHING_TOKEN`
- `NETLIFY_TOKEN`

Production and preview values live in Netlify.

## SEO Data

`src/utils/seo.ts` builds the shared Schema.org graph and route-specific service, breadcrumb, location and studio-list entities. Keep public studio names and addresses in `src/utils/studios.ts`; location pages, the footer, structured data and `public/llms.txt` should agree with that source.

> **Deployment:** Deploys from `main` and `develop` run through GitHub Actions. The pipeline publishes changed Firebase targets first and only then publishes the Website when Website code changed, so a Firebase failure skips Netlify. `main` publishes production; `develop` creates a unique deploy preview built in development mode. Netlify still owns pull-request previews, other branch deploys, and build-hook rebuilds; automatic Git-backed builds from `main` and `develop` are ignored. GitHub's `dev` and `prod` environments require the `NETLIFY_AUTH_TOKEN` secret and `NETLIFY_SITE_ID` variable.

Netlify hosts the Astro output and `apps/website/netlify/functions`. Remote image optimization allows Storyblok and Instagram CDN hosts.
