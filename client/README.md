# Fizz Kidz Portal - Client Application

This directory contains the frontend React application for the Fizz Kidz Portal.

## Table of Contents

-   [Key Technologies](#key-technologies)
-   [Project Structure](#project-structure)
-   [Routing](#routing)
-   [UI Components](#ui-components)
-   [State Management](#state-management)
-   [API Communication](#api-communication)
-   [Development](#development)

## Key Technologies

-   **Framework:** React
-   **Build Tool:** Vite
-   **Routing:** React Router DOM
-   **UI:** shadcn/ui (with Tailwind CSS & Radix UI). Material UI (MUI) and Ant Design are present but are being phased out.
-   **State Management:** Zustand (preferred), React Context
-   **API:** tRPC client

## Project Structure

The client-side code is organized within `client/src/`:

-   **`app.tsx`**: Entry point for routing configuration.
-   **`components/`**: Contains all React components, further organized by feature (e.g., `Bookings/`, `HolidayPrograms/`) or shared functionality (e.g., `Shared/`, `Session/`).
    -   **`components/root/root.tsx`**: The root component of the application. It wraps all page content and is responsible for setting up global context providers, including the tRPC client, authentication, theming, and more.
-   **`ui-components/`**: Likely contains `shadcn/ui` components.
-   **`utilities/`**: Helper functions and utilities.
-   **`hooks/`**: Custom React hooks.
-   **`assets/` or `drawables/`**: Static assets like images and fonts.

## Routing

-   **React Router DOM:** Routing is handled using `react-router-dom`, with routes defined in `client/src/app.tsx` using `createBrowserRouter`.
-   **Root Layout:** The `client/src/components/root/root.tsx` component serves as the primary layout shell, providing essential contexts (like tRPC, Auth, Theming) to all routes via the `<Outlet />` mechanism.
-   **Dashboard vs. Public Routes:** The application has a clear distinction between:
    -   **Dashboard Routes:** Primarily under the `/dashboard` path, often utilizing `DashboardLayout` and `ProtectedRoute` for authenticated staff access.
    -   **Public Routes:** Accessible to all users, such as sign-in/sign-up pages, program enrolment forms (e.g., `/after-school-program-enrolment-form`), customer booking screens, and invitation views.
-   **Lazy Loading:** All page components are lazy-loaded in `app.tsx` (using `React.lazy` and `Suspense`). This is a key optimization strategy for this Single Page Application (SPA), ensuring that users only download the code necessary for the parts of the portal they are interacting with, improving initial load times.

## UI Components

-   **`shadcn/ui`:** This is the current preferred UI component library, built upon Tailwind CSS and Radix UI. Components are typically added to the `ui-components/ui/` directory.
-   **Legacy Libraries:** Material UI (MUI) and Ant Design components are also present in the codebase but are being progressively phased out in favor of `shadcn/ui`.

## State Management

-   **Zustand:** Zustand is the preferred global state management solution for more complex state needs.
-   **React Context:** React's built-in Context API is also utilized, particularly for managing global concerns like authentication state (`components/Session/auth-provider.tsx`) and organization selection (`components/Session/org-provider.tsx`), often within the `Root` component's providers.

## API Communication

-   The client communicates with the backend server via tRPC.
-   The tRPC client is configured in `client/src/components/root/root.tsx` and made available to the component tree through a React Context provider. This setup enables type-safe API calls from anywhere in the application.
-   The client-side tRPC setup targets the single Express Firebase Function exposed at `/api/trpc` (implemented in `server/src/api.ts`), batching requests through one endpoint.

## Development

To run the client application in development mode:

```bash
npm start
```

This command (as defined in `client/package.json`) typically builds the shared `fizz-kidz` module (from `../server/fizz-kidz`), runs the TypeScript checker, and starts the Vite development server with hot reloading.
