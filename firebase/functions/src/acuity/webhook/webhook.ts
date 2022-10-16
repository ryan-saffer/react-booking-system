import * as functions from 'firebase-functions'
import { AcuityWebhookData } from '../types'
import { Acuity, Metadata } from 'fizz-kidz'
import * as StripeConfig from '../../config/stripe'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
import Stripe from 'stripe'
import { AcuityClient } from '../AcuityClient'
import { RefundCalculator } from './RefundCalculator'
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2020-08-27', // https://stripe.com/docs/api/versioning
})
const acuity = new AcuityClient()

function isHolidayProgram(appointmentTypeId: string) {
    return (
        appointmentTypeId === Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM.toString() ||
        appointmentTypeId === Acuity.Constants.AppointmentTypes.TEST_HOLIDAY_PROGRAM.toString()
    )
}

export const asWebhook = functions.region('australia-southeast1').https.onRequest(async (req, resp) => {
    console.log('STARTING WEBHOOK')
    console.log(req.body)
    let data = req.body as AcuityWebhookData

    switch (data.action) {
        case 'canceled':
            if (isHolidayProgram(data.appointmentTypeID)) {
                try {
                    let appointment = await acuity.getAppointment(data.id)
                    let paymentIntentId = Acuity.Utilities.retrieveFormAndField(
                        appointment,
                        Acuity.Constants.Forms.HOLIDAY_PROGRAM_PAYMENT_DETAILS,
                        Acuity.Constants.FormFields.HOLIDAY_PROGRAM_PAYMENT_INTENT_ID
                    )
                    let amountCharged = Acuity.Utilities.retrieveFormAndField(
                        appointment,
                        Acuity.Constants.Forms.HOLIDAY_PROGRAM_PAYMENT_DETAILS,
                        Acuity.Constants.FormFields.HOLIDAY_PROGRAM_AMOUNT_CHARGED
                    )

                    let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
                    let metadata = paymentIntent.metadata as Metadata

                    // if appointment is < 24 hours away, no refunds allowed.
                    const appointmentDate = new Date(appointment.datetime)
                    const now = new Date()
                    const msBetweenDates = Math.abs(appointmentDate.getTime() - now.getTime())

                    // convert ms to hours
                    const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000)

                    if (hoursBetweenDates > 24) {
                        const refundCalulcator = new RefundCalculator(metadata, parseInt(amountCharged))
                        let refundAmount = refundCalulcator.calculateRefund()
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

                    resp.status(200).send()
                    return
                } catch (error) {
                    console.log('error occurred attempting refund', error)
                    resp.status(500).send(error)
                    return
                }
            } else {
                console.log('ignoring cancelled program with id:', data.appointmentTypeID)
                resp.status(200).send()
                return
            }
        default:
            console.log(`Ignoring action: ${data.action}`)
            resp.status(200).send()
            return
    }
})
