# Firestore Boundary

`DatabaseClient` is plumbing. It should know how Firestore works, not how Fizz Kidz works.

Keep here:

- Simple reads, writes, deletes, and queries
- Firestore mapping and timestamp conversion
- Caller-directed batches
- Small transaction frames needed for atomicity

Keep in `src/<feature>/core`:

- Cascades and workflows
- Validation and state transitions
- Permission decisions
- Third-party coordination
- The decision about what should be written and why

> A useful smell: if the method name sounds like something a staff member or customer does, it probably belongs in feature core.

Transactions may live here when Firestore requires them, but feature code should still make the domain decision. Inventory is the preferred example of this split.

Some older party and event methods mix persistence with workflow behavior. Treat them as migration candidates, not patterns to copy.
