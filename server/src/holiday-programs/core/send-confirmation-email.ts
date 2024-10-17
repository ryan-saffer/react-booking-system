import { AcuityConstants, AcuityTypes, AcuityUtilities } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { MailClient } from '../../sendgrid/MailClient'
import { Emails } from '../../sendgrid/types'
import { logError } from '../../utilities'

export async function sendConfirmationEmail(appointments: AcuityTypes.Api.Appointment[]) {
    const sortedAppointments = appointments.sort((a, b) => {
        const child1Name = AcuityUtilities.retrieveFormAndField(
            a,
            AcuityConstants.Forms.CHILDREN_DETAILS,
            AcuityConstants.FormFields.CHILDREN_NAMES
        )
        const child2Name = AcuityUtilities.retrieveFormAndField(
            b,
            AcuityConstants.Forms.CHILDREN_DETAILS,
            AcuityConstants.FormFields.CHILDREN_NAMES
        )
        return a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : child1Name < child2Name ? 1 : -1
    })
    const bookings: Emails['holidayProgramConfirmation']['bookings'] = sortedAppointments.map((appointment) => {
        const isHalloween = appointment.datetime.includes('2024-10-31')
        const startTime = DateTime.fromISO(appointment.datetime, { setZone: true })
        const endTime = isHalloween ? startTime.plus({ hours: 1 }) : startTime.plus({ hours: 2, minutes: 30 })
        return {
            datetime: `${AcuityUtilities.retrieveFormAndField(
                appointment,
                AcuityConstants.Forms.CHILDREN_DETAILS,
                AcuityConstants.FormFields.CHILDREN_NAMES
            )} - ${startTime.toFormat('cccc, LLL dd, t')} - ${endTime.toFormat('t')}`,
            confirmationPage: appointment.confirmationPage,
        }
    })

    const isHalloween = bookings.some((it) => it.datetime.includes('Oct 31'))
    const includesNotHalloween = bookings.some((it) => !it.datetime.includes('Oct 31'))

    if (isHalloween && includesNotHalloween) {
        logError('A parent has booked into both the holiday program and halloween program at the same time', null, {
            appointments,
        })
    }

    const mailClient = await MailClient.getInstance()
    if (isHalloween) {
        await mailClient.sendEmail('holidayProgramHalloweenConfirmation', appointments[0].email, {
            parentName: appointments[0].firstName,
            location: `Fizz Kidz ${appointments[0].calendar}`,
            address: appointments[0].location,
            bookings,
        })
    } else {
        await mailClient.sendEmail('holidayProgramConfirmation', appointments[0].email, {
            parentName: appointments[0].firstName,
            location: `Fizz Kidz ${appointments[0].calendar}`,
            address: appointments[0].location,
            bookings,
        })
    }
    return
}
