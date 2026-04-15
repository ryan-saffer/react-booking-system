import { DateTime } from 'luxon'

import type { UnenrollPreschoolProgramParams } from 'fizz-kidz'

import { AcuityClient } from '@/acuity/core/acuity-client'
import { DatabaseClient } from '@/firebase/DatabaseClient'
import { MixpanelClient } from '@/mixpanel/mixpanel-client'
import { MailClient } from '@/sendgrid/MailClient'
import { SquareClient } from '@/square/core/square-client'
import { logError, throwTrpcError } from '@/utilities'

import type { InvoiceStatus } from 'square/api'

export async function unenrollPreschoolProgram(input: UnenrollPreschoolProgramParams) {
    await Promise.all(
        input.enrolmentIds.map(async (enrolmentId) => {
            const enrolment = await DatabaseClient.getPreschoolProgramEnrolment(enrolmentId)

            try {
                const acuity = await AcuityClient.getInstance()
                await Promise.all(
                    enrolment.appointments.map((appointmentId) => acuity.cancelAppointment(appointmentId))
                )
            } catch (err) {
                throwTrpcError(
                    'INTERNAL_SERVER_ERROR',
                    `error unenrolling Preschool Program term. firestore id: ${enrolmentId}`,
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
                        'unable to find existing Preschool Program invoice in square during unenrolment',
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

            await DatabaseClient.deletePreschoolProgramEnrolment(enrolmentId)

            try {
                const mailClient = await MailClient.getInstance()
                await mailClient.sendEmail('preschoolProgramUnenrolmentConfirmation', enrolment.parent.email, {
                    parentName: enrolment.parent.firstName,
                    childName: enrolment.child.firstName,
                    className: enrolment.className,
                })
            } catch (err) {
                logError(
                    `Preschool Program enrolment with id ${enrolmentId} was cancelled successfully, however the confirmation email could not be sent`,
                    err
                )
            }

            const mixpanel = await MixpanelClient.getInstance()
            await mixpanel.track('preschool-program-unenrolment', {
                distinct_id: enrolment.parent.email,
                appointmentTypeId: enrolment.appointmentTypeId,
                calendarId: enrolment.calendarId,
                location: enrolment.studio,
                childAge: Math.abs(DateTime.fromISO(enrolment.child.dob).diffNow('years').years).toFixed(0),
                className: enrolment.className,
                numberOfWeeks: enrolment.appointments.length,
            })
        })
    )
}
