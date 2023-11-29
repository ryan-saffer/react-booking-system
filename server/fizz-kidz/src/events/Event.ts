import { ScienceModule } from '..'

type BaseEvent = {
    id: string
    eventId: string // id of parent document
    eventName: string
    contactName: string
    contactNumber: string
    contactEmail: string
    organisation: string
    address: string
    price: string
    startTime: Date
    endTime: Date
    notes: string
    calendarEventId: string
}

type StandardEvent = BaseEvent & {
    type: 'standard'
}

type IncursionEvent = BaseEvent & {
    type: 'incursion'
    module: ScienceModule
}

export type Event = StandardEvent | IncursionEvent
