import { InvitationsV2, capitalise, getLocationAddress } from 'fizz-kidz'
import { Navigate, useParams } from 'react-router-dom'

import { useRouterState } from '@components/Hooks/use-router-state'

import { Navbar } from '../navbar'
import { RsvpForm } from '../rsvp-form'

export function RsvpPage() {
    const { id } = useParams()
    const state = useRouterState<{ invitation: InvitationsV2.Invitation }>()

    if (!state) {
        return <Navigate to={`/invitation/v2/${id}`} />
    }

    const { invitation } = state

    return (
        <div className="twp">
            <Navbar />
            <div className="p-4">
                <p className="my-4 text-center font-lilita text-4xl">
                    {invitation.childName}'s {invitation.childAge}th Birthday Party
                </p>
                <p className="my-4 text-center text-xl">
                    {invitation.date.toDateString()}, {invitation.time}
                    <br />
                    {invitation.$type === 'mobile' && invitation.address}
                    {invitation.$type === 'studio' && `Fizz Kidz ${capitalise(invitation.studio)} Studio`}
                    <br />
                    {invitation.$type === 'studio' && getLocationAddress(invitation.studio)}
                </p>
                <RsvpForm invitation={invitation} />
            </div>
        </div>
    )
}
