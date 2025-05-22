# Fizz Kidz Core Module (`fizz-kidz`)

This directory contains the `fizz-kidz` module, a crucial internal library for the Fizz Kidz Portal. It encapsulates shared core business logic, type definitions, constants, and utilities used across the platform.

## Table of Contents

- [Purpose](#purpose)
- [Structure](#structure)
- [Build and Usage](#build-and-usage)

## Purpose

The `fizz-kidz` module serves as the central hub for common functionalities and data structures:

-   **Shared Business Logic:** Contains reusable functions and rules related to various aspects of the Fizz Kidz operations (e.g., bookings, scheduling, invoicing).
-   **Type Definitions:** Provides a single source of truth for TypeScript types used by both the server-side Firebase Functions and potentially by the client-side application (especially for data consistency).
-   **Constants & Enums:** Centralizes platform-wide constants, like service locations, roles, permissions, and specific configurations for third-party services.
-   **Utilities:** Offers helper functions for common tasks like date manipulation, string formatting, or interacting with third-party APIs in a standardized way.

**Location within `server/`:**
This module is located within the main `server/` directory (as `server/fizz-kidz/`) primarily due to Firebase Functions' deployment model. Firebase requires local dependencies to be packaged within the function's root directory. Placing `fizz-kidz` here ensures it's correctly included when deploying the serverless functions.

## Structure

The module is organized by feature or domain within its `src/` directory:

-   **`src/index.ts`**: The main entry point that exports all public functionalities of the module.
-   **`src/core/`**: Defines fundamental platform concepts like `Location`, `Role`, `AuthUser`, and `Permission`.
-   **`src/partyBookings/`**: Contains extensive logic for party bookings, including types for `Booking`, `Addition`, `Creation`, and `Invitation` utilities.
-   **`src/acuity/`**, **`src/stripe/`**, **`src/square/`**, **`src/zoho/`**, **`src/paperform/`**: Provide types, constants, and utility functions for interacting with these respective third-party services.
-   **`src/after-school-program/`**, **`src/holidayPrograms/`**, **`src/events/`**: Contain logic specific to these program types.
-   **`src/onboarding/`**, **`src/timesheets/`**: Handle logic for staff onboarding and timesheets.
-   **`src/firebase/`**: Contains specific Firebase-related utilities used within the module.
-   **`src/utilities/`**: A collection of general-purpose helper functions.

## Build and Usage

-   **Build:** The `fizz-kidz` module has its own `package.json` and build process (typically `npm run build` within `server/fizz-kidz/`). This compiles the TypeScript code into JavaScript.
-   **Usage:**
    -   **Server-Side:** The main `server/` application (containing Firebase Functions) lists `fizz-kidz` as a local file dependency in its `package.json` (e.g., `"fizz-kidz": "file:fizz-kidz"`). This allows server functions to import and use the compiled code from this module.
    -   **Client-Side:** The `client/` application also references `fizz-kidz` in its `package.json` (e.g., `"fizz-kidz": "file:../server/fizz-kidz"`) and its build scripts often trigger a build of the `fizz-kidz` module. This is primarily for accessing shared types to ensure consistency between client and server, and potentially some utility functions if needed.

This module is critical for maintaining consistency and reducing code duplication across the Fizz Kidz Portal.
