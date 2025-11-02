import type { Studio } from 'fizz-kidz'
import { AcuityConstants } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { AcuityClient } from '@/acuity/core/acuity-client'

export async function getHolidayPrograms({
    from = new Date(),
    to,
    studio,
}: {
    from?: Date
    to?: Date
    studio: Studio
}) {
    const acuity = await AcuityClient.getInstance()

    const result = await acuity.searchForAppointments({
        appointmentTypeId: AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM,
        calendarId: AcuityConstants.StoreCalendars[studio],
        minDate: from.toISOString(),
        maxDate: to ? to.toISOString() : DateTime.fromJSDate(from).plus({ years: 10 }).toISO(),
        maxResults: 1000,
    })

    return result
}
