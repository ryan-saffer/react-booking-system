# Fizz Kidz

The software behind Fizz Kidz: the public website, staff tools, customer booking flows, backend services, and internal knowledge base.

It is one npm workspace powered by [Vite+](https://viteplus.dev/), with deployable apps in `apps/` and shared code in `packages/`.

## The Map

| Workspace                                  | What it is                              | Ships to                   |
| ------------------------------------------ | --------------------------------------- | -------------------------- |
| [`apps/portal`](apps/portal/README.md)     | Staff portal and customer booking flows | Firebase Hosting           |
| [`apps/server`](apps/server/README.md)     | APIs, webhooks, jobs, and integrations  | Firebase Functions         |
| [`apps/website`](apps/website/README.md)   | Public marketing website                | Netlify                    |
| [`apps/docs`](apps/docs/README.md)         | Staff and franchisee knowledge base     | Netlify                    |
| [`packages/core`](packages/core/README.md) | Code shared by the Portal and server    | Bundled into its consumers |

> **Two kinds of docs:** `apps/docs` is the published knowledge base. Root [`docs/`](docs/README.md) is a notebook for engineering plans and design work.

## The Mental Model

- The Portal calls the server through tRPC at `/api/trpc`.
- The server exports one Express function (`api`) and one background dispatcher (`pubsub`).
- Portal and server import `@fizz-kidz/core` directly from source. No publish step is involved.
- Website and docs are independent Astro apps. They do not start with the Firebase stack.
- Firebase deploys from GitHub Actions; the Astro apps deploy through separate Netlify sites.

## Get Running

Requires Node `22.23.2`, npm `11.6.2`, and Vite+.

```bash
curl -fsSL https://vite.plus | bash
vp install
vp config
npm run dev
```

`npm run dev` starts the Portal at `localhost:3000`, server watchers, and the Functions/Pub/Sub emulators.

### Commands Worth Remembering

```bash
npm run portal          # Portal without emulators
npm run portal:prod     # Local Portal against production
npm run server          # Server watchers and emulators
npm run website         # Public site on :4321
npm run docs            # Knowledge base on :4321

npm run check           # Read-only format, lint, and type checks
npm run test            # Core, Portal, and server tests
npm run verify          # Fix checks, then test
npm run verify:full     # Include both Astro checks
npm run build           # Core + server + Portal
```

Build either Astro app with `npm run build --workspace website` or `npm run build --workspace docs`.

## Where Shared Code Goes

Put runtime-neutral types and pure logic in `@fizz-kidz/core`, then export them from `packages/core/src/index.ts`.

Keep SDK clients, credentials, Firestore, and other runtime-specific I/O in the app that owns them. Shared React UI should eventually become its own package rather than turning core into a grab bag.

Add dependencies from the root:

```bash
vp add <package> --filter portal
vp add <package> --filter @fizz-kidz/core
```

## Shipping

- `develop` deploys changed Firebase targets to development.
- `main` deploys changed Firebase targets to production.
- A core change deploys both Portal and server.
- Website and docs deploy independently through Netlify.
- GitHub receives Firebase environment files through `PORTAL_ENV_FILE` and `SERVER_ENV_FILE` environment variables.

> **Easy to forget**
>
> - `npm run build` does not build either Astro app.
> - Website and docs both default to port `4321`.
> - Server manifest changes also require refreshing `apps/server/package-lock.json`.
> - Backend-owned browser routes must agree in Express, `firebase.json`, and the root Vite proxy.
> - Netlify's ignore rules only watch each app directory; root tooling changes may need a manual build.

## Useful Starting Points

- Portal routes: `apps/portal/src/app.tsx`
- Portal providers and tRPC client: `apps/portal/src/components/root/root.tsx`
- Server HTTP composition: `apps/server/src/http/app.ts`
- Server tRPC composition: `apps/server/src/trpc/trpc.app-router.ts`
- Background jobs: `apps/server/src/background/function.ts`
- Shared exports: `packages/core/src/index.ts`
- Firestore boundary: [`apps/server/src/firebase/README.md`](apps/server/src/firebase/README.md)
- Operational scripts: [`apps/server/src/_scripts/README.md`](apps/server/src/_scripts/README.md)
