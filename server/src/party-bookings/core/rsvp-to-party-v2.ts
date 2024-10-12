import { Rsvp, WithoutId } from 'fizz-kidz'

import { DatabaseClient } from '../../firebase/DatabaseClient'

export type RsvpProps = WithoutId<Rsvp> & {
    bookingId: string
    joinMailingList: boolean
}

export async function rsvpToParty(input: RsvpProps) {
    const { bookingId, joinMailingList, ...rsvp } = input
    await DatabaseClient.addRsvpToParty(bookingId, rsvp)

    // TODO: send email to parent confirming their RSVP

    if (joinMailingList) {
        // TODO: add client to zoho stuff
        console.log('joining mailing list...')
    }
}
