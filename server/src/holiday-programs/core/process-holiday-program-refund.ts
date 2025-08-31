import { logger } from 'firebase-functions/v2'
import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'
import type { Order } from 'square/api'

import { AcuityClient } from '@/acuity/core/acuity-client'
import type { AcuityWebhookData } from '@/acuity/functions/acuity.webhook'
import { MailClient } from '@/sendgrid/MailClient'
import { SquareClient } from '@/square/core/square-client'
import { logError } from '@/utilities'

export async function processHolidayProgramRefund(data: AcuityWebhookData) {
    const acuity = await AcuityClient.getInstance()
    const appointment = await acuity.getAppointment(data.id)

    const orderId = AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.PAYMENT,
        AcuityConstants.FormFields.ORDER_ID
    ) as string

    const square = await SquareClient.getInstance()
    let order: Order

    try {
        const result = await square.orders.get({ orderId })
        order = result.order!
    } catch (err) {
        logError(
            `Unable to find square order while processing holiday program refund for session with classId: ${data.id}`,
            err,
            {
                webhookData: data,
            }
        )
        return
    }
    // if searching for line items that just match classId, multiple line items could be found if multiple children booked.
    // so to be sure we are processing the refund on the correct line item, we get the line item identifier
    const lineItemIdentifier =
        AcuityUtilities.retrieveFormAndField(
            appointment,
            AcuityConstants.Forms.PAYMENT,
            AcuityConstants.FormFields.LINE_ITEM_IDENTIFIER
        ) || 'not-found'
    const lineItemToRefund = order?.lineItems?.find((it) => it?.metadata?.['lineItemIdentifier'] === lineItemIdentifier)
    if (!lineItemToRefund) {
        logError(
            `Unable to find line item with matching class id and line item identifier for holiday program booking with id: ${appointment.id}`,
            null,
            { webhookData: data, lineItemIdentifier, orderId }
        )
        return
    }

    const mailClient = await MailClient.getInstance()

    const amountToRefund = lineItemToRefund.totalMoney?.amount

    const appointmentDate = new Date(appointment.datetime)
    const now = new Date()
    const msBetweenDates = Math.abs(appointmentDate.getTime() - now.getTime())

    // convert ms to hours
    const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)

    if (hoursBetweenDates < 48) {
        logger.log('Less than 48 hours before program, not performing refund.')
        await mailClient.sendEmail('holidayProgramCancellation', appointment.email, {
            booking: lineItemToRefund.name!,
            location: `Fizz Kidz ${appointment.calendar}`,
            parentName: appointment.firstName,
            receiptUrl: '',
        })
        return
    }

    if (amountToRefund === BigInt(0)) {
        // dont process refunds on free bookings
        await mailClient.sendEmail('holidayProgramCancellation', appointment.email, {
            booking: lineItemToRefund.name!,
            location: `Fizz Kidz ${appointment.calendar}`,
            parentName: appointment.firstName,
            receiptUrl: '',
        })
        return
    }

    let receiptUrl = ''
    const paymentId = order?.tenders?.[0].paymentId
    if (!paymentId) {
        logError('Order does not have a tendered payment id while processing holiday program refund', null, {
            webhookData: data,
            orderId: orderId,
        })
    } else {
        try {
            await square.refunds.refundPayment({
                amountMoney: { amount: amountToRefund, currency: 'AUD' },
                reason: 'Cancelled more than 48 hours before program - automatic refund',
                paymentId,
                idempotencyKey: data.id,
            })
        } catch (err) {
            logError(`Unable to process square refund for holiday program booking with id: ${appointment.id}`, err, {
                webhookData: data,
                refundAmount: amountToRefund,
            })
        }

        try {
            const { payment } = await square.payments.get({ paymentId })
            receiptUrl = payment?.receiptUrl || ''
        } catch (error) {
            logError('Error getting payment receipt while processing holiday program refund', error, {
                data,
                paymentId,
                appointment,
            })
        }
    }

    await mailClient.sendEmail('holidayProgramCancellation', appointment.email, {
        booking: lineItemToRefund.name!,
        location: `Fizz Kidz ${appointment.calendar}`,
        parentName: appointment.firstName,
        receiptUrl,
    })
}
