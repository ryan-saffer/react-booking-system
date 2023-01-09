import { AcuityWebhookData } from './../../acuity/functions/webhook'
import { AcuityClient } from '../../acuity/core/AcuityClient'
import { Acuity, Metadata } from 'fizz-kidz'
import { stripe } from '../../init'
import { RefundCalculator } from './RefundCalculator'

export async function cancelHolidayProgram(data: AcuityWebhookData) {
    try {
        const appointment = await AcuityClient.getAppointment(data.id)
        const paymentIntentId = Acuity.Utilities.retrieveFormAndField(
            appointment,
            Acuity.Constants.Forms.HOLIDAY_PROGRAM_PAYMENT_DETAILS,
            Acuity.Constants.FormFields.HOLIDAY_PROGRAM_PAYMENT_INTENT_ID
        )
        const amountCharged = Acuity.Utilities.retrieveFormAndField(
            appointment,
            Acuity.Constants.Forms.HOLIDAY_PROGRAM_PAYMENT_DETAILS,
            Acuity.Constants.FormFields.HOLIDAY_PROGRAM_AMOUNT_CHARGED
        )

        // if no payment intent id, it means it has been deleted from the appointment manually.
        // this can be used as a way to allow cancellation of bookings without triggering a refund.
        // useful in the case that a previous webhook failed, despite some appointments booking in successfully, which triggers a webhook retry.. and therefore duplicate bookings
        if (!paymentIntentId) {
            console.log('No payment intent id found - skipping refund')
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

        if (hoursBetweenDates > 24) {
            const refundCalulcator = new RefundCalculator(metadata, parseInt(amountCharged))
            const refundAmount = refundCalulcator.calculateRefund()
            console.log('Performing refund of amount:', refundAmount)

            // perform the refund
            await stripe.refunds.create({
                amount: refundAmount * 100,
                payment_intent: paymentIntent.id,
                reason: 'requested_by_customer',
            })
        } else {
            console.log('Less than 24 hours before program, not performing refund.')
        }

        // update program count to one less, regardless if refunded or not.
        console.log('program count before update is:', metadata.programCount)
        await stripe.paymentIntents.update(paymentIntent.id, {
            metadata: { programCount: parseInt(metadata.programCount) - 1 },
        })
    } catch (error) {
        console.error('error occurred attempting refund', error)
        throw new Error('unable to cancel holiday program')
    }
}
