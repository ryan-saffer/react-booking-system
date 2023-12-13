import { logger } from 'firebase-functions/v2'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { IncursionEvent, ModuleNameMap } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { MailClient } from '../../../sendgrid/MailClient'

export const sendIncursionForms = onSchedule(
    {
        timeZone: 'Australia/Melbourne',
        schedule: '30 8 * * *', // daily at 8:30am
    },
    async () => {
        // get all incursion slots within the next 3 weeks
        const events = await DatabaseClient.getIncursionsBefore(DateTime.now().plus({ days: 22 }))

        if (events.length === 0) {
            logger.log('no incursions found within next 3 weeks')
            return
        }

        // filter out slots where the form has been sent
        const notSentEvents = events.filter((it) => !it.incursionFormSent)
        if (notSentEvents.length === 0) {
            logger.log('all incursions within the next 3 weeks already sent incursion form')
            return
        }

        // group all slots by event id
        const incursionMap: Record<string, IncursionEvent[]> = {}
        notSentEvents.forEach((event) => {
            if (incursionMap[event.eventId]) {
                incursionMap[event.eventId].push(event)
            } else {
                incursionMap[event.eventId] = [event]
            }
        })

        const mailClient = await MailClient.getInstance()

        // for each event, send a form
        for (const eventId of Object.keys(incursionMap)) {
            // get all slots for this eventId
            const slots = (await DatabaseClient.getEventSlots(eventId)) as IncursionEvent[]
            // we can just use the first slot for all the details
            const firstSlot = slots[0]
            await mailClient.sendEmail('incursionForm', firstSlot.contactEmail, {
                contactName: firstSlot.contactName,
                incursionName: ModuleNameMap[firstSlot.module],
                organisation: firstSlot.organisation,
                slots: slots.map(
                    (slot) =>
                        `${DateTime.fromJSDate(slot.startTime, { zone: 'Australia/Melbourne' }).toFormat(
                            'cccc, LLL dd, t'
                        )} - ${DateTime.fromJSDate(slot.endTime, { zone: 'Australia/Melbourne' }).toFormat('t')}`
                ),
                formUrl: generateFormUrl(eventId, firstSlot.organisation, firstSlot.address),
            })

            // mark all slots as having the form sent
            await DatabaseClient.updateEventBooking(eventId, firstSlot.id, {
                $type: 'incursion',
                incursionFormSent: true,
            })
        }
        return
    }
)

function generateFormUrl(eventId: string, organisation: string, address: string) {
    return (
        'https://dtrdgb8b.paperform.co?id=' +
        eventId +
        '&organisation=' +
        encodeURIComponent(organisation) +
        '&address=' +
        encodeURIComponent(address)
    )
}
