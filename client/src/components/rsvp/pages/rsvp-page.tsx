import { InvitationsV2, capitalise, getLocationAddress } from 'fizz-kidz'
import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { useRouterState } from '@components/Hooks/use-router-state'

import { Navbar } from '../navbar'
import { RsvpForm } from '../rsvp-form'

export function RsvpPage() {
    const { id } = useParams()
    const state = useRouterState<{ invitation: InvitationsV2.Invitation }>()

    const [submitted, setSubmitted] = useState(false)

    if (!state) {
        return <Navigate to={`/invitation/v2/${id}`} />
    }

    const { invitation } = state

    const address = invitation.$type === 'mobile' ? invitation.address : getLocationAddress(invitation.studio)

    return (
        <div className="twp">
            <Navbar />
            <div className="p-4">
                {!submitted && (
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
                        {<RsvpForm invitation={invitation} onComplete={() => setSubmitted(true)} />}
                    </>
                )}
                {submitted && (
                    <div className="flex flex-col items-center">
                        <p className="my-4 text-center font-lilita text-4xl">Your response has been recorded!</p>
                        <p className="text-center font-gotham leading-6 tracking-tight">
                            Thanks for submitting your RSVP, we can't wait to celebrate with you soon!
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
