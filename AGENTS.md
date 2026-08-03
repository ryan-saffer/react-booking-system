# Agent Guide (Repository Overview)

This guide orients you to the codebase and points to the authoritative README files for deeper details. Keep it updated as architecture evolves.

## Scope

- Applies to the entire repository unless a more specific guide exists in a subdirectory.

## What This App Is

- Fizz Kidz Portal: an internal operations platform.
- Frontend in React (Vite+, React Router, shadcn/ui). Backend on Firebase Functions with tRPC. Shared module in `packages/core/` for types and business logic.
- Toolchain is Vite+ (`vp`): Vite/Rolldown, Vitest, Oxlint, Oxfmt, tsdown, TypeScript 7, on Node 22 pinned by `.node-version`.
- Key integrations: Acuity (scheduling), Square (payments — all payments except B2B invoices, which are sent via Xero), Mixpanel, SendGrid (MJML), Zoho, Storyblok, Xero, Sling.

## Repository Layout

- `apps/client/` – React frontend. Key: `src/app.tsx` (routes), `src/components/root/root.tsx` (providers + tRPC client), `src/utilities/trpc.ts` (tRPC types/client).
- `apps/server/` – Firebase Functions (tRPC routers, webhooks, Pub/Sub). Key: `src/index.ts`, `src/trpc/*` (app router + adapter), feature dirs under `src/*`.
- `apps/docs/` – Astro + Starlight staff/franchisee knowledge base, published to the web. Deployed by Netlify, not Firebase. Independent of the Vite+ toolchain and of `@fizz-kidz/core`. Not to be confused with the root `docs/` directory, which holds internal feature plans and design documents that are never published.
- `apps/website/` – Public Astro + React marketing website. Content and remote imagery come from Storyblok; Netlify hosts the site and scheduled build function.
- `packages/core/` – Shared module (types, constants, utilities, shared logic). Consumed from source by both client and server.
- `scripts/` – Operational scripts (e.g., exports, maintenance utilities).

There are five workspaces, declared as `apps/*` and `packages/*`. The directories are `apps/client`, `apps/server`, `apps/docs`, `apps/website`, and `packages/core`. The apps are named after their directories (`client`, `server`, `docs`, `website`); the shared module is the scoped package `@fizz-kidz/core`. Apps are deployable and unscoped; shared packages are scoped (`@fizz-kidz/core`). Because no workspace nests inside another, `npm --workspace <name> ...` and `vp add <pkg> --filter <name>` target exactly one package.

## Deployment Boundaries

Two independent deployment systems operate on this repository, and they must not trigger each other.

- **Firebase (GitHub Actions, `.github/workflows/pipeline.yml`)** deploys `client` (Hosting) and `server` (Functions). Its trigger paths deliberately exclude `apps/docs/**`, `apps/website/**`, and `package-lock.json`, so Netlify-app changes never deploy Firebase.
- **Netlify** deploys `apps/docs` and `apps/website` as separate Netlify sites linked to this same repository. Each app's `netlify.toml` scopes its `ignore` command to its own directory, so unrelated changes do not produce builds or deploy previews.

When adding another Netlify-hosted app, give it its own `netlify.toml` with a directory-scoped `ignore` command, and leave it out of the pipeline trigger paths.

Both `client` and `server` import the shared module as `@fizz-kidz/core`, resolved by alias rather than by a published package. The `@fizz-kidz/` scope is never published; it exists so an import is instantly identifiable as internal. The alias is declared in four places that must stay in sync: root `vite.config.ts` (client and server alias maps), `apps/server/vite.config.ts`, `apps/client/tsconfig.json`, and `apps/server/tsconfig.json`.

## Start Here: README Index

- Repository overview: [README.md](README.md)
  - Monorepo structure, client/server overview, tRPC interaction, setup, dev scripts, deployment with Firebase.
- Client app: [client/README.md](apps/client/README.md)
  - Tech stack, routing model, UI libraries, state management (Zustand/Context), tRPC client setup, development workflow.
- Server app: [server/README.md](apps/server/README.md)
  - Function types (tRPC routers, webhooks, Pub/Sub), structure, lazy SDK pattern, local development with emulators.
- Website app: [website/README.md](apps/website/README.md)
  - Astro/React development, environment variables, shared checks, and Netlify deployment.
- Firebase persistence boundary: [server/src/firebase/README.md](apps/server/src/firebase/README.md)
  - `DatabaseClient` should stay as a thin Firestore access layer; business workflows belong in feature `core` modules.
- Core module: [core/README.md](packages/core/README.md)
  - Purpose, structure, build/use as local dependency for shared types and logic.
- Invitations & RSVP: client flow [client/src/components/rsvp/README.md](apps/client/src/components/rsvp/README.md); server lifecycle [server/src/party-bookings/core/rsvp/README.md](apps/server/src/party-bookings/core/rsvp/README.md).
- Holiday Programs (customer booking screen): [client/src/components/holiday-programs/customer-booking-screen/README.md](apps/client/src/components/holiday-programs/customer-booking-screen/README.md)
  - Booking flow, Square order/payment, discounts, direct Acuity scheduling, refunds, limitations.
