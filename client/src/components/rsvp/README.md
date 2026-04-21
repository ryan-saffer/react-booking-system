# RSVP Feature (Invitation v2)

This folder contains the client-side experience for the invitation + RSVP flow.

## Entry Links

- Canonical public/share link: `https://bookings.fizzkidz.com.au/invite/:invitationId`
    - This is the guest-facing URL used in the share dialog and in invitation QR codes.
    - `invitationId` is stable once linked, so previously shared links and printed invites keep working after edits.
- Canonical host entry link: `https://bookings.fizzkidz.com.au/api/webhooks/invitation/:bookingId`
    - This is for the booking owner/host journey only.
    - It resolves to either the existing invitation or the create/design flow.
- Canonical app routes:
    - `https://bookings.fizzkidz.com.au/invite/:invitationId`
    - `https://bookings.fizzkidz.com.au/invite/:invitationId/rsvp`

## Legacy Links

- The host entry route remains long-term:
    - `https://bookings.fizzkidz.com.au/api/webhooks/invitation/:bookingId`
- Legacy public sharing of booking-based invite links is still supported until `2026-06-06`.
- That legacy public sharing includes:
    - `https://bookings.fizzkidz.com.au/api/webhooks/invitation/:bookingId`
    - `https://australia-southeast1-bookings-prod.cloudfunctions.net/api/api/webhooks/invitation/:bookingId`
    - `https://australia-southeast1-booking-system-6435d.cloudfunctions.net/api/api/webhooks/invitation/:bookingId`
- After `2026-06-06`, the route still stays for hosts, but the old public-sharing support assumptions can be removed along with the `/invitation/v2` compatibility route.

## Routing & Views

- `view-invitation-page` decides whether to show the public invite (for guests) or manage view (for authenticated owners).
- Guests see `view-invitation` (invitation preview + RSVP button). They can submit RSVPs; customers cannot edit RSVP responses.
- Owners see manage RSVPs (table of responses, edit/delete, edit invitation details, choose a new design, share/download).

## Authentication & Return Flow

- Saving/creating an invitation requires sign-in to protect customer/guest data.
- Sign-in supports a `returnTo` query param so hosts can log in and land back on manage RSVPs.

## Guest Experience

- Guests RSVP from the public invitation page; a confirmation email is sent after submission.

## Owner Experience

- Manage RSVPs: view/update/delete responses, edit invitation details, or regenerate with a different design.
- Share dialog: share link or download/print invite (QR code points back to the RSVP page).
