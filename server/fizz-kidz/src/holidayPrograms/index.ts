export interface BaseHolidayProgramBooking {
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
    // comes from client as birthday ISO string, saved in acuity as age.
    // kept name as 'childAge' for backwards compat
    childAge: string
    childAllergies: string
    childAdditionalInfo: string
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

export type DiscountCode = {
    id: string
    discountType: 'percentage' | 'price'
    discountAmount: number
    code: string
    expiryDate: Date
    numberOfUses: number
    numberOfUsesAllocated: number
}
