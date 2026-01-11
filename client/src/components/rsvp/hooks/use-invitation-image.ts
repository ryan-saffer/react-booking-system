import { useEffect, useState } from 'react'
import { getDownloadURL, ref } from 'firebase/storage'

import useFirebase from '@components/Hooks/context/UseFirebase'

/**
 * Get the url of the invitation png given an invitation id
 *
 * @param invitationId
 * @param isTemp used to read the invitation from the temp directory in storage before the invitaton is linked
 * @returns
 */
export function useInvitationImage(invitationId: string, isTemp: boolean) {
    const firebase = useFirebase()

    const [invitationUrl, setInvitationUrl] = useState('')

    useEffect(() => {
        async function getUrl() {
            const url = await getDownloadURL(
                ref(
                    firebase.storage,
                    `invitations-v2/${isTemp ? 'temp/' : ''}${invitationId}/invitation.png`
                )
            )
            setInvitationUrl(url)
        }

        getUrl()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return invitationUrl
}
