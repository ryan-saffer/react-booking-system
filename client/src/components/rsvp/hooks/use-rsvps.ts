import { InvitationsV2, Rsvp } from 'fizz-kidz'
import { useEffect, useState } from 'react'

import useFirebase from '@components/Hooks/context/UseFirebase'

export function useRsvps(invitation: InvitationsV2.Invitation) {
    const firebase = useFirebase()

    const [rsvps, setRsvps] = useState<Rsvp[]>([])

    useEffect(() => {
        const unsub = firebase.db.collection(`bookings/${invitation.bookingId}/rsvps`).onSnapshot((snap) => {
            setRsvps(snap.docs.map((doc) => doc.data() as Rsvp))
        })

        return () => unsub()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return rsvps
}
