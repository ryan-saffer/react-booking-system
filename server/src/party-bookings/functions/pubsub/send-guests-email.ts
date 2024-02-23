import { onSchedule } from 'firebase-functions/v2/scheduler'
import { DateTime } from 'luxon'

import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { MailClient } from '../../../sendgrid/MailClient'

export const sendGuestsEmail = onSchedule(
    {
        timeZone: 'Australia/Melbourne',
        schedule: '0 12 * * *',
    },
    async () => {
        const yesterdayInvitations = await DatabaseClient.getInvitationGuestsOnDay(DateTime.now().minus({ days: 2 }))

        const mailClient = await MailClient.getInstance()

        for (const invitation of yesterdayInvitations) {
            for (const guest of invitation.claimedDiscountCode) {
                await mailClient.sendEmail('invitationGuests', guest.email, { name: guest.name })
            }
        }
    }
)
