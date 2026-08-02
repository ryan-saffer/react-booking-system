import type { ScienceModule, Studio } from '..'

type BaseEvent = {
    id: string
    eventId: string // id of parent document
    eventName: string
    contactName: string
    contactNumber: string
    contactEmail: string
    organisation: string
    studio: Studio
    address: string
    price: string
    startTime: Date
    endTime: Date
    notes: string
    calendarEventId: string
    invoiceUrl?: string
    zohoDealId?: string
}

export type StandardEvent = BaseEvent & {
    $type: 'standard'
    numberOfAttendees?: string
}

type BaseIncursionEvent = BaseEvent & {
    $type: 'incursion'
    module: ScienceModule
    incursionFormSent: boolean
    numberOfStudentsPerSession?: string
}

type IncursionEventFormIncomplete = BaseIncursionEvent & {
    $incursionFormCompleted: false
}

type IncursionEventFormComplete = BaseIncursionEvent & {
    $incursionFormCompleted: true
    numberOfChildren: string
    location: string // location within the school
    parking: string
    expectedLearning: string
    teacherInformation: string
    additionalInformation: string
    hearAboutUs: string
}

export type IncursionEvent = IncursionEventFormIncomplete | IncursionEventFormComplete

export type Event = StandardEvent | IncursionEvent
