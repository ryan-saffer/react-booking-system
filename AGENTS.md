# Agent Guide

Read the root [`README.md`](README.md), then the README nearest the code being changed.

## Find The Code

- Portal routes: `apps/portal/src/app.tsx`
- Portal providers/tRPC: `apps/portal/src/components/root/root.tsx`
- Server HTTP: `apps/server/src/api.ts`
- Server tRPC: `apps/server/src/trpc/trpc.app-router.ts`
- Background jobs: `apps/server/src/pubsub.ts`
- Shared exports: `packages/core/src/index.ts`
- Tooling: `package.json` and `vite.config.ts`

## Commands

Run from the repository root:

```bash
npm run dev             # Portal + server + emulators
npm run portal          # Portal only
npm run server          # Server only
npm run website         # Public Astro site
npm run docs            # Starlight knowledge base
npm run check           # Read-only checks
npm run test            # Portal + server tests
npm run verify          # Fix checks + tests
npm run verify:full     # Include Astro checks
```

Scope tests with `vp test --run --project portal` or `vp test --run --project server`. Build Astro apps with `npm run build --workspace docs` or `npm run build --workspace website`.

## Boundaries

- Shared and runtime-neutral: `packages/core`; export from `src/index.ts`.
- Firebase, Firestore, and Portal backend integrations: `apps/server`.
- App-specific runtime I/O may stay in its owning deployable app.
- Firestore access stays thin; workflows belong in feature `core` directories. Read `apps/server/src/firebase/README.md`.
- New Portal UI should prefer shadcn/ui and Zustand. MUI and Ant Design are legacy.
- Backend browser routes must match in `api.ts`, `firebase.json`, and the root Vite proxy.

Do not touch unrelated worktree changes or commit credentials. Build the affected app after changing build configuration, and update the nearest README when an important boundary changes.
