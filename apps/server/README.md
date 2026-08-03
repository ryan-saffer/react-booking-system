# Server

The Portal's backend and shared operational infrastructure live here: Firestore, webhooks, background work, secrets, and third-party APIs. App-specific server code can stay with its owning app.

The deployment is deliberately small: one HTTP function and one Pub/Sub function.

## The Shape

- `src/index.ts` exports Firebase Functions.
- `src/api.ts` mounts tRPC, webhooks, public API routes, and durable redirects.
- `src/trpc/trpc.app-router.ts` combines the feature routers.
- `src/pubsub.ts` dispatches messages from the shared `background` topic.
- `src/<feature>/core` contains workflows.
- `src/<feature>/functions` contains HTTP, tRPC, webhook, or job adapters.
- `src/firebase/DatabaseClient.ts` is the Firestore boundary.

The `api` function owns `/api/trpc`, `/api/webhooks/**`, public endpoints such as Google reviews, and `/forms/**`. The `pubsub` function handles reminders, follow-ups, form processing, onboarding, timesheets, and other deferred work.

## Rules Of Thumb

- Keep `DatabaseClient` about persistence, not business decisions. See [`src/firebase/README.md`](src/firebase/README.md).
- Put browser/server-safe contracts and pure logic in `@fizz-kidz/core`.
- Keep credentials, SDK clients, Firestore, and network calls here.
- Load heavyweight SDKs lazily; Firebase cold starts notice everything.
- Register new tRPC routers in `trpc.app-router.ts` and new background handlers in `pubsub.ts`.

## Run It

```bash
npm run server
vp test --run --project server
npm --workspace server run build
```

The dev command watches server and core code, type-checks both, and starts the Functions/Pub/Sub emulators. Environment loading selects `.env` for development and `.env.prod` for production.

## Dependencies

```bash
vp add <package> --filter server
npm install --package-lock-only --ignore-scripts --workspaces=false --prefix apps/server
```

> **Do both.** Firebase Cloud Build validates the standalone `apps/server/package-lock.json`. Refresh it after any dependency change in `apps/server/package.json`, including dev dependencies.

## Scripts With Consequences

`src/_scripts` contains reporting jobs, migrations, real-email senders, and production mutations. Set up credentials and read the warnings in [`src/_scripts/README.md`](src/_scripts/README.md) before running one.

```bash
npm --workspace server run script:dev
npm --workspace server run script:prod
```

These run through `tsx` without type checking and connect to the named real Firebase project.

Firebase deploys `apps/server` as the Functions source. `lib/index.js` is its Node 22 CommonJS entrypoint; `@fizz-kidz/core` is bundled there while normal server dependencies are installed from the package manifest and lockfile.
