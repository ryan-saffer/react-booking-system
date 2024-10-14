import { InvitationsV2, Service } from 'fizz-kidz'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { useAuth } from '@components/Hooks/context/useAuth'
import Loader from '@components/Shared/Loader'

import { ManageRsvps } from '../manage-rsvps'
import { Navbar } from '../navbar'
import { ViewInvitation } from '../view-invitation'

/**
 * A middleware page to decide to show the RSVP tracker or guest page, depending on who is logged in.
 */
export function ViewInvitationPage() {
    const auth = useAuth()
    const firebase = useFirebase()

    const { id } = useParams()

    const [invitation, setInvitation] = useState<Service<InvitationsV2.Invitation>>({ status: 'loading' })

    useEffect(() => {
        const unsub = firebase.db
            .collection('invitations-v2')
            .doc(id)
            .onSnapshot((snap) => {
                if (snap.exists) {
                    const invitation = snap.data() as InvitationsV2.Invitation
                    // serialise dates back into dates
                    invitation.date = new Date(invitation.date)
                    invitation.rsvpDate = new Date(invitation.rsvpDate)
                    setInvitation({ status: 'loaded', result: invitation })
                }
            })

        return () => unsub()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    return (
        <div className="twp">
            <Navbar />
            {invitation.status === 'loading' && (
                <div className="flex h-screen w-screen items-center justify-center">
                    <Loader />
                </div>
            )}
            {invitation.status === 'error' && <h1>Something went wrong loading this invitation</h1>}
            {invitation.status === 'loaded' && auth && auth.uid === invitation.result.uid && (
                <ManageRsvps invitation={invitation.result} />
            )}
            {invitation.status === 'loaded' && (!auth || auth.uid !== invitation.result.uid) && (
                <ViewInvitation invitation={invitation.result} />
            )}
        </div>
    )
}
