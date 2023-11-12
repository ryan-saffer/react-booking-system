import { AcuityConstants, AcuityUtilities, AcuityTypes } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { Emails } from '../../sendgrid/types'
import { MailClient } from '../../sendgrid/MailClient'

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
        const startTime = DateTime.fromISO(appointment.datetime, { setZone: true })
        const endTime = startTime.plus({ hours: 2, minutes: 30 })
        return {
            datetime: `${AcuityUtilities.retrieveFormAndField(
                appointment,
                AcuityConstants.Forms.CHILDREN_DETAILS,
                AcuityConstants.FormFields.CHILDREN_NAMES
            )} - ${startTime.toFormat('cccc, LLL dd, t')} - ${endTime.toFormat('t')}`,
            confirmationPage: appointment.confirmationPage,
        }
    })

    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail('holidayProgramConfirmation', appointments[0].email, {
        parentName: appointments[0].firstName,
        location: `Fizz Kidz ${appointments[0].calendar}`,
        address: appointments[0].location,
        bookings,
    })
    return
}
