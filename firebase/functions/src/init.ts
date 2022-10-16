import * as StripeConfig from './config/stripe'
import { Stripe } from 'stripe'

// FIREBASE
import * as admin from 'firebase-admin'
export const env = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod' ? 'prod' : 'dev'
const databaseUrl =
    env === 'prod' ? 'https://bookings-prod.firebaseio.com' : 'https://booking-system-6435d.firebaseio.com'
admin.initializeApp({
    credential: admin.credential.cert(require(`../credentials/${env}_service_account_credentials.json`)),
    databaseURL: databaseUrl,
})
export const storage = admin.storage()
export const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })

// STRIPE
const stripeConfig = env === 'prod' ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG
export const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2020-08-27', // https://stripe.com/docs/api/versioning
})
