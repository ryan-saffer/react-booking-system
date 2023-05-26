import * as functions from 'firebase-functions'
import { ScienceEnrolment, SendTermContinuationEmailsParams } from 'fizz-kidz'
import { onCall } from '../../utilities'
import { db } from '../../init'
import { getMailClient } from '../../sendgrid/MailClient'

const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'

export const sendTermContinuationEmails = onCall<'sendTermContinuationEmails'>(
    async (input: SendTermContinuationEmailsParams) => {
        const results = await Promise.allSettled(
            input.appointmentIds.map(async (appointmentId) => {
                const appointmentRef = db.collection('scienceAppointments').doc(appointmentId)
                const appointment = (await appointmentRef.get()).data() as ScienceEnrolment

                const baseQueryParams = `?appointmentId=${appointmentId}`
                const continueQueryParams = baseQueryParams + `&continuing=yes`
                const unenrollQueryParams = baseQueryParams + `&continuing=no`

                const encodedContinueQueryParams = Buffer.from(continueQueryParams).toString('base64')
                const encodedUnenrollQueryParams = Buffer.from(unenrollQueryParams).toString('base64')

                let baseUrl =
                    env === 'prod' ? 'https://bookings.fizzkidz.com.au' : 'https://booking-system-6435d.web.app'
                baseUrl += '/science-club-enrolment'

                try {
                    await getMailClient().sendEmail('termContinuationEmail', appointment.parent.email, {
                        parentName: appointment.parent.firstName,
                        className: appointment.className,
                        price: (parseInt(appointment.price) * appointment.appointments.length).toString(),
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
                } catch (err) {
                    functions.logger.error(err)
                    throw new functions.https.HttpsError(
                        'internal',
                        `error sending term continutation email to appointment with id: ${appointmentId}`,
                        err
                    )
                }
            })
        )

        // return an array of all ids that sent successfully
        const succeeded: string[] = []
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                succeeded.push(input.appointmentIds[index])
            }
        })
        return succeeded
    }
)
