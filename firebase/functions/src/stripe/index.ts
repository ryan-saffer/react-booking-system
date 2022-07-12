import * as functions from 'firebase-functions'
import * as StripeConfig from '../config/stripe'
import {
    CreatePaymentIntentParams,
    CreatePaymentIntentResponse,
    Metadata,
} from 'fizz-kidz'
import Stripe from 'stripe'
import { db } from '..'
import { Acuity } from 'fizz-kidz'
import scheduleHolidayPrograms from '../acuity/scheduleHolidayPrograms'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2020-03-02', // https://stripe.com/docs/api/versioning
})

const endpointSecret =
    'whsec_1dd2cc3d8fa40bb5a5accb299d6860654c6294010ab819b92b072937080d7207'

export const stripeWebhook = functions
    .region('australia-southeast1')
    .https.onRequest(async (request, response) => {
        let event = request.body as Stripe.Event

        // Get the signature sent by Stripe
        const signature = request.get('stripe-signature')
        console.log(signature)
        if (signature) {
            try {
                event = stripe.webhooks.constructEvent(
                    request.rawBody.toString('utf8'),
                    signature,
                    endpointSecret
                )
            } catch (err) {
                if (err instanceof Error) {
                    console.log(
                        `⚠️  Webhook signature verification failed.`,
                        err.message
                    )
                }
                response.sendStatus(400)
                return
            }
        } else {
            console.log(
                `⚠️ Webhook rewuest missing 'stripe-signature' in header`
            )
            response.sendStatus(400)
            return
        }

        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log('payment intent succeeded')
                let paymentIntent = event.data.object as Stripe.PaymentIntent
                let metadata = paymentIntent.metadata as Metadata
                if (metadata.program === 'holiday_program') {
                    console.log('beggining to book holiday programs')
                    await bookHolidayPrograms(paymentIntent.id)
                }
                break
            default:
                // Unexpected event type
                console.log(`Unhandled event type ${event.type}.`)
        }

        let object = event.data.object as any
        console.log(object.id)

        response.sendStatus(200)
        return
    })

export const createPaymentIntent = functions
    .region('australia-southeast1')
    .https.onCall(
        async (
            data: CreatePaymentIntentParams,
            _context: functions.https.CallableContext
        ): Promise<CreatePaymentIntentResponse> => {
            // first create the customer
            let customerId = await getOrCreateCustomer(
                data.name,
                data.email,
                data.phone
            )
            const paymentIntent = await stripe.paymentIntents.create({
                customer: customerId,
                amount: data.amount,
                currency: 'aud',
                payment_method_types: ['card'],
                description: data.description,
                metadata: {
                    program: data.program,
                },
            })

            if (paymentIntent.client_secret) {
                return {
                    id: paymentIntent.id,
                    clientSecret: paymentIntent.client_secret,
                }
            } else {
                throw new Error('payment intent failed to create')
            }
        }
    )

async function getOrCreateCustomer(name: string, email: string, phone: string) {
    // first check if customer already exists
    let customersResponse = await stripe.customers.list({ email })
    let customer = customersResponse.data[0]
    if (customer) {
        return customer.id
    }

    // otherwise create customer
    customer = await stripe.customers.create({ name, email, phone })
    return customer.id
}

async function bookHolidayPrograms(paymentIntentId: string) {
    let query = await db
        .collection('holidayProgramBookings')
        .doc(paymentIntentId)
        .get()

    console.log('query exists', query.exists)
    console.log('query booked', query.get('booked'))

    if (query.exists && !query.get('booked')) {
        let programsSnapshot = await db
            .collection('holidayProgramBookings')
            .doc(paymentIntentId)
            .collection('programs')
            .get()

        let programs: Acuity.Client.HolidayProgramBooking[] = []
        programsSnapshot.forEach((program) =>
            programs.push(program.data() as Acuity.Client.HolidayProgramBooking)
        )
        await scheduleHolidayPrograms(programs)

        await db
            .collection('holidayProgramBookings')
            .doc(paymentIntentId)
            .set({ booked: true })
    }
}
