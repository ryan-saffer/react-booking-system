// firebase initialisation
const admin = require('firebase-admin')
const environment = JSON.parse(process.env.FIREBASE_CONFIG).projectId === "bookings-prod" ? "prod" : "dev"
const databaseUrl = environment === "prod" ? "https://bookings-prod.firebaseio.com" : "https://booking-system-6435d.firebaseio.com"
admin.initializeApp({
  credential: admin.credential.cert(require(`../credentials/${environment}_service_account_credentials.json`)),
  databaseURL: databaseUrl
})

export const db = admin.firestore()

// import credentials here to force typescript to compile the json files
// see https://stackoverflow.com/a/59419449/7870403
import * as prodConfig from '../credentials/prod_service_account_credentials.json'
import * as devConfig from '../credentials/dev_service_account_credentials.json'

import * as bookings from './bookings'
import * as bookingsFormToSheet from './bookings/onFormSubmit'
import * as bookingsFormToSheetV2 from './bookings/onFormSubmitV2'
import * as acuity from './acuity/client/v1/client.js'
import * as acuityV2 from './acuity/client/v2/client'
import * as acuityStripeIntegration from './acuity/stripe'
import * as scienceClubBackup from './acuity/science-club-backup'
import * as emails from './acuity/emails'

export const createBooking = bookings.createBooking
export const updateBooking = bookings.updateBooking
export const deleteBooking = bookings.deleteBooking
export const sendOutForms = bookings.sendOutForms
export const sendFeedbackEmails = bookings.sendFeedbackEmails
export const onFormSubmit = bookingsFormToSheet.onFormSubmit
export const onFormSubmitV2 = bookingsFormToSheetV2.onFormSubmitV2

export const acuityClient = acuity.client
export const acuityClientV2 = acuityV2.client
export const sidebar = acuityStripeIntegration.sidebar
export const sendInvoice = acuityStripeIntegration.sendInvoice
export const voidAndResendInvoice = acuityStripeIntegration.voidAndResendInvoice
export const retrieveInvoiceStatus = acuityStripeIntegration.retrieveInvoiceStatus
export const backupScienceClubAppointments = scienceClubBackup.backupScienceClubAppointments
export const sendTermContinuationEmail = emails.sendScienceClubContinuationEmail