# Fizz Kidz Portal - Server Application

This directory contains the backend Node.js application for the Fizz Kidz Portal, built with TypeScript and deployed primarily on Firebase Functions.

## Table of Contents

-   [Overview](#overview)
-   [Core Technologies](#core-technologies)
-   [Project Structure](#project-structure)
-   [Function Types](#function-types)
    -   [tRPC Routers](#trpc-routers)
    -   [Webhook Handlers](#webhook-handlers)
    -   [Pub/Sub Functions](#pubsub-functions)
-   [Key Design Patterns](#key-design-patterns)
    -   [Lazy Instantiation of SDK Clients](#lazy-instantiation-of-sdk-clients)
-   [Development](#development)

## Overview

The server provides the API for the client application and handles background tasks, integrations with third-party services, and business logic execution. It leverages a serverless architecture using Firebase Functions to ensure scalability and manage costs.

## Core Technologies

-   **Runtime:** Node.js
-   **Language:** TypeScript
-   **Deployment:** Firebase Functions
-   **API:** tRPC
-   **Database:** Firebase Firestore (implicitly, via `fizz-kidz` module and Firebase Admin SDK usage)
-   **Messaging:** Google Cloud Pub/Sub
-   **Payments:** Square for all consumer payments (orders, payments, refunds). B2B invoices are issued via Xero.

## Project Structure

Key directories within `server/src/`:

-   **`index.ts`**: Main entry point that exports all deployable Firebase Functions.
-   **`fizz-kidz/`**: A crucial local module containing shared core business logic, types, and utilities. (See `server/fizz-kidz/README.md` for more details).
-   **`trpc/`**: Contains tRPC configuration and the main `appRouter`, which aggregates all feature routers for the Express API.
-   **Feature-Specific Directories (e.g., `acuity/`, `party-bookings/`, `square/`, `staff/`):** Each directory typically encapsulates logic related to a specific domain or feature.
    -   `core/`: Often contains the main business logic.
    -   `functions/`: Houses Express routers and background handlers that are mounted within `server/src/api.ts` or invoked by `server/src/pubsub.ts`.
    -   `index.ts` (within each feature directory): Exports the functions to be included in the main `server/src/index.ts`.
-   **`firebase/`**: Utilities for interacting with Firebase services (Firestore, Pub/Sub, Storage).
-   **`utilities/`**: General helper functions.

## Function Types

Functions exported from `server/src/index.ts` are deployed via Firebase. The current exports are the HTTPS `api` function and the Pub/Sub `pubsub` dispatcher, which align with the following categories:

### tRPC Routers

-   Most of the API is built using tRPC.
-   Each feature-specific tRPC router (e.g., `partiesRouter` in `party-bookings/`, `authRouter` in `auth/`) is defined in its respective module and combined via `appRouter` (`server/src/trpc/trpc.app-router.ts`).
-   The combined router is mounted once inside the Express app defined in `server/src/api.ts`, which serves the `/api/trpc` endpoint through the single `api` Firebase Function.
-   The shared `AppRouter` type is still used by the client for end-to-end type safety.

### Webhook Handlers

-   HTTPS webhook handlers are implemented as Express routers and mounted within `server/src/api.ts` under `/api/webhooks/*`.
-   **Key Webhook Integrations:**
    -   **Acuity Scheduling (`acuity/functions/webhook.ts`):** Processes updates from Acuity, such as new appointments or cancellations. Notably, holiday program cancellations trigger Square refunds for the corresponding order line items.
    -   **Paperform (`paperforms/functions/webhooks/paperform.webhook.ts`):** Ingests new form submissions from Paperform.
    -   **Contact Form 7 (`contact-form-7/webhook/contact-form-7-webhook.ts`):** Receives submissions from Contact Form 7.

### Pub/Sub Functions

-   The `pubsub` export listens to the single `background` Pub/Sub topic and dispatches work based on the message `name` field (`server/src/pubsub.ts`).
-   **Key Pub/Sub Tasks:**
    -   **Party Bookings (`party-bookings/core/...`):** Handles tasks like sending party confirmation forms, feedback emails, guest list emails, and reminder emails.
    -   **Paperform (`paperforms/functions/pubsub/paperform.pubsub.ts`):** Used for further processing of Paperform submissions after initial webhook ingestion (e.g., data transformation, notifications).

## Key Design Patterns

### Lazy Instantiation of SDK Clients

-   To optimize for cold starts in the serverless Firebase Functions environment, heavy third-party SDK clients (e.g., for Square, Xero, Acuity) are instantiated lazily.
-   This pattern typically involves:
    -   Using a singleton approach for client instances (e.g., `SquareClient.getInstance()`).
    -   Dynamically importing the SDK (`await import('some-sdk')`) only when the client is first requested.
    -   This ensures that a function invocation doesn't pay the performance penalty of importing and parsing large SDKs unless that specific SDK is actually needed for the current operation. An example can be seen in `server/src/square/core/square-client.ts`.

## Installation

Before running `npm install` the following packages must be installed using homebrew:

```sh
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman python-setuptools
```

This is needed for installation of the [canvas library](https://github.com/Automattic/node-canvas?tab=readme-ov-file#installation) on macOS with Apple Silicon.

You can then install dependencies by running:

```sh
npm install canvas --build-from-source
npm install
```

## Run Locally

To run the server functions locally for development, Firebase emulators are used:

```bash
npm run serve
```

This command (from `server/package.json`) typically builds the server code (including the `fizz-kidz` module) in watch mode and starts the Firebase emulators for Functions and Pub/Sub.
