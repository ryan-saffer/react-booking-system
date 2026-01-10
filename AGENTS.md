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

## Common Tasks
- Add a new API surface: create a feature folder in `server/src/<feature>/`, define or extend a tRPC router, and register it with `appRouter` so it flows through the `api` function.
- Webhooks/PubSub: place routers/handlers under `server/src/<feature>/functions/`; webhooks are mounted from `server/src/api.ts`, while Pub/Sub tasks publish/listen on the shared `background` topic via `server/src/pubsub.ts`.
- Scripts: check `scripts/` and its README for required env (e.g., `GOOGLE_APPLICATION_CREDENTIALS`).

## Troubleshooting Pointers
- Types not found in client: ensure `server/fizz-kidz` builds; client scripts typically trigger this.
- Emulator issues: re-run `npm run serve` in `server/` after building `fizz-kidz`.

## Keeping This Guide Current
- When you add a README to a package, service, or feature, add it to the index above.
