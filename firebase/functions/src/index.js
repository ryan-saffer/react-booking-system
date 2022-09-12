import * as bookings from './bookings'
import * as formSubmission from './bookings/onFormSubmit'
import * as forms from './bookings/sendOutForms'
import * as singleForm from './bookings/sendOutSingleForm'
import * as acuity from './acuity/client/v1/client.js'
import * as acuityV2 from './acuity/client/v2/client'
import * as acuityStripeIntegration from './acuity/stripe'
import * as scienceClubBackup from './acuity/science-club-backup'
import * as emails from './acuity/emails'
import * as acuityWebhook from './acuity/webhook/webhook'
import * as mjmlService from './mjml'

export const createBooking = bookings.createBooking
export const updateBooking = bookings.updateBooking
export const deleteBooking = bookings.deleteBooking
export const sendOutForms = forms.sendOutForms
export const sendOutSingleForm = singleForm.sendOutSingleForm
export const sendFeedbackEmails = bookings.sendFeedbackEmails
export const onFormSubmit = formSubmission.onFormSubmit

export const acuityClient = acuity.client
export const acuityClientV2 = acuityV2.client
export const sidebar = acuityStripeIntegration.sidebar
export const sendInvoice = acuityStripeIntegration.sendInvoice
export const voidAndResendInvoice = acuityStripeIntegration.voidAndResendInvoice
export const retrieveInvoiceStatus = acuityStripeIntegration.retrieveInvoiceStatus
export const backupScienceClubAppointments = scienceClubBackup.backupScienceClubAppointments
export const sendTermContinuationEmail = emails.sendScienceClubContinuationEmail
export const asWebhook = acuityWebhook.webhook
export const mjml = mjmlService.mjml

export * from './stripe'
export * from './scienceProgram'
