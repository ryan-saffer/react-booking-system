import { env } from '../init'
import googleCredentials from '../../credentials/google-credentials.json'
import type { calendar_v3 } from 'googleapis'
import { withExponentialBackoff } from '../utilities'
import { Location } from 'fizz-kidz'
import { ClientStatus } from '../utilities/types'

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
          location: Location
      }
    | {
          eventType: 'party-bookings'
          type: 'mobile'
          location: Location
      }
    | {
          eventType: 'events'
      }

export class CalendarClient {
    private static instance: CalendarClient
    #status: ClientStatus = 'not-initialised'

    #calendarClient: calendar_v3.Calendar | null = null

    // eslint-disable-next-line @typescript-eslint/no-empty-function
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
        const OAuth2Client = new google.auth.OAuth2(
            googleCredentials.web.client_id,
            googleCredentials.web.client_secret,
            googleCredentials.web.redirect_uris[0]
        )

        OAuth2Client.setCredentials({
            refresh_token: googleCredentials.refresh_token,
        })

        this.#calendarClient = google.calendar({ version: 'v3', auth: OAuth2Client })
        this.#status = 'initialised'
    }

    async createEvent(
        calendar: CalendarParams,
        event: Event,
        options: {
            useExponentialBackoff?: boolean
        } = {}
    ) {
        const { useExponentialBackoff = false } = options
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

    updateEvent(_eventId: string, calendar: CalendarParams, event: Event) {
        const eventId = _eventId.endsWith('@google.com') ? _eventId.split('@')[0] : _eventId
        return this.#calendar.events.update({
            eventId,
            calendarId: this.getCalendarId(calendar),
            requestBody: {
                summary: event.title,
                location: event.location,
                start: { dateTime: event.start.toISOString() },
                end: { dateTime: event.end.toISOString() },
                description: event.description,
            },
        })
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
                console.log('getting event id:', eventType.type)
                if (eventType.type === 'mobile') {
                    return env === 'prod'
                        ? 'fizzkidz.com.au_b9aruprq8740cdamu63frgm0ck@group.calendar.google.com'
                        : 'fizzkidz.com.au_k5gsanlpnslk9i4occfd4elt00@group.calendar.google.com'
                }
                switch (eventType.location) {
                    case Location.BALWYN:
                        return env === 'prod'
                            ? 'fizzkidz.com.au_7vor3m1efd3fqbr0ola2jvglf8@group.calendar.google.com'
                            : 'fizzkidz.com.au_ofsgsp4oijbjpvm40o1bihk7bg@group.calendar.google.com'
                    case Location.CHELTENHAM:
                        return env === 'prod'
                            ? 'c_05efd7a4c88896e52d0e108168534ca1ef482ef43566ee6a35387a8e8069b831@group.calendar.google.com'
                            : 'c_c760d908ac1b8659df09adef13067950a026a814b94f160e4ecb51d7b3229032@group.calendar.google.com'
                    case Location.ESSENDON:
                        return env === 'prod'
                            ? 'fizzkidz.com.au_k1ubc2bi0ufvhoer4o9pakion0@group.calendar.google.com'
                            : 'c_3aae8htcpjgpmnrod7ujrqsccc@group.calendar.google.com'
                    case Location.MALVERN:
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
