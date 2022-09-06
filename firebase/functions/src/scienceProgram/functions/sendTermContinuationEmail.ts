import * as functions from 'firebase-functions'
import { ScienceAppointment, SendTermContinuationEmailParams } from 'fizz-kidz'
import { onCall } from '../../utilities'
import { db } from '../../index'
import { MailClient } from '../../sendgrid/EmailClient'
import { Emails } from '../../sendgrid/types'

const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'

export const sendTermContinuationEmailV2 = onCall<'sendTermContinuationEmailV2'>(
    async (input: SendTermContinuationEmailParams, _context: functions.https.CallableContext) => {
        const appointmentRef = db.collection('scienceAppointments').doc(input.appointmentId)
        const appointment = (await appointmentRef.get()).data() as ScienceAppointment

        const baseQueryParams = `?appointmentId=${input.appointmentId}`
        const continueQueryParams = baseQueryParams + `&continuing=yes`
        const unenrollQueryParams = baseQueryParams + `&continuing=no`

        const encodedContinueQueryParams = Buffer.from(continueQueryParams).toString('base64')
        const encodedUnenrollQueryParams = Buffer.from(unenrollQueryParams).toString('base64')

        let baseUrl = env === 'prod' ? 'https://bookings.fizzkidz.com.au' : 'https://booking-system-6435d.web.app'
        baseUrl += '/science-club-enrolment-v2'

        const data: Emails['termContinuationEmail'] = {
            templateName: 'term_continuation_email.html',
            emailAddress: appointment.parentEmail,
            values: {
                parentName: appointment.parentFirstName,
                className: appointment.type,
                price: appointment.price,
                childName: appointment.childName,
                continueUrl: `${baseUrl}?${encodedContinueQueryParams}`,
                unenrollUrl: `${baseUrl}?${encodedUnenrollQueryParams}`,
            }
        }

        try {
            const mailClient = new MailClient()
            await mailClient.sendEmail('termContinuationEmail', data)
            const updatedAppointment: Partial<ScienceAppointment> = {
                continuingEmailSent: true
            }
            await appointmentRef.set({ ...updatedAppointment }, { merge: true })
            return
        } catch (error) {
            throw new functions.https.HttpsError('internal', 'error running apps script', error)
        }
    }
)
