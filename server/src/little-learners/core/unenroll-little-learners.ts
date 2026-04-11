import type { UnenrollLittleLearnersParams } from 'fizz-kidz'

import { AcuityClient } from '@/acuity/core/acuity-client'
import { DatabaseClient } from '@/firebase/DatabaseClient'
import { SquareClient } from '@/square/core/square-client'
import { throwTrpcError } from '@/utilities'

import type { InvoiceStatus } from 'square/api'

export async function unenrollLittleLearners(input: UnenrollLittleLearnersParams) {
    await Promise.all(
        input.enrolmentIds.map(async (enrolmentId) => {
            const enrolment = await DatabaseClient.getLittleLearnersEnrolment(enrolmentId)

            try {
                const acuity = await AcuityClient.getInstance()
                await Promise.all(
                    enrolment.appointments.map((appointmentId) => acuity.cancelAppointment(appointmentId))
                )
            } catch (err) {
                throwTrpcError(
                    'INTERNAL_SERVER_ERROR',
                    `error unenrolling Little Learners term. firestore id: ${enrolmentId}`,
                    err
                )
            }

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
                ) {
                    throwTrpcError(
                        'INTERNAL_SERVER_ERROR',
                        'unable to find existing Little Learners invoice in square during unenrolment',
                        null,
                        { input, enrolmentId }
                    )
                }

                const uncancellableStatuses: InvoiceStatus[] = ['DRAFT', 'PAID', 'REFUNDED', 'CANCELED', 'FAILED']
                if (!uncancellableStatuses.includes(existingInvoice.status)) {
                    await square.invoices.cancel({
                        invoiceId: existingInvoice.id,
                        version: existingInvoice.version,
                    })
                }
            }

            await DatabaseClient.deleteLittleLearnersEnrolment(enrolmentId)
        })
    )
}
