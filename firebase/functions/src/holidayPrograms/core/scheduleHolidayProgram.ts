import { Acuity, FreeHolidayProgramBooking, PaidHolidayProgramBooking } from 'fizz-kidz'
import { AcuityClient } from '../../acuity/core/AcuityClient'

export function scheduleHolidayProgram(booking: FreeHolidayProgramBooking | PaidHolidayProgramBooking) {
    return AcuityClient.scheduleAppointment({
        appointmentTypeID: booking.appointmentTypeId,
        datetime: booking.dateTime,
        calendarID: booking.calendarId,
        firstName: booking.parentFirstName,
        lastName: booking.parentLastName,
        email: booking.parentEmail,
        phone: booking.parentPhone,
        certificate: booking.discountCode,
        paid: true,
        fields: [
            {
                id: Acuity.Constants.FormFields.CHILDREN_NAMES,
                value: booking.childName,
            },
            {
                id: Acuity.Constants.FormFields.CHILDREN_AGES,
                value: booking.childAge,
            },
            {
                id: Acuity.Constants.FormFields.CHILDREN_ALLERGIES,
                value: booking.childAllergies,
            },
            {
                id: Acuity.Constants.FormFields.EMERGENCY_CONTACT_NAME_HP,
                value: booking.emergencyContactName,
            },
            {
                id: Acuity.Constants.FormFields.EMERGENCY_CONTACT_NUMBER_HP,
                value: booking.emergencyContactPhone,
            },
            {
                id: Acuity.Constants.FormFields.HOLIDAY_PROGRAM_AMOUNT_CHARGED,
                value: booking.amountCharged,
            },
        ],
    })
}
