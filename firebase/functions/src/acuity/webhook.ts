import * as functions from 'firebase-functions'
import { AcuityWebhookData } from './types'
import { Acuity } from 'fizz-kidz'
// import * as crypto from 'crypto'
const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')
import { hasError } from './shared'
import * as StripeConfig from '../config/stripe'
const stripeConfig = StripeConfig.PROD_CONFIG
import Stripe from 'stripe'
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: "2020-03-02" // https://stripe.com/docs/api/versioning
  })

const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key
})

export const webhook = functions
    .region('australia-southeast1')
    .https.onRequest(async (req, resp) => {

        console.log("STARTING WEBHOOK")
        console.log(req.body)
        let data = req.body as AcuityWebhookData
        
        switch(data.action) {
            case 'scheduled':
                // check if appointment type is holiday program
                if (data.appointmentTypeID === Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM.toString() ||
                    data.appointmentTypeID === Acuity.Constants.AppointmentTypes.TEST_HOLIDAY_PROGRAM.toString()) {

                        console.log("HOLIDAY PROGRAM SCHEDULED")

                        // check if appointment has been paid for
                        acuity.request(`/appointments/${data.id}`, (err: any, _resp: any, appointment: Acuity.Appointment | Acuity.Error) => {

                            if (hasError(err, appointment)) {
                                resp.status(400).send(`unable to fetch acuity appointment with id: ${data.id}`)
                                return
                            }

                            console.log("FOUND APPOINTMENT IN ACUITY")

                            // if paid, fetch the payments
                            if (appointment.paid === 'yes') {
                                acuity.request(`/appointments/${data.id}/payments`, (paymentsErr: any, _paymentsResp: any, payments: Acuity.Payment[] | Acuity.Error) => {

                                    if (hasError(paymentsErr, payments)) {
                                        resp.status(400).send(`unable to fetch acuity payments for appointment with id: ${data.id}`)
                                        return
                                    }

                                    console.log("PAYMENT FOUND IN ACUITY")
                                    console.log(payments)
                                    if (payments.length >= 0) {
                                        let payment = payments[0]
                                        let paymentId = payment.transactionID
                                        let description = `${appointment.calendar} Holiday Program - ${appointment.firstName} ${appointment.lastName}`
                                        if (paymentId.startsWith("pi_")) {
                                            // payment intent
                                            stripe.paymentIntents.update(
                                                paymentId,
                                                { description }
                                            ).then(paymentIntent => {
                                                console.log("PAYMENT INTENT UPDATED")
                                                resp.status(200).send()
                                                return
                                            }).catch(error => {
                                                console.log("ERROR UPDATING PAYMENT INTENT")
                                                resp.status(400).send(error)
                                                return
                                            })
                                        } else if (paymentId.startsWith("seti_")) {
                                            stripe.setupIntents.update(
                                                paymentId,
                                                { description }
                                            ).then(setupIntent => {
                                                console.log("SETUP INTENT UPDATED")
                                                resp.status(200).send()
                                                return
                                            }).catch(error => {
                                                console.log("ERROR UPDATING SETUP INTENT")
                                                resp.status(400).send(error)
                                                return
                                            })
                                        }
                                    } else {
                                        console.log("PAYMENTS LENGTH IS 0")
                                        resp.status(400).send(`no payments found despite being marked as paid. Id: ${data.id}`)
                                        return
                                    }
                                })
                            } else { // not paid
                                console.log("NOT PAID")
                                resp.status(200).send()
                                return
                            }
                        })
                    } else {
                        console.log("")
                    }
                break;
            default:
                console.log(`Ignoring action: ${data.action}`)
                resp.status(200).send()
                return
        }
    })