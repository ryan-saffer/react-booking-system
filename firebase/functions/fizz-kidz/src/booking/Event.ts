import { WithoutId } from '../utilities'

export type EventBooking = {
    id: string
    eventName: string
    contactName: string
    contactNumber: string
    contactEmail: string
    organisation: string
    location: string
    startTime: Date
    endTime: Date
    notes: string
    calendarEventId: string
}

export type ScheduleEventParams = {
    event: WithoutId<Omit<EventBooking, 'startTime' | 'endTime' | 'calendarEventId'>> & {
        slots: {
            startTime: Date
            endTime: Date
        }[]
    }
    sendConfirmationEmail: boolean
    emailMessage: string
}
