import { db } from '../../init'
import { onRequest } from '../../utilities'
import { ScienceEnrolment } from 'fizz-kidz'
import { MailClient } from '../../sendgrid/MailClient'
import * as functions from 'firebase-functions'

const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'

const CURRENT_APPOINTMENT_TYPE_ID = 123
const CURRENT_LOCATION = 'TODO'
/**
 * Sends an email to enrolments for this term with their portal url
 */
export const sendPortalLinks = onRequest<'sendPortalLinks'>(async (req, resp) => {
    try {
        // const acuityClient = new AcuityClient()
        // const appointmentTypes = await acuityClient.getAppointmentTypes()
        // let scienceAppointmentTypes = appointmentTypes.filter((it) => it.id === CURRENT_APPOINTMENT_TYPE_ID)

        await _sendPortalLinks(CURRENT_APPOINTMENT_TYPE_ID)
        // batch in groups of 10 (max number supported by firestore 'in' query)
        // const chunkSize = 10
        // for (let i = 0; i < scienceAppointmentTypes.length; i += chunkSize) {
        //     const chunk = scienceAppointmentTypes.slice(i, i + chunkSize)
        //     await _sendPortalLinks(chunk)
        // }
        resp.status(200).send()
    } catch (error) {
        functions.logger.error('error while sending science parent portal link email', error)
        resp.status(500).send()
    }
})

async function _sendPortalLinks(appointmentTypeId: number) {
    const appointmentsSnapshot = await db
        .collection('scienceAppointments')
        .where('appointmentTypeId', '==', appointmentTypeId)
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
                location: CURRENT_LOCATION,
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
