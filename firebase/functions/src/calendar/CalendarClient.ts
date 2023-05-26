import { env } from './../init'
import googleCredentials from '../../credentials/google-credentials.json'
import { calendar_v3, google } from 'googleapis'
import { withExponentialBackoff } from '../utilities'

type Calendar = 'events'

type Event = {
    title: string
    location: string
    start: Date
    end: Date
    description?: string
}

class CalendarClient {
    private calendar: calendar_v3.Calendar

    constructor() {
        const OAuth2Client = new google.auth.OAuth2(
            googleCredentials.web.client_id,
            googleCredentials.web.client_secret,
            googleCredentials.web.redirect_uris[0]
        )

        OAuth2Client.setCredentials({
            refresh_token: googleCredentials.refresh_token,
        })

        this.calendar = google.calendar({ version: 'v3', auth: OAuth2Client })
    }

    async createEvent(
        calendar: Calendar,
        event: Event,
        options: {
            useExponentialBackoff?: boolean
        } = {}
    ) {
        const { useExponentialBackoff = false } = options
        const insertFn = () =>
            this.calendar.events.insert(
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

        return result.data.id
    }

    updateEvent(eventId: string, calendar: Calendar, event: Event) {
        return this.calendar.events.update({
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

    deleteEvent(eventId: string, calendar: Calendar) {
        return this.calendar.events.delete({ eventId, calendarId: this.getCalendarId(calendar) })
    }

    private getCalendarId(calendar: Calendar) {
        switch (calendar) {
            case 'events':
                return env === 'dev'
                    ? 'c_8eb247b18db175af7a890c5def1e01eca4648a0dafb48a422877df1e650f3ad7@group.calendar.google.com'
                    : 'c_f6ec3f5b3114c1dc66d3b3018994a18504813f8650467741dba496c665d05774@group.calendar.google.com'
        }
    }
}

let calendarClient: CalendarClient

export function getCalendarClient() {
    if (calendarClient) return calendarClient
    calendarClient = new CalendarClient()
    return calendarClient
}
