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
  - [Lazy Instantiation of SDK Clients](#lazy-instantiation-of-sdk-clients)
- [Development](#development)

## Overview

The server provides the API for the client application and handles background tasks, integrations with third-party services, and business logic execution. It leverages a serverless architecture using Firebase Functions to ensure scalability and manage costs.

## Core Technologies

- **Runtime:** Node.js
- **Language:** TypeScript
- **Deployment:** Firebase Functions
- **API:** tRPC
- **Database:** Firebase Firestore (implicitly, via `fizz-kidz` module and Firebase Admin SDK usage)
- **Messaging:** Google Cloud Pub/Sub

## Project Structure

Key directories within `server/src/`:

-   **`index.ts`**: Main entry point that exports all deployable Firebase Functions.
-   **`fizz-kidz/`**: A crucial local module containing shared core business logic, types, and utilities. (See `server/fizz-kidz/README.md` for more details).
-   **`trpc/`**: Contains tRPC configuration, the main `appRouter` (primarily for type generation), and the `trpc.adapter.ts` used to wrap tRPC routers into Firebase Functions.
-   **Feature-Specific Directories (e.g., `acuity/`, `party-bookings/`, `stripe/`, `staff/`):** Each directory typically encapsulates logic related to a specific domain or feature.
    -   `core/`: Often contains the main business logic.
    -   `functions/`: Contains the actual Firebase Function handlers (tRPC, webhooks, Pub/Sub).
    -   `index.ts` (within each feature directory): Exports the functions to be included in the main `server/src/index.ts`.
-   **`firebase/`**: Utilities for interacting with Firebase services (Firestore, Pub/Sub, Storage).
-   **`utilities/`**: General helper functions.

## Function Types

All functions exported from `server/src/index.ts` are deployed as individual Firebase Functions. They primarily fall into these categories:

### tRPC Routers

-   Most of the API is built using tRPC.
-   Each feature-specific tRPC router (e.g., `partiesRouter` in `party-bookings/`, `authRouter` in `auth/`) is defined in its respective module.
-   These routers are then wrapped by the `onRequestTrpc` adapter function (from `server/src/trpc/trpc.adapter.ts`) and exported as individual HTTPS Firebase Functions. For example, the `partiesRouter` becomes the `parties` Firebase Function.
-   The main `appRouter` defined in `server/src/trpc/trpc.app-router.ts` consolidates all these individual routers. Its primary purpose is to generate the `AppRouter` TypeScript definition, which is shared with the client for end-to-end type safety, rather than being deployed as a single, monolithic API endpoint.

### Webhook Handlers

-   These are standard HTTPS Firebase Functions (using `onRequest`) designed to receive and process webhook calls from various third-party services.
-   **Key Webhook Integrations:**
    -   **Stripe (`stripe/functions/webhook.ts`):** Handles events like `payment_intent.succeeded` to trigger post-payment fulfillment logic (e.g., booking holiday programs).
    -   **Acuity Scheduling (`acuity/functions/webhook.ts`):** Processes updates from Acuity, such as new appointments or cancellations, to keep the portal's data in sync.
    -   **Paperform (`paperforms/functions/webhooks/paperform.webhook.ts`):** Ingests new form submissions from Paperform.
    -   **Contact Form 7 (`contact-form-7/webhook/contact-form-7-webhook.ts`):** Receives submissions from Contact Form 7, likely used on an external website.

### Pub/Sub Functions

-   These functions are triggered by messages published to Google Cloud Pub/Sub topics, enabling asynchronous background processing.
-   **Key Pub/Sub Tasks:**
    -   **Party Bookings (`party-bookings/functions/pubsub/...`):** Handles tasks like sending party confirmation forms, feedback emails, guest list emails, and reminder emails.
    -   **Paperform (`paperforms/functions/pubsub/paperform.pubsub.ts`):** Used for further processing of Paperform submissions after initial webhook ingestion (e.g., data transformation, notifications).

## Key Design Patterns

### Lazy Instantiation of SDK Clients

-   To optimize for cold starts in the serverless Firebase Functions environment, heavy third-party SDK clients (e.g., for Stripe, Xero, Acuity) are instantiated lazily.
-   This pattern typically involves:
    -   Using a singleton approach for client instances (e.g., `StripeClient.getInstance()`).
    -   Dynamically importing the SDK (`await import('some-sdk')`) only when the client is first requested.
    -   This ensures that a function invocation doesn't pay the performance penalty of importing and parsing large SDKs unless that specific SDK is actually needed for the current operation. An example can be seen in `server/src/stripe/core/stripe-client.ts`.

## Development

To run the server functions locally for development, Firebase emulators are used:

```bash
npm run serve
```

This command (from `server/package.json`) typically builds the server code (including the `fizz-kidz` module) in watch mode and starts the Firebase emulators for Functions and Pub/Sub.
