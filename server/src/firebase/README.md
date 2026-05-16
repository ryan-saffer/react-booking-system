# Firebase Persistence Boundary

`DatabaseClient` is the persistence boundary for Firestore. Keep it thin: methods should describe database access, not business use cases.

## What Belongs Here

- Single-document reads, creates, updates, deletes, and straightforward queries.
- Small batch helpers that only persist caller-provided documents or delete caller-provided ids.
- Narrow transaction helpers when Firestore atomicity is required, as long as the caller supplies the domain-specific decision logic.
- Timestamp conversion and Firestore reference handling.

## What Does Not Belong Here

- Business workflows such as “delete an inventory item and everything related to it”.
- Domain decisions such as which stock records should exist for a new item.
- Validation rules such as whether an inventory item can receive a quantity or qualitative adjustment.
- Permission checks or tRPC/auth concerns.

Put those decisions in `server/src/<feature>/core`, then compose simple `DatabaseClient` calls there.

## When It Is OK To Break The Rule

Only let `DatabaseClient` coordinate multiple reads/writes when the coordination is required for Firestore consistency, for example a transaction that must read a current document and write the new version atomically.

Even then, keep the business logic outside the client. A good pattern is for `DatabaseClient` to provide the transaction frame and current database state, while the core function decides what should be written.

If a method name sounds like a user-facing workflow, it probably belongs in `core`, not in `DatabaseClient`.
