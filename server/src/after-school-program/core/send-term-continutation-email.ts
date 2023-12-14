import { AfterSchoolEnrolment, SendTermContinuationEmailsParams, getApplicationDomain } from 'fizz-kidz'

import { FirestoreClient } from '../../firebase/FirestoreClient'
import { env } from '../../init'
import { MailClient } from '../../sendgrid/MailClient'
import { throwTrpcError } from '../../utilities'

export async function sendTermContinutationEmails(input: SendTermContinuationEmailsParams) {
    const results = await Promise.allSettled(
        input.appointmentIds.map(async (appointmentId) => {
            const firestoreClient = await FirestoreClient.getInstance()
            const appointmentRef = firestoreClient.collection('scienceAppointments').doc(appointmentId)
            const appointment = (await appointmentRef.get()).data() as AfterSchoolEnrolment

            const baseQueryParams = `?appointmentId=${appointmentId}`
            const continueQueryParams = baseQueryParams + `&continuing=yes`
            const unenrollQueryParams = baseQueryParams + `&continuing=no`

            const encodedContinueQueryParams = Buffer.from(continueQueryParams).toString('base64')
            const encodedUnenrollQueryParams = Buffer.from(unenrollQueryParams).toString('base64')

            const baseUrl = `${getApplicationDomain(env)}/science-club-enrolment`

            try {
                const mailClient = await MailClient.getInstance()
                await mailClient.sendEmail('termContinuationEmail', appointment.parent.email, {
                    parentName: appointment.parent.firstName,
                    className: appointment.className,
                    price: (parseInt(appointment.price) * appointment.appointments.length).toString(),
                    childName: appointment.child.firstName,
                    continueUrl: `${baseUrl}?${encodedContinueQueryParams}`,
                    unenrollUrl: `${baseUrl}?${encodedUnenrollQueryParams}`,
                })
                const updatedAppointment: Partial<AfterSchoolEnrolment> = {
                    emails: {
                        ...appointment.emails,
                        continuingEmailSent: true,
                    },
                }
                await appointmentRef.set({ ...updatedAppointment }, { merge: true })
            } catch (err) {
                throwTrpcError(
                    'INTERNAL_SERVER_ERROR',
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
