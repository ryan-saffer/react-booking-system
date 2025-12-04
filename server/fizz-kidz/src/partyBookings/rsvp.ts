import { getCloudFunctionsDomain } from '../utilities'

export type Rsvp = {
    id: string
    parentName: string
    parentEmail: string
    parentMobile: string
    children: Child[]
    message?: string
}

type Child = {
    name: string
    dob: Date
    rsvp: 'attending' | 'not-attending'
    hasAllergies?: boolean
    allergies?: string
}

export type RsvpStatus = Rsvp['children'][number]['rsvp']

export function getRsvpUrl(env: 'dev' | 'prod', useEmulator: boolean, bookingId: string) {
    return `${getCloudFunctionsDomain(env, useEmulator)}/webhooks/invitation/${bookingId}`
}
