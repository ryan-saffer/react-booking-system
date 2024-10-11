import { InvitationsV2, capitalise, getLocationAddress } from 'fizz-kidz'
import { Navigate, useParams } from 'react-router-dom'

import { useRouterState } from '@components/Hooks/use-router-state'

import { Navbar } from '../navbar'
import { RsvpForm } from '../rsvp-form'
import { useState } from 'react'
import { Result } from '../result'

export function RsvpPage() {
    const { id } = useParams()
    const state = useRouterState<{ invitation: InvitationsV2.Invitation }>()

    const [rsvp, setRsvp] = useState<'attending' | 'not-attending' | null>(null)

    if (!state) {
        return <Navigate to={`/invitation/v2/${id}`} />
    }

    const { invitation } = state

    const address = invitation.$type === 'mobile' ? invitation.address : getLocationAddress(invitation.studio)

    return (
        <div className="twp">
            <Navbar />
            <div className="p-4">
                {rsvp === null && (
                    <>
                        <p className="my-4 text-center font-lilita text-4xl">
                            {invitation.childName}'s {invitation.childAge}th Birthday Party
                        </p>
                        <p className="my-4 text-center text-xl">
                            {invitation.date.toDateString()}, {invitation.time}
                            <br />
                            {invitation.$type === 'studio' && (
                                <>
                                    Fizz Kidz {capitalise(invitation.studio)} Studio
                                    <br />
                                </>
                            )}
                            {invitation.$type === 'studio' && address}
                        </p>
                        {rsvp === null && <RsvpForm invitation={invitation} onComplete={setRsvp} />}
                    </>
                )}
                {rsvp !== null && <Result rsvp={rsvp} invitation={invitation} />}
            </div>
        </div>
    )
}
