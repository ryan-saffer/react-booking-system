import { capitalise, getStudioAddress, type Rsvp, type WithoutId } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { MailClient } from '@/sendgrid/MailClient'
import { logError } from '@/utilities'
import { ZohoClient } from '@/zoho/zoho-client'

export type RsvpProps = WithoutId<Rsvp> & {
    bookingId: string
    invitationId: string
    joinMailingList: boolean
}

export async function rsvpToParty(input: RsvpProps) {
    const { bookingId, invitationId, joinMailingList, ...rsvp } = input
    await DatabaseClient.addRsvpToParty(bookingId, rsvp)

    const invitation = await DatabaseClient.getInvitationV2(invitationId)

    if (joinMailingList) {
        try {
            const zoho = new ZohoClient()
            const [firstName, lastName] = input.parentName.split(' ')
            zoho.addBirthdayPartyGuestContactV2({
                firstName: firstName,
                lastName: lastName || '',
                email: input.parentEmail,
                studio: invitation.studio,
                type: invitation.$type,
            })
        } catch (err) {
            logError(`error adding contact to zoho during rsvp: ${input.parentEmail}`, err, { input })
        }
    }

    const mailClient = await MailClient.getInstance()
    try {
        mailClient.sendEmail('rsvpToParty', input.parentEmail, {
            parentName: input.parentName,
            children: input.children.map((child) => ({
                childName: child.name,
                isAttending: child.rsvp === 'attending',
                allergies: child.allergies,
            })),
            attending: input.children.some((child) => child.rsvp === 'attending'),
            hostName: invitation.parentName,
            hostPhone: invitation.parentMobile,
            date: invitation.date.toDateString(),
            time: invitation.time,
            isMobile: invitation.$type === 'mobile',
            studio: capitalise(invitation.studio),
            address: invitation.$type === 'mobile' ? invitation.address : getStudioAddress(invitation.studio),
        })
    } catch (err) {
        logError(`Error sending rsvp confirmation to parent '${input.parentEmail}'`, err, { input })
    }
}
