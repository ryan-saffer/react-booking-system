type BaseEvent = {
    id: string
    eventId: string // id of parent document
    eventName: string
    contactName: string
    contactNumber: string
    contactEmail: string
    organisation: string
    location: string
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
    module: string
}

export type Event = StandardEvent | IncursionEvent
