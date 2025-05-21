# Fizz Kidz Management Platform

This project is the backend and frontend for the Fizz Kidz management platform. It appears to be a comprehensive system for managing various aspects of the Fizz Kidz business, including:

*   Party bookings
*   Holiday programs
*   After-school programs
*   Event management
*   Invoicing and Payroll
*   Customer and staff management

## Table of Contents

*   [Client](#client)
*   [Server](#server)
*   [tRPC Interaction](#trpc-interaction)

## Client

The client-side application is responsible for the user interface and interaction.

*   **Framework:** Built with [React](https://react.dev/).
*   **Build Tool:** Uses [Vite](https://vitejs.dev/) for fast development and optimized builds (as indicated by `client/vite.config.ts`).
*   **Routing:** Implements client-side routing using [React Router DOM](https://reactrouter.com/) (`client/src/app.tsx`).
*   **API Consumption:** Communicates with the server using [tRPC](https://trpc.io/).
    *   The tRPC client is initialized in `client/src/utilities/trpc.ts`.
    *   This setup allows for type-safe API calls from React components to the server, as seen in various parts of `client/src/app.tsx` and its sub-components.

## Server

The server-side application handles business logic, data processing, and API provision.

*   **Environment:** Built with [Node.js](https://nodejs.org/) and written in [TypeScript](https://www.typescriptlang.org/).
*   **Structure:**
    *   The main entry point for the server functions is `server/src/index.ts`, which exports various modules corresponding to different features of the application (e.g., acuity, events, party bookings).
    *   A significant portion of the core business logic, including types, constants, and utility functions, is organized within the `server/fizz-kidz/src/index.ts` module.
*   **API with tRPC:**
    *   The server exposes a tRPC API to be consumed by the client.
    *   The API is structured into multiple feature-specific routers (like `partiesRouter`, `eventsRouter`, `holidayProgramsRouter`, etc.).
    *   These individual routers are consolidated into a single `appRouter` located in `server/src/trpc/trpc.app-router.ts`. This `appRouter` serves as the complete definition of the API.
    *   The `server/src/trpc/trpc.adapter.ts` file contains an adapter function `onRequestTrpc`. This function takes the `appRouter` and makes it available as an HTTP-based API endpoint, specifically tailored for deployment on [Firebase Functions](https://firebase.google.com/docs/functions). It handles incoming HTTP requests and directs them to the appropriate tRPC procedures.

## tRPC Interaction

[tRPC](https://trpc.io/) is a key technology used in this project to enable seamless and type-safe communication between the client and the server.

*   **Type Safety:** The most significant advantage of using tRPC here is end-to-end type safety. The server's API router (`AppRouter` defined in `server/src/trpc/trpc.app-router.ts`) exports its type definition. The client then imports this type (`client/src/utilities/trpc.ts`), allowing TypeScript to understand the API's shape, including procedure names, inputs, and outputs.
*   **Direct Function Calls:** This setup allows the client to call server-side procedures as if they were local functions. For example, if the server has a procedure `getUser`, the client can call `trpc.user.getUser.useQuery()` (or `.mutate()` for actions) with full type checking for parameters and return values.
*   **No Code Generation or Manual Synchronization:** Unlike traditional REST or GraphQL APIs that might require code generation or careful manual synchronization of schemas, tRPC's approach, by sharing types directly, largely automates this process and reduces the chances of client-server mismatches.
*   **Developer Experience:** This results in a significantly improved developer experience, with autocompletion for API routes and a clear understanding of data structures across the client and server.

The client initializes its tRPC client in `client/src/utilities/trpc.ts` and uses it to make queries and mutations to the server, which are defined in the various routers within `server/src/trpc/` and consolidated in `server/src/trpc/trpc.app-router.ts`.

## Project Structure

This project can be considered a monorepo, with the client and server codebases co-located. Key aspects:

*   **`client/`**: Contains the React frontend application.
*   **`server/`**: Contains the Node.js backend, including tRPC API definitions and Firebase functions.
*   **`server/fizz-kidz/`**: This is a crucial shared module containing core business logic, types, and utilities. It's built separately and used as a local dependency by both the main server code and potentially the client (or its build process).

## Setup and Installation

1.  **Clone the repository.**
2.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```
3.  **Install Client Dependencies:**
    ```bash
    cd client
    npm install
    cd ..
    ```
    *Note: The client `package.json` references `../server/fizz-kidz` for builds, so ensure server dependencies (especially for `fizz-kidz`) are installed or buildable.*

## Development

**Client:**

To start the client development server (usually with hot reloading):

```bash
cd client
npm start
```

This command typically:
*   Builds the `server/fizz-kidz` module in watch mode.
*   Runs the TypeScript checker in watch mode.
*   Starts the Vite development server (likely on a port like `localhost:5173`).

Other useful client scripts (from `client/package.json`):
*   `npm run build:dev`: Creates a development build.
*   `npm run build:prod`: Creates a production build (outputs to `client/dist`).
*   `npm run lint`: Lints the client codebase.
*   `npm run ts:check`: Runs the TypeScript compiler to check for type errors.

**Server:**

To run the server locally using Firebase emulators:

```bash
cd server
npm run serve
```

This command typically:
*   Builds the server code (including the `fizz-kidz` module) in watch mode.
*   Starts the Firebase emulators for Functions and Pub/Sub. This allows local testing of serverless functions.

Other useful server scripts (from `server/package.json`):
*   `npm run build`: Creates a production build of the server functions (outputs to `server/lib`).
*   `npm run lint`: Lints the server codebase.
*   `npm run logs`: Fetches Firebase functions logs.
*   `npm test`: Runs server-side tests (requires the `fizz-kidz` module to be built).

## Deployment

This project is configured for deployment using Firebase.

*   **Client (Hosting):**
    *   The client application is built into static assets (in `client/dist/`).
    *   Firebase Hosting serves these static assets.
    *   The `firebase.json` file defines hosting configurations, including URL rewrites (e.g., for single-page application routing) and a `predeploy` script (`sh ./client/predeploy.sh`).
*   **Server (Functions):**
    *   The server-side logic (including the tRPC API) is deployed as Firebase Functions.
    *   The `firebase.json` file specifies that the functions source is the `server/` directory.
    *   A `predeploy` script within the `functions` section of `firebase.json` (`npm --prefix "$RESOURCE_DIR" run build`) ensures the server code is built before deployment.
    *   Deployment is typically done via the Firebase CLI:
        ```bash
        # From the server directory
        cd server
        npm run deploy
        # Or using the Firebase CLI directly from the root (if configured)
        # firebase deploy --only functions
        # firebase deploy --only hosting
        ```

Refer to `firebase.json`, `client/package.json`, and `server/package.json` for more detailed scripts and configurations.
