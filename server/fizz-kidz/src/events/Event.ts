import { Location, ScienceModule } from '..'

type BaseEvent = {
    id: string
    eventId: string // id of parent document
    eventName: string
    contactName: string
    contactNumber: string
    contactEmail: string
    organisation: string
    studio: Location
    address: string
    price: string
    startTime: Date
    endTime: Date
    notes: string
    calendarEventId: string
}

export type StandardEvent = BaseEvent & {
    type: 'standard'
}

export type IncursionEvent = BaseEvent & {
    type: 'incursion'
    module: ScienceModule
}

export type Event = StandardEvent | IncursionEvent
