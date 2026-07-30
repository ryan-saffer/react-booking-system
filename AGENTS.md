# Agent Guide (Repository Overview)

This guide orients you to the codebase and points to the authoritative README files for deeper details. Keep it updated as architecture evolves.

## Scope

- Applies to the entire repository unless a more specific guide exists in a subdirectory.

## What This App Is

- Fizz Kidz Portal: an internal operations platform.
- Frontend in React (Vite+, React Router, shadcn/ui). Backend on Firebase Functions with tRPC. Shared core module in `server/fizz-kidz` for types and business logic.
- Toolchain is Vite+ (`vp`): Vite/Rolldown, Vitest, Oxlint, Oxfmt, tsdown, TypeScript 7, on Node 22 pinned by `.node-version`.
- Key integrations: Acuity (scheduling), Square (payments — all payments except B2B invoices, which are sent via Xero), Mixpanel, SendGrid (MJML), Zoho, Storyblok, Xero, Sling.

## Repository Layout

- `client/` – React frontend. Key: `src/app.tsx` (routes), `src/components/root/root.tsx` (providers + tRPC client), `src/utilities/trpc.ts` (tRPC types/client).
- `server/` – Firebase Functions (tRPC routers, webhooks, Pub/Sub). Key: `src/index.ts`, `src/trpc/*` (app router + adapter), feature dirs under `src/*`.
- `server/fizz-kidz/` – Core shared module (types, constants, utilities, shared logic). Built and consumed by both client and server.
- `scripts/` – Operational scripts (e.g., exports, maintenance utilities).

## Start Here: README Index

- Repository overview: [README.md](README.md)
    - Monorepo structure, client/server overview, tRPC interaction, setup, dev scripts, deployment with Firebase.
- Client app: [client/README.md](client/README.md)
    - Tech stack, routing model, UI libraries, state management (Zustand/Context), tRPC client setup, development workflow.
- Server app: [server/README.md](server/README.md)
    - Function types (tRPC routers, webhooks, Pub/Sub), structure, lazy SDK pattern, local development with emulators.
- Firebase persistence boundary: [server/src/firebase/README.md](server/src/firebase/README.md)
    - `DatabaseClient` should stay as a thin Firestore access layer; business workflows belong in feature `core` modules.
- Core module: [server/fizz-kidz/README.md](server/fizz-kidz/README.md)
    - Purpose, structure, build/use as local dependency for shared types and logic.
- Invitations & RSVP: client flow [client/src/components/rsvp/README.md](client/src/components/rsvp/README.md); server lifecycle [server/src/party-bookings/core/rsvp/README.md](server/src/party-bookings/core/rsvp/README.md).
- Holiday Programs (customer booking screen): [client/src/components/holiday-programs/customer-booking-screen/README.md](client/src/components/holiday-programs/customer-booking-screen/README.md)
    - Booking flow, Square order/payment, discounts, direct Acuity scheduling, refunds, limitations.
- Scripts: [scripts/readme.md](scripts/readme.md)
    - CSV export for parties, `GOOGLE_APPLICATION_CREDENTIALS` usage, run instructions, HubSpot import note.
- Feature plans and design docs: [docs/](docs/)
    - Longer-lived implementation plans, e.g. [docs/inventory-system-plan.md](docs/inventory-system-plan.md) and [docs/feature-plans/](docs/feature-plans/). Treat these as working documents, not architecture references.
- Acuity auto-enrolment notes: [server/src/acuity/auto-enrolment.MD](server/src/acuity/auto-enrolment.MD)

## Quick Start

1. Install Vite+: `curl -fsSL https://vite.plus | bash`
2. Install dependencies from the repository root: `vp install`
3. Enable repository hooks and agent integration: `vp config`
4. Run the client and Firebase emulators: `npm run dev` (or use `npm run client` and `npm run server` in separate terminals)
5. Verify changes: `npm run verify` (`vp check --fix && vp test --run`)
6. Build all deployment artifacts: `npm run build`
7. Deploy: see Deployment in [README.md](README.md) and [server/README.md](server/README.md).

## Conventions & Patterns

- UI: Prefer `shadcn/ui` (Tailwind + Radix). Legacy MUI/Ant exists and is being phased out.
- State: Prefer Zustand; Context for auth/org providers.
- API: tRPC with shared `AppRouter` types, served via the single Express Firebase Function (`api`) at `/api/trpc`.
- Shared types/logic: add to `server/fizz-kidz` and export via its `src/index.ts`.
- Persistence boundary: keep `server/src/firebase/DatabaseClient.ts` as a thin Firestore access layer. Put business workflows, cascades, domain validation, and orchestration in `server/src/<feature>/core`; only use `DatabaseClient` for simple reads/writes/queries or narrow transaction frames needed for Firestore atomicity.
- Server SDKs: instantiate lazily (e.g., Square/Acuity/Xero) to reduce cold starts.

## Routing Notes

- Customer-facing/server-owned browser paths must be kept in sync across three places: the Express app in `server/src/api.ts`, Firebase Hosting rewrites in `firebase.json`, and the Vite dev proxy in the root `vite.config.ts`.
- If you add a top-level path that should hit the backend before the SPA renders (for example `/forms/**`), add a Firebase Hosting rewrite for production and a Vite proxy entry for local development. Otherwise the route may work in one environment and silently fall through to the client in the other.
- The current durable backend-owned form entrypoints live under `/forms/**`; the client `/form` route is an implementation detail behind that redirect layer.

## Verification Workflow

- Run `npm run verify` from the repository root to check and test in one step; it runs `vp check --fix && vp test --run`.
- To check without modifying files, run `vp check` on its own; it runs Oxfmt, Oxlint, type-aware linting, and TypeScript checks in order. CI uses this form.
- `vp check` does not run tests. Run `vp test --run` after changes that affect behavior, and `vp build` after build configuration changes.
- Scope tests while iterating with `vp test --run --project client` or `--project server`.
- Do not leave formatting-only diffs for the user to discover on save; format changed files before finishing.
- If lint/typecheck output includes unrelated pre-existing warnings elsewhere in the repo, call that out clearly instead of treating them as part of the current change.

## Common Tasks

- Add a new API surface: create a feature folder in `server/src/<feature>/`, define or extend a tRPC router, and register it with `appRouter` so it flows through the `api` function.
- Webhooks/PubSub: place routers/handlers under `server/src/<feature>/functions/`; webhooks are mounted from `server/src/api.ts`, while Pub/Sub tasks publish/listen on the shared `background` topic via `server/src/pubsub.ts`.
- Add a server-owned frontend entrypoint: mount the Express route in `server/src/api.ts`, add the matching Hosting rewrite in `firebase.json`, and add a Vite proxy entry if the path should also work during `vp dev`.
- Scripts: check `scripts/` and its README for required env (e.g., `GOOGLE_APPLICATION_CREDENTIALS`).

## Troubleshooting Pointers

- Types not found in the client: run `vp check` and verify the `fizz-kidz` alias in the root `vite.config.ts` and client `tsconfig.json`.
- Emulator issues: stop stale Firebase processes, then restart `vp dev` from the repository root.

## Keeping This Guide Current

- When you add a README to a package, service, or feature, add it to the index above.
