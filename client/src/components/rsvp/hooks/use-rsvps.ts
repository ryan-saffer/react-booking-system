import { InvitationsV2, Rsvp, Service } from 'fizz-kidz'
import { useEffect, useState } from 'react'

import useFirebase from '@components/Hooks/context/UseFirebase'

export function useRsvps(invitation: InvitationsV2.Invitation) {
    const firebase = useFirebase()

    const [rsvps, setRsvps] = useState<
        Service<{
            rsvps: Rsvp[]
            attendingCount: number
            notAttendingCount: number
            updateRsvp: (id: string, rsvp: Rsvp['rsvp']) => Promise<void>
        }>
    >({ status: 'loading' })

    function updateRsvp(id: string, rsvp: Rsvp['rsvp']) {
        return firebase.db.doc(`bookings/${invitation.bookingId}/rsvps/${id}`).update({ rsvp })
    }

    useEffect(() => {
        const unsub = firebase.db.collection(`bookings/${invitation.bookingId}/rsvps`).onSnapshot((snap) => {
            const rsvps = snap.docs.map((doc) => doc.data() as Rsvp)
            const attendingCount = rsvps.filter((it) => it.rsvp === 'attending').length
            const notAttendingCount = rsvps.filter((it) => it.rsvp === 'not-attending').length
            setRsvps({
                status: 'loaded',
                result: {
                    rsvps,
                    attendingCount,
                    notAttendingCount,
                    updateRsvp,
                },
            })
        })

        return () => unsub()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return rsvps
}
