import firebase from 'firebase'
import { Bookings } from 'fizz-kidz'

export type ExistingBookingFormFields = {
    [K in keyof Bookings.DomainBooking]: {
        value: Bookings.DomainBooking[K]
        error: boolean,
        errorText: string
    }
}