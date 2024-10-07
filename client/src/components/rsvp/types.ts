import { Location } from 'fizz-kidz'

export type InvitationState = {
    bookingId: string
    childName: string
    childAge: string
    date: Date
    time: string
    type: 'studio' | 'mobile' | ''
    studio: Location
    address: string
    rsvpDate: Date
    parentName: string
    parentNumber: string
}
