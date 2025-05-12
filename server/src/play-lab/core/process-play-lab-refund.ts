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

    // we currently have the id of the appointment, but not the id of the class which is saved into the square metadata
    const classes = await acuity.getClasses([parseInt(data.appointmentTypeID)], false, Date.now())
    const cancelledClass = classes.find((it) => it.id === appointment.classID)
    if (!cancelledClass) {
        logError(`Unable to find which class was cancelled while booking play lab appointment`, null, {
            webhookData: data,
        })
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

    // if searching for line items that just match classId, multiple line items could be found if multiple children booked
    // so to be sure we are processing the refund on the correct line item, also compare against child name
    const childName = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.CHILDREN_DETAILS,
        AcuityConstants.FormFields.CHILDREN_NAMES
    )
    const lineItemToRefund = order?.lineItems?.find(
        (it) => it?.metadata?.['classId'] === cancelledClass.id.toString() && it?.metadata?.['childName'] === childName
    )
    if (!lineItemToRefund) {
        logError(
            `Unable to find line item with matching class id for play lab booking with id: ${appointment.id}`,
            null,
            { webhookData: data }
        )
        return
    }
    const amountToRefund = lineItemToRefund.totalMoney?.amount

    const paymentId = order?.tenders?.[0].paymentId
    if (!paymentId) {
        logError('Order does not have a tendered payment id while processing play lab refund', null, {
            webhookData: data,
            orderId: orderId,
        })
    }

    const { errors: refundErrors } = await square.refunds.refundPayment({
        amountMoney: { amount: amountToRefund, currency: 'AUD' },
        paymentId,
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
