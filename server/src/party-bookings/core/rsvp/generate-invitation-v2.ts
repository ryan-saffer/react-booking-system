import fs from 'fs'

import type { InvitationsV2, WithoutId, WithoutUid } from 'fizz-kidz'
import { generateRandomString } from 'fizz-kidz'
import fsPromise from 'fs/promises'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { StorageClient } from '@/firebase/StorageClient'
import { projectId } from '@/init'
import { MixpanelClient } from '@/mixpanel/mixpanel-client'

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

    // check if this booking already has an invitation.
    // if so, use the same id, since the qr code will need to link to the correct invitation.
    const booking = await DatabaseClient.getPartyBooking(input.bookingId)
    const id = booking.invitationId || generateRandomString()

    // invitations are first stored in temp, and only moved to their actual location during linking.
    // this makes it very easy to clear all unlinked invitations.
    const filename = 'invitation.png'
    const LOCAL_PATH = `${__dirname}/temp/${id}/${filename}`
    const FIREBASE_STORAGE_PATH = `invitations-v2/temp/${id}/${filename}`

    if (!fs.existsSync(`${__dirname}/temp`)) {
        await fsPromise.mkdir(`${__dirname}/temp`)
    }
    if (!fs.existsSync(`${__dirname}/temp/${id}`)) {
        await fsPromise.mkdir(`${__dirname}/temp/${id}`)
    }

    const imageGenerator = new InvitationImageGenerator({ ...input, id })
    await imageGenerator.generatePng(LOCAL_PATH)

    const storage = await StorageClient.getInstance()
    await storage.bucket(`${projectId}.appspot.com`).upload(LOCAL_PATH, {
        destination: FIREBASE_STORAGE_PATH,
    })

    // delete the file locally since its not needed anymore
    await fsPromise.rm(LOCAL_PATH)

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
