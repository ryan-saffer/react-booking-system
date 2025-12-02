import type { InvitationsV2 } from 'fizz-kidz'
import { capitalise, getLocationAddress } from 'fizz-kidz'

export function Result({
    rsvp,
    invitation,
}: {
    rsvp: 'attending' | 'not-attending'
    invitation: InvitationsV2.Invitation
}) {
    const address = invitation.$type === 'mobile' ? invitation.address : getLocationAddress(invitation.studio)

    function headingContent() {
        if (rsvp === 'attending') {
            return "Yay! We can't wait to see you there."
        }
        if (rsvp === 'not-attending') {
            return 'Thanks for letting us know!'
        }
    }

    function bodyContent() {
        if (rsvp === 'attending') {
            return (
                <>
                    See you on {invitation.date.toDateString()}, {invitation.time}
                    <br />
                    {invitation.$type === 'studio' && (
                        <>
                            at our Fizz Kidz {capitalise(invitation.studio)} Studio
                            <br />
                        </>
                    )}
                    {invitation.$type === 'studio' && address}
                </>
            )
        }
        if (rsvp === 'not-attending') {
            return `We are sorry you can't make it, and if anything changes just let ${invitation.parentName} know. 😄`
        }
    }

    return (
        <div className="flex flex-col items-center">
            <p className="my-4 text-center font-lilita text-4xl">{headingContent()}</p>
            <p className="text-center leading-6">{bodyContent()}</p>
        </div>
    )
}
