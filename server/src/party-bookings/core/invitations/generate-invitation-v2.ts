import { InvitationsV2, WithoutId, WithoutUid, generateRandomString } from 'fizz-kidz'
import fsPromise from 'fs/promises'
import fs from 'fs'

import { StorageClient } from '../../../firebase/StorageClient'
import { projectId } from '../../../init'
import { MixpanelClient } from '../../../mixpanel/mixpanel-client'
import { InvitationImageGenerator } from './invitation-image-generator'

/**
 * Creates and uploads an invitation to storage, but does not create a document in firestore.
 *
 * Many invitations can be created, but a booking can only have one invitation linked to it.
 * Linking an invitation happens after the invitation has been created, and the parent confirms to finalize.
 *
 * @param input
 * @returns
 */
export async function generateInvitationV2(input: WithoutId<WithoutUid<InvitationsV2.Invitation>>) {
    // serialise back into a date
    input.date = new Date(input.date)
    input.rsvpDate = new Date(input.rsvpDate)

    const id = generateRandomString()
    const filename = 'invitation.png'
    const destination = `invitations-v2/${id}/${filename}`

    if (!fs.existsSync(`${__dirname}/temp`)) {
        await fsPromise.mkdir(`${__dirname}/temp`)
    }

    const imageGenerator = new InvitationImageGenerator(input)
    await imageGenerator.generatePng(`${__dirname}/temp/${filename}`)

    const storage = await StorageClient.getInstance()
    await storage.bucket(`${projectId}.appspot.com`).upload(`${__dirname}/temp/${filename}`, {
        destination,
    })

    // delete the file, and if the temp directory is empty afterwards, delete it
    await fsPromise.rm(`${__dirname}/temp/${filename}`)
    const files = await fsPromise.readdir(`${__dirname}/temp`)
    if (files.length === 0) {
        await fsPromise.rmdir(`${__dirname}/temp`, { recursive: true })
    }

    const mixpanel = await MixpanelClient.getInstance()
    await mixpanel.track('invitation-generated-v2', {
        invitationId: id,
        partyDate: input.date,
        invitation: input.invitation,
        bookingId: input.bookingId,
        parentName: input.parentName,
    })

    return { invitationId: id }
}
