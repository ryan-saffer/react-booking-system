# Fizz Kidz Core Module (`@fizz-kidz/core`)

This directory contains the `@fizz-kidz/core` module, a crucial internal library for the Fizz Kidz Portal. It encapsulates shared core business logic, type definitions, constants, and utilities used across the platform.

## Table of Contents

- [Purpose](#purpose)
- [Structure](#structure)
- [Build and Usage](#build-and-usage)

## Purpose

The `@fizz-kidz/core` module serves as the central hub for common functionalities and data structures:

- **Shared Business Logic:** Contains reusable functions and rules related to various aspects of the Fizz Kidz operations (e.g., bookings, scheduling, invoicing).
- **Type Definitions:** Provides a single source of truth for TypeScript types used by both the server-side Firebase Functions and the Portal (especially for data consistency).
- **Constants & Enums:** Centralizes platform-wide constants, like service locations, roles, permissions, and specific configurations for third-party services.
- **Utilities:** Offers helper functions for common tasks like date manipulation, string formatting, or interacting with third-party APIs in a standardized way.

Payment processing in the platform uses Square for all consumer payments; B2B invoices are issued via Xero.

**Location:**
This module lives at `packages/core/` and is published locally as `@fizz-kidz/core`. Deployable applications live under `apps/`; shared libraries like this one live under `packages/`.

It used to live inside `apps/server/` because the Functions deploy resolved it as a local `file:` dependency, which required it to sit inside the uploaded directory. That is no longer the case: the Functions bundle inlines this module from source at build time, so the deployed artifact never resolves it as a package. See [Build and Usage](#build-and-usage).

## Structure

The module is organized by feature or domain within its `src/` directory:

- **`src/index.ts`**: The main entry point that exports all public functionalities of the module.
- **`src/core/`**: Defines fundamental platform concepts like `Studio`, `Role`, `AuthUser`, and `Permission`.
- **`src/partyBookings/`**: Contains extensive logic for party bookings, including types for `Booking`, `Addition`, `Creation`, and `Invitation` utilities.
- **`src/acuity/`**, **`src/stripe/`**, **`src/square/`**, **`src/zoho/`**, **`src/paperform/`**: Provide types, constants, and utility functions for interacting with these respective third-party services.
- **`src/after-school-program/`**, **`src/holidayPrograms/`**, **`src/events/`**: Contain logic specific to these program types.
- **`src/onboarding/`**, **`src/timesheets/`**: Handle logic for staff onboarding and timesheets.
- **`src/firebase/`**: Contains specific Firebase-related utilities used within the module.
- **`src/utilities/`**: A collection of general-purpose helper functions.

## Build and Usage

- **Build:** Run `vp pack` from this directory, or `vp build` from the repository root. tsdown emits ESM and declarations to `lib/`.
- **Usage:**
  - **Server-Side:** `apps/server/vite.config.ts` aliases `@fizz-kidz/core` to `../../packages/core/src` and sets `deps.alwaysBundle: ['@fizz-kidz/core']`, so this module is inlined from source into `apps/server/lib/index.js`. The deployed Functions artifact therefore has no runtime dependency on `@fizz-kidz/core`, and `apps/server/package.json` does not list it.
  - **Portal:** The Portal resolves the workspace package directly to `packages/core/src` through the root Vite+ and TypeScript aliases. This provides shared runtime code and types without a separate development build.

Because both consumers read `src/` directly, the `lib/` output is not required to run or deploy the app. It exists so the package can be consumed as a normal ESM package with type declarations if that is ever needed.

This module is critical for maintaining consistency and reducing code duplication across the Fizz Kidz Portal.
