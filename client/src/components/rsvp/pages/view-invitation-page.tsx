import type { InvitationsV2, Service } from 'fizz-kidz'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { useAuth } from '@components/Hooks/context/useAuth'
import Loader from '@components/Shared/Loader'
import { timestampConverter } from '@utils/firebase/converters'

import { InvitationProvider } from '../hooks/invitation-provider'
import { ManageRsvps } from '../manage-rsvps/manage-rsvps'
import { Navbar } from '../navbar'
import { ViewInvitation } from '../view-invitation'

/**
 * Middleware that redirects to either Manage RSVP's or View Invitation, depending on who is logged in.
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
            .withConverter(timestampConverter)
            .onSnapshot((snap) => {
                if (snap.exists) {
                    const invitation = snap.data() as InvitationsV2.Invitation
                    setInvitation({ status: 'loaded', result: invitation })
                } else {
                    setInvitation({ status: 'error', error: 'not-found' })
                }
            })

        return () => unsub()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    return (
        <div className="twp">
            {(invitation.status === 'loading' || invitation.status === 'error') && <Navbar />}
            {invitation.status === 'loaded' && <Navbar showResetButton invitationId={invitation.result.id} />}
            {invitation.status === 'loading' && (
                <div className="flex h-screen w-screen items-center justify-center">
                    <Loader />
                </div>
            )}
            {invitation.status === 'error' && (
                <h1>Something went wrong loading this invitation: '{invitation.error}'</h1>
            )}
            {invitation.status === 'loaded' && (
                <InvitationProvider invitation={invitation.result}>
                    {auth && auth.uid === invitation.result.uid && <ManageRsvps />}
                    {(!auth || auth.uid !== invitation.result.uid) && <ViewInvitation />}
                </InvitationProvider>
            )}
        </div>
    )
}
