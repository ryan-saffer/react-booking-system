# Fizz Kidz Portal - Server Application

This directory contains the backend Node.js application for the Fizz Kidz Portal, built with TypeScript and deployed primarily on Firebase Functions.

## Table of Contents

- [Overview](#overview)
- [Core Technologies](#core-technologies)
- [Project Structure](#project-structure)
- [Function Types](#function-types)
  - [tRPC Routers](#trpc-routers)
  - [Webhook Handlers](#webhook-handlers)
  - [Pub/Sub Functions](#pubsub-functions)
- [Key Design Patterns](#key-design-patterns)
  - [DatabaseClient Boundary](#databaseclient-boundary)
  - [Lazy Instantiation of SDK Clients](#lazy-instantiation-of-sdk-clients)
- [Installation](#installation)
- [Run Locally](#run-locally)
- [Operational Scripts](#operational-scripts)
- [Testing](#testing)

## Overview

The server provides the API for the client application and handles background tasks, integrations with third-party services, and business logic execution. It leverages a serverless architecture using Firebase Functions to ensure scalability and manage costs.

## Core Technologies

- **Runtime:** Node.js
- **Language:** TypeScript
- **Deployment:** Firebase Functions
- **API:** tRPC
- **Database:** Firebase Firestore (implicitly, via the `@fizz-kidz/core` module and Firebase Admin SDK usage)
- **Messaging:** Google Cloud Pub/Sub
- **Payments:** Square for all consumer payments (orders, payments, refunds). B2B invoices are issued via Xero.

## Project Structure

Key directories within `apps/server/src/`:

- **`index.ts`**: Main entry point that exports all deployable Firebase Functions.
- **`trpc/`**: Contains tRPC configuration and the main `appRouter`, which aggregates all feature routers for the Express API.
- **Feature-Specific Directories (e.g., `acuity/`, `party-bookings/`, `square/`, `staff/`):** Each directory typically encapsulates logic related to a specific domain or feature.
  - `core/`: Often contains the main business logic.
  - `functions/`: Houses Express routers and background handlers that are mounted within `apps/server/src/api.ts` or invoked by `apps/server/src/pubsub.ts`.
  - `index.ts` (within each feature directory): Exports the functions to be included in the main `apps/server/src/index.ts`.
- **`firebase/`**: Utilities for interacting with Firebase services (Firestore, Pub/Sub, Storage).
- **`utilities/`**: General helper functions.

## Function Types

Functions exported from `apps/server/src/index.ts` are deployed via Firebase. The current exports are the HTTPS `api` function and the Pub/Sub `pubsub` dispatcher, which align with the following categories:

### tRPC Routers

- Most of the API is built using tRPC.
- Each feature-specific tRPC router (e.g., `partiesRouter` in `party-bookings/`, `authRouter` in `auth/`) is defined in its respective module and combined via `appRouter` (`apps/server/src/trpc/trpc.app-router.ts`).
- The combined router is mounted once inside the Express app defined in `apps/server/src/api.ts`, which serves the `/api/trpc` endpoint through the single `api` Firebase Function.
- The shared `AppRouter` type is still used by the client for end-to-end type safety.

### Webhook Handlers

- HTTPS webhook handlers are implemented as Express routers and mounted within `apps/server/src/api.ts` under `/api/webhooks/*`.
- **Key Webhook Integrations:**
  - **Acuity Scheduling (`acuity/functions/webhook.ts`):** Processes updates from Acuity, such as new appointments or cancellations. Notably, holiday program cancellations trigger Square refunds for the corresponding order line items.
  - **Paperform (`paperforms/functions/webhooks/paperform.webhook.ts`):** Ingests new form submissions from Paperform.
  - **Contact Form 7 (`contact-form-7/webhook/contact-form-7-webhook.ts`):** Receives submissions from Contact Form 7.
  - **Invitation redirect (`party-bookings/functions/webhooks/invitation-redirect.ts`):** Single entry for invitation links that resolves the booking and redirects either to create or view/manage the invitation (see `party-bookings/core/rsvp/README.md`).

### Pub/Sub Functions

- The `pubsub` export listens to the single `background` Pub/Sub topic and dispatches work based on the message `name` field (`apps/server/src/pubsub.ts`).
- **Key Pub/Sub Tasks:**
  - **Party Bookings (`party-bookings/core/...`):** Handles tasks like sending party confirmation forms, feedback emails, guest list emails, and reminder emails.
  - **Paperform (`paperforms/functions/pubsub/paperform.pubsub.ts`):** Used for further processing of Paperform submissions after initial webhook ingestion (e.g., data transformation, notifications).

## Key Design Patterns

### DatabaseClient Boundary

- `apps/server/src/firebase/DatabaseClient.ts` should stay as a thin Firestore access layer.
- Keep feature workflows, cascades, permission checks, and domain validation in `apps/server/src/<feature>/core`.
- It is acceptable for `DatabaseClient` to expose narrow batch or transaction helpers when Firestore atomicity requires it, but the caller should decide what documents should be written and why.
- See `apps/server/src/firebase/README.md` for the detailed boundary rules.

### Lazy Instantiation of SDK Clients

- To optimize for cold starts in the serverless Firebase Functions environment, heavy third-party SDK clients (e.g., for Square, Xero, Acuity) are instantiated lazily.
- This pattern typically involves:
  - Using a singleton approach for client instances (e.g., `SquareClient.getInstance()`).
  - Dynamically importing the SDK (`await import('some-sdk')`) only when the client is first requested.
  - This ensures that a function invocation doesn't pay the performance penalty of importing and parsing large SDKs unless that specific SDK is actually needed for the current operation. An example can be seen in `apps/server/src/square/core/square-client.ts`.

## Installation

There are no server-specific installation steps. Install the whole workspace from the repository root:

```sh
vp install
```

### Adding a dependency to this package

Add it from the repository root, targeting this workspace by name:

```sh
vp add <pkg> --filter server
```

If the dependency is needed at runtime in Firebase Functions (not just for local tooling), also refresh the standalone lockfile that the Functions deploy uses, since that is the manifest Cloud Build installs from:

```sh
npm install --package-lock-only --ignore-scripts --workspaces=false --prefix server
```

## Run Locally

To run the server functions locally for development, Firebase emulators are used:

```bash
npm run server
```

Run this from the repository root. It watches the Functions bundle and server TypeScript projects, then starts the Functions and Pub/Sub emulators. Use `vp dev` instead to start the complete client and server stack in one terminal.

The Functions bundle resolves `@fizz-kidz/core` directly to its source, so the single bundle watcher rebuilds after changes in either `apps/server/src` or `packages/core/src`. It does not watch client files. Separate TypeScript watchers report server and shared-module type errors without producing another build artifact.

Invitation generation in the emulator uses an installed Google Chrome rather than downloading a separate browser with Puppeteer. If Chrome is installed in a non-standard location, set `PUPPETEER_EXECUTABLE_PATH` to its executable before starting the emulators. Production continues to use `@sparticuz/chromium`.

## Operational Scripts

One-off maintenance and reporting tasks live in `apps/server/src/_scripts/`. `main.ts` presents an interactive picker of the available scripts:

```bash
# dev Firebase project (booking-system-6435d)
npm --workspace server run script:dev

# production Firebase project (bookings-prod)
npm --workspace server run script:prod
```

These run through `tsx`, which executes the TypeScript directly and honours the `@fizz-kidz/core` and `@/*` path aliases in `apps/server/tsconfig.json`. They transpile without type checking, so rely on `vp check` for type safety. They talk to the real Firebase project named in the script, so prefer `script:dev` unless you specifically need production data.

## Testing

Server tests are Vitest files matching `apps/apps/server/src/**/*.test.ts`. They are registered as the `server` Vitest project in the root `vite.config.ts`, so run them from the repository root rather than from this directory:

```bash
# whole suite once (client + server)
npm test

# watch mode while developing
vp test

# only the server project
vp test --run --project server
```

Use `npm run verify` to run the checks and the full suite together before finishing a change.