- Scripts: [scripts/readme.md](scripts/readme.md)
  - CSV export for parties, `GOOGLE_APPLICATION_CREDENTIALS` usage, run instructions, HubSpot import note.
- Feature plans and design docs: [docs/](docs/)
  - Longer-lived implementation plans, e.g. [docs/inventory-system-plan.md](docs/inventory-system-plan.md) and [docs/feature-plans/](docs/feature-plans/). Treat these as working documents, not architecture references.
- Acuity auto-enrolment notes: [server/src/acuity/auto-enrolment.MD](apps/server/src/acuity/auto-enrolment.MD)

## Quick Start

1. Install Vite+: `curl -fsSL https://vite.plus | bash`
2. Install dependencies from the repository root: `vp install`
3. Enable repository hooks and agent integration: `vp config`
4. Run the client and Firebase emulators: `npm run dev` (or use `npm run client` and `npm run server` in separate terminals)
5. Verify changes: `npm run verify` (`vp check --fix && vp test --run`)
6. Build all deployment artifacts: `npm run build`
7. Deploy: see Deployment in [README.md](README.md) and [server/README.md](apps/server/README.md).

## Conventions & Patterns

- UI: Prefer `shadcn/ui` (Tailwind + Radix). Legacy MUI/Ant exists and is being phased out.
- State: Prefer Zustand; Context for auth/org providers.
- API: tRPC with shared `AppRouter` types, served via the single Express Firebase Function (`api`) at `/api/trpc`.
- Shared types/logic: add to `@fizz-kidz/core` (the `packages/core/` directory) and export via its `src/index.ts`.
- Persistence boundary: keep `apps/server/src/firebase/DatabaseClient.ts` as a thin Firestore access layer. Put business workflows, cascades, domain validation, and orchestration in `apps/server/src/<feature>/core`; only use `DatabaseClient` for simple reads/writes/queries or narrow transaction frames needed for Firestore atomicity.
- Server SDKs: instantiate lazily (e.g., Square/Acuity/Xero) to reduce cold starts.

## Routing Notes

- Customer-facing/server-owned browser paths must be kept in sync across three places: the Express app in `apps/server/src/api.ts`, Firebase Hosting rewrites in `firebase.json`, and the Vite dev proxy in the root `vite.config.ts`.
- If you add a top-level path that should hit the backend before the SPA renders (for example `/forms/**`), add a Firebase Hosting rewrite for production and a Vite proxy entry for local development. Otherwise the route may work in one environment and silently fall through to the client in the other.
- The current durable backend-owned form entrypoints live under `/forms/**`; the client `/form` route is an implementation detail behind that redirect layer.

## Verification Workflow

- Run `npm run verify` from the repository root to check and test in one step; it runs `vp check --fix && vp test --run`.
- Run `npm run verify:full` when changes affect either Astro app or shared build/tooling configuration; it runs `check:astro` before the normal verification command.
- To check without modifying files, run `npm run check`; it runs oxfmt, Oxlint, type-aware linting, and TypeScript 7 checks across supported files in every workspace. Firebase CI uses this fast form.
- Run `npm run check:astro` for framework-specific diagnostics in `apps/docs` and `apps/website`. Their Netlify build scripts run the same checks before building.
- `vp check` does not run tests. Run `vp test --run` after changes that affect behavior, and `vp build` after build configuration changes.
- Scope tests while iterating with `vp test --run --project client` or `--project server`.
- Do not leave formatting-only diffs for the user to discover on save; format changed files before finishing.
- If lint/typecheck output includes unrelated pre-existing warnings elsewhere in the repo, call that out clearly instead of treating them as part of the current change.

## Common Tasks

- Add a new API surface: create a feature folder in `apps/server/src/<feature>/`, define or extend a tRPC router, and register it with `appRouter` so it flows through the `api` function.
- Webhooks/PubSub: place routers/handlers under `apps/server/src/<feature>/functions/`; webhooks are mounted from `apps/server/src/api.ts`, while Pub/Sub tasks publish/listen on the shared `background` topic via `apps/server/src/pubsub.ts`.
- Add a server-owned frontend entrypoint: mount the Express route in `apps/server/src/api.ts`, add the matching Hosting rewrite in `firebase.json`, and add a Vite proxy entry if the path should also work during `vp dev`.
- Scripts: check `scripts/` and its README for required env (e.g., `GOOGLE_APPLICATION_CREDENTIALS`).

## Troubleshooting Pointers

- Types not found in the client: run `vp check` and verify the `@fizz-kidz/core` alias in the root `vite.config.ts` and client `tsconfig.json`.
- Emulator issues: stop stale Firebase processes, then restart `vp dev` from the repository root.

## Keeping This Guide Current

- When you add a README to a package, service, or feature, add it to the index above.
