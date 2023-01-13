interface BaseHolidayProgramBooking {
    appointmentTypeId: number
    dateTime: string
    calendarId: number
    parentFirstName: string
    parentLastName: string
    parentEmail: string
    parentPhone: string
    emergencyContactName: string
    emergencyContactPhone: string
    childName: string
    childAge: string
    childAllergies: string
    discountCode: string
    amountCharged: number
}

interface BookedPaidHolidayProgram extends BaseHolidayProgramBooking {
    booked: true
    appointmentId: number
}

interface UnbookedPaidHolidayProgram extends BaseHolidayProgramBooking {
    booked: false
}

export type PaidHolidayProgramBooking = BookedPaidHolidayProgram | UnbookedPaidHolidayProgram
export type FreeHolidayProgramBooking = BaseHolidayProgramBooking

export type HolidayProgramBooking = PaidHolidayProgramBooking | FreeHolidayProgramBooking
