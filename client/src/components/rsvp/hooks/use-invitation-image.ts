import useFirebase from '@components/Hooks/context/UseFirebase'
import { useEffect, useState } from 'react'

export function useInvitationImage(invitationId: string) {
    const firebase = useFirebase()

    const [invitationUrl, setInvitationUrl] = useState('')

    useEffect(() => {
        async function getUrl() {
            const url = await firebase.storage
                .ref()
                .child(`invitations-v2/${invitationId}/invitation.png`)
                .getDownloadURL()
            setInvitationUrl(url)
        }

        getUrl()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return invitationUrl
}
