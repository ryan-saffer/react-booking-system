import type { InvitationsV2, Service } from 'fizz-kidz'
import { RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { useAuth } from '@components/Hooks/context/useAuth'
import Loader from '@components/Shared/Loader'
import { Button } from '@ui-components/button'
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
                <div className="min-h-screen bg-gradient-to-br from-[#F7F1FF] via-white to-[#EAF6FF]">
                    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-white/70 bg-white/85 p-6 text-center shadow-xl backdrop-blur">
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 font-semibold text-[#9B3EEA]">
                                Invitation issue
                            </p>
                            <h1 className="mt-4 font-lilita text-xl text-slate-900 sm:text-4xl">
                                We couldn't load this invitation
                            </h1>
                            <p className="mt-3 text-sm text-slate-600">
                                The link may be invalid or the invitation was removed. Try refreshing, or contact the
                                party host for a fresh link.
                            </p>
                            {invitation.error && (
                                <p className="mt-2 text-xs text-slate-500">Error: {invitation.error}</p>
                            )}
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <Button
                                    variant="outline"
                                    className="rounded-xl border-slate-200"
                                    onClick={() => window.location.reload()}
                                >
                                    Refresh
                                    <RotateCw className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
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
