# RSVP / Invitation v2 (Server)

This folder contains the server-side implementation of the v2 invitation + RSVP system for party bookings.

## Core Data Model

- Each party booking stores:
    - `invitationId`: ID of the current invitation linked to the booking.
    - `ownerUid`: owner of the invitation/booking (required to manage RSVPs).
- RSVPs live as a child collection under the party booking in Firestore. This decouples RSVP data from the invitation asset so invitations can be edited/re-generated without losing responses.

## Invitation Lifecycle

1. **Generate (temp storage)**: When a user designs an invite, the generated image is written to Firebase Storage under a temp path. This prevents cluttering storage with abandoned designs.
2. **Link invitation**: After the user confirms the design, the temp asset is moved into a permanent path keyed by `invitationId`, and the booking is updated with `invitationId`/`ownerUid`.
3. **Update/Delete**: Subsequent edits regenerate and overwrite the linked asset; deleting resets/removes the linkage but keeps RSVPs intact.

## RSVP Handling

- RSVPs are stored per child under the booking, allowing multiple invitations/designs without affecting responses.
- This keeps a single source of truth for who is attending, independent of any specific invitation image.
- Future use: expose aggregated RSVP data to party hosts or other systems.

## Image Generation

- Uses `node-canvas` to load a template image from the server and render text/fields onto a new canvas, producing a high-quality PNG.
- A QR code is generated and drawn onto the invite so guests can scan a printed invite and still RSVP online.

## Public Entry → Routing

- Canonical public/share URL: `https://bookings.fizzkidz.com.au/invite/:invitationId`
    - This is the guest-facing URL used in the share dialog and QR code.
    - This route is handled directly by the client and is the canonical URL that guests should share.
- Canonical host entry URL: `https://bookings.fizzkidz.com.au/api/webhooks/invitation/:bookingId`
    - This is the booking-owner entry point used from booking flows and staff tools.
    - If the booking already has an invitation, it redirects to the canonical public/share URL.
    - If no invitation exists yet, it redirects to the create/design flow.
- App route family: `https://bookings.fizzkidz.com.au/invite`
    - `/invite/:invitationId` shows the invitation.
    - `/invite/:invitationId/rsvp` shows the RSVP form.
    - The client decides whether to show the public invite or the manage-RSVPs screen based on auth.

## Legacy Compatibility

- The host entry route stays long-term: `https://bookings.fizzkidz.com.au/api/webhooks/invitation/:bookingId`
- Legacy public usage of booking-based invite links stays supported until `2026-06-06`.
- That legacy public usage includes:
    - Hosted domain links on `https://bookings.fizzkidz.com.au/api/webhooks/invitation/:bookingId`
    - Prod raw function URL: `https://australia-southeast1-bookings-prod.cloudfunctions.net/api/api/webhooks/invitation/:bookingId`
    - Dev raw function URL: `https://australia-southeast1-booking-system-6435d.cloudfunctions.net/api/api/webhooks/invitation/:bookingId`
- After `2026-06-06`, the route itself stays, but the legacy public-link wording/support assumptions can be removed.
- After `2026-06-06`, the following RSVP-only compatibility code can be deleted:
    - The legacy `/invitation/v2` route block in `client/src/app.tsx`
