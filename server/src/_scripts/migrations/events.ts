import fs from 'fs/promises'

import { eventsRouter } from '../../events/functions/trpc/trpc.events'
import { IncursionEvent, Location } from 'fizz-kidz'
import { CalendarClient } from '../../google/CalendarClient'

export async function groupEventsByContactEmail() {
    try {
        const file = await fs.readFile(__dirname + '/resources/legacy-events-prod.json')
        const data = JSON.parse(file.toString()).data

        const groupedByEmails: Record<any, any> = {}

        console.log(data)

        for (const key in data) {
            const email = data[key].contactEmail
            console.log('email:', email)
            const event = data[key]
            // rename location to address
            event.address = event.location
            delete event.location
            if (groupedByEmails[email]) {
                groupedByEmails[email].push(data[key])
            } else {
                groupedByEmails[email] = [data[key]]
            }
        }

        fs.writeFile(__dirname + '/resources/grouped-by-contact-email-prod.json', JSON.stringify(groupedByEmails))
    } catch (error) {
        console.log(error)
    }
}

type LegacyEvent = {
    studio: string
    calendarEventId: string
    contactEmail: string
    contactName: string
    contactNumber: string
    endTime: { __time__: string }
    eventName: string
    id: string
    address: string
    notes: string
    organisation: string
    price: string
    startTime: { __time__: string }
    type: 'standard' | 'incursion'
    module: string
    location: string // incursion location within the school
}

export async function deleteFromLegacy() {
    const file = await fs.readFile(__dirname + '/resources/grouped-by-contact-email.json')
    const data = JSON.parse(file.toString()) as Record<string, LegacyEvent[]>

    const calendarClient = await CalendarClient.getInstance()

    for (const email of Object.keys(data)) {
        const legacyEvents = data[email]

        for (const legacyEvent of legacyEvents) {
            await calendarClient.deleteEvent(legacyEvent.calendarEventId, {
                eventType: 'events',
            })
        }
    }

    console.log('success')
}

export async function migrateLegacyEvents() {
    const file = await fs.readFile(__dirname + '/resources/grouped-by-contact-email.json')
    const data = JSON.parse(file.toString()) as Record<string, LegacyEvent[]>

    for (const email of Object.keys(data)) {
        const legacyEvents = data[email]

        await bookIntoNewSystem(legacyEvents)
    }
}

async function bookIntoNewSystem(legacyEvents: LegacyEvent[]) {
    console.log(legacyEvents)
    const caller = eventsRouter.createCaller({
        authToken:
            'eyJhbGciOiJSUzI1NiIsImtpZCI6IjNhM2JkODk4ZGE1MGE4OWViOWUxY2YwYjdhN2VmZTM1OTNkNDEwNjgiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiVGFsaWEgTWVsdHplciIsInBpY3R1cmUiOiJodHRwczovL2xoNS5nb29nbGV1c2VyY29udGVudC5jb20vLWZyRmhteGx3UzFzL0FBQUFBQUFBQUFJL0FBQUFBQUFBQVNVL0JEZzZVYmZVNnlBL3Bob3RvLmpwZyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9ib29raW5nLXN5c3RlbS02NDM1ZCIsImF1ZCI6ImJvb2tpbmctc3lzdGVtLTY0MzVkIiwiYXV0aF90aW1lIjoxNzAxNjg4NjU0LCJ1c2VyX2lkIjoiQjA0RGpOTmlyTFRiajlSWmdDek4yTGtqT2N2MSIsInN1YiI6IkIwNERqTk5pckxUYmo5UlpnQ3pOMkxrak9jdjEiLCJpYXQiOjE3MDIyMTY3MzksImV4cCI6MTcwMjIyMDMzOSwiZW1haWwiOiJpbmZvQGZpenpraWR6LmNvbS5hdSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTE2NTQ1MzEwOTkxMDE0NTgxNTgzIl0sImVtYWlsIjpbImluZm9AZml6emtpZHouY29tLmF1Il19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.NL_wrR9LUOj9PQ4_kTrrMtS7nsF2KUAEK6_mhkp8eYQ3NVA_6dLdpPjmW-tDaKyDxBe6RDv9M4lVq0O7Fv2SDs-XyBzhijCGds_-xbE5CdaXBhRsM7AW7GgT8iwLI3yVLrRxvdOqxJWKsKH4Tfej_snXaE5YT02viX2lqIZqgdvAtzigJfDhKPV71VrPlGZW7P3lxIWWQ6K_uEeL9VOboeGZC1BGS6RBTAsnCBiVl1i4F0kMpH-QCIO7TSPUlGfUC2XgmG_1fbznt1jC5bFpImSwcTQoqBDeoLBPCN99TJ7d1yLb--dLORNupvFgsZlUlau5C2C8VGZLTfmTJ-a-4Q',
    })

    const firstSlot = legacyEvents[0]

    if (firstSlot.type === 'standard') {
        await caller.createEvent({
            event: {
                $type: 'standard',
                studio: firstSlot.studio as Location,
                eventName: firstSlot.eventName,
                contactName: firstSlot.contactName,
                contactNumber: firstSlot.contactNumber,
                contactEmail: firstSlot.contactEmail,
                organisation: firstSlot.organisation,
                address: firstSlot.address,
                price: firstSlot.price,
                notes: firstSlot.notes,
            },
            slots: legacyEvents.map((event) => ({
                startTime: new Date(event.startTime.__time__),
                endTime: new Date(event.endTime.__time__),
            })),
            sendConfirmationEmail: false,
            emailMessage: '',
        })
    } else {
        await caller.createEvent({
            event: {
                $type: 'incursion',
                studio: firstSlot.studio as Location,
                module: firstSlot.module as IncursionEvent['module'],
                $incursionFormCompleted: false,
                incursionFormSent: false,
                eventName: firstSlot.eventName,
                contactName: firstSlot.contactName,
                contactNumber: firstSlot.contactNumber,
                contactEmail: firstSlot.contactEmail,
                organisation: firstSlot.organisation,
                address: firstSlot.address,
                price: firstSlot.price,
                notes: firstSlot.notes,
            },
            slots: legacyEvents.map((event) => ({
                startTime: new Date(event.startTime.__time__),
                endTime: new Date(event.endTime.__time__),
            })),
            sendConfirmationEmail: false,
            emailMessage: '',
        })
    }

    await caller.createEvent({
        event: {
            eventName: firstSlot.eventName,
            contactName: firstSlot.contactName,
            contactNumber: firstSlot.contactNumber,
            contactEmail: firstSlot.contactEmail,
            organisation: firstSlot.organisation,
            studio: firstSlot.studio as Location,
            address: firstSlot.address,
            price: firstSlot.price,
            notes: firstSlot.notes,
            $type: 'standard',
        },
        slots: legacyEvents.map((event) => ({
            startTime: new Date(event.startTime.__time__),
            endTime: new Date(event.endTime.__time__),
        })),
        sendConfirmationEmail: false,
        emailMessage: '',
    })
}
