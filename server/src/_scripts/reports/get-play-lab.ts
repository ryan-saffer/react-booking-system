import { AcuityClient } from '@/acuity/core/acuity-client'
import type { Location } from 'fizz-kidz'
import { AcuityConstants } from 'fizz-kidz'
import { DateTime } from 'luxon'

const PLAY_LAB_NAMES = ['All Playz', 'Creative Kinders', 'Little Explorers'] as const

export async function getPlayLabPrograms({
    from = new Date(),
    to,
    studio,
}: {
    from?: Date
    to?: Date
    studio: Location
}) {
    const acuity = await AcuityClient.getInstance()

    // play lab is spread over many different appointment types
    // simplest way is to just filter based on program names that we offer
    const appointmentTypes = await acuity.getAppointmentTypes({})
    const playLabAppointmentTypes = appointmentTypes.filter((it) =>
        PLAY_LAB_NAMES.some((name) => it.name.includes(name))
    )

    const allAppointments = await Promise.all(
        playLabAppointmentTypes.map((appointmentType) =>
            acuity.searchForAppointments({
                appointmentTypeId: appointmentType.id,
                calendarId: AcuityConstants.StoreCalendars[studio],
                minDate: from.toISOString(),
                maxDate: to ? to.toISOString() : DateTime.fromJSDate(from).plus({ years: 10 }).toISO(),
            })
        )
    )

    return allAppointments.flat()
}
