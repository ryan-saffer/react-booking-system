# Operational Scripts

An interactive toolbox for reports, migrations, cleanup jobs, and one-off fixes.

> **These are not a sandbox.** Both commands connect to a real Firebase project. Some choices mutate data, delete records, call paid APIs, or send real email. Read the selected script before continuing.

## Credentials

Keep the two service-account files here:

```text
apps/server/scripts/.credentials/bookings-dev.json
apps/server/scripts/.credentials/bookings-prod.json
```

The directory is ignored by Git. If a key needs replacing, create a new service-account key in the matching Firebase project and save it under the name above.

## Run Against Development

From the repository root, export the development credentials into the current shell and start the picker:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/apps/server/scripts/.credentials/bookings-dev.json"
npm --workspace server run script:dev
```

## Run Against Production

Use the production key and production command together:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/apps/server/scripts/.credentials/bookings-prod.json"
npm --workspace server run script:prod
```

`GOOGLE_APPLICATION_CREDENTIALS` selects the service-account key. The npm command sets `FIREBASE_CONFIG`, which selects the Firebase project and whether `.env` or `.env.prod` is loaded. Do not mix the development key with `script:prod` or the production key with `script:dev`.

The export only affects the current terminal session. Clear it afterwards if needed:

```bash
unset GOOGLE_APPLICATION_CREDENTIALS
```
