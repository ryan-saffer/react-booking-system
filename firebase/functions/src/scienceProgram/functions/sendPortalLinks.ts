import { AcuityClient } from '../../acuity/AcuityClient'
import { db } from '../../init'
import { onRequest } from '../../utilities'
import { ScienceEnrolment, Acuity } from 'fizz-kidz'
import { MailClient } from '../../sendgrid/MailClient'
import * as functions from 'firebase-functions'

const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'

/**
 * Sends an email to enrolments for this term with their portal url
 */
export const sendPortalLinks = onRequest<'sendPortalLinks'>(async (req, resp) => {
    try {
        const acuityClient = new AcuityClient()
        const appointmentTypes = await acuityClient.getAppointmentTypes()
        let scienceAppointmentTypes = appointmentTypes.filter(
            (it) => it.category === (env === 'prod' ? 'Science Club' : 'TEST')
        )

        // batch in groups of 10 (max number supported by firestore 'in' query)
        const chunkSize = 10
        for (let i = 0; i < scienceAppointmentTypes.length; i += chunkSize) {
            const chunk = scienceAppointmentTypes.slice(i, i + chunkSize)
            await _sendPortalLinks(chunk)
        }
        resp.status(200).send()
    } catch (error) {
        functions.logger.error('error while sending science parent portal link email', error)
        resp.status(500).send()
    }
})

async function _sendPortalLinks(appointmentTypeIds: Acuity.AppointmentType[]) {
    const appointmentsSnapshot = await db
        .collection('scienceAppointments')
        .where(
            'appointmentTypeId',
            'in',
            appointmentTypeIds.map((it) => it.id)
        )
        .where('status', '==', 'active')
        .where('emails.portalLinkEmailSent', '==', false)
        .get()

    const appointments = appointmentsSnapshot.docs.map((doc) => doc.data() as ScienceEnrolment)
    const mailClient = new MailClient()
    const baseUrl = env === 'prod' ? 'https://bookings.fizzkidz.com.au' : 'https://booking-system-6435d.web.app'
    const results = await Promise.allSettled(
        appointments.map(async (appointment) => {
            await mailClient.sendEmail('scienceParentPortalLink', appointment.parent.email, {
                parentName: appointment.parent.firstName,
                childName: appointment.child.firstName,
                className: appointment.className,
                portalUrl: `${baseUrl}/science-program-portal/${appointment.id}`,
            })
            return appointment
        })
    )
    for (const result of results) {
        if (result.status === 'fulfilled') {
            const appointment = result.value
            const updatedAppointment: Partial<ScienceEnrolment> = {
                emails: {
                    ...appointment.emails,
                    portalLinkEmailSent: true,
                },
            }
            await db.collection('scienceAppointments').doc(appointment.id).update(updatedAppointment)
        }
    }
}
