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
- **Routing:** [React Router DOM](https://reactrouter.com/) for client-side routing (see `client/src/app.tsx`).
- **API Consumption:** Uses [tRPC](https://trpc.io/) to communicate with the server.
    - tRPC client initialized in `client/src/utilities/trpc.ts`.
    - Enables type-safe API calls from React components (see `client/src/app.tsx` and its children).

## Server

The server-side application handles business logic, data processing, and API provision using [Node.js](https://nodejs.org/) and [TypeScript](https://www.typescriptlang.org/).

- **Main Entry:** `server/src/index.ts` exports modules for various application features (e.g., acuity, events, party bookings).
- **Core Logic:** Shared business logic, types, and utilities reside in `server/fizz-kidz/src/index.ts`.
- **API with tRPC:**
    - Exposes a tRPC API for client consumption.
    - Comprises multiple feature-specific routers (e.g., `partiesRouter`, `eventsRouter`) consolidated into `appRouter` (`server/src/trpc/trpc.app-router.ts`), which defines the full API surface.
    - The entire router is mounted on a single Express app inside `server/src/api.ts`, which serves the `/api/trpc` endpoint from one [Firebase Function](https://firebase.google.com/docs/functions) alongside related HTTPS webhooks.
- **Background Jobs:** Scheduled/background tasks share one Pub/Sub topic (`background`) and are dispatched from `server/src/pubsub.ts` based on message name.

## tRPC Interaction

[tRPC](https://trpc.io/) enables type-safe client-server communication. By sharing TypeScript types directly (via `AppRouter` from `server/src/trpc/trpc.app-router.ts` imported into `client/src/utilities/trpc.ts`), the client calls server procedures with full type-checking and autocompletion. This boosts developer experience and cuts integration errors, eliminating manual schema sync or code generation.

## Project Structure

A monorepo co-locating client and server:

- **`client/`**: React frontend.
- **`server/`**: Node.js backend (tRPC API definitions, Firebase Functions).
- **`server/fizz-kidz/`**: Shared core logic, types, and utilities. Located in `server/` for Firebase Functions compatibility, ensuring it's packaged as a local dependency for server deployment. Built separately, used by server and client build processes.

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

The server-only command watches the Functions bundle and server TypeScript projects, then starts the Functions and Pub/Sub emulators without starting Vite's client dev server. The Functions bundle directly includes `server/fizz-kidz/src`, so either server or shared-core changes trigger a backend rebuild. Client-only files are outside that dependency graph and do not rebuild the backend.

To run the local client against the production backend and Firebase project without starting local emulators:

```bash
npm run client:prod
```

## Verification

Vite+ is a single toolchain, but checking and testing remain separate operations. To verify everything before finishing a change, run one command from the repository root:

```bash
npm run verify
```

That runs `vp check --fix && vp test --run`: it formats and applies safe lint fixes, then validates formatting, lint, type-aware lint, and TypeScript, and finally runs the whole test suite once.

The individual commands are also available:

| Command         | Wraps           | Purpose                                                                                                        |
| --------------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| `npm run check` | `vp check`      | Formatting, Oxlint, type-aware lint, and TypeScript checks. Read-only.                                         |
| `npm test`      | `vp test --run` | Runs the client and server Vitest projects once and exits.                                                     |
| `npm run build` | `vp build`      | Builds `server/fizz-kidz`, bundles Firebase Functions to `server/lib`, and builds the client to `client/dist`. |

Notes:

- Use `vp test` (without `--run`) for watch mode while developing.
- CI deliberately runs `vp check` rather than `npm run verify`, because `--fix` modifies files.
- Run `npm run build` after changing build configuration.

The project compiler is TypeScript 7 (`vp exec tsc --version`). The `typescript6` compatibility package is retained only for tsdown's declaration-generation JS API; Vite+ checks and dev watchers use the TypeScript 7 toolchain.

## Environment Configuration

- Client: use `vp dev --mode dev|prod` or `vp build --mode dev|prod` (`client/.env` by default; merges `client/.env.prod` for prod builds).
- Server: uses `dotenv` with `server/src/load-env.ts` to read the Firebase project id and load `server/.env` (dev) or `server/.env.prod` (prod).
- GitHub: the workflow writes the correct env file(s) from Environment variable SERVER_ENV_FILE and CLIENT_ENV_FILE before build/deploy.

## Deployment

Deployed using Firebase.

- **Client (Firebase Hosting):**
    - Client app built to static assets (`client/dist/`).
    - Served by Firebase Hosting.
    - `firebase.json` defines hosting config (URL rewrites, `predeploy` script: `sh ./client/predeploy.sh`).
    - Backend-owned browser paths must be explicitly rewritten here. Today that includes `/api/**` and `/forms/**`.
- **Server (Firebase Functions):**
    - The Express-based `api` Firebase Function exposes `/api/trpc` for tRPC along with `/api/webhooks/*` endpoints.
    - It also handles durable browser entrypoints under `/forms/**`, which then redirect to the current client implementation.
    - The client sends all tRPC requests to this single function URL (see `client/src/components/root/root.tsx` for tRPC client `fetch` logic).
    - Background jobs use the `background` Pub/Sub topic, handled centrally by `server/src/pubsub.ts`.
    - `firebase.json` specifies `server/` as functions source.
    - `functions` `predeploy` script in `firebase.json` (`npm --prefix "$RESOURCE_DIR" run build`) builds server code.
    - Deploy via Firebase CLI:
        ```bash
        vp exec firebase deploy --only functions
        ```

See `vite.config.ts`, `server/vite.config.ts`, and `firebase.json` for detailed configurations.

## Routing Contract

- Use clean backend-owned URLs for long-lived external/customer-facing links when you want future frontend changes to stay backward compatible.
- In this repo, `/forms/**` is the durable public form entrypoint and `/form` is the current client-side implementation behind it.
- When adding another backend-owned browser route, update all three layers together:
    - Express routing in `server/src/api.ts`
    - Firebase Hosting rewrites in `firebase.json`
    - Vite proxy config in the root `vite.config.ts`
