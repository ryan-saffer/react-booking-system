# RSVP Feature (Invitation v2)

This folder contains the client-side experience for the new invitations + RSVP flow. Parents and guests all enter via the same link and are routed based on whether an invitation exists and whether the visitor is authenticated.

## Entry Links
- Public link: `https://bookings.fizzkidz.com.au/api/webhooks/invitation/:id`
  - Handled server-side; redirects to the appropriate screen.
- If no invitation exists yet: user is sent to create/design flow (requires sign-in to save).
- If an invitation exists: redirect to `https://bookings.fizzkidz.com.au/invitation/v2/:invitationId`.

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
