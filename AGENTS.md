# Agent Guide (Repository Overview)

This guide orients you to the codebase and points to the authoritative README files for deeper details. Keep it updated as architecture evolves.

## Scope
- Applies to the entire repository unless a more specific guide exists in a subdirectory.

## What This App Is
- Fizz Kidz Portal: an internal operations platform.
- Frontend in React (Vite, React Router, shadcn/ui). Backend on Firebase Functions with tRPC. Shared core module in `server/fizz-kidz` for types and business logic.
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
- Core module: [server/fizz-kidz/README.md](server/fizz-kidz/README.md)
  - Purpose, structure, build/use as local dependency for shared types and logic.
- Invitations & RSVP: client flow [client/src/components/rsvp/README.md](client/src/components/rsvp/README.md); server lifecycle [server/src/party-bookings/core/rsvp/README.md](server/src/party-bookings/core/rsvp/README.md).
- Holiday Programs (customer booking screen): [client/src/components/holiday-programs/customer-booking-screen/README.md](client/src/components/holiday-programs/customer-booking-screen/README.md)
  - Booking flow, Square order/payment, discounts, direct Acuity scheduling, refunds, limitations.
- Scripts: [scripts/readme.md](scripts/readme.md)
  - CSV export for parties, `GOOGLE_APPLICATION_CREDENTIALS` usage, run instructions, HubSpot import note.

## Quick Start
1. Install dependencies:
   - `cd server && npm install && cd ..`
   - `cd client && npm install && cd ..`
2. Run client (Vite): `cd client && npm start`
3. Run server (emulators): `cd server && npm run serve`
4. Deploy: see Deployment in [README.md](README.md) and [server/README.md](server/README.md).

## Conventions & Patterns
- UI: Prefer `shadcn/ui` (Tailwind + Radix). Legacy MUI/Ant exists and is being phased out.
- State: Prefer Zustand; Context for auth/org providers.
- API: tRPC with shared `AppRouter` types, served via the single Express Firebase Function (`api`) at `/api/trpc`.
- Shared types/logic: add to `server/fizz-kidz` and export via its `src/index.ts`.
- Server SDKs: instantiate lazily (e.g., Square/Acuity/Xero) to reduce cold starts.

## Routing Notes
- Customer-facing/server-owned browser paths must be kept in sync across three places: the Express app in `server/src/api.ts`, Firebase Hosting rewrites in `firebase.json`, and the Vite dev proxy in `client/vite.config.ts` / `client/vite.config.js`.
- If you add a top-level path that should hit the backend before the SPA renders (for example `/forms/**`), add a Firebase Hosting rewrite for production and a Vite proxy entry for local development. Otherwise the route may work in one environment and silently fall through to the client in the other.
- The current durable backend-owned form entrypoints live under `/forms/**`; the client `/form` route is an implementation detail behind that redirect layer.

## Verification Workflow
- After making changes, always run verification in this order for the files or package touched: Prettier, then lint, then typecheck.
- For client changes, prefer running the local client formatter directly so it uses the repo plugin setup (for example from `client/`: `./node_modules/.bin/prettier --write <files>`).
- Do not leave formatting-only diffs for the user to discover on save; format changed files before finishing.
- If lint/typecheck output includes unrelated pre-existing warnings elsewhere in the repo, call that out clearly instead of treating them as part of the current change.

## Common Tasks
- Add a new API surface: create a feature folder in `server/src/<feature>/`, define or extend a tRPC router, and register it with `appRouter` so it flows through the `api` function.
- Webhooks/PubSub: place routers/handlers under `server/src/<feature>/functions/`; webhooks are mounted from `server/src/api.ts`, while Pub/Sub tasks publish/listen on the shared `background` topic via `server/src/pubsub.ts`.
- Add a server-owned frontend entrypoint: mount the Express route in `server/src/api.ts`, add the matching Hosting rewrite in `firebase.json`, and add a Vite proxy entry if the path should also work during `client/npm start`.
- Scripts: check `scripts/` and its README for required env (e.g., `GOOGLE_APPLICATION_CREDENTIALS`).

## Troubleshooting Pointers
- Types not found in client: ensure `server/fizz-kidz` builds; client scripts typically trigger this.
- Emulator issues: re-run `npm run serve` in `server/` after building `fizz-kidz`.

## Keeping This Guide Current
- When you add a README to a package, service, or feature, add it to the index above.
