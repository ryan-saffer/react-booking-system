import type { Studio } from 'fizz-kidz'


import { env } from '../init'
import { withExponentialBackoff } from '../utilities'
import { getOAuth2Client } from './google-oauth'

import type { ClientStatus } from '../utilities/types'
import type { calendar_v3 } from 'googleapis'

type Event = {
    title: string
    location: string
    start: Date
    end: Date
    description?: string
}

type CalendarParams =
    | {
          eventType: 'party-bookings'
          type: 'studio'
          location: Studio
      }
    | {
          eventType: 'party-bookings'
          type: 'mobile'
          location: Studio
      }
    | {
          eventType: 'events'
      }

export class CalendarClient {
    private static instance: CalendarClient
    #status: ClientStatus = 'not-initialised'

    #calendarClient: calendar_v3.Calendar | null = null

    private constructor() {}

    static async getInstance() {
        if (!CalendarClient.instance) {
            CalendarClient.instance = new CalendarClient()
            await CalendarClient.instance.#initialise()
        }
        while (CalendarClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        return CalendarClient.instance
    }

    get #calendar() {
        if (this.#calendarClient) return this.#calendarClient
        throw new Error('Calendar client not initialised')
    }

    async #initialise() {
        this.#status = 'initialising'
        const { google } = await import('googleapis')
        const OAuth2Client = await getOAuth2Client()
        this.#calendarClient = google.calendar({ version: 'v3', auth: OAuth2Client })
        this.#status = 'initialised'
    }

    async createEvent(
        calendar: CalendarParams,
        event: Event,
        options: { useExponentialBackoff?: boolean } = { useExponentialBackoff: false }
    ) {
        const { useExponentialBackoff } = options
        const insertFn = () =>
            this.#calendar.events.insert(
                {
                    calendarId: this.getCalendarId(calendar),
                    requestBody: {
                        summary: event.title,
                        location: event.location,
                        start: { dateTime: event.start.toISOString() },
                        end: { dateTime: event.end.toISOString() },
                        description: event.description,
                    },
                },
                undefined
            )

        const result = useExponentialBackoff ? await withExponentialBackoff(insertFn, [403, 429]) : await insertFn()

        return result.data.id as string
    }

    async updateEvent(
        _eventId: string,
        calendar: CalendarParams,
        event: Event,
        options: { useExponentialBackoff?: boolean } = { useExponentialBackoff: false }
    ) {
        const { useExponentialBackoff } = options

        const eventId = _eventId.endsWith('@google.com') ? _eventId.split('@')[0] : _eventId

        const updateFn = () =>
            this.#calendar.events.update({
                eventId,
                calendarId: this.getCalendarId(calendar),
                requestBody: {
                    summary: event.title,
                    location: event.location,
                    start: { dateTime: event.start.toISOString() },
                    end: { dateTime: event.end.toISOString() },
                    ...(event.description && { description: event.description }),
                },
            })

        const result = useExponentialBackoff ? await withExponentialBackoff(updateFn, [403, 429]) : await updateFn()

        return result.data.id as string
    }

    deleteEvent(_eventId: string, calendar: CalendarParams) {
        const eventId = _eventId.endsWith('@google.com') ? _eventId.split('@')[0] : _eventId
        return this.#calendar.events.delete({ eventId, calendarId: this.getCalendarId(calendar) })
    }

    private getCalendarId(eventType: CalendarParams) {
        switch (eventType.eventType) {
            case 'events':
                return env === 'dev'
                    ? 'c_8eb247b18db175af7a890c5def1e01eca4648a0dafb48a422877df1e650f3ad7@group.calendar.google.com'
                    : 'c_f6ec3f5b3114c1dc66d3b3018994a18504813f8650467741dba496c665d05774@group.calendar.google.com'
            case 'party-bookings':
                if (eventType.type === 'mobile') {
                    return env === 'prod'
                        ? 'fizzkidz.com.au_b9aruprq8740cdamu63frgm0ck@group.calendar.google.com'
                        : 'fizzkidz.com.au_k5gsanlpnslk9i4occfd4elt00@group.calendar.google.com'
                }
                switch (eventType.location) {
                    case 'balwyn':
                        return env === 'prod'
                            ? 'fizzkidz.com.au_7vor3m1efd3fqbr0ola2jvglf8@group.calendar.google.com'
                            : 'fizzkidz.com.au_ofsgsp4oijbjpvm40o1bihk7bg@group.calendar.google.com'
                    case 'cheltenham':
                        return env === 'prod'
                            ? 'c_05efd7a4c88896e52d0e108168534ca1ef482ef43566ee6a35387a8e8069b831@group.calendar.google.com'
                            : 'c_c760d908ac1b8659df09adef13067950a026a814b94f160e4ecb51d7b3229032@group.calendar.google.com'
                    case 'essendon':
                        return env === 'prod'
                            ? 'fizzkidz.com.au_k1ubc2bi0ufvhoer4o9pakion0@group.calendar.google.com'
                            : 'c_3aae8htcpjgpmnrod7ujrqsccc@group.calendar.google.com'
                    case 'kingsville':
                        return env === 'prod'
                            ? 'c_c5ed845cf900830382f3da6a88f96f8a9f5c5af76e4ba6656fcf7dbf589c77fc@group.calendar.google.com'
                            : 'c_07737c232df8345b6ec19eadc978c266e31bf252eb26e323213cfb49e868192c@group.calendar.google.com'
                    case 'malvern':
                        return env === 'prod'
                            ? 'fizzkidz.com.au_j13ot3jarb1p9k70c302249j4g@group.calendar.google.com'
                            : 'fizzkidz.com.au_knove8gbjklh2cm5di6qfs0bs0@group.calendar.google.com'
                    default: {
                        const exhaustiveCheck: never = eventType.location
                        throw new Error(`Unknown location found while getting calendar id: '${exhaustiveCheck}'`)
                    }
                }
            default: {
                const exhaustiveCheck: never = eventType
                throw new Error(`unknown calendar type: '${exhaustiveCheck}'`)
            }
        }
    }
}
