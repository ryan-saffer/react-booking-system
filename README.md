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

## Client

The client-side application handles the user interface and interaction.

- **Framework:** [React](https://react.dev/).
- **Build Tool:** [Vite](https://vitejs.dev/) for fast development and optimized builds (see `client/vite.config.ts`).
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
  - Comprises multiple feature-specific routers (e.g., `partiesRouter`, `eventsRouter`) consolidated into `appRouter` (`server/src/trpc/trpc.app-router.ts`), which defines the full API.
  - `server/src/trpc/trpc.adapter.ts`'s `onRequestTrpc` function exposes each tRPC router (e.g., `partiesRouter`) as an individual [Firebase Function](https://firebase.google.com/docs/functions). Each main route group in `trpc.app-router.ts` maps to a separate serverless function.

## tRPC Interaction

[tRPC](https://trpc.io/) enables type-safe client-server communication. By sharing TypeScript types directly (via `AppRouter` from `server/src/trpc/trpc.app-router.ts` imported into `client/src/utilities/trpc.ts`), the client calls server procedures with full type-checking and autocompletion. This boosts developer experience and cuts integration errors, eliminating manual schema sync or code generation.

## Project Structure

A monorepo co-locating client and server:

- **`client/`**: React frontend.
- **`server/`**: Node.js backend (tRPC API definitions, Firebase Functions).
- **`server/fizz-kidz/`**: Shared core logic, types, and utilities. Located in `server/` for Firebase Functions compatibility, ensuring it's packaged as a local dependency for server deployment. Built separately, used by server and client build processes.

## Setup and Installation

1.  **Clone repo.**
2.  **Install server dependencies:** `cd server && npm install && cd ..`
3.  **Install client dependencies:** `cd client && npm install && cd ..`
    _Note: Client builds depend on `../server/fizz-kidz`. Ensure its dependencies are installed._

## Development

**Client:**

Start the client dev server (hot reloading): `cd client && npm start`

- This builds `server/fizz-kidz` (watch), runs TS checker (watch), and starts Vite dev server (e.g., `localhost:5173`).

Other client scripts (`client/package.json`):

- `build:dev`: Development build.
- `build:prod`: Production build (to `client/dist`).
- `lint`: Lint client code.
- `ts:check`: Check types with TypeScript compiler.

**Server:**

Run server locally with Firebase emulators: `cd server && npm run serve`

- This builds server code (incl. `fizz-kidz`) (watch) and starts Firebase emulators (Functions, Pub/Sub) for local testing.

Other server scripts (`server/package.json`):

- `build`: Production build of server functions (to `server/lib`).
- `lint`: Lint server code.
- `logs`: Fetch Firebase functions logs.
- `test`: Run server-side tests (requires `fizz-kidz` build).

## Environment Configuration

- Client: use `vite --mode dev|prod` to choose which file to load (`client/.env` by default; merges `client/.env.prod` for prod builds).
- Server: uses `dotenv` with `server/src/load-env.ts` to read the Firebase project id and load `server/.env` (dev) or `server/.env.prod` (prod).
- GitHub: the workflow writes the correct env file(s) from Environment variable SERVER_ENV_FILE and CLIENT_ENV_FILE before build/deploy.

## Deployment

Deployed using Firebase.

- **Client (Firebase Hosting):**
  - Client app built to static assets (`client/dist/`).
  - Served by Firebase Hosting.
  - `firebase.json` defines hosting config (URL rewrites, `predeploy` script: `sh ./client/predeploy.sh`).
- **Server (Firebase Functions):**
  - tRPC API deployed as multiple Firebase Functions. Each router in `server/src/trpc/trpc.app-router.ts` (e.g., `partiesRouter`) is a distinct function.
  - Client dynamically routes tRPC requests to the correct Firebase Function URL (see `client/src/components/root/root.tsx` for tRPC client `fetch` logic).
  - `firebase.json` specifies `server/` as functions source.
  - `functions` `predeploy` script in `firebase.json` (`npm --prefix "$RESOURCE_DIR" run build`) builds server code.
  - Deploy via Firebase CLI:
    ```bash
    cd server && npm run deploy
    # Or from root: firebase deploy --only functions
    ```

See `firebase.json`, `client/package.json`, `server/package.json` for detailed configurations.
