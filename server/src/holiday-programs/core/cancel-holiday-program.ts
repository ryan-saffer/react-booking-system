import { logger } from 'firebase-functions/v2'
import { AcuityConstants, AcuityUtilities, Metadata } from 'fizz-kidz'

import { AcuityWebhookData } from '../../acuity'
import { AcuityClient } from '../../acuity/core/acuity-client'
import { StripeClient } from '../../stripe/core/stripe-client'
import { logError } from '../../utilities'
import { RefundCalculator } from './refund-calculator'

export async function cancelHolidayProgram(data: AcuityWebhookData) {
    try {
        const stripe = await StripeClient.getInstance()
        const acuity = await AcuityClient.getInstance()
        const appointment = await acuity.getAppointment(data.id)
        const paymentIntentId = AcuityUtilities.retrieveFormAndField(
            appointment,
            AcuityConstants.Forms.HOLIDAY_PROGRAM_PAYMENT_DETAILS,
            AcuityConstants.FormFields.HOLIDAY_PROGRAM_PAYMENT_INTENT_ID
        )
        const amountCharged = AcuityUtilities.retrieveFormAndField(
            appointment,
            AcuityConstants.Forms.HOLIDAY_PROGRAM_PAYMENT_DETAILS,
            AcuityConstants.FormFields.HOLIDAY_PROGRAM_AMOUNT_CHARGED
        )

        // if no payment intent id, it means it has been deleted from the appointment manually.
        // this can be used as a way to allow cancellation of bookings without triggering a refund.
        // useful in the case that a previous webhook failed, despite some appointments booking in successfully, which triggers a webhook retry.. and therefore duplicate bookings
        if (!paymentIntentId) {
            logError('No payment intent id found - skipping refund', null, { appointment })
            return
        }
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        const metadata = paymentIntent.metadata as Metadata

        // if appointment is < 24 hours away, no refunds allowed.
        const appointmentDate = new Date(appointment.datetime)
        const now = new Date()
        const msBetweenDates = Math.abs(appointmentDate.getTime() - now.getTime())

        // convert ms to hours
        const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)

        if (hoursBetweenDates > 48) {
            const refundCalulcator = new RefundCalculator(metadata, parseInt(amountCharged))
            const refundAmount = refundCalulcator.calculateRefund()
            logger.log('Performing refund of amount:', refundAmount)

            // perform the refund
            await stripe.refunds.create({
                amount: refundAmount * 100,
                payment_intent: paymentIntent.id,
                reason: 'requested_by_customer',
            })
        } else {
            logger.log('Less than 48 hours before program, not performing refund.')
        }

        // update program count to one less, regardless if refunded or not.
        logger.log('program count before update is:', metadata.programCount)
        await stripe.paymentIntents.update(paymentIntent.id, {
            metadata: { programCount: parseInt(metadata.programCount) - 1 },
        })
    } catch (error) {
        console.error('error occurred attempting refund', error)
        throw new Error('unable to cancel holiday program')
    }
}
