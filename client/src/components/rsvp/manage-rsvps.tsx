import { InvitationsV2 } from 'fizz-kidz'

import { useRsvps } from './hooks/use-rsvps'

export function ManageRsvps({ invitation }: { invitation: InvitationsV2.Invitation }) {
    const rsvps = useRsvps(invitation)

    return (
        <>
            {rsvps.map((rsvp) => (
                <h1 key={rsvp.id}>{rsvp.children.map((child) => child.name).join(', ')}</h1>
            ))}
        </>
    )
}
