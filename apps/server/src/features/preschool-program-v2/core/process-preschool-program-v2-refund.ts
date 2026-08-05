import { logger } from 'firebase-functions/v2'
import { DateTime } from 'luxon'

import { AcuityConstants, AcuityUtilities, studioNameAndAddress } from '@fizz-kidz/core'
import type { AcuityTypes } from '@fizz-kidz/core'

import { AcuityClient } from '@/integrations/acuity/acuity.client'
import type { AcuityWebhookData } from '@/integrations/acuity/functions/acuity.webhook'
import { MixpanelClient } from '@/integrations/mixpanel/mixpanel.client'
import { logError } from '@/integrations/observability/log-error'
import { MailClient } from '@/integrations/sendgrid/sendgrid.client'
import { SquareClient } from '@/integrations/square/square.client'

import { calculateRefundCents, repriceRemainingOrder } from './preschool-program-v2-pricing'

import type { Square } from 'square'

const REFUND_CUTOFF_HOURS = 48
const SIBLING_APPOINTMENT_LOOKBACK_MONTHS = 6
const SIBLING_APPOINTMENT_LOOKAHEAD_MONTHS = 18

/** Handles an Acuity cancellation by repricing active siblings and issuing any eligible Square refund. */
export async function processPreschoolProgramV2Refund(data: AcuityWebhookData) {
    const acuity = await AcuityClient.getInstance()
    const appointment = await acuity.getAppointment(data.id)

    const orderId = getAppointmentOrderId(appointment)
    if (!orderId) {
        logError('Unable to find Square order id while processing preschool-v2 refund', null, { data, appointment })
        return
    }

    const square = await SquareClient.getInstance()
    let order: Square.Order

    try {
        const result = await square.orders.get({ orderId })
        order = result.order!
    } catch (err) {
        logError('Unable to find Square order while processing preschool-v2 refund', err, { data, orderId })
        return
    }

    const lineItemIdentifier = getAppointmentLineItemIdentifier(appointment)
    const cancelledLineItem = findLineItemByIdentifier(order, lineItemIdentifier)
    if (!cancelledLineItem) {
        logError('Unable to find matching Square line item while processing preschool-v2 refund', null, {
            data,
            orderId,
            lineItemIdentifier,
        })
        return
    }

    if (!isOutsideRefundCutoff(appointment)) {
        logger.log('Less than 48 hours before preschool-v2 session, not performing refund.')
        await sendCancellationEmail({ appointment, lineItem: cancelledLineItem, receiptUrl: '', refundAmountCents: 0 })
        return
    }

    const remainingAppointments = await getRemainingOrderAppointments(acuity, appointment, orderId)
    const remainingLineItemIdentifiers = new Set(
        remainingAppointments.map(getAppointmentLineItemIdentifier).filter(Boolean)
    )
    const amountToRefund = await calculateRefundAmount(square, order, remainingLineItemIdentifiers)

    if (amountToRefund <= BigInt(0)) {
        await sendCancellationEmail({ appointment, lineItem: cancelledLineItem, receiptUrl: '', refundAmountCents: 0 })
        return
    }

    const receiptUrl = await refundAcrossTenders(square, order, amountToRefund, data)

    await sendCancellationEmail({
        appointment,
        lineItem: cancelledLineItem,
        receiptUrl,
        refundAmountCents: Number(amountToRefund),
    })
}

/** Calculates the currently refundable amount from net paid funds and remaining appointment line items. */
async function calculateRefundAmount(
    square: Awaited<ReturnType<typeof SquareClient.getInstance>>,
    order: Square.Order,
    remainingLineItemIdentifiers: Set<string>
) {
    const netPaidCents = await getNetPaidCents(square, order)
    const repricedRemainingTotalCents = repriceRemainingOrder(order, remainingLineItemIdentifiers)
    return calculateRefundCents(netPaidCents, repricedRemainingTotalCents)
}

/** Totals completed tender payments after subtracting all prior refunds. */
async function getNetPaidCents(square: Awaited<ReturnType<typeof SquareClient.getInstance>>, order: Square.Order) {
    let netPaidCents = BigInt(0)

    for (const tender of order.tenders || []) {
        if (!tender.paymentId) continue

        try {
            const { payment } = await square.payments.get({ paymentId: tender.paymentId })
            netPaidCents += (payment?.amountMoney?.amount ?? BigInt(0)) - (payment?.refundedMoney?.amount ?? BigInt(0))
        } catch (error) {
            logError('Error determining net paid amount for preschool-v2 refund', error, {
                orderId: order.id,
                tenderId: tender.id,
                paymentId: tender.paymentId,
            })
        }
    }

    return netPaidCents
}

