import { DomainBooking } from 'fizz-kidz'

export type ExistingBookingFormFields = {
    [K in keyof DomainBooking]: {
        value: DomainBooking[K]
        error: boolean,
        errorText: string
    }
}