import type { FormBooking } from 'fizz-kidz'

export type ExistingBookingFormFields = {
    [K in keyof FormBooking]: {
        value: FormBooking[K]
        error: boolean
        errorText: string
    }
}
