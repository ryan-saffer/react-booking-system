import type { FormBooking } from '@fizz-kidz/core'

export type ExistingBookingFormFields = {
    [K in keyof FormBooking]: {
        value: FormBooking[K]
        error: boolean
        errorText: string
    }
}