/** Distributes a refund across available Square tenders without exceeding each tender's refundable balance. */
async function refundAcrossTenders(
    square: Awaited<ReturnType<typeof SquareClient.getInstance>>,
    order: Square.Order,
    amountToRefund: bigint,
    data: AcuityWebhookData
) {
    let remainingAmountToRefund = amountToRefund
    let lastRefundPaymentId = ''

    for (const tender of order.tenders || []) {
        if (remainingAmountToRefund <= BigInt(0)) break
        if (!tender.paymentId) continue

        let refundableAmount = tender.amountMoney?.amount ?? BigInt(0)
        try {
            const { payment } = await square.payments.get({ paymentId: tender.paymentId })
            refundableAmount -= payment?.refundedMoney?.amount ?? BigInt(0)
        } catch (error) {
            logError('Error determining refundable tender amount for preschool-v2 refund', error, {
                data,
                orderId: order.id,
                tenderId: tender.id,
                paymentId: tender.paymentId,
            })
        }

        if (refundableAmount <= BigInt(0)) continue

        const refundThisTender = remainingAmountToRefund > refundableAmount ? refundableAmount : remainingAmountToRefund
        if (refundThisTender <= BigInt(0)) continue

        await square.refunds.refundPayment({
            idempotencyKey: `${data.id}-preschool-v2-refund-${tender.id!}`,
            amountMoney: { amount: refundThisTender, currency: tender.amountMoney?.currency || 'AUD' },
            paymentId: tender.paymentId,
            reason: 'Cancelled more than 48 hours before preschool program session - automatic refund',
        })

        lastRefundPaymentId = tender.paymentId
        remainingAmountToRefund -= refundThisTender
    }

    if (remainingAmountToRefund > BigInt(0)) {
        logError('Refund amount not fully covered by tenders while processing preschool-v2 refund', null, {
            data,
            orderId: order.id,
            remainingAmount: remainingAmountToRefund.toString(),
        })
    }

    if (!lastRefundPaymentId) return ''

    try {
        const { payment } = await square.payments.get({ paymentId: lastRefundPaymentId })
        return payment?.receiptUrl || ''
    } catch (error) {
        logError('Error getting payment receipt while processing preschool-v2 refund', error, {
            data,
            orderId: order.id,
            paymentId: lastRefundPaymentId,
        })
        return ''
    }
}

/** Finds active Acuity appointments that belong to the same Square order as the cancelled appointment. */
async function getRemainingOrderAppointments(
    acuity: Awaited<ReturnType<typeof AcuityClient.getInstance>>,
    cancelledAppointment: AcuityTypes.Api.Appointment,
    orderId: string
) {
    const appointments = await acuity.searchForAppointments({
        appointmentTypeId: cancelledAppointment.appointmentTypeID,
        minDate: DateTime.fromISO(cancelledAppointment.datetime, { setZone: true })
            .minus({ months: SIBLING_APPOINTMENT_LOOKBACK_MONTHS })
            .toISODate(),
        maxDate: DateTime.fromISO(cancelledAppointment.datetime, { setZone: true })
            .plus({ months: SIBLING_APPOINTMENT_LOOKAHEAD_MONTHS })
            .toISODate(),
        maxResults: 1000,
    })

    return appointments.filter(
        (appointment) => appointment.id !== cancelledAppointment.id && getAppointmentOrderId(appointment) === orderId
    )
}

/** Reports whether the appointment is at least 48 hours away and therefore refund eligible. */
function isOutsideRefundCutoff(appointment: AcuityTypes.Api.Appointment) {
    const hoursUntilAppointment = DateTime.fromISO(appointment.datetime, { setZone: true }).diffNow('hours').hours
    return hoursUntilAppointment >= REFUND_CUTOFF_HOURS
}

/** Reads the Square order ID stored on an Acuity appointment. */
function getAppointmentOrderId(appointment: AcuityTypes.Api.Appointment) {
    return AcuityUtilities.retrieveFormAndField(
        appointment,
        AcuityConstants.Forms.PAYMENT,
        AcuityConstants.FormFields.ORDER_ID
    ) as string
}

/** Reads the stable Square line-item identifier stored on an Acuity appointment. */
function getAppointmentLineItemIdentifier(appointment: AcuityTypes.Api.Appointment) {
    return (
        AcuityUtilities.retrieveFormAndField(
            appointment,
            AcuityConstants.Forms.PAYMENT,
            AcuityConstants.FormFields.LINE_ITEM_IDENTIFIER
        ) || ''
    )
}

/** Finds the Square line item associated with an Acuity appointment. */
function findLineItemByIdentifier(order: Square.Order, lineItemIdentifier: string) {
    return order.lineItems?.find((lineItem) => lineItem.metadata?.['lineItemIdentifier'] === lineItemIdentifier)
}

/** Sends the cancellation outcome, including refund amount and receipt when available. */
async function sendCancellationEmail({
    appointment,
    lineItem,
    receiptUrl,
    refundAmountCents,
}: {
    appointment: AcuityTypes.Api.Appointment
    lineItem: Square.OrderLineItem
    receiptUrl: string
    refundAmountCents: number
}) {
    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail('preschoolProgramV2Cancellation', appointment.email, {
        parentName: appointment.firstName,
        booking: lineItem.name || appointment.type,
        location: studioNameAndAddress(AcuityUtilities.getStudioByCalendarId(appointment.calendarID)),
        receiptUrl,
        refundAmount: (refundAmountCents / 100).toFixed(2),
        hasRefund: refundAmountCents > 0,
    })

    const mixpanel = await MixpanelClient.getInstance()
    await mixpanel.track('preschool-program-cancellation', {
        distinct_id: appointment.email,
        location: AcuityUtilities.getStudioByCalendarId(appointment.calendarID),
        booking: lineItem.name || appointment.type,
        refundAmount: refundAmountCents / 100,
        hasRefund: refundAmountCents > 0,
    })
}
