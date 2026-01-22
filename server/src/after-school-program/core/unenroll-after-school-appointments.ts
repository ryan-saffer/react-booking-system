import type { AfterSchoolEnrolment, UnenrollAfterSchoolParams } from 'fizz-kidz'


import { AcuityClient } from '@/acuity/core/acuity-client'
import { DatabaseClient } from '@/firebase/DatabaseClient'
import { MixpanelClient } from '@/mixpanel/mixpanel-client'
import { MailClient } from '@/sendgrid/MailClient'
import { SquareClient } from '@/square/core/square-client'
import { throwTrpcError } from '@/utilities'

import type { InvoiceStatus } from 'square/api'

export async function unenrollAfterSchoolAppointments(input: UnenrollAfterSchoolParams) {
    await Promise.all(
        input.appointmentIds.map(async (appointmentId) => {
            // 1. get appointment from firestore
            const enrolment = await DatabaseClient.getAfterSchoolEnrolment(appointmentId)

            // 2. cancel each acuity appointment
            const appointmentIds = enrolment.appointments

            try {
                const acuity = await AcuityClient.getInstance()
                await Promise.all(appointmentIds.map((id) => acuity.cancelAppointment(id)))
            } catch (err) {
                throwTrpcError(
                    'INTERNAL_SERVER_ERROR',
                    `error unenrolling from term. firestore id: ${appointmentId}`,
                    err
                )
            }

            // 3. void invoice if needed
            if (enrolment.invoiceId) {
                const square = await SquareClient.getInstance()
                const { invoice: existingInvoice } = await square.invoices.get({
                    invoiceId: enrolment.invoiceId,
                })

                if (
                    !existingInvoice ||
                    !existingInvoice.status ||
                    !existingInvoice.id ||
                    !(typeof existingInvoice.version === 'number')
                )
                    throwTrpcError(
                        'INTERNAL_SERVER_ERROR',
                        'unable to find existing invoice in square despite enrolment having an invoice id during unenrolment',
                        null,
                        { input }
                    )

                const UNCANCELLABLE_STATUSES: InvoiceStatus[] = ['DRAFT', 'PAID', 'REFUNDED', 'CANCELED', 'FAILED']
                if (!UNCANCELLABLE_STATUSES.includes(existingInvoice.status)) {
                    await square.invoices.cancel({
                        invoiceId: existingInvoice.id,
                        version: existingInvoice.version,
                    })
                }
            }

            // 4. set status to 'unenrolled'
            const updatedAppointment: Partial<AfterSchoolEnrolment> = {
                status: 'inactive',
            }
            await DatabaseClient.updateAfterSchoolEnrolment(appointmentId, updatedAppointment)

            // 5. email confirmation
            if (input.sendConfirmationEmail) {
                try {
                    const mailClient = await MailClient.getInstance()
                    await mailClient.sendEmail('afterSchoolUnenrolmentConfirmation', enrolment.parent.email, {
                        parentName: enrolment.parent.firstName,
                        childName: enrolment.child.firstName,
                        className: enrolment.className,
                    })
                } catch (err) {
                    throwTrpcError(
                        'INTERNAL_SERVER_ERROR',
                        `appointment with id ${appointmentId} cancelled successfully, however an error occurred sending the confirmation email`,
                        err
                    )
                }
            }

            // 6. Analytics
            const mixpanel = await MixpanelClient.getInstance()
            await mixpanel.track('after-school-program-unenrolment', {
                distinct_id: enrolment.parent.email,
                type: enrolment.type,
                inStudio: enrolment.inStudio,
                appointmentTypeId: enrolment.appointmentTypeId,
                calendarId: enrolment.calendarId,
                childAge: enrolment.child.age,
                childGrade: enrolment.child.grade,
                className: enrolment.className,
            })
        })
    )
}
