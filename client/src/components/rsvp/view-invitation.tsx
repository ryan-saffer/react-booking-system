import { InvitationsV2 } from 'fizz-kidz'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Img } from 'react-image'
import { useNavigate } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import Loader from '@components/Shared/Loader'
import { Button } from '@ui-components/button'

export function ViewInvitation({ invitation }: { invitation: InvitationsV2.Invitation }) {
    const firebase = useFirebase()

    const [loading, setLoading] = useState(true)
    const [invitationUrl, setInvitationUrl] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        async function getUrl() {
            const url = await firebase.storage
                .ref()
                .child(`invitations-v2/${invitation.id}/invitation.png`)
                .getDownloadURL()
            setInvitationUrl(url)
            // give time for img component to load content
            setTimeout(() => setLoading(false), 500)
        }

        getUrl()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <Loader />
            </div>
        )
    }

    return (
        <div className="p-8">
            <p className="m-auto mb-4 w-full max-w-sm text-center text-xl font-semibold">
                Hi there! 👋
                <br /> You have been invited to {invitation.childName}'s {invitation.childAge}th Birthday Party on{' '}
                {invitation.date.toDateString()}
            </p>
            <div className="flex items-center justify-center">
                <Img
                    src={invitationUrl}
                    loader={<Loader2 className="animate-spin" />}
                    className="max-h-[600px] border"
                />
            </div>
            <p className="m-auto my-8 w-full max-w-sm text-center font-lilita text-5xl">
                Let {invitation.childName} know if you can come!
            </p>
            <div className="flex w-full justify-center">
                <div className="flex w-min flex-col items-stretch justify-center gap-4">
                    <Button
                        className="rounded-2xl bg-[#02D7F7] font-extrabold uppercase text-black hover:bg-[#02D7F7]/90"
                        onClick={() => navigate('rsvp', { state: { invitation } })}
                    >
                        Attending
                    </Button>
                    <Button
                        className="rounded-2xl bg-[#FFDC5D] font-extrabold uppercase text-black hover:bg-[#FFDC5D]/90"
                        onClick={() => navigate('rsvp', { state: { invitation } })}
                    >
                        Can't make it
                    </Button>
                </div>
            </div>
        </div>
    )
}
