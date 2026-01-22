import fs from 'fs/promises'

import type { IncursionEvent, Studio } from 'fizz-kidz'

import { eventsRouter } from '@/events/functions/trpc/trpc.events'
import { CalendarClient } from '@/google/CalendarClient'

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
            console.log('Deleting event with id:', legacyEvent.calendarEventId)
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
    const caller = eventsRouter.createCaller({
        authToken: 'ADD AUTH TOKEN HERE',
    })

    const firstSlot = legacyEvents[0]

    if (firstSlot.type === 'standard') {
        await caller.createEvent({
            event: {
                $type: 'standard',
                studio: firstSlot.studio as Studio,
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
                studio: firstSlot.studio as Studio,
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
}
