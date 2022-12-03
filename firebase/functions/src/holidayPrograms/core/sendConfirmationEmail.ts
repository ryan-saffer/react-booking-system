import { Acuity } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { mailClient } from '../../sendgrid/MailClient'
import { Emails } from '../../sendgrid/types'

export function sendConfirmationEmail(appointments: Acuity.Appointment[]) {
    const sortedAppointments = appointments.sort((a, b) => {
        const child1Name = Acuity.Utilities.retrieveFormAndField(
            a,
            Acuity.Constants.Forms.CHILDREN_DETAILS,
            Acuity.Constants.FormFields.CHILDREN_NAMES
        )
        const child2Name = Acuity.Utilities.retrieveFormAndField(
            b,
            Acuity.Constants.Forms.CHILDREN_DETAILS,
            Acuity.Constants.FormFields.CHILDREN_NAMES
        )
        return a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : child1Name < child2Name ? 1 : -1
    })
    const bookings: Emails['holidayProgramConfirmation']['bookings'] = sortedAppointments.map((appointment) => {
        const dateTime = DateTime.fromISO(appointment.datetime, {
            setZone: true,
        }).toLocaleString({
            weekday: 'long',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
        return {
            datetime: `${Acuity.Utilities.retrieveFormAndField(
                appointment,
                Acuity.Constants.Forms.CHILDREN_DETAILS,
                Acuity.Constants.FormFields.CHILDREN_NAMES
            )} - ${dateTime}`,
            confirmationPage: appointment.confirmationPage,
        }
    })

    return mailClient.sendEmail('holidayProgramConfirmation', appointments[0].email, {
        parentName: appointments[0].firstName,
        location: `Fizz Kidz ${appointments[0].calendar}`,
        address: appointments[0].location,
        bookings,
    })
}
