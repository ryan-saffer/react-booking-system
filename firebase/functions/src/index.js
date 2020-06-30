import * as bookings from './bookings'
import * as acuity from './acuity/client'
import * as acuityStripeIntegration from './acuity/stripe-integration'

export const createBooking = bookings.createBooking
export const updateBooking = bookings.updateBooking
export const deleteBooking = bookings.deleteBooking
export const sendOutForms = bookings.sendOutForms

export const acuityClient = acuity.client
export const sidebar = acuityStripeIntegration.sidebar
export const sendInvoice = acuityStripeIntegration.sendInvoice