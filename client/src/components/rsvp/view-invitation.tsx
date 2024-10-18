import { InvitationsV2 } from 'fizz-kidz'
import { Img } from 'react-image'
import { useNavigate } from 'react-router-dom'

import Loader from '@components/Shared/Loader'
import { Button } from '@ui-components/button'
import { useInvitationImage } from './hooks/use-invitation-image'

export function ViewInvitation({ invitation }: { invitation: InvitationsV2.Invitation }) {
    const navigate = useNavigate()

    const invitationUrl = useInvitationImage(invitation.id)

    return (
        <div className="p-8">
            <p className="m-auto mb-4 w-full max-w-sm text-center text-xl font-semibold">
                Hi there! 👋
                <br /> You have been invited to {invitation.childName}'s {invitation.childAge}th Birthday Party on{' '}
                {invitation.date.toDateString()}
            </p>
            <div className="flex items-center justify-center">
                <Img src={invitationUrl} loader={<Loader className="my-6" />} className="max-h-[600px] border" />
            </div>
            <p className="m-auto my-8 w-full max-w-sm text-center font-lilita text-5xl">
                Let {invitation.childName} know if you can come!
            </p>
            <Button
                className="w-full rounded-2xl bg-[#02D7F7] font-extrabold uppercase text-black hover:bg-[#02D7F7]/90"
                onClick={() => navigate('rsvp', { state: { invitation } })}
            >
                RSVP
            </Button>
        </div>
    )
}
