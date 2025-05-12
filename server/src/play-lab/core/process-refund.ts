import { logger } from 'firebase-functions/v2'
import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'

import type { AcuityWebhookData } from '../../acuity'
import { AcuityClient } from '../../acuity/core/acuity-client'
import { SquareClient } from '../../square/core/square-client'
import { logError } from '../../utilities'

export async function processPlayLabRefund(data: AcuityWebhookData) {
    const acuity = await AcuityClient.getInstance()
    const appointment = await acuity.getAppointment(data.id)
    const isTermEnrolment =
        AcuityUtilities.retrieveFormAndField(
            appointment,
            AcuityConstants.Forms.HOLIDAY_PROGRAM_PAYMENT_DETAILS,
            AcuityConstants.FormFields.IS_TERM_ENROLMENT
        ) === 'yes'

    // do not process refunds on term enrolments automatically
    if (isTermEnrolment) return

    const appointmentDate = new Date(appointment.datetime)
    const now = new Date()
    const msBetweenDates = Math.abs(appointmentDate.getTime() - now.getTime())

    // convert ms to hours
    const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)

    if (hoursBetweenDates < 48) {
        logger.log('Less than 48 hours before program, not performing refund.')
        return
    }

    const orderId = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.HOLIDAY_PROGRAM_PAYMENT_DETAILS,
        AcuityConstants.FormFields.PAYMENT_ID
    ) as string

    const square = await SquareClient.getInstance()

    const { order, errors: getOrderErrors } = await square.orders.get({ orderId })

    if (getOrderErrors) {
        logError(
            `Unable to find square order while processing play lab refund for session with classId: ${data.id}`,
            getOrderErrors[0],
            {
                webhookData: data,
            }
        )
        return
    }

    const lineItemToRefund = order?.lineItems?.find((it) => it?.metadata?.['classId'] === appointment.id.toString())
    if (!lineItemToRefund) {
        logError(
            `Unable to find line item with matching class id for play lab booking with id: ${appointment.id}`,
            null,
            { webhookData: data }
        )
        return
    }
    const amountToRefund = lineItemToRefund.totalMoney?.amount

    const { errors: refundErrors } = await square.refunds.refundPayment({
        amountMoney: { amount: amountToRefund, currency: 'AUD' },
        idempotencyKey: data.id,
    })

    if (refundErrors) {
        logError(`Unable to process square refund for plab lab booking with id: ${appointment.id}`, refundErrors[0], {
            webhookData: data,
            refundAmount: amountToRefund,
        })
        return
    }

    return
}
