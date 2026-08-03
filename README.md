# Fizz Kidz Portal

The Fizz Kidz Portal is an internal management system streamlining Fizz Kidz operations. It integrates third-party services and uses Firebase for backend functionality, including role-based authentication via Firebase Auth.

**Key Integrations:**

- **Scheduling:** Acuity Scheduling (for holiday programs, after-school programs, play lab)
- **Payments:** Square (all payments; B2B invoices via Xero)
- **Analytics:** Mixpanel
- **Email:** SendGrid (using MJML for templating)
- **CRM:** Zoho
- **CMS:** Storyblok
- **Payroll:** Xero
- **Rostering:** Sling

## Table of Contents

- [Client](#client)
- [Server](#server)
- [tRPC Interaction](#trpc-interaction)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Development](#development)
- [Verification](#verification)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Routing Contract](#routing-contract)

## Client

The client-side application handles the user interface and interaction.

- **Framework:** [React](https://react.dev/).
- **Toolchain:** [Vite+](https://viteplus.dev/) unifies Vite, Vitest, Oxlint, Oxfmt, Rolldown, and tsdown (see `vite.config.ts`).
- **Routing:** [React Router DOM](https://reactrouter.com/) for client-side routing (see `apps/client/src/app.tsx`).
- **API Consumption:** Uses [tRPC](https://trpc.io/) to communicate with the server.
  - tRPC client initialized in `apps/client/src/utilities/trpc.ts`.
  - Enables type-safe API calls from React components (see `apps/client/src/app.tsx` and its children).

## Server

The server-side application handles business logic, data processing, and API provision using [Node.js](https://nodejs.org/) and [TypeScript](https://www.typescriptlang.org/).

- **Main Entry:** `apps/server/src/index.ts` exports modules for various application features (e.g., acuity, events, party bookings).
- **Core Logic:** Shared business logic, types, and utilities reside in `packages/core/src/index.ts`.
- **API with tRPC:**
  - Exposes a tRPC API for client consumption.
  - Comprises multiple feature-specific routers (e.g., `partiesRouter`, `eventsRouter`) consolidated into `appRouter` (`apps/server/src/trpc/trpc.app-router.ts`), which defines the full API surface.
  - The entire router is mounted on a single Express app inside `apps/server/src/api.ts`, which serves the `/api/trpc` endpoint from one [Firebase Function](https://firebase.google.com/docs/functions) alongside related HTTPS webhooks.
- **Background Jobs:** Scheduled/background tasks share one Pub/Sub topic (`background`) and are dispatched from `apps/server/src/pubsub.ts` based on message name.

## tRPC Interaction

[tRPC](https://trpc.io/) enables type-safe client-server communication. By sharing TypeScript types directly (via `AppRouter` from `apps/server/src/trpc/trpc.app-router.ts` imported into `apps/client/src/utilities/trpc.ts`), the client calls server procedures with full type-checking and autocompletion. This boosts developer experience and cuts integration errors, eliminating manual schema sync or code generation.

## Project Structure

A monorepo using the conventional `apps/` (deployables) and `packages/` (shared libraries) layout:

- **`apps/client/`**: React frontend.
- **`apps/docs/`**: Astro + Starlight staff and franchisee knowledge base, deployed by Netlify.
- **`apps/server/`**: Node.js backend (tRPC API definitions, Firebase Functions).
- **`apps/website/`**: Public Astro + React marketing website, deployed by Netlify.
- **`packages/core/`**: Shared logic, types, and utilities, published locally as `@fizz-kidz/core`. Consumed from source by both the client and the Functions bundle, so it needs no separate build to run or deploy the app.

Deployable applications live under `apps/`; shared libraries live under `packages/`.

## Setup and Installation

1. **Clone the repository.**
2. **Install Vite+:** `curl -fsSL https://vite.plus | bash`, then open a new shell.
3. **Install the workspace:** `vp install` from the repository root.
4. **Enable repository hooks and agent integration:** `vp config`.

## Development

Run the complete local stack from the repository root:

```bash
npm run dev
```

This wraps `vp dev`. It starts the client on `localhost:3000`, watches the Functions bundle, and starts the Firebase Functions and Pub/Sub emulators. Set `VP_CLIENT_ONLY=true` to start only the client.

To keep client and server logs in separate terminals, run these commands from the repository root:

```bash
# Terminal 1
npm run client

# Terminal 2
npm run server
```

The server-only command watches the Functions bundle and server TypeScript projects, then starts the Functions and Pub/Sub emulators without starting Vite's client dev server. The Functions bundle directly includes `packages/core/src`, so either server or shared-module changes trigger a backend rebuild. Client-only files are outside that dependency graph and do not rebuild the backend.

To run the local client against the production backend and Firebase project without starting local emulators:

```bash
npm run client:prod
```

## Verification

The default local feedback loop stays on the fast Vite+ path:

```bash
npm run check
npm run test
```

To apply formatting and safe lint fixes across every workspace, then run the test suite:

```bash
npm run verify
```

For release-level verification that also runs both Astro language-server checks:

```bash
npm run verify:full
```

The individual commands are also available:

| Command               | Wraps                      | Purpose                                                                                                                 |
| --------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npm run check`       | `vp check`                 | Fast read-only oxfmt, Oxlint, type-aware lint, and TypeScript 7 checks across all workspaces.                           |
| `npm run check:astro` | Two scoped `astro check`s  | Runs framework-specific diagnostics for `docs` and `website`.                                                           |
| `npm run test`        | `vp test --run`            | Runs the client and server Vitest projects once and exits.                                                              |
| `npm run verify`      | Vite+ fix/check plus tests | Formats and safely fixes supported files across all workspaces, then runs tests.                                        |
| `npm run verify:full` | Astro checks plus `verify` | Runs both Astro checks, whole-repository fixes/checks, and tests.                                                       |
| `npm run build`       | `vp build`                 | Builds `@fizz-kidz/core`, bundles Firebase Functions to `apps/server/lib`, and builds the client to `apps/client/dist`. |

Notes:

- Use `vp test` (without `--run`) for watch mode while developing.
- Firebase CI runs `vp check` rather than `npm run verify`, because `verify` applies formatting fixes. Each Netlify build runs its own Astro check before building.
- Run `npm run build` after changing build configuration.

The project compiler is TypeScript 7 (`vp exec tsc --version`). The `typescript6` compatibility package is retained only for tsdown's declaration-generation JS API; Vite+ checks and dev watchers use the TypeScript 7 toolchain.

## Environment Configuration

- Client: use `vp dev --mode dev|prod` or `vp build --mode dev|prod` (`apps/client/.env` by default; merges `apps/client/.env.prod` for prod builds).
- Server: uses `dotenv` with `apps/server/src/load-env.ts` to read the Firebase project id and load `apps/server/.env` (dev) or `apps/server/.env.prod` (prod).
- Website: `npm run website` loads `apps/website/.env`; Netlify owns production and deploy-preview values.
- GitHub: the workflow writes the correct env file(s) from Environment variable SERVER_ENV_FILE and CLIENT_ENV_FILE before build/deploy.

## Deployment

The client and server deploy through Firebase. The docs and website apps deploy independently through Netlify.

- **Client (Firebase Hosting):**
  - Client app built to static assets (`apps/client/dist/`).
  - Served by Firebase Hosting.
  - `firebase.json` defines hosting config (URL rewrites, `predeploy` script: `sh ./client/predeploy.sh`).
  - Backend-owned browser paths must be explicitly rewritten here. Today that includes `/api/**` and `/forms/**`.
- **Server (Firebase Functions):**
  - The Express-based `api` Firebase Function exposes `/api/trpc` for tRPC along with `/api/webhooks/*` endpoints.
  - It also handles durable browser entrypoints under `/forms/**`, which then redirect to the current client implementation.
  - The client sends all tRPC requests to this single function URL (see `apps/client/src/components/root/root.tsx` for tRPC client `fetch` logic).
  - Background jobs use the `background` Pub/Sub topic, handled centrally by `apps/server/src/pubsub.ts`.
  - `firebase.json` specifies `apps/server/` as functions source.
  - `functions` `predeploy` script in `firebase.json` (`npm --prefix "$RESOURCE_DIR" run build`) builds server code.
  - Deploy via Firebase CLI:
    ```bash
    vp exec firebase deploy --only functions
    ```

See `vite.config.ts`, `apps/server/vite.config.ts`, and `firebase.json` for detailed configurations.

## Routing Contract

- Use clean backend-owned URLs for long-lived external/customer-facing links when you want future frontend changes to stay backward compatible.
- In this repo, `/forms/**` is the durable public form entrypoint and `/form` is the current client-side implementation behind it.
- When adding another backend-owned browser route, update all three layers together:
  - Express routing in `apps/server/src/api.ts`
  - Firebase Hosting rewrites in `firebase.json`
  - Vite proxy config in the root `vite.config.ts`
