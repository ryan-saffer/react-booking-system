# Fizz Kidz Portal - Client Application

This directory contains the frontend React application for the Fizz Kidz Portal.

## Table of Contents

- [Key Technologies](#key-technologies)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [UI Components](#ui-components)
- [State Management](#state-management)
- [API Communication](#api-communication)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## Key Technologies

- **Framework:** React
- **Toolchain:** [Vite+](https://viteplus.dev/) (Vite/Rolldown build, Vitest tests, Oxlint, Oxfmt), configured in the root `vite.config.ts`
- **Routing:** React Router DOM
- **UI:** shadcn/ui (with Tailwind CSS & Radix UI). Material UI (MUI) and Ant Design are present but are being phased out.
- **State Management:** Zustand (preferred), React Context
- **API:** tRPC client

## Project Structure

The client-side code is organized within `apps/client/src/`:

- **`app.tsx`**: Entry point for routing configuration.
- **`components/`**: Contains all React components, further organized by feature (e.g., `Bookings/`, `HolidayPrograms/`) or shared functionality (e.g., `Shared/`, `Session/`).
  - **`components/root/root.tsx`**: The root component of the application. It wraps all page content and is responsible for setting up global context providers, including the tRPC client, authentication, theming, and more.
- **`ui-components/`**: Likely contains `shadcn/ui` components.
- **`utilities/`**: Helper functions and utilities.
- **`hooks/`**: Custom React hooks.
- **`assets/` or `drawables/`**: Static assets like images and fonts.

## Routing

- **React Router DOM:** Routing is handled using `react-router-dom`, with routes defined in `apps/client/src/app.tsx` using `createBrowserRouter`.
- **Root Layout:** The `apps/client/src/components/root/root.tsx` component serves as the primary layout shell, providing essential contexts (like tRPC, Auth, Theming) to all routes via the `<Outlet />` mechanism.
- **Dashboard vs. Public Routes:** The application has a clear distinction between:
  - **Dashboard Routes:** Primarily under the `/dashboard` path, often utilizing `DashboardLayout` and `ProtectedRoute` for authenticated staff access.
  - **Public Routes:** Accessible to all users, such as sign-in/sign-up pages, program enrolment forms (e.g., `/after-school-program-enrolment-form`), customer booking screens, and invitation views.
- **Lazy Loading:** All page components are lazy-loaded in `app.tsx` (using `React.lazy` and `Suspense`). This is a key optimization strategy for this Single Page Application (SPA), ensuring that users only download the code necessary for the parts of the portal they are interacting with, improving initial load times.

## UI Components

- **`shadcn/ui`:** This is the current preferred UI component library, built upon Tailwind CSS and Radix UI. Components are typically added to the `ui-components/ui/` directory.
- **Legacy Libraries:** Material UI (MUI) and Ant Design components are also present in the codebase but are being progressively phased out in favor of `shadcn/ui`.

## State Management

- **Zustand:** Zustand is the preferred global state management solution for more complex state needs.
- **React Context:** React's built-in Context API is also utilized, particularly for managing global concerns like authentication state (`components/Session/auth-provider.tsx`) and organization selection (`components/Session/org-provider.tsx`), often within the `Root` component's providers.

## API Communication

- The client communicates with the backend server via tRPC.
- The tRPC client is configured in `apps/client/src/components/root/root.tsx` and made available to the component tree through a React Context provider. This setup enables type-safe API calls from anywhere in the application.
- The client-side tRPC setup targets the single Express Firebase Function exposed at `/api/trpc` (implemented in `apps/server/src/api.ts`), batching requests through one endpoint.

## Development

To run the client application in development mode:

```bash
npm run client
```

Run this from the repository root. The root `vite.config.ts` owns the client configuration and resolves the shared `@fizz-kidz/core` source directly.

Use `npm run client:prod` to run the local client against the production backend and Firebase project.

## Testing

Client tests are Vitest files matching `apps/apps/client/src/**/*.test.{ts,tsx}`, using jsdom and Testing Library. They are registered as the `client` Vitest project in the root `vite.config.ts`, so run them from the repository root rather than from this directory:

```bash
# whole suite once (client + server)
npm test

# watch mode while developing
vp test

# only the client project
vp test --run --project client
```

Use `npm run verify` to run the checks and the full suite together before finishing a change.

## Deployment

Client-only changes deploy Firebase Hosting without redeploying Functions. Changes to the shared `@fizz-kidz/core` package conservatively deploy both targets.
