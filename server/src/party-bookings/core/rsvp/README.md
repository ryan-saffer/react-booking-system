# RSVP / Invitation v2 (Server)

This folder contains the server-side implementation of the v2 invitation + RSVP system for party bookings.

## Core Data Model
- Each party booking stores:
  - `invitationId`: ID of the current invitation linked to the booking.
  - `ownerUid`: owner of the invitation/booking (required to manage RSVPs).
- RSVPs live as a child collection under the party booking in Firestore. This decouples RSVP data from the invitation asset so invitations can be edited/re-generated without losing responses.

## Invitation Lifecycle
1) **Generate (temp storage)**: When a user designs an invite, the generated image is written to Firebase Storage under a temp path. This prevents cluttering storage with abandoned designs.
2) **Link invitation**: After the user confirms the design, the temp asset is moved into a permanent path keyed by `invitationId`, and the booking is updated with `invitationId`/`ownerUid`.
3) **Update/Delete**: Subsequent edits regenerate and overwrite the linked asset; deleting resets/removes the linkage but keeps RSVPs intact.

## RSVP Handling
- RSVPs are stored per child under the booking, allowing multiple invitations/designs without affecting responses.
- This keeps a single source of truth for who is attending, independent of any specific invitation image.
- Future use: expose aggregated RSVP data to party hosts or other systems.

## Image Generation
- Uses `node-canvas` to load a template image from the server and render text/fields onto a new canvas, producing a high-quality PNG.
- A QR code is generated and drawn onto the invite so guests can scan a printed invite and still RSVP online.

## Public Entry → Routing
- All users hit `https://bookings.fizzkidz.com.au/api/webhooks/invitation/:id`.
  - If no invitation exists yet for the booking: redirect to the creation flow (requires sign-in to save).
  - If an invitation exists: redirect to `https://bookings.fizzkidz.com.au/invitation/v2/:invitationId`, where clients decide between public view vs manage RSVPs based on auth.
- The webhook router responsible for this is `server/src/party-bookings/functions/webhooks/invitation-redirect.ts`, which resolves the booking, checks for an existing invitation, and redirects accordingly.
