import { Img } from 'react-image'
import { useNavigate } from 'react-router-dom'

import Loader from '@components/Shared/Loader'
import { Button } from '@ui-components/button'

import { useInvitation } from './hooks/use-invitation'
import { useInvitationImage } from './hooks/use-invitation-image'

export function ViewInvitation() {
    const navigate = useNavigate()

    const invitation = useInvitation()
    const invitationUrl = useInvitationImage(invitation.id)

    return (
        <>
            <div className="p-8 pb-16">
                <p className="m-auto mb-4 w-full max-w-sm text-center text-xl font-semibold">
                    Hi there! 👋
                    <br />
                    <br />
                    You have been invited to {invitation.childName}'s {invitation.childAge}th Birthday Party on{' '}
                    {invitation.date.toDateString()}
                </p>
                <div className="flex items-center justify-center">
                    <Img src={invitationUrl} loader={<Loader className="my-6" />} className="max-h-[1000px] border" />
                </div>
                <p className="m-auto my-8 w-full max-w-sm text-center font-lilita text-5xl">
                    Let {invitation.childName} know if you can come!
                </p>
            </div>
            <Button
                variant="blue"
                className="fixed bottom-0 h-16 w-full rounded-none font-bold "
                onClick={() => navigate('rsvp', { state: { invitation } })}
            >
                RSVP
            </Button>
        </>
    )
}
