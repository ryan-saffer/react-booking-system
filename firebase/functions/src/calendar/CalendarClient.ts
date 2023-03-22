import { env } from './../init'
import googleCredentials from '../../credentials/google-credentials.json'
import { calendar_v3, google } from 'googleapis'

type Calendar = 'events'

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
        title: string,
        location: string,
        start: Date,
        end: Date,
        calendar: Calendar,
        description?: string
    ) {
        const result = await this.calendar.events.insert(
            {
                calendarId: this.getCalendarId(calendar),
                requestBody: {
                    summary: title,
                    location,
                    start: { dateTime: start.toISOString() },
                    end: { dateTime: end.toISOString() },
                    description,
                },
            },
            undefined
        )

        return result.data.id
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

const calendarClient = new CalendarClient()
export { calendarClient }
