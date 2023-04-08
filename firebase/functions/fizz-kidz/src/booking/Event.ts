import { WithoutId } from '../utilities'

export type EventBooking = {
    id: string
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

export type ScheduleEventParams = WithoutId<Omit<EventBooking, 'startTime' | 'endTime' | 'calendarEventId'>> & {
    slots: {
        startTime: Date
        endTime: Date
    }[]
}
