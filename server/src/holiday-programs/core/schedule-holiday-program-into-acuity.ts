import { AcuityConstants, HolidayProgramBooking } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { AcuityClient } from '../../acuity/core/acuity-client'

export async function bookHolidayProgramIntoAcuity(booking: HolidayProgramBooking, paymentIntentId = '') {
    const acuity = await AcuityClient.getInstance()
    return acuity.scheduleAppointment({
        appointmentTypeID: booking.appointmentTypeId,
        datetime: booking.dateTime,
        calendarID: booking.calendarId,
        firstName: booking.parentFirstName,
        lastName: booking.parentLastName,
        email: booking.parentEmail,
        phone: booking.parentPhone,
        certificate: booking.discountCode === 'allday' ? 'allday' : undefined,
        paid: true,
        fields: [
            {
                id: AcuityConstants.FormFields.CHILDREN_NAMES,
                value: booking.childName,
            },
            {
                id: AcuityConstants.FormFields.CHILDREN_AGES,
                // convert ISO string to age
                value: Math.floor(DateTime.now().diff(DateTime.fromISO(booking.childAge), 'years').years),
            },
            {
                id: AcuityConstants.FormFields.CHILDREN_ALLERGIES,
                value: booking.childAllergies,
            },
            {
                id: AcuityConstants.FormFields.CHILD_ADDITIONAL_INFO,
                value: booking.childAdditionalInfo,
            },
            {
                id: AcuityConstants.FormFields.EMERGENCY_CONTACT_NAME_HP,
                value: booking.emergencyContactName,
            },
            {
                id: AcuityConstants.FormFields.EMERGENCY_CONTACT_NUMBER_HP,
                value: booking.emergencyContactPhone,
            },
            {
                id: AcuityConstants.FormFields.HOLIDAY_PROGRAM_AMOUNT_CHARGED,
                value: booking.amountCharged,
            },
            {
                id: AcuityConstants.FormFields.HOLIDAY_PROGRAM_PAYMENT_INTENT_ID,
                value: paymentIntentId,
            },
        ],
    })
}
