import * as functions from 'firebase-functions'
import { ScienceEnrolment, SendTermContinuationEmailParams } from 'fizz-kidz'
import { onCall } from '../../utilities'
import { db } from '../../init'
import { MailClient } from '../../sendgrid/MailClient'

const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'

export const sendTermContinuationEmailV2 = onCall<'sendTermContinuationEmailV2'>(
    async (input: SendTermContinuationEmailParams, _context: functions.https.CallableContext) => {
        const appointmentRef = db.collection('scienceAppointments').doc(input.appointmentId)
        const appointment = (await appointmentRef.get()).data() as ScienceEnrolment

        const baseQueryParams = `?appointmentId=${input.appointmentId}`
        const continueQueryParams = baseQueryParams + `&continuing=yes`
        const unenrollQueryParams = baseQueryParams + `&continuing=no`

        const encodedContinueQueryParams = Buffer.from(continueQueryParams).toString('base64')
        const encodedUnenrollQueryParams = Buffer.from(unenrollQueryParams).toString('base64')

        let baseUrl = env === 'prod' ? 'https://bookings.fizzkidz.com.au' : 'https://booking-system-6435d.web.app'
        baseUrl += '/science-club-enrolment-v2'

        try {
            await new MailClient().sendEmail('termContinuationEmail', appointment.parent.email, {
                parentName: appointment.parent.firstName,
                className: appointment.className,
                price: appointment.price,
                childName: appointment.child.firstName,
                continueUrl: `${baseUrl}?${encodedContinueQueryParams}`,
                unenrollUrl: `${baseUrl}?${encodedUnenrollQueryParams}`,
            })
            const updatedAppointment: Partial<ScienceEnrolment> = {
                emails: {
                    ...appointment.emails,
                    continuingEmailSent: true,
                },
            }
            await appointmentRef.set({ ...updatedAppointment }, { merge: true })
            return
        } catch (error) {
            throw new functions.https.HttpsError('internal', 'error running apps script', error)
        }
    }
)
