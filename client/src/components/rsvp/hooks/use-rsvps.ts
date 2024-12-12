import { InvitationsV2, Rsvp, Service } from 'fizz-kidz'
import { useEffect, useState } from 'react'

import useFirebase from '@components/Hooks/context/UseFirebase'

import { UseRsvpTableProps } from './use-rsvp-table'

export function useRsvps(invitation: InvitationsV2.Invitation) {
    const firebase = useFirebase()

    const [rsvps, setRsvps] = useState<
        Service<
            UseRsvpTableProps & {
                attendingCount: number
                notAttendingCount: number
            }
        >
    >({ status: 'loading' })

    const updateRsvp: UseRsvpTableProps['updateRsvp'] = async (id, childIdx, rsvp) => {
        // since children are an array, need to read the whole doc, update the child at the index, then update entire doc
        const existingRsvp = (
            await firebase.db.doc(`bookings/${invitation.bookingId}/rsvps/${id}`).get()
        ).data() as Rsvp
        const existingChild = existingRsvp.children[childIdx]
        const updatedChild = { ...existingChild, rsvp }
        existingRsvp.children[childIdx] = updatedChild
        return firebase.db.doc(`bookings/${invitation.bookingId}/rsvps/${id}`).update(existingRsvp)
    }

    const deleteRsvp: UseRsvpTableProps['deleteRsvp'] = async (id, childIdx) => {
        // get existing
        const existingRsvp = (
            await firebase.db.doc(`bookings/${invitation.bookingId}/rsvps/${id}`).get()
        ).data() as Rsvp
        if (existingRsvp.children.length === 1) {
            // delete the entire RSVP
            await firebase.db.doc(`bookings/${invitation.bookingId}/rsvps/${id}`).delete()
        } else {
            // remove just this child from the array
            existingRsvp.children.splice(childIdx, 1)
            await firebase.db.doc(`bookings/${invitation.bookingId}/rsvps/${id}`).update(existingRsvp)
        }
    }

    useEffect(() => {
        const unsub = firebase.db.collection(`bookings/${invitation.bookingId}/rsvps`).onSnapshot((snap) => {
            const rsvps = snap.docs.map((doc) => doc.data() as Rsvp)
            const attendingCount = rsvps.reduce(
                (acc, curr) => acc + curr.children.filter((it) => it.rsvp === 'attending').length,
                0
            )
            const notAttendingCount = rsvps.reduce(
                (acc, curr) => acc + curr.children.filter((it) => it.rsvp === 'not-attending').length,
                0
            )
            setRsvps({
                status: 'loaded',
                result: {
                    rsvps,
                    attendingCount,
                    notAttendingCount,
                    updateRsvp,
                    deleteRsvp,
                },
            })
        })

        return () => unsub()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitation.bookingId])

    return rsvps
}
